# Blocks Core Functionality Specification v0.0.3

> **Version:** 0.0.3  
> **Last Updated:** 2024-12-27  
> **Status:** Phase 2 Development - Bug Fixes  
> **Source of Truth** for all feature development, testing, and releases

---

## Table of Contents

1. [Development Priority Order](#development-priority-order)
2. [Platform Support Matrix](#platform-support-matrix)
3. [Navigation Layout](#navigation-layout)
4. [Page Specifications](#page-specifications)
   - [Kanban Page](#1-kanban-page)
   - [Timeline Page](#2-timeline-page)
   - [Blocks Page](#3-blocks-page-quick-add)
   - [Task Edit Page](#4-task-edit-page-unified)
   - [AI/Search Page](#5-aisearch-page)
   - [Settings Page](#6-settings-page)
   - [Profile Page](#7-profile-page)
5. [Core Data Models](#core-data-models)
6. [Phase 2 Required Features](#phase-2-required-features)
7. [Playwright Test Requirements](#playwright-test-requirements)
8. [Release Checklist](#release-checklist)

---

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

*This document is the source of truth for Blocks development. Update this document BEFORE implementing new features.*

