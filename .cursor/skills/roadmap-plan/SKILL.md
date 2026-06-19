---
name: roadmap-plan
description: >-
  Blocks /RD next sprint planning. Two-round design phase, reads ROADMAP active
  sprint + backlog, proposes next Sprint + release date. No code. Use when user
  says /RD, roadmap plan, next sprint, or sprint planning.
disable-model-invocation: true
---

# /RD — Roadmap & Next Sprint Planning

PM planning. **Design rounds only** — scope, priorities, ROADMAP edits. **No code.**

## Read first

- [docs/Working Docs-Features-Incidents/ROADMAP.md](../../docs/Working%20Docs-Features-Incidents/ROADMAP.md)
- [docs/Working Docs-Features-Incidents/INCIDENTS.md](../../docs/Working%20Docs-Features-Incidents/INCIDENTS.md)
- [docs/Working Docs-Features-Incidents/FEATURE_REGISTRY.md](../../docs/Working%20Docs-Features-Incidents/FEATURE_REGISTRY.md)
- [docs/Working Docs-Features-Incidents/CI_OPS_FRAMEWORK.md](../../docs/Working%20Docs-Features-Incidents/CI_OPS_FRAMEWORK.md)

## Versioning

- **Release:** `vYY.MM.DD` — propose next ship date for next sprint
- **Batch:** `vYY.MM.DDbX` — log planning session in Batch log if items move
- **Sprint:** `Sprint N+1`

---

## Phase 0 — Round 1 design

Snapshot: active sprint, open B-####, N-#### by status, batch log.

For planning themes and scope:

1. Draft next sprint plan (carry · new · defer · bugs to close).
2. **Conflict audit** — Round 1 + Round 2 tables per [CI_OPS §4.1](../../docs/Working%20Docs-Features-Incidents/CI_OPS_FRAMEWORK.md#41-logic--design-conflict-audit).
3. **AskQuestion** — theme, capacity, on-hold tracks, release date (recommended first; **Open discussion / Other**).

Wait for PM Round 1.

---

## Phase 0b — Round 2 design

1. Cross-track dependencies and page/API impacts.
2. **Cross-feature conflict report** per CI_OPS §4.1.
3. **AskQuestion** for reordering or cuts that affect in-flight work (conflict rows only if unresolved).

Wait for PM Round 2.

---

## Phase 1 — Document (after PM confirms)

1. Add/update **`## Next sprint N (vYY.MM.DD proposed)`** in ROADMAP.
2. On sprint ship: rename Next → **Active sprint N** · bump header release.

---

## Phase 2 — Hand off

Each scoped N/B → `/NF` or `/NB` with design rounds + batch build.

## Do not

- Implement code or Playwright tests
- Create N-#### / B-#### IDs here
- Skip design rounds
