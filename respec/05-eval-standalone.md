# Cold Anvil Eval — Standalone Position

*Companion to `03-spec.md`. The respec covers Annie-the-builder. This covers the eval layer as a product in its own right.*

---

## What it is

A rubric-based quality assessment engine for LLM-generated creative and subjective content. You bring your content, define your rubrics, and get structured, reproducible quality scores with evidence-cited feedback.

This is not code linting. This is not "does it compile." This is: *does this vision document actually identify a real user problem? Does this marketing copy hit the brief? Does this script's narrative arc land? Does this brand voice guide produce output that sounds like the brand?* — questions where "good" is subjective, context-dependent, and impossible to check with a compiler, but where a structured rubric with observable anchors produces consistent, differentiating scores.

---

## What it does

- **Rubric-based scoring.** Each rubric has weighted dimensions with anchored descriptions at defined score levels. Anchors are observable and countable ("every sentence could only come from this character" vs. the useless "good voice"). Rubrics are frozen after first use — small edits shift LLM-judge preferences 10–28% (RULERS arXiv:2601.08654, RIPD arXiv:2602.13576), so version immutability is not optional, it's a correctness guarantee.
- **Adversarial review framing.** The reviewer lists problems before scoring, counteracting the agreeable tendencies of LLM judges. Chain-of-thought before scoring reduces evaluation failures from 70% to 15% (MT-Bench finding, applied in our review prompt since 2026-04-08).
- **Evidence-required grading.** The reviewer must quote specific passages from the content as evidence for each score. Scores without evidence are rejected. This prevents vibe-scoring and makes every grade auditable.
- **Multi-dimensional feedback.** Each dimension produces a score, a justification, and specific improvement suggestions. The output is not "7/10" — it's "Specificity: 6/10 because the problem statement names a category of user but not a specific person; the hook uses 'many people' instead of a concrete scenario."
- **Generation-agnostic.** The eval layer does not care where the content came from. Cold Anvil's own pipeline, ChatGPT, Claude, a human writer, a competitor's output — it all goes through the same rubric, same scoring, same evidence checking. Bring your own content.

---

## Who it's for

**Teams that already generate content with LLMs but have no quality layer.** They know the output is inconsistent. They manually review everything. They can't define "good" in a way the machine can enforce. They want to stop playing the regeneration lottery and start defining standards that persist across runs, across team members, across models.

Concretely:
- Marketing teams generating campaign copy, landing pages, email sequences
- Content teams producing documentation, knowledge bases, help articles
- Creative agencies using LLMs for first drafts of brand materials
- Product teams generating specs, PRDs, user stories
- Anyone in The Fourth Age's future domain — YouTube creators evaluating scripts, titles, thumbnail concepts against storytelling rubrics

**Not for:** code correctness (use compilers), factual accuracy (use retrieval + citation checking), anything where "does it work" is a binary execution question.

---

## Why it's differentiated

No competitor in the AI builder or AI content space offers this:

- **Lovable, Bolt, v0** have no eval layer at all. Their quality signal is "did it render."
- **ChatGPT, Claude, Gemini** can score content if you prompt them to, but there's no rubric versioning, no freeze-after-use, no evidence requirement, no dimensional structure, no reproducibility guarantee. Every session starts from zero.
- **Custom internal tools** exist at large companies but are bespoke Python scripts maintained by the one engineer who wrote them. Not portable, not versioned, not a product.

Cold Anvil's eval layer is a product because: rubrics are declarative (not code), frozen after first use (not drifting), evidence-required (not vibes), and generation-agnostic (not coupled to a specific pipeline). That combination does not exist anywhere else as a purchasable capability.

---

## How it relates to Annie

Annie uses the eval layer as one of her tools. When she generates a vision doc, a roadmap, content, or any creative artefact for a user, the rubric-based eval assesses quality before she shows it to the user. If the eval says the vision doc's "Problem Clarity" dimension scored 4/10 with the justification "the problem statement is generic and could apply to any SaaS," Annie rewrites it before the user ever sees it. The user experiences this as "Annie is good at her job." Under the hood, it's the eval layer doing quality control.

This is one direction of value flow. The other direction is: eval-as-standalone can exist without Annie. A team that already has their own generation pipeline can use Cold Anvil's eval API to score their own content against their own rubrics, without ever touching the builder. These are two different products sharing one quality engine.

---

## What's already built

The machinery exists and has been tested across hundreds of runs:

- Rubric format: weighted dimensions, 1/3/5/7/9/10 anchored descriptions, YAML-serialisable, frozen after first use. Eight rubrics currently authored covering vision, roadmap, content, creative output, site architecture, tech design, code (demoted for code tasks), and test generation. Two rewritten to v2.0 with observable anchors (copy_generation, creative_output) after v1's taste-based anchors failed reviewer models.
- Review prompt: adversarial framing, chain-of-thought instruction, anti-central-tendency instruction, evidence-required scoring. Iterated across four major revisions (March 25, April 6, April 7, April 8).
- Scoring pipeline: dimension parsing, weighted total calculation, sanity checking (recalculates when < 10 or > 100), verdict logic (PASS/REVISE/REJECT), rewrite-with-feedback loop.
- Gateway integration: review batches via Arnor Gateway `/forge/batch` with `pre_generated_output` support (score content without regenerating it).

The eval layer is the most mature, most tested, most iterated part of Cold Anvil's codebase. It has survived every rewrite. It works.

---

## What would need to be built to ship it standalone

- **An API surface.** A simple endpoint: POST content + rubric, GET scores + feedback. The Gateway already supports this via `pre_generated_output` batches; wrapping it in a clean public API is a small build.
- **Rubric authoring UX.** Today rubrics are hand-authored YAML/markdown. A guided authoring experience ("what are you evaluating? what dimensions matter? give me an example of good and bad for each") would make the product accessible to non-technical teams. This is the conversational-flows architecture applied to rubric creation — Step 6 in the old user journey, stubbed but not built.
- **A dashboard.** Scores over time, dimension breakdowns, comparison across runs, trend lines. The Gateway dashboard already has the data; a standalone eval dashboard is a frontend build on existing data.

None of these are large. The engine is built. The API shape is proven. The authoring UX has a spec (`Product_Specs/conversational-flows.md`, Step 6). This is a product that's closer to shippable than the builder is.

---

## The strategic read

Eval-as-standalone is potentially a faster path to revenue than Annie-the-builder. The builder requires solving the full stack (conversation + generation + live preview + deployment + continuity) before a single user gets value. The eval layer already works, already produces value, and could be offered as an API to a different audience (teams, not solo founders) while the builder is being built.

It's also the foundation the Fourth Age would sit on. The Fourth Age's domain-specific rubrics — hook effectiveness, narrative structure, title-thumbnail alignment, audience psychology — are eval rubrics in a different domain. If eval ships as a standalone product, Fourth Age becomes a vertical application on top of it, not a separate build.

Both products (Annie-the-builder for solo founders, eval-as-standalone for teams) share the same engine and the same infrastructure commitment (private-first, Arnor Gateway, local inference). They are siblings, not competitors. Building one does not delay the other — it strengthens the shared platform underneath.
