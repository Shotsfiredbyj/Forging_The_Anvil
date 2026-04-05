# Cold Anvil — Background and Vision

## The Problem

Most teams using LLMs for real work are stuck in one of two places.

**The lottery.** They prompt by hand — copy-pasting into ChatGPT or Copilot,
regenerating until something usable appears, then manually editing the output.
Quality is inconsistent. There's no record of what worked or why. When someone
else needs the same thing, they start from scratch.

**The bespoke pipeline.** Engineering teams build internal tooling to
orchestrate LLM calls — prompt chains, output validation, retry logic. Quality
standards are encoded in code, buried in Python scripts that only the engineer
who wrote them understands. When the prompt needs to change, a developer has to
ship a code change. When the model changes, the pipeline breaks in ways nobody
anticipated.

Both approaches fail for the same reason: **there's no separation between what
you want, what good looks like, and how the machine produces it.**

The prompt (what you want) is tangled with the code (how it runs). The quality
bar (what's acceptable) is either implicit or hardcoded. Nobody can look at the
system and understand what it's optimising for without reading the source.

## Where This Came From

Cold Anvil didn't start as a product idea. It started as an internal tool.

### The Forge

The Forge is the generation and evaluation engine built for the Arnor platform
— a personal infrastructure project running across seven machines connected over
Tailscale, with local LLM inference via vLLM (previously Ollama).

The Forge was built to solve a specific problem: generating content and code for
GitHobbit (a fantasy-themed GitHub parody) at a quality level that didn't
require manual rewriting of every output. The first attempt was the obvious one
— prompt a model, read the output, fix it by hand. That doesn't scale past a
handful of tasks.

What emerged instead was a system with three key design decisions:

**1. Config packs as the unit of work.**

Rather than encoding generation logic in code, the Forge reads a declarative
config pack — a directory of files that tells the engine what to generate, how
to evaluate it, and what to reject. The pack contains:

- **Prompt templates** — Markdown files with variable placeholders and YAML
  frontmatter declaring the contract (what type of task, what variables are
  expected, what model to prefer)
- **Rubrics** — Versioned, frozen-after-use scoring rubrics with weighted
  dimensions and anchored descriptions at three levels. These are what the
  model reviewer scores against.
- **Gates** — Deterministic structural checks (word count, section presence,
  regex patterns, code compilation) that run locally, instantly, with no model
  needed. Gate failures trigger automatic retry.
- **Batch configurations** — Sets of tasks to run together, each referencing a
  template, rubric, and gate definition.

The engine (`forge.py`) is completely project-agnostic. It doesn't know what
GitHobbit is. It reads the pack and does the work. Different projects get
different results from the same infrastructure.

**2. Three-phase quality pipeline.**

Every task goes through three phases:

- **Phase 1: Distribute** — Tasks are queued and routed to inference backends.
  Generation runs in parallel across available hosts. Structural gates run
  immediately after each generation — cheap, deterministic, no model needed.
  Gate failures trigger automatic retry before any reviewer model is involved.

- **Phase 2: Review** — Outputs that pass gates are sent to a reviewer model
  running against the task's rubric. The reviewer scores each dimension,
  quotes evidence from the output, and delivers a verdict: pass, revise, or
  reject. The review prompt uses adversarial framing — "list problems before
  scoring" — to counteract the agreeable tendencies of LLM judges.

- **Phase 3: Rewrite** — Failed tasks are rewritten with the reviewer's
  feedback in context. The rewrite is re-reviewed against the same rubric.
  If it still fails, the system escalates through retry strategies:
  error-augmented (show the failure), de-anchored (don't show the failed
  output), and model escalation (try a different model entirely).

**3. Rubric immutability.**

Research on LLM-as-judge systems shows that small rubric edits shift model
preferences by 10–28%. Once a rubric is used in a run, it's frozen — the file
is never edited again. To change scoring criteria, you create a new version.
This protects result comparability across runs and prevents invisible quality
drift.

### What We Learned

The Forge has been through real production runs. The GitHobbit creative sprint
— 13 tasks across voice guides, page copy, merch slogans, and bot templates —
went through multiple cycles of generation, failure analysis, and refinement.

What we learned:

- **Prompts need to show, not describe.** A prompt that says "generate a voice
  guide with vocabulary" produces generic output. A prompt that provides 18
  vocabulary terms with specific mappings produces output that matches the
  project's world. Three examples create a design space. Zero examples create
  a lottery.

- **Gates and rubrics serve different purposes.** Anything that can be checked
  deterministically (word count, section presence, regex) belongs in a gate.
  Anything subjective (tone, voice, creativity) belongs in a rubric. Don't
  try to gate subjective quality. Don't leave structural requirements to the
  reviewer.

- **Rubric anchors must be observable.** "Good voice" means nothing to a model
  reviewer. "Every sentence could only come from this character; voice is
  unmistakable" gives the reviewer something to measure. The difference in
  scoring consistency is dramatic.

- **The pack authoring experience is the critical path.** The pipeline can be
  perfect, but if writing a pack is painful or unclear, the system fails. The
  quality of the output is bounded by the quality of the pack. This is where
  most of the iteration happened — not in the engine, but in the prompts,
  rubrics, and gates.

- **Model selection matters by role, not by size.** A model that's excellent
  at generation may be terrible at review (and vice versa). The Forge learned
  this the hard way when a 120B model scored 39.5/100 on creative review
  benchmarks while a 12B model scored 80. Role-specific model assignment —
  generator, reviewer, rewriter — is not optional.

## The Insight

The config pack is the product.

It's a declarative, portable, human-readable way to say: here's what I want,
here's what good looks like, here's what's unacceptable. And then have a
machine enforce that standard repeatedly, without drift, without fatigue,
without the lottery.

Most LLM tooling sells access to models. Cold Anvil sells the quality layer
that sits between the model and the deliverable. The model is a commodity
input — we'll use yours, ours, or the customer's. What we provide is the
pipeline that turns unreliable model output into reliable deliverables.

## The Vision

**Cold Anvil is a product engineering team in a box.**

Customers bring ideas. Cold Anvil shapes them into structured context packs,
forges them through the quality pipeline, and delivers implementation-ready
output. Not drafts that need rewriting. Not suggestions that need a developer
to implement. Deliverables.

### Who It's For

**Small enterprises and solo founders** who need product engineering work but
can't afford or don't want to hire a team. They want to describe what they
need and get back something they can ship. The Web UI at coldanvil.com gives
them a guided experience — project creation, pack configuration, run
monitoring, output review.

**Technical teams** who want to plug structured generation into their existing
workflows. CI/CD pipelines, internal tools, custom frontends, automated
processes. The API gives them programmatic access to the same pipeline the
Web UI uses — submit work, poll for results or receive webhooks, download
deliverables.

### Security as a First Principle

Competitors route everything through cloud APIs. Customers must trust the
provider with their IP, their ideas, their data. That's a non-starter for
enterprises with compliance requirements, regulated industries, or anyone
who takes intellectual property seriously.

Cold Anvil's heritage is local inference on owned hardware. The Forge runs
entirely on-premises over Tailscale. That DNA carries forward into three
deployment modes:

1. **Cold Anvil Cloud** — Managed inference through Cold Anvil infrastructure.
   Easiest onboarding. We handle model selection and scaling.

2. **Self-Hosted** — Customer runs Cold Anvil on their own infrastructure.
   Ships with a **blessed OSS model pack** — curated, tested models for
   generation, review, and rewrite roles. Out of the box, it works. Data
   never leaves the customer's network.

3. **Bring Your Own Models** — Customer uses the Cold Anvil pipeline with
   their own models — fine-tuned, proprietary, or preferred OSS. Full control
   over inference. Cold Anvil handles orchestration and quality.

All three modes run identical code. The inference layer abstracts over Ollama,
cloud APIs, and custom endpoints. Routing is configured per-deployment, not
hardcoded. Security and data sovereignty are architecture decisions, not
premium features.

### The Pack Ecosystem

Config packs are the unit of delivery and the foundation of the business model.

**Starter packs** — Cold Anvil ships curated packs for common work: landing
pages, API documentation, marketing copy, code scaffolds, product specs. These
are authored using the same process and tooling that produced the GitHobbit
packs — hand-crafted prompts with examples, rubrics with observable anchors,
gates for structural enforcement.

**Custom packs** — Customers author packs for their specific needs, guided by
the platform. The pack authoring experience — the equivalent of The Forge's
PACK-AUTHORING-GUIDE.md — becomes a core product surface. The platform helps
customers write better prompts, design effective rubrics, and configure
appropriate gates.

**Pack marketplace** (future) — A library of community and Cold Anvil-authored
packs that customers can use, fork, and adapt. Packs are portable — they work
across all deployment modes because they're declarative configuration, not code.

### Eval as an Independent Capability

The quality layer — rubric-based scoring, model-as-judge review, tournament
comparison, hard blocks — works independently of the generation pipeline. You
can evaluate content that wasn't generated by Cold Anvil.

This means the eval layer is a product in its own right. Teams that already
have generation pipelines but struggle with quality assessment can use Cold
Anvil's eval independently — bring your own content, score it against your
rubrics, get structured feedback.

### What Success Looks Like

A customer describes what they need. Cold Anvil helps them shape that
description into a config pack. The pipeline generates, gates, reviews, and
rewrites until the output meets the quality bar defined in the pack. The
customer receives a deliverable they can ship — not a first draft, not a
starting point, but implementation-ready work.

The customer never sees a blank prompt box. They never play the regeneration
lottery. They never manually edit LLM output to fix the same problems the
model makes every time. The quality standards are explicit, versioned, and
enforced by the machine.

That's the box. That's the team.

### The Longer Vision — A Dream Building Machine

The idea-to-output pipeline is the hook, not the product.

If Cold Anvil only turns ideas into output, it's a one-shot tool. Customer
arrives, cascade runs, output lands, customer leaves. That's a one-time
purchase wearing a subscription's clothes. The real product is what comes
after the first cascade.

Cold Anvil is a platform for people to keep building. Not just make something
once, but evolve it — add features, iterate on quality, grow the project over
time. A purpose-built dream building machine.

The moat isn't generation. Any AI tool can generate code. The moat is
accumulated context. Cold Anvil knows your project: your codebase, your quality
bar, your tech choices, your brand voice, what's been built, what worked, what
didn't. The longer you use it, the better it gets at building your thing. Not
because of lock-in tricks, but because the platform genuinely compounds value
over time.

This means the architecture must support:

- **Codebase awareness** — the pipeline sees what's already built (via RAG,
  platform-hosted code, or CLI integration) before generating more
- **Incremental cascades** — "add a feature to my existing app" not just
  "build me an app from scratch"
- **Project memory** — the platform remembers what it built, what the customer
  changed, and builds on that foundation
- **Developer integration** — a CLI or IDE tool that works with the user's
  local environment, not just a web UI

Phase 3 builds the forge — idea to output works. Later phases build the
workshop — projects live here, evolve here, grow here. Long-term, Cold Anvil
becomes the foundry: the place where dreams get made, iterated, and shipped,
with a platform that remembers everything and gets smarter about your work
over time.

For the agentic architecture — how Annie evolves from a single conversation
step to an always-on partner backed by specialist agents, with graduated
autonomy and goal-backward verification — see [AGENTIC-VISION.md](AGENTIC-VISION.md).

## Cold Anvil as the Engine Behind The Fourth Age

The Fourth Age (fourthage.ai) is an AI creative partner for content creators —
initially YouTube. A creator brings an idea at any stage of maturity (a
sentence, an outline, a rough script) and the product helps them develop it
through to an executable pre-production package: polished titles, thumbnail
concepts, structured scripts, all evaluated against domain-specific rubrics
grounded in storytelling research.

The Fourth Age has three layers: a conversational product layer (the creative
partner UX), an eval layer (Quorum — multi-model rubric-based judging), and an
infrastructure layer (model routing, inference, storage). The eval layer is
extensively specified. The product layer is designed but not yet built.

**The Fourth Age doesn't need its own generation pipeline. It needs Cold
Anvil's.**

The mapping is direct:

| Fourth Age Need | Cold Anvil Component |
|-----------------|---------------------|
| Generate title options from a creator's idea | **Pipeline** — prompt template with creator context variables, routed to a creative model |
| Generate thumbnail concepts | **Pipeline** — prompt template with visual description format, structural gates for output shape |
| Generate script drafts from an outline | **Pipeline** — prompt template with narrative structure constraints, word count gates |
| Score titles against hook effectiveness rubric | **Eval** — rubric-based model-as-judge with weighted dimensions (promise clarity, audience appeal, curiosity gap) |
| Score scripts against storytelling rubric | **Eval** — rubric with anchored dimensions (narrative arc, pacing, payoff, voice consistency) |
| Reject scripts that break structural rules | **Gates** — section presence, word count, heading format — deterministic, no model needed |
| Rewrite weak sections with specific feedback | **Pipeline Phase 3** — rewrite with reviewer feedback in context |
| Compare two title options blind | **Eval** — tournament comparison (blind A/B), already designed in The Forge's tournament review plan |
| Use multiple judge models to avoid bias | **Eval** — multi-model judging with blinding, a core Quorum design principle that maps to Cold Anvil's eval module |

The Fourth Age's domain-specific rubrics — hook effectiveness, narrative
structure, title-thumbnail alignment, audience psychology — are config pack
rubrics. They follow the same format: weighted dimensions, three-level anchors,
evidence-required scoring, frozen after first use. The only difference is the
domain knowledge encoded in the anchors. A rubric that scores "narrative arc"
instead of "character voice" is still a rubric.

The Fourth Age's gates — heading counts, bullet point structure, word limits,
section presence — are config pack gates. Same check types, same severity
levels, same fail-fast ordering.

The Fourth Age's generation needs — titles from ideas, scripts from outlines,
thumbnails from briefs — are config pack prompt templates. Same variable
substitution, same frontmatter contract, same model hints.

### What This Means Architecturally

The Fourth Age becomes a **vertical application built on Cold Anvil's
platform layer**:

```
Creator (fourthage.ai)
    │
    v
[ Fourth Age Product Layer ]
    Conversational UX, idea refinement,
    creator context, channel history
    │
    v
[ Cold Anvil API ]
    │
    ├── Pipeline: generate titles, thumbnails, scripts
    ├── Eval: score against creator-domain rubrics
    └── Packs: creator-specific config packs
    │
    v
[ Inference ]
    Local (Arnor fleet) or Cloud
```

The product layer — the conversational partner, the idea intake, the creator
context injection, the iterative refinement loop — is what makes The Fourth
Age a product. That's the UX, the relationship, the domain understanding.
Cold Anvil doesn't replace that. Cold Anvil replaces the need to build a
bespoke generation and evaluation engine underneath it.

### Why This Matters for Cold Anvil

The Fourth Age is Cold Anvil's first real vertical. Not a demo. Not a
dogfooding exercise. A product with paying customers that depends on Cold
Anvil's pipeline and eval working reliably at production quality.

This creates a virtuous cycle:

1. **The Fourth Age exercises the platform.** Every creator rubric, every
   generation template, every gate definition tests Cold Anvil's abstractions
   against real product requirements. If the pack format can't express "score
   this script's narrative arc," the format needs to evolve.

2. **Cold Anvil's improvements flow back.** When the pipeline gets better retry
   strategies, faster routing, or improved eval capabilities, The Fourth Age
   gets them for free. No re-implementation. No drift between the platform and
   the product.

3. **The Fourth Age proves the model.** If Cold Anvil can power a subjective,
   creative, domain-specific product like AI-assisted content creation —
   arguably one of the harder use cases — it can power the more structured
   use cases (documentation, code scaffolds, marketing copy) with confidence.

4. **Creator packs become marketplace seeds.** The rubrics and templates
   developed for The Fourth Age — storytelling evaluation, title scoring,
   thumbnail assessment — are reusable. Other products serving creators could
   use the same packs through Cold Anvil's platform. The domain knowledge
   encoded in the packs has value independent of The Fourth Age's product
   layer.

The Fourth Age is where Cold Anvil proves it's not just internal tooling
that happened to get a SaaS wrapper. It's where the platform meets a real
customer with real quality requirements and real money on the line.
