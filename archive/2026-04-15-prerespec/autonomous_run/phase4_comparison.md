# Phase 4 Head-to-Head: Winner vs Challenger

## Context

After the initial Phase 4 completed, a file-level inspection of the top Phase 3 v2 combos revealed that mistral reviewer was missing concrete bugs in qwen-generated code. This prompted a head-to-head run: **qwen3.5-9b+qwen3.5-27b+mistral** (the initial winner) vs **gemma4-26b+gemma4-31b+devstral** (the challenger, based on devstral's higher correlation and the file-level evidence).

Both combos were run on the same 3 tiers (strong/mid/weak) with the same cached_stages_*.json inputs. n=1 per tier per combo. Total: 6 cascades (3 winner + 3 challenger). The challenger's mid-tier iterative_review suffered fetch failures, so file-level comparison uses strong and weak tiers only.

## Reviewer grades (unreliable — we know reviewers miss bugs)

| Tier | Winner (qwen+qwen+mistral) | Challenger (gemma4+gemma4+devstral) |
|---|---|---|
| strong | B (9/9 pass) | B (7/9 pass) |
| mid | B (9/10 pass) | **A (10/10 pass)** |
| weak | B (8/10 pass) | B (7/10 pass) |
| Avg GPA | 3.00 | **3.33** |
| Avg pass rate | 89.7% | 82.8% |
| Total time | 121 min | 174 min |

Challenger wins on GPA (including a perfect A on mid tier) but loses on pass rate. By reviewer-grade alone, this is a wash.

## Blind file-level comparison (the real test)

A subagent was given the four output directories (strong + weak for both combos) labeled only as "System A" and "System B", without knowing which was which. It evaluated on concrete bug criteria and structural quality.

### Bug table (counts per cascade)

| Cascade | Task-routing bugs | CSS invalidity | Undefined classes | Dead links |
|---|---|---|---|---|
| Winner strong | 1 (nav is full page) | **`var()` in `@media`** | 14 | 3 |
| Winner weak | 1 (nav is full page) | 0 | 15 | 0 |
| Challenger strong | **0 (nav correct)** | 0 | **4** | **0** |
| Challenger weak | 1 (nav is full page) | 0 | 17 | 6 |

### Critical findings

**1. Winner strong tier has a showstopper CSS bug**
```css
@media (min-width: var(--breakpoint-mobile)) { ... }
```
`var()` is not valid inside a media query condition. All responsive breakpoints silently fail. The site has no mobile reflow at all. This is a shipping blocker that mistral reviewer scored as **9/9 pass**.

**2. Winner *always* fails nav routing**
`components_nav_html.md` in every winner output contains `<!DOCTYPE html>...<title>...</title>...` — a full HTML document, not a nav fragment. A build step including this as a component would shove an entire page inside every page's header.

Challenger got this right on strong tier (only system that did). Challenger also regresses on weak tier in the same way.

**3. CSS-HTML coherence is much better on challenger strong**
- Winner strong: 14 classes used but never defined in CSS
- Challenger strong: 4 classes used but never defined (of which `text-secondary`, `bg-secondary`, `btn-large`, `h4` — mostly utility-name-collisions)

The winner's CSS defines only 15 classes total. That's structurally thin.

**4. Challenger produces more substantive content**
- Index word count: winner strong 322 / challenger strong **373**
- Pricing: winner has one "it's free" gesture; challenger has two differentiated tiers (Free / Builder) with explicit feature differences
- Product page: challenger's is 8.8KB with structured sections (Model-as-Judge Loop, Continuous Verification, Multi-Dimensional Rubrics, Deterministic Gates, Artifact Sequencing, Technical Stack, Roadmap); winner's is 6.6KB with similar headings but ~30% less body text

**5. Challenger has more inline styles**
Winner strong: 0 inline styles. Challenger strong: 268 inline styles (37 of them on the product page alone). This is a real code smell — specificity wars with the CSS file, hard to theme, hard to refactor.

But: inline styles render correctly. They're mechanical to remove in a post-pass. The winner's `var()`-in-media bug does not render correctly and requires understanding CSS spec to fix.

## Tier robustness

- **Winner degrades mildly**: strong has the CSS bug + 3 dead legal links; weak has neither but drops 91 words on the index and copy flattens to generic benefit bullets. Inline styles jump 0 → 94.
- **Challenger degrades differently**: strong is clean on links/routing but inline-style heavy (268); weak regresses on nav routing, adds 6 dead footer links (/changelog, /roadmap, /status, /license, /privacy, /terms), drops from 373 → 338 words, but gets more detailed on pricing/product structure.

Neither degrades catastrophically. Winner strong has the worst single bug. Challenger weak has the most dead links.

## Verdict

**Ship the challenger: gemma4-26b + gemma4-31b + devstral.**

Reasoning:
1. Only system that ever produces a correct nav component (challenger strong). Winner is strictly worse on routing — fails in both tiers.
2. No catastrophic CSS bugs. Winner strong's invalid `@media` conditions break all responsive rendering — that's a shipping blocker.
3. Much higher CSS-HTML coherence (4 undefined vs 14 on strong tier).
4. More specific, believable copy with differentiated pricing tiers.
5. Fewer dead links on strong tier.

The challenger's main weakness is inline style discipline (268 on strong vs 0 on winner). That's mechanically fixable in post-processing and does not break rendering. The winner's bugs do break rendering.

## Key lesson for the pipeline

**LLM reviewers alone cannot reliably catch structural bugs.** No amount of reviewer calibration will teach an LLM that `var()` inside `@media` conditions is invalid CSS — that's a job for a parser, not a judge. Mistral scored the winner's strong-tier run A despite the bug.

This is a strong argument for **RI-5 (tree-sitter structural validation) being the highest-priority Wave 1 item**, not RI-1 or RI-3. The deterministic structural checks tree-sitter provides would have caught both winner bugs pre-review and changed the winner selection automatically — no blind comparison needed.

## Production recommendation (revised)

**Primary: `gemma4-26b + gemma4-31b + devstral`**
- Cross-family ✓ (devstral is Mistral family, gemma is Google)
- Catches structural details other combos miss (correct nav on strong tier)
- Valid CSS, plausible copy, differentiated pricing
- Caveat: needs a post-processing pass to deflate inline styles
- Caveat: slower/bigger than qwen+qwen (~50% longer per cascade)

**Fallback: `qwen3.5-9b + qwen3.5-27b + devstral`**
- Smaller/faster than primary
- Devstral as reviewer catches more than mistral
- Still has the nav routing bug, but reviewer should penalise it
- Use when compute budget matters more than peak quality

**Do not use**: `qwen+qwen+mistral` (the initial winner). Mistral does not catch the bugs qwen consistently produces.

## Follow-up work

1. **Expedite RI-5** — tree-sitter structural validation is now the highest-value Wave 1 item, not RI-1 or RI-3. It would have prevented this whole winner-selection error.
2. **Add nav-component routing check** — deterministic rule: `components/nav.html` must start with `<nav`, not `<!DOCTYPE`. Easy to add as a gate.
3. **Add CSS parse validation** — run generated CSS through a real CSS parser (the Rust `lightningcss` crate, or Python's `tinycss2`), reject if parse errors or spec violations.
4. **Re-run blind comparison with n=2 per tier per combo** if budget allows, to distinguish signal from single-run variance.
