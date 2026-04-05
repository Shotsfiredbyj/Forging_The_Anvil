# Fleet Strategy: Rohan Integration

> **SUPERSEDED (2026-04-05):** Rohan now runs vLLM behind llama-swap
> (not Ollama). Two llama-swap instances: port 8080 (Pro 6000, GPU 0)
> and port 8081 (Pro 4500, GPU 1). See `Cold_Anvil/docs/DECISIONS.md`
> (2026-04-04 entry) for migration details. The dual-GPU architecture
> below is still correct, but all Ollama references are historical.

## Context

Rohan is a new dual-GPU inference server arriving next week. The Pro 6000
MaxQ (96GB) moves from Annuminas to Rohan, paired with a new Pro 4500
(32GB). A second Pro 4500 goes into Annuminas as its replacement. This
reshuffles the entire fleet's model placement and routing.

Rohan runs Fedora Server 43. No UPS — not power-redundant. Always-on
dedicated inference.

---

## Fleet After Rohan

| Host | GPU(s) | VRAM | OS | Role | UPS | Always-on |
|------|--------|------|----|------|-----|-----------|
| **Rohan** | Pro 6000 MaxQ + Pro 4500 | 96 + 32 = 128GB | Fedora Server 43 | Primary inference | No | Yes |
| **Annuminas** | Pro 4500 | 32GB | Nobara 43 | Workstation + mid-tier inference | No | Usually |
| **Barrowblade** | AMD 8060S iGPU | 96GB shared | Nobara 43 | Workstation + heavy fallback | No | Yes |
| **Anduril** | Pro 4500 | 32GB | Fedora Server 43 | Generation + review peer | No | Yes |
| **Eregion** | Arc B60 + B50 | 24 + 16GB | Fedora Server 43 | Memory + specialist agents | No | Yes |
| **Elostirion** | None | None | Debian 13 | Gateway orchestration | No | Yes |

**What changed:**
- Rohan is new (128GB total, dual-GPU)
- Annuminas drops from 96GB to 32GB (loses all 120B models)
- Anduril unchanged (Pro 4500 32GB, confirmed)
- Everything else unchanged

---

## Rohan GPU Configuration

### Default Mode: Two Ollama Instances

Same proven pattern as Eregion. Two separate Ollama processes, each
bound to one GPU via CUDA_VISIBLE_DEVICES.

| Instance | GPU | Port | VRAM | Role |
|----------|-----|------|------|------|
| rohan (primary) | Pro 6000 MaxQ | 11434 | 96GB | 120B models, generation, rewrite |
| rohan-b (secondary) | Pro 4500 | 11435 | 32GB | 27-35B models, review, counter-review |

Two systemd units: `ollama-primary.service` and `ollama-secondary.service`
with separate CUDA_VISIBLE_DEVICES, ports, and model directories.

**Advantages:** Independent model loading, no interference, proven pattern,
can run generation on one GPU while review runs on the other simultaneously.

### Fine-Tuning Mode: Single Ollama Instance (Manual Switch)

When fine-tuning, stop both Ollama services and run Unsloth/training
directly. No Ollama involvement — training frameworks manage GPU memory
themselves. Document the switch procedure:

1. Stop both Ollama services
2. Remove Rohan from Gateway fleet (or mark as down)
3. Run training job (Unsloth + QLoRA on the 96GB card, or across both)
4. When done, restart Ollama services
5. Gateway health checks will pick Rohan back up automatically

No need for a "single Ollama" mode — inference uses dual-instance,
training bypasses Ollama entirely.

---

## Model Placement

### Rohan (128GB across two GPUs)

**Pro 6000 MaxQ (96GB) — the heavy hitter:**
- qwen3.5:122b (creative generation, rewrite)
- gpt-oss:120b (code generation)
- devstral-2:123b (code generation alternative)
- qwen3-coder-next (code generation)
- Any future 70B+ models

**Pro 4500 (32GB) — review and mid-tier generation:**
- qwen3.5:35b (generation)
- gemma3:27b (review)
- mistral-small3.2:24b (review)
- nemotron-cascade-2:30b (generation)
- gpt-oss:20b (generation, specialist)

### Annuminas (32GB — down from 96GB)

Annuminas becomes a lighter-duty node. Same model roster as Anduril:
- qwen3.5:35b (creative/code generation)
- gemma3:27b (review)
- mistral-small3.2:24b (review)
- gpt-oss:20b (code generation)

Can no longer run any 120B+ models. This is fine — Rohan handles those.
Annuminas remains Jack's primary workstation with DaVinci Resolve on the
same GPU, so inference contention is expected during editing sessions.

### Anduril (32GB — unchanged)

Same as now:
- qwen3.5:35b (generation)
- gemma3:27b (review)
- mistral-small3.2:24b (review)
- gpt-oss:20b (generation)

### Barrowblade (96GB shared — unchanged, key fallback)

Same as now:
- gpt-oss:120b (code)
- qwen3-next:80b (creative)
- gemma3:27b (review)

**Critical fallback role:** Only non-Rohan host that can run 120B models.
When Rohan is down, Barrowblade is the heavy inference path. Shared VRAM
means model swaps and contention with desktop, but it works.

### Eregion (unchanged)

B50: embeddings + extraction (memory service)
B60: specialist agent inference (diagnosis, prompt-tuning, verification)

---

## Routing Strategy

Rohan becomes primary for all heavy workloads. The fleet degrades
gracefully when Rohan is unavailable.

### Generation Routes

| Task Type | Primary | Fallback 1 | Fallback 2 | Fallback 3 |
|-----------|---------|------------|------------|------------|
| creative | rohan/qwen3.5:122b (96GB) | rohan-b/qwen3.5:35b (32GB) | annuminas/qwen3.5:35b | anduril/qwen3.5:35b |
| code | rohan/gpt-oss:120b (96GB) | rohan-b/gpt-oss:20b (32GB) | annuminas/gpt-oss:20b | anduril/gpt-oss:20b |
| design | rohan/qwen3.5:122b (96GB) | rohan-b/qwen3.5:35b (32GB) | annuminas/qwen3.5:35b | anduril/qwen3.5:35b |

### Review Routes

| Task Type | Primary | Fallback 1 | Fallback 2 |
|-----------|---------|------------|------------|
| review_a / review_code_a | rohan-b/mistral-small3.2:24b | annuminas/mistral-small3.2:24b | anduril/mistral-small3.2:24b |
| review_b / review_code_b | anduril/gemma3:27b | rohan-b/gemma3:27b | annuminas/gemma3:27b |
| counter reviews | anduril/gemma3:27b | rohan-b/gemma3:27b | annuminas/gemma3:27b |

**Key pattern:** Review runs on the 32GB cards (rohan-b, anduril, annuminas)
while generation runs on rohan's 96GB card. This means generation and
review can run simultaneously on Rohan — one GPU each, no contention.

### Rewrite Routes

| Task Type | Primary | Fallback |
|-----------|---------|----------|
| rewrite | rohan/qwen3.5:122b (96GB) | barrowblade/gpt-oss:120b |

Rewrite needs the big models — only Rohan (96GB) and Barrowblade (96GB
shared) can handle this. Annuminas and Anduril can't run 120B+.

### Barrowblade's Role

Barrowblade shifts from active generation to **fallback and overflow:**
- Primary for nothing in the forge pipeline
- Fallback for 120B models when Rohan is down
- Still handles OpenCode/chat inference independently
- Still runs the desktop compositor (shared VRAM constraint)

This is a natural evolution — Barrowblade was always awkward as a forge
host due to shared VRAM and model swap locks. With Rohan handling the
heavy lifting, Barrowblade becomes the safety net.

---

## Degradation When Rohan Is Down

**Scenario: Rohan offline (power outage, maintenance, fine-tuning)**

The Gateway health check detects Rohan as unreachable within 5 seconds.
Routing falls through to next available host automatically.

| Workload | Without Rohan | Impact |
|----------|--------------|--------|
| 120B generation | Barrowblade (shared VRAM, slower) | Slower, model swap contention |
| 35B generation | Annuminas or Anduril | No impact |
| Review | Anduril, Annuminas | No impact |
| 120B rewrite | Barrowblade (shared VRAM) | Slower |
| Specialist agents | Eregion (unchanged) | No impact |

**The fleet is functional without Rohan.** It degrades to the current
state (before Rohan existed) minus Annuminas having 96GB. The 120B
path through Barrowblade is slower but works. Everything else is
unaffected — the 32GB fleet (Annuminas + Anduril) handles generation
and review at the sub-40B tier.

---

## Parallel Inference: The Big Win

With Rohan running two independent Ollama instances, the forge pipeline
can genuinely parallelise stages for the first time on a single host:

**During a cascade:**
1. Stage N generates on rohan (Pro 6000, 120B model)
2. Simultaneously, review of stage N-1 runs on rohan-b (Pro 4500, 27B model)
3. Anduril handles counter-reviews in parallel

This eliminates the serial bottleneck where generation and review compete
for the same GPU. Current pipeline: generate -> wait -> review -> wait.
With Rohan: generate on one GPU while reviewing on the other.

The `gen_lock` system in fleet.py already handles this — each host entry
gets its own lock. rohan and rohan-b are separate hosts from the
Gateway's perspective, so they lock independently.

---

## Training Capability

When Rohan is in training mode (Ollama stopped, training frameworks
manage GPU memory directly):

### Fine-Tuning (SFT)

"Here are good examples, learn to produce more like this."

| GPU | Full SFT (all params) | QLoRA + Unsloth |
|-----|----------------------|-----------------|
| Pro 6000 MaxQ (96GB) | Up to ~4-5B | Up to 120B (confirmed) |
| Pro 4500 (32GB) | Up to ~1.5B | Up to 32B |

### Post-Training (Alignment)

"Here are two outputs, this one is better — learn why."

Post-training is a separate stage from fine-tuning. It's how models
learn what "good" looks like according to specific quality criteria.
DPO/GRPO/RLHF take preference pairs (chosen vs rejected) or reward
signals and align the model's behaviour to match.

**On the Pro 6000 MaxQ (96GB) with QLoRA + Unsloth:**

| Method | What it does | Max model size |
|--------|-------------|---------------|
| QLoRA DPO | Preference pairs (chosen vs rejected) | ~70B |
| QLoRA GRPO | Group reward optimisation (DeepSeek's method) | ~70B |
| QLoRA ORPO | Odds ratio preference (no reference model needed) | ~100B+ |
| QLoRA KTO | Binary feedback (good/bad, no pairs needed) | ~100B+ |

DPO and GRPO hold a reference model alongside the policy model (~1.5-2x
SFT memory). ORPO and KTO skip the reference model — nearly as cheap
as SFT.

**On the Pro 4500 (32GB) with QLoRA + Unsloth:**

| Method | Max model size |
|--------|---------------|
| QLoRA DPO/GRPO | ~14-20B |
| QLoRA ORPO/KTO | ~28-32B |

### The Cold Anvil Training Play

The forge pipeline already produces natural training data for both
fine-tuning and alignment:

**SFT data:** 160+ runs of graded outputs. High-scoring outputs (85+)
are direct SFT examples — "generate more like this."

**Preference/alignment data:** Every task that went through rewrite has
a before (scored 62) and after (scored 88) pair. The reviewer feedback
explains *why* one is better. This is exactly what DPO is designed for.

**The pipeline:**
1. Collect preference pairs from forge runs (high vs low scoring outputs)
2. QLoRA DPO on a 70B base model using the Pro 6000 (96GB)
3. Result: a model aligned to Cold Anvil's specific quality rubrics
4. Deploy fine-tuned model on a 32GB card (adapters are tiny)
5. Train on the big card, serve on the small ones

Post-training is arguably more valuable than SFT here. We don't just
want a model that generates more output like the training data — we want
one that understands which outputs are better and why, according to our
rubrics. That's alignment, not fine-tuning.

---

## Implementation Steps

### When hardware arrives (next week)

1. **Build Rohan** — physical assembly
2. **Install Fedora Server 43** — same as Anduril and Eregion
3. **Join Tailscale** — `tailscale up` with the fleet tag
4. **Configure dual Ollama** — two systemd units:
   - `ollama-primary.service` (CUDA_VISIBLE_DEVICES=0, port 11434)
   - `ollama-secondary.service` (CUDA_VISIBLE_DEVICES=1, port 11435)
5. **Pull models** — 120B models on primary, 27-35B on secondary
6. **Move Pro 6000 MaxQ** from Annuminas to Rohan
7. **Install spare Pro 4500** in Annuminas
8. **Update Annuminas Ollama** — pull sub-40B models, remove 120B

### Gateway changes (deploy when ready)

9. **Update fleet.py:**
   - Add rohan host entry (port 11434, Pro 6000 MaxQ, 96GB)
   - Add rohan-b host entry (port 11435, Pro 4500, 32GB)
   - Update annuminas host entry (Pro 4500, 32GB, reduced model list)
   - Fix anduril host entry (already Pro 4500, just confirm)
   - Update ROUTES with new routing priorities
10. **Update fleet-manifest.md** — full fleet refresh
11. **Update THE-KEEPING-OF-ARNOR.md** — add Rohan section, update Annuminas

### Verification

12. **Health check all hosts** — `forge_health` MCP tool
13. **Run a test cascade** on rohan — verify generation on primary GPU
14. **Verify parallel inference** — generation on rohan + review on rohan-b
15. **Kill Rohan, verify fallback** — routes should fall through to
    Barrowblade/Annuminas/Anduril
16. **Run a full cascade** — end-to-end with new routing

---

## Documentation Changes

| File | Changes |
|------|---------|
| `Arnor_Gateway/arnor_gateway/fleet.py` | Add rohan + rohan-b, update annuminas, fix anduril, update ROUTES |
| `Arnor_Core/THE-KEEPING-OF-ARNOR.md` | Add Rohan section, update Annuminas GPU, update fleet summary |
| `Arnor_Core/identity/fleet-manifest.md` | Full refresh — all hosts current, routing table updated |
| `Arnor_Core/future-states/inference-node-rohan.md` | Update or replace with actual build specs |

---

## Build Notes

- **CPU thermal:** 9700X is 65W TDP. The NH-D15 G2 is massively overspecced
  for it — deliberate. CPU runs cool and silent, airflow budget goes to the
  two GPUs (500W combined). Efficient, not hot.
- **NVMe placement:** Samsung 9100 Pro MUST go in M.2_1 (CPU direct,
  PCIe 5.0). Do NOT use M.2_2 — it shares lanes with the second GPU
  slot and would drop it from x8 to x4.
- **PCIe split:** x8/x8 PCIe 5.0 for dual-GPU. 31.5 GB/s per direction
  per slot — more than x16 Gen4. No bottleneck for inference.

## Open Questions

- **Barrowblade OS:** Jack is considering moving to Fedora Server. If this
  happens, the shared_vram constraint and desktop compositor contention go
  away, making Barrowblade a better fallback. Separate decision.
- **Fine-tuning schedule:** When to take Rohan offline for training runs.
  Probably overnight or weekends when cascades aren't running.
