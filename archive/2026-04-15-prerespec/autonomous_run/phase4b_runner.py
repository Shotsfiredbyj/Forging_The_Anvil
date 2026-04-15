"""Phase 4B: challenger tier test.

Runs gemma4-26b + gemma4-31b + devstral across strong/mid/weak tiers to
provide a head-to-head comparison with Phase 4 tier_v2 (qwen+qwen+mistral).

Records go to iterative_benchmark_results.jsonl under phase="tier_v2_challenger".
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

PHASE = "tier_v2_challenger"
PROJ = Path("forge")
RESULTS_FILE = PROJ / "benchmarks" / "iterative_benchmark_results.jsonl"
STATUS_FILE = Path("/tmp/benchmark_status.txt")

GEN = "gemma4-26b"
RW = "gemma4-31b"
REV = "devstral"
TIERS = ["strong", "mid", "weak"]

# Load cached stages
cache_sets = {}
for tier in TIERS:
    cache_file = PROJ / "benchmarks" / f"cached_stages_{tier}.json"
    if not cache_file.exists():
        print(f"ERROR: {cache_file} not found")
        sys.exit(1)
    cache_sets[tier] = json.loads(cache_file.read_text())
print(f"Loaded cached stages for {list(cache_sets.keys())}")

# Resume logic
done_keys = set()
if RESULTS_FILE.exists():
    with open(RESULTS_FILE) as f:
        for line in f:
            try:
                rec = json.loads(line)
                if rec.get("phase") == PHASE:
                    done_keys.add(f"{rec['combo_key']}_{rec['tier']}_{rec.get('run_idx',0)}")
            except (json.JSONDecodeError, KeyError):
                continue
    if done_keys:
        print(f"Resuming: {len(done_keys)} challenger runs already complete")

combo_key = f"{GEN}_{RW}_{REV}"
total = len(TIERS)

print(f"\nPhase 4B (challenger): {total} cascades")
print(f"Combo: {GEN} + {RW} + {REV}\n")

STATUS_FILE.write_text(f"Phase 4B started: {datetime.now().isoformat()}\n{total} challenger cascades\n")

for idx, tier in enumerate(TIERS, 1):
    resume_key = f"{combo_key}_{tier}_0"
    if resume_key in done_keys:
        print(f"  Skipping {idx}/{total}: tier={tier} (done)")
        continue

    print(f"\n{'#'*60}")
    print(f"  {idx}/{total}: gen={GEN} rw={RW} rev={REV} tier={tier}")
    print(f"{'#'*60}\n")

    if not wait_for_gateway(GATEWAY):
        notify(f"ABORT: Gateway down before tier {tier}")
        break
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
            cached_outputs=cache_sets[tier],
            gateway=GATEWAY,
            routing_profile=profile_name,
            priority="benchmark",
        )
    except Exception as e:
        elapsed = time.time() - start
        print(f"  FAILED: {e}")
        notify(f"Phase 4B {idx}/{total}: tier={tier} FAILED — {e}")
        record = {
            "phase": PHASE,
            "combo_key": combo_key,
            "generator": GEN,
            "rewriter": RW,
            "reviewers": REV,
            "tier": tier,
            "run_idx": 0,
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
        "tier": tier,
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
    print(f"\n  Result: tier={tier} grade={grade} pass={passed}/{task_count}")

    STATUS_FILE.write_text(
        f"Phase 4B: {idx}/{total} done\n"
        f"Last: tier={tier} = {grade} ({passed}/{task_count})\n"
        f"Time: {datetime.now().isoformat()}\n"
    )

    notify(f"Phase 4B [{idx}/{total}]: tier={tier} = {grade} ({passed}/{task_count})")

notify("Phase 4B COMPLETE")
print("\nPhase 4B COMPLETE")
