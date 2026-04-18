# Cold Anvil Studios — Business Operations

**Status:** Working document, updated 2026-04-18. Captures the operational decisions that live independently of vendor choice — legal entity, tax regime, banking, bookkeeping, compliance posture, committed stack. Vendor-specific research for IAM and payments lives in `Research/iam_and_payments.md`. Pricing, cost model, and go-to-market stay in `business_plan.md`.

---

## 1. Founder context

- Jack is a **dual citizen** — Swedish + UK — **resident in Sweden.**
- Solo founder at day one. Preference: operational ease.
- Cold Anvil Studios (the AB) is the holding company. Three sister products live under it, each its own business with its own brand and audience: **Cold Anvil** (consumer AI product engineer, ships first and is the commercial spine), **Fourth Age** (AI creative partner for content creators, designed but not built), and **Celyn** (B2B clinical decision support for functional medicine clinics, prototype, far out). An accelerator cohort is a future strand.
- Cold Anvil is designed for Cold Anvil. Sister products get their own architectural calls when they're real — Cold Anvil's stack isn't shaped by anticipation. What the rigorous infra earns regardless (multi-tenant schema for the accelerator cohort, audit logs, signed webhooks) is good hygiene in its own right; it happens to make future reuse easier if sister products choose to lift it.

---

## 2. Committed stack decisions

Recorded 2026-04-18. Decision reasoning for IAM + payments lives in `Research/iam_and_payments.md` §1 and §6. Deep rationale for each choice below is in the section cross-referenced. Revisit triggers named where relevant.

### Core infrastructure

| Area | Choice | Cost | Revisit trigger |
|---|---|---|---|
| Legal entity | Swedish AB (Cold Anvil AB) | SEK 27,200 one-off (SEK 25k share capital recoverable + SEK 2,200 filing) | — |
| IAM | Logto Cloud (EU region) | $0 free tier ≤50k MAU; ~$16-200/mo at paid tier | Celyn HIPAA → self-hosted Logto; repricing → Clerk |
| Payments | Stripe (direct merchant, Swedish AB account). Swish + Klarna + SEPA + Link all active | Processing fees only (~4% effective blended) | UK VAT + US nexus burden grows past 8 hrs/quarter → Paddle as non-EU B2C overflow |
| Transactional email | Postmark (EU region) | ~$15/mo for 10k emails | Cost scales linearly; revisit at 100k+ emails/mo |
| Marketing analytics | Plausible (EU-hosted, cookie-free) | ~€9/mo for 10k pageviews | — |
| Product analytics | Deferred (PostHog or similar) | $0 | First paying customers → consider PostHog post-login with anonymised events |
| Error monitoring | Sentry (EU region) | $0 free tier (5k errors + 10k perf events/mo) | Grow out of free tier |
| Secrets — personal | 1Password Individual + `op` CLI | ~SEK 30/mo (~$35/yr) | First hire → upgrade to Teams |
| Secrets — runtime | Fly.io secrets + Cloudflare env vars + GitHub Actions secrets | $0 | — |
| CI/CD | GitHub Actions | $0 (generous free tier for private repos) | — |
| Status page | Cloudflare Status Page | $0 | First paying customer → Better Stack (~€25/mo) |
| Postgres backup / PITR | Neon free tier (7-day PITR) | $0 | First paying customer → paid tier (30-day PITR) |
| Customer support | Email-to-Linear via Postmark inbound | $0 | >50 tickets/month → Plain.com (EU-hosted) |
| Business bank | Lunar Business (fintech, fast onboarding) | Low monthly fees | Celyn ships → SEB or Handelsbanken for B2B banking sophistication |
| Accounting stack | Wint (digital-native Swedish accounting) | SEK 495-1,495/mo depending on turnover | Complexity grows (multiple entities, cross-border subsidiaries) → traditional revisor |
| Business insurance | **Deferred** | — | First paying customer OR Celyn signs first clinic → If PI + cyber + general liability (quote Hiscox for comparison) |

### Legal / compliance one-offs

| Area | Choice | Cost |
|---|---|---|
| Privacy Policy + Terms of Service | Iubenda (maintained pack, multi-language, auto-updates) | ~€29/year |
| Cookie consent banner | **Not needed** (Plausible is cookie-free; PostHog when/if added lives post-login with anonymised events) | $0 |
| Trademark registration | EUIPO + UK IPO, via a Swedish IP agent (Ström & Gulliksson, Awapatent, or Valea). Cold Anvil in Class 42 (software/SaaS); Celyn in Class 42 + Class 44 (medical services) | ~€3,500-4,500 one-off |

### Domain + subdomain pattern

**Cold Anvil:**
- `coldanvil.com` — marketing site (Cloudflare Pages)
- `app.coldanvil.com` — authenticated product (Annie workspace)
- `api.coldanvil.com` — Hono API
- `auth.coldanvil.com` — Logto + magic-link sender domain
- `billing.coldanvil.com` — Stripe customer portal
- `status.coldanvil.com` — status page

**Celyn (mirrors when it ships):**
- `celyn.health` — marketing
- `app.celyn.health` — product
- `api.celyn.health` — Hono API (separate subdomain for clean tenant isolation)
- `auth.celyn.health` — Celyn-branded IAM chrome
- `billing.celyn.health` — Stripe B2B portal

### Day-one budget

- **Recurring monthly:** ~$40-60/mo + SEK 500-1,500. Roughly **SEK 5,000-6,000/mo** all-in (under £500/mo).
- **One-off:** ~SEK 27,200 (AB incorporation, recoverable) + ~€3,500-4,500 (trademarks) + ~€29 (Iubenda first year).
- **Stripe processing fees:** variable — see `Research/iam_and_payments.md` §9 for scenarios by scale.

### Revisitable — watch the trigger

Three decisions are worth explicitly monitoring:

1. **Accountant — Wint vs Bokio + revisor.** Wint is the bundled answer. If monthly fee outpaces value-add (e.g. Wint can't handle your specific case without add-ons), revert to Bokio + independent revisor annual review.
2. **Bank — Lunar Business vs SEB/Handelsbanken.** Lunar for speed at day one; migrate when Celyn needs SEPA Direct Debit + Autogiro + B2B banking sophistication for clinic payments.
3. **Insurance — deferred entirely.** Not a cost saved; a cost delayed. Trigger is concrete: first paying consumer customer OR Celyn signs first clinic, whichever first.

---

## 3. Legal entity: Swedish AB (Aktiebolag)

### Decision

Incorporate **Cold Anvil AB** in Sweden. Bolagsverket registration, Skatteverket F-skatt + moms registration, Union OSS membership for EU cross-border digital sales.

### Why AB over alternatives

**Enskild firma (Swedish sole trader)** — admin-lightest for year one but:
- Unlimited personal liability is a poor fit for Celyn's clinical surface.
- Cannot cleanly hold equity in other companies — kills the accelerator model that takes cohort shares.
- Personal + business tax unified (marginal rate ~52%) with no long-term lever.
- Would require restructure to AB before first investor — so pay that cost now.

**UK Ltd** — worst of both worlds:
- UK Companies House admin + Swedish tax residency pulls profits back to Swedish tax via place-of-effective-management / CFC rules.
- Drops out of Union OSS back into UK's non-Union OSS regime.
- Double admin for no benefit.

**Delaware C-corp / Estonian OÜ** — both catch Swedish-resident founders:
- Skatteverket treats a company as Swedish-resident if its place of effective management is Sweden, regardless of where it's registered. All the admin of a foreign structure, none of the benefit.
- Only consider Delaware when raising US VC (deal with it at Series A if ever).

### Why AB is actually easier than it sounds

- **SEK 25,000 minimum share capital** (reduced from 50k in 2020). That's ~£1,800, parked in the company account — not gone.
- **Skatteverket is the most digitised tax authority in Europe.** BankID signs everything; interactions are frictionless; reporting automation is miles ahead of HMRC.
- **Wint or Bokio** handles bookkeeping, VAT filings, employer declarations automatically. Solo-founder ABs under the revisor thresholds don't need an auditor.
- **3:12 dividend rules** let you extract profit from a closely-held AB at ~20% tax (utdelning inside gränsbeloppet) instead of ~52% marginal income — substantial long-term lever that only exists with AB structure.
- **Limited liability** — non-negotiable once Celyn has real clinical surface. Structure it correctly from day one.
- **Clean investor story** — shares exist, cap table is legible, VCs understand AB.

---

## 4. Setup checklist

### Phase 1 — Incorporation (Weeks 1-3)

1. **Bolagsverket AB registration.** Online application, ~SEK 2,200 fee, ~2 weeks processing. Name check, articles of association (bolagsordning), director registration.
2. **Business bank account (Lunar Business).** Fintech, fast onboarding. Migrate to SEB or Handelsbanken when Celyn needs B2B banking sophistication.
3. **Deposit SEK 25,000** share capital into the bank account.
4. **Collect the AB registration certificate** — needed for everything downstream.

### Phase 2 — Tax registration (Week 3-4)

5. **Skatteverket F-skatt** — required to operate as a business. Online via verksamt.se. Approved in days.
6. **Skatteverket moms (VAT) registration.** Standard Swedish VAT rate 25% (digital services). Required from first invoice to a Swedish consumer.
7. **Union OSS registration via Skatteverket.** One registration covers all EU cross-border digital sales. Quarterly filing. This is the single biggest compliance lever a Swedish-resident founder has.
8. **UK VAT registration via HMRC.** Required because Stripe-direct payments mean we are the UK seller; digital services to UK consumers have no threshold.
9. **Arbetsgivarregistrering** (employer registration) — only if paying salary. Can defer if extracting via dividends.

### Phase 3 — Bookkeeping + ongoing ops (ongoing)

10. **Wint** setup — handles bookkeeping, moms, Union OSS, lön (when paying salary), annual report end-to-end. Connect to Lunar Business bank account.
11. **Xero or QuickBooks** for UK VAT MTD filing (separate from Wint because MTD requires HMRC-approved software).
12. **Årsredovisning (annual report)** to Bolagsverket — mandatory. Wint generates the filing.
13. **Deklaration (annual tax return)** to Skatteverket — the AB files corporate tax; you file personal tax. BankID-signed, fully online.

### Phase 4 — Legal + IP (parallel with Phase 1-3)

14. **Trademark filings.** EUIPO + UK IPO for Cold Anvil + Celyn via a Swedish IP agent. File early to prevent squatters; ~6-9 months to registration but protection starts from filing date.
15. **Privacy Policy + Terms of Service** via Iubenda. Wire into the marketing site before first public launch.

---

## 5. Tax regime

### EU — Union OSS (single registration)

As a Swedish-resident entity:
- Register once with Skatteverket for Union OSS.
- File quarterly returns declaring sales to EU consumers by country.
- Pay Swedish moms on all EU cross-border digital sales at each country's rate (auto-calculated).
- Covers ~25 EU jurisdictions as one filing. This is the lightest EU tax regime anywhere — the single biggest reason to keep the AB Swedish-resident rather than drift into UK Ltd or Delaware.

### UK — required from day one

- UK is rest-of-world post-Brexit.
- UK VAT registration required **from £1 of UK digital-services sales** (no threshold for digital services to UK consumers).
- Register via HMRC directly; file UK VAT returns via MTD-compliant software (Xero or QuickBooks).
- **This is a day-one commitment under Stripe-direct payments.** Budget: ~£300-600/year for MTD software + £500-1,500/year accountant retainer for quarterly review.

### US — state sales tax nexus (track, don't register yet)

- No federal sales tax. Each state has its own nexus threshold, typically **$100,000 in-state revenue or 200 transactions** (state-dependent).
- At day-one scale (100 paying users), crossing any state threshold is extremely unlikely. Track revenue-by-state from day one so you know when to register.
- Most common threshold-crossers for a SaaS at scale: California, Texas, New York, Florida, Washington.
- Register state-by-state as nexus hits; retain a US-nexus-specialist accountant when you cross your first threshold.
- Stripe Tax calculates sales tax per US state transaction if you enable it; you file and remit per state.

### Rest of world

- Canada GST/HST, Australia GST, Brazil, India — each has its own threshold and registration.
- Thresholds are low-to-moderate; track by country. Most will not bind at day-one scale.
- When any threshold approaches, register directly or evaluate Paddle as a geographic overflow for non-EU B2C (while keeping EU + Celyn on Stripe).

### When to revisit Paddle as overflow

Trigger: UK VAT + US state tax filing burden grows past ~8 hours/quarter, OR you cross sales-tax nexus in more than 3 US states, OR you're generating meaningful revenue in more than 3 rest-of-world jurisdictions. At that point, point non-EU B2C checkout flows at Paddle while keeping EU + Celyn on Stripe. Not a migration — a geographic split added at the edge.

### 3:12 dividend rules (long-term lever)

- Available to owners of closely-held Swedish ABs (fåmansföretag).
- Gränsbeloppet (threshold amount) calculated annually — utdelning (dividends) inside this threshold taxed at 20% (20% of a 25% deemed capital base = effective ~20% on the dividend).
- Dividends above the threshold taxed progressively up to 57%.
- Meaningful planning lever: structure founder compensation as a mix of salary (for pension + social security accrual) and dividends (for tax efficiency) once the AB is profitable.
- **Not something to design around at day zero** — but design the AB structure so it's available when it matters.

---

## 6. GDPR baseline

### Day one

1. **Sign a DPA (Data Processing Agreement) with every data processor.** Minimum: Logto, Stripe, Postmark, Cloudflare, Fly.io (or equivalent hosting), Sentry, Plausible, 1Password, LLM providers (when added).
2. **Maintain a living sub-processor register** on `coldanvil.com/legal/sub-processors`. List each processor + what data they see + where it's stored.
3. **Notify Celyn customers 30 days before sub-processor changes** (GDPR Article 28 requirement for B2B processors handling sensitive data). Consumer notification can be lighter.
4. **Right-to-erasure pipeline** from day one. Deletion must cascade: Logto user deletion → Postgres cascade → Stripe customer deletion → Postmark unsubscribe. Design the workflow before first paying customer.
5. **Cookie + consent — not required.** Plausible (marketing analytics) is cookie-free. No other tracking cookies on marketing. If PostHog is added later, it runs post-login inside the authenticated product with anonymised event capture, not on the marketing surface.
6. **Data residency posture:** Logto Cloud EU region; Fly.io EU regions; Cloudflare Pages EU-served to EU users; Postmark EU region; Sentry EU region. Make this a stated principle in the sub-processor register.

### When Celyn ships

- **Patientdatalagen (Swedish patient data law)** governs any health data about identifiable patients. Stricter than GDPR baseline: requires documented legal basis, access controls, audit trail, retention limits, incident reporting to IMY (Integritetsskyddsmyndigheten).
- **Clinician-in-the-loop posture** keeps Celyn in clinical decision support (CDS) regulatory territory rather than direct-to-patient medical device — lighter MHRA/FDA pathway but Patientdatalagen still applies at the data layer.
- **Append-only audit log** (Postgres + S3 Object Lock, 6-year retention) is the load-bearing technical control.
- **PUB (personuppgiftsbiträdesavtal)** — Swedish-flavoured DPA — with any processor touching Swedish patient data.

---

## 7. Data residency posture

**Stated principle:** EU-first data residency wherever the choice exists.

- **Identity + user data:** Logto Cloud EU region (or self-hosted Logto in EU infra).
- **Application data (projects, conversations):** Postgres hosted in EU (Neon EU region, Fly.io EU regions, or equivalent).
- **Audit logs:** Postgres EU + S3 Object Lock EU region.
- **Email:** Postmark EU region.
- **Marketing analytics:** Plausible EU-hosted.
- **Error monitoring:** Sentry EU region.
- **Marketing site:** Cloudflare Pages — EU-served to EU users by default.
- **LLM inference (Arnor fleet):** on-premise Elostirion + private-first compute strategy — data does not leave the fleet for consumer inference.
- **Payments:** Stripe (Swedish AB) settles SEK and holds EU merchant presence; global Stripe account touches US for processing only.

**When it matters:**
- Schrems II concerns on non-EU vendors — pushed against for Celyn PHI, lighter for consumer.
- Patientdatalagen on Celyn — EU data residency is required, not optional.
- NHS-adjacent procurement asks explicit data-residency questions.

---

## 8. Audit log retention policy

**Capture from day one, even pre-Celyn, because migrating from "we don't have logs" to "we have logs" is expensive and introduces liability gaps.**

### What to capture

- `auth.login` — user ID, timestamp, IP, user-agent, method (magic link vs passkey), org context.
- `auth.step_up` — any MFA or re-auth event.
- `auth.session.revoke` — logouts, token invalidations.
- `billing.subscription.*` — subscription create/update/cancel/renewal. Stripe events normalised.
- `billing.payment.*` — charge success/failure, refund, dispute.
- `org.membership.*` — invites, role changes, removals.
- `phi.access` (Celyn only) — any query or view on a patient-data-tagged row. Includes user ID, org ID, row ID, timestamp, action (read/write), clinical justification if captured.

### How to store

- **Append-only Postgres table** — no UPDATE, no DELETE. Insert-only. Use row-level security to prevent mutation.
- **Daily export to S3 with Object Lock (WORM — write once, read many)** in EU region. Object Lock in Compliance mode for HIPAA-grade tamper resistance.
- **Retention:**
  - HIPAA-adjacent (Celyn, any PHI-tagged event): **6 years** from creation or last effective date.
  - Consumer auth + billing: **3 years** (GDPR-aligned minimum that also covers tax dispute windows).
  - Security incidents: indefinite.

### Why now, not later

Migrating from zero audit logs to full audit logs post-incident is a liability. Starting with logs means any future HIPAA assessment inspects 6 years of history when needed — not "the past 4 months since we added logging."

---

## 9. Sub-processor register

Living document, to be published at `coldanvil.com/legal/sub-processors` once the AB is incorporated and first customer-facing launch is imminent.

### Template structure

| Processor | Service | Data categories | Storage region | DPA signed |
|---|---|---|---|---|
| Cloudflare | Marketing site + CDN + Turnstile | IP, browser fingerprint | EU (auto-routed) | ☐ |
| Logto | IAM (users, sessions) | Email, name, auth metadata | EU region | ☐ |
| Stripe | Payments (consumer subscriptions + Celyn B2B invoicing) | Name, email, billing address, card token, VAT number | EU + US (Swedish AB account) | ☐ |
| Postmark | Transactional email / magic links | Email, name, message content | EU region | ☐ |
| Plausible | Marketing analytics (cookie-free) | Aggregated page events, no user ID | EU (hosted in Germany) | ☐ |
| Sentry | Error monitoring | Error traces, user ID (hashable), user-agent | EU region | ☐ |
| Fly.io (or equiv) | Application hosting | All app data | EU regions | ☐ |
| Neon / Postgres host | Database | All app data | EU region | ☐ |
| 1Password | Internal credential storage (team not customer data) | Founder credentials only | Shared with user device | N/A (not customer data) |
| [LLM provider if used] | Inference | Prompts + completions | Varies — private-first fleet preferred | ☐ |

**Maintenance rule:** any new processor added, any region change, any data-category expansion → update the register within 14 days and notify Celyn customers 30 days before the change takes effect.

---

## 10. Deliverability + abuse surface (operational)

### Email deliverability for passwordless IAM

Magic links are useless if they don't arrive. Treat deliverability as load-bearing infrastructure.

- **Dedicated subdomain:** `auth.coldanvil.com` (and `auth.celyn.health`) — not `coldanvil.com` itself. Protects the main domain's sender reputation from transactional bounces.
- **SPF, DKIM, DMARC aligned** on the subdomain. DMARC policy starts at `p=none` during setup, moves to `p=quarantine` once clean, `p=reject` at steady state.
- **Postmark** as transactional provider — best-in-class deliverability reputation, separate servers for transactional vs broadcast.
- **Bounce rate monitoring:** alert below 2%. Hard bounces >5% will trigger provider throttling.
- **Dedicated IP** — only past ~50k sends/month. Below that, shared pool reputation is better.

### Abuse surface — the highest-risk endpoint

`POST /auth/magic-link` is the single most-abused endpoint on passwordless SaaS. Default defences:

- **Cloudflare Turnstile** (free) in front — non-interactive challenge for suspected bots.
- **Per-email throttle** in Hono: max 3 magic-link requests per email per 10 minutes.
- **Per-IP throttle**: max 10 requests per IP per 10 minutes.
- **Per-IP block** on sustained abuse (>100 requests per hour) — cascade into Cloudflare WAF block.
- **Monitoring:** alert on magic-link request rate spikes (>10x baseline) — almost always a credential-stuffing or enumeration attempt.

### Secrets handling — developer + agent workflow

- **1Password Individual** stores personal + Cold Anvil credentials. `op` CLI for shell access.
- **`op run -- <command>`** for secret injection into dev processes — values never touch shell history, never appear in AI agent tool output, never in CI logs.
- **Shell Plugins** for `stripe`, `gh`, `fly`, `aws`, `doctl` — auto-inject credentials without any wiring.
- **Runtime secrets** live in platform env vars: Fly.io secrets (`flyctl secrets set`), Cloudflare Pages env vars, GitHub Actions repository secrets. Never copy a production secret into a local `.env` file; always reference via `op`.
- **Biometric unlock** (Touch ID / system keychain) re-prompts on every `op unlock`. Agents running on your behalf cannot silently drain the vault — physical approval required per session.

---

## 11. Day-one operational checklist

Copy-paste this into the project launch tracker as decisions commit:

### Legal entity + tax

- [ ] Cold Anvil AB registered with Bolagsverket
- [ ] SEK 25,000 share capital deposited
- [ ] F-skatt approved via verksamt.se
- [ ] Moms registration complete
- [ ] Union OSS registration complete
- [ ] UK VAT registration complete via HMRC
- [ ] Xero or QuickBooks set up for UK VAT MTD filing
- [ ] Wint set up + connected to Lunar Business
- [ ] Business bank account opened (Lunar Business)

### Payments

- [ ] Stripe account opened under Swedish AB, settles in SEK
- [ ] Stripe Tax enabled
- [ ] Swish + Klarna + SEPA + Link payment methods activated
- [ ] Stripe Billing + Invoicing Plus modules enabled
- [ ] VAT-compliant invoice template (Swedish moms, Union OSS reverse-charge, UK VAT on UK invoices)
- [ ] US state sales tax tracking dashboard (revenue-by-state; no registrations needed yet)

### Identity + deliverability

- [ ] Logto Cloud EU project created
- [ ] Postmark EU account provisioned
- [ ] `auth.coldanvil.com` subdomain with SPF/DKIM/DMARC aligned
- [ ] Cloudflare Turnstile on `/auth/magic-link`
- [ ] Rate limiting on `/auth/magic-link` (per-email + per-IP)

### Infrastructure

- [ ] Sentry EU project created (Hono + FastAPI + React)
- [ ] Plausible site created for coldanvil.com
- [ ] 1Password Individual subscription + `op` CLI installed
- [ ] GitHub Actions CI pipeline set up
- [ ] Cloudflare Status Page activated on `status.coldanvil.com`
- [ ] Audit log pipeline live (Postgres append-only + S3 Object Lock EU)

### Legal / compliance

- [ ] Iubenda pack purchased + Privacy Policy + Terms of Service published
- [ ] Right-to-erasure cascade designed + documented
- [ ] Sub-processor register published at `coldanvil.com/legal/sub-processors`
- [ ] DPAs signed: Logto, Stripe, Postmark, Plausible, Sentry, Cloudflare, hosting provider
- [ ] Trademark filings submitted: EUIPO + UK IPO for Cold Anvil (Class 42); Celyn (Classes 42 + 44) via IP agent

### Customer-facing

- [ ] `support@coldanvil.com` forwarded to Linear via Postmark inbound
- [ ] `billing.coldanvil.com` points to Stripe Customer Portal

### Deferred triggers (insurance + Celyn launch)

- [ ] Business insurance (If or Hiscox — PI + cyber + general liability) — trigger: first paying customer OR Celyn signs first clinic
- [ ] PUB (Swedish DPA) signed with all processors touching patient data — trigger: Celyn active
- [ ] Patientdatalagen compliance review by Swedish healthtech lawyer — trigger: Celyn active
- [ ] HIPAA BAA signed with IAM + payments providers — trigger: first US clinic onboarded
- [ ] IMY (Integritetsskyddsmyndigheten) incident reporting pathway documented — trigger: Celyn active
- [ ] Self-hosted Logto migration — trigger: HIPAA-adjacent requirement
- [ ] Stripe Connect account for Celyn branding — trigger: clinic procurement demands it
- [ ] Better Stack status page migration — trigger: first paying customer
- [ ] Neon paid tier (30-day PITR) — trigger: first paying customer

---

## 12. Cross-references

- **Vendor research:** `Research/iam_and_payments.md` — IAM and payments candidate analysis, pricing scenarios, integration architecture, migration paths.
- **Pricing + cost model:** `business_plan.md` — tiers, blended ARPU, cost per cascade, go-to-market.
- **Brand + voice:** `Cold_Anvil/BRAND.md` — invoice and customer-communication tone register.
- **Vision + strategic framing:** `../BACKGROUND-AND-VISION.md` — studio model, four strands, Celyn rationale.
- **Accelerator mechanics:** TBD — to be written when accelerator program design lands.
