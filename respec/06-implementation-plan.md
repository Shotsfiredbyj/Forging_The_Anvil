# Cold Anvil Implementation Plan

*Written by Annie, April 2026. For the engineer who starts building tomorrow.*

**Status as of 2026-04-18:** Phase 0, Phase 0.5, Phase 1 + 2 core, Phase 3.1 (preview), **and Phase 3.2 (orchestrator)** are COMPLETE. First full end-to-end build proven on elostirion against the real Gateway — 3-step plan, 217s, public URL served a real 3-page React SPA with a working API. Primary model Qwen3.6-35B-A3B-FP8. Detailed state in `Cold_Anvil/BUILDING.md`. Companion document `respec/07-creative-memory.md` adds `builder/creative.py` and a first-class creative-brief input to every code-gen call. Read `Cold_Anvil/BUILDING.md` and `respec/07-creative-memory.md` before opening any code. **Next up: Annie-driven planning (option B) or Phase 4 conversation bridge.**

---

## 1. What we keep

The codebase has four groups of code. Here is the disposition of each.

**Keep and extend (load-bearing, tested, directly serves the new spec):**

- `api/services/conversation.py`, `conversation_phases.py`, `context_assembly.py`, `extraction_parser.py`, `model_client.py` — The streaming conversation engine with parallel extraction, phase state machine, evidence-checked field capture. This IS the front door of the new Annie experience. The extraction schema (problem/customer/alternatives/solution/differentiation/success_criteria) maps directly to what Annie needs before she starts building. The `model_client.py` Gateway adapter (streaming + non-streaming completions via `/v1/chat/completions`) is the communication layer Annie uses for everything.
- `api/routes/conversation.py` — WebSocket idea conversation endpoint. The `handle_idea_message` -> `extraction_update` -> `conversation_complete` flow is the skeleton of Annie's discovery conversation. The `confirm_generation` handler needs to trigger the new build flow instead of the old cascade, but the framing is correct.
- `forge/prompts/conversation_system.md`, `extraction_system.md` — Annie's voice and the extraction model instructions. Both need only minor updates (remove references to "vision document generation" as the terminal event; extend to cover the transition into the build phase).
- `pipeline/adapters/web.py`, `python_adapter.py`, `typescript_adapter.py`, `go_adapter.py`, `rust_adapter.py` — Five execution verification adapters. At MVP we use only the web/TypeScript adapter (Next.js is TypeScript), but the adapter interface (`VerifyAdapter.verify()` -> `VerificationResult`) and the shared types (`Finding`, `VerificationResult`, `AssembledProject` in `verify_types.py`) are the verification contract for the new build loop.
- `pipeline/gateway_client.py` — HTTP transport for Gateway communication. `_request()`, `submit_batch()`, `poll_run()`, `fetch_outputs()`. Synchronous, stdlib-only, battle-tested. The new build loop will call Gateway differently (single-task completions, not batch submissions), but the transport and polling primitives are reusable.
- `api/` app factory, auth (OTP + JWT), project model, database models, Alembic migrations — All stays. Email + OTP auth matches the spec exactly. The `Project` model needs new columns but the foundation is sound.
- `site/` — coldanvil.com static site on Cloudflare Pages. Stays as is for now.
- `Cold_Anvil/templates/nextjs-mvp/` — **SUPERSEDED 2026-04-18 by stack change**. Retained in-tree for reference only during the Phase 0.5 transition; scheduled for removal once `templates/vite-hono-mvp/` lands and the PoC re-run confirms PROCEED on the new stack.
- `Cold_Anvil/scripts/poc_codegen.py` + `Cold_Anvil/scripts/poc_prompts/0{1..5}-*.md` — research infrastructure, not product code. Kept as the reference for Phase 1 scaffold/codegen patterns (parallel Gateway fan-out, sequential local builds, source-copytree + hard-link node_modules, signal-driven pre-warm, retry-with-stderr). To be archived or deleted once `builder/` lifts what it needs.

**Keep as reference, substantially rework:**

- `pipeline/cascade.py` — The 5-stage orchestrator. The sequential pattern is not how Annie works in the new spec (Annie's build is conversation-driven, not a fixed pipeline), but the variable-resolution logic, Gateway submission/polling, and run logging are reusable pieces. Parts donor, not transplant.
- `pipeline/iterative.py` — Layer-by-layer generation with sibling context and per-layer verification. The concept of "generate one thing, verify it, then generate the next thing with the first as context" is exactly what Annie's code-gen tool needs. Coupled to the old batch model; needs rewrite as single-file tool calls, but sibling context extraction and incremental verification are directly reusable.
- `pipeline/verify.py` — Verification orchestrator. Cross-file rules (undefined CSS classes, file-path-as-class, placeholder content) transfer directly. Needs to become a `verify_project()` call against the live project directory.

**Archive (superseded, kept for reference only):**

- `pipeline/benchmark.py` — Grid testing harness. Development-time tool.
- `pipeline/blueprint_parser.py` — Stage 4 blueprint parsing. The blueprint concept is gone.
- `pipeline/quality_report.py` — Grade aggregation. LLM-as-judge for code is gone.
- `forge/cascades/website_full.json` — The 5-stage definition. Superseded.
- `forge/prompts/` (all except conversation/extraction) — Old stage prompts. Annie will need new code-gen prompts structured completely differently.
- `forge/rubrics/`, `forge/gates/`, `forge/batches/` — Config pack artefacts for the old pipeline.

---

## 2. The minimum viable Annie experience

The smallest slice that delivers the spec's central promise:

**User arrives → talks to Annie → Annie builds → user gets a deployed URL.**

**IN the first slice:**

1. Discovery conversation (existing, minor prompt updates).
2. Annie proposes what she will build: *"I'm going to make you a one-page site with a waitlist form. I'll have something for you to look at in about five minutes."* User confirms or adjusts.
3. Annie scaffolds a Vite + React + shadcn + Hono project from the committed template. The template is pre-built, version-pinned, already runs. Not generated.
4. Annie issues code-gen tasks one at a time into the running project. Each task: generate code → write to file → run `npm run build` → headless-browser DOM check → if errors, fix or rollback → commit. User sees a live preview URL updating as Annie works.
5. Live preview via Vite dev server + Hono API server, fronted by a Caddy reverse proxy, served through a named Cloudflare tunnel at `<slug>-preview.coldanvil.com`.
6. When done, Annie publishes to `{project}.coldanvil.com` via Fly.io (stack + hosting combo locked 2026-04-18 per `Research/adorable_dyad_deep_research.md` §4).
7. User gets the URL.

**NOT in the first slice:**

- Real-time refinement ("make the hero green"). Deferred until the build loop is proven.
- Return visit continuity / cross-session memory.
- Export / download-as-zip UI.
- Custom domains (everything is `*.coldanvil.com` via Fly.io).
- Multiple projects per user.
- Payment / Stripe.
- Vision document as standalone artefact.
- Standalone eval layer.
- Visual review (Playwright screenshots). Verification is `npm run build` passing.
- Multi-user projects / collaboration.
- Backend-heavy products (APIs, data processing, ML).

---

## 3. The committed stack

**Vite 6 + React 19 + TypeScript + Tailwind CSS v3 + shadcn/ui** as the client. **Hono** as a small API server. **SQLite via `better-sqlite3` + Litestream** for continuous replication. **Deployment: Fly.io** (one Fly app per user project; Docker image runs SPA + Hono + Litestream sidecar). The `coldanvil.com` marketing site stays on Cloudflare Pages (static HTML, no runtime constraint).

**Decision 2026-04-18 (stack change).** Previously this spec committed to Next.js. After the architectural read of Adorable + Dyad (`Research/adorable_dyad_deep_research.md` §4), we're switching. The base template is lifted from Dyad's open-source scaffold (Apache-2.0), stripped of Dyad branding, rewired for Fly + Hono + SQLite + Litestream.

Justification:
- **Vite + Hono fits Fly + SQLite + Litestream without fighting framework defaults.** Next.js assumes serverless / horizontal scaling; Litestream requires single-writer single-machine-at-a-time. Running Next.js on Fly with `min_machines_running = 1` is fighting the framework. Vite SPA + Hono separation is native to this architecture.
- **Simpler scaffold for smaller fleet models.** No server/client component boundary, no runtime pinning (`runtime: 'nodejs'` everywhere), no Turbopack native-module gotchas. Our Gemma4-31b primary + Qwen3.5-27b backup will produce working code more reliably on the simpler scaffold.
- **In-repo `AI_RULES.md` ships with the scaffold** — a 20-rule LLM-facing contract telling the model where new components go, which libraries are pre-installed, and what not to edit. Composes natively with our `docs/`-as-memory commitment (`respec/07-creative-memory.md`).
- **shadcn/ui + Tailwind + React is the convergent choice** across every post-2025 AI builder. Frontier and mid-sized models both handle this stack fluently.
- **Visual edit (click-to-select-in-preview) depends on a Vite plugin.** Dyad's `@dyad-sh/react-vite-component-tagger` is 90 lines, Apache-2.0, and is the highest-leverage steal in the research. Achievable on webpack too but less mature.

The template lives at `templates/vite-hono-mvp/` (replaces the removed `templates/nextjs-mvp/`). A working Vite + React + shadcn/ui + Hono + SQLite + Litestream app with an idle landing page, root layout, Dockerfile, `fly.toml`, pinned dependencies, and an in-repo `AI_RULES.md`. `npm run build` + `npm run dev` both succeed out of the box. Annie generates INTO this. She never generates FROM scratch.

---

## 4. Annie's tool belt in code

| # | Tool | Status | What it is | Estimate |
|---|------|--------|-----------|----------|
| 1 | **Conversation** | EXISTING — adapt | `api/services/conversation.py` + supporting modules. Extend phases to include `build_planning`. Update Annie's system prompt for the conversation→build transition. | 2 days |
| 2 | **Stack (scaffolder)** | RE-DO on new stack | `builder/scaffold.py` (module stays — template-agnostic). Target template moves from `templates/nextjs-mvp/` to `templates/vite-hono-mvp/` (Dyad fork + Hono + Litestream). | 0.25 days (module adjust) + 1.5 days (new template from Dyad scaffold) |
| 3 | **Code-gen** | PARTIALLY RE-DO | `builder/codegen.py` core + retry loop survives. `forge/prompts/annie_codegen.md` rewritten for new stack's conventions. PoC prompts re-run against new stack to re-verify fleet capability. | 1.5 days (prompt + re-verify) |
| 4 | **Live preview** | ✓ DONE 2026-04-18 | `builder/preview.py` + `builder/caddy.py` live on elostirion. `npm run dev` per project on OS-assigned ports; Caddy routes `{slug}-preview.coldanvil.com` → the right port; named Cloudflare tunnel fronts Caddy on the public internet. | 2 days |
| 5 | **Refinement** | DEFERRED (Phase 3.5 visual-edit extension) | Thin wrapper around code-gen for targeted edits from user requests. Phase 3.5 adds click-to-select in preview (Dyad's component-tagger + proxy-injected selector — see `Research/adorable_dyad_deep_research.md` §3). | 3 days core + 5 days visual-edit (Phase 3.5) |
| 6 | **Deployment** | NEW | `builder/deploy.py`. `fly deploy` against a per-project Fly.io app. Wildcard DNS `*.coldanvil.com` → Fly edge. Litestream config per app for continuous SQLite replication. | 2 days + 1 day infra setup |
| 7 | **Portability** | DEFERRED | Zip project directory, serve as download. | 1 day |
| 8 | **Memory** | EXISTING — sufficient for first slice | Project model already stores `extraction_state` and `conversation_history` as JSONB. Cross-session memory deferred. | 0 days (first slice) / 3 days (full) |
| 9 | **Orchestrator** | ✓ DONE 2026-04-18 | `builder/orchestrator.py`. Plan-driven build loop (Phase 3.2). Ships with hardcoded 3-step skeleton; Annie-driven planning is the next enhancement. | 4 days |
| 10 | **Creative artefacts** | NEW — per `respec/07-creative-memory.md` | `builder/creative.py`. Drafts `docs/vision.md`, `docs/brand-voice.md`, `docs/content-strategy.md`, `docs/site-architecture.md` from conversation state. Runs eval-gate (rubrics already exist in the forge layer). Drives the Annie↔user review loop. Persists to `docs/`. Serves slices to the code-gen prompt assembler as the creative-brief block. | 4 days |

---

## 5. Build order

Critical path: **Template → Scaffold → Code-gen → Verification → Preview → Orchestrator → Conversation bridge → Deployment**

### Phase 0: Foundation — COMPLETE on Next.js 2026-04-17; SUPERSEDED by stack change 2026-04-18

- **0.1** ✓ (on Next.js) Next.js MVP template built and verified. Template is retained for reference only; new template replaces it in Phase 0.5.
- **0.2** Deferred — DB column migration (Project.build_state, Project.project_dir) not required until Phase 4 conversation bridge.
- **0.3** ✓ `Cold_Anvil/scripts/poc_codegen.py` + prompts built as the proof-of-concept substitute for stub `builder/`. Prompts are Next.js-specific; rewritten for Vite + React in Phase 0.5.
- **0.4** ✓ PoC verdict: **PROCEED on Next.js**. 5/5 primary, 3/5 swap passed. Fleet capability validated; stack choice revisited after Adorable + Dyad research.

### Phase 0.5: Stack swap to Vite + React + shadcn/ui + Hono (4 days) — COMPLETE 2026-04-18

**Outcome:** all six subtasks done. Template forked + extended + verified. PoC re-run on new stack produced PROCEED verdict on both Gemma4-31b (5/5 primary + 1/5 swap) and Qwen3.6-35B-A3B-FP8 (5/5 primary + 2/5 swap). Primary model rotated from Gemma4-31B to Qwen3.6-35B-A3B — narrow but real win on multi-table schema + cross-file wiring. Fast suite 360 passing. Phase 1 modules (scaffold, verify, codegen, creative slicing) all functional on the new stack. DOM-sanity headless-browser verification layer added per §8.3.

See `Cold_Anvil/BUILDING.md` for current implementation state. See Arnor memory `cold_anvil_primary_model_qwen3_6_35b_a3b_2026-04-18` for the PoC comparison numbers.

*Grounded in `Research/adorable_dyad_deep_research.md` §4.6. What survives vs. what gets rebuilt:*

| Survives | Rebuilt |
|---|---|
| `builder/verify.py` — `npm run build` signal is stack-agnostic | `templates/nextjs-mvp/` → `templates/vite-hono-mvp/` (Dyad fork + Hono + Litestream + Dockerfile + fly.toml) |
| `builder/codegen.py` core + retry wrapper + rollback | `scripts/poc_prompts/` — rewritten as Vite + shadcn versions; PoC re-run on new stack |
| `builder/creative.py` — slicing is stack-agnostic | `forge/prompts/annie_codegen.md` — rewritten around shadcn + Tailwind v3 + Hono API conventions |
| All architecture commitments, hosting decisions, creative framework | 2-3 tests that reference Next.js file paths |

- **0.5.1** Fork Dyad's scaffold (`templates/vite-hono-mvp/`). Strip `@dyad-sh/react-vite-component-tagger`, Dyad-branded landing, `made-with-dyad.tsx`, `components.json` css-path mismatch. Keep shadcn/ui (49 components pre-installed), Tailwind v3, react-router-dom, react-hook-form + zod, react-query. Add Hono server with one example endpoint writing to SQLite. Add Dockerfile running SPA + Hono + Litestream sidecar. Add `fly.toml`. Add `.env.example`. Tighten TS (strict for our code, loose for Annie's). Author `AI_RULES.md` in Dyad's style but targeted at Annie's conventions. (1.5 days)
- **0.5.2** Re-run the Phase 0 PoC against the new template. Rewrite prompts 01-05 as Vite + shadcn versions. Run each primary + swap through the Gateway. Re-establish PROCEED verdict against the new stack. (1 day)
- **0.5.3** Rewrite `forge/prompts/annie_codegen.md` to reference the Vite + shadcn + Hono stack, the in-repo `AI_RULES.md` contract, and the new file layout conventions. (0.5 days)
- **0.5.4** Update `builder/scaffold.py`'s template path constant, re-test scaffold + verify end-to-end on the new template. (0.25 days)
- **0.5.5** Update `tests/test_builder_{scaffold_verify,e2e}.py` where they reference Next.js paths or task descriptions. Keep all stack-agnostic assertions. (0.25 days)
- **0.5.6** Author `builder/verify.py` DOM-sanity extension per `respec/03-spec.md` §8.3 — headless-browser check that the rendered page contains the expected change, not just that build succeeded. (0.5 days)

### Phase 1: Scaffold + Verify — RE-COMPLETED as part of Phase 0.5

Phase 1's scaffold + verify were already built and tested on Next.js (2026-04-17). Phase 0.5 retargets the same modules at the new template and extends verify with the DOM-sanity check per §8.3. No new module work; rebuild + re-test only.

### Phase 2: Code-gen loop — core COMPLETED on Next.js 2026-04-17; prompt rewritten as part of Phase 0.5

Phase 2.1 (codegen core) and Phase 2.2 (retry-with-stderr + rollback + backup model) are built, tested, and stack-agnostic. The prompt template `forge/prompts/annie_codegen.md` is being rewritten under Phase 0.5.3 for the new stack. Phase 2.3 end-to-end test re-runs against the new template under Phase 0.5.5.

**Phase-0 lessons carried forward unchanged:**
- Signal-driven readiness pattern (`max_tokens=1` pre-warm; 200 IS the readiness signal; 330s httpx backstop above llama-swap's 300s). Retained.
- Retry-with-stderr is not optional. Retained.
- `creative_context` parameter is mandatory in the codegen API even when empty. Retained.
- Anti-ORM anchor is mandatory in DB-adjacent prompts. **Updated:** with Hono owning the DB layer, the anchor now targets Hono routes (raw `db.prepare(sql).all/get/run()` inside handlers, not Drizzle / Prisma / Kysely).

### Phase 2.5: Creative artefact production (4 days) — new, per `respec/07-creative-memory.md`

- **2.5.1** Implement `builder/creative.py`. Drafts each artefact from conversation state using the existing stage 1-3 prompts (`forge/prompts/idea_refinement.md`, `copy_generation.md`, `site_architecture.md`, `tech_design.md`). (1.5 days)
- **2.5.2** Wire eval-gate. Rubrics already exist: `vision`, `copy_generation` v2, `creative_output` v2, `site_architecture`, `tech_design` (see `respec/05-eval-standalone.md`). Score dimensions → threshold → rewrite-with-feedback loop before anything is shown to the user. (1 day)
- **2.5.3** Annie↔user review loop in conversation. Artefact drafted → shown to user → user reacts → Annie revises → committed to `docs/` when the user says yes. (1 day)
- **2.5.4** Slicing API — `creative.slice(artefact, task_type)` returns the creative-brief block for a given code-gen task. Slicing heuristics locked in `respec/07-creative-memory.md` §10 (calibrated 2026-04-17). (0.5 day)
- **2.5.5** UI surface — Stage B per `respec/07-creative-memory.md` §11 (calibrated 2026-04-17): inline-in-chat + docs panel listing the four artefacts read-only. Stage C (inline editor) and Stage D (history/diff) come later; both are additive UI, the disk representation is unchanged. (1 day for Stage B)

### Phase 3: Preview + Orchestrator (4 days, partially parallel with Phase 0.5)

- **3.1** ✓ **COMPLETE 2026-04-18.** `builder/preview.py` + `builder/caddy.py` built, tested, deployed on elostirion. Per-project `npm run dev` subprocess on OS-assigned Vite + Hono ports, running as a POSIX process group. Caddy reverse proxy listens on :8000, routes by Host header to the right project. Named Cloudflare tunnel `coldanvil-preview` (tunnel ID `407b797d-2b42-4533-9e6c-6566c385ca41`) fronts Caddy. DNS `*.coldanvil.com` wildcard on free Universal SSL (hyphen-format slugs — deferred upgrade to `{slug}.preview.coldanvil.com` when revenue justifies Advanced Certificate Manager at $10/mo, per Arnor memory `cold_anvil_preview_url_deferred_acm_upgrade_2026-04-18`). Public URL `https://{slug}-preview.coldanvil.com/` verified end-to-end. Full deployment state in `Cold_Anvil/BUILDING.md`. (2 days estimated; delivered in 1 session.)
- **3.2** ✓ **COMPLETE 2026-04-18.** `builder/orchestrator.py` + 15 unit tests. Plan-driven build loop: `codegen_with_retries` → preview refresh per success → tear-down on failure (Jack's rule: no broken output to users). Default plan is a hardcoded 3-step skeleton (option A per `cold_anvil_orchestrator_planning_roadmap_2026-04-18`). Option B (Annie-driven planning from extraction state) is the top post-3.2 priority. First end-to-end run on elostirion produced a real 3-page React SPA with working API in 217s. (3 days estimated; core + tests + e2e proof delivered in 1 session.)
- **3.3** End-to-end: scaffold → orchestrate 3-page build → verify each step → confirm preview URL at `<slug>-preview.coldanvil.com` loads the current state.

*3.1 ran in parallel with Phase 0.5 + Phase 2.5 as planned. 3.2 depends on Phase 2 core (done).*

### Phase 3.5: Visual edit (5 days) — NEW per `Research/adorable_dyad_deep_research.md` §3; POST-MVP

Click-an-element-in-the-preview-and-have-the-model-edit-the-right-file. Dyad's open-source mechanism, five pieces:

- **3.5.1** Fork `@dyad-sh/react-vite-component-tagger` → `@coldanvil/react-vite-component-tagger`. Apache-2.0, 90 lines, rename `data-dyad-*` → `data-anvil-*`. Ships in the Vite config of the template. (0.5 days)
- **3.5.2** Proxy server between the preview iframe and the user's Vite dev server. Lifts Dyad's `worker/proxy_server.js` pattern — detects HTML responses, injects five scripts into `<head>` (component selector, bridge, hover highlighter, click handler, postMessage relay). (2 days)
- **3.5.3** Preview iframe handler that parses `data-anvil-id="file.tsx:line:col"` and drops it into Annie's "selected components" state. (1 day)
- **3.5.4** Prompt assembler addition: when the user sends a message with selected components, append a `Selected components:` block containing the file path and a 5-line source snippet with `// <-- EDIT HERE`. (0.5 days)
- **3.5.5** End-to-end test: open preview, click an element, type "make this green", confirm the right file gets edited. (1 day)

Ships after Phase 6 polish. Not blocking MVP.

### Phase 4: Conversation bridge (3 days)

- **4.1** Extend conversation phases: add `build_planning` phase. Annie proposes what she'll build, user confirms. (1 day)
- **4.2** Update `confirm_generation` handler: scaffold → start preview → kick off orchestrator as background task → stream progress events via WebSocket. (1.5 days)
- **4.3** New WebSocket events: `build_started` (with preview URL), `build_step`, `build_error`, `build_complete`. (0.5 day)

### Phase 5: Deployment (3 days)

- **5.1** Implement `builder/deploy.py`. `fly launch` / `fly deploy` against a per-project Fly.io app. Persistent volume mount for the SQLite file; Litestream sidecar config for continuous replication to object storage. Wildcard DNS `*.coldanvil.com` → Fly edge (one-time infra setup). (2 days)
- **5.2** Deploy WebSocket event. User says "publish" → deploy → return URL. (0.5 day)
- **5.3** Deployment smoke test: scaffold → codegen → deploy → request the public URL → confirm the rendered page loads and the SQLite file persists across a machine restart. (0.5 day)

### Phase 6: Integration + polish (3 days)

- **6.1** Real-scenario end-to-end: arrive as user → type idea → conversation → watch build → get URL → open in browser. (1 day)
- **6.2** Error handling: Gateway down, build failures after retries, tunnel failures. Annie responds gracefully. (1 day)
- **6.3** Cleanup: process management, disk cleanup, logging. (1 day)

**Total MVP: ~26 + 4 = ~30 working days / ~6 weeks for one engineer** (+4 for Phase 0.5 stack swap). Phase 3.5 visual edit adds 5 more days post-MVP.

---

## 6. What we explicitly do NOT build in the first version

*(Subset of what the spec allows — the tightest possible first build.)*

- Real-time refinement ("make the hero green")
- Return visit continuity / cross-session memory
- Export / download UI
- Payment / Stripe integration
- Custom domains
- Multiple stacks (only Vite + React + shadcn/ui + Hono + SQLite at MVP)
- Backend-heavy products (APIs, data processing, ML)
- Visual edit / click-to-select in preview (Phase 3.5, post-MVP)
- Import of existing projects (explicit non-feature per `respec/03-spec.md` §4)
- Generation of legal or compliance documents (explicit non-feature per `respec/03-spec.md` §4; post-MVP extension)
- Standalone eval product
- Vision document as standalone creative artefact
- Playwright visual review
- Multi-user projects / collaboration
- Mobile-responsive automated testing
- Progress panel from the old conversational-flows spec

---

## 7. The riskiest assumption — ANSWERED on Next.js 2026-04-17; RE-VERIFYING on Vite under Phase 0.5

**Original question:** Can sub-40B models on our Arnor Gateway fleet reliably generate correct TypeScript + TSX code into a modern React project, one file at a time, with the project context in the prompt?

**Verdict on Next.js (2026-04-17): PROCEED.** 5/5 primary, 3/5 swap. Answered on the old stack.

**Stack change 2026-04-18 — VERIFIED:** Phase 0.5.2 re-ran all five PoC capabilities on the Vite + shadcn + Hono stack. Both Gemma4-31B and Qwen3.6-35B-A3B-FP8 cleared the PROCEED threshold (5/5 primary on both; 1/5 and 2/5 swap respectively). Qwen3.6-35B-A3B is now the primary model based on the head-to-head comparison. Fleet capability on the new stack is confirmed equal-or-better than on Next.js — consistent with the research's prediction that the simpler scaffold is easier for smaller open-weight models.

The Phase 0 PoC ran five capability prompts (interactive, list, API, dynamic route, multi-file schema), each with a primary and a swap vehicle. Gemma4-31b produced working Next.js 15 + TypeScript + Tailwind v4 + better-sqlite3 code on 5 of 5 primaries (one needed a retry) and 3 of 5 swaps. Full results + artefacts in `Cold_Anvil/BUILDING.md`.

**What this tells us about what to watch:**

- The fleet meets the floor. Retry-with-stderr is load-bearing, not cosmetic — it recovered 2 of 5 capabilities.
- Training priors can override stack invariants in specific domains. Two of five swaps failed with ORM-style syntax (`db.select().from(...)`) despite explicit invariants + a worked example. The anti-ORM anchor in Phase 2.1 is a direct response.
- Domain-adjacent over-indexing is the next risk frontier. Shipping a real product means dozens of prompts, not five, and the swap vehicles surfaced a drift pattern the primaries hid. Phase 2.3 and the Phase 1 creative-brief block are the mitigation; expect drift to surface again and plan for a growing library of negative anchors.

**The new riskiest assumption** is whether the creative-brief block (`respec/07-creative-memory.md` §5) is sufficient to hold tone, voice, and product-specific conventions consistently across a full build — the Phase 0 PoC demonstrated the tone-anchor mechanism works on a single prompt, but not across a 50-prompt project. Phase 2.5 + the first real end-to-end build is where that gets tested.

---

## Critical files for implementation

| File | Role in the new architecture |
|------|-----|
| `api/services/conversation.py` | Annie's front door; extend with build-planning phase transition |
| `api/services/model_client.py` | Gateway communication layer all code-gen calls use |
| `api/routes/conversation.py` | WebSocket endpoint bridging conversation to build; `confirm_generation` is the pivot |
| `pipeline/adapters/web.py` | Web verification adapter; adapt from "validate extracted files" to "run `npm run build`" |
| `api/models/project.py` | Project model; needs `build_state` and `project_dir` columns |
| `Cold_Anvil/templates/vite-hono-mvp/` | Phase 0.5 build (in progress). Dyad scaffold fork + Hono + SQLite + Litestream + Dockerfile + fly.toml + `AI_RULES.md`. Replaces the superseded `templates/nextjs-mvp/`. |
| `Cold_Anvil/scripts/poc_codegen.py` + `scripts/poc_prompts/` | ✓ Built Phase 0. Reference source for the Phase 1/2 scaffold and codegen patterns (source-copytree, hard-link node_modules, signal-driven pre-warm, retry-with-stderr). Archive/delete when Phase 1 lifts what it needs. |
| `builder/codegen.py` | NEW — single-file code generation inside a live project. Critical path. Takes project state + task + creative-brief. |
| `builder/creative.py` | NEW — creative artefact production + slicing. Per `respec/07-creative-memory.md`. |
| `builder/scaffold.py` | NEW — template copy + install + verify + `docs/` init. |
| `builder/verify.py` | NEW — `npm run build` as primary signal. |
| `builder/orchestrator.py` | NEW — Annie's build-phase brain. Replaces the cascade. |
| `builder/preview.py` | NEW — live preview via dev server + tunnel. |
| `builder/deploy.py` | NEW — publish to Fly.io (one app per user project; Litestream sidecar for SQLite replication). |
| `forge/prompts/annie_codegen.md` | NEW — code-gen instructions (replaces `file_generation.md`). Based on Phase 0 PoC prompts. |
| `docs/{vision,brand-voice,content-strategy,site-architecture}.md` | NEW — per-project creative artefacts. Live in the user's project, not the product repo. |
