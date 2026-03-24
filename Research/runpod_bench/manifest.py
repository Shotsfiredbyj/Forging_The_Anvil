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
    gpu_id: str                 # RunPod GPU ID (e.g. "ADA_48_PRO")
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

    def vllm_env(self) -> dict[str, str]:
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
        env.update(self.extra_env)
        return env


# ---------------------------------------------------------------------------
# The fleet: all models we want to benchmark
# ---------------------------------------------------------------------------

# L40S tier (48GB) — sub-40B models
_L40S = dict(gpu_id="ADA_48_PRO", gpu_tier="l40s", vram_gb=48, cost_per_sec=0.00053)

# B200 tier (180GB) — full-size models
_B200 = dict(gpu_id="B200", gpu_tier="b200", vram_gb=180, cost_per_sec=0.00240)


FLEET: list[ModelDeployment] = [

    # --- Creative generation ---
    ModelDeployment(
        key="gen_creative_l40s", name="Qwen3.5 35B (L40S)",
        role="generate_creative",
        hf_model_id="Qwen/Qwen3.5-32B-AWQ", local_equivalent="qwen3.5:35b",
        max_model_len=32768, quantization="awq",
        **_L40S,
    ),
    ModelDeployment(
        key="gen_creative_b200", name="Qwen3.5 122B (B200)",
        role="generate_creative",
        hf_model_id="Qwen/Qwen3.5-122B", local_equivalent="qwen3.5:122b",
        max_model_len=65536,
        **_B200,
    ),

    # --- Code generation ---
    ModelDeployment(
        key="gen_code_l40s", name="GPT-OSS 20B (L40S)",
        role="generate_code",
        hf_model_id="gpt-oss-20b", local_equivalent="gpt-oss:20b",
        max_model_len=32768,
        **_L40S,
    ),
    ModelDeployment(
        key="gen_code_b200", name="GPT-OSS 120B (B200)",
        role="generate_code",
        hf_model_id="gpt-oss-120b", local_equivalent="gpt-oss:120b",
        max_model_len=65536,
        **_B200,
    ),

    # --- Review A (Mistral) ---
    ModelDeployment(
        key="review_a_l40s", name="Mistral Small 3.2 24B (L40S)",
        role="review_a",
        hf_model_id="mistralai/Mistral-Small-3.2-24B-Instruct-2506",
        local_equivalent="mistral-small3.2:24b",
        max_model_len=32768,
        **_L40S,
    ),

    # --- Review B (Gemma) ---
    ModelDeployment(
        key="review_b_l40s", name="Gemma 3 27B IT (L40S)",
        role="review_b",
        hf_model_id="google/gemma-3-27b-it", local_equivalent="gemma3:27b",
        max_model_len=32768,
        extra_env={"TRUST_REMOTE_CODE": "True"},
        **_L40S,
    ),

    # --- Rewrite ---
    ModelDeployment(
        key="rewrite_l40s", name="Qwen3.5 35B Rewrite (L40S)",
        role="rewrite",
        hf_model_id="Qwen/Qwen3.5-32B-AWQ", local_equivalent="qwen3.5:35b",
        max_model_len=32768, quantization="awq",
        **_L40S,
    ),
    ModelDeployment(
        key="rewrite_b200", name="Qwen3.5 122B Rewrite (B200)",
        role="rewrite",
        hf_model_id="Qwen/Qwen3.5-122B", local_equivalent="qwen3.5:122b",
        max_model_len=65536,
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
