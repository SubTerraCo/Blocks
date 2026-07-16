---
name: build-win
description: >-
  Blocks /buildwin — compile or package the Windows desktop app (Electron).
  Use when user says /buildwin, build desktop, build windows, or desktop
  installer without full release pipeline.
disable-model-invocation: true
---

# /buildwin — Desktop Build (Windows)

Desktop compile and Windows installer packaging. Requires **Windows** for the NSIS installer.

## Fast compile gate (no installer)

```bash
pnpm --filter blocks-desktop run build:check
```

Runs `tsc && vite build` — same step as `pnpm test:build` desktop leg.

## Full Windows installer

```bash
pnpm --filter blocks-desktop run build:win
```

| Phase | Script | Notes |
|-------|--------|-------|
| Prebuild | `prepare-win-build.mjs` | Stops running Blocks instances |
| Version | `apply-batch-version.mjs` | Stamps from ROADMAP batch log |
| Compile | `tsc && vite build` | Renderer + main |
| Package | `electron-builder` (NSIS) | `.exe` under `apps/desktop/release/` |

**Output:** `apps/desktop/release/Blocks-Setup-<npmVersion>.exe`

## Flags / env (via root script)

Prefer full pipeline for QA batches:

```bash
pnpm build:release --skip-tests          # compile + installer only
pnpm build:release --desktop-only        # installer only (packages pre-built)
pnpm build:release --skip-desktop        # tests + compile, no .exe
```

## Agent rules

1. On Windows, quit Blocks before `build:win` (prebuild handles this).
2. Use `build:check` for quick post-edit verification.
3. Use `/buildrelease` when PM needs batch tests + installer + handoff card.
4. On macOS/Linux: `build:check` works; `build:win` needs Windows or GitHub **Build Release** workflow.

## Related skills

| Skill | When |
|-------|------|
| [/buildserver](../build-server/SKILL.md) | Desktop Vite dev on :5173 |
| [/testwin](../test-win/SKILL.md) | Desktop Playwright e2e |
| [/buildrelease](../build-release/SKILL.md) | Full release + batch tests |
