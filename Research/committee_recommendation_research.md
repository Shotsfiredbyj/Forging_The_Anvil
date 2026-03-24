# Research: Committee Recommendation and Ensemble Methods

**Date:** 3 March 2026
**Context:** Research conducted for the Quorum project to inform the committee recommendation algorithm, confidence calibration, threshold design, and inter-rater reliability measurement.

---

## 1. Score Aggregation Methods

### Simple Mean

**What it does:** Add up all judges' scores and divide by the number of judges.

**Pros:**
- Simple to compute and explain.
- Uses all available information (every judge's score contributes).
- Standard in many evaluation systems.

**Cons:**
- Sensitive to outliers. If one judge gives 2/10 and three give 8/10, the mean is 6.5 — which doesn't represent any judge's view.
- One harsh or generous judge can pull the whole score.

**Best for:** High-agreement tasks where judges broadly agree (e.g., coding evaluations with Spearman > 0.8 in our benchmarks).

### Median

**What it does:** Take the middle value when all judges' scores are sorted.

**Pros:**
- Robust to outliers. One extreme score doesn't dominate.
- With 3 judges: the median is the "middle opinion." With 5: it's still the center.
- Appropriate for ordinal data (which rubric scores fundamentally are).

**Cons:**
- Ignores magnitude of agreement. If two judges give 8 and one gives 2, the median is 8 — it doesn't reflect that there's a strong dissenter.
- Discards information from the tails.

**Best for:** Small panels (3-5 judges), subjective tasks where outliers are common.

### Trimmed Mean

**What it does:** Remove the highest and lowest scores, then take the mean of what's left.

**Pros:**
- Compromise between mean and median. Reduces outlier impact without fully ignoring extreme scores.
- Well-understood statistically.

**Cons:**
- Needs a choice of how much to trim (5%? 10%? 20%?).
- With only 3 judges, trimming the top and bottom leaves you with one score (which is just the median).
- Less common in LLM evaluation literature.

**Best for:** When outliers are moderate (not extreme) and you want some robustness but more information than median alone. More useful with larger panels (5+).

### Weighted Mean (by Judge Reliability)

**What it does:** Weight each judge's score by some measure of their reliability (e.g., their correlation with other judges, their calibration score, or historical accuracy).

**Pros:**
- Uses judge quality information. If one judge is consistently more aligned with expert judgment, their score counts more.
- Can downweight known problematic judges.

**Cons:**
- Needs reliability estimates, which require either historical data or assumptions.
- Reliability can vary by task type — a judge that's great on coding may be unreliable on creative writing.
- More complex to explain to users.

**Best for:** When you have data on judge quality that varies significantly across the panel.

### Bayesian Aggregation

**What it does:** Models the "true quality" of the submission as a latent variable, and models each judge as having biases and noise around that true quality. Uses Bayes' theorem to infer the most likely true quality given all the observed scores.

**Pros:**
- Principled uncertainty quantification (you get a distribution, not just a point estimate).
- Can model judge-specific biases (e.g., "Judge A is consistently 2 points harsher").
- Can handle varying numbers of judges across submissions.
- Theoretically optimal when the model assumptions hold.

**Cons:**
- Complex to implement and explain.
- Needs either prior data or assumptions about judge behavior.
- Overkill for small, straightforward evaluations.
- Computational overhead.

**Best for:** Grant review, academic paper review, high-stakes decisions where you have substantial historical data. Worth exploring for Quorum v2 but too complex for v0.1.

### Majority Vote

**What it does:** Each judge picks a category (e.g., "ready" or "needs revision"). The category with the most votes wins.

**Pros:**
- Extremely simple. Easy to explain.
- Works well for binary or categorical decisions.

**Cons:**
- Loses all ordinal information. A 9/10 and a 6/10 both count as "ready" if the threshold is 5.
- Ties need explicit rules.
- Doesn't capture degree of agreement.

**Best for:** Nominal/categorical judgments (e.g., "is this relevant?"). Not ideal for Quorum's dimension-level scoring but could be useful for the final ready/revise verdict.

---

## 2. What the Research Says

### JudgeBlender (Rahmani et al., 2024)

Studied multiple aggregation methods for LLM judge panels on information retrieval tasks.

**Findings:**
- **Average voting (AV)** and **majority voting with average tie-break (MV(Avg))** both performed well.
- LLMBlender + MV(Avg) was often best on NDCG@10.
- Complex methods didn't dramatically outperform simple ones on well-structured tasks.

**For Quorum:** Simple aggregation (median or mean) is a competitive baseline. Don't over-engineer.

**Source:** arXiv:2412.13268

### PoLL — Panel of LLM Evaluators (Verga et al., 2024)

Used a diverse panel of three LLMs (Command R, Haiku, GPT-3.5) with average pooling.

**Findings:**
- PoLL had the lowest spread (std 2.2 vs 6.1 for GPT-3.5 alone).
- 7× cheaper than a single GPT-4 judge.
- Less intra-model bias than single-judge evaluation.
- **Diversity matters more than model size.** Three different models beats one powerful model.

**For Quorum:** Validates our 3-judge, 3-provider panel design. Average pooling (mean) worked well for them, but their tasks were less subjective than ours.

**Source:** arXiv:2404.18796

### CARE (OpenReview, 2025)

MRF (Markov Random Field) based aggregation that models confounders and judge correlations.

**Findings:**
- Up to **25.15% error reduction** vs majority vote and simple averaging.
- Accounts for correlated errors between judges (e.g., all judges being wrong about the same thing because of shared training data).
- Sparse + low-rank decomposition handles both item-specific and judge-specific confounders.

**For Quorum:** The error reduction is impressive, but the implementation is complex. This is a v2 consideration when we have enough data to model correlations. For v0.1, median is sufficient.

**Source:** OpenReview 2025 (IDs: Ou53DNvjx7, XdcofpTCyq)

### Beyond Consensus (2025)

Studied 14 LLM judges with regression-based aggregation and minority-veto.

**Findings:**
- Regression on human labels gives approximately **2× improvement** over 14-model ensembles.
- **Minority-veto** (if any judge flags a serious issue, it gets escalated) helps with agreeableness bias.
- LLMs tend to be "agreeable" — they have >96% true positive rate but <25% true negative rate. They're good at saying "yes, this is good" but bad at catching problems.

**For Quorum:** The minority-veto concept is interesting for the confrontation phase. If one judge flags a serious problem, that shouldn't be averaged away — it should be investigated. This aligns with our "disagreement is signal" philosophy.

**Source:** arXiv:2510.11822

### Bayesian Approaches (Various)

- BARD and hierarchical models outperform when rater quality varies.
- Semi-parametric methods show that using all labels beats majority vote.
- Johnson (1994) showed Bayesian approaches improve grant review aggregation.

**For Quorum:** Bayesian is the theoretically optimal approach but too complex for v0.1. Worth exploring when we have historical data across multiple sessions.

---

## 3. Confidence Calibration

### What Signals Indicate High vs Low Confidence?

| Signal | High confidence | Low confidence |
|--------|-----------------|----------------|
| **Inter-judge correlation** | Average Spearman > 0.8 | Average < 0.5 or negative |
| **Score variance** | Low standard deviation across judges for each dimension | High standard deviation |
| **Outlier presence** | Few or no outliers | Many outliers, especially high-impact ones |
| **Panel size** | More judges (5+) | Fewer judges (3, minimum) |
| **Dimension variance** | Low per-dimension variance | High variance on multiple dimensions (e.g., std > 2.5) |
| **Min pairwise correlation** | All pairs > 0.5 | Any pair < 0.2 or negative (inversion) |

### Research on Ensemble Confidence

- **Multi-rater calibration:** Disagreement between raters reflects genuine uncertainty about the item being evaluated (called "aleatoric uncertainty"). Modeling this disagreement explicitly improves calibration — you get better estimates of how confident you should be.
- **Ensemble calibration:** Using a metamodel that takes individual judge scores as input and produces a calibrated confidence score reduces Expected Calibration Error (ECE) and Maximum Calibration Error (MCE).
- **Fréchet variances:** A generalization of variance that works for multiple raters with potentially different scales. Could be useful when judges have different calibration profiles.

### Quorum's Current Approach

Confidence derived from three signals:
1. Average inter-judge correlation (do judges broadly agree?)
2. Dimension-level variance (are any dimensions unstable?)
3. Outlier severity (how extreme are the disagreements?)

**This aligns well with the literature.** The research suggests a few additions:

- **Penalize confidence when panel size is small** (< 4 judges). Three judges is the minimum; confidence should reflect that it's the minimum.
- **Weight outliers by impact** (deviation × dimension weight). A 3-point outlier on a 25-weight dimension matters more than on a 10-weight dimension.
- **Flag very low min pairwise correlation** (< 0.2) or inversions as automatic low confidence. If any two judges have inverted rankings, the signal is structurally unstable.

---

## 4. Threshold Design (Ready / Revise / Rework)

### Current Quorum Defaults

- Ready to circulate: median weighted total > 70% of scale
- Needs revision: 50–70%
- Needs significant rework: < 50%

### What the Research Says

**Rasch / Andrich models:** Thresholds should ideally be data-driven, derived from the score distribution. 10+ observations per category are needed for stable thresholds. Monotonic advancement (higher ability = higher category) should be verified.

**Ordinal scale research:** Ordinal comparisons are more stable than cardinal (i.e., "this is better than that" is more reliable than "this is a 7.2"). 75–80% discrimination is typical for well-designed scales.

**Design decisions literature:** Thresholds are fundamentally stakeholder-dependent. There is no universal formula. The "right" threshold depends on what the team considers acceptable risk — how bad is it to circulate something that needs revision? How bad is it to send back something that's actually ready?

### Challenges to Fixed Percentages

1. **Scale sensitivity:** 70% on a 1-10 scale (score of 7) may behave differently than on a 1-100 scale (score of 70), because judges use scales differently at different granularities.
2. **Task dependence:** Creative writing and coding evaluations may need different cutoffs. A strategy brief at 65% might be fine to circulate with caveats; an RFC at 65% might genuinely need revision.
3. **Distribution effects:** Fixed percentages ignore whether scores cluster or spread. If all judges give 68-72%, that's high confidence at ~70%. If scores range from 50-90%, the median might be 70% but confidence is low.
4. **Adaptive thresholds:** With enough historical data, thresholds could be calibrated per rubric/task type based on what score levels actually correlate with "the team was happy they circulated this."

### Recommendations

- **Keep 70% / 50% as starting defaults.** They're reasonable and easy to explain.
- **Make thresholds configurable per rubric/task** in `MethodologyConfig`.
- **Consider relative thresholds** (e.g., percentiles across historical evaluations) as a future option.
- **Add validation against human decisions** when possible. The ultimate test: do documents that score "ready" actually get approved by human reviewers?

---

## 5. Inter-Rater Reliability: Which Metric to Use?

### Overview of Options

| Metric | What it measures | Best for | Handles ordinal? | Missing data? | Multiple raters? |
|--------|-----------------|----------|-------------------|---------------|-------------------|
| **Spearman ρ** | Rank correlation between two raters | "Do these two judges rank submissions the same way?" | Yes (ranks) | No | Pairwise only |
| **Krippendorff's α** | Agreement among multiple raters on ordinal data | "Do all judges agree on the actual scores?" | Yes (with ordinal distance) | Yes | Yes |
| **Fleiss' κ** | Agreement among multiple raters on categories | "Do judges put things in the same categories?" | Partially (weighted) | No | Yes |
| **ICC (Intraclass Correlation)** | Consistency/agreement among raters on continuous data | "Are the scores from different judges interchangeable?" | Assumes interval data | No | Yes |
| **Kendall's τ** | Rank correlation (alternative to Spearman) | "Do judges agree on ordering?" | Yes | No | Pairwise |
| **Cohen's κ** | Agreement between two raters | "Do these two judges agree beyond chance?" | Partially (weighted) | No | Two raters only |

### What the Literature Recommends

- **Krippendorff's alpha (α)** is the most flexible and theoretically appropriate for Quorum's use case:
  - Handles ordinal data (rubric scores are ordinal — the distance between 3 and 5 is meaningful, unlike pure categories)
  - Handles multiple raters (not just pairs)
  - Handles missing data (if a judge fails to score one dimension)
  - Can use ordinal distance function (a score of 3 vs 7 is a bigger disagreement than 3 vs 4)

- **Interpretation thresholds** (Krippendorff's guidelines):
  - α ≥ 0.80 — "reliable" agreement
  - 0.67 ≤ α < 0.80 — "tentative" conclusions; acceptable for some purposes
  - α < 0.67 — "unreliable"; don't draw conclusions from these scores

- **JudgeBlender** paper used both Cohen's κ and Krippendorff's α for label agreement, and Spearman and Kendall for ranking agreement. This suggests using multiple metrics for different purposes is standard practice.

- **ICC vs α comparison:** For ordinal scales, ICC(3,1), Spearman, quadratically weighted κ, and Kendall τ-b often produce similar results. But α is theoretically better because it respects ordinal distance explicitly.

### Recommendations for Quorum

1. **Keep Spearman** for pairwise rank correlation. It answers: "Do these two judges rank submissions the same way?" This is what the correlation matrix shows.
2. **Add Krippendorff's α** for overall and dimension-level agreement. It answers: "How much do all judges agree on the actual scores?" This is a better summary statistic than averaging pairwise Spearman correlations.
3. **Optional: Add ICC** as an alternative for users who treat scores as interval data.
4. **Use α thresholds** for subjectivity classification:
   - α ≥ 0.80 → "high agreement"
   - 0.67–0.80 → "moderate agreement"
   - < 0.67 → "low agreement / high subjectivity"

---

## 6. LLM-Specific Considerations

### Known Failure Modes of LLM Judge Ensembles

| Failure Mode | What Happens | Evidence | How Quorum Handles It |
|-------------|-------------|----------|----------------------|
| **Correlated errors** | Multiple judges are wrong about the same thing because they share training data or reasoning patterns | Kim et al. 2025: 60% agreement when both wrong | Diverse panel (3 providers). Gap: no explicit dependence modeling yet. |
| **Agreeableness bias** | Judges tend to say things are good. >96% true positive rate, but <25% true negative rate for detecting problems. | Beyond Consensus 2025 | Confrontation forces judges to defend outlier scores. Minority voice gets heard. |
| **Self-judging bias** | Judges score their own outputs higher | Our benchmarks: +17.4 for Gemini Pro | Self-judge exclusion from consensus. |
| **Positional bias** | Order of submissions affects scores | Multiple studies | Per-judge randomised blinding. |
| **Shared training data** | Judges trained on similar data produce spuriously correlated scores | CARE 2025 | Diverse providers (Anthropic, OpenAI, Google). |
| **Scale compression** | LLMs rarely use the bottom of the scale (1-3) | RULERS 2026 | Monitored via judge calibration profiles. |

### Key Papers

**Kim et al. (2025) — Correlated Errors:**
- LLM judges often agree with each other even when they're wrong. Methods that ignore this dependence are miscalibrated.
- Implications: Simple majority vote or mean can be overconfident because the "agreement" doesn't mean correctness.
- For Quorum: This is why diverse providers matter more than just number of judges. Three judges from the same provider family may agree on mistakes.

**Beyond Consensus (2025):**
- Minority-veto (if any judge flags a serious issue, it gets escalated regardless of what the majority says) is effective for catching problems that agreeable judges miss.
- Regression on human labels gives ~2× improvement over 14-model ensembles for aligning with expert judgment.
- For Quorum: The confrontation phase is our version of "don't let the minority voice get drowned out."

**CARE (2025):**
- Models confounders and judge correlations using MRFs. Up to 25% error reduction.
- For Quorum: Worth exploring for v2 when we have more data. Too complex for v0.1.

---

## 7. Existing Multi-Judge Systems

| System | How They Aggregate | Panel Design | Main Finding |
|--------|-------------------|--------------|--------------|
| **JudgeBlender** (Rahmani et al., 2024) | Majority vote with tie-breaks, or average voting | Multiple LLMs or multiple prompts | AV and MV(Avg) are competitive; complex methods add marginal value |
| **PoLL** (Verga et al., 2024) | Average pooling (mean) | 3 diverse LLMs (Command R, Haiku, GPT-3.5) | Best κ agreement; 7× cheaper than single GPT-4; less bias |
| **CARE** (OpenReview, 2025) | MRF + sparse/low-rank decomposition | Multiple judges with modeled correlations | ~25% error reduction vs majority/simple averaging |
| **LLM Jury-on-Demand** | Reliability-weighted aggregation | Dynamically selected jury | Learns when judges agree with experts; adapts over time |
| **Beyond Consensus** (2025) | Minority-veto, regression-based | 14 LLMs | 2× improvement with regression; minority-veto reduces false negatives |

### Common Themes Across Systems

1. **Simple mean or median is a strong baseline.** Complex methods help at the margins but don't transform results.
2. **Diversity matters more than model size.** Three different models from different providers beats one powerful model.
3. **Principled aggregation helps when judges are correlated or biased.** But this requires data to model the correlations.
4. **No single "best" judge exists.** Panels are more stable than individuals.

---

## 8. Recommended Default for Quorum

### Primary Recommendation

1. **Aggregation: Median** of weighted totals, excluding self-judging.
   - Robust for 3-5 judges on subjective tasks.
   - Our benchmarks show strong outliers (Gemini Pro safety 10 vs consensus 3.6); median limits their impact.
   - Simple to explain: "the middle judge's opinion."

2. **Confidence: Current approach validated** (correlation + variance + outlier severity).
   - Add: penalize for small panel size; weight outliers by dimension impact; flag inversions.

3. **Thresholds: 70% / 50%** as configurable starting defaults.
   - No strong empirical basis, but reasonable.
   - Validate per task over time.

4. **Reliability metric: Add Krippendorff's alpha** alongside Spearman.
   - α for overall agreement; Spearman for pairwise ranking correlation.
   - Use α thresholds (0.80/0.67) for reliability classification.

### Why Not Something More Complex?

- CARE-style aggregation offers 25% error reduction but requires modeling judge correlations from historical data. We don't have that data yet.
- Bayesian aggregation is theoretically optimal but complex to implement and explain.
- Weighted mean by reliability needs reliability estimates we can't compute until we have multiple sessions.
- **Start simple, measure, iterate.** This aligns with the methodology-as-hypothesis philosophy.

---

## 9. Issues Flagged for Quorum

| Issue | Where | Action |
|-------|-------|--------|
| **Mean vs median inconsistency** | METHODOLOGY.md says "average" (mean); PRD says "median" | Align both to median as default |
| **No Krippendorff's alpha** | Not in current data model or analysis | Add α alongside Spearman in analysis.py |
| **No correlated-error handling** | Not addressed | Future work (CARE-style); document as known limitation |
| **No minority-veto** | Not addressed | Consider for confrontation phase: if any judge flags a critical issue, escalate regardless of consensus |
| **Outlier detection uses mean** | METHODOLOGY.md uses mean for outlier consensus | Decide: should outlier "consensus" be median for consistency with overall consensus? |

---

## Full Source List

| # | Source | Type | Key Contribution |
|---|--------|------|-------------------|
| 1 | CARE — OpenReview 2025 | LLM ensemble | MRF-based aggregation; 25% error reduction; confounders |
| 2 | JudgeBlender — arXiv:2412.13268 (Rahmani et al., 2024) | LLM ensemble | AV and MV(Avg) competitive; simple methods strong |
| 3 | PoLL — arXiv:2404.18796 (Verga et al., 2024) | LLM ensemble | Diverse panel; 7× cheaper; best κ |
| 4 | Beyond Consensus — arXiv:2510.11822 (2025) | LLM ensemble | Minority-veto; regression-based; 2× improvement |
| 5 | Kim et al. — arXiv:2506.07962 (2025) | LLM ensemble | Correlated errors; dependence-aware methods |
| 6 | Krippendorff's α literature | Psychometrics | Ordinal multi-rater agreement; 0.80/0.67 thresholds |
| 7 | Gwet — "Handbook of Inter-Rater Reliability" | Psychometrics | ICC vs α comparison |
| 8 | Springer ordinal comparison studies | Psychometrics | ICC(3,1), Spearman, weighted κ, Kendall τ-b comparison |
| 9 | Johnson (1994); BARD (JSTOR) | Bayesian | Bayesian aggregation for review panels |
| 10 | arXiv:2410.21498 | Bayesian | Bayesian nonparametric rater aggregation |
| 11 | arXiv:2601.23007 | Calibration | Multi-rater calibration; disagreement as uncertainty |
| 12 | Fréchet variances (Springer) | Statistics | Generalized variance for multiple raters |
| 13 | Rasch/Andrich | Psychometrics | Threshold design; data-driven category boundaries |
| 14 | Elsevier ordinal decision analysis | Decision theory | Ordinal thresholds for decision-making |
