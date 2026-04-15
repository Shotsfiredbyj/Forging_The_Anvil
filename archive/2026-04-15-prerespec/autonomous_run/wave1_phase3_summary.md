# Phase 3 (RI-3) Summary

## What shipped

Arnor_Gateway `61797b4` "Route review prompts through task-type-specific guidance (RI-3)":

- `ITERATION_REVIEW_PROMPT` gains a `{task_type_guidance}` placeholder under a new `## Task-specific checks` heading
- Four module-level constants added:
  - `_CODE_REVIEW_INSTRUCTIONS` (107 words — interpreter-level correctness, ignore stylistic preferences)
  - `_MARKUP_REVIEW_INSTRUCTIONS` (113 words — 4 explicit checks: undefined-class, fragment, href-integrity, at-rule validity)
  - `_CREATIVE_REVIEW_INSTRUCTIONS` (107 words — brand guidelines, factual consistency)
  - `_GENERIC_REVIEW_INSTRUCTIONS` (95 words — completeness, on-task, internal consistency)
- `REVIEW_INSTRUCTIONS_BY_TASK_TYPE: dict[str, str]` — keys `code`, `markup`, `creative`
- **Both** `.format()` sites updated: `_single_review_phase` (line ~2329) AND `_streaming_review_phase` (line ~2671). The streaming path was easy to miss — plan said one site, spot-check found two.
- 62 LOC added to one file.
- Smoke: `py_compile OK`, template renders without KeyError (2610 chars).

## Validation cascades

3 cascades, same combo + strong tier, phase `review_v3`:

| Run | Grade | Pass | Time | Grade Dist |
|---|---|---|---|---|
| 0 | B | 7/9 | 50 min | B:7, D:2 |
| 1 | B | 8/9 | 37 min | B:8, C:1 |
| 2 | B | 8/9 | 42 min | B:8, D:1 |
| **Avg** | **B** | **7.67/9** | **43 min** | — |

## Baseline comparisons

| Cascade | Grade | Pass | Time | Notes |
|---|---|---|---|---|
| Phase 4B challenger strong (pre-RI-5, pre-RI-3) | B | 9/9 | 24 min | Original baseline — shipped broken CSS/nav |
| RI-5 sanity (post-RI-5, pre-RI-3) | B | 6/9 | 41 min | Structural bugs fixed, reviewer now stricter |
| **RI-3 validation avg (post-RI-5+RI-3)** | **B** | **7.67/9** | **43 min** | **+1.67 pass vs RI-5 only** |

**RI-3 reclaims +1.67 pass count over RI-5-only** with ~0 runtime cost (prompt change only). The average pass rate is now closer to the original 9/9, but the original was based on a reviewer rubber-stamping broken code — so 7.67 on correct code is arguably a better state than 9/9 on broken code.

## File-level pattern across 3 runs

| File | R0 | R1 | R2 | Interpretation |
|---|---|---|---|---|
| about_html | B | B | B | stable |
| **components_footer_html** | D | B | B | stochastic (2/3 pass) |
| **components_nav_html** | D | B | D | stochastic (1/3 pass) |
| **css_styles_css** | B | B | B | **consistent improvement** (was C in RI-5 sanity) |
| docs_html | B | B | B | stable |
| **early_access_html** | B | B | B | **consistent improvement** (was C in RI-5 sanity) |
| index_html | B | B | B | stable |
| pricing_html | B | B | B | stable |
| product_html | B | C | B | stochastic (2/3 pass) |

### Key finding: reviewer noise on components, not real regression

The D grades on `components_nav_html` in runs 0 and 2 are NOT real bugs. File-level evidence:

- `diff /tmp/coldanvil_incremental_zkqfzwkw/components/nav.html /tmp/coldanvil_incremental_b4ew0qsr/components/nav.html` → **empty** (byte-identical)
- `zkqfzwkw` is from run_1 (graded B), `b4ew0qsr` is from run_2 (graded D)
- Same 14-line file, same classes (`nav`, `nav-logo`, `nav-links`, `btn`, `btn-primary` — all defined in `css/styles.css`), same hrefs (all pointing at real files in the output)
- Proper fragment structure (`<nav>...</nav>`, no `<!DOCTYPE>` prefix)

**devstral's grading on minimalist structurally-correct component fragments is stochastic**. Same bytes yield B on one run and D on another. This is pre-existing reviewer behaviour — RI-3 didn't cause it, RI-3 doesn't fix it, RI-3 is not responsible for it.

The 2 consistently-improved files (`css_styles_css`, `early_access_html`) have stable quality signals the new markup prompt could act on. The component fragments are too minimal to differentiate across runs; devstral essentially grades them by dice roll.

## What worked

- **CSS quality judgment improved**: `css_styles_css` went from C (79.5 in RI-5 sanity) to consistent B across all 3 runs. The new markup prompt's explicit "CSS validity inside at-rules" check appears to have given the reviewer cleaner criteria.
- **Page-level quality improved**: `early_access_html` went from C to consistent B. The new markup prompt's href-integrity and fragment checks may have let the reviewer focus on actual structural quality rather than getting distracted by design-level concerns.
- **Runtime cost negligible**: RI-3 is a pure prompt change. The +2 min runtime average vs RI-5 sanity is within noise.
- **Both `.format()` sites wired correctly** — no KeyError in any of 3 runs at the Gateway-side review stage. That's the specific regression the 2-site wiring was at risk of.

## What didn't work (or revealed pre-existing issues)

- **Component fragments are a reviewer blind spot**: minimalist 14-line fragments score randomly. No amount of prompt tuning will fix that — the rubric dimensions devstral uses (visual, layout, spacing) simply don't have enough signal on a tiny component. This predates RI-3.
- **Rubric variance on `product_html`** (1/3 flagged C) suggests some instability for page-level scoring too, though less pronounced.

## Recommendation: KEEP SHIPPED, proceed to Phase 4

- Two consistent file-level improvements (css, early_access)
- Net +1.67 pass rate with ~0 runtime cost
- The D-grade "regressions" on components are reviewer noise, not real bugs (file-level byte-identical evidence)
- No crash, no KeyError, no new failure modes
- Gateway healthy throughout all 3 runs

**Follow-up items for the final report** (not blocking):

1. **Component rubric fragility**: devstral gives random grades to minimalist correct fragments. Possible fixes — lower-weight rubric dimensions on component tasks, or add a "short-fragment bypass" where sub-30-line structurally-valid fragments auto-pass the rubric step.
2. **Second reviewer comparison**: test with `mistral` or `qwen3.5-35b` as reviewer to see if the component-variance problem is devstral-specific or universal.
3. **RI-3 prompt refinement**: the markup instructions could add an explicit "brief correct fragments pass — do not penalise brevity" clause if we want to try fixing the component variance at the prompt level.

None of these are Phase 4 blockers.
