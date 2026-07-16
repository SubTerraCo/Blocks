---
name: test-web
description: >-
  Blocks /testweb — Playwright and compile tests for the web app on localhost:3004.
  Use when user says /testweb, test web, test webapp, or run web e2e.
disable-model-invocation: true
---

# /testweb — Web Test Pipeline

Tests the **PWA/web app** (primary Playwright target). Dev server: **http://localhost:3004**.

## Prerequisites

1. `/testserver` or `/buildserver` — web must respond on `:3004`
2. Batch scope from ROADMAP (optional):

```bash
pnpm build:release:context
# note integrationGrep / grep for active batch
```

## Suites

| Suite | Command | Scope |
|-------|---------|-------|
| **E2E (default)** | `pnpm test` | `tests/e2e` via `run-playwright.mjs` |
| E2E only | `pnpm test:e2e` | Same, explicit path |
| **Integration** | `pnpm test:integration` | `tests/integration` |
| **Visual** | `pnpm test:visual` | `tests/visual` |
| **A11y** | `pnpm test:a11y` | `tests/accessibility` |
| **Perf** | `pnpm test:perf` | `tests/performance` |
| **Features** | `pnpm test:features` | e2e + integration + UI package tests |
| Headed roadmap | `pnpm test:features:roadmap:headed` | PM follow-along |

## Batch-scoped (active N/B IDs)

```bash
PLAYWRIGHT_GREP="@N-0048|@N-0049|@B-0029|@core" pnpm test

PLAYWRIGHT_GREP="@B-0029|@core" pnpm test:integration

PLAYWRIGHT_GREP="@N-0048|@core" pnpm exec playwright test tests/e2e \
  --headed --workers=1 --config=tests/playwright.config.ts --project=chromium
```

## Compile gate (after Playwright green)

```bash
pnpm test:build
```

Or web-only:

```bash
pnpm build --filter @blocks/core --filter @blocks/ui --filter web
```

`pnpm test:features` runs Playwright then `test:build` automatically unless `SKIP_BUILD_TESTS=1`.

## Agent rules

1. Debug until scoped suite passes (`--workers=2` for heavy batches).
2. Run `pnpm test:build` after Playwright green on substantive changes.
3. Playwright config auto-starts `next dev :3004` if server not running (non-CI).

## Related skills

| Skill | When |
|-------|------|
| [/buildserver](../build-server/SKILL.md) | Start web dev |
| [/testrelease](../test-release/SKILL.md) | Full gate before release |
| [/buildrelease](../build-release/SKILL.md) | Package after tests |
