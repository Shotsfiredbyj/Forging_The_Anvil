"""RunPod serverless HTTP client — stdlib-only.

Matches the style of Cold_Anvil/pipeline/gateway_client.py. Submits jobs
to RunPod serverless endpoints, polls for completion, returns structured
timing and output data.
"""

import json
import logging
import time
import urllib.error
import urllib.request
from dataclasses import dataclass

log = logging.getLogger("runpod_bench.client")

RUNPOD_BASE = "https://api.runpod.ai/v2"
POLL_INTERVAL = 2     # seconds between status polls
POLL_TIMEOUT = 600    # 10 minutes max wait per job


# ---------------------------------------------------------------------------
# HTTP transport
# ---------------------------------------------------------------------------

def _request(url: str, *, method: str = "GET", data: dict | None = None,
             api_key: str = "", timeout: int = 30) -> tuple[int, dict]:
    """Send an HTTP request to RunPod API. Returns (status_code, parsed_json)."""
    body = json.dumps(data).encode() if data else None
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "coldanvil-bench/1.0",
    }
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


# ---------------------------------------------------------------------------
# Job lifecycle
# ---------------------------------------------------------------------------

@dataclass
class JobResult:
    """Structured result from a completed RunPod serverless job."""

    job_id: str
    status: str             # COMPLETED, FAILED, TIMED_OUT, CANCELLED
    output: str             # generated text
    delay_ms: int = 0       # queue + cold start time (ms)
    execution_ms: int = 0   # worker execution time (ms)
    total_ms: int = 0       # wall clock from submit to result
    error: str = ""

    @property
    def delay_s(self) -> float:
        return self.delay_ms / 1000

    @property
    def execution_s(self) -> float:
        return self.execution_ms / 1000

    @property
    def total_s(self) -> float:
        return self.total_ms / 1000


def submit_job(endpoint_id: str, api_key: str,
               payload: dict) -> tuple[str, str]:
    """Submit a job to a RunPod serverless endpoint.

    Returns (job_id, error). Error is empty on success.

    The payload should match vLLM's expected input format:
    {
        "input": {
            "prompt": "...",
            "max_tokens": 4096,
            "temperature": 0.6,
            ...
        }
    }
    """
    url = f"{RUNPOD_BASE}/{endpoint_id}/run"
    status, body = _request(url, method="POST", data=payload, api_key=api_key)

    if status != 200 or "id" not in body:
        err = body.get("error", body.get("detail", f"HTTP {status}"))
        log.error("Submit failed: endpoint=%s status=%d error=%s",
                  endpoint_id, status, err)
        return "", str(err)

    job_id = body["id"]
    log.info("Submitted job: endpoint=%s job_id=%s", endpoint_id, job_id)
    return job_id, ""


def poll_job(endpoint_id: str, api_key: str, job_id: str,
             timeout: int = POLL_TIMEOUT) -> JobResult:
    """Poll a RunPod job until terminal status or timeout.

    RunPod status response includes:
    - status: IN_QUEUE, IN_PROGRESS, COMPLETED, FAILED, CANCELLED, TIMED_OUT
    - delayTime: ms from submission to worker start (queue + cold start)
    - executionTime: ms of actual worker execution
    - output: the result payload (for COMPLETED)
    """
    url = f"{RUNPOD_BASE}/{endpoint_id}/status/{job_id}"
    start = time.monotonic()
    terminal = {"COMPLETED", "FAILED", "CANCELLED", "TIMED_OUT"}

    while True:
        elapsed_ms = int((time.monotonic() - start) * 1000)

        if elapsed_ms > timeout * 1000:
            log.warning("Poll timeout: job=%s after %ds", job_id, timeout)
            return JobResult(
                job_id=job_id, status="TIMED_OUT", output="",
                total_ms=elapsed_ms, error="Poll timeout",
            )

        status_code, body = _request(url, api_key=api_key)
        job_status = body.get("status", "UNKNOWN")

        if job_status in terminal:
            delay_ms = body.get("delayTime", 0)
            exec_ms = body.get("executionTime", 0)
            total_ms = int((time.monotonic() - start) * 1000)

            # Extract output text — vLLM returns in output.choices or output.text
            output_raw = body.get("output", "")
            output_text = _extract_output_text(output_raw)
            error = ""

            if job_status == "FAILED":
                error = body.get("error", str(output_raw))
                log.error("Job failed: job=%s error=%s", job_id, error)
            else:
                log.info("Job complete: job=%s status=%s delay=%dms exec=%dms",
                         job_id, job_status, delay_ms, exec_ms)

            return JobResult(
                job_id=job_id, status=job_status, output=output_text,
                delay_ms=delay_ms, execution_ms=exec_ms,
                total_ms=total_ms, error=error,
            )

        log.debug("Polling: job=%s status=%s elapsed=%ds",
                  job_id, job_status, elapsed_ms // 1000)
        time.sleep(POLL_INTERVAL)


def _extract_output_text(output: object) -> str:
    """Extract generated text from vLLM output formats.

    vLLM on RunPod can return output in several shapes:
    - {"text": ["generated text"]}
    - {"choices": [{"text": "generated text"}]}
    - Just a string
    """
    if isinstance(output, str):
        return output

    if isinstance(output, dict):
        # vLLM text array format
        if "text" in output:
            texts = output["text"]
            if isinstance(texts, list) and texts:
                return texts[0]
            if isinstance(texts, str):
                return texts

        # OpenAI-compatible choices format
        if "choices" in output:
            choices = output["choices"]
            if isinstance(choices, list) and choices:
                choice = choices[0]
                if isinstance(choice, dict):
                    return choice.get("text", choice.get("message", {}).get("content", ""))

    return str(output) if output else ""


# ---------------------------------------------------------------------------
# High-level generation
# ---------------------------------------------------------------------------

def generate(endpoint_id: str, api_key: str, prompt: str, *,
             max_tokens: int = 4096, temperature: float = 0.6,
             timeout: int = POLL_TIMEOUT) -> JobResult:
    """Submit a generation job and wait for the result.

    Builds a vLLM-compatible payload, submits, polls, returns structured result.
    """
    payload = {
        "input": {
            "prompt": prompt,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "stream": False,
        },
    }

    job_id, err = submit_job(endpoint_id, api_key, payload)
    if err:
        return JobResult(job_id="", status="FAILED", output="", error=err)

    return poll_job(endpoint_id, api_key, job_id, timeout=timeout)
