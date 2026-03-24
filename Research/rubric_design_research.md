# Research: Evaluation Rubric Design for LLM-as-Judge

**Date:** 3 March 2026
**Context:** Research conducted for the Quorum project to inform rubric template design and validate the eval plan rubric.

---

## 1. Academic Foundations

### Analytic vs Holistic Rubrics

- **Holistic rubrics** give a single overall score. They are fast but less transparent and less useful for feedback.
- **Analytic rubrics** score each criterion separately with performance levels. They are more transparent and better for formative feedback.
- Research suggests these are complementary: analytic rubrics can validate whether holistic marks align with intended criteria weights.
- **For Quorum:** Analytic rubrics are the right choice. They support per-dimension disagreement analysis, which is the core of what Quorum does. If two judges disagree on "Coverage" but agree on everything else, that's specific, actionable signal.

**Sources:** Frontiers in Education (2019) on holistic vs analytic; ASCD on multi-level rubrics; Northeastern University on rubric design.

### Optimal Number of Dimensions

- **5–7 criteria** and **3–5 performance levels** are the common recommendations from educational assessment literature.
- More than 6–7 dimensions increases scoring fatigue and reduces clarity. Judges start rushing or conflating dimensions.
- Dimensions should be **distinct** and **non-overlapping**. If two dimensions frequently receive the same score from judges, they're probably measuring the same thing and should be merged.
- **For Quorum:** Our 6 dimensions for the eval plan rubric fit this range. We should resist adding more without merging existing ones.

**Sources:** Purdue ICAP; Performance Assessment Resource Bank; Illinois State University.

### What Makes Anchor Descriptions Effective vs Ambiguous

- **Effective anchors** are observable, specific, and evidence-based. For example: "Integrates feedback to strengthen argument structure" or "Names the decision explicitly and traces how results inform it."
- **Ambiguous anchors** use subjective terms like "creative," "interesting," "sufficient," "good organization," "well-written." These mean different things to different judges.
- Anchors should describe **qualitative differences** across levels, not just "more vs less" of the same thing. "Identifies three failure modes with mitigations" is better than "Good awareness of failure modes."
- Single-point rubrics (just describing the top level) are discouraged. Multi-level anchors at low/mid/high are preferred because they calibrate the full scale.
- **For Quorum:** Our current anchors are one-liners. The research says we need low/mid/high anchors for each dimension with observable, evidence-based language. This is a priority for rubric template development.

**Sources:** Northeastern University; ASCD "Value of Descriptive Multi-Level Rubrics"; Frontiers "Appropriate Criteria" (2018); University of Minnesota WAC.

---

## 2. LLM-as-Judge Practice (2024–2026)

### LMSYS (Chatbot Arena)

- Uses **pairwise comparisons** and Bradley–Terry models, not rubric-based scoring.
- Captures tone, clarity, helpfulness, and task-specific performance.
- **Relevance to Quorum:** LMSYS focuses on preference ranking ("which is better?"), not structured evaluation ("how good is this on these specific dimensions?"). Our rubric-based approach is more aligned with structured evaluation where you need to know *why* something scored the way it did.

**Source:** LMSYS blog (2023–2024).

### Anthropic (Constitutional AI)

- Uses **principles-based** evaluation via a "constitution" of natural-language principles.
- Evaluation is done by the model against these principles (RLAIF — Reinforcement Learning from AI Feedback).
- **Relevance to Quorum:** Principles are high-level and holistic. Our analytic rubric with explicit dimensions and anchors is more structured and auditable. But the idea of principles as evaluation criteria is interesting — it's essentially a holistic rubric.

**Source:** Anthropic Constitutional AI papers (2022–2024).

### Google DeepMind (FACTS, Evals)

- FACTS uses **four dimensions**: Parametric Knowledge, Search, Multimodality, Grounding.
- Uses **multiple frontier LLM judges** (Gemini, GPT-4o, Claude) to reduce bias.
- Benchmarks split into public/private sets to limit contamination.
- **Relevance to Quorum:** Multi-judge design and clear dimension structure align with our approach. FACTS is factuality-focused rather than subjective writing, but the principle of distinct, non-overlapping dimensions applies.

**Source:** DeepMind FACTS papers; Gemini model cards.

### RULERS (Hong et al., 2026) — Key Paper

This paper identifies **three failure modes** in LLM-as-judge rubric evaluation:

1. **Rubric instability** — Prompt sensitivity and interpretation drift cause the same rubric to produce different results across runs or with minor wording changes.
2. **Unverifiable reasoning** — Judges produce justifications that sound confident but can't be audited against evidence.
3. **Scale misalignment** — LLM score distributions don't match human grading boundaries (e.g., LLMs rarely give 1s or 2s).

**Mitigations proposed:**
- Locked, versioned rubrics (don't change wording between evaluations)
- Evidence-anchored scoring (require judges to cite specific evidence for each score)
- Post-hoc calibration against human baselines

**For Quorum:** This directly validates our `MethodologyConfig` versioning approach. It also suggests we should require evidence citations in judge justifications — not just scores and a sentence.

**Source:** arXiv:2601.08654

### Rubric-Induced Preference Drift / RIPD (2026) — Key Paper

**Critical finding:** Small rubric edits can shift judge preferences by **9.5–27.9%** on target domains, while benchmarks still pass (i.e., the drift is invisible to standard quality checks).

This means:
- A rubric that was working fine can break with a seemingly innocent edit.
- Version control of rubrics is essential — you need to know exactly which wording produced which results.
- "Improving" a rubric is dangerous without A/B comparison against the previous version.

**For Quorum:** This is one of the strongest validations of our methodology-as-config approach. Rubrics must be versioned and immutable once used in a session. Any rubric "improvement" should be A/B tested, not assumed to be better.

**Source:** arXiv:2602.13576

### DeCE — Decomposed Criteria Evaluation

Instance-specific criteria (e.g., precision vs recall, depending on the task) correlate better with expert judgment (r=0.78) than single aggregate scores.

**For Quorum:** Supports our analytic rubric approach. Per-dimension scoring is more informative than a single number.

**Source:** arXiv:2509.16093

### Judging the Judges (2024)

Comprehensive study of LLM judge vulnerabilities:
- Judges are sensitive to rubric framing
- Order effects (which submission comes first) affect scores
- Judges can be manipulated by submission formatting

**For Quorum:** Validates our blinding approach (per-judge randomised ordering). Also supports requiring structured output format rather than free-form evaluation.

**Source:** arXiv:2406.12624

---

## 3. Multi-Judge Specific

### Inter-Rater Reliability

- Rubrics must support **inter-rater reliability** to be valid for multi-judge use.
- **Norming** (joint calibration on sample work) improves agreement. In the LLM context, this could mean running a calibration set through all judges before the real evaluation.
- Choice of reliability statistic matters: Cohen's kappa (2 raters), Fleiss' kappa (multiple raters, nominal), Krippendorff's alpha (multiple raters, ordinal), ICC (continuous).
- **For Quorum:** Our per-dimension variance reporting is aligned with this. High-variance dimensions are a signal that anchors need refinement. Adding Krippendorff's alpha (see committee recommendation research) would strengthen this.

**Sources:** FHSU Leadership; RPA Journal; NCBI PMC.

### Anchor Specificity and Agreement

- **More specific anchors produce higher inter-rater agreement.** This is one of the most consistent findings across the literature.
- Conflated criteria (e.g., citation quality + analytical depth in a single dimension) produce bimodal scoring — some judges score the citation quality, others score the analytical depth, and they disagree.
- **For Quorum:** Our own BENCHMARKS.md already showed this. "Evidence & Specificity" in the analysis benchmark conflated citation quality with analytical depth, causing bimodal scoring. This is not a theoretical risk — we've already seen it.

### Multi-Judge Panel Design

- No strong academic literature on rubrics *designed specifically for* multi-judge LLM panels. This is a relatively new area.
- RULERS and RIPD show that **locked, executable rubrics** and **evidence verification** improve stability across judges.
- **For Quorum:** We're in relatively new territory. The confrontation mechanism is our innovation here — using disagreement as a signal to discover rubric ambiguity.

---

## 4. PM Artefact Evaluation

### Existing Frameworks

**CDC Program Evaluation Framework (2024):**
- Criteria: Relevance and utility, rigor, independence and objectivity.
- Stakeholder engagement as a cross-cutting element.
- **Mapping to our rubric:** "Objective Clarity" maps to relevance/utility; "Operationalisation" maps to feasibility.

**OECD DAC Criteria:**
- Relevance, coherence, effectiveness, efficiency, impact, sustainability.
- **Mapping:** "Coverage" relates to coherence; "Metrics Validity" to effectiveness; "Operationalisation" to efficiency.

**CDC Evaluation Plan Quality:**
- Logic models, evidence review, discrete research questions, stakeholder engagement, realistic timelines.
- **Mapping:** Our dimensions cover these implicitly. "Ground Truth and Verification" aligns with evidence and research questions.

**RFC/PRD Readiness (industry practice):**
- RFC: Problem statement, proposed solution, alternatives considered, risks, timeline.
- PRD: Problem, success metrics, user stories, in-scope/out-of-scope, dependencies.
- **Mapping:** "Objective Clarity" and "Failure Mode Awareness" map to problem framing and risks.

**Better Evaluation:**
- Rubrics should support: transparent judgment, robust data collection, mixed methods, and diverse evidence.
- **Mapping:** "Ground Truth and Verification" and "Metrics Validity" support this.

**Sources:** CDC 2024 Framework; OECD "Applying Evaluation Criteria Thoughtfully"; Better Evaluation; LeadDev RFC guide.

### Key Gap

**No standard rubric exists for evaluation plan quality.** CDC, OECD, and Better Evaluation focus on program evaluation, not meta-evaluation of eval plans. Our rubric fills a genuine gap.

---

## 5. Anti-Patterns — What Makes Rubrics Fail

### General Anti-Patterns

| Anti-Pattern | What happens | Fix |
|-------------|-------------|-----|
| **Vague language** ("good," "sufficient," "well-written") | Different judges interpret differently; low agreement | Use observable, specific descriptions |
| **Too many dimensions** (12-15) | Scoring fatigue; judges rush or conflate dimensions | Use 4-6 dimensions; merge similar ones |
| **Unclear progression** (jump from "Needs Improvement" to "Excellent") | Judges can't calibrate the middle of the scale | Define qualitative differences at each level |
| **Misalignment with goals** | Dimensions don't match what you actually care about | Each dimension should map to a clear objective |
| **Blended expectations** (multiple concepts in one row) | Bimodal scoring — different judges score different aspects | One concept per dimension |
| **Opaque weights** | Users don't understand why some dimensions matter more | Make weights explicit and justified |
| **No testing before use** | Ambiguity only discovered during real evaluation | Pilot on sample work first |
| **Late introduction** | Rubric doesn't guide the work it's evaluating | Share rubrics early so they guide creation |

**Sources:** RedMenta; EduCreate; Northeastern; University of Minnesota.

### LLM-Specific Anti-Patterns

| Anti-Pattern | Evidence | Impact |
|-------------|----------|--------|
| **Prompt sensitivity** (RIPD) | Small edits shift preferences 9.5-27.9% | Results become unreliable across rubric versions |
| **Unverifiable reasoning** (RULERS) | Judges give confident wrong justifications | Scores can't be audited |
| **Scale misalignment** | LLMs rarely use the bottom of the scale | Score distributions are compressed; discrimination suffers |
| **Conflated dimensions** | Our own benchmarks | Bimodal scoring on "Evidence & Specificity" |

---

## 6. Validation and Challenges for Quorum's Eval Plan Rubric

### What's Validated

| Dimension | External validation |
|-----------|-------------------|
| **Objective Clarity (25%)** | Aligns with CDC relevance/utility and OECD relevance. Weight justified — it's the most fundamental question. |
| **Coverage (20%)** | Aligns with representativeness, edge cases, and CDC/OECD coherence. |
| **Ground Truth and Verification (20%)** | Aligns with RULERS evidence-anchored scoring and Better Evaluation. |
| **Failure Mode Awareness (15%)** | Aligns with CDC rigor, RFC risk sections, and validity threats literature. |
| **Metrics Validity (10%)** | Aligns with OECD effectiveness and construct validity literature. |
| **Operationalisation (10%)** | Aligns with CDC feasibility and OECD efficiency. |

### Potential Issues

1. **Ground Truth vs Metrics Validity overlap.** Both relate to "is the measurement valid?" but from different angles. Ground Truth = what can be objectively verified; Metrics Validity = whether the metric measures the intended outcome. The boundary needs to be crystal clear in the anchors, or judges will conflate them (exactly the "blended expectations" anti-pattern).

2. **Anchor specificity.** Current descriptions are one-liners. The research says we need low/mid/high anchors with observable, evidence-based language. This is the biggest gap between our current rubric and best practice.

3. **RIPD risk.** When we refine the rubric (and we will), each version needs to be A/B tested against the previous one. "Improving" wording can silently change what gets scored high.

4. **Evidence requirement.** RULERS recommends requiring judges to cite specific evidence for each score. Our current prompt template asks for justifications but doesn't enforce citations.

---

## 7. Recommendations

### Immediate (before v0.1)

1. **Clarify the Ground Truth / Metrics Validity boundary** in the dimension descriptions.
2. **Add low/mid/high anchors** for each dimension, using observable, evidence-based language.

### For v0.1

3. **Version rubrics** — treat them as immutable once used in a session. This is already supported by `MethodologyConfig` versioning.
4. **Require evidence** in judge justifications. Update the scoring prompt template to explicitly ask for quotes or references.

### For later

5. **Pilot the eval plan rubric** on sample evaluation plans before using it for real decisions.
6. **Use confrontation as rubric discovery** — disagreement reveals ambiguity in dimensions and anchors.
7. **Report per-dimension variance** to flag dimensions needing anchor refinement.
8. **Consider instance-specific criteria** (DeCE-style) for different eval plan types.

---

## Full Source List

| Source | Type | Key Contribution |
|--------|------|-------------------|
| Frontiers in Education (2019) | Academic | Analytic vs holistic rubrics |
| Northeastern University | Academic | Effective rubric design, anchor specificity |
| ASCD "Value of Descriptive Multi-Level Rubrics" | Academic | Multi-level anchors, qualitative progression |
| Frontiers "Appropriate Criteria" (2018) | Academic | Criteria alignment, continuum of quality |
| Purdue ICAP / Illinois State | Academic | 5–7 dimensions, 3–5 levels |
| University of Minnesota WAC | Academic | Rubric design principles |
| RULERS — arXiv:2601.08654 (Hong et al., 2026) | LLM-as-judge | Locked rubrics, evidence-anchored scoring, three failure modes |
| RIPD — arXiv:2602.13576 (2026) | LLM-as-judge | Rubric-induced preference drift, 9.5-27.9% shift |
| DeCE — arXiv:2509.16093 | LLM-as-judge | Decomposed criteria, instance-specific evaluation |
| Judging the Judges — arXiv:2406.12624 | LLM-as-judge | Judge vulnerabilities, rubric sensitivity |
| GER-Eval — arXiv:2602.08672 | LLM-as-judge | LLM-generated rubrics, reliability |
| LMSYS / Chatbot Arena | LLM-as-judge | Pairwise preference, Bradley-Terry models |
| Anthropic Constitutional AI | LLM-as-judge | Principles-based evaluation |
| DeepMind FACTS | LLM-as-judge | Multi-judge factuality, dimension structure |
| CDC Program Evaluation Framework 2024 | PM / Evaluation | Relevance, rigor, objectivity |
| OECD DAC Criteria | PM / Evaluation | Relevance, coherence, effectiveness, efficiency |
| Better Evaluation | PM / Evaluation | Rubrics for transparent assessment |
| RedMenta / EduCreate | Anti-patterns | Common rubric mistakes |
| Quorum BENCHMARKS.md | Internal | Evidence & Specificity conflation, confrontation value |
