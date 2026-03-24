"""RunPod serverless benchmark — configuration and test matrix.

Defines GPU configs, model mappings, and the test matrix for comparing
L40S (sub-40B models) vs B200 (full-size models) on RunPod serverless.
"""

import os
from dataclasses import dataclass, field
from enum import Enum


# ---------------------------------------------------------------------------
# GPU and model configuration
# ---------------------------------------------------------------------------

class GpuTier(Enum):
    L40S = "l40s"
    B200 = "b200"


@dataclass(frozen=True)
class GpuConfig:
    """A RunPod serverless endpoint bound to a specific GPU + model."""

    name: str
    tier: GpuTier
    endpoint_id: str
    cost_per_sec: float
    vram_gb: int
    max_model_len: int

    @property
    def cost_per_hr(self) -> float:
        return self.cost_per_sec * 3600


@dataclass(frozen=True)
class ModelConfig:
    """A model deployed to a RunPod endpoint."""

    hf_model_id: str
    local_equivalent: str   # Ollama model name for reference
    role: str               # generate_creative, generate_code, review_a, review_b, rewrite


@dataclass(frozen=True)
class Endpoint:
    """A RunPod endpoint = GPU + model."""

    gpu: GpuConfig
    model: ModelConfig


# ---------------------------------------------------------------------------
# Test case and result structures
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class TestCase:
    """A single test: one stage, one endpoint config, N repetitions."""

    stage: str          # vision, roadmap, content, tech_design, code_gen
    task_id: str        # from cascade definition
    endpoint: Endpoint
    num_runs: int
    phase: str          # A (smoke), B (coverage), C (rewrite)


@dataclass
class TimingData:
    """Timing captured from a single RunPod job."""

    cold_start_s: float = 0.0
    execution_s: float = 0.0
    total_s: float = 0.0
    billed_s: float = 0.0


@dataclass
class TokenData:
    """Token counts from a single generation."""

    prompt_tokens: int = 0
    completion_tokens: int = 0
    tok_per_sec: float = 0.0


@dataclass
class QualityData:
    """Quality evaluation results."""

    gates_passed: bool = False
    gate_results: dict = field(default_factory=dict)
    rubric_score: float | None = None
    rubric_verdict: str = ""


@dataclass
class RunResult:
    """Result of a single test run (one generation)."""

    attempt: int
    output: str
    timing: TimingData
    tokens: TokenData
    quality: QualityData
    cost_usd: float = 0.0


@dataclass
class TestResult:
    """Aggregated result of a TestCase (N runs)."""

    test_case: TestCase
    runs: list[RunResult] = field(default_factory=list)

    @property
    def gate_pass_rate(self) -> float:
        if not self.runs:
            return 0.0
        return sum(1 for r in self.runs if r.quality.gates_passed) / len(self.runs)

    @property
    def mean_tok_per_sec(self) -> float:
        rates = [r.tokens.tok_per_sec for r in self.runs if r.tokens.tok_per_sec > 0]
        return sum(rates) / len(rates) if rates else 0.0

    @property
    def total_cost(self) -> float:
        return sum(r.cost_usd for r in self.runs)

    @property
    def mean_execution_s(self) -> float:
        times = [r.timing.execution_s for r in self.runs if r.timing.execution_s > 0]
        return sum(times) / len(times) if times else 0.0


# ---------------------------------------------------------------------------
# Endpoint registry — populated from environment variables
# ---------------------------------------------------------------------------

def _env(name: str) -> str:
    """Read a required env var."""
    val = os.environ.get(name, "")
    if not val:
        raise EnvironmentError(f"Missing required env var: {name}")
    return val


def _env_opt(name: str, default: str = "") -> str:
    """Read an optional env var."""
    return os.environ.get(name, default)


def load_api_key() -> str:
    return _env("RUNPOD_API_KEY")


def load_endpoints() -> dict[str, Endpoint]:
    """Load endpoint configs from environment or manifest.

    Reads RUNPOD_ENDPOINT_<KEY> env vars (set by 'setup' command or manually)
    and pairs them with model metadata from the manifest.
    """
    try:
        from manifest import FLEET
        manifest_lookup = {d.key: d for d in FLEET}
    except ImportError:
        manifest_lookup = {}

    endpoints = {}

    for key, dep in manifest_lookup.items():
        env_name = f"RUNPOD_ENDPOINT_{key.upper()}"
        eid = _env_opt(env_name)
        if not eid:
            continue

        tier = GpuTier.L40S if dep.gpu_tier == "l40s" else GpuTier.B200
        endpoints[key] = Endpoint(
            gpu=GpuConfig(
                name=f"{dep.gpu_tier}-{dep.role}",
                tier=tier,
                endpoint_id=eid,
                cost_per_sec=dep.cost_per_sec,
                vram_gb=dep.vram_gb,
                max_model_len=dep.max_model_len,
            ),
            model=ModelConfig(
                hf_model_id=dep.hf_model_id,
                local_equivalent=dep.local_equivalent,
                role=dep.role,
            ),
        )

    return endpoints


# ---------------------------------------------------------------------------
# Test matrix builders
# ---------------------------------------------------------------------------

# Stages and their task IDs (from website_full.json cascade)
STAGE_TASKS: dict[str, list[str]] = {
    "vision": ["refine_idea"],
    "roadmap": ["sprint_roadmap"],
    "content": ["landing_page_copy", "site_structure", "brand_voice"],
    "tech_design": ["blueprint"],
    "code_gen": ["styles_css", "index_html", "product_html",
                 "pricing_html", "about_html", "early_access_html"],
}

# Which endpoint role handles which stages
STAGE_ROLES: dict[str, str] = {
    "vision": "generate_creative",
    "roadmap": "generate_creative",
    "content": "generate_creative",
    "tech_design": "generate_code",
    "code_gen": "generate_code",
}


def build_phase_a(endpoints: dict[str, Endpoint]) -> list[TestCase]:
    """Phase A: smoke test — vision only, 3 runs per endpoint."""
    cases = []
    for key in ("gen_creative_l40s", "gen_creative_b200"):
        if ep := endpoints.get(key):
            cases.append(TestCase(
                stage="vision", task_id="refine_idea",
                endpoint=ep, num_runs=3, phase="A",
            ))
    return cases


def build_phase_b(endpoints: dict[str, Endpoint],
                  timing_runs: int = 10,
                  quality_runs: int = 5) -> list[TestCase]:
    """Phase B: full stage coverage — all stages, both tiers."""
    cases = []
    for stage, tasks in STAGE_TASKS.items():
        role = STAGE_ROLES[stage]
        # Find matching endpoints by role
        for key, ep in endpoints.items():
            if ep.model.role != role:
                continue
            for task_id in tasks:
                cases.append(TestCase(
                    stage=stage, task_id=task_id,
                    endpoint=ep, num_runs=quality_runs, phase="B",
                ))
    return cases


def build_phase_c(endpoints: dict[str, Endpoint],
                  num_runs: int = 5) -> list[TestCase]:
    """Phase C: rewrite showdown — rewrite endpoints only.

    Actual test cases are built dynamically from Phase B failures,
    but this returns the rewrite endpoint configs for the harness.
    """
    cases = []
    for key in ("rewrite_l40s", "rewrite_b200"):
        if ep := endpoints.get(key):
            # Placeholder — real cases built from Phase B failures
            cases.append(TestCase(
                stage="rewrite", task_id="from_phase_b",
                endpoint=ep, num_runs=num_runs, phase="C",
            ))
    return cases
