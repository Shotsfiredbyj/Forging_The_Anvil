# Cold Anvil — Conversational Flow Spec

**Written:** 23 March 2026
**Updated:** 24 March 2026
**Status:** Reviewed — open questions resolved
**Depends on:** User journey spec (reviewed), idea-to-vision research
(complete), API contract (reviewed)
**Research basis:** Research/idea-to-vision-frameworks.md

---

## Overview

Two conversations in the MVP. Both are guided extractions disguised as
natural conversations. Both must feel like working with a sharp product
thinker, not filling out a form.

**Future scope:** The agentic vision expands Annie's conversational presence
beyond these two touchpoints — see [AGENTIC-VISION.md](../AGENTIC-VISION.md).

- **Step 3: Idea Refinement** — Free tier. Turns a raw idea into structured
  project context. Feeds the vision document generation.
- **Step 6: Rubric Creation** — Tier 2. Turns "what does good mean?" into
  project-specific quality rubrics. Layers on top of base rubrics.

This spec covers both the experience design (what the user sees and feels)
and the technical architecture (how we deliver it without quality degradation).

---

## Part 1: Experience Design

### Step 3 — Idea Refinement

#### What the User Experiences

The user arrives with a half-formed idea. They type it in — could be a
sentence, could be a paragraph. Annie reads it, reflects it back, and then
starts a conversation that feels like brainstorming with someone who's built
things before. By the end, the user has a structured understanding of their
own idea that they didn't have when they started.

The conversation is not interrogation. It's collaborative shaping. Annie has
opinions. She'll challenge weak assumptions, get excited about strong
insights, and suggest angles the user hasn't considered. But she always
brings it back to the extraction — what do we need to know to forge this
into something real?

#### The Extraction Schema

Based on cross-framework research (Lean Canvas, JTBD, YC, Design Thinking,
Mom Test, PR/FAQ). This is the consensus minimum — what every serious
framework agrees you need before you can write a vision document.

**Required fields (must be covered before vision generation):**

| Priority | Field | What it captures | Why it's required |
|----------|-------|-----------------|-------------------|
| 1 | Problem | What's broken, painful, frustrating | Everything else is meaningless without this |
| 2 | Customer | Who specifically has this problem (not "everyone") | Can't evaluate a solution without knowing who it's for |
| 3 | Current alternatives | How they cope today, what they've tried | Sets the bar the solution must clear |
| 4 | Solution (high level) | What the user wants to build | Most users arrive with this — Annie validates it against 1-3 |
| 5 | Differentiation | Why this is better than current alternatives | The reason this should exist |
| 6 | Success criteria | What "working" looks like in 6 months | Grounds the vision in measurable outcomes |

**Optional fields (enriches the vision doc but not blocking):**

| Field | What it captures |
|-------|-----------------|
| Why now | What changed that makes this possible or necessary |
| Business model | How money flows (even rough) |
| Market size | How big the opportunity is |
| Go-to-market | How they'd reach first customers |
| Key risks | What could kill this |
| Unfair advantage | What's defensible (often blank at idea stage — that's fine) |

Annie covers the required fields through conversation, picks up optional
fields when they emerge naturally, and doesn't force optional fields that
the user can't answer. A vision document with honest "needs further
exploration" sections is better than one padded with fiction.

#### The Conversation Flow

**Not a fixed script. A guided exploration with a known destination.**

Annie adapts to what the user gives her. If they arrive with a detailed
pitch that already covers problem + customer + solution, she doesn't
re-ask those — she probes for what's missing (alternatives, differentiation,
success criteria). If they arrive with "I want to build an app for dog
walkers," she needs more turns to get to the same place.

The research identifies a consistent funnel pattern that experienced
practitioners use:

**Phase 1: Story (1-2 turns)**
Get them talking, not pitching. The goal is to understand the raw idea
and the motivation behind it.

- "Tell me about this idea. Where did it come from?"
- "What happened that made you think someone should build this?"

Annie listens for: the problem (explicit or implied), the customer
(who they're thinking about), emotional energy (where they lean in),
and solution assumptions (what they've already decided).

**Phase 2: Problem + Customer (2-3 turns)**
Nail down who has the problem and why it hurts. This is where Annie
gently redirects solution-first thinkers back to the problem.

- "Who specifically has this problem? Can you picture one person?"
- "When they hit this, what do they actually do today?"
- "What's the worst part about how it works now?"

Anti-pattern to avoid: the user says "everyone needs this." Annie
pushes for specificity: "If you had to pick one person who'd use this
tomorrow, who are they?"

**Phase 3: Solution + Differentiation (1-2 turns)**
Now explore the solution — but through the lens of what the user has
already said about the problem and customer.

- "So given that [problem] for [customer], what would you build?"
- "How is that different from [current alternative they mentioned]?"
- "If this existed and worked perfectly, what changes for them?"

This is where Annie can challenge: "You said they currently use X.
Why would they switch? What's the switching cost?" This isn't hostile
— it's the question a good product person asks to strengthen the idea.

**Phase 4: Grounding (1-2 turns)**
Bring it back to earth. Success criteria, risks, the smallest useful
version.

- "What does success look like in 6 months? What numbers would make you
  confident it's working?"
- "What's the biggest risk — the thing that could make this not work?"
- "What's the smallest version of this that would be genuinely useful?"

**Total turns: 5-9 depending on how much context the user provides upfront.**

The conversation should not exceed 10 turns from Annie. If we haven't
extracted enough by then, we work with what we have and flag gaps in the
vision document. A conversation that drags is worse than a vision doc with
some blanks.

#### The Progress Panel

**The user can see the extraction happening.**

Alongside the conversation, a panel shows the emerging structure. Not raw
fields — a natural-language summary that updates after each meaningful
exchange.

Example progression:

After Phase 1:
```
Your idea: A platform that helps dog walkers manage their schedules
and client relationships.

Still exploring: Who exactly needs this? What do they use today?
What makes this different?
```

After Phase 2:
```
The problem: Independent dog walkers juggle 15-20 clients across
texts, spreadsheets, and memory. Scheduling conflicts and forgotten
bookings cost them 2-3 clients per month.

Your customer: Solo dog walkers with 10-25 regular clients. Not
agencies — individuals.

How they cope today: Google Calendar + group texts + a notebook.
Some have tried pet-sitting apps but they're designed for
marketplaces, not independent operators.

Still exploring: What would you build? How is it different from
the pet-sitting apps?
```

After Phase 4:
```
The problem: [filled]
Your customer: [filled]
How they cope today: [filled]
Your solution: A simple scheduling + client management tool
designed specifically for independent dog walkers...
What makes it different: [filled]
Success looks like: [filled]

Ready to forge your vision document.
```

**Design principles for the panel:**
- Updates in natural language, not field labels. "Your customer" not
  "Customer Segment."
- Shows "still exploring" for uncovered areas — creates gentle forward
  momentum without pressure.
- The user can click/tap any section to correct it. Annie responds:
  "Ah, let me update that. So what you mean is..."
- When all required fields are covered, the panel shows a "ready"
  state and Annie proposes moving to vision generation.

#### Anti-Pattern Handling

The research identifies specific anti-patterns. Annie needs to handle
these gracefully:

**Solution-first thinking.** User arrives saying "I want to build X."
Annie doesn't reject the solution — she acknowledges it, parks it
("That's interesting — I want to understand that better"), and steers
to the problem. "Before we get into what you'd build, tell me about the
problem you spotted. What's broken?"

**"Everyone needs this."** Annie pushes for specificity with warmth:
"I bet a lot of people could use this, but who would you put in front
of it first? If you had to pick one person you know..."

**Hypothetical validation.** User says "people would definitely pay
for this." Annie grounds it: "What makes you think so? Have you talked
to anyone who has this problem? What do they do about it now?"

**Premature detail.** User jumps to technical implementation or pricing
before the problem is clear. Annie gently redirects: "We'll get to the
how — right now I want to make sure we've nailed the what and the who."

**In all cases:** Annie is warm, not preachy. She's not teaching a
framework. She's having a conversation that happens to follow one.
The user should never feel like they're being corrected — just guided.

---

### Step 6 — Rubric Creation

#### What the User Experiences

Tier 2 customer. They've seen their vision doc, roadmap, and content.
Now they're about to enter tech design and code generation. Before that,
Annie asks: "What does good mean for your project?"

This conversation extracts quality preferences that become project-specific
rubrics. These layer ON TOP of base rubrics (not replace them). Both scores
must pass independently.

#### The Extraction

Annie needs to extract preferences across dimensions that matter for the
remaining pipeline stages (tech design, code, assembly):

| Area | What to extract | Example output |
|------|----------------|----------------|
| Code style | Language preferences, conventions, strictness | "Prefers TypeScript strict mode, functional style, minimal dependencies" |
| Quality bar | How polished vs pragmatic | "Ship fast, iterate later" vs "production-grade from day one" |
| Architecture preferences | Monolith vs micro, framework opinions | "Simple monolith, no over-engineering" |
| Design sensibility | Visual style, brand voice, aesthetic | "Clean, minimal, Scandinavian-inspired" |
| Deployment constraints | Where it needs to run, what it can cost | "Needs to deploy on free tiers, no server required" |
| Testing expectations | How much test coverage, what kind | "Unit tests for business logic, don't test the framework" |

#### The Conversation Flow

Shorter than Step 3. The user has already been through the idea conversation
and has context. 3-5 turns.

**Turn 1: Open-ended quality question**
"Before we get into the technical design, I want to understand what 'good'
means for you. When you imagine the finished product, what's the feel?
Production-grade and polished, or get-it-working and iterate?"

**Turn 2-3: Specific preferences based on Turn 1**
If they said "polished" — ask about code quality, testing, architecture.
If they said "pragmatic" — ask about deployment constraints, cost limits.

**Turn 4: Review extraction**
Show them the rubric summary: "Here's what I'm hearing about your quality
bar: [summary]. Anything off? Anything missing?"

**Turn 5: Confirmation and proceed**
"Good. I'll apply these on top of our standard quality checks. Let's
get into the tech design."

#### Rubric Output Format

The conversation produces a project rubric file that follows the same
structure as base rubrics: dimensions, weights, anchors. But the content
is specific to this project's preferences.

Example: if the user said "minimal dependencies, no over-engineering,"
the project code rubric might add a "Simplicity" dimension weighted at
30%, with anchors like:
- 9-10: "No unnecessary abstractions. Every dependency justified."
- 5-7: "Some unnecessary complexity but nothing egregious."
- 1-3: "Over-engineered. Dependencies or abstractions without clear purpose."

This layers on top of the base code rubric (Correctness, Readability,
Completeness, Error Handling). Both score independently, both must pass.

---

## Part 2: Technical Architecture

### The Core Constraint

Most models in the 35B class have 128k context windows. Quality degrades
at 65-70% utilisation (~83k-90k tokens). A rich Step 3 conversation with
a detailed user could easily push past this if we're naive about context
management.

**The conversation is not a simple chat. It's a managed flow with context
windowing, incremental extraction, and state management outside the model.**

### Architecture Principles

**1. Incremental extraction, not end-of-conversation synthesis.**

After each meaningful exchange, structured data is extracted and stored
in the project record — outside the context window. The conversation model
doesn't carry the full extraction schema. It knows: what topic we're on,
what's been covered, and what's still needed.

**2. Context summarisation between phases.**

When Annie moves from "problem" to "customer," the problem discussion is
summarised into a compact paragraph and the raw conversation turns for
that phase are dropped from context. The model only needs:
- System prompt (Annie's identity + conversation instructions)
- The extraction state so far (compact structured summary)
- Current phase instructions
- Recent turns (current topic only)

This keeps the active context window small and focused.

**3. Separation of conversation and extraction.**

Two concerns, potentially two model calls per turn:

- **Conversation model:** Generates Annie's response. Needs personality,
  context of current topic, awareness of what's been covered. Optimised
  for natural, engaging conversation.
- **Extraction model:** Processes the user's response and updates the
  structured schema. Could be a smaller model or even deterministic
  parsing for clear-cut fields. Optimised for accuracy, not personality.

Don't ask one model to be both engaging AND a reliable structured data
extractor in the same call. The quality requirements are different.

**4. Hard context budget.**

Define a maximum context window budget per conversation turn. If the
conversation approaches the budget, force summarisation of older content
regardless of conversation phase. Never let the model run at >60% of
its context window for the conversation.

### Context Window Management

#### What's in the context window at any given turn:

| Component | Approx. tokens | Notes |
|-----------|---------------|-------|
| System prompt (Annie identity + flow instructions) | ~2,000 | Fixed, cached |
| Extraction state so far | ~500-1,500 | Grows as fields fill in, but it's structured summary not raw conversation |
| Current phase instructions | ~300-500 | Which extraction phase, what to ask for next |
| Recent conversation turns | ~2,000-6,000 | Only current phase's turns. Older phases summarised out |
| User's latest message | Variable | Could be a sentence or a paragraph |
| **Total active context** | **~5,000-10,000** | Well within safe zone |

Compare to naive approach (full conversation history): could reach
30,000-50,000 tokens by turn 8-10. Unnecessary and quality-degrading.

#### Summarisation Strategy

After each phase transition (e.g., problem -> customer):

1. Extraction model processes the phase's conversation and updates the
   structured schema
2. A compact summary of the phase is generated (1-2 paragraphs)
3. Raw conversation turns for that phase are dropped from the context
4. Summary + updated schema go into the context for the next phase

This means Annie "remembers" everything (via the schema and summaries)
but the context window stays lean.

#### Example Context State at Phase 3 (Solution)

```
[System prompt: Annie identity, Step 3 instructions]

[Extraction state]
Problem: Independent dog walkers juggle 15-20 clients across texts,
spreadsheets, and memory. Scheduling conflicts cost 2-3 clients/month.
Customer: Solo dog walkers, 10-25 regular clients. Not agencies.
Current alternatives: Google Calendar + group texts + notebook. Pet-
sitting apps tried but designed for marketplaces.
Solution: [not yet extracted]
Differentiation: [not yet extracted]
Success criteria: [not yet extracted]

[Phase summary: Problem + Customer]
User described a personal frustration from their partner who is a dog
walker. The problem is operational — scheduling and client management.
Emotional hook is losing clients to disorganisation. User initially
said "pet owners" as customer but refined to "independent dog walkers"
when pressed for specificity.

[Current phase: Solution + Differentiation]
Instructions: User has clear problem and customer. Now explore solution.
Validate against stated problem and alternatives. Challenge if solution
doesn't address the core pain (scheduling conflicts, not client
acquisition).

[Recent turns — current phase only]
Annie: "So you've described a real scheduling headache for independent
walkers. They're using a patchwork of tools that keeps falling apart.
What would you build to fix that?"
User: "I want to build a simple app where they can manage their whole
schedule and client list in one place..."
```

Total context: ~4,000 tokens. Clean, focused, no degradation risk.

### The Extraction Pipeline

```
User sends message
        |
        v
[Extraction model] -- updates structured schema
        |                (problem, customer, etc.)
        |
        v
[State manager] -- determines: what phase are we in?
        |           what's covered? what's next?
        |           should we summarise and transition?
        |
        v
[Context assembler] -- builds the context window:
        |               system prompt + schema + phase
        |               summary + current turns
        |
        v
[Conversation model] -- generates Annie's next response
        |
        v
[Progress panel update] -- renders current extraction
                           state for the user
```

Each step is a discrete responsibility. The conversation model only
does conversation. The extraction model only does extraction. The
state manager only does flow control.

### Quality Safeguards

**No hallucination in extraction.** The extraction model must only
extract what the user actually said. If the user didn't mention a
business model, the field stays empty. Never infer, never fabricate,
never "help" by filling in blanks the user didn't provide. The vision
document can have gaps — fabricated content in the extraction cannot.

**Extraction validation.** After extraction, a simple check: can we
find evidence for this field in the user's actual words? If not, flag
it and either re-ask or mark as inferred (with lower confidence in the
vision doc).

**Conversation coherence.** Despite summarisation, Annie must not
contradict something established in an earlier phase. The schema is
the source of truth. If the user said their customer is "independent
dog walkers," Annie doesn't later refer to them as "pet owners."

**Graceful degradation.** If the conversation goes long (>10 turns)
or the user is going in circles, Annie can propose moving to vision
generation with what we have. "I think I've got enough to put
something together. Shall we see what comes out? You can always
refine from there."

### Step 6 Technical Notes

Step 6 (rubric creation) is simpler technically:
- Shorter conversation (3-5 turns)
- Smaller extraction schema (preferences, not a full business canvas)
- The user already has context from Steps 1-5
- Output is a structured rubric file, not a vision document

Same architecture applies but context pressure is much lower. The main
risk is the rubric extraction being too vague to be useful. The
extraction model needs to turn "I want clean code" into specific,
scorable rubric dimensions with anchored levels — not just echo back
the user's words.

---

## Part 3: Design Decisions (resolved 24 March 2026)

### Experience

- **Progress panel interaction:** Conversation only. No direct field
  editing. The conversational metaphor is the product — if users can
  click-edit fields, the conversation becomes a form with extra steps.
- **Multiple ideas:** MVP guides users to pick one. Annie explains why
  focus matters and mentions that multi-project workflows are on the
  roadmap. No forking in V1.
- **Returning to refinement:** Not until the user upgrades to Tier 1+.
  Free tier is a one-shot: conversation -> vision doc -> done. Paid
  users can revisit and refine.
- **Step 6 timing:** Sequential. Rubric creation requires user input
  and must complete before tech design starts, because the rubrics
  feed into pipeline evaluation from that point on.

### Technical

- **Extraction model selection:** Start with a smaller instruction-tuned
  model (Mistral Small 3.2 24B or Gemma3 27B). Cheaper, and extraction
  is a structured task that doesn't need a large model's breadth. Needs
  efficacy testing before launch.
- **Summarisation quality:** Needs testing with real conversations.
  Deferred to implementation phase.
- **Conversation endpoint:** Dedicated endpoint in Cold Anvil API, not
  the Gateway chat endpoint. Cold Anvil owns conversation state,
  extraction, phase transitions, and context assembly. Gateway is called
  for raw completions only. Clean separation: Gateway = compute,
  Cold Anvil = product.
- **Schema versioning:** Every project's extraction state is stamped
  with a schema version from day one. When the schema changes, old
  projects either migrate (field mapping) or finish on their original
  schema version. Simple version field on the project record.
- **Concurrency:** Sub-40B models for both conversation and extraction
  should allow high concurrency on the B200 fleet. Exact capacity needs
  testing. Prior analysis suggests ~35 concurrent GPU tasks with
  staggered phases.
- **Latency per turn:** Target remains under 3 seconds for two model
  calls per turn. Only testing will confirm. If extraction model is
  fast enough (small model, structured output), this is achievable.

---

## Dependencies

- **User journey spec** — defines where these conversations sit in the
  flow and what tier they belong to
- **API contract** — how the frontend triggers conversation turns,
  receives responses, and gets extraction state updates
- **Gateway chat endpoint** — may need extending for managed
  conversation state, or a new dedicated endpoint
- **Extraction schema definition** — the actual field-level schema
  (this spec defines the fields conceptually; implementation needs
  a formal schema)
- **Progress panel frontend** — rendering the extraction state in
  the UI (out of scope for this spec)

---

*Reviewed 24 March 2026. Open questions resolved. Technical architecture
needs validation against actual model performance (context management,
extraction accuracy, latency) during implementation.*
