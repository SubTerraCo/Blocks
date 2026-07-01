# Blocks Feature Registry

> **Format:** `PP.PR.AA.SSS.FFF` (stable) · `PP.PR.AA.SSS.FFF-III` (incident)  
> **Lookup:** Ctrl+F `DT.UI.06.001.020` · `B-0003` · `🐛` · `#matrix`  
> **Incidents:** [INCIDENTS.md](./INCIDENTS.md) · **New work:** [ROADMAP.md](./ROADMAP.md)  
> **Manual QA:** [MANUAL_TEST_PLAN.md](./MANUAL_TEST_PLAN.md)  
> **Spec detail:** [ROADMAP.md](./ROADMAP.md) (core specs + N-#### roadmap)

---

## Matrix format {#matrix-format}

Aligned **`|`** columns — Feature width **32**, platform cells **10**.  

```bash
node scripts/generate-registry.mjs   # refresh cross-platform matrices
node scripts/polish-docs.mjs         # pad & sort all tables in 3 docs
```

---

## Key — Platform (`PP`)

| Code | Platform          | Notes                      |
| :--: | ----------------- | -------------------------- |
|  **AD**  | Android           | React Native / Expo        |
|  **AP**  | macOS             | Electron · planned         |
|  **CX**  | CI / build / docs | Workflows · scripts        |
|  **DT**  | Desktop           | Electron · Windows primary |
|  **IO**  | iOS               | planned                    |
|  **MC**  | MCP server        | `@blocks/mcp-server`       |
|  **SB**  | Shared backend    | `packages/core`            |
|  **SH**  | Shared UI         | `packages/ui`              |
|  **WB**  | Web / PWA         | Next.js                    |

---

## Key — Prefix (`PR`)

| Code | Layer                              |
| :--: | ---------------------------------- |
|  **BG**  | Background (main, tray, installer) |
|  **EN**  | Engines & storage                  |
|  **UI**  | User-facing screens                |

---

## Key — Area (`AA`)

| Code | Area           | Spec                                |
| :--: | -------------- | ----------------------------------- |
|  **00**  | App shell      | Top bar · nav · routing · shortcuts |
|  **01**  | Kanban         | §1                                  |
|  **02**  | Timeline       | §2                                  |
|  **03**  | Blocks         | §3 Quick Add                        |
|  **04**  | Task Edit      | §4 Unified edit                     |
|  **05**  | AI / Search    | §5                                  |
|  **06**  | Settings       | §6                                  |
|  **07**  | Profile        | §7                                  |
|  **08**  | Shared systems | Theme · tokens                      |
|  **09**  | Infra          | Build · CI                          |

---

## Health legend

| Symbol | Meaning               |
| :----: | --------------------- |
|   ✅    | OK                    |
|   🐛   | Broken                |
|   🔄   | In progress / partial |
|   📋   | Not built             |
|   🧪   | Needs test            |
|   —    | N/A                   |

---

## Index of matrices {#matrix}

| Matrix                     | Anchor                      |
| -------------------------- | --------------------------- |
| Core pages (00–07)         | [#matrix-core-pages](#matrix-core-pages) |
| Phase 2 (19 features)      | [#matrix-phase2](#matrix-phase2) |
| Timeline v0.0.3            | [#matrix-timeline-v03](#matrix-timeline-v03) |
| Settings › Appearance      | [#matrix-settings-appearance](#matrix-settings-appearance) |
| MCP tools                  | [#matrix-mcp](#matrix-mcp)  |
| Desktop background / build | [#matrix-dt-bg](#matrix-dt-bg) |

---

## Cross-platform matrix — Core pages {#matrix-core-pages}

```text
|            Feature             |    DT    |    WB    |    AD    |
|--------------------------------|----------|----------|----------|
|          00 App shell          |    ✅     |    ✅     |    🔄    |
|           01 Kanban            |    ✅     |    ✅     |    🔄    |
|          02 Timeline           |    ✅     |    ✅     |    🔄    |
|      03 Blocks quick-add       |    ✅     |    ✅     |    🔄    |
|     04 Task Edit (unified)     |    ✅     |    ✅     |    🔄    |
|         05 AI / Search         |    ✅     |    ✅     |    📋    |
|          06 Settings           |    🐛    |    🐛    |    🔄    |
|       07 Profile + stats       |    ✅     |    ✅     |    📋    |
```

---

## Cross-platform matrix — Phase 2 features (19) {#matrix-phase2}

Migrated from spec § Phase 2 Required Features.

```text
|            Feature             |    DT    |    WB    |    AD    |    SH    |    SB    |
|--------------------------------|----------|----------|----------|----------|----------|
|      Active time tracking      |    ✅     |    ✅     |    📋    |    —     |    ✅     |
|       AI Task Scheduler        |    ✅     |    ✅     |    📋    |    —     |    ✅     |
|       Android mobile app       |    —     |    —     |    🔄    |    —     |    —     |
|    Blocks placement picker     |    ✅     |    ✅     |    🔄    |    —     |    —     |
|          Bulk actions          |    ✅     |    ✅     |    📋    |    —     |    —     |
|      Data export JSON/CSV      |    ✅     |    ✅     |    📋    |    —     |    —     |
|       Full Settings page       |    🐛    |    🐛    |    🔄    |    —     |    —     |
|        Kanban drag-drop        |    ✅     |    ✅     |    🔄    |    —     |    —     |
|       Keyboard shortcuts       |    ✅     |    ✅     |    📋    |    ✅     |    —     |
|         Notifications          |    ✅     |    ✅     |    📋    |    —     |    ✅     |
|            P2P Sync            |    ✅     |    ✅     |    📋    |    —     |    ✅     |
|        Profile + stats         |    ✅     |    ✅     |    📋    |    —     |    —     |
|        Recurring tasks         |    ✅     |    ✅     |    📋    |    —     |    ✅     |
|        Subtask progress        |    ✅     |    ✅     |    📋    |    —     |    —     |
|      Tag filter / search       |    ✅     |    ✅     |    📋    |    —     |    —     |
|         Task templates         |    ✅     |    ✅     |    📋    |    —     |    —     |
|          Theme toggle          |    🐛    |    🐛    |    ✅     |    🐛    |    —     |
|    Timeline drag-reschedule    |    ✅     |    ✅     |    📋    |    —     |    ✅     |
|       Unified Task Edit        |    ✅     |    ✅     |    🔄    |    —     |    —     |
```

---

## Cross-platform matrix — Timeline v0.0.3 {#matrix-timeline-v03}

```text
|            Feature             |    DT    |    WB    |    SH    |    SB    |
|--------------------------------|----------|----------|----------|----------|
|   Doing-only visibility rule   |    ✅     |    ✅     |    ✅     |    ✅     |
|      Grouped routines UI       |    ✅     |    —     |    —     |    ✅     |
|    Midnight timeline clear     |    ✅     |    ✅     |    ✅     |    ✅     |
|    Remove from timeline (X)    |    ✅     |    ✅     |    ✅     |    ✅     |
|   Rolling timeline (±7 days)  |    ✅     |    ✅     |    ✅     |    ✅     |
|   Week strip + scroll sync    |    ✅     |    ✅     |    ✅     |    —     |
|   Due-date calendar view      |    ✅     |    ✅     |    —     |    —     |
|   Google Calendar events      |    🔄     |    🔄     |    —     |    ✅     |
```

---

## Cross-platform matrix — Settings › Appearance {#matrix-settings-appearance}

```text
|            Feature             |    DT    |    WB    |    AD    |    SH    |
|--------------------------------|----------|----------|----------|----------|
|           Dark theme           |    ✅     |    ✅     |    ✅     |    —     |
|          Light theme           |    ✅     |    ✅     |    ✅     |    —     |
|          System theme          |    ✅     |    ✅     |    ✅     |    —     |
|   Theme engine (shared root)   |    —     |    —     |    —     |    ✅     |
```

---

## Cross-platform matrix — MCP tools {#matrix-mcp}

```text
|            Feature             |    MC    |    DT    |    WB    |
|--------------------------------|----------|----------|----------|
|     add / remove timeline      |    ✅     |    ✅     |    ✅     |
|         clear_timeline         |    ✅     |    ✅     |    ✅     |
|      list_timeline_tasks       |    ✅     |    ✅     |    ✅     |
|         spawn_routine          |    ✅     |    ✅     |    —     |
|  export_tasks_to_anytype_md    |    ✅     |    —     |    —     |
```

---

## Cross-platform matrix — Desktop background / build {#matrix-dt-bg}

```text
|            Feature             |    DT    |    CX    |
|--------------------------------|----------|----------|
|    NSIS upgrade / uninstall    | ✅ B-0001 |    —     |
|      Win build packaging       |    —     | ✅ B-0002 |
```

---

## AA · 00 App shell {#aa-00}

> **Codes:** `*.UI.00.*` · Spec § Navigation Layout

| Code             | Feature                          | Health | Playwright         |
| ---------------- | -------------------------------- | :----: | ------------------ |
| DT.UI.00.001.010 | Top bar (menu · title · profile) |   ✅    | `navigation.spec.ts` |
| DT.UI.00.002.010 | Bottom navigation bar            |   ✅    | `navigation.spec.ts` |
| DT.UI.00.003.010 | Page routing                     |   ✅    | `navigation.spec.ts` |
| DT.UI.00.004.010 | Keyboard shortcuts               |   ✅    | `keyboard.spec.ts` |
| DT.UI.00.020.020 | Bottom action row + Kanban pad   |   🔄    | N-0012 · `bottom-action-kanban-clearance.spec.ts` |
| SH.UI.00.004.010 | useKeyboardShortcuts hook        |   ✅    | `keyboard.spec.ts` |

---

## AA · 01 Kanban {#aa-01}

> **Codes:** `*.UI.01.*` · Spec §1 Kanban Page

| Code             | Feature                | Health | Playwright           |
| ---------------- | ---------------------- | :----: | -------------------- |
| DT.UI.01.010.010 | Column drag-and-drop   |   ✅    | `kanban.spec.ts`     |
| DT.UI.01.011.010 | Six status columns     |   ✅    | `kanban.spec.ts`     |
| DT.UI.01.012.010 | Task card display      |   ✅    | `task-card.spec.ts`  |
| DT.UI.01.013.010 | Per-column quick add   |   ✅    | `kanban.spec.ts`     |
| DT.UI.01.040.010 | Bulk actions           |   ✅    | `bulk-actions.spec.ts` |
| DT.UI.01.020.010 | Kanban sort (field + dir) |  🔄  | N-0048 · `kanban-sort.spec.ts` |
| DT.UI.01.020.020 | Manual drag order (kanbanOrder) | 🔄 | N-0048 · `kanban-sort.spec.ts` |
| DT.UI.01.020.030 | Per-column refresh sort |   🔄    | N-0048 · `kanban-sort.spec.ts` |
| DT.UI.01.030.010 | Kanban property filters | 🔄 | N-0049 · `kanban-filter.spec.ts` |
| DT.UI.01.030.020 | Named saved views + Default | 🔄 | N-0049 · `kanban-filter.spec.ts` |
| WB.UI.01.010.010 | Kanban drag-drop (web) |   ✅    | `kanban.spec.ts`     |
| WB.UI.01.020.010 | Kanban sort + manual order (web) | 🔄 | N-0048 · `kanban-sort.spec.ts` |
| WB.UI.01.030.010 | Kanban filter + views (web) | 🔄 | N-0049 · `kanban-filter.spec.ts` |
| SB.EN.01.020.010 | buildKanbanBoard sort/filter core | 🔄 | N-0048 · N-0049 · `kanban-sort-filter.spec.ts` |
| SB.EN.01.030.010 | KanbanView persistence (Dexie)   | 🔄 | N-0049 · `kanban-views-store.spec.ts` |

---

## AA · 02 Timeline {#aa-02}

> **Codes:** `*.UI.02.*` · Spec §2 Timeline Page

| Code             | Feature                          | Health | Playwright                   |
| ---------------- | -------------------------------- | :----: | ---------------------------- |
| DT.UI.02.010.010 | 24-hour time display             |   ✅    | `timeline.spec.ts`           |
| DT.UI.02.010.020 | Week strip (7-day header)        |   ✅    | N-0001 · `timeline-week-strip.spec.ts` |
| DT.UI.02.010.030 | Scroll-sync week strip           |   ✅    | N-0004 · `timeline-scroll-day-sync.spec.ts` |
| DT.UI.02.020.010 | Drag-to-reschedule               |   ✅    | `timeline-drag.spec.ts`      |
| DT.UI.02.030.010 | Doing-only visibility rule       |   ✅    | `timeline-status.spec.ts`    |
| DT.UI.02.031.010 | Remove from timeline (X)         |   ✅    | B-0012 · -003 · `timeline-card-actions.spec.ts` |
| DT.UI.02.031.020 | Timeline card task title         |   ✅    | B-0011 · -002 · `timeline-card-typography.spec.ts` |
| DT.UI.02.032.010 | Midnight timeline clear          |   ✅    | `timeline-reset.spec.ts`     |
| DT.UI.02.033.010 | Grouped routines (RoutineGroups) |   ✅    | `blocks-functionality.spec.ts` |
| DT.UI.02.034.010 | Active task / timer display      |   ✅    | B-0007 · -002 · `timeline-card-actions.spec.ts` |
| DT.UI.02.034.020 | Auto-tracking + pause-sync       |   🧪   | N-0008 · B-0014 in progress  |
| DT.UI.02.035.010 | Schedule doing tasks button      |   ✅    | B-0008 · -001 · `timeline-schedule-fab.spec.ts` |
| DT.UI.02.035.020 | Lock current on Schedule Task    |   🔄    | N-0025 · `schedule-doing.spec.ts` |
| DT.UI.02.037.010 | User events on timeline          |   🔄    | N-0026 |
| DT.UI.02.037.020 | Events → right column on conflict |   🔄    | N-0047 · `timeline-scheduling.spec.ts` |
| SB.EN.02.037.020 | Overlap column rank (events right) | 🔄 | N-0047 · `timeline-scheduling.spec.ts` |
| DT.UI.02.040.070 | Pause snap during drag           |   🔄    | N-0024 |
| DT.UI.02.050.020 | Continuous scroll calendar       |   🔄    | N-0027 (replaces N-0005) |
| DT.UI.02.036.010 | Google Calendar timeline events  |   🔄    | N-0017 · `timeline-calendar-events.spec.ts` |
| DT.UI.02.040.010 | Rolling timeline window (±7 days)|   🔄    | N-0003 · B-0018 · `rolling-timeline.spec.ts` |
| DT.UI.02.040.050 | Timeline entry snap to now       |   🐛    | N-0006 · B-0016 · `timeline-entry-snap.spec.ts` |
| WB.UI.02.040.050 | Timeline entry snap to now (web) |   🐛    | N-0006 · B-0016 · `timeline-entry-snap.spec.ts` |
| DT.UI.02.040.060 | Live scroll lock + snap delay    |   ✅    | N-0007 · `timeline-snap-delay.spec.ts` |
| DT.UI.02.050.010 | Due-date calendar view           |   ✅    | N-0005 · `timeline-calendar-view.spec.ts` |
| DT.UI.00.010.040 | App tracking chrome              |   🔄    | N-0010 · `tracking-chrome.spec.ts` |
| DT.UI.00.020.030 | Tracking player row              |   🔄    | N-0013 · `tracking-player-row.spec.ts` |
| DT.UI.00.020.040 | Add-time stretch menu            |   🔄    | N-0016 · `tracking-add-time-menu.spec.ts` |
| SH.UI.02.040.030 | Timeline bottom action buttons   |   ✅    | B-0010 · N-0015 · `timeline-bottom-actions.spec.ts` |
| SH.EN.02.070.010 | Dexie↔Yjs P2P sync bridge        |   🔄    | N-0018 · `dexie-yjs-bridge.spec.ts` |
| SB.EN.02.036.010 | Calendar sync + merge helpers    |   🔄    | N-0017 · `calendar-merge.spec.ts` |
| SB.EN.02.040.010 | Rolling timeline engine          |   ✅    | N-0003 · `rolling-timeline.spec.ts` |
| SB.EN.02.040.070 | Now-bar viewport offset          |   🔄    | N-0014 · B-0018 · `timeline-now-bar-offset.spec.ts` |
| SB.EN.02.030.010 | Timeline service (core)          |   ✅    | `timeline-status.spec.ts`    |
| SB.EN.02.032.010 | clearTimelineForNewDay           |   ✅    | `timeline-reset.spec.ts`     |
| SB.EN.02.033.010 | Routine engine                   |   ✅    | integration                  |

---

## AA · 03 Blocks (Quick Add) {#aa-03}

> **Codes:** `*.UI.03.*` · Spec §3 Blocks Page

| Code             | Feature                          | Health | Playwright     |
| ---------------- | -------------------------------- | :----: | -------------- |
| DT.UI.03.010.010 | Quick block grid                 |   ✅    | `blocks.spec.ts` |
| DT.UI.03.020.010 | Tap-to-create + placement picker |   ✅    | `blocks.spec.ts` |
| DT.UI.03.020.020 | Schedule immediately (web tap)   |   ↪️    | N-0011 superseded by N-0045 |
| DT.UI.03.020.030 | Block ↔ single reusable task     |   🔄    | N-0045 · `blocks-reusable-task.spec.ts` |
| DT.UI.03.020.040 | First-use editor → placement     |   🔄    | N-0045 · `blocks-reusable-task.spec.ts` |
| DT.UI.03.020.050 | Long-press edit linked task      |   🔄    | N-0045 · `blocks-reusable-task.spec.ts` |
| DT.UI.03.030.010 | Edit / reorder blocks            |   ✅    | `blocks.spec.ts` |
| DT.UI.03.040.010 | Stats bar (duration totals)      |   ✅    | `blocks.spec.ts` |
| SH.UI.03.020.030 | PlacementPickerModal (shared)    |   🔄    | N-0045 · `blocks-reusable-task.spec.ts` |

---

## AA · 04 Task Edit (Unified) {#aa-04}

> **Codes:** `*.UI.04.*` · Spec §4 Task Edit Page

| Code             | Feature                          | Health | Playwright        |
| ---------------- | -------------------------------- | :----: | ----------------- |
| DT.UI.04.001.010 | Unified create/edit page         |   ✅    | `task-edit.spec.ts` |
| DT.UI.04.002.010 | Event section below Task Name     |   🔄    | N-0046 · `task-event-section.spec.ts` |
| WB.UI.04.002.010 | Event section below Task Name (web) | 🔄  | N-0046 · `task-event-section.spec.ts` |
| DT.UI.04.010.010 | Required fields (name, duration) |   ✅    | `task-crud.spec.ts` |
| DT.UI.04.020.010 | Subtasks (SubtaskEditor)         |   ✅    | `subtasks.spec.ts` |
| DT.UI.04.030.010 | Recurrence selector              |   ✅    | `recurring.spec.ts` |
| DT.UI.04.040.010 | Tags (TagInput)                  |   ✅    | `search.spec.ts`  |
| DT.UI.04.050.010 | Task templates                   |   ✅    | `templates.spec.ts` |
| DT.UI.04.090.010 | Delete task                      |   ✅    | `task-crud.spec.ts` |
| SB.EN.04.030.010 | Recurring task engine            |   ✅    | `recurring.spec.ts` |

---

## AA · 05 AI / Search {#aa-05}

> **Codes:** `*.UI.05.*` · Spec §5 AI/Search Page

| Code             | Feature                         | Health | Playwright      |
| ---------------- | ------------------------------- | :----: | --------------- |
| DT.UI.05.010.010 | AI chat interface               |   ✅    | `ai-chat.spec.ts` |
| DT.UI.05.020.010 | Task search / tag filter        |   ✅    | `search.spec.ts` |
| DT.UI.05.030.010 | Apply AI scheduling suggestions |   ✅    | `ai-chat.spec.ts` |
| SB.EN.05.010.010 | Gemini AI service (core)        |   ✅    | integration     |

---

## AA · 06 Settings {#aa-06}

> **Codes:** `*.UI.06.*` · Spec §6 Settings · Matrix [#matrix-settings-appearance](#matrix-settings-appearance)

### DT.UI.06.001 · Appearance {#dt-ui-06-001}

| Code             | Feature      | Health | Last incident | Playwright    |
| ---------------- | ------------ | :----: | ------------- | ------------- |
| DT.UI.06.001.010 | Dark theme   |   ✅    | —             | `theme.spec.ts` |
| DT.UI.06.001.020 | Light theme  |   ✅    | B-0003 · -001 | `theme.spec.ts` |
| DT.UI.06.001.030 | System theme |   ✅    | B-0003 · -001 | `theme.spec.ts` |

### DT.UI.06.002 · Work schedule {#dt-ui-06-002}

| Code             | Feature               | Health | Playwright       |
| ---------------- | --------------------- | :----: | ---------------- |
| DT.UI.06.002.010 | Work start / end time |   ✅    | `settings.spec.ts` |
| DT.UI.06.002.020 | Work days selector    |   ✅    | `settings.spec.ts` |
| DT.UI.06.002.030 | Week start preference |   ✅    | N-0002 · `week-start-settings.spec.ts` |
| DT.UI.06.002.040 | Timeline snap delay   |   ✅    | N-0007 · `timeline-snap-delay.spec.ts` |
| DT.UI.06.002.050 | Timeline timer display|   ✅    | N-0009 · `timeline-timer-display-setting.spec.ts` |
| DT.UI.06.002.060 | Now-bar viewport offset | ✅  | N-0014 · `timeline-now-bar-offset.spec.ts` |
| DT.UI.06.002.070 | Task Schedule Behavior  | 🔄  | N-0025 · `schedule-doing.spec.ts` |

### DT.UI.06.003 · Notifications {#dt-ui-06-003}

| Code             | Feature              | Health | Playwright            |
| ---------------- | -------------------- | :----: | --------------------- |
| DT.UI.06.003.010 | Enable notifications |   ✅    | `notifications.spec.ts` |
| DT.UI.06.003.020 | Task reminders       |   ✅    | `notifications.spec.ts` |
| DT.UI.06.003.030 | Timer alerts         |   ✅    | `notifications.spec.ts` |
| DT.UI.06.003.040 | Daily summary        |   ✅    | `notifications.spec.ts` |

### DT.UI.06.004 · AI assistant {#dt-ui-06-004}

| Code             | Feature            | Health | Playwright       |
| ---------------- | ------------------ | :----: | ---------------- |
| DT.UI.06.004.010 | AI enable toggle   |   ✅    | `settings.spec.ts` |
| DT.UI.06.004.020 | Provider & API key |   ✅    | `settings.spec.ts` |

### DT.UI.06.005 · Data {#dt-ui-06-005}

| Code             | Feature             | Health | Playwright     |
| ---------------- | ------------------- | :----: | -------------- |
| DT.UI.06.005.010 | Export JSON         |   ✅    | `export.spec.ts` |
| DT.UI.06.005.020 | Export CSV          |   ✅    | `export.spec.ts` |
| DT.UI.06.005.030 | Sync status display |   ✅    | `sync.spec.ts` · `sync-settings-panel.spec.ts` |

### DT.UI.06.007 · Google Calendar {#dt-ui-06-007}

| Code             | Feature                    | Health | Playwright                          |
| ---------------- | -------------------------- | :----: | ----------------------------------- |
| DT.UI.06.007.010 | Connect / disconnect Google|   🐛    | B-0017 · `google-calendar-settings.spec.ts` |
| DT.UI.06.007.020 | Calendar multi-select      |   🔄    | N-0017 · component test             |
| DT.UI.06.007.030 | Show on timeline toggle    |   🔄    | N-0017 · `google-calendar-settings.spec.ts` |
| DT.UI.06.007.040 | Manual sync now            |   🔄    | N-0017 · component test             |
| SB.EN.06.007.010 | Google OAuth token refresh |   🔄    | manual · oauth-proxy                |
| SB.EN.06.007.020 | Calendar events Dexie cache|   🔄    | N-0017 · `timeline-calendar-events.spec.ts` |

### DT.UI.06.008 · P2P device sync {#dt-ui-06-008}

| Code             | Feature              | Health | Playwright                    |
| ---------------- | -------------------- | :----: | ----------------------------- |
| DT.UI.06.008.010 | Enable P2P sync      |   🔄    | N-0018 · `sync-settings-panel.spec.ts` |
| DT.UI.06.008.020 | Room ID generate/save|   🔄    | N-0018 · `sync-settings-panel.spec.ts` |
| DT.UI.06.008.030 | Copy room ID         |   🔄    | manual QA                     |
| DT.BG.06.008.010 | Desktop Google OAuth IPC | 🐛 | B-0017 · `oauth-proxy-health.spec.ts` |
| CX.EN.06.007.010 | OAuth proxy (PKCE)   |   🐛    | B-0017 · `oauth-proxy-health.spec.ts`   |

### DT.UI.06.006 · About {#dt-ui-06-006}

| Code             | Feature           | Health | Playwright       |
| ---------------- | ----------------- | :----: | ---------------- |
| DT.UI.06.006.010 | Version display   |   ✅    | `settings.spec.ts` |
| DT.UI.06.006.020 | Check for updates |   ✅    | manual           |

### WB.UI.06 · Settings (web) {#wb-ui-06}

| Code             | Feature      | Health | Last incident | Playwright    |
| ---------------- | ------------ | :----: | ------------- | ------------- |
| WB.UI.06.001.010 | Dark theme   |   ✅    | —             | `theme.spec.ts` |
| WB.UI.06.001.020 | Light theme  |   ✅    | B-0003 · -001 | `theme.spec.ts` |
| WB.UI.06.001.030 | System theme |   ✅    | B-0003 · -001 | `theme.spec.ts` |

---

## AA · 07 Profile {#aa-07}

> **Codes:** `*.UI.07.*` · Spec §7 Profile Page

| Code             | Feature                | Health | Playwright      |
| ---------------- | ---------------------- | :----: | --------------- |
| DT.UI.07.010.010 | User identity display  |   ✅    | `profile.spec.ts` |
| DT.UI.07.020.010 | Stats dashboard        |   ✅    | `profile.spec.ts` |
| DT.UI.07.030.010 | Productivity analytics |   ✅    | `profile.spec.ts` |
| DT.UI.07.040.010 | Profile Google connect |   🐛    | B-0017 · `profile-google-auth.spec.ts` |
| WB.UI.07.040.010 | Profile Google connect (web) | 🔄 | N-0022 · `profile-google-auth.spec.ts` |
| SH.UI.07.040.010 | ProfileGoogleAccount   |   🔄    | N-0022 · `profile-google-auth.spec.ts` |

---

## SH · Shared UI {#sh}

### SH.UI.08 · Shared systems {#sh-ui-08}

| Code             | Feature                 | Health | Last incident | Playwright    |
| ---------------- | ----------------------- | :----: | ------------- | ------------- |
| SH.UI.08.001.000 | Theme provider & tokens |   ✅    | B-0003 · -001 | `theme.spec.ts` |
| SH.UI.08.001.010 | CSS variables / globals |   ✅    | B-0003 · -001 | integration   |

---

## SB · Shared backend {#sb}

| Code             | Feature                     | Health | Playwright            |
| ---------------- | --------------------------- | :----: | --------------------- |
| SB.EN.08.010.010 | Dexie storage (v4 calendar) |   🔄    | `storage.spec.ts`     |
| SB.EN.08.020.010 | Task engine                 |   ✅    | integration           |
| SB.EN.08.040.010 | P2P sync (Yjs/WebRTC)       |   🔄    | N-0018 · `sync.spec.ts` · `dexie-yjs-bridge.spec.ts` |
| SB.EN.08.050.010 | Notification engine         |   ✅    | `notifications.spec.ts` |

---

## MC · MCP server {#mc}

| Code             | Feature               | Health | Playwright   |
| ---------------- | --------------------- | :----: | ------------ |
| MC.EN.01.110.010 | list_timeline_tasks   |   ✅    | manual / MCP |
| MC.EN.01.120.010 | add_to_timeline       |   ✅    | manual / MCP |
| MC.EN.01.120.020 | remove_from_timeline  |   ✅    | manual / MCP |
| MC.EN.01.120.030 | clear_timeline        |   ✅    | manual / MCP |
| MC.EN.01.130.010 | spawn_routine         |   ✅    | manual / MCP |
| MC.EN.02.100.010 | File-backed MCP store |   ✅    | manual       |
| MC.EN.02.110.010 | export_tasks_to_anytype_markdown | 🔄 | N-0019 · `mcp-export-store.spec.ts` |
| MC.EN.02.120.010 | Dexie export mode     |   🔄    | N-0019 · manual / MCP config |

---

## DT · Desktop background {#dt-bg}

| Code             | Feature                      | Health | Last incident | Playwright             |
| ---------------- | ---------------------------- | :----: | ------------- | ---------------------- |
| DT.BG.01.010.010 | Main process lifecycle       |   ✅    | —             | manual                 |
| DT.BG.01.020.010 | System tray                  |   ✅    | —             | manual                 |
| DT.BG.01.030.010 | NSIS force-close upgrade     |   ✅    | B-0001 · -001 | installer QA           |
| DT.BG.01.030.020 | NSIS force-close uninstall   |   ✅    | B-0001 · -001 | installer QA           |
| DT.BG.01.040.010 | Auto-updater                 |   ✅    | —             | manual                 |
| DT.BG.01.050.010 | Global shortcut Ctrl+Shift+B |   ✅    | —             | manual                 |
| DT.BG.01.060.010 | Midnight timeline IPC timer  |   ✅    | —             | `timeline-reset.spec.ts` |

---

## CX · CI / build {#cx}

| Code             | Feature                  | Health | Last incident | Playwright |
| ---------------- | ------------------------ | :----: | ------------- | ---------- |
| CX.EN.09.010.010 | pnpm build:win packaging |   ✅    | B-0002 · -001 | CI         |
| CX.EN.09.020.010 | Branding check script    |   ✅    | —             | CI         |
| CX.EN.09.030.010 | Playwright E2E gate      |   ✅    | —             | CI         |

---

## Adding a row

1. Stable code = `PP.PR.AA.SSS.FFF` (no `-III` in table).
2. On break: `-III` suffix + **B-####** in Last incident; update section matrix.
3. Regenerate: `node scripts/generate-registry.mjs && node scripts/polish-docs.mjs`
4. Playwright tags: `@core` + `@B-####` or `@N-####`.
