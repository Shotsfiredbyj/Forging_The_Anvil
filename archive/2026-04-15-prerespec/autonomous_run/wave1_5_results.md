# Wave 1.5 Final Report

**Run window**: 2026-04-14, ~90 minutes active work
**Scope**: three deterministic fixes targeting the reviewer-blind-spot class that Wave 1 Phase 4 surfaced
**Outcome**: all three phases shipped cleanly

---

## Headline

| Phase | Description | Status | Commit |
|---|---|---|---|
| A | New structural_check rules (undefined class, path-in-class, placeholder content) | ✅ | `d9fc788` |
| B | Grade disconnect fix (rubric missing-data + verify findings propagation) | ✅ | `0749eab` |
| C | Markup reviewer "brevity is not a defect" prompt addition | ✅ | `4a950d4` |
| D | This report | ✅ | — |

**Production pipeline state after Wave 1.5**:
- Cold_Anvil HEAD `0749eab` ← `d9fc788` ← `9790968` (Wave 1 RI-1 revert) ← `0d9089f` (RI-5) ← `2bf705a` (infra)
- Arnor_Gateway HEAD `4a950d4` ← `61797b4` (RI-3) ← `8230158` (infra)

All 254 Cold_Anvil tests pass (+27 from Wave 1). Gateway restarted clean.

---

## Phase A — project-aware structural rules

**Commit `d9fc788`** in `pipeline/verify.py`: three new rules running inside `_run_structural_checks` alongside the existing per-file tree-sitter calls. They live in `verify.py` rather than `structural_check.py` because two of them need project context (the CSS class inventory across all files).

### Rule 1: `undefined_class_in_html`

For every HTML file, collect the class tokens from `class="..."` attributes and verify each is defined as a selector in some project CSS file — or inside an inline `<style>` block in any HTML file. Path-like tokens (`foo/bar`) are skipped here and handled by rule 2 so we don't double-report. If the project has zero CSS files, the rule skips rather than flagging every class on every page (unverifiable ≠ failing).

### Rule 2: `class_contains_path`

Fires if any `class="..."` attribute value contains `/`. Catches `<div class="components/footer.html"></div>` directly. Real CSS classes never contain forward slashes; false-positive risk is negligible. One finding per unique path-value per file.

### Rule 3: `placeholder_content`

Fires on a fixed list of conservative phrases that indicate the model stubbed out component content: "placeholder for the component", "in a real static build", "would be injected here", "component inclusion logic", "TODO: (insert|include|add) (the )?(nav|footer|header)". Marketing copy is vanishingly unlikely to contain these, so false-positive risk is very low.

### Offline audit

Scanned 274 historical `/tmp/coldanvil_incremental_*` project dirs (1,164 HTML files, 40,000+ class tokens):

| Rule | Files flagged | Dirs affected | Rate |
|---|---|---|---|
| `undefined_class_in_html` | **508** | **142** | **44% / 52%** |
| `class_contains_path` | 4 | 4 | 0.3% / 1.5% |
| `placeholder_content` | 20 | 12 | 1.7% / 4.4% |

Spot-checked examples:
- `coldanvil_incremental_01ku6utz/product.html` references `.footer-links`, `.footer-title` — project CSS only defines `.footer`, `.footer-bottom`, `.footer-col`, `.footer-grid`. Real bugs.
- `coldanvil_incremental_2cpmrriu/index.html` has `class="components/footer.html"` — the Phase 4 signature bug, present in 4 historical cascades.
- `coldanvil_incremental_12i24nut/index.html` contains "In a real static build" in a comment — model stubbed out the nav.

**44% of historical HTML had undefined classes.** That's the scale of the class-mismatch problem the rule targets. Fixing this at the source (preventing generation with undefined classes in the first place) is a Wave 2 item; catching it at verification is Wave 1.5.

### Runtime impact warning

The 44% hit rate means production cascades will trigger **more rewrite cycles** than before. Correctness > speed is the right trade-off, but budget modelling for future runs needs updating. A cascade that took 40 min before Wave 1.5 will take 50-70 min after, with the extra time spent rewriting files to define their referenced classes. This is desired behaviour — broken code shouldn't ship.

### Tests

20 new tests at `tests/test_structural_check.py`: 5 on the class inventory builder, 5 on `_check_undefined_html_classes`, 3 on `_check_class_contains_path`, 5 on `_check_placeholder_content`, 2 end-to-end integration tests replicating the exact Phase 4 failure shape (all three rules firing on the same file) and the negative case (clean project, no findings).

---

## Phase B — final-grade / review-verdict disconnect fix

**Commit `0749eab`** in `pipeline/quality_report.py` and `pipeline/cascade.py`. Two compounding bugs that together produced the Wave 1 Phase 4 false-positive "A 9/9" record.

### Bug 1: `grade_from_rubric({})` returned "A"

`pipeline/quality_report.py:252-253`:
```python
if not review_data:
    return "A", ""  # No review data = no rubric grade (neutral)
```

The intent was "no opinion = neutral", but the neutral default was grade A (best-case), not unknown. The missing-data case fires in production via a race condition:

1. Cascade calls `poll_run(gateway, run_id)` which returns when the Gateway run's overall status flips to "completed"
2. But Gateway writes per-task ledger entries (`final_status`, `iteration.final_verdict`, `review_a.dimension_scores`) via a separate async code path that lags the status flip
3. Cascade immediately calls `fetch_review_results(gateway, run_id)` which fetches the run data and iterates per task
4. Empty-ledger tasks are silently dropped: `if t_status != 200 or not ledger: continue` at `gateway_client.py:439-440`
5. Cascade's `_submit_iterative_review` sees the result dict missing some tasks, builds `review_data[tid]` only for present tasks
6. `build_quality_report` calls `grade_from_rubric(review_results.get(task_id, {}))` → `grade_from_rubric({})` → **"A"**

**Fix**: `grade_from_rubric({})` and `grade_from_rubric({"scores": {}, "verdict": ""})` now return `("C", "no rubric data (unknown quality)")`. Missing data is unknown, not clean. Strictly more conservative: false positives on grade A will go UP, surfacing problems that used to be hidden.

### Bug 2: `verify_result=None` discarded all structural findings

`pipeline/cascade.py:500-505`:
```python
report = build_quality_report(
    verify_result=None,  # <-- bug
    gate_results=gate_results,
    review_results=review_data,
    file_mapping=file_mapping,
)
```

The comment said "no verification re-run needed — already done per-layer". But per-layer findings were consumed by the iterative rewrite loop and then **discarded** — they never reached the final grade. That meant RI-5 structural_check findings, Wave 1.5 project-aware findings, and every adapter check (html-validate, stylelint, `_check_css_classes`, `_check_design_tokens`, `_check_nav_consistency`) factored into rewrite decisions but **nothing factored into the final grade**.

A cascade that rewrote twice and "still failing after 2 rewrites — continuing" would blithely report A/9-of-9 when the code was still broken — exactly what happened in Phase 4.

**Fix**: `_submit_iterative_review` now calls `verify_incremental` on the final (post-rewrite) task outputs right before `build_quality_report`, capturing a fresh `VerificationResult` against the files that will actually ship. Findings flow through `grade_from_verification` into `file_grades.verify_grade`. Even a task with missing rubric data (Bug 1 path) but a structural finding will grade C/D on the verify path.

### Confirmation via Gateway replay

Rebuilt the Wave 1 Phase 4 quality report from the current Gateway state after the fixes:

| Task | Old grade | New grade | Reason |
|---|---|---|---|
| about_html | A | C | REVISE verdict + missing-data default now C |
| components_footer_html | A | D | REJECT verdict |
| components_nav_html | A | D | REJECT verdict |
| css_styles_css | A | C | REVISE verdict |
| docs_html | A | C | REVISE verdict |
| early_access_html | A | C | REVISE verdict |
| index_html | A | D | REJECT verdict |
| pricing_html | A | C | REVISE verdict |
| product_html | A | C | REVISE verdict |
| **Overall** | **A** | **C** | GPA avg 1.67 |

The old cascade would have been B-graded (1.67 GPA gives C, avg_gpa ≥ 1.5 rounds to C, ≥ 2.5 → B). The new logic now correctly surfaces the review verdicts. If we also ran the verify_incremental pass against the Phase 4 output files, the `undefined_class_in_html` rule alone would drop most files to D — the actual corrected grade would be D or F overall.

### Tests

7 new tests at `tests/test_structural_check.py` covering the missing-data policy: empty dict → C, empty scores + empty verdict → C, empty scores + UNKNOWN verdict → C, REVISE → C, REJECT → D, PASS + high scores → A, PASS + mixed scores → B.

### Not addressed here

- **The underlying race condition in `poll_run` / `fetch_review_results`** (ledger population lags run-status flip) is not fixed. The defensive fix above catches its downstream effect, but a proper fix would have `poll_run` wait for all task ledgers to be populated, or `fetch_review_results` retry on empty ledgers.
- **`fetch_review_results` still silently drops empty-ledger tasks.** It could log, or include them with pessimistic defaults.

Both belong in a "Gateway polling discipline" pass (Wave 2 candidate).

---

## Phase C — markup reviewer "brevity is not a defect"

**Commit `4a950d4`** in `Arnor_Gateway/arnor_gateway/forge_pipeline.py`. Pure prompt addition to `_MARKUP_REVIEW_INSTRUCTIONS` (the Wave 1 RI-3 constant).

Wave 1 Phase 3 validation showed **byte-identical** component fragments grading B on one cascade and D on another. The root cause wasn't prompt or code: it was that devstral's rubric dimensions (layout, visual, spacing) couldn't get enough signal out of a 14-line correct `<nav>` fragment, so the grade was effectively a dice roll.

The fix is at the prompt level: tell the reviewer explicitly that a short structurally-correct fragment is a PASS, and that downgrading on line count alone is wrong.

### Before (113 words)

> Treat this as a structural audit, not a design review. Run these checks:
> (1) Undefined-class check — every CSS class referenced in the HTML must be
> defined in a CSS file present in the reference context; list any that is not.
> (2) Fragment check — `components_*_html` files must be fragments; ...
> (3) Href integrity — every `href=` must point to a file that exists ...
> (4) CSS validity inside `@media` and other at-rules. Ignore colour choices,
> spacing opinions, and visual-design preferences — those belong to the design
> review.

### After (196 words)

Same four structural checks, plus:

> Brevity is not a defect. A short, structurally-correct fragment with valid
> classes, valid hrefs, and fragment structure (no `<!DOCTYPE`/`<html>` wrapper
> for component tasks) is a PASS regardless of line count. Do not downgrade a
> nav component from PASS to REVISE for being 14 lines instead of 40. A file
> that does the correct thing in the minimum sensible amount of code is the
> target, not a failure mode. Only flag a fragment for REVISE if one of the
> four checks above actually fails.

### Validation

Validated the prompt edit with:
- `py_compile` clean
- Template renders at 3102 chars (unchanged shape)
- `Brevity is not a defect` clause present in rendered output
- Both `.format()` call sites (`_single_review_phase` and `_streaming_review_phase`) pick up the new content automatically — the dict lookup is dynamic

**Cascade-level validation is deferred** to the next session. Prompt changes are low risk (no code paths changed, no new dependencies) and running cascades just to validate prompt wording is expensive relative to the expected effect (smaller cycle-to-cycle variance on identical component inputs, not a step-function grade change).

Gateway restarted via `restart-gateway.sh`, all self-tests pass.

---

## Commits summary

Cold_Anvil:
- `d9fc788` Add project-aware structural rules to catch Phase 4 bug class (Wave 1.5 Phase A)
- `0749eab` Fix final-grade / review-verdict disconnect (Wave 1.5 Phase B)

Arnor_Gateway:
- `4a950d4` Tell markup reviewer: brevity is not a defect (Wave 1.5 Phase C)

All three pushed to `main`. Both repos healthy. 254 Cold_Anvil tests passing (was 227 after Wave 1 revert, +27 from Wave 1.5). Gateway restarted clean.

---

## Expected production impact

Running a production cascade now vs. before Wave 1.5:

- **Grades will drop**. Cascades that reported grade A 9/9 with hidden structural problems will now report B/C/D accurately. This is desired behaviour. The old A grade was false-positive; the new grade is the truth.
- **Runtime will climb 25-70%**. The new `undefined_class_in_html` rule fires on 44% of historical HTML, each fire triggers a rewrite cycle, and rewrite cycles cost ~2-3 minutes each on the Gateway. Expected steady-state cascade runtime: 50-70 min (was 40 min). Correctness > speed.
- **Reviewer variance on minimal components should decrease**. Phase C tells devstral not to penalise brevity. The `components/nav.html` B/D flip from Phase 3 should stop happening, or at least get rarer.
- **False-positive A grades are gone**. Phase B closes the path that produced them: missing rubric data no longer defaults to A, and verify findings now propagate into the final grade.

---

## Follow-up work discovered

### Priority 1 — Gateway polling discipline (Wave 2 candidate)

The race condition between `poll_run` and `fetch_review_results` is not fixed; it's masked by Phase B's defensive grading change. A proper fix would be one of:

- `poll_run` waits for all task ledgers to be populated (not just status flip) before returning
- `fetch_review_results` retries on empty ledgers with backoff, with a bounded timeout
- Gateway writes ledger entries synchronously with the status flip so there's no gap

Estimated scope: half a day of Gateway work, needs careful testing because poll_run is used everywhere.

### Priority 2 — Validate Phase C + replay Wave 1 Phase 4 scenario

Run a cascade after Wave 1.5 and compare:

- Against Phase 3 `review_v3` baseline (expect same grade, lower variance on components)
- Against Phase 4 `tailwind_v1` scenario (expect correct D/F grade now that verify findings propagate and `undefined_class_in_html` fires) — note: cannot re-run Tailwind because RI-1 is reverted; need a vanilla scenario that produces undefined classes

Estimated scope: 1-2 cascades, ~2 hours wall-clock. Good first item for the next session.

### Priority 3 — RI-1 v2 design

Still waiting. Wave 1.5 doesn't touch Tailwind. The allowlist design flaw from Phase 4 still needs a redesign before RI-1 can ship:
- Restrict allowlist to real Tailwind v3 utility names, OR
- Generate a `tailwind.config.js` theme mapping from design tokens so `npx tailwindcss` compiles them
- Fix Stage 4 prompts to describe Tailwind in the prose too
- Wave 1.5's `undefined_class_in_html` rule is the right safety net — it would have caught the Phase 4 bug at verification time instead of letting it ship

Estimated scope: multi-day Wave 2 project.

### Priority 4 — Class-inventory rule in `_check_css_classes`

The existing `WebAdapter._check_css_classes` does similar work to `undefined_class_in_html` but uses a regex on `.css` files, not a project-wide inventory. There's some duplication now. Neither is wrong, but we could:

- Unify them into one rule (either in the adapter or in `_run_structural_checks`)
- Leave both for defence-in-depth (the adapter runs `stylelint`/`html-validate` alongside; structural_check is the deterministic fallback)

Low priority — no functional issue, just minor code duplication.

### Priority 5 — Verify runtime cost measurement

The 25-70% runtime climb is an estimate. Actual cost should be measured against the Phase 3 `review_v3` baseline (post-RI-5, post-RI-3, pre-Wave-1.5). A single validation cascade would confirm.

---

## Wave 2 readiness

Given Wave 1.5 learnings:

| RI | Priority | Notes |
|---|---|---|
| **RI-1 Tailwind v2** | High | Unchanged — still needs allowlist redesign. Now has `undefined_class_in_html` as a safety net during rollout. |
| **Gateway polling discipline** | High | New Wave 2 item from Phase B investigation. Unblocks the defensive fixes from being the only line of defence. |
| **RI-2 best-of-N** | Medium | Unchanged. Wave 1.5's extra structural findings make a good cheap pre-filter for candidate selection. |
| **RI-4 prompt escalation** | Medium | Unchanged. Benefits from runtime-budget revision. |
| **RI-9 logprob early rejection** | Low | Still gated on llama-swap scout. |
| **RI-8 DSPy auto-tune** | Low | Corpus still not large enough. Wave 1.5 didn't produce new scored runs (defers cascade validation). |

---

## Meta-observations

### What went well

- **Offline-first development**. Wave 1.5 shipped zero validation cascades (defers Phase C validation to next session). The structural rule changes were validated against the existing 274-dir historical corpus, grade-disconnect bugs were confirmed by replaying the Phase 4 Gateway state, and Phase C was validated via template rendering. Wall-clock compressed from "multi-hour cascade wait" to "90 minutes active work".
- **Root-cause investigation paid off**. The grade disconnect turned out to be two distinct bugs (missing-data default + verify_result=None), both deterministic, both fixable in minutes once identified. A surface patch (just fix the default) would have missed Bug 2.
- **Tests-first for the new rules**. Every new helper has unit test coverage before shipping. 27 new tests across Phases A and B.
- **Git hygiene**. Three commits across two repos, all with explicit `git add` — pre-existing dirty state (ROADMAP.md, deleted benchmarks, deploy scripts) untouched through Wave 1, Wave 1 revert, and Wave 1.5.

### What to be careful about

- **44% historical hit rate on `undefined_class_in_html`**. Every existing benchmark run would have failed this check. Future cascades WILL take longer. The cost needs real measurement, not just an estimate.
- **Fix A could over-penalise**. Tasks that legitimately don't get rubric review (if any exist) will now grade C instead of A. I think this is correct (unknown is unknown) but it's a behaviour change users should know about.
- **Phase C has zero cascade validation**. It's a prompt change, so low risk, but "should reduce devstral variance on minimal fragments" is a hypothesis, not a measurement.

---

## Verification checklist

- [x] `autonomous_run/wave1_5_results.md` — this file
- [x] `pipeline/verify.py` — 3 new project-aware rules + wiring
- [x] `pipeline/quality_report.py` — missing-data policy fix
- [x] `pipeline/cascade.py` — verify_incremental re-run in `_submit_iterative_review`
- [x] `Arnor_Gateway/arnor_gateway/forge_pipeline.py` — brevity clause in `_MARKUP_REVIEW_INSTRUCTIONS`
- [x] `tests/test_structural_check.py` — 27 new tests, 254 total passing
- [x] Cold_Anvil commits `d9fc788`, `0749eab` pushed to main
- [x] Arnor_Gateway commit `4a950d4` pushed to main
- [x] Gateway restarted via `restart-gateway.sh`, healthy
- [x] Task list: 16-19 all resolved

`wave1_5_done.flag` to be written alongside this report.
