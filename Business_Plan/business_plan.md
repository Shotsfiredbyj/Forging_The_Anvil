# Cold Anvil — Business Plan

**Updated:** 9 April 2026
**Status:** V3 — Pipeline assumptions refreshed (single reviewer, sub-40B
rewriters, iterative code gen, execution verification). Heavy user stress
test added. Cost model cross-referenced with pricing research. Competitive
moat updated with harness engineering and cost structure evidence.

---

## What This Is

Cold Anvil (coldanvil.com / coldanvil.ai) — a purpose-built dream building
machine. Users describe their idea, the pipeline refines it through
conversation, then forges it through progressively deeper stages: vision,
roadmap, content, tech design, code generation, assembly, verification, and
deployment guidance.

Not a chatbot. Not a code generator. A product engineering team in a box that
gets smarter about your project the longer you use it.

**Tagline:** Product development in a box
**Vision:** Whatever you imagine, we'll forge it into reality

---

## Target Customer

**Primary (MVP):** Solo founders who need to go from idea to working product
but can't afford or don't want to hire a team. They want to describe what they
need and get back something they can ship.

**Secondary (post-MVP):** Small teams (2-10 people) — team pricing,
collaboration features, shared project workspaces.

---

## Pricing Model — Cascade Depth

Pricing is by **depth** — how far through the pipeline your project goes —
not by volume. Each tier unlocks deeper stages. One active project per
subscription, with add-on projects available.

### Why Depth, Not Volume

The previous model (volume-based: X ideas per month, Y refinements per idea)
had three problems:

1. "3 refinements per idea" is confusing. What counts as a refinement?
2. No natural upsell moment during the flow — you finish, then hit a wall.
3. Incentivises shallow idea spraying, not deep project building.

Depth pricing is immediately clear: "we take it to vision" vs "we take it to
code" vs "we take it to deployment." Each tier boundary is a natural conversion
point because the customer can see what's coming next.

### Tiers

**Free — "See What's Possible"**
- Steps 1-3: Idea refinement conversation + polished vision document
- Full quality process applied (review + rewrite if needed)
- Email verification required to receive output
- 1 project, locked after completion

The free tier includes the conversational element (Step 3 idea refinement).
That's the hook — it's differentiated, personal, and sticky. The customer has
invested in the conversation and the platform knows their idea. Walking away
feels like leaving value on the table.

**29/month — "Shape It" (Tier 1)**
- Steps 1-5: Vision + Roadmap + Content (copy, creative assets)
- 1 active project
- The planning tier. Customer gets a structured product plan they can act on.

**49/month — "Build It" (Tier 2)**
- Steps 1-7: + Tech Design + Code Generation
- 1 active project
- The IP tier. Customer gets the technical design and generated code. This is
  the output they could take elsewhere — to Claude, to a developer, to another
  tool. At this point it's up to them.

**200/month — "Ship It" (Tier 3)**
- Steps 1-9+: + Assembly + Verification + Deployment guidance + Platform
- 1 active project
- The team tier. Cold Anvil doesn't just hand you files — it assembles the
  project, verifies end-to-end, recommends deployment services (free and paid),
  and guides you through going live. With deployment partnerships, customers
  get better pricing on infrastructure. Long-term (Phase 5), this tier includes
  project evolution — the platform remembers your project and keeps building.

**2,000/year — "Ship It" annual (17% discount)**
- Same as Tier 3 monthly, billed annually
- 167/month equivalent
- The annual commitment makes sense here — Tier 3 customers are building and
  deploying, which is inherently a long-term activity.

### Add-On Projects

Base subscription includes 1 active project. Additional active projects
available as add-ons (pricing TBD — likely 10-15/month per additional project).
Archived projects are free to store and can be reactivated.

This aligns with the long-term vision: each project on the platform
accumulates context (rubrics, preferences, codebase knowledge, deployment
config). More projects = more value stored = stronger retention.

### Annual Pricing (Tier 1 and 2)

TBD. Annual pricing for Tier 1/2 is lower priority — the annual commitment
makes most sense at Tier 3 where the customer is deploying and building
long-term.

### Future: Teams (2-10 people)

**100/user/month**
Includes: shared projects, org management, team workspaces, shared rubrics,
admin console, usage analytics. Post-MVP.

### Payment Flow

1. User enters email, submits idea pitch
2. Pipeline starts idea refinement conversation (Step 3)
3. User gets vision document — email OTP to receive it (free tier completes)
4. Tier boundary: "Here's your roadmap preview. Upgrade to Shape It to unlock"
5. Tier 1 customer gets roadmap + content
6. Tier boundary: "Here's your tech design preview. Upgrade to Build It..."
7. Tier 2 customer gets tech design + code
8. Tier boundary: "Ready to deploy? Ship It assembles, verifies, and launches"
9. Tier 3 customer gets assembly + verification + deployment guidance

Each boundary shows the next stage's output — the customer can see the value
on the other side of the paywall.

### MVP Constraints

- Subscription only (monthly + annual for Tier 3)
- No usage-based pricing, no credits, no API access
- Pro-rated upgrades (Stripe handles natively)
- Future API product may use credit-based pricing

### Anti-Abuse Controls (MVP)

- Unique email per account required
- OTP verification before output delivery
- IP/device fingerprinting for Tier 3 monitoring
- Terms of service: no account sharing, single user per subscription
- Rate limiting on project creation to prevent automated abuse
- Manual review flagged for suspicious patterns

---

## Compute Infrastructure

### Chosen Architecture

**2x B200** (192 GB each, NVLink pooled = 384 GB)
**Provider:** Packet.ai or RunPod
**Cost at 8hrs/day:** 1,080/month

### Why This Choice

- Cheapest rental at low utilisation
- 8-10x aggregate throughput vs single Pro 6000
- Pooled VRAM means no single-card constraints
- 2 cards to manage = simplest infrastructure
- Scale path: add 2 more cards when demand requires

### Alternative

6x Pro 6000 via Vast.ai at 1,440/month (slower, more cards to manage)

### Pipeline Workload

**Updated 2026-04-09** to reflect actual measured pipeline configuration.

Every output runs through a multi-phase quality cascade:

1. **Generation** — gemma4-26b or qwen3.5-35b (sub-40B MoE), parallel across fleet
2. **Review** — single reviewer (mistral-small3.2:24b), rubric-based scoring
   with binary checkpoints + chain-of-thought. Blueprint + CSS passed as
   review context for cross-file awareness.
3. **Rewrite** — sub-40B models (qwen3.5-27b/35b, gpt-oss-20b, devstral-24b).
   Structured JSON patches with refusal detection.
4. **Verification** — execution-based (linters, compilers, cross-file checks).
   5 language adapters. Not GPU work — runs on CPU.
5. **Integration review** — cross-file coherence check (diagnostic, no rewrite).

**Changes from original plan (March 2026):**
- Dual independent reviewers → **single reviewer.** Phase 1 benchmarks showed
  reviewer disagreement added cost without improving quality. Single reviewer
  cuts review time ~50%.
- 122B rewrite model → **sub-40B rewriters.** Harness engineering research
  (Apr 2026) confirmed that pipeline architecture matters more than model size.
  Kozuchi achieved 74.8% SWE-bench with 27B, beating 480B models. Sub-40B
  rewriters run on 32GB GPUs, no need for 96GB+ cards.
- Code gen is now **iterative** (layer-by-layer with dependency ordering),
  not parallel batch. Slower per cascade but higher quality.
- Execution-based verification added. CPU-only, no GPU cost.

### Data Sovereignty

All inference self-hosted. No inference APIs, no third-party data processing.
Production fleet separate from Arnor dev/staging environment.

---

## Compute Cost Per Tier

Depth pricing aligns cost-to-serve with revenue. Deeper tiers cost more to
serve but charge proportionally more — and the heaviest value stages (assembly,
verification, deployment) are actually cheap in GPU terms.

### GPU Time Per Cascade — Measured vs Estimated

**Dev fleet measured times (Apr 2026):** Full website cascade (5 stages,
iterative code gen with verification) on 4x 32-96GB cards over Tailscale:

| Metric | Time |
|--------|------|
| Minimum | 37.1 min |
| Average | 51.5 min |
| Maximum | 61.9 min |
| Median  | 51.0 min |

These times include significant overhead from the dev fleet: model swapping
between hosts (30-60s cold starts), Tailscale network latency, 4 separate
cards without NVLink, and the full iterative pipeline (layer-by-layer code
gen with per-layer verification + rewrite cycles).

**Production estimates (2x B200, uncontested):**

B200 is ~4-5x faster per GPU than Pro 6000 (which itself is ~3x faster than
the Pro 4500s in the dev fleet). 2x B200 with NVLink eliminates model swap
overhead (384GB pooled VRAM holds all models simultaneously). Estimated
production speed improvement: 3-5x over dev fleet.

| Tier | Stages | GPU-heavy work | Est. GPU time (2x B200) |
|------|--------|---------------|------------------------|
| Free | Steps 1-3 | Conversational Q&A (27-35B) + 1 gen + single review | ~1-2 min |
| Tier 1 (29) | Steps 1-5 | + roadmap gen/review + content gen/review | ~3-4 min |
| Tier 2 (49) | Steps 1-7 | + tech design + iterative code gen (layer-by-layer, each verified + reviewed) | ~10-15 min |
| Tier 3 (200) | Steps 1-9 | + assembly (deterministic) + execution verification (CPU) + iteration | ~12-18 min |

The big jump is Tier 1 to Tier 2. Code generation is the heaviest stage —
iterative layer-by-layer generation with per-layer execution verification and
rewrite cycles. Single reviewer (not dual) and sub-40B rewriters (not 122B)
reduce review/rewrite time vs the original plan, but iterative mode adds
time vs parallel batch. Net effect: Tier 2 GPU time is similar to the
original estimate despite the heavier pipeline.

Tier 3 adds relatively little GPU compute — assembly is file operations and
light LLM config generation, verification is html-validate / stylelint /
Playwright / language-specific linters running on CPU. The value of Tier 3
is in deployment guidance and platform access, not GPU time.

### Capacity (2x B200, 8hrs/day = 240 GPU-hours/month)

At 50 customers (25 Tier 1 / 18 Tier 2 / 7 Tier 3), assuming 2 cascades per
customer per month plus conversational Q&A:

- Free/Tier 1 pipeline: 25 customers × 2 cascades × 4 min = 200 min
- Tier 2 pipeline: 18 customers × 2 cascades × 15 min = 540 min
- Tier 3 pipeline: 7 customers × 2 cascades × 18 min = 252 min
- Conversational Q&A: 50 customers × 30 min/month = 1,500 min
- **Total: ~2,492 min (~42 hours/month — 17% of capacity)**

Substantial headroom. Even at 5 cascades per customer (heavy usage):
~5,480 min (~91 hours — 38% of capacity). The bottleneck isn't total
capacity but peak concurrent throughput.

**Compared to original estimate:** Very similar (was 38 hours at 16%). The
heavier iterative pipeline is offset by single reviewer + smaller rewriter
models. The capacity story is unchanged.

---

## Cost Math and Margins

**Updated 2026-04-09** — cross-referenced with pricing research
(Research/pricing_models_research.md). Core margin model validated: GPU is
fixed cost, margins improve with scale, flat-rate-within-depth is sustainable.
Pipeline changes (single reviewer, sub-40B rewriters) reduce per-cascade
compute but don't materially change the margin picture because GPU cost is
fixed regardless of utilisation at early scale.

### Fixed Costs Per Month

- 2x B200 (8hrs/day): 1,080
- Hosting, domains, support: 216
- **Total fixed: 1,296/month**

### Break-Even by Tier

| If all customers are... | Customers to break even |
|------------------------|------------------------|
| Tier 1 (29) | 46 |
| Tier 2 (49) | 28 |
| Tier 3 (200) | 7 |

Tier 3 breaks even at 7 customers. That number should keep you up at night
in a good way.

### Margins at 50 Customers

Assuming mix of 50% Tier 1, 35% Tier 2, 15% Tier 3. Fixed costs allocated
proportionally by GPU usage.

| | Tier 1 | Tier 2 | Tier 3 | Total |
|--|--------|--------|--------|-------|
| Customers | 25 | 18 | 7 | 50 |
| Revenue | 725 | 882 | 1,400 | 3,007 |
| Stripe (3%) | -22 | -26 | -42 | -90 |
| Fixed cost share (GPU usage) | -402 | -461 | -217 | -1,080 |
| Other fixed share | -108 | -78 | -30 | -216 |
| **Profit** | **193** | **317** | **1,111** | **1,621** |
| **Per customer** | **7.72** | **17.61** | **158.71** | **32.42** |
| **Margin** | **27%** | **36%** | **79%** | **54%** |

### Margins at Scale

GPU is a fixed cost. Margins improve as customers share it:

| Customers | Blended margin (same tier mix) |
|-----------|-------------------------------|
| 50 | ~54% |
| 100 | ~73% |
| 150 | ~80% |
| 200+ | ~83% |

By 150 customers, Cold Anvil is in traditional SaaS margin territory (75-85%)
despite running heavy GPU inference. This is unusual for an AI product and is
driven by Tier 3's economics — high price, low marginal compute cost.

### Industry Context

| Category | Typical gross margin |
|----------|---------------------|
| Traditional SaaS | 75-85% |
| AI/GPU-heavy SaaS | 50-65% |
| Infrastructure/PaaS | 60-70% |
| Cold Anvil at 50 customers | 54% |
| Cold Anvil at 200 customers | 83% |

### Heavy User Stress Test (added 2026-04-09)

The pricing research modelled extreme usage scenarios against the fixed cost
structure. Because GPU is a fixed cost, the question isn't "can we afford
heavy users" but "do they saturate capacity."

| Usage level | Cascades/month | Amortised compute | Revenue (Tier 3) | Margin |
|-------------|---------------|-------------------|-----------------|--------|
| Typical | 2 | ~0.06 | 200 | 99.97% |
| Moderate | 10 | ~0.23 | 200 | 99.88% |
| Heavy | 30 | ~0.59 | 200 | 99.70% |
| Extreme | 100 | ~2.30 | 200 | 98.85% |
| Abusive | 500 | ~11.50 | 200 | 94.25% |

Even 500 cascades/month (16+/day, every day) only amortises to ~$11.50 in
compute against $200 revenue. The margin never breaks.

**But throughput matters.** 500 cascades at ~15 min each = 125 GPU-hours =
52% of monthly capacity from one user. This is not a cost problem but a
queuing problem for other users. Natural ceilings exist: each cascade takes
25-45 min of user time (conversation + review), so even dedicated users
struggle to run more than 5-10/day.

**Implication:** No per-cascade usage cap is needed at any tier. The
economics are self-balancing — heavy users are free within existing GPU
capacity, and more GPUs are only needed when more paying customers fund them.

See Research/pricing_models_research.md §7 for full stress test and industry
usage distribution data.

### What This Means

- **Tier 1 at 27% is thin but intentional.** It's the entry point, not the
  business. Its job is conversion to Tier 2/3, not standalone profitability.
- **Tier 2 at 36% is solid.** Healthy margin, highest compute cost to serve,
  but the price covers it.
- **Tier 3 at 79% is the engine.** Software-like margin on a GPU product.
  And this is before deployment partner revenue share, which is pure margin.
- **Every Tier 2-to-3 conversion adds ~141/month in profit.** The product
  strategy and the business strategy are the same: make the depth upsell
  irresistible.
- **Unlimited iteration is affordable.** At ~$0.003/pass, even 100
  iterations costs $0.30. This enables the "no credits, no tokens"
  positioning that directly attacks competitor weakness.

---

## Competitive Moat

### Proprietary Infrastructure (Opaque to Users)

1. **Multi-phase quality cascade** — generation, rubric-based review with
   binary checkpoints, structured rewrite, execution-based verification, and
   integration review. We don't disclose how many phases, which models, or
   the rubric structure. Users get quality, not the recipe.

2. **Harness engineering** — the pipeline architecture matters more than the
   model. Phase 1 benchmarks showed 5.2pp spread from harness alone (same
   model). Fujitsu achieved 74.8% SWE-bench with a 27B model through pipeline
   engineering, beating 480B models. Our pipeline IS the product.

3. **Secret forge packs** — Internal format for prompting, gates, rubrics.
   The output is public, the compilation is not.

4. **Cost structure moat** — self-hosted sub-40B models at ~$0.003/artifact
   vs competitor API costs of ~$0.96/artifact. 300x advantage enables
   flat-rate pricing that API-dependent competitors cannot sustain. See
   Research/small_models_vs_frontier_research.md.

### Accumulated Context (The Real Moat)

4. **Project context accumulation** — The platform remembers your project:
   quality bar, tech choices, brand voice, what was built, what worked, what
   didn't. The longer you use it, the better it gets at building your thing.
   This is the retention engine — not lock-in, but compounding value.

5. **User-specific adaptation** — Preferences encoded over time ("too formal,"
   "prefer fewer options"). They don't notice until they try to leave.

### Deployment Partnerships

6. **Infrastructure partner deals** — Tier 3 customers get deployment guidance
   with partner pricing. Cloudflare, Vercel, RunPod, Railway — Cold Anvil
   negotiates volume deals and passes savings to customers. Revenue share from
   partners is pure margin. This is something ChatGPT and Claude cannot do.

### Defensible Positioning

7. **Product thinking at scale** — 20 years of judgment embedded in prompts
   and review criteria. Competitors can copy the format, not the expertise.

### What We Don't Rely On

- Fleet efficiency — becomes commodity once we're on B200s
- Config pack spec — open source the format, keep the packs proprietary
- Price — competitors with cloud credits can under-sell, can't out-value

---

## Time to Value Target

Time to value varies by tier. Deeper tiers take longer in compute but deliver
proportionally more value.

### Per-Tier Compute Time (2x B200, uncontested)

| Tier | Compute time | User-facing time (incl. Q&A) |
|------|-------------|------------------------------|
| Free | ~3 min | 10-15 min (conversation + vision delivery) |
| Tier 1 | ~6 min | 15-25 min (+ roadmap + content) |
| Tier 2 | ~10 min | 20-35 min (+ tech design + code gen) |
| Tier 3 | ~12 min + tools | 25-45 min (+ assembly + verification) |

### Under Load (50 concurrent users)

All users share the GPU fleet. Conversational Q&A runs the 35B model
continuously during active sessions. At 50 concurrent users (~35 GPU tasks
staggered across phases):

- Uncontested (launch week): compute times as above
- At 50 users: +50-100% on compute times
- At 100 users: +100-200% (need 4th B200)

**Scale trigger:** Add 2x B200 when sustained loads exceed 30 minutes per
Tier 2 cascade.

Users take as long as they need on Q&A. No artificial time limits. We never
trade depth for speed.

---

## Customer Journey (Sign-Up to First Output)

### Free Tier (the hook)

1. **Minutes 0-2:** Land on coldanvil.com, enter email, submit idea pitch
2. **Minutes 2-10:** Idea refinement conversation — 5 clarifying questions.
   This is where the differentiation lives. Not a form. A conversation.
3. **Minutes 10-15:** Vision document generated, reviewed, delivered. Email
   OTP to receive.
4. **The cliff:** "Here's what your roadmap looks like. Upgrade to unlock."

### Tier 1 (Shape It)

5. **Minutes 15-25:** Roadmap generated + content (copy, creative assets).
   Customer now has a structured plan for their idea.
6. **The cliff:** "Here's your tech design preview. Upgrade to Build It."

### Tier 2 (Build It)

7. **Minutes 25-35:** Tech design + code generation. Multiple files, each
   quality-gated and reviewed. Customer receives the IP.
8. **The cliff:** "Ready to ship? Here's what the assembled project looks
   like. Upgrade to Ship It."

### Tier 3 (Ship It)

9. **Minutes 35-45:** Assembly, verification, deployment guidance. Project is
   assembled end-to-end, verified with automated tools, and the customer gets
   opinionated deployment recommendations with partner pricing.
10. **Ongoing:** Iteration cycles. Feedback triggers targeted rewrites.
    Platform accumulates project context for future work.

**Key design principle:** Each tier boundary shows the next stage's output.
The customer can see the value they're not getting. The upsell is visual,
not verbal.

---

## Go-to-Market

### Phase 1 (0-6 months): Visual-first, paid reach

**Primary:** Instagram ads — visual storytelling showing the transformation.
Before/after outputs, rapid iteration demos. The depth model is perfect for
this: "Watch an idea become a vision... become a plan... become code...
become a live product."

**Secondary:** YouTube — build in public, documented launch. Content becomes
ad creative.

**Tertiary:** Influencer collabs — micro-influencers in indie hacker/side
project space, revenue share (15-20% first 3 months).

### Phase 2 (6-12 months): Community and partnerships

- Cold outreach to product communities (Indie Hackers, Product Hunt, HN)
- Referral program: free month for both referrer and referee
- Partner with bootcamps, coding schools, creator economy platforms
- Begin deployment partner conversations (Cloudflare, Vercel, etc.)

### Not Yet

- Open source config pack spec — keep proprietary
- SEO/content marketing — too slow for early traction
- Product Hunt launch — save for 50-100 customers

---

## Year One Revenue Target

**200 customers by end of year one**

### Revenue at Target Mix (50/35/15)

| | Tier 1 | Tier 2 | Tier 3 | Total |
|--|--------|--------|--------|-------|
| Customers | 100 | 70 | 30 | 200 |
| Monthly revenue | 2,900 | 3,430 | 6,000 | 12,330 |
| **MRR** | | | | **12,330** |
| **ARR** | | | | **147,960** |

Assumes some Tier 3 customers are on annual (2,000/year = 167/month), which
would reduce MRR slightly but improve cash flow predictability.

**Trajectory:**
- Launch: 50 customers (conservative first quarter)
- Month 6: 100 customers
- Month 12: 200 customers

**Baseline:** One solo founder hit 5,400 MRR in 5 months with 69 customers.
Cold Anvil targets higher ARPU through depth pricing, so fewer customers
generate more revenue.

### Margin at 200 Customers

At 200 customers, fixed costs are spread thin:

- Revenue: 12,330/month
- Fixed costs: ~1,296/month (may need GPU scale-up)
- Stripe: ~370/month
- **Profit: ~10,664/month**
- **Margin: ~83%**

Even with a GPU scale-up to 4x B200 (2,160/month), margin stays above 75%.

---

## MVP Definition (Phase 3)

**What's in scope:**

- Free tier (Steps 1-3, email-gated)
- Tier 1: 29/month (Steps 1-5)
- Tier 2: 49/month (Steps 1-7)
- Tier 3: 200/month or 2,000/year (Steps 1-9)
- 1 active project per subscription
- Conversational idea refinement (Step 3)
- Conversational rubric creation (Step 6: "what does good mean?")
- Full pipeline: vision, roadmap, content, tech design, code gen, assembly, verification
- Email OTP verification
- Stripe subscription management with pro-rated upgrades
- Deployment guidance (recommendations, not automated deployment)

**What's out of scope (post-MVP):**

- Add-on project pricing
- Deployment partner integrations and partner pricing
- Team workspaces and collaboration
- Org management and admin console
- API access and credits
- Config pack marketplace
- Project evolution / codebase awareness (Phase 5)
- CLI / IDE integration (Phase 5)

---

## Long-Term Vision

Cold Anvil is not just an idea-to-output generator. That's the hook.

The long-term product is a platform where people keep building — evolving
projects over time with a system that accumulates context and gets smarter
about their work. A purpose-built dream building machine.

The moat is accumulated context. The retention engine is compounding value.
The business model scales because Tier 3 margins are software-like despite
running GPU inference, and deployment partnerships add revenue without adding
compute cost.

See BACKGROUND-AND-VISION.md for the full vision and ROADMAP.md for the
phased build plan.

---

## Open Questions (Track Separately)

- Conversion rate targets (free-to-Tier 1, Tier 1-to-2, Tier 2-to-3)
- Add-on project pricing (10-15/month per project — needs validation)
- Annual pricing for Tier 1 and 2 (discount level, whether to offer at launch)
- Deployment partner candidates and revenue share terms
- Customer acquisition cost estimates (Instagram vs YouTube vs influencer)
- Churn assumptions per tier (expect Tier 3 churn to be lowest)
- Revenue target validation for solo-founder SaaS

---

*V2 updated 23 March 2026. Cascade depth pricing model replaces volume model.
Margins validated against compute research. Long-term vision documented.*
