# Cold Anvil — Agentic Evolution

How Cold Anvil evolves from a transactional pipeline into an agentic platform.
Two separate tracks for two fundamentally different audiences.

## The Model

- **User = CEO.** Sets direction, makes decisions, says yes or no. Doesn't
  need to know what a cascade or a gate is.
- **Annie = CTO.** Translates intent into work. Briefs specialists. Judges
  output quality. Surfaces decisions. Has opinions, pushes back.
- **Specialists = tight-rope agents.** Each does one thing. Research agent
  researches. Code agent codes. Deploy agent deploys. A to B, don't fall off.

The Forge pipeline (gates, rubrics, review) is the quality control layer. It
keeps specialists honest. They don't get to judge their own work. Annie does,
using the pipeline's infrastructure.

---

## Patterns Worth Stealing

Studied three frameworks: GSD (get-shit-done), OpenClaw, NemoClaw (NVIDIA).

| Pattern | Source | Principle |
|---------|--------|-----------|
| Graduated failure recovery | GSD | Retry, decompose, prune, escalate. Budget per level. Don't stop, keep working. |
| Fresh context per agent | GSD | Pass paths, not contents. Each specialist gets a focused briefing. Orchestrator stays lean. |
| Goal-backward verification | GSD | Don't check "did the task complete?" Check "does the feature work?" |
| Autonomy as a dial | GSD | Not a switch. Interactive to semi-autonomous to autonomous. Safety gates always apply. |
| Conversational surface | OpenClaw | The interface is conversation, not forms and dashboards. |
| Quality contract as policy | NemoClaw | Agents don't judge their own work. Pipeline enforces quality. Already built. |
| Scope-bounded autonomy | GSD | Auto-fix known patterns. STOP for architectural and scope changes. |

**Not worth stealing:** Multi-channel adapters (WhatsApp, Telegram — we're a
web product). Container sandboxing (overkill for pipeline-controlled agents).
GSD's 44-command taxonomy (over-engineered). Meta-prompting framework as
infrastructure (fragile). Full autonomous operation without safety gates.

---

# Part 1: The Product

What paying users experience. These people are not technical. They're not
product managers. They're someone with an idea who wants it to become real.
They don't know what cascades, gates, rubrics, or forge pipelines are.
They should never find out. They just talk to Annie.

## P1: Annie Is Your Co-Founder

Annie doesn't vanish after the first conversation. She's there the whole way.

The user's experience:
- "Here's what I've put together for your vision. One thing — you said
  photographers, but what you described sounds like it'd work for any
  freelancer with clients. Want to narrow down or keep it broad?"
- "I've mapped out a plan. Three phases — first we get a landing page up so
  you can start showing people. Then we add the gallery management. Sound
  right?"
- "Your site's ready to look at. The landing page is strong but the pricing
  section feels generic. Want me to sharpen it before we move on?"

**What the user sees:** Annie talking to them naturally between each piece of
work, explaining things in plain language, asking real questions, having
opinions.

**What they don't see:** Cascade stages, gate checks, rubric scores, model
routing, reviewer feedback.

## P2: Annie Gets It Right (Even When the First Try Isn't)

The pipeline sometimes produces mediocre work on the first pass. In the
agentic model, Annie keeps working until it's good.

The user's experience:
- They never see a failure. They never see "generation error."
- If something isn't good enough, Annie just takes longer and comes back
  with better work. Maybe she says "This took me a bit longer — I wasn't
  happy with the first draft of your landing page copy so I reworked it."
- If Annie genuinely can't crack it, she's honest: "I'm struggling with the
  pricing page. Can you tell me more about how you're thinking about pricing?
  That'll help me get this right."

**What the user sees:** Annie being thorough. Sometimes taking longer.
Occasionally asking for more input.

**What they don't see:** Retry loops, prompt adjustments, model switches,
repair budgets, gate threshold tweaks.

## P3: Annie Does Her Homework

Today the pipeline generates from model knowledge alone. With specialist
agents, Annie can actually research before she writes.

The user's experience:
- Vision doc includes real competitor analysis, not generic assumptions
- Landing page copy reflects what actually works in their market
- Code follows current best practices, not just what the model knows
- "I looked at how your main competitors position themselves. Here's what
  I noticed and how I'd differentiate you..."

**What the user sees:** Annie being surprisingly well-informed about their
specific market and situation.

**What they don't see:** Research agents, content agents, code agents,
fresh context windows, agent briefings.

## P4: Annie Adapts to You

Fixed sequence doesn't fit every user. Annie should be smart enough to adapt.

The user's experience:
- "I already have a design doc from my friend who's a developer" — "Send
  it over, I'll work with what you've got instead of starting from scratch"
- "Actually I want to change the name" — Annie updates everything downstream
  automatically, checks what changed, shows the user
- "Can we skip the roadmap? I just want to see what the site would look like"
  — Annie fast-tracks to what the user actually wants

**What the user sees:** Annie being flexible and responsive. Not rigid.

**What they don't see:** Dynamic stage selection, dependency graphs,
incremental re-runs, context-aware orchestration.

## P5: Annie Remembers

Come back next week. Annie knows your project. Share a link to a competitor.
Annie updates her analysis. Say "I pivoted to B2B" — Annie re-evaluates
everything through that lens.

The user's experience:
- "Hey Annie, remember that photography tool?" — "Course I do. Where'd
  we leave off — you were deciding between the gallery-first and the
  booking-first approach."
- Send a URL — "Interesting — they're doing the booking-first thing.
  Want me to rethink our approach given what they've built?"

**What the user sees:** A partner who remembers everything and builds on it.

**What they don't see:** Persistent memory, session state, project context,
incremental cascade updates.

---

# Part 2: The Dev Environment

How Jack and Annie build Cold Anvil. Jack is a Group Product Manager with
15+ years of experience building world-class products. He's deeply technical,
understands the pipeline, debugs forge runs, makes architectural decisions.
The milestones here match that level of sophistication.

## Current State

Annie runs forge cycles, tunes prompts, orchestrates cascades. Jack directs,
reviews, and works with Annie on hard diagnostic problems. The dashboard
provides observability. Everything is session-based.

## D1: Autonomous Failure Recovery

When a forge run or cascade fails, Annie doesn't wait for Jack's next session.
She keeps working:

1. Diagnoses the failure (gate? score? infra? variable injection?)
2. Categorises against known patterns (Uniform 60, swap thrashing,
   undeployed code, variable interpolation)
3. Picks a recovery strategy:
   - Gate failure: adjust threshold or target specific gate in prompt
   - Score failure: read reviewer feedback, patch prompt
   - Infra failure: check fleet health, wait/retry, switch host
   - Variable injection: check upstream, re-run if needed
4. Executes recovery (re-submit with adjustments)
5. Evaluates result
6. If repair budget (3 attempts) exhausted: escalates to Jack with full
   context — what was tried, what happened at each step

**Scope boundaries:**
- Annie CAN: retry, adjust gates, tweak prompts, switch models, re-run stages
- Annie STOPS for: cascade structure changes, rubric dimension changes,
  adding/removing gates, new infrastructure, architectural decisions

## D2: Specialist Agent Team

Annie briefs specialists instead of doing everything herself:

- **Diagnosis agent** — Reads event logs, fleet health, gate results. Produces
  structured diagnosis. Fresh context, one failed run.
- **Prompt agent** — Reads reviewer feedback + rubric scores. Proposes
  targeted prompt patches. Fresh context, one prompt.
- **Verification agent** — Renders HTML, checks links, validates CSS, runs
  tests. Reports what actually works. Fresh context, one output set.
- **Research agent** — Investigates approaches, reads docs, finds patterns
  in codebase. Fresh context, one question.

Each gets a focused briefing from Annie (file paths, not contents). Annie
aggregates and decides next action.

## D3: Goal-Backward Verification

Instead of "did the stages pass gates?" — "does the output actually work?"

For the website cascade:
- Does the HTML render without errors?
- Do all internal links resolve?
- Does the CSS load and apply correctly?
- Is stage 3 content actually reflected in the HTML?
- Basic accessibility check
- Mobile rendering check

Verification failures feed back into D1's recovery loop automatically.

## D4: Autonomy Dial

Configurable autonomy per session:

- **Supervised** (current) — Annie works, presents results, waits for
  Jack's direction at each step
- **Semi-autonomous** — Annie auto-recovers from known failures, presents
  results at cascade completion or when stuck
- **Autonomous** — Annie + specialists work end-to-end. Jack gets a
  summary when done or when they hit a genuine blocker.

**Safety controls (always apply, all levels):**
- Repair budget limits (no infinite loops)
- Scope boundaries (no architectural changes without approval)
- Compute budget (no burning unlimited GPU hours)
- Quality contract (gates + rubrics) never bypassed

## D5: Wave Execution for Feature Work

Building new features with parallel specialist agents:

Wave 1 (independent, parallel):
- Research agent: existing patterns, reusable code
- Schema agent: data structures, interfaces
- Test agent: test scaffolding

Wave 2 (depends on Wave 1):
- Implementation agent: builds feature
- Integration agent: wires into existing code

Wave 3 (depends on Wave 2):
- Verification agent: runs tests, checks integration
- Quality agent: forge pipeline check

Annie reviews between waves. Catches conflicts before they compound.

---

## Sequencing

Product and dev environment milestones are independent tracks.

```
Dev Environment:              Product:
  D1: Failure recovery          P1: Annie throughout
  D2: Specialist team           P2: Autonomous quality recovery
  D3: Goal verification         P3: Specialist agents for users
  D4: Autonomy dial             P4: Dynamic orchestration
  D5: Wave execution            P5: Always-on partner
```

Within each track, milestones are sequential — each builds on the last.

Cross-track learning: patterns proven in the dev environment inform product
implementation, but they're not hard dependencies. P1 can start before D1.
P3 benefits from D2 learnings but doesn't require D2 to be complete.

---

## What to Study Next

1. **Failure taxonomy** — Categorise every failure mode from 115+ runs.
   Gate failures vs score vs infra vs variable injection. Determines D1's
   recovery strategies.

2. **GSD's context assembly** — How it builds agent briefings. Pass paths,
   not contents. Study agent definitions and template resolution.

3. **GSD's repair budget** — How it tracks attempts, decides escalation,
   prevents infinite loops.

4. **120b model viability** — Can specialists run on Nemotron 120b or QwQ 32b?
   Annie on Claude for judgment, specialists on cheap local models.

5. **OpenClaw's session state** — How it maintains conversational context
   across agent invocations. Maps to P1 and P5.

---

## Infrastructure: Eregion's New Role

Eregion drops out of the forge fleet. Becomes dedicated to two jobs:

- **B50 (16GB):** Memory service — embeddings, extraction, reranking,
  Qdrant, arnor-memory. Same as today but with richer forge run ingestion.
- **B60 (24GB):** Specialist agent compute — diagnosis, prompt tuning,
  verification, research agents. Always available, no forge contention.

The 115+ forge runs are a rich corpus sitting in JSONL logs. Memory currently
captures 3 summary facts per run — the detailed gate results, reviewer
feedback, attempt histories are lost. Enriching memory ingestion turns
debug logs into institutional knowledge that specialist agents can draw from.

See AGENTIC-ROADMAP.md (F1, F2) for the concrete work items.

---

## What Doesn't Change

- Forge pipeline (generate, gate, review, rewrite)
- Gates (deterministic structural quality)
- Rubrics (scored quality dimensions)
- Config packs (declarative project definitions)
- Arnor memory (shared knowledge — but richer)
- One batch at a time, sequential, don't panic-kill
- Quality contract never bypassed by autonomy
- No changes without approval for scope/architecture
