# The Docs Consolidation Plan

*Executable checklist. Every line is an operation. Nothing is "we'll decide later".*

---

## Source of truth, post-respec

After this plan runs, the canonical Cold Anvil documentation is exactly six files. Everything else is archived, redirected, or deleted.

The six:

1. **`Forging_The_Anvil/respec/03-spec.md`** — **The spec.** What Cold Anvil is, who it's for, what Annie delivers, what counts as success. This is the load-bearing document. When anything else conflicts with this file, this file wins.
2. **`Forging_The_Anvil/respec/01-journey.md`** — **The retrospective.** Why the spec is shaped the way it is. Read this when a future decision feels tempting but contradicts the spec — the journey review probably contains the story of why we already tried that.
3. **`Forging_The_Anvil/respec/02-product-state.md`** — **The baseline.** What existed the day the respec was written. Read this when assessing progress — if the product doesn't do materially better than the baseline, the rewrite hasn't landed yet.
4. **`Forging_The_Anvil/BACKGROUND-AND-VISION.md`** — **The origin story.** Kept because it's still true, still useful, and holds context the spec deliberately doesn't restate. The Fourth Age mapping section stays because it's part of the long-term strategic picture.
5. **`Forging_The_Anvil/Business_Plan/business_plan.md`** — **The business.** Kept because the pricing, unit economics, and GTM analysis are still valid. The spec refines the product but does not contradict the business model.
6. **`Forging_The_Anvil/CLAUDE.md`** (updated) — **The session-start pointer.** Updated to point at the six files above and explicitly archive the rest.

Nothing outside these six is authoritative. If you are about to write something that is neither `respec/` nor one of the three existing docs above, you are probably writing something that should be a conversation with Jack instead.

---

## Archive target

Create a new directory to hold superseded material:

```
mkdir -p /home/jack/Forging_The_Anvil/archive/2026-04-14-prerespec
```

Everything that moves into this directory keeps its original relative path structure so diffs still make sense (e.g. `Cold_Anvil/docs/ARCHITECTURE.md` → `archive/2026-04-14-prerespec/Cold_Anvil/docs/ARCHITECTURE.md`).

Every archived file gets a one-line header prepended to it before the move, in the form:

```
> **ARCHIVED 2026-04-14.** Superseded by `/home/jack/Forging_The_Anvil/respec/03-spec.md`. Read the respec first; this file is preserved for historical context only.
```

This header is visible at the top of the file in any editor, any git diff, any grep output. Nobody can accidentally treat an archived file as current.

---

## Operations — checklist form

Run these in order. Each block is atomic; pause between blocks and verify before moving on.

### Block 1 — Create the archive and move the stale docs directory

```bash
mkdir -p /home/jack/Forging_The_Anvil/archive/2026-04-14-prerespec/Cold_Anvil/docs

# Archive the three "big" docs that the respec replaces
for f in ARCHITECTURE.md IMPLEMENTATION_STATUS.md ROADMAP.md; do
  mv "/home/jack/Forging_The_Anvil/Cold_Anvil/docs/$f" \
     "/home/jack/Forging_The_Anvil/archive/2026-04-14-prerespec/Cold_Anvil/docs/$f"
done
```

Then prepend the archive header to each of the three moved files (do this by hand or with a small sed invocation; the header must land on line 1 of each file).

**Verification.** `ls Cold_Anvil/docs/` should now show only `DECISIONS.md` (see Block 2) and any other files that weren't touched.

### Block 2 — Preserve DECISIONS.md as a historical record, not as source of truth

`DECISIONS.md` is 1571 lines of append-only decision log. Most of its content is outdated the moment the spec ships, but it is *the single best record of what we tried and why*. Do not delete it. Move it into the archive with a stronger header:

```bash
mv /home/jack/Forging_The_Anvil/Cold_Anvil/docs/DECISIONS.md \
   /home/jack/Forging_The_Anvil/archive/2026-04-14-prerespec/Cold_Anvil/docs/DECISIONS.md
```

Prepend this header:

```
> **ARCHIVED 2026-04-14.** This is a historical decision log covering 2026-03-18 through 2026-04-14. Many decisions here have been superseded by `/home/jack/Forging_The_Anvil/respec/03-spec.md`. Read this file for context on *why* past choices were made, not for current guidance. New decisions post-respec go in a new `DECISIONS.md` in the root of the new implementation, not here.
```

**Verification.** `Cold_Anvil/docs/` should now be empty or near-empty. If there are stray files, move them too (case-by-case).

### Block 3 — Archive all prior plans

The `.claude/plans/` directory is sprawling, and none of the plans survive the respec — they were all either executed-and-superseded or are describing an architecture we are rewriting.

```bash
mkdir -p /home/jack/Forging_The_Anvil/archive/2026-04-14-prerespec/Cold_Anvil/.claude

mv /home/jack/Forging_The_Anvil/Cold_Anvil/.claude/plans \
   /home/jack/Forging_The_Anvil/archive/2026-04-14-prerespec/Cold_Anvil/.claude/plans
```

Add a single `README.md` inside the archived `plans/` directory:

```
> **ARCHIVED 2026-04-14.** Every plan in this directory was written pre-respec. They are preserved because the *pattern* of what we planned vs. what shipped is itself a valuable learning (see `respec/01-journey.md`), not because any individual plan is still the plan.
```

**Verification.** `.claude/plans/` directory in Cold_Anvil should no longer exist. Any tool that expected it will error clearly instead of reading stale plans.

### Block 4 — Archive the autonomous_run reviews

These direct-review reports are valuable evidence but describe a product state the respec is explicitly moving away from. Preserve them, mark them historical.

```bash
mkdir -p /home/jack/Forging_The_Anvil/archive/2026-04-14-prerespec

mv /home/jack/Forging_The_Anvil/autonomous_run \
   /home/jack/Forging_The_Anvil/archive/2026-04-14-prerespec/autonomous_run
```

Add a header to each report file (or a single README in the moved directory):

```
> **ARCHIVED 2026-04-14.** These direct-review reports are the evidence behind the respec. They are the reason Cold Anvil stopped trusting the grade pipeline and started opening browsers. Preserved as historical evidence. New direct-review reports post-respec belong in a new `direct-reviews/` directory, not here.
```

### Block 5 — Archive the agentic-vision and agentic-roadmap docs at the root

These describe a long-vision that is partially captured by `respec/03-spec.md` and partially speculative. Move them.

```bash
mv /home/jack/Forging_The_Anvil/AGENTIC-VISION.md \
   /home/jack/Forging_The_Anvil/archive/2026-04-14-prerespec/AGENTIC-VISION.md

mv /home/jack/Forging_The_Anvil/AGENTIC-ROADMAP.md \
   /home/jack/Forging_The_Anvil/archive/2026-04-14-prerespec/AGENTIC-ROADMAP.md

mv /home/jack/Forging_The_Anvil/AGENTS.md \
   /home/jack/Forging_The_Anvil/archive/2026-04-14-prerespec/AGENTS.md
```

These are archived, not deleted, because the Annie-as-agents-leader framing in them remains conceptually load-bearing and the respec may need to refer back to them for long-term direction.

Prepend archive header to each.

### Block 6 — Keep `ROHAN-FLEET-STRATEGY.md` and `FORGE-OPERATIONS.md` in place

These two operational docs describe live infrastructure (the Arnor fleet and the cascade-running operational rules) that are still accurate because the respec does *not* change the substrate — Arnor Gateway is still the execution layer.

Do not archive. Do not modify. Add a single line at the top of each:

```
> *Operational guide for the Arnor substrate. Not product-facing. The product spec lives at `/home/jack/Forging_The_Anvil/respec/03-spec.md`.*
```

### Block 7 — Research directory

`Research/` contains competitor analysis, LLM-as-judge papers, pricing research, GTM research, and session retrospectives. All of it is still valuable. None of it is source-of-truth documentation. Keep in place. Add a single `README.md` to the root of `Research/` linking back to the respec:

```markdown
# Research

External research and learnings that informed Cold Anvil's design.
**The current product spec is at `/home/jack/Forging_The_Anvil/respec/03-spec.md`.**
Files in this directory are evidence, not directives. When a file here
conflicts with the spec, the spec wins.
```

### Block 8 — Product_Specs directory

`Product_Specs/` contains the original user-journey, conversational-flows, and product-frame specs. These are partially superseded by the respec but contain detailed per-step work (especially conversational flow design) that the respec relies on. Keep in place. Add the same kind of README:

```markdown
# Product_Specs

Detailed specs for individual product components.
**The current product spec is at `/home/jack/Forging_The_Anvil/respec/03-spec.md`.**
Files here describe subcomponents Annie uses. When anything here conflicts
with the respec, the respec wins.

Still current:
- `conversational-flows.md` (Annie's conversation architecture)
- `user-journey.md` (the step-by-step experience)

Superseded but preserved:
- `PRODUCT_FRAME.md` — superseded by respec/03-spec.md
```

Prepend the "ARCHIVED" header to `PRODUCT_FRAME.md` specifically if it exists; leave the other two files alone.

### Block 9 — Cold_Anvil CLAUDE.md update

Rewrite `Cold_Anvil/CLAUDE.md`'s "Session Start" section to point at the respec instead of the archived docs. Replace the existing block:

```
## Session Start

Read these before doing anything:
- docs/ARCHITECTURE.md — system design and deployment modes
- docs/DECISIONS.md — prior decisions and rationale
- docs/IMPLEMENTATION_STATUS.md — what's built vs planned
```

with:

```
## Session Start

Read these before doing anything:
- ../respec/03-spec.md — THE spec. Who Cold Anvil is for, what Annie delivers, non-negotiables.
- ../respec/01-journey.md — The retrospective. Read this before proposing anything that feels like a "clever fix" — we probably tried it and it didn't work.
- ../respec/02-product-state.md — The baseline. What existed on 2026-04-14 before the rewrite began.

Archived (historical context only):
- ../archive/2026-04-14-prerespec/Cold_Anvil/docs/ARCHITECTURE.md
- ../archive/2026-04-14-prerespec/Cold_Anvil/docs/DECISIONS.md
- ../archive/2026-04-14-prerespec/Cold_Anvil/docs/IMPLEMENTATION_STATUS.md
```

Leave the rest of `CLAUDE.md` alone. The forge-operations rules, the Annie identity section, the deployment notes — all still accurate.

### Block 10 — Root CLAUDE.md update

Same change, one directory up. `/home/jack/Forging_The_Anvil/CLAUDE.md`'s existing workspace layout section is still accurate — the layout is the same. Add a new first section before everything else:

```
## Start Here

The Cold Anvil product spec lives at `/home/jack/Forging_The_Anvil/respec/03-spec.md`.
If you're here to work on the product, read that first, then read
`respec/01-journey.md` for context. Everything else is either
implementation detail, business plan, or historical record.
```

### Block 11 — Delete the runtime artefacts

These are generated outputs, not documentation. Clean them out to reduce noise:

```bash
# JSONL benchmark artefacts — these are tracked nowhere but take up space
# and confuse new readers
rm /home/jack/Forging_The_Anvil/Cold_Anvil/forge/benchmarks/iterative_benchmark_results.jsonl
rm /home/jack/Forging_The_Anvil/Cold_Anvil/forge/benchmarks/iterative_benchmark_results_broken_visual_20260406_1352.jsonl
rm /home/jack/Forging_The_Anvil/Cold_Anvil/forge/benchmarks/iterative_benchmark_results_phase1_v2_incomplete.jsonl
rm /home/jack/Forging_The_Anvil/Cold_Anvil/forge/benchmarks/iterative_benchmark_results_phase1_visual_every_pass.jsonl
rm /home/jack/Forging_The_Anvil/Cold_Anvil/forge/benchmarks/iterative_benchmark_results_pre_fix_20260406.jsonl
rm /home/jack/Forging_The_Anvil/Cold_Anvil/forge/benchmarks/iterative_benchmark_results_regraded.jsonl
rm /home/jack/Forging_The_Anvil/Cold_Anvil/forge/benchmarks/regrade_historical_report.md
```

Do **not** delete the broader `Cold_Anvil/forge/` directory — the prompts, rubrics, gates, and cascade configs in it are still the operational config the substrate uses, and the respec does not explicitly rewrite them yet. They become the first thing to reshape after spec approval.

### Block 12 — /tmp cleanup (optional, safe)

The `/tmp/coldanvil_incremental_*` directories are hundreds of old cascade outputs. They are the evidence base for `02-product-state.md`, but after the respec lands they are just noise. Do not delete them in this pass — they're referenced by the journey review. After a week, if nothing cites them, clean them:

```bash
# Run this AFTER one week has passed, and AFTER confirming nothing in
# /home/jack/Forging_The_Anvil/respec/ still cites a specific /tmp/ path
find /tmp/coldanvil_incremental_* -maxdepth 0 -type d -mtime +7 -exec rm -rf {} +
```

---

## What this does not do (deliberately)

- **Does not delete code.** The Cold_Anvil codebase is preserved in its entirety. The respec describes a rewrite of the spec, not of the substrate. Implementation planning comes after spec approval.
- **Does not delete DECISIONS.md.** It moves to the archive. The historical record is load-bearing evidence for *why* the respec exists, and `respec/01-journey.md` cites specific entries in it.
- **Does not touch `forge/prompts/`, `forge/rubrics/`, `forge/gates/`, or `forge/cascades/`.** These are Annie's current tool belt. They will be reshaped during implementation but the respec is not the place to redesign them.
- **Does not update `DEVELOPER.md`** (if it exists). It's infrastructure docs and survives the respec untouched.
- **Does not modify any git history.** Everything here is file-system operations. Nothing rewrites commits.
- **Does not delete any plan that isn't already superseded.** The sprint plans for Gateway work on other projects (Fourth Age, Arnor Platform, etc.) are not in Cold Anvil's `.claude/plans/` and are not touched.

---

## Success criteria for this consolidation

When this plan has been executed:

1. Running `ls /home/jack/Forging_The_Anvil/respec/` shows four files: `01-journey.md`, `02-product-state.md`, `03-spec.md`, `04-consolidation.md`.
2. Running `ls /home/jack/Forging_The_Anvil/Cold_Anvil/docs/` shows at most a `DEVELOPER.md` and a `README.md`. No stale architecture or roadmap docs.
3. Running `ls /home/jack/Forging_The_Anvil/archive/2026-04-14-prerespec/` shows the moved directory tree with original paths preserved and archive headers prepended.
4. Running `grep -r "ARCHIVED 2026-04-14" /home/jack/Forging_The_Anvil/archive/` shows a match at the top of every archived file.
5. A new contributor opening `Forging_The_Anvil/CLAUDE.md` in a fresh session sees the respec as the first thing pointed at, and reads it before touching anything else.
6. The next implementation session starts by reading `respec/03-spec.md` and nothing else, and produces a build plan from the spec without re-deriving user research, business model, or architectural decisions.

When all six criteria are met, the consolidation is complete and the team (including me) can begin work against a single source of truth for the first time in this project's life.
