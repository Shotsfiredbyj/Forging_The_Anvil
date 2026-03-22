# Cold Anvil — Business Plan Foundations

Compiled: 22 March 2026

---

## Positioning

**Headline:** Product development in a box

**Tagline:** Whatever you imagine, we'll forge it into reality

**What we do:** AI-powered product engineering from idea to roadmap. Users describe their idea, the pipeline asks clarifying questions, then delivers a validated product spec with actionable next steps.

---

## Target Customer

Primary: Solo founders (MVP)

Secondary: Small teams (2-10 people) - phase 2

---

## Pricing Model

**Structure:** Subscription tiers

**Tiers:**

Free - "Try it" - 1 idea, full pipeline, email-gated delivery

$29/month - "Got an idea" - 2 ideas per month, 3 refinements per idea

$49/month - "Solo founder" - 5 ideas per month, 10 refinements per idea

$149/month - Solo (MVP) - unlimited ideas + refinements

**Future (post-MVP):**

$100/user/month - Teams (2-10) - repo sharing, org management, team workspaces, shared rubrics, admin console, usage analytics

**Annual pricing (save):**

$329/year - "Got an idea" (5 percent off = 24 dollars per month equivalent)

$529/year - "Solo founder" (10 percent off = 44 dollars per month equivalent)

$1599/year - Solo (10 percent off = 133 dollars per month equivalent)

**Payment flow:**

1. User enters email (sent OTP later for verification)
2. User submits idea
3. Pipeline asks clarifying questions while processing
4. User gets initial output (vision document)
5. Offer to lock it in — verify email with OTP to receive
6. Subscription required to unlock additional ideas or refinements

**MVP: Subscription only.** No usage-based tiers, no credits, no API access. Future API product may use credit-based pricing.

**Anti-abuse controls (MVP):**

- Unique email per account required
- OTP verification before output delivery
- IP/device fingerprinting for 149 dollar tier monitoring
- Terms of service: no account sharing, single user per subscription
- Rate limiting on idea submissions to prevent automated abuse
- Manual review flagged for suspicious patterns (shared emails, identical usage across IPs)

**Teams note:** Small teams (2-10) can use individual subscriptions in MVP. Team pricing and shared workspaces in roadmap.

---

## Compute Infrastructure

**Chosen architecture:** 2x B200 (192 GB each, NVLink pooled = 384 GB)

**Provider:** Packet.ai or RunPod

**Cost at 8hrs/day:** $1,080/month

**Why this choice:**

- Cheapest rental at low utilisation
- ~8-10x aggregate throughput vs single Pro 6000
- Pooled VRAM means no single-card constraints
- 2 cards to manage = simplest infrastructure
- Scale path: add 2 more cards when demand requires

**Alternative:** 6x Pro 6000 via Vast.ai at $1,440/month (slower, more cards to manage)

---

## Cost Math

Fixed costs per month:

2x B200 (8hrs/day): $1,080
Hosting, domains, support: $300
Total fixed: $1,400

Break even at 50 customers: $1,400 / 50 = $28 per customer
At $49/month price point: $21 profit per customer
At 100 customers: $2,100 profit per month

---

## Competitive Moat

**Proprietary infrastructure (opaque to users):**

1. Three-phase review cascade — we don't disclose how many reviewers, which models, or the baseline rubrics. Users get quality, not the recipe.

2. Model family expertise — tested generator/reviewer pairings for code and creative work. Years of experimentation on what families work together.

3. Secret forge packs — internal format for prompting, gates, rubrics. The output is public, the compilation is not.

4. User-specific adaptation — preferences encoded over time ("too formal," "prefer fewer options"). They don't notice until they try to leave.

**Defensible positioning:**

5. Product thinking at scale — 20 years judgment embedded in prompts and review criteria. Competitors can copy the format, not the expertise.

**What we don't rely on as moat:**

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

Uncontested (launch week): 10-12 minutes
At 50 users: 15-20 minutes
At 100 users: 20-30 minutes (need 4th B200)

**User-facing time: Unbounded + our compute time**

Users take as long as they need on Q&A. No artificial time limits. We never trade depth of output for speed — 15 minutes is better than 5 minutes of shallow work.

**Scale trigger:** Add 2x B200 when sustained loads exceed 30 minutes per output.

---

## Go-to-Market

**Phase 1 (0-6 months): Visual-first, paid reach**

Primary: Instagram ads — visual storytelling showing the transformation. Before/after outputs, rapid iteration demos. Target: solo founders, aspiring creators.

Secondary: YouTube — build in public, documented launch. Content becomes ad creative.

Tertiary: Influencer collabs — micro-influencers in indie hacker/side project space, revenue share (15-20 percent first 3 months).

**Phase 2 (6-12 months): Community and partnerships**

Cold outreach to product communities (Indie Hackers, Product Hunt, Hacker News "show HN")
Referral program: free month for both referrer and referee
Partner with bootcamps, coding schools, creator economy platforms

**Not yet:**

- Open source config pack spec — keep proprietary
- SEO/content marketing — too slow for early traction
- Product Hunt launch — save for when we hit 50-100 customers

---

## Year One Goal

200 customers total by end of year one.

At 49/month core tier average that is 9800 MRR, 117,600 ARR.

From the data: one solo founder hit 5,400 MRR in 5 months with 69 customers. If we maintain that pace with content-led distribution, hitting 200 customers is doable.

Breakdown:
- Launch: 50 customers (conservative first quarter)
- Month 6: 100 customers
- Month 12: 200 customers

That is doubling twice. Doable with the right story and distribution.

---

## Next Steps

1. Document the idea-to-output flow in detail (user journeys)
2. Research revenue targets for solo-founder SaaS
3. Write pricing page copy
4. Map customer journey sign-up to first output

---

## Notes on Pricing Philosophy

The idea behind giving away "some of the magic" first:

- User gets real value before payment (validated output, not empty promise)
- Email verification prevents abuse and captures lead
- Once they see what's possible, conversion is higher
- Payment unlocks full pipeline + ability to iterate

This differs from traditional SaaS free trials because the output itself is the hook.

---

*Document in progress. Update as decisions are made.*
