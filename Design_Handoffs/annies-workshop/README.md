# Annie's Workshop — Handoff to Claude Code

**Design package for Cold Anvil's Workshop surface.**
Single HTML entry point: `workshop/index.html`.

---

## For the developer (read this first)

### What you're looking at
The `workshop/` folder in this bundle contains **HTML design references** — a
pan-and-zoom canvas of artboards rendered with React + Babel inline. This is a
prototype showing the intended look, feel, motion, and copy. **It is not
production code to copy directly.**

Your job is to **recreate these designs in the target codebase's environment**
(React, Vue, SwiftUI, native, etc.) using its established patterns and
libraries. If Cold Anvil already has a Workshop implementation, match this
package's visual and interaction contract to whatever framework/library system
exists there. If there's no existing environment, pick the most appropriate
stack for the project and implement the designs in it.

### Fidelity: **high-fidelity**
Every colour, font, spacing, radius, motion duration, and piece of copy in the
canvas is final and intentional. Recreate pixel-perfectly using the codebase's
existing primitives. If the host codebase already has a Button, Input, or
similar, use those — but adopt the tokens, states, and behaviour from this
package.

### How to start
1. Open `workshop/index.html` in a browser (double-click works — it's
   self-contained, fonts are local).
2. Read `README.md` (the rest of this file) end to end.
3. Open the **Rationale** section of the canvas first — it explains every
   design choice in plain language. Then the **Structural component spec**
   (`workshop/sections/component-structural.jsx`) — it's the developer table:
   props, states, and tokens-read per component.
4. `workshop/tokens.css` is the single source of truth for colour, type,
   radii, and motion. Port it directly (or into whatever your target uses:
   Tailwind config, CSS modules, design tokens file, etc.) before building.

### What's in this bundle

```
design_handoff_annies_workshop/
├── README.md                           — this file
└── workshop/
    ├── index.html                      — canvas entry point (open this)
    ├── tokens.css                      — CSS custom properties, the source of truth
    ├── primitives.jsx                  — shared component primitives
    ├── design-canvas.jsx               — the canvas viewport itself (not product code)
    ├── fonts/                          — Inter + Newsreader variable fonts, local
    └── sections/
        ├── rationale.jsx               — design rationale, read first
        ├── typography.jsx              — three pairings (B is locked)
        ├── first-session.jsx           — 8 screens at 1440×900
        ├── ongoing.jsx                 — 5 return-user screens at 1440×900
        ├── states.jsx                  — 7 named states (empty, error, offline, etc.)
        ├── components.jsx              — visual component spec
        ├── component-structural.jsx    — props/states/tokens (the dev table)
        ├── motion.jsx                  — 5 motion tokens with curves
        ├── filmstrips.jsx              — 5 frame-by-frame interaction studies
        ├── tablet.jsx                  — tablet worked example + rules
        └── mobile.jsx                  — 11 mobile screens + edge states
```

### Things to preserve, non-negotiable
These are documented at length below; listing them here so they don't get lost.

- **The one-sentence plan is the signature moment.** See §6 invariant 5 and §9
  test 1. If this doesn't feel like placing a stamp, something regressed.
- **The composer send button uses `alignSelf: 'stretch'`, not fixed height.**
  See §5 and §9. We've already fixed this bug once.
- **No modals, ever.** All confirmations, errors, operator updates inline into
  the conversation. See §6 invariant 3.
- **Italic is emphasis, not decoration.** Two uses only: (a) the plan's
  noun-phrase, (b) a phrase under challenge. See §6 invariant 4.

### Brand / assets
- Typography is Newsreader (display) + Inter (body/UI) + JetBrains Mono
  (stamps). All shipped locally in `workshop/fonts/`. Use these or
  CDN-equivalents.
- The Cold Anvil mark (`ColdAnvilMark` component in `primitives.jsx`) is drawn
  inline as SVG. Port the SVG directly or replace with your codebase's brand
  asset if one exists.
- There are no external image assets in this bundle — everything is SVG,
  typography, or drawn chrome.

---

## Design specification

## 1. What this package is — and what it is not

Workshop is the product surface where a user arrives after describing what
they want on coldanvil.com — the conversation with Annie, the vision artefact,
the one-sentence plan, the live preview, the ledger of what's changed, and
the operator updates when Annie runs something on the user's behalf.

**This package is a design-pattern library presented as a working prototype.**
It is not a feature spec and it is not a codebase to fork.

Concretely, that distinction means:

- The **patterns** are normative. How a conversation line is rendered, how a
  plan is proposed and accepted, how a claim becomes challengeable, how the
  preview chrome looks, how a mobile tab bar replaces a sidebar, how motion
  distinguishes "arrive" from "settle" from "emerge" — these are the product.
- The **specific screens** are illustrative. The onboarding arc shown here is
  one plausible path; when you actually ship Workshop you will make different
  product calls at the scenario level (which flows exist, which empty states,
  which copy). What doesn't change is *how those flows look and feel* when you
  build them — that's what the patterns are for.
- The **React code** is a fidelity vehicle. Duplicated components inside
  section files let the canvas render standalone. Don't take the file layout as
  architectural guidance. Read `sections/component-structural.jsx` for the
  intended component API and `tokens.css` for the value contract.

Put another way: if a PM asks you to add a new screen that isn't in this
package, you should be able to build it from this package without asking
design for more input. If you can't, that's a gap — tell us.

---

## 2. What's in the package

Open `workshop/index.html`. You're looking at a **design canvas**: pan with the
trackpad, zoom with ⌘-scroll, click any artboard's header to open it fullscreen
(←/→/Esc to navigate or return).

Sections, in the order they appear:

1. **Rationale** — one long-form artboard explaining every choice, in plain
   language. Read it first.
2. **Typography** — three display pairings were explored; **pairing B (Newsreader
   + Inter)** is locked and stamped *locked · 23 apr*. A and C are shown
   dimmed as the alternates that were considered and not chosen. The rest of
   the package renders in B.
3. **First-session arc** — eight screens at 1440×900. Arrival → conversation
   → vision → plan → build-with-preview → refine → publish → deployed.
4. **Ongoing-relationship arc** — five screens at 1440×900. Project home,
   operator update, artefact view, ledger/history, brand voice.
5. **States library** — seven named states (empty, thinking, building, error,
   offline, publish, deployed), in Annie's voice.
6. **Component spec (visual)** — every atom rendered at every variant.
7. **Component spec (structural)** — props, states, and tokens-read table.
   This is what a developer reads to implement.
8. **Motion language** — five named tokens with durations, curves, and use-sites.
9. **Interaction filmstrips** — five frame-by-frame studies of the moments
   where the product lives or dies: Challenge, Point, Plan-accept,
   Operator, Resume.
10. **Responsive** — tablet worked example + breakpoint rules card; then all
    eleven screens at 390×844 plus an edge-states strip (offline queue,
    keyboard, deep link, safe-area).

---

## 3. File layout

```
workshop/
├── index.html                    — canvas entry point; wires sections
├── tokens.css                    — CSS custom properties (colour, type, motion)
├── primitives.jsx                — Icon, Chip, Shell, AnnieLine, UserLine,
│                                   Claim, StruckPlan, Browser, Phone, etc.
├── design-canvas.jsx             — <DCViewport>, <DCSection>, <DCArtboard>
├── fonts/                        — locally hosted (Inter, Newsreader,
│                                   JetBrains Mono, + A/C alternates for the
│                                   typography artboard only)
└── sections/
    ├── rationale.jsx             — 1. long-form design rationale
    ├── typography.jsx            — 2. three pairings (B locked, A+C alternates)
    ├── first-session.jsx         — 3. arc 1 (eight 1440×900 screens)
    ├── ongoing.jsx               — 4. arc 2 (five 1440×900 screens)
    ├── states.jsx                — 5. states library
    ├── components.jsx            — 6. visual component spec
    ├── component-structural.jsx  — 7. structural component spec
    ├── motion.jsx                — 8. motion language
    ├── filmstrips.jsx            — 9. five interaction filmstrips
    ├── tablet.jsx                — 10a. tablet worked example + rules card
    └── mobile.jsx                — 10b. 11 screens + edge-states strip
```

Load order: `tokens.css` → React/Babel → `primitives.jsx` →
`design-canvas.jsx` → each `sections/*.jsx` → canvas script in `index.html`.

**Note on naming.** The component that renders the one-sentence plan is
internally called `StruckPlan` and uses CSS class `.wk-struck`. This is a
legacy name from an earlier vocabulary round. The user-facing word is always
**"the plan"** (or "Annie's plan"). The internal names are fine to keep — they
don't bleed into product copy — but if you rename them in implementation,
`Plan` / `.wk-plan` is the obvious choice.

---

## 4. Tokens (source of truth)

Everything reads from CSS custom properties in `tokens.css`. The only place a
colour, font, radius, or motion curve is allowed to be hard-coded is inside
that file.

### Colour — the Bullfinch Forge palette, locked.

```css
--bg:             #32302f   /* page base (Bullfinch core) */
--bg-surface:     #3c3836   /* card surface */
--bg-elevated:    #4b4441   /* lifted elevation */
--ink:            #d4be9a   /* body on page bg — 7.27:1 AAA */
--ink-bright:     #ebdbb2   /* body on lifted surfaces — 9.57:1 AAA */
--ink-muted:      #a89984   /* captions, secondary text */
--ink-dim:        #928374   /* tertiary / mono stamps */
--ink-on-light:   #32302f   /* body on cream / mustard */
--accent:         #d8a65c   /* mustard — Cold Anvil signature */
--accent-on:      #32302f   /* text on accent */
--secondary:      #8c945c   /* olive — non-text dots only */
--border:         #928374   /* visible card border — 3.58:1 */
--border-subtle:  #4b4441   /* hairline / internal dividers */
--cream:          #fbf1c7   /* accepted-plan fill / cream pocket */
--mustard:        #d8a65c   /* alias of --accent */
```

**Rules:**
- Mustard is reserved for **moments**: the accepted plan, the live badge,
  the primary CTA, the caret. Never decorative.
- Olive is never text. It's only status dots and the occasional chip.
- Cream is the "this is real now" colour. It fills only plans that have been
  accepted.
- Body runs on `--ink` or `--ink-bright`. Nothing reads body copy on mustard.

### Typography — locked.

```css
--font-display:        "Newsreader"       /* display only */
--font-body:           "Inter"            /* UI 14/1.45 */
--font-body-paragraph: "Inter"            /* 16/1.62 */
--font-mono:           "JetBrains Mono"   /* stamps, code */
```

Pairing B was selected after the A/C exploration. The A (Plex Serif/Plex Sans)
and C (Fraunces/Source Serif 4) artboards are preserved in the canvas as
reference, not as options.

### Radii, spacing, limits.

- Base unit 4px. Use 4 / 8 / 12 / 16 / 24 / 32.
- Radii 4 / 6 / 10. Nothing has a radius greater than 10 except the pill
  mobile composer (22 = ½ × 44, by construction).
- Touch target floor 44×44.
- Paragraph width bounded 32ch ≤ w ≤ 72ch.

### Motion.

```
arrive   240ms  cubic-bezier(0.2, 0.9,  0.25, 1)   new line, operator return
settle   280ms  cubic-bezier(0.2, 0.8,  0.2,  1)   plan accept, claim update
warm     180ms  cubic-bezier(0.2, 0.8,  0.2,  1)   hover, focus
point    220ms  cubic-bezier(0.2, 0.8,  0.2,  1)   click-on-claim, click-on-preview
emerge   180ms  cubic-bezier(0.3, 0.0,  0.2,  1)   date stamp after a plan is accepted
```

**Never exceed 280ms for a single property animation.** Workshop is a place
where people think; long animations feel expensive.

---

## 5. Component contract (summary)

Full props / states / tokens table lives in
`sections/component-structural.jsx`. Quick reference:

| Component        | Class              | Key prop                        | Notes                                   |
|------------------|--------------------|----------------------------------|------------------------------------------|
| Shell            | `.wk-root`         | `project`, `section`             | Sidebar + header + main scaffold        |
| AnnieLine        | `.wk-annie-line`   | `mark: 'a' \| 'a.n' \| 'a.o'`    | `a.o` = operator mode                   |
| UserLine         | `.wk-user-line`    | —                                | 2px left rule, "you" kicker             |
| Claim            | `.wk-claim`        | `hot?`                           | Click-to-challenge phrase               |
| StruckPlan       | `.wk-struck`       | `pending?`, `stamp?`, `date?`    | One-sentence plan. Internal name only.  |
| Composer         | inline             | `value`, `placeholder`, `attach` | Persistent input, stretch-aligned       |
| Browser          | `.wk-browser`      | `url`, `state`, `height`         | Live preview chrome                     |
| Chip             | `.wk-chip`         | `accent?`, `live?`               | Status / tag                            |
| Button           | `.wk-btn`          | `variant`, `size`                | Primary = mustard                       |
| MobileTopBar     | inline             | `project`, `section`, `right?`   | Replaces sidebar on mobile              |
| MobileTabBar     | inline             | `active`                         | Talk · Vision · Preview · History       |
| MobileComposer   | inline             | `value`, `placeholder`, `attach` | Pill shape, 44px min                    |
| Phone            | inline             | `timeHint?`, `children`          | 390×844 content frame                   |

**Critical detail — composer alignment.** The send button is stretched
vertically to match the textbox (`alignSelf: 'stretch'`), **not** fixed-height.
If you hard-code a height, any change to body font-size breaks the alignment.
This is a mistake we already made once in this package and fixed.

---

## 6. Architectural invariants

These are not style guidelines; they are the product. Do not violate them
without going back to the design.

1. **The conversation is load-bearing.** Never below the fold, never behind a
   tab at desktop or tablet. On mobile, it is a top-level tab and the preview
   moves to its own tab.
2. **The composer is always reachable.** It sits at the bottom of whatever
   column the conversation is in. It never scrolls away.
3. **No modals.** Ever. Operator cards, claim challenges, confirmations, error
   messages all inline into the conversation.
4. **Italic is emphasis, not decoration.** The display face's italics are used
   for (a) Annie's quoted plan language and (b) the word or phrase under
   challenge. Nowhere else.
5. **The plan is singular.** Exactly one pending plan on screen at a time. It
   is the thing the user accepts. When it's accepted, its sentence, its
   mustard ring, and its date stamp are the commitment — no confetti, no
   banner, no dialog.
6. **The ledger is append-only.** Accept, refine, operator actions, and undos
   all go here. Nothing is deleted; undone plans are marked italic + muted.
7. **No hamburger for top-level nav on mobile.** Talk · Vision · Preview ·
   History earn permanent space in the tab bar.
8. **No carousels.** If something has multiple frames, it's a filmstrip (in the
   spec) or a scroll region (in the product), not a swiper.

---

## 7. Copy rules (§9 of the product spec)

Annie has a voice. It is not a chatbot voice.

- **First four words of any Annie turn are a claim**, not a greeting. No "I'd
  love to help," no "Let's dive in," no "Great question!"
- **Annie reads the user back to them before proposing anything.** "You said
  you want…" beats "Here's what I'll build."
- **Plans are sentences, not bullet lists.** The one-sentence plan is always a
  declarative sentence with the noun-phrase in italic.
- **Operator updates use a.o mark and past tense.** "I sent the email. It
  bounced. Here's what I did next."
- **Errors in Annie's voice, not the system's.** "I lost the connection" beats
  "Network error." "I'm rethinking that paragraph" beats "Regenerating…"
- **Never use product-marketing language inside the product.** No "AI-powered,"
  no "intelligent," no "seamless," no "journey."

---

## 8. Deliberately out of scope for this package

Design calls that are downstream of product calls, and therefore not made here.

- **Exact flow graph.** This package shows one coherent onboarding arc and one
  ongoing-relationship arc. Which scenarios ship first, which branches exist,
  which error paths are possible — product calls, not design calls.
- **Sidebar behaviour during window resize.** Two discrete states (full / rail)
  are shown; the transition curve is implementation.
- **Preview iframe sandbox policy.** Whatever lets Annie ship a form to a real
  inbox safely.
- **Operator asynchrony.** The design shows Annie returning with a result; the
  notification pattern (badge on tab? line in ledger? both?) is for the team to
  decide, using the operator-card and ledger-row patterns already defined.
- **Diff rendering inside the ledger.** "A → B" in mono is shown; whether that
  expands inline or opens the artefact view is an implementation detail.
- **Fonts in production.** Locally hosted in this package so the canvas renders
  offline; in production you may CDN them.

---

## 9. Things to test before shipping

These are the moments that, if they regress, break the product's character.

- **The one-sentence plan lands.** Settle motion (280ms), cream fill, date
  stamp emerges 180ms later. This is the signature moment of the product; it
  must feel like placing a stamp.
- **A Claim is challengeable.** Hovering warms the bar to 40% accent; clicking
  attaches it to the composer within 220ms. The whole phrase remains readable
  while interactive.
- **The composer send button matches the textbox height** in every state (with
  and without an attachment, one-line and multi-line). If they drift, the
  stretch alignment regressed. See §5 above.
- **Annie's "a" mark stays pinned to the margin** at every breakpoint. It does
  not wrap inside paragraphs.
- **The live badge in the Browser chrome pulses, doesn't blink.** It signals
  "we are live," not "something is wrong."
- **On mobile, the preview is a peer of the conversation**, not a subordinate.
  Its own tab; tapping inside the preview does not pop the conversation stack.

---

## 10. Things we'd ask product about

Not blockers for the patterns here — but the first team to implement Workshop
will need answers.

1. **Operator permissions surface.** When Annie says "I sent an email on your
   behalf," what does the user's control surface look like *before* that
   happens? This package assumes trust is established in onboarding. True for
   every class of action?
2. **Undo.** Users can walk back an accepted plan; the ledger shows it as
   italic + muted. Does the preview revert instantly, or does it require a
   "yes, really" confirmation inline?
3. **Multi-project home.** The ongoing-relationship arc shows one project
   open. The left-rail project switcher is sketched but not specified for 20+
   projects. Search? Folders? Recency only? This package says recency-only
   until we hear otherwise.
4. **Brand voice authoring.** The brand voice artefact is shown as an editable
   doc. Annie drafts it, user refines it — same pattern as every other
   artefact. If product wants the user to author from blank, that's a new
   pattern.

---

## 11. If something isn't answered here

The rationale artboard (section 1 of the canvas) is where every choice is
explained. If something is still unclear after reading that, the design is
wrong — flag it to us and we'll fix the canvas.
