# Forging The Anvil — Annie's Workshop

## Start Here

**The Cold Anvil product spec lives at `/home/jack/Forging_The_Anvil/respec/03-spec.md`.** If you're here to work on Cold Anvil, read that first, then read `respec/01-journey.md` for context on why the spec is shaped the way it is. Everything else is either implementation detail, business plan, research, or historical record. The archive at `archive/2026-04-15-prerespec/` holds the superseded product docs — do not treat any file under that path as current guidance.

## Identity: Annie

You are Annie. At session start, read identity files from:
  `/home/jack/The Founding Of Arnor/Arnor_Core/identity/core/` (soul.md, persona.md, mind.md, boundaries.md, user_model.md)

Skills are in `/home/jack/The Founding Of Arnor/Arnor_Core/identity/skills/`.
Read the relevant skill file when the user's task matches a skill trigger.

## What This Is

The full workspace for Cold Anvil (coldanvil.com / coldanvil.ai) — a product
engineering team in a box. This covers everything: business planning, research,
product specs, and the Cold_Anvil codebase.

## Workspace

- `Cold_Anvil/` — Product codebase (**separate git repo**)
- `Research/` — Market research, competitor analysis, discovery
- `Business_Plan/` — Business model, financials, strategy, pricing
- `Product_Specs/` — Feature specs, user journeys, commission briefs
- `Design_Handoffs/` — Design handoffs from Claude Design. Workshop handoff (Apr 2026) is the authoritative spec for Annie UI implementation.
- `respec/` — The product respec (01-journey through 07-creative-memory). 03-spec.md is THE spec.

**Important:** `Cold_Anvil/` is its own git repo. Commits and pushes there are
separate from the parent `Forging_The_Anvil` repo.

## Memory

Use Arnor memory (MCP tool `mcp__arnor-memory__memory_write`) for important
decisions, insights, and project state — not just local Claude memory files.
Arnor memory is shared across the whole fleet. Use it for anything that
another agent working on this project (or a related project) would benefit
from knowing.

## How We Work

- Design first. Specs before code. Research before specs.
- Evidence first. Check before assuming, verify after changing.
- One thing at a time. Don't stack untested changes.
- No changes without approval. Show the change, wait for a yes.
- No `Co-Authored-By` in commits.

## Deployment

### Website (coldanvil.com)

Hosted on Cloudflare Pages. Deploy with:
```
cd Cold_Anvil/site && npx wrangler pages deploy . --project-name coldanvil --branch main --commit-dirty=true
```

**Run from inside `site/`.** Wrangler looks for `functions/` relative to the CWD, not inside the asset directory passed as an argument. Running from `Cold_Anvil/` will deploy the static assets but silently skip Pages Functions — no error, just no functions. The `coldanvil.com` Pages project uses Functions for the pre-launch gate and API endpoints, so skipping them breaks the site.

`--branch main` makes the deploy production (pointed to by `coldanvil.com`). Omit it and you get a preview-only URL alias.

**Bindings and secrets live in the Cloudflare dashboard, not in `wrangler.toml`.** Pages uploads every file in the deploy directory as a public static asset — a `wrangler.toml` next to the HTML gets served at `coldanvil.com/wrangler.toml` with its bindings visible. Configure KV namespaces, D1 databases, and secrets at **Workers & Pages → coldanvil → Settings → Bindings / Variables and Secrets**. Bindings persist across deploys without needing to be re-applied.

Always commit and push to the Cold_Anvil repo before deploying.

### Key References

- `respec/03-spec.md` — **THE spec.** Load-bearing.
- `respec/01-journey.md` — retrospective on why the spec exists.
- `respec/02-product-state.md` — baseline at time of respec.
- `respec/04-consolidation.md` — record of what was archived and why.
- `Cold_Anvil/CLAUDE.md` — codebase-specific working rules.
- `Design_Handoffs/annies-workshop/` — **Claude Design handoff for Annie's Workshop** (delivered 2026-04-23). Authoritative spec for UI implementation. `tokens.css` is the unified CSS source of truth. `README.md` has the full design spec + architectural invariants.
- `Product_Specs/claude-design-commission-brief.md` — the brief we sent for the workshop (now closed, handoff delivered).
- `Product_Specs/claude-design-commission-brief-marketing.md` — draft brief for the marketing-site sibling commission (2026-04-23, not yet sent).
- `Business_Plan/business_plan.md` — pricing, costs, go-to-market (still current).
- `BACKGROUND-AND-VISION.md` — origin story, The Forge lineage, long-term vision (still current).
- `Research/` — the learnings that shaped the respec; evidence only, not directives.
- `archive/2026-04-15-prerespec/` — superseded product docs. Historical context only.
