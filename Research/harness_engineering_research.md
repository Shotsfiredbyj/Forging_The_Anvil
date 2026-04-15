# Harness Engineering: Scaffolding Small Models to Frontier Performance

**Research Date:** 9 April 2026
**Context:** Validates the hypothesis that specialised AI systems built around
sub-40B open-source models can match frontier generalist models on constrained
product engineering tasks. This document catalogues the techniques, evidence,
production implementations, and failure modes.

---

## 1. What Is Harness Engineering?

The discipline of building specialised pipeline architectures around LLMs to
improve task performance without fine-tuning the model. The harness — not the
model — becomes the primary lever for quality.

The term crystallised in 2025-2026 as practitioners observed that changing the
scaffold while keeping the model fixed produced larger performance swings than
changing the model while keeping the scaffold fixed. Martin Fowler's framework
describes the harness as a cybernetic governance system with feedforward
controls (guides) and feedback controls (sensors) operating along computational
(deterministic, CPU-based) and inferential (GPU-based, semantic) tracks.

**The headline result:** Fujitsu's Kozuchi pipeline achieved 74.8% on SWE-bench
Verified using an unmodified Qwen3.5-27B — beating OpenHands running a 480B
model (69.6%). The pipeline architecture outperformed a model 18x larger.

Sources: [Martin Fowler](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html),
[Harness Engineering](https://harness-engineering.ai/blog/what-is-harness-engineering/),
[Fujitsu Research](https://blog-en.fltech.dev/entry/2026/04/07/swebench)

---

## 2. Case Study: Fujitsu Kozuchi Pipeline

### 2.1 Overview

Kozuchi mini-swe-agent is a modified version of mini-swe-agent (v1.17.2)
running an unmodified Qwen3.5-27B via vLLM. No fine-tuning. Result:
374/500 = 74.8% on SWE-bench Verified (TTS@8), the highest score among
local/OSS LLMs under 229B parameters as of April 7, 2026.

Authors: Kosaku Kimura, Satoshi Munakata, and 25 other Fujitsu Research staff.
Already deployed internally at Fujitsu for real development work.

### 2.2 Eight-Phase Pipeline

The task is decomposed into 8 sequential phases, each with defined
deliverables. Within each phase, work is divided into workflows (W0..Wn)
with explicit transition control. The agent declares its workflow at every
turn via `WORKFLOW: Wn`. Phase termination requires `WORKFLOW: COMPLETE`
or `WORKFLOW: GIVEUP`, verified by the runtime before transition.

| Phase | Job | Output | On Giveup |
|---|---|---|---|
| ISSUE_REPRODUCT | Reproduce the bug | Repro scripts + symptoms | → CODE_LOCALIZE (skip tests) |
| TEST_SYNTHESIZE | Write fail-to-pass tests | Tests: fail before fix, pass after | → CODE_LOCALIZE |
| CODE_LOCALIZE | Find root cause | Annotated fix candidates | → ISSUE_REPRODUCT (backward) |
| TEST_LOCALIZE | Write pass-to-pass tests | Regression tests | → CODE_FIX |
| CODE_FIX | Implement the fix | Diff | → CODE_LOCALIZE (backward) |
| VERIFY_PATCH | Validate the patch | Verification log | → CODE_FIX (backward) |
| ISSUE_CLOSE | Pre-submission review | Checklist, clean diff | → CODE_FIX (backward) |
| FINAL_REPORT | Audit documentation | Root cause + fix + verification | → FINAL_REPORT (self-loop) |

**Key design decisions:**

- **Backward transitions are allowed.** CODE_LOCALIZE can loop back to
  ISSUE_REPRODUCT. VERIFY_PATCH loops back to CODE_FIX. This is retry with
  re-investigation, not blind re-attempt.
- **Forward jumps are rejected** by runtime validation.
- **Separating CODE_LOCALIZE and TEST_LOCALIZE** was called out as one of the
  most important decisions. Finding where to change and identifying what must
  not break are distinct problems.
- **Workflows within phases are executable procedures.** Example from CODE_FIX:
  W2 reviews pass-to-pass tests → W3 modifies code → W4 checks fail-to-pass
  (if fail, return W2) → W5 checks pass-to-pass (if fail, return W2) → W6
  tests boundary values (if fail, return W2). Retry loop W3→W4→W2 is
  legitimate; W3→W7 is rejected.

### 2.3 Dual-Agent Per Turn ("Orchestra Runtime")

Same Qwen3.5-27B, two sampling configs per turn:

| Role | Temperature | top_p | top_k | Job |
|---|---|---|---|---|
| Conductor | 0.6 | 0.95 | 20 | Workflow declaration, reasoning, draft command |
| Tool-specialist | 0.0 | 0.95 | 20 | Reformat command block for syntactic validity |

**Why this split exists:** The two failure modes are opposites. Lower
temperature on the conductor narrows exploration and causes action-pattern
loops. Higher temperature on the tool-specialist destabilises shell syntax
and tool call formatting. The split cleanly separates these concerns.

**Mechanics:**
1. Conductor produces full response (WORKFLOW + THOUGHT + draft command)
2. Runtime extracts the command block, adds phase context + detected tool name
3. Tool-specialist receives only this block and reformats (no re-reasoning)
4. Final response uses conductor's WORKFLOW/THOUGHT + tool-specialist's command

They tried different models for each role — same-model-different-temperature
was the best performing configuration.

### 2.4 Eight Parallel Runs + Cross-Agent Test Selection

**Candidate generation:** 8 independent full runs of the entire 8-phase
pipeline, each producing its own fix patch AND its own test scripts.

**Cross-agent testing ("xcheck"):** After all 8 runs complete, run A's tests
are executed against patches from runs B through H (and vice versa for all
combinations). Produces a per-instance comparison matrix.

**Selection rule:**

```
score = (0.3 × F2P_pass + 0.7 × P2P_pass) / test_count
Tiebreaker: shortest_patch_raw (character count)
```

- F2P coefficient = 0.3 (fail-to-pass: did the fix actually fix the bug?)
- P2P coefficient = 0.7 (pass-to-pass: did the fix avoid regressions?)
- Weights estimated on SWE-bench dev split; stable across F2P 0.20–0.33

**P2P weighted 2.3x higher than F2P** — regression safety is the harder
discriminator between candidates.

**Concrete example (sympy__sympy-21612):** 5 of 8 runs produced valid
patches. Cross-agent tests eliminated 3 candidates. Tiebreaker selected
the shorter of two 0.94-scoring patches (553 vs 577 chars).

**Critical finding:** Weighted aggregation of cross-agent test results
consistently outperformed LLM-based patch scoring and ranking. Executable
test evidence beats model-as-judge for patch selection.

### 2.5 Filesystem-Based State (`/_share/`)

State lives on disk, not in conversation history:

| Asset | Scope | Purpose |
|---|---|---|
| `{PHASE}.md` | Within phase | Working notes, strategy, candidates |
| `Kanban.md` | All phases | Summary of findings |
| `handover_{from}_to_{to}.md` | Phase transitions | Compressed memo for next phase |
| `repro_*.py`, `test_*.py`, `test_*_all.sh` | Cross-phase | Verification scripts |
| `line_trace_*.log`, `caller_trace_*.log` | Cross-phase | Investigation logs |

**Asset freezing:** Before CODE_FIX, `test_PASS_TO_PASS*` goes read-only.
The agent cannot weaken regression tests during the fix phase.

### 2.6 Context Compression

Token budget management is precise:

```
prompt_budget = min(
    max_prompt_tokens - context_margin,
    MAX_MODEL_LEN - max_new_tokens - context_margin
)
```

With `max_prompt_tokens=150000` and `max_new_tokens=16384`.

- Uses HuggingFace tokeniser with model's chat template. If tokeniser fails
  to initialise, the system refuses to proceed.
- **Handover triggers:** token budget exceeded → same-phase handover (LLM
  writes compressed memo, prompt rebuilt from memo + filesystem assets).
  Turn threshold exceeded → forced handover (32–192 turns depending on phase).
- **Tool output truncation:** if observation exceeds budget, `max_output_length`
  is halved and re-rendered (up to 6 attempts). Fallback: minimal stub with
  only returncode.

### 2.7 Specialised Tools

| Tool | Purpose |
|---|---|
| `line_trace` | Line-by-line execution trace with variable states |
| `caller_trace` | Dynamic call chain from target function to all callers |
| `coedit_localize` | Ranks co-edited files using commit history (pre-computed by Devstral-24B) |
| `line_edit` | Single-line edit with line-number matching and `--expected` validation |

Tools are **phase-gated**: injected only when current phase and available
tools match. Fewer, more relevant options per turn improves performance.

### 2.8 Turn Count Data (Adopted Trajectories)

495 instances analysed. Per-run adoption counts ranged 43–69 (no single run
dominated).

| Metric | All | Resolved | Unresolved |
|---|---|---|---|
| Median turns | 266 | 259 | 280 |
| p90 turns | 449 | 428 | 522 |
| Max turns | 925 | — | — |

Biggest gap between resolved and unresolved is in CODE_FIX and VERIFY_PATCH.
The failure mode is late-stage repair loops, not initial investigation.

### 2.9 Competitive Context

| Configuration | Model | Params | SWE-bench % |
|---|---|---|---|
| **Kozuchi** | **Qwen3.5-27B** | **27B** | **74.8** |
| Baseline | Qwen3.5-27B | 27B | 72.4 |
| mini-SWE-agent | MiniMax M2.5 | 229B | 75.8 |
| Unknown | Qwen3.5-397B-A17B | 397B | 76.4 |
| OpenHands | Qwen3-Coder-480B | 480B | 69.6 |
| Lingxi v1.5 | Kimi K2 Instruct | 1024B | 71.2 |

The 2.4pp gain (72.4→74.8) comes entirely from harness engineering. The result
sits on the Pareto frontier — no smaller model exceeded 74.8%.

---

## 3. Taxonomy of Harness Engineering Techniques

### 3.1 Phase Decomposition

Breaking tasks into sequential phases with defined deliverables and
verification gates.

**Evidence:**
- Kozuchi's 8 phases: 74.8% with 27B (Fujitsu, Apr 2026)
- Agentless's 3-stage decomposition: 48% with Qwen3-32B — highest among all
  scaffolds in SWE-Effi evaluation (arXiv:2407.01489)
- AutoCodeRover's 3 phases: average 6 steps per workflow vs OpenHands' 29
  iterations (arXiv:2509.09853v2)
- SCOPE (ICLR 2025 Workshop): 0.56 success rate vs 0.52 for monolithic
  agents, inference time down from 164.4s to 3.0s
- Amazon Science: smaller LLMs when specialised through task decomposition
  match frontier on those same tasks. But adds coordination overhead:
  O(n) + O(km) where 1 < m ≤ 2

### 3.2 Test-Time Compute Scaling

Spending more inference compute (multiple samples, search, verification)
rather than using a larger model.

**Evidence:**
- **Snell et al. (arXiv:2408.03314):** Small model with optimal test-time
  compute outperforms 14x larger model in FLOPs-matched evaluation.
  Compute-optimal strategy improves efficiency 4x over best-of-N baseline.
  Critical caveat: effectiveness varies by prompt difficulty — easiest and
  hardest problems favour pretraining, intermediate problems favour test-time
  compute.
- **REBASE (arXiv:2408.00724, ICLR 2025):** Llemma-7B with 32 samples
  matches Llemma-34B with 64 samples at 2x fewer FLOPs. Achieves same
  accuracy with 7x less compute than weighted voting. Weaker models benefit
  more: +5.3% for Mistral-7B, +3.3% for Llemma-7B, +2.6% for Llemma-34B.
  **7B is typically the optimal model size across inference compute budgets.**
- **Gemini CoT@32:** 32 chain-of-thought samples with consensus. 90.04%
  MMLU vs 86.4% for GPT-4 (BAIR blog).
- **Block-wise value-guided search:** DeepSeek-R1-Distill-1.5B achieves
  45.7% on competition math benchmarks.

**Diminishing returns:** accuracy improves with more chains but plateaus,
especially for easier datasets. MCTS underperforms sampling-based methods
at each compute budget (REBASE paper).

### 3.3 Multi-Agent Architectures

Using the same or different models in different roles.

**Evidence:**
- **Kozuchi's Conductor/Tool-specialist:** Same model, different temperature.
  Separates exploration (temp 0.6) from precision (temp 0.0). Best
  configuration found — outperformed using different models for each role.
- **Multi-Agent Debate (MAD) — ICLR 2025:** Current MAD frameworks **fail to
  consistently outperform** simpler single-agent strategies. GPT-4o-mini on
  MMLU: Self-Consistency 82.13% vs best MAD 80.40%. With Llama3.1-8b, gaps
  widen: Multi-Persona 13.27% vs Chain-of-Thought 57.47%.
  **Exception:** mixed-model debates (GPT-4o-mini + Llama3.1-70b) reached
  88.20% MMLU vs ~80% single-model. Model diversity helps.
- **Majority voting alone captures most of the performance gains** typically
  attributed to MAD.
- **Devin (Feb 2026):** Parallel agents using git worktrees (up to 8
  simultaneously). Specialised roles: Planner, Architect, Implementer,
  Tester, Reviewer.

### 3.4 Iterative Refinement / Self-Repair

Generate → evaluate → rewrite loops.

**Evidence:**
- **Self-Refine (NeurIPS 2023):** 20% absolute average improvement across 7
  tasks. Same LLM as generator, refiner, and feedback provider. No training.
  2025 extensions: GPT-4o-mini +21.76pp on assertion correctness;
  Gemini-2.0-flash +32pp on unit test generation. (arXiv:2303.17651)
- **Execution-feedback loops:** 43.9% → 61.0% with 5 repeated runs (+17pp).
  RepairAgent: 164 correct fixes (116 exact matches with developer fixes).
  CodeCoR: pass@1 of 77.8% on HumanEval/MBPP variants. (arXiv:2507.18755)
- **Debugging effectiveness decay (Nature, 2025):** Codestral-22B
  (lambda=0.34) and DeepSeek-Coder-6.7B (lambda=0.47) sustain useful
  debugging through 5+ attempts. Higher decay rates make additional iterations
  wasteful.
- **Convergence:** Models converge within 2–5 iterations. Largest improvements
  in first 1–2 rounds. Practical systems cap at 2–5 iterations.
- **Over-refinement risks:** security degradations, code bloat, convergence
  failures.

### 3.5 Execution-Based Verification

Real tools (compilers, linters, test runners, browsers) instead of LLM-as-judge.

**Evidence:**
- LLMs struggle to judge code correctness without execution. GPT-4-turbo
  "frequently misjudges the correctness of code." (arXiv:2507.16587)
- Fujitsu's cross-agent testing replaces LLM judges entirely. Executable
  evidence outperforms model-based ranking.
- Spotify Honk: two-tier verification — deterministic verifiers (activated by
  codebase, e.g. Maven verifier from pom.xml) plus LLM judge. Judge vetoes
  ~25% of sessions; agents course-correct ~50% of the time.
- CodePRM (ICML 2025): process reward model + execution yields +26.9%
  correctness, +42.2% efficiency.
- Sophisticated judge models align with human judgment up to 85%, higher than
  human-to-human agreement (81%). But "thinking" models (o1, QwQ) drastically
  outperform standard instruction-tuned models as judges.

### 3.6 Context Engineering

Structured prompts, role-pinning, reference sections, few-shot examples, RAG.

**Evidence:**
- **Systematic framework (arXiv:2507.13334):** Three components — context
  retrieval/generation, context processing, context management.
- **Agentic Context Engineering (ACE, arXiv:2510.04618):** Treats contexts as
  evolving playbooks that accumulate and refine strategies. +10.6% on agent
  benchmarks, +8.6% on finance benchmarks.
- **DSPy:** Automatic prompt optimisation via MIPRO and SIMBA. GPT-3.5: +25%
  over standard few-shot. llama2-13b: **+65%** over standard few-shot.
  Smaller models benefit more from optimised prompting.
- **Observation masking (JetBrains, Dec 2025):** Replaces older observations
  with placeholders, keeps rolling window of 10 recent turns. 50%+ cost
  reduction with performance parity. Qwen3-Coder 480B: 2.6% higher solve
  rates at 52% lower cost. LLM summarisation was worse — caused 13–15%
  longer execution paths and consumed 7%+ of total costs.

### 3.7 Tool Augmentation

Giving models access to code search, editing, testing, debugging tools.

**Evidence:**
- Kozuchi's specialised tools (line_trace, caller_trace, coedit_localize,
  line_edit) — phase-gated, narrowly scoped.
- Claude Code: ~40 tools in plugin architecture. 5.5x token efficiency over
  Cursor on equivalent tasks — efficiency from architecture, not model.
  (arXiv:2603.05344)
- SWE-Agent: curated Agent-Computer Interface (ACI) commands for repo
  navigation, file inspection, code editing.
- OpenHands: Docker containers with Jupyter kernel, web UI, multi-agent.

### 3.8 Candidate Generation + Selection

Generate multiple candidates, select the best.

**Evidence:**
- **AlphaCode:** Up to 1M candidates per problem, filtered and clustered to
  max 10 submissions. Matches 85th percentile of humans on coding contests.
  Demonstrates that solution scaling produces better returns than model
  scaling alone: 30%→80% via solution scaling vs 30%→35% via training budget
  tripling. (Science, BAIR blog)
- **Fujitsu TTS@8:** 8 runs, cross-agent testing. 72.4%→74.8% (+2.4pp).
- **Gemini CoT@32:** 32 samples with consensus. 86.4%→90.04% on MMLU
  (+3.64pp).
- **Self-certainty-based voting** consistently outperforms self-consistency
  in best-of-N selection.

### 3.9 State Management

Filesystem state, working memory, handover memos, context compression.

**Evidence:**
- Kozuchi's `/_share/` directory: survives context compression, handover,
  and phase transitions. Test assets frozen before fix phase.
- **Contextual Memory Virtualisation (CMV, arXiv:2602.22402):** DAG-based
  session history with snapshot/branch/trim primitives. Mean 20% token
  reduction, up to 86%.
- **Agentic Memory (AgeMem, arXiv:2601.01885):** Memory operations as
  tool-based actions — agents autonomously store, retrieve, update, summarise,
  discard.
- Token snowball effect: naive memory accumulation causes linear token
  growth, degrading reasoning quality (multiple sources).

### 3.10 Skill/Instruction Injection

Phase-gated prompts, conditional tool availability.

**Evidence:**
- Kozuchi: skills injected only when current phase and available tools match.
  "Fewer, more relevant options per turn is itself a performance improvement."
- OpenDev agent (arXiv:2603.05344): Plan mode excludes write operations from
  schema entirely. Tool schemas filtered per subagent via SubAgentSpec — more
  reliable than runtime checks.
- Two-phase execution: skill instructions injected as hidden message, then
  agent's context modified with pre-approved tools activated.

---

## 4. Quantified Evidence Summary

### 4.1 Measured Performance Lifts

| Technique | Lift | Source |
|---|---|---|
| Kozuchi 8-phase + TTS@8 (27B) | 72.4% → 74.8% (+2.4pp) | Fujitsu, Apr 2026 |
| Self-Refine (7 tasks avg) | ~20% absolute | arXiv:2303.17651 |
| Self-Refine on unit tests (Gemini-flash) | 57.3% → 89.3% (+32pp) | 2025 extension |
| Execution feedback (5 runs) | 43.9% → 61.0% (+17pp) | arXiv:2507.18755 |
| Tree of Thoughts, Game of 24 (GPT-4) | 4% → 74% (+70pp) | arXiv:2305.10601 |
| DSPy auto-compilation (llama2-13b) | +65% over standard few-shot | dspy.ai |
| DSPy auto-compilation (GPT-3.5) | +25% over standard few-shot | dspy.ai |
| ACE context engineering | +10.6% on agent benchmarks | arXiv:2510.04618 |
| CodePRM (process reward + execution) | +26.9% correctness, +42.2% efficiency | ICML 2025 |
| MCTS on Mistral-7B | +5.9% MATH, +15.8% ARC-C | arXiv:2405.00451 |
| Observation masking | 50%+ cost reduction, parity | JetBrains, Dec 2025 |
| Harness quality alone (same model) | 42% → 78% success rate | Nate B Jones |
| Three scaffolds × same model (Opus 4.5) | 50.2% – 55.4% (5.2pp spread) | SWE-bench |

### 4.2 Which Model Sizes Benefit Most

Smaller models benefit disproportionately from scaffolding:

- REBASE tree search: +5.3% Mistral-7B, +3.3% Llemma-7B, +2.6% Llemma-34B
- DSPy: llama2-13b +65% vs GPT-3.5 +25%
- 7B is typically the optimal model size across inference compute budgets
- Llemma-7B matches Llemma-34B accuracy at ~2x fewer FLOPs

### 4.3 Model Capability Floors

Below a certain model size, scaffolding cannot compensate:

- Gemma-3 4B and Qwen-3 1.7B: 0–4% resolution on SWE-bench across all
  frameworks. "The SLM's limited reasoning was the bottleneck." (SWEnergy)
- ClawsBench: Flash-Lite 39% vs 50–63% for stronger models, even with
  identical scaffolding.
- SWE-Agent: Qwen3-32B 28% vs GPT-4o-mini 10% — model-scaffold synergy
  matters.
- **Practical floor: ~7–14B for meaningful (>10%) SWE-bench resolution.
  Sweet spot: 27–32B for competitive performance.**

### 4.4 Diminishing Returns

- Iterative refinement converges in 2–5 iterations, exponential decay
- Best-of-N plateaus especially on easier tasks
- Multi-agent debate: more rounds and agents don't consistently help
- Fujitsu TTS@8: 8x inference cost for 2.4pp improvement

### 4.5 Head-to-Head: Scaffolded Small vs Unscaffolded Large

| Comparison | Result |
|---|---|
| Kozuchi Qwen3.5-27B (74.8%) vs OpenHands Qwen3-Coder-480B (69.6%) | 27B + harness beats 480B by 5.2pp |
| Snell et al. | Small model + optimal test-time compute beats 14x larger |
| Nate B Jones | Same model: 42% → 78% from harness alone |
| SWE-bench, three scaffolds × Opus 4.5 | 5.2pp spread from harness alone |
| SWE-Effi: Qwen3-32B + AutoCodeRover (38%) vs Llama-3.3-70B + same (28%) | Smaller model + same scaffold outperforms |

---

## 5. Production Implementations

### 5.1 SWE-bench Agent Architectures

**Dissection of 80 approaches (arXiv:2506.17208):** Seven architecture groups
classified by workflow authoring, control flow autonomy, and agent count.
178 total entries, 71 distinct submitters. No single architecture consistently
achieves SOTA — both scaffolded and emergent approaches compete.

| Agent | Architecture | Key Pattern |
|---|---|---|
| SWE-Agent | ReAct loop + specialised ACI | Curated tool commands |
| OpenHands | Event-stream, multi-agent, Docker | CodeAct + Browser + Delegate agents |
| Agentless | No agent autonomy, 3-stage | Hierarchical localisation + repair. $0.70/instance |
| AutoCodeRover | 3 sequential phases | Most efficient per API call (avg 6 steps) |
| Kimi-Dev | Agentless training recipe | 60.4% SWE-bench Verified |

### 5.2 Production Code Generation Products

| Product | Model Strategy | Harness Approach |
|---|---|---|
| **Cursor** | Custom small for tab completion; Composer 2 on Kimi K2.5 (open) + frontier selectable | Multi-model routing, agent interface |
| **Claude Code** | Frontier (Opus/Sonnet) | ~40 tools, 46K-line query engine, autonomous loop |
| **Devin** | Multi-model | Parallel agents (8 worktrees), specialised roles |
| **Spotify Honk** | Not disclosed | Two-tier verification (deterministic + LLM judge) |
| **Replit** | "Society of models" (1B distilled + open-source + frontier) | Size-matched to task complexity |
| **Sourcegraph Cody** | StarCoder (open) for completions, frontier for chat | Codebase-aware context |

**Common pattern:** All use a model mix — small/open for volume, frontier
for complex reasoning. None rely exclusively on sub-40B for all tasks.

### 5.3 Framework Design Primitives

The awesome-harness-engineering taxonomy identifies 11 primitives:

1. Agent Loop
2. Planning & Task Decomposition
3. Context Delivery & Compaction
4. Tool Design
5. Skills & MCP
6. Permissions & Authorization
7. Memory & State
8. Task Runners & Orchestration
9. Verification & CI Integration
10. Observability & Tracing
11. Human-in-the-Loop

Recurring architectural patterns: Plan-and-Execute Split, Middleware Hooks
(6-point interception), Filesystem-Based Context, Eager Scaffolding,
Compound Multi-Model, Schema-Filtered Subagents.

Source: [GitHub](https://github.com/ai-boost/awesome-harness-engineering)

---

## 6. Failure Modes and Limitations

### 6.1 Where Scaffolding Doesn't Help

- "More explicit structure does not automatically improve performance."
  Harness modules help when they "tighten the path from intermediate behaviour
  to evaluator acceptance conditions." Over-structuring introduces
  misalignment failures. (arXiv:2603.25723)
- Multi-agent debate: no consistent benefit over simple self-consistency for
  most reasoning tasks (ICLR 2025)
- On hardest problems, pretraining compute is more effective than test-time
  compute (Snell et al.)

### 6.2 Model Capability Floors

- 1.7B and 4B: 0–4% resolution on SWE-bench across all frameworks
- Flash-Lite: 39% vs 50–63% for stronger models with identical scaffold
- GPT-4o-mini: 10% resolution on SWE-Agent vs Qwen3-32B's 28%
- "Centralised architectures with low-capability orchestrators underperform
  dramatically"

### 6.3 Anti-Patterns

| Anti-Pattern | Problem |
|---|---|
| **Mega-Prompt Fragility** | Overloading single agent with hundreds of instructions → hallucination, missed tasks |
| **Correlated Bias** | Homogeneous multi-agent systems share blind spots, produce false consensus |
| **Judge-Producer Context Sharing** | Judge becomes participant in collective delusion |
| **Cascading Failures** | Single misread compounds at each downstream node |
| **Over-Indexing on Frameworks** | Essential components often better built custom |
| **Over-Refinement** | Security degradations, code bloat, convergence failures |

MAST taxonomy (arXiv:2503.13657) documents 14 system-level failure modes
undetectable at individual agent level. Additional taxonomy (arXiv:2511.19933):
15 hidden failure modes including multi-step reasoning drift, context-boundary
degradation, version drift, cost-driven performance collapse.

### 6.4 Cost Overhead

- Failed attempts consume 3–4x more resources than successful ones (SWE-Effi)
- AlphaCode: ~1M solutions per problem (impractical for production)
- AutoCodeRover consumed 9.4x more energy than OpenHands with sub-5B models
- LLM summarisation for context: 13–15% longer execution, +7% costs
  (JetBrains) — observation masking was better and cheaper

---

## 7. Composability: Which Combinations Produce Multiplicative Gains?

### 7.1 Phase Decomposition + Execution Verification

Kozuchi: 8 phases with hard verification gates (VERIFY_PATCH requires exit
code 0 from both F2P and P2P logs). 3 consecutive gate failures force GIVEUP.
Result: 74.8% with 27B — the strongest evidence of this combination working.

### 7.2 Candidate Generation + Cross-Testing

AlphaCode: 30%→80% via solution scaling (1M candidates + filtering) vs
30%→35% via training budget tripling. Solution scaling produces dramatically
better returns than model scaling.

### 7.3 Iterative Refinement + Tool Augmentation

Spotify Honk: deterministic verifiers + LLM judge + sandboxed execution.
Course-correction on ~50% of vetoed sessions. Engineering agent with test
feedback: 43.9%→61.0% (+17pp).

### 7.4 Context Engineering + Skill Injection

Kozuchi: phase-gated tools + filesystem state + handover memos + Kanban.
OpenDev: plan mode with write-excluded schemas + dynamic system prompt
composition.

### 7.5 Multiplicative vs Additive

Evidence for near-multiplicative combinations:
- **Phase decomposition + execution verification:** 27B beats 480B
- **Candidate generation + cross-testing:** 30%→85th percentile (AlphaCode)
- **DSPy full-pipeline optimisation:** +65% for 13B (exceeds sum of parts)

Sub-additive:
- **Multi-agent debate + majority voting:** voting alone captures most benefit

### 7.6 The Compound AI Systems Insight

"As systems grow in complexity, new challenges arise in optimising not only
individual components but also their interactions." End-to-end performance is
often monotonic in how well each module performs, but the interactions between
modules matter more than individual module quality. (BAIR blog, LLMSelector
framework)

---

## 8. Key Takeaways

1. **The harness is the product.** Changing the scaffold while keeping the
   model fixed produces larger performance swings than changing the model while
   keeping the scaffold fixed. Nate B Jones: 42%→78% from harness alone.

2. **Small models benefit more.** DSPy: +65% for 13B vs +25% for GPT-3.5.
   REBASE: +5.3% for 7B vs +2.6% for 34B. The scaffolding ROI is highest
   for smaller models.

3. **27–32B is the sweet spot.** Below ~7B, scaffolding can't compensate for
   fundamental capability gaps. Above ~32B, you're paying for parameters that
   scaffolding could have provided. 7B is optimal per FLOP in research; 27–32B
   is optimal in production for SWE-bench-class tasks.

4. **Execution beats judgment.** Cross-agent testing beats LLM-as-judge
   (Fujitsu). Deterministic verifiers + LLM judge beats LLM judge alone
   (Spotify). Real tools provide ground truth that models cannot.

5. **Phase decomposition is the highest-leverage technique.** Every
   competitive SWE-bench agent uses some form of task decomposition. The
   number of phases varies (3 for Agentless, 8 for Kozuchi) but the principle
   is universal: constrain the model's scope per step.

6. **Iteration has sharp diminishing returns.** First 1–2 rounds give most of
   the lift. Cap at 2–5. Over-refinement degrades quality.

7. **Multi-agent debate is overrated.** Majority voting captures most of the
   benefit. Model diversity (not agent count) helps. Same-model-different-
   temperature for role separation works better than debate.

8. **Context management is underrated.** Observation masking (JetBrains)
   gives 50%+ cost reduction at parity. Filesystem-based state (Kozuchi)
   prevents context loss across long tasks. LLM summarisation paradoxically
   makes things worse.

---

## Sources

### Academic Papers
- [Snell et al., "Scaling LLM Test-Time Compute" (Aug 2024)](https://arxiv.org/abs/2408.03314)
- [Inference Scaling Laws (arXiv:2408.00724, ICLR 2025)](https://arxiv.org/abs/2408.00724)
- [Self-Refine (arXiv:2303.17651, NeurIPS 2023)](https://arxiv.org/abs/2303.17651)
- [Tree of Thoughts (arXiv:2305.10601)](https://arxiv.org/abs/2305.10601)
- [Agentless (arXiv:2407.01489)](https://arxiv.org/abs/2407.01489)
- [Dissecting SWE-Bench (arXiv:2506.17208)](https://arxiv.org/abs/2506.17208)
- [SWE-Effi (arXiv:2509.09853)](https://arxiv.org/html/2509.09853v2)
- [SWEnergy (arXiv:2512.09543)](https://arxiv.org/html/2512.09543)
- [Natural-Language Agent Harnesses (arXiv:2603.25723)](https://arxiv.org/html/2603.25723v1)
- [Building AI Coding Agents (arXiv:2603.05344)](https://arxiv.org/html/2603.05344v1)
- [Context Engineering Survey (arXiv:2507.13334)](https://arxiv.org/abs/2507.13334)
- [ACE (arXiv:2510.04618)](https://arxiv.org/abs/2510.04618)
- [CMV (arXiv:2602.22402)](https://arxiv.org/html/2602.22402v1)
- [AgeMem (arXiv:2601.01885)](https://arxiv.org/html/2601.01885v1)
- [CodePRM (ACL/ICML 2025)](https://aclanthology.org/2025.findings-acl.428/)
- [MAST taxonomy (arXiv:2503.13657)](https://arxiv.org/pdf/2503.13657)
- [System failure modes (arXiv:2511.19933)](https://arxiv.org/abs/2511.19933)
- [DSPy (arXiv:2310.03714)](https://arxiv.org/abs/2310.03714)
- [Debugging effectiveness decay (Nature, 2025)](https://www.nature.com/articles/s41598-025-27846-5.pdf)
- [LLM code judging (arXiv:2507.16587)](https://arxiv.org/abs/2507.16587)
- [LLM code judging (IEEE TSE)](https://www.computer.org/csdl/journal/ts/2025/08/11071936/2851vlBjr9e)
- [SCOPE (ICLR 2025 Workshop)](https://openreview.net/pdf?id=W8dxn7hBkO)
- [MAD evaluation (ICLR 2025)](https://d2jud02ci9yv69.cloudfront.net/2025-04-28-mad-159/blog/mad/)

### Industry Sources
- [Fujitsu Kozuchi (Apr 2026)](https://blog-en.fltech.dev/entry/2026/04/07/swebench)
- [Martin Fowler: Harness Engineering](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html)
- [Harness Engineering Guide](https://harness-engineering.ai/blog/what-is-harness-engineering/)
- [BAIR: Compound AI Systems](https://bair.berkeley.edu/blog/2024/02/18/compound-ai-systems/)
- [JetBrains Context Management (Dec 2025)](https://blog.jetbrains.com/research/2025/12/efficient-context-management/)
- [Spotify Honk](https://engineering.atspotify.com/2025/12/feedback-loops-background-coding-agents-part-3)
- [Awesome Harness Engineering](https://github.com/ai-boost/awesome-harness-engineering)
- [Amazon Science: Task Decomposition](https://www.amazon.science/blog/how-task-decomposition-and-smaller-llms-can-make-ai-more-affordable)
- [SWE-bench leaderboard](https://www.swebench.com/)
- [Simon Willison: SWE-bench analysis](https://simonwillison.net/2026/Feb/19/swe-bench/)
