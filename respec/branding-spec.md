# Cold Anvil — The Branding Spec

*Written by Annie. Opinionated. Three pages. Every decision answers a question from COL-263 with a single recommendation, not a menu. Where alternatives exist, they live in the COL-263 ticket comment so this file stays a decision, not a deliberation.*

---

## 1. The problem this exists to solve

Customer apps come out of Cold Anvil as plain shadcn defaults — white canvas, slate primary, system fonts, neutral copy. That's because today there's no way for the user to tell Annie how their app should *feel* or *sound*, so codegen has nothing to reach for besides the scaffold's defaults.

The Branding beat fixes that. Annie asks the user a small number of questions about feel and voice. The answers thread through to codegen, refinement, and rubric scoring so the built app reflects the user's stated direction rather than the scaffold's.

This is governed by the principle in `feedback_customer_apps_no_brand.md`: **Cold Anvil's BRAND.md governs Cold Anvil's own surfaces. Customer apps Annie builds get a project-appropriate identity, NOT Bullfinch palette.**

---

## 2. What Annie asks

Three questions, asked in one turn after the vision firms up but before the propose-handshake.

The questions are deliberately not design-vocabulary. The user is a non-technical person who had an idea over coffee. They don't know "warm minimalist" or "modular density" — they know what feels right when they open something.

**Q1 — Feel.** *"Before I put this together — how should it feel when someone opens it for the first time? Calm and quiet, like a notebook? Or alive and busy, like a dashboard? Somewhere in between?"*

This is the visual register question. The notebook/dashboard frame is concrete enough to anchor without requiring vocabulary. "Somewhere in between" is the gentle off-ramp for users who can't pick a side.

**Q2 — Voice.** *"And if your app could talk to the user, what would it sound like? A coach with energy. A librarian who helps you find what you need. A friend at a coffee shop. Or something else entirely."*

This is the linguistic register. Three concrete archetypes that cover most of the field plus the open-ended slot. "A friend at a coffee shop" is doing real work — it's the casual register most consumer apps fall into and gives the user permission to pick warm-but-not-corporate.

**Q3 — What to avoid.** *"Last one — anything you definitely don't want? Apps you can't stand the look or sound of? Words to keep out?"*

This is the load-bearing question. Negative space is easier to articulate than positive direction, and it catches the things the user already knows are wrong. It's the difference between "I want clean" (vague, contested) and "I don't want flashy banners or 'Welcome aboard!' onboarding" (specific, actionable).

**No optional positive-direction prompt.** "Any product whose voice you'd point at as a reference?" was considered and dropped — it raises the user's design-vocabulary bar exactly when we're trying to lower it. If the user volunteers a reference unprompted, Annie captures it.

**Three questions, not five.** More than three turns the beat into a brand audit, which feels exhausting and gives the user too many ways to second-guess. Three is the count where each question is load-bearing.

---

## 3. When Annie asks

After the structural vision is captured (the six fields plus vision block), before the propose-handshake.

The flow:

1. Annie captures structural fields (problem / customer / current alternatives / solution / differentiation / success criteria).
2. Annie emits the `[[vision]]` block.
3. **Branding beat:** Annie asks Q1+Q2+Q3 in a single turn.
4. User answers in their own words; Annie captures into `extraction_state` (see §4).
5. Annie writes the brief, including a Branding section sourced from the captured intent.
6. Propose-handshake fires.

The branding beat is one Annie turn that asks all three questions inline, separated by short rhetorical breaths. The user replies in one or more messages — Annie extracts incrementally. If the user's answer is sparse or "I don't know," Annie commits to her own read using the `annie_assumption` machinery (COL-271).

This is *not* a separate page or modal. It's a turn in the conversation. The user's flow is uninterrupted: vision → brand → brief → build.

---

## 4. The data shape

`extraction_state` gets three new fields, parallel to the six existing structural ones. Same `{status, summary}` shape, same `annie_assumption` allowed, same `_phase` ordering.

```python
brand_feel:    {status, summary}    # visual register
brand_voice:   {status, summary}    # linguistic register
brand_avoid:   {status, summary}    # negative space (visual + verbal)
```

The fields are stored as 1-2 sentence Annie-paraphrased summaries, not structured tags. This matches how the existing six fields work — Annie captures the user's own meaning in her own words. No palette pickers, no density sliders, no enum lists.

`brand_avoid` covers both visual and verbal because the user's "I don't want it to look like Notion" and "I don't want it to talk like a sales email" are the same kind of answer (a no-go reference) and forcing them into separate fields creates artificial seams. Codegen handles them together (see §6).

A `brand_intent` aggregate is *derived* at read time, not stored — it's the three fields plus a small derived notion of "matched archetype" if Annie's read can place the user near a known shape (calm-notebook / busy-dashboard / friend-coffee-shop / etc.). Aggregation lives in code, not in state.

---

## 5. The Branding tab

The workshop's "Brand voice" tab (currently a stub) becomes "Branding" and renders the captured intent.

Layout matches the brief (M4 / COL-176):

* **H1:** "Branding"
* **Banner:** olive eyebrow `ANNIE'S READ — ADJUST WHERE IT'S OFF`
* **Three sections:** Feel / Voice / What to avoid
* Each section: italic Newsreader summary of the captured field, with hover-edit affordance (same gesture as the brief's free-text-select-to-comment, but per-section here).
* Below: a small "since-last-look" liveness dot (cream eyebrow, same as `/vision` and the rail).
* Footer: "Draft · v{n} · {date}" stamp.

User edit gesture: hover a section → the `+` chip appears on the right edge → click attaches the section text to the composer for the user to push back on. Same pattern as M4. The user can also direct-edit (inline textarea) for fast typo / wording fixes — but the conversational push-back is the primary affordance.

The tab is reachable any time after the branding beat lands. Before that beat, the tab is the existing stub with copy *"I'll ask about how this should feel and sound after we firm up what we're building."*

---

## 6. The downstream contract

### Codegen

`forge/prompts/annie_codegen.md` adds a `## Brand intent` section that takes the three captured fields. The prompt teaches codegen to:

* **Visual half:** apply `brand_feel` to palette choice, density, type pairing, component register. The vanilla shadcn defaults are the floor, not the target — the prompt names them as "what to push away from when brand_feel asks for warmth or density."
* **Linguistic half:** apply `brand_voice` to all generated copy — headlines, button labels, empty states, error messages, onboarding flows.
* **Avoidance:** `brand_avoid` is the no-go list. If the user said "no flashy banners," the codegen prompt explicitly disallows them. If the user said "no 'welcome aboard' onboarding," the empty state mustn't say it.

When `brand_intent` is empty (e.g. user opted out, or the build was triggered without the branding beat), codegen falls back to "make a deliberate choice appropriate to the project domain" — the same posture as the COL-260 brand_integrity rubric.

### Refinement

`forge/prompts/annie_refinement.md` carries the same `## Brand intent` section. When the user requests a change mid-refinement, brand_intent is part of the constraint set. The user can also rebrief — when they do, the refinement prompt updates `brand_intent` first, then re-applies.

### Scoring (COL-260 + future)

The L3 build_outcome `brand_integrity` rubric reads `brand_intent` as the per-project reference. The dim's anchors become:

* **5/5:** build's visual identity and copy register match `brand_intent.feel` + `brand_intent.voice`. `brand_intent.avoid` items are absent. Project-appropriate without being templatic.
* **3/5:** partial match on one half (visual or linguistic) but not the other.
* **1/5:** scaffold defaults survived; no project-appropriate identity choice was made.
* **0/5:** `brand_intent.avoid` items present, OR codegen produced something actively at odds with feel/voice.

When `brand_intent` is empty, the rubric falls back to the COL-260 project-fit framing (judge picks the project-appropriate identity from the brief and scores against that).

---

## 7. Voice register

These three questions land at a moment where the user has just done the hardest part — handing Annie their idea in plain English. The branding questions need to feel like Annie *helping*, not Annie *checking boxes*.

Concretely:

* No design vocabulary. "Warm" is OK; "warm minimalist" is not. "Calm" is OK; "ambient" is not.
* No lists of adjectives the user has to pick from. The notebook/dashboard frame is a concrete pair, not an enum.
* No "rate this on a scale of 1-5". Ever.
* The questions are *invitations*, not *intake forms*. The phrasing is colloquial.
* If the user gives a sparse answer, Annie commits to her own read (COL-271) rather than re-asking. The `annie_assumption` status is the right backstop here — Annie says "OK, I'll go warm-and-quiet then; tell me if that's off when you see the brief."

---

## 8. Out of scope

* Letting the user import a brand from elsewhere (URL, image, brand kit). Useful eventually, not v1.
* Multiple brand_intent versions per project. v1 captures one, refinement updates it.
* Fourth Age / Celyn / sister-product brand handling. Each sister product has its own brand system; this spec governs Cold Anvil customer apps only.
* The conversational copy itself — Q1/Q2/Q3 wording above is the recommendation. Voice-gating happens at the implementation step (COL-265), not in the spec.

---

## 9. The implementation chain

This spec gates four downstream tickets, in dependency order:

1. **COL-264 — Backend.** Add `brand_feel` / `brand_voice` / `brand_avoid` to extraction state + parser. Same `annie_assumption` mechanism as today's structural fields.
2. **COL-265 — Conversation.** Add the branding-beat turn to `forge/prompts/conversation_system.md`, with the question text from §2. Voice-gated.
3. **COL-266 — Frontend.** Rename the "Brand voice" tab to "Branding". Render the three captured fields per §5.
4. **COL-267 — Codegen.** Add the `## Brand intent` section to `forge/prompts/annie_codegen.md` per §6.

Once 264 + 265 ship together (they share the conversation prompt path), 266 and 267 can run in parallel.

---

## References

* `respec/03-spec.md` §3 — the user journey this spec slots into.
* `respec/03-spec.md` §9 — Cold Anvil's user-facing language constraints (the pattern customer apps inherit a project-shaped version of).
* Memory: `feedback_customer_apps_no_brand.md` — the principle that Cold Anvil's BRAND.md doesn't extend to customer apps.
* Memory: `feedback_prompt_example_salience.md` — why §2's questions are templates not scripts.
* COL-260 — the rubric reshape that fed the scoring contract in §6.
* COL-271 — the `annie_assumption` machinery §3 + §7 lean on.
