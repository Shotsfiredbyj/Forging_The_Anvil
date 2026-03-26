# Cold Anvil — Agentic Roadmap

Concrete work items under each milestone from AGENTIC-VISION.md.
Not time-bound. Sequenced by dependency, not calendar.

---

## Research Basis

Deep dives into three frameworks informed this roadmap:

- **GSD (get-shit-done)** — Failure recovery workflow (decision tree: retry,
  decompose, prune, escalate with repair budget). Context assembly (pass
  paths, not contents). Wave execution with git worktree isolation. Agent
  definitions as markdown + YAML frontmatter. State as a 100-line markdown
  file. Plan verification with 10 dimensions and 3-iteration feedback loop.

- **OpenClaw** — Gateway as single broker (WebSocket control plane, session
  keys as routing identity). Agent-to-agent via "send message to session
  key" through gateway. Skills as markdown + frontmatter injected into
  system prompt. Compaction with explicit preservation rules (active tasks,
  batch progress, opaque identifiers). Session delta tracking for memory
  re-indexing.

- **NemoClaw** — Declarative YAML policy with binary scoping (which
  executables can reach which endpoints). Credential injection server-side
  (agents never hold keys). Session-scoped dynamic policy (temporary
  permissions that reset). Config integrity via build-time hash pinning
  (agents can't modify their own quality contract). Two-user privilege
  separation (orchestration layer can't be killed by execution layer).

---

# Foundation: Eregion & Memory

Before the dev environment or product tracks, two infrastructure decisions
that underpin everything.

## F1: Eregion Role Change

Eregion drops out of the forge fleet entirely. Becomes dedicated to two jobs:

**B50 (16GB, port 11434) — Memory service (unchanged but richer):**
- Embeddings (nomic-embed-text)
- Memory extraction (GPT-OSS 20b)
- Reranking (BGE cross-encoder)
- Qdrant vector DB
- arnor-memory service

**B60 (24GB, port 11435) — Specialist agent compute (new role):**
- Diagnosis agent inference
- Prompt tuning agent inference
- Verification agent inference
- Research agent inference
- Always available, no contention with forge workloads

**What changes:**
- Remove eregion from forge fleet registry in fleet.py
- Update THE-KEEPING-OF-ARNOR.md to reflect new role
- Update fleet-manifest.md
- No hardware changes, no service restarts for memory

---

## F2: Forge Run Memory Enrichment

The 115+ forge runs are a rich corpus sitting in JSONL logs. Memory currently
captures 3 summary facts per run. The detailed data — gate results, reviewer
feedback, attempt histories, prompt versions — is lost to memory.

### F2.1: Richer Structured Memory from Forge Runs

Replace the 3-fact summary with deeper extraction per run:

- **Gate failure patterns:** Which gates failed, on which task types, how
  often. "coherence_code_gen fails 40% of the time on HTML tasks" is
  actionable. "2 gate failures" is not.
- **Reviewer feedback themes:** What dimensions score low, what the reviewer
  specifically criticised. "CTA clarity consistently scores below 70 on
  landing page copy" tells the prompt agent where to focus.
- **Model pairing effectiveness:** Which generator/reviewer combinations
  produce the best results for which task types. Not just averages — the
  distribution matters.
- **Prompt evolution:** When prompts change between runs, what improved.
  Links prompt changes to score changes.

Update the `ingest_forge_run()` extraction in memory.py. The B50 already
runs the extraction model — give it a better extraction prompt.

### F2.2: Forge Corpus into Knowledge Archive

Ingest the full forge corpus into Qdrant — not just event logs, but the
actual generated outputs. This is graded work: every output has a score,
reviewer feedback, and (for rewrites) a before-and-after pair.

**Three data types to ingest:**

**a) JSONL event logs (what happened):**
- Chunk per-task (a task's full lifecycle is one meaningful unit)
- Tag: project, run_id, task_type, stage, outcome, score
- Enables: "show me runs where the coherence gate failed on HTML tasks"

**b) Generated outputs (what good and bad look like):**
- The actual files produced by each cascade stage — HTML, CSS, copy,
  tech designs, roadmaps, vision docs
- Link each output to its score, reviewer feedback, and gate results
- Tag: project, run_id, task_type, stage, score, verdict (pass/revise/reject)
- Enables: "show me landing page copy that scored above 85 on CTA clarity"
  and "show me the HTML that failed the coherence gate"

**c) Before/after rewrite pairs (what improvement looks like):**
- For every task that went through rewrite, capture both versions
- Link to the reviewer feedback that triggered the rewrite
- Tag: original_score, rewrite_score, feedback_summary
- Enables: "show me how copy improved after reviewer flagged generic CTAs"
  This is the most valuable training signal — concrete examples of what
  "better" looks like for each quality dimension.

**Chunking strategy:**
- Outputs chunked by logical section (HTML by component, copy by section,
  code by file/function) — not arbitrary token splits
- Each chunk linked to its parent task's metadata (scores, feedback, gates)
- Use existing ingestion pipeline, extend with forge-specific chunking

**Metadata schema per chunk:**
- project, run_id, cascade_id, stage, task_id
- task_type (creative / code)
- score, verdict, gate_results
- is_rewrite (bool), original_task_id (if rewrite)
- reviewer_feedback_summary

**What we actually have (as of 2026-03-25):**

380 output files across 160 runs, plus 231 JSONL log files.

| Output Type | Count | What It Is |
|-------------|-------|-----------|
| refine_idea.md | 36 | Raw idea → structured vision |
| sprint_roadmap.md | 31 | Sprint plans with deliverables |
| landing_page_copy.md | 22 | Full landing page copy |
| brand_voice.md | 22 | Brand voice guides |
| site_structure.md | 22 | Site architecture |
| blueprint.md | 18 | Technical design docs |
| HTML pages (6 types) | ~64 | Generated website files |
| coherence_check.md | 6 | Cross-file consistency reviews |
| summaries | 160 | Per-run score/verdict records |

Every output has a reviewer score. Outputs that went through rewrite have
before-and-after pairs with the reviewer feedback that triggered the change.
This is a corpus of graded work — not just what was generated, but how good
it was and what improved it.

### F2.3: Session Reasoning Capture

The JSONL logs show what happened. The output files show what was produced.
But the reasoning — why a model pairing was tried, why it failed, what a
reviewer's weakness is, why a threshold was adjusted — lives in session
transcripts and gets thrown away.

Examples of high-value session reasoning (from a real debug session):
- "Devstral-small penalises cross-file concerns when reviewing HTML tasks
  — it doesn't understand multi-file generation"
- "Dual rescore on creative tasks made site_structure stuck at 78.5 —
  averaging two reviewers pushed scores below threshold unnecessarily"
- "120B generations aren't meaningfully better than smaller models, but
  the whole loop runs 3-4x faster with sub-40B"
- "The review_context field could feed the blueprint to the reviewer so
  it knows what other files exist"

This is institutional knowledge about model behaviour, pipeline dynamics,
and quality strategies. It makes the diagnosis agent smart — instead of
re-discovering "Devstral is harsh on HTML" every time, it knows.

**Two capture paths:**

**OpenCode (Annie via Gateway):** Auto-capture already runs after each
turn via POST /internal/extract. The extraction prompt needs tuning to
recognise and preserve operational insights — model behaviour, debugging
patterns, scoring dynamics — not just facts and decisions.

**Claude Code (direct to Anthropic):** Bypasses the Gateway entirely.
No auto-capture. Session transcripts accumulate locally in
~/.claude/projects/ as JSONL (460MB+ across Forge and Cold Anvil projects).
These need backfill extraction — a one-time specialist agent job on
Eregion's B60 to extract high-value knowledge from historical transcripts.
Going forward, either sync transcripts to Eregion periodically, or rely
on explicit Arnor memory writes during Claude Code sessions.

### F2.4: Recovery Attempt Data (After D1)

Once the recovery loop (D1) is running, every autonomous recovery attempt
feeds back into memory:

- Strategy chosen (retry, decompose, prune, escalate)
- Parameters changed (gate threshold, prompt patch, model switch)
- Result (did it work? new score vs old score?)
- Time taken

This is the corpus building itself. The more the system tries to fix
things, the more it knows about what works. Feeds directly into D1.4
(failure taxonomy as optimisation).

### F2.5: Backfill Historical Corpus

160 runs worth of outputs, logs, and summaries already exist. Plus
586 lines of structured incident reports (PROBLEMS.md) and session
retrospectives. Backfill the lot into the enriched memory and
knowledge archive:

- Re-run the enriched extraction (F2.1) against all 160 run summaries
- Ingest all 231 JSONL log files into Qdrant (F2.2a)
- Ingest all 380 output files into Qdrant with score/verdict metadata (F2.2b)
- Reconstruct before/after rewrite pairs from runs that had rewrites (F2.2c)
- Ingest PROBLEMS.md into both structured memory AND Qdrant — each entry
  is a symptom/cause/fix/notes tuple that the diagnosis agent needs on
  day one (covers: model behaviour, scoring bugs, fleet issues, pipeline
  architecture quirks, security findings)
- Ingest session retrospectives (Research/session-retrospective-*.md) —
  process insights, decision rationale, collaboration patterns
- Ingest build logs (The_Building_Of_Arnor/build/*.md) — daily development
  decisions, architecture evolution, debugging sessions
- Ingest Cold Anvil project docs — especially incidents/
  (e.g. 2026-03-25-uniform-60-scores.md: 655 lines, 10 root causes,
  6 misidentified root causes, full timeline with lessons learned).
  Currently NOT in the corpus because Cold Anvil is a separate repo
  from the Arnor platform. The corpus syncs Arnor but not projects
  built on it.
- Extend ongoing corpus sync to cover project repos (Cold_Anvil/docs/),
  not just the Arnor monorepo. Project-level knowledge is where the
  diagnosis agent will spend most of its time.
- One-time operation for backfill, then ongoing sync handles new content

This is the institutional knowledge bootstrap. From day one, specialist
agents have 36 graded vision docs, 22 graded landing pages, 18 graded
blueprints, and 64 graded HTML files to learn from.

### F2.6: Synthetic Corpus Diversification

The existing corpus is narrow — all runs are Cold Anvil's own website.
Once autonomous cascades (D1) are running, feed diverse ideas through
the system to broaden the corpus:

- Different domains: photography tool, booking app, invoicing SaaS,
  meal planner, local events platform
- Different audiences: solo founders, small teams, enterprise
- Different tech stacks: static sites, React apps, API backends
- Different complexities: landing page only vs full product

Every run produces graded outputs across all stages. The corpus stops
being "how to build Cold Anvil's site" and becomes "how to build
products, full stop."

No real users needed. By the time the first paying customer arrives,
the system has already built dozens of products. Annie's not winging
it — she's drawing on a body of work.

---

# Dev Environment Track

## D0: Sandbox / Production Separation

The recovery loop experiments. Production is stable. Nothing the loop
tries changes the production environment until explicitly promoted.

### D0.1: Sandbox Config Packs

- **Production config packs** — the blessed set that runs real cascades.
  Stable, tested, versioned. This is what ships to users.
- **Sandbox config packs** — copies that the recovery loop can mutate
  freely. Prompt patches, gate threshold tweaks, model swaps. Every
  change logged with rationale and result.
- Sandbox packs are cheap copies — fork from production, experiment,
  discard or promote. Same format, different directory.

### D0.2: Promotion Gate

When a sandbox change produces consistently better results, it gets
promoted to production. Not after one good run — after N runs showing
sustained improvement.

Promotion criteria:
- Improvement is consistent (not a one-off lucky run)
- No regressions on other task types (fixing index_html didn't break
  pricing_html)
- Annie reviews and approves the change
- Jack approves if it touches the quality contract (rubric dimensions,
  gate additions/removals)

Promotion is a deliberate act, not an automatic merge. The sandbox
experiments; production absorbs the winners.

### D0.3: Sandbox Compute Budget

The sandbox has its own compute budget — separate from production.
Prevents runaway experimentation from burning GPU hours that should
go to real work.

- Max GPU-minutes per sandbox session (configurable)
- Max retry attempts per experiment
- Failed experiments still logged — they go into the corpus as
  "we tried X and it made things worse" (valuable negative signal)

### D0.4: Experiment Logging

Every sandbox experiment is a structured record:

- What was changed (prompt patch, gate tweak, model swap)
- Why (which failure triggered it, what the diagnosis said)
- Result (scores before and after, pass/fail delta)
- Promoted? (yes/no, and if yes, which production version)

This is the training data for the prompt tuning agent (D2.3) —
a history of what improvements work and what doesn't.

---

## D1: Autonomous Failure Recovery

### D1.1: Generic Recovery Workflow

Build the basic recovery loop. No failure taxonomy needed — the decision
tree works against any failure, just like GSD's.

Following GSD's model — simple, sequential, generic:

1. Is it transient / environmental? → **RETRY** (same approach, maybe
   different host)
2. Can the problem be narrowed? → **DECOMPOSE** (break the failing stage
   into smaller pieces, re-run the broken part)
3. Is the task infeasible given current constraints? → **PRUNE** (skip
   with justification, continue cascade)
4. Repair budget exhausted? → **ESCALATE** (surface full attempt history
   with what was tried and what happened at each step)

Repair budget: 3 attempts per stage (start simple, tune later).

Wire into existing forge_mcp tools:
- forge_diagnosis (read what failed)
- forge_health (check fleet state)
- forge_submit_batch / forge_run_batch (re-submit)
- forge_output (check results)

Implement as a workflow in the cascade orchestrator (GSD's pattern:
workflow, not separate agent). Log every recovery attempt.

### D1.2: Scope Boundaries

Define what Annie can and can't change autonomously.

**Can change (auto-fix):**
- Gate thresholds (within defined range)
- Prompt wording (targeted patches, not rewrites)
- Model selection (switch to alternate model for retry)
- Retry parameters (timeout, temperature)

**Must escalate:**
- Rubric dimension changes
- Gate additions or removals
- Cascade structure changes
- New infrastructure requirements
- Anything that changes the quality contract

Implement as a checklist the recovery workflow checks before acting.

### D1.3: Escalation Format

What Jack sees when Annie escalates.

- What failed (stage, task, error)
- What was tried (each attempt: strategy, parameters, result)
- What Annie thinks the problem is (best guess, with confidence)
- What Annie would try next (if she had more budget)
- Decision needed from Jack

Not just "it failed" — full context so Jack can make an informed call.

### D1.4: Failure Taxonomy (Optimisation)

Once the generic loop is running, analyse what it encounters.

- Pull recovery logs from actual autonomous attempts
- Categorise observed failures: gate, score, infra, variable injection,
  timeout, model error
- Calculate distribution (what percentage are each type)
- Identify patterns where targeted strategies beat generic retry
- Build specialised recovery paths for high-frequency failure types

This makes recovery faster and smarter, but the generic loop works
without it. Do this after D1.1-D1.3 have been running against real work.

### D1.5: Validation

Test recovery against real failures.

- Run cascades with the recovery loop active
- Verify that generic recovery resolves common failures autonomously
- Verify that escalation triggers at the right moments
- Verify that scope boundaries hold (no unauthorised changes)
- Tune repair budgets based on observed success rates
- Compare: how often does Jack need to intervene now vs before?

---

## D2: Specialist Agent Team

### D2.1: Agent Definition Format

Define the format for specialist agent definitions.

Following GSD's pattern (markdown + YAML frontmatter) with NemoClaw's
governance principles (binary scoping, privilege separation):

```yaml
---
name: diagnosis-agent
tools: [forge_diagnosis, forge_health, forge_output, forge_report]
can_modify: []
can_submit: false
context: [event_log_path, run_id, fleet_status]
output_format: structured_diagnosis
---
```

Each agent definition specifies:
- Name and purpose (one sentence)
- Tools available (principle of least privilege — NemoClaw pattern)
- What it can modify (explicit allowlist, empty = read-only)
- Whether it can submit forge runs (most can't)
- Context requirements (what files/data it needs — paths, not contents)
- Output format (what it produces)

Governance principles (from NemoClaw):
- Agents never hold credentials. Annie's orchestration layer handles auth.
- Agents can't modify their own definitions or quality contracts (gates,
  rubrics). The quality contract is immutable from the agent's perspective.
- Permissions are scoped to the minimum needed. Diagnosis agent reads
  events but can't submit runs. Prompt agent reads outputs but can't
  change rubrics.

### D2.2: Diagnosis Agent

Specialist for reading forge failures and producing structured diagnoses.

- Tools: forge_diagnosis, forge_health, forge_output, forge_report
- Input: run_id of failed run
- Output: structured diagnosis (failure category, root cause hypothesis,
  confidence level, suggested recovery strategy, evidence)
- Constraints: read-only. Cannot submit runs, modify configs, or take action.
  Only observes and reports.

### D2.3: Prompt Agent

Specialist for improving prompts based on rubric feedback.

- Tools: read files (prompt template, rubric, reviewer feedback, output)
- Input: task_id, reviewer feedback, rubric scores by dimension
- Output: targeted prompt patch (what to change, why, expected impact)
- Constraints: proposes changes only. Does not apply them.

### D2.4: Verification Agent

Specialist for testing outputs against real-world criteria.

- Tools: bash (html-validate, link checker, code linting), read files
- Input: generated output files
- Output: verification report (what works, what's broken, severity)
- Constraints: read-only on source. Can run validation tools. Cannot
  modify outputs.

### D2.5: Briefing Assembly

How Annie builds context for specialists.

Following GSD's pattern (paths, not contents) and OpenClaw's compaction
principles (explicit preservation rules for what matters):

- Annie identifies the relevant files for the specialist's task
- Builds a briefing with file paths and a focused prompt
- Specialist reads files in its own fresh context
- Annie stays lean — never accumulates specialist context in her window
- If Annie's own context gets long, compaction preserves: active cascade
  state, repair attempt history, pending decisions, file paths and run IDs
  (following OpenClaw's opaque identifier preservation)

Define the briefing format:
```
Task: Diagnose why run 2026-03-25_112 failed
Read these files:
- /path/to/events.jsonl (event log for this run)
- /path/to/run_summary.json (task statuses and scores)
Focus: Why did tasks index_html and pricing_html fail?
Return: Structured diagnosis per the diagnosis output format.
```

### D2.6: Result Aggregation

How Annie combines specialist outputs into decisions.

- Annie reads each specialist's output
- Cross-references (does the diagnosis match the verification?)
- Makes a decision: which recovery strategy to pursue
- If specialists disagree: Annie uses her judgment or escalates

---

## D3: Goal-Backward Verification

### D3.1: Verification Criteria per Output Type

Define what "actually works" means for each cascade stage output.

**Website cascade:**
- HTML: renders without errors, valid structure, no broken tags
- Links: all internal links resolve, no dead hrefs
- CSS: loads correctly, no missing rules, responsive breakpoints work
- Content: stage 3 copy is present in stage 5 HTML (not placeholders)
- Accessibility: basic WCAG checks (alt text, heading hierarchy, contrast)
- Mobile: viewport renders correctly at 375px, 768px, 1024px

**Future cascades (when built):**
- API: endpoints respond, schemas match spec, auth works
- App: builds without errors, tests pass, basic flows work

### D3.2: Verification Tooling

Select and integrate verification tools.

- html-validate (HTML structure)
- stylelint or similar (CSS quality)
- linkinator or custom link checker (href validation)
- Lighthouse CLI (performance, accessibility, SEO basics)
- Custom content matcher (stage 3 output present in stage 5 HTML)

### D3.3: Verification Pipeline Stage

Add verification as a post-cascade step.

- Runs after all forge stages complete
- Produces a verification report (pass/fail per criterion)
- Failures feed back into D1 recovery loop
- Report is human-readable (Annie can present it to Jack)

---

## D4: Autonomy Dial

### D4.1: Autonomy Levels Definition

Define exactly what each level means in terms of actions.

**Supervised:**
- Annie runs forge cycle as directed
- Presents results after each stage
- Waits for Jack's direction before proceeding
- All recovery requires Jack's approval

**Semi-autonomous:**
- Annie auto-recovers from D1 failure categories
- Runs full cascade without pausing between stages
- Presents results at cascade completion
- Escalates when repair budget exhausted or scope boundary hit

**Autonomous:**
- Annie + specialists work end-to-end
- Multiple cascades if needed (first doesn't meet bar, try again)
- Jack gets a summary: what was attempted, what worked, what's ready
- Only escalates for scope changes or genuine blockers

### D4.2: Safety Controls

Implement controls that apply at all autonomy levels.

- Repair budget (max attempts per stage, per cascade)
- Compute budget (max GPU-minutes per autonomous session)
- Scope boundaries (D1.4 — what can and can't be changed)
- Quality contract (gates and rubrics never bypassed)
- Audit trail (every action logged, reviewable)

### D4.3: Session Configuration

How Jack sets the autonomy level.

- Per-session flag or config
- Can change mid-session ("go autonomous on this, I'll check back later")
- Dashboard shows current autonomy level and what's happening

---

## D5: Wave Execution for Feature Work

### D5.1: Task Decomposition

How Annie breaks a feature into parallel-safe tasks.

- Identify independent work (can run in parallel)
- Identify dependencies (must wait for prior wave)
- Size tasks for a single agent context window
- Define inter-task contracts (what Wave 1 produces that Wave 2 needs)

### D5.2: Wave Orchestration

Manage parallel agent execution.

Following GSD's pattern:
- Agents in a wave run in parallel
- Each agent gets its own context (worktree or fresh session)
- Annie reviews between waves
- Dependency check before spawning next wave
- Partial wave failure handling (continue or stop)

### D5.3: Conflict Resolution

Handle when parallel agents produce conflicting outputs.

- Annie reviews all wave outputs before proceeding
- Identifies conflicts (two agents modified the same area differently)
- Resolves or escalates before next wave starts
- Git-based conflict detection where applicable

---

# Product Track

## P1: Annie Is Your Co-Founder

### P1.1: Stage Transition Conversations

Design Annie's conversational presence at each stage boundary.

For each transition (Vision→Roadmap, Roadmap→Content, Content→Tech Design,
Tech Design→Code, Code→Assembly):
- What does Annie say? (plain language, no jargon)
- What decisions does she surface?
- What does she push back on?
- What's the user's expected response?

### P1.2: Output Interpretation Prompts

Build prompts that let Annie explain technical outputs in plain language.

- Annie reads the cascade output
- Translates into user-appropriate language
- Highlights what matters, skips what doesn't
- Flags anything that needs the user's input

### P1.3: Decision Point Architecture

Define where the cascade pauses for user input.

- Which transitions always pause (user must confirm direction)
- Which transitions can auto-proceed (output was clean, no decisions)
- How Annie handles "just do it" users vs "walk me through everything" users

### P1.4: Conversation Continuity

Annie's presence feels continuous, not like separate form submissions.

- Conversation state persists across stage transitions
- Annie references earlier conversation ("remember when you said...")
- Tone consistency throughout (same Annie, not different prompts)

---

## P2: Annie Gets It Right

### P2.1: User-Facing Recovery Framing

How Annie communicates recovery to non-technical users.

- Never mention retries, gates, scores, or pipeline concepts
- Frame delays as thoroughness ("I wanted to get this right")
- Frame escalation as collaboration ("tell me more about X")
- Define the language for each recovery scenario

### P2.2: Silent Recovery Integration

Wire D1 recovery into the user-facing cascade.

- D1 recovery loop runs behind the scenes
- User sees Annie "working" (progress indicator)
- If recovery succeeds: Annie presents the good output
- If recovery escalates: Annie asks the user a specific question

### P2.3: Quality Floor

Define the minimum quality Annie will present to a user.

- Below this threshold: recover silently
- Above this threshold: present with caveats if needed
- Never present output Annie wouldn't stand behind

---

## P3: Annie Does Her Homework

### P3.1: Research Agent Integration

Wire research capabilities into the cascade.

- Web search for competitor analysis (before Vision stage)
- Landing page analysis (before Content stage)
- Current best practices lookup (before Code stage)
- Results feed into cascade prompts as additional context

### P3.2: Research Quality Gates

Ensure research adds value, not noise.

- Research must be relevant (not generic web results)
- Research must be recent (not outdated information)
- Annie filters research before it enters the pipeline
- Bad research is worse than no research

---

## P4: Annie Adapts to You

### P4.1: Stage Skip/Reorder Logic

How Annie decides which stages to run.

- User says "I already have X" → validate provided input, skip stage
- User says "just give me Y" → fast-path to relevant stage with defaults
- User changes a prior input → re-run affected downstream stages only

### P4.2: Input Validation for Skipped Stages

When user provides their own input for a stage, validate it.

- Does it have the structure the next stage expects?
- Is it complete enough to proceed?
- If not: Annie asks specific follow-up questions

---

## P5: Annie Remembers

### P5.1: Project State Persistence

What Annie remembers about a project across sessions.

- Extraction state from conversations
- Cascade outputs and which stages are complete
- User decisions and preferences expressed during the journey
- What Annie recommended and what the user chose

### P5.2: Incremental Cascade Updates

Re-run only what changed.

- User changes one input → identify affected downstream stages
- Re-run affected stages only
- Present diff to user ("here's what changed")

### P5.3: Long-Term Memory Integration

Annie's memory of a project compounds over time.

- Arnor memory stores project context
- Subsequent sessions build on prior context
- Annie can reference prior conversations and decisions
- Memory is factual, not speculative (what was decided, not what was felt)
