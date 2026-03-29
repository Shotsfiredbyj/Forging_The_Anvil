# Distillation Eval: opus_annie:122b vs qwen3.5:122b

**Date:** 2026-03-28
**Status:** Planned, not yet executed
**Author:** Jack + Annie

## Context

Jack distilled Opus 4.6 into Qwen3.5 122B via SFT/QLoRA (3,500 prompts, including
Opus thinking traces). The model is deployed as `opus_annie:122b` on Annuminas but
hasn't been evaluated yet. We need to know: did the distillation make it better, and
did it break anything?

Two layers: creative A/B head-to-head (Layer 1) and Neko health regression (Layer 2).

---

## File Structure

All eval work lives under the existing distillation directory:

```
Research/distillation/eval/
  ab_eval.py                    # Layer 1: A/B generation + judging
  neko_regression.py            # Layer 2: thin wrapper around Neko pipeline
  analyze_results.py            # Unified stats and reporting
  prompts/
    creative_prompts.json       # 20 creative prompts (new)
    breadth_prompts.json        # 10 non-creative from held-out set
  rubrics/
    distillation_creative_v1.md # New rubric for creative A/B
    distillation_breadth_v1.md  # Simpler rubric for non-creative prompts
  outputs/                      # Generated during runs (gitignored)
  reports/                      # Final analysis
```

---

## Layer 1: Creative A/B Head-to-Head

### Thinking Mode

Both models think freely. Think tags stripped from output before judging. Both get
`num_predict=6144` to accommodate thinking overhead. This tests whether the Opus
thinking traces in the training data actually improved reasoning quality.

### Prompt Pack (20 creative + 10 breadth)

**Creative prompts (20) -- mixed types:**

| Type | Count | What it tests |
|------|-------|---------------|
| VO cold opens | 3 | Voice authenticity, rhythm, restraint, sensory detail, structural compliance. Varied contexts (city return, new camera, rain shoot). Based on frontier benchmark pattern. |
| Short screenplay scenes | 3 | Dialogue craft, character voice, narrative economy, scene structure. Each with specific constraints (word count, character count, tone). |
| Character voice pastiche | 3 | Inhabiting a specific voice (tired ER nurse, 1970s BBC nature presenter, grumpy bookshop owner). Tests persona control and consistency. |
| Analytical essays with voice | 3 | Sustaining an argument with distinctive prose style. Tests reasoning + writing simultaneously (the hybrid that distillation should improve most). |
| Product/marketing copy | 3 | Specificity, CTA clarity, language hygiene. Tight constraints. Bridges creative and practical. |
| Rewrite/editing tasks | 3 | Given mediocre prose, improve it. Tests restraint (don't over-edit), judgment about what to change, and voice preservation. |
| Constrained poetry/lyric | 2 | Formal constraints (syllable count, structure). Tests precision under tight rules. |

Every prompt has hard structural constraints (word counts, section counts, specific
formatting) for objective compliance checking, plus soft quality dimensions for
LLM-as-judge scoring.

**Breadth prompts (10) -- from held-out eval set:**
- 3 code, 2 architecture, 2 product/analysis, 2 general reasoning, 1 complex reasoning
- Selected manually from `data/prompts/eval_prompts.jsonl`
- Uses a simpler rubric (instruction compliance + quality)

### Rubric: distillation_creative_v1.md

Forge format. Five dimensions targeting what distillation should improve:

| Dimension | Weight | Rationale |
|-----------|--------|-----------|
| **Voice & Nuance** | /25 | Primary Opus quality: distinctive voice, restraint, trusting the reader, no AI-speak |
| **Instruction Compliance** | /25 | Every hard constraint met? Word count, structure, formatting. Binary, countable. |
| **Reasoning Depth** | /20 | Multi-step reasoning visible in creative choices. Deliberate, not random. |
| **Creativity & Originality** | /15 | Unexpected angles, metaphors, structural choices. Not the first obvious answer. |
| **Structural Precision** | /15 | Well-organized, no padding, efficient use of space. Internal planning quality. |

Scoring anchors follow frontier benchmark pattern (1-3 Low, 5-6 Mid, 8-10 High)
with specific observable criteria per dimension. Reference:
`Arnor_Research/benchmarks/frontier/Test Packs/frontier-judge-rubrics.md`

### ab_eval.py Architecture

**Phase 1: Generation (batch by model to minimize swaps)**

```
# All prompts through model A first, then all through model B
# 1 model swap total instead of 2N swaps

for prompt in all_prompts:
    response_a = call_ollama(prompt, model="qwen3.5:122b",
                             host="http://annuminas:11434",
                             think=True, num_predict=6144)
    strip_think_tags(response_a)
    save(response_a)

# Ollama auto-swaps models (~30-60s for 70GB model)

for prompt in all_prompts:
    response_b = call_ollama(prompt, model="opus_annie:122b",
                             host="http://annuminas:11434",
                             think=True, num_predict=6144)
    strip_think_tags(response_b)
    save(response_b)
```

Resume support: check which prompts already have responses, skip completed ones.

**Phase 2: Judging (on Anduril, separate GPU)**

```
for each prompt with both responses:
    # Randomize order (blind the judge to which is A vs B)
    shuffle presentation order

    judge_prompt = build_comparative_prompt(rubric, prompt, output_x, output_y)

    scores = call_ollama(judge_prompt,
                         model="mistral-small3.2:24b-instruct-2506-fp16",
                         host="http://anduril:11434",
                         think=False, num_predict=4096, temperature=0.1)

    parse scores for both outputs, record with de-blinding
```

Judge scores each output independently against all rubric dimensions, then states
preference. Gives dimension-level data, not just a winner.

**Phase 3: Analysis (in analyze_results.py)**
- Paired t-test per dimension and overall (same prompt = natural pairing)
- Cohen's d effect size
- Win/loss/draw counts
- Per-prompt-type breakdown (VO vs scenes vs essays vs...)
- Position bias check (does first-presented output score higher?)
- Score distribution histograms

### Key implementation details

**Ollama calling:** Adapt from `/home/jack/Neko_Demo/pipeline/llm.py` (call_ollama
function, lines 305-345). Both models get think=True (or omit the param -- Ollama
defaults to thinking for Qwen architecture), num_predict=6144. Always strip think
tags from output.

**Judge parsing:** Import/adapt `parse_review_response()` from
`/home/jack/Neko_Demo/pipeline/07_evaluate.py` (lines 196-284). Already handles
multiple table formats, central tendency detection, weighted total calculation.

**VRAM:** Each model is ~70GB Q4_K_M. Annuminas has 96GB. Only one large model at a
time. Ollama handles swapping automatically. Judge (Mistral Small 24B) runs on
Anduril concurrently.

---

## Layer 2: Neko Health Regression

### One-line fix required

`/home/jack/Neko_Demo/pipeline/06_generate.py` line 374 -- add `"opus_annie"` to the
thinking-enabled check:

```python
# Before:
return "distilled" in m or "reasoning" in m or "mirothinker" in m

# After:
return "distilled" in m or "reasoning" in m or "mirothinker" in m or "opus_annie" in m
```

Without this, Neko's call_ollama sets think=False and num_predict=2048 for opus_annie.
The model was trained with thinking traces -- disabling thinking may hurt quality.
With the fix, it gets num_predict=6144 and thinking is left to the model's default
(enabled).

Note: the base Qwen3.5 122B baseline was run with think=False. So opus_annie with
thinking enabled is NOT a like-for-like comparison -- it's testing "best possible
output" from each. This matches the Layer 1 approach (both think) and answers the
product question: which should we deploy?

### Execution

```bash
# Step 1: Generate with opus_annie (on Annuminas, ~3.2 hours for 193 profiles x 2 products)
cd /home/jack/Neko_Demo
python pipeline/06_generate.py \
    --split eval --product both \
    --model opus_annie:122b \
    --host http://annuminas:11434

# Step 2: Evaluate with Mistral Small (on Anduril, ~1.6 hours)
python pipeline/07_evaluate.py \
    --input "forge/outputs/*opus_annie*member_summary*.jsonl" \
    --product member_summary \
    --judge-host http://anduril:11434

python pipeline/07_evaluate.py \
    --input "forge/outputs/*opus_annie*clinician_prebrief*.jsonl" \
    --product clinician_prebrief \
    --judge-host http://anduril:11434
```

### Comparison

neko_regression.py loads baseline scores and new scores, matches by member_id:
- Paired t-test on weighted totals
- McNemar's test on PASS/FAIL binary
- Per-dimension comparison (5 clinical dimensions)
- **Pass criterion:** no statistically significant regression (p > 0.05), or if
  significant, the direction is improvement

Baseline locked at: member summary 86.2/100 (95% PASS), clinician pre-brief 77.6/100
(60% PASS).

---

## Execution Sequence

| Phase | Annuminas (96GB) | Anduril (12GB) | Duration |
|-------|-----------------|----------------|----------|
| 1. A/B gen: qwen3.5:122b | qwen3.5:122b | idle | ~15 min |
| 2. A/B gen: opus_annie:122b | opus_annie:122b | idle | ~22 min |
| 3. A/B judging | idle | Mistral Small 24B | ~10 min |
| 4. Neko generation | opus_annie:122b | idle | ~3.2 hrs |
| 5. Neko evaluation | idle | Mistral Small 24B | ~1.6 hrs |

Total: ~5-6 hours. Phases 4+5 can overlap (evaluate on Anduril as outputs arrive).
Run Neko overnight.

---

## Implementation Steps

1. Create directory structure under `Research/distillation/eval/`
2. Write creative prompt pack (20 prompts in JSON with structural constraints)
3. Write distillation rubric (Forge format, 5 weighted dimensions with anchors)
4. Write breadth rubric (simpler, for non-creative prompts)
5. Select 10 breadth prompts from `eval_prompts.jsonl`
6. Write `ab_eval.py` -- generation + judging phases, thinking-aware
7. Fix `_needs_thinking_enabled` in Neko's `06_generate.py` (one line)
8. Write `neko_regression.py` -- wrapper + comparison stats
9. Write `analyze_results.py` -- unified reporting
10. Run Layer 1 (~45 min)
11. Run Layer 2 (~5 hrs, overnight)
12. Generate report

---

## Critical Files

**To create:**
- `Research/distillation/eval/ab_eval.py`
- `Research/distillation/eval/neko_regression.py`
- `Research/distillation/eval/analyze_results.py`
- `Research/distillation/eval/prompts/creative_prompts.json`
- `Research/distillation/eval/prompts/breadth_prompts.json`
- `Research/distillation/eval/rubrics/distillation_creative_v1.md`
- `Research/distillation/eval/rubrics/distillation_breadth_v1.md`

**To modify (one line):**
- `/home/jack/Neko_Demo/pipeline/06_generate.py:374`

**To reference/reuse:**
- `/home/jack/Neko_Demo/pipeline/llm.py` -- Ollama calling pattern
- `/home/jack/Neko_Demo/pipeline/07_evaluate.py` -- parse_review_response()
- `Arnor_Research/benchmarks/frontier/Test Packs/frontier-judge-rubrics.md` -- rubric anchor patterns
- `Cold_Anvil/forge/rubrics/creative_output.md` -- creative rubric reference
- `Research/distillation/data/prompts/eval_prompts.jsonl` -- breadth prompt source

---

## Verification

**Before running:**
- Verify both models respond on Annuminas: `curl http://annuminas:11434/api/tags`
- Verify Mistral Small on Anduril
- Dry-run one prompt per model, check think tags are present and stripped correctly
- Verify _needs_thinking_enabled fix is in place before Neko generation

**After Layer 1:**
- Manual spot-check: read 3-5 paired outputs, does the better-scored one actually feel better?
- Position bias check: roughly 50/50 presentation order, no systematic first-position advantage
- Central tendency check: judge isn't giving identical scores to everything
- No think-tag contamination in scored outputs

**After Layer 2:**
- Compare opus_annie gate pass rates to baseline
- Check for think-tag contamination in clinical outputs
- Verify all 193 profiles were generated (resume support means partial runs are possible)
- Statistical sanity: normality check for t-test, fallback to Wilcoxon if violated
