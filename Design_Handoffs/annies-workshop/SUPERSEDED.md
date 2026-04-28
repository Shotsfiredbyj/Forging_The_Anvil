# SUPERSEDED — 2026-04-28

This handoff (the Annie's Workshop bundle delivered 2026-04-23) is **partially superseded** by `../workshop-refresh/`.

## What carried forward intact

The build / preview / refinement architecture from this handoff is shipped and stays as-is:

- M3 live preview (Browser primitive + iframe)
- M3.5 mid-build intervention (composer-as-pause)
- M4 click-to-edit refinement (source-stamp plugin + DiffCard ledger)

## What's superseded

The chrome, conversation, vision, and layout shell from this handoff are replaced by the workshop refresh:

- Shell layout (was 232px sidebar + 1fr main; now four-region with dynamic right rail)
- Conversation surface (was flowing letter from Annie + Claim-tap pushback; now discrete bubbles with avatars + timestamps + per-paragraph `+` gutter)
- Vision tab (was M1 read-only render; now "The brief" with free text selection)
- Sidebar (was nav-only; now project block top + Studio group + profile block bottom)
- Token vocabulary (expanded; new BRAND.md canonical)

## Where to look now

- `../workshop-refresh/README.md` — authoritative spec for the refresh, including the interview answers that lock the implementation decisions
- `~/.claude/plans/workshop-refresh.md` — the milestone-by-milestone implementation plan
- Linear project `Workshop refresh — design evolution` under the `Cold Anvil pre-alpha readiness` initiative — task tracking
