---
name: build-web
description: >-
  Blocks /Buildweb — production compile of the Next.js web app and shared UI
  packages. Use when user says /Buildweb, build web, build webapp, or compile
  web.
disable-model-invocation: true
---

# /Buildweb — Web App Build

Production compile for **web** + shared packages. Does **not** run Playwright or package desktop.

## Standard build

```bash
pnpm build --filter @blocks/core --filter @blocks/ui --filter web
```

Or web only (after packages are built):

```bash
pnpm --filter web build
```

## What runs

| Step | Command | Output |
|------|---------|--------|
| Core | `pnpm --filter @blocks/core build` | `packages/core/dist` |
| UI | `pnpm --filter @blocks/ui build` | `packages/ui/dist` |
| Web | `pnpm --filter web build` | `apps/web/.next` |

## When to use

- After substantive changes under `apps/web/`, `packages/ui/`, `packages/core/`
- As part of `/testweb` compile gate (`pnpm test:build` includes web)
- **Not** a substitute for `/buildrelease` (no installer, no batch integration tests)

## Agent rules

1. Run this (or `pnpm test:build`) after code changes before telling PM web compile is OK.
2. Fix TypeScript / Next errors until build exits 0.
3. Workspace rule: run `pnpm test:build` after substantive app changes unless read-only turn.

## Related skills

| Skill | When |
|-------|------|
| [/buildserver](../build-server/SKILL.md) | Dev server for manual QA |
| [/testweb](../test-web/SKILL.md) | Web test suites + compile |
| [/buildrelease](../build-release/SKILL.md) | Full release pipeline |
