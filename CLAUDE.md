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
- `Product_Specs/` — Feature specs, user journeys, requirements

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
cd Cold_Anvil && npx wrangler pages deploy site/ --project-name coldanvil --commit-dirty=true
```

Always commit and push to the Cold_Anvil repo before deploying.

### Key References

- `respec/03-spec.md` — **THE spec.** Load-bearing.
- `respec/01-journey.md` — retrospective on why the spec exists.
- `respec/02-product-state.md` — baseline at time of respec.
- `respec/04-consolidation.md` — record of what was archived and why.
- `Cold_Anvil/CLAUDE.md` — codebase-specific working rules.
- `Business_Plan/business_plan.md` — pricing, costs, go-to-market (still current).
- `BACKGROUND-AND-VISION.md` — origin story, The Forge lineage, long-term vision (still current).
- `Research/` — the learnings that shaped the respec; evidence only, not directives.
- `archive/2026-04-15-prerespec/` — superseded product docs. Historical context only.
