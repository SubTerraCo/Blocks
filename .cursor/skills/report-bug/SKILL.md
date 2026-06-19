---
name: report-bug
description: >-
  Blocks /NB bug pipeline. Two-round design phase, logs B-#### to current sprint
  (vYY.MM.DD + batch), implements fix + @B-#### tests. Use when user says /NB,
  report bug, log bug, or NB.
disable-model-invocation: true
---

# /NB — Report Bug Pipeline

PM reports; agent runs **design rounds**, assigns **batch**, documents, fixes, tests.

## Read first

- [docs/Working Docs-Features-Incidents/FEATURE_REGISTRY.md](../../docs/Working%20Docs-Features-Incidents/FEATURE_REGISTRY.md)
- [docs/Working Docs-Features-Incidents/INCIDENTS.md](../../docs/Working%20Docs-Features-Incidents/INCIDENTS.md)
- [docs/Working Docs-Features-Incidents/ROADMAP.md](../../docs/Working%20Docs-Features-Incidents/ROADMAP.md) — **Active sprint**, **Batch log**, header release
- [docs/Working Docs-Features-Incidents/CI_OPS_FRAMEWORK.md](../../docs/Working%20Docs-Features-Incidents/CI_OPS_FRAMEWORK.md)

## Versioning

- **Release:** `vYY.MM.DD` (e.g. `v26.06.12`)
- **Batch:** `vYY.MM.DDbX` — `b1`…`b9`, `b10`, `b11` (no leading zero)
- **Opened** in INCIDENTS = current release

## Sprint policy (default)

- Every new **B-####** → current Sprint + release from ROADMAP header.
- Log batch in ROADMAP **Batch log** with N/B IDs in session.

---

## Phase 0 — Round 1 design (before any code)

For **each** bug in the user input:

1. Symptoms · repro · expected vs actual · severity P0–P3.
2. Propose **affects matrix** (aligned pipes).
3. Best-judgement fix UX at **component · section · integration · e2e** levels.
4. **Conflict audit** — Round 1 table per [CI_OPS §4.1](../../docs/Working%20Docs-Features-Incidents/CI_OPS_FRAMEWORK.md#41-logic--design-conflict-audit).
5. **AskQuestion** per item (recommended first; **Open discussion / Other**).

Wait for PM Round 1.

---

## Phase 0b — Round 2 design

1. Review Round 1 answers.
2. Check regression / related features / shared components.
3. **Cross-feature conflict report** — Round 2 table per CI_OPS §4.1.
4. **AskQuestion** for cross-feature fix impacts (conflict rows only if unresolved).
5. Gate: PM refinement → **delta audit**; clarify or proceed.

Wait for PM Round 2.

---

## Phase 1 — Document

Assign **B-####** · update **INCIDENTS.md** + **FEATURE_REGISTRY.md** + **Batch log**.

---

## Phase 2 — Build

Implement fix · **Conflict audit before each logical change** (CI_OPS §4.1 global rule) · **Stop + AskQuestion** if blocked or conflict found mid-build.

Playwright: `@core` + `@B-####`.

---

## Phase 3 — Handoff

Run release build, then tell PM batch is ready for QA:

```bash
pnpm build:release
```

**Batch `vYY.MM.DDbX` ready for QA** or follow-ups.

## Phase 4 — Ship (after PM confirms QA)

INCIDENTS → Fixed · registry ✅ · CHANGELOG under batch heading.

## Do not

- Skip design rounds for UX-ambiguous fixes
- Use legacy BUG-### or `0.0.x` for new work
