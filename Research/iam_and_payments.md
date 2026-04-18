# Cold Anvil — IAM and Payments Infrastructure Research

**Status:** Open research — vendor choice not yet committed. Updated 2026-04-18 as a single source of truth synthesising two independent research passes (Claude Opus agent pass + OpenRouter fusion pass of Gemini/Kimi/Mercury). Where the two disagreed, prices and facts were verified against vendor pages; assumptions were reconciled against Cold Anvil's actual business plan.

**Assumed context:** Cold Anvil Studios is a Swedish-resident founder's business (Jack — Swedish + UK citizen, resident in Sweden). Planned incorporation: **Swedish AB** (see `Business_Plan/business_operations.md`). This matters throughout — Sweden is in the EU, so Union OSS handles EU cross-border VAT as a single registration; UK is rest-of-world post-Brexit; US state nexus applies independently; Celyn's clinical future engages Patientdatalagen (Swedish patient data law).

**Stack Cold Anvil is building against:** Vite + React frontend, Hono on Node at the edge/API layer, Python FastAPI for AI orchestration, Cloudflare Pages for marketing, Postgres as source of truth.

---

## 1. Executive call

- **IAM primary: Logto Cloud (EU region) at day one; migrate to self-hosted Logto when Celyn triggers HIPAA-adjacent requirements.** Fallback: Clerk. Secondary fallback: Better Auth self-hosted inside Hono.
- **Payments: Stripe-only from day one** (direct merchant, Swedish AB account). Decision driven by three Swedish-resident realities: (1) Union OSS via Skatteverket handles EU VAT as one quarterly filing, collapsing most of the MoR value proposition; (2) Stripe natively supports **Swish + Klarna + SEPA + Autogiro** — Paddle supports none of these directly, which is a real conversion hole for a Swedish-facing consumer product; (3) **Stripe Link** (cross-merchant one-click checkout) materially lifts conversion vs Paddle's Apple/Google Pay-only express path. Paddle noted as geographic overflow contingency only — revisit if UK VAT + US state nexus grow beyond a single accountant retainer.
- **Year-one monthly cost (IAM + payments combined):** at 100 paying users ~$245, at 1k users ~$2,470, at 10k users ~$24,700. Detailed in §9.
- **Don't defer:** the data model must treat `organization` as first-class from day one even though consumer users are singletons. Celyn clinics and the accelerator cohort both need it, and retrofitting multi-tenancy is the single most painful migration in auth.
- **Can defer:** SAML/OIDC-SSO, SCIM, fine-grained RBAC, step-up MFA, custom vanity domains per tenant, HIPAA BAA execution, Celyn's Stripe Connect account for clinic-branded invoices. All are add-on plugins/plans layered over the day-one choices.

---

## 2. Landscape — IAM as of April 2026

### The archetypes

1. **Embedded UI + hosted backend** — Clerk, Kinde, Descope. Ship a React `<SignIn />` component, checkout-grade polish, session + user + org out of the box. Price per MAU.
2. **Headless API** — Stytch, WorkOS AuthKit, Supabase Auth. Flexible, slightly more work, per-MAU pricing.
3. **Library in your app** — Better Auth, NextAuth/Auth.js. Runs in your Hono/Node process, writes to your Postgres. Free; compliance artefacts are yours to produce.
4. **Enterprise CIAM** — Auth0/Okta, ForgeRock, Ping. Priced for enterprise; painful for a solo founder.
5. **Self-hostable open-source** — Logto, Supertokens, FusionAuth, Ory Kratos, Keycloak. Free to self-host; managed SaaS if you want it.

### Where the market went between 2024 and 2026

- **Passkeys won as default.** Every serious vendor ships native passkey/WebAuthn support now. Magic link is the other universally-supported passwordless primitive. The passwordless debate is now about ergonomics (inline passkey prompts, autofill UX, step-up triggers) and data residency, not primitives.
- **Free tiers ballooned** under Better Auth's gravity. Clerk 50k MAU free ([pricing](https://clerk.com/pricing)). Logto 50k MAU free ([pricing](https://logto.io/pricing)). Supabase 50k MAU free ([pricing](https://supabase.com/pricing)). WorkOS AuthKit free to 1M MAU ([pricing](https://workos.com/pricing)).
- **Consolidation at the top:** Twilio acquired Stytch in November 2025 ([Sacra](https://sacra.com/c/stytch/)) — watch item for pricing/roadmap drift over 18 months.
- **WorkOS AuthKit pivoted from "enterprise SSO box" to full user management** — largest free tier in the market, but consumer UX polish lags Clerk.

### Two shapes most relevant to Cold Anvil

- **B2C consumer — coldanvil.com novice users.** Need: magic-link + passkey sign-in that looks decent, session management, zero friction.
- **B2B multi-tenant — Celyn clinics + accelerator cohort.** Need: organisations, role-based access, domain-verified membership, potentially SAML/OIDC SSO for larger clinical customers.

**Inflection:** Cold Anvil needs ONE IAM that credibly does both, because the studio model means you cannot run two identity stores.

---

## 3. IAM candidate dossiers

### 3.1 Logto (open-source, Cloud or self-host) — recommended primary

- **Passwordless:** Magic link, OTP, passkey all GA, not bolted on ([Logto passwordless](https://logto.io/products/passwordless)).
- **Hono:** Official JS/TS SDK, Edge-compatible. Standard OIDC flow; wire tokens manually.
- **Python/FastAPI:** Official `logto-python-sdk`. JWT verification via JWKS — no provider lock-in on the verify path.
- **Multi-tenant:** First-class organisations model; users-in-many-orgs with per-org RBAC supported, fits both Celyn clinics and accelerator cohort cleanly.
- **Theming / multi-brand:** Custom CSS, i18n, multi-domain (Pro/Enterprise tier).
- **Pricing (April 2026):** Free to 50k MAU Cloud. Pro from **$16/month base**, usage-priced thereafter on a tokens-consumed model (~$0.08 per 100 access tokens beyond 100k included) ([Logto billing](https://docs.logto.io/logto-cloud/billing-and-pricing)). Self-host is free forever.
- **EU data residency:** Cloud is available in EU region — genuinely important for a Swedish-incorporated entity and load-bearing for Celyn's eventual Patientdatalagen posture.
- **Compliance:** SOC 2 Type II on Logto Cloud. Self-hosted is your attestation to produce — but the path exists, and you sign your own BAA on self-hosted infra without paying a managed-vendor enterprise uplift.
- **Lock-in:** Low. Standard OIDC + JWTs. Migrating *to* Clerk from Logto is easy (standard exports); migrating *from* Clerk is hard (proprietary session state, opaque password hashes). Starting on Logto preserves optionality.

### 3.2 Clerk — recommended fallback

- **Passwordless:** Magic link, email OTP, native passkeys, SMS OTP, social. MFA including TOTP and passkey ([Clerk user auth](https://clerk.com/user-authentication)).
- **Hono:** Official middleware. Clean.
- **Python/FastAPI:** Official `clerk-backend-api` (GA after 2024-10 beta; [changelog](https://clerk.com/changelog/2024-10-08-python-backend-sdk-beta)). Community `fastapi-clerk-auth` middleware ([PyPI](https://pypi.org/project/fastapi-clerk-auth/)). Cleanest "one auth across Hono + FastAPI" on the market.
- **Multi-tenant:** `Organizations` primitive with teams, custom RBAC up to 10 roles, domain-verified membership, pre-built `<OrganizationSwitcher />`.
- **Pricing (April 2026):** Free to **50,000 MAU**. Pro **$25/month** with 10k MAU included, then **$0.02/additional MAU**. Organizations free up to 100 MAO, then **$1.00/additional MAO**. Verified against [Clerk pricing](https://clerk.com/pricing) April 2026.
- **Compliance:** SOC 2 Type II + **HIPAA (BAA signable on Pro)** ([Clerk HIPAA announcement](https://clerk.com/changelog/2022-05-06)). ISO 27001 status uncertain as of April 2026 (flagging).
- **Data residency:** US-primary. Celyn PHI + Schrems II considerations tilt against Clerk once clinical data enters the picture.
- **Lock-in:** Medium. User exports available, but session/org model is opinionated. A 10k-user migration is a 2-3 week job.

### 3.3 Better Auth (open-source TS library) — secondary fallback

- **Passwordless:** Native magic link + passkey via `@better-auth/passkey` ([docs](https://better-auth.com/docs/plugins/passkey)).
- **Hono:** First-class. Mount `auth.handler` at `/api/auth/*`; retrieve sessions via `auth.api.getSession({ headers })` ([Hono example](https://hono.dev/examples/better-auth)).
- **Python/FastAPI:** **No official Python SDK.** DIY session validation against a shared secret. Real friction point given Cold Anvil's dual-runtime architecture.
- **Multi-tenancy:** `organization` plugin with teams, roles, invites, RBAC ([docs](https://better-auth.com/docs/plugins/organization)). Newer and less battle-tested than Clerk's Organizations for B2B edge cases.
- **Pricing:** **Free forever.** Runs in your Hono process, writes to your Postgres.
- **Compliance:** Audit logging and compliance attestations are yours to build ([WorkOS on Better Auth](https://workos.com/blog/top-better-auth-alternatives-secure-authentication-2026)).
- **When it becomes compelling:** cost is binding, the team can absorb the ops, and you've decided FastAPI only ever consumes JWTs (no admin-API ergonomics needed on the Python side). Until then, Logto is the right OSS primary.

### 3.4 Other candidates — short form

| Candidate | Verdict |
|---|---|
| **Stytch** | Dealbreaker-adjacent: Twilio acquisition Nov 2025 creates 18-month uncertainty. Otherwise excellent — SOC2 / ISO27001 / HIPAA, strong B2B. Pricing: free to 10k MAU, consumer auth $0.01/MAU, B2B $0.05/MAU ([analysis](https://www.buildmvpfast.com/alternatives/stytch)). |
| **WorkOS AuthKit** | Free to 1M MAU ([pricing](https://workos.com/pricing)). Dark horse. Consumer UX polish lags Clerk noticeably; enterprise SSO DNA. Viable if you want a zero-cost identity backbone and own all UI. |
| **Supabase Auth** | Dealbreaker: no first-class organizations primitive. Only pick if also using Supabase as your DB — you're not. |
| **Supertokens** | Viable OSS fallback to Better Auth. Python SDK in the box. Slightly less TypeScript-idiomatic than Better Auth; slightly more Pythonic. Small team, still maturing. |
| **Auth0/Okta** | Priced wrong for Cold Anvil — ~10x Clerk/Logto at the same MAU tier. Only worth it if Celyn closes a regulated-healthcare enterprise demanding Okta-branded IAM. |
| **Descope** | $799/mo cliff when you outgrow the free 7.5k MAU tier ([pricing](https://www.descope.com/pricing)). Not primary. |
| **Kinde** | Interesting outlier: "paid users don't count toward MAU" pricing ([pricing](https://www.kinde.com/pricing/)) — effectively free for Cold Anvil's model. DX and community behind Clerk and Logto. |
| **FusionAuth** | Strong enterprise self-host option. Slower-moving than Better Auth. Worth knowing about as a Celyn option if clinics ever demand on-premise IAM. |
| **Ory Kratos** | Powerful, HIPAA-capable, but over-engineered for solo-founder stage. Requires Hydra for OAuth. Skip. |
| **Firebase Auth** | Google lock-in, no first-class B2B orgs. Skip. |
| **AWS Cognito** | Utility-grade. DX is rough, UI non-existent. Only if going all-in on AWS. |

### 3.5 Why Logto over Clerk for Cold Anvil specifically

Three reasons tip this for a Swedish-resident solo founder building toward Celyn:

1. **EU data residency.** Clerk is US-primary; Logto Cloud has an EU region. Patientdatalagen + Schrems II are real for Celyn's future, and data-residency posture is load-bearing for clinical customers.
2. **Migration asymmetry.** Starting on Logto preserves the option to move to Clerk later. Starting on Clerk closes the option to move back cleanly because Clerk hides password hashes and opinionated session state. Asymmetry favours the OSS-first choice.
3. **Self-host escape hatch for HIPAA.** When Celyn triggers BAA requirements, self-hosting Logto avoids Clerk's implicit enterprise uplift. The self-host migration is a configuration change, not a re-platform.

**What Clerk wins on, honestly:** novice UX is noticeably more polished. Pre-built UI components are prettier and require less design work. If the team genuinely cannot absorb the UI-build effort Logto requires, Clerk is the right fallback and you accept the migration risk downstream.

---

## 4. IAM comparison matrix

| Candidate | Passkeys | Magic link | Hono SDK | Python SDK | Organizations | EU residency | HIPAA BAA | 100 MAU | 1k MAU | 10k MAU | 50k MAU | Self-host | Lock-in |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Logto** | Native | Native | Official | Official | Native | Yes (Cloud EU) | Self-host = yours; Cloud Enterprise | $0 | $0 | $0-50 (Cloud free band) | $0-200 | Yes (MPL-2.0) | Low |
| **Clerk** | Native | Native | Official | Official GA | Native | US-primary | Yes (Pro) | $0 | $0 | $25 | $25 + ($0.02×40k) = $825 | No | Medium |
| **Better Auth** | Plugin | Plugin | First-class | DIY | Plugin | N/A (you host) | DIY | $0 | $0 | $0 | $0 | Yes | Minimal |
| **WorkOS AuthKit** | Native | Native | JS SDK | Official | Native | Yes | Yes | $0 | $0 | $0 | $0 (free to 1M) | No | Medium |
| **Stytch** | Native | Native | JS SDK | Official | Native (B2B) | Yes | Yes | $0 | $0 | $0 | $400 ($0.01×40k) | No | Medium |
| **Supertokens** | Native | Native | JS SDK | Official | Native | Self-host | SOC2 | $0 | $0 | $100 cloud; $0 self-host | $900 cloud | Yes | Low |
| **Descope** | Native | Native | JS SDK | Official | Native | Yes | Yes | $0 | $0 | $0 → cliff to $799 | $799+ | No | Medium |
| **Kinde** | Native | Native | JS SDK | Official | Native | Yes | SOC2 | $0 | $0 | $0 | $0 (paid users don't count) | No | Medium |
| **Auth0** | Native | Native | Official | Official | Higher tiers | Yes | Yes (enterprise) | $35 | ~$240 | ~$700-1000 | ~$2500+ | No | High |
| **Supabase Auth** | Native | Native | JS SDK | Official | No (DIY via RLS) | Yes | Team $599/mo | $0 | $0 | $0 | $0 | Yes | Low |
| **FusionAuth** | Native | Native | JS SDK | Official | Tenants | Self-host | Enterprise Ed. | $0 self-host | $0 | $0 | $0 self-host | Yes | Low |
| **AWS Cognito** | Native | Limited | JS SDK | Official | User pools ≈ tenants | AWS regions | AWS BAA | $0 | $0 | $0 | ~$600 ($0.015×40k) | No | High |

---

## 5. Landscape — Payments as of April 2026

### The two axes that matter

1. **Merchant of Record vs payment processor.** MoR (Paddle, Polar.sh) takes legal responsibility for tax, invoicing, chargebacks. Payment processor (Stripe, direct merchant) leaves you as seller of record — you register for VAT/GST/sales tax in each jurisdiction.
2. **Subscription-native vs usage-native.** Stripe does both acceptably. Paddle does subscriptions very well, usage adequately. Orb does usage brilliantly, subscriptions via Stripe.

### Trend through early 2026

- **Stripe Billing Meter GA'd 2024** and launched LLM token billing March 2026 ([metered billing software](https://schematichq.com/blog/metered-billing-software)) — native AI-usage metering without dragging in Orb for simple cases.
- **Stripe Billing fee moved from 0.5% to 0.7%** on 30 June 2025 for new customers ([analysis](https://feetrace.com/blog/stripe-billing-fees-for-subscription-saas-in-2026)).
- **Stripe Invoicing Plus** handles net-30, purchase orders, ACH/BACS/SEPA Direct Debit, VAT-compliant invoices — the B2B story is mature.
- **Lemon Squeezy ≈ Stripe-owned** (acquired/deeply-aligned in 2024). Standalone roadmap effectively frozen. Do not build on it.
- **Paddle remains the only uncompromised independent global-scale SaaS MoR** as of April 2026.
- **Polar.sh** emerged as the developer-first MoR alternative with the lowest headline rate (4% + $0.40) ([pricing](https://polar.sh/resources/pricing)).

---

## 6. Payments candidate dossiers

### 6.1 Stripe (Billing + Tax + Invoicing Plus + Link) — recommended primary

- **Status:** Payment processor, not MoR. You are the Swedish seller, legally. For a Swedish AB, this is a tractable responsibility because Union OSS via Skatteverket handles EU cross-border VAT as a single quarterly filing.
- **Fees (April 2026):** Cards 1.5% + 25 öre domestic EU / 2.9% + 30¢ international. International card surcharge +1.5%, currency-conversion +1%. Billing add-on **0.7%**. Invoicing Plus **0.5%** per paid invoice. Stripe Tax **0.5%** of transactions where it runs ([Stripe pricing](https://stripe.com/pricing), [Billing pricing](https://stripe.com/billing/pricing), [Tax pricing](https://stripe.com/tax/pricing)).
- **Local payment methods — the decisive factor for a Swedish-facing consumer product:**
  - **Swish** (Swedish mobile payment, dominant consumer rail) — native ([Stripe Swish docs](https://docs.stripe.com/payments/swish)).
  - **Klarna** (pay now, pay later, pay in 3/4, financing) — native. Klarna's BNPL is a real conversion lever on the £200/mo Ship It tier specifically, and Klarna Pay Now is widely preferred over cards in the Nordics.
  - **SEPA Direct Debit** + **Autogiro** (Swedish B2B direct debit) — native. Required for Celyn clinics.
  - **iDEAL** (Netherlands), **Bancontact** (Belgium), **Giropay** (Germany), **BLIK** (Poland), **Przelewy24** — all available if EU expansion warrants.
- **Checkout UX — Stripe Link:** Cross-merchant one-click checkout identity network. A returning Cold Anvil user who has used Link elsewhere (on any Stripe-powered site) skips card entry entirely. Published data from Stripe shows meaningful conversion lift vs hosted card forms. Paddle has no equivalent — it falls back to Apple Pay / Google Pay for express checkout.
- **Usage metering:** Billing Meter GA 2024. Mature. Tier/graduated/volume pricing models ([docs](https://docs.stripe.com/billing/subscriptions/usage-based)).
- **B2B invoicing (for Celyn when it ships):** **Invoicing Plus** — net-30, PO numbers, ACH/BACS/SEPA/Autogiro Direct Debit, VAT-compliant, dunning, auto-advance.
- **Tax automation:** Stripe Tax calculates for 50+ countries; validates VAT numbers asynchronously. **Calculates but does not remit.** You register and file.
- **Swedish-seller specifics:** Stripe account opens in Sweden, settles in SEK; SEPA/EUR/USD all supported. Works cleanly with a Swedish AB.
- **SDKs:** `stripe-node` and `stripe-python` — both industry-leading.
- **Webhooks:** Best in industry. Signed, retried, idempotency keys, event replay in dashboard.

### 6.2 Paddle (Merchant of Record) — contingency only

- **Status:** **Merchant of Record.** Paddle is the legal seller to your customer; they handle VAT/GST/sales tax globally, including EU reverse-charge VAT for B2B and US state sales tax ([Paddle VAT help](https://www.paddle.com/help/sell/tax/how-paddle-handles-vat-on-your-behalf)).
- **Fees:** Headline **5% + $0.50** per transaction ([pricing](https://www.paddle.com/pricing)). Effective rate ~**7%** once currency conversion (2-3% margin vs mid-market) and international-card surcharges stack ([fees explained](https://dodopayments.com/blogs/paddle-fees-explained)). Volume discounts at $100-300k/mo commonly reach **3.5-4%**.
- **Gaps that matter for a Swedish-facing consumer product:**
  - **No native Swish** — Swedish consumers expect it.
  - **No native Klarna** at Paddle's checkout layer (as of April 2026 — verify before contract). Klarna is load-bearing for Nordic BNPL conversion.
  - **No cross-merchant one-click identity network** (no Stripe-Link equivalent). Falls back to Apple Pay / Google Pay for express checkout.
  - **No BACS / Autogiro Direct Debit** — weak for Celyn B2B invoicing when it arrives.
- **Usage metering:** Composable pricing + usage-based metering. Adequate for simple per-unit metering; highly complex usage hits API limits.
- **Tax automation:** Complete — calculates and remits in 30+ countries including full EU, UK, US, Canada, Australia.
- **SDKs:** Official `@paddle/paddle-node-sdk` and `paddle-python`. DX is good; not quite Stripe level.
- **When to revisit:** if UK VAT + US state nexus grow into a tax-ops burden that exceeds a single accountant retainer, Paddle becomes viable as a geographic-overflow MoR for non-EU B2C (Union OSS already handles EU from Sweden). Unlikely to hit that threshold before 10k paying users.

### 6.3 Why Stripe-only for a Swedish-resident founder

For a UK-based founder, the MoR premium on Paddle would be earning its keep — non-Union OSS for EU plus UK domestic plus US state nexus plus rest-of-world is a real burden. Swedish residence changes the maths:

- **Union OSS via Skatteverket** collapses ~25 EU jurisdictions into one quarterly filing. This is the biggest single tax lever the Swedish tax code offers a digital-services founder.
- **Stripe's Swedish payment-method coverage is decisive for a consumer product selling to Swedes and Nordics.** Swish + Klarna together cover the dominant non-card Swedish consumer preferences; Paddle covers neither natively. Missing these is conversion lost on the home market.
- **Stripe Link is a real conversion lever.** Cross-merchant one-click checkout beats Apple/Google Pay fallback on desktop where most B2B Celyn decisions are made, and on mobile for returning users who've used Link elsewhere.
- **Stripe's Invoicing Plus + Autogiro + SEPA** are already in place for Celyn when it ships. One Stripe account serves both surfaces.
- **Remaining tax-ops burden:** UK VAT registration + quarterly MTD filing (one jurisdiction, one provider — Xero or QuickBooks handles the mechanics), and US state sales tax tracking (unlikely to cross nexus thresholds before 10k paying users at ~$61 blended ARPU). Manageable with a £500-1,500/year accountant retainer.

The MoR premium (~2-3pp of revenue) pays for itself only when you can't personally handle the tax ops. As a Swedish AB with Union OSS, at day-one scale, you can. The trade goes the other way.

### 6.4 Other candidates — short form

| Candidate | Verdict |
|---|---|
| **Lemon Squeezy** | Stripe-owned since 2024. Sunset risk. Do not build on it. |
| **Polar.sh** | Lowest headline fee (4% + $0.40). Developer-first. B2B invoicing immature — not right for Celyn. Revisit in 2027 if B2B story matures. |
| **Chargebee** | Subscription layer on top of Stripe. **Overkill at day one** — platform fees (~$249-599/mo) not justified until $1M+ ARR with genuinely complex pricing. |
| **Orb** | Usage metering layer on Stripe. Only relevant if cascade-depth metering grows into complex dimensional pricing. Stripe Billing Meter covers simple cases. **Defer.** |
| **Recurly** | Direct merchant with enterprise subscription engine. $1M TPV minimum. Not year-one. |

---

## 7. Payments comparison matrix

| Candidate | MoR? | Base fee (intl sub) | Swish | Klarna | One-click ID network | SEPA/Autogiro | EU VAT (Swedish AB) | UK VAT | US sales tax | Usage metering | B2B invoices |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Stripe + Tax + Invoicing Plus + Link** | No | ~4.5-5% all-in | **Native** | **Native** | **Stripe Link** | Native | Calculates; you remit via Union OSS | Calculates; you register + remit | Calculates; you register + remit | Excellent (Billing Meter) | **Excellent (Invoicing Plus)** |
| **Paddle** | Yes | ~7% effective | No | No (verify) | No (Apple/Google Pay only) | No Autogiro / BACS | Fully handled | Fully handled | Fully handled | Adequate | Solid, no BACS/Autogiro |
| **Lemon Squeezy** | Yes (but sunset risk) | 5% + $0.50 + 1.5% intl | No | No | No | Limited | Fully handled | Fully handled | Fully handled | Basic | Basic |
| **Polar.sh** | Yes | 6% + $0.40 (intl sub) | No | No | No | Limited | Fully handled | Fully handled | Fully handled | Yes (linear) | Weak |
| **Chargebee** | No | Platform fee $249-599/mo + Stripe | Via Stripe | Via Stripe | Via Stripe Link | Via Stripe | Via AvaTax (add-on) | Via AvaTax | Via AvaTax | Excellent | Excellent |
| **Orb** | No | Custom + Stripe | Via Stripe | Via Stripe | Via Stripe Link | Via Stripe | Via Stripe Tax | Via Stripe Tax | Via Stripe Tax | **Best-in-class** | Via Stripe |

---

## 8. Integration story — the Cold Anvil user flow

Concrete walk-through using **Logto + Stripe**, Cold Anvil's Hono + FastAPI architecture, and the journey in `respec/03-spec.md`.

### 8.1 Architecture

```
Cloudflare Pages (marketing: coldanvil.com, celyn.health)
        │
        ▼
Hono on Node (api.coldanvil.com)
   ├── IAM: Logto SDK, JWT session middleware
   ├── Billing: Stripe adapter (consumer subscriptions + Celyn B2B invoices)
   └── Webhook sinks: /webhooks/{stripe,logto}
        │
        ▼  EdDSA-signed JWT (10-min access + rotating refresh, HttpOnly)
Python FastAPI (Annie orchestration)
   └── JWKS verification (no round-trip to IAM)
        │
        ▼
Postgres (source of truth: users, orgs, subscriptions, entitlements)
```

### 8.2 End-to-end novice flow

1. User lands on `coldanvil.com`, types into the Annie chat field. Site posts to `POST /api/sessions/anonymous` on Hono. Hono creates a **guest session** (Logto guest user + `project_id` in Postgres). Annie starts conversing with no sign-up friction — matters, the spec demands text field with no form.
2. Discovery conversation proceeds anonymously. The project is real, tied to a guest token with `owner_user_id = null`.
3. **First commitment moment** — user asks Annie to publish, OR returns after X minutes, OR asks to keep their work. Hono returns `{ "next": "claim_account" }`.
4. Logto sign-in flow mounts. **Magic link is the default CTA; passkey offered below.** No password field is rendered — Logto's passwordless-only config. Deliverability via **Postmark** on `auth.coldanvil.com` with SPF/DKIM/DMARC aligned.
5. User enters email → OTP or magic link → authenticated. Logto prompts — gently, skippably — to enrol a passkey for next time. No blocking MFA nag screen ever.
6. Guest project is claimed: Hono calls `PATCH /projects/:id { owner_user_id }`. Guest session converts to authenticated.

### 8.3 Pricing page → Stripe Checkout (consumer)

7. Free tier delivers the vision. Tier boundary fires — UI shows "Unlock Shape It for £29/month."
8. Hono hits `POST /api/billing/checkout` → Stripe `checkout.sessions.create` with `client_reference_id = user.id`, `metadata = { user_id, org_id, brand: "cold_anvil" }`, and `payment_method_types` including `card`, `swish`, `klarna`, `sepa_debit`, `link`.
9. Stripe Checkout auto-detects returning Link users → **one-click completion**. First-time users see card + Swish + Klarna + SEPA as local payment options. Stripe Tax applies VAT based on billing address + IP.
10. On success: `checkout.session.completed` + `customer.subscription.created` webhooks fire.

### 8.4 Webhook provisioning — the critical handoff

11. Stripe webhook → `POST /api/webhooks/stripe`. Hono verifies signature, **deduplicates on `event.id`** in Postgres (unique constraint), looks up Logto user by `client_reference_id`.
12. Hono updates Logto user metadata: `tier: "shape_it"`, `stripe_customer_id`, `stripe_subscription_id`, `status: "active"`. **Logto becomes source of truth for entitlements** — every downstream auth check (Hono, FastAPI) reads tier from the JWT claim, not a DB call.
13. Hono also persists `subscriptions` row in Postgres for analytics + dunning. Logto metadata is cache; Postgres is record.
14. Annie's next turn sees `tier=shape_it` in the JWT and unlocks cascade depth.

### 8.5 Celyn B2B flow (same Stripe account, different product surface)

15. Clinic admin is invited via Logto `Organization`. Magic link → org-scoped session. Brand chrome switches to Celyn (`app.celyn.health`).
16. Subscription is org-level, not user-level. **Stripe customer = org**, not user.
17. Celyn uses **Stripe Invoicing Plus**: net-30, PO numbers, ACH/SEPA Direct Debit, Autogiro for Swedish clinics, BACS for UK.
18. Clinicians inside the org inherit entitlements via org membership; RBAC roles: `owner | clinician | auditor | billing`.
19. **Step-up MFA** (WebAuthn re-prompt or TOTP) required before viewing any PHI-tagged row.
20. If clinic procurement requires invoices from "Celyn AB" rather than "Cold Anvil AB," set up a second Stripe Connect account under the same AB. Defer until requested.

### 8.6 Accelerator cohort

21. Cohort members belong to **two orgs simultaneously**: (a) their startup's own workspace, (b) `accelerator_cohort_N` community org with read-only perms to shared resources. Logto's organisations model supports users-in-many-orgs with per-org roles natively.

### 8.7 FastAPI verifying the user

22. Hono forwards Logto session token as `Authorization: Bearer <token>`.
23. FastAPI middleware uses `logto-python-sdk` to validate JWT against Logto's JWKS. Returns `user_id`, `org_id`, `tier`.
24. Python orchestrator gates cascade depth on `tier`. Private-first inference unaffected — no identity data leaves the fleet.

### 8.8 The single critical data-model rule

**Every table holding billable or personal data carries BOTH `user_id` and nullable `org_id`.** Row-level authorisation accepts either the user owning the row or the user being a member of the org owning the row. Do this from day one even though consumer users have `org_id = null`. This is what makes the Celyn rollout a configuration change, not a schema migration.

### 8.9 IAM identity → payments linkage

Always attach IAM identity in **two fields** on Stripe:

- `client_reference_id` on Checkout Sessions, `customer.external_id` on Customer records — Stripe's indexable field.
- `metadata.user_id` and `metadata.org_id` — for webhook reconciliation + analytics.

Never rely on email alone. Users change emails, orgs share emails, emails are not stable keys.

---

## 9. Pricing scenarios

**Assumptions** — reconciled against Cold Anvil's business plan:

- Tier mix: 50/35/15 across Tier 1 ($29) / Tier 2 ($49) / Tier 3 ($200).
- Blended ARPU: `0.5×29 + 0.35×49 + 0.15×200 = $61.65/mo`.
- Free-tier users: ~5x paying users (typical B2C SaaS funnel). So 100 paying → ~600 MAU.
- Currency: USD for international comparison; Stripe settles Swedish AB account in SEK.
- Stripe effective rate on international consumer subscriptions: 2.9% + $0.30 card + 1.5% international + ~1% currency conversion + 0.7% Billing + 0.5% Tax ≈ **~5.6% + $0.30 all-in** for international cards. Swedish-domestic Swish/Klarna payments: much lower — Swish ~1% + 25 öre; Klarna ~3-5%; SEPA Direct Debit 0.8% + €0.30.
- Assume payment-method mix: 60% international card, 25% domestic Swish/Klarna, 15% other local. Blended effective rate: **~4%**.

### 9.1 Recommended stack — Logto + Stripe

#### 100 paying users

- Total MAU: ~600. **Within Logto Cloud free 50k.**
- Logto: $0.
- Stripe: 4% × ($61.65 × 100) + ($0.30 × 100) = **~$245/mo** + $30 = **~$275/mo**.
- UK VAT accountant retainer (amortised): **~$125/mo** (£500-1,500/yr).
- **Total: ~$400/mo.**

#### 1,000 paying users

- Total MAU: ~6,000. **Still within Logto free 50k.**
- Logto: $0.
- Stripe: 4% × $61,650 + ($0.30 × 1000) = **~$2,766/mo** + $300 = **~$3,066/mo**. Actually lower in practice once domestic-rail mix grows — Swedish consumers gravitate to Swish for recurring payments, bringing effective rate down.
- UK VAT accountant retainer: **~$125-250/mo**.
- **Total: ~$3,200/mo.**

#### 10,000 paying users

- Total MAU: ~60,000. **Exceeds Logto free 50k.**
- Logto: Cloud paid tier — **~$50-200/mo** depending on tokens-consumed pricing ([billing docs](https://docs.logto.io/logto-cloud/billing-and-pricing)). Or self-host at ~$120/mo (small EU VPS + managed Postgres).
- Stripe: 4% × $616,500 + ($0.30 × 10000) = **~$27,660/mo**. Celyn B2B invoicing (if live) adds ~$2-4k/mo processing on ~200 clinic customers.
- Tax-ops scales: US state nexus tracking starts to bite; add ~$500-1,000/mo for a part-time specialist or firm retainer.
- **Total at 10k paying users: ~$29k-32k/mo.**

### 9.2 Fallback stack — Clerk + Stripe

| Scale | Paying | MRR | Clerk | Stripe + tax ops | **Total** |
|---|---|---|---|---|---|
| 100 | 100 | $6,165 | $0 (free tier) | ~$400 | **~$400/mo** |
| 1,000 | 1,000 | $61,650 | $0 (free tier, 6k MAU) | ~$3,200 | **~$3,200/mo** |
| 10,000 | 10,000 | $616,500 | $1,025 + ~$100 MAO | ~$28,000 | **~$29,125/mo** |

### 9.3 Stripe-only vs Paddle-alternative delta

If you'd gone Paddle-only on the consumer side instead:

| Scale | Stripe (recommended) | Paddle alternative | Delta |
|---|---|---|---|
| 100 paying | ~$400/mo | ~$431/mo | Stripe saves ~$30/mo |
| 1k paying | ~$3,200/mo | ~$3,100/mo (with negotiation) | Paddle saves ~$100/mo |
| 10k paying | ~$29,000/mo | ~$25,800/mo (rack) | Paddle saves ~$3,200/mo **but you lose Swish + Klarna + Link + Autogiro** |

At 10k users, Paddle looks ~$3k/mo cheaper on pure processing fees — but you've traded away Swish/Klarna/Link for Swedish consumers (real conversion drag) and any Celyn B2B story. The ~$3k/mo saving doesn't survive the conversion loss on the home market, let alone Celyn's invoicing needs.

### 9.4 ⚠ Verify before commitment

- Clerk HIPAA BAA tier (research suggests Pro; one source suggested enterprise-only — confirm directly).
- Logto Cloud paid-tier pricing model (token-based and still evolving).
- Stripe Klarna availability for subscription billing in Sweden (most markets yes; verify for recurring specifically).
- Stripe Swish availability for subscription billing (GA for one-off payments; recurring Swish mandates via Autogiro is the normal pattern).
- Stripe Tax + Invoicing Plus bundle behaviour when a UK VAT number is added.

---

## 10. Risks, lock-in, migration paths

### 10.1 IAM risks

| Risk | Probability | Impact | Mitigation | Exit path |
|---|---|---|---|---|
| Logto self-host ops overhead exceeds solo-founder capacity | Medium | Outages during clinical hours severe | Stay on Logto Cloud until Celyn HIPAA triggers self-host; use managed Postgres (Neon) + Fly.io when you do | Clerk import via standard JWT + user export |
| Logto abandons open-source posture | Low-Medium | Forces migration | Mirror user state in Postgres via webhooks from day one | Swap verify layer; standard JWT |
| Clerk repricing (already 2 times in 2 years) | Medium | Cost drift | Monitor quarterly; fallback is Better Auth self-host | Weekend migration at 10k users |
| Passkey re-enrollment pain on any IAM migration | High (if migration happens) | User friction | Keep magic link as permanent universal fallback | Inherent |
| Organizations edge cases (user-in-many-orgs with per-org roles) | Medium | Blocks cohort + clinic scenarios | Test with real data during beta; WorkOS B2B is the backup | WorkOS or Stytch B2B migration |

### 10.2 Payments risks

| Risk | Probability | Impact | Mitigation | Exit path |
|---|---|---|---|---|
| Stripe Tax mis-calculation → underpayment penalty in a US state | Medium | Fines, back-tax | Retain Swedish accountant with US nexus specialisation; file conservatively; use Stripe Tax reports as source-of-truth input to accounting software | Full reconciliation quarterly |
| UK VAT (MTD) filing error | Medium | HMRC penalty | Xero or QuickBooks with MTD filing built in; accountant reviews quarterly | Correction filing |
| Stripe outage during launch moment | Low | Short-lived but visible | Stripe's uptime track record is excellent; status page monitored; retry-on-idempotency-key pattern in all write flows | Accept brief outage |
| Chargeback on Celyn clinic revokes access mid-shift | Medium | **Patient safety + reputational** | **Do NOT auto-revoke on `charge.dispute.created`.** Gate revocation on `subscription.deleted` + 30-day grace for Celyn, 7-day for consumer | Billing state machine decoupled from auth entitlements |
| Tax-ops burden grows beyond solo-founder capacity | Medium at scale | Time drain | Trigger: UK + US filing time >8 hrs/quarter, or nexus in >3 US states. Add Paddle for non-EU B2C as overflow; keep Stripe for EU + Celyn | Paddle geographic overflow |
| Swedish regulator (Finansinspektionen) classifies recurring Swish/Autogiro mandates as payment service provision | Low | Regulatory load | Monitor FI guidance; Stripe handles PSP licensing on our behalf as long as we're a merchant, not a payment facilitator | Adjust product model |

### 10.3 Year-2 migration scripts

- **IAM primary fails:** user state mirrored in Postgres (canonical UUIDs, emails, org memberships). Magic-link re-auth = one campaign email. Passkeys are the casualty — re-enrollment required because `rpId` changes.
- **Payments migration (if ever):** Stripe → anything is painful — PCI scope does not transfer. Standard pattern: run dual providers for 12-18 months, new subs to new provider, existing subs stay on Stripe until natural expiry.
- **Tax-ops overflow to Paddle:** selective — point non-EU B2C checkout flows at Paddle while keeping EU + Celyn on Stripe. Not a migration, a geographic split added at the edge.

---

## 11. Day-one must-haves vs deferred

### 11.1 Day-one non-negotiable

1. **Passwordless-only data model.** No `password_hash` column anywhere — not nullable, not deprecated — **absent.** Prevents any future code path from silently regressing to password auth. If a provider's schema insists on it, store random high-entropy data no flow can set or verify.
2. **Magic link + passkey as concurrent paths.** Passkey enrollment deferred to first high-value action (not a blocking MFA nag screen).
3. **SCA-compliant checkout** (Stripe handles natively via 3DS2).
4. **User state mirrored into Cold Anvil's own Postgres via webhooks** — single decision that preserves every future migration option.
5. **Multi-tenant schema from day one.** `users`, `organizations`, `memberships` (with role per membership). Retrofit is 10x harder than supporting it at zero users.
6. **Multi-brand domain support.** `app.coldanvil.com`, `app.celyn.health` — each with brand-appropriate IAM chrome. Test before first paying customer.
7. **GDPR baseline.** Signed DPA with IAM + payments provider, sub-processor register on `coldanvil.com/legal/sub-processors`, EU-region data for Logto, right-to-erasure pipeline that cascades IAM + Stripe + DB.
8. **Webhook signature verification + idempotency** on every inbound event (Stripe, Logto). Deduplicate on `event.id` in Postgres with a unique constraint.
9. **Email deliverability for magic links.** Postmark or Resend on dedicated subdomain with SPF/DKIM/DMARC aligned. Monitor bounce rate <2%. Dedicated IP past ~50k sends/month.
10. **Rate limiting + bot protection on `/auth/magic-link`.** Cloudflare Turnstile (free) in front; per-email and per-IP throttles in Hono. Passwordless endpoints are the single highest-abuse surface on SaaS.
11. **Sandbox parity.** Stripe test mode + Logto dev tenant wired into local dev + CI. Webhook tunnelling via Stripe CLI / Logto local tunnel.
12. **Accessibility audit** of IAM + checkout flows. WCAG 2.2 AA minimum. Clinicians include disability accommodations; NHS procurement checks for this.
13. **Audit log pipeline from day one.** Even pre-HIPAA, capture `auth.login`, `auth.step_up`, `billing.subscription.*`, `phi.access` (Celyn) into append-only store (Postgres + S3 Object Lock). Retention: 6 years HIPAA-adjacent, 3 years otherwise.
14. **Session cryptography:** EdDSA (Ed25519) for JWT signing where supported, RS256 fallback. Rotating refresh tokens with reuse detection (any replay invalidates the family). Access tokens ≤15 min. Device binding via WebAuthn credential for passkey users.
15. **Currency decision:** price Cold Anvil consumer in **USD** (international default); Celyn in **SEK/GBP/EUR** per customer geography. Stripe handles presentment currency per Price object. Do not attempt multi-currency consumer storefronts on day one.

### 11.2 Defer until specific trigger

- **HIPAA BAA signing** → when Celyn ships real PHI (first clinic contracted).
- **Self-hosting Logto** → HIPAA trigger or ops cost math tilts at ~5k paying users.
- **Usage metering** → when cascade-tier pricing proves insufficient; start fixed-tier.
- **Orb** → when Stripe Billing Meter hits dimensional-pricing limits.
- **SAML/SSO for enterprise clinics** → first clinic asks; layer WorkOS or Logto Enterprise as add-on, not replacement.
- **Dedicated vanity domains per sister product** beyond Fourth Age + Celyn → fourth sister product.
- **Hardware-token MFA / FIDO2 beyond passkeys** → enterprise customer requirement.
- **Fine-grained per-token AI metering** → gross margin squeeze on a specific tier.
- **Step-up MFA with TOTP** → passkeys cover this for now.
- **Chargebee/Recurly migration** → Stripe Billing hits a genuine wall (unlikely pre-£5M ARR).
- **Celyn as separate Stripe Connect account** → clinic procurement demands "Celyn AB" branding on invoices rather than "Cold Anvil AB." Plan schema for user↔customer linking so this is a config change.

---

## 12. Open considerations + blind spots

1. **MHRA / FDA CDS classification for Celyn.** Lighter-touch regulatory corridor (MHRA SaMD guidance; FDA section 520(o) non-device CDS exemption). IAM doesn't drive classification, but audit log integrity, user identification provenance, and change management records from IAM feed the technical file. Confirm with regulatory counsel that append-only Postgres + S3 Object Lock meet evidence standards.
2. **Swedish seller specifics.** Cold Anvil AB should register for moms (VAT), F-skatt, and Union OSS via Skatteverket for EU cross-border digital sales. UK VAT registration required from £1 of UK digital sales. US state economic nexus tracked independently ($100k in-state revenue or 200 transactions, state-dependent). Engage a Swedish accountant who specialises in digital/SaaS international sales — not DIY. See `Business_Plan/business_operations.md` for full setup.
3. **Patientdatalagen (Swedish patient data law) for Celyn.** Stricter than UK/GDPR baseline. Data residency posture (Logto EU) and append-only audit logs are load-bearing.
4. **Accelerator cohort data model.** Cohort = `organization` of type `cohort`; user's startup = separate `organization` of type `workspace`. Shared cohort resources at cohort level. Implement via `membership.role_per_org` rather than flat `is_admin` bit.
5. **SIEM / audit-log export.** Logto Cloud log export via webhook stream → Datadog/Elastic/S3. Self-hosted Logto = direct Postgres tail. HIPAA retention 6 years from creation or last effective date. Plan for Object Lock.
6. **DPA and sub-processor chain (GDPR Article 28).** Logto, Stripe, Postmark/Resend, Cloudflare all publish DPAs and sub-processor lists. Maintain living register; notify Celyn clinics 30 days before changes.
7. **Novice UX — hiding tenancy.** Schema has orgs; UI must not. Pattern: user's personal workspace rendered as "Your projects" with no org picker until they join a second org. Only Celyn and cohort UIs expose the org switcher.
8. **Chargeback → access revocation.** Do NOT auto-revoke on `charge.disputed`. Trigger on `subscription.deleted` + grace period (7 days consumer, 30 days Celyn). Patient safety implication for Celyn is load-bearing.
9. **FX and presentment currency.** Stripe supports presentment currency per Price. Start two storefronts (USD Cold Anvil global, SEK/GBP Celyn). Defer EUR presentment until demand measured.
10. **Pricing freshness caveat.** Every exact figure here was drawn from vendor pricing pages as of April 2026. Verify current list prices 72 hours before any contract signature — especially Clerk (historically revised annually), Auth0 (bundled tier changes), Paddle (fee negotiation), Logto Cloud (tier structure still evolving).

---

## 13. Confidence flags

- ✓ **Firm** April 2026: Clerk free tier 50k MAU, Pro $25/mo ([clerk.com/pricing](https://clerk.com/pricing)); Stripe card fees 2.9% + 30¢ international, 1.5% + 25 öre EU domestic ([stripe.com/pricing](https://stripe.com/pricing)); Stripe Billing 0.7% ([stripe.com/billing/pricing](https://stripe.com/billing/pricing)); Stripe Tax 0.5% ([stripe.com/tax/pricing](https://stripe.com/tax/pricing)); Stripe Swish native ([docs.stripe.com/payments/swish](https://docs.stripe.com/payments/swish)); Stripe Klarna native; Stripe Link cross-merchant one-click; WorkOS AuthKit free to 1M MAU ([workos.com/pricing](https://workos.com/pricing)); Logto Cloud free to 50k MAU + Pro from $16/month ([logto.io/pricing](https://logto.io/pricing)).
- ~ **Uncertain for April 2026:** Clerk ISO 27001; Stripe Klarna and Swish subscription-recurring support details (one-off confirmed, recurring typically via Autogiro mandate); Stytch roadmap post-Twilio acquisition; Clerk HIPAA tier exact (Pro per one source, Enterprise per another — verify).
- ~ **Negotiable, not rack:** Clerk Enterprise pricing custom; Stripe interchange+ pricing negotiable at scale; Paddle fees at $50k+ MRR commonly 3.5-4% not 5% (relevant if ever used as overflow).
- ✗ **Do not rely on** per-MAU or per-transaction prices lower than listed rack rate for any vendor without direct sales conversation.

---

## 14. Sources

**IAM primary vendor pages:**
- [Clerk pricing](https://clerk.com/pricing), [Clerk Organizations](https://clerk.com/organizations), [Clerk Python SDK](https://pypi.org/project/clerk-backend-api/), [fastapi-clerk-auth](https://pypi.org/project/fastapi-clerk-auth/), [Clerk HIPAA + SOC 2 announcement](https://clerk.com/changelog/2022-05-06)
- [Logto pricing](https://logto.io/pricing), [Logto billing docs](https://docs.logto.io/logto-cloud/billing-and-pricing), [Logto passwordless](https://logto.io/products/passwordless)
- [Better Auth](https://better-auth.com/), [Better Auth Hono example](https://hono.dev/examples/better-auth), [organization plugin](https://better-auth.com/docs/plugins/organization), [passkey plugin](https://better-auth.com/docs/plugins/passkey), [WorkOS on Better Auth alternatives](https://workos.com/blog/top-better-auth-alternatives-secure-authentication-2026)
- [WorkOS pricing](https://workos.com/pricing), [WorkOS AuthKit Magic Auth](https://workos.com/docs/authkit/magic-auth), [FastAPI + AuthKit](https://workos.com/blog/securing-a-fastapi-server-with-workos-authkit)
- [Stytch](https://stytch.com/), [Stytch compliance](https://stytch.com/docs/resources/security-and-trust/compliance), [Stytch Twilio acquisition (Sacra)](https://sacra.com/c/stytch/)
- [Supabase pricing](https://supabase.com/pricing), [Supertokens pricing](https://supertokens.com/pricing), [Auth0 pricing](https://auth0.com/pricing), [Descope pricing](https://www.descope.com/pricing), [Kinde pricing](https://www.kinde.com/pricing/)
- [FusionAuth pricing](https://fusionauth.io/pricing), [Firebase Auth costs](https://www.metacto.com/blogs/the-complete-guide-to-firebase-auth-costs-setup-integration-and-maintenance), [AWS Cognito pricing](https://costgoat.com/pricing/amazon-cognito)

**Payments primary vendor pages:**
- [Stripe pricing](https://stripe.com/pricing), [Stripe Billing pricing](https://stripe.com/billing/pricing), [Stripe Tax pricing](https://stripe.com/tax/pricing), [Stripe usage-based docs](https://docs.stripe.com/billing/subscriptions/usage-based), [Stripe Swish docs](https://docs.stripe.com/payments/swish), [Stripe Billing fee increase analysis](https://feetrace.com/blog/stripe-billing-fees-for-subscription-saas-in-2026)
- [Paddle pricing](https://www.paddle.com/pricing), [Paddle VAT handling](https://www.paddle.com/help/sell/tax/how-paddle-handles-vat-on-your-behalf), [Paddle review (Dodo)](https://dodopayments.com/blogs/paddle-review/), [Paddle fees explained](https://dodopayments.com/blogs/paddle-fees-explained)
- [Lemon Squeezy pricing](https://www.lemonsqueezy.com/pricing), [Lemon Squeezy fees](https://docs.lemonsqueezy.com/help/getting-started/fees)
- [Polar.sh pricing](https://polar.sh/resources/pricing), [Polar MoR](https://polar.sh/resources/merchant-of-record), [Polar vs Stripe](https://polar.sh/resources/comparison/stripe), [UserJot fee comparison](https://userjot.com/blog/stripe-polar-lemon-squeezy-gumroad-transaction-fees)
- [Chargebee pricing](https://www.chargebee.com/pricing/), [Orb pricing](https://www.withorb.com/pricing), [Recurly pricing](https://recurly.com/pricing/)

**Market context:**
- [Kinde top 10 enterprise auth 2026](https://www.kinde.com/comparisons/what-are-the-top-10-enterprise-authentication-providers-in-2026/), [Metered billing 2026](https://schematichq.com/blog/metered-billing-software), [Corbado best CIAM 2026](https://www.corbado.com/blog/best-ciam-solutions), [UserJot MoR SaaS guide](https://userjot.com/blog/merchant-of-record-saas-guide)
