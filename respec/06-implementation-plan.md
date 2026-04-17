# Cold Anvil Implementation Plan

*Written by Annie, April 2026. For the engineer who starts building tomorrow.*

**Status as of 2026-04-17:** Phase 0 is COMPLETE. The PoC cleared the PROCEED threshold (5/5 primary, 3/5 swap). Detailed Phase 0 state lives in `Cold_Anvil/BUILDING.md`. A companion document, `respec/07-creative-memory.md`, was written after Phase 0 and adds a new module (`builder/creative.py`) and a first-class creative-brief input to every code-gen call. This plan has been updated to fold in those commitments and the Phase 0 lessons. Read `Cold_Anvil/BUILDING.md` and `respec/07-creative-memory.md` before opening any code.

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
- `Cold_Anvil/templates/nextjs-mvp/` — the committed stack template, built and verified in Phase 0. Pinned Next.js 15 + React 19 + TS strict + Tailwind v4 + better-sqlite3. `npm install` + `npm run build` clean. This is the harness Annie generates INTO; it does not get regenerated.
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
3. Annie scaffolds a Next.js project from a committed template. The template is pre-built, version-pinned, already runs. Not generated.
4. Annie issues code-gen tasks one at a time into the running project. Each task: generate code → write to file → run `next build` → check for errors → if errors, fix or rollback → commit. User sees a live preview URL updating as Annie works.
5. Live preview via Next.js dev server served through a tunnel.
6. When done, Annie publishes to `{project}.coldanvil.com` via Fly.io (decision 2026-04-17: Cloudflare Pages ruled out because edge runtime cannot run `better-sqlite3`).
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

**Next.js 15** (App Router). **TypeScript 5.x** strict mode. **Tailwind CSS v4**. **SQLite via better-sqlite3** for the data layer (zero-config, deploys anywhere, more than enough for MVP web apps; Postgres comes in a future stack expansion). **Deployment: Fly.io** for user-generated apps (Node runtime + persistent volume + Litestream continuous replication — the only mainstream host that cleanly supports our Next.js + `better-sqlite3` combo). The `coldanvil.com` marketing site stays on Cloudflare Pages (static HTML, no runtime constraint).

Justification:
- Next.js is the convergent choice across every production AI builder (v0, Bolt, Lovable). Best-understood web framework by current LLMs.
- Tailwind eliminates the CSS-class-mismatch problem that destroyed every cascade we ran (the spec traces this directly in `01-journey.md`).
- TypeScript gives us type checking as a build-time verification gate.
- SQLite removes "you need a database server" deployment complexity for the user's product.
- Fly.io for user-app hosting because it is the only mainstream managed host that supports our exact stack — Node runtime with persistent disk + Litestream for continuous SQLite replication. Cloudflare Pages is still our choice for the static marketing site at `coldanvil.com`; user apps go to Fly.

The template lives at `templates/nextjs-mvp/`. A working Next.js 15 + TypeScript + Tailwind v4 + SQLite app with a hello-world landing page, root layout, config files, and pinned dependencies. `npm run build` succeeds out of the box. Annie generates INTO this. She never generates FROM scratch.

---

## 4. Annie's tool belt in code

| # | Tool | Status | What it is | Estimate |
|---|------|--------|-----------|----------|
| 1 | **Conversation** | EXISTING — adapt | `api/services/conversation.py` + supporting modules. Extend phases to include `build_planning`. Update Annie's system prompt for the conversation→build transition. | 2 days |
| 2 | **Stack (scaffolder)** | NEW | `builder/scaffold.py`. Copies the template, runs `npm install`, runs `npm run build` to verify. Pure file operations + subprocess. Template itself needs careful construction. | 1 day (module) + 2 days (template) |
| 3 | **Code-gen** | NEW — critical path | `builder/codegen.py`. Takes project state + task description. Calls Gateway. Writes result to disk. Runs verification. Returns success/failure. The replacement for old Stage 5, reimagined as single-file tool calls. New prompt: `forge/prompts/annie_codegen.md`. | 5 days |
| 4 | **Live preview** | NEW | `builder/preview.py`. Starts `next dev`, exposes via a **named Cloudflare tunnel** at `<slug>.preview.coldanvil.com` (decision 2026-04-17). Caddy reverse proxy routes hostname → correct per-project dev port. Manages process lifecycle. | 2 days (down from 3 — Cloudflare account + DNS plumbing already exists for `coldanvil.com`) |
| 5 | **Refinement** | DEFERRED | Thin wrapper around code-gen for targeted edits from user requests. | 3 days (after code-gen proven) |
| 6 | **Deployment** | NEW | `builder/deploy.py`. `fly deploy` against a per-project Fly.io app. Wildcard DNS `*.coldanvil.com` → Fly edge. Litestream config per app for continuous SQLite replication. | 2 days + 1 day infra setup |
| 7 | **Portability** | DEFERRED | Zip project directory, serve as download. | 1 day |
| 8 | **Memory** | EXISTING — sufficient for first slice | Project model already stores `extraction_state` and `conversation_history` as JSONB. Cross-session memory deferred. | 0 days (first slice) / 3 days (full) |
| 9 | **Orchestrator** | NEW | `builder/orchestrator.py`. The loop that replaces the cascade. Reads extraction state, decomposes idea into a sequence of code-gen calls, executes step by step, reports progress. This is Annie's brain during the build phase. | 4 days |
| 10 | **Creative artefacts** | NEW — per `respec/07-creative-memory.md` | `builder/creative.py`. Drafts `docs/vision.md`, `docs/brand-voice.md`, `docs/content-strategy.md`, `docs/site-architecture.md` from conversation state. Runs eval-gate (rubrics already exist in the forge layer). Drives the Annie↔user review loop. Persists to `docs/`. Serves slices to the code-gen prompt assembler as the creative-brief block. | 4 days |

---

## 5. Build order

Critical path: **Template → Scaffold → Code-gen → Verification → Preview → Orchestrator → Conversation bridge → Deployment**

### Phase 0: Foundation — COMPLETE 2026-04-17

- **0.1** ✓ Next.js MVP template built and verified. `Cold_Anvil/templates/nextjs-mvp/`. `npm install` + `npm run build` clean. Runtime render validated.
- **0.2** Deferred — DB column migration (Project.build_state, Project.project_dir) not required until Phase 4 conversation bridge.
- **0.3** ✓ `Cold_Anvil/scripts/poc_codegen.py` + prompts built as the proof-of-concept substitute for stub `builder/`. Actual `builder/` package gets created in Phase 1.
- **0.4** ✓ PoC verdict: **PROCEED**. 5/5 primary, 3/5 swap passed. Gemma4-31b as primary, qwen3.5-27b as backup. Full results + learnings captured in `Cold_Anvil/BUILDING.md`.

### Phase 1: Scaffold + Verify (3 days) — next up

- **1.1** Implement `builder/scaffold.py`. Copy template, `npm install`, `npm run build`, return success/failure. Also creates `docs/` with placeholder READMEs for the four creative artefacts (per `respec/07-creative-memory.md` §8). (1 day)
  - **Lift from `scripts/poc_codegen.py` — `copy_template_to_scratch()`**: source files go through `shutil.copytree` (true copy, independent inodes). **Only `node_modules/` is hard-linked** via `cp -al`. This is non-negotiable: Python's `open(path, "w")` truncates shared inodes, so hard-linking source files cascades edits across every scratch and back into the template. The PoC's first full run failed 4/5 for this reason before the fix.
- **1.2** Adapt verification to work against a live Next.js project. `npm run build` (invokes tsc + next build) as the primary signal. Create `builder/verify.py`. Layer 2 behavioural probes (Playwright) start here, deferred from Phase 0. (2 days)
- **1.3** End-to-end test: scaffold → verify → passes clean. Confirm `docs/` is present with placeholders.

*1.1 and 1.2 run in parallel. 1.3 depends on both.*

### Phase 2: Code-gen loop (5 days) — CRITICAL PATH

- **2.1** Implement `builder/codegen.py`. Prompt template with three first-class context blocks: **stack invariants**, **project state** (file tree + dependent file contents), **creative-brief** (slice of vision/voice/content-strategy/architecture per `respec/07-creative-memory.md` §5). Gateway call, parse response, write to disk, run verify. (3 days)
  - **Signal-driven readiness pattern (lift from `poc_codegen.py`)**: pre-warm each fleet model with `max_tokens=1` probe; 200 IS the readiness signal. Client timeout set to `330s` (backstop above llama-swap's 300s `healthCheckTimeout`). Never guess shorter timeouts. See `Cold_Anvil/BUILDING.md` learning #4 and `FORGE-OPERATIONS.md` §76-91.
  - **Anti-ORM anchor is mandatory** in any DB-adjacent prompt. Phase 0 showed training priors beat stack invariants — primary prompts using `better-sqlite3` correctly drifted to Drizzle-style `db.select().from(...)` on swap vehicles. Every DB-adjacent prompt must include an explicit negative constraint ("Do not use an ORM. Raw SQL only. `db.prepare().all()` / `.get()` / `.run()`") plus a worked example in the committed idiom.
  - **`creative_context` parameter is not optional** in the codegen API surface. Empty value is allowed (fresh project, no artefacts yet), but the parameter must always be present. Guards against drift toward generic SaaS output on projects that do have a voice.
- **2.2** Retry-with-error-context loop. 3 retries max, rollback on exhaustion, backup-model fallback (qwen3.5-27b) on final retry. (1 day)
  - **Retry-with-stderr is not optional** — it recovered 2 of 5 Phase 0 capabilities. TypeScript strict catches errors the model misses on first pass; feeding stderr back into the prompt is load-bearing.
- **2.3** Test with concrete scenario: scaffold → add landing page → add second page → add nav component. Each step verifies. Each prompt carries a creative-brief slice. (1 day)
- **2.4** Write `forge/prompts/annie_codegen.md` — dramatically simpler than old `file_generation.md` because the model edits a project that already works. Based on Phase 0's five PoC prompts; preserve their structure (CRITICAL OUTPUT CONSTRAINT at top, STACK INVARIANTS with Tailwind v4 / better-sqlite3 anti-patterns called out, PROJECT CONTEXT, WORKED EXAMPLE, TASK, FORBIDDEN, OUTPUT FORMAT).

### Phase 2.5: Creative artefact production (4 days) — new, per `respec/07-creative-memory.md`

- **2.5.1** Implement `builder/creative.py`. Drafts each artefact from conversation state using the existing stage 1-3 prompts (`forge/prompts/idea_refinement.md`, `copy_generation.md`, `site_architecture.md`, `tech_design.md`). (1.5 days)
- **2.5.2** Wire eval-gate. Rubrics already exist: `vision`, `copy_generation` v2, `creative_output` v2, `site_architecture`, `tech_design` (see `respec/05-eval-standalone.md`). Score dimensions → threshold → rewrite-with-feedback loop before anything is shown to the user. (1 day)
- **2.5.3** Annie↔user review loop in conversation. Artefact drafted → shown to user → user reacts → Annie revises → committed to `docs/` when the user says yes. (1 day)
- **2.5.4** Slicing API — `creative.slice(artefact, task_type)` returns the creative-brief block for a given code-gen task. Slicing heuristics locked in `respec/07-creative-memory.md` §10 (calibrated 2026-04-17). (0.5 day)
- **2.5.5** UI surface — Stage B per `respec/07-creative-memory.md` §11 (calibrated 2026-04-17): inline-in-chat + docs panel listing the four artefacts read-only. Stage C (inline editor) and Stage D (history/diff) come later; both are additive UI, the disk representation is unchanged. (1 day for Stage B)

### Phase 3: Preview + Orchestrator (4 days, partially parallel with Phase 2)

- **3.1** Implement `builder/preview.py`. Per-project `next dev` subprocess on an allocated port, fronted by a Caddy reverse proxy that routes `<slug>.preview.coldanvil.com` → the right port. Named Cloudflare tunnel from our deploy host to `*.preview.coldanvil.com`. Process lifecycle + orphan cleanup. *Can start as soon as scaffold works (Phase 1).* (2 days — reduced from 3 because Cloudflare account + DNS management for `coldanvil.com` already exists, so the plumbing is mostly configuration.)
- **3.2** Implement `builder/orchestrator.py`. The build loop: read extraction state → plan tasks → execute code-gen calls one by one → verify each → update preview → report to user. *Depends on Phase 2.* (3 days)
- **3.3** End-to-end: scaffold → orchestrate 3-page build → verify each step → confirm preview URL at `<slug>.preview.coldanvil.com` loads the current state.

*3.1 runs in parallel with Phase 2. 3.2 depends on Phase 2.*

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

**Total: ~26 working days / ~5-6 weeks for one engineer** (was 22; +4 for the creative artefact module introduced by `respec/07-creative-memory.md`).

---

## 6. What we explicitly do NOT build in the first version

*(Subset of what the spec allows — the tightest possible first build.)*

- Real-time refinement ("make the hero green")
- Return visit continuity / cross-session memory
- Export / download UI
- Payment / Stripe integration
- Custom domains
- Multiple stacks (only Next.js + TS + Tailwind + SQLite)
- Backend-heavy products (APIs, data processing, ML)
- Standalone eval product
- Vision document as standalone creative artefact
- Playwright visual review
- Multi-user projects / collaboration
- Mobile-responsive automated testing
- Progress panel from the old conversational-flows spec

---

## 7. The riskiest assumption — ANSWERED 2026-04-17

**Original question:** Can sub-40B models on our Arnor Gateway fleet reliably generate correct TypeScript + TSX code into a Next.js project, one file at a time, with the project context in the prompt?

**Verdict: PROCEED.**

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
| `Cold_Anvil/templates/nextjs-mvp/` | ✓ Built Phase 0. The committed stack template. Most important single artefact. |
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
