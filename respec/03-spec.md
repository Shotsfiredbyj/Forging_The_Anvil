# Cold Anvil — The Spec

*Written by Annie. Opinionated. Four pages. Every requirement is traceable to a specific learning from `01-journey.md` (cited inline). No options, no hedges, no "could", no "should". This is what Cold Anvil is.*

---

## 1. What Cold Anvil is

**Cold Anvil is Annie, plus the tools she needs to turn someone's idea into a deployed product they can use.** Annie is not a feature of the product. Annie is the product. Every other component — the generation pipeline, the verification adapters, the build templates, the deployment harness — is a tool Annie uses while working with a user.

*(Traceability: the Annie-as-product commitment was made 2026-03-22 and documented in `claude-memory/project_annie_vision.md`. It has never been implemented in the user-facing flow. Every cascade today is a batch submission with no collaborator. The most important thing the respec does is close this gap. See `01-journey.md` §"What we did not build".)*

---

## 2. Who Cold Anvil is for

The user is a non-technical person who has had an idea they cannot get out of their head.

They might be a recruiter. A carpenter. A teacher. A nurse. A parent with a side project they think about while doing the dishes. What they have in common is: they are not a product manager. They are not an engineer. They have never scoped a sprint. They have possibly tried Squarespace and found it too limiting, or Lovable and gotten a prototype they couldn't deploy, or typed their idea into ChatGPT and gotten thirty paragraphs of plausible planning that didn't become anything real. They stopped because the gap between "I have an idea" and "I have a thing I can show my friend" is too wide, and nobody has closed it for their specific case.

What they need is someone — a person, not a tool — who hears them out, asks the right clarifying questions, makes confident product decisions on their behalf, and hands them back a thing that works and is theirs to keep.

That person is Annie.

*(Traceability: user clarification this session — *"This is the person who has had a great idea, whilst having a coffee with a friend. Their day job is totally non-technical. Maybe they work in recruitment, maybe they are a carpenter."*)*

---

## 3. The experience Annie delivers

This is the user journey. It is not a pipeline.

**Arrival.** The user lands on `coldanvil.com`. There is no form. There is a text field and Annie saying hello. The user types whatever they have. A single sentence, three paragraphs, a bulleted list of wishes — it doesn't matter. Annie reads it and replies.

**Discovery conversation.** Annie has a real conversation with them. She asks clarifying questions, in natural language, at the pace the user wants. She is not filling in a form. She is not running a four-phase state machine the user can perceive. She is listening, pushing back when something is underspecified, and telling the user what she thinks they actually want when they can't articulate it. She ends this phase when she has enough to commit to a direction — usually under ten minutes of back-and-forth, sometimes longer for complicated ideas.

**The first artefact: a vision the user can feel.** Annie produces a short, confident statement of what she thinks the user is trying to build, who it's for, and what "done" looks like for a first version. This is rendered in the conversation AND surfaced as a visible chip or card in the project view — the user can point at it and say "that's wrong" in one click, not hunt for a file to open. The user reads it and reacts. Annie takes the reaction and edits the vision in place. This loop is tight — seconds, not minutes. *(The vision also persists as `docs/vision.md` inside the project — a dual-purpose artefact that is both a conversational beat and a document the user owns. See `07-creative-memory.md` for the full creative-artefact framing. The "visible chip" is a mitigation for Annie's highest-leverage new failure mode: "confident and wrong" — see `Research/adorable_dyad_deep_research.md` §10.7.)*

**The plan.** When the vision is agreed, Annie commits to a build plan. *This is an opinionated, concrete plan that says "I am going to build X using Y."* The user does not see a sprint breakdown. They see a sentence: *"I'm going to build you a one-page site with a waitlist form that sends submissions to an inbox you control. I'll have something for you to click in about ten minutes."* Annie picks the technology, the template, the deployment target. The user does not have to know what any of those are.

**The build.** Annie builds. The user watches. They see a live preview appear — a URL that updates as Annie works. The preview is real — a browser pointed at a live scaffold that becomes the real thing as Annie wires it up. It is not a "the cascade is running, please wait" progress bar. The user can open the preview URL, refresh it, watch content fill in, watch the nav appear, watch the styles take effect. When Annie is happy with it she tells the user, and they click through it together.

**Real-time refinement.** The user says "the hero should be green" or "make the form ask for a phone number" or "I want a second page about pricing." Annie edits the live preview. The preview updates. This is the same mechanism as the build — Annie is using her tools on a running project. The user never feels like they're starting a new job.

**Publishing.** When the user says they're ready, Annie publishes the project to a real host and gives them a URL. The default is `{project-name}.coldanvil.com`; custom domains are available. The target host is Fly.io (committed 2026-04-17 — it is the only widely-available managed host with first-class Node + SQLite + Litestream-backed continuous replication, which our chosen data layer requires). The published version is the user's product in the world — they can share it, they can link to it, they can start collecting whatever the project is designed to collect. *Publishing is not a terminal event.* Every substantive edit the user and Annie make together triggers a new deployment; the published URL always reflects the current state of the project. Users can publish fifty times over the life of the project and none of those are "final deliveries" — they are snapshots of ongoing work.

**Continuity is the default.** Cold Anvil is not a one-shot tool. The user comes back. Sometimes the next day, sometimes next week, sometimes months later. When they come back, Annie remembers them — who they are, what they're building, what taste they've already expressed, what decisions they made and what they rejected. The project page exists from the moment they first typed into the idea field, and it gets deeper and richer every time they visit. New features get added. Copy gets refined. Bugs real users reported get fixed. Real data from the deployed version informs the next round of work. This is the product arc: not a build, an ongoing creative relationship with Annie as the partner who keeps building.

**Annie-as-operator.** Beyond refinement, Annie watches the user's product in operation. When something fails after publish — a payment provider rejects a test key, emails bounce because DNS is misconfigured, a third-party integration's token expires, analytics stop flowing — Annie notices on the user's behalf and summarises the failure in plain language on the user's next return ("Your waitlist emails aren't going out because the email service needs a small DNS record. I can show you how, or I can do it for you if you give me access."). Annie does not pager-alert the user; she narrates when they come back. Operating the product is as much part of continuity as adding new features. (*Traceability: `Research/adorable_dyad_deep_research.md` §10.1 — post-launch ops is a real spec gap the research surfaced.*)

**The subscription pays for continuity, not units.** Paying users are not buying a fixed number of cascades or a tokens-per-month allowance. They are buying Annie's ongoing availability and the accumulating context of their project. A paying user can come back every day for a month and get incremental help; a paying user can come back once a quarter for a major iteration. Both are covered by the same subscription. *(Traceability: pricing research 2026-04-09 — "Cold Anvil's depth-gated model is structurally superior for novice users — no credits to burn, no 'paying to fix AI mistakes' problem."*)

**The exit door, always open (but never pushed).** At any point, from any project, the user can download a complete portable export of their work. Source code, content, configuration, deployment metadata, the creative artefacts in `docs/` (vision, brand voice, content strategy, site architecture — see `07-creative-memory.md`), a README explaining what's in the bundle. This is their product — they own it, they can take it elsewhere, they can hand it to an agency or a friend who codes. *Most users will never use this.* It exists as a right, not a milestone. The presence of the door is what makes the choice to stay meaningful — a user who stays on Cold Anvil is staying because Annie keeps being useful, not because they're trapped. Annie does not push the export on anyone. She does not say "here are your files, see you next time!" The default state is that the user remains in the relationship and the project keeps growing. (*Traceability: user clarification this session — "we should ensure they finish their time with ColdAnvil with all the assets they need, so they aren't stuck with us if eventually they do get a team to work on it… Of course, I don't want weird lock-in either."* The key word is *eventually*. Most users never hit that point, and they shouldn't feel pushed toward it.)

*(Traceability for the continuity model: `BACKGROUND-AND-VISION.md:249` — the "dream building machine" long vision. *"The real product is what comes after the first cascade… Cold Anvil is a platform for people to keep building. Not just make something once, but evolve it — add features, iterate on quality, grow the project over time. A purpose-built dream building machine."* The original spec already named this. The current implementation doesn't instantiate it. This respec fixes that gap.)*

---

## 4. What Cold Anvil deliberately does not do

Short list, every item justified by a specific failure mode we walked into:

- **Cold Anvil does not "run a cascade".** The cascade is Annie's internal plumbing. The user never sees the word "cascade", never sees a stage number, never waits on a progress bar labelled "Stage 4: tech_design". (*Learning: four weeks of pipeline-quality work has produced nothing the user experiences; the pipeline is infrastructure, not product. See `01-journey.md` §"The repeating pattern, named".*)
- **Cold Anvil does not produce a file tree the user has to interpret.** The user gets a live preview and a download. (*Learning: today's handoff is markdown files. Nobody opens them. They are not a deliverable — they are an internal artefact. See `02-product-state.md` §"What the founder walks away with".*)
- **Cold Anvil does not attempt to generate code without a build system.** Every project type has exactly one starter template with a real, known-working build chain that the model generates *into*. No "no build step + separate component files + utility classes". (*Learning: the Stage 4 → Stage 5 forensic investigation in `01-journey.md`. Impossible contracts produce broken output every time.*)
- **Cold Anvil does not use an LLM to grade code correctness.** Deterministic tools (compilers, linters, cross-file checkers, browser rendering) are the only arbiters of whether code works. LLM review stays for subjective content at the planning stages only (see `05-eval-standalone.md` for the rubric-based quality layer as a sibling product). (*Learning: Rohan grid 2026-03-31; CodeJudgeBench; the entire span of 2026-03-31 through 2026-04-14 relitigating this. See `01-journey.md` §"The pivot that should have happened".*)
- **Cold Anvil does not send user code or ideas to third-party clouds for inference.** Private-first is a load-bearing promise. Arnor Gateway is the substrate. No OpenAI, Anthropic, or Google at inference time. (*Traceability: user clarification this session — *"we want ColdAnvil to be private and secure first. No cloud inference."* Also `DECISIONS.md:59` 2026-03-18, security as USP.*)
- **Cold Anvil does not build mobile apps at MVP.** Web products, web apps, backend services, APIs, plugins to known platforms — yes. iOS/Android native — later. (*Traceability: user clarification — "eventually mobile apps too, but obviously that is a little too complex for MVP."*)
- **Cold Anvil does not support 11 languages in the same spec.** Eleven languages is the *eventual* surface area; the MVP commits to the smallest set that covers 80% of "ideas for a first version" from the target user. See §6. (*Learning: `01-journey.md` — we built five adapters and shipped zero working products; surface area without depth is a trap.*)
- **Cold Anvil does not generate legal documents or compliance certifications at MVP.** No terms of service, no privacy policies, no HIPAA / GDPR / SOX attestations. When a user's idea lives in a regulated domain (healthcare, finance, employment, education), Annie flags the compliance implications plainly and tells the user the product will likely need a lawyer before real use. Honest flagging is MVP; document generation is a post-MVP extension. (*Traceability: `Research/adorable_dyad_deep_research.md` §10.4.*)
- **Cold Anvil does not import existing projects.** A user with a project elsewhere can export it and start a new Cold Anvil project from scratch, but Cold Anvil does not attempt to consume arbitrary existing codebases. Import is a non-feature. (*Traceability: `Research/adorable_dyad_deep_research.md` §7.2 — "import existing" is where every similar product eats its worst failure modes.*)

---

## 5. Annie's tool belt

Annie does her job by using tools. This section is not an architecture; it's a list of what Annie needs to have in the room when a user arrives. Implementation comes after spec approval.

1. **A conversation tool** that lets Annie talk to the user, hold history, stream responses, extract commitments, and update her understanding of what the user wants. *(The existing conversation/extraction architecture — step 3 in the current docs — is the kernel of this. It works conceptually and has been built and is awaiting fleet validation. See `ARCHITECTURE.md:255` — Conversation Architecture.)*
2. **A committed, runnable stack** — the harness Annie builds inside, described in Section 6. At MVP this is a single opinionated web application stack with auth, data, routing, styling, and deployment all pre-wired. The stack is not a template gallery; it is a foundation that can accommodate a very wide range of products. Annie does not generate the stack. She is handed it the moment a build begins and she generates *into* it. (*Learning: `01-journey.md` §"The forensic investigation". The generator cannot invent a build system; we have to give it one.*)
3. **A code-generation tool** that takes the current project state, the user's intent, and a concrete task ("add a pricing page with these three tiers", "persist these form submissions to the database", "wire this endpoint up to the new admin view") and produces code inside the existing running project. Every change is verified by actually executing the project — build, lint, browser-render check, smoke test. Failed changes are rolled back; successful changes are committed to the project.
4. **A live-preview tool** that serves the in-progress project at a URL Annie can share with the user during the conversation. This is a real local dev server behind a tunnel or a short-lived hosted preview — whichever is cheaper on private-first infrastructure. The preview is the user's proof of reality, and it is present from early in the build, not just at the end.
5. **A refinement tool** that lets Annie apply small targeted edits to a running project without restarting. "Make the hero green" is a tool call, not a cascade. The tool knows how to find the hero, change the style token, re-verify, and reload the preview. This same tool is what the user experiences on return visits — every incremental change to an ongoing project runs through it. The refinement tool includes a **click-to-edit** capability: every JSX element in the preview is stamped at build time with its source file and line number, and a click on any element in the preview selects it for the next message. "Make this green" becomes a click followed by a sentence — the user points at what they mean instead of describing it. (*Traceability: the Dyad open-source visual-edit pattern lifted in `Research/adorable_dyad_deep_research.md` §3.*)
6. **A deployment tool** that publishes the project to a real host and returns a shareable URL. The default target is `{project}.coldanvil.com` hosted on Fly.io (committed 2026-04-17: Cloudflare Pages is ruled out because its edge runtime cannot run `better-sqlite3`; Fly.io is the only widely-available managed host with first-class Node + SQLite + Litestream continuous replication). Self-hosting and BYO-hosting remain first-class alternatives, not afterthoughts. (*Traceability: three deployment modes commitment from `DECISIONS.md:59`. The infrastructure to do this exists — we have a gateway, a fleet, and our own machines. What we have not built is the path from "cascade finished" to "URL the user can share."*) Deployment is triggered by the user's decision, not automatically, and it is available every time they make a meaningful change — not just at the end.
7. **A portability guarantee** — not really a "tool" in the same sense as the others, more a standing promise the system upholds. At any point, from any project, the user can request a complete export of their work and receive a downloadable archive with source, content, configuration, deployment metadata, and a README explaining what's inside. This is always available, the user does not need to ask Annie to prepare it, and Annie never pushes the user toward it. It is the door that is always unlocked.
8. **A memory tool** that persists who the user is, what they're building, their stated preferences, their taste, the decisions they've made, and enough context to make their next conversation feel continuous. The user should never have to re-explain themselves. The structured part of this memory — vision, brand voice, content strategy, site architecture — lives as dual-purpose artefacts in the project's `docs/` folder per `07-creative-memory.md`; conversation history and extraction state fill in the rest. (*Traceability: the "dream building machine" long vision, `BACKGROUND-AND-VISION.md:249`; the continuity-as-default framing in Section 3.*)

Annie is the caller. She orchestrates these tools based on the conversation. There is no fixed 9-step cascade. The conversation is the control flow. Some users will breeze through and ask for a build in five minutes; others will spend an hour on discovery and never ask Annie to generate anything. Both should feel like Cold Anvil worked for them.

**The project is the unit.** Everything Annie's tools act on belongs to a single container: the user's project. A user has one or more projects. Every project bundles the code (`src/`, config), the creative docs (`docs/vision.md`, `docs/brand-voice.md`, `docs/content-strategy.md`, `docs/site-architecture.md`), the conversation history with Annie, the build and refinement history, and the deployment state. When the user returns to Cold Anvil they navigate to **their project** and see all of it in one place — docs, code, preview, deploy controls, history — as different faces of the same thing. Portability (§5.7) exports the whole unit. Memory (§5.8) is scoped to it. Every tool in this section reads from and writes to it. Users do not think about "their docs" or "their code" as separate assets to manage; they think about their project, and the artefacts are how the project is constituted.

---

## 6. The stack Annie builds inside

The generator cannot produce working code into a vacuum. That is the load-bearing lesson of every cascade we have run — the forensic investigation in `01-journey.md` traces it cleanly: given an empty directory and an impossible contract ("no build step + separate component files"), Stage 5 fakes composition with placeholder comments and produces something that does not render. Annie needs a *runnable harness to build inside.*

**The fix is not to restrict what the user can ask for. The fix is to restrict what Annie builds *with*.** Lovable, v0, and Bolt all do this — they commit to an opinionated stack (React, TypeScript, Tailwind, a real data layer) and then within that stack the user can ask for essentially anything. The stack does not tell the user what their product should be; it tells Annie what tools she is going to use to build it. Those are completely different constraints.

**At MVP, Annie builds inside one stack.** The stack is broad enough that the overwhelming majority of ideas a non-technical founder brings can live inside it:

- A **modern React + TypeScript + Tailwind + shadcn/ui stack on Vite**, served from Fly.io as a static SPA paired with a small Hono API server. The data layer is **SQLite with Litestream continuous replication** to object storage. Every project ships an `AI_RULES.md` (in-repo LLM-facing contract telling the model where new components go, what not to edit, which libraries are pre-installed) and a `docs/` folder (creative artefacts — vision, brand voice, content strategy, site architecture — see `07-creative-memory.md`) that Annie reads before each turn. Auth, forms, routes, database models, API endpoints, deployment pipeline — all present, all working, all committed by the Cold Anvil team. Annie does not generate the harness; she generates *inside* it. (*Traceability: this shape was picked 2026-04-18 after the deep architectural read of Adorable + Dyad — see `Research/adorable_dyad_deep_research.md` §4. Three factors: (a) Vite + Hono fits Fly.io + SQLite + Litestream without fighting framework defaults, whereas Next.js assumes serverless/horizontal scaling which Litestream cannot tolerate; (b) a simpler scaffold — no server/client component boundary, no runtime pinning — lets smaller fleet models produce working code more reliably; (c) the in-repo `AI_RULES.md` pattern from Dyad composes natively with our existing `docs/`-as-memory commitment.*)

Within that one stack, the range of products Annie can build is enormous:

- Marketing sites of any complexity
- Landing pages with working waitlists, pre-orders, email capture, lead qualification
- Booking and scheduling tools
- Directories, catalogues, searchable archives
- Dashboards and admin tools
- Calculators, quizzes, assessment flows, diagnostic tools
- Intake forms and application workflows
- Member-gated content, subscriber-only resources
- Internal tools for teams and communities
- Content sites that collect and display user submissions
- Backend services exposed through web frontends
- Widgets and embeds that live inside the modern web ecosystem

*This is not a product category list. It is an illustration of how broad "modern web app" actually is.* A user arrives with an idea for a cat-sitting matchmaker and Annie builds it. A user arrives with an idea for a group-gift-buying coordinator and Annie builds it. A user arrives with a personal recipe journal, a local-history archive, a small-business booking system, a niche professional directory, a custom pricing calculator, a donation tracker, a community event board — Annie builds all of them, inside the same stack. The stack is the constraint; the product is open.

**Annie's job is to reframe, not to gatekeep.** When a user brings an idea, Annie does not check it against a list of supported shapes. She figures out how the idea becomes a web product. If someone says "I want an app to track my kid's chores," Annie builds a web app that does exactly that — responsive, mobile-friendly, usable from a phone browser, with the right data model and the right UI. If someone says "I want a place where my running club can sign up for weekly routes," Annie builds that. The user never hears "we don't build that category."

**Annie may also recommend *not* building custom software.** Sometimes the right first version is not a web app. It is a Stripe payment link pointing at a Calendly booking page with submissions flowing to an Airtable row that triggers an email. Annie knows when this is the right answer and says so. She builds the landing page in the stack; she wires the tools; she does not pretend she needed to build a custom application. The "no build" recommendation is a legitimate outcome of Annie's opinionated judgement. (*Traceability: `Research/adorable_dyad_deep_research.md` §10.3.*)

**What this stack honestly cannot do at MVP.** Native mobile apps (iOS/Android that ship through app stores). Games with meaningful real-time graphics. Desktop software. Systems-level tools in Rust or Go or C++. Data-science notebooks and ML-training pipelines. When a user arrives with an idea that truly lives in one of these spaces, Annie is honest and helps them think about it. Often there is a mobile-web version of their idea that is 90% as good as the native app would have been, and Annie can build that. When there isn't, Annie tells them so, plainly, and offers them the vision document for free so they still walk away with something useful — and with an open door to come back when Cold Anvil's stack grows to meet them.

**Post-MVP stack expansion.** Additional stacks are added when enough users bring ideas that genuinely do not fit the web stack. Candidates in order of likely priority: a **native mobile stack** (Flutter or React Native, shipping to the stores), a **backend-heavy stack** for data work and ML (Python + FastAPI + modern data libraries), a **systems stack** (Rust or Go for infrastructure, CLIs, services). Each new stack is a real implementation investment — a real harness, real templates, real verification — and is added only when demand justifies it. The long-term commitment to 11+ languages is honoured by the growing stack set, not by pretending every language is covered on day one.

*(Traceability for the stack-commitment model: the Stage 4 → Stage 5 forensic investigation in `01-journey.md`; the 2026-04-09 reference-first decision in `DECISIONS.md` that identified Tailwind as the right fix and deferred it; the competitive research (`Research/competitor_landscape_ai_builders_2026.md`) confirming every production AI builder has converged on opinionated stacks because the alternative does not produce working software; the user clarification this session — "we want ColdAnvil to be closer to Lovable, where you can have anything… that's how it feels.")*

---

## 7. What counts as success for the first ten users

The first ten users of Cold Anvil end their first session with a deployed URL pointing at a live thing they made. And then — if the product is what we think it is — they come back.

The metrics that matter, in order:

- **All 10 users get to a published URL in their first session.** Non-negotiable. A user who finishes the first session without a URL they can share is a failed run, regardless of how good the planning artefacts were.
- **At least 8 of 10 URLs render correctly** on desktop and mobile — no broken navigation, no unstyled content, no placeholder text, no "in a real build this would be injected here" comments. The 80% threshold is deliberate: the promise is *"something that works"*, not *"something flawless"*, and we need slack for edge cases while we're learning. What we will not tolerate is the current failure mode, where the grade says A and the page is a static wall of unstyled text.
- **At least 6 of 10 users, when asked a week later, say "I could show this to someone."** This is the closest thing we have to a product-market-fit signal. Not a grade. Not a score. Did they feel, in their gut, like Cold Anvil delivered on the promise.
- **At least 5 of 10 users return within 30 days to iterate on their project with Annie.** *This is the most important metric and the one that tells us whether Cold Anvil is a one-shot tool or the dream building machine.* A user who publishes, disappears, and never comes back got some value — but they got the Squarespace-level value, not the Cold-Anvil-level value. The whole point of Annie is that the relationship compounds. Five out of ten returning in the first month is the early signal that the compounding is real.
- **Zero users leave because they felt trapped.** Portability is a right, not a metric. We don't track how many users download their export, because pushing that number is the wrong instinct — a user who downloads the export and never comes back is a user who has *left*. What we track instead is the absence of coercion: no user in the first ten should ever report feeling stuck, locked in, or unsure whether they actually own their work. The door is always open and Annie never points at it unless the user asks where it is.

These are the only metrics we measure during the first ten users. The grade pipeline is internal plumbing. We have spent too much of this journey confusing the measurement for the product.

---

## 8. The build-time contract with the generator

This is the one technical section in the spec because it is the one place where architectural drift has destroyed the product. It needs to be pinned down clearly.

Every code-generation task Annie issues during a build satisfies all of the following:

1. **The task is scoped to a single file or a single small change.** Annie does not issue "generate the whole app" as one request. She issues "add a pricing page with these three tiers and wire up the subscribe button" as an atomic task, and then "add a database model for subscribers" as the next one. Small units, verified one at a time.
2. **The task is issued inside the live running project.** The stack is already on disk — the Vite + React + shadcn + Hono application is initialised, routed, styled, and buildable before Annie writes her first line of user-specific code. The task modifies or adds to a project that already runs. There is no "generate into an empty directory and hope a build system emerges."
3. **The task is verified by executing the project, not by scoring it with an LLM.** The stack's build must succeed. The stack's typecheck must pass. The stack's test suite (if present) must stay green. The live preview must load without console errors, AND — load-bearing — **the rendered DOM must actually contain the change the task was supposed to make.** "Build succeeded" is not sufficient: if the task said "add a pricing page with three tiers" and the preview still renders the scaffold placeholder, the task has failed. Verification is done via a headless-browser check of the rendered output. *(Traceability: `01-journey.md` §"The pivot that should have happened"; `Research/adorable_dyad_deep_research.md` §10.2 — this closes the "Welcome to your Blank App" failure mode Dyad eats constantly. Execution is the arbiter, always.)*
4. **Failed tasks are rolled back.** If verification fails, the project returns to the last known-good state. Annie either tries a different approach with the error in context, or — if she cannot find one — tells the user what went wrong in plain language and asks them how they want to proceed. *She never silently accepts broken code and moves on.* This is the specific behaviour that produced Phase 4. It does not happen in the new spec.
5. **The model never writes into a vacuum.** Every task gets: the current project tree, the stack's conventions (the in-repo `AI_RULES.md` is injected into every prompt), the user's explicit intent (made concrete via the creative-brief block — the relevant slice of vision, brand voice, content strategy, and site architecture for this task, per `07-creative-memory.md`), the relevant existing files Annie is modifying, and a precise description of what success looks like *for this task*. The model is not being asked to imagine how components compose or whether a build system exists. The build system is right there. The task is "add to the thing that already works", not "create the thing from scratch and hope it works."
6. **Annie does not silently retry past user patience.** If generation truncates mid-response or the model refuses the task twice in a row, Annie does not silently keep trying. She tells the user in plain language what happened and asks how to proceed. Retry loops that burn the user's time are a first-order failure mode and Annie's job is to notice them, not feed them. (*Traceability: `Research/adorable_dyad_deep_research.md` §7.4 — Dyad eats this failure mode.*)
7. **Refactor-first on large files.** If a task requires editing a file that exceeds 800 lines, Annie's first action is to propose a refactor (splitting the file into smaller focused pieces) before attempting the user-requested change. Refactors follow the same verification contract as any other change. (*Traceability: `Research/adorable_dyad_deep_research.md` §7.1 — the long-file refactor cliff.*)
8. **Filesystem conventions.** Project file paths are lowercase-with-hyphens; directories are lowercase. The build harness enforces this at commit time. Mixed-case paths are not a supported input. (*Traceability: `Research/adorable_dyad_deep_research.md` §7.1 — cross-platform casing bugs.*)

This contract is the fix for the Stage 4 → Stage 5 break. There is no Stage 4 anymore. The "blueprint" is the stack plus the accumulating project state plus the ongoing conversation with the user. Every task is a small, verified edit inside something that already runs and can keep running. The model's creativity goes into the content, the structure, the product decisions — not into inventing a harness that doesn't exist.

---

## 9. User-facing language — no implementation detail leaks to the user

Cold Anvil's users are laymen. Non-engineers bringing ideas, not builders picking frameworks. Any text that reaches them — plan descriptions, progress events, error messages, settings, onboarding copy, 404 pages, support UX, the marketing site — gets translated to user-experience language. Technical vocabulary never reaches the surface.

**Concretely:**

- **Plan descriptions** are "Your about page — explains who you are and what makes you different," not "landing_page → src/pages/Index.tsx."
- **Progress events** are "Building your about page…," not "Step 2/3: FEATURE_PAGE."
- **Errors** are "Something went wrong on the menu section — we stopped so we don't ship a broken site. Want me to try again?" — not raw stderr, not framework-specific jargon. Technical detail is logged server-side for debugging; the user sees what it means for them and what they can do about it.
- **Technical tradeoffs** that genuinely need user input (rare) are phrased as user-experience questions. "Do visitors stay logged in between visits?" — not "stateless vs. session auth." If a question can't be phrased without jargon, the question is almost certainly an engineering call the user shouldn't be deciding — Annie makes the call and moves on.

**How this is enforced mechanically:**

Every Annie-produced artefact that has a user-facing surface carries two descriptions — one technical (for Annie's downstream tools: codegen, verify, preview) and one user-facing (for the chat, the plan display, the event stream, the docs panel). The planner writes both. Annie's the same model with the same project context writing both; it's one prompt call producing two fields, not two pipelines.

The WebSocket event stream, the conversation UI, the four creative-artefact files the user edits, and every error surface are exclusively in user-facing language. The technical description is available in debug logs and the orchestrator's structured result; it is not emitted to the browser.

**Applies product-wide.** This isn't a Phase 4 rule about the build stream — it shapes the marketing site, Annie's chat system prompt, onboarding, published preview 404 pages, the customer-facing support surface, any future Annie UI. When in doubt between a technically-precise phrasing and a friendly one, the friendly one wins.

---

*Companions: `05-eval-standalone.md` specifies the rubric-based quality layer as a sibling product. `07-creative-memory.md` specifies how creative artefacts persist as both Annie's memory substrate and user-owned deliverables.*

*End of spec. Four pages. Every requirement traceable. No cascade. No stages. Annie and her tools, delivering a deployed URL to a non-technical founder who brought an idea.*
