# RI-5 Offline Structural Audit

Audit of the new `pipeline.structural_check` module against the historical
cascade outputs at `/tmp/coldanvil_incremental_*/`. No pipeline or module code
was modified; this is a read-only measurement.

- Date run: 2026-04-13
- Module under test: `/home/jack/Forging_The_Anvil/Cold_Anvil/pipeline/structural_check.py`
- Parser backend: tree-sitter via `tree_sitter_languages` / `tree_sitter_language_pack`
  (parser loaded successfully for every file; `parser_unavailable` count = 0)

## 1. Scan summary

| Metric | Value |
| --- | --- |
| Directories scanned | 231 |
| CSS files scanned (`css/*.css`) | 206 |
| Page HTML files scanned (root `*.html`, excluding `docs.html`) | 652 |
| Component HTML files scanned (`components/*.html`) | 366 |
| **Total files scanned** | **1,224** |
| Total failed files | 51 |

Files excluded per spec: `brand_voice.json`, `screenshots/`, `docs.html`, and
any non-CSS/HTML artefacts.

## 2. Rule breakdown

| Rule | Failures | % of 1,224 scanned |
| --- | ---: | ---: |
| `parse_error` | 0 | 0.00% |
| `no_var_in_media` | 42 | 3.43% |
| `fragment_is_document` | 9 | 0.74% |

No file fired more than one rule.

## 3. `no_var_in_media` evidence (the "bug mistral missed")

- Unique project directories with at least one `@media var(...)` CSS file: **42** (of 231)
- Fraction of scanned CSS files that fired the rule: 42 / 206 = **20.4%**
- Every offender is the project's top-level `css/styles.css`.

The rule fires on exactly the semantic bug the module was written to catch:
CSS custom properties cannot resolve inside media feature conditions, so every
one of these responsive breakpoints silently no-ops in the browser.

### Example offending snippets (5 of 42)

**1. `/tmp/coldanvil_incremental_1fad1ip1/css/styles.css`**
```css
    text-decoration: none;
}

@media (min-width: var(--breakpoint-mobile)) {
    .grid-2 {
        grid-template-columns: repeat(2, 1fr);
    }
```

**2. `/tmp/coldanvil_incremental_1r2legx2/css/styles.css`**
```css
    text-decoration: none;
}

@media (min-width: var(--breakpoint-mobile)) {
    .grid-2 {
        grid-template-columns: repeat(2, 1fr);
    }
```

**3. `/tmp/coldanvil_incremental_1vxnibut/css/styles.css`**
```css
    text-decoration: none;
}

@media (min-width: var(--breakpoint-mobile)) {
    .grid-2 {
        grid-template-columns: repeat(2, 1fr);
    }
```

**4. `/tmp/coldanvil_incremental_2azfxrmn/css/styles.css`**
```css
    text-decoration: none;
}

@media (min-width: var(--breakpoint-mobile)) {
    .grid-2 {
        grid-template-columns: repeat(2, 1fr);
    }
```

**5. `/tmp/coldanvil_incremental_2r1_7v38/css/styles.css`**
```css
    text-decoration: none;
}

@media (min-width: var(--breakpoint-mobile)) {
    .grid-2 {
        grid-template-columns: repeat(2, 1fr);
    }
```

The five examples are nearly identical — the same idiom (`@media
(min-width: var(--breakpoint-mobile))`) recurs verbatim across dozens of
independent runs, strongly suggesting a single upstream prompt/blueprint
pattern is the root cause. That is exactly the kind of systemic silent bug
this rule was designed to surface.

## 4. `fragment_is_document` evidence (the "nav routing bug")

- Unique project directories with at least one component returning a full document: **9** (of 231)
- Fraction of scanned component files that fired the rule: 9 / 366 = **2.46%**
- Every offender is `components/nav.html`. No `footer.html` or other component
  tripped this rule in this dataset.

### Example offending components (5 of 9)

| # | File | First 80 chars |
| --- | --- | --- |
| 1 | `/tmp/coldanvil_incremental_1fad1ip1/components/nav.html` | `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta nam` |
| 2 | `/tmp/coldanvil_incremental_9obifgzu/components/nav.html` | `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta nam` |
| 3 | `/tmp/coldanvil_incremental_azk7csfx/components/nav.html` | `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta nam` |
| 4 | `/tmp/coldanvil_incremental_dvabx1s1/components/nav.html` | `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta nam` |
| 5 | `/tmp/coldanvil_incremental_fh_q3_hl/components/nav.html` | `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta nam` |

Full list of 9 offending projects:
`1fad1ip1`, `9obifgzu`, `azk7csfx`, `dvabx1s1`, `fh_q3_hl`, `iwup0e6i`,
`mtmf1xbn`, `w8tv1iy3`, `xnqdv82s`.

## 5. `parse_error` false-positive check

**Count of `parse_error` failures: 0 across all 1,224 files.**

- Obviously-garbage files flagged: 0
- Borderline / single-blip files flagged: 0
- False-positive rate on obviously-valid-looking files: **0 / ~1,224 = 0.00%**

Interpretation: tree-sitter parsed every CSS and HTML file in the corpus
without crossing the 0.3 error-ratio threshold or the supplemental
`has_error` trigger. HTML is short-circuited by design (the grammar is too
permissive to parse-check usefully), so this section is effectively a CSS
parse-validity check, which all 206 CSS files passed. The parser loaded on
first call and stayed cached for the remainder of the run — no crashes, no
import fallbacks required at runtime in the script's own logs.

Caveat per spec: we do not have access to the run-level benchmark grades on
disk, so "false positive against a known-good run" cannot be verified
directly. The complete absence of `parse_error` hits across 1,224 files
means there is simply nothing to misjudge here — the rule is dormant on
this corpus.

## 6. Final recommendation: **MERGE**

Decision criteria from the task spec:

| Criterion | Threshold | Observed | Verdict |
| --- | --- | --- | --- |
| `no_var_in_media` fires on > 5 projects | > 5 | **42** | Met |
| `parse_error` false-positive rate low | low | **0 / 1,224 = 0%** | Met |
| `parse_error` fires on > 5% obviously-valid files | > 5% | **0%** | Not met -> no tune |
| Module crashes / parser unavailable / FPs dominate | — | **none** | Not met -> no revert |

The two semantic rules the module was written for both fire decisively on
real, historically-generated outputs:

- **`no_var_in_media`** catches a systemic silent bug in **18.2% of all runs**
  (42 / 231 project dirs) and **20.4% of all CSS files** — the exact "bug
  mistral missed" class the module targets. The near-identical snippets
  across dozens of projects are strong evidence of a single upstream
  blueprint/prompt pattern leaking through every reviewer.
- **`fragment_is_document`** catches the nav-component routing bug in
  **3.9% of all runs** (9 / 231), again all on the same file
  (`components/nav.html`). Lower volume than the CSS bug but still a real
  recurring class.
- **`parse_error`** is silent on this corpus — zero hits, zero false
  positives. The rule is defensive scaffolding for future refusals and
  truncated generations; it is not pulling its weight on this dataset but
  is not causing harm either.

Recommendation: **merge the module as-is.** Both load-bearing rules are
validated end-to-end on real artefacts, and the conservative `parse_error`
rule has no measurable false-positive cost. Once merged, the CSS bug in
particular should be wired into Stage 5 verification so the same 42-project
pattern cannot reach the on-disk cascade outputs again.
