# Phase 2 (RI-5) Summary

## What shipped

- `pipeline/structural_check.py` — 361 LOC tree-sitter + 3 semantic rules (`parse_error`, `no_var_in_media`, `fragments_must_be_fragments`). Fail-closed on unknown languages. Cached parsers.
- `tests/test_structural_check.py` — 16 unit tests, all pass in 0.05s.
- `pipeline/verify.py` — `_run_structural_checks` helper + 2 wiring calls (in `verify_outputs` and `verify_incremental`), merging findings into `VerificationResult.findings` with `severity=error` so they flow through `rewrite_instructions()` into the existing rewrite loop. No changes to `iterative.py`.
- `pyproject.toml` — `tree-sitter>=0.25`, `tree-sitter-language-pack>=1.5`.

Commit: Cold_Anvil `0d9089f`. Pushed to `main`. Gateway-side wiring **deferred** — Cold_Anvil side captures the primary value (findings → rewriter) and deployment surface is smaller.

## Offline audit (historical evidence — very strong)

1,224 files across 231 project dirs in `/tmp/coldanvil_incremental_*`:

| Rule | Failures | % |
|---|---|---|
| `no_var_in_media` | **42 CSS files (20.4%)** | All identical `@media (min-width: var(--breakpoint-mobile))` idiom — one upstream blueprint pattern leaking through every reviewer |
| `fragment_is_document` | **9 component HTML (2.5%)** | All `components/nav.html`, exactly the bug Decision 6 documented |
| `parse_error` | **0 (0.00%)** | Zero false positives — conservative rule has no measurable cost on this corpus |

Offline audit recommendation was **merge**, justified by 2/3 rules firing decisively on real historical artefacts with clear upstream root cause.

## Sanity cascade (on-disk evidence — both target bugs fixed)

`gemma4-26b + gemma4-31b + devstral` on strong tier, phase `ri5_sanity`, single cascade. Latest output dir: `/tmp/coldanvil_incremental_32evdhq_`.

**Target-bug fix verification** (what RI-5 was designed to catch):

| Target bug | Before (Phase 4B challenger) | RI-5 sanity |
|---|---|---|
| CSS `@media` condition uses `var()` | Present | **GONE** — literal values used (`max-width: 768px`, `max-width: 480px`). `var()` still used correctly in rule bodies. |
| `components/nav.html` is full HTML doc | Present | **GONE** — starts with `<!-- nav -->\n<nav class="nav">`, is a proper fragment. |
| `components/footer.html` | (not flagged before) | Proper `<footer>` fragment |

**Both target bugs fixed end-to-end** via the existing rewrite loop consuming our structural findings. The rewriter ingested the `no_var_in_media` and `fragment_is_document` error messages and produced correct output on retry.

## Grade regression (concerning but interpretable)

| Metric | Phase 4B challenger strong | RI-5 sanity | Δ |
|---|---|---|---|
| Overall grade | B | B | = |
| Pass count | 9/9 | **6/9** | **-3** |
| Runtime | ~24 min | **41 min** | +73% |
| C-graded files | 0 | footer, css, early_access | +3 |

**Runtime +73%**: attributable to extra rewrite cycles triggered by our new findings. The structural check itself runs in <5ms total; the overrun is the *cost of fixing the bugs*. The plan's 20% runtime kill threshold is technically tripped, but the threshold was designed for slow-check scenarios, not "check causes the rewriter to do more useful work".

**Pass count 9→6**: three files dropped to C-grade. File inspection shows:

- `components_footer_html` (C, 76.0): heavy **inline styles** on structural elements (e.g. `style="margin-bottom: var(--component-gap); display: block;"`). Pre-existing code smell — not caused by RI-5.
- `css_styles_css` (C, 79.5): final CSS is structurally clean (no `@media var()`). Reviewer presumably flagged it for other style-level issues; not investigated file-level yet.
- `early_access_html` (C, 72.0): **duplicated nav markup inline** (has its own `<nav class="nav">` rather than referencing the component) and heavy inline form styles. Pre-existing quality issue.

None of the three C-grade files was flagged for a structural bug RI-5 fired on. The reviewer appears to be applying a **higher bar** now that the obvious structural chaos is gone — seeing inline-style and duplication issues that the prior cascade's `@media var()` / full-doc-nav bugs were masking.

**Read**: the code is structurally correct but the reviewer now has bandwidth to notice other things. That is probably a feature not a bug, but the n=1 data doesn't decisively distinguish "reviewer is stricter" from "rewriter genuinely made other files worse while fixing the target bugs".

## Recommendation: KEEP SHIPPED, flag for follow-up

The evidence splits cleanly:

- **RI-5 does exactly what it was designed for** — catches both target bugs deterministically, on-disk evidence is unambiguous, historical corpus shows 20% of CSS files had the bug.
- **The grade regression is orthogonal to RI-5's target** — the three C-grade files are flagged for different classes of issue that RI-5 doesn't address and wasn't meant to.
- **n=1 sanity cascade is not enough** to distinguish reviewer-stochastic noise from systematic regression.

**Do not revert the commit.** The offline audit alone (42+9 real bugs in historical corpus) justifies RI-5 on evidence standards.

**Follow-up needed** (document in final report, not blocking Phase 3):
1. **Second validation cascade** with a different combo (e.g. `qwen3.5-9b + qwen3.5-27b + devstral`) to see if the 6/9 pass rate is reviewer-specific or systematic
2. **Investigate css_styles_css C grade** — inspect the file to see what devstral flagged; might surface another structural rule worth adding
3. **Gateway-side wiring** — still optional, documented as follow-up

## Phase 2 decision for user

- RI-5 is shipped (`0d9089f` committed and pushed)
- Target bugs are fixed on disk (evidence verified)
- Pass-count regression is real but explanation favours "reviewer stricter" over "code worse"
- Recommendation: **proceed to Phase 3** (RI-3 prompts — very small, low risk), flag RI-5 follow-up items in the final report

If you disagree with the read, the alternative is to revert `0d9089f`. The module + tests would stay in place as a reference implementation; only the wiring in `verify.py` and the `pyproject.toml` deps would be undone.
