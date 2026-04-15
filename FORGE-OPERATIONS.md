> *Operational guide for the Arnor substrate. Not product-facing. The product spec lives at `/home/jack/Forging_The_Anvil/respec/03-spec.md`.*

# Forge Operations Guide

How to run forge batches and cascades without making a mess.

This is written for Annie (Claude Code sessions) but applies to anyone
driving the pipeline.

---

## The Golden Rules

1. **One batch/cascade at a time.** Never run batches or cascades
   concurrently. The fleet doesn't have enough GPU headroom for parallel
   cascades — they fight over VRAM and corrupt timing baselines. This
   means never launching two commands in the same message.

2. **Foreground, never background.** Always run forge commands in the
   foreground so you can see output and the user can Ctrl-C cleanly.
   Never use `&`, `run_in_background`, or nohup. If the user wants their
   terminal back, tell them — don't silently background it.
   **Exception for Cold Anvil cascades:** these take 10-30+ minutes and
   will exceed foreground timeouts. Use `run_in_background=true` with a
   600s timeout and `tee` to a log file. But only ever ONE at a time.

3. **Sequential means wait.** When asked to run two cascades sequentially,
   finish the first completely (status = `completed` or `failed`) before
   submitting the second. Poll until done. Don't guess.

4. **Don't panic-kill.** If something goes wrong, stop and tell the user.
   Do not cancel runs, kill processes, or restart services without
   approval. A running batch that's producing bad output is recoverable.
   An orphaned run on the Gateway is a cleanup headache.

5. **Cancel via the Gateway, never pkill.** If you need to stop a run,
   use the Gateway API — never `pkill`, `kill -9`, or process-level
   signals. The CLI is just a poller; the Gateway is doing the work.
   Killing the CLI orphans the Gateway run, which keeps burning GPU time
   invisibly. See "Stopping a Run" below.

6. **Verify before and after.** Check fleet health and active runs before
   submitting. Confirm the run completed after it finishes. Don't assume.

---

## Before You Start

### Check fleet health
```bash
python tools/forge.py --health
```
This tells you which hosts are up, what models are loaded, and response
times. If a host is down, fix that first.

**Backend:** All forge hosts run vLLM behind llama-swap (not Ollama).
Models load on demand — the fleet tab may show `--` when no model is
loaded. This is normal. Cold starts take ~35s (container start +
weight loading + torch.compile + warmup profiling). Warm requests
are instant. The biggest chunk of cold start time is the initial
profiling/warmup run (~8s) — this is inherent and can't be skipped.

**Cold start env vars (required on all models):** Every model entry
in llama-swap configs must include these `-e` flags:
- `VLLM_SKIP_P2P_CHECK=1` — skip GPU peer-to-peer check (single-GPU)
- `TRANSFORMERS_OFFLINE=1` — block network calls to HuggingFace
  (models are cached locally; also sets HF_HUB_OFFLINE internally)
- `HF_HUB_DISABLE_TELEMETRY=1` — disable HF telemetry pings
- `VLLM_COMPILE_DEPYF=0` — skip bytecode decompilation

**Do NOT set `HF_HUB_OFFLINE=1` directly** — it causes
`LocalEntryNotFoundError` hangs (vLLM #23684). Use
`TRANSFORMERS_OFFLINE=1` instead, which sets it safely via vLLM's
own model path resolution.

**Pre-warm readiness (signal-based):** The Gateway pre-warms models
before dispatching real work. `ensure_model_loaded()` first checks the
health cache — `_health_check_vllm` queries llama-swap `/running` to
see if the model is already loaded. If it is, the probe is skipped
(instant return, logged as "already warm"). If not, a trivial probe
request (`max_tokens: 1`) is sent. llama-swap holds the connection
until the vLLM container is healthy, then returns 200 — the 200
response IS the readiness signal. No timeouts, no polling, no guessing.
The httpx timeout (330s) is set above llama-swap's healthCheckTimeout
(300s) so llama-swap is always the authority on whether a model can
start. All probes log duration on success and failure.

**Fleet pre-warm:** Before each batch's generation phase, the pipeline
calls `fleet.warm_fleet_for_route()` to load the generation model on
ALL hosts in the route simultaneously. Waits for the readiness signal
from every host — every GPU is ready before the first task dispatches.
Logs start, per-host timing, and total duration.

**Fleet dispatch distributes tasks.** `acquire_for_forge()` uses
gen_lock exclusion: if a host's lock is held by another task, the host
is excluded and the next available host is tried. Combined with
`/running`-based loaded_models detection (routing prefers hosts with the
model already loaded), tasks distribute across available GPUs in
parallel instead of serialising on one host.

**Rollback to Ollama (per host):**
```bash
ssh $HOST "sudo systemctl stop llama-swap && sudo systemctl start ollama"
```

### Cleaning up forge runs

If you need to delete junk/test runs from the Gateway DB, use the
cleanup script — it handles both DB records AND event log files:
```bash
cd /home/jack/Forging_The_Anvil/Cold_Anvil
./deploy/clean-forge-runs.sh 2026-04-06          # delete + archive
./deploy/clean-forge-runs.sh 2026-04-06 --dry-run # preview only
```

**NEVER reset the run counter.** The counter must always increment
monotonically. Resetting it causes ID collisions with orphaned event
log files — new runs append events to old log files, producing
contaminated logs where events from two different batches share the
same run_id. The cleanup script deliberately does not touch the counter.

### Check for active runs

**Important:** The dashboard API filters out Cold Anvil runs by default.
If you're running Cold Anvil cascades, you must pass the project filter
or you will see zero active runs even when cascades are running.

```bash
# Cold Anvil cascades — MUST use ?project=cold_anvil
curl -s "http://elostirion:8400/dashboard/api/forge?project=cold_anvil" | python3 -c "
import sys,json; d=json.load(sys.stdin)
print(f'Active: {len(d[\"active\"])}')
for r in d['active']:
    print(f'  {r[\"run_id\"]}  status={r[\"status\"]}  tasks={r[\"task_count\"]}')
"

# Direct forge runs (non-Cold-Anvil)
curl -s "http://elostirion:8400/dashboard/api/forge" | python3 -c "
import sys,json; d=json.load(sys.stdin); print(f'Active: {len(d[\"active\"])}')
"
```
If anything is already running, tell the user and ask what to do. Never
submit work on top of an active run without explicit approval.

### Validate the batch
```bash
python tools/forge.py --project ~/githobbit/forge --dry-run --batch my_batch.json
```
Dry-run catches config errors (missing templates, bad rubrics, invalid
gates) before you waste GPU time.

---

## Running a Batch

```bash
cd "/home/jack/The Founding Of Arnor/The_Forge"
python tools/forge.py --project ~/githobbit/forge --batch my_batch.json
```

This submits the batch and polls until completion. The CLI prints
progress every 5 seconds. Stay in the foreground and let it finish.

**Expected output:**
```
Submitting batch 'my_batch' (5 tasks) to http://elostirion:8400...
Accepted — run_id: 2026-03-24_001, 5 tasks
[running] 2/5 tasks complete
  task_1: passed (88/100)
  task_2: passed (91/100)
[completed] 5/5 tasks complete
```

**If it hangs:** Don't kill it. Check the Gateway:
```bash
curl -s http://elostirion:8400/forge/runs/{run_id} | jq '.status'
```
If the Gateway shows `running`, the batch is still working — the CLI
might just be slow to poll. If the Gateway shows `failed`, the CLI
should exit shortly.

---

## Running Cascades (Multi-Stage)

Cascades are multiple batches that run in sequence, where later stages
may depend on earlier output.

### Manual cascades (The Forge)

1. Run stage 1 batch. Wait for completion.
2. Confirm stage 1 results with the user if needed.
3. Run stage 2 batch. Wait for completion.
4. Repeat for further stages.

### Cold Anvil cascades

Cold Anvil has its own cascade orchestrator that handles multi-stage
sequencing automatically. The CLI submits each stage to the Gateway,
polls until done, then feeds outputs into the next stage.

**Critical: the CLI is the cascade orchestrator.** The Gateway only
runs individual batches — it has no concept of multi-stage cascades.
The CLI is the process that feeds outputs from stage N into stage N+1.
If the CLI dies, the current stage finishes on the Gateway but all
remaining stages never run. The cascade is abandoned mid-way.

#### Running from Claude Code

Claude Code's bash tool has a **maximum timeout of 600 seconds (10
minutes)**. A full cascade takes 10–40+ minutes. If you use
`run_in_background=true`, the bash tool will kill the CLI after 600s,
which kills the cascade mid-way — the current Gateway stage finishes
but remaining stages never fire.

**Use `nohup` to detach the cascade from the bash session:**
```bash
cd /home/jack/Forging_The_Anvil/Cold_Anvil && \
  nohup python -m pipeline.cli cascade website_full \
  > /tmp/cascade.log 2>&1 &
echo "PID: $!"
```
This lets the cascade run to completion regardless of Claude Code's
bash timeout. The PID is printed so you can check on it later.

**Then monitor via the Gateway API, not the process:**
```bash
# Check if the cascade CLI is still alive
ps -p <PID> -o pid,etime,cmd --no-headers

# Check active runs on the Gateway (MUST use ?project=cold_anvil)
curl -s "http://elostirion:8400/dashboard/api/forge?project=cold_anvil" | python3 -c "
import sys,json; d=json.load(sys.stdin)
print(f'Active: {len(d[\"active\"])}')
for r in d['active']:
    print(f'  {r[\"run_id\"]}  status={r[\"status\"]}  stage={r.get(\"cascade_stage_name\",\"?\")}  tasks={r[\"task_count\"]}')
"

# Check the cascade event log for stage progression
tail -5 /tmp/cascade.log
```

**To check local run history:**
```bash
cd /home/jack/Forging_The_Anvil/Cold_Anvil && python -m pipeline.cli runs
```

Optional flags:
- `--routing-profile sub40b` — override model routing
- `--dry-run` — validate without submitting

#### What NOT to do with cascades

- Don't launch two cascades in the same message — ever
- Don't use `run_in_background=true` without `nohup` — the 600s bash
  timeout will kill the CLI and abandon the cascade mid-way
- Don't pipe through `head` (kills the process after N lines)
- Don't use `pkill` or `kill -9` to cancel (orphans Gateway runs)
- Don't submit without checking for active runs first
- Don't assume `dashboard/api/forge` shows Cold Anvil runs — it doesn't
  without `?project=cold_anvil`

#### What NOT to "fix"

The polling code in `gateway_client.py` works correctly:
- `POLL_TIMEOUT = 1800` (30 minutes) — plenty of headroom
- `POLL_INTERVAL = 5` — polls every 5 seconds
- `_request` timeout of 30s is per HTTP call, not the poll loop

If a cascade stops mid-way, the problem is almost certainly that
**the CLI process was killed** (bash timeout, pkill, session ended),
not a bug in the polling code. Check the process first, don't
"fix" working code based on a misdiagnosis.

---

## Checking Status Mid-Run

### Run status
```bash
curl -s http://elostirion:8400/forge/runs/{run_id} | jq '.'
```

### Task details (for debugging a specific task)
```bash
curl -s http://elostirion:8400/forge/runs/{run_id}/tasks/{task_id} | jq '.'
```

### Event stream (full debug log)
```bash
curl -s http://elostirion:8400/forge/runs/{run_id}/events | jq '.'
```

### What's loaded on each host
```bash
# Forge fleet (vLLM/llama-swap) — check via dashboard or probe
curl -s http://elostirion:8400/dashboard/api/fleet | python3 -c "
import sys,json; d=json.load(sys.stdin)
for h in d.get('hosts',[]): print(f'{h[\"name\"]}: {h.get(\"loaded_model\",\"--\")}')"

# Ollama hosts
curl -s http://barrowblade:11434/api/ps | jq '.models[].name'
curl -s http://eregion:11435/api/ps | jq '.models[].name'
```

---

## Stopping a Run

**Always cancel via the Gateway API.** Never use `pkill`, `kill -9`, or
process-level signals. The CLI is just a polling client — the Gateway
owns the actual work. Killing the CLI leaves the Gateway run alive,
burning GPU time with no one watching.

**Note:** As of 2026-04-03, `cascade.py` traps SIGINT/SIGTERM and calls
`POST /forge/cascade/{cascade_id}/cancel` before exiting. This cancels
all active + queued runs for that cascade. So Ctrl-C on a cascade now
does a clean cancel. The manual API calls below are still needed for
orphaned runs or non-cascade batches.

### Cancel a specific run (preferred)
```bash
curl -X POST http://elostirion:8400/forge/runs/{run_id}/cancel
```
This cleanly cancels the background asyncio task on the Gateway and
marks the run as `cancelled` in the database.

### Cancel a cascade (all its runs)
```bash
curl -X POST http://elostirion:8400/forge/cascade/{cascade_id}/cancel
```
Cancels all active + queued runs belonging to a cascade. Use when the
CLI died without the signal handler firing (network issue, OOM kill).

### Cancel all runs (emergency only)
```bash
curl -X POST http://elostirion:8400/forge/cancel-all
```
Use this only when you need to hard-stop everything. Tell the user first.

### After cancelling via the API, then kill the local CLI
```bash
# Only AFTER the Gateway cancel succeeds:
kill <pid>   # the local CLI poller, if still running
```
Order matters: Gateway first, local process second. Never the reverse.

### Verify the cancel worked
```bash
# For Cold Anvil runs:
curl -s "http://elostirion:8400/dashboard/api/forge?project=cold_anvil" | python3 -c "
import sys,json; d=json.load(sys.stdin); print(f'Active: {len(d[\"active\"])}')
"
```

### Restart the Gateway (last resort)
```bash
ssh jack@elostirion "cd /home/jack/arnor/The-Founding-Of-Arnor && git pull && bash /home/jack/arnor/restart-gateway.sh"
```
This kills all in-flight runs. Only do this if the Gateway is
unresponsive or in a bad state, and only with user approval.

---

## Cleanup After a Run

### Unload models to free VRAM

**Forge fleet (vLLM/llama-swap):** Models unload automatically when
llama-swap swaps to a different model. No manual unload needed. To
force-stop the current model on a host:
```bash
ssh $HOST "sudo podman stop llm-*"
```

**Ollama hosts:**
```bash
curl -s http://{host}:{port}/api/generate -d '{"model": "{model_name}", "keep_alive": 0}'
```

---

## When Things Go Wrong

### "The batch seems stuck"
1. Check Gateway status for the run_id
2. Check which host it's stuck on (events endpoint)
3. Check that host is responsive: `curl -s http://{host}:8080/v1/models` (vLLM) or `curl -s http://{host}:11434/api/ps` (Ollama)
4. Tell the user what you found. Don't start killing things.

### "I submitted the wrong batch"
1. Cancel it: `curl -X POST http://elostirion:8400/forge/runs/{run_id}/cancel`
2. Confirm it cancelled: check status is `cancelled`
3. Submit the correct batch

### "Multiple runs are active and shouldn't be"
1. List active runs: `curl -s http://elostirion:8400/forge/runs | jq '.[] | select(.status == "running")'`
2. Tell the user which runs are active and ask which to keep
3. Cancel the ones they want stopped, one at a time
4. Don't cancel-all without asking

### "I broke something and don't know what"
1. Stop. Don't run more commands.
2. Tell the user exactly what you did and what happened.
3. Let them decide the recovery path.

---

## Host Reference

### Forge Fleet (vLLM + llama-swap)

| Host | Port | GPU | VRAM | Notes |
|------|------|-----|------|-------|
| Anduril | 8080 | RTX PRO 4500 Blackwell | 32 GB | Forge fleet |
| Annuminas | 8080 | RTX PRO 4500 Blackwell | 32 GB | Forge fleet |
| Rohan (primary) | 8080 | RTX PRO 6000 Blackwell Max-Q | 96 GB | Forge fleet — large models (122b) |
| Rohan (secondary) | 8081 | RTX PRO 4500 Blackwell | 32 GB | Forge fleet — second GPU |

All forge hosts run vLLM behind llama-swap. Model optimization is
per-model: `-O1` (inductor compile + CUDA graphs) for models <=24B active
params, `-O0` (eager) for larger models. 96GB rohan primary runs `-O1`
for all models. Qwen3.5 models have thinking mode disabled fleet-wide
(`--reasoning-parser qwen3 --default-chat-template-kwargs
'{"enable_thinking": false}'`). Gemma4 on text-only hosts has multimodal
disabled (`--limit-mm-per-prompt image=0,audio=0 --kv-cache-dtype fp8`).
Exception: rohan primary gemma4:26b keeps multimodal (serves visual review)
and runs with `--max-model-len 131072` (128K context) to accommodate
full-page screenshot images in visual review requests.

Config locations:
- Anduril/Annuminas: `/etc/llama-swap/config.yaml`
- Rohan primary: `/etc/llama-swap/llama-swap.yaml`
- Rohan secondary: `/etc/llama-swap/llama-swap-4500.yaml`

### Other Hosts

| Host | Port | GPU | VRAM | Backend | Notes |
|------|------|-----|------|---------|-------|
| Barrowblade | 11434 | Apple M-series (UMA) | 96 GB | Ollama | Shared VRAM — needs swap lock |
| Eregion | **11435** | Intel Arc B60 | 24 GB | Ollama | Embeddings + specialist. **Never use 11434** (B50, memory only) |

---

## The Pipeline Phases

For reference, every batch goes through three phases:

1. **Generate** — Up to 4 tasks in parallel across the fleet. Each task
   passes through structural gates (word count, format, hard blocks).

2. **Review** — All outputs batched and sent to the reviewer on Annuminas.
   Scores each dimension, returns PASS/REVISE/REJECT per task.

3. **Rewrite** — Failed tasks rewritten sequentially on Annuminas using
   reviewer feedback. Re-reviewed after rewrite. Up to 9 total attempts
   per task (3 attempts × 3 rounds with escalating strategies).

4. **Verification rewrite** — When a verification stage needs to rewrite
   code, it uses `route_override: rewrite_code` to dispatch through the
   rewriter model instead of the generator. This means verification
   rewrites get the same model and routing as regular rewrites, not the
   generation model.

Generation is parallel. Review is batched. Rewrite is serial.
