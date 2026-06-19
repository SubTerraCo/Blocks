---
name: build-release
description: >-
  Blocks /BUILD release pipeline. Reads ROADMAP batch context, runs compile +
  batch tests, packages Windows desktop, prints QA handoff. Use when user says
  /BUILD, build release, build for QA, jump into testing, or return to a release.
disable-model-invocation: true
---

# /BUILD — Release Build & QA Handoff

Run after implementation (or when returning to a release branch) to **compile, test the active batch, package desktop**, and print headed QA commands.

## Read first

- [docs/Working Docs-Features-Incidents/ROADMAP.md](../../docs/Working%20Docs-Features-Incidents/ROADMAP.md) — **Batch log** (🧪 QA row)
- [docs/Working Docs-Features-Incidents/CI_OPS_FRAMEWORK.md](../../docs/Working%20Docs-Features-Incidents/CI_OPS_FRAMEWORK.md)

## When to use

- PM says **“build for QA”**, **“jump into testing”**, **“I’m back on this release”**
- After `/NF` or `/NB` Phase 3 (Test) — before Phase 4 handoff
- Before headed manual QA on a specific batch

## Phase 1 — Context + pre-flight

```bash
pnpm build:release:context
# or: node scripts/read-ci-context.mjs --batch v26.06.12b2 --validate
```

Confirm **release**, **batch**, and **N/B IDs** match ROADMAP batch log.

**Pre-flight (CI_OPS §2.1)** — runs automatically in `pnpm build:release`:

| Check | Fail action |
|-------|-------------|
| ROADMAP **Release** date ≠ today | Update release to today's `vYY.MM.DD`, or `--allow-date-drift` |
| Batch already in `build-log.json` or installer exists | Increment batch in ROADMAP (`b4`, …), or `--force-rebuild` |

New `/NF` · `/NB` work after a QA build → **next batch ID** before coding.

## Phase 2 — Build (local, Windows)

```bash
pnpm build:release
```

Optional flags:

| Flag / env | Effect |
|------------|--------|
| `--batch v26.06.12b2` | Target a specific batch row |
| `--grep "@N-0024\|@N-0025"` | Override Playwright scope |
| `--skip-install` / `SKIP_INSTALL=1` | Skip `pnpm install` |
| `--skip-tests` / `SKIP_TESTS=1` | Compile + desktop only |
| `--skip-desktop` / `SKIP_DESKTOP=1` | Tests + compile only (Linux/macOS) |
| `--desktop-only` | Skip packages/tests; desktop packaging only |
| `--allow-date-drift` / `ALLOW_RELEASE_DATE_DRIFT=1` | Allow release date ≠ today |
| `--force-rebuild` / `FORCE_BATCH_REBUILD=1` | Rebuild same batch (rare) |

**Steps executed:**

1. `pnpm install` (unless skipped)
2. Build `@blocks/core` + `@blocks/ui`
3. Playwright **integration** tests scoped to batch grep
4. `run-build-tests.mjs` (tsc + vite compile gate)
5. `pnpm --filter blocks-desktop build:win` (Windows only)

**Output:** `apps/desktop/release/Blocks-Setup-26.6.12-b2.exe` · About shows **`v26.06.12b2`**

Version is stamped from ROADMAP batch log in `prebuild:win` (`scripts/apply-batch-version.mjs`).

## Phase 3 — CI (optional)

GitHub Actions → **Build Release** workflow (`workflow_dispatch`):

- Runs batch integration + compile on Ubuntu
- Builds Windows installer artifact on `windows-latest`
- Inputs: `batch`, `grep`, `skip_tests`

## Phase 4 — Handoff

Script prints a **READY FOR QA** card. Tell PM:

> **Batch `vYY.MM.DDbX` ready for QA** — installer at `apps/desktop/release/…`

Headed QA commands (from batch grep):

```bash
pnpm test:features:roadmap:headed

pnpm exec playwright test tests/e2e --headed --workers=1 \
  --grep "@N-0024|@N-0025|@N-0026|@N-0027|@core" \
  --config=tests/playwright.config.ts --project=chromium
```

Manual checklist: [MANUAL_TEST_PLAN.md](../../docs/Working%20Docs-Features-Incidents/MANUAL_TEST_PLAN.md)

## Phase 5 — After PM confirms QA

Same as `/NF` Phase 5: ROADMAP → ✅ Shipped · FEATURE_REGISTRY · CHANGELOG.

## Do not

- Skip compile/tests unless PM explicitly requests `--skip-tests`
- Ship without updating batch log status after QA pass
- Run `build:win` without closing Blocks (prebuild stops it on Windows)

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Locked `app.asar` | Quit Blocks; `prebuild:win` runs automatically |
| Wrong grep / missing N-IDs | Check ROADMAP batch log row has all `N-#### · B-####` |
| No Windows installer on Mac/Linux | Use GitHub **Build Release** workflow or `--skip-desktop` locally |
