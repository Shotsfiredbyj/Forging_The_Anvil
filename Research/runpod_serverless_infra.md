# RunPod Serverless Infrastructure-as-Code Research

Date: 2026-03-24

## 1. vLLM Worker Template

### Docker Image

Pre-built: `runpod/worker-v1-vllm:<version>` (requires CUDA >= 12.1)

### How It Works

RunPod provides a vLLM worker via their Hub. You pick a model, set env vars,
and create an endpoint. The worker exposes an OpenAI-compatible API at:

```
https://api.runpod.ai/v2/<ENDPOINT_ID>/openai/v1
```

Supports chat completions (streaming and non-streaming) and model listing.

Native RunPod input format also works:

```json
{"input": {"prompt": "Hello World"}}
```

### Model Caching

RunPod automatically caches models on hosts. Workers are preferentially
scheduled on hosts that already have the model cached. You are NOT billed
during model download time. Cache path:

```
/runpod-volume/huggingface-cache/hub/models--{org}--{name}/snapshots/{hash}/
```

One cached model per endpoint. All quantisation versions download if multiple
exist (selective quant support is coming).

---

## 2. vLLM Environment Variables (78 total documented)

### Core Model Config

| Variable | Default | Description |
|---|---|---|
| `MODEL_NAME` | `facebook/opt-125m` | HuggingFace repo ID or local path |
| `MODEL_REVISION` | `main` | Model version to load |
| `HF_TOKEN` | -- | Auth for gated/private models |
| `TOKENIZER` | None | Override tokenizer (HF name or path) |
| `TOKENIZER_NAME` | None | Alternative tokenizer repo |
| `TOKENIZER_REVISION` | None | Specific tokenizer version |
| `TOKENIZER_MODE` | `auto` | `auto` or `slow` |
| `SKIP_TOKENIZER_INIT` | `False` | Bypass tokenizer/detokenizer init |
| `TRUST_REMOTE_CODE` | `False` | Allow remote code from HF |
| `DOWNLOAD_DIR` | None | Model weight download location |
| `LOAD_FORMAT` | `auto` | Weight format spec |
| `CUSTOM_CHAT_TEMPLATE` | None | Jinja2 chat template override (single-line) |

### Quantisation

| Variable | Default | Description |
|---|---|---|
| `QUANTIZATION` | None | `awq`, `gptq`, `squeezellm`, `bitsandbytes` |
| `QUANTIZATION_PARAM_PATH` | None | JSON file with KV cache scaling values |
| `DTYPE` | `auto` | `auto`, `half`, `float16`, `bfloat16`, `float`, `float32` |
| `KV_CACHE_DTYPE` | `auto` | `auto` or `fp8` |

### Parallelism and Performance

| Variable | Default | Description |
|---|---|---|
| `TENSOR_PARALLEL_SIZE` | `1` | Number of GPUs for tensor sharding |
| `PIPELINE_PARALLEL_SIZE` | `1` | Number of pipeline stages |
| `GPU_MEMORY_UTILIZATION` | `0.95` | Fraction of VRAM vLLM can use (0.0-1.0) |
| `MAX_MODEL_LEN` | None | Max context length in tokens |
| `MAX_NUM_SEQS` | `256` | Max batched sequences per iteration |
| `MAX_NUM_BATCHED_TOKENS` | None | Tokens per iteration limit |
| `MAX_CONCURRENCY` | `30` | Max concurrent requests per worker |
| `BLOCK_SIZE` | `16` | Token block size: `8`, `16`, `32` |
| `SWAP_SPACE` | `4` | CPU swap per GPU in GiB |
| `ENFORCE_EAGER` | `False` | Force eager-mode PyTorch (disables CUDA graphs) |
| `MAX_SEQ_LEN_TO_CAPTURE` | `8192` | Max context length for CUDA graph capture |
| `ENABLE_PREFIX_CACHING` | `False` | Automatic prefix caching |
| `ENABLE_CHUNKED_PREFILL` | `False` | Chunked prefill mode |
| `DISABLE_SLIDING_WINDOW` | `False` | Disable sliding window |
| `USE_V2_BLOCK_MANAGER` | `False` | Activate BlockSpaceManagerV2 |
| `DISABLE_CUSTOM_ALL_REDUCE` | `0` | 0 = enabled, 1 = disabled |
| `ENABLE_EXPERT_PARALLEL` | `False` | Expert parallelism for MoE models |
| `SEED` | `0` | Random seed |

### Distributed Execution

| Variable | Default | Description |
|---|---|---|
| `DISTRIBUTED_EXECUTOR_BACKEND` | None | `ray` or `mp` |
| `WORKER_USE_RAY` | `False` | Deprecated; use DISTRIBUTED_EXECUTOR_BACKEND=ray |
| `MAX_PARALLEL_LOADING_WORKERS` | None | Prevent RAM overflow during TP loading |
| `RAY_WORKERS_USE_NSIGHT` | `False` | Profiling for Ray workers |

### Speculative Decoding

| Variable | Default | Description |
|---|---|---|
| `SPECULATIVE_MODEL` | None | Draft model name |
| `NUM_SPECULATIVE_TOKENS` | None | Draft token count |
| `SPECULATIVE_DRAFT_TENSOR_PARALLEL_SIZE` | None | TP for draft model |
| `SPECULATIVE_MAX_MODEL_LEN` | None | Max draft sequence length |
| `SPECULATIVE_DISABLE_BY_BATCH_SIZE` | None | Disable speculation above N requests |
| `NGRAM_PROMPT_LOOKUP_MAX` | None | Max n-gram window |
| `NGRAM_PROMPT_LOOKUP_MIN` | None | Min n-gram window |
| `SPEC_DECODING_ACCEPTANCE_METHOD` | `rejection_sampler` | `rejection_sampler` or `typical_acceptance_sampler` |
| `TYPICAL_ACCEPTANCE_SAMPLER_POSTERIOR_THRESHOLD` | None | Token acceptance probability lower bound |
| `TYPICAL_ACCEPTANCE_SAMPLER_POSTERIOR_ALPHA` | None | Entropy-based acceptance scaling |
| `NUM_LOOKAHEAD_SLOTS` | `0` | Experimental speculative decoding |
| `SCHEDULER_DELAY_FACTOR` | `0.0` | Delay before next prompt scheduling |

### LoRA

| Variable | Default | Description |
|---|---|---|
| `ENABLE_LORA` | `False` | Activate LoRA adapter handling |
| `MAX_LORAS` | `1` | Max LoRAs per batch |
| `MAX_LORA_RANK` | `16` | Upper rank limit |
| `LORA_EXTRA_VOCAB_SIZE` | `256` | Extra vocab ceiling |
| `LORA_DTYPE` | `auto` | `auto`, `float16`, `bfloat16`, `float32` |
| `LONG_LORA_SCALING_FACTORS` | None | Multiple scaling factors |
| `MAX_CPU_LORAS` | None | LoRAs storable in CPU memory |
| `FULLY_SHARDED_LORAS` | `False` | Fully sharded LoRA layers |
| `LORA_MODULES` | `[]` | Pre-loaded adapters from HF |

### OpenAI Compatibility

| Variable | Default | Description |
|---|---|---|
| `OPENAI_SERVED_MODEL_NAME_OVERRIDE` | None | Custom model ID in API responses |
| `OPENAI_RESPONSE_ROLE` | `assistant` | Response role designation |
| `RAW_OPENAI_OUTPUT` | `1` | Raw SSE format when streaming |
| `ENABLE_AUTO_TOOL_CHOICE` | `false` | Automatic tool selection |
| `TOOL_CALL_PARSER` | None | `mistral`, `hermes`, `llama3_json`, `llama4_json`, `granite`, `deepseek_v3`, `phi4_mini_json`, etc. |
| `REASONING_PARSER` | None | `deepseek_r1`, `qwen3`, `granite`, `hunyuan_a13b` |

### Batching and Streaming

| Variable | Default | Description |
|---|---|---|
| `DEFAULT_BATCH_SIZE` | `50` | Max HTTP response batch size |
| `DEFAULT_MIN_BATCH_SIZE` | `1` | Initial batch size |
| `DEFAULT_BATCH_SIZE_GROWTH_FACTOR` | `3` | Batch size multiplier |

### Logging

| Variable | Default | Description |
|---|---|---|
| `DISABLE_LOG_STATS` | `False` | Suppress statistics logging |
| `DISABLE_LOG_REQUESTS` | `False` | Suppress request logging |
| `MAX_LOG_LEN` | None | Max prompt logging length |

### RoPE

| Variable | Default | Description |
|---|---|---|
| `ROPE_SCALING` | None | JSON dictionary for RoPE scaling config |
| `ROPE_THETA` | None | RoPE theta parameter |

### Misc

| Variable | Default | Description |
|---|---|---|
| `MAX_LOGPROBS` | `20` | Max log probability outputs |
| `NUM_GPU_BLOCKS_OVERRIDE` | None | Override GPU block profiling |
| `GUIDED_DECODING_BACKEND` | `outlines` | `outlines` or `lm-format-enforcer` |
| `PREEMPTION_MODE` | None | `recompute` or `save` |
| `PREEMPTION_CHECK_PERIOD` | `1.0` | Check frequency in seconds |
| `PREEMPTION_CPU_CAPACITY` | `2` | CPU memory % for saved activations |
| `MODEL_LOADER_EXTRA_CONFIG` | None | Additional loader params (dict) |

### Auto-Discovery

Any uppercase env var matching vLLM's `AsyncEngineArgs` fields is applied
automatically. So even variables not explicitly listed above will work if they
correspond to a vLLM engine argument.

### Docker Build Args (for baking models into images)

| Arg | Default | Description |
|---|---|---|
| `MODEL_NAME` | required | Model to bake in |
| `MODEL_REVISION` | `main` | Version |
| `BASE_PATH` | `/runpod-volume` | Cache path; use `/models` for baked-in |
| `QUANTIZATION` | None | Quant method |
| `WORKER_CUDA_VERSION` | `12.1.0` | CUDA version |
| `TOKENIZER_NAME` | None | Override tokenizer |
| `TOKENIZER_REVISION` | `main` | Tokenizer version |
| `VLLM_NIGHTLY` | None | Set `true` for nightly vLLM build |

Build command:
```bash
docker build -t username/image:tag \
  --build-arg MODEL_NAME="org/model-name" \
  --build-arg BASE_PATH="/models" .
```

---

## 3. Custom Worker Development

### Handler Pattern

```python
import runpod

def handler(event):
    input = event['input']
    prompt = input.get('prompt')
    # ... do work ...
    return result

runpod.serverless.start({'handler': handler})
```

The `event` dict contains `input` (user-provided) plus request metadata.
Return any JSON-serializable value. It gets wrapped in the response:

```json
{
  "delayTime": 15088,
  "executionTime": 60,
  "id": "unique-request-id",
  "output": "handler-return-value",
  "status": "COMPLETED",
  "workerId": "worker-id"
}
```

### Dockerfile Pattern

```dockerfile
FROM python:3.10-slim
WORKDIR /
RUN pip install --no-cache-dir runpod
COPY handler.py /
CMD ["python3", "-u", "handler.py"]
```

Build for amd64:
```bash
docker build --platform linux/amd64 --tag username/image-name:tag .
```

### Local Testing

```bash
python handler.py --rp_serve_api
```

This starts a local HTTP server that mimics the RunPod serverless interface.

### For Ollama or Custom Model Serving

You'd build a custom worker that:
1. Starts the model server (Ollama, vLLM, etc.) in the container
2. Implements the handler to forward requests to the local server
3. Returns results

Example Dockerfile for an Ollama-based worker:
```dockerfile
FROM ollama/ollama:latest
RUN pip install runpod
COPY handler.py /
# Start Ollama server + handler
CMD ollama serve & sleep 5 && python3 -u handler.py
```

---

## 4. Endpoint Configuration

### Scaling Settings

| Setting | Default | Description |
|---|---|---|
| Active (min) workers | 0 | Always-on, eliminates cold starts. 20-30% discount when idle |
| Max workers | 3 | Max concurrent. Set ~20% above expected peak |
| GPUs per worker | 1 | Prefer fewer high-end GPUs over many low-end |
| Idle timeout | 5s | Worker stays warm after request completes |
| Execution timeout | 600s (10 min) | Range: 5s to 7 days |
| Job TTL | 24 hours | Range: 10s to 7 days. Timer starts at submission |

### Auto-Scaling

Two modes:

1. **Queue delay** -- adds workers when requests wait > threshold (default 4s)
2. **Request count** -- `ceil((queued + in_progress) / scalerValue)`.
   Scaler value of 1 = max responsiveness. Recommended for LLM workloads.

### FlashBoot

Enabled by default. Retains worker state after shutdown for faster cold
start revival. No special configuration needed -- it's on unless you
disable it. The key benefit: when a worker scales to zero and back up,
FlashBoot restores from a snapshot rather than doing a full cold start.

No specific env vars or API flags to configure it beyond the endpoint
setting toggle. It just works.

### GPU Pricing (per second)

| GPU | VRAM | Flex | Active |
|---|---|---|---|
| A4000/A4500/RTX 4000 | 16GB | 0.00016 | 0.00011 |
| L4/A5000/3090 | 24GB | 0.00019 | 0.00013 |
| 4090 PRO | 24GB | 0.00031 | 0.00021 |
| A6000/A40 | 48GB | 0.00034 | 0.00024 |
| L40/L40S/6000 Ada | 48GB | 0.00053 | 0.00037 |
| A100 | 80GB | 0.00076 | 0.00060 |
| H100 PRO | 80GB | 0.00116 | 0.00093 |
| H200 PRO | 141GB | 0.00155 | 0.00124 |
| B200 | 180GB | 0.00240 | 0.00190 |

### Endpoint Types

- **Queue-based** -- built-in queueing, guaranteed execution
- **Load balancing** -- direct routing, lower latency

---

## 5. Programmatic Management

### REST API (https://rest.runpod.io/v1)

**Create Endpoint:**
```
POST /endpoints
{
  "name": "my-endpoint",
  "templateId": "template-id-here"
}
```

**List Endpoints:**
```
GET /endpoints?includeTemplate=true&includeWorkers=true
```

**Get Endpoint:**
```
GET /endpoints/{endpointId}?includeTemplate=true
```

**Update Endpoint:**
```
PATCH /endpoints/{endpointId}
```

**Delete Endpoint:**
```
DELETE /endpoints/{endpointId}
```

**Create Template:**
```
POST /templates
{
  "name": "my-vllm-template",
  "imageName": "runpod/worker-v1-vllm:latest",
  "category": "NVIDIA",
  "containerDiskInGb": 20,
  "env": {
    "MODEL_NAME": "Qwen/Qwen3-32B-AWQ",
    "QUANTIZATION": "awq",
    "MAX_MODEL_LEN": "16384",
    "TENSOR_PARALLEL_SIZE": "1",
    "GPU_MEMORY_UTILIZATION": "0.95"
  },
  "volumeInGb": 0,
  "volumeMountPath": "/runpod-volume"
}
```

**List Templates:**
```
GET /templates?includeRunpodTemplates=true
```

**Update Template:**
```
PATCH /templates/{templateId}
```

**Delete Template:**
```
DELETE /templates/{templateId}
```

Auth: Bearer token in `authorization` header.

### Python SDK

The Python SDK (`pip install runpod`) primarily covers:

1. **Worker development** (serverless handler):
```python
import runpod
runpod.serverless.start({"handler": my_handler})
```

2. **Endpoint invocation** (calling existing endpoints):
```python
import runpod
runpod.api_key = "your_key"

endpoint = runpod.Endpoint("ENDPOINT_ID")

# Async
run = endpoint.run({"prompt": "Hello"})
print(run.status())
print(run.output())  # blocks until complete

# Sync (90s timeout)
result = endpoint.run_sync({"prompt": "Hello"})
```

3. **Pod management** (not serverless endpoints):
```python
runpod.create_pod("name", "image", "GPU_TYPE")
runpod.get_pods()
runpod.stop_pod(pod_id)
runpod.terminate_pod(pod_id)
```

**The SDK does NOT currently expose methods for creating/managing serverless
endpoints or templates programmatically.** For that, use the REST API directly.

### GraphQL API

The GraphQL API at `https://api.runpod.ai/graphql` has an `Endpoint` type
with fields including `id`, `name`, `templateId`, `gpuIds`, `workersMax`,
`workersMin`, `networkVolumeId`, `type`, `userId`. However, the documented
mutations focus on pod management. Endpoint creation/management mutations
exist but are not fully documented in the public spec.

---

## 6. Infrastructure-as-Code Pattern

Given the above, the deployment automation flow is:

```
1. Create Template (REST API)
   - Set Docker image (runpod/worker-v1-vllm or custom)
   - Set all env vars (MODEL_NAME, QUANTIZATION, etc.)

2. Create Endpoint (REST API)
   - Reference the template ID
   - Name the endpoint

3. Configure Endpoint (REST API PATCH)
   - Set scaling (min/max workers, idle timeout)
   - Set GPU type
   - Enable/disable FlashBoot

4. Invoke Endpoint (Python SDK or REST)
   - OpenAI-compatible: /openai/v1/chat/completions
   - Native: /run or /runsync
```

Python wrapper sketch:

```python
import requests

RUNPOD_API_KEY = "..."
BASE = "https://rest.runpod.io/v1"
HEADERS = {
    "Authorization": f"Bearer {RUNPOD_API_KEY}",
    "Content-Type": "application/json",
}

def create_template(name: str, image: str, env: dict) -> str:
    resp = requests.post(f"{BASE}/templates", headers=HEADERS, json={
        "name": name,
        "imageName": image,
        "category": "NVIDIA",
        "env": env,
    })
    resp.raise_for_status()
    return resp.json()["id"]

def create_endpoint(name: str, template_id: str) -> str:
    resp = requests.post(f"{BASE}/endpoints", headers=HEADERS, json={
        "name": name,
        "templateId": template_id,
    })
    resp.raise_for_status()
    return resp.json()["id"]

def delete_endpoint(endpoint_id: str):
    resp = requests.delete(f"{BASE}/endpoints/{endpoint_id}", headers=HEADERS)
    resp.raise_for_status()

def delete_template(template_id: str):
    resp = requests.delete(f"{BASE}/templates/{template_id}", headers=HEADERS)
    resp.raise_for_status()
```

### For Cold Anvil Specifically

To deploy a model like `Qwen/Qwen3-32B-AWQ` on a 48GB GPU:

```python
template_id = create_template(
    name="coldanvil-qwen3-32b-awq",
    image="runpod/worker-v1-vllm:stable",  # check latest tag
    env={
        "MODEL_NAME": "Qwen/Qwen3-32B-AWQ",
        "QUANTIZATION": "awq",
        "MAX_MODEL_LEN": "16384",
        "TENSOR_PARALLEL_SIZE": "1",
        "GPU_MEMORY_UTILIZATION": "0.95",
        "MAX_CONCURRENCY": "30",
        "DTYPE": "float16",
        "DISABLE_LOG_STATS": "True",
        "OPENAI_SERVED_MODEL_NAME_OVERRIDE": "qwen3-32b",
    }
)

endpoint_id = create_endpoint(
    name="coldanvil-qwen3-32b",
    template_id=template_id,
)
```

Then hit it via OpenAI-compatible API:
```
POST https://api.runpod.ai/v2/{endpoint_id}/openai/v1/chat/completions
Authorization: Bearer {RUNPOD_API_KEY}

{
  "model": "qwen3-32b",
  "messages": [{"role": "user", "content": "Hello"}],
  "temperature": 0.7,
  "max_tokens": 2048,
  "stream": true
}
```

---

## 7. Open Questions

1. **REST API completeness** -- The EndpointCreateInput schema in the OpenAPI
   spec only shows `name` and `templateId` as fields. Scaling config (min/max
   workers, GPU type, idle timeout) may need to be set via PATCH after creation,
   or may be part of an undocumented extended schema. Needs testing.

2. **GPU selection** -- Not clear from the REST API docs how to specify GPU
   type on endpoint creation. The GraphQL Endpoint type has `gpuIds` which
   suggests it's configurable, but the REST create schema doesn't show it.
   May need to use GraphQL or the web UI for initial GPU selection.

3. **FlashBoot toggle** -- Described as "enabled by default" in endpoint
   config. No specific API field documented for toggling it programmatically.

4. **Template env var format** -- The REST API template create shows `env`
   as an object. Need to verify whether values must be strings or can be
   typed (ints, bools). Likely all strings since they map to env vars.

5. **runpodctl CLI** -- Mentioned in some docs but no comprehensive command
   reference found for serverless endpoint management. Likely pod-focused.
