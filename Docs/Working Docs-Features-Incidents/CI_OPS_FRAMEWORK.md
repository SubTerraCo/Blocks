# CI Ops Framework (Portable Template)

Copy this structure into **any** Cursor project for PM + QA two-entry pipeline.

---

## 1. ID system

```
PP.PR.AA.SSS.FFF-III     Feature address + incident suffix
B-####                   Incident group (lookback, Playwright, changelog)
N-####                   New feature (until shipped → registry code)
```

| Segment | Meaning | Example codes |
|---------|---------|---------------|
| **PP** | Platform app | Customize per project (see below) |
| **PR** | Layer | `UI` · `BG` · `EN` |
| **AA** | Area (page/domain) | `01`–`09` from your spec |
| **SSS** | Section | `001`–`999` |
| **FFF** | Feature | `010`–`999` |
| **III** | Incident # on that feature | `-001` first break · `-002` regression |

### Blocks platform codes (this repo)

| PP | Platform |
|----|----------|
| DT | Desktop |
| WB | Web / PWA |
| AD | Android |
| AP | macOS |
| IO | iOS |
| SH | Shared UI |
| SB | Shared backend |
| MC | MCP |
| CX | CI / build |

---

## 2. File layout

```
docs/Working Docs-Features-Incidents/
  FEATURE_REGISTRY.md
  INCIDENTS.md
  ROADMAP.md              # core specs + N-#### roadmap (merged)
  CHANGELOG.md
  BLOCKS_CORE_FUNCTIONALITY v0.0.3.md   # deprecated stub → ROADMAP.md
  scripts/format-matrix.mjs
  scripts/generate-registry.mjs
  scripts/polish-docs.mjs
docs/Integrations/
docs/UI Graphics/
.cursor/skills/report-bug/   # /NB
.cursor/skills/new-feature/  # /NF
tests/e2e/                   # @core @B-#### @N-####
```

---

## 3. Two-entry pipeline

```
YOU (PM)          /NB  or  /NF
       ↓
QUALIFY           Map codes · affects matrix · severity / acceptance
       ↓
BUILD (agent)     Fix or implement · Playwright · registry updates
       ↓
QA (you)          pnpm exec playwright test --headed --grep @B-####
       ↓
SHIP              ✅ registry · close B-#### · CHANGELOG · commit
```

---

## 4. Registry doc pattern (Option A + D + matrix)

**Key tables** at top (PP, PR, AA, health legend).

**Per section:**
- Header anchors: `## DT · Desktop {#dt}` → `#### DT.UI.06.001 · Appearance {#dt-ui-06-001}`
- Feature table (Option A)
- Cross-platform matrix — **aligned pipes** in `text` blocks:

```text
|            Feature             |    DT    |    WB    |    AD    |    SH    |
|--------------------------------|----------|----------|----------|----------|
|          Light theme           | ✅ B-0003 | ✅ B-0003 |    ✅     |    —     |
```

Column widths: Feature **32** · platform cells **10**. Use `scripts/format-matrix.mjs` or `generate-registry.mjs`.

**Incident card** (Option D) lives in `INCIDENTS.md`, links back to matrix.

---

## 5. Playwright tagging

```typescript
test.describe('DT.UI.06.001 · Appearance @core', () => {
  test('DT.UI.06.001.020 Light theme @B-0003', async ({ page }) => { … });
});
```

```bash
# CI (on feature-path changes) — headless + video/trace artifacts
pnpm test:features

# PM headed follow-along — local only (GitHub runners have no display)
pnpm test:features:headed              # all @N-|@core|@B-
pnpm test:features:roadmap:headed      # ROADMAP 🧪/🔄/📋 batch only
pnpm test:features:ui                  # Playwright UI step-through

# Single feature or incident
pnpm exec playwright test tests/e2e --headed --workers=1 --grep @N-#### --config=tests/playwright.config.ts --project=chromium
pnpm exec playwright test --headed --grep @B-0003 --config=tests/playwright.config.ts --project=chromium

# Pre-push core gate
pnpm exec playwright test --grep @core --config=tests/playwright.config.ts --project=chromium
```

Workflow: `.github/workflows/playwright-features.yml` — triggers on `tests/e2e`, packages, apps, ROADMAP; also `workflow_dispatch`.

---

## 6. Cursor skills

| Skill | Trigger | Purpose |
|-------|---------|---------|
| `report-bug` | `/NB` · report bug · log bug | B-#### + affects + tests |
| `new-feature` | `/NF` · new feature | N-#### + proposed codes + tests |

Install per project under `.cursor/skills/` or copy to `~/.cursor/skills/` for global use.

---

## 7. Bootstrap checklist (new project)

- [ ] Copy `FEATURE_REGISTRY.md` key tables; define your **PP** codes
- [ ] Copy `INCIDENTS.md` + `ROADMAP.md` shells
- [ ] Add code headers to spec doc sections
- [ ] Copy both skills; replace project name and PP table
- [ ] Add `@core` tag convention to existing tests
- [ ] Link from README

---

## 8. Changelog convention

```markdown
### Fixed
- **B-0003**: DT/WB light & system themes; SH theme engine (0.0.4)

### Added
- **N-0001**: Timeline week strip — DT.UI.02.010.*, WB.UI.02.010.*
```

---

*Blocks instance v1 · 2026-06-09*
