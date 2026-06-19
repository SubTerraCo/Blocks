# Changelog

All notable changes to the Blocks project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

**Versioning:** date-based releases `vYY.MM.DD` with implementation batches `vYY.MM.DDbX` (e.g. `v26.06.12b1`, `v26.06.12b10`). See [CI_OPS_FRAMEWORK.md](./CI_OPS_FRAMEWORK.md).

## [Unreleased] — Sprint 5 · v26.06.12

### v26.06.12b2 (ready for QA)

- **N-0024**: Pause snap during drag + `resumeFollowAfterDrag`
- **N-0025**: Schedule Doing lock current; exclude `isEvent` from pack
- **N-0026**: User events — timeline blocks, all-day strip, GCal overlap, event drag
- **N-0027**: Continuous scroll calendar replaces month pager; calendar lookback setting

### v26.06.09b1 (shipped 2026-06-09)

- **CI Ops v3**: Date+batch versioning, two-round design phase, `/RD` skill, Sprint 5 alignment

## [v26.06.09] - 2026-06-09 (was 0.0.4)

### Fixed

- **BUG-001 / B-0001**: Windows installer force-closes tray/minimized Blocks before upgrade or uninstall (`installer.nsh` + session-end handling)
- **BUG-002 / B-0002**: `pnpm build:win` stops running `Blocks.exe` and uses `release/.build` to avoid locked `app.asar` (`prebuild:win` + `postbuild:win` scripts)
- **BUG-003 / B-0003**: Light and System themes apply on web and desktop — shared theme engine, CSS-variable Tailwind tokens, `ThemeSync` on web (`tests/e2e/theme.spec.ts`)

### Added

- **CI Ops Framework**: Feature registry (`PP.PR.AA.SSS.FFF`), incidents (`B-####`), roadmap (`N-####`), `/NB` + `/NF` skills
- **CI Ops docs**: [FEATURE_REGISTRY.md](./FEATURE_REGISTRY.md), [INCIDENTS.md](./INCIDENTS.md), [ROADMAP.md](./ROADMAP.md), doc polish scripts

## [v26.06.09] - 2026-06-09 (was 0.0.3)

### Added

#### Sprint v0.0.3 — Windows Desktop Focus
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

## [0.0.3] - 2024-12-27

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

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 0.0.2 | 2024-12-27 | Desktop installer, optional auto-updater, Blocks page overhaul |
| 0.0.1 | 2024-12-26 | Initial development release |

**Note:** We're using 0.0.x versioning during active development. Version 0.1.0 will be the first MVP release.

---

## Versioning Guidelines

- **MAJOR** (X.0.0): Breaking changes, major UI overhauls, architectural changes
- **MINOR** (0.X.0): New features, significant enhancements
- **PATCH** (0.0.X): Bug fixes, minor improvements

## Release Process

1. Update version in:
   - `/package.json` (root)
   - `/apps/desktop/package.json`
   
2. Update `CHANGELOG.md` with new version notes

3. Commit and tag:
   ```bash
   git add -A
   git commit -m "chore: release v0.X.X"
   git tag v0.X.X
   git push origin dev --tags
   ```

4. Merge to master and create GitHub Release:
   ```bash
   git checkout master
   git merge dev
   git push origin master
   ```

5. Build and publish desktop app:
   ```bash
   cd apps/desktop
   pnpm build:win
   ```

