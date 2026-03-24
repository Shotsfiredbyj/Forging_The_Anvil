"""RunPod infrastructure management — create, monitor, and tear down endpoints.

Handles the full lifecycle:
    1. Create template (Docker image + vLLM env vars)
    2. Create endpoint (references template, sets GPU + scaling)
    3. Wait for worker readiness
    4. Monitor health and costs
    5. Tear down (scale to zero, delete endpoint, delete template)

Uses the REST API (https://rest.runpod.io/v1) for template/endpoint CRUD
and the GraphQL API (https://api.runpod.io/graphql) for scaling config,
GPU queries, and billing — since the REST API's endpoint creation doesn't
expose all fields.

Stdlib-only except for the `requests` library (already a project dep via
the RunPod SDK).
"""

import json
import logging
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field

from manifest import ModelDeployment

log = logging.getLogger("runpod_bench.infra")

REST_BASE = "https://rest.runpod.io/v1"
GRAPHQL_URL = "https://api.runpod.io/graphql"
HEALTH_BASE = "https://api.runpod.ai/v2"
VLLM_IMAGE = "runpod/worker-v1-vllm:stable-cuda12.1.0"


# ---------------------------------------------------------------------------
# HTTP helpers (stdlib-only)
# ---------------------------------------------------------------------------

def _request(url: str, *, method: str = "GET", data: dict | None = None,
             api_key: str = "", timeout: int = 30) -> tuple[int, dict]:
    """Send an HTTP request. Returns (status_code, parsed_json)."""
    body = json.dumps(data).encode() if data else None
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    req = urllib.request.Request(url, data=body, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode()
            return resp.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raw = e.read().decode() if e.fp else ""
        try:
            detail = json.loads(raw)
        except (json.JSONDecodeError, ValueError):
            detail = {"error": raw or str(e)}
        return e.code, detail
    except urllib.error.URLError as e:
        return 0, {"error": f"Connection failed: {e.reason}"}


def _graphql(query: str, api_key: str,
             variables: dict | None = None) -> dict:
    """Execute a GraphQL query/mutation."""
    payload = {"query": query}
    if variables:
        payload["variables"] = variables

    status, body = _request(
        GRAPHQL_URL, method="POST", data=payload, api_key=api_key,
    )

    if status != 200:
        raise RuntimeError(f"GraphQL request failed: HTTP {status} — {body}")

    if "errors" in body:
        raise RuntimeError(f"GraphQL errors: {body['errors']}")

    return body.get("data", {})


# ---------------------------------------------------------------------------
# Deployed resource tracking
# ---------------------------------------------------------------------------

@dataclass
class DeployedEndpoint:
    """Tracks a created template + endpoint pair for teardown."""

    key: str                        # manifest key
    template_id: str = ""
    endpoint_id: str = ""
    deployment: ModelDeployment | None = None


@dataclass
class Fleet:
    """All deployed endpoints for a benchmark run."""

    endpoints: dict[str, DeployedEndpoint] = field(default_factory=dict)

    def save(self, path: str):
        """Save fleet state to JSON for later teardown."""
        data = {}
        for key, dep in self.endpoints.items():
            data[key] = {
                "template_id": dep.template_id,
                "endpoint_id": dep.endpoint_id,
            }
        with open(path, "w") as f:
            json.dump(data, f, indent=2)
        log.info("Fleet state saved to %s", path)

    @classmethod
    def load(cls, path: str) -> "Fleet":
        """Load fleet state from JSON."""
        with open(path) as f:
            data = json.load(f)
        fleet = cls()
        for key, info in data.items():
            fleet.endpoints[key] = DeployedEndpoint(
                key=key,
                template_id=info["template_id"],
                endpoint_id=info["endpoint_id"],
            )
        return fleet


# ---------------------------------------------------------------------------
# Template management
# ---------------------------------------------------------------------------

def create_template(deployment: ModelDeployment, api_key: str) -> str:
    """Create a RunPod template for a model deployment.

    Returns the template ID.
    """
    payload = {
        "name": deployment.template_name(),
        "imageName": VLLM_IMAGE,
        "category": "NVIDIA",
        "containerDiskInGb": 20,
        "env": deployment.vllm_env(),
        "volumeInGb": 0,
        "volumeMountPath": "/runpod-volume",
    }

    log.info("Creating template: %s (model=%s)",
             deployment.template_name(), deployment.hf_model_id)

    status, body = _request(
        f"{REST_BASE}/templates", method="POST",
        data=payload, api_key=api_key,
    )

    if status not in (200, 201):
        raise RuntimeError(
            f"Failed to create template {deployment.template_name()}: "
            f"HTTP {status} — {body}"
        )

    template_id = body.get("id", "")
    if not template_id:
        raise RuntimeError(f"No template ID in response: {body}")

    log.info("Created template: %s → %s", deployment.template_name(), template_id)
    return template_id


def delete_template(template_id: str, api_key: str):
    """Delete a RunPod template."""
    log.info("Deleting template: %s", template_id)
    status, body = _request(
        f"{REST_BASE}/templates/{template_id}", method="DELETE", api_key=api_key,
    )
    if status not in (200, 204):
        log.warning("Failed to delete template %s: HTTP %d — %s",
                     template_id, status, body)
    else:
        log.info("Deleted template: %s", template_id)


# ---------------------------------------------------------------------------
# Endpoint management
# ---------------------------------------------------------------------------

def create_endpoint(deployment: ModelDeployment, template_id: str,
                    api_key: str) -> str:
    """Create a RunPod serverless endpoint.

    Uses the GraphQL API because the REST API doesn't expose GPU selection
    and scaling config on creation.

    Returns the endpoint ID.
    """
    query = """
    mutation CreateEndpoint($input: EndpointInput!) {
      saveEndpoint(input: $input) {
        id
        name
        gpuIds
        workersMin
        workersMax
        idleTimeout
        templateId
      }
    }
    """

    variables = {
        "input": {
            "name": deployment.endpoint_name(),
            "templateId": template_id,
            "gpuIds": deployment.gpu_id,
            "workersMin": deployment.workers_min,
            "workersMax": deployment.workers_max,
            "idleTimeout": deployment.idle_timeout,
            "scalerType": "QUEUE_DELAY",
            "scalerValue": 4,
        },
    }

    log.info("Creating endpoint: %s (gpu=%s, workers=%d-%d)",
             deployment.endpoint_name(), deployment.gpu_id,
             deployment.workers_min, deployment.workers_max)

    data = _graphql(query, api_key, variables)
    endpoint_id = data.get("saveEndpoint", {}).get("id", "")

    if not endpoint_id:
        raise RuntimeError(f"No endpoint ID in response: {data}")

    log.info("Created endpoint: %s → %s", deployment.endpoint_name(), endpoint_id)
    return endpoint_id


def scale_endpoint(endpoint_id: str, template_id: str, gpu_id: str,
                   name: str, workers_min: int, workers_max: int,
                   api_key: str):
    """Update endpoint scaling. All fields required by saveEndpoint."""
    query = """
    mutation UpdateEndpoint($input: EndpointInput!) {
      saveEndpoint(input: $input) {
        id
        workersMin
        workersMax
      }
    }
    """
    variables = {
        "input": {
            "id": endpoint_id,
            "name": name,
            "templateId": template_id,
            "gpuIds": gpu_id,
            "workersMin": workers_min,
            "workersMax": workers_max,
        },
    }
    _graphql(query, api_key, variables)
    log.info("Scaled endpoint %s: workers=%d-%d", endpoint_id,
             workers_min, workers_max)


def delete_endpoint(endpoint_id: str, template_id: str, gpu_id: str,
                    name: str, api_key: str):
    """Scale to zero then delete an endpoint."""
    log.info("Scaling endpoint %s to zero before deletion", endpoint_id)

    # Scale to zero
    scale_endpoint(endpoint_id, template_id, gpu_id, name, 0, 0, api_key)
    time.sleep(5)  # brief pause for workers to drain

    # Delete
    query = 'mutation { deleteEndpoint(id: "%s") }' % endpoint_id
    _graphql(query, api_key)
    log.info("Deleted endpoint: %s", endpoint_id)


# ---------------------------------------------------------------------------
# Health and readiness
# ---------------------------------------------------------------------------

def check_health(endpoint_id: str, api_key: str) -> dict:
    """Check endpoint health. Returns worker counts and queue depth."""
    url = f"{HEALTH_BASE}/{endpoint_id}/health"
    status, body = _request(url, api_key=api_key)
    return body if status == 200 else {"error": f"HTTP {status}", "detail": body}


def wait_for_ready(endpoint_id: str, api_key: str,
                   timeout: int = 600, poll_interval: int = 10) -> bool:
    """Wait until at least one worker is ready.

    Returns True if ready within timeout, False otherwise.
    For flex endpoints (workersMin=0), readiness means the first job
    won't fail — but there will still be a cold start.
    """
    start = time.monotonic()
    log.info("Waiting for endpoint %s to be ready (timeout=%ds)", endpoint_id, timeout)

    while time.monotonic() - start < timeout:
        health = check_health(endpoint_id, api_key)

        # For flex endpoints, "ready" might mean the endpoint is accepting
        # requests even with 0 workers (workers spin up on demand)
        workers = health.get("workers", {})
        ready = workers.get("ready", 0)
        idle = workers.get("idle", 0)
        running = workers.get("running", 0)

        # If the endpoint returns a valid response, it's configured and accepting work
        if "error" not in health:
            log.info("Endpoint %s is accepting requests (ready=%d idle=%d running=%d)",
                     endpoint_id, ready, idle, running)
            return True

        log.debug("Not ready yet: %s", health)
        time.sleep(poll_interval)

    log.warning("Endpoint %s did not become ready within %ds", endpoint_id, timeout)
    return False


# ---------------------------------------------------------------------------
# Billing and monitoring
# ---------------------------------------------------------------------------

def get_billing(api_key: str) -> dict:
    """Get current spend rate and endpoint overview."""
    query = """
    query {
      myself {
        currentSpendPerHr
        endpoints {
          id
          name
          workersMin
          workersMax
        }
      }
    }
    """
    return _graphql(query, api_key)


def get_gpu_availability(api_key: str) -> list[dict]:
    """Query available GPU types and pricing."""
    query = """
    query {
      gpuTypes {
        id
        displayName
        memoryInGb
      }
    }
    """
    data = _graphql(query, api_key)
    return data.get("gpuTypes", [])


# ---------------------------------------------------------------------------
# Fleet lifecycle
# ---------------------------------------------------------------------------

def deploy_fleet(deployments: list[ModelDeployment],
                 api_key: str) -> Fleet:
    """Deploy a full fleet of model endpoints.

    Creates templates and endpoints for each deployment in the manifest.
    Returns a Fleet object for monitoring and teardown.
    """
    fleet = Fleet()

    for dep in deployments:
        try:
            template_id = create_template(dep, api_key)
            endpoint_id = create_endpoint(dep, template_id, api_key)

            fleet.endpoints[dep.key] = DeployedEndpoint(
                key=dep.key,
                template_id=template_id,
                endpoint_id=endpoint_id,
                deployment=dep,
            )
            log.info("Deployed %s: template=%s endpoint=%s",
                     dep.key, template_id, endpoint_id)

        except Exception:
            log.exception("Failed to deploy %s — skipping", dep.key)

    return fleet


def teardown_fleet(fleet: Fleet, api_key: str,
                   deployments: list[ModelDeployment] | None = None):
    """Tear down all endpoints and templates in a fleet.

    If deployments are provided, uses them for the required fields
    on the scale-to-zero mutation. Otherwise attempts best-effort
    deletion.
    """
    dep_lookup = {}
    if deployments:
        dep_lookup = {d.key: d for d in deployments}

    for key, deployed in fleet.endpoints.items():
        try:
            dep = dep_lookup.get(key) or deployed.deployment
            if deployed.endpoint_id:
                if dep:
                    delete_endpoint(
                        deployed.endpoint_id, deployed.template_id,
                        dep.gpu_id, dep.endpoint_name(), api_key,
                    )
                else:
                    # Best-effort: try GraphQL delete directly
                    log.warning("No deployment info for %s — attempting direct delete", key)
                    query = 'mutation { deleteEndpoint(id: "%s") }' % deployed.endpoint_id
                    try:
                        _graphql(query, api_key)
                    except RuntimeError:
                        log.exception("Direct delete failed for endpoint %s", deployed.endpoint_id)

            if deployed.template_id:
                delete_template(deployed.template_id, api_key)

        except Exception:
            log.exception("Failed to tear down %s", key)


def fleet_status(fleet: Fleet, api_key: str) -> dict[str, dict]:
    """Check health of all endpoints in a fleet."""
    statuses = {}
    for key, deployed in fleet.endpoints.items():
        if deployed.endpoint_id:
            statuses[key] = check_health(deployed.endpoint_id, api_key)
    return statuses


def fleet_endpoint_ids(fleet: Fleet) -> dict[str, str]:
    """Extract endpoint IDs from fleet, keyed by manifest key.

    Returns a dict suitable for setting as RUNPOD_ENDPOINT_* env vars
    or passing to the harness.
    """
    return {
        key: dep.endpoint_id
        for key, dep in fleet.endpoints.items()
        if dep.endpoint_id
    }
