# Session Retrospective — 23 March 2026

What worked, what could be better, and what our collaboration process
tells us about the product we're building.

---

## What Worked

### Design first actually worked

We spent an entire day on a codebase and wrote zero code. The output —
a pricing model, a product vision, three specs, a research document, a
rewritten business plan — is more valuable than any code we could have
written today. Every line of code in Layer 2 will be better for it.

The instinct to jump into 3B and start writing FastAPI routes would
have been strong on a different day. The sequencing exercise caught
that impulse and redirected it. Specs before code isn't just a rule —
today it actually prevented us from building to the wrong pricing
model, the wrong auth flow, and the wrong output format.

### Conversation as discovery

The session started as "plan Phase 3 sequencing." It ended with a
fundamentally revised business model, a long-term product vision, and
a technical architecture for context-managed conversations. None of
that was planned. It emerged from following threads:

- Sequencing led to dogfooding questions
- Dogfooding gap led to "can Cold Anvil build Cold Anvil?"
- That led to the retention problem
- Retention led to "dream building machine"
- Which led to cascade depth pricing
- Which led to margin analysis
- Which led to deployment partnerships
- Which led to the business intelligence agent

Each insight built on the last. The conversation had a structure
(we kept coming back to "what does this mean for the plan?") but it
wasn't rigid. The best ideas came from following the energy.

### Jack's push-backs caught real problems

Three specific moments where Jack's instinct overrode my initial take:

1. **The dogfooding elephant.** I categorised Phase 3 work as "can't
   dogfood" vs "can dogfood" in binary terms. Jack saw through it to
   the deeper question: if Cold Anvil can't build things, what does
   that say about the product? That reframing produced the entire
   long-term vision.

2. **Email at intake.** I optimised for minimum steps (zero friction =
   no email upfront). Jack correctly identified that entering an email
   is expected behaviour, not friction — and that the marketing value
   of early capture far outweighs the non-existent friction cost. His
   principle — "friction is a feeling, not a number of steps" — is
   better product thinking than what I proposed.

3. **The free tier.** I wrote an entire pricing model and we both
   nearly moved on without properly designing the free tier experience.
   Jack caught it. The free tier is the entire sales funnel. Skipping
   it would have been a serious oversight.

### Research before spec

The idea-to-vision framework research grounded the conversational flow
spec in decades of practitioner experience rather than our assumptions.
The extraction schema, the conversation phases, the anti-patterns — all
came from synthesising Lean Canvas, JTBD, YC, Mom Test, and others.
The spec would have been weaker without it.

### Documenting as we went

Every decision hit the roadmap, business plan, or Arnor memory within
minutes of being made. Nothing was left as "we decided that earlier,
right?" The documentation isn't a chore at the end — it's part of
the thinking process. Writing it down forced clarity.

### Knowing when to stop

Jack called "let's take stock" at the right moments. The session had
natural phases: planning, then pricing, then vision, then specs. Each
pause prevented scope creep into the next phase before the current one
was solid.

---

## What Could Be Better

### I missed things Jack caught

The free tier gap and the email-at-intake call were both things I should
have raised first. In both cases I was optimising for a local metric
(pricing structure completeness, friction reduction) and missed the
bigger picture (the free tier IS the product demo; email capture IS
expected behaviour).

Pattern to watch: optimising for elegance of a model rather than
practical reality of the user experience.

### The research took a while

The idea-to-vision framework research was valuable but took ~8 minutes
of wall clock time. For a session with momentum, that's a meaningful
pause. Worth it in this case, but worth thinking about whether research
can be parallelised or pre-loaded for future sessions.

### Some specs could be tighter

The API contract is solid but some endpoints (especially billing) are
thin because Stripe integration is Layer 5. That's intentional — we
specced what we need now — but it means the contract will need a
revision pass when we get to 3F. Worth flagging now so we don't treat
the contract as frozen.

---

## What Our Process Tells Us About Cold Anvil

This is the really interesting part.

**Our session today was a Step 3 conversation.**

Jack arrived with a half-formed starting point ("let's plan Phase 3").
Through conversation, we extracted structure: the sequencing, the
pricing model, the vision, the technical architecture. The output — the
specs, the business plan — is the "vision document" of our session.

The process we used IS the process Annie needs to facilitate:

1. **Start broad, let the person talk.** Jack said "Phase 3 planning"
   and I laid out the sub-phases. He said "what about the elephant?"
   and we followed it. The best product insights came from open-ended
   exploration, not structured interrogation.

2. **Challenge assumptions gently.** When I said "can't dogfood," Jack
   didn't accept it. He pushed. Annie needs to do the same — "You said
   everyone needs this. Who specifically?" — without making the user
   feel stupid.

3. **Extract structure from conversation.** By the end of each topic,
   we had something structured (a pricing table, a sequencing diagram,
   a spec). The conversation was exploratory; the output was structured.
   That's exactly what the extraction pipeline needs to do.

4. **Show progress.** We updated docs throughout. The user journey
   progress panel is the product equivalent — showing the extraction
   state filling in so the user can see structure emerging from their
   conversation.

5. **Research when knowledge is lacking.** We didn't guess at the
   conversational framework. We researched it. Annie should do the
   same — when a user's idea touches a domain Annie doesn't know well,
   the system should pull in research rather than hallucinate.

6. **Document decisions so they're not lost.** Every insight went
   into a persistent artifact. Arnor memory, roadmap, business plan.
   Annie's extraction pipeline does the same — captures structure
   outside the conversation so it survives beyond the context window.

7. **Know when the conversation is done.** We didn't keep talking
   after the specs were written. Annie needs to recognise "I have
   enough to generate a good vision document" and propose moving
   forward, not keep asking questions for the sake of completeness.

**The quality of our output today was a function of the quality of
our conversation, not the quality of any individual tool or model.**
That's the thesis Cold Anvil is built on. The conversation shapes
the idea. The pipeline forges the output. The magic is in the shaping.

---

## Principles Worth Keeping

From today, distilled:

- **Specs before code.** Not as a rule, as a competitive advantage.
- **Friction is a feeling, not a number of steps.**
- **Follow the energy.** The best insights come from threads, not
  agendas.
- **Challenge the model, not the person.** Push back on weak
  assumptions, not weak people.
- **Research beats guessing.** When you don't know, find out. Don't
  fabricate.
- **Document as you think, not after.** Writing forces clarity.
- **Profile, then optimise, then rewrite.** Applies to code, to
  process, to product decisions.
- **The conversation is the product demo.** True for Cold Anvil's
  free tier. True for how we work together.
