# Cold Anvil — Marketing design handoff

This is the design package for the Cold Anvil **marketing** site — the sibling to Annie's Workshop. It refreshes the three pages currently deployed at **coldanvil.com** (plus adds the waitlist passphrase gate already live there).

**Audience:** Claude Code, implementing into `Cold_Anvil/site/`.

---

## 1. What's in this folder

```
handoff_marketing/
├── README.md              ← you are here
├── index.html             ← design canvas entry point (open to view)
├── design-canvas.jsx      ← canvas starter component (pan/zoom, focus mode)
├── primitives.jsx         ← workshop-inherited atoms (wk-btn, wk-field, etc.)
├── mk-primitives.jsx      ← marketing-only atoms (MkNav, MkEyebrow, MkFooter…)
├── tokens.css             ← CSS custom properties — the source of truth for colors, type, spacing
├── fonts/                 ← Inter + Newsreader TTFs (already in the live site at /fonts/)
└── sections/
    ├── _stubs.jsx         ← tiny placeholder components
    ├── rationale.jsx      ← the four rationale cards (read these first)
    ├── signature.jsx      ← "Live Hand" signature moment artboards
    ├── home.jsx           ← Home C (canonical) + mobile + retired A/B
    ├── about.jsx          ← About (refresh of live /workshop/about.html)
    ├── pricing.jsx        ← Pricing A (canonical) + retired B
    ├── waitlist.jsx       ← Holding page (refresh of live /index.html)
    ├── handoff.jsx        ← marketing→workshop crossing, filmstrip
    ├── states.jsx         ← waitlist success/error, 404, handoff-loading
    ├── components.jsx     ← component inventory
    ├── motion.jsx         ← motion gestures
    └── mobile.jsx         ← mobile variants
```

**To view the canvas:** open `index.html` in a browser (or through the project preview). Each section has one or more artboards. Canonical artboards are labeled "canonical". Retired variants are kept in the "Archive" section at the bottom for reference.

---

## 2. Read these first (30 seconds each)

1. `sections/rationale.jsx` — four cards that explain the whole package: the signature moment, the pages + rhythm, continuity with the workshop. **If you only read one file, read this.**
2. This README, sections 3–5.

---

## 3. The canonical artboards — what to build

These are the designs to implement. Ignore everything in the "Archive" section of the canvas unless you specifically want to understand why C was chosen over A/B.

| Page              | Component        | Artboard label                    | File                      |
| ----------------- | ---------------- | --------------------------------- | ------------------------- |
| **Home**          | `MkHomeC`        | Home · 1440 desktop (canonical)   | `sections/home.jsx`       |
| Home (mobile)     | `MkHomeCMobile`  | Home · 390px mobile               | `sections/home.jsx`       |
| **About**         | `MkAbout`        | About · 1440 desktop              | `sections/about.jsx`      |
| **Pricing**       | `MkPricingA`     | Pricing · 1440 desktop            | `sections/pricing.jsx`    |
| **Waitlist**      | `MkWaitlistC`    | Waitlist · 1440 desktop           | `sections/waitlist.jsx`   |
| Waitlist (mobile) | `MkWaitlistMobile` | Waitlist · 390px mobile         | `sections/waitlist.jsx`   |

The signature moment on Home (the "Live Hand" composer in the hero) has its own dedicated rationale artboards under the "Signature" section — read those to understand why the composer is positioned where it is.

---

## 4. What's changing vs. the currently deployed site

The live site at coldanvil.com already has a strong editorial voice. This refresh **preserves the information architecture and 95% of the copy** and upgrades the rhythm, typography, and signature moments. Section-by-section:

### Home (`/workshop/index.html`)
- **Big change:** the hero now carries a **Live Hand composer** — Annie actually replies to cold visitor input on the page. This is the signature moment. See `sections/signature.jsx` for the reasoning.
- **Big change:** an **ambient replay tape** below the hero — a documentary strip of one real project being built, meant to scroll by quietly. See the Home C artboard for the exact composition.
- Contained cream and mustard pockets replace the full-bleed manifesto spread.
- Sticky "Talk to Annie" pill appears on scroll past the hero.
- Existing section order mostly preserved; the "three pillars" block is now presented as a pocket rather than a loose grid.

### About (`/workshop/about.html`)
- **Same section shape** as today: Hero → The story → Sister products → Three commitments → Cream "Who this is for" pocket → Final CTA.
- **Only real change:** the cream "Who this is for" section is now a **contained pocket** (card with padding), not a full-bleed spread. This matches the rhythm established on Home C.
- Typography: display italic for emphasis, MkClaim underlines on the claims that matter. Body is Inter, display is Newsreader.
- Copy is preserved verbatim where possible. The only line I'd flag as a copy-polish candidate: the final CTA headline ("Bring an idea. See what comes out.") now uses an italic emphasis on "comes out" — tweak if that feels too casual.

### Pricing (`/workshop/pricing.html`)
- Not covered in this handoff iteration — the canvas shows Pricing A as canonical but the live pricing page has a different tier structure than what's in the canvas. **Before implementing Pricing, loop back with the design team** to resolve tier names, numbers, and copy. The artboard is a layout reference only; all strings labeled "Tier 0/1/2/3" are placeholders.

### Waitlist / holding page (`/index.html`)

**⚠ Scope is styling only. Keep the content exactly as deployed today.** The goal of this refresh is visual — tokens, type, rhythm, the workshop teaser treatment — **not copy, not structure, not behaviour**.

- **All strings stay as they are on the live site.** Headline, eyebrow, tagline, lead, reassurance line, success message, error message, footer — do not swap any of them for the strings shown in the `MkWaitlistC` / `MkWaitlistMobile` artboards. Wherever the canvas copy differs from the deployed copy, **the deployed copy wins**. The canvas strings exist only to keep the layout honest.
- **Section shape is identical to today:** wordmark → eyebrow → headline → tagline → lead → email form → reassurance → workshop teaser (rotated, bleeding off the right edge on desktop; upright below the form on mobile) → footer.
- **What actually changes:** the tokens / type / spacing / button treatment / form treatment / teaser rendering. Apply the `mk-*` / `wk-*` styles from this package; don't touch the content.
- **The workshop teaser** is now rendered from React instead of an iframe'd mount. It shows: browser chrome with `annie.coldanvil.com`, a sidebar ("Copper Kettle" project), a short conversation with Annie, and a dashed "plan" stamp. See the `WorkshopTeaser` component in `sections/waitlist.jsx` — **this same component is also used on the home page's ambient strip**, so implement it once and reuse.
- **Keep the existing passphrase gate** (`↑↑↓↓` unlock → `/api/unlock` → `/workshop/`). Not shown in the design because it's a pre-launch mechanic.
- **Keep the existing `/api/subscribe` endpoint** wiring.

---

## 5. Visual principles (the short version)

These are the rules the canvas follows. Break them only deliberately.

1. **Two-tone warm dark.** `--ca-bg0s` (deepest) for the canvas ground. `--ca-bg1` for raised surfaces. Cream (`--cream`) and mustard (`--accent`) for pockets of warmth — used **contained**, never full-bleed.
2. **Display = Newsreader, Body = Inter.** Display is italic-forward — use `<em>` with the accent color for emphasis in headlines. Body is upright Inter, size 15–17, line-height ~1.65.
3. **Editorial eyebrows.** Every section starts with a numbered eyebrow (`MkEyebrow num="03"`). Uppercase, letter-spaced, accent color. The number is part of the rhythm, not decoration — it signals "this is a new movement".
4. **Contained pockets, not full-bleed takeovers.** The cream "Who this is for" on About and the mustard signature moments are contained cards with 56–80px of padding *inside* the normal max-width. The deployed About page has a full-bleed cream spread; that's the one thing being changed structurally.
5. **MkClaim underlines.** Use `<MkClaim>…</MkClaim>` to wrap the **one claim per paragraph** that matters most. It draws a thin accent-colored underline. Don't underline more than 1 per paragraph or the rhythm dies.
6. **Rules between movements.** Thin `--border-subtle` horizontal rules separate major sections. Use them like `<hr>` — breathing room, not decoration.
7. **Type scale is compressed.** Headlines are 40–92px depending on hierarchy. Section H2s sit around 44–56. Body copy never goes below 15. Avoid 24/28/32 — those are the awkward in-betweens.
8. **No icons unless they mean something.** The only iconography on the site is the anvil wordmark. Don't add decorative icons to trust rows, feature lists, etc. — the live site gets this right; keep it that way.
9. **Buttons:** `wk-btn--primary` for the accent/mustard primary; `wk-btn` (ghost) for secondary. Sizes: sm (12px padding), md (14–16px padding). No outline or link-styled tertiary buttons.
10. **Forms:** rounded-8 bordered row with an input and a primary button attached edge-to-edge. See the waitlist form for the canonical treatment.

---

## 6. Tokens you'll use most

From `tokens.css`:

```
--ca-bg0s       /* deepest bg — page ground */
--ca-bg1        /* raised surfaces (sidebar, cards) */
--cream         /* display/heading color on dark; pocket background on light */
--ink           /* body text on dark */
--ink-bright    /* slightly brighter body, for leads */
--ink-muted     /* captions, eyebrows' second half */
--accent        /* mustard — primary CTA, emphasis em, MkClaim underline */
--secondary     /* sage — rarely used; live indicators */
--border-subtle /* hairline rules and borders */

--font-display-b /* Newsreader — h1/h2/h3 + italic emphasis */
--font-body-b    /* Inter — all body */
--font-mono      /* url bars, plan stamps */
```

**Do not invent new colors.** If you need a variant, use `color-mix()` in oklch, and name it in `tokens.css` if you use it more than once.

---

## 7. Component inventory

Use the `sections/components.jsx` artboard as a picklist. Every marketing-only component that's not already in the workshop is shown there with its origin (INHERITED / NEW) and where it's used.

Inherited atoms (from the workshop handoff) live in `primitives.jsx` and use the `wk-` prefix. Marketing-only atoms live in `mk-primitives.jsx` and use the `mk-` prefix. The split is intentional — don't collapse them.

---

## 8. Motion

See `sections/motion.jsx` artboard. Five gestures are inherited from the workshop (arrive, settle, warm, point, emerge) and one new one is added for marketing: **draw** — the scroll-in of the editorial rules between sections, 320ms, ease-out-expo, triggered when a rule enters the viewport.

Implement motion last, and only if the page already feels good statically. Do not add motion to elements that aren't called out in `motion.jsx`.

---

## 9. States

See `sections/states.jsx` artboard. Four states that carry weight pre-launch:

1. **Waitlist success** — replaces the form in-place (already in live code; just match the new treatment).
2. **Waitlist error** — inline under the input.
3. **404** — warm dark page, wordmark, one sentence, link home.
4. **Handoff-loading** — the crossing overlay between "submit idea" and the workshop taking over.

---

## 10. Out of scope / TBD

- **Pricing copy.** Tier names ("Tier 0/1/2/3") and prices are placeholders.
- **Imagery.** Sister-products cards (Fourth Age, Celyn) show no logos or thumbnails. Add once we have marks.
- **Analytics / SEO / OG tags.** Keep the existing meta/OG from the live site.
- **Cookie/consent banner.** Not in the design. Add only if legally required.

---

## 11. Questions for design

If something is ambiguous, these are the people to ask and the channels:

- **Copy changes** (anything beyond preservation of existing strings) → design approval before shipping.
- **New tier structure on Pricing** → blocked on design decision; don't implement until resolved.
- **The sticky "Talk to Annie" pill trigger point** → see Home C artboard; fine-tune against real scroll behavior.

Everything else: build it as drawn.
