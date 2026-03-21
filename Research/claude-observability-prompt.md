# Build Observability Dashboard for Cold Anvil

Read `/home/jack/Forging_The_Anvil/Research/forge-consolidation-analysis.md` for full context.

## The Problem

Cold Anvil has forge infrastructure (batches, gates, rubrics, prompts) but no observability layer. When we run a batch, we get outputs but no way to track, query, or report on what happened.

We need: **A minimal dashboard and reporting layer that lets us track runs, view results, and query what was generated.**

## What to Build

### MVP (1-3 hours of work)

**Backend:**
- Simple run tracking (SQLite or in-memory)
- Table: `runs` (run_id, project, timestamp, status, total_tasks, passed, failed, flagged)
- Table: `tasks` (task_id, run_id, status, score, output_path, gate_failures, review_feedback)
- HTTP API endpoints:
  - `POST /runs` — submit a run (or record execution)
  - `GET /runs` — list all runs
  - `GET /runs/{run_id}` — get full run details
  - `GET /runs/{run_id}/tasks` — get task-level breakdown
  - `POST /runs/{run_id}/complete` — mark run complete, record outputs/scores

**CLI Tool:**
- `cold-anvil run [batch_file]` — execute batch and register run
- `cold-anvil runs` — list recent runs
- `cold-anvil runs <run_id>` — show run details
- `cold-anvil runs <run_id> --report` — formatted report

**Dashboard (Web UI):**
- Simple HTML + minimal JS (no framework needed yet)
- Index page: list of runs with status badges
- Detail page: full run breakdown, task scores, outputs viewable inline
- Pretty but functional — dark mode, Cold Anvil aesthetic

### Optional (if time permits)

- WebSocket or SSE for real-time updates during run
- Basic visualisations (score distributions, pass rates)
- Export run data as JSON
- Search queries across outputs

## Constraints

- Cold Anvil runs locally on our Arnor fleet (for now)
- Should integrate with existing batch format (`Cold_Anvil/batches/website_mvp.json`)
- Outputs should still land in `Cold_Anvil/outputs/`
- Keep it simple — we're testing the pattern, not building the SaaS version yet

## Deliverables

- `Cold_Anvil/dashboard/` — observability codebase
- `Cold_Anvil/cli.py` — commands to interact with dashboard
- `Cold_Anvil/docs/OBSERVABILITY.md` — how it works, how to use

## Success Criteria

1. We can run a batch and get a run_id back
2. We can query that run and see task scores, pass/fail status
3. We can view the outputs from the web dashboard
4. We can query multiple runs and compare

---

Read the full context analysis first, then start with a high-level design before coding.