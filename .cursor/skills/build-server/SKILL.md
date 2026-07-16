---
name: build-server
description: >-
  Blocks /buildserver — start dev servers for web (:3004) and optional desktop
  renderer (:5173). Use when user says /buildserver, dev server, start web dev,
  or before Playwright runs.
disable-model-invocation: true
---

# /buildserver — Dev Server

Start dev servers **before** any Playwright or manual QA. See [CI_OPS §8.0](../../docs/Working%20Docs-Features-Incidents/CI_OPS_FRAMEWORK.md#80-test--build--release-gate-mandatory).

## Primary — web (Playwright + manual QA)

```bash
pnpm dev:web
```

- URL: **http://localhost:3004**
- Builds `@blocks/ui` first, then `next dev --port 3004`
- Leave running in a background terminal for test suites

**Verify:**

```bash
curl -sf http://localhost:3004/timeline > /dev/null && echo OK
```

## Optional — desktop renderer (Vite, no Electron shell)

```bash
pnpm --filter blocks-desktop dev
```

- URL: **http://localhost:5173**
- Used for desktop Playwright e2e and `PLAYWRIGHT_DESKTOP=1` shell parity tests

## Optional — all packages (turbo)

```bash
pnpm dev
```

Use only when PM needs multi-app dev; **Playwright gate uses `dev:web`**.

## Agent rules

1. Run `pnpm dev:web` in **background** when starting a test session.
2. Confirm `:3004` responds before `pnpm test` / `/testweb`.
3. Do not report tests green if the server was cold or unreachable.

## Related skills

| Skill | When |
|-------|------|
| [/testserver](../test-server/SKILL.md) | Verify servers only |
| [/testweb](../test-web/SKILL.md) | Playwright against web |
| [/testrelease](../test-release/SKILL.md) | Full pre-release gate |
