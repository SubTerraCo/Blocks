# Changelog

> **Canonical file** — do not duplicate. Former `Docs/CHANGELOG.md` is deprecated.

All notable changes to the Blocks project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

**Versioning:** date-based releases `vYY.MM.DD` with implementation batches `vYY.MM.DDbX` (e.g. `v26.06.12b1`, `v26.06.12b10`). See [CI_OPS_FRAMEWORK.md](./CI_OPS_FRAMEWORK.md). Legacy `0.0.x` entries below predate the date scheme.

**Batch log (full detail):** [ROADMAP.md](./ROADMAP.md)

---

## [Unreleased] — Sprint 5 · v26.07.16

> Full batch detail: [ROADMAP.md](./ROADMAP.md) batch log

### v26.07.16b3 (shipped)

#### Fixed

- **B-0029**: Desktop Tailwind padding cascade — move universal CSS reset into `@layer base` so `p-*`/`px-*`/`py-*` apply again (Kanban cards, toolbar, Timeline, Calendar)

### v26.07.16b2 (ready for QA)

- **N-0050**: Anytype two-way task sync — Phase A (core engine + MCP tools) + Phase B (Desktop Settings UI)

### v26.07.16b1 (ready for QA)

- Open **v26.07.16** release branch; docs hub consolidated into root `README.md`

### v26.07.02b1 (shipped)

- **B-0029**: Desktop–web shell parity — shared `TopBar`, web-aligned titles, settings/profile back nav, Playwright parity gate

### v26.07.01b1 (shipped)

- **B-0029**: Global spacing restore · June 9 accent baseline (`#ff3366`) · compact Kanban toolbar as second header

### v26.06.30b2 (ready for QA)

- Nightly dev push seal for release **v26.06.30** (same feature set as b1)

### v26.06.30b1 (ready for QA)

- **N-0045**: Quick Blocks as reusable linked tasks + placement picker
- **N-0046**: Event section below Task Name on add/edit forms
- **N-0047**: Events/calendar right column on timeline overlap
- **N-0048**: Kanban sort + manual column order + refresh sort
- **N-0049**: Kanban filter + saved views (Anytype-style)

### v26.06.19b1 (ready for QA)

- Nightly dev push seal for release **v26.06.19**

### v26.06.14b3 (ready for QA)

- **B-0028**: Shell “Now” task alignment to clock

### v26.06.14b2 (ready for QA)

- **B-0027**: Timeline Add nav opens add-task flow
- **N-0044**: Task edit bottom action bar

### v26.06.14b1 (ready for QA)

- **B-0025** · **B-0026**: Now-bar, calendar, accent polish
- **N-0038**–**N-0043**: QA polish batch (calendar, shell clock, accents)

### v26.06.13b1 (ready for QA)

- **B-0023** · **B-0024**: Slide toggles, calendar, shell clock fixes
- **N-0032**–**N-0037**: UI polish (toggles, calendar UX, tracking chrome)

### v26.06.12b3 (ready for QA)

- **B-0019**–**B-0022**: Event editor fields, GCal clock picker, drag snap, passive overlap
- **N-0030**: Calendar sticky weekday strip
- **N-0031**: Timeline nav exits calendar mode

### v26.06.12b2 (ready for QA)

- **N-0024**: Pause snap during drag + `resumeFollowAfterDrag`
- **N-0025**: Schedule Doing lock current; exclude `isEvent` from pack
- **N-0026**: User events — timeline blocks, all-day strip, GCal overlap, event drag
- **N-0027**: Continuous scroll calendar replaces month pager; calendar lookback setting
- **B-0018**: Events & calendar scheduling UX (batch umbrella)

### v26.06.09b1 (shipped 2026-06-09)

- **CI Ops v3**: Date+batch versioning, two-round design phase, `/RD` skill, Sprint 5 alignment

---

## [v26.06.09] - 2026-06-09

> Supersedes legacy `0.0.4` (fixes) and `0.0.3` sprint work (desktop focus).

### Fixed

- **BUG-001 / B-0001**: Windows installer force-closes tray/minimized Blocks before upgrade or uninstall (`installer.nsh` + session-end handling)
- **BUG-002 / B-0002**: `pnpm build:win` stops running `Blocks.exe` and uses `release/.build` to avoid locked `app.asar` (`prebuild:win` + `postbuild:win` scripts)
- **BUG-003 / B-0003**: Light and System themes apply on web and desktop — shared theme engine, CSS-variable Tailwind tokens, `ThemeSync` on web (`tests/e2e/theme.spec.ts`)

### Added

#### CI Ops & docs
- **CI Ops Framework**: Feature registry (`PP.PR.AA.SSS.FFF`), incidents (`B-####`), roadmap (`N-####`), `/NB` + `/NF` skills
- **CI Ops docs**: [FEATURE_REGISTRY.md](./FEATURE_REGISTRY.md), [INCIDENTS.md](./INCIDENTS.md), [ROADMAP.md](./ROADMAP.md), doc polish scripts

#### Sprint — Windows Desktop Focus (was 0.0.3)
- **PoweredUpLabs migration**: GitHub owner, CI branding check, resolved conflicted package files
- **Timeline visibility rule**: Only `status=doing` tasks with a schedule appear on the timeline
- **Remove from timeline**: X button moves task to **To Do** (keeps on Kanban)
- **Daily Clear Timeline**: Automatic midnight (00:00) timeline reset via hook + Electron main process timer
- **Grouped Routines**: Routine schema, Morning Routine seed, `RoutineGroups` UI on desktop timeline
- **Hermes ecosystem planning**: Architecture doc for Poe/Blocks/BillBot/Mailbot MCP integration
- **Anytype MCP setup**: `.cursor/mcp.json.example` and integration guides
- **Hermes + Cursor guide**: Provider auth and cross-tool workflow documentation
- **@blocks/mcp-server**: MCP tools for list/add/remove timeline, clear_timeline, spawn_routine
- **Windows desktop polish**: Tray icon fallback, Timeline tray shortcut, Ctrl+Shift+B global shortcut

---

## [0.0.3] - 2024-12-27

> Legacy semver. Feature work continued under [v26.06.09](#v260609---2026-06-09).

### Added

#### Sprint 2: Time Tracking & Notifications
- **Active Timer UI**: Floating timer with minimize/expand views
- **Timer Controls**: Start, pause, resume, and stop time tracking
- **Timer Persistence**: Timer state survives app refresh
- **Overtime Warnings**: Visual and notification alerts when exceeding estimates
- **Notification System**: Full notification support with permissions
- **Task Reminders**: Schedulable reminders before tasks
- **Daily Summary**: End-of-day productivity summary notifications

#### Sprint 3: Recurring Tasks & Advanced Features
- **Recurring Tasks Schema**: RecurrencePattern with daily/weekly/monthly options
- **RecurrenceSelector Component**: UI for configuring recurring patterns
- **Recurring Engine**: Auto-generation of recurring task instances
- **SubtaskEditor**: Interactive subtask list with progress tracking
- **TagInput**: Tag input with suggestions and filtering
- **TaskTemplates System**: Save and reuse task templates
- **BulkActions Component**: Bulk status, priority, tag, and delete actions
- **DataExport**: Export tasks to JSON and CSV formats

#### Sprint 4: P2P Sync & Android App
- **Sync Store**: Room-based sync with auto-generated IDs
- **SyncSettings Component**: P2P sync configuration UI
- **Device Discovery**: Track connected devices
- **React Native Mobile App**: Full mobile app with Expo
  - Tab-based navigation (AI, Kanban, Timeline, Blocks, Add)
  - Timeline with daily schedule view
  - Kanban with horizontal scrolling columns
  - Blocks quick add with haptic feedback
  - AI chat interface
  - Add/Edit task modals
  - Dark/light theme support

#### Sprint 5: Keyboard Shortcuts & UX Polish
- **Keyboard Shortcuts**: Ctrl+1-6 for navigation, Ctrl+N/F for actions
- **KeyboardShortcutsHelp Modal**: Display available shortcuts
- **Page Transitions**: Smooth animations between pages
- **Animation Components**: FadeIn, SlideIn, ScaleIn, StaggeredList
- **CSS Animations**: Slide, scale, bounce, pulse, shimmer effects
- **Focus and Hover Effects**: Improved interactive feedback

### Changed
- Updated version to 0.0.3 across all packages
- Extended Task schema with recurring and subtask fields
- Added TaskTemplate and Tag types to core
- Database migrated to version 2

---

## [0.0.2] - 2024-12-27

### Added
- **Desktop App Installer**: Full NSIS installer with Install/Uninstall/Modify support
- **Auto-Updater**: Automatic update checking and installation via GitHub Releases
- **Blocks Page Overhaul**:
  - Tap block tiles to instantly create and schedule tasks
  - Edit mode with drag-and-drop reordering
  - Delete blocks with confirmation
  - Create new blocks with custom name, duration, category, and color
- **BlockCategory System**: Categorize blocks as Productive, Chores, Putzing, or Custom
- **CreateBlockModal**: Modal dialog for creating and editing block templates
- **EditableQuickAddGrid**: Drag-and-drop grid component for block management
- **Kanban Scaling Fix**: Add Task buttons now properly visible above navigation bar
- **Playwright Tests**: Comprehensive E2E tests for Blocks page and Kanban scaling
- **Dev Branch**: Created `dev` branch for ongoing development

### Changed
- Updated desktop app version to 0.2.0
- Improved block tile colors to match Anytype reference
- Updated Playwright config to use port 3003

### Fixed
- Desktop Kanban page scaling issues
- Block tiles now use category-based color presets

---

## [0.1.0] - 2024-12-26

### Added
- **Initial Release**
- Monorepo structure with Turborepo and pnpm
- Web PWA with Next.js 14
- Desktop app with Electron
- Core package with TypeScript types and business logic
- UI package with shared React components
- Local-first storage with Dexie.js (IndexedDB)
- Anytype-aligned task schema:
  - Block Size (15min, 30min, 1hour, 1week)
  - Block Count (1-5)
  - Priority (1-5)
  - Status (Backlog, Design, To-Do, Doing, Review, Done)
  - Access Contexts (Home, Errand, Computer, Phone)
- Kanban board with 6 status columns
- Timeline view with 24-hour display
- Blocks page for quick time logging
- AI integration with Google Gemini
- Local-first sync preparation with Yjs
- Playwright testing suite

---

## Version history

| Version | Date | Description |
|---------|------|-------------|
| v26.07.16 | 2026-07-16 | B-0029 padding cascade fix (**b3** shipped) · Anytype sync (**b2** QA) |
| v26.07.02 | 2026-07-02 | Desktop–web shell parity (B-0029) — **v26.07.02b1** shipped |
| v26.07.01 | 2026-07-01 | Spacing/accent restore (B-0029) — **v26.07.01b1** shipped |
| v26.06.30 | 2026-06-30 | Kanban sort/filter/views + reusable blocks (N-0045–N-0049) — **b1/b2** QA |
| v26.06.19 | 2026-06-19 | Nightly seal — **v26.06.19b1** QA |
| v26.06.14 | 2026-06-14 | Timeline add-task, shell Now alignment — **b1–b3** QA |
| v26.06.13 | 2026-06-13 | UI polish — slide toggles, calendar — **v26.06.13b1** QA |
| v26.06.12 | 2026-06-12 | Events & calendar UX — **v26.06.12b2–b3** QA |
| v26.06.09 | 2026-06-09 | CI Ops v3, themes, installer fixes, desktop sprint work |
| 0.0.3 | 2024-12-27 | Time tracking, recurring tasks, mobile app, shortcuts (legacy semver) |
| 0.0.2 | 2024-12-27 | Desktop installer, Blocks page overhaul |
| 0.1.0 | 2024-12-26 | Initial development release |

---

## Versioning guidelines

**Current (CI Ops):** `vYY.MM.DD` release + `vYY.MM.DDbX` implementation batches. See [CI_OPS_FRAMEWORK.md](./CI_OPS_FRAMEWORK.md).

**Legacy semver (pre-2026):**
- **MAJOR** (X.0.0): Breaking changes, major UI overhauls, architectural changes
- **MINOR** (0.X.0): New features, significant enhancements
- **PATCH** (0.0.X): Bug fixes, minor improvements

---

## Release process

1. Ship batch via `pnpm build:release` (or `/BUILD` skill) — see [CI_OPS_FRAMEWORK.md](./CI_OPS_FRAMEWORK.md).
2. Update this file under **[Unreleased]** or the matching `vYY.MM.DD` section.
3. On incident fix: add **Fixed** line + link **B-####** in [INCIDENTS.md](./INCIDENTS.md).
4. On feature ship: registry row ✅ in [FEATURE_REGISTRY.md](./FEATURE_REGISTRY.md) + ROADMAP batch log.

**Legacy tag flow (semver releases only):**

```bash
git add -A
git commit -m "chore: release v0.X.X"
git tag v0.X.X
git push origin dev --tags
```

Desktop installer: `pnpm build:win` or `pnpm build:release` from repo root.
