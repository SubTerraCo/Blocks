---
name: new-feature
description: >-
  Blocks /NF new feature pipeline. Two-round design phase, logs N-#### to current
  sprint (vYY.MM.DD + batch), implements with @N-#### tests. Use when user says
  /NF, new feature, NF, or feature request.
disable-model-invocation: true
---

# /NF — New Feature Pipeline

PM defines; agent runs **design rounds**, assigns **batch**, documents, implements, tests.

## Read first

- [docs/Working Docs-Features-Incidents/ROADMAP.md](../../docs/Working%20Docs-Features-Incidents/ROADMAP.md) — **Active sprint**, **Batch log**, header release
- [docs/Working Docs-Features-Incidents/FEATURE_REGISTRY.md](../../docs/Working%20Docs-Features-Incidents/FEATURE_REGISTRY.md)
- [docs/Working Docs-Features-Incidents/CI_OPS_FRAMEWORK.md](../../docs/Working%20Docs-Features-Incidents/CI_OPS_FRAMEWORK.md)

## Versioning

- **Release:** `vYY.MM.DD` from ROADMAP header (e.g. `v26.06.12`)
- **Batch:** `vYY.MM.DDbX` — one session = one batch; `b1`…`b9`, `b10`, `b11` (no leading zero)
- **Sprint:** `Sprint N` from ROADMAP header (e.g. Sprint 5)

## Sprint policy (default)

- Every new **N-####** → current **Sprint** + **Target release** = header release.
- Assign next **batch** in ROADMAP Batch log for this session.
- Do not defer to a future sprint unless PM says so (`/RD` plans next sprint).

---

## Phase 0 — Round 1 design (before any code)

For **each** feature in the user input:

1. Read description · map PP.PR.AA.SSS.FFF · propose platform matrix.
2. Apply best judgement for UX simplicity at **component · section · integration · e2e** levels.
3. **Conflict audit** — Round 1 table per [CI_OPS §4.1](../../docs/Working%20Docs-Features-Incidents/CI_OPS_FRAMEWORK.md#41-logic--design-conflict-audit).
4. **AskQuestion** per item (recommended first; include **Open discussion / Other**).

Wait for PM to click through Round 1.

---

## Phase 0b — Round 2 design (cross-feature)

1. Review all Round 1 answers.
2. Check knock-on effects on related pages, components, stores, APIs.
3. **Cross-feature conflict report** — Round 2 table per CI_OPS §4.1.
4. **AskQuestion** for integration / UX changes that affect other features (conflict rows only if unresolved).
5. If clarifications remain → AskQuestion again; PM refinement → **delta audit**; else proceed.

Wait for PM to click through Round 2.

---

## Phase 1 — Qualify & document

1. Assign next **N-####**.
2. Update **ROADMAP.md** — quick reference + full section + Active sprint + **Batch log** row.
3. Update **FEATURE_REGISTRY** when status → 🔄.

---

## Phase 2 — Build

DT first → WB if in scope.

**Conflict audit before each logical change** (CI_OPS §4.1 global rule) · **Stop + AskQuestion** if new ambiguity or conflict appears mid-build.

---

## Phase 3 — Test

Playwright: `@core` + `@N-####` · component · integration · e2e as applicable.

Batch QA (no batch tag):

```bash
pnpm exec playwright test tests/e2e --headed --workers=1 --grep "@N-####" --config=tests/playwright.config.ts --project=chromium
```

---

## Phase 4 — Handoff

Run release build, then tell PM batch is ready for QA:

```bash
pnpm build:release
```

Tell PM: **Batch `v26.06.12bN` ready for QA** (installer path + headed grep from script output) or list follow-ups before next batch.

## Phase 5 — Ship (after PM confirms QA)

ROADMAP Shipped · FEATURE_REGISTRY ✅ · CHANGELOG under batch heading · `generate-registry.mjs` if needed.

## Priority order

Desktop (DT) → Android (AD) → Web (WB).

## Do not

- Skip Round 1 or Round 2 design
- Start coding before design gate clears
- Use legacy `0.0.x` for new work
