---
name: report-bug
description: >-
  Blocks /NB bug pipeline. Logs incident B-####, maps PP.PR.AA.SSS.FFF-III
  affects from FEATURE_REGISTRY, updates aligned matrices, creates or updates
  Playwright tests with @B-#### tags, runs headed QA. Use when user says /NB,
  report bug, log bug, new bug, or NB.
disable-model-invocation: true
---

# /NB — Report Bug Pipeline

PM + QA workflow. User reports; agent qualifies, maps codes, builds fix + tests.

## Read first

- [docs/Working Docs-Features-Incidents/FEATURE_REGISTRY.md](../../docs/Working%20Docs-Features-Incidents/FEATURE_REGISTRY.md)
- [docs/Working Docs-Features-Incidents/INCIDENTS.md](../../docs/Working%20Docs-Features-Incidents/INCIDENTS.md)
- [docs/Working Docs-Features-Incidents/ROADMAP.md](../../docs/Working%20Docs-Features-Incidents/ROADMAP.md) — core specs + acceptance criteria
- [docs/Working Docs-Features-Incidents/CI_OPS_FRAMEWORK.md](../../docs/Working%20Docs-Features-Incidents/CI_OPS_FRAMEWORK.md)

## ID format

```
PP.PR.AA.SSS.FFF-III
B-####  (incident group for lookback + Playwright + changelog)
```

**Platforms (PP):** DT Desktop · WB Web · AD Android · AP macOS · IO iOS · SH Shared UI · SB Shared backend · MC MCP · CX CI/build

**Prefix (PR):** UI · BG · EN

## Matrix format

Use aligned pipes in `text` blocks: Feature col **32**, platform cells **10**.  
Regenerate via `node docs/Working Docs-Features-Incidents/scripts/generate-registry.mjs` or `format-matrix.mjs`.

## Phase 1 — Qualify (ask user if missing)

1. **Symptoms** — what they see
2. **Repro steps** — numbered
3. **Expected vs actual**
4. **Severity** — P0–P3
5. **Version found** — e.g. 0.0.3

Then **propose affects**: search FEATURE_REGISTRY + spec for all related codes. Present **Affects matrix** (aligned). **User confirms** before writing files.

Assign next **B-####** from INCIDENTS quick reference.

For each affected feature: **-001** (first break) or increment **-002** on regression.

## Phase 2 — Document

Update **docs/Working Docs-Features-Incidents/INCIDENTS.md** — open incident + affects matrix.

Update **docs/Working Docs-Features-Incidents/FEATURE_REGISTRY.md** — 🐛 rows + section matrix. Run `generate-registry.mjs` if editing matrix data in script.

## Phase 3 — Build

1. Implement fix (likely SH/SB for cross-platform bugs)
2. Playwright: `@core` + `@B-####`; test name includes feature code
3. Link test path in INCIDENTS card

## Phase 4 — QA (user)

```bash
pnpm exec playwright test --headed --grep @B-####
```

## Phase 5 — Ship (after user confirms QA)

1. INCIDENTS → Fixed · registry ✅ · CHANGELOG **Fixed** with B-#### + codes

## Do not

- Skip affects matrix when multiple platforms affected
- Use legacy BUG-### for new work
