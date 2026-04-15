> *The authoritative Cold Anvil product spec is at `/home/jack/Forging_The_Anvil/respec/03-spec.md`. This file predates the respec and some surface details (cascade stage count, tier boundaries, pipeline dispatch) have been superseded. The conversation mechanics described here remain load-bearing as reference for Annies discovery conversation.*

# Cold Anvil — User Journey Spec

**Written:** 23 March 2026
**Updated:** 24 March 2026
**Status:** Reviewed — open questions resolved
**Depends on:** Cascade depth pricing (decided), conversational flow spec
(reviewed), API contract (reviewed)

---

## Overview

This spec maps the full customer experience from first landing to ongoing
project work. Every tier shares the same platform — the project page is the
product from the first interaction. Upgrading doesn't move you somewhere new;
it deepens what's already there.

---

## Design Principles

**The conversation is the demo.** The free tier isn't a limited dashboard or a
crippled version of the product. It's a live experience of working with Annie.
If the conversation isn't magical, nothing else matters.

**Quality is non-negotiable on free.** Same pipeline, same models, same gates,
same dual review. The free tier output must be the best work the platform does
because it's the only thing between curiosity and conversion. The vision doc
rubric should be the tightest rubric we have.

**Friction is a feeling, not a number of steps.** Entering your email with
your idea doesn't feel like friction — it feels like starting. Verifying your
email when your vision doc is ready doesn't feel like a wall — it feels like
receiving something. Each step asks for one thing at a natural moment. The
friction comes when you ask for something unexpected, ask for two things at
once, or ask before you've given value.

**Outputs are pages, not files.** The customer never downloads a markdown file
from the web UI. Every output is a rendered, branded, interactive project page
at a URL. Files and markdown are the internal representation. Customers see a
product, not a document.

**Every page is shareable.** Every project page has a share link. "Here's my
vision doc" sent to a co-founder is a free Cold Anvil ad. Zero acquisition
cost marketing built into the product.

**The platform is there from the start.** The project page exists from the
free tier. It gets deeper and richer as you upgrade. The Phase 5 workshop
isn't something you migrate to — it's the same page you've been looking at
since your first conversation. Upgrade unlocks depth, not a new product.

**Each tier boundary is visual.** Below the current tier's output, the next
tier's content is teased — real output from the actual pipeline, specific to
this project, greyed out or behind a tasteful blur. The customer can see it's
real. The upsell is visual, not verbal.

---

## The Flow

### Landing (coldanvil.com)

**State:** Visitor. Has an idea, probably half-formed.

- Landing page sells the transformation: "You have an idea. We'll forge it
  into reality."
- Single CTA: "Start with your idea" — takes them to a simple intake:
  email + idea pitch.
- Email is collected upfront. No verification yet — just standard format
  validation and typo prevention (e.g., "Did you mean gmail.com?"). Users
  expect this. Frame it as: "Enter your email so we can send you the
  results when they're ready."
- This is critical for two reasons: (1) if they drop off at any point,
  we can follow up, and (2) by the time they hit the Tier 1 cliff we
  already have their email — the only ask at that point is OTP verification
  + payment, not "give us your email AND pay."

**Design note:** The landing page should show example project pages — real
outputs at each tier depth. "Here's what a vision doc looks like. Here's a
roadmap. Here's generated code. Here's a deployed project." Social proof
through output quality, not testimonials.

### Step 1-2: Idea Intake

**State:** Email captured (unverified). Conversation starting.

- User types their idea. Could be a sentence, a paragraph, a rambling
  pitch — anything.
- Annie acknowledges it, reflects back what she heard, signals that she's
  going to ask some questions to shape it.

**Pipeline:** Nothing running yet. This is lightweight — a single model call
to parse the idea and prepare the conversation.

### Step 3: Idea Refinement Conversation (Free Tier)

**State:** Anonymous user, in conversation with Annie.

- Annie asks 5 clarifying questions (see conversational flow spec).
- Questions are not generic. They're derived from what the user said and
  what's missing. If the user gave a detailed pitch, Annie asks fewer,
  sharper questions. If it's vague, she asks broader ones.
- The conversation feels like working with a product thinker, not filling
  out a form.
- Annie thinks out loud: "Interesting — so you're saying the target user is
  X, but the problem you described sounds more like Y's problem. Which is it?"

**Pipeline:** Conversational model (35B). Not the forge pipeline — this is
direct model interaction via Gateway chat or dedicated endpoint. Needs to be
fast and responsive. No gate/review cycle on conversation turns.

**What gets extracted:** Structured project context that feeds into the
pipeline. Problem statement, target user, key features, constraints, success
criteria. The user doesn't see this extraction — Annie just has a conversation
and the platform captures the structure behind it.

### Vision Document Generation

**State:** Conversation complete. Pipeline running.

- Annie signals the transition: "Right, I've got a clear picture. Let me
  put this together for you."
- Progress indicator while the pipeline runs (~2-3 min compute). Not a
  spinner — something that communicates work is happening. "Drafting your
  vision... Reviewing quality... Done."
- Vision document generated through the full pipeline: generation, dual
  review, rewrite if needed. Full quality gates applied.

**Pipeline:** Full forge pipeline. Generation (35B) -> dual review (27B +
24B) -> rewrite (122B) if needed. Same pipeline as paid tiers. No shortcuts.

### Vision Document Delivery

**State:** Vision doc ready. Email already captured (unverified).

- The vision document renders as a branded project page.
  URL: `coldanvil.com/projects/{id}/vision`
- Sections with clear hierarchy. Not a wall of text.
- The user can read the full vision doc immediately.
- **OTP verification to unlock persistence + sharing:** "We've sent a code
  to your email. Verify to save your project and get a shareable link."
  We already have the email from intake — this is just verification, not
  a new ask. One small step, not a wall.
- Without verification: page lives for 14 days. With verification:
  permanent, shareable, and the user has an account for future visits.

**Why gate persistence, not viewing:** The user needs to see the quality
before they'll give us anything. If we gate the output behind email, it feels
like a bait-and-switch. If we gate the *save and share*, it feels fair —
they've seen the value, now we're offering to keep it for them.

### Tier 1 Cliff: Roadmap Preview

**State:** Vision doc delivered. Email captured. Free tier complete.

- Below the vision doc on the project page: the roadmap section.
- Not empty. Not a placeholder. Shows structure and metadata derived from the
  vision doc — section headings, topic areas, scope indicators. Enough to
  see what the roadmap *would* cover, without generating the actual content.
- No speculative generation. We don't burn compute on the hope they upgrade.
  The preview communicates depth and specificity without a pipeline run.
- CTA: "Unlock your roadmap — Shape It for 29/month"
- Secondary: "See what all tiers include" — link to pricing page.

**Design note:** The roadmap preview must be generated from this specific
project, not a generic example. This means the pipeline runs Steps 4-5
speculatively after the vision doc completes. Compute cost is low (Tier 1
stages are light). The output is held but not delivered until payment.

**Alternative (if speculative generation is too expensive at scale):** Show
the roadmap structure (section headings, number of sprints, deliverable
count) without the content. "Your roadmap has 4 sprints, 12 deliverables,
and 3 risk flags. Upgrade to see the details."

### Steps 4-5: Roadmap + Content (Tier 1 — 29/month)

**State:** Paying customer. Tier 1.

- Payment via Stripe. Pro-rated if upgrading mid-cycle.
- Roadmap generates (or is released from speculative cache).
- Content generation: copy, creative assets.
- All outputs render on the project page as new sections below the vision.
  Same branded, interactive, shareable format.

**Project page state:** Vision (unlocked) + Roadmap (unlocked) + Content
(unlocked) + Tech Design (locked/preview) + Code (locked) + Deployment
(locked).

### Tier 2 Cliff: Tech Design Preview

**State:** Tier 1 complete. Roadmap and content delivered.

- Below the content section: tech design preview.
- Same pattern as Tier 1 cliff — real output, specific to this project,
  partially visible behind blur.
- CTA: "See your tech architecture — Build It for 49/month"

**This is the critical conversion point.** Tier 2 gives the customer the IP —
tech design and generated code. Everything they need to go build it themselves
or take it to another tool. The preview needs to be compelling enough that
paying 20/month more feels like a no-brainer compared to trying to figure out
the architecture alone.

### Steps 6-7: Rubric Creation + Tech Design + Code (Tier 2 — 49/month)

**State:** Paying customer. Tier 2.

- Step 6: Rubric creation conversation — "What does good mean for your
  project?" (see conversational flow spec). This generates project-
  specific rubrics that layer on top of base rubrics.
- Tech design generated through pipeline with project rubrics applied.
- Code generation: multiple files, each quality-gated and reviewed.
  Language-specific gates applied based on tech design output.
- Code outputs render on the project page but also available as downloadable
  files / zip. Code needs to be usable outside the platform.

**Project page state:** Vision + Roadmap + Content + Tech Design (unlocked) +
Code (unlocked, downloadable) + Deployment (locked/preview).

### Tier 3 Cliff: Deployment Preview

**State:** Tier 2 complete. Code delivered.

- Below the code section: deployment readiness assessment.
- "Your project needs: hosting (Cloudflare Pages recommended), a database
  (Supabase or PlanetScale), and CI/CD (GitHub Actions). Estimated setup
  time without Cold Anvil: 4-6 hours. With Ship It: 20 minutes."
- Shows the deployment complexity to make the gap tangible.
- CTA: "Ship it — 200/month"

**This boundary needs the most design thought.** The customer has the code.
They could leave. The deployment preview needs to make the last mile feel
both valuable and easy with Cold Anvil, and daunting without it.

### Steps 8-9: Assembly + Verification + Deployment (Tier 3 — 200/month)

**State:** Paying customer. Tier 3.

- Assembly: deterministic file ops + LLM config generation. Project
  assembled into a deployable structure.
- Verification: html-validate, stylelint, lighthouse. Results rendered on
  project page as a verification report.
- Deployment guidance: opinionated recommendations with partner pricing.
  "We recommend Cloudflare Pages for this project. Here's why. Cold Anvil
  customers get [partner benefit]."
- Iteration: feedback triggers targeted rewrites of specific stages. Not
  "start over" but "improve this section."

**Project page state:** Everything unlocked. Vision + Roadmap + Content +
Tech Design + Code + Assembly + Verification + Deployment Guide.

### Ongoing (Tier 3)

- Customer can submit feedback, trigger iteration cycles.
- Project context accumulates on the platform.
- Foundation for Phase 5 (project evolution, codebase awareness).

---

## Tier Boundary Summary

| Boundary | What's teased | Conversion trigger |
|----------|--------------|-------------------|
| Free -> Tier 1 | Roadmap structure preview (metadata, not generated content) | "I can see what my roadmap would cover. I want it." |
| Tier 1 -> Tier 2 | Tech design structure preview (metadata, not generated content) | "I can see the architecture scope. I need it." |
| Tier 2 -> Tier 3 | Deployment readiness assessment | "I have code but deploying is hard. They'll do it for me." |

---

## Project Page Architecture

Every project lives at `coldanvil.com/projects/{id}`. The page grows as the
customer progresses through tiers:

```
coldanvil.com/projects/{id}
|
+-- /vision          (Free)
+-- /roadmap         (Tier 1)
+-- /content         (Tier 1)
+-- /tech-design     (Tier 2)
+-- /code            (Tier 2, also downloadable)
+-- /assembly        (Tier 3)
+-- /verification    (Tier 3)
+-- /deployment      (Tier 3)
```

Each section is:
- **Rendered** — branded, interactive, not raw markdown
- **Shareable** — individual section URLs, open to anyone with the link
- **Locked/unlocked** — based on tier. Locked sections show previews.

The project page IS the product. From free tier to Tier 3 to Phase 5
workshop, it's the same page getting deeper. No migration, no context loss.

---

## Email and Authentication Flow

**No passwords. Ever.** Auth is email + OTP or Google SSO. No password
storage, no reset flows, no breach liability. Passkeys potentially later.

1. **Landing:** Email collected with idea pitch. Unverified. Standard format
   validation + typo detection ("Did you mean gmail.com?"). Framed as:
   "so we can send you the results." Google SSO also available as
   alternative — one click, email captured and verified in one step.
2. **Vision doc ready:** OTP sent to the email they already gave us. Verify
   to persist the project and unlock sharing. One small step, not a new ask.
   (Skipped if they used Google SSO — already verified.)
3. **Upgrade to paid tier:** Stripe checkout. Email verified, project exists,
   account is already real. Payment is the only new thing.
4. **Return visits:** Magic link via email OTP, or Google SSO. No password
   to remember.

**Key insight:** By the time we ask for payment, the customer already has:
- An email on file (captured at intake, before any value delivered)
- A verified account (OTP at vision delivery — low friction, high investment)
- A project on the platform (with a URL)
- A vision doc they can see and share
- Investment in the conversation with Annie

Each step adds one thing. Email at intake. OTP at delivery. Payment at
upgrade. Never two asks at once.

---

## Design Decisions (resolved 24 March 2026)

- **Speculative generation:** No. Tier previews show structure and metadata
  derived from existing outputs, not pre-generated content. Don't burn
  compute on the hope of conversion.
- **Share permissions:** No. Shared links only show content the sharer has
  access to. Locked tiers are not visible (blurred or otherwise).
- **Project expiry (free tier):** 14 days for non-verified projects. Low
  storage cost, gives users time to come back.
- **Tier downgrade:** Keep everything that was generated. Customer retains
  read access to all previously generated content but cannot iterate at
  the deeper depth until they re-upgrade.

---

## Dependencies

- **Conversational flow spec** (3A, reviewed) — Step 3 and Step 6 conversation
  design
- **API contract** (3A, reviewed) — endpoint shapes for project creation, cascade
  triggering, output retrieval
- **Frontend design** — project page rendering, tier boundary UI, share
  mechanics. Not specced here — this is the journey, not the interface.

---

*Reviewed 24 March 2026. Open questions resolved. Ready for implementation.*
