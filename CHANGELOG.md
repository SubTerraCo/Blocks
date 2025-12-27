# Changelog

All notable changes to the Blocks project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

