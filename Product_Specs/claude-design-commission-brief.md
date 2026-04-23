# Claude Design Commission — Cold Anvil / Annie's Workshop

*Sent to Claude Design 2026-04-23. This is the brief as delivered.*

---

## What we want

End-to-end interface design for **Annie's Workshop** — the app a user spends
time in after they arrive through coldanvil.com and commit to building
something with Annie. Polished designs only. No wireframe pass, no
half-steps. We've done the thinking. We want you to bring it to life.

## What Cold Anvil is

A non-technical person has had an idea they can't get out of their head.
They're a recruiter, a carpenter, a teacher, a nurse, a parent with a
side project they think about while doing the dishes. They are not a
product manager. They've never scoped a sprint. They've possibly tried
Squarespace and found it too limiting, or Lovable and got a prototype
they couldn't deploy. The gap between "I have an idea" and "I have a
thing I can show my friend" is too wide, and nobody has closed it for
their case.

**Annie closes it.** Annie is not a feature. Annie is the product. She
listens, asks clarifying questions, commits to a direction, builds a
working thing the user can see take shape in real time, and stays with
them as they keep iterating over weeks and months. Every other piece of
Cold Anvil — the generation pipeline, the verification tools, the
deployment system — is a tool Annie uses while working with the user.

*Full spec: `respec/03-spec.md`. Read §1–§3 and §9–§10 before designing.*

## Who uses the workshop

Same person as above. They are not a developer. They have never seen
code. They don't know what a "stack" is. Every surface has to make sense
to someone who just wants their idea to become real.

**This is a consumer product in the clothing of a professional tool.**
The reference points are not Linear, Notion, or Figma. They're closer to
a conversation with a very capable, very patient person who happens to
know how to build software. The interface supports the conversation; the
conversation is the product.

## The journey we're designing for

Eight beats from `respec/03-spec.md` §3. Every beat is a **feedback
loop**, not a step in a wizard. The user can push back, redirect,
correct, or change their mind at any of them.

1. **Arrival** — they land on the marketing site, see a composer, type
   whatever they have. *(Marketing site already designed; not part of
   this commission. The handoff from site → workshop is in scope.)*
2. **Discovery conversation** — Annie talks with them. Real
   back-and-forth. She pushes back when something is underspecified and
   tells them what she thinks they actually want when they can't
   articulate it. Usually under 10 minutes; sometimes longer.
3. **Vision artefact** — Annie writes a short, confident statement of
   what she thinks the user is trying to build, who it's for, and what
   "done" looks like for v1. The user reads it, reacts, Annie edits it
   in place. Tight loop — seconds, not minutes. The artefact is *also*
   a document the user owns (`docs/vision.md`).
4. **Plan** — one sentence. *"I'm going to build you a one-page site
   with a waitlist form that sends submissions to an inbox you control.
   I'll have something for you to click in about ten minutes."* The
   user either accepts or keeps refining. No sprint breakdown. No
   step-list the user has to decode. One human sentence of commitment.
5. **Build with live preview** — Annie builds. The user watches a real
   URL come alive — a browser pointed at a scaffold that becomes the
   real thing as she wires it up. Not a progress bar. A real preview.
6. **Real-time refinement** — "the hero should be green." "Add a
   pricing page." The preview updates. Point-and-click editing on any
   element. This is the spine of the product, not a post-launch
   afterthought.
7. **Publishing** — user says they're ready; Annie publishes to a real
   host. Custom domain available. Publishing isn't terminal — it's a
   snapshot of ongoing work.
8. **Continuity** — user comes back. Next day, next week, months later.
   Annie remembers them and the project. New features, refined copy,
   bugs fixed from real user reports. Annie-as-operator: when the
   deployed thing fails (bounced emails, expired tokens), Annie
   notices and narrates it on the user's next return. She never pages.

## The principle that governs every surface (§10)

**The user is the navigator. Annie is the driver who knows the terrain.**

The user brings the idea and holds agency at every moment. Annie has
opinions and commits to directions, but her authority is always
subordinate to the user's intent. The funnel is semi-deterministic —
there's a shape, there's a direction of travel — but it must never feel
like a wizard or a form the user is being pushed through.

Every screen, every state, every component you design must be able to
answer three questions:

1. Where is the user's agency here?
2. What does pushing back look like?
3. What does "go a different way" look like?

If any of those three has no answer, the surface isn't navigator-shaped
yet. Our single biggest failure mode is building a pipeline wearing a
persona — a deterministic flow with Annie-flavoured copy on top. Don't
design that. Design something where the user can redirect at any
moment, including during an active build.

## Craft principles we want you to apply

These are lifted from Claude Code's `interface-design` skill. They're
the quality bar.

- **Intent first.** Before any visual decision, answer: who is this
  person, what must they accomplish, how should it feel. Not
  "non-technical user, build something, clean and friendly" — specific
  answers. A nurse at the end of a long shift is not a recruiter
  between calls is not a carpenter sketching on a Saturday morning.
- **Sameness is failure.** If another AI, given a similar prompt, would
  produce substantially the same output, something has gone wrong. This
  interface must emerge from Cold Anvil's specific context — not from
  "SaaS dashboard" training patterns.
- **Domain exploration before visual decisions.** Spend time in the
  product's world. Cold Anvil is a forge. A workshop. There's a
  craftsperson register. What belongs visually in that world that
  doesn't belong in a generic admin panel? Produce a **signature** —
  one element (visual, structural, or interactional) that could only
  exist for Cold Anvil, not for anyone else.
- **The swap test.** If you swapped your typeface or layout for the
  most common alternative, would anyone notice? The places where
  swapping wouldn't matter are the places you defaulted.
- **The squint test.** Blur your eyes. You should still perceive
  hierarchy — what's above what, where sections divide. But nothing
  should jump out harshly. Craft whispers.
- **Every choice is a choice.** For every decision — spacing, colour
  temperature, typeface, hierarchy — be able to explain *why* this and
  not the common alternative. "It's clean" isn't an answer.

## Language rules (load-bearing — §9)

**Nothing technical leaks to the user.** No "stack," no "cascade," no
"stage," no "endpoint," no "repo," no "deploy," no file paths, no
framework names. Not in plan descriptions, not in progress events, not
in error messages, not in settings, not in empty states, not in
tooltips. This is product-wide and non-negotiable.

Plan descriptions are *"Your about page — explains who you are and what
makes you different"*, not *"landing_page → src/pages/Index.tsx"*.
Progress events are *"Building your about page…"*, not *"Step 2/3:
FEATURE_PAGE"*. Errors are *"Something went wrong on the menu section —
we stopped so we don't ship a broken site. Want me to try again?"* —
not stderr.

When in doubt between a technically-precise phrasing and a friendly
one, the friendly one wins.

## Brand constraints

**Locked. Do not propose changes.**

- **Palette — Bullfinch Forge.** Dark-warm Gruvbox-derived system.
  Mustard accent (`#d8a65c`), olive secondary (`#8c945c`), ink
  (`#d4be9a`), bg (`#32302f`), cream contrast pocket (`#fbf1c7`).
  Full token set + WCAG verification in `BRAND.md`.
- **Cards are outlined.** Transparent fill, 1px border. Never filled.
  Emphasis cards swap the border colour to accent.
- **Mustard is for moments.** CTAs, accent borders, manifesto blocks.
  Never paragraph text.
- **Olive is non-text only.** Badges, status dots, icon backgrounds.
- **Italic-as-emphasis.** Newsreader italic for emphasis, quotes, the
  accent word in a manifesto moment.

**Open. We want you to propose.**

- **Typography.** We currently pair Newsreader (serif) + Inter (sans).
  We've had readability feedback on Newsreader — particularly at
  smaller sizes, for some readers. We're open to alternatives. If you
  want to keep Newsreader for display and propose a more readable body
  face, that works. If you want to replace both, we'll hear it. The
  constraint: whatever you propose has to clear WCAG 2.1 against the
  locked palette, and it has to carry the "editorial / craftsperson"
  register (not "tech startup," not "institutional," not "playful").

**Free. You invent.**

- Layout, information architecture, component patterns, micro-interactions,
  motion language, empty states, loading states, error states, the
  signature moment that makes this unmistakeably Cold Anvil.

## Inputs we can give you

- `respec/03-spec.md` — **read this first.** The spec. §1–§3 and §9–§10
  are load-bearing.
- `Cold_Anvil/BRAND.md` — the brand brief.
- `Cold_Anvil/prototypes/` — working HTML prototypes showing the brand
  in action on the marketing site.
- The **coming-soon page on coldanvil.com** — the teaser mockup in the
  right column is *inspiration only*, not a binding spec. Don't treat
  it as a prescription. It shows one possible shape; propose others if
  they're better.
- `Product_Specs/user-journey.md` + `conversational-flows.md` — detailed
  conversation mechanics from an earlier design pass. Load-bearing on
  how the conversation works; load-free on visual treatment.
- A set of reference inputs from a structured critique of the teaser
  (preserved in our ticket system as COL-46's reference comments) —
  specific concerns about density, hierarchy, and the mechanics of the
  vision artefact / plan / live preview. Happy to hand these over as
  starting provocations, not prescriptions.

## What we need back

A polished design package covering:

1. **The first-session arc.** Every screen from "user just signed in
   after typing their idea into the marketing site" through "the
   preview URL is live and I'm talking to Annie about refining it."
2. **The ongoing-relationship arc.** What a returning user sees — the
   project page, their history with Annie, the vision/brand-voice/
   content-strategy/site-architecture docs as browsable artefacts,
   running deployments, Annie's operator-mode updates ("your waitlist
   emails stopped going out last Tuesday because…").
3. **The conversation surface.** Annie as a first-class part of the
   interface. Not "the chat panel" — the interface is built around the
   conversation, not beside it.
4. **The vision artefact.** How it appears, how the user interacts with
   it (the "point at it and say 'that's wrong' in one click" beat),
   how it persists as both a conversational moment and a document.
5. **The plan-as-sentence beat.** The commitment moment. What the
   sentence looks like, how accept/refine works, what the step list
   looks like *as visibility during the build* (no user-facing jargon,
   per §9) without becoming a wizard.
6. **The live preview + click-to-edit surface.** Preview as
   first-class, not a side panel. The "point and say 'make this green'"
   interaction. The escape hatch when the build is going wrong.
7. **States.** Empty, loading, mid-generation, success, failure,
   reconnection, publishing, deployed. Every state the user can hit,
   in Annie's voice, obeying §9.
8. **Motion.** A restrained motion language. Annie's voice in how
   things move.
9. **A signature.** One thing only Cold Anvil does. Propose it, defend
   it.

## Format we want it in

- Polished screens (Figma or equivalent).
- Design tokens and component spec, implementable by a front-end engineer
  without further design rounds.
- A short written rationale (2–3 pages) for the major decisions —
  especially the signature, the typography choice, the information
  architecture, and how the three navigator/driver questions are
  answered on each key surface.
- Source files we can hand to the implementation team.

## Process

- One round of designs, in full.
- One written round of feedback from us.
- One revision pass.
- Handoff.

We trust you to run with this. We've tried to front-load the context so
you're not guessing at intent.

## One last thing

We're describing a product where a non-technical person ends a
conversation with a working, deployed thing they can show their
friend — and keeps coming back to it. It has to feel like that.
Not like a dashboard. Not like an admin tool. Not like a generic app.
Like a workshop with a craftsperson who's on your side.

Design from there.
