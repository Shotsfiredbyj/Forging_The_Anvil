# Product_Specs

Detailed specs for product subcomponents Annie uses. Not the primary source of truth.

**The current product spec is at `/home/jack/Forging_The_Anvil/respec/03-spec.md`.** Read that first. When anything here conflicts with the respec, the respec wins.

## Files in this directory

- `user-journey.md` — pre-respec customer journey spec. Surface details (cascade stage count, tier boundaries) have been revised in the respec, but the design principles and touchpoint thinking are still load-bearing. Read for context, not as authoritative.
- `conversational-flows.md` — Annie's discovery-conversation mechanics. This is the kernel the respec keeps — the two-model streaming + extraction architecture, the phase state machine, the evidence-checked extraction. Use as implementation reference for building Annie's conversation layer.

## Archived

- `api-contract.md` — moved to `archive/2026-04-15-prerespec/Product_Specs/api-contract.md`. Described the HTTP API contract for the service being replaced. Do not implement against the archived version.
