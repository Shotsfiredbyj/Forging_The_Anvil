# Phase 3 v2 Leaderboard

Generated: 2026-04-12

## Context

18 cascades × 3 gen+rewriter combos × 3 reviewers × 2 runs each. First benchmark run after the pipeline fixes (JSON dump prevention, CSS class inventory, pre-review gate, rubric first-check).

## All 18 runs

| Combo | Grade | Pass | Cross-family? | Notes |
|---|---|---|---|---|
| gemma4-26b + gemma4-31b + devstral r0 | A | 9/9 | ✓ | |
| gemma4-26b + gemma4-31b + devstral r1 | A | 9/9 | ✓ | |
| gemma4-26b + gemma4-31b + gemma4 r0 | B | 8/9 | ⚠ same-family | down from A/A in v1 — our fixes helped |
| gemma4-26b + gemma4-31b + gemma4 r1 | B | 8/9 | ⚠ same-family | |
| gemma4-26b + gemma4-31b + mistral r0 | B | 8/9 | ✓ | |
| gemma4-26b + gemma4-31b + mistral r1 | B | 6/9 | ✓ | |
| gemma4-26b + qwen3.5-35b + devstral r0 | B | 8/9 | ✓ | |
| gemma4-26b + qwen3.5-35b + devstral r1 | A | 9/9 | ✓ | |
| gemma4-26b + qwen3.5-35b + gemma4 r0 | C | 2/9 | ✓ | ❌ gemma4 reviewer broken on non-gemma |
| gemma4-26b + qwen3.5-35b + gemma4 r1 | D | 1/9 | ✓ | ❌ gemma4 reviewer broken on non-gemma |
| gemma4-26b + qwen3.5-35b + mistral r0 | B | 9/9 | ✓ | |
| gemma4-26b + qwen3.5-35b + mistral r1 | A | 9/9 | ✓ | |
| qwen3.5-9b + qwen3.5-27b + devstral r0 | A | 8/9 | ✓ | |
| qwen3.5-9b + qwen3.5-27b + devstral r1 | B | 9/9 | ✓ | |
| qwen3.5-9b + qwen3.5-27b + gemma4 r0 | C | 1/9 | ✓ | ❌ gemma4 reviewer broken on non-gemma |
| qwen3.5-9b + qwen3.5-27b + gemma4 r1 | D | 0/9 | ✓ | ❌ gemma4 reviewer broken on non-gemma |
| qwen3.5-9b + qwen3.5-27b + mistral r0 | A | 9/9 | ✓ | |
| qwen3.5-9b + qwen3.5-27b + mistral r1 | A | 9/9 | ✓ | |

## Reviewer calibration (key finding)

| Reviewer | Correlation with quality | Avg GPA | Verdict |
|---|---|---|---|
| devstral | **+0.690** | 3.67 | Well calibrated |
| mistral | +0.488 | 3.50 | Reasonably calibrated |
| gemma4 | **−0.252** | 2.00 | Broken (inverse correlation) |

Our fixes calibrated mistral and devstral. Gemma4 reviewer is still unreliable — negatively correlated with quality — and should be excluded from all future benchmark analysis.

Gemma4 reviewer's self-family bias DID reduce: gemma4-26b+gemma4-31b+gemma4 went from A/A in v1 to B/B in v2. The rubric first-check and pre-review gate worked partially on the hardest reviewer.

## Winner selection — cross-family only, gemma4 reviewer excluded

Filter: `reviewer_family ∉ {gen_family, rewriter_family}` AND `reviewer ≠ gemma4`. 12/18 runs eligible.

| Rank | Gen + Rewriter | Avg GPA | Avg Pass | Grades |
|---|---|---|---|---|
| **1** | **qwen3.5-9b + qwen3.5-27b** | **3.75** | **8.8/9** | A/B/A/A |
| 2 | gemma4-26b + qwen3.5-35b | 3.50 | 8.8/9 | B/A/B/A |
| 3 | gemma4-26b + gemma4-31b | 3.50 | 8.0/9 | A/A/B/B |

**Winner: qwen3.5-9b + qwen3.5-27b**

Notable: the qwen+qwen combo wasn't even in v1's top tier (it scored mostly B's in v1). It jumped to #1 in v2 specifically because:
1. Previously, we weren't filtering by cross-family — so gemma4-family won on gemma4-inflated grades
2. Under cross-family filtering with a calibrated reviewer, qwen's actual output quality is competitive
3. And the smaller model pair is faster + cheaper

## Phase 4 setup

- **Winner**: qwen3.5-9b + qwen3.5-27b
- **Reviewer for Phase 4**: **mistral** (cross-family vs qwen, lower variance than devstral)
- **Tiers**: strong, mid, weak (one run each, standard Phase 4 config)
- **Expected runtime**: ~2.5 hours for 3 cascades
