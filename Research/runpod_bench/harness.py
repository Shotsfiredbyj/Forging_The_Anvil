"""RunPod serverless benchmark — test harness.

Loads forge config packs, assembles prompts, runs test cases through
RunPod endpoints, evaluates outputs with gates + optional model review,
and logs everything as JSONL.

Usage:
    python -m runpod_bench.harness --phase A
    python -m runpod_bench.harness --phase B
    python -m runpod_bench.harness --phase C
"""

import argparse
import json
import logging
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import config as cfg
import evaluator
import runpod_client

log = logging.getLogger("runpod_bench.harness")

FORGE_DIR = Path(__file__).resolve().parent.parent.parent / "Cold_Anvil" / "forge"
FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures"
RESULTS_DIR = Path(__file__).resolve().parent / "results"

# Stage reference pattern (from cascade.py)
STAGE_REF = re.compile(r"\{stage\.(\d+)\.([a-zA-Z0-9_]+)\}")


# ---------------------------------------------------------------------------
# Forge config loading
# ---------------------------------------------------------------------------

def load_project_data() -> dict:
    """Load project.json from the forge directory."""
    with open(FORGE_DIR / "project.json") as f:
        return json.load(f)


def load_cascade(name: str = "website_full") -> dict:
    """Load a cascade definition."""
    with open(FORGE_DIR / "cascades" / f"{name}.json") as f:
        return json.load(f)


def read_prompt(name: str) -> str:
    """Read a prompt template from forge/prompts/."""
    prompts_dir = FORGE_DIR / "prompts"
    for candidate in [name, f"{name}.md"]:
        path = prompts_dir / candidate
        if path.is_file():
            return path.read_text()
    raise FileNotFoundError(f"Prompt not found: {name} in {prompts_dir}")


def substitute_variables(template: str, variables: dict) -> str:
    """Replace {variable} placeholders in a prompt template."""
    prompt = template
    for key, val in variables.items():
        prompt = prompt.replace(f"{{{key}}}", str(val))
    return prompt


# ---------------------------------------------------------------------------
# Fixture loading
# ---------------------------------------------------------------------------

def load_fixtures() -> dict[int, dict[str, str]]:
    """Load stage output fixtures for inter-stage dependencies.

    Fixtures are stored as:
        fixtures/stage_1/refine_idea.txt
        fixtures/stage_2/sprint_roadmap.txt
        etc.

    Returns: {stage_num: {task_id: output_text}}
    """
    fixtures: dict[int, dict[str, str]] = {}
    if not FIXTURES_DIR.exists():
        log.warning("No fixtures directory at %s", FIXTURES_DIR)
        return fixtures

    for stage_dir in sorted(FIXTURES_DIR.iterdir()):
        if not stage_dir.is_dir() or not stage_dir.name.startswith("stage_"):
            continue
        stage_num = int(stage_dir.name.split("_")[1])
        fixtures[stage_num] = {}
        for f in stage_dir.iterdir():
            if f.is_file():
                task_id = f.stem
                fixtures[stage_num][task_id] = f.read_text()
                log.info("Loaded fixture: stage %d / %s (%d chars)",
                         stage_num, task_id, len(fixtures[stage_num][task_id]))
    return fixtures


def resolve_stage_refs(variables: dict, fixtures: dict[int, dict[str, str]]) -> dict:
    """Replace {stage.N.task_id} references with fixture data."""
    resolved = {}
    for key, value in variables.items():
        if not isinstance(value, str):
            resolved[key] = value
            continue

        def replacer(match):
            stage_num = int(match.group(1))
            task_id = match.group(2)
            outputs = fixtures.get(stage_num, {})
            if task_id in outputs:
                return outputs[task_id]
            log.warning("Missing fixture: stage %d / %s", stage_num, task_id)
            return match.group(0)

        resolved[key] = STAGE_REF.sub(replacer, value)
    return resolved


# ---------------------------------------------------------------------------
# Task definition lookup
# ---------------------------------------------------------------------------

def find_task_def(cascade: dict, stage_name: str, task_id: str) -> tuple[dict, dict]:
    """Find a task definition in the cascade by stage name and task_id.

    Returns (stage_def, task_def). For stages that use a batch reference
    (like vision), loads the batch file.
    """
    for stage in cascade["stages"]:
        if stage["name"] != stage_name:
            continue

        # Some stages reference a batch instead of inline tasks
        if "batch" in stage:
            batch_path = FORGE_DIR / "batches" / f"{stage['batch']}.json"
            with open(batch_path) as f:
                batch = json.load(f)
            for task in batch.get("tasks", []):
                if task["task_id"] == task_id:
                    return stage, task

        # Inline tasks
        for task in stage.get("tasks", []):
            if task["task_id"] == task_id:
                return stage, task

    raise ValueError(f"Task not found: {stage_name}/{task_id}")


# ---------------------------------------------------------------------------
# Prompt assembly
# ---------------------------------------------------------------------------

def assemble_prompt(task_def: dict, fixtures: dict[int, dict[str, str]]) -> str:
    """Assemble a full prompt from a task definition.

    1. Read the prompt template
    2. Resolve {stage.N.task_id} references in variables using fixtures
    3. Substitute variables into the template
    """
    prompt_template = read_prompt(task_def["prompt"])
    variables = task_def.get("variables", {})
    resolved_vars = resolve_stage_refs(variables, fixtures)
    return substitute_variables(prompt_template, resolved_vars)


# ---------------------------------------------------------------------------
# JSONL logging
# ---------------------------------------------------------------------------

def log_result(run_id: str, test_case: cfg.TestCase, attempt: int,
               job_result: runpod_client.JobResult, quality: cfg.QualityData,
               cost_usd: float):
    """Append a result entry to the JSONL log."""
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    entry = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "run_id": run_id,
        "phase": test_case.phase,
        "stage": test_case.stage,
        "task_id": test_case.task_id,
        "gpu": test_case.endpoint.gpu.name,
        "gpu_tier": test_case.endpoint.gpu.tier.value,
        "model": test_case.endpoint.model.local_equivalent,
        "model_role": test_case.endpoint.model.role,
        "attempt": attempt,
        "timing": {
            "cold_start_s": job_result.delay_s,
            "execution_s": job_result.execution_s,
            "total_s": job_result.total_s,
        },
        "tokens": {
            "output_len": len(job_result.output),
        },
        "quality": {
            "gates_passed": quality.gates_passed,
            "gate_results": quality.gate_results,
            "rubric_score": quality.rubric_score,
            "rubric_verdict": quality.rubric_verdict,
        },
        "cost_usd": cost_usd,
        "status": job_result.status,
        "error": job_result.error,
    }
    log_path = RESULTS_DIR / f"{run_id}.jsonl"
    with open(log_path, "a") as f:
        f.write(json.dumps(entry) + "\n")


def save_output(run_id: str, stage: str, task_id: str,
                gpu_tier: str, attempt: int, output: str):
    """Save raw output text for later analysis."""
    out_dir = RESULTS_DIR / run_id / "outputs" / f"{stage}_{task_id}" / gpu_tier
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"attempt_{attempt}.txt"
    path.write_text(output)


# ---------------------------------------------------------------------------
# Test execution
# ---------------------------------------------------------------------------

def run_test_case(test_case: cfg.TestCase, api_key: str,
                  cascade: dict, fixtures: dict[int, dict[str, str]],
                  run_id: str, review_endpoints: dict | None = None,
                  ) -> cfg.TestResult:
    """Run a single test case: N generations with gate evaluation.

    Args:
        test_case: What to test
        api_key: RunPod API key
        cascade: Loaded cascade definition
        fixtures: Stage output fixtures
        run_id: Unique run identifier
        review_endpoints: Optional dict of review endpoint IDs for model review
    """
    endpoint = test_case.endpoint
    ep_id = endpoint.gpu.endpoint_id

    # Find and assemble the prompt
    stage_def, task_def = find_task_def(cascade, test_case.stage, test_case.task_id)
    prompt = assemble_prompt(task_def, fixtures)
    max_tokens = task_def.get("max_tokens", 8192)
    temperature = task_def.get("temperature", 0.6)

    # Determine gate name for evaluation
    gate_names = task_def.get("gates", [])
    gate_task_type = gate_names[0] if gate_names else None

    log.info("Running: stage=%s task=%s endpoint=%s runs=%d",
             test_case.stage, test_case.task_id, endpoint.gpu.name, test_case.num_runs)

    result = cfg.TestResult(test_case=test_case)

    for i in range(test_case.num_runs):
        attempt = i + 1
        log.info("  Attempt %d/%d", attempt, test_case.num_runs)

        job = runpod_client.generate(
            ep_id, api_key, prompt,
            max_tokens=max_tokens, temperature=temperature,
        )

        # Calculate cost
        cost_usd = job.execution_s * endpoint.gpu.cost_per_sec

        # Evaluate gates
        quality = cfg.QualityData()
        if gate_task_type and job.status == "COMPLETED" and job.output:
            quality = evaluator.evaluate_gates(job.output, gate_task_type)

        # Optional model review (Phase B+ only)
        if (review_endpoints and job.status == "COMPLETED" and job.output
                and gate_task_type):
            rubric_name = evaluator.GATE_TO_RUBRIC.get(gate_task_type)
            task_type = task_def.get("task_type", "creative")
            if rubric_name:
                for review_key in ("review_a_l40s", "review_b_l40s"):
                    rev_ep_id = review_endpoints.get(review_key)
                    if rev_ep_id:
                        review = evaluator.run_model_review(
                            job.output, task_type, rubric_name,
                            rev_ep_id, api_key,
                        )
                        if quality.rubric_score is None:
                            quality.rubric_score = review.get("weighted_total", 0.0)
                            quality.rubric_verdict = review.get("verdict", "")

        # Build run result
        run_result = cfg.RunResult(
            attempt=attempt,
            output=job.output,
            timing=cfg.TimingData(
                cold_start_s=job.delay_s,
                execution_s=job.execution_s,
                total_s=job.total_s,
                billed_s=job.execution_s,  # RunPod bills execution time
            ),
            tokens=cfg.TokenData(
                completion_tokens=len(job.output.split()),  # rough estimate
            ),
            quality=quality,
            cost_usd=cost_usd,
        )
        result.runs.append(run_result)

        # Log and save
        log_result(run_id, test_case, attempt, job, quality, cost_usd)
        if job.output:
            save_output(run_id, test_case.stage, test_case.task_id,
                        endpoint.gpu.tier.value, attempt, job.output)

        log.info("  Done: status=%s exec=%.1fs cost=$%.4f gates=%s",
                 job.status, job.execution_s, cost_usd,
                 "PASS" if quality.gates_passed else "FAIL")

    log.info("Complete: stage=%s task=%s gate_pass_rate=%.0f%% total_cost=$%.4f",
             test_case.stage, test_case.task_id,
             result.gate_pass_rate * 100, result.total_cost)

    return result


# ---------------------------------------------------------------------------
# Phase runners
# ---------------------------------------------------------------------------

def run_phase_a(api_key: str, endpoints: dict[str, cfg.Endpoint]) -> list[cfg.TestResult]:
    """Phase A: smoke test — vision only, 3 runs per endpoint."""
    run_id = f"phase_a_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"
    cascade = load_cascade()
    fixtures = load_fixtures()
    cases = cfg.build_phase_a(endpoints)

    if not cases:
        log.error("No endpoints configured for Phase A")
        return []

    log.info("=== Phase A: Smoke Test (%d cases) ===", len(cases))
    results = []
    for case in cases:
        result = run_test_case(case, api_key, cascade, fixtures, run_id)
        results.append(result)

    _print_summary(results)
    return results


def run_phase_b(api_key: str, endpoints: dict[str, cfg.Endpoint]) -> list[cfg.TestResult]:
    """Phase B: full stage coverage with optional model review."""
    run_id = f"phase_b_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"
    cascade = load_cascade()
    fixtures = load_fixtures()
    cases = cfg.build_phase_b(endpoints)

    if not cases:
        log.error("No endpoints configured for Phase B")
        return []

    # Collect review endpoint IDs
    review_eps = {}
    for key in ("review_a_l40s", "review_b_l40s"):
        if ep := endpoints.get(key):
            review_eps[key] = ep.gpu.endpoint_id

    log.info("=== Phase B: Stage Coverage (%d cases, reviews=%s) ===",
             len(cases), bool(review_eps))
    results = []
    for case in cases:
        result = run_test_case(case, api_key, cascade, fixtures, run_id,
                               review_endpoints=review_eps)
        results.append(result)

    _print_summary(results)
    return results


def run_phase_c(api_key: str, endpoints: dict[str, cfg.Endpoint],
                phase_b_results_path: str | None = None) -> list[cfg.TestResult]:
    """Phase C: rewrite showdown.

    Takes failed outputs from Phase B and rewrites them with both
    35B (L40S) and 122B (B200) rewrite endpoints.
    """
    run_id = f"phase_c_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"
    cascade = load_cascade()
    fixtures = load_fixtures()

    # Load Phase B failures
    failures = _load_phase_b_failures(phase_b_results_path)
    if not failures:
        log.warning("No Phase B failures found — nothing to rewrite")
        return []

    rewrite_endpoints = {}
    for key in ("rewrite_l40s", "rewrite_b200"):
        if ep := endpoints.get(key):
            rewrite_endpoints[key] = ep

    if not rewrite_endpoints:
        log.error("No rewrite endpoints configured for Phase C")
        return []

    # Review endpoints for evaluating rewrites
    review_eps = {}
    for key in ("review_a_l40s", "review_b_l40s"):
        if ep := endpoints.get(key):
            review_eps[key] = ep.gpu.endpoint_id

    log.info("=== Phase C: Rewrite Showdown (%d failures, %d rewrite endpoints) ===",
             len(failures), len(rewrite_endpoints))

    results = []
    for failure in failures:
        stage = failure["stage"]
        task_id = failure["task_id"]
        failed_output = failure["output"]
        original_prompt = failure.get("prompt", "")

        # Get review feedback (run a quick review if not cached)
        review_feedback = failure.get("review_feedback", "")
        if not review_feedback and review_eps:
            # Use first available review endpoint
            rev_key = next(iter(review_eps))
            gate_task_type = failure.get("gate_task_type", "")
            rubric_name = evaluator.GATE_TO_RUBRIC.get(gate_task_type, "")
            if rubric_name:
                review = evaluator.run_model_review(
                    failed_output, failure.get("task_type", "creative"),
                    rubric_name, review_eps[rev_key], api_key,
                )
                review_feedback = review.get("raw", "")

        # Rewrite with each endpoint
        for rw_key, rw_ep in rewrite_endpoints.items():
            log.info("  Rewriting %s/%s with %s", stage, task_id, rw_key)
            task_type = failure.get("task_type", "creative")

            for attempt in range(1, 6):  # 5 rewrites each
                rw_result = evaluator.run_rewrite(
                    original_prompt, failed_output, review_feedback,
                    task_type, rw_ep.gpu.endpoint_id, api_key,
                )

                cost_usd = rw_result.execution_s * rw_ep.gpu.cost_per_sec
                quality = cfg.QualityData()
                gate_task_type = failure.get("gate_task_type", "")
                if gate_task_type and rw_result.status == "COMPLETED":
                    quality = evaluator.evaluate_gates(rw_result.output, gate_task_type)

                # Log
                dummy_case = cfg.TestCase(
                    stage=stage, task_id=task_id,
                    endpoint=rw_ep, num_runs=1, phase="C",
                )
                log_result(run_id, dummy_case, attempt, rw_result, quality, cost_usd)
                if rw_result.output:
                    save_output(run_id, stage, task_id,
                                f"rewrite_{rw_ep.gpu.tier.value}", attempt,
                                rw_result.output)

    return results


def _load_phase_b_failures(results_path: str | None) -> list[dict]:
    """Load failed outputs from Phase B JSONL results."""
    failures = []
    if not results_path:
        # Find most recent Phase B results
        for p in sorted(RESULTS_DIR.glob("phase_b_*.jsonl"), reverse=True):
            results_path = str(p)
            break

    if not results_path or not Path(results_path).exists():
        return failures

    with open(results_path) as f:
        for line in f:
            entry = json.loads(line)
            if not entry.get("quality", {}).get("gates_passed", True):
                # Load the raw output
                stage = entry["stage"]
                task_id = entry["task_id"]
                tier = entry["gpu_tier"]
                attempt = entry["attempt"]
                output_path = (RESULTS_DIR / Path(results_path).stem / "outputs"
                               / f"{stage}_{task_id}" / tier / f"attempt_{attempt}.txt")
                if output_path.exists():
                    failures.append({
                        "stage": stage,
                        "task_id": task_id,
                        "task_type": entry.get("model_role", "creative").replace("generate_", ""),
                        "gate_task_type": next(iter(entry.get("quality", {}).get("gate_results", {})), ""),
                        "output": output_path.read_text(),
                    })
    return failures


# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

def _print_summary(results: list[cfg.TestResult]):
    """Print a summary table of results."""
    print("\n" + "=" * 80)
    print(f"{'Stage':<14} {'Task':<20} {'GPU':<16} {'Pass%':>6} {'Tok/s':>7} "
          f"{'Exec(s)':>8} {'Cost':>8}")
    print("-" * 80)
    for r in results:
        tc = r.test_case
        print(f"{tc.stage:<14} {tc.task_id:<20} {tc.endpoint.gpu.name:<16} "
              f"{r.gate_pass_rate*100:>5.0f}% {r.mean_tok_per_sec:>7.1f} "
              f"{r.mean_execution_s:>8.1f} ${r.total_cost:>7.4f}")
    print("=" * 80)
    total_cost = sum(r.total_cost for r in results)
    print(f"Total cost: ${total_cost:.4f}")
    print()


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="RunPod serverless benchmark harness")
    parser.add_argument("--phase", choices=["A", "B", "C"], required=True,
                        help="Test phase to run")
    parser.add_argument("--phase-b-results", type=str, default=None,
                        help="Path to Phase B results JSONL (for Phase C)")
    parser.add_argument("--verbose", "-v", action="store_true")
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(name)s %(levelname)s %(message)s",
    )

    api_key = cfg.load_api_key()
    endpoints = cfg.load_endpoints()

    if not endpoints:
        log.error("No RunPod endpoints configured. Set RUNPOD_ENDPOINT_* env vars.")
        sys.exit(1)

    log.info("Loaded %d endpoints: %s", len(endpoints), list(endpoints.keys()))

    if args.phase == "A":
        run_phase_a(api_key, endpoints)
    elif args.phase == "B":
        run_phase_b(api_key, endpoints)
    elif args.phase == "C":
        run_phase_c(api_key, endpoints, args.phase_b_results)


if __name__ == "__main__":
    main()
