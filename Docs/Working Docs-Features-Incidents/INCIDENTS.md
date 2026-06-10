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
| [B-0004](#b-0004-week-strip-animation-after-calendar-toggle) | Week strip animation after calendar toggle |    P2    | Fixed  | 0.0.5  | 0.0.5 |
| [B-0005](#b-0005-timeline-remove-button-covered-by-timer) | Remove button covered by timer button  |    P2    | Fixed  | 0.0.5  | 0.0.5 |
| [B-0006](#b-0006-timeline-scroll-blocked-by-live-follow) | Timeline scroll blocked by live follow |    P1    | In Progress | 0.0.5 | — |
| [B-0007](#b-0007-floating-timer-blocks-timeline-view) | Floating timer blocks timeline view    |    P2    | In Progress | 0.0.5 | — |
| [B-0008](#b-0008-schedule-button-off-viewport-empty-timeline) | Schedule button off-viewport on empty timeline |    P2    | In Progress | 0.0.5 | — |
| [B-0009](#b-0009-timeline-task-names-not-visible) | Timeline task names not visible on cards |    P2    | In Progress | 0.0.5 | — |
| [B-0010](#b-0010-tracking-control-strip-ui) | Tracking control strip UI mismatch |    P2    | In Progress | 0.0.5 | — |
| [B-0011](#b-0011-timeline-card-typography) | Timeline card typography too small |    P3    | In Progress | 0.0.5 | — |
| [B-0012](#b-0012-remove-button-covers-task-name) | Remove button covers task name |    P2    | In Progress | 0.0.5 | — |
| [B-0013](#b-0013-add-time-stretch-button-invisible) | Add-time stretch button invisible |    P2    | In Progress | 0.0.5 | — |

---

## Open incidents

### B-0006 · Timeline scroll blocked by live follow {#b-0006-timeline-scroll-blocked-by-live-follow}

| Field    | Value |
| -------- | ----- |
| **Status** | In Progress |
| **Severity** | P1 |
| **Opened** | 0.0.5 |
| **Related** | [N-0006](./ROADMAP.md#n-0006-timeline-entry-snap-to-now) · [N-0007](./ROADMAP.md#n-0007-live-scroll-lock--snap-delay) |
| **Playwright** | `tests/e2e/timeline-manual-scroll.spec.ts` · `@B-0006` |

**Symptoms:** Timeline cannot be scrolled manually; view snaps back every second.

**Repro**

1. Open Timeline (web or desktop)
2. Wheel or drag to scroll away from current time
3. Scroll position immediately resets

**Expected:** User can scroll freely; optional snap-back only after configured delay (N-0007).

**Actual:** Per-second `scrollToNow` in live-follow tick fought user scroll.

**Affects matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |
|--------------------------------|----------|----------|----------|
|   Rolling timeline scroll      | 🐛 B-0006 | 🐛 B-0006 | 🐛 B-0006 |
|  Live scroll lock (N-0007)     | 🐛 B-0006 | 🐛 B-0006 | 🐛 B-0006 |
```

| Code                 | Feature                         | Break # |
| -------------------- | ------------------------------- | :-----: |
| DT.UI.02.040.010-001 | Rolling timeline vertical scroll |    1    |
| WB.UI.02.040.010-001 | Rolling timeline vertical scroll |    1    |
| SH.EN.02.040.060-001 | Timeline now-follow hook        |    1    |
| DT.UI.02.040.060-001 | Live scroll lock                |    1    |
| WB.UI.02.040.060-001 | Live scroll lock                |    1    |

**Fix:** Clock tick updates now-line only; timeline uses bounded scroll port (`h-full`/`min-h-0`); desktop defines `--top-bar-height` / `--bottom-nav-height`.

---

### B-0007 · Floating timer blocks timeline view {#b-0007-floating-timer-blocks-timeline-view}

| Field    | Value |
| -------- | ----- |
| **Status** | In Progress |
| **Severity** | P2 |
| **Opened** | 0.0.5 |
| **Related** | [N-0008](./ROADMAP.md#n-0008-timeline-auto-tracking--pause-sync) · [B-0005](#b-0005-timeline-remove-button-covered-by-timer) |
| **Playwright** | `tests/e2e/timeline-card-actions.spec.ts` · `@B-0007` (footer layout) |

**Symptoms:** Floating `ActiveTimer` panel overlaps timeline content and bottom-left view toggle on desktop.

**Repro**

1. Start tracking a task on Timeline (desktop)
2. Floating timer appears bottom-left over timeline

**Expected:** Elapsed time and play/pause on the **bottom of the active task card**; no floating overlay on Timeline.

**Actual:** Fixed `ActiveTimer` at `bottom-20 left-4` obstructs view.

**Affects matrix**

```text
|            Feature             |    DT    |    SH    |
|--------------------------------|----------|----------|
|   Active task / timer display  | 🐛 B-0007 | 🐛 B-0007 |
|   Timeline card action row     | 🐛 B-0007 | 🐛 B-0007 |
```

| Code                 | Feature                    | Break # |
| -------------------- | -------------------------- | :-----: |
| DT.UI.02.034.010-002 | Active task / timer display |    2    |
| DT.UI.02.031.010-002 | Timeline card footer layout |    2    |
| SH.UI.02.031.010-002 | TimelineBlock footer slot  |    2    |

**Fix:** Remove floating `ActiveTimer`; inline elapsed + play/pause on timeline card footer only.

---

### B-0008 · Schedule button off-viewport on empty timeline {#b-0008-schedule-button-off-viewport-empty-timeline}

| Field    | Value |
| -------- | ----- |
| **Status** | In Progress |
| **Severity** | P2 |
| **Opened** | 0.0.5 |
| **Related** | Schedule doing tasks · rolling timeline entry snap |
| **Playwright** | `tests/e2e/timeline-schedule-fab.spec.ts` · `@B-0008` |

**Symptoms:** With no scheduled tasks, Schedule button appears at top of scroll content (~−7 days), not in the visible viewport.

**Repro**

1. Move tasks to Doing, leave timeline unscheduled
2. Open Timeline (entry snap scrolls to today)
3. Scroll up — Schedule control sits with empty-state overlay far above current day

**Expected:** Schedule FAB pinned bottom-right of timeline viewport; no “No tasks scheduled” empty state.

**Actual:** Empty-state `absolute inset-0` centered in full scroll height; schedule button only when tasks exist used `fixed` inconsistently.

**Affects matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |
|--------------------------------|----------|----------|----------|
|   Schedule doing tasks (FAB)   | 🐛 B-0008 | 🐛 B-0008 | 🐛 B-0008 |
|   Rolling timeline empty state | 🐛 B-0008 | 🐛 B-0008 |    —     |
```

| Code                 | Feature                    | Break # |
| -------------------- | -------------------------- | :-----: |
| DT.UI.02.040.020-001 | Schedule doing tasks FAB   |    1    |
| WB.UI.02.040.020-001 | Schedule doing tasks FAB   |    1    |
| SH.UI.02.040.020-001 | TimelineScheduleFab        |    1    |

**Fix:** `TimelineScheduleFab` outside scroll port; remove empty-state overlay.

---

### B-0009 · Timeline task names not visible on cards {#b-0009-timeline-task-names-not-visible}

| Field    | Value |
| -------- | ----- |
| **Status** | In Progress |
| **Severity** | P2 |
| **Opened** | 0.0.5 |
| **Related** | [N-0010](./ROADMAP.md#n-0010-app-tracking-chrome) (regression) |
| **Playwright** | `tests/e2e/timeline-task-name.spec.ts` · `@B-0009` |

**Symptoms:** Scheduled timeline cards no longer show the task name after N-0010 card-header clock work.

**Repro**

1. Schedule a doing task on Timeline (web or desktop)
2. Observe the timeline card body

**Expected:** Task name visible and truncated at top of each task card.

**Actual:** Name omitted or clipped when tracking header / pause-split layout applied.

**Affects matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |
|--------------------------------|----------|----------|----------|
|   Timeline card task title     | 🐛 B-0009 | 🐛 B-0009 | 🐛 B-0009 |
```

| Code                 | Feature                    | Break # |
| -------------------- | -------------------------- | :-----: |
| DT.UI.02.031.020-001 | Timeline card task title   |    1    |
| WB.UI.02.031.020-001 | Timeline card task title   |    1    |
| SH.UI.02.031.020-001 | TimelineBlock task content |    1    |

**Fix:** `TaskBlockContent` always renders `data-testid="timeline-task-name"` outside pause-split flex ratios.

---

### B-0010 · Tracking control strip UI mismatch {#b-0010-tracking-control-strip-ui}

| Field    | Value |
| -------- | ----- |
| **Status** | In Progress |
| **Severity** | P2 |
| **Opened** | 0.0.5 |
| **Related** | [N-0010](./ROADMAP.md#n-0010-app-tracking-chrome) |
| **Playwright** | `tests/e2e/timeline-bottom-actions.spec.ts` · `@B-0010` (shared buttons); desktop `tracking-pause-resume` testid |

**Symptoms:** Pause/Resume sits in an opaque full-width strip with task name text; not centered; does not match Calendar/Timeline toggle or Schedule FAB styling.

**Repro**

1. Start tracking a task on Timeline (desktop)
2. Observe bottom controls above nav

**Expected:** Centered icon-only rounded-square accent-magenta button (48×48); no strip or extra text; matches toggle (bottom-left) and schedule (bottom-right).

**Actual:** Opaque `bottom-16` bar with task name + circular green/cyan pause button.

**Affects matrix**

```text
|            Feature             |    DT    |    SH    |
|--------------------------------|----------|----------|
|  Tracking pause/resume control | 🐛 B-0010 | 🐛 B-0010 |
|  Timeline bottom action row    | 🐛 B-0010 | 🐛 B-0010 |
```

| Code                 | Feature                         | Break # |
| -------------------- | ------------------------------- | :-----: |
| DT.UI.00.020.010-001 | Tracking pause/resume button    |    1    |
| SH.UI.02.040.030-001 | Timeline bottom action styling  |    1    |

**Fix:** `TIMELINE_BOTTOM_ACTION_*` shared styles; `TrackingControlBar` → fixed centered icon button; schedule + view toggle use same accent square.

---

### B-0011 · Timeline card typography too small {#b-0011-timeline-card-typography}

| Field    | Value |
| -------- | ----- |
| **Status** | In Progress |
| **Severity** | P3 |
| **Opened** | 0.0.5 |
| **Related** | [N-0010](./ROADMAP.md#n-0010-app-tracking-chrome) |
| **Playwright** | `tests/e2e/timeline-card-typography.spec.ts` · `@B-0011` |

**Symptoms:** Task name, priority, and duration on timeline cards are hard to read; tracking clock in header is small.

**Repro**

1. Schedule tasks on Timeline
2. Start tracking — compare card text and header clock size

**Expected:** Larger task title; priority + duration directly under title; larger header clock.

**Actual:** `text-sm` / `text-xs` card copy; `text-lg` clock.

**Affects matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |
|--------------------------------|----------|----------|----------|
|   Timeline card task title     | 🐛 B-0011 | 🐛 B-0011 | 🐛 B-0011 |
|   App header tracking clock    | 🐛 B-0011 |    —     |    —     |
```

| Code                 | Feature                    | Break # |
| -------------------- | -------------------------- | :-----: |
| SH.UI.02.031.020-002 | Timeline card typography   |    2    |
| DT.UI.00.010.040-002 | App header clock size      |    2    |

**Fix:** `text-base` title + `text-sm` meta under title; `text-2xl` header clock.

---

### B-0012 · Remove button covers task name {#b-0012-remove-button-covers-task-name}

| Field    | Value |
| -------- | ----- |
| **Status** | In Progress |
| **Severity** | P2 |
| **Opened** | 0.0.5 |
| **Playwright** | `tests/e2e/timeline-card-actions.spec.ts` · `@B-0012` |

**Symptoms:** Remove-from-timeline control renders as a full-width footer row, overlapping or pushing task name/meta.

**Repro**

1. Open Timeline with scheduled tasks
2. Hover a task card

**Expected:** Compact X control top-right; task name and meta fully visible.

**Actual:** Footer row with remove button consumes card height.

**Affects matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |
|--------------------------------|----------|----------|----------|
|   Remove from timeline (X)     | 🐛 B-0012 | 🐛 B-0012 | 🐛 B-0012 |
```

| Code                 | Feature                    | Break # |
| -------------------- | -------------------------- | :-----: |
| SH.UI.02.031.010-003 | Timeline remove control    |    3    |

**Fix:** Absolute top-right remove button; footer row only when tracking actions present.

---

### B-0013 · Add-time stretch button invisible {#b-0013-add-time-stretch-button-invisible}

| Field    | Value |
| -------- | ----- |
| **Status** | In Progress |
| **Severity** | P2 |
| **Opened** | 0.0.5 |
| **Related** | [N-0016](./ROADMAP.md#n-0016-add-time-menu-stretch) |
| **Playwright** | `tests/e2e/tracking-add-time-menu.spec.ts` · `@B-0013` |

**Symptoms:** Prev/add-time control shows magenta background only — no SkipBack icon, tap does nothing.

**Repro**

1. Start tracking a task on desktop
2. Observe left control in tracking player row

**Expected:** Visible icon button; tap stretches +time menu upward.

**Actual:** `max-h-10` clipped options row above button; close animation zeroed opacity on whole widget.

**Affects matrix**

```text
|            Feature             |    DT    |    SH    |
|--------------------------------|----------|----------|
|  Add-time stretch menu         | 🐛 B-0013 |    —     |
|  Tracking player prev control  | 🐛 B-0013 |    —     |
```

| Code                 | Feature                    | Break # |
| -------------------- | -------------------------- | :-----: |
| DT.UI.00.020.040-002 | Add-time stretch menu      |    2    |

**Fix:** `flex-col-reverse` + collapse options to `max-h-0`; icon button always rendered; close anim on options panel only.

**Regression (break -002):** In-flow stretch grew the flex row and `items-center` lifted pause/next. **Fix:** fixed `h-10` anchor slot + `absolute bottom-full` menu; `bottom-[calc(4rem+12px)]`.

**Regression (break -003):** Bottom-edge align looked off for h-10 side buttons vs h-12 pause. **Fix:** row `items-center` (menu stays `absolute` so pause/next do not shift on open).

---

## Fixed incidents

### B-0004 · Week strip animation after calendar toggle {#b-0004-week-strip-animation-after-calendar-toggle}

| Field    | Value |
| -------- | ----- |
| **Status** | Fixed |
| **Fixed** | 0.0.5 |
| **Severity** | P2 |
| **Opened** | 0.0.5 |
| **Related** | [N-0004](./ROADMAP.md#n-0004-scroll-sync-week-strip) · [N-0005](./ROADMAP.md#n-0005-due-date-calendar-view) |
| **Playwright** | `tests/e2e/timeline-calendar-view.spec.ts` · `@B-0004` |

**Symptoms:** After switching Timeline → Calendar → Timeline, the week-strip scroll-sync sliding indicator no longer animates until navigating away from Timeline and returning.

**Repro**

1. Open Timeline (rolling view)
2. Toggle to Calendar view (bottom-left)
3. Toggle back to Timeline
4. Scroll timeline — indicator frozen; animation resumes only after leaving Timeline via bottom nav and returning

**Expected:** Scroll-sync indicator animates immediately after returning from calendar view.

**Actual:** Scroll listener not rebound when timeline scroll container remounts.

**Affects matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |
|--------------------------------|----------|----------|----------|
|  Scroll-sync week strip (N-4)  | 🐛 B-0004 | 🐛 B-0004 | 🐛 B-0004 |
|   Timeline / calendar toggle   | 🐛 B-0004 | 🐛 B-0004 |    —     |
```

| Code                 | Feature                           | Break # |
| -------------------- | --------------------------------- | :-----: |
| DT.UI.02.010.040-001 | Scroll-sync selection indicator   |    1    |
| WB.UI.02.010.040-001 | Scroll-sync selection indicator   |    1    |
| DT.UI.02.050.010-001 | Timeline / calendar view toggle   |    1    |
| WB.UI.02.050.010-001 | View toggle (web)                 |    1    |
| SH.EN.02.010.010-001 | Midnight boundary scroll progress |    1    |

**Fix:** Rebind `useTimelineScrollDaySync` when timeline view becomes active (scroll container remounts after calendar toggle).

---

### B-0005 · Remove button covered by timer button {#b-0005-timeline-remove-button-covered-by-timer}

| Field    | Value |
| -------- | ----- |
| **Status** | Fixed |
| **Fixed** | 0.0.5 |
| **Severity** | P2 |
| **Opened** | 0.0.5 |
| **Related** | [N-0008](./ROADMAP.md#n-0008-timeline-auto-tracking--pause-sync) (full tracking redesign queued separately) |
| **Playwright** | `tests/e2e/timeline-card-actions.spec.ts` · `@B-0005` |

**Symptoms:** On desktop timeline task cards, the start-tracking button overlaps the remove (X) control at the top-right.

**Repro**

1. Schedule a doing task on Timeline (desktop)
2. Hover task card
3. Both controls appear stacked; timer button obscures remove

**Expected:** Remove (X) and play/pause controls aligned bottom-right, same size/shape, non-overlapping.

**Actual:** Timer at `top-2 right-2`, remove at `top-1 right-1` — collision.

**Affects matrix**

```text
|            Feature             |    DT    |    WB    |
|--------------------------------|----------|----------|
|    Remove from timeline (X)    | 🐛 B-0005 | 🐛 B-0005 |
|   Active task / timer display  | 🐛 B-0005 |    —     |
```

| Code                 | Feature                    | Break # |
| -------------------- | -------------------------- | :-----: |
| DT.UI.02.031.010-001 | Remove from timeline (X)   |    1    |
| DT.UI.02.034.010-001 | Active task / timer display |    1    |
| WB.UI.02.031.010-001 | Remove from timeline (web) |    1    |

**Fix:** Unified bottom-right action row on timeline cards; timer uses sideways triangle, remove uses X. Auto-track / pause-sync deferred to [N-0008](./ROADMAP.md#n-0008-timeline-auto-tracking--pause-sync).

---

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
