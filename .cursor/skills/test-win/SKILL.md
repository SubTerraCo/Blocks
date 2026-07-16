---
name: test-win
description: >-
  Blocks /testwin — Playwright e2e and compile tests for the desktop renderer
  and Windows desktop app. Use when user says /testwin, test desktop, test
  windows, or desktop e2e.
disable-model-invocation: true
---

# /testwin — Desktop Test Pipeline

Tests **desktop renderer** (Vite :5173) and compile gate. Full Electron UI uses the packaged installer from `/buildwin`.

## Prerequisites

```bash
pnpm --filter blocks-desktop dev   # http://localhost:5173
```

Verify: `/testserver` desktop check.

## Desktop Playwright (apps/desktop)

Config: `apps/desktop/playwright.config.ts` — auto-starts `npm run dev` on `:5173`.

```bash
pnpm --filter blocks-desktop exec playwright test
```

Or from repo root:

```bash
pnpm exec playwright test --config=apps/desktop/playwright.config.ts --project=chromium
```

**Suites:** `apps/desktop/tests/e2e/` — navigation, kanban, timeline, blocks, settings, profile, task-crud, ai-search.

## Shell parity (web vs desktop renderer)

Requires **both** servers:

```bash
pnpm dev:web                                    # :3004
pnpm --filter blocks-desktop dev                # :5173

PLAYWRIGHT_DESKTOP=1 pnpm exec playwright test tests/integration/b29-desktop-shell-parity.spec.ts \
  --config=tests/playwright.config.ts --project=chromium

PLAYWRIGHT_PARITY=1 pnpm exec playwright test tests/visual/desktop-web-parity.spec.ts \
  --config=tests/playwright.config.ts --project=chromium
```

## Compile gate

```bash
pnpm --filter blocks-desktop run build:check
```

Or full four-package gate:

```bash
pnpm test:build
```

## Agent rules

1. Desktop e2e title strings match web shell (“Kanban”, “Blocks”, not “Kanban Board”).
2. Run `build:check` after desktop renderer changes.
3. Installer smoke is manual or post-`/buildrelease` — e2e tests the Vite app, not TitleBar chrome.

## Related skills

| Skill | When |
|-------|------|
| [/buildwin](../build-win/SKILL.md) | Package .exe |
| [/testweb](../test-web/SKILL.md) | Web parity baseline |
| [/testrelease](../test-release/SKILL.md) | Full pre-release gate |
