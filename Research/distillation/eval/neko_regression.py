#!/usr/bin/env python3
"""Neko health regression check for distilled model.

Compares opus_annie:122b against the locked baseline (qwen3.5:122b):
  - Member summary: 86.2/100, 95% PASS
  - Clinician pre-brief: 77.6/100, 60% PASS

This is a thin wrapper that:
  1. Runs Neko's 06_generate.py with opus_annie:122b
  2. Runs Neko's 07_evaluate.py on the outputs
  3. Loads baseline scores and compares

Prerequisites:
  - Fix _needs_thinking_enabled in Neko's 06_generate.py (add "opus_annie")
  - Annuminas running opus_annie:122b
  - Anduril (or Annuminas) running Mistral Small for judging

Usage:
  # Full run (generate + evaluate + compare)
  python neko_regression.py

  # Compare only (from existing eval scores)
  python neko_regression.py --compare-only

  # Custom hosts
  python neko_regression.py --gen-host http://annuminas:11434 --judge-host http://anduril:11434
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path
from datetime import datetime

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

NEKO_DIR = Path("/home/jack/Neko_Demo")
PIPELINE_DIR = NEKO_DIR / "pipeline"
OUTPUTS_DIR = NEKO_DIR / "forge" / "outputs"

MODEL = "opus_annie:122b"
JUDGE_MODEL = "mistral-small3.2:24b-instruct-2506-fp16"

DEFAULT_GEN_HOST = "http://annuminas:11434"
DEFAULT_JUDGE_HOST = "http://anduril:11434"

# Baseline scores (locked — from qwen3.5:122b, n=193)
BASELINE = {
    "member_summary": {"mean": 86.2, "pass_rate": 0.95, "n": 193},
    "clinician_prebrief": {"mean": 77.6, "pass_rate": 0.60, "n": 193},
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def find_baseline_scores(product: str) -> Path | None:
    """Find the baseline eval score file for a product."""
    pattern = f"eval_scores_{product}_*.jsonl"
    candidates = sorted(OUTPUTS_DIR.glob(pattern))
    # Baseline files are the ones NOT containing "opus_annie"
    baselines = [c for c in candidates if "opus_annie" not in c.name]
    return baselines[-1] if baselines else None


def find_new_scores(product: str) -> Path | None:
    """Find the opus_annie eval score file for a product."""
    pattern = f"eval_scores_{product}_*opus_annie*.jsonl"
    candidates = sorted(OUTPUTS_DIR.glob(pattern))
    if candidates:
        return candidates[-1]
    # Also check for files generated after the last baseline
    pattern = f"eval_scores_{product}_*.jsonl"
    candidates = sorted(OUTPUTS_DIR.glob(pattern))
    # The most recent one might be the new one
    if len(candidates) >= 2:
        return candidates[-1]
    return None


def load_scores(path: Path) -> list[dict]:
    """Load eval scores from JSONL."""
    scores = []
    with open(path) as f:
        for line in f:
            if line.strip():
                scores.append(json.loads(line))
    return scores


def run_command(cmd: list[str], description: str) -> bool:
    """Run a command and stream output."""
    print(f"\n  {description}")
    print(f"  $ {' '.join(cmd)}\n")
    result = subprocess.run(cmd, cwd=str(NEKO_DIR))
    if result.returncode != 0:
        print(f"  FAILED (exit code {result.returncode})")
        return False
    return True


# ---------------------------------------------------------------------------
# Generate
# ---------------------------------------------------------------------------


def generate(gen_host: str) -> bool:
    """Run Neko generation with opus_annie."""
    # Check the fix is in place
    gen_script = PIPELINE_DIR / "06_generate.py"
    with open(gen_script) as f:
        content = f.read()
    if "opus_annie" not in content:
        print("  ERROR: _needs_thinking_enabled fix not applied!")
        print(f"  Edit {gen_script} line ~374:")
        print('    Add "opus_annie" to the return condition')
        return False

    return run_command([
        sys.executable, str(PIPELINE_DIR / "06_generate.py"),
        "--split", "eval",
        "--product", "both",
        "--model", MODEL,
        "--host", gen_host,
    ], f"Generating with {MODEL} on {gen_host}")


# ---------------------------------------------------------------------------
# Evaluate
# ---------------------------------------------------------------------------


def evaluate(judge_host: str) -> bool:
    """Run Neko evaluation on opus_annie outputs."""
    success = True

    for product in ["member_summary", "clinician_prebrief"]:
        # Find the output file
        pattern = f"baseline_eval_{product}_*opus_annie*.jsonl"
        outputs = sorted(OUTPUTS_DIR.glob(pattern))
        if not outputs:
            # Try broader pattern
            pattern = f"*{product}*opus_annie*.jsonl"
            outputs = sorted(OUTPUTS_DIR.glob(pattern))
            outputs = [o for o in outputs if "eval_scores" not in o.name]

        if not outputs:
            print(f"  No outputs found for {product} — skipping evaluation")
            success = False
            continue

        input_file = outputs[-1]
        ok = run_command([
            sys.executable, str(PIPELINE_DIR / "07_evaluate.py"),
            "--input", str(input_file),
            "--product", product,
            "--judge-host", judge_host,
        ], f"Evaluating {product} from {input_file.name}")

        if not ok:
            success = False

    return success


# ---------------------------------------------------------------------------
# Compare
# ---------------------------------------------------------------------------


def compare():
    """Compare opus_annie scores against baseline."""
    print(f"\n{'='*60}")
    print(f"  NEKO REGRESSION CHECK")
    print(f"  {MODEL} vs baseline (qwen3.5:122b)")
    print(f"{'='*60}\n")

    for product in ["member_summary", "clinician_prebrief"]:
        baseline_ref = BASELINE[product]
        new_path = find_new_scores(product)

        if not new_path:
            print(f"  {product}: no eval scores found for opus_annie")
            continue

        new_scores = load_scores(new_path)
        if not new_scores:
            print(f"  {product}: empty scores file")
            continue

        # Aggregate
        totals = [s.get("weighted_total", 0) for s in new_scores if s.get("weighted_total", 0) > 0]
        verdicts = [s.get("verdict", "UNKNOWN") for s in new_scores]

        if not totals:
            print(f"  {product}: no valid scores")
            continue

        new_mean = sum(totals) / len(totals)
        new_pass_rate = verdicts.count("PASS") / len(verdicts)
        n = len(totals)
        delta = new_mean - baseline_ref["mean"]

        print(f"  {product} (n={n}):")
        print(f"    Baseline:     {baseline_ref['mean']:.1f}/100  "
              f"({baseline_ref['pass_rate']*100:.0f}% PASS)")
        print(f"    opus_annie:   {new_mean:.1f}/100  "
              f"({new_pass_rate*100:.0f}% PASS)")
        print(f"    Delta:        {delta:+.1f}")

        # Simple regression check
        if delta < -3:
            print(f"    RESULT: REGRESSION (>{3:.0f} point drop)")
        elif delta < 0:
            print(f"    RESULT: MINOR DIP (within tolerance)")
        elif delta > 0:
            print(f"    RESULT: IMPROVEMENT")
        else:
            print(f"    RESULT: NO CHANGE")

        # Per-dimension breakdown if available
        dim_scores = {}
        for s in new_scores:
            for dim, info in s.get("scores", {}).items():
                dim_scores.setdefault(dim, []).append(info.get("score", 0))

        if dim_scores:
            print(f"    Per dimension:")
            for dim, vals in sorted(dim_scores.items()):
                avg = sum(vals) / len(vals)
                print(f"      {dim:35s}: {avg:.1f}/10")

        # Verdict distribution
        print(f"    Verdicts: PASS={verdicts.count('PASS')} "
              f"REVISE={verdicts.count('REVISE')} "
              f"REJECT={verdicts.count('REJECT')} "
              f"UNKNOWN={verdicts.count('UNKNOWN')}")
        print()

    # Try statistical comparison if we have paired data
    baseline_path_ms = find_baseline_scores("member_summary")
    new_path_ms = find_new_scores("member_summary")
    if baseline_path_ms and new_path_ms:
        try:
            _paired_comparison(baseline_path_ms, new_path_ms, "member_summary")
        except Exception as e:
            print(f"  Statistical comparison failed: {e}")


def _paired_comparison(baseline_path: Path, new_path: Path, product: str):
    """Run paired statistical tests if scipy is available."""
    try:
        from scipy import stats
    except ImportError:
        print("  (scipy not installed — skipping statistical tests)")
        return

    baseline = load_scores(baseline_path)
    new = load_scores(new_path)

    # Match by member_id
    baseline_by_id = {s.get("member_id", s.get("profile_id", i)): s
                      for i, s in enumerate(baseline)}
    new_by_id = {s.get("member_id", s.get("profile_id", i)): s
                 for i, s in enumerate(new)}

    paired_ids = set(baseline_by_id.keys()) & set(new_by_id.keys())
    if len(paired_ids) < 10:
        print(f"  Only {len(paired_ids)} paired profiles — too few for statistical test")
        return

    baseline_totals = [baseline_by_id[pid].get("weighted_total", 0) for pid in sorted(paired_ids)]
    new_totals = [new_by_id[pid].get("weighted_total", 0) for pid in sorted(paired_ids)]

    # Paired t-test
    t_stat, p_value = stats.ttest_rel(new_totals, baseline_totals)

    # Effect size (Cohen's d for paired samples)
    diffs = [n - b for n, b in zip(new_totals, baseline_totals)]
    mean_diff = sum(diffs) / len(diffs)
    std_diff = (sum((d - mean_diff)**2 for d in diffs) / (len(diffs) - 1)) ** 0.5
    cohens_d = mean_diff / std_diff if std_diff > 0 else 0

    print(f"  Statistical comparison ({product}, n={len(paired_ids)} paired):")
    print(f"    Paired t-test: t={t_stat:.3f}, p={p_value:.4f}")
    print(f"    Cohen's d: {cohens_d:.3f}", end="")
    if abs(cohens_d) < 0.2:
        print(" (negligible)")
    elif abs(cohens_d) < 0.5:
        print(" (small)")
    elif abs(cohens_d) < 0.8:
        print(" (medium)")
    else:
        print(" (large)")

    if p_value < 0.05:
        direction = "improvement" if mean_diff > 0 else "regression"
        print(f"    SIGNIFICANT {direction} (p < 0.05)")
    else:
        print(f"    No significant difference (p = {p_value:.4f})")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main():
    parser = argparse.ArgumentParser(
        description="Neko health regression check for distilled model"
    )
    parser.add_argument("--gen-host", default=DEFAULT_GEN_HOST)
    parser.add_argument("--judge-host", default=DEFAULT_JUDGE_HOST)
    parser.add_argument("--compare-only", action="store_true",
                        help="Skip generation and evaluation, just compare")
    parser.add_argument("--skip-generate", action="store_true",
                        help="Skip generation, run evaluation and comparison")
    args = parser.parse_args()

    if args.compare_only:
        compare()
        return

    if not args.skip_generate:
        print("--- Phase 1: Generation ---")
        if not generate(args.gen_host):
            print("Generation failed. Fix the issue and retry.")
            sys.exit(1)

    print("\n--- Phase 2: Evaluation ---")
    if not evaluate(args.judge_host):
        print("Evaluation had errors. Check output above.")

    print("\n--- Phase 3: Comparison ---")
    compare()


if __name__ == "__main__":
    main()
