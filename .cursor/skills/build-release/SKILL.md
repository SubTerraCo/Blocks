---
name: build-release
description: >-
  Blocks /buildrelease · /BUILD — full release pipeline: pre-flight, shared
  packages, batch integration tests, compile gate, Windows installer, QA
  handoff. Use when user says /buildrelease, /BUILD, build release, release
  build, or build for QA.
disable-model-invocation: true
---

# /buildrelease · /BUILD — Release Build & QA Handoff

Full release pipeline: **pre-flight → install → packages → batch integration tests → compile → Windows installer → PM handoff**.

## Read first

- [ROADMAP.md](../../docs/Working%20Docs-Features-Incidents/ROADMAP.md) — **Batch log** (🧪 QA row)
- [CI_OPS_FRAMEWORK.md](../../docs/Working%20Docs-Features-Incidents/CI_OPS_FRAMEWORK.md) — §8.0 gate

## Pipeline map

| Phase | Skill | Command |
|-------|-------|---------|
| Dev server | [/buildserver](../build-server/SKILL.md) | `pnpm dev:web` |
| Pre-release tests | [/testrelease](../test-release/SKILL.md) | integration + e2e + `test:build` |
| Web compile only | [/Buildweb](../build-web/SKILL.md) | `pnpm build --filter web …` |
| Desktop compile/installer | [/buildwin](../build-win/SKILL.md) | `build:check` / `build:win` |
| **This skill** | `/buildrelease` | `pnpm build:release` |

## When to use

- PM says **“build for QA”**, **“jump into testing”**, **“buildrelease”**
- After `/NF` or `/NB` Phase 3 — before Phase 4 handoff
- After [/testrelease](../test-release/SKILL.md) gate is green

## Phase 1 — Context + pre-flight

```bash
pnpm build:release:context --validate
```

| Check | Fail action |
|-------|-------------|
| ROADMAP **Release** date ≠ today | Update release to `vYY.MM.DD`, or `--allow-date-drift` |
| Batch already in `build-log.json` or installer exists | Next batch in ROADMAP, or `--force-rebuild` |

## Phase 2 — Build

```bash
pnpm build:release
```

**Steps executed:**

1. `pnpm install` (unless skipped)
2. Build `@blocks/core` + `@blocks/ui`
3. Playwright **integration** — batch `integrationGrep` from ROADMAP
4. `pnpm test:build` — core · ui · web · desktop compile
5. `pnpm --filter blocks-desktop run build:win` (Windows only)

**Output:** `apps/desktop/release/Blocks-Setup-<npmVersion>.exe`

### Flags

| Flag / env | Effect |
|------------|--------|
| `--batch v26.07.02b1` | Target specific batch row |
| `--grep "@N-####\|@core"` | Override Playwright scope |
| `--skip-install` / `SKIP_INSTALL=1` | Skip `pnpm install` |
| `--skip-tests` / `SKIP_TESTS=1` | Compile + desktop only |
| `--skip-desktop` / `SKIP_DESKTOP=1` | Tests + compile only |
| `--desktop-only` | Skip packages/tests; installer only |
| `--allow-date-drift` | Allow release date ≠ today |
| `--force-rebuild` | Rebuild same batch (rare) |

## Phase 3 — Post-build QA (not run by script)

After installer exists, PM may run:

```bash
pnpm test:features:roadmap:headed

PLAYWRIGHT_GREP="<batch grep>" pnpm exec playwright test tests/e2e \
  --headed --workers=1 --config=tests/playwright.config.ts --project=chromium
```

Desktop e2e: [/testwin](../test-win/SKILL.md)

## Phase 4 — Handoff

Tell PM:

> **Batch `vYY.MM.DDbX` ready for QA** — installer at `apps/desktop/release/Blocks-Setup-….exe`

Manual checklist: [MANUAL_TEST_PLAN.md](../../docs/Working%20Docs-Features-Incidents/MANUAL_TEST_PLAN.md)

## Phase 5 — After PM confirms QA

ROADMAP → ✅ Shipped · FEATURE_REGISTRY · CHANGELOG

## Do not

- Skip compile/tests unless PM explicitly requests `--skip-tests`
- Report batch done without installer path + batch id
- Run `build:win` without closing Blocks (prebuild stops it on Windows)

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Locked `app.asar` | Quit Blocks; re-run |
| Wrong grep | Fix ROADMAP batch log N/B IDs |
| No Windows installer on Mac/Linux | GitHub **Build Release** workflow or `--skip-desktop` |
| Integration “No tests found” | Add `@B-####` spec or fix batch grep |
