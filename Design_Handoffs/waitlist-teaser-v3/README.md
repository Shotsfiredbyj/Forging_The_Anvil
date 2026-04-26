# Handoff: Waitlist Holding Page (WorkshopTeaser refresh · COL-74)

## Overview
A pre-launch holding page for **Cold Anvil Studios — Annie's workshop**. The page does two jobs: announce that Annie (the studio's product engineer) opens soon, and collect emails for the waitlist. The right side of the hero is a "peek" — an oversized, chrome-less slice of Annie's actual product UI showing a real working session on a sample project ("Book club"), so visitors see what they're signing up to without it feeling like a screenshot.

Single canonical layout, two breakpoints: desktop (1280×780) and mobile (390×780).

## About the Design Files
The files in this bundle are **design references created in HTML/JSX** — prototypes showing the intended look, layout, and copy. They are not production code to copy directly. The task is to **recreate these designs in the target codebase's existing environment** (the live Annie product is React/Vite — see `Cold_Anvil/annie/`), using its established components and patterns where they exist.

In particular, the peek on the right side of the hero should be assembled from the **real product primitives** that already exist in the app — `ProjectShell`, the sidebar nav rail, the project header, `AnnieLine`, `UserLine`, etc. The JSX in `components/teaser-shared.jsx` is a static reproduction of these for design fidelity; in production it should reuse the actual components in their static (non-interactive) state. This is the entire reason the design works — if the primitives diverge from what the live product actually renders, the peek becomes a marketing screenshot and breaks the brief.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, copy, and the layout system are all locked. Recreate pixel-perfectly using Bullfinch Forge tokens (in `tokens.css`) and the existing Newsreader + Inter font stack. The only design call left to the developer is whether to render the peek using the real product components (preferred) or the static stand-ins in this bundle (acceptable for v1 if the product surface is moving fast).

## Screens / Views

### 1. Desktop hero (1280×780+)

**Purpose.** Announce + collect email + offer a peek into the product.

**Layout.**
- Full-bleed page on `--ca-bg0s` (`#32302f`) with a subtle warm gradient wash (two soft radial gradients — see `page-shell-v3.jsx`).
- Single relative-positioned stage. The **letter (left)** is normal flow inside a 540px max-width column, vertically centered. The **peek (right)** is an absolutely-positioned overlay sitting on a lower z-index than the letter — it bleeds off the right edge of the page and fades in from the left.
- 100px top padding · 44px horizontal padding · 64px bottom padding.
- Wordmark absolutely positioned top-left at `top:30 left:44` (z-index 5).
- Footer absolutely positioned along the bottom edge (z-index 5, `--ca-bg0s` background to ensure it sits above the peek's bleed).

**Letter column (left, z-index 4):**
- Eyebrow: `A peek inside the workshop` — Inter 11px / 500 / uppercase / `0.22em` tracking / `--accent`.
- H1: `Annie's workshop opens *soon*.` — Newsreader 68px / 500 / 1.02 line-height / `-0.025em` tracking / `--cream`. The word `soon` is wrapped in `<em>` and rendered italic in `--accent`. Max-width 14ch with `text-wrap: balance`.
- Tagline: `Product development, for anyone with an idea.` — Newsreader 19px / 400 (regular, **not** italic) / 1.42 / `--ink-bright`. Max-width 32ch. 20px top margin.
- Lead: `Annie is our product engineer. She builds the thing you've been meaning to build — clickable by the end of the day. We're putting the finishing touches to her workshop.` — Inter 15px / 1.65 / `--ink`. Max-width 46ch. 20px top margin.
- Email form (28px top margin, max-width 460): a single inline row with 1px `--border-subtle` outline, 8px radius, `--bg-elevated` field on the left and a flush `--accent` button (`Get on the list`) on the right. Field: Inter 14px placeholder `you@example.com` in `--ink-muted`. Button: Inter 13px / 500 in `--accent-on`.
- Reassurance: `When Annie's ready, you'll be one of the first to meet her. No newsletters. No noise.` — Inter 12px / `--ink-muted`. 12px top margin.

**Peek column (right, z-index 2 — sits *behind* the letter):**
- Absolutely positioned: `top:0 bottom:0 left:620 right:-180`. The peek is wider than its slot — `right:-180` bleeds 180px past the page edge.
- Inside it, an inner box `width:100% height:600 position:relative` carries a **horizontal-only** mask:
  - `mask-image: linear-gradient(to right, transparent 0, #000 140px, #000 calc(100% - 100px), transparent 100%)`
  - No vertical mask — the peek runs edge-to-edge top and bottom; only the left and right edges fade.
- Content: a full slice of Annie's product UI — sidebar (200px) + main column. See "Peek content" below.
- Wrapper has `pointer-events: none` (the peek is decorative; clicks fall through to the letter).

**Wordmark (top-left).**
- Anchor styled as flex row · gap 10 · `--cream` text · Newsreader 17 / 500.
- Anvil glyph (SVG) at 20px in `--accent`, then `Cold Anvil` followed by `Studios` (regular, smaller — 13px / 400 / `--ink-muted`).

**Footer.**
- Absolutely positioned `bottom:0 left:44 right:44` with `padding: 16px 0 18px`.
- 1px `--border-subtle` top rule. `--ca-bg0s` background to mask the bleeding peek.
- Three flex spans, space-between: `Cold Anvil. An idea is enough.` / `Engineered by AI, imagined by humans.` / `© 2026 Cold Anvil Studios`. All Inter 11 / `--ink-muted` (regular — italic was deliberately culled per design review).

### 2. Mobile hero (390×780+)

**Purpose.** Same job, vertical stack.

**Layout.**
- Single column, scrolling. 60px top padding, 24px horizontal, 24px bottom.
- Wordmark, eyebrow, headline (40px Newsreader · `soon` italic in `--accent`), tagline (16px Newsreader regular), lead (14px Inter), email field + button stacked vertically (full-width, 12px padding, 6px radius), reassurance microcopy.
- The peek sits below the form with **32px top margin**. It uses `margin-right: -24` (pulled into the page's gutter) and a horizontal mask `linear-gradient(to right, #000 0, #000 calc(100% - 60px), transparent 100%)` so the right edge fades into the page.
- Inner peek frame: `--ca-bg1` background, 1px `--border` outline (no right border — it bleeds), `border-radius: 6px 0 0 6px`, soft drop shadow `0 14px 28px rgba(0,0,0,0.32)`, min-height 360.
- The peek shows the **product header strip** (`Book club / Conversation`, preview-running pill, Open site button) and a 3-line conversation. Sidebar is omitted on mobile — the header alone is enough chrome.

## Peek content (shared between desktop and mobile)

The peek is a static reproduction of Annie's project shell rendered with `ProjectSidebar` + `ProductHeader` + a conversation column.

**Sidebar (desktop only — 200px wide):**
- 1px `--border-subtle` right rule.
- Brand block (48px tall, aligned to header height): anvil glyph + `Cold Anvil Studios` (Studios in `--ink-muted` regular) + `α` alpha pill (Inter 8.5px / 500 / `0.18em` tracking / 1px `--accent` border, 2px radius).
- Project block: `PROJECT` kicker (Inter 9.5 / `0.18em` tracking / `--ink-muted`) → `Book club` (Newsreader 15 / 500 / `--cream`) → `book-club.coldanvil.com` (JetBrains Mono 10 / `--ink-dim`).
- Nav rail — seven items, vertical stack with 1px gaps: `Conversation` (active), `Vision`, `Brand voice`, `Content`, `Architecture`, `Preview`, `History`.
  - Active state: `background: color-mix(in oklab, var(--accent) 9%, transparent)` · 2px left border in `--accent` · `--cream` text · Inter 12.5 / 500.
  - Inactive: `--ink-muted` · 400 weight · transparent left border.
- Footer block: gradient hairline divider, then `Your workshop / Take it with you anytime.` and an outlined `Export project` button (1px `--border-subtle`, 4px radius, Inter 10.5 with a small download glyph).

**Product header strip (44px tall on desktop, 48px on mobile):**
- 1px `--border-subtle` bottom rule. Three columns: project breadcrumb / spacer / right-side controls.
- Left: `Book club / Conversation` — Inter 12 / `--ink-muted`, with `Conversation` in `--cream`. The `/` is `--ink-dim`.
- Right: `preview running` chip (1px `--secondary` border, 10px radius, 5px green dot + `preview running` label in Inter 10 / 500) + `Open site` outlined button (1px `--border`, 5px radius, globe glyph + label in Inter 11 / 500 / `--ink-bright`).

**Conversation column:**
- 26px top + 36px horizontal padding (desktop) / 18px (mobile). Flex column, gap 18px desktop / 14px mobile.
- `AnnieLine` — 24px circular avatar with 1px `--accent` border and an italic Newsreader `a` in the centre. Body: Inter 15 / 1.62 / `--ink-bright`. Italic only on emphasised words (Newsreader italic, `--cream`, 500).
- `UserLine` — 16px left padding, 2px `--ink-dim` left border, `YOU` kicker (Inter 9.5 / `0.22em` tracking / `--ink-dim` / 500), then body in Inter 15 / 1.58 / `--ink`.
- `DraftPlanCardV3` — outlined card sitting at the foot of the thread with a single mustard accent.
  - 1px `--border-subtle` outline · 1px `--accent` top border · 4px radius.
  - Background: `color-mix(in oklab, var(--ca-bg1) 60%, var(--ca-bg0s))`.
  - Margin: `margin-left: 38` (aligns the card body to the AnnieLine text column) · `margin-right: 12`.
  - Header row: `LANDING PAGE · DRAFT` kicker + 5px mustard dot · `v1 · 4 sections` mono stamp pushed right (JetBrains Mono 9 / `0.08em` / `--ink-dim`).
  - Title: `"Host a book club worth showing up to."` — Newsreader 18 / 1.36 / regular weight, with the quoted phrase in italic / 500 / `--cream`. Subtitle: `Pitch hosts on the curation, not the platform.`
  - Sub-step list — 4 items, each a row with a 10×10 outlined square (1px `--border`, 2px radius) + Inter 13 / `--ink` label:
    1. `Hero — the pitch, one host's photo, "start a club" CTA`
    2. `How it works — pick book, invite 8, £4/mo per member`
    3. `Two host stories — Anya's sci-fi club, Jamal's biographies`
    4. `Pricing — host free, members pay; you keep 80%`

**Conversation copy (desktop):**
1. **Annie** — `Before I build anything — who is this *actually* for? "Book club" is wide. Tell me who you're picturing.`
2. **You** — `Friends-of-friends groups, 8–12 people. Someone hosts, picks a book, the rest pay £4/month to be in. I want hosts to feel like curators, not admins.`
3. **Annie** — `Got it. Then the landing page sells *becoming a host*, not joining a club. Different page entirely.`
4. **DraftPlanCard** (see above).
5. **Annie** — `Two things I'd push back on before we ship — want them now or after the first build?`

**Conversation copy (mobile — abbreviated to fit):**
1. **Annie** — `Before I build anything — who is this *actually* for?`
2. **You** — `Friends-of-friends groups, 8–12 people. Host picks the book, members pay £4/month.`
3. **Annie** — `Then the page sells becoming a host, not joining a club.`

## Interactions & Behavior

- **Email form** — submitting POSTs the email to whatever waitlist endpoint the existing app uses (Loops / Resend / a Postgres `waitlist_emails` table — match the live stack). On success, swap the form for a single line: `You're on the list. We'll be in touch.` Error states: invalid email → inline 12px error in `--ca-red` below the form; server error → same line in `--ca-red` reading `Something broke on our end. Try again in a minute.` On submit, briefly disable the button and swap label to `Adding…`.
- **Peek** — entirely non-interactive. `pointer-events: none` on the peek wrapper. It is a still, not a prototype. Do not wire any of the sidebar nav items, the `Open site` button, or the conversation lines.
- **No animations** in v1. The page renders as a single still on load. No fade-ins, no marquee, no animated typing in the peek — those would all undermine the "calm, almost open" register the brief asks for.
- **No hover states** on the peek (nothing is interactive). Hover states on the form: button darkens 4% in oklab; field outline becomes `--accent` at 1px on focus.

### Responsive behavior

- ≥ **1100px** — desktop layout as described.
- **640–1099px** — same letter column, but the peek's `left` shifts to `max(620, 50%)` and its right bleed shrinks to `-80`; the headline scales to clamp(48px, 6vw, 68px). At this width the peek will start to crop the conversation; that's acceptable — the bleed is the point.
- **< 640px** — mobile layout. The absolutely-positioned peek is replaced by the inline-mobile peek block described above.

## State Management

Minimal. Single component-local state for the form:

```ts
type FormState = 'idle' | 'submitting' | 'success' | 'error';
const [state, setState] = useState<FormState>('idle');
const [email, setEmail] = useState('');
const [errorMessage, setErrorMessage] = useState<string | null>(null);
```

No global state, no router, no data fetching beyond the form POST. The peek is fully static.

## Design Tokens

All defined in `tokens.css` (copied into this bundle). Use the semantic tokens, not the raw `--ca-*` values, in component code.

**Colors used on this page:**
- `--bg` / `--ca-bg0s` `#32302f` — page background.
- `--bg-surface` / `--ca-bg1` `#3c3836` — peek surface.
- `--bg-elevated` / `--ca-bg2` `#4b4441` — form field background.
- `--ink` `#d4be9a` — body text on dark.
- `--ink-bright` / `--ca-fg1` `#ebdbb2` — body on lifted surfaces.
- `--ink-muted` / `--ca-gray-light` `#a89984` — captions, secondary copy, footer.
- `--ink-dim` / `--ca-gray` `#928374` — mono labels, dividers.
- `--cream` / `--ca-fg0` `#fbf1c7` — headline, project name, "Conversation" active label, italic emphasis pull.
- `--accent` / `--ca-mustard` `#d8a65c` — eyebrow, `soon`, button, alpha pill, sidebar active border, draft card top rule, draft card mustard dot.
- `--accent-on` `#32302f` — text on `--accent`.
- `--secondary` / `--ca-olive` `#8c945c` — `preview running` chip border + dot.
- `--border` / `--border-subtle` — see `tokens.css`.

**Typography.**
- `--font-display` — Newsreader (variable, weights 200–800, italic axis). Self-hosted. Used: H1, taglines, project name, AnnieLine body, draft card title, italic emphasis.
- `--font-body` — Inter (variable, weights 100–900, italic axis). Self-hosted. Used: lead, microcopy, kicker labels, button, nav rail, draft card sub-steps, footer.
- `--font-mono` — JetBrains Mono (Google Fonts). Used: URL string in sidebar, `v1 · 4 sections` stamp.

**Spacing.** No formal scale used here — values are explicit pixel offsets per component. If your codebase has an existing spacing scale (4px base or similar), normalize on the way in.

**Italic budget.** Italic is *emphasis only*. The page has exactly two italic moments: `*soon*` in the H1 and the quoted `"Host a book club worth showing up to."` in the draft card. The tagline, footer slogans, "Studios" wordmark, and reassurance line are deliberately regular. Resist the urge to italicise more — it was the single biggest issue called out in design review.

**Mustard footprint.** Mustard appears outside the peek (eyebrow, `soon`, button) and inside the peek (avatar circles, sidebar active tab tint, draft card top rule, draft card dot, alpha pill). That's the budget — anything more dilutes the accent.

## Assets

- **Anvil glyph** — SVG, defined inline in `components/teaser-shared.jsx` as `AnvilMark`. Two paths, 256×256 viewBox. Use `currentColor` so it inherits from the parent. No external file.
- **Annie "a" tile** — outlined circle with an italic Newsreader `a`, defined inline as `AnnieMark`. No external file.
- **Globe / refresh / download / external-link icons** — small inline SVGs in `teaser-shared.jsx`. Replace with your icon library if you have one (Lucide / Heroicons stroke 1.5 will match — they're the same visual register).
- **Fonts** — Newsreader and Inter variable TTFs are expected at `fonts/` relative to `tokens.css`. They're not included in this bundle; copy them from the live `Cold_Anvil/annie/public/fonts/` (or wherever they currently live in the codebase). JetBrains Mono is loaded from Google Fonts.

## Files

In this bundle:

- `Waitlist Teaser Refresh.html` — the canvas / preview shell. Not for production; it's a `DesignCanvas` wrapper.
- `tokens.css` — the full Bullfinch Forge token set + font-face declarations. **Use this, do not redefine.**
- `components/teaser-shared.jsx` — the static peek primitives: `AnvilMark`, `AnnieMark`, `AnnieLine`, `UserLine`, `Browser` (unused in v3 — keep for reference), `ProjectSidebar`, `ProductHeader`. In production, replace these with the live product's components.
- `components/page-shell-v3.jsx` — `WaitlistPageV3` (the full hero) + `BleedPeek` (the absolutely-positioned overlay wrapper that does the bleed/fade).
- `components/path-a-v3.jsx` — `PathATeaserV3` (the conversation column composition) + `DraftPlanCardV3`.
- `components/mobile-v3.jsx` — `WaitlistMobileV3` (the mobile variant).
- `design-canvas.jsx` — design-tool wrapper, do not include in production.

## Definition of done

- Letter renders identically on desktop and mobile (typography, copy, form, microcopy).
- Peek shows on desktop, bleeds 180px past the right edge, fades on both horizontal edges, runs full-bleed top-to-bottom.
- Peek shows on mobile, bleeds into the right gutter, omits the sidebar.
- Peek is non-interactive (`pointer-events: none`).
- Form submission persists an email to the waitlist store and renders the success line.
- Italic is limited to the two moments listed.
- Mustard is limited to the elements listed under "Mustard footprint."
- No browser chrome, no traffic-light dots, no URL pill anywhere on the page.
- No top/bottom fades on the desktop peek — only horizontal.
