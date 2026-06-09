# Blocks Incidents

> Grouped lookback for bugs. Each **B-####** lists all affected feature codes.  
> Registry health: [FEATURE_REGISTRY.md](./FEATURE_REGISTRY.md)

**Severity:** P0 = blocks release · P1 = major UX/data · P2 = workaround exists · P3 = polish  
**Status:** `Open` · `In Progress` · `Fixed` · `Won't Fix`

**Matrix columns:** Feature **32** · cells **10** · aligned `|` (same as registry)

---

## Quick reference

| ID     | Title                                  | Severity | Status | Opened | Fixed |
| ------ | -------------------------------------- | :------: | :----: | :----: | :---: |
| [B-0001](#b-0001-installer-cannot-close-tray-instance) | Installer cannot close tray instance   |    P1    | Fixed  | 0.0.3  | 0.0.4 |
| [B-0002](#b-0002-win-build-fails-when-blocks-is-running) | Win build fails when Blocks is running |    P2    | Fixed  | 0.0.3  | 0.0.4 |
| [B-0003](#b-0003-themes-lightsystem-not-applying) | Themes: Light/System not applying      |    P3    | Fixed  | 0.0.3  | 0.0.4 |

---

## Open incidents

_None._

---

## Fixed incidents

### B-0001 · Installer cannot close tray instance {#b-0001-installer-cannot-close-tray-instance}

| Field    | Value   |
| -------- | ------- |
| **Status** | Fixed   |
| **Severity** | P1      |
| **Opened** | 0.0.3   |
| **Fixed** | 0.0.4   |
| **Legacy** | BUG-001 |

**Affects matrix**

```text
|            Feature             |    DT    |    CX    |
|--------------------------------|----------|----------|
|    NSIS upgrade / uninstall    | ✅ B-0001 |    —     |
```

| Code                 | Feature                      | Break # |
| -------------------- | ---------------------------- | :-----: |
| DT.BG.01.030.010-001 | Force-close before upgrade   |    1    |
| DT.BG.01.030.020-001 | Force-close before uninstall |    1    |

**Fix:** `resources/installer.nsh` taskkill hooks; installer shutdown flags in main process.

---

### B-0002 · Win build fails when Blocks is running {#b-0002-win-build-fails-when-blocks-is-running}

| Field    | Value   |
| -------- | ------- |
| **Status** | Fixed   |
| **Severity** | P2      |
| **Opened** | 0.0.3   |
| **Fixed** | 0.0.4   |
| **Legacy** | BUG-002 |

**Affects matrix**

```text
|            Feature             |    DT    |    CX    |
|--------------------------------|----------|----------|
|      Win build packaging       |    —     | ✅ B-0002 |
```

| Code                 | Feature                  | Break # |
| -------------------- | ------------------------ | :-----: |
| CX.EN.09.010.010-001 | `pnpm build:win` packaging |    1    |

**Fix:** `prebuild:win` / `postbuild:win`; output to `release/.build`.

---

### B-0003 · Themes: Light/System not applying {#b-0003-themes-lightsystem-not-applying}

| Field    | Value   |
| -------- | ------- |
| **Status** | Fixed   |
| **Severity** | P3      |
| **Opened** | 0.0.3   |
| **Fixed** | 0.0.4   |
| **Verified** | 2026-06-09 · Light & System confirmed on desktop |
| **Legacy** | BUG-003 |
| **Playwright** | `tests/e2e/theme.spec.ts` · `pnpm exec playwright test --grep @B-0003` |

**Affects matrix**

```text
|            Feature             |    DT    |    WB    |    AD    |    SH    |
|--------------------------------|----------|----------|----------|----------|
|          Light theme           | ✅ B-0003 | ✅ B-0003 |    ✅     |    —     |
|          System theme          | ✅ B-0003 | ✅ B-0003 |    ✅     |    —     |
|   Theme engine (shared root)   |    —     |    —     |    —     | ✅ B-0003 |
```

| Code                 | Feature                 | Break # |
| -------------------- | ----------------------- | :-----: |
| DT.UI.06.001.020-001 | Light theme             |    1    |
| DT.UI.06.001.030-001 | System theme            |    1    |
| SH.UI.08.001.000-001 | Theme provider & tokens |    1    |
| SH.UI.08.001.010-001 | CSS variables / globals |    1    |
| WB.UI.06.001.020-001 | Light theme             |    1    |
| WB.UI.06.001.030-001 | System theme            |    1    |

**Fix:** Shared `applyThemePreference` + `ThemeSync`; Tailwind semantic colors bound to CSS variables; `html.light` / `html.dark` token sets in `@blocks/ui` globals.

---

## New incident template

Use `/NB` skill. Include an **Affects matrix** in `text` block (32 / 10 column widths).

When fixed: registry ✅ · move here to Fixed · [CHANGELOG.md](./CHANGELOG.md) **Fixed** line.
