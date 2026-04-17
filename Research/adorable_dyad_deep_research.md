# Adorable & Dyad — Deep Research (2026-04-18)

*Commissioned to inform the Cold Anvil respec (`respec/03-spec.md`). Consolidates seven parallel research streams and one external cross-model strategic analysis. Everything load-bearing is cited at `file:line`. My assessments are tagged inline.*

## Assessment legend

- **✓ STEAL** — mechanism we should adopt directly into the spec or implementation
- **~ VALIDATES** — confirms an existing commitment in `respec/03-spec.md` or sibling docs
- **✗ REJECT** — wrong for Cold Anvil; actively dangerous if adopted
- **? OPEN** — question the research raised; a decision we haven't yet made

The synthesis at §11 aggregates these into a single matrix.

---

## 0. Scope and method

Two OSS AI-builder projects (Adorable and Dyad) are the closest prior art to Cold Anvil. This document is the rigorous technical benchmark the companion file `lovable_dyad_adorable_analysis.md` names as its #1 research gap — a real read of the code, the scaffolds, the prompts, the infrastructure, and the failure modes, not a strategic riff on brand names.

Research was gathered via seven parallel agents on 2026-04-17 and 2026-04-18:

1. **Adorable architecture** — read the full clone at `/tmp/adorable-research/adorable/`
2. **Dyad architecture** — read the full clone at `/tmp/dyad-research/dyad/`
3. **Dyad's visual-edit mechanism** — end-to-end dissection of the click-to-edit loop
4. **Scaffold audit** — full read of `freestyle-sh/freestyle-base-nextjs-shadcn` (at `/tmp/scaffolds/freestyle-nextjs/`) vs Dyad's bundled scaffold
5. **System prompts** — full corpus from both repos
6. **Failure modes in the wild** — GitHub issues survey (~200 Dyad issues read, full Adorable issue set)
7. **Freestyle platform** — SDK at `/tmp/freestyle-sdk-check/node_modules/freestyle-sandboxes/index.d.mts` + Freestyle docs

The eighth input is the pre-existing `Research/lovable_dyad_adorable_analysis.md` (cross-model Fusion meta-analysis, 2026-04-18).

Nothing in this document is directive. The current spec is the source of truth; this file is evidence.

---

## 1. Adorable — architectural read

### 1.1 What it is

Adorable is a Next.js 15 app — ~15 substantive source files under `lib/` + `app/api/` — that orchestrates chat + tool calls against Freestyle's hosted platform. There is no separate agent service, no planner/executor split, no cascade. The orchestrator *is* the Vercel AI SDK's `streamText(...)` with `stopWhen: stepCountIs(100)` (`lib/llm-provider.ts:47-75`, `app/api/chat/route.ts:82-106`). The chat route is ~100 lines: validate auth, load repo metadata, get a VM reference, build tools, stream. The model is the planner; every action is a tool call.

**~ VALIDATES §1 and §4 of our spec.** No planner/executor split, no stages, no cascade visible to the user. Conversation is the control flow. Adorable found the same answer we converged on.

### 1.2 Stack commitment

Hard-committed single stack. `lib/vars.ts:1` pins `TEMPLATE_REPO = "http://github.com/freestyle-sh/freestyle-base-nextjs-shadcn"`. Every new project is imported from that repo (`app/api/repos/route.ts:150-159`). The system prompt tells the model "There is a default Next.js app already set up in ${WORKDIR}" and lists its initial file tree.

**~ VALIDATES §6.** One opinionated stack, no gallery. The pinned-template-as-constant pattern is the simplest possible expression of the commitment.

### 1.3 Code-generation mechanism

Whole-file writes and text-replace edits. Tools defined in `lib/create-tools.ts`:

- `writeFileTool` (123-138) — whole-file overwrite via `vm.fs.writeTextFile`
- `replaceInFileTool` (198-242) — literal string search/replace; no AST, no fuzzy match. If `search` isn't found: `{ ok: false, replacements: 0 }`
- `appendToFileTool`, `makeDirectoryTool`, `movePathTool`, `deletePathTool`, `bashTool`

No patch format, no structured edit schema. Model emits tool calls; AI SDK handles plumbing. Prompt construction is trivial: `SYSTEM_PROMPT + convertToModelMessages(userMessages)`. No retrieval, no file-context injection, no project-tree summarisation beyond the hardcoded starter tree in the prompt.

**✗ REJECT literal-string-replace as the primary surgical edit primitive.** Any whitespace drift breaks it. Our §8 demands a more robust mechanism (AST-level or marker-based). Note Dyad evolved past this too (see §5.3).

### 1.4 Verification

Weak. One tool (`checkAppTool`, `create-tools.ts:398-452`) does:

1. `curl` against the dev server, reads HTTP status
2. Pulls recent dev-server logs via `vm.devServer.getLogs()`
3. Greps logs for `/(error -|failed to compile|module not found|unhandled runtime error|referenceerror|typeerror|syntaxerror|cannot find module)/i` (:415)
4. Returns `{ ok: false, ... }` on non-2xx/3xx or log regex hit

Tool description says *"You MUST call this tool before finishing any task"* (:399) — policy by prose, not enforced. The `commitTool` commits and pushes regardless; it does not gate on `checkApp`. **There is no rollback on failure.**

**✗ REJECT advisory verification.** Our §8.4 requires verification to gate the commit primitive itself, not be a tool the model is asked nicely to call. "You MUST" in a tool description is not a contract.

### 1.5 Live preview

Real dev server inside a Freestyle VM, exposed via wildcard subdomain. `adorable-vm.ts:46-96` creates a VM per repo and assigns three domains: app preview on port 3000, `dev-command-*` ttyd terminal on 3010, `terminals-*` on 3020. Preview URL: `https://<uuid>-adorable.style.dev`. Persistence is `{ type: "sticky" }` (adorable-vm.ts:57-59) — VM stays alive between requests. UI is `<iframe src={previewUrl}>` in `repo-workspace-shell.tsx:601-609`.

**✓ STEAL the VM-with-sticky-persistence + wildcard subdomain pattern.** Preview and refinement are the *same* substrate; there is no "build mode vs edit mode". The refinement tool in our §5.5 should be the same code path as initial build, served from a long-lived sandbox. (Freestyle's "sticky persistence" = suspended-on-disk, not always-running. See §8 for platform details.)

### 1.6 Refinement loop

No dedicated path. Edits during "build" and edits during "refine" are the same mechanism: user sends another message, model streams more tool calls, dev server hot-reloads. `replaceInFileTool` is as close as they get to a targeted edit primitive.

**~ VALIDATES §5.5.** Refinement as "same mechanism, different framing" is the right shape.

### 1.7 State / memory / continuity

Everything persists in a *second* git repo per project — the "wrapper repo", named `adorable-meta - <name>` (`repo-storage.ts:6`). `repo-storage.ts:150-157` writes `metadata.json` and conversation JSON files to that wrapper repo by committing via Freestyle's git API. `saveConversationMessages` (`:214-260`) commits `conversations/<id>.json` on every chat turn — **the full chat history is a git history**. Deployments, production domain mapping, and VM metadata live in `metadata.json`. Identity is a cookie-backed `freestyle.identities` reference (`identity-session.ts:18-40`). Repos are ACL'd to that identity (`app/api/repos/route.ts:170-178`).

**✓ STEAL git-as-state for conversation + metadata (partial).** It's cheap, portable, diffable, and gives free export for §5.7. But see §7.6 for why we'd drop the "chat-turn-per-commit" pattern — it fights Arnor Memory, which we already have. The cleaner Cold Anvil version: source code + `docs/` artefacts in git; conversation + taste in Arnor Memory.

### 1.8 Deployment

Every `commitTool` call triggers deployment. After successful `git push`, Adorable computes a per-commit subdomain `<sha12>-adorable.style.dev` (`deployment-status.ts:37-39`) and calls `freestyle.serverless.deployments.create({ repo, domains, build: true })`. Every commit gets its own preview URL — a per-SHA deployment ladder. A separate "promote" step maps a chosen `deploymentId` to the production domain (`app/api/repos/[repoId]/promote/route.ts:55-58`). Publishing is explicit (user clicks promote); auto-preview is implicit (every commit).

**✓ STEAL per-commit preview URLs + explicit promote-to-production.** Clean split between "save" and "publish" that matches our §3 ("publishing is not a terminal event; every substantive edit triggers a new deployment"). Also gives the user an undo lever — any historical SHA is still live at its URL.

### 1.9 LLM integration

Bound to OpenAI + Anthropic. `lib/llm-provider.ts:16-20` hardcodes the two provider names; `:47` calls `openaiProvider.responses("gpt-5.2-codex")`; `:71` calls `anthropicProvider("claude-sonnet-4-20250514")`. Tool schemas are Zod + `tool()` from the `ai` package.

**✗ REJECT hardcoded proprietary providers.** Swap for `createOpenAICompatible` from `@ai-sdk/openai-compatible` and point at Arnor Gateway. This is a ~10-line change in Adorable; we would do it on day one.

### 1.10 Surprising / clever / anti-patterns

- **Clever:** Git-as-database for project metadata is elegant and gives free portability.
- **Clever:** Per-commit deploy URL is a nice iteration affordance — user can always "go back" to any version.
- **Clever:** VM per project with sticky persistence + live dev server eliminates the build-vs-refine split.
- **Anti-pattern:** `checkAppTool` advisory, not enforced.
- **Anti-pattern:** No rollback primitive.
- **Anti-pattern:** Literal-string replace brittleness.
- **Anti-pattern:** Two repos per project (source + `adorable-meta`) is operationally heavy.
- **Good UX signal:** system prompt (`system-prompt.ts:38`) tells the model *"try to build some sort of UI or placeholder content in the page.tsx as soon as possible"* — the "preview early" UX that matches our §3 Build commitment.

---

## 2. Dyad — architectural read

### 2.1 What it is

Dyad is an Electron desktop app (v0.43.0) built with electron-forge + Vite + React/TanStack Router, with SQLite + drizzle-orm storing chats/apps/messages/versions. The load-bearing pieces are a ~2000-line chat handler and a ~700-line response processor.

### 2.2 Architectural spine

A single long-lived streaming IPC handler, not a multi-agent orchestrator. Renderer sends `chat:stream` over Electron IPC. `chat_stream_handlers.ts` (2034 lines) is the orchestrator: assembles system prompt (`system_prompt.ts:510` `constructSystemPrompt`), fetches model client (`get_model_client.ts:47`), packs codebase context, streams `streamText` from the Vercel AI SDK, accumulates `fullResponse`, then hands it to `processFullResponseActions` (`response_processor.ts:111`) which materialises the XML tags into disk writes + git commits. No planner/executor split in default build mode. The optional "local-agent" mode (`src/pro/main/ipc/handlers/local_agent/local_agent_handler.ts`) is the tool-calling variant for iterative work.

**✗ REJECT the 2034-line chat-stream monolith.** Annie should be a tool-calling agent from day one, not a streaming-XML parser with deeply nested conditionals for auto-fix / cancellation / compaction / mention-apps / visual-edits / MCP-tools / Supabase / Neon.

### 2.3 Stack commitment

One opinionated stack, pluggable templates on top. The bundled scaffold at `/tmp/dyad-research/dyad/scaffold/` is **Vite + React 19 + TypeScript + shadcn/ui + Radix + Tailwind + React Router + TanStack Query** — explicitly not Next.js. Scaffold `package.json` 14-63 and `src/App.tsx:11-25` (Browser router, QueryClientProvider, Toasters pre-wired). Contract codified in `scaffold/AI_RULES.md`: *"UPDATE the main page... ALWAYS try to use the shadcn/ui library... ALL shadcn/ui components and their dependencies installed."* Users can pick alternative templates (`template_handlers.ts`, `createFromTemplate.ts:13`) cloned shallow from GitHub (`:146` `gitClone({ depth: 1 })`).

**? OPEN — Next.js vs Vite.** Covered in §4.

**✓ STEAL the in-repo `AI_RULES.md` pattern.** See §4.2.

### 2.4 Code generation mechanism

Whole-file writes via XML tags in the assistant message. Tag vocabulary in `src/ipc/utils/dyad_tag_parser.ts` and the build prompt at `src/prompts/system_prompt.ts:62-321`:

- `<dyad-write path="...">...full file body...</dyad-write>` — complete rewrite, one per file per response
- `<dyad-rename from=".." to="..">`, `<dyad-delete path="..">`, `<dyad-add-dependency packages="a b c">`, `<dyad-execute-sql>`, `<dyad-copy>`, `<dyad-chat-summary>`, `<dyad-command type="rebuild|restart|refresh">`
- Pro-only: `<dyad-search-replace>` (surgical diff; `response_processor.ts:46, 392-444`)
- Pro-only "Turbo Edits v2": fast applier model rewrites from a sketch containing `// ... existing code ...` markers (`src/pro/main/ipc/handlers/local_agent/tools/edit_file.ts:34-62` calls `/tools/turbo-file-edit` on the Dyad engine)

Tags are extracted *while the stream is still in flight* (`processResponseChunkUpdate`) and applied only once the response completes. Apply order is enforced: deletes → renames → search-replace → copy → writes (`response_processor.ts:265-275`). The comment `"LLMs like to rename and then edit the same file"` (273-275) is a hard-won lesson.

**✗ REJECT XML tag DSL.** Modern models handle structured tool calls cleanly; tag-DSLs were a workaround for older streaming models. They invite parser fragility (Dyad uses a look-alike character ＜dyad at `chat_stream_handlers.ts:1970` to defuse think-content collisions).

**✓ STEAL apply-order discipline** (delete → rename → search-replace → copy → write). It's cheap to implement and the lesson is real.

### 2.5 Verification

TypeScript-only, with a 2-attempt auto-fix loop. `generateProblemReport` (`src/ipc/processors/tsc.ts`) spawns a Worker that runs tsc against a **virtual filesystem** overlay (`shared/VirtualFilesystem`) so it can type-check proposed edits before they hit disk. In `chat_stream_handlers.ts:1502-1609`, if `settings.enableAutoFixProblems` is on, errors are wrapped in `<dyad-problem-report>` and fed back to the model with `createProblemFixPrompt` for up to two retries. **No build verification, no lint, no DOM render check, no test run.** Disabled automatically when a `<dyad-add-dependency>` is present to avoid phantom errors. Rollback is by git: every response commits to the app's repo (`response_processor.ts:564-640`). `versionContracts.revertVersion` (`version_handlers.ts:165-240`) does `gitCheckout` + `gitStageToRevert` + deletes chat messages after that commit. **Rollback is user-initiated from the UI, not automatic on failure.**

**✓ STEAL the virtual-filesystem overlay for pre-disk type-checking.** Type errors caught before the write.

**~ VALIDATES §8.3 (ours is stricter).** Our spec demands build + typecheck + lint + DOM sanity. Dyad only does typecheck. We can beat them here meaningfully.

**✓ STEAL git-per-app + `commitHash` stamped on each assistant message.** Cheap, auditable rollback primitive. Schema at `src/db/schema.ts:96-99` stores `commitHash` and `sourceCommitHash` per message — per-message checkpointing.

### 2.6 Live preview

Local child process + in-Electron reverse proxy + iframe, all on localhost. `executeAppLocalNode` (`app_handlers.ts:354-437`) spawns `(pnpm install && pnpm run dev --port N) || (npm install --legacy-peer-deps && npm run dev -- --port N)` with `shell: true`. `startProxy` (`src/ipc/utils/start_proxy_server.ts`, 57 lines) runs `worker/proxy_server.js` in a `worker_threads.Worker` on a random 50000-60000 port. The proxy injects client-side JS into every HTML response. See §3 for the full dissection — this is the load-bearing mechanism.

Three runtime modes: `host` (local spawn), `docker` (local container), `cloud` (proprietary remote sandbox via `cloud_sandbox_provider.ts`).

### 2.7 Refinement loop

Identical mechanism to initial generation. Follow-up messages go through the same `chat_stream_handlers.ts` entrypoint. Two things make refinement snappier than first-build: (a) Pro's `search_replace` / `edit_file` produce diff-style edits instead of whole-file rewrites; (b) visual-editing lets the user click-select a component in the iframe and have its source path + coordinates piped to the next prompt (`atoms/previewAtoms.ts`: `selectedComponentsPreviewAtom`, `pendingVisualChangesAtom`). No separate "refinement tool."

**~ VALIDATES §5.5.**

### 2.8 State / memory / continuity

Everything local: SQLite + git. Code lives at `~/dyad-apps/<app>`; metadata in Electron's `userData`. Schema at `src/db/schema.ts`: `apps`, `chats`, `messages`, `versions`, `prompts`, `language_model_providers`, `language_models`, `mcp_servers`, `mcp_tool_consents`, `custom_themes`. Each app has its own git repo; every assistant message that wrote files stores `commitHash` and `sourceCommitHash` — per-message checkpointing. Apps bind to external integrations directly in the row (`supabaseProjectId`, `neonProjectId`, `vercelProjectId`, `githubOrg`, etc. — schema 31-68). Continuity is structural: desktop app persists indefinitely, chats are per-app, `versions` enables cross-session rollback.

**There is no conversational-memory layer like ours** — no summaries of user taste, no brand-voice doc, no discovery artefacts. Each chat has a `compactedAt` / `pendingCompaction` flag and `compaction_system_prompt.ts` summarises history when context gets long. That's a token-pressure hack, not a memory product.

**~ VALIDATES our `respec/07-creative-memory.md` as a real differentiator.** Dyad has local SQLite + git — good. Creative memory (vision / brand-voice / content-strategy / site-architecture) is genuinely absent.

### 2.9 Deployment

Publish via integrations, not Dyad's own host. Three paths:
- **Vercel** (`vercel_handlers.ts`, 622 lines) — user supplies bearer token, Dyad creates/connects a project
- **GitHub** (`github_handlers.ts`, 1466 lines) — push the app's git repo
- **Capacitor** (`capacitor_handlers.ts`) — for mobile wrap
- **Neon** (`neon_handlers.ts`) for Postgres, **Supabase** (`supabase_handlers.ts`) for db+auth+edge-functions

**No Fly.io / Railway / Dyad-owned deploy target.** I searched for `flyctl|fly\.io|netlify` — zero hits. Dyad's opinion is that publishing is the user's choice of cloud provider, with the desktop app as orchestrator.

**~ VALIDATES our Fly.io + Annie-drives-deployment commitment** as a real novice-friendly differentiator. Dyad's "bring your own Vercel token" is a rough first-run for a non-technical founder.

### 2.10 LLM integration

Provider-agnostic via Vercel AI SDK. `get_model_client.ts:268-521` is a switch on `providerId` covering: openai, anthropic, google, vertex, xai, azure, bedrock, openrouter, ollama, lmstudio, minimax, dyad-engine (their hosted gateway), plus arbitrary `createOpenAICompatible({ baseURL })` for custom providers. Ollama via `src/ipc/utils/ollama_provider.ts` pointing at `getOllamaApiUrl()`. LM Studio via their OpenAI-compatible endpoint. A dedicated "Dyad Engine" path (`llm_engine_provider.ts`, `DYAD_ENGINE_URL`) is their commercial gateway with smart-context, lazy-edits, and server-side web search.

**Swapping to Arnor Gateway is trivial**: register a "custom" provider with our base URL, or add one case to the switch. Tool-calling is AI SDK standard (`streamText({ tools, stepCountIs })`).

### 2.11 Local-first ergonomics

"Local-first" means no account, no cloud code execution by default, user provides their own keys. Code at `~/dyad-apps/<name>` (user-grepable). Metadata SQLite under `userData`. API keys in settings (`readSettings()`). Integrations (Vercel, GitHub, Supabase, Neon) are OAuth-token-in-settings. Dev server on user's machine; proxy in-process as worker thread; iframe points at localhost. **Privacy boundary:** with Ollama/LM Studio the only outbound call is to your local inference endpoint. Telemetry (`utils/telemetry.ts`, PostHog) opt-in. Explicit "runtime mode" toggle (host/docker/cloud) — user sees and controls where code executes.

### 2.12 Surprising and clever

- **HTML-injecting reverse proxy** (`worker/proxy_server.js`) — see §3, the single most interesting thing in the repo
- **Virtual-filesystem overlay for pre-disk type-checking** — clever
- **Apply-order discipline** (delete → rename → search-replace → copy → write) with the `"LLMs like to rename and then edit the same file"` comment — real lesson
- **Git per app, commit per assistant message, commit hash on the message row** — rollback and "what did the AI do that turn" trivially queryable
- **`<dyad-command type="rebuild|restart|refresh">`** as a model-emitted UI affordance — the model decides when the user needs to bounce the dev server
- **Two-attempt type-error auto-fix** with the error report fed back as a user message — cheap, pragmatic
- **Pro-only Turbo Edits**: dumb-fast applier model rewrites from smart-big-model sketches containing `// ... existing code ...` markers. Halves cost and latency for refinements.

---

## 3. Dyad's visual-edit mechanism, dissected

This is the single most impressive capability in the OSS AI-builder space — click-an-element-in-the-preview and have the model edit the right source file. Full end-to-end dissection below.

### 3.1 One-paragraph summary

(1) A Vite/Webpack plugin stamps every JSX element with `data-dyad-id="file.tsx:line:col"` + `data-dyad-name="TagName"` at build time. (2) A Node `worker_threads` reverse proxy between the Electron iframe and the user's Vite dev server detects HTML responses and injects five scripts into `<head>`. (3) An injected component-selector tracks hovers/clicks, walks up the DOM to the nearest `data-dyad-id`, and `postMessage`s the id back to the parent window. (4) A React main-process handler in `PreviewIframe.tsx` parses the id into `{relativePath, lineNumber, columnNumber}` and drops it into a Jotai atom. (5) The chat-stream handler, when the user sends a prompt with selected components, appends a `Selected components:` block to the **user** message containing the file path and a 5-line source snippet with `// <-- EDIT HERE` on the picked line.

### 3.2 The component tagger

Source at `/tmp/dyad-research/dyad/packages/@dyad-sh/react-vite-component-tagger/src/index.ts` (90 lines, Apache-2.0) plus a webpack-loader twin at `packages/@dyad-sh/nextjs-webpack-component-tagger/src/index.ts`.

Vite plugin shape: `{name, apply: "serve", enforce: "pre", transform}`. `apply: "serve"` = dev only. `enforce: "pre"` = runs before `@vitejs/plugin-react-swc`, so the tagger sees raw user JSX.

Dependencies: `@babel/parser`, `estree-walker`, `magic-string`. Core transform (`:18-88`):

```js
if (!VALID_EXTENSIONS.has(path.extname(id)) || id.includes("node_modules"))
  return null;
const ast = parse(code, { sourceType: "module", plugins: ["jsx", "typescript"] });
const ms = new MagicString(code);
const fileRelative = path.relative(process.cwd(), id);
walk(ast as any, {
  enter(node: any) {
    if (node.type !== "JSXOpeningElement") return;
    if (node.name?.type !== "JSXIdentifier") return;
    const tagName = node.name.name as string;
    if (!tagName) return;
    const alreadyTagged = node.attributes?.some(
      (attr: any) => attr.type === "JSXAttribute" && attr.name?.name === "data-dyad-id",
    );
    if (alreadyTagged) return;
    const loc = node.loc?.start;
    if (!loc) return;
    const dyadId = `${fileRelative}:${loc.line}:${loc.column}`;
    if (node.name.end != null) {
      ms.appendLeft(node.name.end, ` data-dyad-id="${dyadId}" data-dyad-name="${tagName}"`);
    }
  },
});
if (ms.toString() === code) return null;
return { code: ms.toString(), map: ms.generateMap({ hires: true }) };
```

Edge cases: fragments are filtered by `type: "JSXFragment"`; namespaced elements (`<Motion.div>`) are filtered by `node.name.type !== "JSXIdentifier"`; node_modules hard-excluded; `VALID_EXTENSIONS = new Set([".jsx", ".tsx"])`. Two try/catches log `[dyad-tagger] Warning:` and never break builds.

Wired at `scaffold/vite.config.ts:11`: `plugins: [dyadComponentTagger(), react()]`.

**✓ STEAL this, bit-for-bit.** Apache-2.0, 90 lines, zero Dyad-specific dependencies. Fork to `@coldanvil/react-vite-component-tagger`; rename `data-dyad-*` → `data-anvil-*`. This is the single highest-leverage steal in the entire research.

### 3.3 The proxy server

`worker/proxy_server.js`, 463 lines. Spun from `src/ipc/utils/start_proxy_server.ts`, wrapped in a `Worker` (worker_threads). `workerData` carries `{targetOrigin, port, fixedHeaders}`.

**Target**: `workerData.targetOrigin` = absolute URL like `http://localhost:5173`. Parent is `app_handlers.ts:320` which calls `startProxy(originalUrl, {...})` once Vite is up.

**Port**: `findAvailablePort(50_000, 60_000)` — listens on `localhost:<port>`. Iframe `src` points at the proxy, not Vite directly.

**HTML detection**: two conditions (proxy_server.js:364-374):
1. `needsInjection(target.pathname)` — path has no extension or ends in `.html`
2. Upstream `content-type` header contains `text/html`

If both true, proxy buffers the body, mutates, writes. Otherwise pipes upstream response through unchanged (376-379).

**Injection point**: after `<head>` via regex (265-273):
```js
const headRegex = /<head[^>]*>/i;
if (headRegex.test(txt)) {
  txt = txt.replace(headRegex, `$&\n${allScripts}`);
} else {
  txt = allScripts + "\n" + txt;
  parentPort?.postMessage("[proxy-worker] Warning: <head> tag not found – scripts prepended.");
}
```

**Injected scripts in order** (196-263):
1. `stacktrace.js` — third-party, from `node_modules/stacktrace-js/dist/stacktrace.min.js`
2. `dyad-shim.js` — history API shim, error handling, vite-error-overlay watcher
3. `dyad-component-selector-client.js` — click-to-select
4. `html-to-image` — third-party, for annotator screenshots
5. `dyad-screenshot-client.js`
6. `dyad-visual-editor-client.js`
7. `dyad_logs.js` — console intercept
8. `dyad-sw-register.js` — service worker

Ordering: stacktrace before shim (shim uses `window.StackTrace`); html-to-image before screenshot client. Everything else is order-independent.

**HTTP flow mods**: request side (338-353) — `host` rewritten, `origin`/`referer` rewritten, `fixedHeaders` merged; when injection planned, `accept-encoding` deleted (uncompressed upstream body) and `if-none-match` deleted (force fresh body). Response side (388-391) — `content-length` replaced, `content-encoding` + `etag` dropped. **CSP headers passed through unchanged** — Dyad's scaffold doesn't ship a strict CSP, but a user app with `script-src 'self'` would break the inline injection.

**WebSockets/HMR** (417-454): handles `upgrade` events; opens its own upstream connection, pipes bidirectionally. Vite HMR WS passes through.

**Failure modes**: upstream down → `502`; `buildTargetURL` throws → `400`; injection throws → `500`.

**Special path**: service worker at `/dyad-sw.js` served by proxy itself (310-324) — `application/javascript` + `service-worker-allowed: /` + `cache-control: no-cache`. Registers under the app's origin even though the file doesn't exist on the dev server.

**✓ STEAL the reverse-proxy injection pattern** — but serve injected scripts as external `<script src="/__anvil/shim.js">` tags, not inline. External tags are CSP-friendly, cacheable, smaller. The proxy already serves `/dyad-sw.js` this way; trivially extensible.

### 3.4 The injected clients — click-to-select in detail

`dyad-component-selector-client.js`, 745 lines. An IIFE running in the iframe.

**State**: `inactive | inspecting | selected`, plus arrays `overlays[]`, `hoverOverlay`, `hoverLabel`, `currentHoveredElement`, `highlightedElement`, `isProMode`.

**Click → source mapping** (line 380):
```js
let el = e.target;
while (el && !el.dataset.dyadId) el = el.parentElement;
if (el) el = skipOverlayElement(el);
```

That's the whole trick: walk up until a `data-dyad-id` exists. `skipOverlayElement` (225-266) walks one level higher if the hit is a gradient-style `inset-0` decorative overlay (absolute/fixed positioned, covering ≥98% of parent, not media, not scrollable) — so clicking on a gradient doesn't select the gradient when the user wanted the hero behind it.

**On click** (446-525):
- `stopPropagation` + `preventDefault` (user's app doesn't see the click)
- If already highlighted → deselect; post `{type: "dyad-component-deselected", componentId}`
- Else mark highlighted, assign a runtime id `dyad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` so the parent can re-find this specific DOM node across re-renders
- Post to parent:

```js
window.parent.postMessage({
  type: "dyad-component-selected",
  component: {
    id: clickedComponentId,          // "src/Foo.tsx:42:6"
    name: state.element.dataset.dyadName,
    runtimeId: state.element.dataset.dyadRuntimeId,
  },
  coordinates: {top, left, width, height},
}, "*");
```

**Hover overlay**: separate `<div>` appended to `document.body`, positioned absolutely via `getBoundingClientRect()`. Outside React's tree so re-renders don't touch it. `window.resize`/`scroll`/style-change → `updateAllOverlayPositions()` re-reads rects.

**Multi-select**: `overlays[]` holds every selected element; `onClick` appends. Parent-side `setSelectedComponentsPreview` in `PreviewIframe.tsx:645-658` de-duplicates by `runtimeId` falling back to `id`.

**Init**: polls for `[data-dyad-id]` (up to 60s via MutationObserver) before sending `{type: "dyad-component-selector-initialized"}`. Gates the "Select component" button until React has actually rendered (`PreviewIframe.tsx:1282-1283`). Prevents button activating before React renders past an auth loading screen (per the source comment referencing `dyad-sh/dyad issue #2231`).

**Keyboard**: Ctrl/Cmd+Shift+C shortcut (527-550) forwards `{type: "dyad-select-component-shortcut"}`.

### 3.5 Main process: from click to LLM

`parseComponentSelection` (`PreviewIframe.tsx:1624-1672`):
```js
const parts = id.split(":");
if (parts.length < 3) { console.error(...); return null; }
const columnStr = parts.pop();
const lineStr = parts.pop();
const relativePath = parts.join(":");   // robust to colons in path (Windows drive)
...
return { id, name, runtimeId, relativePath: normalizePath(relativePath), lineNumber, columnNumber };
```

Two atoms populated:
- `selectedComponentsPreviewAtom: ComponentSelection[]` — everything the user clicked, passed to LLM on submit
- `visualEditingSelectedComponentAtom: ComponentSelection | null` — single most-recent for pro-mode toolbar

On send, `ChatInput.tsx:509-572` reads the atom and passes it to `streamMessage`. `useStreamChat.ts:92-176` threads it through the IPC call (`selectedComponents: selectedComponents ?? []`).

Main process `chat_stream_handlers.ts:484-526` does the actual prompt insertion:

```js
const componentsToProcess = req.selectedComponents || [];
if (componentsToProcess.length > 0) {
  userPrompt += "\n\nSelected components:\n";
  for (const component of componentsToProcess) {
    let componentSnippet = "[component snippet not available]";
    try {
      const componentFileContent = await readFile(
        path.join(getDyadAppPath(chat.app.path), component.relativePath), "utf8",
      );
      const lines = componentFileContent.split(/\r?\n/);
      const selectedIndex = component.lineNumber - 1;
      const startIndex = Math.max(0, selectedIndex - 1);
      const endIndex = Math.min(lines.length, selectedIndex + 4);
      const snippetLines = lines.slice(startIndex, endIndex);
      const selectedLineInSnippetIndex = selectedIndex - startIndex;
      if (snippetLines[selectedLineInSnippetIndex]) {
        snippetLines[selectedLineInSnippetIndex] =
          `${snippetLines[selectedLineInSnippetIndex]} // <-- EDIT HERE`;
      }
      componentSnippet = snippetLines.join("\n");
    } catch (err) {
      logger.error(`Error reading selected component file content: ${err}`);
    }
    userPrompt += `\n${componentsToProcess.length > 1 ? `${i + 1}. ` : ""}Component: ${component.name} (file: ${component.relativePath})\n\nSnippet:\n\`\`\`\n${componentSnippet}\n\`\`\`\n`;
  }
}
```

The result tail on the **user** message looks like:
> Selected components:
>
> Component: Hero (file: src/components/Hero.tsx)
>
> Snippet:
> ```
>       <section className="bg-blue-500">
>         <h1 className="text-4xl font-bold"> // <-- EDIT HERE
>           Welcome
>         </h1>
>       </section>
> ```

**The DB-stored user message is the display prompt** (`displayUserPrompt ?? req.prompt`). The full prompt with the selected-components block replaces the last user message in `messageHistory` only at the LLM call (707-717). Clean display, full context to model.

**Smart-context effect** (609-644): smart-context off → `chatContext` switches to exactly the selected files; smart-context on → keeps smart-context but marks selected files as `focused = true`.

**Accumulate / clear**: every click appends until send. On send: `setInputValue(""); setSelectedComponents([]);` + post `clear-dyad-component-overlays`. Per-pill close filters one and posts `remove-dyad-component-overlay`. Restoring a queued-message edit posts `restore-dyad-component-overlays` with saved ids — re-queries DOM with `document.querySelector('[data-dyad-id="…"]')` to repaint overlays.

### 3.6 Replication on Cold Anvil

Our preview runs on a Fly.io Machine (§5.4 preview tool). Main app is a web UI, not Electron. Sequencing:

**Day 1**: Fork + publish `@coldanvil/react-vite-component-tagger`. Verify `data-anvil-*` attrs appear in rendered HTML.
**Day 2**: Write `anvil-preview-proxy` — standalone Node service, ~250 lines. Verify HTML injection works.
**Day 3**: Vendor + adapt `dyad-component-selector-client.js` (745 lines) → rename `data-dyad-*` → `data-anvil-*`. Browser iframe → confirm click posts messages to parent.
**Day 4**: Parent-side handler in Cold Anvil web UI. Chips for selected components.
**Day 5**: Wire Annie's prompt assembly (~40 lines, port of `chat_stream_handlers.ts:484-526`).

After a week: end-to-end click-to-edit in a single user's preview, minus pro-mode style-toolbar.

**Adaptations needed**:
- Electron IPC → WebSocket (our existing chat stream carries `selectedComponents` as extra field)
- Verify `event.origin === PREVIEW_ORIGIN` in addition to `event.source === iframeRef.contentWindow` (cross-origin hygiene)
- External-script injection instead of inline (CSP friendliness)
- `pnpm install` at runtime → bake scripts into the Fly Machine image

**What we skip in v1**: screenshot annotator, runtime style-editor toolbar + AST Tailwind writeback (pro-only), service worker network logs, routes dropdown.

**✓ STEAL end-to-end.** This is the concrete mechanism for "make the hero green" becoming a click rather than a prompt. ~5 engineer-days to a working v1.

---

## 4. Scaffold audit — Freestyle Next.js vs Dyad Vite+React

Our §6 currently commits to "Next.js (or its equivalent) with TypeScript, Tailwind, and a real data layer." The "(or its equivalent)" is unresolved. The scaffolds are the evidence.

### 4.1 Structural side-by-side

| Dimension | Freestyle (Next.js) | Dyad (Vite+React) |
|---|---|---|
| Framework | Next.js 15.5.2 (App Router, RSC) | React 19 + Vite 6 SPA |
| Bundler | Turbopack | Vite (Rollup) + SWC transform |
| Router | Next App Router (file-system) | react-router-dom v6 (declarative) |
| SSR? | Yes — RSC + streaming | No. Pure SPA, `vercel.json` catch-all → `index.html` |
| Data layer | None | None |
| Auth | None | None |
| API pattern | Route handlers + server actions (none wired) | None — SPA only, API lives elsewhere |
| State (client) | React + `next-themes` | React + `next-themes` + `@tanstack/react-query` (wired) |
| shadcn/ui pre-installed | **46** (new-york / neutral / rsc:true / OKLCH) | **49** (default / slate / rsc:false / HSL) |
| Tailwind | **v4** (OKLCH, `@theme`, `tw-animate-css`) | **v3** (HSL, `tailwindcss-animate`) |
| TS strictness | `strict: true` but `ignoreBuildErrors: true` | `strict: false` everywhere |
| Lint | ESLint 9 + Next preset | ESLint 9 + tseslint |
| Pre-installed runtime deps | **45** | **49** |
| Pre-installed dev deps | **10** | **17** (incl. Dyad-proprietary tagger) |
| Node runtime in prod? | Yes (`next start` SSR) | No (static `dist/` served by any file server) |
| Fly.io deploy story | Dockerise `.next/standalone`; works; modest size | Serve `dist/` via nginx/Caddy or pair with Node server; trivial |
| Vercel deploy story | Native | Works via `vercel.json` SPA rewrite |
| SQLite + Litestream fit | App Router Node runtime — `better-sqlite3` works, must pin `runtime: 'nodejs'` everywhere | SPA has no server — SQLite lives in sibling Hono server |
| AI contract | `README_AI.md` — one sentence | `AI_RULES.md` — 20 specific rules |

**Both scaffolds deliberately loosen type-checking.** Freestyle: `next.config.ts` sets `ignoreBuildErrors: true` + `ignoreDuringBuilds: true`. Dyad: `tsconfig.app.json` sets `strict: false`, `noImplicitAny: false`, etc. *Both make the explicit choice that the LLM may produce code that doesn't perfectly typecheck and the build must still succeed.* This is a significant signal about how either expects to be used.

### 4.2 AI-facing contracts

**Freestyle's `README_AI.md` — the entire file:**
> Make sure to use the shadcn components in the `components/ui` directory when you can. When you create new components, put them in the `components` directory. It's generally best not to edit files in `components/ui`, but you can if needed.

That's it. No routing rules, no data-layer rules, no styling rules, no anti-patterns. Adorable compensates in the *host's* system prompt (see §5), not the scaffold. Which means if we fork Freestyle's scaffold we inherit an empty contract and write the rules ourselves.

**Dyad's `scaffold/AI_RULES.md` — the entire file:**
> # Tech Stack
> - You are building a React application.
> - Use TypeScript.
> - Use React Router. KEEP the routes in src/App.tsx
> - Always put source code in the src folder.
> - Put pages into src/pages/
> - Put components into src/components/
> - The main page (default page) is src/pages/Index.tsx
> - UPDATE the main page to include the new components. OTHERWISE, the user can NOT see any components!
> - ALWAYS try to use the shadcn/ui library.
> - Tailwind CSS: always use Tailwind CSS for styling components. Utilize Tailwind classes extensively for layout, spacing, colors, and other design aspects.
>
> Available packages and libraries:
> - The lucide-react package is installed for icons.
> - You ALREADY have ALL the shadcn/ui components and their dependencies installed. So you don't need to install them again.
> - You have ALL the necessary Radix UI components installed.
> - Use prebuilt components from the shadcn/ui library after importing them. Note that these files shouldn't be edited, so make new components if you need to change them.

Plus a comment in `pages/Index.tsx`:
```
// Update this page (the content is just a fallback if you fail to update the page)
```

**Dyad's scaffold treats the LLM as its primary reader and writes accordingly.** Location rules, visibility rules (the all-caps reminder is targeted at a specific failure mode — the "Welcome to your Blank App" placeholder surviving the first generation), negative rules, positive defaults, redundant LLM-friendly repetition.

**✓ STEAL the in-repo `AI_RULES.md` pattern.** Ships with the scaffold; lives in `docs/`-adjacent territory; composes natively with our `respec/07-creative-memory.md` "memory in docs" commitment.

### 4.3 First-render experience

**Freestyle first render:** blank white page with a single Freestyle logo at 10% opacity centred. 15 lines of JSX. Fonts (Geist + Geist Mono) loaded. Dark mode possible via `next-themes` but not wired. Visually empty.

**Dyad first render:** "Welcome to Your Blank App" 4xl bold heading + "Start building your amazing project here!" gray xl, `bg-gray-100` full-screen flex-centred. "Made with Dyad" footer. Dark mode CSS configured, no toggle wired. Visually slightly more alive; typographically less polished (no custom font).

### 4.4 Cross-file wiring

"User submits a form on the home page" — both scaffolds:
- Have `react-hook-form` + `zod` + `@hookform/resolvers` + `components/ui/form.tsx`
- Have **no example form**, no example endpoint, no DB, no persistence

Dyad also has `@tanstack/react-query` wired globally, giving an obvious `useMutation` pattern. But submission has nowhere to go in either scaffold. Dyad apps that persist integrate Supabase; Freestyle apps would use Next server actions or route handlers.

### 4.5 The four decision questions

**Which gives the LLM an easier job?** Dyad, by a lot. Two reasons: (1) the AI contract is in-repo and explicit; (2) fewer concepts per feature. Next.js asks "server component or client?", "server action or route handler?", "`'use client'` at which boundary?", "does this need `export const dynamic = 'force-dynamic'`?". Dyad's SPA scaffold doesn't have those failure modes. Caveat: strong frontier models handle Next.js fluently; the gap is biggest in sub-30B models where we'll want to save cost.

**Which gives the user a better end product?** Next.js, on paper — SSR, image optimisation, font self-hosting, SEO, streaming, LCP. But for the products §6 commits to (utility apps, dashboards, internal tools, side projects) the delta is small. SEO matters for marketing sites and that's where Next's advantage is biggest. Net: Next.js for SEO-sensitive products, tie or near-tie for everything else.

**Which fits Fly.io + SQLite + Litestream?** This is the decisive question, and it has a subtle answer. SQLite + Litestream requires a single-writer, single-machine-at-a-time Node process (or one VM per app, pinned, with Litestream sidecar streaming to S3). Fly supports this cleanly with `fly.toml` + Dockerfile.

- **Dyad's SPA scaffold has no server at all.** To add SQLite you have to *add a server layer* anyway — Hono, Fastify, Express, or Next API routes. SPA = frontend; SQLite story lives in a sibling backend. 200-line Hono app owns the DB, SPA calls it. Clean.
- **Freestyle's Next.js scaffold has a server, but it's the wrong shape.** `better-sqlite3` is a native module: won't run in Next's edge runtime (must pin every route to `runtime: 'nodejs'`); Turbopack HMR sometimes duplicates native-module instances ("database is locked" in dev); standalone builds need native prebuilds copied into the Docker image. The real kicker: Next assumes serverless/horizontal-scaling; Litestream assumes one writer. You *can* make it work on Fly by running a single machine with `min_machines_running = 1`, but you're fighting defaults.

**Dyad's SPA + Hono fits Fly + SQLite + Litestream with zero framework friction.** Freestyle's Next can be made to fit but spends LLM budget reminding the model to pin `runtime: 'nodejs'` everywhere.

**Which makes non-technical users proud?** Next.js, marginally. Sharper first paint, self-hosted Geist baked in, proper `<Image>` optimisation, cleaner URLs. Gap is smaller than discourse claims once Vite has a CDN in front.

### 4.6 Decision for §6

**Commit to Vite + React 19 + shadcn/ui (Tailwind v3) as the client, paired with a Hono API server, on Fly.io with SQLite + Litestream. Use Dyad's scaffold as the base template; fork, strip, and rename.**

Evidence, in order of weight:

1. **Fly.io + SQLite + Litestream fits Vite+Hono cleanly; Next.js fights it.**
2. **Dyad's `AI_RULES.md` is the pattern §6-adjacent work (`respec/07`) already wants.**
3. **LLM ergonomics favour Dyad's scaffold for smaller/cheaper models.**
4. **Range argument favours Vite for typical Cold Anvil products** (internal tools, dashboards, utility apps are SPA-shaped).
5. **End-product polish gap is narrower than discourse claims** once CDN is in front.

**Proposed §6 language replacement** for "Next.js (or its equivalent)":
> "A modern React + TypeScript + Tailwind + shadcn/ui stack on Vite, served from Fly.io as a static SPA paired with a Hono API server. The data layer is SQLite with Litestream replication. Every project ships an `AI_RULES.md` and a `docs/` folder that Annie reads before each turn."

**Strip from Dyad scaffold before shipping:** `@dyad-sh/react-vite-component-tagger` (proprietary); `src/components/made-with-dyad.tsx` and its reference in `pages/Index.tsx`; Dyad-branded `Index.tsx` greeting; `components.json` `css` path mismatch (points at `src/index.css` but file is `src/globals.css`).

**Add:** Hono server with example endpoint writing SQLite; `Dockerfile` + `fly.toml` running both SPA + server with Litestream sidecar; `.env.example`; real `README.md`; rename `AI_RULES.md` to match `respec/07` convention; tighten TS config (strict for our code, loose for Annie's generated code); keep Tailwind v3 (more training data) unless we have a reason.

**✓ STEAL the Dyad scaffold as base template.** Biggest single spec impact in this research.

---

## 5. System prompts — both repos

### 5.1 Corpus shape

**Adorable ships one prompt.** 39 lines, `lib/system-prompt.ts:3-41`. Sent unchanged every turn. No per-turn assembly, no conditional branching, no codebase prelude, no chat summarisation. The prompt is **static**; dynamism lives in tool descriptions.

**Dyad ships nine prompt artefacts.** The base build prompt is ~260 lines at `src/prompts/system_prompt.ts:62-321`, with nine sibling prompts assembled per-turn in `chat_stream_handlers.ts:760-900`:

| File | Purpose | When |
|---|---|---|
| `system_prompt.ts` BUILD_SYSTEM_PROMPT (62-321) | Core build | Default |
| `system_prompt.ts` ASK_MODE (362-454) | Read-only Q&A | `chatMode === "ask"` |
| `system_prompt.ts` THINKING_PROMPT (10-60) | `<think>` scaffold | Optional |
| `local_agent_prompt.ts` LOCAL_AGENT_* (151-254) | Tool-calling agent v2 | `chatMode === "local-agent"` |
| `plan_mode_prompt.ts` (1-109) | Discovery + planning | `chatMode === "plan"` |
| `compaction_system_prompt.ts` (5-46) | Summary template | Token budget exceeded |
| `summarize_chat_system_prompt.ts` (1-42) | Chat title + change log | Prompt prefix `Summarize from chat-id=` |
| `security_review_prompt.ts` (1-60) | Security audit | Prompt prefix `/security-review` |
| `supabase_prompt.ts` | DB conditional | Appended when Supabase connected |
| `turbo_edits_v2_prompt.ts` (7-94) | Search/replace diff format | When `isTurboEditsV2Enabled` |
| `shared/problem_prompt.ts` (7-28) | Auto-fix on TS errors | On typecheck failure |

Assembly at `chat_stream_handlers.ts:760-900`:
1. Read project's `AI_RULES.md` (falls back to `DEFAULT_AI_RULES`)
2. Read theme prompt by id
3. Construct base prompt (mode switch)
4. Append "Referenced Apps" prelude on `@`-mention
5. Override entirely for `/security-review` or `Summarize from chat-id=`
6. Append Supabase prompts (connected/unconnected)
7. Append upload/image instructions if attachments
8. Inject codebase as fake user/assistant pair:
   ```js
   { role: "user",      content: createCodebasePrompt(codebaseInfo) },
   { role: "assistant", content: "OK, got it. I'm ready to help" }
   ```
   where `createCodebasePrompt` renders the project as `<dyad-file path="...">` blocks.
9. Limit chat history to `maxChatTurnsInContext * 2`, preserving user-first ordering.

**✓ STEAL the codebase-as-user-turn injection pattern.** Keeping the persona stable in the system prompt and refreshing project state via a user-turn is cache-friendly and matches how creative-memory's per-task slice should be sent.

### 5.2 Adorable — full prompt, verbatim

```
You are Adorable, an AI app builder. There is a default Next.js app already set up in ${WORKDIR} and running inside a VM on port ${VM_PORT}.

Here are the files currently there:
${WORKDIR}/README.md
${WORKDIR}/app/favicon.ico
${WORKDIR}/app/globals.css
${WORKDIR}/app/layout.tsx
${WORKDIR}/app/page.tsx
${WORKDIR}/eslint.config.mjs
${WORKDIR}/next-env.d.ts
${WORKDIR}/next.config.ts
${WORKDIR}/package-lock.json
${WORKDIR}/package.json
${WORKDIR}/postcss.config.mjs
${WORKDIR}/public/file.svg
${WORKDIR}/public/globe.svg
${WORKDIR}/public/next.svg
${WORKDIR}/public/vercel.svg
${WORKDIR}/tsconfig.json

## Tool usage
Prefer built-in tools for file operations (read, write, list, search, replace, append, mkdir, move, delete, commit).
Use bash only for actions that truly require shell execution (for example installing dependencies, running git, or running scripts).
The dev server automatically reloads when files are changed. Always use the commit tool to save your changes when you finish a task.

## Communication style
Write brief, natural narrations of what you're doing and why, as if you were explaining it to a teammate. For example:
- "Let me read the current page to understand the layout."
- "I'll update the styles and add the new component."
- "Installing the dependency now."

Keep these summaries to one short sentence. Do NOT repeat the tool name or arguments in your narration — the UI already shows which tools were called. Focus on the *why*, not the *what*. You do not need to explain every single tool call. For example if you read a bunch of files in a row, you don't need to explain why you read each file, just why you were reading those files in general.

When building an app from scratch, try to build some sort of UI or placeholder content in the page.tsx as soon as possible, even if it's very basic. This way the user can see progress in real time and give feedback or change direction early on.

After completing a task, give a concise summary of what changed and what the user should see.
```

Structural anatomy: (1) identity + environment fused in one sentence; (2) static file listing; (3) tool usage — three imperatives; (4) communication style with three examples; (5) operating defaults — build skeleton early, summarise at end.

Dynamic parts: `${WORKDIR}` and `${VM_PORT}`, both constants from `vars.ts:3-4`. Zero per-project interpolation. Zero codebase prelude, zero summary, zero error context. `chat/route.ts:82-90`: `system: SYSTEM_PROMPT, messages, tools` — that's the entire request.

The verification contract ("you MUST call checkApp before finishing") lives in the tool description, not the prompt. The "you MUST" rule travels with the tool that does the verifying.

### 5.3 Dyad — load-bearing quotes

**Role block** (`system_prompt.ts:62-64`):
> <role> You are Dyad, an AI editor that creates and modifies web applications. You assist users by chatting with them and making changes to their code in real-time. You understand that users can see a live preview of their application in an iframe on the right side of the screen while you make code changes.
> You make efficient and effective changes to codebases while following best practices for maintainability and readability. You take pride in keeping things simple and elegant. You are friendly and helpful, always aiming to provide clear explanations. </role>

**Guidelines block** (81-99):
> - Before proceeding with any code edits, check whether the user's request has already been implemented. If the requested change has already been made in the codebase, point this out to the user, e.g., "This feature is already implemented as described."
> - Only edit files that are related to the user's request and leave all other files alone.

**Additional guidelines** (296-320):
> All edits you make on the codebase will directly be built and rendered, therefore you should NEVER make partial changes like letting the user know that they should implement some components or partially implementing features.
> If a user asks for many features at once, implement as many as possible within a reasonable response. Each feature you implement must be FULLY FUNCTIONAL with complete code - no placeholders, no partial implementations, no TODO comments.
> ...
> - Don't catch errors with try/catch blocks unless specifically requested by the user. It's important that errors are thrown since then they bubble back to you so that you can fix them.
>
> DO NOT OVERENGINEER THE CODE. You take great pride in keeping things simple and elegant. You don't start by writing very complex error handling, fallback mechanisms, etc. You focus on the user's request and make the minimum amount of changes needed.
> DON'T DO MORE THAN WHAT THE USER ASKS FOR.

**Postfix screaming** (323-335):
> # REMEMBER
>
> > **CODE FORMATTING IS NON-NEGOTIABLE:**
> > **NEVER, EVER** use markdown code blocks (```) for code.
> > **ONLY** use <dyad-write> tags for **ALL** code output.
> > Using ``` for code is **PROHIBITED**.
> > Using <dyad-write> for code is **MANDATORY**.
> > Any instance of code within ``` is a **CRITICAL FAILURE**.
> > **REPEAT: NO MARKDOWN CODE BLOCKS. USE <dyad-write> EXCLUSIVELY FOR CODE.**
> > Do NOT use <dyad-file> tags in the output. ALWAYS use <dyad-write> to generate code.

The block is a screaming-caps reminder because even with examples the model *will* default to ` ``` ` when not held to the contract. It exists **because they're fighting their own DSL**. Annie has no DSL to defend.

**Ask mode directive** (416, 435-453):
> **ABSOLUTE PRIMARY DIRECTIVE: YOU MUST NOT, UNDER ANY CIRCUMSTANCES, WRITE OR GENERATE CODE.**
> ...
> IF YOU USE ANY OF THESE TAGS, YOU WILL BE FIRED.

Known LLM-jailbreak-resistance technique ("you will be fired"). Annie is not a high-risk surface where prompt injection could erase user data; we don't need this.

**Local-agent tool-calling** (52-63):
> 1. ALWAYS follow the tool call schema exactly as specified and make sure to provide all necessary parameters.
> 2. The conversation may reference tools that are no longer available. NEVER call tools that are not explicitly provided.
> 3. **NEVER refer to tool names when speaking to the USER.** Instead, just say what the tool is doing in natural language.
> ...
> 9. You can call multiple tools in a single response. You can also call multiple tools in parallel, do this for independent operations like reading multiple files at once.

**File-editing tool selection table** (76-91) — clearest piece of prompt engineering in Dyad:

| Scope | Tool | Examples |
|-------|------|----------|
| **Small** (a few lines) | `search_replace` or `edit_file` | Fix a typo, rename a variable, update a value, change an import |
| **Medium** (one function or section) | `edit_file` | Rewrite a function, add a new component, modify multiple related lines |
| **Large** (most of the file) | `write_file` | Major refactor, rewrite a module, create a new file |

> **Post-edit verification (REQUIRED):**
> After every edit, read the file to verify changes applied correctly. If something went wrong, try a different tool and verify again.

**Development workflow** (93-103):
> 1. **Understand:** Think about the user's request and the relevant codebase context. Use `grep` and `code_search` search tools extensively (in parallel if independent)...
> 2. **Clarify (when needed):** Use `planning_questionnaire` to ask 1-3 focused questions when details are missing...
>    **Use when:** creating a new app/project, the request is vague (e.g. "Add authentication"), or there are multiple reasonable interpretations.
>    **Skip when:** the request is specific and concrete (e.g. "Fix the login button", "Change color from blue to green").
> 3. **Plan:** Build a coherent and grounded plan... For complex tasks, break them down into smaller, manageable subtasks and use the `update_todos` tool...
> 4. **Implement:** ...When debugging, add targeted console.log statements to trace data flow and identify root causes...
> 5. **Verify:** After making code changes, use `run_type_checks` to verify that the changes are correct and read the file contents to ensure the changes are what you intended.
> 6. **Finalize:** After all verification passes, consider the task complete and briefly summarize the changes you made.

**✓ STEAL this workflow template.** Understand → Clarify → Plan → Implement → Verify → Finalise maps 1:1 to our §8 build-time contract.

### 5.4 Plan mode — closest to Annie's discovery

`plan_mode_prompt.ts` is the closest thing in either repo to what Annie does.

**Persona** (3-5):
> You are Dyad Plan Mode, an AI planning assistant specialized in gathering requirements and creating detailed implementation plans for software changes. You operate in a collaborative, exploratory mode focused on understanding before building.

**Mission** (8):
> Your goal is to have a thoughtful brainstorming session with the user to fully understand their request, then create a comprehensive implementation plan. Think of yourself as a technical product manager who asks insightful questions and creates detailed specifications.

**Plan template is product-first, tech-last** (34-42):
> - **Overview**: Clear description of what will be built or changed
> - **UI/UX Design**: User flows, layout, component placement, interactions
> - **Considerations**: Potential challenges, trade-offs, edge cases, or alternatives
> - **Technical Approach**: Architecture decisions, patterns to use, libraries needed
> - **Implementation Steps**: Ordered, granular tasks with file-level specificity
> - **Code Changes**: Specific files to modify/create and what changes are needed
> - **Testing Strategy**: How the feature should be validated

**Communication guidelines** (51-71):
> ## Tone & Style
> - Be collaborative and conversational, like a thoughtful colleague brainstorming together
> - Show genuine curiosity about the user's vision
> - Think out loud about trade-offs and options
> - Be concise but thorough - avoid over-explaining obvious points
> - Use natural language, not overly formal or robotic phrasing
>
> ## Question Strategy
> - Ask 1-3 focused questions at a time (don't overwhelm)
> - Prioritize questions that unblock multiple decisions
> - Frame questions as options when possible ("Would you prefer A or B?")
> - Explain why you're asking if it's not obvious
> - Group related questions together
>
> ## Exploration Approach
> - Proactively examine the codebase to understand context
> - Share relevant findings: "I noticed you're using [X pattern] in [Y file]..."
> - Identify existing patterns to follow for consistency
> - Call out potential integration challenges early

**✓ STEAL the Tone & Style + Question Strategy + Exploration Approach triplet almost verbatim** for Annie's discovery phase.

**Critical exit** (47-48 and 94):
> **CRITICAL**: When the user accepts the plan, you MUST call `exit_plan` immediately as your only action. Do not output any text before or after the tool call. Failure to call `exit_plan` will block the user from proceeding to implementation.

### 5.5 Compaction template

`compaction_system_prompt.ts:5-46`. Structured 5-section summary:
```
## Key Decisions Made
## Code Changes Completed
## Current Task State
## Active Plan      (only if a plan was created via write_plan)
## Important Context
```

Guidelines emphasise *"Capture intent: Include the 'why' behind decisions, not just the 'what'"*.

**✓ STEAL the compaction structure** (with an added `## Creative Decisions` section for voice/vision evolution).

### 5.6 Convergent wisdom

Both prompts agree on:

1. **Live preview is part of the persona.** Adorable: *"try to build some sort of UI or placeholder content in page.tsx as soon as possible, even if it's very basic. This way the user can see progress in real time"*. Dyad: *"users can see a live preview of their application in an iframe on the right side of the screen while you make code changes"*.
2. **Pin one stack.** Adorable: hardcoded `TEMPLATE_REPO`. Dyad: React + TS + Router + Tailwind + shadcn declared in `DEFAULT_AI_RULES`.
3. **Verification is required.** Adorable: `checkAppTool` "MUST". Dyad: local-agent step 5 — *"use `run_type_checks` to verify that the changes are correct and read the file contents to ensure the changes are what you intended."*
4. **Don't tell the user tool names; tell them intent.** Adorable: *"Do NOT repeat the tool name or arguments in your narration — the UI already shows which tools were called."* Dyad: *"NEVER refer to tool names when speaking to the USER. Instead, just say what the tool is doing in natural language."*
5. **Conversational non-technical summaries.** Both require a one-sentence user-language close. Dyad: *"VERY CONCISE, non-technical summary of the changes made in one sentence, nothing more. This summary should be easy for non-technical users to understand."*
6. **Don't gold-plate.** Dyad: *"DO NOT OVERENGINEER THE CODE... DON'T DO MORE THAN WHAT THE USER ASKS FOR."* Adorable's whole prompt exemplifies this.
7. **Errors should bubble, not be swallowed.** Dyad: *"Don't catch errors with try/catch blocks unless specifically requested by the user."* Adorable: `checkAppTool` reads dev-server logs for raw failure visibility.
8. **Commit at meaningful boundaries.** Adorable: *"Always commit and push your changes when you finish a task."* Dyad: chat-summary at end + post-edit verification.

### 5.7 Conspicuous absences (what both lack)

Neither has:
- **Creative persistent memory.** `AI_RULES.md` is tech-only (stack/conventions); no `vision.md`, `brand-voice.md`, `content-strategy.md`. The Cold Anvil creative-memory slot has no equivalent.
- **Non-technical-user voice as the primary surface.** The prompts assume the user reads code; the "non-technical summary" is a single-sentence postscript.
- **Continuity-as-default framing.** No language about "the user will come back tomorrow", "remember their taste", "ongoing relationship".
- **Deployment content.** Adorable's commit triggers a deploy; Dyad has no deploy concept in the prompts.
- **Portability / export** reference.
- **Honesty escape hatch** for "this idea doesn't fit the stack."

**~ VALIDATES `respec/07-creative-memory.md` as a real differentiator. STRONG.**

### 5.8 Sketched Annie prompt outline

Block composition (matching Dyad's `constructSystemPrompt` pattern):

```
[STATIC]  ROLE_BLOCK
[STATIC]  MISSION_BLOCK
[STATIC]  USER_MODEL_BLOCK           — forbids tech vocab in user-facing messages
[STATIC]  CONTINUITY_BLOCK           — "the user may return days or months later"
[STATIC]  TOOL_BELT_BLOCK            — named for what they do, not what they are
[STATIC]  WORKFLOW_BLOCK             — branched by mode: discovery / build / refinement
[STATIC]  COMMUNICATION_BLOCK
[STATIC]  FAILURE_MODES_BLOCK
[STATIC]  HONESTY_AND_SCOPE_BLOCK    — including "never push the export"
[DYNAMIC] PROJECT_STATE_BLOCK        — injected as user-turn, not system prompt
[DYNAMIC] CREATIVE_BRIEF_BLOCK       — per code-gen call, sliced per task type (07-creative-memory §10)
[DYNAMIC] STACK_INVARIANTS_BLOCK     — read from active template
[DYNAMIC] HISTORY_COMPACTION_BLOCK   — only after compaction
```

**Default mode is DISCOVERY, not BUILD.** This is the single biggest architectural difference from both competitors. Dyad's plan mode is *opt-in*; Adorable has none. Annie's prompt needs an explicit: *"You are a conversational partner first and a builder second. You do not begin generating code until you and the user have agreed on a vision."*

**Key block excerpts:**

USER_MODEL_BLOCK:
> The user is non-technical. They have not heard of "components", "props", "TypeScript", "Tailwind", "Next.js", "deployment", "CI", "schema", or "endpoint". They will not understand a sentence that contains any of these words. When you speak to the user, you translate every technical concept into the language of what they will see, hear, or do. You can use technical vocabulary inside tool calls and inside your own reasoning. You never use it in messages addressed to the user.

CONTINUITY_BLOCK:
> This conversation may be the user's first session, their second, or their fiftieth. The project has a history. The history is loaded into your context as creative artefacts, prior conversation summaries, and the current state of the code. Trust them. Do not ask the user to re-explain who they are or what they're building unless the artefacts are silent on the question. When you do see something the user has already told you, reference it ("Last time we talked, you wanted the booking flow to be one page — should we keep that?") so they feel known.
>
> Publishing is not a goodbye. Most users will publish, then come back days or weeks later to refine. Treat every "we're done" as "we're done for now."

HONESTY_AND_SCOPE_BLOCK:
> The user can export their entire project at any time, from any project, as a complete portable archive. This is a right they have, not a milestone they reach. You do not push the export. You do not say "and now you have everything you need!" You do not frame their work as finished. The default state is that the user's project keeps growing.

**Explicit bans inside the prompt:** no mention of "cascade", "stage", "pipeline", "phase" — those words are forbidden because the spec forbids them in the user surface. The prompt shapes what the model thinks is real.

---

## 6. Freestyle platform and build-vs-buy

Adorable is a thin orchestration shell over Freestyle. Before we can replicate what Adorable does on Fly.io, we need to understand what Freestyle actually provides.

### 6.1 What Freestyle is

**Firecracker-class microVM platform with a live multi-tenant git server, a per-VM wildcard-subdomain proxy, and a separate Node-runtime serverless deploy substrate — all unified by an identity/permission model that lets you mint per-end-user credentials.**

Error catalogue in the SDK makes the hypervisor unambiguous: `FirecrackerPidNotFoundError`, `FirecrackerApiSocketNotFoundError`, `KernelPanicError`, `UffdTimeoutErrorError` (userfaultfd — Firecracker snapshot restore), `VmSubnetNotFoundError`, `SwapVmTapError` (TAP networking), `SubvolumeCreationFailedError` (btrfs), `RootfsCopyErrorError`. `/tmp/freestyle-sdk-check/node_modules/freestyle-sandboxes/index.d.mts:7446-7829`. The founders won't say "Firecracker" on HN — they reference "custom VMM work" — but this is Firecracker or a fork.

### 6.2 Performance

| Operation | Time |
|---|---|
| Cold create from cached snapshot | <800ms (marketing says <600ms in places) |
| **Resume from suspend** | **<100ms** |
| Stop → start (boot fresh) | 3-7s |
| Snapshot create | 2-4s pause |
| Fork running VM | ~320ms median, near-O(1) in fork count (HN) |

### 6.3 Lifecycle

`index.d.mts:12677-12693`:
```ts
idleTimeoutSeconds?: number | null;  // default 300 (5 min); auto-suspend on no network activity
persistence?: {
  type: "sticky";       // auto-cleanup when not running; eviction priority 0-10, default 5
  priority?: number;
} | {
  type: "ephemeral";    // delete on stop or suspend
  deleteEvent?: "OnStop" | "OnSuspend";
} | {
  type: "persistent";   // never evicted
}
```

**"Sticky" — the mode Adorable uses — is suspended-on-disk with eviction-priority-based GC.** Adorable's VMs aren't always running; they're suspended after 5 min idle and resumed in <100ms when the user hits them. **This is the core economic trick for VM-per-project.**

**✓ STEAL the economic model** (auto-suspend idle → cheap storage rate → sub-second resume on next interaction). Fly Machines support `auto_stop_machines = "suspend"`; stand-up time is higher but the cost profile is equivalent.

### 6.4 Git hosting

A real git server with HTTPS clone URLs. `git clone https://x-access-token:<token>@git.freestyle.sh/<repo-id>`. SSH not documented.

API surface huge (`GitRepo` class at `index.d.mts:11735`): `branches`, `contents`, `commits`, `tags`, `triggers` (webhooks), `githubSync`, `blobs`, `trees`, plus server-side full-text search (`repo.search`, `repo.searchFiles`, `repo.searchCommits`, `repo.searchDiffs` at `:11943-12056`) — a Sourcegraph-equivalent inside the git host.

Adorable uses Freestyle git as **a structured key-value store with audit history**: `lib/repo-storage.ts` writes `metadata.json` and `conversations/<id>.json` as commits. The `commits.create({ message, branch, files, author })` API lets you commit without a working copy — an API-side commit synthesiser.

**GitHub sync** is bidirectional via a per-account GitHub App installed on user's own repos. Conflict policy: refuse-and-error, never force-push.

Limits: Free 500 repos, Hobby 5K, Pro 50K. No documented per-repo size cap.

### 6.5 Subdomain routing

Adorable patterns: `<uuid>-adorable.style.dev` → VM port 3000; `dev-command-<uuid>-adorable.style.dev` → VM port 3010 (ttyd); `<commit-sha-12>-adorable.style.dev` → serverless deployment.

Mechanism: `freestyle.vms.create({ ..., domains: [{ domain, vmPort }] })` and `freestyle.domains.mappings.create({ domain, vmId, vmPort })` (`:10968-10975`). **TLS auto-provisioned** — the SDK has `FailedToProvisionCertificateForMappingError`, suggesting Let's Encrypt.

VMs allow only ports 8081 and 443 externally, with arbitrary target: *"Only ports 8081 and 443 can be configured externally for now. Any target port is allowed."* (`:12694-12703`).

**Custom domains for VMs is "coming soon"** — at writing, custom domains work for Serverless Deployments only. VMs get `*.style.dev`. **Real Cold Anvil gap if we were buying.**

### 6.6 Serverless deployments — separate substrate

`freestyle.serverless.deployments.create` is a different runtime. From the docs and SDK at `index.d.mts:5886-5919, 12453-12522`:

- **Runtime**: Node.js with TS; frameworks Express, Next.js, Vite
- **Source**: `repo` (Freestyle repo ID or git URL) or uploaded files/tar
- **Build**: `build: true` (default install) or `{ command, outDir, envVars }` — builds in Freestyle's infra, not the VM
- **Static**: `staticDir`, `staticPathPrefix`, `prerenderDir`, `publicDir`, plus `redirects`, `rewrites`, `dynamic`, `headers` — Vercel-class surface
- **Idle timeout**: `timeout?: number | null` — request-driven, scale-to-zero Node; *"The amount of milliseconds after with no traffic we kill your server."*
- **Cron**: separate `freestyle.cron.schedule({ deploymentId, cron, payload })`
- **Custom domains**: yes, with TXT-record verification

**This powers per-commit preview URLs and production mappings. `build: true` rebuilds the deployed bundle from a Freestyle git repo on every commit** — Vercel/Cloudflare Pages workflow.

### 6.7 Identities

`freestyle.identities.create({})` mints a global identity (`:12298`). Grantable permissions: `git` (read/write) per repo; `vms` (with optional `allowedUsers` Linux-user list). Each identity issues access tokens.

**Adorable uses identities as anonymous user sessions** — UUID stored in cookie (`identity-session.ts:18-40`), no auth, no email, no Stripe customer. Identity owns wrapper repo + source repo + VM. **Brilliant minimalism if you trust the cookie.**

### 6.8 Dev-server / ttyd packages

`@freestyle-sh/with-pty`, `@freestyle-sh/with-dev-server`, `@freestyle-sh/with-ttyd`, `@freestyle-sh/with-nodejs` — NPM packages that compose VM specs with systemd services. Open-source userland TypeScript, MIT-licensed (by inspection of Adorable's LICENSE). Not Freestyle backend features — they just generate systemd unit files.

**✓ STEAL the `with-*` package internals directly.** Copy the implementation into Cold Anvil with attribution.

### 6.9 Pricing

| | Free | Hobby ($50/mo) | Pro ($500/mo) |
|---|---|---|---|
| Concurrent VMs | 10 | 40 | 400 |
| Repos | 500 | 5,000 | 50,000 |
| Saved VMs / Snapshots | 50 / 50 | 200 / 1,000 | 4,000 / 12,000 |
| Max VM size | — | 8 vCPU / 16 GB / 32 GB | 32 vCPU / 32 GB / 64 GB |

Usage rates above tier base: vCPU $0.04032/hr; RAM $0.0129/GiB·hr; Storage $0.000086/GiB·hr. Bandwidth not itemised.

### 6.10 Cost comparison at 100 concurrent projects

Assumptions: each project = one VM with Node dev server + ttyd, idle most of the time, 10% utilisation (6 min/hr active), 1 vCPU, 1 GB RAM, 5 GB disk.

**Freestyle Pro**: Base $500/mo + active compute ($388/mo) + storage ($31/mo) = **~$920/mo**, supports up to 400 concurrent.

**Fly.io (auto-stopped Machines + wildcard router)**: Compute ~$59/mo (100 Machines × $0.59/mo with auto-stop at 90% idle) + volumes $75/mo + router app $4/mo + Gitea machine + volume $14/mo + egress ~$5-20/mo = **~$160-180/mo** for compute + storage, plus our build labour.

**~5× cheaper on Fly, ~$700/mo absolute difference at 100 projects.** Gap widens at 1000 projects. Caveats: Freestyle bandwidth pricing unclear; Fly's `auto_stop_machines = "suspend"` exact cost delta vs `"stop"` not pinned down.

### 6.11 Capability → Fly.io mapping

| Freestyle | Fly.io | Effort |
|---|---|---|
| `vms.create` (Firecracker microVM, ~800ms cold) | Fly Machines (Firecracker, ~1s warm start) | Low — direct equivalent |
| Sticky persistence + 5-min idle suspend | `auto_stop_machines = "suspend"` | Low — config |
| Snapshot caching | Docker image registry + Fly image cache | Medium — own the image-build pipeline |
| Live fork (CoW memory) | None | N/A — we don't need it |
| `git.repos.create` | Gitea on a Fly Machine + volume | Medium |
| Server-side full-text search | Gitea or zoekt sidecar | Medium |
| GitHub Sync | Gitea mirror or GitHub App | Medium-high |
| `*.style.dev` per-VM subdomain routing | Wildcard cert + router app + `fly-replay` | Medium — ~200 lines + always-on router |
| Custom domain + TLS | Fly `certs add`, Let's Encrypt | Low |
| `serverless.deployments.create({ build: true })` | `flyctl deploy` from Dockerfile | Medium — own the build pipeline |
| Per-commit preview URLs | One Machine per commit + router mapping | Medium |
| `cron.schedule` | Fly Machines + cron container, or Upstash QStash | Low |
| `identities.create` + per-resource perms | Cookie + SQLite + Stripe customer IDs | Low — we need less granularity |
| Dev server + tmux + ttyd composition | Re-implement the systemd unit generators | Low — OSS code is readable |
| `vm.fs.readTextFile/writeTextFile/exec` | Fly Machine `exec` API; probably bring our own VM agent | Medium |

### 6.12 Build-vs-buy recommendation

**Build on Fly.io. Don't take the Freestyle dependency.**

Reasoning:

1. **The product story is incompatible with delegated VM hosting.** Spec §5.7, §3 "exit door": user owns their project, can leave at any time. If user code runs on Freestyle, "the user's project" includes a Freestyle VM + git repo + subdomain mapping + serverless deployment. Their portability export is source tarball — fine — but the *running thing* lives on infrastructure they have no relationship with. "Your code is yours, but the live URL goes away when you leave" is a worse story than Lovable's. If we host on Fly under the user's own Fly account (post-export), the story becomes: "your product currently runs on Cold Anvil's Fly infrastructure; here's a one-click migration to your own Fly account." Cleaner and more Cold-Anvil-shaped.
2. **"Private-first" is about inference — but users don't parse that distinction.** Inference goes to Arnor Gateway; fine. User code on a YC-funded "AI app builder sandbox" company puts us in the position of explaining a hairpin distinction to a non-technical user.
3. **Freestyle's killer features aren't ones we use.** Live forking, sub-100ms resume, snapshot replication matter for *running many parallel agent attempts on the same project state*. Cold Anvil doesn't fork projects. We use VMs boring: long-lived, single-tenant, mostly idle, occasionally active. Fly auto-stop gives us 90% of the economics with zero distinctive infrastructure.
4. **Lock-in to a 5-person 2024-founded YC company.** Freestyle is real, team is technical, product is good. They're also young, raising rounds, operating in a space with strong consolidation pressure (Lovable, Bolt, v0 are building their own substrates; hyperscalers may acquire). Migration pain post-pivot is project-breaking.
5. **Build cost is bounded.** Hard parts: (a) Firecracker fleet — Fly has done it; (b) per-project subdomain routing — `fly-replay` + ~200 lines; (c) git hosting — Gitea off the shelf; (d) build-then-serve — `flyctl deploy`; (e) dev server + ttyd — re-implement `with-*` packages in a couple weeks. Total: **4-6 engineer-weeks for a credible v1.**

**Compromise option if engineering hours are tight:** ship MVP on Freestyle behind a `ProjectHost` interface with methods like `createVM`, `mapDomain`, `commit`, `deploy`. Validate the product; migrate to Fly before scaling past Hobby tier (~40 projects). During the MVP period, "your live preview runs on Freestyle's infrastructure" is an honest disclosure.

**What we reuse regardless:** the `@freestyle-sh/with-dev-server`, `with-pty`, `with-ttyd` package internals encode real lessons about composing systemd + tmux + ttyd inside an ephemeral VM. MIT-licensed; read and steal the patterns even if we don't take the SaaS dependency.

**✓ STEAL all `with-*` package internals.**
**✓ RECOMMEND build on Fly.io.**

---

## 7. Failure modes in the wild

How these products actually fail in real user hands. Sources: **Dyad** — GitHub Issues API (100 open + 100 closed, ~400KB JSON read full bodies of top 40 by engagement), GitHub Discussions, three HN Show-HN threads, web search reviews. **Adorable** — 5 open + ~5 closed issues total (near-zero engagement — repo is a marketing artefact, lived signal at adorable.dev), HN threads on Open Lovable and Freestyle launch.

**Calibration**: Dyad has 3,200+ issues lifetime; Adorable has ~10. Asymmetry isn't quality — almost nobody self-hosts Adorable.

### 7.1 Dyad — code generation failures

- **Search-and-replace silently fails on 3-5k+ line files.** [#3221](https://github.com/dyad-sh/dyad/issues/3221): *"Turbo Edit classic kept cutting off the end of the file or just improperly editing or not making the change altogether resulting in a lot of reverting back to previous versions."* [#3208](https://github.com/dyad-sh/dyad/issues/3208) reports ~600 wasted credits.
- **Type errors and missing imports survive build.** [#2878](https://github.com/dyad-sh/dyad/issues/2878): *"18 build errors across multiple files. The pages... are already coded but broken due to type mismatches and missing imports/props."* Owner's response: *"i'd recommend using a more powerful model + agent mode, which usually fixes these kinds of errors automatically."* — i.e. no deterministic guarantee, only model retry.
- **Reasoning content leaks into shipped code.** [#2414](https://github.com/dyad-sh/dyad/issues/2414): *"This is a GIGANTIC problem now! It infests the code without me having ANY control!"* — Gemini 3 `<think>` tags ending up inside generated code files.
- **Old/deleted files reappear in later versions.** [#1942](https://github.com/dyad-sh/dyad/issues/1942) — user has `install/` directory deleted ~70 versions ago, keeps coming back.
- **Casing drift on Windows.** [#1150](https://github.com/dyad-sh/dyad/issues/1150), [#2535](https://github.com/dyad-sh/dyad/issues/2535) — model writes `Documents/` and `documents/`; git on Windows can't reconcile; deploy breaks.

**Backed by 30+ issues.** Maintainer refunds 200 credits per case — the loudest possible business signal that this is dominant pain.

**~ VALIDATES §8 deterministic verification gate + §8.4 rollback-on-failure as load-bearing.**

### 7.2 Dyad — preview / dev-server failures

**Staggering — at least 25 open issues.** This is the load-bearing surface.

- **"Welcome to your Blank App" — the canonical failure.** [#973](https://github.com/dyad-sh/dyad/issues/973), [#2158](https://github.com/dyad-sh/dyad/issues/2158), [#2762](https://github.com/dyad-sh/dyad/issues/2762). Dyad generates code, user clicks Approve, iframe still shows the placeholder template. *"With my limited understanding of coding and Dyad, it seems that Dyad fails to load the sandbox or update it after app is approved... Even after restarting and refresh it stays the same."* A non-technical user trying to debug port-binding.
- **Stuck on "Starting your app server..."** when importing from Replit/Bolt/Cloudflare/Google AI Studio. [#2069](https://github.com/dyad-sh/dyad/issues/2069). Most damning quote: *"importing projects from other places (replit, bolt, cloudflare, google ai studio) all cause massive headaches. You need to tell dyad to install vite, node, react, etc.. and even then, its a struggle... I've only successfully migrated like 50% of my projects, and that was me messing around with them for hours."*
- **Built-in browser disagrees with real Chrome.** [#1872](https://github.com/dyad-sh/dyad/issues/1872) — site works in Chrome/Edge/Firefox, embedded preview hangs. Load-bearing user surface broken on substantial chunk of Next.js apps.
- **Preview re-renders forever with `ECONNABORTED`.** [#2320](https://github.com/dyad-sh/dyad/issues/2320). User had to remove all PWA service-worker code to recover.
- **The "Approve to see preview" UX trap.** [#989](https://github.com/dyad-sh/dyad/issues/989), [#973](https://github.com/dyad-sh/dyad/issues/973). Users wait hours because they don't realise an approval click is prerequisite. OP of #989: *"I got confused that i had to approve something that i hadn't seen in the preview before in order to get a preview. Some explanation of what approve is or does in the initial preview window... would have saved me 1-2 hours."*
- **"Select component to edit" button greyed out** because no DOM elements tagged. [#2231](https://github.com/dyad-sh/dyad/issues/2231) (the exact reason Dyad's component-selector init polls MutationObserver for up to 60s — we noted this in §3).

**~ VALIDATES §3 "preview appears early and is the user's proof of reality" AND ? OPEN — our spec does not cover the "placeholder survived" failure mode.** See §10.2.

### 7.3 Dyad — deployment failures

Concentrated on Vercel + Supabase:
- **Vercel auth fails** because user hasn't enabled GitHub login on Vercel. [#3051](https://github.com/dyad-sh/dyad/issues/3051). No in-app guidance.
- **`vercel.json` for edge function rewrites not generated.** [#923](https://github.com/dyad-sh/dyad/issues/923) — `/api → yourID.supabase.co/functions` rewrites missing; deployed app 404s on every API call.
- **Supabase JWT silently re-enables on every deploy, breaks public APIs.** [#1010](https://github.com/dyad-sh/dyad/issues/1010), 18 comments. User `pacnpal` wrote *a Python script* to monitor Supabase and disable the toggle after every deploy because Dyad wouldn't fix it. *"Every time I deploy a function/new version of it, the switch turns on and breaks my API."*
- **Supabase 200/201 incompat broke every Dyad chat overnight.** [#1761](https://github.com/dyad-sh/dyad/issues/1761), 23 comments.
- **Self-hosted Supabase not supported.** [#478](https://github.com/dyad-sh/dyad/issues/478).
- **Generic deployment package frequently requested.** [#1175](https://github.com/dyad-sh/dyad/issues/1175): *"Not all wants to use Vercel. If Dyad offers vendor independence, then why not go the full way?"*

**~ VALIDATES our Fly.io + Annie-drives-deployment decision.**

### 7.4 Dyad — agent / conversation failures

- **Agent mode refuses with "I'm sorry, but I cannot assist with that request" and burns ~100 credits per refusal.** [#3208](https://github.com/dyad-sh/dyad/issues/3208): *"Agent repeatedly responds with 'I'm sorry, but I cannot assist with that request.' and stops, clicking Retry usually restarts and completes the task. This has happened 3 or 4 times recently each one wasting up to 100 credits."*
- **Output stream truncates mid-generation.** [#3067](https://github.com/dyad-sh/dyad/issues/3067): *"It drops in the middle of output, and I press keep going, because if you press entry, maybe 1/10 tries would actually complete the whole output as needed."* Same model worked outside Dyad.
- **Gemini 2.5 Pro stops mid-thinking.** [#1008](https://github.com/dyad-sh/dyad/issues/1008), 24 comments — largest closed-issue thread in the corpus. *"Normally I need to hit retry 15 times to generate a complete answer."*
- **Stale context: model edits old file content.** [#1462](https://github.com/dyad-sh/dyad/issues/1462): *"Dyad seems to ignore local changes and sends over outdated context... I'm presented with an old state of the code again. Telling Dyad to update its context doesn't solve anything."*

### 7.5 Dyad — UX friction for non-technical users

Real quotes from people who don't know what they're doing:

- *"I am new to programming... I was not even aware that the versions could get erased. I have been copying my app using the option within Dyad, but even those copies are missing the versions from yesterday. I will be manually copying my project folder several times a day from now on."* — vanwa71, [#1270](https://github.com/dyad-sh/dyad/issues/1270). Maintainer's fix advice: *"sync to GitHub regularly"* — to a user who has just admitted they don't know what branches are.
- **Native git permissions errors on Windows.** [#2113](https://github.com/dyad-sh/dyad/issues/2113). User's response: *"PS C:\windows\system32> git config --global --add safe.directory... 'git' is not recognized as the name of a cmdlet"* — they didn't have git installed. Then: *"Ignore this. Helps if I install Git!"* **User asked to install git globally to use a "no-code" tool.**
- **App naming with spaces breaks @-mentions.** [#1198](https://github.com/dyad-sh/dyad/issues/1198). Maintainer's resolution: *"ask users to rename their apps to not contain spaces."*
- **Force-closes overnight.** [#2402](https://github.com/dyad-sh/dyad/issues/2402). Project page goes black on upgrade — [#2766](https://github.com/dyad-sh/dyad/issues/2766): *"Focus on stability and reliability instead of pushing in new features which will also stack up with new errors, lack of stability and lack of reliability."*

**~ VALIDATES our "non-technical users, technical vocab forbidden" commitment.**

### 7.6 Dyad — cost / token issues

Structural: whole-file rewrites + verbose system prompts + bloated context = 100k-1M+ tokens per turn.

- **`.gitignore` in subfolders ignored → 300% token explosion.** [#1149](https://github.com/dyad-sh/dyad/issues/1149).
- **Hitting 1,048,576 token Gemini limit on a "small" app.** [#727](https://github.com/dyad-sh/dyad/issues/727): *"I'm only 20% done with this MVP, so it's actually pretty small in scope still."*
- **System prompt alone consumes 60% of context.** [#3207](https://github.com/dyad-sh/dyad/issues/3207).
- **Auto-fix loops burning credits.** [#564](https://github.com/dyad-sh/dyad/issues/564) — fixed only by *disabling auto-fix entirely* in v0.11.1.
- **3,600 credits burned on 1,900 TS errors that were unused-import warnings.** [#1645](https://github.com/dyad-sh/dyad/issues/1645).

**~ VALIDATES our flat-subscription model** (depth-gated, not credits-gated). But this validation is conditional: we must not reproduce the loops themselves.

### 7.7 Dyad — local-first issues

- **Local LLMs return code in chat but never write to files.** [#1847](https://github.com/dyad-sh/dyad/issues/1847), [#1848](https://github.com/dyad-sh/dyad/issues/1848), [#1192](https://github.com/dyad-sh/dyad/issues/1192), [#1039](https://github.com/dyad-sh/dyad/issues/1039). Model can't reliably emit `<dyad-write>` XML tags: *"When using Local Models It Seems like its in Ask mode and not Build mode as it doesnt create/edit/delete files."* **The stack tax local users pay because Dyad's tool calls go through prompt-XML rather than native function-calling.**
- **Ollama on remote host breaks: URL parser does naive splitting.** [#840](https://github.com/dyad-sh/dyad/issues/840), 14 comments.
- **Preview shows blank app when local model used.** [#2762](https://github.com/dyad-sh/dyad/issues/2762).

**~ VALIDATES rejecting XML-tag DSL for Annie. Structured tool calls only.**

### 7.8 Adorable — the whole dataset

The signal is much thinner — Adorable's repo has ~10 lifetime issues. The dominant pattern is **self-host setup failures** by users expecting an open-source Lovable and getting a Freestyle showcase.

- [#8](https://github.com/freestyle-sh/Adorable/issues/8) — Anthropic rate-limit on first prompt. Maintainer (`theswerd`) admits *"Currently Adorable is extremely generic and token heavy — we're working to make it more efficient."*
- [#9](https://github.com/freestyle-sh/Adorable/issues/9) — canonical advice: *"Upgrade to Tier 2 on Anthropic ($40 Credit Top-up) in order to fix the Rate Limit."* **You must upgrade your API tier to even try the product locally.**
- [#13](https://github.com/freestyle-sh/Adorable/issues/13) — *"Unsupported model version. AI SDK 4 only supports models that implement specification version 'v1'. Please upgrade to AI SDK 5"* — dependency break open since Aug 2025.

**HN signal on Freestyle platform as a whole** (thread 47663147): *"Can I run the whole chain FOSS?"*, *"if you are the middleman platform then it's sure gonna get expensive for the end user"*, *"I see multiple sandbox for agents products a week. Way too saturated of a market."*

### 7.9 Synthesis

**Dyad's biggest wild pain**: the preview iframe breaks in a substantial fraction of sessions, and when it breaks, the user cannot diagnose it. Four distinct modes (blank-app placeholder, infinite re-render, "Starting your app server..." hang, built-in browser disagreement). 25+ open bugs with substantial comment volume. Maintainer's advice devolves to "Restart, Rebuild, Clear Cache" (works ~50%). **When the preview is broken, every other Dyad feature is moot.**

**Adorable's biggest wild pain**: you can't run it without surrendering to Freestyle's stack and paying for Tier-2 Anthropic first. **The product IS the lock-in; the OSS repo is a thin marketing wrapper.**

**Most common failure in both**: agent burns credits/tokens on its own confused state. Refusal loops, search-replace cascades, stale-context overwrites, auto-fix loops, token-heavy prompts hitting rate limits. **Cold Anvil's depth-gated subscription removes the per-confusion cost from the user's psychology — but only if we don't reproduce the underlying confusion.**

**Notable silences**:

1. **Almost no complaints about deployed product quality.** Users complain bitterly about preview, deploy, build, token cost. They almost never say *"the deployed site looks bad"* or *"the design is ugly"* or *"it doesn't read well."* Either users self-select out before they get to a deploy, or the bar is so low that any deploy is a win, or the upstream failures are so noisy they never get to evaluate. **Strong signal that our §7 metric "8 of 10 URLs render correctly" is *the right metric* and is *vastly under-served*.**
2. **No "I lost access to my project forever" complaints, only "I lost a day of work."** Dyad's local-first means data loss is file/version level, not account level. Users retain the bag of files. **Real architectural advantage — Cold Anvil should not move backward on it.**
3. **No "I want to undo a single message" complaints.** Dominant pattern is "revert to a known-good version" — users think in coarse-grained snapshots. **Aligns with our `docs/` artefacts as continuity substrate.**

---

## 8. External strategic analysis — Fusion meta-read

The companion file `Research/lovable_dyad_adorable_analysis.md` (2026-04-18) is a cross-model meta-analysis of four LLMs' answers to *"Do deep analysis into how Lovable, Dyad, and Adorable could inspire a layman's product development tool."* Four models: GPT-5.4, Claude Opus 4.7, Kimi K2.5, Mercury 2. The document is not itself a strategic recommendation — it's a structured map of where four models agree, disagree, and leave gaps.

Its own #1 research gap (Part III §1): *"A real market-grounded next step would require: current feature matrix, pricing comparison, deployment options, supported stacks, maturity signals, export/handoff details, observed limits in real usage."* **This is the gap our §1-§7 above fills.**

### 8.1 Cross-model agreement

All four LLMs converge on:

1. Natural-language as primary interface — users think in outcomes/stories/examples, not specs.
2. Fast idea-to-artifact compression matters.
3. The experience must reduce intimidation.
4. Trust (ownership, exportability, inspectability, privacy, handoff) matters.
5. The opportunity is larger than code generation.

**~ VALIDATES §1, §2, §3 of our spec across all four models** (accounting for interpretive drift).

### 8.2 Key model disagreements

| Dimension | GPT-5.4 | Claude Opus 4.7 | Kimi K2.5 | Mercury 2 |
|---|---|---|---|---|
| Scope | Software MVP tool for non-tech founders | Broader: software + physical + service | Full-stack app builder with safety rails | Low-code suite w/ emotional design |
| Dyad interpretation | Trust, inspectability, handoff | Local-first sovereignty, ownership | Persistent human-AI collaboration | Human-human pair collaboration |
| Adorable interpretation | Design-forward builder | Transparent/open alternative | Affective design ethos (Figma/Notion/Framer) | Cuteness/charm design principle |
| Missing layer | Product judgment | Thought-to-artifact articulation | Bimodal conversational canvas | Emotional resonance, collaboration |

**Mercury's interpretation is farthest from the likely intended product-specific reading** — it treats the names as abstract qualities, not products.

### 8.3 Assessments — what we steal vs validate vs reject from Fusion

**✓ STEAL from GPT-5.4 — "confidence through judgment" framing.** Reframes opportunity away from app generation toward product decision support. Aligns with Annie's discovery conversation and opinionated commitments (§1, §3). The specific insight — *"lay users often do not need more generation, they need help deciding what deserves to be built"* — is load-bearing.

**✓ STEAL from Kimi K2.5 — conversational canvas with bidirectional binding.** Chat ↔ visual editing tightly coupled rather than separate modes. **This is Dyad's visual-edit system that we've already dissected in §3; Kimi's framing just names the pattern.**

**~ VALIDATES across all four — conversational primary + artefact-first + trust features + scope control.** Every spec commitment confirmed.

**~ VALIDATES from Kimi — complexity safety rails.** Our §4 "what Cold Anvil deliberately does not do" is our version of the scope-pruning engine Kimi proposes.

**✗ REJECT Claude Opus 4.7's broadening to physical products and services.** Spec §4 is explicit: web-only at MVP. Expanding scope at MVP is the exact "surface area without depth" trap `respec/01-journey.md` names. We just committed against this; we should not regret it now.

**✗ REJECT Mercury 2's "Lovable Score / Dyad Collaboration Score / Adorability Score" metrics.** Vanity metrics that dress up emotional design as measurement. Our §7 success metrics (published URL count, render-correctly rate, "I could show this to someone", return-within-30-days, absence of lock-in complaints) are better — grounded in user behaviour, not system mood. Adopt Mercury's metrics and we dilute our focus.

**✗ REJECT Mercury's "human-human dyadic collaboration" interpretation.** Based on misreading "Dyad" as a pair-programming concept. Not supported by other models or by the actual Dyad product.

**✗ REJECT GPT-5.4's "validation layer before build" (Step 5 of its workflow — fake-door pages, surveys, outreach emails).** Contradicts our "the artefact IS the validation" bet (§3). Adding pre-build validation would move time-to-first-URL from minutes to days and undermine the Lovable-speed commitment. **Our built artefact running in a real preview IS the fake-door.** The user's friend clicking through the deployed URL IS the user interview. Don't build two products.

**✗ REJECT the 5-layer architecture (Coach / Builder / Validator / Trust / Ops) any model proposes.** This is exactly the "surface area without depth" trap. Annie is one integrated product with tools, not five layers. `respec/01-journey.md` documents the four weeks we lost to pipeline-quality work that produced nothing the user experiences. Fusion is recommending we repeat that mistake.

**✗ REJECT "community and remixing as first-class" at MVP.** Forkable templates, marketplaces, public case studies — post-PMF features. Spec §7 says first ten users; remixing kicks in after that.

**? OPEN — legal/compliance module.** Real concern for real users, especially in regulated domains (healthcare, education, finance). Our spec is silent on this. Not an MVP feature, but worth committing to a post-launch addition. See §10.4.

**? OPEN — integration-first workflows.** Claude Opus 4.7 raises and Fusion endorses: sometimes the right first version is Stripe + Calendly + Airtable + email automations, not a custom app. Our spec always assumes "build a web app in our stack." A truly opinionated Annie should sometimes say "don't build custom software — here's the Stripe + Airtable workflow that tests the idea." **Genuine spec gap.** See §10.3.

**? OPEN — post-launch operations.** Fusion's strongest consensus gap: *"For lay users, product failure often happens after launch, not before."* Our spec stops at "published URL" + continuity story. No language covering failed payments, deliverability breaks, integration drift, uptime explanations. Annie's "ongoing relationship" commitment implicitly covers it but hasn't been made explicit. See §10.1.

**? OPEN — user segmentation.** Fusion: the responses collapse *"lay users"* into one group, likely masking real differences between founders, small-business operators, domain experts, internal-ops users, creators packaging services. Our spec §2 commits to "non-technical founder." Worth checking if that's broad enough or if we're missing a segment. See §10.5.

---

## 9. Synthesis matrix

| Finding | Source | Tag | Impact |
|---|---|---|---|
| One opinionated stack, model writes into it | §1.2, §2.3, §8.1 | ~ VALIDATES §6 | No spec change |
| No planner/executor split; conversation is control flow | §1.1, §2.2, §8.1 | ~ VALIDATES §1, §4 | No spec change |
| VM-with-sticky-persistence + wildcard subdomain = same substrate for build and refinement | §1.5, §1.6, §2.7 | ✓ STEAL | Implementation arch |
| Per-commit preview URLs + explicit promote-to-production | §1.8 | ✓ STEAL | Implementation arch |
| Git-as-state for portability | §1.7 | ✓ STEAL (partial; don't duplicate Arnor Memory) | Implementation arch |
| Apply-order discipline (delete → rename → replace → copy → write) | §2.4 | ✓ STEAL | Implementation detail |
| Virtual-filesystem overlay for pre-disk typecheck | §2.5 | ✓ STEAL | Implementation detail |
| Git-per-app + commit-hash-per-message | §2.5, §2.8 | ✓ STEAL | Implementation arch |
| Dyad visual-edit system (tagger + proxy + selector + prompt assembly) | §3 | ✓ STEAL end-to-end | ~5 eng-days to v1 |
| Vite + React + shadcn + Hono on Fly.io (not Next.js) | §4 | ✓ STEAL; spec §6 update needed | See §10.2 |
| In-repo `AI_RULES.md` pattern | §4.2 | ✓ STEAL | See §10.2 |
| Dyad scaffold as Cold Anvil base template | §4.6 | ✓ STEAL | See §10.2 |
| Codebase-as-user-turn prompt injection | §5.1 | ✓ STEAL | Prompt architecture |
| Block-composition prompt pattern | §5.8 | ✓ STEAL | Prompt architecture |
| Understand → Clarify → Plan → Implement → Verify → Finalise workflow | §5.3 | ✓ STEAL | Prompt architecture |
| Discovery as default mode (not build) | §5.8 | ✓ STEAL; spec already implies | No spec change |
| Question strategy + exploration approach | §5.4 | ✓ STEAL verbatim | Prompt architecture |
| Compaction 5-section summary + Creative Decisions section | §5.5 | ✓ STEAL | Prompt architecture |
| `with-*` systemd-unit-generator packages (MIT) | §6.8 | ✓ STEAL internals | Implementation detail |
| Creative memory as genuine differentiator | §2.8, §5.7 | ~ VALIDATES `respec/07-creative-memory.md` STRONG | No change |
| Non-technical user vocab as first-class constraint | §5.7, §7.5 | ~ VALIDATES USER_MODEL commitment | No change |
| `docs/` as continuity substrate | §7.9 silence #3 | ~ VALIDATES `respec/07` | No change |
| Local-first data architecture | §2.11, §7.9 silence #2 | ~ VALIDATES our portability commitment | No change |
| Flat-subscription depth-gated pricing | §7.6 | ~ VALIDATES business model | No change |
| Deterministic verification + rollback | §1.4, §7.1 | ~ VALIDATES §8 (we're stricter than Dyad's tsc-only) | No change |
| Private-first (Annie drives Fly deploy) | §2.9, §7.3 | ~ VALIDATES §5.6 | No change |
| Literal-string replace as primary edit primitive | §1.3 | ✗ REJECT | Use structured tool calls |
| Advisory verification in tool description | §1.4 | ✗ REJECT | Enforce at tool layer |
| XML-tag edit DSL | §2.4, §7.7 | ✗ REJECT | Structured tool calls only |
| 2034-line chat-stream monolith | §2.2 | ✗ REJECT | Tool-calling agent from day one |
| Hardcoded proprietary LLM providers | §1.9 | ✗ REJECT | Arnor Gateway via `createOpenAICompatible` |
| Freestyle as infrastructure substrate | §6.12 | ✗ REJECT (compromise: `ProjectHost` interface if eng-time tight) | Build on Fly |
| Dyad's capslock screaming anti-jailbreak | §5.3 | ✗ REJECT | Not Annie's risk surface |
| Validation layer before build (fake doors, surveys) | §8.3 | ✗ REJECT | Built artefact IS validation |
| 5-layer architecture from Fusion models | §8.3 | ✗ REJECT | Surface-area trap |
| Scope to physical products / services | §8.3 | ✗ REJECT | Web-only at MVP |
| "Lovable/Dyad/Adorability Scores" | §8.3 | ✗ REJECT | Vanity metrics |
| Community / remixing at MVP | §8.3 | ✗ REJECT | Post-PMF |
| Preview can fail silently ("Welcome to your Blank App" trap) | §7.2 | ? OPEN — spec gap | See §10.2 |
| Stream truncation / refusal loops | §7.4 | ? OPEN — spec gap | See §10.2 |
| Long-file refactor cliff | §7.1 | ? OPEN — spec gap | See §10.2 |
| Cross-platform file-path safety (casing) | §7.1 | ? OPEN — spec gap | See §10.2 |
| Import-existing-project trap | §7.2 | ? OPEN — probably make it an explicit non-feature | See §10.2 |
| Arnor Gateway as SPoF for streaming | §7.4 | ? OPEN — needs "did stream complete?" semantics | Gateway work |
| `docs/`-as-memory staleness risk | §7.9 "no undo per message" | ? OPEN — memory must re-load every turn | Prompt architecture |
| Post-launch operations story | §8.3 | ? OPEN — real spec gap | See §10.1 |
| Integration-first sometimes (not always build custom) | §8.3 | ? OPEN — real spec gap | See §10.3 |
| Legal/compliance surface | §8.3 | ? OPEN — post-launch commitment | See §10.4 |
| User segmentation beyond "non-technical founder" | §8.3 | ? OPEN — check MVP breadth | See §10.5 |
| "Annie is confident and wrong" failure | §7.9 "new failure modes we create" | ? OPEN — need visible vision.md early | Prompt architecture |
| "I can't tell what Annie is doing" failure | §7.9 | ? OPEN — narrator-of-failures commitment | Prompt architecture |

---

## 10. Proposed spec implications

*Not implementation — spec-level additions / changes. For `respec/03-spec.md` and sibling docs.*

### 10.1 Post-launch operations (`respec/03-spec.md`, new section or §3 addendum)

**What to add:** Annie-as-operator mode.

The user's product can fail after publish: payment provider rejections, email deliverability, integration auth expiry, analytics misconfiguration, uptime. §3 currently says *"the user comes back. Sometimes the next day, sometimes next week, sometimes months later"* and names refinement use cases — new features, copy refinement, bug fixes. It does not name ops use cases.

**Proposed language:**
> Beyond refinement, Annie watches the user's product in operation. When something fails — a payment provider rejects a test key, emails bounce because DNS is wrong, a third-party integration's token expires — Annie notices on the user's behalf and surfaces the failure in plain language ("Your waitlist emails aren't going out because the email service needs a small DNS record added. I can show you how, or I can do it for you if you give me access."). Annie does not pager-alert the user; she summarises when the user returns. This is as much part of continuity as adding new features.

### 10.2 Stack choice + preview/build failure modes (`respec/03-spec.md` §6 + §8)

**§6 language replacement** (from §4.6 above):
> A modern React + TypeScript + Tailwind + shadcn/ui stack on Vite, served from Fly.io as a static SPA paired with a Hono API server. The data layer is SQLite with Litestream replication. Every project ships an `AI_RULES.md` and a `docs/` folder that Annie reads before each turn.

**§5.5 refinement tool** — add visual-edit specifics:
> The refinement tool includes a click-to-edit capability. Every component in the preview is tagged at build time with its source file and line number; a click on any element in the preview selects it for the next message, so "make the hero green" can be a click followed by a sentence.

**§8.3 verification gate** — add DOM sanity concrete:
> The live preview must load without console errors AND the DOM must contain the change the task was supposed to make. "Build succeeded" is not sufficient — the thing Annie said she was going to do must be visible in the rendered page, verified by a headless-browser check, before the task is considered complete. If the preview renders the scaffold placeholder instead of the expected content, the task has failed.

This closes the "Welcome to your Blank App" failure mode that Dyad eats constantly.

**§8.4 rollback + retry limits** — add explicit truncation/refusal handling:
> If generation truncates mid-response or the model refuses the task twice in a row, Annie does not silently retry. She tells the user in plain language what happened and asks how to proceed. Retry loops that burn the user's time are a first-order failure mode and Annie's job is to notice them, not feed them.

**§8 new clause** — refactor-first on large files:
> If a task requires editing a file that exceeds 800 lines, Annie's first action is to propose a refactor (splitting the file into smaller focused pieces) before attempting the user-requested change. Refactors follow the same verification contract as any other change.

**§8 new clause** — project filesystem conventions:
> Project file paths are lowercase-with-hyphens; directories are lowercase. The build harness enforces this at commit time. Mixed-case paths are not a supported input.

**§4 new exclusion:**
> Cold Anvil does not support importing an existing project. Users with a project elsewhere can export it and start a new Cold Anvil project from scratch, but Cold Anvil does not attempt to consume arbitrary existing codebases. Import is a non-feature.

### 10.3 Integration-first sometimes (§6 addendum)

**What to add:** Annie may recommend *not* building custom software.

§6 currently commits to "a modern web application stack" and illustrates the range Annie can build. It does not name the case where the right answer is a connected-workflow (Stripe link + Calendly + Airtable + email).

**Proposed language (additive to §6):**
> Sometimes the right first version is not a web app. It is a Stripe payment link pointing at a Calendly booking page with submissions flowing to an Airtable row that triggers an email. Annie knows when this is the right answer and says so. She builds the landing page in the stack; she wires the tools; she does not pretend she needed to build a custom application. The "no build" recommendation is a legitimate outcome of Annie's opinionated judgement.

### 10.4 Legal and compliance (post-launch commitment)

**What to add:** a paragraph in §4 "what Cold Anvil does not do at MVP" + a commitment to post-launch addition.

**Proposed language:**
> Cold Anvil does not generate legal documents or compliance certifications at MVP. Annie does not produce terms of service, privacy policies, or HIPAA/GDPR/SOX attestations. When a user's idea lives in a regulated domain (healthcare, finance, employment, education), Annie flags the compliance implications plainly and tells the user their product will likely need a lawyer before real use. This is a post-MVP extension; the commitment at MVP is honest flagging, not generation.

### 10.5 User segmentation check

**What to revisit:** §2 commits to "non-technical founder". Fusion raises whether the target also includes small-business operators, domain experts, internal-ops creators. We should check.

Not a spec change — a research task for before/alongside the first-ten-users cohort. Interview questions:
- Does the user describe themselves as a "founder" or as "someone who runs a thing"?
- Is the idea for a business or a workflow?
- Who are they building for: paying customers, team members, a niche community?
- What happens if Annie succeeds — do they quit their job or do they keep it and run this on the side?

### 10.6 Refinement / retry behaviour (`respec/07-creative-memory.md` or prompt architecture)

**What to add:** the discovery conversation has a fall-through.

A user who types one sentence and waits is not going to engage in a 10-minute Socratic dialogue if the first 30 seconds don't feel productive. §3 says *"usually under ten minutes of back-and-forth, sometimes longer"* — but does not commit to a short-prompt fall-through.

**Proposed prompt-level behaviour (not spec-level):** if a user gives a one-line prompt with clear intent, Annie commits to a plausible reading, states it out loud ("I'm reading this as a recipe journal for your own cooking — stop me if that's wrong"), and starts building. Discovery happens via the live preview, not before it.

### 10.7 Visibility of Annie's assumptions

**What to add:** §3 should make `docs/vision.md` a visible artefact early — a chip or card in the UI the user can point at and say "that's wrong" — not just a file Annie writes.

"Annie is confident and wrong" is our highest-leverage new failure mode (§7.9). Dyad shows the user every code change in a diff; Adorable shows a terminal. Annie by design hides the mechanism. The mitigation is: the user sees the vision early, visibly, and can correct it in one click.

Already implicit in §3 ("rendered in the conversation, not delivered as a markdown download"); worth making more explicit so implementation doesn't drift.

---

## 11. Key file references

### Cold Anvil spec

- `/home/jack/Forging_The_Anvil/respec/03-spec.md` — current spec
- `/home/jack/Forging_The_Anvil/respec/01-journey.md` — retrospective justifying respec
- `/home/jack/Forging_The_Anvil/respec/02-product-state.md` — baseline
- `/home/jack/Forging_The_Anvil/respec/07-creative-memory.md` — creative-artefact contract

### Adorable (cloned at `/tmp/adorable-research/adorable/`)

- `adorable/lib/system-prompt.ts:3-41` — full system prompt
- `adorable/lib/create-tools.ts:479-493` — tool catalogue; `:123-138` write; `:198-242` replace; `:322-396` commit; `:398-452` checkApp
- `adorable/lib/adorable-vm.ts:46-96` — VM creation; `:57-59` sticky persistence
- `adorable/lib/repo-storage.ts:6` — wrapper-repo name; `:150-157` metadata commits; `:214-260` conversation commits; `:92` `commits.create`
- `adorable/lib/vars.ts:1` — `TEMPLATE_REPO`; `:3-4` WORKDIR/VM_PORT
- `adorable/lib/identity-session.ts:18-40` — cookie identity
- `adorable/lib/llm-provider.ts:16-20, :47, :71` — provider wiring
- `adorable/lib/deployment-status.ts:37-39` — per-commit deploy URLs
- `adorable/app/api/chat/route.ts:82-106` — chat orchestration
- `adorable/app/api/repos/route.ts:150-159, :170-178` — repo creation + ACLs
- `adorable/app/api/repos/[repoId]/promote/route.ts:55-58` — promote to prod

### Dyad (cloned at `/tmp/dyad-research/dyad/`)

**Prompts:**
- `src/prompts/system_prompt.ts:62-321` — BUILD_SYSTEM_PREFIX
- `src/prompts/system_prompt.ts:323-335` — postfix screaming
- `src/prompts/system_prompt.ts:343-360` — DEFAULT_AI_RULES
- `src/prompts/system_prompt.ts:362-454` — ASK_MODE
- `src/prompts/system_prompt.ts:510-553` — constructSystemPrompt switch
- `src/prompts/local_agent_prompt.ts:10-103` — role/tool-calling/file-editing/workflow blocks
- `src/prompts/local_agent_prompt.ts:151-254` — assembled LOCAL_AGENT prompts
- `src/prompts/plan_mode_prompt.ts:1-109` — PLAN_MODE (closest to Annie discovery)
- `src/prompts/compaction_system_prompt.ts:5-46`
- `src/prompts/security_review_prompt.ts:1-60`
- `src/prompts/summarize_chat_system_prompt.ts:1-42`
- `src/prompts/supabase_prompt.ts:5-403` — with RLS warnings
- `src/pro/main/prompts/turbo_edits_v2_prompt.ts:7-94`
- `src/shared/problem_prompt.ts:7-28` — auto-fix prompt builder

**Orchestration:**
- `src/ipc/handlers/chat_stream_handlers.ts:760-900` — full per-turn system-prompt assembly
- `src/ipc/handlers/chat_stream_handlers.ts:484-526` — visual-edit Selected-components block
- `src/ipc/handlers/chat_stream_handlers.ts:609-644` — smart-context selected files
- `src/ipc/handlers/chat_stream_handlers.ts:707-717` — user-message swap before LLM call
- `src/ipc/handlers/chat_stream_handlers.ts:902-914` — codebase-as-user-turn injection
- `src/ipc/handlers/chat_stream_handlers.ts:1502-1609` — auto-fix loop
- `src/ipc/processors/response_processor.ts:111, :265-275, :392-444, :564-640` — tag application + apply-order
- `src/ipc/processors/tsc.ts` — virtual-filesystem overlay
- `src/shared/VirtualFilesystem` — the overlay itself
- `src/ipc/handlers/version_handlers.ts:165-240` — revert

**Visual-edit system:**
- `packages/@dyad-sh/react-vite-component-tagger/src/index.ts:18-88` — tagger
- `packages/@dyad-sh/nextjs-webpack-component-tagger/src/index.ts` — Webpack twin
- `worker/proxy_server.js:196-263, :265-273, :310-324, :338-391, :417-454` — proxy + injection + WS
- `worker/dyad-component-selector-client.js:14-17, :225-266, :380, :446-525, :527-550, :578-623, :637-744` — click-to-select
- `worker/dyad-shim.js:13-224, :226-306` — history patch, error reporting, vite-overlay watcher
- `worker/dyad-visual-editor-client.js:120-142, :262-264` — runtime style/text/image mutations
- `worker/dyad-screenshot-client.js` — html-to-image wrapper
- `worker/dyad_logs.js` — console intercept
- `src/ipc/utils/start_proxy_server.ts:26` — port range
- `src/components/preview_panel/PreviewIframe.tsx:522-906, :632-668, :1624-1672` — parent handler + parse
- `src/components/chat/ChatInput.tsx:509-572, :554-563, :394-396` — send + clear + restore
- `src/atoms/previewAtoms.ts` — `selectedComponentsPreviewAtom`
- `scaffold/vite.config.ts:11` — tagger wired

**Scaffold:**
- `/tmp/dyad-research/dyad/scaffold/` (all files) — bundled scaffold
- `/tmp/dyad-research/dyad/scaffold/AI_RULES.md` — the AI contract
- `/tmp/dyad-research/dyad/scaffold/package.json` — 49 runtime deps, 17 dev deps
- `/tmp/scaffolds/freestyle-nextjs/` (all files) — Freestyle scaffold for comparison
- `/tmp/scaffolds/freestyle-nextjs/README_AI.md` — the one-sentence AI contract

**Other:**
- `src/ipc/handlers/app_handlers.ts:354-437, :320` — local-node exec + proxy start
- `src/db/schema.ts` — apps, chats, messages, versions, prompts, providers, mcp_*, custom_themes
- `src/ipc/utils/dyad_tag_parser.ts` — XML tag parser
- `src/ipc/types/chat.ts:48-57` — `ComponentSelectionSchema`

### Freestyle SDK

- `/tmp/freestyle-sdk-check/node_modules/freestyle-sandboxes/index.d.mts` (13,855 lines)
- `index.d.mts:5886-5919, :12453-12522` — serverless deployments
- `index.d.mts:7446-7829` — error catalogue (Firecracker)
- `index.d.mts:10968-10975` — domain mappings
- `index.d.mts:11735, :11943-12056` — GitRepo + repo search
- `index.d.mts:12191` — token.create
- `index.d.mts:12298, :12352` — identity + DNS
- `index.d.mts:12677-12703` — VM lifecycle (sticky/ephemeral/persistent), port config
- `index.d.mts:13527, :13594, :13744, :13827` — resize, snapshot, cron, root class

### Wrapper packages

- `/tmp/freestyle-sdk-check/node_modules/@freestyle-sh/with-pty/`
- `/tmp/freestyle-sdk-check/node_modules/@freestyle-sh/with-dev-server/`
- `/tmp/freestyle-sdk-check/node_modules/@freestyle-sh/with-ttyd/`
- `/tmp/freestyle-sdk-check/node_modules/@freestyle-sh/with-nodejs/`

### Fusion meta-analysis

- `/home/jack/Forging_The_Anvil/Research/lovable_dyad_adorable_analysis.md`

---

## 12. Sources

### Documentation

- [Freestyle docs root](https://docs.freestyle.sh)
- [Freestyle VMs — About](https://docs.freestyle.sh/v2/vms/about)
- [Freestyle VMs — Lifecycle](https://docs.freestyle.sh/v2/vms/lifecycle)
- [Freestyle VMs — Templates and Snapshots](https://docs.freestyle.sh/v2/vms/templates-snapshots)
- [Freestyle Git](https://docs.freestyle.sh/v2/git)
- [Freestyle Git — GitHub Sync](https://docs.freestyle.sh/v2/git/github-sync)
- [Freestyle Serverless Deployments](https://docs.freestyle.sh/v2/serverless/deployments)
- [Freestyle Domains](https://docs.freestyle.sh/v2/domains)
- [Freestyle pricing](https://www.freestyle.sh/pricing)
- [Fly.io Machines overview](https://fly.io/docs/machines/overview/)
- [Fly.io custom domains](https://fly.io/docs/networking/custom-domain/)
- [Fly.io dynamic request routing (fly-replay)](https://fly.io/docs/networking/dynamic-request-routing/)
- [Fly.io pricing](https://fly.io/docs/about/pricing/)

### HN and community

- [Launch HN: Freestyle — Sandboxes for Coding Agents](https://news.ycombinator.com/item?id=47663147)
- [Show HN: Dyad (Electron)](https://news.ycombinator.com/item?id=45296227)
- [Show HN: Dyad (original)](https://news.ycombinator.com/item?id=43848489)
- [Open Lovable HN](https://news.ycombinator.com/item?id=44854120)

### Reviews

- [Dyad's own competitor comparison blog](https://www.dyad.sh/blog/free-ai-app-builders-compared)
- [Dyad review at nocode.mba](https://www.nocode.mba/articles/dyad-review)
- [Dyad as Lovable alternative — productcompass.pm](https://www.productcompass.pm/p/dyad-free-lovable-alternative)
- [Y Combinator — Freestyle company page](https://www.ycombinator.com/companies/freestyle)

### GitHub

- [Dyad issues](https://github.com/dyad-sh/dyad/issues)
- [Adorable issues](https://github.com/freestyle-sh/Adorable/issues)

---

*End of research. Every major finding traceable to `file:line` or issue URL. Assessments tagged per §0. Spec implications isolated in §10; nothing in this document modifies the spec by itself.*
