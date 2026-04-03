# Distillation Retry: Claude Opus 4.6 → Qwen3.5-27B (Dense)

## Context

The first distillation attempt (Opus → Qwen3.5-122B-A10B MoE) failed: the model produced degenerate repetitive output on open-ended prompts. Root causes were all MoE-specific — attention-only LoRA froze expert specialisation, no auxiliary load-balancing loss caused router collapse, QLoRA 4-bit is unsupported for this MoE arch, and Q4_K_M degraded routing precision. The correct approach requires ~256GB VRAM (full bf16 LoRA), which exceeds even Rohan's 128GB.

Switching to Qwen3.5-27B (dense) eliminates every MoE failure mode. The existing pipeline (3,500 curated prompts, 3,496 teacher completions at $148, 3,477 formatted SFT examples) carries over unchanged — only the training config, training script, and eval need updating. Total additional compute cost: **$0** (all local).

**Prior art:** Jackrong/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled used ~3,950 examples from Claude 4.6 Opus with LoRA SFT and thinking traces — nearly identical to our pipeline. No published benchmarks, but confirms the approach is viable.

## What's Reusable

| Step | Script | Status |
|------|--------|--------|
| 01 Curate prompts | `01_curate_prompts.py` | Reuse as-is (3,500 prompts) |
| 02 Teacher generation | `02_generate_teacher.py` | Reuse as-is (3,496 completions, $148 sunk) |
| 03 Build SFT dataset | `03_build_sft_dataset.py` | Reuse as-is (same Qwen chat template) |
| 04 SFT training | `04_sft_train.py` | **Modify** |
| 05 Merge & export | `05_merge_and_export.py` | Minor updates (docstrings) |
| Eval: A/B | `eval/ab_eval.py` | **Modify** (model names) |
| Eval: Neko regression | `eval/neko_regression.py` | **Modify** (model name, baselines) |
| Eval: Degeneration | — | **Create new** (Layer 0 gate) |

## Critical: Architecture-Specific Constraints

Qwen3.5 uses a **hybrid Gated DeltaNet architecture** (75% linear attention, 25% standard transformer attention). This has important implications:

1. **No QLoRA 4-bit.** Unsloth explicitly warns against it — "higher than normal quantization differences." Must use **bf16 LoRA** instead.
2. **Requires transformers v5.** Older versions won't load the model.
3. **Seq_len=2048 is a hard ceiling** for single-GPU training. Even H100 80GB OOMs at 4096 on backward pass.
4. **Model type is `qwen3_5`** (not `qwen3`), which can break some tooling.
5. **DeltaNet layers don't use RoPE** — only the 25% Gated Attention layers do.

## Training Hyperparameters

| Parameter | 122B MoE (failed) | 27B Dense (proposed) | Rationale |
|-----------|-------------------|---------------------|-----------|
| LoRA targets | q/k/v/o only | q/k/v/o + gate/up/down | Dense: all linear layers. Proven in Neko DPO pipeline |
| LoRA rank | r=32, alpha=64 | r=32, alpha=64 | Sweet spot for broad transfer. "How Much is Too Much?" (ACL 2025): r=64 optimal for reasoning, but r=128 can degrade. r=32 is safe with 3,477 examples |
| Quantisation | QLoRA 4-bit NF4 | **bf16 LoRA (no quantisation)** | QLoRA not recommended for Qwen3.5 hybrid architecture (Unsloth) |
| Learning rate | 5e-7 | **1e-4** | LoRA needs ~10x higher LR than full SFT. "LoRA Without Regret": optimal LoRA LR is 1e-4 to 5e-4. Unsloth default: 2e-4. Conservative start at 1e-4 for 27B |
| LR scheduler | linear (default) | **linear** | "Secret Recipe" (2024): cosine vs linear negligible with AdamW. "Pre-training without LR Decay" (2025): constant/linear outperforms cosine for SFT |
| Warmup | 10% | **10%** | "Secret Recipe" found training without warmup can work, but 10% is safe |
| Batch size | 2 | **2** | bf16 uses more VRAM than QLoRA, so conservative batch size |
| Grad accum | 4 | **8** | Effective batch = 16 |
| Max seq length | 1536 | **2048** | Hard ceiling for single-GPU. Captures ~92% of examples untruncated |
| Epochs | 2 | **3** | "Data Repetition Beats Data Scaling" (Feb 2026): multi-epoch consistently beats single-epoch for small datasets. 3-5 recommended for ~3,500 examples. Start with 3, monitor token accuracy as stop signal |
| Validation split | none | **5% holdout** | Track overfitting — monitor eval_loss divergence from train_loss |
| Optimizer | paged_adamw_8bit | **adamw_torch** | bf16 full-precision training, no need for paged optimizer |

## VRAM Budget (bf16 LoRA, SFT)

```
Base model (27B, bf16):              ~54 GB
LoRA params (r=32, 7 modules):       ~0.1 GB
Optimizer states (adamw, bf16):      ~0.5 GB
Activations (batch=2, seq=2048):     ~4-6 GB
Gradient checkpointing:              ~2 GB
                                     --------
Estimated total:                     ~61-63 GB
```

**Fits on:** Pro 6000 (96GB) with ~33GB headroom. Does NOT fit on Pro 4500 (32GB).
**Training location:** Annuminas or Rohan Pro 6000.
**Merge:** Already in bf16, so merge is trivial — load adapter, merge, save. Same GPU.

## Eval Strategy (3 layers)

### Layer 0: Degeneration Gate (NEW — the critical fix)

Run immediately after training, before merge. 10 open-ended prompts with zero structural constraints ("Hi Annie", "Tell me something interesting", "I'm bored", etc.).

Automated PASS/FAIL criteria using established metrics:
- **Distinct-2** (unique bigrams / total bigrams) < 0.3 → FAIL
- **Rep-3** (repeated 3-gram rate) > 10% → FAIL
- **Sentence repetition:** any sentence 3+ times → FAIL
- **Vocabulary diversity** (unique/total words) < 0.2 → FAIL
- **Output length** > 2000 tokens for a short prompt → WARN

**Hard gate.** Any FAIL = do not proceed to merge.

Known risk from TeichAI distillations: model may "launch into lectures about unrelated topics when asked basic questions" because training data is heavily complex reasoning. Layer 0 tests specifically for this.

### Layer 1: A/B Head-to-Head (existing, updated)

30 prompts, same rubrics, same judge (Mistral Small). Compare `opus_annie:27b` vs `qwen3.5:27b` (base). Both with same `think` setting for fair comparison.

### Layer 2: Neko Health Regression (existing, updated)

193 profiles x 2 products. Updated baselines: member summary 87.0 (98% PASS), clinician pre-brief 75.2 (47% PASS). No significant regression allowed on member summary.

## Execution Sequence

### Step 0: Environment setup (~15 min)
1. Verify `transformers >= 5.0` installed (required for Qwen3.5)
2. Verify `peft`, `trl` are current versions
3. Download `Qwen/Qwen3.5-27B` to local HF cache if not already present (~54GB)

### Step 1: Config & script updates (~1 hour)
1. Update `config.yaml` — model ID, bf16 (no quantisation), LoRA targets, LR 1e-4, epochs 3, batch sizes, optimizer, export name
2. Update `04_sft_train.py` — remove QLoRA/4-bit code path for this run, switch to bf16 loading, add validation split, use `prepare_model_for_kbit_training` correctly (or skip since bf16), add post-training generation test
3. Update `05_merge_and_export.py` — docstrings only
4. Create `eval/degeneration_test.py` — Layer 0 gate with Distinct-2, Rep-3, sentence repetition, vocab diversity
5. Update `eval/ab_eval.py` — model names (122b → 27b)
6. Update `eval/neko_regression.py` — model name, baselines

### Step 2: VRAM test (~5 min)
```
python 04_sft_train.py --model Qwen/Qwen3.5-27B \
  --dataset data/sft/sft_dataset_with_thinking.jsonl \
  --output checkpoints/test_vram --no-quantize \
  --max-samples 10 --epochs 1
```
Confirm peak VRAM < 70GB on Pro 6000.

### Step 3: Full training (~3-4 hours)
```
python 04_sft_train.py --model Qwen/Qwen3.5-27B \
  --dataset data/sft/sft_dataset_with_thinking.jsonl \
  --output checkpoints/qwen35_27b_sft \
  --no-quantize --batch-size 2 --grad-accum 8 \
  --lr 1e-4 --epochs 3
```
Monitor: train_loss should decrease smoothly. Eval_loss should track (not diverge).

### Step 4: Layer 0 eval (~10 min)
Run degeneration test against LoRA adapter (no merge needed). PASS → continue. FAIL → iterate (reduce LR to 5e-5, reduce epochs to 2, try again).

### Step 5: Merge & GGUF (~45 min)
Merge on Pro 6000 (model already in bf16). Convert to f16 GGUF (master, ~54GB), then Q5_K_M (~19GB).

### Step 6: Ollama registration (~5 min)
```
ollama create opus_annie:27b -f Modelfile
```

### Step 7: Layer 1 eval (~45 min)
A/B head-to-head, 30 prompts.

### Step 8: Layer 2 eval (~5-6 hours, overnight)
Neko health regression, 193 profiles.

## Fallback Strategy

If initial training shows problems:

| Signal | Action |
|--------|--------|
| Loss diverges during warmup | Reduce LR to 5e-5 |
| Loss plateaus high | Increase LR to 2e-4 |
| Layer 0 FAIL (degeneration) | Reduce to 2 epochs + LR 5e-5 |
| Layer 0 FAIL again | Reduce to 1 epoch + r=16 |
| Eval_loss diverges after epoch 2 | Use epoch 2 checkpoint, skip epoch 3 |
| OOM on Pro 6000 | Reduce batch_size to 1, increase grad_accum to 16 |

Each retry is ~3-4 hours on local hardware. Multiple attempts per day are feasible at $0 cost.

## Success Criteria

| Gate | Threshold |
|------|-----------|
| Layer 0: No degeneration | All 10 prompts PASS all diversity metrics |
| Layer 1: No regression | Delta >= 0 or p > 0.05 (not significantly worse) |
| Layer 2: Member summary | Mean >= 85.0, PASS rate >= 95% |
| Layer 2: Clinician pre-brief | Mean >= 73.0, no increase in REJECT count |
| Training loss | Smooth decrease, eval_loss tracks |

## Files to Modify

- `/home/jack/Forging_The_Anvil/Research/distillation/config.yaml` — LoRA, SFT, model, export sections
- `/home/jack/Forging_The_Anvil/Research/distillation/04_sft_train.py` — bf16 loading, dense model adaptations, validation split, generation test
- `/home/jack/Forging_The_Anvil/Research/distillation/05_merge_and_export.py` — Docstrings
- `/home/jack/Forging_The_Anvil/Research/distillation/eval/ab_eval.py` — Model names
- `/home/jack/Forging_The_Anvil/Research/distillation/eval/neko_regression.py` — Model name, baselines

## File to Create

- `/home/jack/Forging_The_Anvil/Research/distillation/eval/degeneration_test.py` — Layer 0 gate

## Research Sources

- [Unsloth Qwen3.5 Fine-tuning Guide](https://unsloth.ai/docs/models/qwen3.5/fine-tune) — QLoRA warning, bf16 recommendation, 2048 seq ceiling
- [Unsloth LoRA Hyperparameters Guide](https://unsloth.ai/docs/get-started/fine-tuning-llms-guide/lora-hyperparameters-guide) — LR 2e-4 default, alpha=r
- ["How Much is Too Much?" (ACL Findings 2025)](https://arxiv.org/html/2512.15634v1) — LoRA rank analysis, r=32-64 sweet spot
- ["Learning Rate Matters" (Feb 2026)](https://arxiv.org/pdf/2602.04998) — Higher rank needs lower LR, vanilla LoRA sufficient with proper LR
- ["LoRA Without Regret" (Thinking Machines Lab)](https://thinkingmachines.ai/blog/lora/) — Optimal LoRA LR is 1e-4 to 5e-4
- ["Data Repetition Beats Data Scaling" (Feb 2026)](https://arxiv.org/abs/2602.11149) — Multi-epoch beats single-epoch for small datasets
- ["Secret Recipe for SFT" (Dec 2024)](https://arxiv.org/html/2412.13337v1) — LR scheduling, warmup, epoch analysis
- [Kaitchup Qwen3.5 Quantization](https://kaitchup.substack.com/p/qwen35-quantization-similar-accuracy) — Dense 27B robust to quantisation, Q5_K_M recommended
- [Jackrong/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled](https://huggingface.co/Jackrong/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled) — Prior art, nearly identical pipeline
- [Microsoft Phi-4 Distillation](https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/distillation-of-phi-4-on-deepseek-r1-sft-and-grpo/4381697) — 30k examples, LR=1e-5, 1 epoch
- [DeepSeek R1 Paper](https://arxiv.org/html/2501.12948v1) — Reasoning distillation with `<think>` traces
- [Preserving Diversity in SFT](https://arxiv.org/html/2408.16673v2) — "All-to-one probability transfer" risk

## Corpus Expansion (Iteration 2)

The existing corpus is 43% code+architecture with zero conversational examples — a known risk for "lecture mode" on open-ended prompts. Three data sources are available to rebalance:

### Source 1: Podcast Transcripts (~80 episodes, ready now)

Full list in `/home/jack/podcastlinks.md`. All on HappyScribe (full transcripts accessible). Covers:

| Category | Shows | Episodes | What it adds |
|----------|-------|----------|-------------|
| Casual/conversational | Theo Von, Soder | ~15 | Short, funny, natural register |
| Human interest/storytelling | Rogan (actors/authors) | ~12 | Varied response lengths, narrative |
| Health/science | Huberman, DOAC health eps | ~6 | Non-code technical reasoning |
| Business/philosophy | Hormozi, Weinstein, Brene Brown | ~8 | Product thinking in different voice |
| AI/tech | Lex Fridman, DeepMind | ~7 | Technical but conversational |
| Psychology | Gurwinder, Lagos, Gottman | ~5 | Analytical but accessible |

**Pipeline:**
1. Scrape ~80 transcripts from HappyScribe (script needed: `06_scrape_podcasts.py`)
2. Extract dialogue turns — host question → guest answer pairs
3. Filter: skip <50 char turns, deduplicate, sample ~300-500 diverse prompts
4. Teacher generation via Claude Sonnet (conversational = easy tier, ~$3-5)
5. Append to SFT dataset, rebuild

### Source 2: ChatGPT Conversation History (pending)

Export at `/home/jack/Downloads/OpenAI-export.zip` (248MB) does NOT contain conversations — it has DALL-E images and uploaded files only. This appears to be the privacy/GDPR export, not the data export.

**Action needed:** Go to ChatGPT → Settings → Data Controls → Export Data. That export includes `conversations.json` with full conversation history. Once available:
1. New ingestion path in `01_curate_prompts.py` for OpenAI's JSON format
2. Same multi-turn window extraction as Claude transcripts
3. Covers different topics/time period than Claude transcripts
4. Likely includes casual, brainstorming, personal conversations — exactly the gap

### Source 3: Photography Content (future)

YouTube transcripts via Whisper. Lower priority — needs audio download + transcription pipeline. Good for domain breadth but more processing work.

### Phasing

- **Iteration 1:** Train with existing 3,477 examples. Layer 0 tells us if lecture mode is a problem.
- **Iteration 2:** Add podcast transcripts (~300-500 prompts). Retrain. Free compute.
- **Iteration 3:** Add ChatGPT history (when export arrives) + optionally photography content.

Each iteration is ~3-4 hours training + ~$3-5 teacher generation. Total corpus expansion cost: **~$10-15 API**.

## Verification

1. VRAM test completes without OOM on Pro 6000 (peak < 70GB)
2. Training loss curve decreases smoothly, eval loss tracks (no overfitting divergence)
3. Layer 0 degeneration test: all 10 PASS
4. Layer 1 A/B: directionally positive or neutral
5. Layer 2 Neko regression: within 2 points of baseline
6. Manual spot-check: 5 open-ended conversations with the deployed model
