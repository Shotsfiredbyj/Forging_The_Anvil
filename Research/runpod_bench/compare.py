"""Results analysis — compare RunPod serverless performance across GPU tiers.

Reads JSONL results from harness runs and produces:
1. Per-stage comparison tables (L40S vs B200)
2. Rewrite quality comparison (Phase C)
3. Cost projections at various customer counts
4. Statistical summaries

Usage:
    python -m runpod_bench.compare results/phase_b_20260324_143000.jsonl
    python -m runpod_bench.compare --all
"""

import argparse
import json
import logging
import statistics
import sys
from collections import defaultdict
from pathlib import Path

log = logging.getLogger("runpod_bench.compare")

RESULTS_DIR = Path(__file__).resolve().parent / "results"

# Cost rates for projections
L40S_PER_SEC = 0.00053
B200_PER_SEC = 0.00240


# ---------------------------------------------------------------------------
# Data loading
# ---------------------------------------------------------------------------

def load_results(path: str | Path) -> list[dict]:
    """Load JSONL results file."""
    entries = []
    with open(path) as f:
        for line in f:
            line = line.strip()
            if line:
                entries.append(json.loads(line))
    return entries


def load_all_results() -> list[dict]:
    """Load all JSONL results from the results directory."""
    entries = []
    for p in sorted(RESULTS_DIR.glob("*.jsonl")):
        entries.extend(load_results(p))
    return entries


# ---------------------------------------------------------------------------
# Grouping
# ---------------------------------------------------------------------------

def group_by(entries: list[dict], *keys: str) -> dict[tuple, list[dict]]:
    """Group entries by one or more keys."""
    groups: dict[tuple, list[dict]] = defaultdict(list)
    for entry in entries:
        key = tuple(entry.get(k, "") for k in keys)
        groups[key] = groups.get(key, [])
        groups[key].append(entry)
    return groups


# ---------------------------------------------------------------------------
# Stage comparison table
# ---------------------------------------------------------------------------

def stage_comparison(entries: list[dict]):
    """Print per-stage comparison: L40S vs B200."""
    groups = group_by(entries, "stage", "task_id", "gpu_tier")

    print("\n" + "=" * 100)
    print(f"{'Stage':<14} {'Task':<20} {'GPU':<8} {'Runs':>5} "
          f"{'Cold(s)':>8} {'Exec(s)':>8} {'Gate%':>7} "
          f"{'Rubric':>7} {'Cost/run':>9}")
    print("-" * 100)

    for (stage, task_id, tier), runs in sorted(groups.items()):
        n = len(runs)
        cold_starts = [r["timing"]["cold_start_s"] for r in runs
                       if r["timing"]["cold_start_s"] > 0]
        exec_times = [r["timing"]["execution_s"] for r in runs
                      if r["timing"]["execution_s"] > 0]
        gate_passes = sum(1 for r in runs if r["quality"]["gates_passed"])
        rubric_scores = [r["quality"]["rubric_score"] for r in runs
                         if r["quality"].get("rubric_score") is not None]
        costs = [r["cost_usd"] for r in runs if r["cost_usd"] > 0]

        cold_mean = statistics.mean(cold_starts) if cold_starts else 0
        exec_mean = statistics.mean(exec_times) if exec_times else 0
        gate_pct = (gate_passes / n * 100) if n else 0
        rubric_mean = statistics.mean(rubric_scores) if rubric_scores else 0
        cost_mean = statistics.mean(costs) if costs else 0

        rubric_str = f"{rubric_mean:>6.1f}" if rubric_scores else "   n/a"

        print(f"{stage:<14} {task_id:<20} {tier:<8} {n:>5} "
              f"{cold_mean:>8.1f} {exec_mean:>8.1f} {gate_pct:>6.0f}% "
              f"{rubric_str} ${cost_mean:>8.5f}")

    print("=" * 100)


# ---------------------------------------------------------------------------
# Rewrite comparison (Phase C)
# ---------------------------------------------------------------------------

def rewrite_comparison(entries: list[dict]):
    """Compare rewrite quality: L40S (35B) vs B200 (122B)."""
    phase_c = [e for e in entries if e.get("phase") == "C"]
    if not phase_c:
        print("\nNo Phase C (rewrite) data found.")
        return

    groups = group_by(phase_c, "stage", "task_id", "gpu_tier")

    print("\n" + "=" * 90)
    print("REWRITE SHOWDOWN: 35B (L40S) vs 122B (B200)")
    print("-" * 90)
    print(f"{'Stage':<14} {'Task':<20} {'GPU':<14} {'Runs':>5} "
          f"{'Gate%':>7} {'Exec(s)':>8} {'Cost/rw':>9}")
    print("-" * 90)

    for (stage, task_id, tier), runs in sorted(groups.items()):
        n = len(runs)
        gate_passes = sum(1 for r in runs if r["quality"]["gates_passed"])
        exec_times = [r["timing"]["execution_s"] for r in runs
                      if r["timing"]["execution_s"] > 0]
        costs = [r["cost_usd"] for r in runs if r["cost_usd"] > 0]

        gate_pct = (gate_passes / n * 100) if n else 0
        exec_mean = statistics.mean(exec_times) if exec_times else 0
        cost_mean = statistics.mean(costs) if costs else 0

        print(f"{stage:<14} {task_id:<20} {tier:<14} {n:>5} "
              f"{gate_pct:>6.0f}% {exec_mean:>8.1f} ${cost_mean:>8.5f}")

    print("=" * 90)


# ---------------------------------------------------------------------------
# Cost projections
# ---------------------------------------------------------------------------

# GPU time per cascade (from business plan, in minutes)
CASCADE_GPU_MINUTES = {
    "free": 3,
    "tier_1": 6,
    "tier_2": 10,
    "tier_3": 12,
}

# Customer mix assumption
CUSTOMER_MIX = {
    "tier_1": 0.50,
    "tier_2": 0.35,
    "tier_3": 0.15,
}

CASCADES_PER_CUSTOMER = 2  # per month


def cost_projection(entries: list[dict]):
    """Project monthly costs at various customer counts."""
    # Calculate actual cost per second from results
    phase_b = [e for e in entries if e.get("phase") == "B"]
    if not phase_b:
        print("\nNo Phase B data for cost projection. Using theoretical rates.")
        l40s_rate = L40S_PER_SEC
        b200_rate = B200_PER_SEC
    else:
        # Use actual billed costs
        l40s_entries = [e for e in phase_b if e["gpu_tier"] == "l40s"]
        b200_entries = [e for e in phase_b if e["gpu_tier"] == "b200"]
        l40s_rate = L40S_PER_SEC
        b200_rate = B200_PER_SEC

    print("\n" + "=" * 80)
    print("COST PROJECTION: RunPod Serverless vs Dedicated")
    print("-" * 80)

    # Weighted average GPU minutes per customer per month
    avg_gpu_min = sum(
        CASCADE_GPU_MINUTES.get(tier, 10) * pct * CASCADES_PER_CUSTOMER
        for tier, pct in CUSTOMER_MIX.items()
    )
    # Add conversational Q&A estimate: ~30 min per customer per month
    qa_gpu_min = 30

    print(f"Assumptions:")
    print(f"  Cascades/customer/month: {CASCADES_PER_CUSTOMER}")
    print(f"  Avg GPU min/customer (pipeline): {avg_gpu_min:.1f}")
    print(f"  Avg GPU min/customer (Q&A):      {qa_gpu_min}")
    print(f"  Total GPU min/customer/month:     {avg_gpu_min + qa_gpu_min:.1f}")
    print()

    customer_counts = [10, 25, 50, 100, 200]

    print(f"{'Customers':>10} {'GPU hrs':>9} {'L40S only':>12} {'Mixed':>12} "
          f"{'Dedicated':>12} {'L40S savings':>14}")
    print("-" * 80)

    for n_cust in customer_counts:
        total_min = n_cust * (avg_gpu_min + qa_gpu_min)
        total_hrs = total_min / 60
        total_sec = total_min * 60

        # L40S only (all models under 40B)
        l40s_cost = total_sec * l40s_rate

        # Mixed: 80% on L40S, 20% on B200 (rewrite only)
        mixed_cost = total_sec * 0.8 * l40s_rate + total_sec * 0.2 * b200_rate

        # Dedicated 2x B200 at 8hrs/day
        dedicated_cost = 1080
        if total_hrs > 240:  # need more cards
            dedicated_cost = 1080 * (total_hrs / 240)

        savings_pct = (1 - l40s_cost / dedicated_cost) * 100 if dedicated_cost > 0 else 0

        print(f"{n_cust:>10} {total_hrs:>9.1f} ${l40s_cost:>10.0f} ${mixed_cost:>10.0f} "
              f"${dedicated_cost:>10.0f} {savings_pct:>12.0f}%")

    print("=" * 80)
    print()
    print("L40S only  = all models under 40B, everything on L40S ($0.00053/sec)")
    print("Mixed      = sub-40B on L40S, 122B rewrite on B200 ($0.00240/sec)")
    print("Dedicated  = 2x B200 at 8hrs/day ($1,080/month), scales with cards needed")


# ---------------------------------------------------------------------------
# Statistical summary
# ---------------------------------------------------------------------------

def statistical_summary(entries: list[dict]):
    """Print statistical summary per configuration."""
    groups = group_by(entries, "gpu_tier", "model")

    print("\n" + "=" * 80)
    print("STATISTICAL SUMMARY")
    print("-" * 80)

    for (tier, model), runs in sorted(groups.items()):
        exec_times = [r["timing"]["execution_s"] for r in runs
                      if r["timing"]["execution_s"] > 0]
        cold_starts = [r["timing"]["cold_start_s"] for r in runs
                       if r["timing"]["cold_start_s"] > 0]
        costs = [r["cost_usd"] for r in runs if r["cost_usd"] > 0]

        print(f"\n{tier} / {model} ({len(runs)} runs)")

        if exec_times:
            print(f"  Execution:  mean={statistics.mean(exec_times):.1f}s  "
                  f"median={statistics.median(exec_times):.1f}s  "
                  f"p95={_percentile(exec_times, 95):.1f}s  "
                  f"stdev={statistics.stdev(exec_times):.1f}s" if len(exec_times) > 1
                  else f"  Execution:  {exec_times[0]:.1f}s (single run)")

        if cold_starts:
            warm = [c for c in cold_starts if c < 5]
            cold = [c for c in cold_starts if c >= 5]
            print(f"  Cold start: {len(cold)} cold / {len(warm)} warm")
            if cold:
                print(f"    Cold: mean={statistics.mean(cold):.1f}s  "
                      f"max={max(cold):.1f}s")

        if costs:
            print(f"  Cost:       mean=${statistics.mean(costs):.5f}  "
                  f"total=${sum(costs):.4f}")

    print("\n" + "=" * 80)


def _percentile(data: list[float], pct: int) -> float:
    """Calculate percentile from sorted data."""
    if not data:
        return 0.0
    sorted_data = sorted(data)
    idx = int(len(sorted_data) * pct / 100)
    return sorted_data[min(idx, len(sorted_data) - 1)]


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Compare RunPod benchmark results")
    parser.add_argument("files", nargs="*", help="JSONL result files to analyse")
    parser.add_argument("--all", action="store_true",
                        help="Load all results from results/")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO)

    if args.all:
        entries = load_all_results()
    elif args.files:
        entries = []
        for f in args.files:
            entries.extend(load_results(f))
    else:
        parser.print_help()
        sys.exit(1)

    if not entries:
        print("No results found.")
        sys.exit(1)

    print(f"\nLoaded {len(entries)} results")

    stage_comparison(entries)
    rewrite_comparison(entries)
    cost_projection(entries)
    statistical_summary(entries)


if __name__ == "__main__":
    main()
