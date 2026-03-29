#!/usr/bin/env python3
"""Unified analysis for distillation evaluation.

Reads A/B scores and Neko regression results, produces a final report.

Usage:
  python analyze_results.py
  python analyze_results.py --ab-scores outputs/ab_scores_XXXX.jsonl
"""

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

EVAL_DIR = Path(__file__).parent
OUTPUTS_DIR = EVAL_DIR / "outputs"
REPORTS_DIR = EVAL_DIR / "reports"

MODEL_A = "qwen3.5:122b"
MODEL_B = "opus_annie:122b"


def load_jsonl(path: Path) -> list[dict]:
    """Load a JSONL file."""
    entries = []
    if path.exists():
        with open(path) as f:
            for line in f:
                if line.strip():
                    entries.append(json.loads(line))
    return entries


def find_latest(pattern: str) -> Path | None:
    """Find the most recent file matching a glob pattern."""
    candidates = sorted(OUTPUTS_DIR.glob(pattern), reverse=True)
    return candidates[0] if candidates else None


def analyze_ab(scores: list[dict]) -> dict:
    """Analyze A/B comparison scores."""
    results = {
        "n": len(scores),
        "model_a": MODEL_A,
        "model_b": MODEL_B,
    }

    if not scores:
        return results

    # Aggregate totals
    totals_a, totals_b = [], []
    wins_a, wins_b, unknown = 0, 0, 0
    by_type = {}
    by_dimension = {}

    for s in scores:
        sa = s.get("scores_a", {})
        sb = s.get("scores_b", {})

        ta = sa.get("weighted_total", 0) if isinstance(sa, dict) else 0
        tb = sb.get("weighted_total", 0) if isinstance(sb, dict) else 0
        totals_a.append(ta)
        totals_b.append(tb)

        pref = s.get("preferred", "UNKNOWN")
        if pref == MODEL_A:
            wins_a += 1
        elif pref == MODEL_B:
            wins_b += 1
        else:
            unknown += 1

        # By type
        ptype = s.get("prompt_type", "unknown")
        by_type.setdefault(ptype, {"a": [], "b": [], "wins_a": 0, "wins_b": 0})
        by_type[ptype]["a"].append(ta)
        by_type[ptype]["b"].append(tb)
        if pref == MODEL_A:
            by_type[ptype]["wins_a"] += 1
        elif pref == MODEL_B:
            by_type[ptype]["wins_b"] += 1

        # By dimension
        for label, model_scores in [("a", sa), ("b", sb)]:
            if isinstance(model_scores, dict) and "scores" in model_scores:
                for dim, info in model_scores["scores"].items():
                    by_dimension.setdefault(dim, {"a": [], "b": []})
                    by_dimension[dim][label].append(info.get("score", 0))

    results["avg_a"] = sum(totals_a) / len(totals_a) if totals_a else 0
    results["avg_b"] = sum(totals_b) / len(totals_b) if totals_b else 0
    results["delta"] = results["avg_b"] - results["avg_a"]
    results["wins_a"] = wins_a
    results["wins_b"] = wins_b
    results["unknown"] = unknown
    results["by_type"] = {}

    for ptype, data in by_type.items():
        avg_a = sum(data["a"]) / len(data["a"]) if data["a"] else 0
        avg_b = sum(data["b"]) / len(data["b"]) if data["b"] else 0
        results["by_type"][ptype] = {
            "n": len(data["a"]),
            "avg_a": round(avg_a, 1),
            "avg_b": round(avg_b, 1),
            "delta": round(avg_b - avg_a, 1),
            "wins_a": data["wins_a"],
            "wins_b": data["wins_b"],
        }

    results["by_dimension"] = {}
    for dim, data in by_dimension.items():
        avg_a = sum(data["a"]) / len(data["a"]) if data["a"] else 0
        avg_b = sum(data["b"]) / len(data["b"]) if data["b"] else 0
        results["by_dimension"][dim] = {
            "avg_a": round(avg_a, 2),
            "avg_b": round(avg_b, 2),
            "delta": round(avg_b - avg_a, 2),
        }

    # Statistical test if scipy available
    try:
        from scipy import stats
        diffs = [b - a for a, b in zip(totals_a, totals_b)]
        if len(diffs) >= 5:
            t_stat, p_value = stats.ttest_rel(totals_b, totals_a)
            mean_diff = sum(diffs) / len(diffs)
            std_diff = (sum((d - mean_diff)**2 for d in diffs) / (len(diffs) - 1)) ** 0.5
            cohens_d = mean_diff / std_diff if std_diff > 0 else 0
            results["stats"] = {
                "t_stat": round(t_stat, 3),
                "p_value": round(p_value, 4),
                "cohens_d": round(cohens_d, 3),
                "significant": p_value < 0.05,
            }
    except ImportError:
        pass

    return results


def generate_report(ab_results: dict) -> str:
    """Generate markdown report."""
    lines = [
        f"# Distillation Evaluation Report",
        f"",
        f"**Date:** {datetime.now().strftime('%Y-%m-%d')}",
        f"**Models:** {MODEL_A} (base) vs {MODEL_B} (distilled)",
        f"",
        f"---",
        f"",
        f"## Layer 1: Creative A/B Head-to-Head",
        f"",
    ]

    if ab_results.get("n", 0) == 0:
        lines.append("No A/B scores available yet.")
    else:
        lines.extend([
            f"**Prompts evaluated:** {ab_results['n']}",
            f"",
            f"### Overall",
            f"",
            f"| Metric | Base ({MODEL_A}) | Distilled ({MODEL_B}) | Delta |",
            f"|--------|---------|-----------|-------|",
            f"| Average score | {ab_results['avg_a']:.1f} | {ab_results['avg_b']:.1f} | {ab_results['delta']:+.1f} |",
            f"| Judge preference | {ab_results['wins_a']} | {ab_results['wins_b']} | — |",
            f"",
        ])

        if "stats" in ab_results:
            s = ab_results["stats"]
            sig = "Yes" if s["significant"] else "No"
            lines.extend([
                f"### Statistical Test",
                f"",
                f"- Paired t-test: t={s['t_stat']}, p={s['p_value']}",
                f"- Cohen's d: {s['cohens_d']}",
                f"- Significant (p<0.05): {sig}",
                f"",
            ])

        if ab_results.get("by_type"):
            lines.extend([
                f"### By Prompt Type",
                f"",
                f"| Type | n | Base | Distilled | Delta | Wins B/A |",
                f"|------|---|------|-----------|-------|----------|",
            ])
            for ptype, data in sorted(ab_results["by_type"].items()):
                lines.append(
                    f"| {ptype} | {data['n']} | {data['avg_a']:.1f} | "
                    f"{data['avg_b']:.1f} | {data['delta']:+.1f} | "
                    f"{data['wins_b']}/{data['wins_a']} |"
                )
            lines.append("")

        if ab_results.get("by_dimension"):
            lines.extend([
                f"### By Dimension",
                f"",
                f"| Dimension | Base | Distilled | Delta |",
                f"|-----------|------|-----------|-------|",
            ])
            for dim, data in sorted(ab_results["by_dimension"].items()):
                lines.append(
                    f"| {dim} | {data['avg_a']:.2f} | "
                    f"{data['avg_b']:.2f} | {data['delta']:+.2f} |"
                )
            lines.append("")

    lines.extend([
        f"---",
        f"",
        f"## Layer 2: Neko Health Regression",
        f"",
        f"See `neko_regression.py --compare-only` for latest results.",
        f"",
        f"---",
        f"",
        f"## Interpretation Guide",
        f"",
        f"- **Delta > 0:** Distilled model scores higher (distillation helped)",
        f"- **Delta < 0:** Base model scores higher (distillation hurt or no effect)",
        f"- **Cohen's d:** <0.2 negligible, 0.2-0.5 small, 0.5-0.8 medium, >0.8 large",
        f"- **p < 0.05:** Statistically significant difference",
        f"- **Judge preference:** How often Mistral Small preferred one model's output",
    ])

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Analyze distillation eval results")
    parser.add_argument("--ab-scores", type=Path, default=None,
                        help="Path to A/B scores JSONL")
    args = parser.parse_args()

    # Find scores
    ab_path = args.ab_scores or find_latest("ab_scores_*.jsonl")
    ab_scores = load_jsonl(ab_path) if ab_path else []

    if ab_scores:
        print(f"Loaded {len(ab_scores)} A/B scores from {ab_path}")
    else:
        print("No A/B scores found")

    # Analyze
    ab_results = analyze_ab(ab_scores)

    # Generate report
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    report = generate_report(ab_results)
    report_path = REPORTS_DIR / f"distillation_eval_{datetime.now().strftime('%Y%m%d')}.md"
    with open(report_path, "w") as f:
        f.write(report)

    print(f"\nReport saved: {report_path}")
    print(report)


if __name__ == "__main__":
    main()
