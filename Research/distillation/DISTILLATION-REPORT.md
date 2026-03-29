# Distilling Claude Opus 4.6 into Qwen3.5 122B

**Date:** 2026-03-27 to 2026-03-28
**Author:** Jack + Nellie
**Status:** FAILED — model produces degenerate output on open-ended prompts. Not deployable.
**Evaluation:** Layer 1 (A/B creative) complete. Real-world testing revealed critical failure.

## What This Is

A knowledge distillation project: using Claude Opus 4.6 as a teacher model to
improve Qwen3.5 122B-A10B (the primary fleet model on Annuminas) via supervised
fine-tuning (SFT) with QLoRA. The goal is general capability improvement —
reasoning depth, instruction following, nuance — not domain-specific tuning.

Personal use only, not published.

## Why SFT Over DPO

The Neko Demo project uses DPO (Direct Preference Optimization) for
health-domain tuning, where multiple local models generate outputs for the same
prompts and the best/worst are paired. That works when models are already
competitive and you're refining preferences.

For distillation from a significantly stronger teacher across many domains, SFT
provides a stronger learning signal. The student learns to reproduce the
teacher's reasoning patterns directly, not just to prefer one output over another.

SFT also loads one copy of the model (not two like DPO). For a 122B MoE model
that needs ~104GB VRAM in 4-bit, this matters — DPO would require ~208GB,
making it impossible on anything short of 3xH200.

## The Pipeline

### Step 1: Prompt Curation

**Source: Claude Code session transcripts**

22,400 user messages across all projects were available in
`~/.claude/projects/*//*.jsonl`. These represent exactly how Jack uses his
agents — the reasoning tasks, code work, architecture discussions, product
thinking. Far better than generic open-source datasets for "make my personal
model better."

**Multi-turn window extraction**

Initial attempt extracted single user messages. The result was poor — 84% of
messages were classified as "simple" with a median length of 66 characters.
Most Claude Code messages are short instructions like "read that file" or "fix
the tests" — useful in context but meaningless alone.

The fix: multi-turn conversation windows. For each user message, if it was
substantial (>100 chars) it was kept standalone. If short, it was paired with
up to 4 preceding turns (2 user/assistant exchanges) to provide context. This
transformed the dataset:

| Metric | Single-turn | Multi-turn |
|--------|-------------|------------|
| Median length | 66 chars | 924 chars |
| Complex prompts | 4% | 60% |
| Uncategorised | 61% | 8% |

**Supplementary open-source data**

Transcripts were heavy on engineering/architecture/product but light on math,
science, and creative writing. 1,500 prompts from OpenHermes 2.5 and Orca-Math
filled these gaps.

**Final dataset: 3,500 prompts**

| Source | Count | Coverage |
|--------|-------|----------|
| Transcripts (multi-turn) | 2,450 (70%) | Code, architecture, product, reasoning |
| OpenHermes 2.5 | 1,000 | Math, science, general analysis |
| Orca-Math | 500 | Step-by-step mathematical reasoning |

Category distribution:
- Code: 1,115 (32%)
- Product: 464 (13%)
- Architecture: 370 (11%)
- Math reasoning: 356 (10%)
- Science: 238 (7%)
- Math: 231 (7%)
- General analysis: 225 (6%)
- General: 195 (6%)
- Creative: 162 (5%)
- Analysis: 81 (2%)
- Complex reasoning: 41 (1%)
- Nuanced/ambiguous: 22 (1%)

**Script:** `01_curate_prompts.py`

### Step 2: Teacher Generation

**Tiered API strategy**

Not all prompts need the most expensive model. Prompts were assigned to tiers
based on category and complexity:

| Tier | Model | Prompts | Completions | Errors | Cost |
|------|-------|---------|-------------|--------|------|
| Hard | Claude Opus 4.6 | 1,642 | 1,641 | 1 | $129.54 |
| Easy | Claude Sonnet 4.6 | 1,622 | 1,619 | 2 | $16.77 |
| Medium | Claude Sonnet 4.6 | 236 | 236 | 0 | $1.64 |
| **Total** | | **3,500** | **3,496** | **3** | **$147.94** |

Token totals: 1,387,062 input + 2,676,559 output = 4,063,621 tokens.

**Extended thinking (reasoning distillation)**

Opus completions included extended thinking traces — Claude's internal
reasoning chain captured via the `thinking` API parameter. These traces were
included in the training data wrapped in Qwen's native `<think>` tags, so the
student learns not just what to answer but how to reason through problems.

1,641 completions included thinking traces (median 850 chars). 1,855 (Sonnet
tier) did not — Sonnet thinking was not enabled as the cost/benefit was less
clear for simpler prompts.

**Implementation details**

- Anthropic SDK directly (not OpenRouter) for prompt caching and thinking access
- Async generation with 5 concurrent requests, rate-limited to 50 RPM
- Resume support: completions appended to JSONL as they arrive, skip already-done prompts on restart
- Cost tracking per request with real-time batch reporting
- All three tiers ran in parallel overnight, completed in ~3 hours

**Script:** `02_generate_teacher.py`

### Step 3: SFT Dataset Construction

Teacher completions were formatted for TRL's SFTTrainer using Qwen's chat
template (messages format). The `--include-thinking` flag wraps Opus thinking
traces in `<think>` tags inside the assistant turn.

**Final SFT dataset: 3,477 examples** (19 skipped for short completions)

- Estimated total tokens: ~3M
- At 2 epochs: ~6M training tokens
- Format: JSONL with `messages` list (system + user + assistant)

**Script:** `03_build_sft_dataset.py`

### Step 4: QLoRA SFT Training

**Model: Qwen3.5-122B-A10B**

- Architecture: Mixture of Experts (MoE), 256 routed experts, 8 routed + 1 shared active per token
- Total parameters: 122B
- Active parameters per token: 10B
- HuggingFace ID: `Qwen/Qwen3.5-122B-A10B`
- BF16 safetensors download: ~250GB (39 files)

**LoRA configuration — attention-only for MoE safety**

For dense models, LoRA typically targets all linear layers including the MLP
projections (gate, up, down). For MoE models, this means putting LoRA adapters
on every expert's MLP — 256 experts getting independent adaptations risks
destabilising the routing network.

Instead, LoRA targeted only the shared attention layers (q_proj, k_proj,
v_proj, o_proj). Every token sees these layers regardless of which experts are
active, giving a consistent learning signal.

```
r: 32              (bumped from 16 — broader transfer needs more capacity)
alpha: 64           (2x rank, standard)
dropout: 0.05
target_modules: [q_proj, k_proj, v_proj, o_proj]
trainable params: 14,548,992 (0.012% of 122B)
```

**Quantisation: 4-bit NF4 (QLoRA)**

```
load_in_4bit: true
quant_type: nf4
compute_dtype: bfloat16
double_quant: true
```

**Training configuration**

```
batch_size: 2
grad_accum: 4        (effective batch: 8)
max_length: 1536
epochs: 2
lr: 5e-7
optimizer: paged_adamw_8bit
gradient_checkpointing: true (use_reentrant: false)
```

**Hardware: RunPod 2xH200 SXM (Secure Cloud, US-GA-2)**

The model in 4-bit NF4 requires ~104GB VRAM — significantly more than the naive
estimate of 61GB (122B x 0.5 bytes). MoE architecture overhead, embedding
layers, and quantisation metadata account for the difference. A single H200
(141GB) was not enough — OOMed at 62% during loading. 2xH200 (283GB) worked
comfortably.

VRAM usage:
- After model load: 104.1GB (across 2 GPUs)
- After LoRA: 104.1GB (14.5M params is negligible)
- Peak during training: 110.7GB

**Training gotcha: `prepare_model_for_kbit_training`**

The standard peft function `prepare_model_for_kbit_training()` converts some
parameters to float32, spiking VRAM by ~6GB. On a model already using 104GB,
this OOMed. The fix: skip it entirely and enable gradient checkpointing
directly via `model.gradient_checkpointing_enable()`.

**Results**

| Metric | Value |
|--------|-------|
| Training loss | 1.496 |
| Runtime | 10,195s (2h 50m) |
| Samples/second | 0.682 |
| Steps/second | 0.085 |
| Total steps | 870 |
| Peak VRAM | 110.7GB |
| GPU cost | ~$20 ($7.18/hr x 2.8hr) |

**LoRA adapter size: 28MB** (14.5M params in bf16)

**Script:** `04_sft_train.py`

### Step 5: Merge and Export

**LoRA merge**

The 28MB LoRA adapter was merged back into the full 122B base model weights.
This requires loading the entire model in bf16 (~250GB), applying the adapter,
and saving the merged result. Done on RunPod 2xH200 — too large for local
hardware.

Output: 228GB merged safetensors (49 shards x ~4.6GB each)

**GGUF conversion**

The merged safetensors were converted to GGUF format via llama.cpp's
`convert_hf_to_gguf.py`.

Important lessons learned during this step:

1. `llama-quantize` requires f16/f32 input. **Q8_0 cannot be further
   quantised.** Our first attempt went safetensors -> Q8_0 -> Q4_K_M and
   failed at the second step. The correct path is always f16 first.

2. The f16 GGUF is the **master copy** — every other quantisation (Q4, Q5, Q6,
   Q8) derives from it. It must be kept on persistent storage.

3. RunPod NFS can fail on single large file writes (130GB+). Using
   `--split-max-size 20G` to break the output into 20GB shards solved this.

**Conversion pipeline (final, working):**

```
Merged safetensors (228GB, /workspace)
  -> convert_hf_to_gguf --outtype f16 --split-max-size 20G
  -> f16 GGUF (244GB, 13 shards, /workspace)
  -> llama-quantize Q4_K_M
  -> Q4_K_M GGUF (70GB, /workspace)
```

**Output files:**

| File | Size | Location |
|------|------|----------|
| f16 GGUF (master) | 244GB (13 x ~19GB shards) | RunPod network volume + Annuminas |
| Q4_K_M GGUF (deploy) | 70GB | RunPod network volume + Annuminas |

**Ollama registration:**

```
ollama create opus_annie:122b -f Modelfile
```

Modelfile: no system prompt baked in, temperature 0.7, 32K context, standard
Qwen stop tokens.

### Step 6: Evaluation (Layer 1 — A/B Creative Head-to-Head)

**Completed 2026-03-29.** Layer 2 (Neko health regression) pending.

**Method:** 30 prompts (20 creative + 10 breadth) run through both base
qwen3.5:122b and opus_annie:122b. Cross-family judge (Mistral Small 24B on
Anduril) scored both outputs blind against custom rubrics. Presentation order
randomised to control for position bias.

**Thinking mode:** Base model ran with `think=False` (its production setting).
opus_annie ran with thinking enabled and 16384 token budget — the model was
trained with Opus thinking traces in `<think>` tags and needs room to reason
before responding.

**Creative rubric dimensions:** Voice & Nuance (/25), Instruction Compliance
(/25), Reasoning Depth (/20), Creativity & Originality (/15), Structural
Precision (/15).

**Breadth rubric dimensions:** Correctness & Accuracy (/30), Instruction
Compliance (/25), Reasoning Quality (/25), Clarity & Structure (/20).

**Results:**

| Metric | Base (qwen3.5:122b) | Distilled (opus_annie:122b) | Delta |
|--------|---------------------|----------------------------|-------|
| Overall score | 75.8 | 77.2 | +1.3 |
| Paired t-test | — | — | p=0.32 (not significant) |
| Cohen's d | — | — | 0.185 (negligible) |

**By prompt type (sorted by delta):**

| Type | n | Base | Distilled | Delta |
|------|---|------|-----------|-------|
| Product | 2 | 77.8 | 87.8 | +10.0 |
| Code | 3 | 82.2 | 86.2 | +4.0 |
| Poetry | 2 | 74.5 | 76.5 | +2.0 |
| Copy | 3 | 76.2 | 78.2 | +2.0 |
| Screenplay | 3 | 70.8 | 72.8 | +2.0 |
| Reasoning | 3 | 83.5 | 85.0 | +1.5 |
| Rewrite | 3 | 68.7 | 70.2 | +1.5 |
| Voice | 3 | 67.3 | 68.7 | +1.3 |
| Essays | 3 | 72.3 | 71.8 | -0.5 |
| VO scripts | 3 | 78.5 | 75.2 | -3.3 |
| Architecture | 2 | 90.0 | 80.0 | -5.0 |

**Interpretation:** The distillation improved product thinking (+10), code
quality (+4), and most creative tasks (+1 to +2). It regressed on architecture
(-5) and VO scripts (-3). The overall delta is not statistically significant
(p=0.32, Cohen's d=0.185). This is a small but directionally positive result
on 30 prompts — not conclusive, but suggests the Opus reasoning traces
transferred some benefit to product and code reasoning without major regression
elsewhere.

**Known issues with this eval:**
- Judge preference parsing failed (0/30 parsed) — Mistral Small's output
  format didn't match the expected regex. Scores were parsed correctly.
- 3 prompts had central tendency warnings (judge gave identical scores across
  all dimensions).
- Base model's `think=False` vs opus_annie's thinking-enabled creates an
  asymmetric comparison. This is intentional — it answers "which should we
  deploy?" not "is the distillation better holding all else equal?"

**Thinking mode discovery:** opus_annie's Ollama Modelfile doesn't support the
`think: true` API parameter (returns 400). The model outputs `<think>` tags as
text in the content field because that's how the SFT training data was
structured. With the original 6144 num_predict, the model burned its entire
token budget on thinking for complex prompts, producing empty output. Increasing
to 16384 resolved this. The base model has the opposite problem — with thinking
enabled, its untrained thinking consumes the entire budget. Setting `think=False`
is required for production use of the base model.

**Eval tooling:** All scripts, prompts, rubrics, and outputs are in
`Research/distillation/eval/`. See `EVAL-PLAN.md` for the full design.

### Step 6b: Evaluation (Layer 2 — Neko Health Regression)

**Not yet completed.** Infrastructure is ready:

- `neko_regression.py` wrapper written and tested
- `_needs_thinking_enabled` fix applied to Neko's `06_generate.py` (adds
  "opus_annie" to the thinking model check)
- Baseline locked at: member summary 86.2/100 (95% PASS), clinician pre-brief
  77.6/100 (60% PASS)
- Estimated runtime: ~5 hours (193 profiles x 2 products + evaluation)
- Run with: `python eval/neko_regression.py`

## Cost Summary

| Item | Cost |
|------|------|
| Claude API (Opus + Sonnet, 3,496 completions) | $147.94 |
| RunPod training (2xH200, 2h 50m) | ~$20 |
| RunPod merge + GGUF conversion (~3 hours across multiple pods) | ~$25 |
| RunPod failed attempts (wrong images, undersized disks, deleted files) | ~$15 |
| Network volume (1TB, US-GA-2, ongoing) | $70/month |
| **Total compute** | **~$208** |

## What Went Wrong

This project had a clean research/planning phase and a chaotic execution phase.
The mistakes are documented here so they're not repeated.

### RunPod pod creation failures

1. **Guessed a Docker image tag** (`runpod/pytorch:2.8.0-py3.12-cuda12.8.1-cudnn-devel-ubuntu22.04`) that didn't exist. Pod sat in an infinite restart loop. RunPod uses its own naming convention — always verify with `runpodctl template search`.

2. **Undersized disk** repeatedly. The model is 250GB in safetensors. Created 100GB volumes, then 200GB container disks. HuggingFace needs ~2x model size during download (temp files + final). Should have done the math once and used 500GB+.

3. **Tried Community Cloud with network volumes.** Network volumes are Secure Cloud only. This wasn't documented anywhere obvious — learned by failure.

4. **Created volumes in datacenters without GPU availability.** Volumes are DC-pinned. Created a volume in EU-CZ-1, couldn't get H200s there. The working approach: script that tests volume creation + pod creation in each DC sequentially.

5. **Used 1xH200 when the model needed 2.** Estimated 61GB VRAM (122B x 0.5 bytes). Actual: 104GB. MoE overhead, embeddings, and quantisation metadata add ~70%. OOMed at 62% loading.

### Training script issues

6. **`prepare_model_for_kbit_training` OOMed.** Converts params to float32, spiked memory by 6GB on a model already using 104GB. Fix: skip it, use `gradient_checkpointing_enable()` directly.

7. **`SFTConfig` parameter name wrong.** Used `max_seq_length` (old TRL) instead of `max_length` (TRL 0.29.1). Version-dependent API.

8. **`device_map="auto"` vs `device_map={"": 0}`.** With 1 GPU, auto tried to offload to CPU (bitsandbytes doesn't support this). With 2 GPUs, auto works correctly.

### GGUF conversion failures

9. **Q8_0 -> Q4_K_M doesn't work.** `llama-quantize` can only quantize from f16/f32. Wasted 25 minutes of GPU time on a Q8_0 conversion that was a dead end.

10. **Deleted merged safetensors while GGUF conversion was reading them.** Conversion died at 21% with FileNotFoundError. Then reflexively stopped the pod, losing the partial GGUF on container disk. Turned a recoverable situation into a full redo.

11. **"Tight but should fit" disk sizing.** 293GB of output on 300GB disk. Did the math, saw it was tight, pressed ahead anyway. Should have used 500GB.

12. **Treated f16 GGUF as a throwaway intermediate.** Wrote it to ephemeral container disk. It's actually the master copy — every other quantisation derives from it. Should always go on persistent storage.

13. **NFS write failure on large files.** RunPod NFS choked on a single 130GB sequential write. Fix: `--split-max-size 20G`.

## What Went Right

1. **Prompt curation from transcripts.** Multi-turn window extraction produced a
   high-quality, domain-relevant dataset that generic open-source data can't match.

2. **Tiered API strategy.** Using Opus only for hard prompts and Sonnet for the
   rest cut API costs from an estimated $285 to $148.

3. **Extended thinking traces.** Capturing Claude's reasoning chain and encoding
   it in Qwen's native `<think>` format is the key differentiator of reasoning
   distillation vs standard distillation.

4. **Attention-only LoRA for MoE.** Conservative choice that avoids destabilising
   the expert routing network. Whether this limits the distillation benefit is
   an open question for evaluation.

5. **Resume-safe generation.** The teacher generation script appends completions
   to JSONL as they arrive and skips already-done prompts. Overnight run
   completed without babysitting.

6. **RunPod skill documentation.** Every failure was captured in a Claude Code
   skill (`~/.claude/skills/runpod/`) so future sessions don't repeat them.

## Files and Artifacts

```
Forging_The_Anvil/Research/distillation/
  DISTILLATION-REPORT.md              # This document
  config.yaml                          # Full configuration
  01_curate_prompts.py                 # Prompt extraction and curation
  02_generate_teacher.py               # Claude API teacher generation
  03_build_sft_dataset.py              # SFT dataset formatting
  04_sft_train.py                      # QLoRA SFT training
  05_merge_and_export.py               # LoRA merge + GGUF export
  .env                                 # Anthropic API key (not committed)
  data/
    prompts/curated_prompts.jsonl      # 3,500 curated prompts
    prompts/eval_prompts.jsonl         # 100 held-out eval prompts
    teacher/completions_hard_*.jsonl   # 1,641 Opus completions
    teacher/completions_easy_*.jsonl   # 1,619 Sonnet completions
    teacher/completions_medium_*.jsonl # 236 Sonnet completions
    sft/sft_dataset_with_thinking.jsonl # 3,477 formatted training examples
  checkpoints/
    qwen35_122b_sft_20260328_073637/   # LoRA adapter (28MB)

Annuminas:
  /home/jack/models/qwen35-122b-distilled/
    qwen35_122b_distilled-Q4_K_M.gguf   # 70GB deployment GGUF
    qwen35_122b_distilled-f16-*.gguf     # 244GB master f16 GGUF (13 shards)
    Modelfile                             # Ollama model definition

Ollama (Annuminas):
  opus_annie:122b                        # Registered and ready to serve

RunPod:
  Network volume 9htmzdrglf (US-GA-2, 1TB)
    /workspace/qwen35_122b_distilled-Q4_K_M.gguf
    /workspace/qwen35_122b_distilled-f16-*.gguf
    /workspace/merged/qwen35_122b_distilled/  # Merged safetensors
    /workspace/hf_cache/                       # Base model cache
```

## Reproduction

To reproduce the full pipeline from scratch:

```bash
cd Forging_The_Anvil/Research/distillation/

# 1. Curate prompts (requires Claude Code session transcripts)
python3 01_curate_prompts.py --target 3500

# 2. Generate teacher completions (requires ANTHROPIC_API_KEY, ~$150)
python3 02_generate_teacher.py --tier hard    # Opus, ~$130
python3 02_generate_teacher.py --tier easy    # Sonnet, ~$17
python3 02_generate_teacher.py --tier medium  # Sonnet, ~$2

# 3. Build SFT dataset
python3 03_build_sft_dataset.py --include-thinking

# 4. Train on RunPod 2xH200 (~$20, ~3 hours)
python3 04_sft_train.py \
  --model Qwen/Qwen3.5-122B-A10B \
  --dataset data/sft/sft_dataset_with_thinking.jsonl \
  --output checkpoints/qwen35_122b_sft \
  --batch-size 2 --grad-accum 4

# 5. Merge + GGUF (on RunPod, ~$25)
# See full_pipeline.py on the RunPod pod, or:
#   a. Merge LoRA into base model (2xH200, bf16, device_map=auto)
#   b. convert_hf_to_gguf --outtype f16 --split-max-size 20G
#   c. llama-quantize f16.gguf Q4_K_M.gguf Q4_K_M

# 6. Load into Ollama
ollama create opus_annie:122b -f Modelfile
```

## Post-Mortem: Why The Model Failed

**Date discovered:** 2026-03-29 (same day as fleet integration attempt)

The Layer 1 A/B eval scored opus_annie at +1.3 overall across 30 prompts.
The scores looked promising: product reasoning +10, code +4. But when
deployed as the default Gateway model and tested with an open-ended
prompt ("Hi Annie"), the model produced degenerate repetitive output —
an infinite loop of fake menu items ("Bangers and Mash with Onions and
Mushrooms and Gravy, 11.50 pounds, Add to Basket" repeated endlessly).

**Why the eval missed it:** All 30 eval prompts had strict structural
constraints (word counts, section counts, beat structures, format rules).
These constraints kept the model on rails. Without guardrails, the model
has no stable attractor for open-ended generation and degenerates into
repetitive loops.

**Root cause analysis (researched 2026-03-29):**

Post-mortem research into MoE fine-tuning literature revealed multiple
compounding failures, all stemming from treating the MoE architecture
like a dense model.

**1. Attention-only LoRA is fundamentally wrong for MoE.**

Research shows attention-only LoRA underperforms MLP-only LoRA by 5-15%
on downstream metrics — even at high ranks (arxiv 2404.05086, MoLA ACL
2025). The gap is worse for MoE because expert specialisation lives
entirely in the MLP layers. By freezing all 256 experts, we prevented
the model from adapting expert behaviour to the new task at all.

The irony: we avoided MLP targeting to protect routing stability, but
the instability came from NOT targeting MLPs. Attention representations
shifted while experts stayed frozen, creating a mismatch the router
couldn't handle.

**2. Routing destabilisation from attention/expert mismatch.**

The router makes decisions based on token representations from attention
layers. We modified those representations but froze the experts. The
routing logits no longer matched expert capabilities, sending tokens to
less-relevant experts. MoE-Sieve research (arxiv 2603.24044, 2026) found
that fine-tuning causes highly skewed routing — a small subset of experts
handles most tokens while others go cold. This reduced expert diversity
directly causes reduced output diversity, producing repetitive loops.

**3. QLoRA 4-bit is not supported for this model.**

Qwen3.5-122B-A10B does NOT support QLoRA 4-bit (BitsandBytes has
limitations with MoE architectures). Full LoRA in bf16 is the
recommended approach (Unsloth Qwen3.5 guide). Training completed without
obvious errors, but quantised base weights may have introduced noise
into the LoRA adaptation.

**4. Q4_K_M quantisation amplified instability.**

MoE models are more sensitive to aggressive quantisation than dense
models. With 256 experts but only 8+1 active per token, routing
decisions must be precise. Q4_K_M can degrade routing logits enough to
send tokens to wrong experts. Recommendation: Q5_K_M or above for MoE.

**5. No auxiliary load-balancing loss during fine-tuning.**

This is likely THE primary cause. Standard SFTTrainer from TRL was used
with no auxiliary loss configured. Without load-balancing loss, the
router can collapse — sending all tokens to a small subset of experts.
Those experts hyper-specialise on the narrow training data, producing
repetitive output. The fix: keep auxiliary loss active during fine-tuning
with a smaller coefficient (roughly 1/10th of pre-training value).

Source: "How MoE Models Actually Learn" (Hughes, 2026), MoE Router
Z-Loss Instability literature.

**6. Eval gap: no open-ended generation testing.**

The eval rubric measured quality but not stability. All 30 eval prompts
had strict structural constraints that kept the model on rails. A simple
"generate 10 open-ended responses and check for repetition" test would
have caught the degeneration immediately.

## What The Correct Approach Looks Like

Based on MoE fine-tuning research (MoE-Sieve, HELLoRA, DR-LoRA, Unsloth
docs), a properly executed fine-tune of Qwen3.5-122B-A10B would:

1. **Target expert MLP layers** — use HELLoRA (only hot/frequently-activated
   experts per layer) or DR-LoRA (dynamically allocate rank based on task
   relevance). This reduces params vs targeting all 256 experts while
   maintaining performance.
2. **Use full LoRA in bf16** — not QLoRA 4-bit. Requires ~256GB VRAM.
   RunPod 2xH200 (283GB) or 3xH100 (240GB).
3. **Keep auxiliary load-balancing loss active** — coefficient ~0.01
   (smaller than pre-training). This prevents router collapse.
4. **Freeze router layers** — Qwen disables router fine-tuning by default.
   The pre-trained routing generalises better than fine-tuned routing.
5. **Quantise conservatively** — Q5_K_M minimum, not Q4_K_M.
6. **Eval must include open-ended generation** — degeneration detection
   (repetition checks, diversity scoring) alongside structured rubrics.
7. **Max context 2048 during training** — Unsloth ceiling for single-GPU
   MoE training on this architecture.

**Cost estimate for a correct redo:** 50-80 dollars compute (vs 20 dollars
original). Needs 3xH200 or equivalent at ~12-15 dollars/hr.

**Recommendation:** Park this until Rohan is built. More local compute
removes the VRAM constraint and makes iterative attempts feasible without
cloud GPU costs per try.

## Research Sources

- MoE-Sieve: Routing-Guided LoRA for MoE (arxiv 2603.24044)
- MoLA: MoE LoRA with Layer-wise Expert Allocation (ACL Findings 2025)
- DR-LoRA: Dynamic Rank LoRA for MoE Adaptation (arxiv 2601.04823)
- HELLoRA: Hot Experts Layer-level LoRA (OpenReview)
- A Note on LoRA (arxiv 2404.05086)
- Unsloth Qwen3.5 Fine-tuning Guide
- How MoE Models Actually Learn (Hughes, Medium 2026)
- Solving LLM Repetition Problem in Production (arxiv 2512.04419)

## What Was Learned

Despite the deployment failure, the project validated several things:

1. The distillation pipeline works end-to-end (148 dollars API, 20 dollars training)
2. Extended thinking traces can be transferred via SFT (structured prompts showed improvement)
3. The Forge eval engine works for A/B model comparison
4. Structured eval is necessary but NOT sufficient — open-ended testing is essential
5. The fleet integration path (HOSTS, ROUTES, MODE_DEFAULTS, /api/show) is documented
6. MoE models cannot be fine-tuned like dense models — attention-only LoRA, QLoRA,
   aggressive quantisation, and missing auxiliary loss each contribute to failure
7. The correct MoE fine-tuning approach is well-researched and feasible, but needs
   more compute than was available (full bf16 LoRA, ~256GB VRAM)
