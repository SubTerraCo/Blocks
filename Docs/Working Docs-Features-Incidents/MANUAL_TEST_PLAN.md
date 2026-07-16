# Blocks Manual Feature Test Plan

> **Release:** v26.07.16 · **Active batch:** v26.07.16b1  
> **Companion:** [FEATURE_REGISTRY.md](./FEATURE_REGISTRY.md) · [ROADMAP.md](./ROADMAP.md) · [CHANGELOG.md](./CHANGELOG.md)  
> **Automation:** `pnpm test:features` · `pnpm test:features:headed` · `pnpm test:integration`  
> **Purpose:** Human QA on top of Playwright — covers live OAuth, multi-device sync, desktop-only flows, shell parity, and MCP tooling that automation mocks or skips.

---

## How to use this plan

1. **Environment:** Web at `http://localhost:3000` (`pnpm --filter web dev`) and Desktop (`pnpm --filter desktop dev` or installed `Blocks.exe`).
2. **Clean state (optional):** Settings → Clear All Data, or DevTools → Application → IndexedDB → delete `BlocksDB`.
3. **Mark each row:** Pass / Fail / Skip · note platform (WB / DT) · link incident **B-####** if broken.
4. **Automated coverage:** Where a Playwright file is listed, run the tagged suite first; manual steps focus on gaps.

### Tag reference (Sprint 5 · v26.06.12–v26.07.02)

| Tag | Feature area |
|-----|----------------|
| N-0001–N-0008 | Rolling timeline, week strip, calendar view, scroll/snap |
| N-0010–N-0016 | Tracking chrome, player, bottom actions |
| N-0017 | Google Calendar (on hold — manual only if enabled) |
| N-0018 | P2P Yjs sync |
| N-0019 | MCP export mode |
| N-0024–N-0027 | Events, drag snap pause, Doing lock, continuous scroll calendar |
| N-0030–N-0031 | Calendar sticky strip, timeline nav exits calendar |
| N-0045 | Quick Blocks → reusable linked task + placement picker |
| N-0046 | Event section below Task Name |
| N-0047 | Events/calendar right column on overlap |
| N-0048 | Kanban sort + manual column order |
| N-0049 | Kanban filter + saved views |
| B-0029 | Spacing/accent restore + desktop–web shell parity |

---

## 1 · App shell (AA · 00)

| ID | Feature | WB | DT | Steps | Expected | Auto |
|----|---------|:--:|:--:|-------|----------|------|
| DT.UI.00.001.010 | Top bar | ✓ | ✓ | Open Kanban, Timeline, Settings, Profile | Shared shell: title, back on settings/profile, profile control | `navigation.spec.ts` · `@B-0029` |
| SH.UI.00.001.010 | Desktop–web shell parity | ✓ | ✓ | Compare web localhost vs desktop on main nav pages | Matching titles, top bar layout, accent `#ff3366`, nav padding | `@B-0029` · `desktop-web-parity.spec.ts` (parity gate) |
| DT.UI.00.002.010 | Bottom nav | ✓ | ✓ | Tap each nav item | Routes: Kanban, Timeline, Blocks, Search, Profile | `navigation.spec.ts` |
| DT.UI.00.003.010 | Routing | ✓ | ✓ | Deep-link `/timeline`, `/settings` | Correct page loads, no 404 | `navigation.spec.ts` |
| DT.UI.00.004.010 | Keyboard shortcuts | ✓ | ✓ | Press shortcut keys (see in-app help) | Expected navigation/actions | `keyboard.spec.ts` |
| DT.UI.00.010.040 | Tracking chrome | — | ✓ | Start a doing task; observe header + timeline | Clock/control strip visible while tracking | `tracking-chrome.spec.ts` |
| DT.UI.00.020.020 | Bottom action row + Kanban pad | ✓ | ✓ | Timeline: check FAB/toggle position; Kanban: scroll last column | Controls sit above nav; columns not hidden | `bottom-action-kanban-clearance.spec.ts` |
| DT.UI.00.020.030 | Tracking player | ✓ | ✓ | With active task, use prev/next/complete | Downstream tasks shift; player row visible | `tracking-player-row.spec.ts` |
| DT.UI.00.020.040 | Add-time menu | — | ✓ | While tracking, open add-time menu | Menu opens upward; duration options apply | Manual (DT) |

---

## 2 · Kanban (AA · 01)

| ID | Feature | WB | DT | Steps | Expected | Auto |
|----|---------|:--:|:--:|-------|----------|------|
| DT.UI.01.010.010 | Column drag-drop | ✓ | ✓ | Drag task between columns | Status updates, card moves | `kanban.spec.ts` |
| DT.UI.01.011.010 | Six columns | ✓ | ✓ | View board | Backlog, Design, To Do, Doing, Review, Done | `kanban.spec.ts` |
| DT.UI.01.012.010 | Task card | ✓ | ✓ | Inspect cards | Name, duration, status visible | `task-card.spec.ts` |
| DT.UI.01.013.010 | Per-column quick add | ✓ | ✓ | Add task from column footer | Task created in column | `kanban.spec.ts` |
| DT.UI.01.040.010 | Bulk actions | ✓ | ✓ | Select multiple → bulk move/delete | All selected update | `bulk-actions.spec.ts` |
| DT.UI.01.050.010 | Kanban toolbar header | ✓ | ✓ | Open Kanban | Compact second header row: view/sort/filter controls above columns | `@N-0048` `@N-0049` `@B-0029` |
| DT.UI.01.051.010 | Sort field + direction | ✓ | ✓ | Change sort to due date desc, then priority asc | Board reorders; default priority asc (P1 top) | `@N-0048` · `kanban-sort-filter.spec.ts` |
| DT.UI.01.052.010 | Manual column order | ✓ | ✓ | Drag card within one column | Order persists after reload (`kanbanOrder`) | `@N-0048` |
| DT.UI.01.053.010 | Refresh sort | ✓ | ✓ | After manual reorder, tap refresh on column | Manual order cleared; active sort reapplies | `@N-0048` |
| DT.UI.01.054.010 | Filter panel | ✓ | ✓ | Open filter; set priority + tag | Board narrows (AND semantics) | `@N-0049` |
| DT.UI.01.055.010 | Saved views | ✓ | ✓ | Save current filter+sort as named view; switch views | Default view present; named view restores state | `@N-0049` |

---

## 3 · Timeline (AA · 02)

### 3.1 Core timeline

| ID | Feature | WB | DT | Steps | Expected | Auto |
|----|---------|:--:|:--:|-------|----------|------|
| DT.UI.02.010.010 | 24-hour display | ✓ | ✓ | Open Timeline | Hour labels 00–23 | `timeline.spec.ts` |
| DT.UI.02.020.010 | Drag reschedule | ✓ | ✓ | Drag scheduled block | New start/end persisted | `timeline-drag.spec.ts` |
| DT.UI.02.030.010 | Doing-only rule | ✓ | ✓ | Schedule todo vs doing | Only doing (+ active) on timeline | `timeline-status.spec.ts` |
| DT.UI.02.031.010 | Remove from timeline | ✓ | ✓ | Click X on block | Task unscheduled, remains in Kanban | `timeline-card-actions.spec.ts` |
| DT.UI.02.031.020 | Card typography | ✓ | ✓ | Compare title size/weight | Readable title, no clipping | `timeline-card-typography.spec.ts` |
| DT.UI.02.032.010 | Midnight clear | ✓ | ✓ | Simulate day change / wait until midnight | Stale doing cleared per rules | `timeline-reset.spec.ts` |
| DT.UI.02.033.010 | Grouped routines | ✓ | — | Spawn routine group | Collapsible routine blocks | `blocks-functionality.spec.ts` |
| DT.UI.02.034.010 | Active timer display | ✓ | ✓ | Start doing task | Elapsed time on card | `timeline-card-actions.spec.ts` |
| DT.UI.02.034.020 | Auto-tracking + pause-sync | ✓ | ✓ | Enable auto-track; let now pass task start | Tracking starts; downstream pauses shift | Manual |
| DT.UI.02.035.010 | Schedule doing FAB | ✓ | ✓ | Put tasks in Doing; open timeline | FAB schedules unscheduled doing | `timeline-schedule-fab.spec.ts` |

### 3.2 Rolling timeline (N-0001–N-0008)

| ID | Feature | WB | DT | Steps | Expected | Auto |
|----|---------|:--:|:--:|-------|----------|------|
| DT.UI.02.010.020 | Week strip | ✓ | ✓ | View timeline header | 7 day cells, today highlighted | `@N-0001` |
| DT.UI.02.010.030 | Scroll-sync strip | ✓ | ✓ | Scroll timeline across midnight | Strip selection follows visible day | `@N-0004` |
| DT.UI.02.040.010 | Rolling window ±7d | ✓ | ✓ | Scroll up/down | ~15 day headers max; continuous axis | `@N-0003` |
| DT.UI.02.040.050 | Entry snap to now | ✓ | ✓ | Leave timeline, return | Scroll snaps to today + now line | `@N-0006` |
| DT.UI.02.040.060 | Scroll lock + snap delay | ✓ | ✓ | Settings: set snap delay; scroll manually | Now bar centered when lock on; delay respected | `@N-0007` |
| DT.UI.02.050.010 | Due-date calendar view | ✓ | ✓ | Toggle calendar view (bottom-left) | Month grid with due tasks | `@N-0005` |
| SB.EN.02.040.070 | Now-bar offset | ✓ | ✓ | Settings → adjust now-bar slider | Red line shifts in viewport | `@N-0014` |

### 3.3 Events & calendar UX (N-0024–N-0027 · N-0030–N-0031)

| ID | Feature | WB | DT | Steps | Expected | Auto |
|----|---------|:--:|:--:|-------|----------|------|
| DT.UI.02.040.080 | Pause snap during drag | ✓ | ✓ | Drag-reschedule a block | Live snap pauses until drop; resumes after | `@N-0024` |
| SB.EN.02.060.030 | Schedule Doing lock current | ✓ | ✓ | Schedule doing tasks with one active | Current doing task not displaced by pack | `@N-0025` |
| DT.UI.02.037.010 | User events on timeline | ✓ | ✓ | Create event task; schedule on timeline | Event block + all-day strip when applicable | `@N-0026` |
| DT.UI.02.050.020 | Continuous scroll calendar | ✓ | ✓ | Toggle calendar; scroll weeks | Continuous scroll (not month pager); lookback setting works | `@N-0027` |
| DT.UI.02.050.040 | Sticky weekday strip | ✓ | ✓ | Scroll calendar | Global weekday strip (N-0030) | `@N-0030` |
| DT.UI.02.050.050 | Timeline nav exits calendar | ✓ | ✓ | In calendar mode, tap Timeline nav | Returns to rolling timeline; toggle still works | `@N-0031` |
| SB.EN.02.050.040 | Event right column on overlap | ✓ | ✓ | Overlap event with task | Event/calendar in right column; task left | `@N-0047` |

### 3.4 Google Calendar (N-0017)

| ID | Feature | WB | DT | Steps | Expected | Auto |
|----|---------|:--:|:--:|-------|----------|------|
| DT.UI.06.007.010 | Connect Google | ✓ | ✓ | Settings → Calendar → Connect | OAuth flow completes; “Connected” | `@N-0017` (mock) · **Manual: live OAuth** |
| DT.UI.06.007.020 | Calendar multi-select | ✓ | ✓ | Toggle calendars in list | Only selected calendars sync | Manual |
| DT.UI.06.007.030 | Show on timeline | ✓ | ✓ | Enable toggle; sync | Events appear as read-only blocks | `@N-0017` |
| DT.UI.06.007.040 | Sync now | ✓ | ✓ | Tap refresh | Last sync time updates; new events appear | Manual |
| DT.UI.02.036.010 | Calendar blocks on timeline | ✓ | ✓ | With synced events | Distinct styling; title matches Google | `timeline-calendar-events.spec.ts` |
| CX.EN.06.007.010 | OAuth proxy | — | — | Run `apps/oauth-proxy`; connect web | Token exchange; no secret in client | Manual |
| DT.BG.06.008.010 | Desktop OAuth loopback | — | ✓ | Connect from desktop settings | Browser opens; returns to app connected | Manual |

**Manual OAuth checklist (live):**

See [GOOGLE_OAUTH_ROLLOUT.md](../../Integrations/GOOGLE_OAUTH_ROLLOUT.md) for dev + retail deploy.

- [ ] Proxy running with valid `GOOGLE_CLIENT_ID` / `SECRET` (`curl /health` → `googleConfigured: true`)
- [ ] Web: `NEXT_PUBLIC_OAUTH_PROXY_URL` set (optional on localhost — defaults to :8787)
- [ ] Desktop: `VITE_OAUTH_PROXY_URL` set (optional on localhost)
- [ ] Connect → approve scopes → land on settings/profile connected
- [ ] Packaged desktop: `blocks://auth/callback` returns to app (N-0023)
- [ ] Disconnect clears tokens and calendar cache
- [ ] Token refresh after expiry (wait or shorten expiry in dev)
- [ ] Production: hosted proxy at `https://auth.blocks.app` (N-0023)

---

## 4 · Blocks / Quick Add (AA · 03)

| ID | Feature | WB | DT | Steps | Expected | Auto |
|----|---------|:--:|:--:|-------|----------|------|
| DT.UI.03.010.010 | Quick block grid | ✓ | ✓ | Open Blocks | Tiles with icons/durations | `blocks.spec.ts` |
| DT.UI.03.020.010 | Tap-to-create | ✓ | ✓ | Tap block (web) or picker (desktop) | Task created | `blocks.spec.ts` |
| DT.UI.03.020.020 | Reusable block task (N-0045) | ✓ | ✓ | First tap unconfigured block → save task → placement picker; second tap → picker only | Same linked task rescheduled; long-press opens editor | `@N-0045` · `blocks-reusable-task.spec.ts` |
| DT.UI.03.020.030 | Placement picker | ✓ | ✓ | Choose Now / After current / Next free / End of day / Custom | Single-focus push-back honored | `@N-0045` `@N-0021` |
| DT.UI.03.030.010 | Edit / reorder | ✓ | ✓ | Edit mode → reorder/delete | Order persists | `blocks.spec.ts` |
| DT.UI.03.040.010 | Stats bar | ✓ | ✓ | Log time via blocks | Today totals update | `blocks.spec.ts` |

---

## 5 · Task Edit (AA · 04)

| ID | Feature | WB | DT | Steps | Expected | Auto |
|----|---------|:--:|:--:|-------|----------|------|
| DT.UI.04.001.010 | Unified edit page | ✓ | ✓ | Create + edit task | Same form both flows | `task-edit.spec.ts` |
| DT.UI.04.005.010 | Event section placement | ✓ | ✓ | Open add/edit task | “Is event” toggle + time fields directly below Task Name | `@N-0046` |
| DT.UI.04.010.010 | Required fields | ✓ | ✓ | Submit empty name | Validation prevents save | `task-crud.spec.ts` |
| DT.UI.04.020.010 | Subtasks | ✓ | ✓ | Add/check subtasks | Progress reflected | `subtasks.spec.ts` |
| DT.UI.04.030.010 | Recurrence | ✓ | ✓ | Set weekly recurrence | Instances generate | `recurring.spec.ts` |
| DT.UI.04.040.010 | Tags | ✓ | ✓ | Add tags; search | Filter works | `search.spec.ts` |
| DT.UI.04.050.010 | Templates | ✓ | ✓ | Save/load template | Fields pre-filled | `templates.spec.ts` |
| DT.UI.04.090.010 | Delete task | ✓ | ✓ | Delete from edit | Removed everywhere | `task-crud.spec.ts` |

---

## 6 · AI / Search (AA · 05)

| ID | Feature | WB | DT | Steps | Expected | Auto |
|----|---------|:--:|:--:|-------|----------|------|
| DT.UI.05.010.010 | AI chat | ✓ | ✓ | Open Search; send message | Response or graceful error | `ai-chat.spec.ts` |
| DT.UI.05.020.010 | Tag filter | ✓ | ✓ | Filter by tag | Matching tasks only | `search.spec.ts` |
| DT.UI.05.030.010 | Apply AI schedule | ✓ | ✓ | Ask to schedule; apply suggestion | Tasks move to timeline | `ai-chat.spec.ts` |

---

## 7 · Settings (AA · 06)

### 7.1 Appearance & schedule

| ID | Feature | WB | DT | Steps | Expected | Auto |
|----|---------|:--:|:--:|-------|----------|------|
| DT.UI.06.001.* | Theme dark/light/system | ✓ | ✓ | Toggle each | UI updates; persists reload | `theme.spec.ts` |
| DT.UI.06.002.010 | Work hours | ✓ | ✓ | Change start/end | Saved in settings | `settings.spec.ts` |
| DT.UI.06.002.020 | Work days | ✓ | ✓ | Toggle days | Order matches week start | `settings.spec.ts` |
| DT.UI.06.002.030 | Week start Mon/Sun | ✓ | ✓ | Change week start | Week strip + work days reorder | `@N-0002` |
| DT.UI.06.002.040–060 | Timeline prefs | ✓ | ✓ | Snap delay, timer display, now offset | Timeline behavior matches | `@N-0007` `@N-0009` `@N-0014` |

### 7.2 Notifications & AI

| ID | Feature | WB | DT | Steps | Expected | Auto |
|----|---------|:--:|:--:|-------|----------|------|
| DT.UI.06.003.* | Notifications toggles | ✓ | ✓ | Toggle each | Saved (desktop may use localStorage) | `notifications.spec.ts` |
| DT.UI.06.004.* | AI settings | ✓ | ✓ | Enable AI; enter key | Persists | `settings.spec.ts` |

### 7.3 Data & sync

| ID | Feature | WB | DT | Steps | Expected | Auto |
|----|---------|:--:|:--:|-------|----------|------|
| DT.UI.06.005.010 | Export JSON | ✓ | ✓ | Export data | Valid JSON download | `export.spec.ts` |
| DT.UI.06.005.020 | Export CSV | ✓ | ✓ | Export CSV | Opens in spreadsheet | `export.spec.ts` |
| DT.UI.06.008.010 | P2P sync enable | ✓ | ✓ | Settings → Device Sync → Enable | Room controls appear | `@N-0018` |
| DT.UI.06.008.020 | Room ID | ✓ | ✓ | Generate New → Save | Same room after reload | `@N-0018` |
| DT.UI.06.008.030 | Copy room ID | ✓ | ✓ | Copy button | Clipboard has room id | Manual |

**Manual P2P sync (two devices):**

- [ ] Device A: enable sync, room `TESTROOM1`, Save
- [ ] Device B: same room id, Save
- [ ] Create task on A → appears on B within ~30s
- [ ] Edit on B → reflects on A
- [ ] Disconnect → no errors; local data intact
- [ ] Offline on one device → reconnect merges without duplicate IDs

### 7.4 About

| ID | Feature | WB | DT | Steps | Expected | Auto |
|----|---------|:--:|:--:|-------|----------|------|
| DT.UI.06.006.010 | Version | ✓ | ✓ | Settings → About | Shows `v26.07.02bX` (or current batch) | `settings.spec.ts` |
| DT.UI.06.006.020 | Check updates | — | ✓ | Check for updates | Updater UI or “latest” | Manual |

---

## 8 · Profile (AA · 07)

| ID | Feature | WB | DT | Steps | Expected | Auto |
|----|---------|:--:|:--:|-------|----------|------|
| DT.UI.07.010.010 | Identity | ✓ | ✓ | Open Profile | Name/email shown | `profile.spec.ts` |
| DT.UI.07.020.010 | Stats dashboard | ✓ | ✓ | Complete a task | Counts increment | `profile.spec.ts` |
| DT.UI.07.030.010 | Analytics | ✓ | ✓ | View charts/sections | Renders without error | `profile.spec.ts` |

---

## 9 · MCP server (MC)

| ID | Feature | Steps | Expected | Auto |
|----|---------|-------|----------|------|
| MC.EN.01.110.010 | list_timeline_tasks | Cursor MCP: invoke tool | JSON list of doing/scheduled | Manual |
| MC.EN.01.120.010 | add_to_timeline | Add task by id + time | Task scheduled | Manual |
| MC.EN.01.120.020 | remove_from_timeline | Remove by id | Task unscheduled | Manual |
| MC.EN.01.120.030 | clear_timeline | clear_timeline | Doing cleared per rules | Manual |
| MC.EN.01.130.010 | spawn_routine | spawn_routine with id | Routine tasks created | Manual |
| MC.EN.02.110.010 | export_tasks_to_anytype_markdown | Invoke export tool | Markdown with task headings | `@N-0019` |
| MC.EN.02.120.010 | Dexie export mode | Set `BLOCKS_MCP_MODE=export` + export path from desktop JSON | MCP reads/writes live export file | Manual |

**MCP manual setup:**

- [ ] Copy `.cursor/mcp.json.example` → `.cursor/mcp.json`
- [ ] Build: `pnpm --filter @blocks/mcp-server build`
- [ ] File mode: create task via MCP → verify in app after reload
- [ ] Export mode: export from app → point MCP at file → list tasks matches

---

## 10 · Desktop background (DT · BG)

| ID | Feature | Steps | Expected | Auto |
|----|---------|-------|----------|------|
| DT.BG.01.010.010 | Lifecycle | Quit/reopen app | State restored | Manual |
| DT.BG.01.020.010 | System tray | Minimize | Tray icon; restore window | Manual |
| DT.BG.01.030.* | NSIS upgrade/uninstall | Run installer over existing | No “cannot close” error (B-0001) | Installer QA |
| DT.BG.01.040.010 | Auto-updater | Check for updates | Download/install prompt | Manual |
| DT.BG.01.050.010 | Global shortcut | Ctrl+Shift+B | Window focus/toggle | Manual |
| DT.BG.01.060.010 | Midnight IPC timer | Leave app open overnight | Timeline reset at midnight | `timeline-reset.spec.ts` + Manual |

---

## 11 · CI / build (CX)

| ID | Feature | Steps | Expected | Auto |
|----|---------|-------|----------|------|
| CX.EN.09.010.010 | Win packaging | `pnpm build:win` | Artifact in `apps/desktop/release` | CI |
| CX.EN.09.020.010 | Branding check | `pnpm check:branding` | No deprecated names | CI |
| CX.EN.09.030.010 | Playwright gate | `pnpm verify` | Build + feature tests pass | CI |

---

## 12 · Incident regression (B-0003–B-0029)

Run after any timeline/settings/shell change:

| Incident | Verify manually |
|----------|-----------------|
| B-0003 | Theme toggle on web + desktop — no flash/wrong tokens |
| B-0004–B-0006 | Timeline scroll smooth; week strip sync |
| B-0007 | Floating timer not duplicated |
| B-0008 | Schedule FAB visible only when doing tasks unscheduled |
| B-0009 | Tracking header typography |
| B-0010 | Bottom actions icon-only magenta squares |
| B-0011 | Timeline card title readable |
| B-0012 | Remove X works without deleting task |
| B-0013 | Add-time menu opens upward; items clickable (desktop) |
| B-0019–B-0022 | Event editor hides block fields; GCal clock picker; drag snap + passive overlap |
| B-0027 | Timeline Add nav opens add-task flow |
| B-0028 | Shell “Now” task aligns with clock |
| B-0029 | Spacing/margins match web baseline; `#ff3366` accent; Kanban toolbar header; desktop shell parity |

**Automated incident suite:** `PLAYWRIGHT_GREP=@B- pnpm test:e2e`  
**B-0029 parity (optional):** `PLAYWRIGHT_PARITY=1 pnpm test:integration tests/visual/desktop-web-parity.spec.ts`

---

## 13 · Suggested QA session order

1. **Smoke (15 min):** Navigation → Kanban CRUD → Timeline scroll → Settings theme → About version  
2. **Shell parity (15 min):** Web vs desktop on Kanban/Timeline/Settings/Profile — `@B-0029`  
3. **Timeline + events (30 min):** N-0001–N-0008, N-0024–N-0027, N-0047 headed + manual scroll/snap  
4. **Kanban views (20 min):** N-0048 sort/order + N-0049 filter/saved views  
5. **Quick Blocks (15 min):** N-0045 reusable task + placement picker; N-0046 event section on forms  
6. **Integrations (45 min):** Google OAuth live (if enabled) → P2P two-tab sync → MCP export  
7. **Regression (20 min):** B-0003–B-0029 checklist  

---

## 14 · Sign-off template

```
Release: v26.07.02
Batch: v26.07.02b1
Tester:
Date:
Platforms tested: [ ] Web  [ ] Desktop Win  [ ] Android (partial)

Automation: pnpm verify → ___ passed / ___ failed
Manual blockers: ___
Ship recommendation: [ ] Go  [ ] No-go
```
