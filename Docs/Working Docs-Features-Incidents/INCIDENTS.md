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
| [B-0001](#b-0001-installer-cannot-close-tray-instance) | Installer cannot close tray instance   |    P1    | Fixed  | v26.06.12 | v26.06.12 |
| [B-0002](#b-0002-win-build-fails-when-blocks-is-running) | Win build fails when Blocks is running |    P2    | Fixed  | v26.06.12 | v26.06.12 |
| [B-0003](#b-0003-themes-lightsystem-not-applying) | Themes: Light/System not applying      |    P3    | Fixed  | v26.06.12 | v26.06.12 |
| [B-0004](#b-0004-week-strip-animation-after-calendar-toggle) | Week strip animation after calendar toggle |    P2    | Fixed  | v26.06.12 | v26.06.12 |
| [B-0005](#b-0005-timeline-remove-button-covered-by-timer) | Remove button covered by timer button  |    P2    | Fixed  | v26.06.12 | v26.06.12 |
| [B-0006](#b-0006-timeline-scroll-blocked-by-live-follow) | Timeline scroll blocked by live follow |    P1    | Fixed  | v26.06.12 | v26.06.12 |
| [B-0007](#b-0007-floating-timer-blocks-timeline-view) | Floating timer blocks timeline view    |    P2    | Fixed  | v26.06.12 | v26.06.12 |
| [B-0008](#b-0008-schedule-button-off-viewport-empty-timeline) | Schedule button off-viewport on empty timeline |    P2    | Fixed  | v26.06.12 | v26.06.12 |
| [B-0009](#b-0009-timeline-task-names-not-visible) | Timeline task names not visible on cards |    P2    | Fixed  | v26.06.12 | v26.06.12 |
| [B-0010](#b-0010-tracking-control-strip-ui) | Tracking control strip UI mismatch |    P2    | Fixed  | v26.06.12 | v26.06.12 |
| [B-0011](#b-0011-timeline-card-typography) | Timeline card typography too small |    P3    | Fixed  | v26.06.12 | v26.06.12 |
| [B-0012](#b-0012-remove-button-covers-task-name) | Remove button covers task name |    P2    | Fixed  | v26.06.12 | v26.06.12 |
| [B-0013](#b-0013-add-time-stretch-button-invisible) | Add-time stretch button invisible |    P2    | Fixed  | v26.06.12 | v26.06.12 |
| [B-0014](#b-0014-timer-runs-outside-active-task-window) | Timer runs outside active task window |    P2    | In Progress | v26.06.12 | — |
| [B-0015](#b-0015-schedule-immediately-causes-overlaps) | Schedule immediately causes overlaps |    P1    | In Progress | v26.06.12 | — |
| [B-0016](#b-0016-timeline-entry-snap-scrolls-to-midnight) | Entry snap scrolls to midnight not now |    P2    | In Progress | v26.06.12 | — |
| [B-0017](#b-0017-desktop-google-connect-shows-localhost) | Desktop Google connect shows localhost |    P1    | In Progress | v26.06.12 | — |
| [B-0018](#b-0018-desktop-timeline-invisible-missing-layout-vars) | Desktop timeline & now bar invisible |    P0    | In Progress | v26.06.12 | — |
| [B-0019](#b-0019-event-toggle-missing-hide-priority-status) | Event toggle missing; hide task fields for events |    P1    | In Progress | v26.06.12 | — |
| [B-0020](#b-0020-gcal-time-picker-all-day-missing) | GCal time picker + All Day missing |    P2    | In Progress | v26.06.12 | — |
| [B-0021](#b-0021-drag-snap-task-edges-not-quarter-hour) | Drag snap should prefer task edges |    P2    | In Progress | v26.06.12 | — |
| [B-0022](#b-0022-drag-pushback-jumps-unselected-tasks) | Drag overlap push-back jumps other tasks |    P1    | In Progress | v26.06.12 | — |
| [B-0027](#b-0027-timeline-add-task-nav-broken) | Timeline Add nav does not open add-task page |    P1    | In Progress | v26.06.14 | — |
| [B-0028](#b-0028-shell-now-task-alignment) | Shell Now task not aligned to clock |    P3    | In Progress | v26.06.14 | — |
| [B-0029](#b-0029-global-spacing-regression) | Global spacing/margins regressed vs June 9 |    P1    | Fixed  | v26.07.01 | v26.07.16 |

---

## Open incidents

### B-0014 · Timer runs outside active task window {#b-0014-timer-runs-outside-active-task-window}

| Field    | Value |
| -------- | ----- |
| **Status** | In Progress |
| **Severity** | P2 |
| |**Opened** | v26.06.12 |
| **Related** | [N-0008](./ROADMAP.md#n-0008-timeline-auto-tracking--pause-sync) · [N-0010](./ROADMAP.md#n-0010-app-tracking-chrome) |
| **Playwright** | Manual QA · desktop `useTimelineAutoTrack` reset |
| **Fix** | `resetTimer()` when now bar leaves all task blocks (discard session) |

**Symptoms:** Tracking clock keeps running after the now bar leaves the active scheduled task block.

**Expected:** Timer resets/discards the session when now is not over a task block; only time inside the block counts (manual stop still saves).

**Actual:** Auto-track starts at now but never stops when now leaves the block.

**Affects matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |    SB    |
|--------------------------------|----------|----------|----------|----------|
|   Auto-stop when now leaves    | ✅ B-0014 | 📋 B-0014 | ✅ B-0014 | ✅ B-0014 |
|   App tracking chrome clock    | ✅ B-0014 |    —     |    —     |    —     |
```

| Code                 | Feature                         | Break # |
| -------------------- | ------------------------------- | :-----: |
| DT.UI.02.034.020-001 | Auto-tracking at now (N-0008)   |    1    |
| SH.EN.02.060.010-001 | Active-task-at-now detection    |    1    |

---

### B-0015 · Schedule immediately causes overlaps {#b-0015-schedule-immediately-causes-overlaps}

| Field    | Value |
| -------- | ----- |
| **Status** | In Progress |
| **Severity** | P1 |
| |**Opened** | v26.06.12 |
| **Related** | [N-0011](./ROADMAP.md#n-0011-schedule-immediately-quick-blocks) · [N-0021](./ROADMAP.md#n-0021-single-focus-task-scheduling) |
| **Playwright** | `tests/integration/timeline-scheduling.spec.ts` · `@B-0015` |
| **Fix** | `buildTimelineInsertPushBackUpdates` in `addToTimeline` + Quick Blocks push-back + `addTaskFromBlock` store path |

**Symptoms:** Quick block “Schedule immediately” and other inserts overlap existing timeline tasks (web tap path bypassed push-back).

**Expected:** Insert at now pushes all overlapping/downstream tasks later; no task-task overlap.

**Actual:** `addToTimeline` set `scheduledAt` only with no cascade.

**Affects matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |    SB    |
|--------------------------------|----------|----------|----------|----------|
|  Schedule immediately (N-0011) | ✅ B-0015 | ✅ B-0015 |    —     | ✅ B-0015 |
|   Timeline insert / push-back  | ✅ B-0015 | ✅ B-0015 | ✅ B-0015 | ✅ B-0015 |
```

| Code                 | Feature                         | Break # |
| -------------------- | ------------------------------- | :-----: |
| DT.UI.03.020.020-001 | Schedule immediately            |    1    |
| SB.EN.02.040.080-001 | Single-focus push-back engine   |    1    |

---

### B-0016 · Timeline entry snap scrolls to midnight {#b-0016-timeline-entry-snap-scrolls-to-midnight}

| Field    | Value |
| -------- | ----- |
| **Status** | In Progress |
| **Severity** | P2 |
| |**Opened** | v26.06.12 |
| **Related** | [N-0006](./ROADMAP.md#n-0006-timeline-entry-snap-to-now) |
| **Playwright** | `tests/e2e/timeline-entry-snap.spec.ts` · `@B-0016` |
| **Fix** | Entry snap always `scrollToNow`; remove persisted-day midnight scroll |

**Symptoms:** Switching to Timeline scrolls viewport to **00:00** instead of the now-bar.

**Repro**

1. Visit Timeline once (sessionStorage stores selected day).
2. Navigate away (Kanban / Blocks).
3. Return to Timeline.
4. Viewport lands at midnight of stored day.

**Expected:** Every timeline entry snaps to today + current time (N-0006).

**Actual:** `hasStoredSelection` routed entry snap through `scrollToDay()` → midnight.

**Affects matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |    SB    |
|--------------------------------|----------|----------|----------|----------|
|  Entry snap to now (N-0006)    | 🐛 B-0016 | 🐛 B-0016 | 🐛 B-0016 |    —     |
```

| Code                 | Feature                         | Break # |
| -------------------- | ------------------------------- | :-----: |
| DT.UI.02.040.050-002 | Timeline entry snap to now      |    2    |
| WB.UI.02.040.050-001 | Timeline entry snap to now (web)|    1    |
| SH.EN.02.040.060-002 | `useTimelineNowFollow` entry    |    2    |

---

### B-0017 · Desktop Google connect shows localhost {#b-0017-desktop-google-connect-shows-localhost}

| Field    | Value |
| -------- | ----- |
| **Status** | In Progress |
| **Severity** | P1 |
| |**Opened** | v26.06.12 |
| **Related** | [N-0017](./ROADMAP.md#n-0017-google-calendar-timeline) · [N-0022](./ROADMAP.md#n-0022-profile-google-sign-in) |
| **Playwright** | `tests/integration/oauth-proxy-health.spec.ts` · `@B-0017` |
| **Fix** | Preflight `/health` on oauth-proxy; block connect with setup instructions; in-app error on Profile/Settings |

**Symptoms:** Tapping Connect Google on desktop opens `http://localhost:8787/auth/google?returnUrl=…` and stays on localhost instead of redirecting to Google sign-in.

**Repro**

1. Open Blocks desktop (Profile or Settings → Google Calendar).
2. Tap **Connect Google**.
3. System browser opens localhost OAuth proxy URL; page does not redirect to `accounts.google.com`.

**Expected:** Browser redirects to Google account picker; after consent, loopback callback stores tokens.

**Actual:** User lands on localhost proxy start URL (proxy unreachable, missing credentials, or error page with no redirect).

**Affects matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |    SB    |
|--------------------------------|----------|----------|----------|----------|
|  Profile Google connect        | 🐛 B-0017 |    —     | 🐛 B-0017 |    —     |
|  Settings Google connect       | 🐛 B-0017 |    —     | 🐛 B-0017 |    —     |
|  Desktop OAuth IPC loopback    | 🐛 B-0017 |    —     |    —     | 🐛 B-0017 |
|  OAuth proxy PKCE redirect     | 🐛 B-0017 | 📋 B-0017 |    —     | 🐛 B-0017 |
```

| Code                 | Feature                         | Break # |
| -------------------- | ------------------------------- | :-----: |
| DT.UI.07.040.010-001 | Profile Google connect          |    1    |
| DT.UI.06.007.010-001 | Connect / disconnect Google     |    1    |
| DT.BG.06.008.010-001 | Desktop Google OAuth IPC        |    1    |
| CX.EN.06.007.010-001 | OAuth proxy (PKCE)              |    1    |

---

---

## Fixed incidents

### B-0006 · Timeline scroll blocked by live follow {#b-0006-timeline-scroll-blocked-by-live-follow}

| Field    | Value |
| -------- | ----- |
| **Status** | Fixed |
| |**Fixed** | v26.06.12 |
| **Severity** | P1 |
| |**Opened** | v26.06.12 |
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
|   Rolling timeline scroll      | ✅ B-0006 | ✅ B-0006 | ✅ B-0006 |
|  Live scroll lock (N-0007)     | ✅ B-0006 | ✅ B-0006 | ✅ B-0006 |
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
| **Status** | Fixed |
| |**Fixed** | v26.06.12 |
| **Severity** | P2 |
| |**Opened** | v26.06.12 |
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
|   Active task / timer display  | ✅ B-0007 | ✅ B-0007 |
|   Timeline card action row     | ✅ B-0007 | ✅ B-0007 |
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
| **Status** | Fixed |
| |**Fixed** | v26.06.12 |
| **Severity** | P2 |
| |**Opened** | v26.06.12 |
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
|   Schedule doing tasks (FAB)   | ✅ B-0008 | ✅ B-0008 | ✅ B-0008 |
|   Rolling timeline empty state | ✅ B-0008 | ✅ B-0008 |    —     |
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
| **Status** | Fixed |
| |**Fixed** | v26.06.12 |
| **Severity** | P2 |
| |**Opened** | v26.06.12 |
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
|   Timeline card task title     | ✅ B-0009 | ✅ B-0009 | ✅ B-0009 |
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
| **Status** | Fixed |
| |**Fixed** | v26.06.12 |
| **Severity** | P2 |
| |**Opened** | v26.06.12 |
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
|  Tracking pause/resume control | ✅ B-0010 | ✅ B-0010 |
|  Timeline bottom action row    | ✅ B-0010 | ✅ B-0010 |
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
| **Status** | Fixed |
| |**Fixed** | v26.06.12 |
| **Severity** | P3 |
| |**Opened** | v26.06.12 |
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
|   Timeline card task title     | ✅ B-0011 | ✅ B-0011 | ✅ B-0011 |
|   App header tracking clock    | ✅ B-0011 |    —     |    —     |
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
| **Status** | Fixed |
| |**Fixed** | v26.06.12 |
| **Severity** | P2 |
| |**Opened** | v26.06.12 |
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
|   Remove from timeline (X)     | ✅ B-0012 | ✅ B-0012 | ✅ B-0012 |
```

| Code                 | Feature                    | Break # |
| -------------------- | -------------------------- | :-----: |
| SH.UI.02.031.010-003 | Timeline remove control    |    3    |

**Fix:** Absolute top-right remove button; footer row only when tracking actions present.

---

### B-0013 · Add-time stretch button invisible {#b-0013-add-time-stretch-button-invisible}

| Field    | Value |
| -------- | ----- |
| **Status** | Fixed |
| |**Fixed** | v26.06.12 |
| **Severity** | P2 |
| |**Opened** | v26.06.12 |
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
|  Add-time stretch menu         | ✅ B-0013 |    —     |
|  Tracking player prev control  | ✅ B-0013 |    —     |
```

| Code                 | Feature                    | Break # |
| -------------------- | -------------------------- | :-----: |
| DT.UI.00.020.040-002 | Add-time stretch menu      |    2    |

**Fix:** `flex-col-reverse` + collapse options to `max-h-0`; icon button always rendered; close anim on options panel only.

**Regression (break -002):** In-flow stretch grew the flex row and `items-center` lifted pause/next. **Fix:** fixed `h-10` anchor slot + `absolute bottom-full` menu; `bottom-[calc(4rem+12px)]`.

**Regression (break -003):** Bottom-edge align looked off for h-10 side buttons vs h-12 pause. **Fix:** row `items-center` (menu stays `absolute` so pause/next do not shift on open).

---

### B-0004 · Week strip animation after calendar toggle {#b-0004-week-strip-animation-after-calendar-toggle}

| Field    | Value |
| -------- | ----- |
| **Status** | Fixed |
| |**Fixed** | v26.06.12 |
| **Severity** | P2 |
| |**Opened** | v26.06.12 |
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
|  Scroll-sync week strip (N-4)  | ✅ B-0004 | ✅ B-0004 | ✅ B-0004 |
|   Timeline / calendar toggle   | ✅ B-0004 | ✅ B-0004 |    —     |
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
| |**Fixed** | v26.06.12 |
| **Severity** | P2 |
| |**Opened** | v26.06.12 |
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
|    Remove from timeline (X)    | ✅ B-0005 | ✅ B-0005 |
|   Active task / timer display  | ✅ B-0005 |    —     |
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
| |**Opened** | v26.06.12   |
| |**Fixed** | v26.06.12   |
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
| |**Opened** | v26.06.12   |
| |**Fixed** | v26.06.12   |
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
| |**Opened** | v26.06.12   |
| |**Fixed** | v26.06.12   |
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

### B-0018 · Desktop timeline & now bar invisible {#b-0018-desktop-timeline-invisible-missing-layout-vars}

| Field    | Value |
| -------- | ----- |
| **Status** | In Progress |
| **Severity** | P0 |
| |**Opened** | v26.06.12 |
| **Batch** | v26.06.12b2 |
| **Related** | [N-0003](./ROADMAP.md#n-0003-rolling-timeline-window) · [N-0014](./ROADMAP.md#n-0014-now-bar-viewport-offset) · [B-0006](#b-0006-timeline-scroll-blocked-by-live-follow) |
| **Playwright** | Manual QA desktop · `@B-0018` (layout vars) |
| **Fix** | Restore `--title-bar-height` / `--top-bar-height` / `--bottom-nav-height` in `apps/desktop/src/renderer/index.css` |

**Symptoms:** Timeline page shows week strip only (or blank); hour grid and magenta now bar are completely missing on desktop b2 build.

**Repro**

1. Install or run desktop `v26.06.12b2`
2. Open Timeline nav item
3. Observe no scrollable hour grid and no now indicator

**Expected:** Rolling timeline fills viewport below week strip; now bar visible at current time (N-0003, N-0014).

**Actual:** `rolling-timeline` container height calc uses undefined CSS vars → invalid height → collapsed timeline.

**Affects matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |
|--------------------------------|----------|----------|----------|
|   Rolling timeline (N-0003)    | 🐛 B-0018 |    —     |    —     |
|   Now bar / current time       | 🐛 B-0018 |    —     |    —     |
|  Timeline week strip           | ✅ B-0018 |    —     |    —     |
|  Live scroll lock (N-0007)     | 🐛 B-0018 |    —     |    —     |
```

| Code                 | Feature                         | Break # |
| -------------------- | ------------------------------- | :-----: |
| DT.UI.02.040.010-001 | Rolling timeline vertical scroll |    1    |
| DT.UI.02.040.040-001 | Current-time now bar            |    1    |
| SH.UI.02.040.060-001 | Timeline now-follow hook        |    1    |
| SH.UI.08.001.010-001 | Desktop CSS layout variables    |    1    |

**Root cause:** b2 build restore rewrote `index.css` without shell chrome variables that `TimelinePage` height calc depends on (regression of B-0006 fix note).

---

### B-0019 · Event toggle missing; hide Priority/Status {#b-0019-event-toggle-missing-hide-priority-status}

| Field    | Value |
| -------- | ----- |
| **Status** | In Progress |
| **Severity** | P1 |
| **Batch** | v26.06.12b3 |
| **Opened** | v26.06.12 |
| **Related** | [N-0026](./ROADMAP.md#n-0026-user-events-on-tasks) |
| **Playwright** | `@B-0019` · add/edit task e2e |

**Symptoms:** Desktop has no Event toggle on create/edit. Web has toggle but Priority and Status remain visible when `isEvent=true`.

**Expected:** Event toggle on add + edit (DT + WB). When Event on → **hide** Priority, Status, **Block Size**, and **Block Count** (duration comes from GCal clock time picker — B-0020; block fields conflict with timed events).

**Affects matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |    SB    |
|--------------------------------|----------|----------|----------|----------|
|  Event toggle create/edit      | 🐛 B-0019 | 🐛 B-0019 | 🐛 B-0019 |    —     |
|  Hide Priority/Status (event)  | 🐛 B-0019 | 🐛 B-0019 | 🐛 B-0019 |    —     |
|  Hide Block Size/Count (event) | 🐛 B-0019 | 🐛 B-0019 | 🐛 B-0019 |    —     |
|  Timeline event card meta      | ✅ B-0019 | ✅ B-0019 | ✅ B-0019 |    —     |
```

**Fix UX:** Shared event section in task editor; conditional render hides Priority, Status, Block Size, and Block Count when `isEvent`. Duration derived from `eventStartAt` / `eventEndAt` (B-0020) or All Day default.

**Logic note (b3 PM):** Block Size/Count hidden because they conflict with clock-style event times — see B-0020.

---

### B-0020 · GCal time picker + All Day missing {#b-0020-gcal-time-picker-all-day-missing}

| Field    | Value |
| -------- | ----- |
| **Status** | In Progress |
| **Severity** | P2 |
| **Batch** | v26.06.12b3 |
| **Opened** | v26.06.12 |
| **Related** | [N-0026](./ROADMAP.md#n-0026-user-events-on-tasks) · B-0019 |
| **Playwright** | `@B-0020` |

**Symptoms:** Desktop missing time UI; web uses native `type="time"` — not GCal **clock-face** picker. All Day toggle incomplete on desktop.

**Expected:** Shared **GCal clock-face** time picker (circular dial + hour/minute hands — **not** scroll-column wheels) + All Day toggle on add + edit (DT + WB). All Day clears/disables times; default All Day until times set. Replaces Block Size/Count for events (B-0019).

**Affects matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |
|--------------------------------|----------|----------|----------|
|  GCal clock-face time picker   | 🐛 B-0020 | 🐛 B-0020 | 🐛 B-0020 |
|  All Day toggle                | 🐛 B-0020 | 🐛 B-0020 | 🐛 B-0020 |
```

**Fix UX:** `ClockTimePickerPopover` in `@blocks/ui` — analog clock dial (GCal-style tap/drag), not scroll lists; wired in shared task editor event section.

**Logic note (b3 PM):** Scroll-column pickers rejected — too slow; must match GCal clock UI.

---

### B-0021 · Drag snap should prefer task edges {#b-0021-drag-snap-task-edges-not-quarter-hour}

| Field    | Value |
| -------- | ----- |
| **Status** | In Progress |
| **Severity** | P2 |
| **Batch** | v26.06.12b3 |
| **Opened** | v26.06.12 |
| **Related** | [N-0024](./ROADMAP.md#n-0024-pause-snap-during-drag) · [N-0011](./ROADMAP.md#n-0011-schedule-immediately-quick-blocks) |
| **Playwright** | `@B-0021` · timeline drag e2e |

**Symptoms:** Drag-reschedule always snaps to 15-min grid; cannot drop flush below another task card.

**Expected:** **Task-edge magnet first** (~8px), **15-min grid fallback** in gaps. **Schedule immediately (Quick Blocks):** no grid snap — insert at exact now. Quick Blocks use **flush push-back** (active + downstream start after new block end). Drag-reschedule uses same edge snap as regular tasks.

**Affects matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |    SB    |
|--------------------------------|----------|----------|----------|----------|
|  Drag-reschedule snap          | 🐛 B-0021 | 🐛 B-0021 | 🐛 B-0021 | 🐛 B-0021 |
|  Schedule immediately snap     | 🐛 B-0021 | 🐛 B-0021 |    —     | 🐛 B-0021 |
|  Quick Blocks flush push-back  | 🐛 B-0021 | 🐛 B-0021 |    —     | 🐛 B-0021 |
```

**Fix UX:** Extend `resolveTimelineDropFromPointer` with task-edge candidates; separate snap mode for Quick Blocks insert-at-now.

---

### B-0022 · Drag overlap push-back jumps other tasks {#b-0022-drag-pushback-jumps-unselected-tasks}

| Field    | Value |
| -------- | ----- |
| **Status** | In Progress |
| **Severity** | P1 |
| **Batch** | v26.06.12b3 |
| **Opened** | v26.06.12 |
| **Related** | [N-0021](./ROADMAP.md#n-0021-single-focus-task-scheduling) · [N-0029](./ROADMAP.md#n-0029-passive-overlap-on-bulk-move) |
| **Playwright** | `@B-0022` · `@N-0029` partial |

**Symptoms:** Single-task drag onto overlapping slot triggers `buildTimelineInsertPushBackUpdates` — unselected tasks jump away.

**Expected (PM b3):** **Single drag only** — move dragged task; unselected tasks **stay in place** and render in **passive overlap columns** (including `isEvent` blocks). **Push-back retained** for Schedule Doing and Quick Blocks flush insert.

**Affects matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |    SB    |
|--------------------------------|----------|----------|----------|----------|
|  Single drag passive overlap   | 🐛 B-0022 | 🐛 B-0022 | 🐛 B-0022 | 🐛 B-0022 |
|  Schedule Doing push-back      | ✅ B-0022 | ✅ B-0022 | ✅ B-0022 | ✅ B-0022 |
|  Quick Blocks flush push-back  | ✅ B-0022 | ✅ B-0022 |    —     | ✅ B-0022 |
|  Event passive columns         | 🐛 B-0022 | 🐛 B-0022 | 🐛 B-0022 | 🐛 B-0022 |
```

**Fix UX:** Drag commit path skips push-back; overlap layout handles visual columns; extends N-0029 rules to single-task drag (not bulk select).

---

### B-0027 · Timeline Add nav does not open add-task page {#b-0027-timeline-add-task-nav-broken}

| Field | Value |
| ----- | ----- |
| **Severity** | P1 |
| **Status** | In Progress |
| **Opened** | v26.06.14 |
| **Related** | [N-0044](./ROADMAP.md#n-0044-task-edit-bottom-action-row) |
| **Playwright** | `tests/integration/b14-b2-timeline-add.spec.ts` · `@B-0027` |

**Symptoms:** From Timeline, bottom-nav **Add (+)** does not reliably open the add-task page (stale edit state / wrong return navigation).

**Fix UX:** Dedicated add-nav path clears `editingTask`, sets `doing` default from timeline, tracks `returnPage` for back; bottom-nav Add gets `data-testid`.

---

### B-0028 · Shell Now task not aligned to clock {#b-0028-shell-now-task-alignment}

| Field | Value |
| ----- | ----- |
| **Severity** | P3 |
| **Status** | In Progress |
| **Opened** | v26.06.14 |
| **Related** | [N-0037](./ROADMAP.md#n-0037-nownext-task-names-flank-shell-clock) · [N-0041](./ROADMAP.md#n-0041-shell-clock-colon-centered) |
| **Playwright** | `@B-0028` |

**Symptoms:** While tracking, **Now** task name sits at the far left of the header instead of hugging the clock with right-aligned text (mirror of **Next** on the right).

**Fix UX:** Left column uses `justify-end`; Now chip keeps `text-right` / `items-end`; Next unchanged with `justify-start` / `text-left`.

---

### B-0029 · Global spacing/margins regressed vs June 9 {#b-0029-global-spacing-regression}

| Field | Value |
| ----- | ----- |
| **Severity** | P1 |
| **Status** | Fixed |
| **Opened** | v26.07.01 |
| **Fixed** | v26.07.16 (**v26.07.16b3**) |
| **Related** | [N-0048](./ROADMAP.md#n-0048-kanban-sort--manual-order) · [N-0049](./ROADMAP.md#n-0049-kanban-filter--saved-views) |
| **Playwright** | `@B-0029` · `apps/desktop/tests/e2e/spacing-cascade.spec.ts` · `tests/visual/desktop-web-parity.spec.ts` |
| **Logic note** | Web = source of truth. **B-0029-002:** unlayered `* { padding:0 }` in desktop `index.css` beat Tailwind `@layer utilities`; reset moved into `@layer base` to match web `globals.css`. |

**Symptoms (pre-fix):** Desktop margins/padding/spacing wrong since ~v26.6.30 — Kanban cards, Timeline blocks, Calendar cells, shell buttons flush to edges. Web remained correct.

**Expected:** Desktop matches web: Tailwind `p-*` / `px-*` / `py-*` apply; TaskCards, toolbar chips, timeline blocks, calendar cells have breathing room.

**Actual (B-0029-001):** Shell diverged (custom top bar, tokens). Addressed via shared TopBar / pb-nav (v26.07.01b1 · v26.07.02b1).  
**Actual (B-0029-002):** Components declared padding (`TaskCard` `p-4`, etc.) but desktop CSS had an **unlayered** universal reset after `@import "tailwindcss"`, so utilities lost under Tailwind v4.

**Affects matrix**

```text
|            Feature             |    DT    |    WB    |    SH    |
|--------------------------------|----------|----------|----------|
|  CSS base reset layering       | ✅ B-0029 |    ✅     |    —     |
|  Kanban column/board padding   | ✅ B-0029 |    ✅     | ✅ share |
|  Task card spacing             | ✅ B-0029 |    ✅     | ✅ share |
|  Timeline block text padding   | ✅ B-0029 |    ✅     | ✅ share |
|  Calendar month cell padding   | ✅ B-0029 |    ✅     | ✅ share |
|  Bottom nav / top bar rhythm   | ✅ B-0029 |    ✅     | ✅ share |
```

**Fix:** Desktop `* { margin/padding }` moved into `@layer base` (parity with web). E2e asserts non-zero computed padding; `PLAYWRIGHT_PARITY=1` suite retains cross-shell check. QA confirmed on `Blocks-Setup-26.7.16-b3.exe`.

---

## New incident template

Use `/NB` skill. Include an **Affects matrix** in `text` block (32 / 10 column widths).

When fixed: registry ✅ · move here to Fixed · [CHANGELOG.md](./CHANGELOG.md) **Fixed** line.
