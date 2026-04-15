# Direct Review — 2026-04-14

**Scope**: honest, file-by-file human review of a recent cascade's output. Instrument for the discipline "don't trust grades, read the files". This is Sprint 1 item 9 of the plan at `.claude/plans/snoopy-fluttering-simon.md`.

**Cascade under review**: Phase 4 `tailwind_v1` — run ID `grid_20260414_071122`, rubric review run `2026-04-14_034`. This is the cascade that shipped `grade=A, 9/9 pass, 3619s` yesterday. It is also the cascade whose output files I've inspected most closely during the plan research. Reviewing it in this document formalises the discipline and sets a baseline the later Sprint 1 items will be measured against.

**Not a post-Wave-1.5 cascade.** I have not rerun the cascade under the current HEAD (`cold_anvil 0749eab`, `arnor_gateway 4a950d4`). That is Sprint 1 item 1 (automated regrade) and will happen next. This document reviews the original broken artifacts so future items have a clear "truth state" to compare against.

**Output directory**: `/tmp/coldanvil_incremental__6dzynhp/` — still present.

---

## The cascade's reported grade (what it shipped)

From `forge/benchmarks/iterative_benchmark_results.jsonl`, phase=`tailwind_v1`:

| Metric | Value |
|---|---|
| overall_grade | **A** |
| pass_count | **9/9** |
| total_time_s | 3619.2 |
| file_grades | all 9 files: `A` |
| grade_distribution | `{"A": 9}` |

## What's actually in the files

### index.html — **should be F**

Lines 11–16:

```html
<!-- nav component -->
<div class="container mx-auto px-page-padding py-4 flex flex-row items-center justify-between">
    <!-- This section is a placeholder for the component inclusion logic -->
    <!-- In a real static build, components/nav.html would be injected here -->
</div>
<!-- Note: In this static generation task, we represent the structure of the page. 
     The actual components are referenced by path in the blueprint. -->
```

**The nav component is a stubbed-out comment.** The page has no actual nav when rendered. A user landing on this page would see the hero section with no site chrome above it. This is not a style issue or a minor bug — it is complete loss of expected page structure.

Line 120:

```html
<div class="components/footer.html"></div>
```

**The footer is a `<div>` with the string `"components/footer.html"` stuffed into its `class` attribute.** Not a comment, not an `<include>`, not anything else — a div whose class attribute is literally a file path. This is unambiguously broken. No human reviewer would pass this. A CSS parser would try to match `.components\/footer\.html` which doesn't exist. The div contains no children; the footer never renders.

The grade pipeline called this "A".

### about.html, pricing.html — **should be F**

Same pattern as index.html: nav is a placeholder comment, footer is either missing or contains the file-path-as-class-value bug. I spot-checked both during research.

### early-access.html — **D (different failure mode)**

This page contains the nav inline (doesn't reference `components/nav.html`) but duplicates the markup verbatim inside the page body. It uses heavy inline `style="..."` attributes on the form section. Not broken in the same catastrophic way as index/about/pricing but definitely not ship-quality.

### components/nav.html — **B or C, genuinely good shape**

```html
<nav class="bg-bg-secondary border-b border-bg-accent sticky top-0 z-50 duration-300">
    <div class="container mx-auto px-page-padding py-4 flex flex-row items-center justify-between">
        <a href="index.html" class="flex items-center gap-2 no-underline">
            <img src="assets/logo.svg" alt="Cold Anvil Logo" class="h-8 w-auto">
            <span class="text-text-primary font-bold text-size-h2 lg:text-size-h1">Cold Anvil</span>
        </a>
        ...
```

A real `<nav>` fragment — not a full document, proper semantic element, logo with alt text, desktop nav links, CTA button, and even a mobile menu toggle with aria-label and an SVG icon. This is the best file in the cascade. But — **the pages don't actually use it**. The nav component exists in isolation; index/about/pricing just stubbed out the include rather than embedding the fragment.

Classes used: `bg-bg-secondary`, `border-bg-accent`, `px-page-padding`, `text-size-h2`, `lg:text-size-h1`, etc. These are the "Tailwind-style classes the allowlist generated from design tokens" from the reverted RI-1 attempt. In the ACTUAL CSS file (vanilla, not Tailwind compiled), none of these classes are defined. The page would render unstyled — hero text in browser default fonts on default background.

### components/footer.html — **same as nav: good shape, wrong classes**

Real `<footer>` fragment with brand column, product column, company column, legal column, footer-bottom. Well-structured markup. But uses the same Tailwind-style classes (`bg-bg-secondary`, `text-size-body`, etc.) that are not defined in `css/styles.css`. Same unstyled render.

### docs.html — **has Tailwind fraction classes**

Contains `class="lg:w-1/4"` and `class="lg:w-3/4"`. These are legitimate Tailwind responsive-fraction utilities. Wave 1.5's `class_contains_path` rule fires a false positive on these (confirmed during research). Sprint 1 item 2 fixes this.

### css/styles.css — **vanilla, correct**

278 lines of vanilla CSS with `:root { --bg-primary: #1a1a2e; ... }` custom properties. Normal utility classes (`.container`, `.btn`, `.nav`, `.nav-logo`, `.nav-links`, etc.). `@media (max-width: 768px)` and `@media (max-width: 480px)` use literal values (not `var()`) — Wave 1's RI-5 `no_var_in_media` rule appears to have caught and fixed this during the rewrite cycles (the original files had `@media (min-width: var(--breakpoint-mobile))`).

The CSS file is clean. The problem is the HTML files use classes that aren't in it.

### product_html — **similar to docs/early-access, moderate issues**

Inline nav markup, heavy inline styles, undefined-class references. Not as catastrophic as index/about/pricing but still not ship-quality.

---

## Human-eye summary

| File | Shipped grade | True grade (my read) | Delta |
|---|---|---|---|
| index.html | A | **F** | -4 grades |
| about.html | A | **F** | -4 grades |
| pricing.html | A | **F** | -4 grades |
| docs.html | A | C | -2 grades |
| early-access.html | A | D | -3 grades |
| product.html | A | C/D | -2.5 grades |
| components/nav.html | A | B | -1 grade |
| components/footer.html | A | B | -1 grade |
| css/styles.css | A | B | -1 grade |

**Average true grade**: ~D (1.2 GPA) vs shipped A (4.0 GPA). The cascade was wrong on every single file, across a range of failure severities.

## What a human reviewer catches that the current pipeline doesn't

1. **"Nav is replaced by a placeholder comment"** — obvious to any human who reads the file, invisible to the current HTML structural checks because the comment syntax is valid HTML.
2. **`class="components/footer.html"`** — obviously wrong to any human, caught by Wave 1.5's `class_contains_path` rule but ALSO false-positive fires on `w-1/4`. Sprint 1 item 2 fix.
3. **Tailwind-style classes with no CSS backing** — the nav and footer components use ~30 classes that don't exist in the project CSS. Caught by Wave 1.5's `undefined_class_in_html` rule — but the Phase 4 cascade shipped before Wave 1.5 was merged into the grade path.
4. **"Pages don't include the components they reference"** — the nav component file exists but the pages just stubbed the inclusion. There is no check for "does the page actually embed the component it's meant to reference". This is a new-rule opportunity (Sprint 2?).
5. **"Heavy inline styles indicate the model couldn't figure out the class system"** — current pipeline doesn't penalise inline styles. They're a code smell, not a bug. Acceptable for now.

## What Wave 1.5's fixes *should* catch (pending Sprint 1 item 1 verification)

- `undefined_class_in_html` — would fire on every HTML file using `bg-bg-secondary` etc. that isn't in the project CSS.
- `placeholder_content` — would fire on index/about/pricing for "placeholder for the component" and "In a real static build".
- `class_contains_path` — would fire on the `components/footer.html` bug (true positive) and on `lg:w-1/4` / `lg:w-3/4` (false positive — item 2 fixes).
- `build_quality_report` with `verify_result` populated — would capture these findings and grade the files at D via `grade_from_verification`.
- `grade_from_rubric({})` returning C — would have prevented the original empty-rubric-defaults-to-A path.

**This is item 1's thesis**: run the regrade script against this exact output dir, and if the file-level grades come out as the "True grade" column above (or close), Wave 1.5 was correct and we can build on it.

## Discipline notes going forward

- **The grade is not the truth.** The rubric pipeline is one signal; file contents are the truth. Every Sprint 1 item should be validated by reading the actual files, not just by trusting the reported grade.
- **The `/tmp/coldanvil_incremental_*` dirs are temporary**. The authoritative Phase 4 output dir (`__6dzynhp`) still exists as of this writing but will be cleaned by /tmp cycling at some point. Sprint 1 item 7 (historical regrade) should copy or hash key fixtures before they disappear.
- **Read every HTML file top-to-bottom** before accepting a cascade. Takes 5-10 minutes for a 9-file cascade. Catches what the automated checks don't. This is the "institute a discipline" the user asked for.
- **When a file looks broken but the tooling says it passed**, the tooling is wrong until proven otherwise. Not the other way around.
- **When Sprint 1 item 4 ships** (rubric demotion for code), the grade pipeline will stop laundering false positives through rubric reviews. That's the load-bearing change. Before item 4, this discipline is the only thing catching false positives; after, discipline + determinism work together.

## What I haven't reviewed (scope gaps)

- The Python/Rust/Go/TypeScript cascade outputs. We don't have recent non-web cascades to read. The polyglot claims in the plan are based on adapter code inspection, not on real cascade output. Sprint 2 should include direct review of at least one Python and one Rust cascade.
- The per-layer (Stage 5 iterative) outputs that got rewritten between layers. I only have the final post-rewrite snapshot. The rewrite-cycle history would show whether the rewriter made things better or worse across iterations.
- The actual LLM reviewer output (what devstral said per-task). I saw scores and verdicts but not the prose. Reading devstral's actual review text for each of the 9 files would sharpen the "LLM rubric is <60% accurate" thesis with local evidence.

---

**Conclusion**: The Phase 4 cascade shipped A on objectively broken output. Reading the files makes this clear in under ten minutes. The research, the adapter code, and the decision log all converge on the same fix (deterministic gate, advisory rubric for code). Sprint 1 items 1-4 execute that fix. Item 9 — this document — is the discipline instrument that grounds every subsequent claim.
