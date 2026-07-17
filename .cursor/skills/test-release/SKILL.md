---
name: test-release
description: >-
  Blocks /testrelease — full pre-release test gate (dev server, Playwright batch
  suites, compile). Use when user says /testrelease, test release, pre-release
  tests, or run all tests before build.
disable-model-invocation: true
---

# /testrelease — Pre-Release Test Gate

Runs **all test legs** before `/buildrelease`. Mirrors [CI_OPS §8.0](../../docs/Working%20Docs-Features-Incidents/CI_OPS_FRAMEWORK.md#80-test--build--release-gate-mandatory).

## Phase 1 — Context

```bash
pnpm build:release:context --validate
```

Note **batch**, **grep**, **integrationGrep**, **N/B IDs**.

## Phase 2 — Dev server policy (non-persistent by default)

```bash
# Preferred: let Playwright manage webServer lifecycle (auto-start/reuse/stop)
# No manual dev:web needed for normal /testrelease runs
```

Only start dev servers manually when debugging flaky tests or doing parity follow-along:

```bash
pnpm dev:web
pnpm --filter blocks-desktop dev    # :5173
```

If you manually start `dev:web`, stop it when the gate is done.

## Phase 3 — Playwright (debug until green)

Run in order; fix failures before continuing.

```bash
# 1. Batch integration (same scope as build:release)
PLAYWRIGHT_GREP="<integrationGrep from context>" pnpm test:integration

# 2. Batch e2e + core
PLAYWRIGHT_GREP="<grep from context>" pnpm test:e2e

# 3. Optional full feature sweep
pnpm test:features

# 4. Optional parity (both servers required)
PLAYWRIGHT_PARITY=1 pnpm exec playwright test tests/visual/desktop-web-parity.spec.ts \
  --config=tests/playwright.config.ts --project=chromium
```

Use `--workers=2` on large batches if dev server times out.

## Phase 4 — Compile gate

```bash
pnpm test:build
```

Builds: `@blocks/core` · `@blocks/ui` · `web` · `blocks-desktop (tsc + vite)`.

## Phase 5 — Hand off to build

When Phases 3–4 pass:

```bash
pnpm build:release
```

(`build:release` re-runs integration + compile + Windows installer — see [/buildrelease](../build-release/SKILL.md).)

## Checklist

```
- [ ] build:release:context --validate
- [ ] no persistent dev:web left running (unless PM requested)
- [ ] integration @batch grep green
- [ ] e2e @batch grep green
- [ ] pnpm test:build green
- [ ] (PM) build:release → installer path notified
```

## Agent rules

1. **Never** report batch done until this gate passes (unless PM waives for docs-only).
2. Do not skip `test:build` after Playwright passes.
3. `/testrelease` alone does **not** produce an installer — follow with `/buildrelease`.

## Pipeline map

| Skill | Role |
|-------|------|
| [/testserver](../test-server/SKILL.md) | Health check only |
| [/testweb](../test-web/SKILL.md) | Web suites detail |
| [/testwin](../test-win/SKILL.md) | Desktop e2e detail |
| [/buildrelease](../build-release/SKILL.md) | Package + QA handoff |
