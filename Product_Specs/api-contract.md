# Cold Anvil — API Contract

**Written:** 23 March 2026
**Status:** Draft — Phase 3A
**Depends on:** User journey spec, conversational flow spec
**Built by:** 3B (Core API), 3C (Batch Variable Injection), 3D (Conversational
Flows), 3F (Auth + Billing)

---

## Overview

This is the rough API contract that 3B, 3C, and 3D build to. Not a full
OpenAPI spec — that comes during implementation. This defines the endpoints,
their responsibilities, the payload shapes, and the key design decisions.

---

## Design Principles

**API-side tier enforcement.** The API knows the customer's tier and rejects
requests that exceed it. Frontend enforcement is a suggestion, not a boundary.
Every endpoint that triggers compute or returns gated content checks tier
access before proceeding.

**WebSocket for conversation, REST for everything else.** Conversations need
streaming responses (Annie "typing"). Everything else is request-response.

**Filtered streaming.** The WebSocket streams Annie's response tokens to the
client in real-time, but thinking traces, extraction state updates, and
internal model reasoning are stripped server-side before hitting the wire.
The client never sees raw model output. We decide what gets through.

**Project-centric.** Every resource hangs off a project. Projects are the
unit of work, billing, and access control.

**Tier field from day one.** Even before Stripe integration (Layer 5), every
project has a tier field. Initially set manually or by signup flow. Stripe
wires into it later. The API doesn't care where the tier comes from — it
just enforces it.

---

## Authentication

**No passwords.** Auth is email + OTP or Google SSO.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /auth/email | POST | Send OTP to email address |
| /auth/verify | POST | Verify OTP, return session token |
| /auth/google | POST | Google SSO callback, return session token |
| /auth/me | GET | Current user info + tier |

Session tokens are JWTs or similar. Short-lived with refresh. Details
at implementation time.

**Pre-auth state:** A project can exist before auth (created at idea intake
with unverified email). The project is tied to the email. After OTP
verification, the project is linked to the verified account. Before
verification, the project is session-bound and expires after 24 hours.

### Request

```
POST /auth/email
{
  "email": "user@example.com"
}

POST /auth/verify
{
  "email": "user@example.com",
  "code": "123456"
}
```

### Response

```
POST /auth/verify -> 200
{
  "token": "eyJ...",
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "verified": true,
    "tier": "free",
    "created_at": "2026-03-23T10:00:00Z"
  }
}
```

---

## Projects

The core resource. Everything hangs off a project.

| Endpoint | Method | Purpose | Auth required |
|----------|--------|---------|---------------|
| /projects | POST | Create project from raw idea + email | No (pre-auth, session-bound) |
| /projects | GET | List user's projects | Yes |
| /projects/{id} | GET | Get project detail + current state | Yes (or session token for pre-auth) |
| /projects/{id} | PATCH | Update project metadata | Yes |
| /projects/{id}/archive | POST | Archive project (free to store) | Yes |
| /projects/{id}/reactivate | POST | Reactivate archived project | Yes |

### Create Project

This is the first API call — happens at intake before auth. Creates a
project tied to the provided email and returns a session token for
continued access until OTP verification.

```
POST /projects
{
  "email": "user@example.com",
  "idea": "I want to build an app that helps independent dog walkers
           manage their schedules and client relationships"
}
```

```
-> 201
{
  "id": "prj_xyz789",
  "email": "user@example.com",
  "verified": false,
  "tier": "free",
  "session_token": "sess_...",
  "idea": "I want to build an app that helps...",
  "extraction_state": {},
  "stages_completed": [],
  "stages_available": ["vision"],
  "stages_locked": ["roadmap", "content", "tech_design", "code",
                     "assembly", "verification", "deployment"],
  "created_at": "2026-03-23T10:00:00Z"
}
```

### Get Project

Returns the full project state including which stages are completed,
available (unlocked by tier), and locked (need upgrade).

```
GET /projects/{id} -> 200
{
  "id": "prj_xyz789",
  "email": "user@example.com",
  "verified": true,
  "tier": "tier_1",
  "idea": "I want to build an app that helps...",
  "extraction_state": {
    "problem": "Independent dog walkers juggle 15-20 clients...",
    "customer": "Solo dog walkers with 10-25 regular clients...",
    "current_alternatives": "Google Calendar + group texts...",
    "solution": "Simple scheduling + client management tool...",
    "differentiation": "Designed for independent walkers, not...",
    "success_criteria": "50 active walker users in 6 months..."
  },
  "stages_completed": ["vision", "roadmap"],
  "stages_available": ["content"],
  "stages_locked": ["tech_design", "code", "assembly",
                     "verification", "deployment"],
  "conversation_state": "complete",
  "outputs": {
    "vision": {"status": "complete", "url": "/projects/prj_xyz789/outputs/vision"},
    "roadmap": {"status": "complete", "url": "/projects/prj_xyz789/outputs/roadmap"},
    "content": {"status": "pending", "url": null}
  },
  "created_at": "2026-03-23T10:00:00Z",
  "updated_at": "2026-03-23T11:30:00Z"
}
```

### Stage Access by Tier

| Stage | Free | Tier 1 (29) | Tier 2 (49) | Tier 3 (200) |
|-------|------|-------------|-------------|--------------|
| Vision (Steps 1-3) | yes | yes | yes | yes |
| Roadmap (Step 4) | locked | yes | yes | yes |
| Content (Step 5) | locked | yes | yes | yes |
| Tech Design (Step 6-7) | locked | locked | yes | yes |
| Code (Step 7) | locked | locked | yes | yes |
| Assembly (Step 8) | locked | locked | locked | yes |
| Verification (Step 8) | locked | locked | locked | yes |
| Deployment (Step 9) | locked | locked | locked | yes |

The API enforces this. A Tier 1 customer requesting a cascade that
includes tech_design gets a 403 with a clear upgrade message.

---

## Conversations

WebSocket-based. Two conversation types: idea refinement (Step 3) and
rubric creation (Step 6).

| Endpoint | Protocol | Purpose | Auth required |
|----------|----------|---------|---------------|
| /projects/{id}/conversation/idea | WebSocket | Step 3 idea refinement | No (session token) |
| /projects/{id}/conversation/rubric | WebSocket | Step 6 rubric creation | Yes + Tier 2+ |

### WebSocket Protocol

Client connects, then exchanges JSON messages.

**Client -> Server (user message):**
```
{
  "type": "message",
  "content": "It's actually my partner who's a dog walker..."
}
```

**Server -> Client (streaming response):**
```
{
  "type": "response_start",
  "turn": 3
}
{
  "type": "response_token",
  "content": "Ah, "
}
{
  "type": "response_token",
  "content": "so you've "
}
{
  "type": "response_token",
  "content": "seen this problem up close..."
}
{
  "type": "response_end",
  "turn": 3,
  "full_response": "Ah, so you've seen this problem up close..."
}
```

**Server -> Client (extraction state update):**

Sent after each turn, once extraction processing completes. This is what
the progress panel renders. Never includes raw model output, thinking
traces, or internal state.

```
{
  "type": "extraction_update",
  "state": {
    "problem": {
      "status": "captured",
      "summary": "Independent dog walkers juggle 15-20 clients
                  across texts, spreadsheets, and memory.
                  Scheduling conflicts cost them clients."
    },
    "customer": {
      "status": "captured",
      "summary": "Solo dog walkers with 10-25 regular clients.
                  Not agencies — individuals."
    },
    "current_alternatives": {
      "status": "exploring",
      "summary": "Google Calendar + group texts mentioned.
                  Exploring further."
    },
    "solution": {"status": "not_started"},
    "differentiation": {"status": "not_started"},
    "success_criteria": {"status": "not_started"}
  },
  "phase": "problem_customer",
  "turns_taken": 3,
  "ready_for_generation": false
}
```

**Server -> Client (conversation complete):**
```
{
  "type": "conversation_complete",
  "extraction_state": { ... },
  "ready_for_generation": true,
  "message": "I've got a clear picture. Ready to forge your
              vision document?"
}
```

**Client -> Server (user confirms generation):**
```
{
  "type": "confirm_generation"
}
```

**Server -> Client (generation started):**
```
{
  "type": "generation_started",
  "stage": "vision",
  "estimated_time_seconds": 120
}
```

### Extraction State Correction

The user can correct an extraction via the progress panel. This sends
a correction message through the WebSocket:

```
{
  "type": "correction",
  "field": "customer",
  "content": "Actually it's not just dog walkers, it's any
              solo pet care provider"
}
```

Annie acknowledges and updates:
```
{
  "type": "response_start",
  "turn": 4
}
...
{
  "type": "extraction_update",
  "state": {
    "customer": {
      "status": "captured",
      "summary": "Solo pet care providers (dog walkers, pet
                  sitters, etc.) with 10-25 regular clients."
    },
    ...
  }
}
```

---

## Cascade (Pipeline Runs)

REST endpoints for triggering and monitoring pipeline runs.

| Endpoint | Method | Purpose | Auth required |
|----------|--------|---------|---------------|
| /projects/{id}/cascade | POST | Trigger cascade for next available stage(s) | Yes |
| /projects/{id}/cascade/{run_id} | GET | Get run status + progress | Yes |
| /projects/{id}/runs | GET | List all runs for project | Yes |

### Trigger Cascade

The API determines which stages to run based on what's completed and
what the tier allows. The client doesn't specify stages — just says "go."

```
POST /projects/{id}/cascade
{
  "trigger": "next"
}
```

```
-> 202
{
  "run_id": "run_abc456",
  "project_id": "prj_xyz789",
  "stages": ["roadmap", "content"],
  "status": "queued",
  "estimated_time_seconds": 360,
  "created_at": "2026-03-23T11:00:00Z"
}
```

**Tier enforcement example:**
```
POST /projects/{id}/cascade (Tier 1 customer, vision + roadmap + content done)
-> 403
{
  "error": "tier_limit_reached",
  "message": "Your current plan includes stages through content.
              Upgrade to Build It (49/month) to unlock tech design
              and code generation.",
  "current_tier": "tier_1",
  "next_tier": "tier_2",
  "locked_stages": ["tech_design", "code"]
}
```

### Cascade Status

Polling endpoint for run progress. Also available via WebSocket on the
project conversation channel as status events.

```
GET /projects/{id}/cascade/{run_id} -> 200
{
  "run_id": "run_abc456",
  "status": "running",
  "stages": [
    {
      "name": "roadmap",
      "status": "complete",
      "tasks": 1,
      "passed": 1,
      "score": 82,
      "elapsed_seconds": 45
    },
    {
      "name": "content",
      "status": "running",
      "tasks": 2,
      "passed": 0,
      "score": null,
      "elapsed_seconds": 30
    }
  ],
  "elapsed_seconds": 75,
  "estimated_remaining_seconds": 90
}
```

---

## Outputs

REST endpoints for retrieving generated outputs. These serve the
rendered project pages and downloadable files.

| Endpoint | Method | Purpose | Auth required |
|----------|--------|---------|---------------|
| /projects/{id}/outputs | GET | List all outputs for project | Yes |
| /projects/{id}/outputs/{stage} | GET | Get output for specific stage | Yes (or share token) |
| /projects/{id}/outputs/{stage}/download | GET | Download output as files (code stages) | Yes, Tier 2+ |
| /projects/{id}/outputs/{stage}/preview | GET | Preview of locked stage output | Yes |

### Get Output

Returns the rendered content for a completed stage.

```
GET /projects/{id}/outputs/vision -> 200
{
  "stage": "vision",
  "status": "complete",
  "content": {
    "format": "rendered",
    "sections": [
      {"title": "Problem", "body": "..."},
      {"title": "Target Customer", "body": "..."},
      {"title": "Solution", "body": "..."},
      {"title": "Differentiation", "body": "..."},
      {"title": "Success Criteria", "body": "..."}
    ]
  },
  "share_url": "https://coldanvil.com/s/abc123",
  "generated_at": "2026-03-23T10:30:00Z",
  "run_id": "run_def789",
  "scores": {
    "base_rubric": 85,
    "project_rubric": null
  }
}
```

### Stage Preview (Locked Content)

Returns enough to populate the tier boundary preview — real output
from this project, but not the full content.

```
GET /projects/{id}/outputs/tech_design/preview -> 200
{
  "stage": "tech_design",
  "status": "locked",
  "tier_required": "tier_2",
  "preview": {
    "section_count": 4,
    "sections_visible": [
      {"title": "Architecture Overview", "body_preview": "A monolithic
       FastAPI application with..."}
    ],
    "sections_blurred": [
      {"title": "Data Model"},
      {"title": "API Design"},
      {"title": "Deployment Architecture"}
    ]
  },
  "upgrade_cta": {
    "message": "Unlock your tech design — Build It for 49/month",
    "tier": "tier_2",
    "price_monthly": 49
  }
}
```

### Sharing

Outputs can be shared via a share URL. The share endpoint doesn't
require auth — anyone with the link can view.

```
GET /s/{share_token} -> 200
{
  "project_name": "Dog Walker Scheduler",
  "stage": "vision",
  "content": { ... },
  "locked_stages_preview": { ... },
  "cta": "Build your own idea at coldanvil.com"
}
```

Share URLs show the output plus blurred previews of locked stages.
Every shared link is a conversion funnel.

---

## Iteration (Step 9)

REST endpoint for submitting feedback that triggers targeted rewrites.

| Endpoint | Method | Purpose | Auth required |
|----------|--------|---------|---------------|
| /projects/{id}/iterate | POST | Submit feedback, trigger rewrite | Yes, Tier 3 |

### Submit Feedback

```
POST /projects/{id}/iterate
{
  "stage": "code",
  "feedback": "The authentication module is using session tokens
               but I want JWT. Also the error handling in the API
               routes is inconsistent.",
  "scope": "targeted"
}
```

```
-> 202
{
  "run_id": "run_iter_001",
  "project_id": "prj_xyz789",
  "type": "iteration",
  "stages_affected": ["code"],
  "tasks_rewriting": 2,
  "feedback_applied": "JWT auth instead of sessions; consistent
                       error handling in API routes",
  "status": "queued"
}
```

Iteration rewrites only the affected tasks, not the entire cascade.
The feedback is injected into the rewrite prompt alongside the
original output and the reviewer's assessment.

---

## Billing

Tier management endpoints. Initially simple (manual tier assignment).
Stripe webhooks wire in during Layer 5.

| Endpoint | Method | Purpose | Auth required |
|----------|--------|---------|---------------|
| /billing/tier | GET | Current tier + usage | Yes |
| /billing/upgrade | POST | Initiate upgrade (-> Stripe checkout) | Yes |
| /billing/portal | GET | Stripe customer portal URL | Yes |

### Get Tier

```
GET /billing/tier -> 200
{
  "tier": "tier_1",
  "price_monthly": 29,
  "billing_cycle": "monthly",
  "active_projects": 1,
  "max_active_projects": 1,
  "stages_available": ["vision", "roadmap", "content"],
  "stages_locked": ["tech_design", "code", "assembly",
                     "verification", "deployment"],
  "next_tier": {
    "tier": "tier_2",
    "price_monthly": 49,
    "unlocks": ["tech_design", "code"]
  }
}
```

### Initiate Upgrade

```
POST /billing/upgrade
{
  "tier": "tier_2"
}
```

```
-> 200
{
  "checkout_url": "https://checkout.stripe.com/...",
  "tier_from": "tier_1",
  "tier_to": "tier_2",
  "prorated_charge": 13.33
}
```

---

## Error Responses

Consistent error format across all endpoints.

```
{
  "error": "error_code",
  "message": "Human-readable explanation",
  "details": {}
}
```

| Code | HTTP Status | When |
|------|-------------|------|
| tier_limit_reached | 403 | Requesting a stage/feature above current tier |
| project_not_found | 404 | Invalid project ID |
| project_expired | 410 | Unverified project past 24-hour expiry |
| auth_required | 401 | Endpoint requires auth, none provided |
| conversation_complete | 400 | Sending message to a completed conversation |
| cascade_in_progress | 409 | Triggering cascade while one is running |
| stage_not_ready | 400 | Requesting output for a stage that hasn't run |
| rate_limited | 429 | Too many requests |

---

## Implementation Notes

**Framework:** FastAPI. Async, WebSocket native, Pydantic for
request/response validation.

**State storage:** Project records, extraction state, conversation
history (summarised), outputs. Database TBD (Postgres likely).

**Gateway integration:** The cascade endpoints proxy to the Arnor
Gateway for actual pipeline execution. Cold Anvil API is the product
layer; Gateway is the compute layer.

**Batch variable injection (3C):** The cascade endpoint generates
batch configs dynamically from the project's extraction state and
tier. Template variables in batch files are populated from the
project record. Hardcoded batches remain as test fixtures.

**Conversation state:** Managed server-side. The WebSocket connection
is stateless — reconnecting resumes from the current extraction state.
Conversation history (summarised) is stored in the project record.

---

## What This Contract Does NOT Cover

- Frontend rendering of project pages (that's frontend design)
- The actual prompt engineering for Annie's conversation (that's
  implementation of the conversational flow spec)
- Gateway API changes needed to support Cold Anvil (separate spec)
- Stripe webhook handling details (Layer 5)
- Add-on project billing (TBD)
- Share link privacy controls (TBD)

---

*Draft contract. Refine during 3B implementation. Breaking changes
are fine at this stage — this is a target, not a commitment.*
