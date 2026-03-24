# RunPod Serverless Infrastructure Automation — Deep Research

**Date:** 2026-03-24
**Purpose:** Complete reference for programmatic management of RunPod serverless
infrastructure. No manual UI clicks. Everything an agent needs to deploy and
manage vLLM endpoints autonomously.

---

## 1. Authentication

All APIs use the same key:

```
Authorization: Bearer <RUNPOD_API_KEY>
```

- Generate at https://www.runpod.io/console/user/settings
- Never hardcode — use `RUNPOD_API_KEY` env var
- Python SDK: `runpod.api_key = os.getenv("RUNPOD_API_KEY")`

---

## 2. The Three Management Interfaces

| Interface | Best For | Endpoint |
|-----------|----------|----------|
| GraphQL API | Full CRUD on endpoints, templates, pods | `https://api.runpod.io/graphql` |
| REST API | Creating endpoints (newer, simpler) | `https://rest.runpod.io/v1/endpoints` |
| Python SDK | Job submission, pod management | `pip install runpod` (v1.8.2+) |

The **GraphQL API** is the most complete. The REST API exists but has less
documentation. The Python SDK is strong for job submission but weaker for
infrastructure management — use GraphQL for that.

---

## 3. Creating Serverless Endpoints (GraphQL)

This is the core operation. Two steps: create a template, then create an
endpoint pointing at it.

### 3.1 Create a Template (if using custom worker)

Templates define the Docker image and environment. For vLLM, you can skip this
and use RunPod's built-in vLLM template — but for custom workers you need one.

The `saveTemplate` mutation exists in the API but isn't fully documented in the
public spec. Based on the type system, the input fields include:

- `name` — template name
- `imageName` — Docker image (e.g., `runpod/worker-v1-vllm:stable`)
- `dockerArgs` — container start command override
- `env` — array of `{key, value}` environment variable pairs
- `containerDiskInGb` — OS/app storage
- `volumeInGb` — persistent storage
- `volumeMountPath` — where to mount the volume
- `ports` — exposed ports

### 3.2 Create an Endpoint

```graphql
mutation {
  saveEndpoint(input: {
    name: "my-vllm-endpoint"
    templateId: "xkhgg72fuo"
    gpuIds: "AMPERE_16"
    workersMin: 0
    workersMax: 3
    idleTimeout: 5
    scalerType: "QUEUE_DELAY"
    scalerValue: 4
    locations: "US"
  }) {
    id
    name
    gpuIds
    idleTimeout
    locations
    scalerType
    scalerValue
    templateId
    workersMax
    workersMin
  }
}
```

**Required fields:** `gpuIds`, `name`, `templateId`

### 3.3 GPU Type IDs

| ID | GPU | VRAM |
|----|-----|------|
| `AMPERE_16` | A4000 / RTX 4000 | 16 GB |
| `AMPERE_24` | A5000 / RTX 3090 | 24 GB |
| `ADA_24` | RTX 4090 | 24 GB |
| `AMPERE_48` | A6000 / RTX A6000 | 48 GB |
| `ADA_48_PRO` | RTX 6000 Ada | 48 GB |
| `AMPERE_80` | A100 / H100 | 80 GB |
| `ADA_80_PRO` | H100 80GB | 80 GB |

You can pass multiple GPU IDs as a comma-separated string for fallback
priority ordering.

### 3.4 Scaler Types

| Type | Behaviour |
|------|-----------|
| `QUEUE_DELAY` | Scale based on queue wait time (scalerValue = seconds) |
| `REQUEST_COUNT` | Scale based on pending request count |

### 3.5 Region Codes

`CZ`, `FR`, `GB`, `NO`, `RO`, `US` — or empty string for any region.

---

## 4. Updating Endpoints

Same `saveEndpoint` mutation — include the `id` field to update:

```graphql
mutation {
  saveEndpoint(input: {
    id: "i02xupws21hp6i"
    gpuIds: "AMPERE_16"
    name: "my-vllm-endpoint"
    templateId: "xkhgg72fuo"
    workersMax: 5
    workersMin: 1
    idleTimeout: 10
  }) {
    id
    workersMax
    workersMin
    idleTimeout
  }
}
```

---

## 5. Deleting Endpoints

**Prerequisite:** Set both `workersMin` and `workersMax` to 0 first.

```graphql
# Step 1: Scale to zero
mutation {
  saveEndpoint(input: {
    id: "i02xupws21hp6i"
    gpuIds: "AMPERE_16"
    name: "my-vllm-endpoint"
    templateId: "xkhgg72fuo"
    workersMax: 0
    workersMin: 0
  }) {
    id
    workersMax
    workersMin
  }
}

# Step 2: Delete
mutation {
  deleteEndpoint(id: "i02xupws21hp6i")
}
```

---

## 6. Listing Endpoints and Monitoring

### 6.1 List All Endpoints

```graphql
query {
  myself {
    endpoints {
      id
      name
      gpuIds
      idleTimeout
      locations
      networkVolumeId
      scalerType
      scalerValue
      templateId
      workersMax
      workersMin
      pods {
        desiredStatus
      }
    }
    serverlessDiscount {
      discountFactor
      type
      expirationDate
    }
  }
}
```

### 6.2 Check Endpoint Health (REST)

```bash
curl https://api.runpod.ai/v2/ENDPOINT_ID/health \
  -H "Authorization: Bearer RUNPOD_API_KEY"
```

Returns worker counts, job queue depth, and worker statistics.

### 6.3 Cost and Usage Monitoring

The `myself` query provides billing data:

```graphql
query {
  myself {
    currentSpendPerHr
    spendDetails {
      # Usage cost breakdown
    }
    dailyCharges {
      # Time-series billing
    }
  }
}
```

Billing charge types include:
- `CHARGE_SERVERLESS` — serverless endpoint usage
- `CHARGE_POD` — pod usage
- `CHARGE_API` — API usage
- `CHARGE_STORAGE` — storage costs

### 6.4 GPU Availability and Pricing

```graphql
query {
  gpuTypes {
    id
    displayName
    memoryInGb
    secureCloud
    communityCloud
    lowestPrice(input: { gpuCount: 1 }) {
      minimumBidPrice
      uninterruptablePrice
    }
  }
}
```

---

## 7. Deploying vLLM Models

### 7.1 Using RunPod's Built-in vLLM Worker

The simplest path — use the pre-built `runpod/worker-v1-vllm` image. Create
an endpoint with the vLLM template and set environment variables for your model.

**Key environment variables:**

| Variable | Default | What It Does |
|----------|---------|-------------|
| `MODEL_NAME` | `facebook/opt-125m` | HuggingFace repo ID or path |
| `HF_TOKEN` | — | For gated models (Llama, etc.) |
| `MAX_MODEL_LEN` | auto | Maximum context length |
| `TENSOR_PARALLEL_SIZE` | 1 | Number of GPUs for the model |
| `GPU_MEMORY_UTILIZATION` | 0.95 | Fraction of VRAM to use |
| `QUANTIZATION` | None | `awq`, `gptq`, `squeezellm`, `bitsandbytes` |
| `DTYPE` | `auto` | `float16`, `bfloat16`, `float32` |
| `MAX_NUM_SEQS` | 256 | Max sequences per iteration |
| `MAX_CONCURRENCY` | 30 | Max concurrent requests per worker |
| `ENFORCE_EAGER` | False | Disable CUDA graphs (saves memory) |
| `ENABLE_CHUNKED_PREFILL` | False | Better memory efficiency |
| `ENABLE_PREFIX_CACHING` | False | Reuse computation for shared prefixes |
| `SEED` | 0 | Reproducibility |
| `KV_CACHE_DTYPE` | `auto` | `auto` or `fp8` for cache |

### 7.2 Full vLLM Environment Variable Reference

**Model loading:**
- `MODEL_REVISION` — branch/tag (default: `main`)
- `TOKENIZER` — custom tokenizer path
- `TOKENIZER_MODE` — `auto` or `slow`
- `TRUST_REMOTE_CODE` — accept HF custom code (default: False)
- `DOWNLOAD_DIR` — custom weight storage location
- `LOAD_FORMAT` — weight serialization format

**Parallelism:**
- `TENSOR_PARALLEL_SIZE` — GPUs for tensor sharding (default: 1)
- `PIPELINE_PARALLEL_SIZE` — pipeline stage count (default: 1)
- `DISTRIBUTED_EXECUTOR_BACKEND` — `ray` or `mp`

**Memory:**
- `GPU_MEMORY_UTILIZATION` — VRAM fraction (default: 0.95)
- `BLOCK_SIZE` — token batch granularity: 8, 16, or 32 (default: 16)
- `SWAP_SPACE` — CPU fallback per GPU in GiB (default: 4)
- `MAX_SEQ_LEN_TO_CAPTURE` — CUDA graph coverage limit (default: 8192)
- `NUM_GPU_BLOCKS_OVERRIDE` — manual GPU memory block count

**Speculative decoding:**
- `SPECULATIVE_MODEL` — draft model for faster inference
- `NUM_SPECULATIVE_TOKENS` — tokens to predict ahead
- `SPECULATIVE_DRAFT_TENSOR_PARALLEL_SIZE` — GPUs for draft model

**LoRA adapters:**
- `ENABLE_LORA` — activate adapter support (default: False)
- `MAX_LORAS` — concurrent adapters (default: 1)
- `MAX_LORA_RANK` — decomposition dimension (default: 16)
- `LORA_MODULES` — preloaded adapters list

**OpenAI compatibility:**
- `RAW_OPENAI_OUTPUT` — SSE format compliance (default: 1)
- `OPENAI_SERVED_MODEL_NAME_OVERRIDE` — custom model name
- `OPENAI_RESPONSE_ROLE` — message role label (default: `assistant`)
- `ENABLE_AUTO_TOOL_CHOICE` — tool calling support
- `TOOL_CALL_PARSER` — parser type: `mistral`, `hermes`, `llama3_json`,
  `deepseek_v3`, etc.
- `REASONING_PARSER` — `deepseek_r1`, `qwen3`, `granite`

**Streaming batch control:**
- `DEFAULT_BATCH_SIZE` — max streaming batch (default: 50)
- `DEFAULT_MIN_BATCH_SIZE` — initial batch threshold (default: 1)
- `DEFAULT_BATCH_SIZE_GROWTH_FACTOR` — exponential scaling (default: 3)

### 7.3 Model-to-GPU Sizing Guide

Rough VRAM requirements (float16, no quantization):

| Model Size | Min VRAM | Suggested GPU ID |
|-----------|----------|-----------------|
| 1-3B | 8-10 GB | `AMPERE_16` |
| 7-8B | 16-18 GB | `AMPERE_24` or `ADA_24` |
| 13-14B | 28-30 GB | `AMPERE_48` |
| 30-34B | 64-70 GB | `AMPERE_80` |
| 70B | 140+ GB | `AMPERE_80` x2 (tensor_parallel=2) |

With AWQ/GPTQ 4-bit quantization, roughly halve the VRAM requirement.

### 7.4 OpenAI-Compatible API

Once deployed, vLLM endpoints expose an OpenAI-compatible interface:

```python
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_RUNPOD_API_KEY",
    base_url="https://api.runpod.ai/v2/ENDPOINT_ID/openai/v1"
)

response = client.chat.completions.create(
    model="meta-llama/Llama-3.2-3B-Instruct",
    messages=[
        {"role": "system", "content": "You are helpful."},
        {"role": "user", "content": "Hello!"}
    ],
    temperature=0.7,
    max_tokens=500,
    stream=True  # streaming supported
)

for chunk in response:
    print(chunk.choices[0].delta.content, end="")
```

Supported OpenAI endpoints:
- `/chat/completions` — chat models
- `/completions` — base models
- `/models` — list deployed models

---

## 8. Sending Requests to Endpoints

### 8.1 URL Pattern

```
https://api.runpod.ai/v2/{ENDPOINT_ID}/{operation}
```

### 8.2 Operations

| Operation | Method | Purpose | Rate Limit (per 10s) | Concurrent |
|-----------|--------|---------|---------------------|------------|
| `/runsync` | POST | Sync — wait for result | 2000 | 400 |
| `/run` | POST | Async — get job ID back | 1000 | 200 |
| `/status/{job_id}` | GET | Poll async job status | 2000 | 400 |
| `/stream/{job_id}` | GET | Stream incremental results | 2000 | 400 |
| `/cancel/{job_id}` | POST | Cancel a job | 100 | 20 |
| `/retry/{job_id}` | POST | Retry failed job | — | — |
| `/purge-queue` | POST | Clear all pending jobs | 2 | — |
| `/health` | GET | Worker/queue stats | — | — |
| `/requests` | GET | Query submitted requests | 10 | 2 |
| `/openai/v1/*` | POST | OpenAI-compatible | 2000 | 400 |

### 8.3 Request Format

```bash
# Synchronous
curl -X POST "https://api.runpod.ai/v2/ENDPOINT_ID/runsync" \
  -H "Authorization: Bearer RUNPOD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "prompt": "Hello, world!"
    }
  }'

# Async
curl -X POST "https://api.runpod.ai/v2/ENDPOINT_ID/run" \
  -H "Authorization: Bearer RUNPOD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "prompt": "Long running task"
    },
    "webhook": "https://your-server.com/callback",
    "policy": {
      "executionTimeout": 900000,
      "lowPriority": false,
      "ttl": 3600000
    }
  }'

# Check status
curl "https://api.runpod.ai/v2/ENDPOINT_ID/status/JOB_ID" \
  -H "Authorization: Bearer RUNPOD_API_KEY"
```

### 8.4 Python SDK for Requests

```python
import runpod
import os

runpod.api_key = os.getenv("RUNPOD_API_KEY")

endpoint = runpod.Endpoint("ENDPOINT_ID")

# Async (recommended)
run = endpoint.run({"prompt": "Hello!"})
print(run.status())       # IN_QUEUE, IN_PROGRESS, COMPLETED, FAILED
result = run.output()     # blocks until complete

# Sync (90s timeout)
result = endpoint.run_sync({"prompt": "Quick question"})

# Per-endpoint API key (useful for multi-tenant)
endpoint = runpod.Endpoint("ENDPOINT_ID", api_key="specific_key")
```

### 8.5 Execution Policies

| Parameter | Default | Range |
|-----------|---------|-------|
| `executionTimeout` | 600,000 ms (10 min) | 5 sec — 7 days |
| `ttl` | 86,400,000 ms (24 hr) | 10 sec — 7 days |
| `lowPriority` | false | boolean |

### 8.6 Payload Limits

- `/run`: 10 MB max
- `/runsync`: 20 MB max
- For larger data, use S3 storage and pass a reference

### 8.7 Result Retention

- Async (`/run`): 30 minutes after completion
- Sync (`/runsync`): 1 minute (5 min max)

### 8.8 Webhook Support

Include `"webhook": "https://..."` in request body. RunPod POSTs results to
your URL. Retries up to 2 times with 10-second delay on failure. Expects
HTTP 200 response.

---

## 9. Worker/Handler Development

### 9.1 Basic Handler

```python
import runpod

# Load model OUTSIDE handler — runs once at startup
model = load_my_model()

def handler(job):
    job_input = job["input"]
    prompt = job_input.get("prompt", "")

    # Validate
    if not prompt:
        return {"error": "Missing prompt"}

    # Process
    result = model.generate(prompt)
    return {"output": result}

runpod.serverless.start({"handler": handler})
```

### 9.2 Streaming Handler

```python
def streaming_handler(job):
    for token in generate_tokens(job["input"]["prompt"]):
        yield token

runpod.serverless.start({
    "handler": streaming_handler,
    "return_aggregate_stream": True  # also available via /run and /runsync
})
```

### 9.3 Async Handler

```python
async def async_handler(job):
    result = await async_generate(job["input"])
    yield result

runpod.serverless.start({"handler": async_handler})
```

### 9.4 Progress Updates

```python
def handler(job):
    runpod.serverless.progress_update(job, "Loading data...")
    # ... work ...
    runpod.serverless.progress_update(job, "Processing...")
    # ... more work ...
    return result
```

### 9.5 Worker Refresh

Return `{"refresh_worker": True, "job_results": data}` to reset worker state
after a job (useful for memory cleanup).

### 9.6 Local Testing

```bash
python my_worker.py --rp_serve_api
```

Starts a local API server that simulates the serverless endpoint.

### 9.7 Dockerfile Pattern

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY handler.py .

CMD ["python", "handler.py"]
```

### 9.8 Deployment

1. Build and push to Docker Hub (or any container registry)
2. Create a template pointing at your image
3. Create an endpoint pointing at the template
4. Or: connect a GitHub repo for auto-build on push

---

## 10. Autoscaling Configuration

### 10.1 Worker Types

| Type | Behaviour | Cost |
|------|-----------|------|
| **Active** (workersMin > 0) | Always running, no cold starts | Pay 24/7, discounted rate |
| **Flex** (workersMin = 0) | Scale from zero on demand | Pay only when processing, cold start penalty |

### 10.2 Key Parameters

| Parameter | GraphQL Field | Effect |
|-----------|--------------|--------|
| Min Workers | `workersMin` | Always-on workers (0 = scale to zero) |
| Max Workers | `workersMax` | Ceiling for autoscaler |
| Idle Timeout | `idleTimeout` | Seconds before idle flex worker shuts down |
| Scaler Type | `scalerType` | `QUEUE_DELAY` or `REQUEST_COUNT` |
| Scaler Value | `scalerValue` | Threshold for scaling (seconds or count) |

### 10.3 Cost Optimisation Strategy

For a budget-conscious setup (like ours):

- `workersMin: 0` — don't pay for idle workers
- `workersMax: 1-3` — cap spend
- `idleTimeout: 5` — shut down fast after work completes
- `scalerType: "QUEUE_DELAY"` — scale based on wait time
- `scalerValue: 4` — scale up if jobs wait > 4 seconds
- Use **FlashBoot** (RunPod feature) to reduce cold start times

### 10.4 Cold Start Mitigation

- **FlashBoot:** RunPod caches worker state for faster restarts
- **Active workers:** Eliminate cold starts entirely (costs more)
- **Network volumes:** Pre-load model weights to avoid download time
- **Baked-in models:** Include model weights in Docker image (large image
  but zero download at runtime)

---

## 11. Python SDK — Full Reference

### 11.1 Installation

```bash
pip install runpod
# or
uv add runpod
```

### 11.2 Pod Management (not serverless, but useful)

```python
import runpod

runpod.api_key = os.getenv("RUNPOD_API_KEY")

# List all pods
pods = runpod.get_pods()

# Create a pod
pod = runpod.create_pod(
    name="my-pod",
    image="runpod/worker-v1-vllm:stable",
    gpu_type="NVIDIA RTX A6000"
)

# Stop / resume / terminate
runpod.stop_pod(pod["id"])
runpod.resume_pod(pod["id"])
runpod.terminate_pod(pod["id"])
```

### 11.3 Endpoint Job Submission

```python
endpoint = runpod.Endpoint("ENDPOINT_ID")

# Async
run = endpoint.run({"prompt": "Hello"})
status = run.status()     # IN_QUEUE | IN_PROGRESS | COMPLETED | FAILED
output = run.output()     # blocks until done

# Sync (90s timeout, then returns status)
result = endpoint.run_sync({"prompt": "Quick"})
```

### 11.4 GraphQL via Python (for endpoint management)

The SDK doesn't expose high-level methods for endpoint CRUD. Use the GraphQL
API directly:

```python
import requests
import os

API_KEY = os.getenv("RUNPOD_API_KEY")
GRAPHQL_URL = "https://api.runpod.io/graphql"

def graphql(query, variables=None):
    resp = requests.post(
        GRAPHQL_URL,
        json={"query": query, "variables": variables or {}},
        headers={"Authorization": f"Bearer {API_KEY}"}
    )
    resp.raise_for_status()
    return resp.json()

# Create endpoint
result = graphql("""
mutation CreateEndpoint($input: SaveEndpointInput!) {
  saveEndpoint(input: $input) {
    id
    name
    gpuIds
    workersMin
    workersMax
    idleTimeout
    scalerType
    scalerValue
  }
}
""", {
    "input": {
        "name": "my-vllm-endpoint",
        "templateId": "YOUR_TEMPLATE_ID",
        "gpuIds": "AMPERE_24",
        "workersMin": 0,
        "workersMax": 2,
        "idleTimeout": 5,
        "scalerType": "QUEUE_DELAY",
        "scalerValue": 4,
        "locations": "US"
    }
})

endpoint_id = result["data"]["saveEndpoint"]["id"]

# List endpoints
result = graphql("""
query {
  myself {
    endpoints {
      id
      name
      gpuIds
      workersMin
      workersMax
      idleTimeout
      templateId
    }
  }
}
""")

# Update endpoint
graphql("""
mutation {
  saveEndpoint(input: {
    id: "%s"
    gpuIds: "AMPERE_24"
    name: "my-vllm-endpoint"
    templateId: "YOUR_TEMPLATE_ID"
    workersMax: 3
  }) { id workersMax }
}
""" % endpoint_id)

# Scale to zero then delete
graphql("""
mutation {
  saveEndpoint(input: {
    id: "%s"
    gpuIds: "AMPERE_24"
    name: "my-vllm-endpoint"
    templateId: "YOUR_TEMPLATE_ID"
    workersMax: 0
    workersMin: 0
  }) { id }
}
""" % endpoint_id)

graphql('mutation { deleteEndpoint(id: "%s") }' % endpoint_id)

# Check billing
result = graphql("""
query {
  myself {
    currentSpendPerHr
    spendDetails { /* fields */ }
  }
}
""")
```

---

## 12. Terraform / IaC

RunPod has a Terraform provider (`runpod/runpod` on the Terraform Registry).
The GitHub repo is `runpod/terraform-provider-runpod`. However:

- Documentation is sparse
- The registry page requires JavaScript (can't scrape cleanly)
- Resources likely include pods and possibly endpoints
- **Recommendation:** Use the GraphQL API directly for now. It's better
  documented and more flexible. Wrap it in Python for IaC-like behaviour.

---

## 13. CI/CD Integration

No official GitHub Actions exist. Build your own:

```yaml
# .github/workflows/deploy-worker.yml
name: Deploy RunPod Worker

on:
  push:
    branches: [main]
    paths: ['worker/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build and push Docker image
        run: |
          docker build -t myrepo/my-worker:latest ./worker
          echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USER" --password-stdin
          docker push myrepo/my-worker:latest
        env:
          DOCKER_USER: ${{ secrets.DOCKER_USER }}
          DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}

      - name: Update RunPod endpoint
        run: |
          curl -s -X POST https://api.runpod.io/graphql \
            -H "Authorization: Bearer $RUNPOD_API_KEY" \
            -H "Content-Type: application/json" \
            -d '{
              "query": "mutation { saveEndpoint(input: { id: \"'$ENDPOINT_ID'\", gpuIds: \"AMPERE_24\", name: \"my-worker\", templateId: \"'$TEMPLATE_ID'\", workersMax: 2 }) { id } }"
            }'
        env:
          RUNPOD_API_KEY: ${{ secrets.RUNPOD_API_KEY }}
          ENDPOINT_ID: ${{ secrets.RUNPOD_ENDPOINT_ID }}
          TEMPLATE_ID: ${{ secrets.RUNPOD_TEMPLATE_ID }}
```

RunPod also supports **GitHub integration** — connect a repo and it auto-builds
the Docker image on push. Useful if you don't want to manage your own registry.

---

## 14. Gotchas and Important Notes

### 14.1 Deletion Requires Scale-to-Zero

You **cannot** delete an endpoint with `workersMin > 0` or `workersMax > 0`.
Scale to zero first, wait for workers to drain, then delete.

### 14.2 Template ID is Required for Updates

Even when updating an endpoint, you must include `templateId` and `gpuIds`
in the mutation. They're effectively required fields on every `saveEndpoint`
call.

### 14.3 Rate Limits Scale with Workers

Rate limits are per-endpoint and scale dynamically:
`number_of_running_workers x requests_per_worker`. More workers = higher
throughput ceiling.

### 14.4 Result Retention is Short

- Async results: 30 minutes
- Sync results: 1 minute

Poll promptly or use webhooks. Don't assume results will be available later.

### 14.5 Cold Starts are Real

With `workersMin: 0`, expect 10-60+ seconds cold start depending on model
size and whether the image/weights are cached. For vLLM with large models,
cold start can be minutes.

### 14.6 vLLM MAX_MODEL_LEN

If not set, vLLM auto-detects from the model config. This can cause OOM
errors on smaller GPUs if the model's default context is very long. Always
set `MAX_MODEL_LEN` explicitly.

### 14.7 Payload Size Limits

- `/run`: 10 MB
- `/runsync`: 20 MB
- Use S3 for larger payloads

### 14.8 OpenAI Compatibility Caveats

The vLLM OpenAI endpoint at `/openai/v1/*` has its own rate limit
(2000/10s, 400 concurrent). Token counting and some features (function
calling, vision) may differ from real OpenAI behaviour.

### 14.9 The GraphQL Spec is Incomplete

The public spec at `graphql-spec.runpod.io` doesn't document all mutations
(notably `saveTemplate` fields are sparse). Use GraphQL introspection to
discover the full schema:

```graphql
query {
  __schema {
    mutationType {
      fields {
        name
        args {
          name
          type { name kind }
        }
      }
    }
  }
}
```

---

## 15. Complete Agent Automation Playbook

For an AI agent to deploy a vLLM model from scratch:

### Step 1: Query GPU availability and pricing

```python
result = graphql("""
query {
  gpuTypes {
    id
    displayName
    memoryInGb
    lowestPrice(input: { gpuCount: 1 }) {
      minimumBidPrice
      uninterruptablePrice
    }
  }
}
""")
```

### Step 2: Create endpoint with vLLM template

```python
result = graphql("""
mutation {
  saveEndpoint(input: {
    name: "qwen3-8b"
    templateId: "VLLM_TEMPLATE_ID"
    gpuIds: "AMPERE_24"
    workersMin: 0
    workersMax: 1
    idleTimeout: 5
    scalerType: "QUEUE_DELAY"
    scalerValue: 4
    locations: "US"
  }) {
    id
    name
  }
}
""")
endpoint_id = result["data"]["saveEndpoint"]["id"]
```

### Step 3: Wait for worker to be ready

```python
import time

while True:
    resp = requests.get(
        f"https://api.runpod.ai/v2/{endpoint_id}/health",
        headers={"Authorization": f"Bearer {API_KEY}"}
    )
    health = resp.json()
    if health.get("workers", {}).get("ready", 0) > 0:
        break
    time.sleep(10)
```

### Step 4: Send inference request

```python
endpoint = runpod.Endpoint(endpoint_id)
result = endpoint.run_sync({
    "messages": [{"role": "user", "content": "Hello!"}],
    "apply_chat_template": True,
    "sampling_params": {"temperature": 0.7, "max_tokens": 512}
})
```

### Step 5: Monitor costs

```python
result = graphql("""
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
""")
```

### Step 6: Tear down when done

```python
# Scale to zero
graphql("""
mutation {
  saveEndpoint(input: {
    id: "%s"
    gpuIds: "AMPERE_24"
    name: "qwen3-8b"
    templateId: "VLLM_TEMPLATE_ID"
    workersMax: 0
    workersMin: 0
  }) { id }
}
""" % endpoint_id)

# Wait, then delete
time.sleep(30)
graphql('mutation { deleteEndpoint(id: "%s") }' % endpoint_id)
```

---

## 16. Sources

- https://docs.runpod.io/sdks/graphql/manage-endpoints — GraphQL CRUD
- https://docs.runpod.io/serverless/endpoints/overview — endpoint concepts
- https://docs.runpod.io/serverless/endpoints/send-requests — request API
- https://docs.runpod.io/serverless/references/operations — operation reference
- https://docs.runpod.io/serverless/workers/vllm/overview — vLLM overview
- https://docs.runpod.io/serverless/workers/vllm/get-started — vLLM setup
- https://docs.runpod.io/serverless/vllm/environment-variables — vLLM env vars
- https://docs.runpod.io/serverless/workers/vllm/openai-compatibility — OpenAI compat
- https://docs.runpod.io/serverless/workers/handlers/overview — handler functions
- https://docs.runpod.io/sdks/python/overview — Python SDK
- https://graphql-spec.runpod.io/ — GraphQL schema
- https://github.com/runpod/runpod-python — Python SDK source
- https://github.com/runpod-workers/worker-vllm — vLLM worker source
