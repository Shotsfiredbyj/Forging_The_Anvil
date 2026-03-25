"""RunPod serverless benchmark — local dashboard server.

Serves a self-contained HTML dashboard that reads JSONL results from
the results/ directory and auto-refreshes every 10 seconds.

Usage:
    python -m runpod_bench dashboard [--port 8877]
"""

import json
import logging
import statistics
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path

log = logging.getLogger("runpod_bench.dashboard")

RESULTS_DIR = Path(__file__).resolve().parent / "results"


# ---------------------------------------------------------------------------
# Data loading
# ---------------------------------------------------------------------------

def load_all_results() -> list[dict]:
    """Load all JSONL results, most recent first."""
    entries = []
    for p in sorted(RESULTS_DIR.glob("*.jsonl")):
        with open(p) as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        entries.append(json.loads(line))
                    except json.JSONDecodeError:
                        pass
    return entries


def _percentile(data: list[float], pct: int) -> float:
    if not data:
        return 0.0
    s = sorted(data)
    idx = int(len(s) * pct / 100)
    return s[min(idx, len(s) - 1)]


def build_api_data() -> dict:
    """Build the full dashboard data payload from JSONL results."""
    entries = load_all_results()
    if not entries:
        return {"runs": [], "stages": [], "models": [], "cost": {},
                "summary": {"total_runs": 0}}

    # Group by run_id
    runs_by_id: dict[str, list[dict]] = {}
    for e in entries:
        rid = e.get("run_id", "unknown")
        runs_by_id.setdefault(rid, []).append(e)

    # Run summaries
    runs = []
    for rid, results in sorted(runs_by_id.items(), reverse=True):
        phases = set(r.get("phase", "") for r in results)
        stages = set(r.get("stage", "") for r in results)
        n = len(results)
        gate_pass = sum(1 for r in results if r.get("quality", {}).get("gates_passed"))
        total_cost = sum(r.get("cost_usd", 0) for r in results)
        first_ts = min(r.get("ts", "") for r in results)
        last_ts = max(r.get("ts", "") for r in results)
        errors = sum(1 for r in results if r.get("status") != "COMPLETED")

        runs.append({
            "run_id": rid,
            "phases": sorted(phases),
            "stages": sorted(stages),
            "total": n,
            "passed": gate_pass,
            "failed": n - gate_pass,
            "errors": errors,
            "cost_usd": round(total_cost, 5),
            "started": first_ts,
            "latest": last_ts,
        })

    # Stage × GPU comparison
    stage_groups: dict[tuple, list[dict]] = {}
    for e in entries:
        key = (e.get("stage", ""), e.get("task_id", ""), e.get("gpu_tier", ""))
        stage_groups.setdefault(key, []).append(e)

    stages = []
    for (stage, task_id, tier), results in sorted(stage_groups.items()):
        n = len(results)
        cold = [r["timing"]["cold_start_s"] for r in results
                if r.get("timing", {}).get("cold_start_s", 0) > 0]
        exec_t = [r["timing"]["execution_s"] for r in results
                  if r.get("timing", {}).get("execution_s", 0) > 0]
        tok_rates = [r["tokens"]["tok_per_sec"] for r in results
                     if r.get("tokens", {}).get("tok_per_sec", 0) > 0]
        gate_pass = sum(1 for r in results
                        if r.get("quality", {}).get("gates_passed"))
        rubrics = [r["quality"]["rubric_score"] for r in results
                   if r.get("quality", {}).get("rubric_score") is not None]
        costs = [r.get("cost_usd", 0) for r in results if r.get("cost_usd", 0) > 0]
        prompt_tok = [r["tokens"]["prompt_tokens"] for r in results
                      if r.get("tokens", {}).get("prompt_tokens", 0) > 0]
        comp_tok = [r["tokens"]["completion_tokens"] for r in results
                    if r.get("tokens", {}).get("completion_tokens", 0) > 0]

        stages.append({
            "stage": stage,
            "task_id": task_id,
            "gpu_tier": tier,
            "runs": n,
            "cold_start_mean": round(statistics.mean(cold), 2) if cold else 0,
            "cold_start_p95": round(_percentile(cold, 95), 2) if cold else 0,
            "exec_mean": round(statistics.mean(exec_t), 2) if exec_t else 0,
            "exec_p95": round(_percentile(exec_t, 95), 2) if exec_t else 0,
            "tok_per_sec_mean": round(statistics.mean(tok_rates), 1) if tok_rates else 0,
            "tok_per_sec_p95": round(_percentile(tok_rates, 95), 1) if tok_rates else 0,
            "gate_pct": round(gate_pass / n * 100, 1) if n else 0,
            "rubric_mean": round(statistics.mean(rubrics), 1) if rubrics else None,
            "cost_mean": round(statistics.mean(costs), 5) if costs else 0,
            "prompt_tok_mean": round(statistics.mean(prompt_tok)) if prompt_tok else 0,
            "comp_tok_mean": round(statistics.mean(comp_tok)) if comp_tok else 0,
        })

    # Model performance
    model_groups: dict[tuple, list[dict]] = {}
    for e in entries:
        key = (e.get("gpu_tier", ""), e.get("model", ""))
        model_groups.setdefault(key, []).append(e)

    models = []
    for (tier, model), results in sorted(model_groups.items()):
        n = len(results)
        exec_t = [r["timing"]["execution_s"] for r in results
                  if r.get("timing", {}).get("execution_s", 0) > 0]
        tok_rates = [r["tokens"]["tok_per_sec"] for r in results
                     if r.get("tokens", {}).get("tok_per_sec", 0) > 0]
        cold = [r["timing"]["cold_start_s"] for r in results
                if r.get("timing", {}).get("cold_start_s", 0) > 0]
        cold_real = [c for c in cold if c >= 5]
        cold_warm = [c for c in cold if c < 5]
        costs = [r.get("cost_usd", 0) for r in results if r.get("cost_usd", 0) > 0]
        gate_pass = sum(1 for r in results
                        if r.get("quality", {}).get("gates_passed"))

        models.append({
            "gpu_tier": tier,
            "model": model,
            "runs": n,
            "exec_mean": round(statistics.mean(exec_t), 2) if exec_t else 0,
            "exec_median": round(statistics.median(exec_t), 2) if exec_t else 0,
            "exec_p95": round(_percentile(exec_t, 95), 2) if exec_t else 0,
            "tok_per_sec_mean": round(statistics.mean(tok_rates), 1) if tok_rates else 0,
            "cold_count": len(cold_real),
            "warm_count": len(cold_warm),
            "cold_mean": round(statistics.mean(cold_real), 1) if cold_real else 0,
            "gate_pct": round(gate_pass / n * 100, 1) if n else 0,
            "cost_total": round(sum(costs), 4),
            "cost_mean": round(statistics.mean(costs), 5) if costs else 0,
        })

    # Cost projection (same logic as compare.py)
    L40S_PER_SEC = 0.00053
    B200_PER_SEC = 0.00240
    customer_mix = {"tier_1": 0.50, "tier_2": 0.35, "tier_3": 0.15}
    gpu_min = {"tier_1": 6, "tier_2": 10, "tier_3": 12}
    cascades_per_cust = 2
    qa_gpu_min = 30

    avg_pipeline_min = sum(
        gpu_min.get(t, 10) * pct * cascades_per_cust
        for t, pct in customer_mix.items()
    )
    total_per_cust = avg_pipeline_min + qa_gpu_min

    projections = []
    for n_cust in [10, 25, 50, 100, 200]:
        total_sec = n_cust * total_per_cust * 60
        l40s = total_sec * L40S_PER_SEC
        mixed = total_sec * 0.8 * L40S_PER_SEC + total_sec * 0.2 * B200_PER_SEC
        dedicated = 1080
        total_hrs = n_cust * total_per_cust / 60
        if total_hrs > 240:
            dedicated = 1080 * (total_hrs / 240)
        projections.append({
            "customers": n_cust,
            "gpu_hrs": round(total_hrs, 1),
            "l40s_only": round(l40s),
            "mixed": round(mixed),
            "dedicated": round(dedicated),
            "savings_pct": round((1 - l40s / dedicated) * 100) if dedicated else 0,
        })

    # Recent entries (last 50 for live feed)
    recent = sorted(entries, key=lambda e: e.get("ts", ""), reverse=True)[:50]
    feed = []
    for e in recent:
        feed.append({
            "ts": e.get("ts", ""),
            "stage": e.get("stage", ""),
            "task_id": e.get("task_id", ""),
            "gpu_tier": e.get("gpu_tier", ""),
            "model": e.get("model", ""),
            "status": e.get("status", ""),
            "exec_s": round(e.get("timing", {}).get("execution_s", 0), 1),
            "tok_per_sec": round(e.get("tokens", {}).get("tok_per_sec", 0), 1),
            "gates_passed": e.get("quality", {}).get("gates_passed", False),
            "rubric_score": e.get("quality", {}).get("rubric_score"),
            "cost_usd": round(e.get("cost_usd", 0), 5),
            "retries": e.get("retries", 0),
            "error": e.get("error", ""),
        })

    # Summary
    total_cost = sum(e.get("cost_usd", 0) for e in entries)
    total_gate_pass = sum(1 for e in entries
                          if e.get("quality", {}).get("gates_passed"))
    total_errors = sum(1 for e in entries if e.get("status") != "COMPLETED")
    total_retries = sum(e.get("retries", 0) for e in entries)

    return {
        "runs": runs,
        "stages": stages,
        "models": models,
        "projections": projections,
        "feed": feed,
        "summary": {
            "total_runs": len(entries),
            "total_cost": round(total_cost, 4),
            "gate_pass_pct": round(total_gate_pass / len(entries) * 100, 1) if entries else 0,
            "error_count": total_errors,
            "retry_count": total_retries,
            "run_count": len(runs_by_id),
        },
    }


# ---------------------------------------------------------------------------
# HTML dashboard
# ---------------------------------------------------------------------------

DASHBOARD_HTML = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>RunPod Bench</title>
<style>
:root {
  --bg0: #282828; --bg1: #3c3836; --bg2: #504945; --bg3: #665c54;
  --fg: #ebdbb2; --fg2: #d5c4a1; --dim: #a89984;
  --red: #fb4934; --green: #b8bb26; --yellow: #fabd2f;
  --blue: #83a598; --aqua: #8ec07c; --orange: #fe8019; --purple: #d3869b;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: var(--bg0); color: var(--fg); font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 13px; max-width: 1100px; margin: 0 auto; padding: 16px; }
h1 { color: var(--orange); font-size: 20px; margin-bottom: 12px; }
h2 { color: var(--yellow); font-size: 15px; margin: 16px 0 8px; }
h3 { color: var(--fg2); font-size: 13px; margin: 12px 0 6px; }
.tabs { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
.tab { background: var(--bg1); color: var(--dim); border: 1px solid var(--bg2); padding: 6px 14px; cursor: pointer; font-family: inherit; font-size: 12px; border-radius: 3px; }
.tab:hover { color: var(--fg); border-color: var(--bg3); }
.tab.active { color: var(--orange); border-color: var(--orange); }
.panel { display: none; }
.panel.active { display: block; }
.card { background: var(--bg1); border: 1px solid var(--bg2); border-radius: 4px; padding: 12px; margin-bottom: 10px; }
.card-row { display: flex; gap: 10px; flex-wrap: wrap; }
.card-row .card { flex: 1; min-width: 180px; }
.stat { font-size: 24px; font-weight: bold; }
.stat-label { color: var(--dim); font-size: 11px; margin-top: 2px; }
.green { color: var(--green); }
.red { color: var(--red); }
.yellow { color: var(--yellow); }
.orange { color: var(--orange); }
.aqua { color: var(--aqua); }
.blue { color: var(--blue); }
.purple { color: var(--purple); }
.dim { color: var(--dim); }
table { width: 100%; border-collapse: collapse; font-size: 12px; }
th { text-align: left; color: var(--dim); padding: 6px 8px; border-bottom: 1px solid var(--bg2); font-weight: normal; }
td { padding: 5px 8px; border-bottom: 1px solid var(--bg2); }
tr:hover td { background: var(--bg1); }
.bar-bg { display: inline-block; width: 60px; height: 8px; background: var(--bg2); border-radius: 2px; vertical-align: middle; }
.bar-fill { display: block; height: 100%; border-radius: 2px; }
.tag { display: inline-block; padding: 1px 6px; border-radius: 2px; font-size: 11px; }
.tag-l40s { background: #3d5544; color: var(--green); }
.tag-b200 { background: #4a3d2a; color: var(--orange); }
.tag-pass { background: #3d5544; color: var(--green); }
.tag-fail { background: #5c2a2a; color: var(--red); }
.tag-error { background: #5c2a2a; color: var(--red); }
.updated { color: var(--dim); font-size: 11px; text-align: right; margin-top: 12px; }
.feed-row { padding: 4px 0; border-bottom: 1px solid var(--bg2); font-size: 12px; display: flex; gap: 8px; align-items: center; }
.feed-ts { color: var(--dim); flex-shrink: 0; width: 65px; }
.feed-stage { color: var(--blue); width: 90px; }
.feed-task { color: var(--fg2); width: 140px; overflow: hidden; text-overflow: ellipsis; }
.feed-gpu { width: 50px; }
.feed-metric { width: 70px; text-align: right; }
.feed-status { width: 50px; text-align: center; }
@media (max-width: 700px) {
  body { padding: 8px; font-size: 12px; }
  table { font-size: 11px; }
  th, td { padding: 4px; }
  .card-row { flex-direction: column; }
}
</style>
</head>
<body>
<h1>RunPod Bench</h1>
<div class="tabs">
  <button class="tab active" onclick="showPanel('overview')">Overview</button>
  <button class="tab" onclick="showPanel('stages')">Stages</button>
  <button class="tab" onclick="showPanel('models')">Models</button>
  <button class="tab" onclick="showPanel('cost')">Cost</button>
  <button class="tab" onclick="showPanel('feed')">Live Feed</button>
  <button class="tab" onclick="showPanel('runs')">Runs</button>
</div>

<div id="overview" class="panel active">
  <div class="card-row" id="ov-cards">
    <div class="card dim">Loading...</div>
  </div>
  <h2>Run History</h2>
  <div id="ov-runs" class="dim">Loading...</div>
</div>

<div id="stages" class="panel">
  <h2>Stage &times; GPU Comparison</h2>
  <div id="st-table" class="dim">Loading...</div>
</div>

<div id="models" class="panel">
  <h2>Model Performance</h2>
  <div id="md-table" class="dim">Loading...</div>
</div>

<div id="cost" class="panel">
  <h2>Cost Projection: Serverless vs Dedicated</h2>
  <div id="cost-table" class="dim">Loading...</div>
  <h3>Actual Spend</h3>
  <div id="cost-actual" class="dim">Loading...</div>
</div>

<div id="feed" class="panel">
  <h2>Recent Results</h2>
  <div id="feed-list" class="dim">Loading...</div>
</div>

<div id="runs" class="panel">
  <h2>All Runs</h2>
  <div id="runs-table" class="dim">Loading...</div>
</div>

<div class="updated" id="updated"></div>

<script>
const API = '/api/data';
let currentPanel = 'overview';
let data = null;

function showPanel(name) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(name).classList.add('active');
  document.querySelector('[onclick="showPanel(\''+name+'\')"]').classList.add('active');
  currentPanel = name;
  render();
}

function gpuTag(tier) {
  const cls = tier === 'b200' ? 'tag-b200' : 'tag-l40s';
  return `<span class="tag ${cls}">${tier.toUpperCase()}</span>`;
}

function statusTag(passed) {
  return passed
    ? '<span class="tag tag-pass">PASS</span>'
    : '<span class="tag tag-fail">FAIL</span>';
}

function bar(pct, width) {
  const w = width || 60;
  const color = pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--yellow)' : 'var(--red)';
  return `<span class="bar-bg" style="width:${w}px"><span class="bar-fill" style="width:${pct}%;background:${color}"></span></span> ${pct.toFixed(0)}%`;
}

function renderOverview() {
  if (!data) return;
  const s = data.summary;
  document.getElementById('ov-cards').innerHTML = `
    <div class="card"><div class="stat orange">${s.total_runs}</div><div class="stat-label">Total Runs</div></div>
    <div class="card"><div class="stat green">${s.gate_pass_pct}%</div><div class="stat-label">Gate Pass Rate</div></div>
    <div class="card"><div class="stat yellow">$${s.total_cost}</div><div class="stat-label">Total Cost</div></div>
    <div class="card"><div class="stat ${s.error_count > 0 ? 'red' : 'green'}">${s.error_count}</div><div class="stat-label">Errors</div></div>
    <div class="card"><div class="stat ${s.retry_count > 0 ? 'yellow' : 'green'}">${s.retry_count}</div><div class="stat-label">Retries</div></div>
    <div class="card"><div class="stat aqua">${s.run_count}</div><div class="stat-label">Run Sessions</div></div>
  `;

  let h = '<table><tr><th>Run ID</th><th>Phase</th><th>Stages</th><th>Total</th><th>Pass</th><th>Err</th><th>Cost</th><th>Time</th></tr>';
  for (const r of data.runs.slice(0, 10)) {
    const t = r.started ? r.started.slice(11, 19) : '';
    h += `<tr>
      <td class="dim">${r.run_id.slice(0, 30)}</td>
      <td>${r.phases.join(',')}</td>
      <td class="dim">${r.stages.length}</td>
      <td>${r.total}</td>
      <td class="green">${r.passed}</td>
      <td class="${r.errors > 0 ? 'red' : 'dim'}">${r.errors}</td>
      <td class="yellow">$${r.cost_usd}</td>
      <td class="dim">${t}</td>
    </tr>`;
  }
  h += '</table>';
  document.getElementById('ov-runs').innerHTML = h;
}

function renderStages() {
  if (!data) return;
  let h = `<table><tr>
    <th>Stage</th><th>Task</th><th>GPU</th><th>Runs</th>
    <th>Cold (s)</th><th>Exec (s)</th><th>Tok/s</th>
    <th>Gates</th><th>Rubric</th>
    <th>Prompt</th><th>Comp</th><th>Cost/run</th>
  </tr>`;
  let lastStage = '';
  for (const s of data.stages) {
    const stageLabel = s.stage !== lastStage ? s.stage : '';
    lastStage = s.stage;
    const rubric = s.rubric_mean !== null ? s.rubric_mean.toFixed(1) : '<span class="dim">—</span>';
    h += `<tr>
      <td class="blue">${stageLabel}</td>
      <td>${s.task_id}</td>
      <td>${gpuTag(s.gpu_tier)}</td>
      <td>${s.runs}</td>
      <td>${s.cold_start_mean} <span class="dim">p95 ${s.cold_start_p95}</span></td>
      <td>${s.exec_mean} <span class="dim">p95 ${s.exec_p95}</span></td>
      <td class="aqua">${s.tok_per_sec_mean || '<span class="dim">—</span>'}</td>
      <td>${bar(s.gate_pct)}</td>
      <td>${rubric}</td>
      <td class="dim">${s.prompt_tok_mean || '—'}</td>
      <td class="dim">${s.comp_tok_mean || '—'}</td>
      <td class="yellow">$${s.cost_mean}</td>
    </tr>`;
  }
  h += '</table>';
  document.getElementById('st-table').innerHTML = h;
}

function renderModels() {
  if (!data) return;
  let h = `<table><tr>
    <th>GPU</th><th>Model</th><th>Runs</th>
    <th>Exec mean</th><th>Exec med</th><th>Exec p95</th>
    <th>Tok/s</th><th>Cold/Warm</th><th>Cold avg</th>
    <th>Gates</th><th>Cost total</th><th>Cost/run</th>
  </tr>`;
  for (const m of data.models) {
    h += `<tr>
      <td>${gpuTag(m.gpu_tier)}</td>
      <td>${m.model}</td>
      <td>${m.runs}</td>
      <td>${m.exec_mean}s</td>
      <td>${m.exec_median}s</td>
      <td>${m.exec_p95}s</td>
      <td class="aqua">${m.tok_per_sec_mean || '—'}</td>
      <td><span class="red">${m.cold_count}</span> / <span class="green">${m.warm_count}</span></td>
      <td>${m.cold_mean ? m.cold_mean + 's' : '—'}</td>
      <td>${bar(m.gate_pct)}</td>
      <td class="yellow">$${m.cost_total}</td>
      <td class="dim">$${m.cost_mean}</td>
    </tr>`;
  }
  h += '</table>';
  document.getElementById('md-table').innerHTML = h;
}

function renderCost() {
  if (!data) return;
  let h = `<table><tr>
    <th>Customers</th><th>GPU hrs</th><th>L40S only</th>
    <th>Mixed</th><th>Dedicated</th><th>L40S savings</th>
  </tr>`;
  for (const p of data.projections) {
    h += `<tr>
      <td>${p.customers}</td>
      <td>${p.gpu_hrs}</td>
      <td class="green">$${p.l40s_only}</td>
      <td class="yellow">$${p.mixed}</td>
      <td class="dim">$${p.dedicated}</td>
      <td class="aqua">${p.savings_pct}%</td>
    </tr>`;
  }
  h += '</table>';
  h += '<p class="dim" style="margin-top:8px;font-size:11px">L40S only = all sub-40B on L40S ($0.00053/sec) · Mixed = 80% L40S + 20% B200 ($0.00240/sec) · Dedicated = 2x B200 8hrs/day ($1,080/mo)</p>';
  document.getElementById('cost-table').innerHTML = h;

  // Actual spend from results
  const s = data.summary;
  document.getElementById('cost-actual').innerHTML = `
    <div class="card-row">
      <div class="card"><div class="stat yellow">$${s.total_cost}</div><div class="stat-label">Total bench spend</div></div>
      <div class="card"><div class="stat dim">${s.total_runs}</div><div class="stat-label">Generations</div></div>
      <div class="card"><div class="stat dim">$${s.total_runs > 0 ? (s.total_cost / s.total_runs).toFixed(5) : '0'}</div><div class="stat-label">Avg cost/generation</div></div>
    </div>
  `;
}

function renderFeed() {
  if (!data) return;
  let h = '';
  for (const f of data.feed) {
    const ts = f.ts ? f.ts.slice(11, 19) : '';
    const statusCls = f.status === 'COMPLETED' ? (f.gates_passed ? 'green' : 'yellow') : 'red';
    const rubric = f.rubric_score !== null ? f.rubric_score.toFixed(0) : '—';
    h += `<div class="feed-row">
      <span class="feed-ts">${ts}</span>
      <span class="feed-stage">${f.stage}</span>
      <span class="feed-task">${f.task_id}</span>
      <span class="feed-gpu">${gpuTag(f.gpu_tier)}</span>
      <span class="feed-metric dim">${f.exec_s}s</span>
      <span class="feed-metric aqua">${f.tok_per_sec || '—'} t/s</span>
      <span class="feed-status ${statusCls}">${f.gates_passed ? 'PASS' : f.status === 'COMPLETED' ? 'FAIL' : 'ERR'}</span>
      <span class="feed-metric dim">${rubric}</span>
      <span class="feed-metric yellow">$${f.cost_usd}</span>
      ${f.retries > 0 ? '<span class="feed-metric orange">R' + f.retries + '</span>' : ''}
    </div>`;
  }
  document.getElementById('feed-list').innerHTML = h || '<div class="dim">No results yet.</div>';
}

function renderRuns() {
  if (!data) return;
  let h = `<table><tr>
    <th>Run ID</th><th>Phase</th><th>Stages</th><th>Total</th>
    <th>Passed</th><th>Failed</th><th>Errors</th><th>Cost</th><th>Started</th>
  </tr>`;
  for (const r of data.runs) {
    h += `<tr>
      <td class="dim">${r.run_id}</td>
      <td>${r.phases.join(',')}</td>
      <td>${r.stages.join(', ')}</td>
      <td>${r.total}</td>
      <td class="green">${r.passed}</td>
      <td class="${r.failed > 0 ? 'red' : 'dim'}">${r.failed}</td>
      <td class="${r.errors > 0 ? 'red' : 'dim'}">${r.errors}</td>
      <td class="yellow">$${r.cost_usd}</td>
      <td class="dim">${r.started ? r.started.slice(0, 19).replace('T', ' ') : ''}</td>
    </tr>`;
  }
  h += '</table>';
  document.getElementById('runs-table').innerHTML = h;
}

function render() {
  if (!data) return;
  if (currentPanel === 'overview') renderOverview();
  else if (currentPanel === 'stages') renderStages();
  else if (currentPanel === 'models') renderModels();
  else if (currentPanel === 'cost') renderCost();
  else if (currentPanel === 'feed') renderFeed();
  else if (currentPanel === 'runs') renderRuns();
}

async function refresh() {
  try {
    const r = await fetch(API);
    data = await r.json();
    render();
    document.getElementById('updated').textContent = 'Updated ' + new Date().toLocaleTimeString();
  } catch (e) {
    document.getElementById('updated').textContent = 'Error: ' + e.message;
  }
}

refresh();
setInterval(refresh, 10000);
</script>
</body>
</html>
"""


# ---------------------------------------------------------------------------
# HTTP server
# ---------------------------------------------------------------------------

class DashboardHandler(BaseHTTPRequestHandler):
    """Simple HTTP handler: serves dashboard HTML and JSON API."""

    def do_GET(self):
        if self.path == "/" or self.path == "/dashboard":
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(DASHBOARD_HTML.encode())

        elif self.path == "/api/data":
            payload = build_api_data()
            body = json.dumps(payload).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        else:
            self.send_error(404)

    def log_message(self, format, *args):
        """Suppress default request logging — too noisy with auto-refresh."""
        pass


def serve(port: int = 8877):
    """Start the dashboard server."""
    server = HTTPServer(("0.0.0.0", port), DashboardHandler)
    print(f"RunPod Bench dashboard: http://localhost:{port}")
    print("Auto-refreshes every 10s. Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
        server.shutdown()
