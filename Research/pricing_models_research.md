# AI Generation Product Pricing: Deep Research Report

**Date:** 9 April 2026
**Purpose:** Inform Cold Anvil's pricing model decisions
**Status:** Research complete, pending pricing decision

---

## 1. Executive Summary

The AI generation product market is in pricing chaos. Every model is being
tried; none has won. The dominant pattern is credit/token-based pricing, and
the dominant user complaint is unpredictable costs --- especially paying to
fix AI mistakes. Cold Anvil's depth-gated model is unusual, defensible, and
well-suited to its cost structure.

**Key findings:**

- **Credit/token pricing is the industry default and the industry's biggest
  source of user anger.** Lovable (400M ARR), Bolt, v0, and Cursor have all
  faced severe backlash over credit burn during debugging loops.
- **Flat-rate subscription is what users want but what most AI companies
  can't afford.** API costs make unlimited use financially dangerous. Cold
  Anvil's self-hosted infrastructure (0.003/artifact vs 0.96 via API) makes
  flat-rate viable where competitors cannot.
- **Depth-gated pricing has strong precedent** in non-AI software (Canva,
  Grammarly, LinkedIn, GitHub, SonarQube) but is rare in AI generation. It
  avoids the "paying for mistakes" problem entirely.
- **Outcome-based pricing is emerging** (Intercom at 0.99/resolution, Sierra,
  Chargeflow) but requires measurable outcomes. For creative generation, this
  is harder to define.
- **The "paying to fix AI mistakes" problem is the #1 competitive
  vulnerability** of every credit-based AI builder. Cold Anvil's internal
  quality pipeline (3-pass cascade with dual review) eliminates this at the
  infrastructure level, not the pricing level.
- **Free tier conversion rates average 3-5%** for self-serve SaaS. Cold
  Anvil's depth-gated free tier (vision document) is a stronger conversion
  mechanism than typical feature-limited freemium because the user has
  invested in the conversation and can see what's next.
- **AI-native SaaS has dramatically worse retention** than traditional SaaS.
  Median gross revenue retention for AI-native products was 40% in September
  2025, compared to 80-90% for traditional SaaS. Depth-gating may improve
  this because value compounds with depth.

**Bottom line:** Cold Anvil's cascade-depth pricing is not just defensible ---
it's structurally superior to credit-based models for the target customer
(solo founders who are not developers). The self-hosted cost advantage makes
flat-rate-within-depth viable. The internal quality pipeline eliminates the
biggest user complaint in the category. The pricing model should lean into
these advantages, not away from them.

---

## 2. Pricing Model Taxonomy

### 2.1 Comparison Matrix

| Model | Examples | Revenue predictability | User satisfaction | Failure mode | Cold Anvil fit |
|-------|---------|----------------------|-------------------|-------------|---------------|
| Pure subscription (flat) | Durable (12-95/mo), Wix (17-159/mo) | High | High (predictable) | Heavy user subsidy, margin erosion | Strong (cost advantage enables it) |
| Subscription + credit pool | Lovable (25/mo, 100 credits), Bolt (25/mo, 10M tokens) | Medium | Low (anxiety, anger) | Debugging loops burn credits, "slot machine" feel | Poor (wrong signal for novices) |
| Credit/token only | OpenAI API, Anthropic API | Low | Low for non-devs | Bill shock, unpredictable costs | Very poor |
| Depth-gated subscription | Grammarly (free/premium), GitHub (free/team/enterprise), Cold Anvil | High | High (clear value per tier) | Needs visible value at each boundary | Strong (natural fit) |
| Outcome-based | Intercom Fin (0.99/resolution), Sierra, Chargeflow (25% of recovered revenue) | Variable | High (pay for results) | Attribution complexity, cash lag | Possible future add-on |
| Hybrid (base + usage) | Cursor (20/mo + overage), Databricks, Snowflake | Medium | Medium | Complexity, surprise overages | Avoid for MVP |
| Effort-based | Replit (per checkpoint, 0.06-0.50+) | Low | Mixed (transparent but expensive) | Complex tasks cost more than expected | Poor (too unpredictable) |
| Seat-based + AI add-on | GitHub Copilot (10-39/user/mo), Notion AI | High | Medium | Success cannibalises seats | N/A (single user product) |

### 2.2 Detailed Model Analysis

**Pure Subscription (Flat Rate)**

Real examples:
- **Durable:** 12-95/mo. 4.8-star Trustpilot. Users love predictability. Limited
  to basic business websites --- no complex app generation.
- **Wix:** 17-159/mo (annual billing). 15+ AI tools included in every tier.
  No per-use charges for AI features. 14-day money-back guarantee.
- **ChatGPT Plus:** 20/mo with "soft limits" that dynamically throttle heavy
  users. OpenAI burned 8B annually on compute in 2025.

User satisfaction is highest with flat pricing. The problem: most AI companies
can't afford it. At API rates, a single power user can cost more than they
pay. Wix and Durable can do it because website generation is a bounded task.

Cold Anvil relevance: Self-hosted cost of 0.003/artifact means a Tier 3
customer at 200/mo could run 66,000 cascades before compute cost exceeds
revenue. Even at 10x the estimated compute (0.03/artifact), that's 6,600
cascades. Flat-rate-within-depth is sustainable.

**Subscription + Credit/Token Pool**

Real examples:
- **Lovable:** 25/mo for 100 credits. 400M ARR. 25M+ projects. But: 64%
  5-star, 17% 1-star on Trustpilot --- extremely polarised. Users describe
  pricing as "a slot machine." Credits vanish during debugging loops. Users
  report spending thousands trying to fix persistent AI errors.
- **Bolt:** 25/mo for 10M tokens. Users report burning 1.3M-7M+ tokens in
  a single day. One user burned 20M tokens on a single auth issue. Token
  rollover added July 2025 after backlash.
- **v0 (Vercel):** 20/mo. Shifted from unlimited messages to token-based in
  May 2025. Triggered 10+ community threads titled "From Affordable to
  Abusive" and "Is V0.dev a Credit-Burning Scam?" Context tokens (chat
  history, source files) count as input, making longer conversations
  progressively more expensive.
- **Cursor:** 20/mo Pro plan. Shifted from 500 fast requests to
  compute-based limits June 2025. Some developers saw costs spike from 28
  to 500 within three days. CEO apologised. Mass cancellations.
  Still hit 2B ARR by March 2026 due to enterprise adoption.

The credit model works for revenue (Lovable at 400M ARR proves that), but
user trust is fragile and the "paying to fix mistakes" perception is
corrosive. Every major credit-based AI builder has faced pricing backlash.

**Depth-Gated Subscription**

Real examples:
- **Grammarly:** Free spell-check is useful. Premium unlocks tone
  optimisation, plagiarism detection. Users see inline suggestions they
  can't access without upgrading --- visual upsell at point of need.
- **GitHub:** Free repos. Team/Enterprise unlock advanced security scanning,
  code scanning, secret detection. Gates by capability depth and
  organisational scale, not by crippling the base product.
- **Canva:** Free tier is genuinely useful. Pro unlocks background remover
  (reportedly a major conversion driver), brand kit, premium templates.
  Background remover shows the result with a watermark --- one-click upgrade.
  Conversion rate 3-5% (good for freemium self-serve).
- **LinkedIn:** Free profile. Premium unlocks InMail, "Who Viewed Your
  Profile," advanced search. Gates insight depth, not basic access.
- **SonarQube:** Developer/Enterprise/Data Center editions progressively add
  languages, security rules, branch analysis, portfolio management.
- **Datadog:** Basic monitoring accessible. Advanced APM, custom metrics,
  log management unlock progressively.

Key principle from successful depth-gating: **gate power, not access.** Free
users should be able to do the core job. Paid users do it faster, better, or
deeper. Cold Anvil's model (free tier gets a real vision document, paid tiers
go deeper) follows this exactly.

**Outcome-Based Pricing**

Real examples:
- **Intercom Fin:** 0.99 per resolved conversation. 40% higher adoption
  after pivot from per-seat. One enterprise customer: 18,000 resolutions =
  17,820/month.
- **Chargeflow:** 25% of successfully recovered chargeback revenue. Pure
  outcome alignment.
- **Sierra:** Bills per completed customer service outcome.
- **Riskified:** Charges only for fraud-free transactions approved.

Gartner forecast: 30%+ of enterprise SaaS would incorporate outcome-based
components by 2025, up from 15% in 2022. AI companies using outcome-based
pricing report capturing 25-50% of value created, vs 10-20% for traditional
SaaS.

Cold Anvil relevance: Outcome-based is hard for creative generation because
"success" is subjective. But a form of it is possible: "satisfaction
guarantee" or "your project deploys successfully or we iterate for free."
Better as a trust signal than a pricing mechanic.

**Effort-Based (Replit)**

Replit's model charges per checkpoint based on actual computation. Simple
changes: under 0.25. Complex tasks: 0.50+. New controls let users adjust
effort level ("high power model," "extended thinking").

Reality: Users report 30/hour, 360/day. Forum posts titled "Agent 3 is
extremely expensive." Replit hit 100M ARR in 2025 but user frustration is
high. The Register headline: "Replit infuriating customers with surprise
cost overruns."

True costs run 70% above listed price. A 25-person team expecting 6,000/year
in base costs actually pays 10,200+.

---

## 3. User Psychology and Pricing Perception

### 3.1 Evidence Table

| Psychological factor | Evidence | Source/data | Cold Anvil implication |
|---------------------|----------|-------------|----------------------|
| Credit/token anxiety | Users actively avoid using AI features even when free credits included, fearing unpredictable costs | Metronome 2025 field report | Don't use credits. Ever. Novice users will self-limit. |
| "Slot machine" effect | Lovable described as "a slot machine where you're not sure what an action will cost" | Superblocks review, Trustpilot | Credit pricing feels like gambling to non-technical users |
| Flat-rate preference | 70% of B2B customers prefer maintaining existing arrangements; clear pricing makes customers "feel secure" | OpenView, Monetizely benchmarks | Flat-rate-within-depth matches user preference |
| Loss aversion | Pain of losing is 2x the pleasure of gaining. "You've used 80% of credits" triggers anxiety, not action | Kahneman/Tversky; SaaS renewal tests show 27% higher renewal with loss-framed messaging | Avoid any mechanic where users "lose" something. No credits to deplete. |
| Anchoring | Middle option selected 40% more frequently regardless of attributes. Premium anchor makes mid-tier look like "best deal" | Columbia Business School research | 3-tier structure with Tier 2 as the anchor is correct |
| Decision paralysis | 5+ pricing tiers reduce conversion by 30%+ | Monetizely SaaS benchmarks | Keep to 3 tiers + free. No add-on complexity at launch. |
| Contextual upselling | Upselling at point of need increases conversion 30% vs generic upgrade prompts | ProductLed, Userpilot research | Tier boundaries that show next stage's output are contextual upsells |
| Free tier conversion | Average freemium to paid: 3-5% (good), 6-8% (great). Freemium users take 90-180 days to convert --- 6-10x longer than trial users | Lenny's Newsletter survey of 1000+ products | Expect 3-5% conversion. Design for long conversion window. |
| Trust and transparency | Hiding prices "sends the message you're ashamed of pricing." Displaying prices builds trust and accelerates decisions | SpeedInvest early-stage pricing research | Show all prices publicly. No "contact us." |
| Willingness to pay | Positive brand perception: 16-41% higher WTP. Positive support: 12-36% higher WTP. Case studies: 10-15% WTP boost B2B, 5-20% B2C | Paddle/ProfitWell research | Build-in-public strategy and case studies directly increase WTP |

### 3.2 The Credit Anxiety Problem

The evidence is overwhelming: credit-based pricing causes anxiety that
reduces product usage, especially for non-technical users.

- **Gamma** increased credit rollover caps from 1.5x to 2x plan size in 2025,
  specifically to reduce "customer anxiety about wasted credits"
- **Metronome's 2025 field report:** Users self-limit rather than risk
  burning credits on uncertain outcomes
- **Elena Verna (Growth leader):** Published "My beef with AI credit pricing"
  (November 2025), calling credits "a necessary evil" but highlighting that
  buyers "rarely understand what a credit actually represents"
- **Ibbaka research:** "Nothing scares procurement more than runaway costs
  with no visibility"
- **FrozenLight analysis:** Credits create "mental buckets" that abstract
  payment from consumption --- but this abstraction cuts both ways. Users
  can't link spending to outcomes, so they perceive risk.

For Cold Anvil's target customer (solo founders, not developers), credit
anxiety would be fatal. These users don't know what a token is. They don't
know what a "cascade" costs. They just want their idea built. Any pricing
mechanic that makes them worry about cost mid-flow will kill engagement.

### 3.3 The Anchoring Opportunity

Cold Anvil has a natural anchoring advantage: the cost comparison with
competitors. A 5-page website that would cost ~96 cents on Cold Anvil's
infrastructure would cost ~960 via Claude Sonnet API. Competitors using
those APIs pass costs to users.

Showing "this would have cost X elsewhere" is effective when the delta is
credible. Research shows:
- Framing a 500 service as "Save 200 (normally 700)" increases perceived
  value even when the original price is unverified
- Display prices alongside competitors' to emphasise value
- But: the anchor must be credible. "This would cost 10,000 with a
  development team" is stronger than "this would cost 0.96 in API fees"
  because the target user thinks in terms of hiring, not tokens

Recommended anchor: "A freelance developer would charge 2,000-5,000 for
this. Cold Anvil does it for 49/month." Not: "Our token costs are lower."

---

## 4. Feature Gating Strategies

### 4.1 Recommendation Framework

Based on analysis of Canva, Grammarly, Figma, Notion, Linear, GitHub,
Midjourney, ElevenLabs, and RunwayML:

**Gate power, not access.** The free product should be genuinely useful. The
paid product should unlock capability depth, not remove artificial
restrictions.

### 4.2 What to Include at Every Tier

| Feature | Gating recommendation | Rationale |
|---------|----------------------|-----------|
| Full quality pipeline (review + rewrite) | Include in ALL tiers including free | Quality is the product. Degrading it at lower tiers undermines trust and the brand. |
| Conversational idea refinement | Include in ALL tiers | This is the hook. It's where investment happens. |
| Email delivery of output | Include in ALL tiers | Basic output delivery should never be gated. |
| Project storage (archived) | Include in ALL tiers | Stored projects = retention. Never charge for storage. |

### 4.3 What to Gate by Tier

| Feature | Free | Tier 1 (29) | Tier 2 (49) | Tier 3 (200) |
|---------|------|-------------|-------------|--------------|
| Pipeline depth | Vision | + Roadmap + Content | + Tech design + Code | + Assembly + Verify + Deploy |
| Active projects | 1 (locked after completion) | 1 | 1 | 1 |
| Iteration cycles | None (one-shot) | Unlimited within depth | Unlimited within depth | Unlimited within depth |
| Export/download | Vision doc (PDF) | + Roadmap, content assets | + Code files, tech docs | + Full project bundle |
| Project context memory | None | Basic | Full | Full + evolution |
| Priority processing | Standard | Standard | Standard | Priority queue |

### 4.4 Critical Decision: Iteration Cycles

The biggest feature-gating question for AI builders is whether
iteration/revision cycles should be included or metered. This is the #1
source of user anger at competitors.

**Recommendation: Include unlimited iterations within depth. No exceptions.**

Rationale:
1. Cold Anvil's cost per iteration is approximately 0.003. Even 100
   iterations on a Tier 1 project costs 0.30. This is not a margin risk.
2. Metering iterations creates the exact "paying to fix AI mistakes"
   perception that's destroying competitor goodwill.
3. The internal quality pipeline (3-pass cascade) means most iterations are
   caught before the user sees them. External iteration should be rare.
4. Unlimited iteration is a massive competitive differentiator against
   Lovable, Bolt, v0, and Cursor, all of which charge for every interaction.

### 4.5 How Competitors Gate Features

**Midjourney:**
- Free: No free tier (removed after abuse)
- Basic (10/mo): Limited fast GPU hours, 4 concurrent jobs
- Standard (30/mo): Unlimited Relax mode, 15 fast GPU hours
- Pro (60/mo): + Stealth mode (private generations)
- Mega (120/mo): + 60 fast GPU hours, 12 concurrent jobs
- Revenue: 500M in 2025
- Model: Subscription + GPU hour pool. Relax mode (slower, unlimited) is the
  key gate --- pay more for speed, not for access.

**ElevenLabs:**
- Free: 10,000 credits/month (~10 min TTS), no commercial rights
- Starter (5/mo): 30,000 credits, commercial rights
- Creator (22/mo): 100,000 credits, professional voice cloning
- Pro (99/mo): 500,000 credits, 44.1kHz output, production-scale
- Scale (330/mo): Higher limits, lower overage rates
- Model: Subscription + credit pool + overage billing. Credits reset monthly
  but roll over 2 months on paid plans. Overage rates: 0.12-0.30 per 1,000
  characters depending on tier.

**RunwayML:**
- Free: 125 one-time credits (~25 seconds video)
- Standard (12/mo): All apps, workflow access
- Pro (28/mo): Unlimited generations in Relax mode
- Unlimited (76/mo): Unlimited generations, priority
- Model: Subscription + credit pool. Similar to Midjourney's speed-gating.

**Figma:**
- Free: 3 design files, 3 FigJam files, 30-day version history
- Professional (12/editor/mo): Unlimited files, advanced history, team libs
- Organisation (45/editor/mo): + org-wide design systems, SSO, analytics
- Enterprise (75/editor/mo): + advanced security, dedicated support
- Model: Seat-based + capability depth. Gates collaboration scale and
  governance, not individual creation.

**Notion:**
- Free: Unlimited pages, 5MB file upload, 7-day page history
- Plus (12/mo): Unlimited file uploads, 30-day history
- Business (28/mo): Advanced permissions, bulk export
- Enterprise (custom): SAML SSO, advanced security
- Model: Seat-based + capability depth. AI features available across tiers
  as add-on.

---

## 5. The "Paying to Fix AI Mistakes" Problem

### 5.1 The Pattern

This is the single most toxic perception in AI builder pricing. The pattern:

1. User submits prompt
2. AI generates output with bugs/errors
3. User asks for fix (burns credit/tokens)
4. AI introduces new bugs while fixing old ones
5. User asks for another fix (burns more credits/tokens)
6. Loop continues until credits exhausted or user abandons
7. User perception: "I'm paying for the AI's incompetence"

### 5.2 Evidence

**Lovable (specific complaints):**
- "I asked for a feature to settle up balances between users. It created a
  'Settle' button but got the math wrong...I had to write the code to fix it
  myself in code mode." --- Superblocks review
- "Spent thousands of dollars on credits just to resolve the same persistent
  issues" --- Trustpilot aggregated
- "Used up all my credits in just four prompts" --- Trustpilot user
- "The AI is programmed to cause issues to keep you spending money" ---
  user perception (not reality, but perception drives behaviour)
- "Credits vanished within a few prompts without ever producing a working
  app" --- Trustpilot user
- G2 reviews: "tons of complaints about wasting credits in back-and-forth
  debugging battles"
- The AI "rewrites whole files rather than small diffs" --- each step is a
  new AI run, each run burns credits

**Bolt:**
- One developer burned 20M tokens trying to fix a single authentication issue
- Token consumption "accelerates during debugging cycles, often doubling
  initial estimates"
- Each prompt burning ~200K tokens described as "not sustainable"

**v0 (Vercel):**
- "Vercel v0 can make mistakes --- and I get billed for every single one" ---
  Medium article title
- Community thread: "Credits are burning way too fast under the new pricing
  model"
- Context tokens (chat history, source files) counted as input, making
  debugging progressively more expensive as conversations lengthen

**Cursor:**
- Some developers saw monthly costs spike from 28 to 500 within three days
  after pricing change
- Single developer used entire monthly allocation in one day
- "The new pricing system is insane" --- community forum post title

**Replit:**
- Agent charges per checkpoint, "even when edits fail or the agent makes
  mistakes"
- User: "Replit/Agent costs me ca. 30 per hour, totalling 360 today"
- The Register: "Replit infuriating customers with surprise cost overruns"

### 5.3 How Competitors Handle It

No major competitor has solved this problem at the pricing level. Approaches:

- **Lovable:** No free fix attempts. Every interaction costs credits.
  Published "12 Ways to Save Credits" guide --- effectively teaching users
  to prompt better rather than fixing the underlying issue.
- **Bolt:** Added token rollover (July 2025) and "autonomous debugging"
  claiming 98% fewer error loops (October 2025 v2). Pricing unchanged.
- **Cursor:** Apologised and refunded, but the credit-based model persists.
- **Replit:** Moved to effort-based pricing, which is more transparent but
  didn't reduce costs.
- **v0:** Introduced Mini/Pro/Max model tiers so users can choose cheaper
  models for iteration.

**Nobody offers "fix attempts don't cost credits."** This is a market gap.

### 5.4 How Cold Anvil Eliminates This

Cold Anvil's architecture eliminates this problem at the infrastructure
level, not the pricing level:

1. **Internal quality pipeline:** Every output goes through generation +
   dual independent review + rewrite if needed. The user never sees the
   broken first draft. The "debugging loop" happens inside the pipeline,
   at 0.003/pass, invisible to the user.

2. **Depth-gated pricing:** There are no credits to burn. A Tier 2 customer
   gets tech design + code generation with unlimited iteration at their
   depth. Fixing issues doesn't cost extra because there's nothing to meter.

3. **Unlimited iteration within depth:** The cost of iteration is
   approximately 0.003 per pass. Even heavy iteration is negligible against
   the subscription price.

This isn't just a pricing advantage --- it's a structural advantage. The
quality pipeline is the product's immune system. The flat-rate depth model
means users never think about cost while working.

**Marketing implication:** "You never pay to fix our mistakes. Your
subscription covers everything --- including iteration. We get it right, or
we keep working until we do." This directly attacks the #1 complaint against
every competitor.

---

## 6. Depth-Gated vs Usage-Gated Analysis

### 6.1 Precedents for Depth-Gating

Beyond software, depth-gating appears in:

- **Professional services:** Free consultation, paid engagement, premium
  retainer. Each tier goes deeper into the problem.
- **Education:** Free course preview, paid full course, premium mentorship.
- **Dating apps:** Free matching, paid messaging, premium "who liked you"
  insights. Tinder, Bumble, Hinge all gate by capability depth.
- **Recruitment:** LinkedIn free profile, Premium Career (see who viewed),
  Recruiter Lite (advanced search + InMail).
- **Analytics:** Google Analytics free (basic), GA360 (advanced attribution,
  BigQuery export). Datadog free monitoring, paid APM + logs.
- **Security:** GitHub free repos, Team/Enterprise for security scanning.
  SonarQube Developer/Enterprise for deeper analysis.

### 6.2 How Depth-Gating Affects Perceived Value

Depth-gating creates a natural "curiosity gap" at each tier boundary. The
user can see the output of the next tier but can't access it. This is
identical to Canva's background remover showing the result with a watermark,
or Grammarly showing premium suggestions inline but locked.

Key advantages:
- **Value is visible before purchase.** "Here's your roadmap preview" is more
  compelling than "you have 47 credits remaining."
- **No anxiety during use.** Users don't worry about cost mid-flow.
- **Natural conversion moments.** Each tier boundary is a conversion point
  embedded in the workflow.
- **Sunk cost works for you.** Users have invested in the conversation and
  the vision document. Walking away feels like leaving value on the table.

### 6.3 Conversion Psychology

The "your free output is ready --- upgrade to see what's next" moment is
powerful because:

1. **Loss aversion:** The user already has something (vision document).
   Upgrading protects that investment. Not upgrading means the vision sits
   unused.
2. **Endowment effect:** Once you've seen your idea articulated as a
   professional vision document, it feels more real and more valuable.
3. **Curiosity gap:** Showing the roadmap preview creates "I need to know
   what's in there" motivation.
4. **Reciprocity:** The free tier delivered real value. The user feels the
   product "earned" their money.

Canva's conversion data supports this: background remover showing the result
with a watermark drives "a significant portion of Canva's Pro conversions."
Cold Anvil's tier boundaries function identically.

### 6.4 Depth-Gating and Churn

Depth-gating should reduce churn compared to usage-gating because:

- **No "I ran out" moment.** Credit depletion is a natural churn trigger.
  Depth-gated users don't experience depletion.
- **Project continuity.** A Tier 2 customer with an active project has more
  reason to stay than a credit-based user who finished their credits.
- **Accumulating context.** As the platform remembers project context, value
  compounds. Leaving means losing that context.

Industry data supports this: AI-native SaaS shows median GRR of 40% (Sept
2025). Budget-tier AI tools: just 23% GRR. Higher-ARPU subscriptions with
clear value tiers show significantly better retention.

### 6.5 Compatibility with High-Volume Users

Does depth-gating need a usage component? Analysis:

- **Tier 1 (29/mo):** Depth = vision + roadmap + content. One active project.
  A user could theoretically iterate endlessly, but iteration within these
  stages is conversational (cheap) plus generation (0.003/pass). Even 100
  iterations/month = 0.30 in compute. No usage cap needed.

- **Tier 2 (49/mo):** Depth adds tech design + code generation. Code gen is
  the heaviest stage (~8-10 min GPU per cascade). Heavy user scenario: 10
  full cascades/month = ~100 min GPU = ~1.67 GPU hours. At 2x B200 with
  240 GPU-hours/month capacity, this is 0.7% of capacity per heavy user.
  No usage cap needed.

- **Tier 3 (200/mo):** Adds assembly + verification. Extra GPU cost is
  minimal (assembly is mostly file ops). Heavy user scenario: 20 full
  cascades/month = ~240 min = 4 GPU hours = 1.7% of capacity. At 200/mo
  revenue, this is well within margin. No usage cap needed.

**Conclusion:** With self-hosted infrastructure at these cost levels,
depth-gating does not need a usage component. The economics work even
for heavy users. This is a direct consequence of the 300x cost advantage
over API-based competitors.

---

## 7. Cost Structure Modelling for Cold Anvil

### 7.1 Heavy User Scenario

Assumptions:
- Cost per full cascade (3-pass, all stages): ~0.003 (self-hosted B200)
- Conversational Q&A (35B model): ~0.001 per exchange
- Tier 3 user running maximum cascades

| Usage level | Cascades/month | Q&A exchanges | Compute cost | Revenue | Margin |
|-------------|---------------|---------------|-------------|---------|--------|
| Light (typical) | 2 | 50 | 0.06 | 200 | 99.97% |
| Moderate | 10 | 200 | 0.23 | 200 | 99.88% |
| Heavy | 30 | 500 | 0.59 | 200 | 99.70% |
| Extreme | 100 | 2000 | 2.30 | 200 | 98.85% |
| Abusive | 500 | 10000 | 11.50 | 200 | 94.25% |

Even an "abusive" user running 500 cascades/month (16+ per day, every day)
only costs 11.50 in compute. The margin holds.

For comparison, a Lovable user spending 25/mo and using 100 credits on a
Claude Sonnet API backend might cost Lovable 5-15 in API fees per user.
Cold Anvil's cost per equivalent output is 100-300x lower.

### 7.2 Breakeven Analysis by Tier

Fixed costs: 1,296/month (2x B200 at 8hrs/day + hosting/domains/support)

| Tier | Price | Compute cost/user (typical) | Contribution margin | Users to break even (fixed costs only) |
|------|-------|---------------------------|--------------------|-----------------------------------------|
| Free | 0 | 0.01 | -0.01 | N/A (cost centre) |
| Tier 1 (29) | 29 | 0.02 | 28.11 (after Stripe 3%) | 47 |
| Tier 2 (49) | 49 | 0.03 | 47.50 | 28 |
| Tier 3 (200) | 200 | 0.06 | 193.94 | 7 |

These numbers are almost entirely driven by fixed infrastructure cost, not
variable compute. The marginal cost of serving one more customer is
essentially zero until GPU capacity is saturated.

### 7.3 When Does Flat-Rate Become Unsustainable?

**It doesn't --- not at Cold Anvil's cost structure.**

The constraint is not cost-per-user but concurrent GPU capacity. At 2x B200
with 8 hrs/day (240 GPU-hours/month):

| Concurrent users | Pipeline time/user | Degradation | Action needed |
|-----------------|-------------------|-------------|---------------|
| 1-30 | Uncontested | None | None |
| 30-50 | +50-100% | Noticeable | Monitor |
| 50-100 | +100-200% | Significant | Add 2x B200 |
| 100+ | Queue-based | Poor UX | Scale to 4x B200 |

The scale trigger is throughput, not cost. Adding 2x B200 increases fixed
costs from 1,296 to ~2,376/month but doubles capacity. At the 50/35/15 tier
mix with 200 customers generating 12,330/month revenue, this is trivially
affordable.

**Key insight:** For API-dependent competitors, heavy users are an
existential cost threat. For Cold Anvil, heavy users are free within the
existing infrastructure capacity. The cost disadvantage only emerges if you
need more GPUs, and that only happens with more paying customers to fund
them. The economics are self-balancing.

### 7.4 Industry Usage Distribution

Research indicates:
- 20% of Americans are "heavy" AI tool users (10+ times/month)
- 91% of AI users stick with one primary tool
- Power law distribution: small % of users generate majority of usage
- Midjourney basic users: ~150 generations/month (2023 data)

For a creation tool like Cold Anvil, natural ceilings exist:
- Users don't generate 5-page websites for fun. Each cascade represents
  a real project or iteration on a real project.
- One active project per subscription limits scope naturally.
- The conversation + review flow takes 25-45 minutes per full cascade.
  Even a dedicated user would struggle to run more than 5-10/day.

This aligns with the modelling above: even "extreme" usage (100
cascades/month) costs under 2.30 in compute.

---

## 8. Early-Stage Pricing Strategy

### 8.1 Pricing for Trust with No Brand Recognition

Key principles from bootstrapped SaaS research:

1. **Show prices publicly.** Never hide behind "contact us." Young buyers
   expect to see prices immediately and evaluate independently. Hiding
   prices signals shame or aggressive sales tactics.

2. **Build in public.** Sharing the journey generates a compounding audience
   that becomes customers, advocates, and feedback sources. This is
   especially relevant for Cold Anvil where the founder has YouTube channels.

3. **Start with freemium, not free trial.** Freemium achieves 13-16% visitor
   conversion (sign-up, not purchase) --- nearly double trial rates. The
   reduced psychological barrier is critical when nobody knows your brand.

4. **Price for early value, iterate later.** First price won't be perfect.
   Treat it as an experiment. Survey churned customers for price objections.

5. **Don't discount too aggressively.** Deep discounts signal low value.
   Better: offer genuine value at a fair price, and let the free tier
   demonstrate quality.

### 8.2 Free Tier Strategy

Cold Anvil's free tier (Steps 1-3: idea refinement + vision document) should
function as a **product in its own right, not a demo.**

Conversion benchmarks:
- Average freemium self-serve: 3-5% (good), 6-8% (great)
- Developer-focused products: median 5% (half of non-developer products)
- Cold Anvil targets non-developers: expect 3-5% initially
- Freemium users convert after 90-180 days on average

The free tier's strength is that it's genuinely useful AND creates investment:
- The conversation is personal (the user shared their idea)
- The vision document is tangible (they can show it to people)
- The roadmap preview is visible (curiosity gap)
- Walking away means leaving their articulated vision behind

**Recommendation:** Don't time-limit the free tier. Let the vision document
persist. Users who return weeks later to upgrade are higher-intent than those
who upgrade immediately.

### 8.3 Beta/Early Adopter Pricing

Options and evidence:

**Founding member pricing (recommended):**
- 50% lifetime discount for first 50 customers (locked at 15/25/100)
- Creates urgency and exclusivity
- Founders report this as effective validation + capital strategy
- "Founding plan" framing is common in bootstrapped SaaS
- Revenue impact: 50 founders at blended 50/mo = 2,500 MRR vs 5,000 at
  full price. Acceptable for validation.
- Risk: sets anchor for future pricing. Mitigate: make founding status
  visible, communicate that standard pricing is higher.

**Lifetime deal (not recommended for Cold Anvil):**
- Typical LTD: 49-199 for lifetime access
- Generates immediate cash but creates a permanently unprofitable customer
  segment
- LTD customers often become the loudest complainers because they feel
  entitled to perpetual feature additions
- Particularly dangerous for GPU-intensive products where usage has ongoing
  cost
- Better suited to products with near-zero marginal cost

**Money-back guarantee (recommended):**
- Durable offers 30-day money-back
- Wix offers 14-day money-back on all premium plans
- Research: refund policies raise conversion rates, build trust, shorten
  sales cycles
- For Cold Anvil: 30-day money-back guarantee on all paid tiers
- Risk is minimal: if the product delivers a vision + roadmap + content
  in the first session, users who pay have already received value. Refund
  rate should be low.

### 8.4 Pricing Transparency

Cold Anvil should be transparent about:
- **What each tier includes** (specific deliverables, not vague features)
- **The pricing itself** (public, no hidden fees)
- **What makes it different** ("unlimited iteration," "no credits,"
  "quality-guaranteed output")

Cold Anvil should NOT be transparent about:
- **How the pipeline works** (proprietary competitive advantage)
- **Cost structure** (0.003/artifact is a competitive advantage that should
  not be exposed to competitors)
- **Model details** (which models, how many reviewers, rubric structure)

---

## 9. Add-On Revenue Opportunities

### 9.1 Analysis of Add-On Models Across AI Products

| Add-on type | Examples | Revenue potential | Cold Anvil fit | When to launch |
|------------|---------|-------------------|---------------|----------------|
| Additional active projects | Figma (per editor), Notion (per member) | Medium (10-15/mo per project) | Strong --- natural extension | Post-MVP (6 months) |
| One-off cascade (no subscription) | N/A in market | Low-medium | Possible but cannibalises subscriptions | Not recommended |
| Priority queue / faster generation | Midjourney (fast vs Relax), RunwayML (priority) | Medium | Moderate --- only matters under load | Post-scale (100+ users) |
| Enhanced verification passes | N/A direct comparison | Low | Weak --- all tiers should include full quality | Never (quality is the brand) |
| Business intelligence add-on | N/A direct comparison | Medium-high (enterprise feature) | Moderate | Phase 5+ |
| Data sovereignty / self-hosted | Enterprise standard | High (enterprise pricing) | Strong but late-stage | Phase 5+ |
| White-label / API access | ElevenLabs API, RunwayML API | High | Strong but requires engineering | Phase 5+ |
| Deployment partnerships | Cold Anvil Tier 3 concept | High (pure margin) | Strong --- already in business plan | Post-MVP |
| Annual subscription discount | ElevenLabs (20%), Midjourney (20%), Wix (annual billing) | Improves cash flow | Strong for Tier 3 | Launch |
| Team workspaces | Figma, Notion, Linear | High | Strong | Post-MVP |

### 9.2 Recommendations

**Launch add-ons (MVP):**
- Annual billing for Tier 3 (2,000/year = 17% discount) --- already planned
- Annual billing for Tier 2 (490/year = ~17% discount) --- improves cash flow

**Near-term add-ons (3-6 months post-launch):**
- Additional active projects at 15/month per project
- Deployment partnership revenue share (Cloudflare, Vercel, Railway)

**Medium-term add-ons (6-12 months):**
- Team workspaces at 100/user/month
- Priority processing during peak load

**Long-term add-ons (12+ months):**
- API access (credit-based, for developers only)
- White-label partnerships
- Data sovereignty options

**Never add:**
- Per-cascade charges (cannibalises the "unlimited iteration" value prop)
- Quality tiers (degrading lower tiers undermines the brand)
- Credit/token system for any consumer-facing product

---

## 10. Overall Recommendation

### 10.1 Keep the Depth-Gated Model

The current pricing structure is sound. The research confirms:

1. **Credit-based pricing is the dominant model and the dominant source of
   user rage.** Cold Anvil is right to avoid it.
2. **Flat-rate subscription is what users want.** Cold Anvil's cost structure
   makes it sustainable where competitors can't.
3. **Depth-gating has proven precedent** and creates natural conversion
   moments.
4. **The "paying to fix AI mistakes" problem is Cold Anvil's biggest
   competitive advantage.** The internal quality pipeline + flat-rate pricing
   eliminates it structurally.

### 10.2 Specific Pricing Adjustments

Based on research, consider these changes to the current plan:

**Tier 2 pricing: 49/month (changed from the original 99)**

The business plan already has this at 49, which is correct. This positions
Tier 2 as the "no-brainer" middle option (anchoring effect). At 49/mo vs
200/mo for Tier 3, the 4x price jump creates clear differentiation: Tier 2
is "I want the code," Tier 3 is "I want it deployed and maintained."

**Free tier: Keep as-is**

The free tier (vision document) is strong. It delivers real value, creates
investment through conversation, and shows the roadmap preview as a
contextual upsell. Don't weaken it.

**Tier 1: Consider 19/month**

Research shows:
- Decision paralysis above 5 tiers, but 3 tiers is optimal
- Low-ARPU products (<25) see higher churn (6.1%) but also lower friction
- Tier 1's role is conversion, not profit
- At 19/mo, the step from free to paid is smaller (reduces friction)
- The step from 19 to 49 (Tier 2) is 2.5x, which is standard
- The step from 49 to 200 (Tier 3) is 4x, which positions Tier 3 as premium

Counter-argument: At 19/mo, breakeven requires 69 Tier 1 customers vs 47 at
29/mo. If most Tier 1 customers convert to Tier 2/3, the lower entry price
may generate more total revenue. Test this.

**Annual pricing: Offer for all tiers at launch**

Research shows annual billing improves cash flow and reduces churn. Standard
discount: 17-20%.
- Tier 1: 229/year (19/mo equivalent)
- Tier 2: 490/year (41/mo equivalent, 17% discount)
- Tier 3: 2,000/year (167/mo equivalent, 17% discount) --- already planned

### 10.3 Messaging Priorities

Based on user psychology research, the messaging should hit these points:

1. **"No credits. No tokens. No surprises."** --- Directly contrasts with
   every competitor.
2. **"You never pay to fix our mistakes."** --- Attacks the #1 complaint.
3. **"See what's possible before you pay."** --- Free tier as demonstration.
4. **"A freelance developer would charge 2,000-5,000. Cold Anvil does it
   for 49/month."** --- Anchoring against hiring, not against API costs.
5. **"30-day money-back guarantee."** --- Reduces risk for unknown brand.

### 10.4 Risks to Monitor

1. **Free tier abuse:** Rate limiting and email verification should handle
   this, but monitor closely. If free tier conversion drops below 2%,
   the free tier may be too generous.
2. **Tier 1 stickiness:** If most Tier 1 users stay at Tier 1 and don't
   convert to Tier 2/3, the tier may be too valuable. Monitor conversion
   rates between tiers.
3. **Churn at scale:** AI-native SaaS churn is horrific (40% median GRR).
   The depth model should be better, but plan for high churn initially and
   optimise retention before scaling acquisition.
4. **Competitor pricing drops:** If API costs continue falling, competitors
   may be able to offer flat-rate or deeper bundles. Cold Anvil's advantage
   is structural (self-hosted) but not permanent if APIs become cheap enough.
5. **Heavy user concentration risk:** If a few Tier 3 users represent most
   revenue, losing them is dangerous. Diversify the customer base early.

---

## 11. Sources

### AI Pricing Models and Taxonomy
- [How to Price AI Products: The Complete Guide for PMs (2026)](https://www.news.aakashg.com/p/how-to-price-ai-products)
- [The New Economics of AI Pricing: Models That Actually Work](https://pilot.com/blog/ai-pricing-economics-2026)
- [The 2026 Guide to SaaS, AI, and Agentic Pricing Models](https://www.getmonetizely.com/blogs/the-2026-guide-to-saas-ai-and-agentic-pricing-models)
- [Hybrid Pricing Models: Why AI Companies Are Combining Usage, Credits, and Subscriptions](https://www.runonatlas.com/blog-posts/hybrid-pricing-models-why-ai-companies-are-combining-usage-credits-and-subscriptions)
- [AI Pricing Models: How to Price AI Products and APIs in 2026](https://dodopayments.com/blogs/ai-pricing-models)
- [6 Proven Pricing Models for AI SaaS](https://getlago.com/blog/6-proven-pricing-models-for-ai-saas)
- [Pricing Strategies for AI Companies](https://stripe.com/resources/more/pricing-strategies-for-ai-companies)

### Competitor Pricing and User Complaints
- [My Lovable.dev Review in 2026: Worth It or Credit Trap?](https://www.superblocks.com/blog/lovable-dev-review)
- [Lovable Credits Explained: 12 Ways to Save Them](https://www.buildwithlovable.xyz/blog/lovable-credits-explained-how-the-system-works-and-12-ways-to-stop-burning-them)
- [Lovable Trustpilot Reviews](https://www.trustpilot.com/review/lovable.dev)
- [Bolt.new Review 2025](https://trickle.so/blog/bolt-new-review)
- [Bolt Pricing 2026: Plans, Tokens and Costs](https://www.nocode.mba/articles/bolt-pricing-2026)
- [Bolt.new Review 2026: Is Code Amnesia Fixed?](https://myaiverdict.com/bolt-new-review/)
- [Cursor Faces Backlash Over Pro Plan Pricing Shift](https://www.fintechweekly.com/magazine/articles/cursor-pricing-change-user-backlash-refund)
- [Cursor Apologises for Unclear Pricing Changes](https://techcrunch.com/2025/07/07/cursor-apologizes-for-unclear-pricing-changes-that-upset-users/)
- [Cursor's Pricing Disaster](https://www.wearefounders.uk/cursors-pricing-disaster-how-a-routine-update-turned-into-a-developer-exodus/)
- [v0 Updated Pricing](https://vercel.com/blog/updated-v0-pricing)
- [Vercel v0 Can Make Mistakes and I Get Billed](https://medium.com/@baytbyte/why-im-sadly-leaving-vercel-and-v0-when-all-in-one-turns-into-all-for-money-368c3a976df3)
- [Replit Effort-Based Pricing](https://blog.replit.com/effort-based-pricing)
- [Replit Infuriating Customers with Surprise Cost Overruns](https://www.theregister.com/2025/09/18/replit_agent3_pricing/)
- [Replit Agent Costs Me 30 Per Hour](https://replit.discourse.group/t/replit-agent-costs-me-ca-30-per-hour-totaling-360-today-omg/7401)
- [Durable AI Website Builder Review 2026](https://max-productive.ai/ai-tools/durable/)
- [Wix Pricing Plans 2026](https://www.websitebuilderexpert.com/website-builders/wix-pricing/)

### Revenue and Valuation Data
- [Cursor Revenue: How the 29B AI Coding Tool Makes Money](https://aifundingtracker.com/cursor-revenue-valuation/)
- [Cursor Hit 1B ARR in 24 Months](https://www.saastr.com/cursor-hit-1b-arr-in-17-months-the-fastest-b2b-to-scale-ever-and-its-not-even-close/)
- [Lovable Revenue: 200M ARR in 12 Months](https://aifundingtracker.com/lovable-vibe-coding-revenue/)
- [Lovable Says It Added 100M in Revenue Last Month Alone](https://techcrunch.com/2026/03/11/lovable-says-it-added-100m-in-revenue-last-month-alone-with-just-146-employees/)
- [Midjourney Statistics 2026](https://www.demandsage.com/midjourney-statistics/)

### User Psychology and Pricing Research
- [Credits: The Bridge Between AI Uncertainty and Value Clarity](https://impactpricing.com/blog/credits-the-bridge-between-ai-uncertainty-and-value-clarity/)
- [My Beef with AI Credit Pricing - Elena Verna](https://www.elenaverna.com/p/i-hate-ai-credits-pricing)
- [The Rise of AI Credits: Why Cost-Plus Credit Models Work Until They Don't](https://metronome.com/blog/the-rise-of-ai-credits-why-cost-plus-credit-models-work-until-they-dont)
- [AI Pricing in Practice: 2025 Field Report](https://metronome.com/blog/ai-pricing-in-practice-2025-field-report-from-leading-saas-teams)
- [Loss Aversion in Pricing](https://www.getmonetizely.com/articles/loss-aversion-in-pricing-why-customers-fear-price-increases)
- [Pricing Psychology 2.0: Advanced Behavioral Economics for SaaS](https://www.getmonetizely.com/articles/pricing-psychology-20-advanced-behavioral-economics-for-saas)
- [SaaS Pricing Psychology](https://thegood.com/insights/saas-pricing/)

### Conversion and Churn Benchmarks
- [What Is a Good Free-to-Paid Conversion (Lenny's Newsletter)](https://www.lennysnewsletter.com/p/what-is-a-good-free-to-paid-conversion)
- [Freemium to Premium: Optimising Conversion Rates](https://crowd-matter.unicornplatform.page/blog/freemium-to-premium-optimizing-conversion-rates-without-alienating-users-in-2025/)
- [How Did Canva Pro Convert Millions](https://www.getmonetizely.com/articles/how-did-canva-pro-convert-millions-of-free-users-to-paying-customers)
- [SaaS Churn Rate Benchmarks 2025](https://www.agilegrowthlabs.com/blog/saas-churn-rate-benchmarks-2025/)
- [The SaaS Retention Report: The AI Churn Wave](https://chartmogul.com/reports/saas-retention-the-ai-churn-wave/)
- [Average Churn Rate by Industry 2025](https://customergauge.com/blog/average-churn-rate-by-industry)

### Feature Gating and Depth Pricing
- [A Study in Feature Gating](https://alexdebecker.substack.com/p/a-study-in-feature-gating)
- [Developer Tool Pricing Strategy: Technical Feature Gating](https://www.getmonetizely.com/articles/developer-tool-pricing-strategy-how-to-gate-technical-features-and-structure-code-quality-tool-tiers)
- [Figma Pricing Plans](https://www.figma.com/pricing/)
- [ElevenLabs Pricing 2026](https://bigvu.tv/blog/elevenlabs-pricing-2026-plans-credits-commercial-rights-api-costs/)
- [Midjourney Plans Comparison](https://docs.midjourney.com/hc/en-us/articles/27870484040333-Comparing-Midjourney-Plans)

### Outcome-Based Pricing
- [Why Outcome-Based Pricing Matters for AI Products](https://www.runonatlas.com/blog-posts/why-outcome-based-pricing-matters-for-ai-products)
- [Outcome-Based Pricing for AI Agents (Sierra)](https://sierra.ai/blog/outcome-based-pricing-for-ai-agents)
- [AI Is Driving a Shift Towards Outcome-Based Pricing (a16z)](https://a16z.com/newsletter/december-2024-enterprise-newsletter-ai-is-driving-a-shift-towards-outcome-based-pricing/)

### Early-Stage and Bootstrapped Pricing
- [Bootstrapped SaaS Guide: From Zero to Profitable](https://dodopayments.com/blogs/bootstrapped-saas-guide)
- [SaaS Pricing Strategies for Early-Stage Founders](https://www.speedinvest.com/knowledge/saas-pricing-strategies)
- [SaaS Growth Strategies 2026: Bootstrapper's Guide](https://oneup.today/saas-growth-strategies)
- [Lifetime Deals: Yes or No? (Indie Hackers)](https://www.indiehackers.com/post/lifetime-deals-ltds-yes-or-no-210e5a7b1a)

### Self-Hosted Cost Analysis
- [Self-Hosting AI Models vs API Pricing: Complete Cost Analysis 2026](https://www.aipricingmaster.com/blog/self-hosting-ai-models-cost-vs-api)
- [OpenAI or DIY? Unveiling the True Cost of Self-Hosting LLMs](https://venturebeat.com/ai/openai-or-diy-unveiling-the-true-cost-of-self-hosting-llms/)
- [When Self-Hosting AI Models Makes Financial Sense](https://medium.com/@thomasnahon/when-self-hosting-ai-models-makes-financial-sense-3d7cbe11b22c)

### Industry Benchmarks
- [SaaS Pricing Benchmarks 2025](https://www.getmonetizely.com/articles/saas-pricing-benchmarks-2025-how-do-your-monetization-metrics-stack-up)
- [OpenView State of Usage-Based Pricing](https://openviewpartners.com/blog/state-of-usage-based-pricing/)
- [2025 SaaS Benchmarks Report](https://www.highalpha.com/saas-benchmarks)
- [Claude Users Hit a New Reality of AI Rationing (PYMNTS)](https://www.pymnts.com/artificial-intelligence-2/2026/ai-usage-limits-are-becoming-the-new-reality-for-consumers/)
- [AI Usage Statistics 2025 (SparkToro)](https://sparktoro.com/blog/new-research-20-of-americans-use-ai-tools-10x-month-but-growth-is-slowing-and-traditional-search-hasnt-dipped/)
- [Paddle/ProfitWell: Which Tactics Increase Willingness to Pay](https://www.paddle.com/studios/shows/profitwell-report/increase-willingness-to-pay)
