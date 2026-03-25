"""Model deployment manifest — what to deploy, on what GPU, with what config.

This is the single source of truth for the benchmark fleet. The infra module
reads this to create templates and endpoints. The config module reads this
to build the test matrix.
"""

from dataclasses import dataclass, field


@dataclass(frozen=True)
class ModelDeployment:
    """A model to deploy on RunPod serverless."""

    # Identity
    key: str                    # unique key (e.g. "gen_creative_l40s")
    name: str                   # human-readable name
    role: str                   # generate_creative, generate_code, review_a, review_b, rewrite

    # Model
    hf_model_id: str            # HuggingFace repo ID
    local_equivalent: str       # Ollama model name for reference

    # GPU
    gpu_id: str                 # RunPod GPU ID (full NVIDIA name from gpuTypes query)
    gpu_tier: str               # "l40s" or "b200"
    vram_gb: int
    cost_per_sec: float         # RunPod flex rate

    # vLLM config
    max_model_len: int = 32768
    quantization: str | None = None
    dtype: str = "auto"
    tensor_parallel_size: int = 1
    gpu_memory_utilization: float = 0.95
    max_concurrency: int = 30

    # Scaling
    workers_min: int = 0
    workers_max: int = 1
    idle_timeout: int = 5

    # Extra vLLM env vars
    extra_env: dict[str, str] = field(default_factory=dict)

    def template_name(self) -> str:
        return f"coldanvil-bench-{self.key}"

    def endpoint_name(self) -> str:
        return f"coldanvil-bench-{self.key}"

    def vllm_env(self, hf_token: str = "") -> dict[str, str]:
        """Build the full vLLM environment variable dict."""
        env = {
            "MODEL_NAME": self.hf_model_id,
            "MAX_MODEL_LEN": str(self.max_model_len),
            "DTYPE": self.dtype,
            "TENSOR_PARALLEL_SIZE": str(self.tensor_parallel_size),
            "GPU_MEMORY_UTILIZATION": str(self.gpu_memory_utilization),
            "MAX_CONCURRENCY": str(self.max_concurrency),
            "DISABLE_LOG_STATS": "True",
            "DISABLE_LOG_REQUESTS": "True",
        }
        if self.quantization:
            env["QUANTIZATION"] = self.quantization
        if hf_token:
            env["HF_TOKEN"] = hf_token
        env.update(self.extra_env)
        return env


# ---------------------------------------------------------------------------
# The fleet: all models we want to benchmark
# ---------------------------------------------------------------------------

# GPU tiers — IDs match RunPod's gpuTypes query exactly
_L40S = dict(gpu_id="NVIDIA L40S", gpu_tier="l40s", vram_gb=48, cost_per_sec=0.00053)
_B200 = dict(gpu_id="NVIDIA B200", gpu_tier="b200", vram_gb=180, cost_per_sec=0.00240)

# Precision strategy:
#   - Generation/rewrite (Qwen3.5): FP16 on B200 (room to spare), FP8 on L40S (48GB limit)
#   - Code generation (GPT-OSS): MXFP4 — only available precision
#   - Review (Mistral, Gemma): FP8 — reliable scoring, doesn't need max quality
#
# Sizing: FP16 = 2 bytes/param, FP8 = 1 byte/param, MXFP4 = 0.5 bytes/param.
#
# Single B200 stack (192GB): Qwen 35B FP16 (~70GB) + GPT-OSS 20B MXFP4 (~10GB)
#   + Mistral 24B FP8 (~24GB) + Gemma 27B FP8 (~27GB) = ~131GB with room for KV cache.
# The 122B models at FP8 (~122GB) need their own B200.

FLEET: list[ModelDeployment] = [

    # --- Creative generation ---
    # Qwen3.5-35B-A3B: MoE (35B total, 3B active). ~35GB at FP8 → fits L40S.
    # FP16 (~70GB) won't fit L40S (48GB), so L40S stays FP8. B200 runs FP16.
    ModelDeployment(
        key="gen_creative_l40s", name="Qwen3.5 35B-A3B FP8 (L40S)",
        role="generate_creative",
        hf_model_id="Qwen/Qwen3.5-35B-A3B", local_equivalent="qwen3.5:35b",
        max_model_len=32768, quantization="fp8",
        **_L40S,
    ),
    # Qwen3.5-122B-A10B: MoE (122B total, 10B active). ~122GB at FP8 → fits B200.
    ModelDeployment(
        key="gen_creative_b200", name="Qwen3.5 122B-A10B FP8 (B200)",
        role="generate_creative",
        hf_model_id="Qwen/Qwen3.5-122B-A10B", local_equivalent="qwen3.5:122b",
        max_model_len=65536, quantization="fp8",
        **_B200,
    ),

    # --- Code generation ---
    # GPT-OSS 20B: only available as MXFP4. ~10GB → fits L40S easily.
    ModelDeployment(
        key="gen_code_l40s", name="GPT-OSS 20B MXFP4 (L40S)",
        role="generate_code",
        hf_model_id="openai/gpt-oss-20b", local_equivalent="gpt-oss:20b",
        max_model_len=32768,
        **_L40S,
    ),
    # GPT-OSS 120B: only available as MXFP4. ~60GB → fits B200.
    ModelDeployment(
        key="gen_code_b200", name="GPT-OSS 120B MXFP4 (B200)",
        role="generate_code",
        hf_model_id="openai/gpt-oss-120b", local_equivalent="gpt-oss:120b",
        max_model_len=65536,
        **_B200,
    ),

    # --- Review A (Mistral) ---
    # Mistral Small 3.2 24B: ~24GB at FP8 → fits L40S with room.
    ModelDeployment(
        key="review_a_l40s", name="Mistral Small 3.2 24B FP8 (L40S)",
        role="review_a",
        hf_model_id="mistralai/Mistral-Small-3.2-24B-Instruct-2506",
        local_equivalent="mistral-small3.2:24b",
        max_model_len=32768, quantization="fp8",
        **_L40S,
    ),

    # --- Review B (Gemma) ---
    # Gemma 3 27B IT: ~27GB at FP8 → fits L40S. Gated model — needs HF_TOKEN.
    ModelDeployment(
        key="review_b_l40s", name="Gemma 3 27B IT FP8 (L40S)",
        role="review_b",
        hf_model_id="google/gemma-3-27b-it", local_equivalent="gemma3:27b",
        max_model_len=32768, quantization="fp8",
        extra_env={"TRUST_REMOTE_CODE": "True"},
        **_L40S,
    ),

    # --- Rewrite ---
    # Same models as generation, different endpoint for independent scaling.
    ModelDeployment(
        key="rewrite_l40s", name="Qwen3.5 35B-A3B Rewrite FP8 (L40S)",
        role="rewrite",
        hf_model_id="Qwen/Qwen3.5-35B-A3B", local_equivalent="qwen3.5:35b",
        max_model_len=32768, quantization="fp8",
        **_L40S,
    ),
    ModelDeployment(
        key="rewrite_b200", name="Qwen3.5 122B-A10B Rewrite FP8 (B200)",
        role="rewrite",
        hf_model_id="Qwen/Qwen3.5-122B-A10B", local_equivalent="qwen3.5:122b",
        max_model_len=65536, quantization="fp8",
        **_B200,
    ),
]


def get_fleet(keys: list[str] | None = None) -> list[ModelDeployment]:
    """Get fleet models, optionally filtered by key."""
    if keys is None:
        return FLEET
    return [m for m in FLEET if m.key in keys]


def get_by_role(role: str) -> list[ModelDeployment]:
    """Get fleet models by role."""
    return [m for m in FLEET if m.role == role]
