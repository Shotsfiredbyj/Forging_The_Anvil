# Where Cold Anvil Is Today, As a Product

*One page. Grounded in direct observation of recent cascade output. Written for someone deciding whether the promise is deliverable.*

---

## The scenario

A non-technical founder — the specific user the business plan and the vision doc both describe — arrives with a half-formed idea. What happens to them today?

**Honest answer: there is nowhere for them to arrive.**

The promised front door (`coldanvil.com` → Annie conversation → vision doc on a project page → tier upsells → deployed product) does not exist as a live user flow. The website at coldanvil.com is static marketing copy. The conversational step-3 architecture is designed, partially built, and has not been validated at fleet scale (`IMPLEMENTATION_STATUS.md:74` — "Pending fleet test"). The API service, the auth flow, the payment flow, the project-page renderer, the conversation-to-cascade handoff: none of these are in production. There is no door for the user to walk through.

What *does* exist is the cascade, runnable by me from the CLI. So the question is: if I pretend to be the user and run a cascade for them, what do they get?

## What I get when I run a cascade

I pulled three recent full-site cascades and opened them in a browser. Representative sample:

- `/tmp/coldanvil_incremental_u38c8kos/` — 7 HTML pages (index, about, docs, early-access, pricing, product), components/nav.html, components/footer.html, css/styles.css. Desktop + mobile + tablet screenshots for each. Generated today.
- `/tmp/coldanvil_incremental_1kfn87v8/` — same shape, earlier this week.
- `/tmp/coldanvil_incremental_dnjlu4z7/` — same shape, earlier this week.

All three are structurally similar. All three are broken in the same way.

**What a non-technical founder would see, page by page:**

| Page | What works | What's broken |
|---|---|---|
| `index.html` | Real hero copy, three problem/solution sections, stats (10x / 0 / 100% / ∞), two CTAs | No nav bar, no footer (both replaced by placeholder comments in the DOM). Body unstyled, white background instead of the dark theme specified in the design tokens. Dozens of `bg-bg-primary`, `flex`, `grid-cols-3` classes that resolve to nothing. |
| `pricing.html` | Three tier cards with copy + bullet features, CTA at bottom | Same nav/footer gap. Same undefined utility classes. Tier headings are valid but every pricing table element has unstyled layout. |
| `early-access.html` | A real form. Labeled inputs for name, email, role dropdown, use-case textarea. Terms text. Submit button. "What to Expect" section with three sub-headings. | Same nav/footer gap. Form inputs have visible borders by accident (browser defaults). Submit button points nowhere — no form action, no backend. The form cannot collect emails. |
| `about.html` | Mission statement, team section, roadmap with three phases | Rendered in a dark theme (the body tag CSS happened to take effect here even though the utility classes did nothing). Readable but visually inconsistent with index (which rendered light). Same nav/footer gap. |
| `components/nav.html` | Structurally valid nav fragment in isolation | Never inlined into any page. Exists on disk as an orphan. |
| `components/footer.html` | Structurally valid footer fragment in isolation | Same — orphan. Referenced on pages as `<div class="components/footer.html"></div>` (the file path stuffed into a CSS class attribute). |
| `css/styles.css` | 220 lines. Defines design tokens as `:root` CSS variables. Correct base typography and reset. | Does not define any of the dozens of utility class names the HTML files reference. Gap is ~40 undefined class tokens per page. Responsive media queries in older cascades use `@media (min-width: var(--breakpoint))` which silently fails because `var()` is invalid inside media feature conditions. |

**Overall user experience:** A page opens. Content is visible but unstyled. No navigation. No way to get from one page to another. No footer. The form on early-access captures nothing. The "deployed MVP" promise is not just undelivered — the deliverable doesn't run.

## What the founder walks away with

Nothing usable. If the cascade somehow completed end-to-end through a live service (which it doesn't, because the service isn't deployed), the founder would receive:

- A polished vision document. **This would actually be good.** Stages 1–4 produce readable, useful planning artefacts. The vision, roadmap, content, and technical blueprint are all human-legible and largely coherent at the planning level.
- A directory of HTML/CSS files that do not render as a website.
- No deployed URL. No hosted preview. No way to share "the thing I made with Cold Anvil" with anyone who isn't willing to open the files in a text editor.
- No portable asset handoff, because there's nothing worth being portable about.

## The tier-by-tier grade

Grading Cold Anvil *as a product* against its own business plan tiers, today:

- **Free (Vision).** *Would work if the service were live.* Stages 1–3 produce quality planning output. The conversational step 3 is not validated at fleet scale yet, so "would work" still needs a caveat, but the planning pipeline is real and the outputs are legible.
- **Tier 1 ($29/mo — Shape It: Vision + Roadmap + Content).** *Would work if the service were live.* Same caveat. Stages 1–3 are fit for purpose.
- **Tier 2 ($49/mo — Build It: + Tech Design + Code).** **Does not work.** The tech design (Stage 4) is legible but prescribes impossible contracts (see `01-journey.md` forensic section). The code (Stage 5) generated against that design is structurally broken. A founder paying $49/month would receive files that do not render. This is the promise-breaking tier.
- **Tier 3 ($200/mo — Ship It: + Assembly + Verification + Deployment).** **Does not exist.** There is no assembly stage, no deployment integration, no hosting partner, no URL handoff. The infrastructure that would make Tier 3 possible — scaffolded project templates, deployment pipelines, hosted previews — is unbuilt.

## The one-sentence product state

**The planning layer is a real product in search of an execution layer. The execution layer produces broken output and is not in front of a user.** The conversational differentiator Annie is supposed to provide exists on paper and in one partially-built module; it has not met a user.

## What this means for the respec

Two things are load-bearing in the spec that follows:

1. **The first thing a user must receive is something that works.** Not a grade. Not a report. Not a markdown file. A deployed URL pointing at a thing they can open in a browser and show to a friend. That constraint is a forcing function on every architectural decision downstream: if the architecture cannot produce a working URL, it is not the architecture.

2. **Annie must be a real collaborator in the build, not a persona on the marketing site.** The conversation that happens before the cascade is the easy half. The conversation that happens *during* and *after* the build — the one where a user says "the hero should be green" and sees the hero change — is the differentiator. Today there is no "during" or "after"; there is only "submit and wait". That has to change.

Everything else is implementation detail downstream of those two commitments.
