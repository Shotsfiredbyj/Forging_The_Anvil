# Cold Anvil — Product Frame

> Session: Product positioning and first customer discovery
> Status: In progress

## The Problem

**When output is easy, ensuring quality becomes the hard work.**

AI makes output easy. But most people use AI like a chatbox:
- Dump context in (often incomplete or inconsistent)
- Don't set clear evaluation criteria ("what does good look like?")
- Accept the first result (no iteration, no review)

**Result:** Drift. The gap between what you wanted and what you got.

Most people use AI like a chatbox:
- Dump context in (often incomplete or inconsistent)
- Don't set clear evaluation criteria ("what does good look like?")
- Accept the first result (no iteration, no review)

**Result:** Drift. The gap between what you wanted and what you got.

---

## What Cold Anvil Does

### 1. Consistency at Input (Config Packs)

You define:
- **Prompts:** What you want done
- **Rubrics:** What "good" looks like (the quality bar)
- **Gates:** What's unacceptable (hard blocks)
- **Batches:** What to run against (files, tasks, data)

This is portable, declarative, versioned. It's not a prompt—it's a quality spec.

### 2. Pipeline at Output (Three-Phase Review)

- **Distribute:** Spread work across multiple models/instances
- **Review:** Evaluate against rubrics
- **Rewrite:** Fix what can be fixed (9 attempts max)

You don't ship outputs that miss the bar.

---

## The Category

Not an AI tool. A **quality layer**.

**Analogy:** CI/CD for LLM generation.
- You wouldn't ship code without tests
- You don't ship content/code/outputs without passing the rubric

---

## Application Contexts

**Software:** Product engineering team in a box
- Generate features, docs, tests
- Enforce quality standards
- Reduce review overhead

**Creative:** Pre-production team
- Content creation (YouTube, blogs, social)
- Copy, visuals, structure, fact-check
- Before recording/before launch

**The Real Customer Pain:**
"I know what I want the AI to do, but I can't get it to *actually* do it consistently."

---

## Core Principles

- **Quality is the independent variable.** Never optimise for speed or cost at the expense of quality. A thing done well is a thing done once.
- **Leverage your humanity.** Reduce dependence on specialist skillsets.
- **Don't make catching AI drift a human job.** Have AI help you keep it on track.
- **When output is easy, ensuring quality becomes the hard work.**

---

## The First Customer: Solo Founder

**The Story**

> "I'm a solo founder building a business that will help creators through the hard part—starting. The empty notebook page. The shotlist with only a title. The script with no dialogue. Fourth Age helps you break the writer's block and get from idea to creation.
>
> I want Cold Anvil to help me build the product—the copy, the tone of voice, the code, the tests, the documentation. I want Cold Anvil to help me turn 'this is what I think good looks like' into a set of measurable criteria that informs whether we're ready to deploy or not.
>
> I don't have a team. I don't have months. I have a deadline of weeks and the embryo of an idea."

**Success Looks Like**

- I provide the idea
- I share the vision
- I tell Cold Anvil what I imagine good looks like
- Cold Anvil helps me refine that idea into a product strategy
- Cold Anvil helps me define measurable evaluation criteria
- Cold Anvil helps me break down the work to be done into work packages to be built
- Cold Anvil generates the product
- Cold Anvil measures
- Cold Anvil iterates

**Tagline:** Product development in a box. Engineered by AI, Imagined by Humans.

---

## The First Customer: Agency (Related Pattern)

For agencies, the story is similar but at scale:
- Multiple clients, same quality bar enforced differently per brand
- Faster throughput = more margin
- Less senior time spent on first-pass reviews

---

## Value Proposition

**Force multiplier. Not sunk cost.**

**Levers:**
- Leverage your humanity and reduce dependence on specialist skillsets
- Get idea → executable output without hiring a team
- Reduce time-to-shipping, reduce waste on outputs that miss the mark

**The workflow:**

### Shape Inputs
The crazy idea that might just work. The business plan you wrote on a coffee shop napkin. The unicorn you and your mates came up with in the pub.

### Frame What Good Looks Like
What smells right? What feels right? The thing that AI can help you get towards, but can't define on its own. How will we measure it?

### Refine Outputs
Make sure AI stays on the right track. Don't make catching AI drift a human job. Have AI help you keep it on track, based on what you think good looks like.

---

## Delivery Model

| Tier | Who | How | Why |
|---|---|---|---|
| **Hosted** | Solo founders, agencies, startups | Web UI config → CLI deploy | "Just works" |
| **Self-hosted** | Security-conscious | Guidance + config support | IP control |
| **API/CLI** | Mid-sized product teams | Build into existing workflows | Existing stack |

**Starting point:** Hosted. Fastest adoption. People don't want to install Ollama, configure Vulkan/ROCm, deal with local GPUs. They want to sign up, configure in browser, run CLI that does the work.

---

## The Launch Strategy

**One launch. Two products. One story.**

- **ColdAnvil.ai** — Powering the founder, the builder, the creative. Making dreams reality.
- **FourthAge.ai** — Powered by Cold Anvil.

**The framing:** Cold Anvil is the proposition. Fourth Age is the proof.

---

## The Plan

1. **Build both in parallel.** Create Fourth Age using the components of Cold Anvil. They're how we learn what works. 

   This has already happened today. The forge only works because I ran the same Githobbit config packs through it 26 times. Fourth Age is the 27th pass—and unlike Githobbit, it's a *real* product with real customers waiting.

2. **Launch both together.** One is the proposition, the other is the proof. Both have a product market fit.

---

## The Trade-Off

**The risk:** We develop slower, because we're building both simultaneously.

**Why it's worth it:** I need an idea to put through Cold Anvil. I need a product to forge, to stress test the vision, the process, the design, and the tech.

---

## What This Means

Fourth Age is not a separate launch. It's:
- The first config pack for Cold Anvil
- A demonstration of the technology in action
- A product of the same technology

**The narrative:** "Fourth Age is powered by Cold Anvil." Simple. Honest. One ecosystem.

---

## Build Reality

Fourth Age is the first config pack Cold Anvil will produce.

On launch day, using the user flow defined, any config pack, any product can be built.

---

## User Journey: Step 3 & 6 & 9 (Magic UX)

### Step 3: Idea Refinement (AI-guided conversation)
- *Not:* "Answer 5 form fields"
- *But:* "Tell me about your idea." → AI asks clarifying questions → refines the idea together → saves summary
- *Tech:* Simple chat UI + session context (already in Arnor)

### Step 6: Rubric Creation (AI-assisted)
- *Not:* "Choose from dropdowns"
- *But:* "When you say 'good', what do you mean?" → AI converts to evaluation criteria → user confirms/edits
- *Tech:* Prompt → rubric generation + edit interface (existing forge tech)

### Step 9: Iteration (Feedback Loop)
- *Not:* "Open JSON, edit rubric, re-run"
- *But:* "This feels off" → AI updates rubric/prompts → re-runs → compares
- *Tech:* Feedback → rubric refinement + auto-retry (existing forge tech)

**The bar isn't higher tech. It's better UX on existing tech.**

---

## Where We Are

**Done:**
- ✅ Product problem defined ("When output is easy, quality becomes the hard work")
- ✅ First customer profiled (solo founder, 5–20 person agencies)
- ✅ Value prop written (force multiplier, not sunk cost)
- ✅ Launch strategy set (Cold Anvil + Fourth Age together)
- ⏳ User journey map (in progress)

---

## Session Date: 2026-03-20

Tonight's work:
- Defined the problem, the first customer, the value prop
- Locked in launch strategy (Cold Anvil + Fourth Age as one story)
- Mapped the full 9-step user journey with magic UX treatment
- Clarified free vs paid tiers (preview ≠ production)

---

## User Journey Map: Cold Anvil (Solo Founder)

### Step 1: Sign Up (Magic Auth)

**User:**
- Lands on coldanvil.ai
- Clicks "Start Building"
- Enters email
- Receives PIN (no password)
- In → building

---

### Step 2: Share Your Product Idea

**User:**
- One big text field
- Types: "A tool for YouTube creators to break writer's block. Helps with scripting, titles, thumbnails, shot lists. Something that learns from their style and tracks what works."
- Clicks "Build from here"

**System:**
- Saves raw idea
- Confirms: "Got it. Now let me understand more about this."

---

### Step 3: Idea Refinement (AI-guided Conversation)

**System asks:**
1. "Who's the primary user? Solo creator, team, or agency?"
2. "What's the biggest friction they face today? Empty page, bad output, or workflow pain?"
3. "What does success look like in 30 days? 100 creators? A paid tool? A launch?"
4. "What are you bringing to this? Design, code, marketing, all three?"
5. "What will make this different from Notion templates, Framer sites, or AI prompt packs?"

**User:**
- Answers conversationally, one question at a time
- Can say "I'm not sure" → AI follows up: "That's fair. Let's explore the others first, come back."

**System:**
- Builds structured summary
- Shows user: "Is this what you mean?" (summary + edit option)
- User confirms → idea locked

**Output:**
```
Project: Creator Assistant
Core Problem: Writer's block for YouTube creators
Target: Solo creators, 500–50k subs
Success in 30 days: 20 paid users at $29/mo
Founder's role: Code + product, design will use templates
Differentiator: AI learns their style, not generic prompts
```

---

### Step 4: Break Down the Work (Sprints, Not Weeks)

**System:**
- Detects type: "SaaS product, B2C, subscription"
- Loads template: "SaaS Core Features"
- Generates sprint breakdown:

```
Cycle 1: Product Scope Definition
  - Core user flow (sign up → onboard → create first project)
  - Stripe integration
  - Config pack structure

Cycle 2: Backend Foundation
  - Auth (email/password + OAuth)
  - Database schema
  - API layer

Cycle 3: Core Feature Build
  - Idea input interface
  - Config pack generation
  - Quality report output

Cycle 4: Testing + Launch
  - User flows tested
  - Documentation
  - Deploy
```

**User:**
- Reviews breakdown
- Adds context: "Focus on scripting flow first, skip dashboard in cycle 1"
- System updates

**Note:** Speed matters. GitHobbit sprint completed in 32 minutes on local hardware. Cold Anvil is the same. Cycles, not calendar time.

---

### Step 5: Save Roadmap

**System:**
- Generates `ROADMAP.md` + `config/project.json`
- Shows preview
- User clicks "Save to Workspace"
- Offers: "Download as JSON?" (user downloads)

**Output:**
```
/workspace/creator-assistant/
  README.md
  ROADMAP.md
  config/product.json
  config/rubrics/ (empty, populated in step 6)
  config/prompts/ (empty, populated in step 6)
  outputs/ (generated content)
```

**Free Tier:** At this point, free users get a downloadable concept: a static website or product preview that's passed quality gates. Something usable to share and visualise their idea.

**Paid Tier:** Full generation cycles and iteration.

---

### Step 6: Define Evaluation Criteria (Rubrics)

**System asks:**
1. "What 'good' means for this product?"
2. "What can't we accept? (hard blocks)"
3. "Any examples to learn from? (competitors, inspirations)"

**User:**
- Types: "Good feels polished, fast to load, looks like Linear or Vercel. Can't have broken auth, no slow pages."
- System shows follow-up: "Got it. So 'polished' means.…"

**System Converts to Rubrics:**

```yaml
Rubric: UI/UX Quality
- Page load < 2s (gate: hard block if > 3s)
- Lighthouse score > 90
- Consistent design system (tokens, spacing, typography)
- Mobile-first, accessible (WCAG AA)

Rubric: Product Flow
- One-page onboarding (5 minutes or less)
- No dead-ends (every screen has clear next action)
- Empty states are instructional, not blank

Rubric: Code Quality
- Tests exist for critical paths (auth, payment, core feature)
- No console errors or warnings
- API endpoints return standardised error format
```

**User:**
- Reviews rubrics
- Edits: "Make load time gate < 2.5s instead of 3s"
- Clicks "Save Rubrics"

---

### Step 7: Generation Run (3 Iterations) — PAID

**System:**
- Runs pipeline:
  1. Distributes tasks (generate code, write copy, design specs)
  2. Evaluates against rubrics (multi-LLM judgements)
  3. Rewrites failures
  4. Repeats up to 3 times

**Output:**

```
Generation Complete (3 attempts, 42 minutes)

Summary:
- 12 of 15 components built
- 9 of 10 rubrics passed
- 3 gate issues resolved in rewrite cycle

Components:
  ✅ Auth flow
  ✅ Stripe integration
  ✅ Idea input interface
  ✅ Config pack generator
  ⚠️ Dashboard (needs polish, flagged)
  ⚠️ Onboarding flow (slow, flagged)
  ⚠️ Empty states (not instructional)
```

---

### Step 8: Review Quality Report — PAID

**User:**
- Opens report
- Sees pass/fail/flags
- Clicks any flag to see: "Why this failed" + "Suggested fix"
- Can accept fixes or override (with reason)

**System:**
- Highlights: "These 3 components need work. Here's what's wrong, here's how to fix."

---

### Step 9: Iterate (Feedback Loop) — PAID

**User:**
- Types: "Dashboard feels cluttered, simplify. Onboarding needs to be 3 steps max. Empty states should have example scripts to load."
- Clicks "Regenerate"

**System:**
- Updates rubrics from feedback (e.g., "3-step onboarding" becomes rubric rule)
- Re-runs generation on flagged components only
- Compares output, shows what changed

**Output:**
```
Iteration Complete

Changes:
- Dashboard components reduced by 40%
- Onboarding flow now 3 steps
- Empty state templates added with 5 example scripts

Quality Check:
- 3 flagged issues resolved
- 0 new issues created
```

---

## Free vs Paid Tiers

### Free (Preview)
- Refined idea (Step 3 complete)
- Roadmap (Step 5 complete)
- Concept build (static preview, passes quality gates)

**What you get:** A high-fidelity glimpse of what you're building. Something genuinely usable to share and visualise your idea.

**What you don't get:** The moat. The actual Cold Anvil technology that turns idea into production-ready output.

### Paid (Build)
- Multi-LLM judging (quality evaluation)
- Iteration loops (forging cycles)
- Quality reports with detailed feedback
- Config export (your files, your repo)
- User-inputted iteration (feedback → rewrite)

**v2 Future:** Deployment partner integration (Cloudflare, GitHub) → from deployable files to deployed.

**The pitch:** "Preview what you're building. Build it properly with Cold Anvil."

---

## The Forge Pack Architecture: Cascade Design

**Decision:** Prompts are structured as a cascade — each step takes the output of the previous step and transforms it into something more specific.

### Three Stages

| Stage | Purpose | Domain Specificity |
|---|---|-|
| **Stage 1: Universal** | Works for any product idea (SaaS, content tool, agency) | Domain-agnostic |
| | `idea_refinement.md` | Raw idea → Structured vision |
| | `roadmap_generation.md` | Vision → Sprint/cycle breakdown |
| **Stage 2: Domain-aware** | Applies context to the user's product type | Reads product type, writes custom rubrics |
| | `rubric_creation.md` | User's "what good looks like" → YAML rubrics (with observable anchors) |
| **Stage 3: Output-specific** | Each artefact has its own rubrics and gates | Framework/tech stack detected from spec |
| | `code_generation.md`, `copy_generation.md`, `test_generation.md` | Spec → Artefacts that pass quality gates |

**Why this works:**
- Stage 1 doesn't care what you're building
- Stage 2 reads the product type and writes rubrics with observable anchors
- Stage 3 generates the actual artefacts

---

## Session Summary

**2026-03-20 — Product Framing Session**

**What we built tonight:**
- ✅ The problem (when output is easy, quality becomes the hard work)
- ✅ The first customer (solo founders, agencies, small teams)
- ✅ The value prop (force multiplier, not sunk cost)
- ✅ The launch strategy (Cold Anvil + Fourth Age, one story)
- ✅ The user journey (9 steps, magic UX, free vs paid)
- ✅ The agent (Annie forges your product)
- ✅ The Forge Pack architecture (cascade design: universal → domain-aware → output-specific)

**What we learned:**
- Fourth Age is the first config pack, not the only one
- Magic UX = conversation, not configuration
- The moat = forging process, quality reports, iteration (not concepts)
- Prompts cascade: raw idea → structured vision → rubrics → artefacts

**The Voice:**
> "Cold Anvil. Whatever you imagine, we'll forge it into reality. Meet Annie."

**Next session:**
- Draft the first Forge Pack prompts (`idea_refinement.md`, `roadmap_generation.md`, `rubric_creation.md`)
- Write the launch page narrative (the first thing users see)
- Define "cycle 1" for a real customer (start with a build)

