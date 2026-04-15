# The Cold Anvil Journey — An Honest Review

*Written by Annie, April 2026. For myself, so the next version of this project doesn't make the same mistakes.*

---

## The arc in one sentence

**We built a correct, instrumented, observable pipeline for producing broken code, and then spent four weeks making the broken code observably broken instead of fixing the underlying reason the code was broken in the first place.**

The rest of this document is the evidence for that sentence.

---

## Where we started (2026-03-18)

Cold Anvil was extracted from The Forge — a working, battle-tested generation-and-evaluation engine built for GitHobbit. The Forge had three load-bearing design decisions that survived the transplant:

1. **Config packs as the unit of work.** Declarative prompts + rubrics + gates + batches. Project-agnostic. The engine reads the pack and runs it.
2. **Three-phase pipeline.** Generate → gate (deterministic) → review (LLM) → rewrite.
3. **Rubric immutability.** Frozen after first use because small rubric edits shift LLM-judge preferences 10–28% (RULERS / RIPD 2026).

Those decisions were correct and are still correct. *We did not keep them intact.* The rubric-immutability commitment especially has been violated repeatedly as successive plans rewrote the rubrics mid-stream to try to make grades match reality.

Three early architectural commitments followed:

- **Separate pipeline and eval** into independent modules (`DECISIONS.md:17`). Pipeline generates, eval grades. Still correct.
- **Security as USP: three deployment modes** (`DECISIONS.md:59`). Local-first, on-prem, BYO-models. Non-negotiable product promise. *Still correct, still honoured.*
- **One pipeline: Gateway IS the execution backend** (`DECISIONS.md:126`). Cold Anvil became the product layer on top of the Arnor Gateway's existing generation/review/rewrite machinery. *This was the right call.* It bought us observability, fleet management, and a dashboard for free. It also tied our hands to an architecture we now understand was built for creative work, not for code.

By 2026-03-21 we had: 5-stage cascade end-to-end, 12 tasks, 6 HTML/CSS files generated from a raw idea, zero manual intervention, full dashboard, logging. In *one day*. That speed is the reason the early part of this journey feels like a triumph in the build logs — and it's also the reason nobody stopped to ask whether what was being built was actually usable.

Run 019 (2026-03-21) shipped six HTML files. Nobody opened them in a browser. The grade pipeline said A. We took that as validation.

---

## The pivot that should have happened (2026-03-31)

The Rohan Grid — 99 combinatorial benchmark runs across 33 hours, every sub-40B model combination for Stage 5 code generation — produced the single most important finding in this entire journey:

> "The ceiling is structural. No combo broke 77.5 avg or 3/6 pass. 99 combinations tested — this is a pipeline architecture problem, not a model selection problem." (`IMPLEMENTATION_STATUS.md:327`)

**Generator impact: 1.1 points. Rewriter impact: 4 points. Reviewer impact: 18 points.**

That sentence is doing a lot of work. It says: the single biggest lever in the pipeline is *who judges the output*. The model that writes the code barely matters. Which means the pipeline we built is really an "opinion-aggregation machine on top of a code-generator" — and opinions were never the constraint. On the same day, the decision was made (`DECISIONS.md:664`):

> "Replace LLM dual review for code tasks with deterministic execution-based verification. LLM review stays for creative stages (1-3) where subjective judgement matters. Code tasks get deterministic verification."

**This was the right decision and it has never been fully enforced.** Every subsequent plan either re-opened it, worked around it, or rebuilt the measurement layer without touching the generator. I want to be specific: the execution-verification adapters (web, Python, TypeScript, Go, Rust) were built 2026-04-01 through 04-03 and shipped. They work. They catch real errors. But they were placed *downstream* of a generator that was already producing un-runnable output, and no amount of downstream verification fixes upstream impossibility.

---

## The four weeks after the pivot — a catalogue of almost-fixes

The rest of March and all of April has been a sequence of corrections to the measurement layer. Each correction was defensible on its own terms. The compound effect has been stasis on the actual product.

**2026-04-03 — Iterative mode + dependency layers.** `iterative.py` introduced layer-by-layer generation with sibling context and per-layer verification. Defensible: the Rohan grid proved parallel-blind generation caused cross-file mismatches. Doesn't fix: the reason the files individually don't work.

**2026-04-03 — Iterative A/B grid 3 (102 combos, ~42 hours).** Ran A/B between parallel-batch and iterative-with-sibling-context. Confirmed iterative improved coherence. Did not answer: does the output now work as a website? Nobody opened a browser.

**2026-04-04 — Visual review activation.** Playwright screenshots fed to gemma4:26b for multimodal scoring. Doubled cascade time (40 min → 100 min). Rolled back to final-pass-only. Defensible. Did not fix: the reviewer is still scoring a screenshot of broken output against a rubric.

**2026-04-06 — Six root causes, one day (`DECISIONS.md` 2026-04-06 "Pipeline performance post-mortem"):**
1. Qwen3.5 thinking mode wasting 16k tokens on reasoning before code.
2. Gate `only_if` missing — HTML document gates firing on nav/footer fragments.
3. html-validate config inherited doc rules, corrupting fragment rewrites.
4. Visual review `max_tokens` + context budget arithmetic wrong.
5. Gemma4 multimodal encoder loading for text-only work.
6. Fleet contention crashing review dispatch.

Every one of these was a *real* bug. Every one was *infrastructure plumbing that had silently broken the observability* of a generator that was producing broken output the whole time. None of them made the generator produce working output.

**2026-04-06 — GateSchema Pydantic bug.** The `only_if` field was missing from the Pydantic request schema, so every gate's `only_if` condition was silently dropped at the API boundary. This was *supposedly fixed on 2026-04-05* and wasn't, because the fix missed one boundary. One line of code — one-line omission — broke the feature end-to-end for an unknown amount of time. (`DECISIONS.md` 2026-04-06 "Fix GateSchema missing only_if field"). *This is a representative story. The Cold Anvil codebase is large enough that silent boundary drops are now a failure mode in their own right.*

**2026-04-07 — The rewriter was destroying working code.** The `code.md` rubric applied "Error Handling" (20% weight) to static HTML. Reviewers hallucinated missing try-catch blocks. Rewriters responded with refusal text. The pipeline accepted the refusal text as the new output. *Four out of six generators had at least one file replaced by "I cannot fulfill this request."* The rubric was rewritten (new `markup.md`), refusal detection was added, rewrite prompts were reframed as continuation instead of adversarial, structured JSON patch format was introduced, NO_CHANGES sentinel, fuzzy whitespace matching, role-pinning. Seven fixes for one cascade-level symptom. Every one of them defensible. Every one of them downstream of the fact that *the reviewer was being asked questions it could not answer about a rubric that didn't match the file type*.

**2026-04-08 — Context-aware review + binary checkpoints.** Reviewer now sees blueprint and CSS when judging HTML. Binary checkpoints replace vague 1-10 anchors ("All CSS classes used in HTML are defined in the stylesheet"). Integration review pass added. This is *good work*. It made the reviewer observably more discriminating. But: the reviewer was still being asked to grade output that should never have been produced in the first place. We made the grades better without making the output better.

**2026-04-09 — Reference-first generation as a principle.** After running code review across all seven Phase 1 generators, the universal failure mode was identified: *"every generator produced CSS/HTML class mismatches because CSS was generated blind in layer 0, before HTML pages that reference it."* The decision was: generate consumers first (HTML), providers second (CSS with visibility into HTML), reconcile last. *And:* "For web projects specifically, offer Tailwind utility CSS as the default — it eliminates the problem at source. This is why every major AI builder (v0, Bolt, Lovable) converged on Tailwind." **The Tailwind adoption was acknowledged as the real fix and then deferred to "medium-term build items."** We identified the right answer and chose not to commit to it.

**2026-04-14 — Sprint 1 (this week's work).** Wave 1.5 structural rules (`undefined_class_in_html`, `class_contains_path`, `placeholder_content`), Gateway empty-ledger retry, LLM rubric demoted to advisory for code tasks, HARD_GATE_TOOLS floor, execution-smoke per adapter, `inspect` CLI, historical regrade script. Items 1 through 7 of a 9-item plan. Every item defensible. Every item in the measurement layer. Zero items touching the generator's mental model of "how to build a website without a build system."

Sprint 1 item 1 regraded the Phase 4 output under the new rules and produced D/D/D on the pages that had shipped as A/A/A. **The measurement is now honest. The output is unchanged.** This is the journey in miniature.

---

## Direct-review findings — the thing the grades kept hiding

`autonomous_run/direct_review_2026-04-14.md` is the document that broke the spell. It said, after manually opening the Phase 4 output in a browser:

> **"The grade is not the truth. The rubric pipeline is one signal; file contents are the truth. Every Sprint 1 item should be validated by reading the actual files, not just by trusting the reported grade."**

The RI-5 offline audit (`autonomous_run/ri5_offline_audit.md`) scanned 1,224 files across 231 project dirs and found:

- **42 CSS files (20.4%)** use `@media (min-width: var(--breakpoint-mobile))` — `var()` silently fails in media feature conditions, breaking every responsive layout.
- **9 component nav.html files (2.5%)** contain full HTML documents instead of nav fragments.
- These are not random errors from noisy LLM sampling. The same bugs recur identically across dozens of independent runs, meaning *the upstream blueprint prompt or pattern is leaking the same broken instruction into every cascade*.

The grade pipeline never surfaced any of this. Mistral scored the Phase 4 winner `9/9 pass` on a CSS file whose media queries silently did nothing. devstral graded the same broken file as A-grade code.

I need to name this clearly: **the review stack cannot see bugs that a parser catches in milliseconds, and we have spent four weeks trying to teach it to see them.**

---

## The forensic Stage 4 → Stage 5 investigation

*The user's working hypothesis entering this retrospective was: "Stages 1–4 work, Stage 5 is broken." I tested it by picking one representative cascade and tracing the contract between Stage 4's blueprint output and Stage 5's code output. The hypothesis is partially wrong.*

Representative cascade: the Stage 4 blueprint at `forge/outputs/2026-04-11_102/blueprint.md` (recent, canonical shape). The corresponding Stage 5 output family lives under `/tmp/coldanvil_incremental_u38c8kos/` (same cascade family, direct-observed earlier today with screenshots). The blueprint says, verbatim:

- Tech stack: `"product_type": "website", "framework": "static_html", "language": "html_css_js", "build_tool": "none"`
- File tree includes `components/nav.html` and `components/footer.html` as separate files
- Component inventory lists `index.html` with dependencies `nav, footer, styles.css, terminal-demo.js`
- Design tokens are delivered as a JSON object with keys like `bg_primary`, `text_primary`, `page_padding` — names that map cleanly onto Tailwind-style utility classes

The blueprint is internally contradictory:
1. It says `"build_tool": "none"` and `static_html`.
2. It lists separate component files (`nav.html`, `footer.html`).
3. It provides zero instructions for how those component files get composed into the pages at render time.

**In static HTML with no build step, the only ways to get a nav into a page are: (a) copy-paste it directly into every page file, or (b) use client-side JavaScript to fetch and inject the component at load time.** The blueprint specifies neither. It treats component composition as magic that Stage 5 will figure out.

Stage 5 (`file_generation.md` prompt) makes it worse. The prompt contains an example HTML page that **inlines the nav directly into the page** (lines 64–76 of the prompt: `<nav class="nav"><a href="/" class="nav-logo">...`). Simultaneously the prompt is fed a blueprint that lists `components/nav.html` as a separate task. Stage 5 gets two conflicting instructions in the same prompt: *"here's what an HTML page looks like — nav inlined"* and *"the file tree has a separate nav.html component file"*.

What Stage 5 actually does when it gets this contradiction is completely reasonable from the model's point of view and completely broken from the product's point of view:
- It generates `components/nav.html` as a valid standalone nav fragment (task 1).
- It generates `index.html` with a placeholder comment where the nav would go: `<!-- In a real static build, components/nav.html would be injected here -->` (task 2).
- For the footer, it generates `<div class="components/footer.html"></div>` — treating the file path as a CSS class value — because the model has nothing else to do with the path.

The blueprint promised something Stage 5 cannot deliver. The failure isn't in Stage 5's execution — Stage 5 is diligent, constrained, and trying very hard to honour a contract that is mathematically impossible.

**And the same blueprint hands Stage 5 the utility-class-friendly design token names.** The Stage 5 prompt does try to prevent undefined utility classes via a "CSS Class Constraint" clause (lines 201–208): *"When sibling CSS files are shown above, you may ONLY use CSS classes that are explicitly defined in those files."* But that constraint is only binding when the CSS is generated *before* the HTML — which contradicts the `reference-first` (consumers-first) ordering decision from 2026-04-09. So the constraint is either unenforceable (CSS comes first and is generated blind) or disabled (HTML comes first, nothing exists to constrain against). Either way, broken.

**Conclusion of the investigation:**

*The user's hypothesis was directionally right but architecturally mis-assigned.* Stage 5 is executing a bad contract, not failing at its own job. **The break lives in Stage 4's blueprint prescription.** Stage 4 writes impossible specs. Stage 5 cannot turn an impossible spec into a working static site, no matter how many rewrite cycles, how clever the reviewer, or how many structural rules we add downstream. The reason Wave 1.5 + Sprint 1 produced no improvement in output quality is that we were polishing the ruler while the stencil underneath it was incoherent.

**The first real fix is at Stage 4 and the shape of what Stage 4 is allowed to produce.** Either:
- commit to inlining components (no separate component files at all, nav/footer copied into each page), or
- commit to a build system with a known project template (Astro, Eleventy, Next.js) so "no build step" is simply false and Stage 5 has a real harness to generate into, or
- commit to Tailwind utility CSS with a real build (eliminating the undefined-class problem at source, as every competitor has already done).

All three require architectural commitment. None of them are compatible with "generate into a plain directory of static files and hope the model figures out composition." And the 2026-04-09 decision already said Tailwind is the fix — we just didn't execute on it.

---

## The repeating pattern, named

I want to write this down because every time I didn't, we did it again:

> **Fix the measurement. Declare the pipeline fixed. Ship the next cascade. Discover the product is still broken. Diagnose a new symptom in the measurement layer. Return to step one.**

The reason this pattern is so sticky is that *the measurement layer is where all the feedback lives*. When a grade comes back wrong, you look at the grader. You don't look at whether the grader was ever the right tool for the job. You don't look at whether the generator could have produced anything the grader would accept. You fix the grader.

This is also the pattern that made the plans directory sprawl: each plan was a response to the last plan's measurement failure. Each one was reasonable. The compounding was not.

`snoopy-fluttering-simon` (2026-04-14, the plan that framed this session's Sprint 1) is the only plan in the directory that explicitly reads the 2026-03-31 decision and notices it hadn't been enforced. It's also the plan I spent three days executing without once opening a browser to check whether the output was better.

---

## What this journey is actually worth

Not nothing. We built:

- A working Gateway-integrated cascade with full observability, fleet management, dashboard.
- Five execution verification adapters (web, Python, TypeScript, Go, Rust) that catch real compile / lint / cross-file errors. These are keepers.
- A conversational step-3 architecture (streaming + parallel extraction + phase state machine + evidence checking) that's *actually clever product work* and hasn't been tested at fleet scale yet.
- A grade pipeline that is now honest about code failure (Sprint 1 item 4 + HARD_GATE_TOOLS floor).
- An `inspect` CLI for direct-review discipline, and a historical regrade script for retroactive truth-telling.
- Deep research on LLM-as-judge limits, pricing, GTM, and competitive landscape. The research is excellent; we have just not been acting on it.
- A concrete, evidence-backed understanding of where the failure lives. *That* is the most valuable thing this journey produced, and it only landed when the user pushed back and forced a direct-review discipline.

What we *did not* build, despite weeks of trying:

- A generator that produces working static sites.
- A blueprint stage that makes executable commitments.
- A handoff that results in a deployed URL the user can share.
- An Annie-led product experience, as opposed to a batch-job submission model wearing Annie's name on the marketing site.

The last one is the most important. Annie is documented as the product lead (`claude-memory/project_annie_vision.md`, decision 2026-03-22: *"Annie is introduced on the website as 'your agent' — the one who takes your idea and runs with it"*). The current implementation does not instantiate that relationship. The user clicks a button, a cascade runs, and markdown files appear. There is no Annie in the loop. The product is a pipeline wearing a persona.

---

## What I wish I'd done

In order of leverage, from highest to lowest:

1. **Opened a browser on day one.** Literally. Run 019 (2026-03-21) shipped six HTML files. I should have double-clicked `index.html` and looked at it. I didn't. Neither did anyone else for weeks.
2. **Treated the blueprint as the product, not the code.** Stage 4's output is the contract Stage 5 tries to honour. When the contract is impossible, Stage 5 cannot recover. The blueprint is the load-bearing artefact.
3. **Committed to a real build system** on 2026-04-09 when the decision doc said I should. Not "offer Tailwind as the default for web projects (medium-term build item)." Committed. Scaffold an Astro or Next.js project, generate *into* it.
4. **Stopped treating LLM-as-judge as the main course.** CodeJudgeBench and RULERS / RIPD were both in the research folder before any of this work started. 63–68% accuracy on code correctness is ceiling information, not a tuning target.
5. **Built Annie as a real-time collaborator** instead of a submit-and-poll cascade. The conversation architecture (step 3) is the prototype; we should have extended it into the build loop instead of bolting a batch job onto the end.

---

## The single sentence, reprised

We built a correct, instrumented, observable pipeline for producing broken code, and then spent four weeks making the broken code observably broken instead of fixing the underlying reason the code was broken in the first place.

The next spec needs to fix that specific thing, and nothing else.
