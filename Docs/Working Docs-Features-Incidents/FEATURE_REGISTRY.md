# Blocks Feature Registry

> **Format:** `PP.PR.AA.SSS.FFF` (stable) · `PP.PR.AA.SSS.FFF-III` (incident)  
> **Lookup:** Ctrl+F `DT.UI.06.001.020` · `B-0003` · `🐛` · `#matrix`  
> **Incidents:** [INCIDENTS.md](./INCIDENTS.md) · **Active roadmap:** [ROADMAP.md](./ROADMAP.md) (N-#### · sprints · batch log)  
> **Manual QA:** [MANUAL_TEST_PLAN.md](./MANUAL_TEST_PLAN.md)  
> **Merged:** 2026-07-02 — former [Core Functionality v0.0.3](../BLOCKS_CORE_FUNCTIONALITY%20v0.0.3%20(Deprecated).md) · [Phase 2 Build Plan](../PHASE_2_BUILD_PLAN%20(Deprecated).md) (v0.0.2 content included via v0.0.3 superset)

---

## Table of Contents

### Core specification

1. [Development priority order](#development-priority-order)
2. [Platform support matrix](#platform-support-matrix)
3. [Navigation layout](#navigation-layout)
4. [Page specifications §1–7](#page-specifications)
5. [Core data models](#core-data-models)
6. [Phase 2 required features (19)](#phase-2-required-features)
7. [Phase 2 build plan (sprints 0–10)](#phase-2-sprints)
8. [Playwright test requirements](#playwright-test-requirements)
9. [Release checklist](#release-checklist)
10. [Historical archive](#v003-bug-fixes--changes)

### Feature code registry

11. [Matrix format & keys](#matrix-format)
12. [Cross-platform matrices](#index-of-matrices)
13. [Feature code tables — AA 00–07, SH, SB, MC, DT, CX](#aa-00)

---

# Core specification

> Page UX, data models, Phase 2 baseline. **Live sprint / N-#### work** → [ROADMAP.md](./ROADMAP.md).

## Development Priority Order

All features are developed and tested in this order:

```
┌─────────────────────────────────────────────────────────────┐
│  1. WIN11 DESKTOP APP (Primary Template)                    │
│     • All features implemented here FIRST                   │
│     • Playwright tests written against desktop              │
│     • Design language established here                      │
├─────────────────────────────────────────────────────────────┤
│  2. ANDROID APP (Secondary)                                 │
│     • Match desktop functionality exactly                   │
│     • Adjust for mobile screen dimensions                   │
│     • Same UI components, responsive layout                 │
├─────────────────────────────────────────────────────────────┤
│  3. PWA WEB APP (Tertiary)                                  │
│     • Direct mirror of desktop app                          │
│     • Same features, same design                            │
│     • Progressive enhancement for mobile browsers           │
└─────────────────────────────────────────────────────────────┘
```

**Change Flow:** Desktop → Android → PWA (never the reverse)

---

## Platform Support Matrix

| Platform | Status | Priority | Notes |
|----------|--------|----------|-------|
| Windows 11 Desktop | ✅ Active | P1 | Primary development target |
| Android Mobile | 🔄 Phase 2 | P2 | React Native/Expo |
| PWA Web App | ✅ Active | P3 | Mirror of desktop |
| macOS Desktop | 📋 Phase 3 | P4 | Electron build |
| iOS Mobile | 📋 Phase 3 | P5 | Requires Mac for dev |
| Linux Desktop | 📋 Phase 3 | P6 | AppImage/deb |

**Legend:** ✅ Active | 🔄 In Progress | 📋 Planned | ❌ Not Planned

---

## Navigation Layout

### Bottom Navigation Bar

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  [AI/Search]     [Kanban] [Timeline] [Blocks]     [+ Add]   │
│     48x48          22px     22px      22px         48x48    │
│                                                              │
│  ←─ Left ─→      ←────── Centered ──────→       ←─ Right ─→ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Specifications

| Element | Size | Style | Behavior |
|---------|------|-------|----------|
| AI/Search Button | 48x48px | Secondary (gray bg) | Opens AI/Search page |
| Main Nav Icons | 22px | Text + icon, magenta when active | Navigate to page |
| Add Button | 48x48px | Primary (magenta bg) | Opens Task Edit (create mode) |

### Safe Areas
- Bottom padding: `env(safe-area-inset-bottom)` for mobile
- Nav height: 64px (h-16)

---

## Page Specifications

### 1. Kanban Page

**Purpose:** Visual task organization across status columns with drag-and-drop

#### Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│ ← Horizontal Scroll →                                                  │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ │ BACKLOG  │ │ DESIGN   │ │ TO DO    │ │ DOING    │ │ REVIEW   │ │ DONE     │
│ │ (Blue)   │ │ (Purple) │ │ (Pink)   │ │ (Orange) │ │ (Yellow) │ │ (Green)  │
│ │ #3B82F6  │ │ #A855F7  │ │ #EC4899  │ │ #F97316  │ │ #EAB308  │ │ #22C55E  │
│ ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤
│ │          │ │          │ │          │ │          │ │          │ │          │
│ │ Task     │ │ Task     │ │ Task     │ │ Task     │ │ Task     │ │ Task     │
│ │ Cards    │ │ Cards    │ │ Cards    │ │ Cards    │ │ Cards    │ │ Cards    │
│ │ ↕ Scroll │ │ ↕ Scroll │ │ ↕ Scroll │ │ ↕ Scroll │ │ ↕ Scroll │ │ ↕ Scroll │
│ │          │ │          │ │          │ │          │ │          │ │          │
│ ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤
│ │[+ Add]   │ │[+ Add]   │ │[+ Add]   │ │[+ Add]   │ │[+ Add]   │ │[+ Add]   │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
└────────────────────────────────────────────────────────────────────────┘
```

#### Columns (6 total)

| Column | Status ID | Color | Purpose |
|--------|-----------|-------|---------|
| Backlog | `backlog` | #3B82F6 (Blue) | Ideas, someday/maybe |
| Design | `design` | #A855F7 (Purple) | Planning, research |
| To Do | `todo` | #EC4899 (Pink) | Ready to start |
| Doing | `doing` | #F97316 (Orange) | In progress, active |
| Review | `review` | #EAB308 (Yellow) | Needs review/check |
| Done | `done` | #22C55E (Green) | Completed |

#### User Interactions

| Action | Behavior |
|--------|----------|
| Drag task card | Move between columns, updates task status |
| Drop on column | Changes `task.status` to column ID |
| Drop on "Done" | Sets `task.completedAt = new Date()` |
| Drop from "Done" | Clears `task.completedAt` |
| Tap task card | Opens Task Edit page |
| Tap "+ Add" button | Opens Task Edit page with status pre-filled |
| Horizontal scroll | Navigate between columns |
| Vertical scroll (in column) | Scroll through tasks in that column |

#### Task Card Display

- Task name (primary text)
- Priority indicator (1-5, color coded)
- Duration badge (e.g., "30m", "1h")
- Tags (first 2-3 visible)
- Access context icons (home, computer, etc.)
- Checkbox for quick complete

#### Drag-and-Drop Requirements

- **Activation:** 8px movement before drag starts (prevents accidental drags)
- **Visual feedback:** 
  - Dragged card: 50% opacity, slight rotation (3°)
  - Target column: Magenta border highlight
  - Empty column: "Drop here" text appears
- **Library:** @dnd-kit/core

---

### 2. Timeline Page

**Purpose:** Visual day planner showing scheduled tasks on a 24-hour timeline

#### Layout

```
┌────────────────────────────────────────────────────────────┐
│  TIME    │  SCHEDULED TASKS                                │
├──────────┼─────────────────────────────────────────────────┤
│  12 AM   │                                                 │
│  1 AM    │                                                 │
│  ...     │                                                 │
│  9 AM    │ ┌─────────────────────────────────────────────┐ │
│          │ │ Task: Morning standup (30m)                 │ │
│          │ │ Priority: 2 | Tags: work, meeting           │ │
│          │ └─────────────────────────────────────────────┘ │
│  10 AM   │ ┌─────────────────────────────────────────────┐ │
│  ──●──── │ │ ACTIVE: Code review (1h)         [▶ Timer]  │ │ ← Current time indicator
│          │ └─────────────────────────────────────────────┘ │
│  11 AM   │                                                 │
│  ...     │                                                 │
│  11 PM   │                                                 │
├──────────┴─────────────────────────────────────────────────┤
│  [Schedule Doing Tasks]  (if unscheduled "doing" tasks)    │
└────────────────────────────────────────────────────────────┘
```

#### Time Display

- 24-hour view (12 AM - 11 PM)
- Time labels on left (right-aligned)
- 1-hour slots, tasks span based on duration
- Current time: Magenta line with dot indicator

#### Active Task Definition

> The **Active Task** is the task scheduled at the current time on the Timeline.

- Highlighted with special styling
- Shows timer controls if time tracking enabled
- Used as reference point for Blocks quick-add

#### User Interactions

| Action | Behavior |
|--------|----------|
| Tap task block | Opens Task Edit page |
| Drag task block | Reschedule to new time (Phase 2) |
| "Schedule Doing Tasks" button | Auto-schedule all "doing" status tasks by priority |
| Vertical scroll | Navigate through day |
| Current time auto-scroll | Page scrolls to current hour on load |

#### Task Block Display

- Task name
- Duration (visual height based on minutes)
- Priority color indicator
- Timer button (if active task)
- Completion checkbox

#### Drag-to-Reschedule (Phase 2)

- Drag task blocks vertically to change scheduled time
- Snap to 15-minute increments
- Visual preview of new time during drag
- Conflict detection (overlap warning)

---

### 3. Blocks Page (Quick Add)

**Purpose:** Predefined, rearrangeable task templates for instant task creation

#### Layout

```
┌────────────────────────────────────────────────────────────┐
│  Quick Blocks                              [Edit] / [Done] │
├────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────┐ │
│  │ Get     │ │ Meeting │ │ Coding  │ │ Email   │ │ Lunch │ │
│  │ Ready   │ │  1h     │ │  2h     │ │  30m    │ │  1h   │ │
│  │  30m    │ │         │ │         │ │         │ │       │ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └───────┘ │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────┐ │
│  │ Workout │ │ Reading │ │ Break   │ │ Commute │ │  [+]  │ │
│  │  1h     │ │  30m    │ │  15m    │ │  45m    │ │       │ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └───────┘ │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────┐ │
│  │  [+]    │ │  [+]    │ │  [+]    │ │  [+]    │ │  [+]  │ │
│  │         │ │         │ │         │ │         │ │       │ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └───────┘ │
├────────────────────────────────────────────────────────────┤
│  Stats: Total: 240m | Productive: 180m | Putzing: 60m      │
└────────────────────────────────────────────────────────────┘
```

#### Grid Specifications

- **Layout:** 3x5 grid (15 slots max)
- **Tile size:** Responsive, equal sizing
- **Empty slots:** Show [+] button in edit mode

#### Block Tile Display

- Block name
- Default duration
- Category color (productive, chores, putzing, custom)
- Usage indicator (optional)

#### User Interactions

| Action | Behavior |
|--------|----------|
| Tap block (normal mode) | Opens Placement Picker → Creates task → Adds to Timeline |
| Tap block (edit mode) | Opens block editor modal |
| Tap [+] (edit mode) | Opens create block modal |
| Tap [Edit] button | Enter edit mode (tiles wiggle) |
| Tap [Done] button | Exit edit mode |
| Long-press / drag (edit mode) | Reorder blocks |
| Tap [X] on tile (edit mode) | Delete block |

#### Placement Picker Flow (Phase 2)

When user taps a block tile:

```
┌─────────────────────────────────────┐
│  Where to schedule this task?       │
├─────────────────────────────────────┤
│  ○ After current task               │
│  ○ Next free slot                   │
│  ○ End of day                       │
│  ○ Custom time...                   │
├─────────────────────────────────────┤
│  [Cancel]              [Schedule]   │
└─────────────────────────────────────┘
```

**Options:**
| Option | Behavior |
|--------|----------|
| After current task | Schedule immediately after Active Task ends |
| Next free slot | Find first gap on timeline that fits duration |
| End of day | Schedule at end of work hours |
| Custom time | Open time picker |

#### Block Categories

| Category | Color | Description |
|----------|-------|-------------|
| Productive | #6B4423 (Brown) | Work, meetings, focused tasks |
| Chores | #16a34a (Green) | Housework, errands |
| Putzing | #166534 (Dark Green) | Non-productive time tracking |
| Custom | #9b4dca (Magenta) | User-defined |

---

### 4. Task Edit Page (Unified)

**Purpose:** Single, consistent interface for creating and editing tasks

> **CRITICAL:** This is the SAME page accessed from everywhere:
> - "+ Add" button in nav
> - "+ Add" button in Kanban columns
> - Tap task card in Kanban
> - Tap task block in Timeline
> - Tap search result
> - After Blocks placement picker

#### Layout

```
┌────────────────────────────────────────────────────────────┐
│  ← Back                    Edit Task              [Delete] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Task Name *                                               │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Enter task name...                                    │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Duration: 30 Min × 2 = 1h                                │
│  ┌────────────────┐  ┌────────────────┐                   │
│  │ Block Size ▼   │  │ Block Count ▼  │                   │
│  │ 30 Min         │  │ 2              │                   │
│  └────────────────┘  └────────────────┘                   │
│                                                            │
│  ┌────────────────┐  ┌────────────────┐                   │
│  │ Priority ▼     │  │ Status ▼       │                   │
│  │ 3 - Medium     │  │ To Do          │                   │
│  └────────────────┘  └────────────────┘                   │
│                                                            │
│  Access Context                                            │
│  [Home] [Errand] [Computer] [Phone]                       │
│                                                            │
│  Tags                                                      │
│  ┌──────────────────────────────────┐ [+ Add]             │
│  │ work, project-x                   │                     │
│  └──────────────────────────────────┘                     │
│                                                            │
│  ┌────────────────┐  ┌────────────────┐                   │
│  │ Repeat ▼       │  │ Due Date       │                   │
│  │ No repeat      │  │ 📅 Select...   │                   │
│  └────────────────┘  └────────────────┘                   │
│                                                            │
│  Color                                                     │
│  [●] [●] [●] [●] [●] [●] [●] [●]                         │
│                                                            │
│  Subtasks                                                  │
│  ☐ Subtask 1                                    [×]       │
│  ☑ Subtask 2 (completed)                        [×]       │
│  ┌──────────────────────────────────┐ [+ Add]             │
│  │ Add subtask...                    │                     │
│  └──────────────────────────────────┘                     │
│                                                            │
│  Notes                                                     │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Additional details...                                 │ │
│  │                                                        │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  [Cancel]                              [Save Changes]      │
└────────────────────────────────────────────────────────────┘
```

#### Required Fields

| Field | Type | Required | Default |
|-------|------|----------|---------|
| Name | Text | ✅ Yes | - |
| Block Size | Select | No | 30 Min |
| Block Count | Select | No | 1 |
| Priority | Select | No | 3 (Medium) |
| Status | Select | No | Backlog |

#### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| Access Context | Multi-toggle | Where task can be done |
| Tags | Tag input | Categorization |
| Repeat | Select | Recurrence pattern |
| Due Date | Date picker | Deadline |
| Color | Color picker | Visual identifier |
| Subtasks | List | Nested items |
| Notes | Textarea | Additional details |

#### Duration Calculator

```
Duration = Block Size × Block Count

Block Sizes:
- 15 Min = 15 minutes
- 30 Min = 30 minutes  
- 1 Hour = 60 minutes
- 1 Week = 10,080 minutes

Block Count: 1-5

Examples:
- 30 Min × 2 = 1 hour
- 1 Hour × 3 = 3 hours
- 15 Min × 4 = 1 hour
```

#### Buttons

| Button | Visibility | Action |
|--------|------------|--------|
| Cancel | Always | Discard changes, go back |
| Save Changes | Always | Validate and save task |
| Delete | Edit mode only | Confirm and delete task |

---

### 5. AI/Search Page

**Purpose:** AI-powered task assistant and task search functionality

#### Layout

```
┌────────────────────────────────────────────────────────────┐
│  ✨ AI Assistant                            [Online 🟢]    │
├────────────────────────────────────────────────────────────┤
│  [Chat]  [Search]                                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  (Chat Tab)                                                │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 🤖 How can I help you manage your tasks today?       │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 👤 Schedule my high priority tasks for this morning  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 🤖 I've analyzed your tasks. Here's my suggestion:   │ │
│  │                                                        │ │
│  │ 9:00 AM - Code review (1h) - Priority 1              │ │
│  │ 10:00 AM - Bug fix (30m) - Priority 2                │ │
│  │ 10:30 AM - Documentation (1h) - Priority 2           │ │
│  │                                                        │ │
│  │ [Apply Schedule]                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐ [Send ➤]     │
│  │ Type a message...                       │               │
│  └────────────────────────────────────────┘               │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  (Search Tab)                                              │
├────────────────────────────────────────────────────────────┤
│  🔍 ┌────────────────────────────────────────────────────┐│
│     │ Search tasks...                                     ││
│     └────────────────────────────────────────────────────┘│
│                                                            │
│  Filters: [Status ▼] [Priority ▼] [Tags ▼]                │
│                                                            │
│  Results (12 tasks)                                        │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ ☐ Task name here                                      │ │
│  │   Priority 2 | 1h | work, project-x                   │ │
│  └──────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ ☑ Another task                                        │ │
│  │   Priority 3 | 30m | personal                         │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

#### Tabs

| Tab | Purpose |
|-----|---------|
| Chat | AI conversation for task management |
| Search | Find and filter existing tasks |

#### Online/Offline Indicator

- **Online (green):** AI features available
- **Offline (red):** AI disabled, search still works

#### AI Capabilities (Phase 2)

| Capability | Description |
|------------|-------------|
| Schedule suggestions | Recommend optimal task times |
| Priority analysis | Suggest priority changes |
| Task breakdown | Break large tasks into subtasks |
| Time estimates | Suggest durations based on similar tasks |
| Daily planning | Create full day schedule |

#### Search Features

| Feature | Description |
|---------|-------------|
| Text search | Search task name, description, notes |
| Status filter | Filter by status column |
| Priority filter | Filter by priority level |
| Tag filter | Filter by tags (Phase 2: Advanced multi-tag) |
| Date filter | Filter by due date range |

---

### 6. Settings Page

**Purpose:** App configuration and preferences

#### Layout

```
┌────────────────────────────────────────────────────────────┐
│  ← Back                      Settings                      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  APPEARANCE                                                │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Theme                                    [Dark ▼]    │ │
│  │ • Dark                                               │ │
│  │ • Light                                              │ │
│  │ • System                                             │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  WORK SCHEDULE                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Work Start Time                          [09:00]     │ │
│  │ Work End Time                            [17:00]     │ │
│  │ Work Days                    [M][T][W][T][F][ ][ ]   │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  NOTIFICATIONS                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Enable Notifications                         [ON]    │ │
│  │ Task Reminders                               [ON]    │ │
│  │ Timer Alerts                                 [ON]    │ │
│  │ Daily Summary                                [OFF]   │ │
│  │   Summary Time                           [20:00]     │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  AI ASSISTANT                                              │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ AI Enabled                                   [ON]    │ │
│  │ AI Provider                           [Gemini ▼]     │ │
│  │ API Key                              [••••••••]     │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  DATA                                                      │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ [Export Data (JSON)]                                 │ │
│  │ [Export Data (CSV)]                                  │ │
│  │ Last Sync: Never                                     │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ABOUT                                                     │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Version                                    0.0.2     │ │
│  │ [Check for Updates]                                  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

#### Settings Categories

| Category | Settings |
|----------|----------|
| Appearance | Theme (dark/light/system) |
| Work Schedule | Start time, end time, work days |
| Notifications | Enable, reminders, timer alerts, daily summary |
| AI Assistant | Enable, provider, API key |
| Data | Export JSON/CSV, sync status |
| About | Version, update check |

---

### 7. Profile Page

**Purpose:** User statistics and productivity analytics

#### Layout

```
┌────────────────────────────────────────────────────────────┐
│  ← Back                      Profile                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│           ┌─────────┐                                      │
│           │  👤     │                                      │
│           │  User   │                                      │
│           └─────────┘                                      │
│           Local User                                       │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  TODAY'S PROGRESS                                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│  │     5      │ │   3h 30m   │ │    85%     │             │
│  │ Completed  │ │   Tracked  │ │ Productive │             │
│  └────────────┘ └────────────┘ └────────────┘             │
│                                                            │
│  THIS WEEK                                                 │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ M ████████████░░░░ 80%                               │ │
│  │ T ██████████████░░ 90%                               │ │
│  │ W ████████░░░░░░░░ 50%                               │ │
│  │ T ████████████████ 100%                              │ │
│  │ F ██████░░░░░░░░░░ 40%  ← Today                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  STATISTICS                                                │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Tasks Completed (Total)                         142  │ │
│  │ Tasks Completed (This Week)                      23  │ │
│  │ Tasks Completed (This Month)                     67  │ │
│  │ Total Time Tracked                          47h 30m  │ │
│  │ Average Daily Tasks                             4.2  │ │
│  │ Current Streak                              5 days   │ │
│  │ Longest Streak                             12 days   │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  RECENT COMPLETED                                          │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ ☑ Task name - Completed 2h ago                       │ │
│  │ ☑ Another task - Completed 4h ago                    │ │
│  │ ☑ Third task - Completed yesterday                   │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

#### Statistics Tracked

| Stat | Description |
|------|-------------|
| Tasks Completed (Total) | All-time completion count |
| Tasks Completed (Period) | Today, week, month counts |
| Total Time Tracked | Sum of all task durations |
| Productive Time | Time on non-putzing tasks |
| Putzing Time | Time on putzing tasks |
| Average Daily Tasks | Average completions per day |
| Current Streak | Consecutive days with completions |
| Longest Streak | Best streak achieved |

---

## Core Data Models

### Task Schema

```typescript
interface Task {
  // Identity
  id: string;                    // UUID
  name: string;                  // 1-200 chars, required
  description?: string;          // 0-2000 chars
  
  // Anytype-aligned fields
  assigneeId: string;            // Default: "me"
  accessContexts: AccessContext[]; // home, errand, computer, phone
  blockSize: BlockSize;          // 15min, 30min, 1hour, 1week
  blockCount: number;            // 1-5
  linkedProjectId?: string;      // UUID of linked project
  
  // Priority and status
  priority: TaskPriority;        // 1-5 (1=highest)
  status: TaskStatus;            // backlog, design, todo, doing, review, done
  
  // Scheduling
  duration?: number;             // Computed or manual override (minutes)
  scheduledAt?: Date;            // When on timeline
  dueDate?: Date;                // Deadline
  recurrence: RecurrenceType;    // none, daily, weekly, monthly, custom
  recurrenceRule?: string;       // iCal RRULE for custom
  
  // Organization
  tags: string[];                // Max 10 tags
  color?: string;                // Hex color
  category?: string;             // User category
  location?: string;             // Location string
  
  // Subtasks
  subtasks: Subtask[];           // Nested items
  
  // Time tracking
  timeSpent: number;             // Actual minutes spent
  startedAt?: Date;              // Timer start
  completedAt?: Date;            // Completion timestamp
  
  // Meta
  reminders: number[];           // Minutes before task
  notes?: string;                // 0-5000 chars
  isQuickAdd: boolean;           // Created from Blocks page
  isPutzing: boolean;            // Non-productive time
  calendarEventId?: string;      // Linked calendar event
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### QuickAddBlock Schema

```typescript
interface QuickAddBlock {
  id: string;                    // UUID
  name: string;                  // 1-50 chars
  defaultDuration: number;       // Minutes (1-480)
  category: BlockCategory;       // productive, chores, putzing, custom
  color: string;                 // Hex color
  isPutzing: boolean;            // Non-productive flag
  icon?: string;                 // Emoji or icon name
  sortOrder: number;             // Position in grid
  usageCount: number;            // Times used
  createdAt: Date;
}
```

### User Stats Schema

```typescript
interface UserStats {
  tasksCompletedTotal: number;
  tasksCompletedToday: number;
  tasksCompletedThisWeek: number;
  tasksCompletedThisMonth: number;
  totalTimeTracked: number;      // Minutes
  productiveTime: number;        // Minutes
  putzingTime: number;           // Minutes
  currentStreak: number;         // Days
  longestStreak: number;         // Days
  lastActiveDate?: Date;
}
```

---

## Phase 2 Required Features

### Feature Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Implemented |
| 🔄 | In Progress |
| 📋 | Not Started |
| 🧪 | Needs Testing |

### Feature List (19 Total)

| # | Feature | Status | Description | Test File |
|---|---------|--------|-------------|-----------|
| 1 | P2P Sync | ✅ | Local network sync (Yjs/WebRTC) | `sync.spec.ts` |
| 2 | AI Task Scheduler | ✅ | Gemini chat + search | `ai-chat.spec.ts` |
| 3 | Android Mobile App | ✅ | React Native/Expo scaffold | `mobile/` |
| 4 | Full Settings Page | ✅ | Theme, sync, notifications, export | `settings.spec.ts` |
| 5 | Profile + Stats | ✅ | Analytics dashboard | `profile.spec.ts` |
| 6 | Active Time Tracking | ✅ | Start/stop/pause timer | `timer.spec.ts` |
| 7 | Notifications | ✅ | Reminders, alerts, daily summary | `notifications.spec.ts` |
| 8 | Recurring Tasks | ✅ | RecurrenceSelector + engine | `recurring.spec.ts` |
| 9 | Advanced Tag Filter | ✅ | TagInput component | `search.spec.ts` |
| 10 | Subtask Progress | ✅ | SubtaskEditor component | `subtasks.spec.ts` |
| 11 | Data Export | ✅ | JSON/CSV export in settings | `export.spec.ts` |
| 12 | Theme Toggle | ✅ | Dark/light/system in useTheme | `theme.spec.ts` |
| 13 | Keyboard Shortcuts | ✅ | useKeyboardShortcuts hook | `keyboard.spec.ts` |
| 14 | Timeline Drag | ✅ | Drag to reschedule tasks | `timeline-drag.spec.ts` |
| 15 | Bulk Actions | ✅ | BulkActions component | `bulk-actions.spec.ts` |
| 16 | Task Templates | ✅ | TaskTemplates component | `templates.spec.ts` |
| 17 | Kanban Drag-Drop | ✅ | Move between columns | `kanban.spec.ts` |
| 18 | Unified Task Edit | ✅ | TaskEditPage component | `task-edit.spec.ts` |
| 19 | Blocks Placement | ✅ | PlacementPickerModal | `blocks.spec.ts` |

---

---

# Phase 2 build plan

> Historical sprint plan (v0.0.3 → v0.1.0 MVP). **Current execution** → [ROADMAP.md](./ROADMAP.md) Sprint 5+.

## Build Order Strategy

## Build Order Strategy

All features built in this order:
1. **Win11 Desktop** → Test → Commit
2. **Android App** → Test → Commit  
3. **PWA Web** → Test → Commit

**Design Reference:** `Docs/Blocks Figma GUI 0.0.1 2025-12-14 224125.png`

---

## Phase 2 Sprints

### Sprint 0: v0.0.3 Critical Bug Fixes (CURRENT)

**Goal:** Fix foundational UI/UX issues before continuing feature development

| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| 0.1 Top Bar Revert to Figma Design | P0 | 4h | None |
| 0.2 Fix Nav Bar Covering Content | P0 | 4h | None |
| 0.3 Timeline Blocks Fill Duration | P1 | 6h | None |

**Bug Details:**

#### 0.1 Top Bar Revert (BUG-001)
Current: Settings + Profile buttons on right side
Required: 
- Hamburger menu (☰) on LEFT → Opens Settings sheet
- Page title CENTERED
- Profile icon on RIGHT → Opens Profile sheet

**Files:** 
- `apps/desktop/src/renderer/App.tsx`
- `apps/web/src/components/app-shell.tsx`

#### 0.2 Nav Bar Overlap Fix (BUG-002)
Issue: Nav bar covers Kanban "Add Task" buttons, Save/Cancel on edit pages
Fix: Add proper bottom padding to main content area (pb-24 minimum)

**Files:**
- `apps/desktop/src/renderer/App.tsx`
- `apps/desktop/src/renderer/components/TaskEditPage.tsx`
- `packages/ui/src/components/bottom-nav.tsx`

#### 0.3 Timeline Block Height (BUG-003)
Issue: Task blocks don't visually fill their duration
Fix: Block height = (duration_minutes / 60) * hour_slot_height

**Reference:** `Docs/Blocks Timeline page GUI.png`

**Files:**
- `apps/desktop/src/renderer/App.tsx` (TimelinePage)
- `packages/ui/src/components/timeline-block.tsx`

**Deliverables:**
- [ ] Top bar matches Figma design across all apps
- [ ] No content hidden behind nav bar
- [ ] Timeline blocks properly sized to duration
- [ ] Build and test desktop installer v0.0.3

**Playwright Tests:**
- `top-bar.spec.ts` (new)
- `nav-bar-overlap.spec.ts` (new)
- `timeline-blocks.spec.ts` (update existing)

---

### Sprint 1: Foundation (Week 1-2)

**Goal:** Establish unified architecture and fix foundational issues

| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| 1.1 Unified Task Edit Page | P0 | 8h | None |
| 1.2 Ensure Save button on all task forms | P0 | 4h | 1.1 |
| 1.3 Timeline Drag-to-Reschedule | P0 | 12h | None |
| 1.4 Blocks Placement Picker | P0 | 8h | 1.3 |
| 1.5 Full Settings Page Implementation | P1 | 12h | None |
| 1.6 Theme Toggle (Dark/Light/System) | P1 | 6h | 1.5 |

**Deliverables:**
- Task Edit page unified across all entry points
- Timeline supports drag-to-reschedule
- Blocks page shows placement picker on tap
- Settings page fully functional
- Theme toggle working

**Playwright Tests:**
- `task-edit-unified.spec.ts`
- `timeline-drag.spec.ts`
- `blocks-placement.spec.ts`
- `settings.spec.ts`
- `theme.spec.ts`

---

### Sprint 2: Time Tracking & Notifications (Week 3-4)

**Goal:** Implement active time tracking and notification system

| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| 2.1 Active Timer UI | P0 | 10h | None |
| 2.2 Timer Start/Stop/Pause | P0 | 8h | 2.1 |
| 2.3 Timer persistence (survives refresh) | P0 | 4h | 2.2 |
| 2.4 Overtime warnings | P1 | 4h | 2.2 |
| 2.5 Notification system setup | P0 | 8h | None |
| 2.6 Task reminders | P1 | 6h | 2.5 |
| 2.7 Timer alerts | P1 | 4h | 2.5 |
| 2.8 Daily summary notification | P2 | 6h | 2.5 |

**Deliverables:**
- Timer controls on active task (Timeline)
- Time tracked vs estimated visible
- Desktop notifications working
- Reminders fire at scheduled times

**Playwright Tests:**
- `timer.spec.ts`
- `notifications.spec.ts`

---

### Sprint 3: Profile & Statistics (Week 5)

**Goal:** Build analytics dashboard

| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| 3.1 Stats calculation logic | P0 | 8h | Sprint 2 |
| 3.2 Today's progress display | P0 | 4h | 3.1 |
| 3.3 Weekly progress chart | P1 | 6h | 3.1 |
| 3.4 All-time statistics | P1 | 4h | 3.1 |
| 3.5 Streak tracking | P1 | 4h | 3.1 |
| 3.6 Recent completed list | P2 | 3h | None |

**Deliverables:**
- Profile page shows accurate statistics
- Weekly progress visualization
- Streak tracking functional

**Playwright Tests:**
- `profile.spec.ts`
- `stats.spec.ts`

---

### Sprint 4: Recurring Tasks & Data Export (Week 6)

**Goal:** Implement recurring task system and data portability

| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| 4.1 Recurring task logic | P0 | 10h | None |
| 4.2 Daily recurrence | P0 | 4h | 4.1 |
| 4.3 Weekly recurrence | P0 | 4h | 4.1 |
| 4.4 Monthly recurrence | P1 | 4h | 4.1 |
| 4.5 Recurrence UI in Task Edit | P0 | 4h | 4.1 |
| 4.6 Data export (JSON) | P0 | 6h | None |
| 4.7 Data export (CSV) | P1 | 4h | 4.6 |
| 4.8 Export UI in Settings | P1 | 2h | 4.6 |

**Deliverables:**
- Recurring tasks auto-regenerate
- Export buttons in Settings work
- Export files are valid and complete

**Playwright Tests:**
- `recurring.spec.ts`
- `export.spec.ts`

---

### Sprint 5: AI Scheduler (Week 7-8)

**Goal:** Build intelligent task scheduling

| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| 5.1 AI scheduling prompt engineering | P0 | 8h | None |
| 5.2 Schedule suggestion generation | P0 | 12h | 5.1 |
| 5.3 "Apply Schedule" button | P0 | 6h | 5.2 |
| 5.4 Priority-based scheduling | P1 | 6h | 5.2 |
| 5.5 Conflict detection | P1 | 4h | 5.2 |
| 5.6 Work hours awareness | P1 | 4h | 5.2, Sprint 1 |

**Deliverables:**
- AI can suggest day schedules
- User can apply suggestions with one click
- Scheduling respects work hours

**Playwright Tests:**
- `ai-scheduler.spec.ts`

---

### Sprint 6: Advanced Features (Week 9)

**Goal:** Implement remaining productivity features

| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| 6.1 Advanced tag filtering | P1 | 6h | None |
| 6.2 Subtask progress bar | P1 | 4h | None |
| 6.3 Bulk selection UI | P1 | 8h | None |
| 6.4 Bulk move action | P1 | 4h | 6.3 |
| 6.5 Bulk delete action | P1 | 3h | 6.3 |
| 6.6 Task templates save | P2 | 6h | None |
| 6.7 Task templates apply | P2 | 4h | 6.6 |
| 6.8 Keyboard shortcuts (desktop) | P2 | 8h | None |

**Deliverables:**
- Multi-tag filtering in search
- Subtasks show completion progress
- Can select and move/delete multiple tasks
- Can save task as template
- Keyboard navigation works

**Playwright Tests:**
- `tags.spec.ts`
- `subtasks.spec.ts`
- `bulk-actions.spec.ts`
- `templates.spec.ts`
- `keyboard.spec.ts`

---

### Sprint 7: P2P Sync (Week 10-11)

**Goal:** Enable device-to-device sync

| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| 7.1 Yjs document setup | P0 | 8h | None |
| 7.2 WebRTC provider | P0 | 12h | 7.1 |
| 7.3 Sync status indicator | P0 | 4h | 7.2 |
| 7.4 Conflict resolution | P0 | 8h | 7.2 |
| 7.5 Offline queue | P1 | 6h | 7.2 |
| 7.6 Device pairing UI | P1 | 6h | 7.2 |

**Deliverables:**
- Devices on same network auto-sync
- Sync status visible in UI
- Works offline, syncs when reconnected

**Playwright Tests:**
- `sync.spec.ts`

---

### Sprint 8: Android App (Week 12-14)

**Goal:** Build and test Android app matching desktop

| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| 8.1 React Native project setup | P0 | 8h | None |
| 8.2 Port UI components | P0 | 20h | 8.1 |
| 8.3 Port Kanban page | P0 | 8h | 8.2 |
| 8.4 Port Timeline page | P0 | 8h | 8.2 |
| 8.5 Port Blocks page | P0 | 8h | 8.2 |
| 8.6 Port Task Edit page | P0 | 6h | 8.2 |
| 8.7 Port AI/Search page | P0 | 6h | 8.2 |
| 8.8 Port Settings page | P0 | 4h | 8.2 |
| 8.9 Port Profile page | P0 | 4h | 8.2 |
| 8.10 Mobile-specific adjustments | P1 | 12h | 8.3-8.9 |
| 8.11 Android build & test | P0 | 8h | 8.10 |

**Deliverables:**
- Android APK that matches desktop functionality
- Mobile-optimized touch interactions
- Same features working

**Tests:**
- Manual testing on Android device/emulator
- Detox E2E tests (optional)

---

### Sprint 9: PWA Alignment & Polish (Week 15)

**Goal:** Ensure PWA matches desktop exactly

| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| 9.1 Audit PWA vs Desktop features | P0 | 4h | Sprint 1-7 |
| 9.2 Fix any PWA gaps | P0 | 12h | 9.1 |
| 9.3 PWA manifest optimization | P1 | 4h | None |
| 9.4 Service worker caching | P1 | 6h | None |
| 9.5 Install prompt | P2 | 4h | None |

**Deliverables:**
- PWA feature-complete with desktop
- Works offline
- Installable

**Playwright Tests:**
- Full test suite against PWA

---

### Sprint 10: Testing & Release Prep (Week 16)

**Goal:** Full test coverage and release preparation

| Task | Priority | Est. Hours | Dependencies |
|------|----------|------------|--------------|
| 10.1 Write missing Playwright tests | P0 | 16h | All sprints |
| 10.2 Run full test suite | P0 | 4h | 10.1 |
| 10.3 Fix failing tests | P0 | 8h | 10.2 |
| 10.4 Performance audit | P1 | 4h | None |
| 10.5 Accessibility audit | P1 | 4h | None |
| 10.6 Update documentation | P0 | 4h | None |
| 10.7 Update CHANGELOG | P0 | 2h | None |
| 10.8 Build release artifacts | P0 | 4h | 10.3 |
| 10.9 Version bump to 0.1.0 | P0 | 1h | 10.8 |

**Deliverables:**
- All tests passing
- Documentation current
- v0.1.0 release ready

---

## Summary Timeline

| Sprint | Weeks | Focus |
|--------|-------|-------|
| 1 | 1-2 | Foundation (Unified Edit, Timeline Drag, Settings) |
| 2 | 3-4 | Time Tracking & Notifications |
| 3 | 5 | Profile & Statistics |
| 4 | 6 | Recurring Tasks & Export |
| 5 | 7-8 | AI Scheduler |
| 6 | 9 | Advanced Features |
| 7 | 10-11 | P2P Sync |
| 8 | 12-14 | Android App |
| 9 | 15 | PWA Alignment |
| 10 | 16 | Testing & Release |

**Total Estimated Time:** 16 weeks to v0.1.0 MVP

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| P2P Sync complexity | Start with simple Yjs setup, iterate |
| Android development time | Reuse maximum code from @blocks/ui |
| AI scheduling accuracy | Iterative prompt engineering |
| Test coverage gaps | Dedicate Sprint 10 to testing |

---

## Success Criteria for v0.1.0

- [ ] All 19 Phase 2 features implemented
- [ ] Win11 Desktop fully functional
- [ ] Android app matches desktop
- [ ] PWA matches desktop
- [ ] Playwright tests >80% pass rate
- [ ] No critical bugs
- [ ] Documentation complete

---

# Quality gates

## Playwright Test Requirements

### Test Structure

```
tests/
├── e2e/
│   ├── kanban.spec.ts           # Kanban page tests
│   ├── timeline.spec.ts         # Timeline page tests
│   ├── blocks.spec.ts           # Blocks page tests
│   ├── task-crud.spec.ts        # Task create/edit/delete
│   ├── navigation.spec.ts       # Page navigation
│   ├── ai-chat.spec.ts          # AI features
│   └── ...
├── integration/
│   ├── sync.spec.ts             # P2P sync tests
│   ├── storage.spec.ts          # Data persistence
│   └── ...
├── visual/
│   ├── kanban-visual.spec.ts    # Visual regression
│   └── ...
├── accessibility/
│   └── wcag.spec.ts             # A11y compliance
└── performance/
    └── load-time.spec.ts        # Performance budgets
```

### Test Coverage Requirements

| Feature | Min Coverage | Critical Paths |
|---------|--------------|----------------|
| Task CRUD | 90% | Create, edit, delete, complete |
| Kanban Drag | 85% | All column combinations |
| Timeline | 85% | Scheduling, drag-to-reschedule |
| Blocks | 85% | Tap, edit, reorder, placement |
| AI Chat | 75% | Send, receive, apply suggestions |
| Settings | 80% | All toggles, saves persist |
| Profile | 75% | Stats accuracy |

---

## Release Checklist

Before any release, verify:

### Functionality
- [ ] All 19 Phase 2 features working on Win11 Desktop
- [ ] Same features working on Android (if applicable)
- [ ] Same features working on PWA (if applicable)
- [ ] Playwright tests pass for all features
- [ ] No console errors in production build

### UI/UX
- [ ] Unified Task Edit page accessible from all entry points
- [ ] Drag-and-drop works on Kanban
- [ ] Drag-and-drop works on Timeline (Phase 2)
- [ ] Blocks placement picker shows on tap
- [ ] All buttons have visible feedback
- [ ] Save Changes button always visible

### Data
- [ ] Tasks persist across app restart
- [ ] Settings persist across app restart
- [ ] Export produces valid JSON/CSV
- [ ] No data loss on sync

### Performance
- [ ] Page load < 3 seconds
- [ ] Drag interactions feel smooth
- [ ] No memory leaks on navigation

---

---

# Historical archive

## v0.0.3 Bug Fixes & Changes

### Critical Bug Fixes

#### BUG-001: Top Bar Design Revert
**Priority:** P0  
**Status:** ✅ FIXED  
**Affected:** Desktop, Mobile, PWA

**Issue:** Current top bar design doesn't match Figma design language.

**Required Design (from `Blocks Figma GUI 0.0.1 2025-12-14 224125.png`):**
```
┌─────────────────────────────────────┐
│  ☰    │      Page Title      │  👤  │
│ Menu  │      (centered)      │ Prof │
└─────────────────────────────────────┘
```

**Changes Required:**
- [ ] Hamburger menu (☰) on far LEFT → Opens Settings
- [ ] Page title centered in middle
- [ ] Profile icon (circle) on far RIGHT → Opens Profile
- [ ] Remove current Settings/Profile buttons from right side
- [ ] Apply consistently across ALL pages

**Files to Update:**
- `apps/desktop/src/renderer/App.tsx` - TitleBar + TopBar components
- `apps/web/src/components/app-shell.tsx`
- `apps/mobile/app/_layout.tsx`

---

#### BUG-002: Bottom Nav Bar Covering Content
**Priority:** P0  
**Status:** ✅ FIXED  
**Affected:** Desktop, Mobile, PWA

**Issue:** Bottom navigation bar overlaps and covers important UI elements:
- Kanban "Add Task" buttons at bottom of columns
- Save/Cancel buttons on Task Edit pages
- Any footer content on other pages

**Root Cause:** Main content area not properly accounting for fixed nav bar height.

**Required Fix:**
```css
/* Nav bar should be FIXED at bottom */
nav.bottom-nav {
  position: fixed;
  bottom: 0;
  height: 64px; /* or defined height */
  z-index: 30;
}

/* Main content should have bottom padding */
main.content-area {
  padding-bottom: calc(64px + env(safe-area-inset-bottom) + 16px);
  /* nav height + safe area + buffer */
}
```

**Specific Fixes:**
- [ ] Kanban page: Add Task buttons must be ABOVE nav bar
- [ ] Task Edit page: Save/Cancel buttons must be ABOVE nav bar
- [ ] Timeline page: Content scrolls with nav visible
- [ ] Blocks page: All tiles visible above nav
- [ ] All pages: Add `pb-24` or similar bottom padding to main content

**Files to Update:**
- `apps/desktop/src/renderer/App.tsx` - main container padding
- `apps/desktop/src/renderer/components/TaskEditPage.tsx` - button positioning
- `packages/ui/src/components/bottom-nav.tsx` - ensure fixed positioning
- All page components need bottom padding

---

#### BUG-003: Timeline Blocks Not Filling Duration
**Priority:** P1  
**Status:** ✅ FIXED  
**Affected:** Desktop, Mobile, PWA

**Issue:** Task blocks on Timeline don't visually fill their full scheduled duration.

**Current Behavior:** Blocks have fixed small height regardless of duration.

**Required Behavior (from `Blocks Timeline page GUI.png`):**
- Each task block should fill the ENTIRE vertical space of its duration
- Block height = (task_duration_minutes / 60) * hour_slot_height
- Block should use task's assigned color as background
- Green "current time" line shows real-time position

**Visual Reference:**
```
2:00p ─────────────────────────
      ┌─────────────────────┐
      │ Laundry             │  ← Purple block
      │ Home | 1 | 10       │     10 min = small height
      └─────────────────────┘
2:10p ─────────────────────────
      ┌─────────────────────┐
      │ Saxophone Practice  │  ← Magenta block
      │ Home | 2 | 50       │     50 min = LARGE height
      │                     │     fills 2:10 to 3:00
      │   [current time]────│──── Green line at 2:30
      │                     │
      └─────────────────────┘
3:00p ─────────────────────────
      ┌─────────────────────┐
      │ Nap                 │  ← Teal block
      │ Home | 2 | ∞        │
      └─────────────────────┘
```

**Calculation:**
```typescript
const hourHeight = 80; // pixels per hour slot
const blockHeight = (durationMinutes / 60) * hourHeight;
const topOffset = (startMinute / 60) * hourHeight;
```

**Files to Update:**
- `apps/desktop/src/renderer/App.tsx` - TimelinePage component
- `packages/ui/src/components/timeline-block.tsx`
- `apps/web/src/app/timeline/page.tsx`

---

### Design Language Reference

**Source of Truth:** `Docs/Blocks Figma GUI 0.0.1 2025-12-14 224125.png`

All future GUI decisions should reference this Figma export for:
- Color palette
- Component styling
- Layout structure
- Icon usage
- Typography
- Spacing

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.0.3 | 2024-12-27 | Bug fixes: Top bar, Nav overlap, Timeline blocks |
| 0.0.2 | 2024-12-27 | All 19 Phase 2 features implemented |
| 0.0.1 | 2024-12-26 | Project initialization |

---

| v0.0.2 | 2024-12-27 | All 19 Phase 2 features implemented (content merged here from v0.0.2; v0.0.3 adds bug-fix archive below) |

---

# Feature code registry

> Stable codes, health symbols, Playwright links. Regenerate matrices: `node scripts/generate-registry.mjs && node scripts/polish-docs.mjs`

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
|     push_task_to_anytype       | 🔄 N-0050 |    —     |    —     |
|    pull_tasks_from_anytype     | 🔄 N-0050 |    —     |    —     |
|       sync_linked_tasks        | 🔄 N-0050 |    —     |    —     |
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
| DT.UI.00.001.010 | Top bar (menu · title · profile) |   ✅    | B-0029 · `spacing-cascade.spec.ts` |
| DT.UI.00.002.010 | Bottom navigation bar            |   ✅    | B-0029 · `spacing-cascade.spec.ts` |
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
| DT.UI.02.050.020 | Continuous scroll calendar       |   🐛    | N-0027 · B-0030 · B-0031 · N-0052 · N-0053 · N-0054 · `timeline-calendar-view.spec.ts` |
| WB.UI.02.050.020 | Continuous scroll calendar (web) |   🐛    | N-0027 · B-0030 · B-0031 · N-0052 · N-0053 · N-0054 · `timeline-calendar-view.spec.ts` |
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

### DT.UI.06.009 · Anytype sync {#dt-ui-06-009}

| Code             | Feature                          | Health | Playwright                    |
| ---------------- | -------------------------------- | :----: | ----------------------------- |
| DT.UI.06.009.010 | API key + space/collection picker |   🔄    | N-0050 · `settings.spec.ts`   |
| DT.UI.06.009.020 | Sync status · Sync now · interval |   🔄    | N-0050 · `settings.spec.ts`   |
| WB.UI.06.009.010 | Anytype settings panel (web)      |   📋    | N-0051 · blocked on API access |

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
| SB.EN.02.080.010 | Anytype HTTP client + health check |   🔄    | N-0050 · `anytype-sync.spec.ts` |
| SB.EN.02.080.020 | Task ↔ Anytype field mapper |   🔄    | N-0050 · `anytype-sync.spec.ts` |
| SB.EN.02.080.030 | Anytype LWW merge + link table |   🔄    | N-0050 · `anytype-sync.spec.ts` |
| SB.EN.02.080.040 | Anytype schedule conflict gate |   🔄    | N-0050 · integration |

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
| MC.EN.02.130.010 | push_task_to_anytype  |   🔄    | N-0050 · `anytype-sync.spec.ts` |
| MC.EN.02.130.020 | pull_tasks_from_anytype |  🔄   | N-0050 · `anytype-sync.spec.ts` |
| MC.EN.02.130.030 | sync_linked_tasks     |   🔄    | N-0050 · `anytype-sync.spec.ts` |

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

