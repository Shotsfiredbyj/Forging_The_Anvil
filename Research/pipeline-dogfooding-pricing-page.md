# Pricing Page Pipeline Pack

**Purpose:** Test our own pipeline on our own pricing page copy.

**Created:** 22 March 2026

---

## Task Definition

### Task: Pricing Page Copy Generation

```json
{
  "task_id": "pricing_page_copy_v1",
  "task_type": "creative",
  "prompt": "Write pricing page copy for Cold Anvil — a product engineering SaaS for solo founders.

Tone: Direct, craft-focused, no bullshit. Not a chatbot. Not corporate. Blacksmith/forge metaphor throughout.

Brand guidelines:
- Avoid: 'AI-powered', 'leverage', 'synergy', 'game-changing', performative helpfulness
- Use: 'forge', 'quality', 'output', 'builder', 'actual', 'straightforward'
- Never self-reference as bot/AI

Structure required:
1. Hero (headline, subhead, primary CTA)
2. Pricing tiers (Free, 29, 49, 149) with clear value prop per tier
3. FAQ (data safety, will it work, what's a refinement loop, team usage, cancellation)
4. Footer CTA

Tier specifics:
- Free: 1 idea → vision doc only, email-gated
- 29/month: 2 ideas/month, 3 refinements each
- 49/month: 5 ideas/month, 10 refinements each (most popular)
- 149/month: unlimited ideas and refinements

Constraints:
- Address: data safety, will it work for my idea
- Don't over-explain payment policies (enforce via ToS)
- Annual pricing visible: 329/529/1599 at 5-10% discount
- Single user per subscription

Deliver: Full HTML or markdown, ready for dev handoff."
}
```

---

## Rubric

```markdown
# Pricing Page Copy Review

## Dimensions

### Conversion Focus (30 percent)
0: No clear CTAs, confusing tier value props
5: CTAs present but generic, tiers explained but not differentiated
10: Compelling CTAs, immediate value prop clarity, clear upgrade path

### Brand Voice Fidelity (25 percent)
0: Chatbot voice, corporate filler, forbidden phrases present
5: Mostly on voice, 1-2 forbidden phrases, tone inconsistent
10: Consistent craft voice, no forbidden phrases, sounds like a person

### Structure & Completeness (25 percent)
0: Missing sections, incomplete tier info, no FAQ
5: Has all sections but shallow, missing 1-2 FAQ questions
10: Complete structure, all tiers accurate, 6+ FAQ questions

### Clarity (20 percent)
0: Confusing flow, jargon-heavy, tier differentiation unclear
5: Understandable but some awkward phrasing, minor clarity issues
10: Crystal clear reading flow, obvious value per tier, friction points addressed

## Review Instructions
Review the output against this rubric. Call out specific examples. If any dimension scores below 7, recommend rewrites.
```

---

## Gates

```json
[
  {
    "name": "tier_count",
    "description": "Must reference all 4 pricing tiers",
    "check": "min_matches",
    "params": {
      "pattern": "49|29|149",
      "min": 4
    },
    "severity": "fail"
  },
  {
    "name": "no_forbidden_phases",
    "description": "No chatbot/corporate clichés",
    "check": "no_match",
    "params": {
      "patterns": ["(?i)(as an ai|i hope this helps|feel free|don't hesitate|synergy|leverage|AI-powered|disrupt)"]
    },
    "severity": "hard_block"
  },
  {
    "name": "cta_presence",
    "description": "Must have multiple calls to action",
    "check": "min_matches",
    "params": {
      "pattern": "[Bb]utton|CTA|Start|Get Started|Upgrade",
      "min": 3
    },
    "severity": "fail"
  },
  {
    "name": "faq_min_questions",
    "description": "Must have at least 6 FAQ questions",
    "check": "min_matches",
    "params": {
      "pattern": "?",
      "min": 6
    },
    "severity": "warn"
  },
  {
    "name": "tier_differentiation",
    "description": "Must mention refinement counts for paid tiers",
    "check": "section_presence",
    "params": {
      "sections": ["29", "49", "149", "refinement"]
    },
    "severity": "fail"
  }
]
```

---

## Pipeline Configuration

### Generation
- **Models:** qwen3.5:122b, gpt-oss:20b (dual parallel generation)
- **Temperature:** 0.7
- **Concurrency:** 2

### Review
- **Models:** gemma3:27b-it, mistral-small3.2:24b (dual independent)
- **Strategy:** Both reviewers score independently → if either flags, trigger rewrite

### Retry Policy
- **Max rounds:** 3
- **Strategies:** error_augmented → de_anchored → same_model_escalation
- **Hard block:** If hard_block gate fires, no retry possible (requires prompt change)

### Success Criteria
- Pass all gates (no failures, no hard blocks)
- Review scores: all dimensions ≥ 7/10
- Weighted average ≥ 8/10

---

## Expected Output

A pricing page with:

1. **Hero section** — headline, subhead, primary CTA (Start Forging Free)
2. **Tier cards** — Free, 29, 49 (most popular), 149 with clear value props
3. **FAQ section** — 6+ questions addressing data safety, will it work, refinements, team usage, cancellation
4. **Footer CTA** — secondary "Start Forging Free" button

**Not included in this pass:**
- Testimonials (none available yet)
- Feature comparison table (too complex for V1)
- Animated elements (design only)

---

## Notes

### Why Dogfood This

- Validates our pipeline on our own content
- Shows if the prompt/rubric/gates approach works for marketing copy
- If we can't make this work for ourselves, it won't work for customers

### Known Limitations

- Pipeline API not fully implemented (manual batch execution needed)
- Review parsing is heuristic (regex-based from markdown output)
- No model review for tone/metrics yet (only regex gates)

### Future Extensions

- A/B test variants: generate 2 versions, review both, pick winner
- Multi-language: same prompt, different language target
- Conversion iteration: generate → measure CTR → regenerate based on data

---

## Run Command

```bash
python -m pipeline.engine \
  --project cold_anvil \
  --batch pricing_page_v1 \
  --output outputs/pricing_page_2026-03-22.md
```

---

*Research document. Not a spec, not a final deliverable.*
