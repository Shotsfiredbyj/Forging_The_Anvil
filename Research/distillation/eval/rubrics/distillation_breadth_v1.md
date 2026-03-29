---
task_type: distillation_eval_breadth
name: distillation_breadth
version: 1
frozen: false
dimensions: 4
max_score: 100
---

# Distillation Breadth Evaluation Rubric v1

Evaluate non-creative model outputs (code, architecture, product, reasoning) on general quality dimensions. Score based on observable evidence.

## Scoring Instructions

You are comparing two outputs (Output X and Output Y) generated from the same prompt. Score each output independently on all 4 dimensions (1-10). Then state which output is better overall and why.

Use the full range. A score of 5 means adequate. Reserve 9-10 for exceptional work.

## Dimensions

| Dimension | Weight |
|-----------|--------|
| **Correctness & Accuracy** | /30 |
| **Instruction Compliance** | /25 |
| **Reasoning Quality** | /25 |
| **Clarity & Structure** | /20 |

## Scoring Anchors

### Correctness & Accuracy (/30)
Is the output factually correct? For code: does it work? For analysis: are the claims accurate? For architecture: is the design sound?

- 1-3: Fundamental errors. Code won't run. Analysis is wrong. Architecture has obvious flaws.
- 4-5: Mostly correct but with significant gaps. Code has bugs in edge cases. Analysis makes unsupported claims.
- 6-7: Correct for the main case. Minor issues or omissions. Code handles happy path well.
- 8: Correct and thorough. Edge cases handled. Claims are well-supported. Design is sound.
- 9-10: Correct, thorough, and demonstrates deep understanding. Anticipates issues the prompt didn't mention.

### Instruction Compliance (/25)
Does the output follow every requirement in the prompt?

- 1-3: Misses multiple requirements. Wrong format, wrong scope, ignores constraints.
- 4-5: Gets the main ask right but misses specific requirements.
- 6-7: Meets most requirements. May miss one minor constraint.
- 8: Every stated requirement met.
- 9-10: Every requirement met and the requirements feel naturally incorporated.

### Reasoning Quality (/25)
Does the output show genuine thinking, not just pattern-matching?

- 1-3: Shallow. States conclusions without reasoning. No consideration of trade-offs or alternatives.
- 4-5: Some reasoning visible but doesn't go deep. Makes correct observations without exploring implications.
- 6-7: Clear reasoning chain. Considers trade-offs. Shows understanding of why, not just what.
- 8: Multi-step reasoning. Anticipates objections. Makes non-obvious connections.
- 9-10: Reasoning reveals insights the reader didn't anticipate. Demonstrates genuine expertise.

### Clarity & Structure (/20)
Is the output well-organised, concise, and easy to follow?

- 1-3: Disorganised, repetitive, or unclear. Hard to extract the key points.
- 4-5: Adequate but could be tightened. Some padding or unclear passages.
- 6-7: Well-structured. Clear progression. Minor inefficiencies.
- 8: Tight and well-organised. Every paragraph earns its place.
- 9-10: Exemplary clarity. Complex ideas made accessible without oversimplification.

## Output Format

For EACH output (X and Y), provide:

```
### Output X

| Dimension | Score (1-10) | Weight | Weighted | Evidence |
|-----------|-------------|--------|----------|----------|
| Correctness & Accuracy | X | /30 | XX.X | [observation] |
| Instruction Compliance | X | /25 | XX.X | [specific constraints met/missed] |
| Reasoning Quality | X | /25 | XX.X | [observation] |
| Clarity & Structure | X | /20 | XX.X | [observation] |

**Weighted Total:** XX.X/100

### Output Y

[same table format]

### Comparison

**Preferred:** [X or Y]
**Margin:** [Clear / Slight / Negligible]
**Key difference:** [1-2 sentences on what separates them]
```
