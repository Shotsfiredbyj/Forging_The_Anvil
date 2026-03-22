# Cold Anvil — Business Plan

**Compiled:** 22 March 2026  
**Status:** V1 — MVP focus

---

## What This Is

Cold Anvil (coldanvil.com / coldanvil.ai) — product engineering in a box. Users describe their idea, our pipeline asks clarifying questions, then delivers a validated product spec with actionable next steps.

**Tagline:** Product development in a box  
**Vision:** Whatever you imagine, we'll forge it into reality

---

## Target Customer

**Primary (MVP):** Solo founders needing validated product specs and roadmaps

**Secondary (Phase 2):** Small teams (2-10 people) — team pricing and collaboration features in roadmap

---

## Pricing Model

### Tiers

**Free — "Try it"**  
1 idea, full pipeline, email-gated delivery

**29 dollars/month — "Got an idea"**  
- 2 ideas per month
- 3 refinements per idea

**49 dollars/month — "Solo founder"**  
- 5 ideas per month
- 10 refinements per idea

**149 dollars/month — Solo (MVP)**  
- Unlimited ideas + refinements
- Single user

### Annual Pricing

**329 dollars/year — "Got an idea"** (5 percent off, 24 dollars per month equivalent)

**529 dollars/year — "Solo founder"** (10 percent off, 44 dollars per month equivalent)

**1599 dollars/year — Solo** (10 percent off, 133 dollars per month equivalent)

### Future: Teams (2-10 people)

**100 dollars per user/month**  
Includes: repo sharing, org management, team workspaces, shared rubrics, admin console, usage analytics

### Payment Flow

1. User enters email (OTP verification later)
2. User submits idea
3. Pipeline asks clarifying questions while processing
4. User gets initial output (vision document)
5. Offer to lock it in — verify email with OTP to receive
6. Subscription required to unlock additional ideas or refinements

### MVP Constraints

- Subscription only
- No usage-based tiers, no credits, no API access
- Future API product may use credit-based pricing

### Anti-Abuse Controls (MVP)

- Unique email per account required
- OTP verification before output delivery
- IP/device fingerprinting for 149 dollar tier monitoring
- Terms of service: no account sharing, single user per subscription
- Rate limiting on idea submissions to prevent automated abuse
- Manual review flagged for suspicious patterns

**Teams note:** Small teams can use individual subscriptions in MVP. Team pricing and shared workspaces in roadmap.

---

## Compute Infrastructure

### Chosen Architecture

**2x B200** (192 GB each, NVLink pooled = 384 GB)  
**Provider:** Packet.ai or RunPod  
**Cost at 8hrs/day:** 1,080 dollars/month

### Why This Choice

- Cheapest rental at low utilisation
- 8-10x aggregate throughput vs single Pro 6000
- Pooled VRAM means no single-card constraints
- 2 cards to manage = simplest infrastructure
- Scale path: add 2 more cards when demand requires

### Alternative

6x Pro 6000 via Vast.ai at 1,440 dollars/month (slower, more cards to manage)

### Pipeline Workload

Every output runs through a three-phase review cascade:

1. **Generation** — qwen3.5:35b or gpt-oss:20b, parallel across fleet
2. **Review** — gemma3:27b-it-fp16 + mistral-small3.2:24b (dual independent reviewers)
3. **Rewrite** — qwen3.5:122b (Q8), queue-based processing

Every version — first draft and every rewrite — gets two independent reviews before pass/fail.

### Scale Triggers

- Add 4th B200 when sustained loads exceed 30 minutes per output
- 50 concurrent users: 15-20 minutes compute time
- 100 concurrent users: 20-30 minutes (scale needed)

### Data Sovereignty

All inference self-hosted. No inference APIs, no third-party data processing. Production fleet separate from Arnor dev/staging environment.

---

## Cost Math

### Fixed Costs Per Month

- 2x B200 (8hrs/day): 1,080 dollars
- Hosting, domains, support: 300 dollars
- **Total fixed: 1,400 dollars**

### Break-Even Analysis

- Break even at 50 customers: 1,400 dollars / 50 = 28 dollars per customer
- At 49 dollars/month price point: 21 dollars profit per customer
- At 100 customers: 2,100 dollars profit per month

### Year One Revenue Target

**200 customers by end of year one**

At 49 dollars/month average: 9,800 dollars MRR, 117,600 dollars ARR

**Baseline:** One solo founder hit 5,400 dollars MRR in 5 months with 69 customers. With content-led distribution, 200 customers is achievable.

**Trajectory:**
- Launch: 50 customers (conservative first quarter)
- Month 6: 100 customers
- Month 12: 200 customers

### Mix Assumption

Revenue math assumes most customers land in the 49 dollars tier. If mix shifts toward 29 dollars or 149 dollars, total ARR adjusts accordingly.

---

## Competitive Moat

### Proprietary Infrastructure (Opaque to Users)

1. **Three-phase review cascade** — We don't disclose how many reviewers, which models, or the baseline rubrics. Users get quality, not the recipe.

2. **Model family expertise** — Tested generator/reviewer pairings for code and creative work. Years of experimentation on what families work together.

3. **Secret forge packs** — Internal format for prompting, gates, rubrics. The output is public, the compilation is not.

4. **User-specific adaptation** — Preferences encoded over time ("too formal," "prefer fewer options"). They don't notice until they try to leave.

### Defensible Positioning

5. **Product thinking at scale** — 20 years judgment embedded in prompts and review criteria. Competitors can copy the format, not the expertise.

### What We Don't Rely On

- Fleet efficiency — becomes commodity once we're on B200s
- Config pack spec — open source the format (user-ownership), keep the packs proprietary
- Price — competitors with cloud credits can under-sell, can't out-value

---

## Time to Value Target

**Our processing time: 15-20 minutes at 50 concurrent users**

- Queue + generation: 3-5 min
- Dual independent review: 5-8 min
- Rewrite (if needed): 2-5 min
- Re-review + validation: 2-3 min
- Packaging + delivery: 1-2 min

**Per-user compute under load:**

At 50 concurrent users (~35 GPU tasks staggered across phases), B200s process batched requests in parallel. The 122B rewrite tasks queue here — that's the bottleneck.

- Uncontested (launch week): 10-12 minutes
- At 50 users: 15-20 minutes
- At 100 users: 20-30 minutes (need 4th B200)

**User-facing time: Unbounded + our compute time**

Users take as long as they need on Q&A. No artificial time limits. We never trade depth of output for speed — 15 minutes is better than 5 minutes of shallow work.

**Scale trigger:** Add 2x B200 when sustained loads exceed 30 minutes per output.

---

## Go-to-Market

### Phase 1 (0-6 months): Visual-first, paid reach

**Primary:** Instagram ads — visual storytelling showing the transformation. Before/after outputs, rapid iteration demos. Target: solo founders, aspiring creators.

**Secondary:** YouTube — build in public, documented launch. Content becomes ad creative.

**Tertiary:** Influencer collabs — micro-influencers in indie hacker/side project space, revenue share (15-20 percent first 3 months).

### Phase 2 (6-12 months): Community and partnerships

- Cold outreach to product communities (Indie Hackers, Product Hunt, Hacker News "show HN")
- Referral program: free month for both referrer and referee
- Partner with bootcamps, coding schools, creator economy platforms

### Not Yet

- Open source config pack spec — keep proprietary
- SEO/content marketing — too slow for early traction
- Product Hunt launch — save for when we hit 50-100 customers

---

## Customer Journey (Sign-Up to First Output)

**Our target: 20-40 minutes total, depending on user Q&A speed**

1. **Minutes 0-5:** User enters email, submits idea pitch
2. **Minutes 5-10:** Pipeline asks clarifying questions (3-4 questions) while preparing draft spec
3. **Minutes 10-20:** User answers questions, reviews initial output
4. **Minutes 20-40:** Offer to lock it in with email OTP, subscription upsell for more ideas

**Key:** Parallel processing during Q&A. While we ask questions, backend prepares initial spec. User gets value immediately after answering.

---

## MVP Definition

**What's in scope:**

- Free tier (1 idea, email-gated)
- Three paid tiers (29, 49, 149 dollars/month)
- Idea-to-output pipeline (vision docs, specs, roadmaps)
- Email OTP verification
- Basic subscription management
- IP/device monitoring for abuse prevention

**What's out of scope (post-MVP):**

- Team workspaces and collaboration
- Org management and admin console
- API access and credits
- Config pack marketplace
- Multi-user per account support

---

## Next Steps

1. Document the idea-to-output flow in detail (user journeys, wireframes)
2. Write pricing page copy (tiers, FAQs, value prop)
3. Map email OTP + upsell flow (conversion optimization)
4. Document the pipeline internally (for dev team reference)

---

## Open Questions (Track Separately)

- Revenue target validation for solo-founder SaaS
- Customer acquisition cost estimates for Instagram vs YouTube vs influencer
- Churn assumptions for each tier
- Conversion rate targets (free-to-paid, 29-to-49, 49-to-149)

---

*Document in progress. Update as decisions are made and data comes in.*
