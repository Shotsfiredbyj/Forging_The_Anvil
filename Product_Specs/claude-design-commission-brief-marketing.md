# Claude Design Commission — Cold Anvil Marketing Site

*Draft 2026-04-23. Not yet sent. Sibling commission to the workshop brief at `claude-design-commission-brief.md`.*

---

**Context for you:** you just delivered the Annie's Workshop design handoff (April 2026). This is the sibling commission. The marketing site was redesigned pre-workshop-handoff and now pre-dates patterns you set — motion language, interaction invariants, component details. We want you to bring the marketing surfaces into alignment with the system you just established, and redesign anything that deserves a fresh pass.

---

## What we want

End-to-end interface design for **coldanvil.com** — the marketing surfaces a visitor hits before they commit to building with Annie. Polished designs only, same fidelity bar as the workshop handoff.

## What the marketing site does

One job: convince a non-technical person with an idea they can't get out of their head to type that idea into the composer and commit to building with Annie.

The visitor is cold. They've never heard of us, or they've heard of us once and are checking again. They are *not* an engaged user. They have ~30 seconds to decide whether Cold Anvil is for them. If the site does its job, they type their idea and cross into the workshop — which is where the workshop handoff picks up.

## Who visits

Same person the workshop is designed for, earlier in their story.

- They're a recruiter, a carpenter, a teacher, a nurse, a parent with a side project they think about while doing the dishes. Not a product manager. Not an engineer. Have possibly tried Squarespace (too limiting) or Lovable (got a prototype they couldn't deploy) and stopped.
- They are not on Hacker News. They did not arrive from a Twitter thread about AI. They arrived because someone sent them a link, or they searched for something specific, or they remembered the name.
- They have never seen code. The word "stack" means nothing to them. If anything on the page makes them feel stupid, they leave.

*Full user spec: `respec/03-spec.md` §2.*

## The pages in scope

1. **Home** (`/`) — the main landing. Hero + composer (the arrival beat, §3 beat 1). Supporting sections explaining what Annie does and why the visitor should care.
2. **About** (`/about`) — the Cold Anvil Studios story. Background, vision, people-ish context without being self-indulgent.
3. **Pricing** (`/pricing`) — presentation pattern for tiers. The exact tier model is still being shaped post-respec, so the design should support 2–4 tiers without locking specific contents.
4. **Early access / waitlist** — whatever form of the conversion surface makes sense pre-launch. Post-launch, arrival flows straight into the workshop.
5. **Marketing → workshop handoff** — the moment the visitor types an idea into the composer and crosses into the product. Visible continuity with the workshop's shell matters here.

## How this inherits from the Workshop handoff

**Non-negotiable. The marketing site must feel like the same product the workshop is.**

Studio-wide elements from the workshop handoff that apply here:

- **Palette** — Bullfinch Forge, locked. Same tokens.css values. The marketing site already uses them but any drift gets caught.
- **Typography** — Newsreader + Inter, locked (pairing B). Specific weights locked too: Newsreader 500 for display, Inter 500 for buttons and nav, 400 for body. Minimum Newsreader weight 400 on dark.
- **Motion language** — the five workshop motion tokens (`arrive`, `settle`, `warm`, `point`, `emerge`) should either be used directly on marketing or extended with a marketing-specific sibling that shares the family.
- **Four studio-wide invariants** (from `BRAND.md` → Workshop interaction invariants):
    - **No modals.** Ever. Including on the marketing site. Confirmations, errors, "subscribe to newsletter" interstitials — all inline.
    - **Italic is emphasis, not decoration.** Newsreader italic used sparingly.
    - **No hamburger for top-level nav on mobile.** Current treatment (typographic "Menu" fold) is correct; preserve the pattern.
    - **No carousels.** If a section has multiple frames, it's a scroll region or a filmstrip, not a swiper.
- **Outlined cards.** Transparent fill, 1px border. Never filled. (Already locked in `BRAND.md`.)
- **Component primitives** from the workshop handoff where useful — Button, Link, Chip, the outlined card pattern. Reuse or adapt; don't reinvent without reason.

**What's open for you to invent:**

- Hero shape. The current hero ("Bring the idea. Annie makes it work.") is a good starting point but you can propose differently.
- Section rhythm and information architecture. The current site has Workshop band → Meet Annie → The Gap → pricing preview; you can keep, restructure, or replace.
- Specific marketing components that don't exist in the workshop (testimonials if they show up, feature blocks, comparison tables, pricing tier cards, etc.).
- Photography treatment. The current site has a placeholder for a full-bleed workshop photo.
- The handoff moment from marketing composer into workshop — what it looks like, how the continuity is visible.

## Principle — continuity of voice and pace

The workshop handoff established the navigator/driver principle for the product surface: user is navigator, Annie is driver, user has agency at every moment. On the marketing site, the visitor hasn't met Annie yet — but the *voice* they encounter on the home page is Annie's voice. The site should feel like the start of the same relationship the workshop continues.

Concretely:

- The site speaks in `BRAND.md`'s warm-direct-craftsperson register. Not institutional-scientific (Anthropic). Not cute-utility ("Your AI sidekick!").
- The site does not lead with AI. AI is the engine, not the pitch (`BRAND.md` hero rules).
- The site assumes zero technical background. Every word has to land with someone who has never seen code.
- The site never patronises. No "the barman" or "the plumber" examples. "Anyone with an idea who doesn't know how to build a product."
- The site never feels like a funnel. It feels like the start of a real conversation.

## Craft principles (same bar as workshop)

Lifted from Claude Code's `interface-design` skill. Re-stated here because they apply to marketing too.

- **Intent first.** Who is this visitor, what must they accomplish, how should it feel. Specific answers, not "non-technical user, clean and friendly."
- **Sameness is failure.** If another AI, given a similar brief, would produce substantially the same output, something has gone wrong. Cold Anvil's marketing site must emerge from its specific context — not from "SaaS marketing" training patterns.
- **Domain exploration.** Cold Anvil is a forge. A workshop. A studio in the lineage of makers, not tech startups. Propose a **signature moment for the marketing site** — one thing that could only exist for Cold Anvil. (The workshop's signature is the plan-as-stamp; marketing's should be different but rhyme.)
- **The swap test, the squint test, every choice is a choice.** Same tests. Same bar.

## Language rules (load-bearing — §9 applies product-wide)

**Nothing technical leaks.** No "stack," "cascade," "deploy," "endpoint," "framework," "pipeline," "launch" (as verb), "ship," "MVP." Not in hero copy, nav, CTA text, pricing copy, about copy, footer, 404 page, email forms — anywhere.

The `BRAND.md` voice rules apply absolutely. The "words to never write" list is exhaustive.

## Brand constraints

**Locked. Do not propose changes.**

- Bullfinch Forge palette — same `tokens.css` as the workshop.
- Newsreader + Inter pairing, with the weight rules above.
- Outlined cards — transparent fill, 1px border.
- Mustard for moments only (CTAs, accent borders, manifesto blocks), never paragraph text.
- Olive non-text only.
- Italic as emphasis only.
- Voice register (warm-direct-craftsperson).

**Open. Propose.**

- Motion application on marketing surfaces (the tokens are locked; how they're used here is yours).
- Layout, section rhythm, IA, component inventory specific to marketing needs.
- Hero shape, empty-state treatments, form treatments.
- The signature moment for marketing.
- Imagery direction within the `BRAND.md` "documentary craft" register.

## Inputs

- `respec/03-spec.md` — the product spec. §1–§3 are load-bearing.
- `Forging_The_Anvil/Design_Handoffs/annies-workshop/` — the workshop handoff you just delivered. Tokens, invariants, motion, components — everything here is the system to align to.
- `Cold_Anvil/BRAND.md` — the brand brief. Workshop interaction invariants section lives here too.
- `Cold_Anvil/site/` — the current marketing site implementation. Starting point, not prescription.
- `Cold_Anvil/prototypes/` — earlier HTML prototypes for the brand (cards-comparison, page-rhythm).

## What we need back

A polished design package covering:

1. **Home page, polished**, full desktop + responsive.
2. **About page, polished**, full desktop + responsive.
3. **Pricing page, polished** — presentation pattern that holds 2–4 tiers, since the specific tier model isn't fully settled.
4. **Early-access / waitlist surface** — whatever form this takes in the design.
5. **Marketing → workshop handoff** — the transition moment.
6. **Marketing-specific components.** Anything needed above and beyond what's in the workshop handoff.
7. **States.** Form success, form error, 404, empty states.
8. **Motion application.** How workshop motion tokens are used on marketing surfaces.
9. **A signature moment specific to marketing** — propose, defend.

## Format

- Same format as the workshop handoff: pan-and-zoom HTML canvas + React prototypes + self-hosted fonts. Proved excellent for implementation.
- `tokens.css` is the unified source of truth — any new token the marketing site introduces should be added there alongside the workshop's.
- Rationale artboard explaining every choice, especially the signature and anything that differs from the workshop system.
- Source files we can hand to the implementation team.

## Process

- One round of designs, in full.
- One round of feedback from us.
- One revision pass.
- Handoff.

Same trust, same process as the workshop commission.

## One last thing

The marketing site's job is not to sell Cold Anvil. Its job is to make someone with an idea they can't stop thinking about feel seen — feel like someone finally built a thing that might let them get their idea out of their head and into the world — and type.

That's the brief.
