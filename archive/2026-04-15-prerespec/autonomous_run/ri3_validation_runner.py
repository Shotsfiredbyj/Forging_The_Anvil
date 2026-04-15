"""RI-3 validation: 3 sequential cascades, same combo + strong tier.

Measures variance in grades and pass-count after adding
REVIEW_INSTRUCTIONS_BY_TASK_TYPE to ITERATION_REVIEW_PROMPT. Baseline
for comparison: `ri5_sanity` (1 run, same combo, strong, B/6/9/2488s).

Records under phase="review_v3" with run_idx 0/1/2.
Includes resume logic — if killed and restarted, it'll skip completed runs.
"""
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path

sys.path.insert(0, "/home/jack/Forging_The_Anvil/Cold_Anvil")
os.chdir("/home/jack/Forging_The_Anvil/Cold_Anvil")

from pipeline.benchmark import (
    GATEWAY,
    check_no_active_runs,
    clear_gpus,
    fetch_stage_scores,
    notify,
    run_stage_only,
    wait_for_gateway,
)

PHASE = "review_v3"
PROJ = Path("forge")
RESULTS_FILE = PROJ / "benchmarks" / "iterative_benchmark_results.jsonl"
STATUS_FILE = Path("/tmp/benchmark_status.txt")

GEN = "gemma4-26b"
RW = "gemma4-31b"
REV = "devstral"
TIER = "strong"
NUM_RUNS = 3

cache_file = PROJ / "benchmarks" / f"cached_stages_{TIER}.json"
if not cache_file.exists():
    print(f"ERROR: {cache_file} not found")
    sys.exit(1)
cached = json.loads(cache_file.read_text())
print(f"Loaded cached stages for tier={TIER}")

# Resume logic
done_keys = set()
if RESULTS_FILE.exists():
    with open(RESULTS_FILE) as f:
        for line in f:
            try:
                rec = json.loads(line)
                if rec.get("phase") == PHASE:
                    done_keys.add(rec.get("run_idx", -1))
            except (json.JSONDecodeError, KeyError):
                continue
    if done_keys:
        print(f"Resuming: runs {sorted(done_keys)} already complete")

combo_key = f"{GEN}_{RW}_{REV}"

print(f"\nRI-3 validation: {NUM_RUNS} cascades")
print(f"Combo: {GEN} + {RW} + {REV}  tier={TIER}")
print(f"Purpose: measure grade + pass-count variance after RI-3\n")

STATUS_FILE.write_text(f"RI-3 validation started: {datetime.now().isoformat()}\n{NUM_RUNS} cascades\n")

for run_idx in range(NUM_RUNS):
    if run_idx in done_keys:
        print(f"\n  Skipping run_idx={run_idx} (done)")
        continue

    print(f"\n{'#'*60}")
    print(f"  Run {run_idx + 1}/{NUM_RUNS}: run_idx={run_idx}")
    print(f"{'#'*60}\n")

    if not wait_for_gateway(GATEWAY):
        notify(f"ABORT: Gateway down before RI-3 run {run_idx}")
        sys.exit(1)
    while not check_no_active_runs(GATEWAY):
        time.sleep(5)

    print("  Clearing GPUs...")
    clear_gpus()
    time.sleep(5)

    profile_name = f"grid_{GEN}_{RW}_{REV}"
    start = time.time()
    try:
        result = run_stage_only(
            project_dir=str(PROJ),
            cascade_name="website_full",
            stage_num=5,
            cached_outputs=cached,
            gateway=GATEWAY,
            routing_profile=profile_name,
            priority="benchmark",
        )
    except Exception as e:
        elapsed = time.time() - start
        print(f"  FAILED: {e}")
        notify(f"RI-3 run {run_idx} FAILED — {e}")
        record = {
            "phase": PHASE,
            "combo_key": combo_key,
            "generator": GEN,
            "rewriter": RW,
            "reviewers": REV,
            "tier": TIER,
            "run_idx": run_idx,
            "status": "error",
            "error": str(e),
            "total_time_s": round(elapsed, 1),
            "timestamp": datetime.now().astimezone().isoformat(),
        }
        with open(RESULTS_FILE, "a") as f:
            f.write(json.dumps(record) + "\n")
        continue

    elapsed = time.time() - start
    stages = result.get("stages", [])
    record = {
        "phase": PHASE,
        "combo_key": combo_key,
        "generator": GEN,
        "rewriter": RW,
        "reviewers": REV,
        "tier": TIER,
        "run_idx": run_idx,
        "status": "completed",
        "total_time_s": round(elapsed, 1),
        "timestamp": datetime.now().astimezone().isoformat(),
    }

    qr = result.get("quality_report")
    if qr:
        record["overall_grade"] = qr.get("overall_grade", "?")
        record["file_grades"] = {
            f["task_id"]: f["grade"] for f in qr.get("files", [])
        }
        grade_dist = {}
        for f in qr.get("files", []):
            g = f["grade"]
            grade_dist[g] = grade_dist.get(g, 0) + 1
        record["grade_distribution"] = grade_dist
        record["task_count"] = len(qr.get("files", []))
        record["pass_count"] = sum(
            1 for f in qr.get("files", []) if f["grade"] in ("A", "B")
        )
    else:
        for s in stages:
            if s.get("mode") == "iterative":
                record["task_count"] = s.get("tasks_passed", 0) + s.get("tasks_failed", 0)
                record["pass_count"] = s.get("tasks_passed", 0)

    run_id = ""
    for s in stages:
        if s.get("run_id"):
            run_id = s["run_id"]
    if run_id:
        scores = fetch_stage_scores(GATEWAY, run_id)
        if scores:
            record["scores"] = scores
        record["gateway_run_id"] = run_id

    with open(RESULTS_FILE, "a") as f:
        f.write(json.dumps(record) + "\n")

    grade = record.get("overall_grade", "?")
    passed = record.get("pass_count", "?")
    task_count = record.get("task_count", "?")
    print(f"\n  Result: run_idx={run_idx} grade={grade} pass={passed}/{task_count} time={elapsed:.0f}s")

    STATUS_FILE.write_text(
        f"RI-3 validation: {run_idx + 1}/{NUM_RUNS} done\n"
        f"Last: run_idx={run_idx} = {grade} ({passed}/{task_count}) in {elapsed:.0f}s\n"
        f"Time: {datetime.now().isoformat()}\n"
    )

    notify(f"RI-3 [{run_idx + 1}/{NUM_RUNS}]: grade={grade} ({passed}/{task_count}) in {elapsed:.0f}s")

notify("RI-3 validation COMPLETE")
print("\nRI-3 validation COMPLETE")
