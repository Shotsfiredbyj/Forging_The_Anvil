"""Phase 4 RI-1 Tailwind validation cascade.

Single cascade, `gemma4-26b + gemma4-31b + devstral`, using the
hand-patched `cached_stages_strong_tailwind.json` where the Stage 4
blueprint's tech_stack has `"css": "tailwind"` injected. Everything
downstream of that (blueprint_parser → allowlist → iterative →
verify → web adapter → structural_check) is running from `59b70ca`.

Purpose:
  1. End-to-end smoke: does the whole pipeline run cleanly with
     Tailwind mode engaged?
  2. Allowlist adherence: does the model produce HTML with classes
     from the allowlist, or does it violate the contract?
  3. Tailwind build: does `npx tailwindcss ...` run cleanly in the
     temp project dir?
  4. Does structural_check still fire correctly on Tailwind-compiled
     CSS? (no regression from Phase 2)

Writes to `iterative_benchmark_results.jsonl` under phase="tailwind_v1".
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

PHASE = "tailwind_v1"
PROJ = Path("forge")
RESULTS_FILE = PROJ / "benchmarks" / "iterative_benchmark_results.jsonl"
STATUS_FILE = Path("/tmp/benchmark_status.txt")

GEN = "gemma4-26b"
RW = "gemma4-31b"
REV = "devstral"
TIER = "strong"

# Key difference from prior runners: use the patched cached stages where the
# Stage 4 blueprint declares Tailwind. Stages 1-4 are still from the vanilla
# corpus, so the prose in the blueprint still says "plain HTML/CSS". That's a
# known imperfection of using cached tiers for this validation; if the model
# handles it we ship, if it gets confused we rewrite Stage 4 prompts in a
# follow-up.
cache_file = PROJ / "benchmarks" / "cached_stages_strong_tailwind.json"
if not cache_file.exists():
    print(f"ERROR: {cache_file} not found")
    sys.exit(1)
cached = json.loads(cache_file.read_text())
print(f"Loaded Tailwind-patched cached stages for tier={TIER}")

combo_key = f"{GEN}_{RW}_{REV}"
print(f"\nPhase 4 RI-1 validation")
print(f"Combo: {GEN} + {RW} + {REV}  tier={TIER}")
print(f"Pack: website_tailwind (Stage 5 only; Stages 1-4 cached from vanilla)\n")

STATUS_FILE.write_text(f"Tailwind v1 started: {datetime.now().isoformat()}\n")

if not wait_for_gateway(GATEWAY):
    notify("ABORT: Gateway down before Tailwind v1")
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
    notify(f"Tailwind v1 FAILED — {e}")
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
    f"Tailwind v1 COMPLETE\n"
    f"tier={TIER} grade={grade} pass={passed}/{task_count}\n"
    f"runtime={elapsed:.0f}s\n"
    f"Time: {datetime.now().isoformat()}\n"
)

notify(f"Tailwind v1 COMPLETE: grade={grade} ({passed}/{task_count}) in {elapsed:.0f}s")
print("\nTailwind v1 COMPLETE")
