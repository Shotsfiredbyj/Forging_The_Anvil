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

**The first artefact: a vision the user can feel.** Annie produces a short, confident statement of what she thinks the user is trying to build, who it's for, and what "done" looks like for a first version. This is rendered in the conversation, not delivered as a markdown download. The user reads it and reacts. Annie takes the reaction and edits the vision in place. This loop is tight — seconds, not minutes.

**The plan.** When the vision is agreed, Annie commits to a build plan. *This is an opinionated, concrete plan that says "I am going to build X using Y."* The user does not see a sprint breakdown. They see a sentence: *"I'm going to build you a one-page site with a waitlist form that sends submissions to an inbox you control. I'll have something for you to click in about ten minutes."* Annie picks the technology, the template, the deployment target. The user does not have to know what any of those are.

**The build.** Annie builds. The user watches. They see a live preview appear — a URL that updates as Annie works. The preview is real — a browser pointed at a live scaffold that becomes the real thing as Annie wires it up. It is not a "the cascade is running, please wait" progress bar. The user can open the preview URL, refresh it, watch content fill in, watch the nav appear, watch the styles take effect. When Annie is happy with it she tells the user, and they click through it together.

**Real-time refinement.** The user says "the hero should be green" or "make the form ask for a phone number" or "I want a second page about pricing." Annie edits the live preview. The preview updates. This is the same mechanism as the build — Annie is using her tools on a running project. The user never feels like they're starting a new job.

**Publishing.** When the user says they're ready, Annie publishes the project to a real host and gives them a URL. The default is `{project-name}.coldanvil.app`; custom domains are available. The published version is the user's product in the world — they can share it, they can link to it, they can start collecting whatever the project is designed to collect. *Publishing is not a terminal event.* Every substantive edit the user and Annie make together triggers a new deployment; the published URL always reflects the current state of the project. Users can publish fifty times over the life of the project and none of those are "final deliveries" — they are snapshots of ongoing work.

**Continuity is the default.** Cold Anvil is not a one-shot tool. The user comes back. Sometimes the next day, sometimes next week, sometimes months later. When they come back, Annie remembers them — who they are, what they're building, what taste they've already expressed, what decisions they made and what they rejected. The project page exists from the moment they first typed into the idea field, and it gets deeper and richer every time they visit. New features get added. Copy gets refined. Bugs real users reported get fixed. Real data from the deployed version informs the next round of work. This is the product arc: not a build, an ongoing creative relationship with Annie as the partner who keeps building.

**The subscription pays for continuity, not units.** Paying users are not buying a fixed number of cascades or a tokens-per-month allowance. They are buying Annie's ongoing availability and the accumulating context of their project. A paying user can come back every day for a month and get incremental help; a paying user can come back once a quarter for a major iteration. Both are covered by the same subscription. *(Traceability: pricing research 2026-04-09 — "Cold Anvil's depth-gated model is structurally superior for novice users — no credits to burn, no 'paying to fix AI mistakes' problem."*)

**The exit door, always open (but never pushed).** At any point, from any project, the user can download a complete portable export of their work. Source code, content, configuration, deployment metadata, a README explaining what's in the bundle. This is their product — they own it, they can take it elsewhere, they can hand it to an agency or a friend who codes. *Most users will never use this.* It exists as a right, not a milestone. The presence of the door is what makes the choice to stay meaningful — a user who stays on Cold Anvil is staying because Annie keeps being useful, not because they're trapped. Annie does not push the export on anyone. She does not say "here are your files, see you next time!" The default state is that the user remains in the relationship and the project keeps growing. (*Traceability: user clarification this session — "we should ensure they finish their time with ColdAnvil with all the assets they need, so they aren't stuck with us if eventually they do get a team to work on it… Of course, I don't want weird lock-in either."* The key word is *eventually*. Most users never hit that point, and they shouldn't feel pushed toward it.)

*(Traceability for the continuity model: `BACKGROUND-AND-VISION.md:249` — the "dream building machine" long vision. *"The real product is what comes after the first cascade… Cold Anvil is a platform for people to keep building. Not just make something once, but evolve it — add features, iterate on quality, grow the project over time. A purpose-built dream building machine."* The original spec already named this. The current implementation doesn't instantiate it. This respec fixes that gap.)*

---

## 4. What Cold Anvil deliberately does not do

Short list, every item justified by a specific failure mode we walked into:

- **Cold Anvil does not "run a cascade".** The cascade is Annie's internal plumbing. The user never sees the word "cascade", never sees a stage number, never waits on a progress bar labelled "Stage 4: tech_design". (*Learning: four weeks of pipeline-quality work has produced nothing the user experiences; the pipeline is infrastructure, not product. See `01-journey.md` §"The repeating pattern, named".*)
- **Cold Anvil does not produce a file tree the user has to interpret.** The user gets a live preview and a download. (*Learning: today's handoff is markdown files. Nobody opens them. They are not a deliverable — they are an internal artefact. See `02-product-state.md` §"What the founder walks away with".*)
- **Cold Anvil does not attempt to generate code without a build system.** Every project type has exactly one starter template with a real, known-working build chain that the model generates *into*. No "no build step + separate component files + utility classes". (*Learning: the Stage 4 → Stage 5 forensic investigation in `01-journey.md`. Impossible contracts produce broken output every time.*)
- **Cold Anvil does not use an LLM to grade code correctness.** Deterministic tools (compilers, linters, cross-file checkers, browser rendering) are the only arbiters of whether code works. LLM review stays for subjective content at the planning stages only. (*Learning: Rohan grid 2026-03-31; CodeJudgeBench; the entire span of 2026-03-31 through 2026-04-14 relitigating this. See `01-journey.md` §"The pivot that should have happened".*)
- **Cold Anvil does not send user code or ideas to third-party clouds for inference.** Private-first is a load-bearing promise. Arnor Gateway is the substrate. No OpenAI, Anthropic, or Google at inference time. (*Traceability: user clarification this session — *"we want ColdAnvil to be private and secure first. No cloud inference."* Also `DECISIONS.md:59` 2026-03-18, security as USP.*)
- **Cold Anvil does not build mobile apps at MVP.** Web products, web apps, backend services, APIs, plugins to known platforms — yes. iOS/Android native — later. (*Traceability: user clarification — "eventually mobile apps too, but obviously that is a little too complex for MVP."*)
- **Cold Anvil does not support 11 languages in the same spec.** Eleven languages is the *eventual* surface area; the MVP commits to the smallest set that covers 80% of "ideas for a first version" from the target user. See §6. (*Learning: `01-journey.md` — we built five adapters and shipped zero working products; surface area without depth is a trap.*)

---

## 5. Annie's tool belt

Annie does her job by using tools. This section is not an architecture; it's a list of what Annie needs to have in the room when a user arrives. Implementation comes after spec approval.

1. **A conversation tool** that lets Annie talk to the user, hold history, stream responses, extract commitments, and update her understanding of what the user wants. *(The existing conversation/extraction architecture — step 3 in the current docs — is the kernel of this. It works conceptually and has been built and is awaiting fleet validation. See `ARCHITECTURE.md:255` — Conversation Architecture.)*
2. **A committed, runnable stack** — the harness Annie builds inside, described in Section 6. At MVP this is a single opinionated web application stack with auth, data, routing, styling, and deployment all pre-wired. The stack is not a template gallery; it is a foundation that can accommodate a very wide range of products. Annie does not generate the stack. She is handed it the moment a build begins and she generates *into* it. (*Learning: `01-journey.md` §"The forensic investigation". The generator cannot invent a build system; we have to give it one.*)
3. **A code-generation tool** that takes the current project state, the user's intent, and a concrete task ("add a pricing page with these three tiers", "persist these form submissions to the database", "wire this endpoint up to the new admin view") and produces code inside the existing running project. Every change is verified by actually executing the project — build, lint, browser-render check, smoke test. Failed changes are rolled back; successful changes are committed to the project.
4. **A live-preview tool** that serves the in-progress project at a URL Annie can share with the user during the conversation. This is a real local dev server behind a tunnel or a short-lived hosted preview — whichever is cheaper on private-first infrastructure. The preview is the user's proof of reality, and it is present from early in the build, not just at the end.
5. **A refinement tool** that lets Annie apply small targeted edits to a running project without restarting. "Make the hero green" is a tool call, not a cascade. The tool knows how to find the hero, change the style token, re-verify, and reload the preview. This same tool is what the user experiences on return visits — every incremental change to an ongoing project runs through it.
6. **A deployment tool** that publishes the project to a real host and returns a shareable URL. The default target is `{project}.coldanvil.app` on Cold Anvil's own infrastructure, respecting the private-first commitment. Self-hosting and BYO-hosting are first-class alternatives, not afterthoughts. (*Traceability: three deployment modes commitment from `DECISIONS.md:59`. The infrastructure to do this exists — we have a gateway, a fleet, and our own machines. What we have not built is the path from "cascade finished" to "URL the user can share."*) Deployment is triggered by the user's decision, not automatically, and it is available every time they make a meaningful change — not just at the end.
7. **A portability guarantee** — not really a "tool" in the same sense as the others, more a standing promise the system upholds. At any point, from any project, the user can request a complete export of their work and receive a downloadable archive with source, content, configuration, deployment metadata, and a README explaining what's inside. This is always available, the user does not need to ask Annie to prepare it, and Annie never pushes the user toward it. It is the door that is always unlocked.
8. **A memory tool** that persists who the user is, what they're building, their stated preferences, their taste, the decisions they've made, and enough context to make their next conversation feel continuous. The user should never have to re-explain themselves. (*Traceability: the "dream building machine" long vision, `BACKGROUND-AND-VISION.md:249`; the continuity-as-default framing in Section 3.*)

Annie is the caller. She orchestrates these tools based on the conversation. There is no fixed 9-step cascade. The conversation is the control flow. Some users will breeze through and ask for a build in five minutes; others will spend an hour on discovery and never ask Annie to generate anything. Both should feel like Cold Anvil worked for them.

---

## 6. The stack Annie builds inside

The generator cannot produce working code into a vacuum. That is the load-bearing lesson of every cascade we have run — the forensic investigation in `01-journey.md` traces it cleanly: given an empty directory and an impossible contract ("no build step + separate component files"), Stage 5 fakes composition with placeholder comments and produces something that does not render. Annie needs a *runnable harness to build inside.*

**The fix is not to restrict what the user can ask for. The fix is to restrict what Annie builds *with*.** Lovable, v0, and Bolt all do this — they commit to an opinionated stack (React, TypeScript, Tailwind, a real data layer) and then within that stack the user can ask for essentially anything. The stack does not tell the user what their product should be; it tells Annie what tools she is going to use to build it. Those are completely different constraints.

**At MVP, Annie builds inside one stack.** The stack is broad enough that the overwhelming majority of ideas a non-technical founder brings can live inside it:

- A **modern web application stack.** Next.js (or its equivalent) with TypeScript, Tailwind for styling, and a real data layer (Postgres, SQLite, or equivalent) wired in from the start. Auth, forms, routes, database models, API endpoints, deployment pipeline — all present, all working, all committed by the Cold Anvil team. This stack is a version-pinned, battle-tested harness. Annie does not generate the harness; she generates *inside* it.

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
2. **The task is issued inside the live running project.** The stack is already on disk — the Next.js-or-equivalent application is initialised, routed, styled, and buildable before Annie writes her first line of user-specific code. The task modifies or adds to a project that already runs. There is no "generate into an empty directory and hope a build system emerges."
3. **The task is verified by executing the project, not by scoring it with an LLM.** The stack's build must succeed. The stack's typecheck must pass. The stack's test suite (if present) must stay green. The live preview must load without console errors and must pass a DOM-level sanity check (body has content, navigation works, styles are applied, the thing the task was supposed to add is actually visible). *(Traceability: `01-journey.md` §"The pivot that should have happened". Execution is the arbiter, always.)*
4. **Failed tasks are rolled back.** If verification fails, the project returns to the last known-good state. Annie either tries a different approach with the error in context, or — if she cannot find one — tells the user what went wrong in plain language and asks them how they want to proceed. *She never silently accepts broken code and moves on.* This is the specific behaviour that produced Phase 4. It does not happen in the new spec.
5. **The model never writes into a vacuum.** Every task gets: the current project tree, the stack's conventions, the user's explicit intent, the relevant existing files Annie is modifying, and a precise description of what success looks like *for this task*. The model is not being asked to imagine how components compose or whether a build system exists. The build system is right there. The task is "add to the thing that already works", not "create the thing from scratch and hope it works."

This contract is the fix for the Stage 4 → Stage 5 break. There is no Stage 4 anymore. The "blueprint" is the stack plus the accumulating project state plus the ongoing conversation with the user. Every task is a small, verified edit inside something that already runs and can keep running. The model's creativity goes into the content, the structure, the product decisions — not into inventing a harness that doesn't exist.

---

*End of spec. Four pages. Every requirement traceable. No cascade. No stages. Annie and her tools, delivering a deployed URL to a non-technical founder who brought an idea.*
