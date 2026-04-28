# Workshop App — Handoff to Claude Code

**Design package for Cold Anvil's Workshop product surface.**
Single HTML entry point: `index.html` (Vibe A · dark + serif).

---

## For the developer (read this first)

### What you're looking at
This bundle contains the **aspirational design direction** for the Cold Anvil
Workshop app — desktop and mobile. It supersedes the earlier
`design_handoff_annies_workshop` exploration. The HTML is a pan-and-zoom
canvas of artboards rendered with React + Babel inline — a **fidelity
vehicle**, not production code. Recreate these designs in the target codebase
(`Cold_Anvil/annie/`) using its established patterns.

Some screens show features that **don't exist yet** (notably the Vision tab
and the resizable live preview rail). These are aspirational — they represent
where the product is heading. The developer should build toward them
incrementally, not try to ship everything at once.

### Fidelity: **high-fidelity**
Every colour, font, weight, spacing, and copy line is intentional.

### How to start
1. Open `index.html` in a browser. Pan with trackpad, ⌘-scroll to zoom.
2. Read this README end to end.
3. Read `workshop-app.css` for the `.vA-*` scope.
4. `colors_and_type.css` defines the Bullfinch Forge palette and type stack.

### What's in this bundle

```
design_handoff_workshop_app/
├── README.md                    — this file
├── index.html                   — canvas entry point
├── colors_and_type.css          — design tokens (palette + type)
├── styles.css                   — base resets + token wiring
├── workshop-app.css             — .vA-* component scope
├── workshop-vision.css          — Vision tab styles
├── design-canvas.jsx            — pan/zoom canvas (NOT product code)
├── workshop-shared.jsx          — shared icons + conversation content
├── workshop-vA.jsx              — desktop screens (5 artboards)
├── workshop-vision.jsx          — Vision tab screen
├── workshop-mobA.jsx            — mobile screens (2 artboards)
└── fonts/                       — Newsreader + Inter variable TTFs
```

### Screens shown

**Desktop (1280×800):**
1. Mid-conversation
2. Plan stamped (accept / refuse)
3. Vision tab (product brief + vision summary rail) — **aspirational**
4. Live preview (build ledger + resizable rail) — **aspirational**
5. Projects (dashboard)

**Mobile (360×720):**
- Conversation
- Projects

---

## How this maps to Cold Anvil today

### Existing codebase (`Cold_Anvil/annie/src/`)

| This design | Existing code | Status |
|---|---|---|
| Top bar (Cold Anvil *Studios* + crumbs + Log out) | `AppHeader.tsx` + `Shell.tsx` header | **Partially exists.** Wordmark + Anvil glyph are there. Log out needs to move from UserMenu dropdown to a visible top-right button. |
| Sidebar nav (7 project tabs + Projects + Settings) | `Shell.tsx` sidebar | **Exists.** Already has the 7 sections: Conversation, Vision, Brand voice, Content, Architecture, Preview, History. Design adds project-name block at top + profile block at bottom. |
| Profile block (bottom-left of nav) | `UserMenu.tsx` (currently top-right dropdown) | **Needs relocation.** Move trigger from top-right to sidebar footer. Show avatar + name + studio. Gear icon links to a new profile page. |
| Conversation column | `ProjectConversation.tsx` | **Exists.** Heading style needs updating to Inter 600 (currently Newsreader). |
| Plan card (accept / refuse) | `StruckPlan.tsx` + `.wk-struck` | **Exists.** User-facing copy needs to say "Accept the plan" not "Strike it". Internal class names can stay. |
| Vision tab (product brief) | `ProjectVision.tsx` (currently a stub in `ProjectStub.tsx`) | **Aspirational.** Needs full implementation. See §Vision below. |
| Live preview rail | `ProjectPreview.tsx` + `Browser.tsx` | **Partially exists.** Current preview is a separate tab. Design shows it as a resizable side rail within the 3-column layout. |
| Vision preview rail | Does not exist | **Aspirational.** Right rail shows stylized vision summary when on the Vision tab. |
| Projects nav item | Not in sidebar currently | **Needs adding.** `Shell.tsx` sidebar should include a "Projects" link that navigates to `/` (the project list). This has been a missing back-navigation path. |
| Settings nav item | Not in sidebar currently | **Needs adding.** Links to a settings/billing page (exists as a concept in the design but not yet as a route). |
| Composer | `Composer.tsx` | **Exists.** No changes needed beyond the Vision-tab placeholder text. |
| Status footer | Does not exist | **Aspirational.** 32px footer showing bench status, plan version, project name. Low priority. |

### What to change now (quick wins)

1. **Top-right → Log out button.** In `Shell.tsx` header, replace the
   `UserMenu` avatar trigger with a ghost button: `<Button variant="ghost"
   size="sm" onClick={signOut}>Log out</Button>`. Log out destination:
   `https://app.coldanvil.com/signin`.

2. **Sidebar: add Projects + Settings.** Below the existing 7-section nav
   in `Shell.tsx`, add a "Studio" group with two items: Projects (navigates
   to `/`) and Settings (navigates to `/settings` — stub for now).

3. **Sidebar: project name block.** Above the 7-section nav, add a block
   showing the project name (serif, cream) with a glowing mustard dot
   indicating the project is active.

4. **Sidebar: profile block.** At the bottom of the sidebar, below the
   "Export project" section, add: avatar (28px) + user name (Inter 500) +
   studio/email (Inter 10.5px muted) + gear icon. Clicking navigates to
   a new `/profile` page (stub for now — design TBD).

5. **Conversation heading → Inter.** In `ProjectConversation.tsx`, the
   project-name heading in the main column should render in Inter 600
   (`.sans` class) not Newsreader. Newsreader stays for Annie's plan body,
   dashboard titles, and empty-state hero only.

6. **"Struck" → "Accept the plan."** Search for user-facing instances of
   "Strike" / "Struck" and replace: "Accept the plan · build now". The
   `StruckPlan` component name and `.wk-struck` class are internal and
   can stay.

### What to build next (aspirational)

#### Vision tab

The Vision tab is a **product brief** that Annie drafts based on the
conversation. It's structured like a strategic brief a product manager at
Google or Spotify might write — but Annie fills it in for the user, then
lets them review and push back on any part.

**Sections:** The bet · Who it's for · What good looks like · What we're
building · What we're NOT building · Open questions for you.

**Comment affordance:** Every paragraph has a `+` icon in the left gutter.
Hovering reveals it; clicking attaches that paragraph to the composer so
the user can tell Annie what's wrong. This is NOT limited to specific
"claim" phrases — the user can comment on ANY paragraph.

**? help icon:** Next to the "draft · v1" meta text, a `?` icon explains
what the vision doc is in plain language. Many users won't know what a
product brief is — the tooltip says: "Annie writes this brief based on
your conversation. Review it, click any paragraph to comment, and tell
her what she got wrong."

**Vision preview rail:** When on the Vision tab, the right rail shows a
stylized summary of the vision — key cards for each section (The bet,
Who it's for, etc.) rendered in italic serif. This gives the user a
high-level overview while reading the full doc in the main column.

**Fresh draft state:** The vision shown here is a first draft — Annie is
still writing. Some paragraphs may be dimmed (confirmation flow, lowest
priority). The banner says "Annie's draft — review and push back."

**Implementation note:** The existing `ProjectStub.tsx` stubs out the
Vision tab. Replace it with a real component. The vision content comes
from the extraction pipeline (already wired via `VisionCard` in
`ProjectConversation.tsx` and the `[[vision]]` marker parsing). The
full-page Vision view is the composed, formatted version of those
extracted fields.

#### Resizable live preview rail

The current preview lives on its own tab (`ProjectPreview.tsx`). The
design moves it to a **resizable right rail** within the 3-column layout
— visible alongside the conversation. The left sidebar should also be
**collapsible** (hideable) to give more room when the user wants to
focus on conversation + preview.

This is a layout-level change to `Shell.tsx`'s grid. The engineer should
decide on the resize implementation (CSS resize, drag handle, or a
toggle between fixed widths).

#### Crumb truncation

The breadcrumb in the top bar assumes a 1280px desktop minimum. What
happens with long project names below 1100px is the engineer's call —
`text-overflow: ellipsis` on the crumb `<b>` is the simplest approach.

---

## Decisions made

| Decision | Answer |
|---|---|
| Profile click target | Navigates to a new `/profile` page (doesn't exist yet — stub it) |
| Log out destination | `https://app.coldanvil.com/signin` |
| Crumb truncation | Engineer's call |
| "Struck" in user-facing copy | Forbidden. Use "accept" / "the plan" / "build" |
| Vision doc length | Two pages max — product brief, not a full PRD |
| Comment affordance | Any paragraph, not just "claim" phrases |
| Vision tab right rail | Stylized summary of the vision doc sections |
| Sidebar nav sections | Match today's codebase: Conversation, Vision, Brand voice, Content, Architecture, Preview, History + Projects and Settings under "Studio" |
| "All projects" back-link | Removed — redundant with Projects nav item |

---

## Token contract

All values resolve to CSS variables in `colors_and_type.css`.

### Colour — Bullfinch Forge (locked)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#32302f` | Page base |
| `--ink` | `#d4be9a` | Body text |
| `--ink-bright` | `#ebdbb2` | Elevated body |
| `--ink-muted` | `#a89984` | Secondary text |
| `--accent` | `#d8a65c` | Mustard — CTAs, brand moments |
| `--secondary` | `#8c945c` | Olive — dots, badges only |
| `--cream` | `#fbf1c7` | Cream contrast pocket |

App chrome uses `#2a2826` (main surface) and `#1c1a18` (deep panels).

### Type (locked)

- **Newsreader** — Annie's plan body, dashboard h1s, empty-state hero, vision rail italic text
- **Inter** — all UI chrome: wordmark, nav, buttons, conversation heading, paragraph body in the vision doc
- **JetBrains Mono** — stamps, labels, breadcrumbs, status footer

### Motion

| Token | Duration | Curve |
|---|---|---|
| arrive | 240ms | `cubic-bezier(0.2, 0.9, 0.25, 1)` |
| settle | 280ms | `cubic-bezier(0.2, 0.8, 0.2, 1)` |
| warm | 180ms | `cubic-bezier(0.2, 0.8, 0.2, 1)` |

---

## Architectural invariants

1. The conversation is load-bearing — never behind a tab on desktop.
2. The composer is always reachable at the bottom of the column.
3. No modals. Everything inlines into the conversation surface.
4. Italic is emphasis, not decoration.
5. The plan is singular — one pending plan at a time.
6. No emoji. The brand mark is the Anvil glyph.
7. User-facing copy never says "struck."

---

## Things to test before shipping

- "Cold Anvil *Studios*" renders in Inter with mustard "Studios"
- Conversation heading renders in Inter (not Newsreader)
- Plan CTA says "Accept the plan · build now"
- Top-right has Log out, not an avatar
- Bottom-left of nav has the profile block
- Sidebar has all 7 project sections + Projects + Settings
- Vision tab shows the product brief with `+` comment gutter
- Vision rail shows summary cards when on Vision tab

---

## Interview answers (2026-04-28)

After the bundle landed, Jack and Annie walked through the points where the design departed from what's shipped today, or from earlier locked decisions. The answers below override any conflicting guidance above.

| Question | Answer |
|---|---|
| Right rail purpose | **Stage-aware viewing pane.** Pre-build → vision summary / extraction state. Build → preview. Other tabs (Brand voice, Content, Architecture, History) default to preview for now; properly designed later. |
| Claim mechanism (the existing `[[claim]]…[[/claim]]` lift in conversation) | **Retired.** Replaced by user-driven gestures: per-paragraph `+` in conversation, free text selection in artefacts. Annie no longer marks load-bearing phrases. Reason: a load-bearing phrase to Annie isn't always one to the user — let the user choose what to push back on. |
| Vision page title | **"The brief"** (not "Product brief"). Same data shape as today (`extraction_state`); fuller presentation, gap-filled by Annie. Not a re-architecture. |
| "Studio" concept on profile block + Settings | **Removed for now.** Profile block shows name + email only. Multi-user / teams is a future vision. |
| /settings page scope | **Stub now.** Sidebar link lights up; page renders "Coming soon. Tier, billing, and studio settings will live here." Real settings page filed as a follow-up gated on billing integration. |
| Layout architecture | Top-static · left-collapsible-with-icon-rail · middle-scrolls-composer-glued · right-dynamic-independently-scrolls-collapsible. Styled scrollbars on theme. |
| BENCH OPEN eyebrow + ⌘K hint in composer | **Both dropped.** No command palette planned. |
| Status footer (the marketing-copy strip) | **Dropped.** That copy belongs on the marketing site, not the workshop. |
| Conversation messages | Discrete bubbles + avatars + timestamps. |
| Annie / user avatars (with the A-name clash worry) | Annie keeps her `a` letter; differentiated by colour: Annie = mustard (`--accent`), user = cream. Brand-coherent and reads at a glance. |
| Conversation H1 font | **Inter 600** (was Newsreader). Newsreader stays for the brief body, dashboard h1, empty-state hero, vision rail italic cards. |
| "Refuse — keep talking" plan CTA | **"Let's keep talking."** Pairs with "Accept the plan · build now". |
| Token vocabulary expansion | **Adopt as new BRAND.md canonical.** This is an evolution. `design-system/` and `annie/src/styles/tokens.css` reconcile underneath. |
| Comment unit — conversation | Per-paragraph `+` (gutter icon, hover-reveal). |
| Comment unit — artefacts (the brief, future docs) | **Free text selection** → "Comment" floating chip → attaches selected text to composer as `[Re the brief: "..."]`. |
| Brief section labels | Stay as written: *The bet · Who it's for · What good looks like · What we're building · What we're NOT building · Open questions for you.* |
| Right pane collapsed state (no icons to fall back to) | **Vertical spine** (32–40px) with rotated label (`PREVIEW ▸` / `THE BRIEF ▸`) and a chevron. Pulse dot rides the spine when there's live activity (build progress, extraction update). |

### Implementation plan

The full milestone breakdown lives at `~/.claude/plans/workshop-refresh.md`. Six milestones in dependency order:

1. **M0** — Adopt the new token vocabulary as BRAND.md canonical
2. **M1** — Four-region layout shell + collapse + resize + styled scrollbars
3. **M2 + M6** — Sidebar restructure + chrome moves + plan card copy (bundled)
4. **M3** — Conversation refresh: bubbles, avatars, timestamps, retire Claims
5. **M5** — Stage-aware right rail container
6. **M4** — The brief: full Vision tab + free-text-select-to-comment

Tracked in Linear under the project `Workshop refresh — design evolution`, in the `Cold Anvil pre-alpha readiness` initiative.
