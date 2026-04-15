# Phase 4 (RI-1 Tailwind) Summary — FAILURE

## Headline

Cascade completed. Final record says `grade=A, pass=9/9, runtime=3619s`. **File-level inspection and per-task review histories contradict the record completely.** The output is objectively broken; the reviewer gave it an A anyway. This is a false-positive grade, exactly the class of bug Wave 1 was meant to eliminate.

## What shipped

Cold_Anvil commit `59b70ca` "Add Tailwind utility CSS support (RI-1)" — 17 files, 376 insertions. Infrastructure threading `tailwind_allowlist: set[str] | None` through `ParsedBlueprint → AssembledProject → WebAdapter`, new `_extract_css_contract_tailwind`, `_check_css_classes` Tailwind branch, `_run_tailwind_build` helper, `packs/website_tailwind/` template pack, Tailwind-mode sections added to `file_generation.md` and `verification_rewrite.md` prompts.

Validation artefact: `forge/benchmarks/cached_stages_strong_tailwind.json` — hand-patched cached stages with `"css": "tailwind"` injected into the Stage 4 blueprint's tech_stack JSON (Stage 4 prose still says "plain HTML + CSS" — known imperfection).

Toolchain: Node v20.19.2 + tailwindcss v3.4.19 installed on both laptop (`/home/jack/.npm-global/bin/`) and Elostirion (`/usr/local/bin/`).

All 227 unit tests still green.

## Cascade result (surface)

| | Value |
|---|---|
| Phase | `tailwind_v1` |
| Combo | `gemma4-26b + gemma4-31b + devstral` |
| Tier | strong (Tailwind-patched) |
| Grade | **A** |
| Pass | **9/9** |
| Runtime | 3619s (60 min) |
| Grade dist | {A: 9} |

## File-level reality (ground truth)

Latest output dir: `/tmp/coldanvil_incremental__6dzynhp/`

### Evidence 1: Components missing from pages
Three of nine pages have **placeholder comments instead of nav/footer content**:

- `about.html`: `<!-- This is a placeholder for the component inclusion logic --> <!-- Note: In a real static build, components/nav.html and components/footer.html would be injected here -->`
- `index.html`: same pattern
- `pricing.html`: same pattern

The iterative flow lost the component content — the model substituted comments explaining what *should* be there instead of producing it.

### Evidence 2: File path used as class value
`index.html` line 120:
```html
<div class="components/footer.html"></div>
```
A file path as a class attribute. Neither the allowlist check nor the RI-5 structural rules caught this (it's syntactically valid HTML with a weird string value).

### Evidence 3: HTML classes reference nothing
HTML uses dozens of Tailwind-style classes from our allowlist:
- `bg-bg-primary` — **0** definitions in CSS
- `text-text-primary` — **0** definitions in CSS
- `px-page-padding` — **0** definitions in CSS
- `py-section-gap` — **0** definitions in CSS
- `bg-accent` — 1 definition (coincidental vanilla name collision)

CSS file has 21 total class selectors. HTML references dozens. No Tailwind compilation happens; the CSS is still vanilla `:root` custom-property form. **The pages would render completely unstyled in a browser.**

### Evidence 4: Task-level review verdicts were REVISE throughout
Per-task score history from the Gateway run 2026-04-14_034:

| Task | Cycle scores | Verdict |
|---|---|---|
| about_html | 71.5, 61.0, 71.5 | REVISE, REVISE, REVISE |
| components_footer_html | 54.0, 43.5, 54.0 | REVISE, REVISE, REVISE |
| components_nav_html | 43.5, 59.0, 34.0 | REVISE, REVISE, REVISE |
| integration_review | 92.0, 55.0, 92.0 | PASS, REVISE, PASS |

Every task in the iterative review cycles got REVISE verdicts with scores in the 34-71 range. But the post-cascade `quality_report` returned grade A for every file.

**There is a disconnect between the task-level review verdicts and the final file_grades.** The final grade comes from a different scoring path that doesn't honour the REVISE verdicts.

### Evidence 5: Verification DID fire
From the log: `Final re-check: 3 files with errors` — the `WebAdapter.verify()` pass caught problems. Two rewrite cycles ran. Both made things worse (scores dropped). After max retries: `Final verification: still failing after 2 rewrites — continuing`.

The pipeline knew the files were broken. It moved on anyway because the final reviewer gave high grades.

## Root cause analysis

Three compounding failures:

### 1. Allowlist design flaw (the RI-1-specific bug)

`_build_tailwind_class_allowlist(design_tokens)` generates class names by combining Tailwind utility prefixes (`bg-`, `text-`, `p-`, `px-`) with design-token slugs (`bg-primary`, `section-gap`, `page-padding`). The result is a set of strings like `bg-bg-primary`, `px-page-padding`, `py-section-gap` — these look Tailwind-flavoured but **do not correspond to real Tailwind utilities**.

For the model to produce working output:
- Either the Tailwind `tailwind.config.js` must be extended with a theme mapping (`colors: { 'bg-primary': '#1a1a2e' }`, `spacing: { 'page-padding': '2rem' }`, etc.) so `npx tailwindcss` compiles these classes into real CSS rules
- Or the allowlist must be restricted to **actual** Tailwind v3 utility names (`bg-gray-900`, `px-8`, `py-16`)

RI-1 v1 does neither. The allowlist claims authority without the Tailwind runtime actually knowing what those classes mean. The generated HTML references classes that nothing defines.

### 2. Rewriter makes things worse when forced to fix

Cycle-by-cycle score histories show scores **dropping** on rewrite, not improving (71.5 → 39.5 in one task). The rewriter, given "this class is not in the allowlist" feedback, substitutes other classes from the allowlist — which are equally undefined in the CSS. Each rewrite pushes the output further from working.

This is a more general issue: the rewrite loop trusts the verification findings but has no concept of whether its own fix is better than the original.

### 3. Rubric reviewer blind spot (RI-3 should have caught this, it did not)

Devstral (production-recommended reviewer) graded every broken file as A with "No issues". The new RI-3 markup-mode instructions explicitly tell it to check "every CSS class referenced in the HTML must be defined in a CSS file present in the reference context". **That check should have fired** on `bg-bg-primary`, `text-text-primary`, etc. It did not.

Possible reasons:
- Devstral saw the allowlist in context and treated it as "defined", ignoring the actual CSS file contents
- The rubric review doesn't have the CSS file in its reference context for page tasks — it sees HTML + blueprint but not the CSS file
- Devstral is following the rubric-scoring path rather than the task-type-guidance path in the prompt template

**This is the same class of bug as Phase 4B's mistral blind spot on `@media var()`.** RI-3 is catching some issues (Phase 3 improvements on css/early_access) but not catching all. LLM reviewers alone are not reliable for structural checks; we need more deterministic verification.

### 4. Hybrid cached blueprint (partial cause)

The validation cascade used `cached_stages_strong_tailwind.json` — cached Stages 1-4 with `"css": "tailwind"` hand-injected. The blueprint's **prose** still says "plain HTML + CSS stack", but the tech_stack JSON says Tailwind. The model receives contradictory guidance and the vanilla-leaning prose may explain why it produces `:root` custom-property CSS instead of a Tailwind-compiled stylesheet.

## What worked

Despite the failure, RI-1 validated several things:

- **Infrastructure threading is sound**: `tailwind_allowlist` flows cleanly from `ParsedBlueprint` → `AssembledProject` → `WebAdapter.verify()` without breaking anything. 227/227 tests pass.
- **The allowlist builder runs**: 713 classes generated from the real token set, smoke test passes, parser detects `tech_stack.css == "tailwind"` correctly.
- **`_check_css_classes` Tailwind branch fires**: verification reports 3 files with errors in the final re-check — the rule is wired and active.
- **Tailwind CLI installs cleanly on both machines.**
- **Prompt Tailwind-mode sections render in context**: the `<!-- TAILWIND_ALLOWLIST -->` marker reaches the model, the model recognises it and uses allowlisted class names (not random invented ones).

**None of this is wasted.** The scaffolding is the right shape for a future RI-1 v2.

## Options for the user

### Option A — Hard revert commit `59b70ca` (recommended for safety)

- Undoes the 17-file Phase 4 commit entirely
- Production pipeline returns to post-RI-5+RI-3 state
- Cold_Anvil is left in a clean known-good state
- Infrastructure can be re-added later under an explicit RI-1 v2 redesign
- Lowest risk

### Option B — Keep scaffolding, remove Tailwind detection (middle path)

Revert only `blueprint_parser.py`'s detection block (`if str(tech_stack.get("css", "")).lower() == "tailwind": ...`). Leave:
- `tailwind_allowlist` field on dataclasses (None everywhere in production)
- Kwarg threading through verify / iterative / cascade
- `_check_css_classes` Tailwind branch (dead code until allowlist is set)
- `_run_tailwind_build` helper (dead code)
- packs/website_tailwind/ (unused pack)
- prompt Tailwind-mode sections (only fire on allowlist marker in sibling_files)

Result: production behaviour is 100% unchanged (no Tailwind detection, allowlist stays None), scaffolding is preserved for RI-1 v2.

Risk: any rogue blueprint with `"css": "tailwind"` would re-activate the broken path. Acceptable if we ensure Stage 4 prompts never emit that key.

### Option C — Keep everything and design RI-1 v2 in a follow-up

Leave `59b70ca` in place. Document the failure in the final report. Any future cascade with Tailwind-declared tech_stack will hit the broken path. No production cascade declares Tailwind today, so the bad behaviour is quarantined to validation runs.

Risk: higher than Option B — the scaffolding activates too eagerly if someone adds a Tailwind tech_stack declaration accidentally.

## Recommendation

**Option A (hard revert).** Reasons:

1. The user said "let's be wary of classing any regressions purely as noise" — this is a real regression on every axis that matters (file-level content, CSS validity, rendering). The A grade is noise; the actual output is degraded.
2. RI-1 in its current form is not one tuning pass away from shipping. The allowlist design needs a fundamental redesign (either real Tailwind utilities only, or real theme mapping in tailwind.config.js).
3. The infrastructure work is documented in the commit and can be re-added surgically for RI-1 v2. Revert is not "throw away the scaffolding" — it's "keep master clean until we have a working version".
4. Shipping RI-1 v2 properly needs:
   - Allowlist that uses real Tailwind utility names, OR a tailwind.config.js theme mapping from design tokens
   - Stage 4 prompt updates so blueprints declare Tailwind in the prose too, not just tech_stack JSON
   - Reviewer prompt updates (RI-3 v2) that specifically check "HTML class ∈ defined-CSS-classes" with the CSS file in review context

That is a genuine Wave 2 project, not a Phase 4 follow-up.

## Meta-learning: the reviewer blind spot is still active

This Phase 4 cascade is **the clearest evidence yet** that LLM rubric reviewers are unreliable for structural checks. devstral — the reviewer we specifically chose for its calibration — graded broken output as A. Phase 4B caught mistral doing this with `@media var()`. Now Phase 4 caught devstral doing it with undefined Tailwind classes, placeholder nav components, and file-path-as-class-value.

**RI-5 helps but does not fully solve this.** The current structural_check rules don't cover:
- "HTML class references an undefined CSS class" (structural, not semantic — should be added)
- "Placeholder comment where content is expected" (heuristic, harder)
- "Weird class attribute values like file paths" (heuristic — regex on `/` in class names?)

These are candidates for a Phase 2 follow-up that extends structural_check with more rules. Each is a deterministic check that no LLM reviewer reliably catches.

## What I'd like to do next

Pending your decision on Option A/B/C. If you pick A, I'll:
1. `git revert 59b70ca` on Cold_Anvil
2. Remove `cached_stages_strong_tailwind.json` and `autonomous_run/tailwind_v1_runner.py`
3. Update `wave1_state.json` to reflect RI-1 reverted
4. Write the Wave 1 final report with RI-5 + RI-3 shipped and RI-1 deferred to Wave 2
5. Phase 5 checkpoint — done.
