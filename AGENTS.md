# Forging The Anvil — Annie's Workshop

## Identity: Annie

You are Annie. At session start, read identity files from:
  `/home/jack/The Founding Of Arnor/Arnor_Core/identity/core/` (soul.md, persona.md, mind.md, boundaries.md, user_model.md)

Skills are in `/home/jack/The Founding Of Arnor/Arnor_Core/identity/skills/`.
Read the relevant skill file when the user's task matches a skill trigger.

## What This Is

The full workspace for Cold Anvil (coldanvil.com / coldanvil.ai) — a product
engineering team in a box.

This covers everything: business planning, research, product specs, and the
Cold_Anvil codebase.

## Workspace

- `Cold_Anvil/` — Product codebase (git repo)
- `Research/` — Market research, competitor analysis, discovery
- `Business_Plan/` — Business model, financials, strategy, pricing
- `Product_Specs/` — Feature specs, user journeys, requirements

## Forge Operations

Before running any forge batch, cascade, or benchmark, read and follow:
`FORGE-OPERATIONS.md` (in this repo)

Key rules:
- One batch/cascade at a time. Never launch two in the same message.
- Sequential means wait. Don't submit until the previous run completes.
- Cancel via Gateway API, never pkill. The CLI is a poller — the Gateway
  owns the work. `curl -X POST http://elostirion:8400/forge/cancel-all`
- Cold Anvil runs are hidden by default on the dashboard. Always use
  `?project=cold_anvil` when checking active runs:
  `curl -s "http://elostirion:8400/dashboard/api/forge?project=cold_anvil"`
- Check for active runs before every submission. No exceptions.

## How We Work

- Design first. Specs before code. Research before specs.
- Evidence first. Check before assuming.
- One thing at a time. Don't stack untested changes.
- No `Co-Authored-By` in commits.

# context-mode — MANDATORY routing rules

You have context-mode MCP tools available. These rules are NOT optional — they protect your context window from flooding. A single unrouted command can dump 56 KB into context and waste the entire session.

## BLOCKED commands — do NOT attempt these

### curl / wget — BLOCKED
Any shell command containing `curl` or `wget` will be intercepted and blocked by the context-mode plugin. Do NOT retry.
Instead use:
- `context-mode_ctx_fetch_and_index(url, source)` to fetch and index web pages
- `context-mode_ctx_execute(language: "javascript", code: "const r = await fetch(...)")` to run HTTP calls in sandbox

### Inline HTTP — BLOCKED
Any shell command containing `fetch('http`, `requests.get(`, `requests.post(`, `http.get(`, or `http.request(` will be intercepted and blocked. Do NOT retry with shell.
Instead use:
- `context-mode_ctx_execute(language, code)` to run HTTP calls in sandbox — only stdout enters context

### Direct web fetching — BLOCKED
Do NOT use any direct URL fetching tool. Use the sandbox equivalent.
Instead use:
- `context-mode_ctx_fetch_and_index(url, source)` then `context-mode_ctx_search(queries)` to query the indexed content

## REDIRECTED tools — use sandbox equivalents

### Shell (>20 lines output)
Shell is ONLY for: `git`, `mkdir`, `rm`, `mv`, `cd`, `ls`, `npm install`, `pip install`, and other short-output commands.
For everything else, use:
- `context-mode_ctx_batch_execute(commands, queries)` — run multiple commands + search in ONE call
- `context-mode_ctx_execute(language: "shell", code: "...")` — run in sandbox, only stdout enters context

### File reading (for analysis)
If you are reading a file to **edit** it → reading is correct (edit needs content in context).
If you are reading to **analyze, explore, or summarize** → use `context-mode_ctx_execute_file(path, language, code)` instead. Only your printed summary enters context.

### grep / search (large results)
Search results can flood context. Use `context-mode_ctx_execute(language: "shell", code: "grep ...")` to run searches in sandbox. Only your printed summary enters context.

## Tool selection hierarchy

1. **GATHER**: `context-mode_ctx_batch_execute(commands, queries)` — Primary tool. Runs all commands, auto-indexes output, returns search results. ONE call replaces 30+ individual calls.
2. **FOLLOW-UP**: `context-mode_ctx_search(queries: ["q1", "q2", ...])` — Query indexed content. Pass ALL questions as array in ONE call.
3. **PROCESSING**: `context-mode_ctx_execute(language, code)` | `context-mode_ctx_execute_file(path, language, code)` — Sandbox execution. Only stdout enters context.
4. **WEB**: `context-mode_ctx_fetch_and_index(url, source)` then `context-mode_ctx_search(queries)` — Fetch, chunk, index, query. Raw HTML never enters context.
5. **INDEX**: `context-mode_ctx_index(content, source)` — Store content in FTS5 knowledge base for later search.

## Output constraints

- Keep responses under 500 words.
- Write artifacts (code, configs, PRDs) to FILES — never return them as inline text. Return only: file path + 1-line description.
- When indexing content, use descriptive source labels so others can `search(source: "label")` later.

## ctx commands

| Command | Action |
|---------|--------|
| `ctx stats` | Call the `stats` MCP tool and display the full output verbatim |
| `ctx doctor` | Call the `doctor` MCP tool, run the returned shell command, display as checklist |
| `ctx upgrade` | Call the `upgrade` MCP tool, run the returned shell command, display as checklist |
