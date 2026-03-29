# Distillation Evaluation Report

**Date:** 2026-03-29
**Models:** qwen3.5:122b (base) vs opus_annie:122b (distilled)

---

## Layer 1: Creative A/B Head-to-Head

**Prompts evaluated:** 30

### Overall

| Metric | Base (qwen3.5:122b) | Distilled (opus_annie:122b) | Delta |
|--------|---------|-----------|-------|
| Average score | 75.8 | 77.2 | +1.3 |
| Judge preference | 0 | 0 | — |

### Statistical Test

- Paired t-test: t=1.012, p=0.3198
- Cohen's d: 0.185
- Significant (p<0.05): No

### By Prompt Type

| Type | n | Base | Distilled | Delta | Wins B/A |
|------|---|------|-----------|-------|----------|
| analytical_essay | 3 | 72.3 | 71.8 | -0.5 | 0/0 |
| architecture | 2 | 86.2 | 81.2 | -5.0 | 0/0 |
| character_voice | 3 | 67.3 | 68.7 | +1.3 | 0/0 |
| code | 3 | 82.2 | 86.2 | +4.0 | 0/0 |
| constrained_poetry | 2 | 74.5 | 76.5 | +2.0 | 0/0 |
| marketing_copy | 3 | 76.2 | 78.2 | +2.0 | 0/0 |
| product | 2 | 77.8 | 87.8 | +10.0 | 0/0 |
| reasoning | 3 | 83.5 | 85.0 | +1.5 | 0/0 |
| rewrite_task | 3 | 68.7 | 70.2 | +1.5 | 0/0 |
| screenplay_scene | 3 | 70.8 | 72.8 | +2.0 | 0/0 |
| vo_cold_open | 3 | 78.5 | 75.2 | -3.3 | 0/0 |

### By Dimension

| Dimension | Base | Distilled | Delta |
|-----------|------|-----------|-------|
| Clarity & Structure | 7.90 | 8.20 | +0.30 |
| Correctness & Accuracy | 8.40 | 8.50 | +0.10 |
| Creativity & Originality | 7.10 | 7.05 | -0.05 |
| Instruction Compliance | 8.67 | 8.83 | +0.17 |
| Reasoning Depth | 7.10 | 7.15 | +0.05 |
| Reasoning Quality | 8.00 | 8.30 | +0.30 |
| Structural Precision | 7.70 | 7.75 | +0.05 |
| Voice & Nuance | 7.35 | 7.55 | +0.20 |

---

## Layer 2: Neko Health Regression

See `neko_regression.py --compare-only` for latest results.

---

## Interpretation Guide

- **Delta > 0:** Distilled model scores higher (distillation helped)
- **Delta < 0:** Base model scores higher (distillation hurt or no effect)
- **Cohen's d:** <0.2 negligible, 0.2-0.5 small, 0.5-0.8 medium, >0.8 large
- **p < 0.05:** Statistically significant difference
- **Judge preference:** How often Mistral Small preferred one model's output