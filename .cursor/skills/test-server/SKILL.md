---
name: test-server
description: >-
  Blocks /testserver — verify dev servers are up before Playwright or manual QA.
  Use when user says /testserver, test server, check dev server, or is the server
  running.
disable-model-invocation: true
---

# /testserver — Dev Server Health Check

Confirm servers respond before running test suites. See [CI_OPS §8.0](../../docs/Working%20Docs-Features-Incidents/CI_OPS_FRAMEWORK.md#80-test--build--release-gate-mandatory).

## Web — required for Playwright (root config)

```bash
# Start if down:
pnpm dev:web

# Check:
curl -sf http://localhost:3004/timeline > /dev/null && echo "web OK"
```

Playwright root config auto-starts web via `webServer` when not in CI, but agent should **confirm** health for long sessions.

## Desktop renderer — optional

```bash
# Start if down:
pnpm --filter blocks-desktop dev

# Check:
curl -sf http://localhost:5173 > /dev/null && echo "desktop renderer OK"
```

Required for `apps/desktop/tests/e2e` and `PLAYWRIGHT_DESKTOP=1` integration specs.

## Playwright preflight

`scripts/run-playwright.mjs` checks `PLAYWRIGHT_BASE_URL` when set:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3004 pnpm test
```

Fails fast with “Restart with: pnpm dev:web” if unhealthy.

## Agent rules

1. If tests fail with connection refused → run `/buildserver` first, then retry.
2. Do not skip this step when PM asks to “run tests” mid-session.
3. Report which URLs were verified in handoff.

## Related skills

| Skill | When |
|-------|------|
| [/buildserver](../build-server/SKILL.md) | Start servers |
| [/testweb](../test-web/SKILL.md) | Run web suites |
| [/testwin](../test-win/SKILL.md) | Run desktop e2e |
