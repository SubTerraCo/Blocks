# Blocks Roadmap & Sprint Log

> **Release:** v26.07.16  
> **Last Updated:** 2026-07-16  
> **Status:** Sprint 5 — Timeline, scheduling, events, calendar UX (active release v26.07.16)
> **Source of truth** for active sprint planning, N-#### specs, acceptance criteria, and batch log  
> **Core product specification:** [FEATURE_REGISTRY.md](./FEATURE_REGISTRY.md)  
> **Feature codes & health:** [FEATURE_REGISTRY.md](./FEATURE_REGISTRY.md) · **Bugs:** [INCIDENTS.md](./INCIDENTS.md)

---

## Table of Contents

1. [Documentation map](#documentation-map)
2. [Canonical product spec](#canonical-product-spec)
3. [New Features Roadmap (N-####)](#new-features-roadmap-n)
4. [New Feature Template](#new-feature-template)

---

## Documentation map

| Need | Canonical doc |
|------|---------------|
| Stable feature codes, product spec, page UX, data models | [FEATURE_REGISTRY.md](./FEATURE_REGISTRY.md) |
| New feature planning, acceptance criteria, batch log | [ROADMAP.md](./ROADMAP.md) |
| Bug history and regression tracking | [INCIDENTS.md](./INCIDENTS.md) |
| Release summaries | [CHANGELOG.md](./CHANGELOG.md) |
| Manual QA coverage | [MANUAL_TEST_PLAN.md](./MANUAL_TEST_PLAN.md) |
| Process / versioning / build workflow | [CI_OPS_FRAMEWORK.md](./CI_OPS_FRAMEWORK.md) |

---

## Canonical product spec

The product spec that used to live at the top of this file was merged into [FEATURE_REGISTRY.md](./FEATURE_REGISTRY.md) to avoid drift.

Use these anchors there:

- [Development priority order](./FEATURE_REGISTRY.md#development-priority-order)
- [Platform support matrix](./FEATURE_REGISTRY.md#platform-support-matrix)
- [Navigation layout](./FEATURE_REGISTRY.md#navigation-layout)
- [Page specifications](./FEATURE_REGISTRY.md#page-specifications)
- [Core data models](./FEATURE_REGISTRY.md#core-data-models)
- [Phase 2 required features](./FEATURE_REGISTRY.md#phase-2-required-features)
- [Phase 2 build plan](./FEATURE_REGISTRY.md#phase-2-sprints)
- [Playwright test requirements](./FEATURE_REGISTRY.md#playwright-test-requirements)
- [Release checklist](./FEATURE_REGISTRY.md#release-checklist)
- [Historical archive / design references](./FEATURE_REGISTRY.md#v003-bug-fixes--changes)

This file now focuses on:

- active `N-####` planning
- acceptance criteria for work in motion
- sprint status and priorities
- release batch log

---

## New Features Roadmap (N-####)

> **Format:** `N-####` until shipped · then assign `PP.PR.AA.SSS.FFF` in [FEATURE_REGISTRY.md](./FEATURE_REGISTRY.md)  
> **Workflow:** `/NF` skill or **new feature** in chat

## Quick reference

| ID     | Title                              | Target codes                    | Status      | Release |
| ------ | ---------------------------------- | ------------------------------- | :---------: | :-----: |
| [N-0001](#n-0001-timeline-week-strip) | Timeline week strip (7-day header) | DT.UI.02.010.* · WB.UI.02.010.* | 🧪 QA | v26.06.12 |
| [N-0002](#n-0002-week-start-preference) | Week start preference (Mon/Sun) | DT.UI.06.002.030 · WB.UI.06.002.030 | 🧪 QA | v26.06.12 |
| [N-0003](#n-0003-rolling-timeline-window) | Rolling timeline window (±7 days) | DT.UI.02.040.* · SB.EN.02.040.* | 🧪 QA | v26.06.12 |
| [N-0004](#n-0004-scroll-sync-week-strip) | Scroll-sync week strip indicator | DT.UI.02.010.040 · WB.UI.02.010.040 | 🧪 QA | v26.06.12 |
| [N-0005](#n-0005-due-date-calendar-view) | Due-date calendar view + toggle | DT.UI.02.050.* · WB.UI.02.050.* | 🧪 QA | v26.06.12 |
| [N-0006](#n-0006-timeline-entry-snap-to-now) | Timeline entry snap to now | DT.UI.02.040.050 · WB.UI.02.040.050 | 🧪 QA | v26.06.12 |
| [N-0007](#n-0007-live-scroll-lock--snap-delay) | Live scroll lock + snap delay setting | DT.UI.02.040.060 · DT.UI.06.002.040 | 🧪 QA | v26.06.12 |
| [N-0008](#n-0008-timeline-auto-tracking--pause-sync) | Auto-tracking + pause-sync timeline | DT.UI.02.034.020 · SB.EN.02.060.* | 🧪 QA | v26.06.12 |
| [N-0009](#n-0009-timeline-card-tracking-header) | Card tracking header + count up/down | DT.UI.02.034.030 · DT.UI.06.002.050 | ↪️ Superseded | v26.06.12 |
| [N-0010](#n-0010-app-tracking-chrome) | App tracking clock + control strip | DT.UI.00.010.040 · DT.UI.02.034.040 | 🔄 In progress | v26.06.12 |
| [N-0011](#n-0011-schedule-immediately-quick-blocks) | Schedule immediately (Quick Blocks) | DT.UI.03.020.020 | 🔄 In progress | v26.06.12 |
| [N-0012](#n-0012-bottom-action-row-kanban-clearance) | Bottom action row + Kanban clearance | DT.UI.00.020.020 · DT.UI.01.010.020 | 🔄 In progress | v26.06.12 |
| [N-0013](#n-0013-tracking-player-controls) | Tracking player prev/next controls | DT.UI.00.020.030 · SB.EN.02.060.020 | 🔄 In progress | v26.06.12 |
| [N-0014](#n-0014-now-bar-viewport-offset) | Now-bar viewport offset slider | DT.UI.06.002.060 · SB.EN.02.040.070 | 🔄 In progress | v26.06.12 |
| [N-0015](#n-0015-bottom-control-row-cushion) | Bottom control row cushion | SH.UI.02.040.030 | 🔄 In progress | v26.06.12 |
| [N-0016](#n-0016-add-time-menu-stretch) | Add-time stretch menu | DT.UI.00.020.040 | 🔄 In progress | v26.06.12 |
| [N-0017](#n-0017-google-calendar-timeline) | Google Calendar on timeline | DT.UI.02.036.* · WB | ⏸ On hold | v26.06.12 |
| [N-0018](#n-0018-p2p-yjs-sync) | P2P Yjs task sync (web + desktop) | SH.EN.02.070.* | 🔄 In progress | v26.06.12 |
| [N-0019](#n-0019-mcp-dexie-export-mode) | MCP export mode + Anytype markdown | CX.EN.09.020.* | 🔄 In progress | v26.06.12 |
| [N-0020](#n-0020-schedule-conflict-alerts) | Schedule conflict alerts | DT · WB · SH · SB | 🔄 In progress | v26.06.12 |
| [N-0021](#n-0021-single-focus-task-scheduling) | Single-focus task scheduling | DT · WB · SH · SB | 🔄 In progress | v26.06.12 |
| [N-0022](#n-0022-profile-google-sign-in) | Profile Google sign-in + calendar | DT · WB · SH | ⏸ On hold | v26.06.12 |
| [N-0023](#n-0023-retail-google-oauth) | Retail Google OAuth (hosted proxy) | DT · WB · CX | ⏸ On hold | v26.06.12 |
| [N-0024](#n-0024-pause-snap-during-drag) | Pause snap during drag-reschedule | DT · WB · SH | 🔄 In progress | v26.06.12 |
| [N-0025](#n-0025-schedule-doing-lock-current) | Schedule Doing — lock current task | DT · WB · SH · SB | 🔄 In progress | v26.06.12 |
| [N-0026](#n-0026-user-events-on-tasks) | User events (Task property + create) | DT · WB · SH · SB | 🔄 In progress | v26.06.12 |
| [N-0027](#n-0027-continuous-scroll-calendar) | Continuous scroll calendar (replaces N-0005) | DT · WB · SH | 🔄 In progress | v26.06.12 |
| [N-0028](#n-0028-bulk-timeline-reschedule) | Bulk timeline reschedule | DT · WB · SH · SB | 📋 Proposed | v26.06.12 |
| [N-0029](#n-0029-passive-overlap-on-bulk-move) | Passive overlap columns on bulk move | DT · WB · SH · SB | 📋 Proposed | v26.06.12 |
| [N-0030](#n-0030-calendar-sticky-day-strip) | Calendar sticky day strip (global) | DT · WB · SH | 📋 Proposed | v26.06.12 |
| [N-0031](#n-0031-timeline-nav-exits-calendar) | Timeline nav exits calendar view | DT · WB · SH | 📋 Proposed | v26.06.12 |
| [N-0045](#n-0045-quick-blocks-as-reusable-tasks) | Quick Blocks as reusable task templates | DT · WB · SB | 🧪 QA | v26.06.30 |
| [N-0046](#n-0046-event-section-below-task-name) | Event section below Task Name | DT · WB | 🧪 QA | v26.06.30 |
| [N-0047](#n-0047-events-right-column-on-conflict) | Events right column on timeline conflict | DT · WB · SB | 🧪 QA | v26.06.30 |
| [N-0048](#n-0048-kanban-sort--manual-order) | Kanban sort + manual drag order | DT · WB · SB | 🧪 QA | v26.06.30 |
| [N-0049](#n-0049-kanban-filter--saved-views) | Kanban filter + saved views | DT · WB · SB | 🧪 QA | v26.06.30 |

**Status:** 📋 Proposed · 🔄 In progress · 🧪 QA · ✅ Shipped · ⏸ On hold · ❌ Dropped

### Active sprint 5 (v26.07.16)

All items not yet ✅ Shipped belong to **Sprint 5** at release **v26.07.16**. **Google** (N-0017, N-0022, N-0023) is **on hold** per product decision.

| Track | IDs | Focus |
| ----- | --- | ----- |
| Timeline UX (QA) | N-0001–N-0008 | Week strip, rolling window, calendar toggle, snap/follow |
| Tracking & chrome | N-0010–N-0016 | Control strip, schedule immediately, player controls, offsets |
| Scheduling engine | N-0020–N-0021 | Conflict alerts, single-focus push-back, overlap columns |
| Events & calendar | N-0024–N-0027 | Drag snap pause, schedule-doing lock, user events, scroll calendar |
| Bulk reschedule | N-0028–N-0029 | Multi-select drag, passive column overlap |
| Blocks & Kanban (v26.06.30) | N-0045–N-0049 | Reusable block tasks, event section, event columns, Kanban sort/filter/views |
| Integrations (on hold) | N-0017–N-0019, N-0022–N-0023 | GCal, P2P, MCP, OAuth |

### Batch log (Sprint 5)

One `/NF` · `/NB` · `/RD` design session = one batch (`v26.06.12bX`). QA via `--grep` on listed N/B IDs.

| Batch | Session | Items | Status |
| ----- | ------- | ----- | :----: |
| v26.06.09b1 | CI Ops + versioning + design pipeline | docs, skills | ✅ Shipped |
| v26.06.12b2 | Events & calendar — finish timeline scheduling UX | N-0024 · N-0025 · N-0026 · N-0027 · B-0018 | 🧪 QA |
| v26.06.12b3 | Events UI + drag snap + calendar polish | B-0019 · B-0020 · B-0021 · B-0022 · N-0030 · N-0031 | 🧪 QA |
| v26.06.13b1 | UI polish — slide toggles, calendar, shell clock | B-0023 · B-0024 · N-0032 · N-0033 · N-0034 · N-0035 · N-0036 · N-0037 | 🧪 QA |
| v26.06.14b1 | QA polish — now-bar, calendar, accents, clock | B-0025 · B-0026 · N-0038 · N-0039 · N-0040 · N-0041 · N-0042 · N-0043 | 🧪 QA |
| v26.06.14b2 | Timeline add-task + task edit bottom bar | B-0027 · N-0044 | 🧪 QA |
| v26.06.14b3 | Shell Now task alignment to clock | B-0028 | 🧪 QA |

| v26.06.19b1 | Nightly dev push seal · v26.06.19 | — | 🧪 QA |
| v26.06.30b1 | Reusable block tasks · event section · event columns · Kanban sort/filter/views | N-0045 · N-0046 · N-0047 · N-0048 · N-0049 | 🧪 QA |
| v26.06.30b2 | Nightly dev push seal · v26.06.30 | N-0045 · N-0046 · N-0047 · N-0048 · N-0049 | 🧪 QA |
| v26.07.01b1 | Global spacing restore · June 9 accent baseline · Kanban toolbar header | B-0029 | 🧪 QA |
| v26.07.02b1 | Desktop-web shell parity · shared TopBar · Playwright parity gate | B-0029 | 🧪 QA |
| v26.07.16b1 | Open release branch · docs hub in root README | — | 🧪 QA |

---

## Proposed

### N-0001 · Timeline week strip {#n-0001-timeline-week-strip}

| Field          | Value                        |
| -------------- | ---------------------------- |
| **Status**     | 📋 Proposed                  |
| **Target release** | v26.06.12                    |
| **Platforms**  | DT · WB (first) · AD (later) |
| **Related**    | Complements [N-0003](#n-0003-rolling-timeline-window) day navigation |

**Description:** Horizontal 7-day date strip above the timeline for quick day navigation.

**Platform matrix (on ship)**

```text

|            Feature             |    DT    |    WB    |    AD    |
|--------------------------------|----------|----------|----------|
|       Day cell selection       | 📋 N-0001 | 📋 N-0001 |    —     |
|         Jump to today          | 📋 N-0001 | 📋 N-0001 |    —     |
|     Week strip container       | 📋 N-0001 | 📋 N-0001 |    —     |

```

**Proposed registry codes (on ship)**

| Code             | Feature                    |
| ---------------- | -------------------------- |
| DT.UI.02.010.010 | Week strip container       |
| DT.UI.02.010.020 | Day cell selection         |
| DT.UI.02.010.030 | Jump to today              |
| WB.UI.02.010.010 | Week strip container (web) |
| WB.UI.02.010.020 | Day cell selection (web)   |

**Acceptance criteria**

- [ ] Tap day → timeline scrolls to that date

- [ ] Today highlighted in magenta

- [ ] Respects [N-0002](#n-0002-week-start-preference) week-start order in strip

- [ ] Persists selected day in session storage

- [ ] Playwright: `@N-0001` passes headed on DT + WB

**Playwright (to create on approve)**

- `tests/e2e/timeline-week-strip.spec.ts`

**Spec section:** Timeline (documented in this file)

---

### N-0002 · Week start preference {#n-0002-week-start-preference}

| Field          | Value                                      |
| -------------- | ------------------------------------------ |
| **Status**     | 📋 Proposed                                |
| **Target release** | v26.06.12                                  |
| **Platforms**  | DT (first) · WB (when work schedule UI ships) · AD (later) |

**Description:** Add a Work Schedule setting to choose how the **Work Days** row is ordered and labeled — **Start week on Monday** (ISO / current default) or **Start week on Sunday** (American calendar layout). Does not change which days are selected; only display order and first column in the picker.

**Platform matrix (on ship)**

```text

|            Feature             |    DT    |    WB    |    AD    |    SH    |
|--------------------------------|----------|----------|----------|----------|
|    Week start setting (UI)     | 📋 N-0002 | 📋 N-0002 |    —     |    —     |
|   Work days row reorder        | 📋 N-0002 | 📋 N-0002 |    —     |    —     |
|  weekStartsOn in Settings      |    —     |    —     |    —     | 📋 N-0002 |

```

**Proposed registry codes (on ship)**

| Code             | Feature                              |
| ---------------- | ------------------------------------ |
| DT.UI.06.002.030 | Week start preference (Mon / Sun)    |
| DT.UI.06.002.031 | Work days row respects week start    |
| WB.UI.06.002.030 | Week start preference (web)          |
| SH.EN.06.002.010 | `weekStartsOn` in Settings schema    |

**Settings schema (proposed)**

```typescript

weekStartsOn: z.enum(["monday", "sunday"]).default("monday")

```

**Acceptance criteria**

- [ ] Settings → Work Schedule shows segmented control: **Monday** | **Sunday**

- [ ] **Monday:** Work Days row order `M T W T F S S` (Mon → Sun)

- [ ] **Sunday:** Work Days row order `S M T W T F S` (Sun → Sat, American)

- [ ] Selection persists in Dexie settings / desktop local storage

- [ ] Changing preference reorders buttons only; selected work days unchanged

- [ ] Default remains **Monday** for existing users

- [ ] Playwright: `@N-0002` passes on DT

**Playwright (to create on approve)**

- `tests/e2e/week-start-settings.spec.ts`

**Spec section:** Settings › Work Schedule (documented in this file)

---

### N-0003 · Rolling timeline window {#n-0003-rolling-timeline-window}

| Field          | Value                                      |
| -------------- | ------------------------------------------ |
| **Status**     | 📋 Proposed                                |
| **Target release** | v26.06.12                                  |
| **Platforms**  | DT · WB · SB (core)                        |
| **Supersedes** | Midnight daily clear — [DT.UI.02.032.010](./FEATURE_REGISTRY.md#matrix-timeline-v03), [SB.EN.02.032.010](./FEATURE_REGISTRY.md#aa-02), [DT.BG.01.060.010](./FEATURE_REGISTRY.md#dt-bg-01) |

**Description:** Replace the single-day timeline + midnight reset with a **continuous scrolling clock** spanning **7 days before through 7 days after** the current moment. Tasks scheduled outside the visible window are hidden (not deleted); tasks older than one week fall off the timeline view automatically. Removes the need for `useDailyTimelineReset`, Electron midnight IPC, and `clearTimelineForNewDay` as the primary daily-reset mechanism.

**Platform matrix (on ship)**

```text

|            Feature             |    DT    |    WB    |    AD    |    SH    |    SB    |
|--------------------------------|----------|----------|----------|----------|----------|
|   ±7 day scrollable timeline   | 📋 N-0003 | 📋 N-0003 |    —     |    —     |    —     |
|    Continuous clock axis       | 📋 N-0003 | 📋 N-0003 |    —     |    —     |    —     |
|   Window filter (hide stale)   |    —     |    —     |    —     |    —     | 📋 N-0003 |
|  Deprecate midnight auto-clear | 📋 N-0003 | 📋 N-0003 |    —     |    —     | 📋 N-0003 |
|      Scroll-to-now on open     | 📋 N-0003 | 📋 N-0003 |    —     |    —     |    —     |

```

**Proposed registry codes (on ship)**

| Code             | Feature                                      |
| ---------------- | -------------------------------------------- |
| DT.UI.02.040.010 | Rolling timeline container (±7 days)          |
| DT.UI.02.040.020 | Continuous multi-day clock axis               |
| DT.UI.02.040.030 | Scroll-to-current-time on mount               |
| DT.UI.02.040.040 | Day boundary labels in scroll view            |
| WB.UI.02.040.010 | Rolling timeline container (web)              |
| WB.UI.02.040.020 | Continuous multi-day clock axis (web)         |
| SB.EN.02.040.010 | `getTimelineWindow(now, ±days)` filter       |
| SB.EN.02.040.020 | Task visibility within window (doing + date)  |
| SB.EN.02.040.030 | Retire `clearTimelineForNewDay` as auto job   |

**Acceptance criteria**

- [ ] Timeline renders a vertically scrollable range from **now − 7 days** to **now + 7 days**

- [ ] Hour grid and task blocks positioned on a continuous time axis (not reset at midnight)

- [ ] Tasks with `status=doing` + `scheduledAt` show only when `scheduledAt` falls inside the window

- [ ] Tasks older than 7 days before now disappear from timeline without status change (view filter only)

- [ ] Opening timeline scrolls to current time (today marker / now line)

- [ ] **No** automatic midnight clear via `useDailyTimelineReset` or Electron `timeline:clear` IPC

- [ ] Manual `clear_timeline` MCP tool still works for explicit clears

- [ ] Registry matrix: midnight clear rows marked deprecated / replaced

- [ ] Playwright: `@N-0003` passes on DT + WB

**Playwright (to create on approve)**

- `tests/e2e/rolling-timeline.spec.ts`

- Update / retire `tests/integration/timeline-reset.spec.ts` expectations

**Migration notes**

- Disable `useDailyTimelineReset` in desktop + web App shells

- Remove or gate `scheduleMidnightTimelineClear` in `apps/desktop/src/main/index.ts`

- Keep `clearTimelineForNewDay` in core for MCP/manual use; document as optional legacy

**Spec section:** Timeline — replace "Daily Clear Timeline (00:00)" with "Rolling window (±7 days)" (documented in this file)

**Related:** [N-0001](#n-0001-timeline-week-strip) optional header for jumping within the window

---

### N-0004 · Scroll-sync week strip indicator {#n-0004-scroll-sync-week-strip}

| Field          | Value                        |
| -------------- | ---------------------------- |
| **Status**     | 🧪 QA                        |
| **Target release** | v26.06.12                    |
| **Platforms**  | DT · WB (first)              |
| **Related**    | Extends [N-0001](#n-0001-timeline-week-strip) · pairs with [N-0003](#n-0003-rolling-timeline-window) |

**Description:** As the user scrolls the rolling timeline, the week-strip selection highlight slides horizontally between days. Movement begins when 00:00 enters the viewport, interpolates (midnight centered = halfway between days), and locks on the next day when midnight reaches the top.

**Platform matrix (on ship)**

```text

|            Feature             |    DT    |    WB    |    AD    |
|--------------------------------|----------|----------|----------|
|   Midnight boundary markers    | 📋 N-0004 | 📋 N-0004 |    —     |
|  Sliding selection indicator   | 📋 N-0004 | 📋 N-0004 |    —     |
|   Scroll-driven day lock       | 📋 N-0004 | 📋 N-0004 |    —     |

```

**Proposed registry codes (on ship)**

| Code             | Feature                              |
| ---------------- | ------------------------------------ |
| DT.UI.02.010.040 | Scroll-sync selection indicator      |
| WB.UI.02.010.040 | Scroll-sync selection indicator (web)|
| SH.EN.02.010.010 | Midnight boundary scroll progress    |

**Acceptance criteria**

- [ ] Selection box shifts only while 00:00 is in the visible scroll window

- [ ] Midnight at viewport center → indicator halfway between adjacent days

- [ ] Midnight at viewport top → indicator locked on the next calendar day

- [ ] Tap day in strip still jumps timeline; indicator follows

- [ ] Playwright: `@N-0004` passes headed on DT + WB

**Playwright**

- `tests/e2e/timeline-scroll-day-sync.spec.ts`

**Spec section:** Timeline week strip — scroll-sync behavior (documented in this file)

---

### N-0005 · Due-date calendar view {#n-0005-due-date-calendar-view}

| Field          | Value                        |
| -------------- | ---------------------------- |
| **Status**     | 🧪 QA                        |
| **Target release** | v26.06.12                    |
| **Platforms**  | DT · WB (first)              |
| **Related**    | Timeline page · complements [N-0003](#n-0003-rolling-timeline-window) schedule view |

**Description:** Bottom-left toggle (mirror of Schedule FAB) switches between rolling timeline and a month calendar showing all tasks with a due date. Tap task opens edit.

**Platform matrix (on ship)**

```text

|            Feature             |    DT    |    WB    |    AD    |
|--------------------------------|----------|----------|----------|
|   Timeline / calendar toggle   | 📋 N-0005 | 📋 N-0005 |    —     |
|     Due-date month calendar    | 📋 N-0005 | 📋 N-0005 |    —     |
|      Task chips on day cell    | 📋 N-0005 | 📋 N-0005 |    —     |
|      Month navigation          | 📋 N-0005 | 📋 N-0005 |    —     |

```

**Proposed registry codes (on ship)**

| Code             | Feature                         |
| ---------------- | ------------------------------- |
| DT.UI.02.050.010 | Timeline / calendar view toggle |
| DT.UI.02.050.020 | Due-date calendar grid          |
| WB.UI.02.050.010 | View toggle (web)               |
| WB.UI.02.050.020 | Due-date calendar grid (web)    |
| SB.EN.02.050.010 | Due-date grouping engine        |

**Acceptance criteria**

- [ ] Calendar toggle fixed bottom-left; Schedule stays bottom-right

- [ ] Toggle switches timeline ↔ calendar on same route

- [ ] Calendar shows every task with `dueDate` on the correct day

- [ ] Respects [N-0002](#n-0002-week-start-preference) week-start in grid headers

- [ ] Tap task → edit task

- [ ] View mode persists in session storage

- [ ] Playwright: `@N-0005` passes headed on DT + WB

**Playwright**

- `tests/e2e/timeline-calendar-view.spec.ts`

**Spec section:** Timeline — calendar view (documented in this file)

---

### N-0006 · Timeline entry snap to now {#n-0006-timeline-entry-snap-to-now}

| Field          | Value |
| -------------- | ----- |
| **Status**     | 📋 Proposed |
| **Target release** | v26.06.12 |
| **Platforms**  | DT · WB |
| **Related**    | Extends [N-0003](#n-0003-rolling-timeline-window) · pairs with [N-0007](#n-0007-live-scroll-lock--snap-delay) |

**Description:** Whenever the user navigates **to** the Timeline page from any other route (Kanban, Blocks, Settings, calendar toggle back, etc.), the view snaps to **today** and **current time** with the now-line centered in the viewport (same target as [N-0007](#n-0007-live-scroll-lock--snap-delay) center lock).

**Platform matrix (on ship)**

```text
|            Feature             |    DT    |    WB    |    AD    |
|--------------------------------|----------|----------|----------|
|   Snap to today on page entry  | 📋 N-0006 | 📋 N-0006 |    —     |
|  Snap to current time on entry | 📋 N-0006 | 📋 N-0006 |    —     |
|  Center now-line in viewport   | 📋 N-0006 | 📋 N-0006 |    —     |
```

**Proposed registry codes (on ship)**

| Code             | Feature |
| ---------------- | ------- |
| DT.UI.02.040.050 | Timeline entry snap-to-now |
| WB.UI.02.040.050 | Timeline entry snap-to-now (web) |
| SB.EN.02.040.040 | `scrollTimelineToNow(center)` helper |

**Acceptance criteria**

- [ ] Navigating to Timeline from any bottom-nav tab scrolls to current day + time
- [ ] Returning from calendar toggle counts as timeline entry (re-snap)
- [ ] Week strip selected day updates to today on entry snap
- [ ] Does not fight manual scroll until [N-0007](#n-0007-live-scroll-lock--snap-delay) snap-delay elapses
- [ ] Playwright: `@N-0006` passes on DT + WB

**Playwright (to create)**

- `tests/e2e/timeline-entry-snap.spec.ts`

---

### N-0007 · Live scroll lock + snap delay setting {#n-0007-live-scroll-lock--snap-delay}

| Field          | Value |
| -------------- | ----- |
| **Status**     | 📋 Proposed |
| **Target release** | v26.06.12 |
| **Platforms**  | DT · WB · SH (settings) |
| **Related**    | [N-0006](#n-0006-timeline-entry-snap-to-now) · supersedes N-0003 scroll-to-now on mount |

**Description:** While on Timeline, **current time stays vertically centered** in the viewport. The timeline scrolls continuously with the clock unless the user manually scrolls. After a configurable delay (Settings), the view **smoothly** recenters on now. **`0` seconds** = no auto-snap after manual scroll (timeline stays where left until user leaves and re-enters Timeline, then [N-0006](#n-0006-timeline-entry-snap-to-now) applies).

**Platform matrix (on ship)**

```text
|            Feature             |    DT    |    WB    |    SH    |    SB    |
|--------------------------------|----------|----------|----------|----------|
|   Current time viewport center | 📋 N-0007 | 📋 N-0007 |    —     |    —     |
|   Continuous scroll-with-time  | 📋 N-0007 | 📋 N-0007 |    —     | 📋 N-0007 |
|  Snap delay setting (0–120 s)  | 📋 N-0007 | 📋 N-0007 | 📋 N-0007 | 📋 N-0007 |
|   Smooth recenter after delay  | 📋 N-0007 | 📋 N-0007 |    —     |    —     |
```

**Proposed registry codes (on ship)**

| Code             | Feature |
| ---------------- | ------- |
| DT.UI.02.040.060 | Live scroll lock (centered now) |
| DT.UI.02.040.070 | Smooth snap-back after user scroll |
| DT.UI.06.002.040 | Timeline snap delay setting UI |
| WB.UI.02.040.060 | Live scroll lock (web) |
| WB.UI.06.002.040 | Snap delay setting (web) |
| SH.EN.06.002.020 | `timelineSnapDelaySec` in Settings (0–120, default 15) |
| SB.EN.02.040.050 | Scroll position / now-offset engine |

**Settings schema (proposed)**

```typescript
timelineSnapDelaySec: z.number().int().min(0).max(120).default(15)
// 0 = disable auto-snap after manual scroll; re-entry snap still via N-0006
```

**Acceptance criteria**

- [ ] Now-line remains at vertical center of timeline viewport during live scroll
- [ ] User scroll pauses auto-follow until delay expires (or forever if delay = 0)
- [ ] After delay, smooth scroll recenters current time
- [ ] Settings → Timeline shows snap delay control (0–120 seconds, step 5 or slider)
- [ ] Value persists in Dexie / desktop local settings
- [ ] Playwright: `@N-0007` passes on DT + WB

**Playwright (to create)**

- `tests/e2e/timeline-snap-delay.spec.ts`

---

### N-0008 · Timeline auto-tracking + pause-sync {#n-0008-timeline-auto-tracking--pause-sync}

| Field          | Value |
| -------------- | ----- |
| **Status**     | 📋 Proposed |
| **Target release** | v26.06.12 |
| **Platforms**  | DT (first) · WB · SB |
| **Related**    | [B-0005](./INCIDENTS.md#b-0005-timeline-remove-button-covered-by-timer) (layout fix ships first) · DT.UI.02.034.010 |

**Description:** When current time reaches a scheduled task block, **automatically start** time tracking. Bottom-right controls: sideways **triangle** (play / pause) and **X** (remove) — unified size and alignment ([B-0005](./INCIDENTS.md#b-0005-timeline-remove-button-covered-by-timer)). While paused, the paused task and **all tasks scheduled below it** shift in sync with real time (timeline reflects elapsed pause gap). On resume, the card **splits visually** — completed segment, blank gap for paused duration, resumed segment.

**Platform matrix (on ship)**

```text
|            Feature             |    DT    |    WB    |    SB    |
|--------------------------------|----------|----------|----------|
|   Auto-start track at now      | 📋 N-0008 | 📋 N-0008 | 📋 N-0008 |
|  Pause shifts task + below     | 📋 N-0008 | 📋 N-0008 | 📋 N-0008 |
|   Visual pause gap on card     | 📋 N-0008 | 📋 N-0008 |    —     |
|  Unified card action buttons   | 📋 N-0008 | 📋 N-0008 |    —     |
```

**Proposed registry codes (on ship)**

| Code             | Feature |
| ---------------- | ------- |
| DT.UI.02.034.020 | Auto-start tracking at scheduled now |
| DT.UI.02.034.030 | Pause-sync downstream tasks |
| DT.UI.02.034.040 | Pause gap visual split on card |
| WB.UI.02.034.020 | Auto-start tracking (web) |
| SB.EN.02.060.010 | Active-task-at-now detection |
| SB.EN.02.060.020 | Pause-sync reschedule engine |

**Acceptance criteria**

- [ ] When now-line enters a task block, timer starts without manual tap
- [ ] Pause button stops tracking and shifts paused task + later tasks with clock
- [ ] Resume continues tracking; card shows gap between pause and resume segments
- [ ] Remove (X) and play/pause share bottom-right row, equal dimensions
- [ ] Playwright: `@N-0008` passes headed on DT

**Playwright (to create)**

- `tests/e2e/timeline-auto-tracking.spec.ts`

---

### N-0009 · Timeline card tracking header + count mode {#n-0009-timeline-card-tracking-header}

**Description:** Active timeline task cards show a **centered tracking clock** in the card header (not footer) so it stays visible while scrolling. Remove redundant task title from card body (actions remain in footer). Settings control switches clock between **count up (elapsed)** and **count down (remaining)**.

**Platform matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |
|--------------------------------|----------|----------|----------|
|  Centered card tracking clock  | 📋 N-0009 |    —     | 📋 N-0009 |
|  Count up / count down setting | 📋 N-0009 | 📋 N-0009 | 📋 N-0009 |
```

| Code (proposed)      | Feature |
| -------------------- | ------- |
| DT.UI.02.034.030     | Timeline card tracking header |
| DT.UI.06.002.050     | Timeline timer display setting |
| SH.UI.02.031.020     | TimelineBlock tracking header slot |
| WB.UI.06.002.050     | Timer display setting (web settings) |

**Acceptance criteria**

- [ ] Tracking clock centered in card header when task is active
- [ ] Task name removed from card top; priority/duration remain in body
- [ ] Footer keeps play/pause + remove only
- [ ] Settings → Timeline: elapsed vs remaining selector
- [ ] Playwright: `@N-0009` settings control passes

**Playwright**

- `tests/e2e/timeline-timer-display-setting.spec.ts`

---

### N-0010 · App tracking chrome (clock + control strip) {#n-0010-app-tracking-chrome}

**Description:** Move the tracking **clock** from timeline cards to the **app header center** (replaces “Kanban” / “Timeline” while tracking). Restore **task names** on timeline cards. **Pause/Resume** is a centered icon-only accent button on the same row as the Calendar/Timeline toggle (bottom-left) and Schedule FAB (bottom-right) — no opaque strip or extra text.

**Placement rationale**

| Control | Location | Why |
| ------- | -------- | --- |
| Clock (elapsed / remaining) | Top bar center | Always visible; never clipped by timeline now-line |
| Pause / Resume | Fixed bottom row, centered (`bottom-24`) | Matches toggle + schedule; thumb-friendly; transparent chrome |
| Task name | Timeline card header/body | Context on the card, not in tracking chrome |

**Platform matrix**

```text
|            Feature             |    DT    |    AD    |    SH    |
|--------------------------------|----------|----------|----------|
|   App header tracking clock    | 📋 N-0010 | 📋 N-0010 |    —     |
|  Tracking pause/resume button  | 📋 N-0010 | 📋 N-0010 | 📋 N-0010 |
|   Timeline card task title     | 📋 N-0010 |    —     | 📋 N-0010 |
|  Timeline bottom action row    | 📋 N-0010 | 📋 N-0010 | 📋 N-0010 |
```

| Code (proposed)      | Feature |
| -------------------- | ------- |
| DT.UI.00.010.040     | App header tracking clock |
| DT.UI.00.020.010     | Tracking pause/resume (centered icon) |
| SH.UI.02.040.030     | Shared bottom action button styles |
| SH.UI.02.031.020     | Timeline card task title |

**Acceptance criteria**

- [ ] Clock in top bar when tracking; page title when idle
- [ ] Task names restored on timeline cards (`timeline-task-name`); no card-level clock
- [ ] Pause/Resume: centered icon-only accent square; no strip or task-name text
- [ ] Calendar/Timeline toggle + Schedule FAB: same 48×48 rounded-square accent styling
- [ ] Count up/down setting (N-0009) still drives header clock
- [ ] Playwright: `@B-0009` · `@B-0010` · `@N-0010`

**Playwright**

- `tests/e2e/timeline-timer-display-setting.spec.ts` (setting persists)

---

### N-0011 · Schedule immediately (Quick Blocks) {#n-0011-schedule-immediately-quick-blocks}

**Description:** Add **Schedule immediately** as the first option in the Quick Blocks placement picker — schedules at the current time (now bar).

**Platform matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |
|--------------------------------|----------|----------|----------|
|  Quick Blocks placement picker | 📋 N-0011 | 📋 N-0011 |    —     |
|   Schedule immediately option  | 📋 N-0011 | 📋 N-0011 |    —     |
```

| Code (proposed)      | Feature |
| -------------------- | ------- |
| DT.UI.03.020.020     | Schedule immediately placement option |
| SH.UI.03.020.010     | Shared placement picker (future) |

**Acceptance criteria**

- [ ] "Schedule immediately" appears first in placement list with now-bar time preview
- [ ] Selecting it schedules the block at rounded current time
- [ ] Playwright: `@N-0011` (desktop blocks picker)

**Playwright**

- `apps/desktop/tests/e2e/blocks.spec.ts` (extend)

---

### N-0012 · Bottom action row + Kanban clearance {#n-0012-bottom-action-row-kanban-clearance}

**Description:** Move timeline bottom controls (toggle, tracking player, schedule) closer to the bottom nav. Add column footer padding on Kanban so **Add Task** buttons are not covered while tracking.

**Platform matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |
|--------------------------------|----------|----------|----------|
|  Bottom action row position    | 📋 N-0012 | 📋 N-0012 | 📋 N-0012 |
|   Kanban column footer pad     | 📋 N-0012 | 📋 N-0012 |    —     |
```

| Code (proposed)      | Feature |
| -------------------- | ------- |
| SH.UI.02.040.030     | Bottom action fixed offset |
| DT.UI.01.010.020     | Kanban column clearance |

**Acceptance criteria**

- [ ] Bottom row at `bottom-[4.125rem]` (just above h-16 nav)
- [ ] Kanban Add Task buttons clear the tracking row when visible
- [ ] Playwright: `@N-0012` · `@N-0013` layout smoke

---

### N-0013 · Tracking player prev/next controls {#n-0013-tracking-player-controls}

**Description:** Music-player style tracking row: **prev** opens +5/+10/+15/+30 min menu; **center** pause/resume; **next** double-tap completes task and pulls downstream doing tasks earlier by freed slot time.

**Platform matrix**

```text
|            Feature             |    DT    |    SH    |    SB    |
|--------------------------------|----------|----------|----------|
|  Extend active task duration   | 📋 N-0013 |    —     | 📋 N-0013 |
|  Complete + shift downstream   | 📋 N-0013 |    —     | 📋 N-0013 |
|  Tracking player UI row        | 📋 N-0013 | 📋 N-0013 |    —     |
```

| Code (proposed)      | Feature |
| -------------------- | ------- |
| DT.UI.00.020.030     | Tracking player controls |
| SB.EN.02.060.020     | Downstream schedule shift helpers |

**Acceptance criteria**

- [ ] Prev: vertical +time menu (+5, +10, +15, +30); extends task + pushes downstream forward
- [ ] Next: double-tap confirms; completes task; downstream tasks shift earlier equally
- [ ] Side buttons h-10; center h-12; row centered above nav
- [ ] Playwright: `@N-0013` testids on desktop

**Playwright**

- `tests/e2e/tracking-player-row.spec.ts`

---

### N-0014 · Now-bar viewport offset {#n-0014-now-bar-viewport-offset}

**Description:** Settings slider adjusts where the **now-bar** sits in the timeline viewport (¼ from top → ¼ from bottom). Soft snaps at ⅓ top, center, ⅓ bottom. Snap-back and entry snap preserve the chosen offset.

**Acceptance criteria**

- [ ] Slider in Settings → Timeline
- [ ] Snap-back uses offset (not forced center)
- [ ] `data-now-bar-ratio` on rolling timeline
- [ ] Playwright: `@N-0014`

---

### N-0015 · Bottom control row cushion {#n-0015-bottom-control-row-cushion}

**Description:** Raise viewport control row (`bottom-20`) for nav-bar-matching cushion; Kanban column footers keep clearance.

**Acceptance criteria**

- [ ] Toggle / player / schedule at `bottom-20`
- [ ] Kanban Add Task not overlapped
- [ ] Playwright: `@N-0015` / `@B-0010`

---

### N-0016 · Add-time stretch menu {#n-0016-add-time-menu-stretch}

**Description:** Prev control stretches upward (+30…+5, icon-only), bounce open/close, click-outside dismiss.

**Acceptance criteria**

- [ ] +30 top, +5 bottom; no “min” text
- [ ] Same width/color as prev button
- [ ] Click outside closes
- [ ] Playwright: `tracking-add-time-*` testids

---

### N-0017 · Google Calendar on timeline {#n-0017-google-calendar-timeline}

**Description:** Google OAuth (proxy) + cached calendar events merged as read-only blocks on the rolling timeline.

**Acceptance criteria**

- [ ] Connect/disconnect in Settings (web + desktop)
- [ ] Calendar multi-select + sync interval
- [ ] Static events on timeline (`calendar_event` blocks)
- [ ] Playwright: `@N-0017` mocked cache

---

### N-0018 · P2P Yjs task sync {#n-0018-p2p-yjs-sync}

**Description:** Dexie↔Yjs bridge + WebRTC room sync for tasks across trusted devices.

**Acceptance criteria**

- [ ] Sync settings panel on web + desktop
- [ ] Same room ID syncs task CRUD
- [ ] Document conflict model (LWW on maps)

---

### N-0019 · MCP export mode {#n-0019-mcp-dexie-export-mode}

**Description:** `@blocks/mcp-server` reads Desktop export JSON; `export_tasks_to_anytype_markdown` for Anytype MCP workflows.

**Acceptance criteria**

- [ ] `BLOCKS_MCP_MODE=export` documented in `.cursor/mcp.json.example`
- [ ] Plan-day recipe in HERMES doc

---

### N-0020 · Schedule conflict alerts {#n-0020-schedule-conflict-alerts}

| Field          | Value |
| -------------- | ----- |
| **Status**     | 🔄 In progress |
| **Target release** | v26.06.12 |
| **Platforms**  | DT · WB · SH · SB |
| **Related**    | [N-0021](#n-0021-single-focus-task-scheduling) · spec §2 conflict detection |

**Description:** Alert / confirm before committing a schedule that double-books time — especially over **static Google Calendar events**. User can cancel or proceed (calendar overlaps use N-0021 confirm path).

**Platform matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |    SB    |
|--------------------------------|----------|----------|----------|----------|
|  Conflict detection engine     | 🔄 N-0020 | 🔄 N-0020 |    —     | 🔄 N-0020 |
|  Alert / confirm dialog        | 🔄 N-0020 | 🔄 N-0020 | 🔄 N-0020 |    —     |
|  Calendar overlap messaging    | 🔄 N-0020 | 🔄 N-0020 |    —     | 🔄 N-0020 |
```

**Acceptance criteria**

- [x] Detect calendar overlaps before add / drag-drop / schedule-immediately
- [x] Alert names conflicting calendar event (`ScheduleConflictDialog`)
- [x] User can cancel or confirm
- [ ] Playwright: `@N-0020` headed E2E with seeded calendar event

---

### N-0021 · Single-focus task scheduling {#n-0021-single-focus-task-scheduling}

| Field          | Value |
| -------------- | ----- |
| **Status**     | 🔄 In progress |
| **Target release** | v26.06.12 |
| **Platforms**  | DT · WB · SH · SB |
| **Related**    | [B-0015](./INCIDENTS.md#b-0015-schedule-immediately-causes-overlaps) · [N-0020](#n-0020-schedule-conflict-alerts) |

**Description:** **Core principle:** only one task at a time — **no two task blocks may overlap** on the timeline. Enforced in `packages/core` (`SINGLE_FOCUS_TASK_SCHEDULING`). Inserts push downstream tasks later. **Calendar exception:** GCal events may overlap; user confirms via N-0020; UI renders **side-by-side columns** (Google Calendar style) for task + event in the overlap window, full width elsewhere.

**Platform matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |    SB    |
|--------------------------------|----------|----------|----------|----------|
|  No task-task overlap (engine) | 🔄 N-0021 | 🔄 N-0021 |    —     | 🔄 N-0021 |
|  Push-back on insert           | ✅ N-0021 | ✅ N-0021 |    —     | ✅ N-0021 |
|  GCal overlap confirm + split  | 🔄 N-0021 | 🔄 N-0021 | 🔄 N-0021 |    —     |
```

| Code (proposed)      | Feature |
| -------------------- | ------- |
| SB.EN.02.040.080     | Single-focus scheduling engine |
| SB.EN.02.040.090     | Overlap / conflict detection |
| SH.UI.02.031.020     | Side-by-side overlap columns |
| DT.UI.02.036.020     | Calendar + task column split |

**Acceptance criteria**

- [x] Core push-back on `addToTimeline` (B-0015)
- [x] Quick Blocks schedule applies push-back (desktop)
- [x] Calendar overlap confirm + column split UI (task beside event)
- [ ] Drag-reschedule uses conflict dialog (wired via `useTimelineSchedule`)
- [ ] Playwright: `@N-0021` · `@B-0015` E2E headed

**Playwright**

- `tests/integration/timeline-scheduling.spec.ts`

---

### N-0022 · Profile Google sign-in + calendar access {#n-0022-profile-google-sign-in}

| Field          | Value |
| -------------- | ----- |
| **Status**     | ⏸ On hold |
| **Target release** | v26.06.12 |
| **Platforms**  | DT · WB · SH |
| **Related**    | [N-0017](#n-0017-google-calendar-timeline) · spec §7 Profile |

**Description:** Profile page **Linked Accounts** entry for Google sign-in. OAuth requests **calendar.readonly** + email; callback returns to `/profile`. Connected state shows identity + calendar access status. Reuses `useGoogleCalendarAuth` / Settings sync path.

**Platform matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |    SB    |    CX    |
|--------------------------------|----------|----------|----------|----------|----------|
|  Profile Google connect        | 🔄 N-0022 | 🔄 N-0022 | 🔄 N-0022 |    —     |    —     |
|  Calendar scope consent copy   | 🔄 N-0022 | 🔄 N-0022 | 🔄 N-0022 | 📋 N-0017 | 📋 N-0017 |
|  Identity display (email)      | 🔄 N-0022 | 🔄 N-0022 | 🔄 N-0022 |    —     |    —     |
|  OAuth callback on profile     | 🔄 N-0022 | 🔄 N-0022 |    —     |    —     | 📋 N-0017 |
```

**Proposed registry codes (on ship)**

| Code             | Feature |
| ---------------- | ------- |
| DT.UI.07.040.010 | Profile Google account connect |
| WB.UI.07.040.010 | Profile Google account connect (web) |
| SH.UI.07.040.010 | ProfileGoogleAccount component |
| DT.BG.07.040.010 | Desktop profile OAuth (Electron IPC) |

**Acceptance criteria**

- [x] Profile Linked Accounts → Google starts OAuth (calendar.readonly + email)
- [x] Consent copy mentions calendar read access
- [x] Web OAuth callback on `/profile`
- [x] Desktop connect via Electron IPC on profile
- [x] Connected state shows email + disconnect
- [x] Guest identity when disconnected
- [ ] Playwright: `@N-0022` headed QA

**Playwright**

- `tests/e2e/profile-google-auth.spec.ts`

---

### N-0023 · Retail Google OAuth (hosted proxy) {#n-0023-retail-google-oauth}

| Field          | Value |
| -------------- | ----- |
| **Status**     | ⏸ On hold |
| **Target release** | v26.06.12 |
| **Platforms**  | DT · WB · CX |
| **Related**    | [N-0017](#n-0017-google-calendar-timeline) · [N-0022](#n-0022-profile-google-sign-in) · [B-0017](../INCIDENTS.md#b-0017-desktop-google-connect-shows-localhost) |

**Description:** Outlook-simple Google sign-in for retail users — no local proxy, no localhost. Hosted OAuth proxy at `https://auth.blocks.app`, production env in web/desktop builds, `blocks://` desktop callback, Google verification checklist.

**Platform matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |    SB    |    CX    |
|--------------------------------|----------|----------|----------|----------|----------|
|  Hosted OAuth proxy            | 📋 N-0023 | 📋 N-0023 |    —     | 📋 N-0023 | 🔄 N-0023 |
|  Production proxy URL in builds| 📋 N-0023 | 📋 N-0023 |    —     |    —     | 📋 N-0023 |
|  blocks:// desktop callback    | 🔄 N-0023 |    —     |    —     | 🔄 N-0023 |    —     |
|  Google app verification       | 📋 N-0023 | 📋 N-0023 |    —     |    —     | 📋 N-0023 |
|  Dev localhost fallback        | ✅ N-0023 | ✅ N-0023 |    —     |    —     | ✅ N-0023 |
```

**Acceptance criteria**

- [x] Rollout doc: `Docs/Integrations/GOOGLE_OAUTH_ROLLOUT.md`
- [x] `@blocks/core` dev vs production proxy URL resolution
- [x] Vercel deploy config for `apps/oauth-proxy`
- [x] Desktop `blocks://auth/callback` for packaged builds
- [x] Env examples (web, desktop, proxy)
- [ ] Deploy proxy to production URL
- [ ] Google Console: production redirect + consent verification
- [ ] CI: production `*_OAUTH_PROXY_URL` in release builds
- [ ] Headed QA: full connect on web + packaged desktop against hosted proxy

**Playwright**

- `tests/integration/oauth-proxy-health.spec.ts` · `@B-0017`

**Docs**

- [GOOGLE_OAUTH_ROLLOUT.md](../../Integrations/GOOGLE_OAUTH_ROLLOUT.md)

---

### N-0024 · Pause snap during drag-reschedule {#n-0024-pause-snap-during-drag}

| Field          | Value |
| -------------- | ----- |
| **Status**     | 🔄 In progress |
| **Target release** | v26.06.12 |
| **Platforms**  | DT · WB · SH |
| **Related**    | [N-0007](#n-0007-live-scroll-lock--snap-delay) · [N-0006](#n-0006-timeline-entry-snap-to-now) |

**Description:** While actively dragging a task card to reschedule, pause live now-follow and snap-back scroll so the viewport does not fight the drag.

**Platform matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |    SB    |
|--------------------------------|----------|----------|----------|----------|
|  Pause snap during drag        | 🔄 N-0024 | 🔄 N-0024 | 🔄 N-0024 |    —     |
|  Resume snap after drag        | 🔄 N-0024 | 🔄 N-0024 | 🔄 N-0024 |    —     |
```

| Code             | Feature |
| ---------------- | ------- |
| DT.UI.02.040.070 | Pause snap during drag |
| WB.UI.02.040.070 | Pause snap during drag (web) |
| SH.EN.02.040.080 | `useTimelineNowFollow` drag pause |

**Acceptance criteria**

- [x] Drag start → pause follow/snap until drag end/cancel
- [x] Drag end → snap-delay follow resumes (`resumeFollowAfterDrag`)
- [ ] Playwright: `@N-0024` (headed desktop QA)

---

### N-0025 · Schedule Doing — lock current task {#n-0025-schedule-doing-lock-current}

| Field          | Value |
| -------------- | ----- |
| **Status**     | 🔄 In progress |
| **Target release** | v26.06.12 |
| **Platforms**  | DT · WB · SH · SB |
| **Related**    | DT.UI.02.035.010 · [N-0021](#n-0021-single-focus-task-scheduling) |

**Description:** **Schedule Task** schedules all **Doing** tasks except the **current task** when **Lock Current Task** is selected (default). Settings dropdown **Task Schedule Behavior**: **Lock Current Task** | **Reschedule All Tasks**.

**Current task definition (clarified):** Task under the **now-bar** with the **active timer running** (not merely `currentTask` in store). Dynamic/left-column tasks take priority; when the active task completes, focus may shift to a static/right-column event.

**Platform matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |    SB    |
|--------------------------------|----------|----------|----------|----------|
|  Lock current on Schedule Task | 🔄 N-0025 | 🔄 N-0025 | 🔄 N-0025 | 🔄 N-0025 |
|  Task Schedule Behavior setting| 🔄 N-0025 | 🔄 N-0025 | 🔄 N-0025 |    —     |
```

| Code             | Feature |
| ---------------- | ------- |
| DT.UI.02.035.020 | Lock current on Schedule Task |
| DT.UI.06.002.070 | Task Schedule Behavior setting |
| SB.EN.02.035.010 | `scheduleDoingTasks` lock engine |

**Acceptance criteria**

- [x] Default **Lock Current Task**: skip now-bar + running-timer task; pack others after locked block ends
- [x] **Reschedule All Tasks**: all Doing from now (legacy)
- [x] Setting persisted in Dexie settings
- [x] Events excluded from Schedule Doing (`isEvent` anchors)
- [x] Playwright: `@N-0025` (`tests/integration/schedule-doing.spec.ts`)

---

### N-0026 · User events (Task property + create) {#n-0026-user-events-on-tasks}

| Field          | Value |
| -------------- | ----- |
| **Status**     | 🔄 In progress |
| **Target release** | v26.06.12 |
| **Platforms**  | DT · WB · SH · SB |
| **Related**    | [N-0021](#n-0021-single-focus-task-scheduling) · [N-0027](#n-0027-continuous-scroll-calendar) |

**Description:** **Events** are a property on **Task** (`isEvent`), not a separate entity. Create/edit toggle **Event** on the new-task page. Default **All Day** until due date and/or start/end times are set. Events render as static timeline blocks with **side columns** on overlap (Google Calendar style). Support multi-day span, all-day (24h, pinned top until midnight), and timed start/end.

**Visual (v26.06.12b2 design):** GCal-style — muted fill, bold title, side columns on overlap. **All-day** events pin to a **sticky strip** at top of timeline until midnight. **Timed events:** draggable for **resize/move** (stretch end time) on timeline; edit full details on task page. **Schedule Doing:** events are **immovable anchors**; lock-current still applies to active timer task.

**Platform matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |    SB    |
|--------------------------------|----------|----------|----------|----------|
|  Event toggle on create/edit   | 🔄 N-0026 | 🔄 N-0026 | 🔄 N-0026 | 🔄 N-0026 |
|  All Day + timed + multi-day   | 🔄 N-0026 | 🔄 N-0026 | 🔄 N-0026 | 🔄 N-0026 |
|  Timeline column overlap       | 🔄 N-0026 | 🔄 N-0026 | 🔄 N-0026 | 🔄 N-0026 |
```

| Code             | Feature |
| ---------------- | ------- |
| DT.UI.04.020.010 | Event toggle on create |
| DT.UI.04.020.020 | All Day + time pickers |
| DT.UI.04.020.030 | Multi-day event span |
| DT.UI.02.037.010 | User events on timeline |
| SB.EN.02.037.010 | Task `isEvent` model + overlap |

**Acceptance criteria**

- [x] `Task.isEvent` + `eventAllDay` + `eventStartAt` / `eventEndAt` in schema
- [x] Add-task **Event** toggle; default All Day until date/times set (web)
- [x] Timeline: events use overlap columns; GCal-style muted blocks; timed drag-reschedule
- [x] All-day sticky strip per day header
- [x] Playwright: `@N-0026` (`tests/integration/user-event-blocks.spec.ts`)

---

### N-0027 · Continuous scroll calendar (replaces N-0005) {#n-0027-continuous-scroll-calendar}

| Field          | Value |
| -------------- | ----- |
| **Status**     | 🔄 In progress |
| **Target release** | v26.06.12 |
| **Platforms**  | DT · WB · SH |
| **Related**    | [N-0005](#n-0005-due-date-calendar-view) (**replaced**) · N-0014 week now-bar pattern |

**Description:** **Replaces N-0005** month calendar — reuse N-0005 registry codes where applicable. One long **vertical scroll** calendar. **Week now-bar** with lookback settings **−1 / −2 / −3 weeks** (Settings → **Calendar View**).

**b3 update ([N-0030](#n-0030-calendar-sticky-day-strip)):** Per-week dual-month sticky headers (`DT.UI.02.050.030`) **superseded** by N-0030 global weekday strip. Month labels move to 1st-of-month day cells only.

**Navigation (v26.06.12b2 design):** **No new bottom-nav icon.** Stay on the **Timeline** nav item; upgrade the existing **bottom-left toggle** (N-0005 placement, opposite Schedule FAB) to switch **Day view ↔ continuous scroll calendar**. Preserves 3 center nav icons + 48px action buttons for mobile tap targets.

**Events in calendar:** `isEvent` tasks appear in **both** timeline (sticky all-day strip + timed columns) and scroll calendar.

**Platform matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |    SB    |
|--------------------------------|----------|----------|----------|----------|
|  Continuous scroll calendar    | 🔄 N-0027 | 🔄 N-0027 | 🔄 N-0027 |    —     |
|  Dual-month sticky header      | ↪ N-0030 | ↪ N-0030 | ↪ N-0030 |    —     |
|  Week now-bar + lookback       | 🔄 N-0027 | 🔄 N-0027 | 🔄 N-0027 |    —     |
|  Calendar View settings        | 🔄 N-0027 | 🔄 N-0027 | 🔄 N-0027 |    —     |
```

| Code             | Feature |
| ---------------- | ------- |
| DT.UI.02.050.020 | Continuous scroll calendar (was N-0005) |
| DT.UI.02.050.030 | Dual-month sticky header |
| DT.UI.06.009.010 | Calendar View settings section |
| DT.UI.06.009.020 | Week lookback (−1/−2/−3) |
| SH.EN.02.050.010 | Calendar scroll + header sync |

**Acceptance criteria**

- [x] N-0005 month pager replaced; continuous scroll via bottom-left toggle
- [x] Dual-month header on split weeks
- [x] Week now-bar + lookback (−1/−2/−3) in Settings
- [x] Events + due tasks on calendar days
- [x] Playwright: `@N-0027` (`tests/integration/continuous-calendar.spec.ts`)

---

### N-0028 · Bulk timeline reschedule {#n-0028-bulk-timeline-reschedule}

| Field          | Value |
| -------------- | ----- |
| **Status**     | 📋 Proposed |
| **Target release** | v26.06.12 |
| **Platforms**  | DT · WB · SH · SB |

**Description:** Bulk select on timeline via click-and-hold or **drag-select from hour-marker gutter**. When **≥2** tasks selected, drag moves the group together preserving relative offsets.

**Platform matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |    SB    |
|--------------------------------|----------|----------|----------|----------|
|  Gutter / hold bulk select     | 📋 N-0028 | 📋 N-0028 | 📋 N-0028 |    —     |
|  Group drag reschedule         | 📋 N-0028 | 📋 N-0028 | 📋 N-0028 | 📋 N-0028 |
```

| Code             | Feature |
| ---------------- | ------- |
| DT.UI.02.020.020 | Bulk select (gutter + hold) |
| DT.UI.02.020.030 | Group drag reschedule |
| SB.EN.02.020.010 | Bulk schedule commit engine |

**Acceptance criteria**

- [ ] Gutter drag-select + hold-to-add selection
- [ ] Group drag with relative offset preserved
- [ ] Playwright: `@N-0028`

---

### N-0029 · Passive overlap columns on bulk move {#n-0029-passive-overlap-on-bulk-move}

| Field          | Value |
| -------------- | ----- |
| **Status**     | 📋 Proposed |
| **Target release** | v26.06.12 |
| **Platforms**  | DT · WB · SH · SB |
| **Related**    | [N-0028](#n-0028-bulk-timeline-reschedule) · [N-0021](#n-0021-single-focus-task-scheduling) |

**Description:** Tasks **not** in the bulk selection that overlap the moving group shift to **right-side columns** (static-event style) instead of push-back jump. Depends on N-0028 + overlap layout.

**Platform matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |    SB    |
|--------------------------------|----------|----------|----------|----------|
|  Passive column on bulk overlap| 📋 N-0029 | 📋 N-0029 | 📋 N-0029 | 📋 N-0029 |
|  No jump for unselected tasks  | 📋 N-0029 | 📋 N-0029 | 📋 N-0029 | 📋 N-0029 |
```

| Code             | Feature |
| ---------------- | ------- |
| DT.UI.02.020.040 | Passive overlap during bulk drag |
| SH.UI.02.040.040 | Overlap preview for unselected |
| SB.EN.02.040.090 | Passive overlap commit rules |

**Acceptance criteria**

- [ ] Unselected overlapping tasks render in side column during bulk drag
- [ ] On commit: no cascade jump for unselected tasks
- [ ] Playwright: `@N-0029`

---

### N-0030 · Calendar sticky day strip (global) {#n-0030-calendar-sticky-day-strip}

| Field          | Value |
| -------------- | ----- |
| **Status**     | 📋 Proposed → 🔄 b3 |
| **Target release** | v26.06.12 |
| **Platforms**  | DT · WB · SH |
| **Related**    | [N-0027](#n-0027-continuous-scroll-calendar) · [N-0001](#n-0001-timeline-week-strip) |

**Description:** **One global sticky strip** at the top of continuous calendar view. Strip shows **weekday labels only** (Mon–Sun per [N-0002](./ROADMAP.md#n-0002-week-start-preference) week-start order) — **not** per-week section headers. As the user scrolls, the strip scroll-syncs to the week in view (7 weekday columns). **Remove** N-0027 per-week dual-month sticky headers. Each **day cell** in the scroll body keeps its **date number in the top-left corner**; when a cell is the **1st of a month**, show the **month name** on that cell (e.g. “Jul 1”).

**PM design (b3):** Global weekday strip only; no per-week headers; date stays in each day block corner; month label on 1st-of-month cells.

**Supersedes:** N-0027 per-week `calendar-week-header` / dual-month row (replaced by N-0030 global strip).

**Platform matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |
|--------------------------------|----------|----------|----------|
|  Global sticky weekday strip   | 📋 N-0030 | 📋 N-0030 | 📋 N-0030 |
|  Date in day cell top-left     | 📋 N-0030 | 📋 N-0030 | 📋 N-0030 |
|  Month label on 1st-of-month   | 📋 N-0030 | 📋 N-0030 | 📋 N-0030 |
|  No per-week section headers   | 📋 N-0030 | 📋 N-0030 | 📋 N-0030 |
|  Scroll-sync strip to week     | 📋 N-0030 | 📋 N-0030 | 📋 N-0030 |
```

| Code             | Feature |
| ---------------- | ------- |
| DT.UI.02.050.040 | Global sticky weekday strip |
| SH.EN.02.050.020 | Calendar scroll → strip sync |

**Acceptance criteria**

- [ ] Sticky strip fixed at top; shows **weekday names only** (7 columns)
- [ ] **No** per-week dual-month headers in scroll body
- [ ] Each day cell shows date in **top-left** corner
- [ ] 1st-of-month cells show month label on the cell
- [ ] Strip updates to week in viewport as user scrolls
- [ ] Playwright: `@N-0030`

---

### N-0031 · Timeline nav exits calendar view {#n-0031-timeline-nav-exits-calendar}

| Field          | Value |
| -------------- | ----- |
| **Status**     | 📋 Proposed → 🔄 b3 |
| **Target release** | v26.06.12 |
| **Platforms**  | DT · WB · SH |
| **Related**    | [N-0027](#n-0027-continuous-scroll-calendar) · [N-0005](#n-0005-due-date-calendar-view) |

**Description:** Two ways to return to **timeline day view**: (1) bottom-left calendar/timeline toggle; (2) re-tap **Timeline** in bottom nav. Nav press must **force `viewMode = timeline`** and **reset calendar scroll session** (clear stored scroll position / re-center on current week when re-entering calendar later).

**PM design (b3 Round 2):** Nav always exits calendar; toggle still toggles; clearing calendar scroll on nav exit.

**Platform matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |
|--------------------------------|----------|----------|----------|
|  Timeline nav → day view       | 📋 N-0031 | 📋 N-0031 | 📋 N-0031 |
|  Clear calendar scroll on exit | 📋 N-0031 | 📋 N-0031 | 📋 N-0031 |
```

| Code             | Feature |
| ---------------- | ------- |
| DT.UI.02.050.050 | Timeline nav exits calendar |
| SH.EN.02.050.030 | Calendar scroll session reset |

**Acceptance criteria**

- [ ] In calendar mode, tap Timeline nav → rolling timeline visible
- [ ] Bottom-left toggle still switches views both ways
- [ ] Re-open calendar scrolls to current week (not stale position)
- [ ] Playwright: `@N-0031`

---

### N-0045 · Quick Blocks as reusable task templates {#n-0045-quick-blocks-as-reusable-tasks}

| Field          | Value |
| -------------- | ----- |
| **Status**     | 🧪 QA · v26.06.30b1 |
| **Target release** | v26.06.30 |
| **Platforms**  | DT · WB · SB |
| **Related**    | [N-0011](#n-0011-schedule-immediately-quick-blocks) (superseded) · [N-0021](#n-0021-single-focus-task-scheduling) |

**Description:** A Quick Block manages exactly **one permanent, reusable Task** (a template). **First use** (`configured === false`) opens the task editor prefilled from block basics (name, duration→blocks, color, category); on save the block is linked to that Task (`linkedTaskId`, `configured = true`) and the flow proceeds to the **placement picker** (Now · After current task · Next free slot · End of day · Custom). **Subsequent uses** skip straight to the placement picker and reschedule the same Task (single-focus push-back via N-0021). **Long-press / right-click** (or the editor’s edit button) opens the linked Task for edits. Blocks are created and treated like any other Task object.

**Schema:**
- `QuickAddBlock.linkedTaskId?: uuid` · `QuickAddBlock.configured: boolean`
- Dexie `version(5)` — `quickAddBlocks` index adds `linkedTaskId`; existing blocks upgraded to `configured = false`.

**Store:** `useQuickBlocksStore` — `getLinkedTask`, `linkBlockToTask`, `scheduleBlock` (push-back aware). `addTaskFromBlock` deprecated (kept for compatibility).

**Shared UI:** `PlacementPickerModal` extracted to `@blocks/ui` (generic: `title` + `durationMinutes` + `onSchedule(date)`); "Now" option supersedes N-0011.

**Platform matrix**

```text
|            Feature                 |    DT    |    WB    |    SB    |
|------------------------------------|----------|----------|----------|
|  Block ↔ single permanent task     | 🧪 N-0045 | 🧪 N-0045 | 🧪 N-0045 |
|  First-use editor prefill          | 🧪 N-0045 | 🧪 N-0045 |    —     |
|  Reuse → placement picker only     | 🧪 N-0045 | 🧪 N-0045 |    —     |
|  Long-press / edit linked task     | 🧪 N-0045 | 🧪 N-0045 |    —     |
```

**Acceptance criteria**

- [ ] First tap of an unconfigured block opens the prefilled task editor
- [ ] Saving links the task and opens the placement picker
- [ ] Second tap opens the placement picker directly (no editor)
- [ ] Long-press / right-click opens the linked task for editing
- [ ] Scheduling honors single-focus push-back (N-0021)
- [ ] Playwright: `@N-0045`

---

### N-0046 · Event section below Task Name {#n-0046-event-section-below-task-name}

| Field          | Value |
| -------------- | ----- |
| **Status**     | 🧪 QA · v26.06.30b1 |
| **Target release** | v26.06.30 |
| **Platforms**  | DT · WB |
| **Related**    | [N-0026](#n-0026-user-events-on-tasks) |

**Description:** The **"Is event" toggle** and its whole section (all-day / start time / end time) move to the **top of the new/edit task interface, directly below the Task Name field** — web add-task, web edit-task, and desktop TaskEditPage all match.

**Platform matrix**

```text
|            Feature                 |    DT    |    WB    |
|------------------------------------|----------|----------|
|  Event section under Task Name      | 🧪 N-0046 | 🧪 N-0046 |
```

**Acceptance criteria**

- [ ] Event toggle + time fields render immediately below Task Name on all three forms
- [ ] Toggling event still hides duration/blocks (B-0019)
- [ ] Playwright: `@N-0046`

---

### N-0047 · Events right column on timeline conflict {#n-0047-events-right-column-on-conflict}

| Field          | Value |
| -------------- | ----- |
| **Status**     | 🧪 QA · v26.06.30b1 |
| **Target release** | v26.06.30 |
| **Platforms**  | DT · WB · SB |
| **Related**    | [N-0021](#n-0021-single-focus-task-scheduling) · N-0020 · N-0026 |

**Description:** In `computeTimelineOverlapLayout`, both **user events** (`task.isEvent === true`) and **Google Calendar events** bias to the **right-hand column(s)** whenever they overlap another block; regular tasks keep the left lanes. Implemented via a `ColumnRank` (0 = task, 1 = event/calendar) sorted before greedy lane packing. Non-overlapping events remain full width.

**Platform matrix**

```text
|            Feature                 |    DT    |    WB    |    SB    |
|------------------------------------|----------|----------|----------|
|  Events/calendar → right on conflict| 🧪 N-0047 | 🧪 N-0047 | 🧪 N-0047 |
```

**Acceptance criteria**

- [ ] Event overlapping a task renders in the right column (even if it starts earlier)
- [ ] Non-overlapping event stays full width
- [ ] Calendar events continue right-column behavior (N-0021 exception path intact)
- [ ] Integration test: `@N-0047`

---

### N-0048 · Kanban sort + manual drag order {#n-0048-kanban-sort--manual-order}

| Field          | Value |
| -------------- | ----- |
| **Status**     | 🧪 QA · v26.06.30b1 |
| **Target release** | v26.06.30 |
| **Platforms**  | DT · WB · SB |
| **Related**    | [N-0049](#n-0049-kanban-filter--saved-views) · Anytype (reference) |

**Description:** Board-wide **sort** by priority, access context, due date ("time"), tag, category, created, or name — **ascending/descending**, default **priority ascending** (P1 top → P5 bottom). Multi-value fields (tags, access contexts) sort by their **first value alphabetically**; nulls/empties last; stable tie-breakers. **Manual drag-and-drop** vertical reorder per column persists to `Task.kanbanOrder` (1..n) and overrides the active sort for that column. A per-column **Refresh sort** button clears manual order (`kanbanOrder = 0`) so the active sort reapplies. Sort preference lives in the active Kanban view (settings).

**Schema:** `Task.kanbanOrder: number` (default 0; indexed in Dexie `version(5)`). Engine defaults new tasks to 0.

**Core:** `sortKanbanTasks`, `buildKanbanBoard` in `@blocks/core/kanban`. **Store:** `useTaskStore.reorderKanbanColumn`, `clearKanbanOrder`.

**Platform matrix**

```text
|            Feature                 |    DT    |    WB    |    SB    |
|------------------------------------|----------|----------|----------|
|  Board-wide sort (field + dir)     | 🧪 N-0048 | 🧪 N-0048 | 🧪 N-0048 |
|  Manual drag order (kanbanOrder)   | 🧪 N-0048 | 🧪 N-0048 |    —     |
|  Per-column refresh sort           | 🧪 N-0048 | 🧪 N-0048 |    —     |
```

**Acceptance criteria**

- [ ] Default sort = priority ascending (P1 top)
- [ ] Sort field + direction switch reorders every column
- [ ] Multi-value fields sort by first value; empties last
- [ ] Manual drag within a column persists and survives reload
- [ ] Refresh sort clears manual order for that column
- [ ] Playwright: `@N-0048`

---

### N-0049 · Kanban filter + saved views {#n-0049-kanban-filter--saved-views}

| Field          | Value |
| -------------- | ----- |
| **Status**     | 🧪 QA · v26.06.30b1 |
| **Target release** | v26.06.30 |
| **Platforms**  | DT · WB · SB |
| **Related**    | [N-0048](#n-0048-kanban-sort--manual-order) · Anytype (reference) |

**Description:** Object-oriented **filter** over Task properties: priority, tags, category, access context, due-date range, **kind** (event vs task), **scheduled** vs unscheduled, and **has subtasks**. Clauses combine with **AND** semantics. Filter + sort bundle into named **saved views** (Anytype-style) with a built-in **Default** view; views persist in Dexie (`kanbanViews`) and sync across devices. Active view id persists in `sessionStorage`.

**Schema:** `KanbanFilterSchema`, `KanbanSortSchema`, `KanbanViewSchema`; Dexie `version(5)` adds `kanbanViews` table.

**Core:** `taskMatchesKanbanFilter`, `filterKanbanTasks`, `isKanbanFilterActive`, `buildKanbanBoard`. **Store/UI:** `useKanbanViewStore` + shared `KanbanToolbar` (view selector, sort controls, refresh, filter panel).

**Platform matrix**

```text
|            Feature                 |    DT    |    WB    |    SB    |
|------------------------------------|----------|----------|----------|
|  Property filters (AND)            | 🧪 N-0049 | 🧪 N-0049 | 🧪 N-0049 |
|  Named saved views + Default       | 🧪 N-0049 | 🧪 N-0049 | 🧪 N-0049 |
|  Views persist + sync (Dexie)      | 🧪 N-0049 | 🧪 N-0049 | 🧪 N-0049 |
```

**Acceptance criteria**

- [ ] Each property filter narrows the board (AND across clauses)
- [ ] Saving a view stores current filter + sort by name
- [ ] Switching views reapplies its filter + sort
- [ ] Default view always present and non-deletable
- [ ] Views survive reload (Dexie)
- [ ] Playwright: `@N-0049`

---

## New feature template

Use `/NF` skill. Include **Platform matrix** + proposed codes before implementation.

On ship: FEATURE_REGISTRY rows ✅ · move to Shipped · CHANGELOG **Added**.

---

## Version History

| Release | Date | Changes |
|---------|------|---------|
| v26.06.12 | 2026-06-12 | Release bump; **v26.06.12b2** — events & calendar (N-0024–N-0027) |
| v26.06.09 | 2026-06-09 | **Sprint 5** opened; **v26.06.09b1** CI Ops v3 + date/batch versioning |
| v26.06.09 | 2026-06-09 | Themes, CI Ops, installer fixes (was 0.0.4) |
| v26.06.09 | 2026-06-09 | Sprint 3: PoweredUpLabs, timeline rules, routines, MCP (was 0.0.3) |
| v24.12.27 | 2024-12-27 | Bug fixes: Top bar, Nav overlap, Timeline blocks |
| v24.12.27 | 2024-12-27 | Phase 2 features (was 0.0.2) |
| v24.12.26 | 2024-12-26 | Project initialization (was 0.0.1) |

---

*This document is the source of truth for Blocks development. New features use `/NF` and N-#### IDs until shipped; update page specs here when behavior changes.*
