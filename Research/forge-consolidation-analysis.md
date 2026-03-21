# Arnor's Forge vs Cold Anvil's Forge — Comparison & Consolidation

## Context

Cold Anvil is building its own forge orchestration layer (batches, gates, rubrics, pipeline engine) while Arnor's Forge already exists as a central execution service with dashboarding and observability.

The question: **Are we maintaining two forges unnecessarily? Should we consolidate?**

---

## Architecture Comparison

### Arnor's Forge (Platform)

| Capability | Status |
|------------|------|
| **Execution backend** | ✅ Gateway orchestrates across fleet |
| **Observability** | ✅ Run IDs, status polling, task scores, gate failures, model distribution |
| **Dashboard** | ✅ Structured reporting via `forge_report`, `forge_diagnosis` |
| **Model review** | ✅ Built-in (Barrowblade second opinion, memory integration) |
| **Retry infrastructure** | ✅ Built into gateway |
| **Fleet distribution** | ✅ Spreads across hosts, reports host assignment |
| **Central state** | ✅ State in ArgoDB |
| **CLI tooling** | ✅ `forge.py` (task/batch/report commands) |
| **Gateway API** | ✅ Stateless HTTP API |

### Cold Anvil's Forge (Product Pipeline)

| Capability | Status |
|------------|--|
| **Execution** | ⚠️ Local orchestration via `pipeline/engine.py`, direct Ollama calls |
| **Observability** | ❌ No reporting — just file outputs |
| **Dashboard** | ❌ None |
| **Model review** | ✅ In pipeline (review → rewrite loop) |
| **Retry** | ✅ (`error_augmented`, `de_anchored`, escalation) |
| **Fleet distribution** | ❌ Single host only |
| **Pack format** | ✅ `project.json`, `batches/`, `prompts/`, `gates/`, `rubrics/` |
| **Inference abstraction** | ✅ `pipeline/inference.py` (Ollama/cloud/custom endpoints) |
| **Product packaging** | ✅ Deliverable packs as end artefact |

### Key Observation: **Same format, different execution**

Cold Anvil's pack format is identical to Arnor's Forge structure. We're essentially running the same model but without the orchestration and observability layer.

---

## The Real Gap

**Cold Anvil is missing:**
1. **Run tracking** — No IDs, no persistence of execution state
2. **Reporting** — No way to query results, scores, gate failures
3. **Telemetry** — No metrics on model performance, latency, distribution
4. **Memory integration** — No structured log of what was generated, when, with what inputs

**What Cold Anvil has that Arnor's Forge doesn't need:**
1. **Deployment modes** — Cloud / Self-hosted / BYOM abstraction
2. **Blessed model pack** — Curated generator/reviewer/rewriter models
3. **Packaging** — Deliverable packs as customer artefacts

---

## Consolidation Options

### Option A: Build Observability into Cold Anvil
Add a reporting layer that tracks runs and scores.

**Pros:**
- Independent of Arnor infrastructure
- Customers self-hosting get observability too
- We build what we're selling

**Cons:**
- Duplicate the Gateway logic (state management, run IDs, reporting)
- More code to maintain
- Missing fleet distribution capabilities

**Required work:**
- `run_id` generation and state table
- Run persistence (SQLite/PostgreSQL)
- API endpoints: submit, poll, report
- Telemetry collection (scores, latency, gate results)

### Option B: Cold Anvil Uses Arnor's Gateway
Make Cold Anvil submit to Arnor's Gateway as its execution backend.

**Pros:**
- Reuse existing observability, reporting, fleet distribution
- Cold Anvil focuses on product layer (packs, user experience)
- Single codebase to maintain for orchestration
- When we self-host, we bundle Gateway with Cold Anvil

**Cons:**
- Gateway assumes centralised deployment (state in ArgoDB)
- Self-hosted customers need Gateway bundled
- Some coupling to Arnor's infra patterns

**Required work:**
- Gateway deployment for self-hosted (TBD containerising it?)
- Cold Anvil CLI/SDK to submit to Gateway instead of local engine
- Inference layer abstraction to route through Gateway
- Update Cold Anvil's pipeline to call Gateway endpoints

### Option C: Keep Them Separate
Arnor's Forge = platform infrastructure. Cold Anvil's Forge = customer-facing product.

**Pros:**
- True product independence
- Self-hosted works without Arnor infra

**Cons:**
- Duplicate orchestration logic
- Two forges to maintain
- Lose the observability investment in Arnor's Gateway

---

## Recommendation: Option B

**Make Cold Anvil use Arnor's Gateway.**

Rationale:
1. **Use our own products** — This is the core principle
2. **Avoid duplication** — Don't rebuild the observability layer
3. **Fleet capability** — We get multi-host distribution immediately
4. **Single codebase** — One forge, not two

**Implementation approach:**

1. **MVP (local on Arnor fleet):**
   - Cold Anvil submits batches via `forge_run_batch` or Gateway API
   - Gateway orchestrates on Barrowblade/elostirion
   - Outputs come back, Cold Anvil writes them as "deliverable packs"
   
2. **Self-hosted path:**
   - Containerise Gateway + ArgoDB (or swap SQLite for portable storage)
   - Cold Anvil ships with Gateway bundled
   - Cold Anvil CLI points to local Gateway

3. **Cloud path:**
   - Cold Anvil Cloud = Gateway running on our infra
   - Customer-facing UI wraps the Gateway API

---

## Next Steps

1. **Get the dashboard running** — Use Claude to build a minimal observability layer
   - Run tracking (just logs and IDs for now)
   - Report endpoint (scores, gate failures, outputs)
   - Basic UI to view run history

2. **Test the integration** — Submit a Cold Anvil batch to the dashboard
   - Verify outputs are captured
   - Verify status is trackable
   - Verify we can query results

3. **Replace local orchestration** — Migrate Cold Anvil's pipeline to use Gateway
   - Remove `pipeline/engine.py` local orchestration
   - Switch to Gateway submission API
   - Keep inference abstraction for deployment modes

4. **Document the consolidation** — Update Cold Anvil docs to reflect Gateway-as-execution

---

## Current State (2026-03-21)

- Cold Anvil has forge infrastructure committed: gates, prompts, rubrics, batch definitions
- No reporting layer exists yet
- No dashboard
- `website_mvp.json` batch sits ready, not run
- Arnor's Gateway running on Elostirion, ready to accept batches

**Blocker:** Need observability/dashboard to proceed with using Cold Anvil to build itself.