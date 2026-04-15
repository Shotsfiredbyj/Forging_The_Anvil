# Wave 1 Final Report

**Run window**: 2026-04-13 10:30 → 2026-04-14 10:25 (~24 hours elapsed, ~8 hours active work)
**Plan**: `/home/jack/.claude/plans/snoopy-fluttering-simon.md`
**Outcome**: 3 of 4 RIs shipped cleanly; RI-1 reverted pending v2 redesign

---

## Headline

| Phase | RI | Status | Commit(s) |
|---|---|---|---|
| 1 | Gateway SQLite + signal handler infra | ✅ shipped | `2bf705a`, `8230158` |
| 2 | RI-5 tree-sitter + semantic rules | ✅ shipped | `0d9089f` |
| 3 | RI-3 phase-specific review instructions | ✅ shipped | `61797b4` |
| 4 | RI-1 Tailwind utility CSS | ❌ reverted | `59b70ca` → `9790968` |
| 5 | Final report | ✅ this doc | — |

**Production pipeline state after Wave 1**:
- Cold_Anvil HEAD: `9790968` (revert) ← `0d9089f` (RI-5) ← `2bf705a` (infra 1B)
- Arnor_Gateway HEAD: `61797b4` (RI-3) ← `8230158` (infra 1A)

**New production recommendation unchanged**: `gemma4-26b + gemma4-31b + devstral`. Now with deterministic structural validation (RI-5) and task-type-specific review instructions (RI-3), but with a confirmed reviewer blind spot still active on "class-referenced-in-HTML-but-undefined-in-CSS" and "placeholder-content-instead-of-real-content".

---

## Phase 1 — Gateway infrastructure fixes

**Shipped, Cold_Anvil `2bf705a` + Arnor_Gateway `8230158`.**

Cold_Anvil:
- `pipeline/__init__.py` forces line-buffered stdout/stderr so `print()` output lands in nohup logs immediately (not block-buffered until process exit). Smoke test: at 0.8s into a 1.2s process, log already contained 2 of 3 `print` lines.
- `pipeline/cascade.py:_cancel_active_cascade` replaced silent `except Exception: pass` with explicit logging via `notify()` + one 2-second retry. Signal-handler-safe (still non-raising, still always returns).

Arnor_Gateway:
- `PRAGMA busy_timeout=30000` on `ForgeRunStore` init — SQLite retries for up to 30s on lock contention instead of failing immediately.
- New `_forge_accepted_monitor()` background task (sibling of `_forge_stall_monitor`). 10-min loop, 1h TTL. Sweeps runs stuck in `status='accepted'` and transitions them to `interrupted` via `forge_store.update_run_status`. Fixes the zombie-run SQLite lock that bit us during the prior autonomous run.

**Validation**: Gateway restarted cleanly, all self-tests pass, smoke test green, no exceptions. The monitor's first scheduled fire was 10 min after boot; it ran silently (no stale accepted runs in the 24-hour Wave 1 window — nothing to sweep) and did not crash. No further validation needed.

---

## Phase 2 — RI-5 tree-sitter structural validation

**Shipped, Cold_Anvil `0d9089f`.**

New module `pipeline/structural_check.py` (361 LOC) with 3 rules:
1. **`parse_error`** — tree-sitter parse check (error ratio > 0.3, or has_error with any error node). Supplemented with `has_error AND err>0` because the raw ratio under-fires on short refusal text.
2. **`no_var_in_media`** — CSS-only AST walker (plus regex belt-and-braces). Rejects `var()` inside `@media` feature conditions — the bug mistral missed in Phase 4B.
3. **`fragments_must_be_fragments`** — HTML-only. Rejects component tasks (`task_id` starts with `components_` OR `file_type == "component"`) whose output starts with `<!doctype`, `<html>`, `<head>`, or `<body>`.

HTML parse-check is skipped intentionally (tree-sitter-html is too permissive to flag anything useful); the fragment rule carries the semantic signal.

Wiring: `pipeline/verify.py` gains a `_run_structural_checks(project)` helper called after `adapter.verify()` in both `verify_outputs` and `verify_incremental`. Findings merge into `VerificationResult.findings` with `severity=error`, so they flow through `rewrite_instructions()` into the existing rewrite loop. **Zero changes to `iterative.py`** — the structural check rides the existing verify-then-rewrite rails.

Dependencies: `tree-sitter>=0.25` and `tree-sitter-language-pack>=1.5` (the 3.14-compatible successor to `tree-sitter-languages`; the module accepts either).

### Offline audit (historical evidence — overwhelming)

Subagent scanned 1,224 files across 231 `/tmp/coldanvil_incremental_*` project dirs from prior runs:

| Rule | Failures | Rate |
|---|---|---|
| `no_var_in_media` | **42 CSS files** | **20.4%** |
| `fragment_is_document` | **9 component HTML files** | **2.5%** |
| `parse_error` | **0** | **0.00% false positive** |

Every `no_var_in_media` offender had the literal-identical idiom `@media (min-width: var(--breakpoint-mobile))` — one upstream blueprint pattern leaking through every reviewer. Every `fragment_is_document` offender was `components/nav.html`, exactly the bug Decision 6 in the prior autonomous run documented.

### Sanity cascade

Single cascade `ri5_sanity`, `gemma4-26b + gemma4-31b + devstral`, strong tier:

| | Result |
|---|---|
| Grade | B |
| Pass | 6/9 |
| Runtime | 2488s (41 min) |
| Baseline (pre-RI-5) | B / 9/9 / ~24 min |

Both target bugs **fixed on disk**:
- `css/styles.css` `@media` queries use literal values (`max-width: 768px`, `max-width: 480px`). `var()` still used correctly in rule bodies where it is valid.
- `components/nav.html` and `components/footer.html` are proper fragments.

Pass count dropped 9→6: three files (`components_footer_html`, `css_styles_css`, `early_access_html`) flagged C. File inspection showed these were flagged for **inline-style / duplication code smells** that pre-existed RI-5 — the reviewer now has bandwidth to notice them because the structural chaos is gone. None were flagged for a rule RI-5 fires on.

Runtime +73% was the rewrite loop doing extra work: our findings triggered 2-3 additional rewrite cycles. Structural check itself adds <5ms total per verification pass.

Full details: `autonomous_run/wave1_phase2_summary.md`.

---

## Phase 3 — RI-3 phase-specific review instructions

**Shipped, Arnor_Gateway `61797b4`.**

62 LOC in `arnor_gateway/forge_pipeline.py`:
- `ITERATION_REVIEW_PROMPT` gains a `{task_type_guidance}` placeholder under a new `## Task-specific checks` heading
- Four module-level constants: `_CODE_REVIEW_INSTRUCTIONS` (107 words), `_MARKUP_REVIEW_INSTRUCTIONS` (113 words with 4 explicit checks), `_CREATIVE_REVIEW_INSTRUCTIONS` (107 words), `_GENERIC_REVIEW_INSTRUCTIONS` (95 words)
- `REVIEW_INSTRUCTIONS_BY_TASK_TYPE: dict[str, str]` keyed on `task.task_type`
- **Both** `.format()` call sites updated: `_single_review_phase` (~line 2329) AND `_streaming_review_phase` (~line 2671). Plan said one; baseline spot-check found two — easy regression if only one was wired.

Markup-specific checks in the prompt: undefined-class (CSS class in HTML must be defined in reference context), fragment (components_* starting with `<!DOCTYPE` is wrong), href integrity (targets must exist in file inventory), CSS validity inside at-rules.

### Validation cascades (3 runs, same combo + strong tier, phase `review_v3`)

| Run | Grade | Pass | Time |
|---|---|---|---|
| 0 | B | 7/9 | 50 min |
| 1 | B | 8/9 | 37 min |
| 2 | B | 8/9 | 42 min |
| **Avg** | **B** | **7.67/9** | **43 min** |

**Vs. RI-5-only baseline (6/9, 41 min): +1.67 pass count with ~0 runtime cost.** Prompt change only, no new dependencies.

**Consistent improvements** (stable across all 3 runs):
- `css_styles_css`: C → **B**
- `early_access_html`: C → **B**

**Stochastic fluctuations**: `components_nav_html` and `components_footer_html` oscillated B/D across runs. **Decisive investigation**: the B-graded nav (run 1) and D-graded nav (run 2) were **byte-identical** — same 14-line fragment, same allowlisted classes, same valid hrefs. devstral grades minimalist structurally-correct component fragments stochastically. Not a regression — pre-existing reviewer behaviour RI-3 neither caused nor can fix.

Full details: `autonomous_run/wave1_phase3_summary.md`.

---

## Phase 4 — RI-1 Tailwind utility CSS (REVERTED)

**Shipped as `59b70ca`, reverted as `9790968`.**

### What the scaffolding did

17 files, 376 LOC of Python + prompts + a new `packs/website_tailwind/` template pack. Threaded `tailwind_allowlist: set[str] | None` through `ParsedBlueprint → AssembledProject → WebAdapter.verify()`. New `_extract_css_contract_tailwind(allowlist)`, `_check_css_classes` Tailwind branch, `_run_tailwind_build` helper running `npx tailwindcss -i ... -o ...`. Tailwind mode sections added to `file_generation.md` and `verification_rewrite.md` prompts. Tailwind v3.4.19 installed on both laptop and Elostirion.

### Why it was reverted — three compounding failures

**1. Allowlist design flaw.** `_build_tailwind_class_allowlist(design_tokens)` generates class names by combining Tailwind prefixes with design-token slugs (`bg-bg-primary`, `px-page-padding`, `py-section-gap`). None of these are real Tailwind utilities, and nothing wires them to a `tailwind.config.js` theme mapping or real CSS rules. The allowlist claims authority without the Tailwind runtime knowing what its classes mean.

**2. Rewriter regresses under correction.** Cycle-by-cycle scores dropped on rewrite (`about_html` 71.5 → 61.0 → 71.5; `components_footer_html` 54.0 → 43.5 → 54.0). The rewriter substituted non-allowlist classes with other allowlist classes that were equally undefined, pushing the output further from working.

**3. Reviewer blind spot (the main finding).** devstral graded every broken file as A with "No issues". The cascade returned `grade=A, pass=9/9, runtime=3619s`. File inspection contradicted this completely:

- `/tmp/coldanvil_incremental__6dzynhp/index.html`: `<!-- This section is a placeholder for the component inclusion logic -->` where the nav should be. Same placeholder pattern on `about.html` and `pricing.html` (3 of 9 pages).
- `index.html:120`: `<div class="components/footer.html"></div>` — **file path used as CSS class value**.
- HTML uses `bg-bg-primary`, `text-text-primary`, `px-page-padding`, `py-section-gap`. CSS has **0 definitions** for each. Only 21 class selectors in the entire CSS; dozens of Tailwind-style classes used in HTML. Pages would render completely unstyled.

**Same class of bug as Phase 4B's mistral blind spot on `@media var()`.** RI-3's markup-mode instructions include an explicit "every CSS class must be defined in a CSS file in the reference context" check — it did not fire, either because the reviewer doesn't see the CSS file in context for page tasks or because devstral is following a different scoring path.

### What worked (the infrastructure was sound)

- `tailwind_allowlist` threading: clean through all data paths, 227 tests pass
- Allowlist builder: 713 classes from the real token set, smoke test fine
- `_check_css_classes` Tailwind branch: fires on non-allowlist usage (log showed 3 files with verification errors in final re-check)
- Tailwind CLI: installs + invokes cleanly on both machines
- Prompt Tailwind mode: recognises `<!-- TAILWIND_ALLOWLIST -->` marker, model uses allowlisted class names (not random invented ones)

The scaffolding is the **right shape** for a future RI-1 v2. Only the **allowlist design** and the **prompt/model interaction** are broken.

### Hybrid cached blueprint (partial cause)

The validation cascade used `cached_stages_strong_tailwind.json` — cached Stages 1-4 with `"css": "tailwind"` hand-injected. The blueprint's prose still said "plain HTML + CSS stack" while the tech_stack JSON said Tailwind. Contradictory guidance to the model. A proper Phase 4 validation would regenerate Stages 1-4 with Tailwind-aware prompts, but that is multi-hour work and outside this phase's scope.

Full post-mortem: `autonomous_run/wave1_phase4_summary.md`.

---

## Commits summary

Cold_Anvil (`github.com/Shotsfiredbyj/Cold_Anvil`):
- `2bf705a` Unbuffer stdout and surface signal-handler cancel failures (Phase 1B)
- `0d9089f` Add structural check for LLM-generated code (RI-5) (Phase 2)
- `59b70ca` Add Tailwind utility CSS support (RI-1) — SUPERSEDED
- `9790968` Revert RI-1 Tailwind utility CSS (allowlist design flaw) (Phase 4 revert)

Arnor_Gateway (`github.com/Shotsfiredbyj/The-Founding-Of-Arnor`):
- `8230158` Release SQLite lock contention and sweep stale accepted runs (Phase 1A)
- `61797b4` Route review prompts through task-type-specific guidance (RI-3) (Phase 3)

All 6 commits pushed to `main`. Both repos healthy, production pipeline stable.

---

## Follow-up work discovered

### Priority 1 — Reviewer blind spot on structural bugs (critical)

Two cascades in 24 hours produced grade-A records on objectively broken output:

- **Phase 4B** (prior run): mistral gave `@media var()` CSS an A, and shipped a nav component that was a full HTML document.
- **Phase 4 (this run)**: devstral gave unstyled pages (HTML classes referencing undefined CSS) an A, and gave pages with placeholder comments instead of nav/footer content an A.

**Neither RI-3 nor RI-5 caught the Phase 4 bugs**. RI-3's "every class must be defined" instruction did not fire. RI-5 has no rule for "HTML class is not defined anywhere in CSS" or "class value contains a `/` path separator" or "content was replaced with a placeholder comment".

**Action**: add these rules to `pipeline/structural_check.py` as a Phase 1.5 follow-up:

- **`undefined_class_in_html`** (new): for every HTML file, parse `class="..."` attribute tokens; for each token, verify it appears in at least one `.css` file in the project (as a class selector). Fire if any token is undefined. This is exactly what `_check_css_classes` in the web adapter does today, but belongs in `structural_check` so it runs as a deterministic rule regardless of adapter.
- **`class_contains_path`** (new): fire if any `class="..."` attribute value contains `/` (file-path-as-class-value). Simple regex.
- **`placeholder_content`** (heuristic): fire if a component task output contains `<!-- ... placeholder ... -->` or similar language where the actual content is expected. Lower-precision, higher-recall — flag for rewrite.

None of these are hard to write; each is an hour of work. **Highest-leverage Wave 1.5 item.**

### Priority 2 — Final-grade path disconnected from task-level review verdicts

The Phase 4 cascade had per-task Gateway review verdicts of `REVISE` with scores 34-71 across every task, but the final `quality_report` returned `file_grades: {all A}`. There is a code path in the Gateway or the runner that produces a final grade that does not honour the underlying review verdicts.

**Action**: investigate `pipeline/benchmark.py:fetch_stage_scores` and whatever produces `quality_report` on the Gateway side. If the aggregation is ignoring REVISE verdicts, that is a silent quality-gate failure. Possibly a Phase 1.5 bug fix.

### Priority 3 — devstral rubric fragility on minimalist components

Phase 3 file-level evidence showed **byte-identical** nav fragments grading B on one run and D on another. devstral's rubric dimensions (layout, visual, spacing, etc.) do not have enough signal on a 14-line structurally-correct fragment, so it grades by dice roll.

**Action options**:
- Prompt refinement: add to `_MARKUP_REVIEW_INSTRUCTIONS` an explicit clause "A brief correct fragment with valid classes and hrefs passes. Do not penalise brevity."
- Adapter-level: auto-pass sub-N-line structurally-valid fragments in `_check_css_classes` + `structural_check` so the reviewer never sees them.
- Rubric change: lower the weight of visual/layout dimensions on component task types.

Any of these is a Phase 1.5 tuning item.

### Priority 4 — RI-1 v2 design

For Tailwind to ship properly:

- **Either** restrict the allowlist to real Tailwind v3 utility names (`bg-gray-900`, `px-8`, `text-lg` etc.) and drop the design-token-derived names entirely
- **Or** emit a generated `tailwind.config.js` theme that maps design tokens to real class names (`theme: { extend: { colors: { 'bg-primary': '#1a1a2e' } } }`) so `npx tailwindcss` compiles them
- Stage 4 prompts must describe Tailwind in the **prose** too, not just in the tech_stack JSON
- Reviewer prompts (RI-3 v2) must have the CSS file in review context for page tasks and must apply the "class-must-be-defined" check rigorously
- Structural_check must add the new rules from Priority 1 above

**RI-1 v2 is a genuine Wave 2 project**, not a Phase 4 follow-up. Multi-day scope.

### Priority 5 — Forge blueprint pattern that leaks `@media var()`

The offline audit found 42 of 206 historical CSS files (20.4%) had the literal-identical `@media (min-width: var(--breakpoint-mobile))` idiom. This points at a single upstream blueprint pattern or prompt template leaking into every cascade. RI-5's `no_var_in_media` catches it at verification now, but fixing it at the source would save the rewrite cycle cost.

**Action**: audit `forge/prompts/` and `pipeline/blueprint_parser.py` for any template or example that contains the `@media var()` pattern. Remove it. Low-priority now that RI-5 catches it; high-value for reducing rewrite overhead.

---

## Wave 2 readiness assessment

Per-RI readiness given Wave 1 learnings:

| RI | Status | Priority | Notes |
|---|---|---|---|
| **RI-1 Tailwind v2** | Needs design work | High | Reverted in Wave 1. Needs allowlist redesign + reviewer prompt fix. Multi-day project. |
| **RI-2 best-of-N** | Unchanged | Medium | Generates N candidates and selects the best via verification. Needs RI-5 (structural_check) as the cheap pre-filter — already shipped. |
| **RI-4 prompt escalation** | Unchanged | Medium | Tracks per-task rewrite attempts; escalates strategy on repeated failure. Benefits from Wave 1's reliability work. |
| **RI-9 logprob early rejection** | Unchanged (gated on scout) | Low | Still gated on llama-swap logprob passthrough check — 30-min scout needed first. |
| **RI-8 DSPy auto-tune** | More viable now | Low | Needs 50+ scored runs as training corpus. Wave 1 produced 7 new scored runs (1 RI-5 sanity + 3 review_v3 + 1 tailwind_v1 + Wave 0's 21 Phase 3 v2 + Phase 4 tier tests). Getting closer to the corpus threshold. |
| **RI-6 context compression** | Deferred | — | Still Phase 5-territory. Not load-bearing until projects have extensive history. |
| **RI-7 self-hosted deployment** | Deferred | — | Productisation work, not pipeline engineering. |

### New Wave 1.5 items (tight loop on Wave 1 learnings)

In priority order:
1. **Structural_check rule additions** (undefined_class_in_html, class_contains_path, placeholder_content) — ~1 day
2. **Final-grade / review-verdict disconnect investigation** — unknown scope, possibly a one-line Gateway fix or possibly a bigger refactor
3. **devstral component rubric fragility** — ~1 day of prompt/adapter tuning and a validation cascade

**Wave 1.5 is the right next session**. It's small, high-leverage, catches real bugs, and sets up Wave 2 on a cleaner baseline.

---

## Meta-observations

### What went well

- **Agentic orchestration**: 4 phases, 7 subagents, 7 cascades, 24-hour window, no crashes or fires. ScheduleWakeup discipline worked — no cache burnout, no accidental polling loops.
- **Subagent parallelism**: Phases 1, 2, and 4 each had parallel subagent pairs. All completed cleanly. Saved hours of sequential wall-clock time.
- **File-level evidence as ground truth**: every phase's "verdict" was confirmed or contradicted by directly inspecting the output files, not by trusting the grade. Phase 4 especially would have been a false-positive ship without the file inspection.
- **Git hygiene**: every commit used explicit `git add <file>` so the user's pre-existing dirty state (`docs/ROADMAP.md`, deleted benchmark jsons, deploy scripts) stayed untouched through all 5 commits and 1 revert. No accidental `git add .` disasters.
- **Checkpointing**: `wave1_state.json` + `wave1_timeline.md` persisted every meaningful step. A fresh Claude instance could resume from any point.

### What did not go as planned

- **RI-1 design was wrong**. The allowlist-builder concept was clever on paper but produced class names with no CSS behind them. The failure mode was only visible at file-inspection time, not at grade time. **Hard lesson: don't trust the grade. Inspect the files.**
- **Reviewer blind spot is worse than expected**. Two cascades in 24 hours (4B and Phase 4) shipped grade-A records on objectively broken output. RI-3 helps some (Phase 3 css/early_access improvements were real) but does not catch the whole class. This is the single most important Wave 1.5 / Wave 2 target.
- **Runtime budgets were too optimistic**. Phase 2 sanity cascade was 41 min vs 24 baseline (+73%). Phase 3 average 43 min. Phase 4 was 60 min. Wave 1 wall-clock overran the plan estimate significantly, mostly due to rewrite-loop cost from new findings. Not a correctness issue; a budget-modeling issue for future planning.
- **Phase 3 regressions-vs-noise discussion**: user was right to push back on "noise" as a catch-all. The byte-identical nav evidence was decisive for Phase 3 being noise. Phase 4's "byte-identical" would have looked fine too — only the CSS-vs-HTML-class mismatch was decisive. Different kinds of evidence for different kinds of regression.

---

## Verification checklist

- [x] `autonomous_run/wave1_state.json` — current_phase = 5_final_report
- [x] `autonomous_run/wave1_timeline.md` — every phase transition with timestamps
- [x] `autonomous_run/wave1_phase2_summary.md` — Phase 2 RI-5 summary
- [x] `autonomous_run/wave1_phase3_summary.md` — Phase 3 RI-3 summary
- [x] `autonomous_run/wave1_phase4_summary.md` — Phase 4 RI-1 failure post-mortem
- [x] `autonomous_run/wave1_results.md` — this file
- [x] `autonomous_run/ri5_offline_audit.md` — Phase 2 offline audit
- [x] `autonomous_run/ri5_sanity_runner.py`, `ri3_validation_runner.py`, `tailwind_v1_runner.py` — tactical launchers
- [x] Cold_Anvil: 4 commits in Wave 1 window, RI-5 shipped, RI-1 reverted
- [x] Arnor_Gateway: 2 commits in Wave 1 window, infra + RI-3 shipped
- [x] Both repos healthy, pushed to `main`
- [x] Gateway healthy, 0 active runs at close
- [x] 227/227 Cold_Anvil tests pass on final HEAD
- [x] Task list: phases 0-5 all resolved

`done.flag` will be written alongside this report.
