"""Quality evaluation — gate checking and rubric score parsing.

Imports gate_runner from the Cold Anvil pipeline for structural checks.
Replicates the review score parser from forge_pipeline.py for rubric eval.
Review model calls go through the RunPod client (same L40S endpoints).
"""

import json
import logging
import re
import sys
from pathlib import Path

# Add Cold_Anvil to path so we can import gate_runner and config
_cold_anvil_root = Path(__file__).resolve().parent.parent.parent / "Cold_Anvil"
if str(_cold_anvil_root) not in sys.path:
    sys.path.insert(0, str(_cold_anvil_root))

from pipeline.gate_runner import run_gates, GateCheckResult  # noqa: E402
from pipeline.config import load_gates                        # noqa: E402

from config import QualityData                                # noqa: E402
import runpod_client                                          # noqa: E402

log = logging.getLogger("runpod_bench.evaluator")

FORGE_DIR = _cold_anvil_root / "forge"

# Review prompt — matches forge_pipeline.py REVIEW_PROMPT
REVIEW_PROMPT = """## Task
Review the following {task_type} output.

## Output to Review
{output_text}

## Instructions
1. List every problem you can find. Be specific — quote the problematic text.
2. Score each dimension below from 1-10 using the anchors provided.
3. For each score, quote the specific text from the output that justifies it.
4. Calculate the weighted total.

## Rubric
{rubric_body}

## Output Format
### Problems Found
- [problem 1 with quote]
- [problem 2 with quote]

### Dimension Scores
| Dimension | Score | Weight | Weighted | Evidence |
|-----------|-------|--------|----------|----------|
| ... | X/10 | /YY | ZZ | "quoted text" |

### Weighted Total: XX/100

### Verdict
[PASS / REVISE / REJECT] — [one sentence justification]
"""

# Rewrite prompt — matches forge_pipeline.py REWRITE_PROMPT
REWRITE_PROMPT = """## Task
Rewrite the following {task_type} output to fix the problems identified by review.

## Original Prompt
{original_prompt}

## Previous Output (needs fixing)
{previous_output}

## Review Feedback
{review_feedback}

## Instructions
Fix all identified problems. Maintain consistency with the project's other outputs.
Generate the complete corrected output — do not reference the original, produce it fresh.
"""


# ---------------------------------------------------------------------------
# Gate evaluation (local, no GPU needed)
# ---------------------------------------------------------------------------

def evaluate_gates(output: str, gate_task_type: str) -> QualityData:
    """Run structural gates on an output. Returns QualityData with gate results.

    gate_task_type: matches the "task_type" field in gates/*.json
    (e.g. "idea_refinement", "roadmap_generation", "file_generation").
    """
    gates = load_gates(FORGE_DIR, gate_task_type)

    result: GateCheckResult = run_gates(output, gates)

    gate_results = {}
    for gr in result.gates:
        gate_results[gr.name] = "pass" if gr.passed else "fail"

    return QualityData(
        gates_passed=result.passed,
        gate_results=gate_results,
    )


# ---------------------------------------------------------------------------
# Review score parsing (from forge_pipeline.py)
# ---------------------------------------------------------------------------

def parse_review_response(response_text: str) -> dict:
    """Extract structured review data from a model review response.

    Replicates parse_review_response from forge_pipeline.py.
    """
    result = {
        "scores": {},
        "weighted_total": 0.0,
        "verdict": "UNKNOWN",
        "problems": [],
        "raw": response_text,
    }

    # Extract problems
    problems_section = re.search(
        r"#{2,4}\s*Problems?\s*Found\s*(.*?)(?=#{2,4}\s|\Z)", response_text, re.DOTALL
    )
    if problems_section:
        result["problems"] = re.findall(
            r"^[-*]\s*(.+)$", problems_section.group(1), re.MULTILINE
        )

    # Extract dimension scores
    score_rows = re.findall(
        r"\|\s*\*?\*?([^|]+?)\*?\*?\s*\|\s*(\d+)/10\s*\|\s*/?(\d+)%?\s*\|\s*([\d.]+)\s*\|",
        response_text,
    )
    for dim, score, weight, weighted in score_rows:
        result["scores"][dim.strip()] = {
            "score": int(score),
            "weight": int(weight),
            "weighted": float(weighted),
        }

    # Extract weighted total
    total_match = re.search(r"Weighted Total:\s*([\d.]+)/100", response_text)
    if total_match:
        result["weighted_total"] = float(total_match.group(1))
    elif result["scores"]:
        result["weighted_total"] = sum(
            s["weighted"] for s in result["scores"].values()
        )

    # Sanity check — correct arithmetic errors from models
    if result["scores"] and (result["weighted_total"] < 10 or result["weighted_total"] > 100):
        recalc = sum(
            s["score"] * s["weight"] for s in result["scores"].values()
        ) / 10
        log.warning(
            "Review weighted_total %.2f out of range — recalculated: %.1f",
            result["weighted_total"], recalc,
        )
        result["weighted_total"] = min(recalc, 100.0)

    # Extract verdict
    verdict_section = re.search(
        r"#{2,4}\s*Verdict[:\s]*(.*?)(?=#{2,4}\s|\Z)", response_text, re.DOTALL
    )
    search_text = verdict_section.group(1) if verdict_section else response_text[-500:]
    verdict_match = re.search(r"\b(PASS|REVISE|REJECT)\b", search_text)
    if verdict_match:
        result["verdict"] = verdict_match.group(1)

    return result


# ---------------------------------------------------------------------------
# Model review (calls RunPod review endpoints)
# ---------------------------------------------------------------------------

def run_model_review(output_text: str, task_type: str, rubric_name: str,
                     endpoint_id: str, api_key: str) -> dict:
    """Run a model review of generated output via RunPod.

    Loads the rubric from forge/rubrics/, formats the review prompt,
    calls the review endpoint, and parses the response.

    Returns parsed review dict with scores, verdict, problems.
    """
    # Load rubric
    rubric_path = FORGE_DIR / "rubrics" / f"{rubric_name}.md"
    if not rubric_path.exists():
        rubric_path = FORGE_DIR / "rubrics" / rubric_name
    if not rubric_path.exists():
        log.warning("Rubric not found: %s — skipping model review", rubric_name)
        return {"scores": {}, "weighted_total": 0.0, "verdict": "SKIPPED",
                "problems": [], "raw": ""}

    rubric_body = rubric_path.read_text()

    prompt = REVIEW_PROMPT.format(
        task_type=task_type,
        output_text=output_text,
        rubric_body=rubric_body,
    )

    result = runpod_client.generate(
        endpoint_id, api_key, prompt,
        max_tokens=4096, temperature=0.3,
    )

    if result.status != "COMPLETED":
        log.error("Review call failed: %s", result.error)
        return {"scores": {}, "weighted_total": 0.0, "verdict": "ERROR",
                "problems": [], "raw": result.error}

    return parse_review_response(result.output)


def run_rewrite(original_prompt: str, previous_output: str,
                review_feedback: str, task_type: str,
                endpoint_id: str, api_key: str,
                max_tokens: int = 8192,
                temperature: float = 0.6) -> runpod_client.JobResult:
    """Run a rewrite of a failed output via RunPod.

    Formats the rewrite prompt with original prompt, failed output,
    and review feedback, then calls the rewrite endpoint.
    """
    prompt = REWRITE_PROMPT.format(
        task_type=task_type,
        original_prompt=original_prompt,
        previous_output=previous_output,
        review_feedback=review_feedback,
    )

    return runpod_client.generate(
        endpoint_id, api_key, prompt,
        max_tokens=max_tokens, temperature=temperature,
    )


# ---------------------------------------------------------------------------
# Rubric mapping — which rubric to use for which gate/stage
# ---------------------------------------------------------------------------

# Maps gate names to rubric names (gate and rubric names often match)
GATE_TO_RUBRIC: dict[str, str] = {
    "idea_refinement": "idea_refinement",
    "roadmap_generation": "roadmap_generation",
    "copy_generation": "copy_generation",
    "creative_output": "creative_output",
    "tech_design": "tech_design",
    "file_generation": "code",
}

# Maps task_type values to rubric task_type labels
TASK_TYPE_LABELS: dict[str, str] = {
    "creative": "creative",
    "code": "code",
}
