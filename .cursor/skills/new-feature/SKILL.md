---
name: new-feature
description: >-
  Blocks /NF new feature pipeline. Logs N-#### in ROADMAP, proposes
  PP.PR.AA.SSS.FFF registry codes, updates spec acceptance criteria, implements
  feature, creates Playwright suite with @N-#### tags, runs headed QA. Use when
  user says /NF, new feature, NF, or feature request.
disable-model-invocation: true
---

# /NF — New Feature Pipeline

PM defines; agent places in registry roadmap, implements, tests.

## Read first

- [docs/Working Docs-Features-Incidents/ROADMAP.md](../../docs/Working%20Docs-Features-Incidents/ROADMAP.md)
- [docs/Working Docs-Features-Incidents/FEATURE_REGISTRY.md](../../docs/Working%20Docs-Features-Incidents/FEATURE_REGISTRY.md)
- [docs/Working Docs-Features-Incidents/BLOCKS_CORE_FUNCTIONALITY v0.0.3.md](../../docs/Working%20Docs-Features-Incidents/BLOCKS_CORE_FUNCTIONALITY%20v0.0.3.md)
- [docs/Working Docs-Features-Incidents/CI_OPS_FRAMEWORK.md](../../docs/Working%20Docs-Features-Incidents/CI_OPS_FRAMEWORK.md)

## ID format

```
N-####           Roadmap entry until shipped
PP.PR.AA.SSS.FFF Permanent code on ship
```

**Platforms (PP):** DT · WB · AD · AP · IO · SH · SB · MC · CX  
**Prefix (PR):** UI · BG · EN

## Matrix format

Platform matrix in ROADMAP: Feature **32**, cells **10**, aligned `|`.

## Phase 1 — Qualify

1. Feature description
2. Target platforms (DT first per spec)
3. Target area (AA table in FEATURE_REGISTRY)
4. Acceptance criteria checklist
5. Target version

Propose registry codes + **platform matrix**. User approves before ROADMAP write.

Assign next **N-####**.

## Phase 2 — Document

Update **docs/Working Docs-Features-Incidents/ROADMAP.md** with matrix + proposed codes.

Add registry rows when status → 🔄 or ✅.

## Phase 3 — Build

DT first → WB if in scope · Playwright `@N-####` · link in ROADMAP

## Phase 4 — QA (user)

```bash
pnpm exec playwright test --headed --grep @N-####
```

## Phase 5 — Ship

ROADMAP Shipped · FEATURE_REGISTRY ✅ · CHANGELOG **Added** · run `generate-registry.mjs` if matrices change

## Priority order

Desktop (DT) → Android (AD) → Web (WB) — per core spec.
