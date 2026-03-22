# Cold Anvil — Production Compute Research

*Compiled 2026-03-22*

## Context

Cold Anvil uses the Arnor Gateway as its compute backend. The Gateway
routes tasks to a fleet of GPUs running Ollama. Today this fleet is
local hardware (Arnor realm). In production, we need dedicated GPU
compute — either rented or purchased — with all data staying sovereign
(no inference APIs, no third-party data processing).

## Pipeline Workload

The forge pipeline has three phases, each with different compute
requirements:

| Phase | Models | VRAM needed | Concurrency |
|-------|--------|-------------|-------------|
| Generation | qwen3.5:35b, gpt-oss:20b | ~20-25 GB | High — parallel across fleet |
| Review | gemma3:27b-it-fp16, mistral-small3.2:24b | ~54 GB / ~16 GB | Dual independent reviewers |
| Rewrite | qwen3.5:122b (Q8) | ~70 GB | 1-2 concurrent (customer driven) |

Every version — first draft and every rewrite — gets two independent
reviews before pass/fail. The iteration cycle (review/rewrite/rescore)
repeats until the output passes or hits the cycle limit.

## Option A: 6x RTX Pro 6000 (96 GB each)

**Architecture:** 4 cards for generation + review, 2 cards dedicated to
rewrite. Each card operates independently (no NVLink). Same routing
logic as the Arnor fleet — cards swap between generation and review
models per phase.

**Advantages:**
- Lowest rental cost
- Familiar hardware (Annuminas runs a Pro 6000 today)
- Pipeline already tested against Blackwell inference characteristics
- Buy option breaks even quickly at ~$60k capex

**Limitations:**
- No VRAM pooling — each card is isolated at 96 GB
- 122B at Q8 fits but leaves little headroom on a single card
- 6 cards to manage vs 4

## Option B: 2x B200 (192 GB each, NVLink)

**Architecture:** 2 cards pool into 384 GB via NVLink. All phases run
through the same pool. The B200 is ~4-5x faster per GPU than the Pro
6000, so 2 cards deliver more aggregate throughput than 6 Pro 6000s.

**Throughput benchmarks (long context, per GPU):**

| GPU | tok/s | vs Pro 6000 |
|-----|-------|-------------|
| RTX Pro 6000 | ~1,600-2,300 | 1x |
| H100 | ~2,300-2,800 | ~1.4x |
| H200 | ~4,200-5,600 | ~2.5x |
| B200 | ~6,400-9,700 | ~4-5x |

2x B200 aggregate throughput: ~8-10x a single Pro 6000. Rewrites that
take 60s on a Pro 6000 take ~12-15s on a B200. At that speed, queuing
is measured in seconds — concurrency is rarely a bottleneck.

**Advantages:**
- Fastest option per card (~4-5x Pro 6000)
- 384 GB pooled VRAM — both rewrite models fit simultaneously
- Cheapest rental at low utilisation ($1,080/mo at 8hrs/day)
- 2 cards to manage — simplest possible infrastructure
- Throughput means concurrency pressure is minimal
- Scale by adding a third card, not redesigning

**Limitations:**
- Buy cost ~$100k+ (B200 SXM ~$45-50k per card)
- Less total VRAM than 6x Pro 6000 (384 GB vs 576 GB), but pooled
- All phases share the same 2 cards (no dedicated rewrite hardware)

## Option C: 4x B200 (192 GB each, NVLink)

**Architecture:** All 4 cards pool into 768 GB via NVLink. Every phase
uses the full cluster. Tensor parallelism available for the 122B rewrite
model across 2+ cards. This is the scaling target if 2x B200 becomes
a bottleneck.

**Advantages:**
- 768 GB pooled VRAM — no single-card constraints
- ~16-20x aggregate throughput vs a single Pro 6000
- Tensor parallelism for rewrite if needed
- Headroom for larger models in future

**Limitations:**
- ~1.5-2x the rental cost of Pro 6000
- Buy cost ~$200k+ (B200 SXM ~$45-50k per card)
- Only available in 8-GPU nodes on AWS/GCP (specialist providers sell per-card)

## Cost Comparison

| | 6x Pro 6000 (Vast.ai) | 6x Pro 6000 (Hyperstack) | 2x B200 (Packet.ai) | 2x B200 (RunPod) | 4x B200 (Packet.ai) | 4x B200 (RunPod) |
|--|----------------------|------------------------|--------------------|--------------------|--------------------|--------------------|
| Per GPU/hr | $1.00 | $1.80 | $2.25 | $4.99 | $2.25 | $4.99 |
| Fleet/hr | $6.00 | $10.80 | $4.50 | $9.98 | $9.00 | $19.96 |
| 8hrs/day | $1,440/mo | $2,592/mo | $1,080/mo | $2,394/mo | $2,160/mo | $4,790/mo |
| 12hrs/day | $2,160/mo | $3,888/mo | $1,620/mo | $3,592/mo | $3,240/mo | $7,186/mo |
| 24/7 | $4,320/mo | $7,776/mo | $3,240/mo | $7,186/mo | $6,480/mo | $14,371/mo |
| | | | | | | |
| Buy (capex) | ~$60,000 | ~$60,000 | ~$100,000 | ~$100,000 | ~$200,000+ | ~$200,000+ |
| Break-even vs 8hr | 42 months | 23 months | 93 months | 42 months | 93 months | 42 months |
| Break-even vs 24/7 | 14 months | 8 months | 31 months | 14 months | 31 months | 14 months |
| | | | | | | |
| Total VRAM | 576 GB (isolated) | 576 GB (isolated) | 384 GB (pooled) | 384 GB (pooled) | 768 GB (pooled) | 768 GB (pooled) |
| NVLink | No | No | Yes | Yes | Yes | Yes |
| Cards | 6 | 6 | 2 | 2 | 4 | 4 |
| Aggregate speed | ~6x baseline | ~6x baseline | ~8-10x baseline | ~8-10x baseline | ~16-20x baseline | ~16-20x baseline |
| 122B rewrite | Q8, 1 per card | Q8, 1 per card | Q8, pool or TP | Q8, pool or TP | Q8, pool or TP | Q8, pool or TP |

## Hyperscaler Comparison (per GPU/hr)

For reference, the major clouds are significantly more expensive for the
same hardware:

| Provider | Pro 6000 /hr | B200 /hr |
|----------|-------------|----------|
| Vast.ai | $1.00 | $2.67 |
| Hyperstack | $1.80 | — |
| RunPod | $1.89 | $4.99 |
| GCP | $2.85 | ~$18.53 |
| AWS | $3.36 | $14.24 |

GCP and AWS are 2-3x the cost of specialist providers for the same
cards. The premium buys managed infrastructure, IAM, networking — none
of which Cold Anvil needs given the Gateway already handles orchestration.

## Cascade Timing

Benchmark: a full cascade on a single Pro 6000 took ~45 minutes.
B200 is ~4-5x faster per GPU.

**Single cascade, no contention (2x B200):**

| Phase | Pro 6000 (est) | 2x B200 (est) |
|-------|---------------|---------------|
| Generation (35B, ~8 tasks) | ~15 min | ~3 min |
| Dual review | ~10 min | ~2 min |
| Rewrite (122B, failed tasks) | ~12 min | ~3 min |
| Re-review | ~8 min | ~2 min |
| **Total compute** | **~45 min** | **~10 min** |

This is compute time only — excludes the user's conversational Q&A
time which is separate and user-paced.

## Contention at 50 Users

**Important:** All users need GPU time, all the time. The agentic
conversation (Annie refining the idea with the user) runs inference on
the same GPU fleet. There is no "idle" phase — Q&A users are running
the 35B model while other users are in generation/review/rewrite.

50 concurrent users means 50 concurrent inference requests across
2 cards, competing for throughput:

- ~15 in agentic Q&A (35B, lighter but continuous)
- ~15 in generation (35B, parallel tasks)
- ~10 in review (27B, dual independent)
- ~10 in rewrite (122B, heaviest)

Realistic per-user compute time under 50-user load: **15-20 minutes**
(up from 10 uncontested). The 122B rewrite tasks create the most
contention — a rewrite hogging a card while 15 people are trying to
have a conversation.

## Unit Economics at 50 Users (2x B200, Packet.ai)

**At 29/month (lowest tier):**

| | 8hrs/day | 12hrs/day | 16hrs/day |
|--|---------|-----------|-----------|
| GPU cost | 1,080/mo | 1,620/mo | 2,160/mo |
| Platform hosting | 200/mo | 200/mo | 200/mo |
| Payment processing (3%) | 43/mo | 43/mo | 43/mo |
| Domain, support, misc | 100/mo | 100/mo | 100/mo |
| **Total cost** | **1,423/mo** | **1,963/mo** | **2,503/mo** |
| Revenue (50 x 29) | 1,450/mo | 1,450/mo | 1,450/mo |
| **Profit** | **27/mo** | **-513/mo** | **-1,053/mo** |

The 29/month tier barely breaks even at 8hrs/day and loses money at
any higher utilisation. It's a loss leader at best.

**At 49/month (solo founder tier):**

| | 8hrs/day | 12hrs/day | 16hrs/day |
|--|---------|-----------|-----------|
| GPU cost | 1,080/mo | 1,620/mo | 2,160/mo |
| Platform hosting | 200/mo | 200/mo | 200/mo |
| Payment processing (3%) | 74/mo | 74/mo | 74/mo |
| Domain, support, misc | 100/mo | 100/mo | 100/mo |
| **Total cost** | **1,454/mo** | **1,994/mo** | **2,534/mo** |
| Revenue (50 x 49) | 2,450/mo | 2,450/mo | 2,450/mo |
| **Profit** | **996/mo** | **456/mo** | **-84/mo** |

At 49/month the business works at 8-12hrs/day but goes underwater at
16hrs. If users are spread across timezones, GPU hours stretch and
margins compress.

**Implications:**

- The 29/month tier cannot sustain the business at 50 users. It only
  works as a conversion funnel to the 49/month tier.
- At 49/month, regional focus matters. Pick one timezone at launch,
  keep GPU hours tight (8-12hrs/day), scale from there.
- Alternatively, a higher price point (69 or 79/month) gives real
  margin even at 16hrs/day.

## Recommendation

**Start with 2x B200 rented.** Cheapest monthly cost at low utilisation
($1,080/mo at 8hrs/day), faster than 6x Pro 6000 in aggregate
throughput, simplest infrastructure (2 cards, pooled VRAM, no routing
complexity). The speed advantage means concurrency is rarely a concern
— rewrites finish in ~12-15s, so queuing is measured in seconds.

**Scale to 4x B200 when demand requires it.** Adding 2 more cards
doubles throughput and VRAM without changing architecture. This is the
move when sustained concurrent customer demand outpaces what 2 cards
can deliver.

**Pro 6000 fleet is the fallback option.** If B200 availability is
limited or pricing spikes, 6x Pro 6000 is a viable alternative with
lower per-card cost. The trade-off is more cards, no pooling, and
slower per-card throughput — but the Gateway's routing already handles
multi-host distribution, so it works.

**Buy when utilisation justifies it.** At realistic early usage
(8hrs/day), buy break-even is 42+ months for B200. Rent until customer
demand makes the timeline attractive.

## Data Sovereignty

All options assume self-hosted inference. No inference APIs, no
third-party data processing. The Arnor fleet remains the dev/staging
environment. Production is a separate fleet speaking the same Gateway
API.

## Sources

- [ThunderCompute RTX Pro 6000 Pricing (March 2026)](https://www.thundercompute.com/blog/nvidia-rtx-pro-6000-blackwell-pricing)
- [GetDeploying GPU Comparison](https://getdeploying.com/gpus/nvidia-rtx-pro-6000)
- [GetDeploying B200 Pricing](https://getdeploying.com/gpus/nvidia-b200)
- [ComputePrices B200](https://computeprices.com/gpus/b200)
- [GCP GPU Pricing](https://cloud.google.com/compute/gpus-pricing)
- [NVIDIA RTX Pro 6000 Server Edition](https://www.nvidia.com/en-us/data-center/rtx-pro-6000-blackwell-server-edition/)
- [CloudRift: B200 Benchmarks](https://www.cloudrift.ai/blog/benchmarking-b200)
- [CloudRift: RTX Pro 6000 vs Datacenter GPUs](https://www.cloudrift.ai/blog/benchmarking-rtx6000-vs-datacenter-gpus)
