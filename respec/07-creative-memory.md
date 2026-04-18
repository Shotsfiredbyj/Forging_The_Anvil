# Cold Anvil Creative Memory — How Annie Remembers What She's Making

*Companion to `03-spec.md`. The core spec describes what Annie delivers and how she builds. This describes the creative artefacts that are simultaneously the user's documentation of their product and Annie's memory substrate for every subsequent build call. Written 2026-04-17 after the Phase 0 PoC surfaced the gap.*

---

## 1. What it is

Cold Anvil produces four creative artefacts alongside the code of every project: a **vision document**, a **brand voice guide**, a **content strategy**, and a **site architecture**. They live inside the project — version-controlled, visible, exportable, owned by the user — and they feed every code-generation prompt Annie issues from the moment they exist.

**They are dual-purpose, equal status.**

- **For the user:** documentation of what they're building, how it sounds, who it's for, and what decisions got made. Readable, editable, exportable. Part of what they own.
- **For Annie:** persistent structured context injected into every subsequent code-gen prompt. Without it, the model falls back on training priors — generic SaaS copy, wrong library conventions, dissonant tone across pages. With it, generated code carries the user's voice consistently across every page, every refinement, every return visit.

Neither role is primary. The same document serves both.

*(Traceability: the Phase 0 PoC surfaced this gap. When a prompt hand-wrote a brand brief inline ("Slate Finance — plain-spoken, no jargon, specific banned phrases"), the model reproduced the positive examples almost verbatim and avoided the banned patterns. When the same model was asked to write database code on a different product domain without an anchor, it silently drifted to Drizzle ORM syntax — a library that isn't even installed — because its training prior for "bookmarks in a Next.js project" outweighed the explicit stack invariants. Without persistent, structured creative context in every prompt, the same failure mode applies to tone, voice, positioning, and content decisions across the whole project lifetime.)*

---

## 2. The four artefacts

| Artefact | File | What it contains | When it's first produced |
|---|---|---|---|
| **Vision** | `docs/vision.md` | Who this is for, what it solves, what "done" looks like for v1, what success means over time | End of discovery, before the first build |
| **Brand voice** | `docs/brand-voice.md` | Tone adjectives, audience register, positive and negative copy examples, forbidden phrases, voice-specific conventions | End of discovery, alongside vision |
| **Content strategy** | `docs/content-strategy.md` | Page inventory, what each page says, primary user actions, content hierarchy, any copy that's load-bearing (headlines, CTAs, empty states) | As the first build plan is formed |
| **Site architecture** | `docs/site-architecture.md` | Navigation shape, route structure, data model outline, critical flows | As the first build plan is formed |

Not every artefact exists from day one for every project. A new project starts with vision + brand voice; content strategy and site architecture accumulate as the first pages are built. All four are optional inputs to code-gen — empty means "no constraint from that axis," not "error."

Artefacts evolve. When the user returns in week three and says "the landing page feels too formal," Annie revises `brand-voice.md`, the user reads and agrees or edits, the new version gets committed, and every subsequent code-gen call uses the revised voice. The artefact history is the project's editorial history.

---

## 3. Where they live, how they're treated

**Visibly at the project root, in `docs/`.** Not hidden under `.annie/` or an equivalent dot-directory. A user opening their project in any text editor sees them as naturally as they see `package.json`. They are the first-class project record, not implementation detail.

**Version-controlled alongside the code.** When Annie revises the brand voice, the change is a real commit to the project's git history — traceable, reversible, blameable. The editorial decisions evolve as transparently as the code does.

**Markdown, structured but human-readable.** Each file has a predictable shape (headings for the sub-topics, bullet lists where structure helps, prose where narrative matters). Annie writes them and reads them. The user writes and reads them too. No bespoke format a human would struggle with; no YAML-heavy structure that reads like config.

**Included in every portable export (spec §7).** When a user downloads their project to take elsewhere, the `docs/` directory goes with the `src/` directory. Part of what they own. Not an afterthought they have to specifically request.

---

## 4. How they're produced and reviewed

The production loop for every artefact is the same:

1. **Annie drafts** the artefact from the conversation so far. She uses the existing conversation + extraction engines (`api/services/conversation.py`, `conversation_system.md`, `extraction_system.md`) plus the stage 1-3 generation prompts (`idea_refinement.md`, `copy_generation.md`, `site_architecture.md`, `tech_design.md`) — all of which are already built, tested, and were producing quality output before the respec.
2. **Eval-standalone rubrics quality-gate the draft.** `vision`, `copy_generation` v2, `creative_output` v2, `site_architecture` — the rubrics Cold Anvil has already authored and iterated on (`respec/05-eval-standalone.md` §"What's already built"). If a dimension scores below threshold, Annie rewrites with the reviewer's feedback before showing anything to the user.
3. **Annie shows the draft in conversation.** "Here's how I think your voice should sound — does this land?" The user reads, reacts, suggests edits. Annie revises in place. Loop continues until the user's reaction is "yes, this is right."
4. **The artefact commits to `docs/`.** Now it's part of the project. Now Annie uses it.
5. **Every subsequent code-gen call includes a slice of the relevant artefact(s) as the creative-brief block in the prompt.** Not the whole file every time — just the section that matters for the task.

This is exactly the mechanism of the old cascade's stages 1-3, preserved intact. What was wrong with stages 1-3 wasn't the mechanism; it was the *framing* — they produced terminal markdown deliverables that went nowhere, when they should have produced living project documents that feed the build forever after.

---

## 5. How Annie uses them

Every code-gen prompt Annie issues during a build or refinement carries three first-class context blocks:

1. **Stack invariants** — what the template is (Vite + React + shadcn/ui + Tailwind v3 + Hono + `better-sqlite3` per the `AI_RULES.md` shipped in the scaffold, committed 2026-04-18). Derived from the template itself, not project-specific.
2. **Project state** — current file tree plus the contents of files the generated code touches or depends on. Mechanical.
3. **Creative brief** — the relevant slice of vision + voice + content strategy + architecture for this specific task.

The third block is the missing one from the respec as originally written. It's the piece that makes a generated marketing page sound like the user's product instead of a generic SaaS page. It's the piece that makes the 50th page consistent with the first. It's the piece that catches drift before drift happens.

The slice is per-task. A prompt adding a pricing page pulls the pricing sections from content-strategy plus the whole brand voice. A prompt refactoring a data model pulls the data-model section of site-architecture and very little else. Annie decides the slice; the artefacts are structured enough that slicing is mechanical.

*(Traceability: spec §8 says every code-gen task gets "the user's explicit intent" as an input. This is what "explicit intent" means in practice — the stored, structured, editable artefacts that encode the user's creative decisions. Without them, "explicit intent" is whatever Annie can recall from the last few conversation turns — insufficient, inconsistent, and drift-prone.)*

---

## 6. How the user uses them

The user reads them, edits them, and shares them.

**Reading.** Opens `docs/vision.md` in any text editor or the conversation surface — it's a real document, written by Annie in the user's voice (not Annie's), describing what they're building. The user who opens Cold Anvil six months after publishing and wants to remember "what was I even trying to do with this" finds the answer there. Continuity isn't only "Annie remembers" — it's also "the project remembers."

**Editing.** The user who wants the brand voice adjusted edits `brand-voice.md` directly, or asks Annie to change it in conversation. Either path commits a new version. Every subsequent build uses the revision. No hidden state; no "but Annie would still use the old one."

**Sharing.** Users who work with others — a founder hiring a freelance designer, a nurse collaborating with a colleague, anyone showing a work-in-progress to a friend — share the creative artefacts as readily as they share the live URL. "Here's what it's for, here's how it sounds, here's the page plan. Here's the link to the preview." The artefacts close the loop between "here's my idea" and "here's why I'm building this this way," in documents the user didn't have to write themselves.

**Exporting.** Everything in `docs/` goes in the portable export (spec §7). A user who leaves Cold Anvil takes the thinking with them, not just the code. That's part of what makes the exit door meaningful — the user's project is not just a rendered artefact, it's a fully documented one.

---

## 7. What this changes in the core respec

No contradictions. Three sections of `03-spec.md` get extended rather than rewritten:

- **§3 (the experience Annie delivers):** the "vision a user can feel" is now a written document as well as a conversational beat. The user sees it, reacts to it, edits it, owns it. Same for the plan and the tone decisions that inform what gets built.
- **§5.8 (memory tool):** the memory substrate includes the creative artefacts, not just extraction state and conversation history. The existing memory tool is extended; no new tool is required.
- **§7 (portable export):** creative artefacts are listed alongside source code, configuration, and the README as part of every export. They were implicitly covered by "content" but deserve explicit naming.
- **§8 (build-time contract):** the code-gen task description is extended to include the creative-brief block as a first-class input, alongside project state and stack conventions.

These are small, surgical updates. The core respec's shape and commitments are unchanged.

---

## 8. What's already built vs what needs to be built

**Already built and tested:**

- The conversation + extraction engines (`api/services/conversation.py`, the existing prompts).
- The stage 1-3 generation prompts (`idea_refinement.md`, `copy_generation.md`, `roadmap_generation.md`, `site_architecture.md`, `tech_design.md`). These were producing quality creative output before the respec. They do not need redesigning — they need rewiring.
- The eval layer's rubrics. Two are v2 with observable anchors: `copy_generation` v2 (gates content-strategy) and `creative_output` v2 (gates brand-voice). Two are v1 taste-based but demonstrably functional: `idea_refinement` v1 (gates vision) and `site_architecture` v1 (gates site-architecture). **Rubric posture (calibrated 2026-04-17):** all four v1/v2 rubrics ship as-is into `builder/creative.py`'s eval-gate. Evidence for v1 sufficiency: a historical Stage 1 vision output in `Cold_Anvil/forge/benchmarks/cached_stages_strong.json` scored 9-10 across every v1 `idea_refinement` dimension and the output is genuinely good (specific pain, named persona, observable success criteria). Earlier concerns that v1 rubrics had "failed" were traced to unrelated code-stage bugs and a gate-enforcement wiring bug, neither of which reflects on v1 creative-rubric quality. Upgrade to v2 happens only if a specific rubric is observed to pass bad output or reject good output in production.
- The reviewer prompts with adversarial framing, chain-of-thought, evidence-required grading.

**Needs to be built (Phase 1):**

- A `builder/creative.py` module that: drafts each artefact from conversation state, runs eval-gate, drives the Annie↔user review loop, persists to `docs/`, versions changes, serves slices to the code-gen prompt assembler.
- An extension to `builder/scaffold.py` that creates `docs/` at project init with placeholder READMEs explaining what each file is for.
- A `creative_context` parameter in `builder/codegen.py` — not optional in the API, even if the value is empty for a fresh project. Every code-gen prompt receives a (possibly empty) creative-brief block.
- An update to the code-gen prompt template to include the creative-brief block as a first-class section, labelled clearly.
- A UI surface (conversational and/or on the project page) showing the artefacts — reading, editing, history.

**Needs to be decided before Phase 1 begins:**

- ~~Slicing heuristics~~ — **resolved 2026-04-17, see §10 below.**
- ~~Artefact presentation format~~ — **resolved 2026-04-17, see §11 below.**

---

## 9. Traceability

- **The Phase 0 PoC of 2026-04-17** generated a mortgage calculator with hand-written Slate Finance brand brief embedded in the prompt. The model reproduced the positive voice examples verbatim and avoided the banned phrases entirely. The tone landed because the instructions were concrete and structured. This is the mechanism this document generalises — make that brand brief a persistent artefact, populated automatically, used on every prompt.
- **The same PoC** produced Drizzle ORM query-builder syntax on the two swap-vehicle tests where database code was called for — despite stack invariants, a worked example, and a positive anchor all specifying raw `better-sqlite3`. Training priors beat weak context. The same failure mode applies to tone, voice, page flow, data-model decisions without persistent, structured, explicit creative context in every prompt.
- **GitHobbit.com** (per Jack 2026-04-17) was produced using stages 1-3 of the old cascade. The copy was the product; the site was scaffolding around it. Jack's point: the new spec should not accidentally retire the capability that made GitHobbit work. It doesn't have to — stages 1-3's mechanism is preserved; this file describes how it's wired for continuous use rather than one-shot delivery.
- **Jack's correction 2026-04-17** — *"They're both for the build and for the user"* — is the framing this document carries. Not "primary memory substrate, secondary user artefact." Both, equal status. Captured in Arnor memory as `cold_anvil_creative_artefacts_as_memory_substrate`.
- **`respec/05-eval-standalone.md`** already establishes the eval layer as a sibling product. This document is the third leg: creative artefacts as the connective tissue between the discovery conversation (front door), the build (code-gen tool), the eval layer (quality), and the user's ongoing relationship with their project.

---

## 10. Slicing heuristics (calibrated 2026-04-17)

Every code-gen prompt carries stack invariants + project state. The creative-brief block is additive — Annie pulls the slices that prevent drift and skips the rest. Pasting all four artefacts into every prompt would overwhelm the model and dilute the bits that matter; slicing is how she stays focused without losing voice.

Slicing is mechanical, not a model decision. `builder/creative.py` exposes `slice(task_type)` which returns the brief block using the table below.

### The table

| Task type | Vision | Brand voice | Content strategy | Site architecture |
|---|---|---|---|---|
| Landing / marketing page | 1-para "who + what + why" | **Full** (tone, positive/negative examples, forbidden phrases) | Full section for that page | Nav summary |
| Feature / product page (pricing, about, features) | 1-para | **Full** | Full section for that page | Where it sits in nav |
| Interactive component (form, calculator, composer) | 1-para (for labels/microcopy) | Tone adjectives + forbidden phrases (compact form) | Page section if embedded | — |
| List / index page (reads DB, renders rows) | — | Tone adjectives + empty-state copy rules | Empty states + page purpose | Route + data model section |
| API route (POST handler, server logic) | — | **Tone adjectives + error-copy examples + explicit clarity-first override** (see rule 6 below) | Error-message copy if user-facing | Data model section |
| Dynamic route `/[slug]/page.tsx` | — | Tone adjectives | Content hierarchy for that entity type | Route structure + data model |
| Schema / data model (DDL, migration) | — | — | — | Data model section only |
| Nav / layout / shared UI | 1-para | Tone adjectives + forbidden phrases | Nav labels + CTA microcopy | Full nav + route structure |
| **Empty state / error / 404** | — | **Full voice** — these are the pages where voice lands or dies | Empty-state + error copy rules | — |

### The rules behind the table

1. **Vision is for orientation, not output.** A 1-paragraph "who + what + why" is enough to anchor microcopy decisions. Never paste the full vision doc into a prompt.
2. **Brand voice scales with copy density.** Landing and marketing pages, empty states, and user-facing error messages get the full voice doc. Pure logic (schemas) gets nothing. List pages get a compact version because their empty states are the copy hotspot.
3. **Content strategy is per-page.** Only the section for the page being built. Never the whole content strategy.
4. **Site architecture is structural.** Data-model section for anything DB-adjacent. Route structure for navigation or slug routes. Almost nothing for pure presentational work.
5. **Empty means empty, not fallback.** A fresh project with no voice doc sends an empty creative-brief block. Annie does not paper over with training priors.
6. **Clarity-first override on error copy and form validation.** When brand voice and clarity conflict in a user-facing error message, clarity wins. "Invalid email" can become "That email doesn't look right — mind double-checking?" in a warm voice, but it cannot become cryptic, evasive, or so over-styled that the user doesn't know what went wrong. The prompt instruction is literal: *"Use the brand voice, but never sacrifice clarity. If voice and clarity conflict, clarity wins."*
7. **Slicing is mechanical.** Task type → fixed slice. Not a model decision, not a per-project bespoke rule. The artefact headings are structured enough that section extraction is deterministic.

### Calibration notes

- **Empty states get the full voice** (not a subset) because they are the moments where product personality lands or dies. A ghost-town "No data" vs "No bookings yet — want to add your first tutor?" is the difference between a product that feels alive and one that feels abandoned.
- **API error messages carry voice** because every error surfaces to the user, and the clarity-first override (rule 6) keeps them usable. This is a departure from the initial draft, which left API routes untouched.
- **Schemas stay untouched by voice.** Column names and table shapes are structural; trying to flow tone through DDL creates friction without benefit. A `tutors` table is a `tutors` table regardless of voice.

---

## 11. Presentation format (calibrated 2026-04-17)

**The project is the unit** (per `03-spec.md` §5 closing). A user has one or more projects; every project bundles code, creative docs, conversation history, build history, and deployment state as different faces of the same thing. The creative artefacts are not a standalone surface — they are one face of the project the user navigates into. When the user clicks into a project they see tabs or panels for preview, code, docs, deploy, history; the docs area is where the four artefacts live.

Regardless of UI surface, the artefacts live on disk in the project's `docs/` directory from day one. They commit to git. They export with the project. They feed every code-gen call. The question in this section is purely the *UI layer* within the project view — how the user sees, reads, and edits them inside Cold Anvil itself.

The path has three stages. Each stage is additive to the previous — we ship the lower-cost option first and grow it.

### Stage B — first slice (Phase 1 / Phase 2 MVP)

**Inline in chat + "Docs" panel within the project view.** Annie drafts each artefact in the conversation flow (per §4 of this doc); the user reads it in the chat scrollback and reacts there. The current committed version of each doc is also pinned in a side panel or collapsible drawer alongside the project's preview and deploy controls — click to read the full version. Revisions happen by talking to Annie ("the voice feels too formal"), which triggers a new conversation turn and a new commit.

- **What's built:** a panel/drawer listing the four artefacts with read-only markdown rendering. Click → full content. No direct edit.
- **Why this first:** zero blocker to Phase 1/2 shipping. The docs story is complete on the product side (they exist, they're used, they export); the UI just hasn't caught up yet.

### Stage C — Phase 2+ polish

**"Docs" tab within the project view, with inline markdown editor.** Same project view, docs promoted from a drawer to a full tab next to preview and deploy. All four artefacts visible. User can either ask Annie to revise *or* edit the markdown directly. Every save is a new commit.

- **What's built:** a docs tab with a simple markdown editor (textarea + preview, no rich editor needed at first), save-as-commit, load current version.
- **Why it comes later:** real frontend work (editor component, routing for the tab, save/load flow). Justified once users have been through a build cycle and want to tweak their own voice without talking to Annie.

### Stage D — once the product has traction

**Editorial history + diff view.** Stage C plus: per-doc version history, a diff view between versions, "restore this version." Closes the loop on the respec's promise that *"the artefact history is the project's editorial history."*

- **Why it comes last:** justifies itself when we have real users who've built real products and come back in week 3 wanting to revise. Premature before that.

### The principle

The disk representation is the source of truth at every stage. The UI is the *window* onto that source of truth. We can grow the window without ever having to migrate data or change what Phase 1/2 ships. Annie always reads from disk; the user always edits what ends up on disk. The progression B → C → D is purely about how much UI surface we put around that.

---

## 12. Where projects live (calibrated 2026-04-17)

Because the project is the unit (`03-spec.md` §5), the storage question is not "where do the docs go" but "where does a project live." Docs, code, conversation history, and build state all ride inside whatever the project's storage story is.

### What the deployed public URL is (and isn't)

When Annie publishes a project to `{project}.coldanvil.com` via `fly deploy`, only the built Vite SPA bundle (`dist/`), the Hono server, and their runtime dependencies get shipped to the Fly.io app. `docs/` is markdown in the project root; Vite does not route or bundle it; the Dockerfile's `COPY` instructions do not reference it; Fly's build step does not include it. **The user's creative docs are never publicly served on their live site.** This is a property of the deploy step that we verify explicitly in `builder/deploy.py` (`.flyignore` lists `docs/`) rather than relying on the framework by accident.

### Where projects live on Cold Anvil's infrastructure

Three realistic options. Only option A is built at MVP.

- **Option A — persistent volume on Annie's host (MVP).** A single directory per user per project, e.g. `/var/coldanvil/projects/{user_id}/{project_id}/`. The project's `src/`, `docs/`, `package.json`, `node_modules/`, build artefacts — all live here. Annie reads and writes directly. Between sessions the directory persists on disk; when the user returns, Annie opens the same path. Scales to hundreds of concurrent projects on a single machine; beyond that, shard by user-id. Matches what the Phase 0 PoC already does with `/data/coldanvil/poc_results/` on elostirion.
- **Option B — object storage with local scratch (scale-out, post-MVP).** Idle projects archived to R2 or S3. When the user returns, Annie pulls the archive to a scratch directory, works in it, pushes changes back on idle. More moving parts; justified only when concurrent project count exceeds what one host can hold.
- **Option C — git-backed (post-MVP, pairs with Stage D history UI).** Each project is a bare git repo on our infrastructure. Every change — creative revision, code edit, refinement — is a real commit. This gives us Stage D's version history and diff view for free (`§11 Stage D`). Upgrade path from option A: `git init` each existing project directory and start committing.

### Decision

- **MVP: Option A.** Persistent volume per project, single machine (elostirion during active development / a small managed host once we're live). Enough for the first ten users, enough for coldanvil.com's first months. Cheap, simple, easy to reason about. Note: this is Annie's *working directory* for projects-under-construction, distinct from Fly.io which hosts the *published* version of each project once the user hits publish.
- **Upgrade path: A → C, when Stage D ships.** Option C gives the history UI for free and is strictly additive — option A's filesystem layout becomes each repo's working copy. No data migration, just `git init` per project and commit going forward.
- **Option B is not on the path.** If horizontal scale becomes a real constraint before the next stack expansion, we revisit. Until then, the operational simplicity of one machine wins.

### What this means for Phase 1

- `builder/scaffold.py` scaffolds into `/var/coldanvil/projects/{user_id}/{project_id}/` (configurable via env var; PoC path stays for research only).
- `builder/deploy.py` explicitly excludes `docs/` from the Fly.io deploy bundle as belt-and-braces (belt: Vite doesn't bundle non-imported markdown; braces: we still verify via `.flyignore` or equivalent).
- No git operations in Phase 1. The project is a plain directory. Git arrives with Stage D.

---

## 13. Design system — the fifth artefact (added 2026-04-18)

*Added after Phase 3.2 shipped and Claude Design (Anthropic Labs, released 2026-04-17) surfaced a cleaner pattern for visual identity capture than the status quo. See Arnor memory entries for the decision chain.*

The four original artefacts (vision, brand voice, content strategy, site architecture) cover what the product *says* and how it's *structured*. They leave visual identity — palette, typography, density — to shadcn/ui defaults. That means every Cold Anvil project ships looking identical: the same slate palette, the same sans-serif, the same spacing. Shippable, but the user feels like they got a template rather than something theirs.

A **fifth artefact** fills the gap.

### Boundary — user projects vs. Cold Anvil's own brand

The fifth artefact (`docs/design.md`) is for the **user's project**. It is distinct from `Cold_Anvil/BRAND.md`, which governs **Cold Anvil's own surfaces** (coldanvil.com marketing, the Annie chat UI, studio identity, sub-brand shells). BRAND.md's Bullfinch Forge palette + Newsreader/Inter typography + outlined-card system applies to Cold Anvil as a business. User projects never inherit it by default — they pick from a separate preset library. If a user *wants* to mirror the Cold Anvil house look that's a user choice they make by picking the relevant preset, not the default. Decision confirmed 2026-04-18; design presets must not blur this boundary.

### Artefact shape

| Artefact | File | What it contains | When it's first produced |
|---|---|---|---|
| **Design** | `docs/design.md` | Palette tokens (primary / accent / surface / border / text on each surface), type pair (heading + body), base size + scale ratio, density (spacing scale baseline + component density — compact / standard / spacious), design-specific voice notes (button-weight conventions, icon style, photography vs. illustration leaning) | End of discovery, alongside brand voice — before the first build |

### MVP production: curated presets

Rather than Annie drafting bespoke design systems from scratch (too high-variance for MVP model capability), Cold Anvil ships with **~6 curated preset design systems**. The user picks one during discovery; the scaffold copies the preset to `docs/design.md`; from that point on it behaves like any other creative artefact — sliced into every codegen brief, editable in place, version-controlled.

Preset count + aesthetic direction is a taste call (named presets + vibes TBD). Stored at `Cold_Anvil/templates/design-presets/{slug}.md`, each a full `design.md` the user's project can inherit.

### Stage 2: Annie-generated contextual knobs

Post-Phase-4, once the conversation bridge is wired, Annie can generate **2–3 project-specific design knobs** (not a universal slider panel) that adjust `docs/design.md` in place. For one project the knobs might be "warm vs. cool" and "minimal vs. decorative"; for another, "rigorous vs. playful" and "dense vs. airy." The controls themselves are personalised — same pattern Claude Design surfaced.

### Slicing rules

Design brief is included in every visual-output codegen brief (landing, feature, list, nav-layout, empty-state, interactive component). It's omitted from API-route and schema tasks (design has no relevance there). Slicing grain is coarse for MVP — the whole `docs/design.md` gets inlined — until we learn which sections matter most per task_type.

### Scope boundaries for the first ship

- **In:** palette + type + density + voice-notes text, applied as a single brief block.
- **Not in (MVP):** generated component variants, icon library selection, motion language, asset-generation (logos, illustrations).
- **Not in (ever, probably):** user-uploaded brand assets / design token imports from Figma. If users want bespoke assets they bring files to their own Fly deploy.

---

*End of addendum. The core `03-spec.md` remains authoritative for who Cold Anvil is for and what Annie delivers. This document specifies how creative decisions persist, are reviewed, are used, and are owned — as both the memory substrate for every subsequent build and the user's living documentation of their work.*
