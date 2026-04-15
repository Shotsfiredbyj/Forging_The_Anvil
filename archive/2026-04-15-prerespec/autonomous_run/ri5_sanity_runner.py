"""RI-5 sanity cascade.

Runs gemma4-26b + gemma4-31b + devstral on the strong cached-stages tier,
after the structural_check wiring landed in pipeline/verify.py. Single
cascade. Purpose:

  1. Confirm the pipeline still runs end-to-end with the new validation
     pass wired in.
  2. Observe whether structural_check fires during the cascade and — if it
     does — whether the iterative rewrite loop successfully picks up the
     findings and repairs the code.
  3. Measure runtime vs the phase4b strong-tier baseline (24-25 min).

Writes a record to iterative_benchmark_results.jsonl under phase="ri5_sanity".
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

PHASE = "ri5_sanity"
PROJ = Path("forge")
RESULTS_FILE = PROJ / "benchmarks" / "iterative_benchmark_results.jsonl"
STATUS_FILE = Path("/tmp/benchmark_status.txt")

GEN = "gemma4-26b"
RW = "gemma4-31b"
REV = "devstral"
TIER = "strong"

cache_file = PROJ / "benchmarks" / f"cached_stages_{TIER}.json"
if not cache_file.exists():
    print(f"ERROR: {cache_file} not found")
    sys.exit(1)
cached = json.loads(cache_file.read_text())
print(f"Loaded cached stages for tier={TIER}")

combo_key = f"{GEN}_{RW}_{REV}"
print(f"\nRI-5 sanity cascade")
print(f"Combo: {GEN} + {RW} + {REV}  tier={TIER}")
print(f"Purpose: verify structural_check wiring + rewrite loop integration\n")

STATUS_FILE.write_text(f"RI-5 sanity started: {datetime.now().isoformat()}\n")

if not wait_for_gateway(GATEWAY):
    notify("ABORT: Gateway down before RI-5 sanity")
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
    notify(f"RI-5 sanity FAILED — {e}")
    record = {
        "phase": PHASE,
        "combo_key": combo_key,
        "generator": GEN,
        "rewriter": RW,
        "reviewers": REV,
        "tier": TIER,
        "run_idx": 0,
        "status": "error",
        "error": str(e),
        "total_time_s": round(elapsed, 1),
        "timestamp": datetime.now().astimezone().isoformat(),
    }
    with open(RESULTS_FILE, "a") as f:
        f.write(json.dumps(record) + "\n")
    sys.exit(1)

elapsed = time.time() - start
stages = result.get("stages", [])
record = {
    "phase": PHASE,
    "combo_key": combo_key,
    "generator": GEN,
    "rewriter": RW,
    "reviewers": REV,
    "tier": TIER,
    "run_idx": 0,
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
print(f"\n  Result: tier={TIER} grade={grade} pass={passed}/{task_count}")
print(f"  Runtime: {elapsed:.0f}s")

STATUS_FILE.write_text(
    f"RI-5 sanity COMPLETE\n"
    f"tier={TIER} grade={grade} pass={passed}/{task_count}\n"
    f"runtime={elapsed:.0f}s\n"
    f"Time: {datetime.now().isoformat()}\n"
)

notify(f"RI-5 sanity COMPLETE: tier={TIER} = {grade} ({passed}/{task_count}) in {elapsed:.0f}s")
print("\nRI-5 sanity COMPLETE")
