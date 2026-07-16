# Blocks

> AI-powered time management app for productivity enhancement

Blocks is a cross-platform time/task management application that uses AI to help schedule tasks and optimize your time. Built with a local-first architecture, your data stays on your device with optional sync capabilities.

**Current Release: v26.07.02** (Sprint 5 — active QA / pre-release development)

## Features

### Core Features

- **Kanban Board**: Organize tasks across 6 status columns (Backlog, Design, To-Do, Doing, Review, Done) with drag-and-drop support
- **Timeline View**: Visual day planner with time-based task blocks and current time indicator
- **Quick Blocks**: Instant task creation with customizable block templates for fast time logging
- **AI Assistant**: Google Gemini-powered chat for task scheduling suggestions and task search
- **Task Management**: Full CRUD operations with priority, duration, access context, tags, and more
- **Offline-First**: Core functionality works without internet connection

### Task Properties

Following an Anytype-inspired object model:

| Property | Type | Description |
|----------|------|-------------|
| Name | String | Task title (required) |
| Status | Enum | Backlog, Design, To-Do, Doing, Review, Done |
| Priority | 1-5 | 1 = Urgent, 5 = Minimal |
| Block Size | Enum | 15 Min, 30 Min, 1 Hour, 1 Week |
| Block Count | 1-5 | Multiplier for duration |
| Duration | Computed | Block Size × Block Count |
| Access Context | Multi-select | Home, Errand, Computer, Phone |
| Due Date | Date | Optional deadline |
| Tags | Array | Custom labels |
| Recurrence | Enum | None, Daily, Weekly, Monthly |
| Notes | Text | Additional details |
| Subtasks | Array | Nested task items |

### Desktop App (Windows)

- Native Windows installer with install/uninstall/modify capabilities
- System tray integration with quick actions
- Auto-update system with user choice (non-forced updates)
- Checks for updates on startup and daily
- Subtle in-app update notifications

## Tech Stack

| Layer | Technology |
|-------|------------|
| Language | TypeScript (everywhere) |
| Monorepo | Turborepo + pnpm |
| Web | Next.js 14 (App Router) |
| Desktop | Electron + electron-builder |
| Mobile | React Native (Expo) - Planned |
| Styling | Tailwind CSS |
| State | Zustand |
| Local DB | Dexie.js (IndexedDB) |
| AI | Google Gemini API |
| Sync | Yjs (CRDT) - In progress |
| Testing | Playwright |

## Project Structure

```
blocks/
├── packages/
│   ├── core/          # Shared business logic, types, storage, AI service
│   └── ui/            # Shared React components and design system
├── apps/
│   ├── web/           # Next.js PWA
│   ├── desktop/       # Electron app (Windows, macOS planned)
│   └── mobile/        # React Native (Expo) - Planned
├── tests/
│   ├── e2e/           # End-to-end tests
│   ├── integration/   # Integration tests
│   ├── visual/        # Visual regression tests
│   ├── accessibility/ # A11y tests
│   └── performance/   # Performance tests
└── .github/
    └── workflows/     # CI/CD pipelines
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/PoweredUpLabs/Blocks.git
cd Blocks

# Install dependencies
pnpm install

# Build packages
pnpm build

# Start development (web app)
pnpm dev --filter web

# Start desktop development
pnpm --filter desktop dev
```

### Google Calendar sign-in (dev)

Retail users connect via a hosted OAuth proxy — no local setup. For **local development**:

1. **Start the OAuth proxy** (you already did this):
   ```bash
   pnpm --filter @blocks/oauth-proxy dev
   ```
2. **Add Google credentials** — your proxy reports `googleConfigured: false` until this is done:
   ```bash
   cp apps/oauth-proxy/.env.example apps/oauth-proxy/.env
   # Edit .env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET from Google Cloud Console
   ```
3. Restart the proxy, then connect from **Profile** or **Settings → Google Calendar**.

Full checklist (dev + production deploy): [GOOGLE_OAUTH_ROLLOUT.md](Docs/Integrations/GOOGLE_OAUTH_ROLLOUT.md)

### Building

```bash
# Build all packages
pnpm build

# Build web app only
pnpm build --filter web

# Build Windows desktop installer
cd apps/desktop
pnpm build:win
# Output: apps/desktop/release/Blocks-Setup-x.x.x.exe
# Tip: close Blocks (or let prebuild:win stop it) if build fails on locked app.asar
```

### Documentation

All project documentation lives under `Docs/`. **This README is the single entry point.**

#### Core working docs

| Doc | Purpose |
|-----|---------|
| [FEATURE_REGISTRY.md](Docs/Working%20Docs-Features-Incidents/FEATURE_REGISTRY.md) | Canonical product spec, feature codes, matrices, page UX, data models |
| [ROADMAP.md](Docs/Working%20Docs-Features-Incidents/ROADMAP.md) | Active sprint planning, `N-####` specs, acceptance criteria, batch log |
| [INCIDENTS.md](Docs/Working%20Docs-Features-Incidents/INCIDENTS.md) | `B-####` incident history and regression tracking |
| [CHANGELOG.md](Docs/Working%20Docs-Features-Incidents/CHANGELOG.md) | Shipped release and batch summaries |
| [MANUAL_TEST_PLAN.md](Docs/Working%20Docs-Features-Incidents/MANUAL_TEST_PLAN.md) | Human QA checklist for flows automation skips |
| [CI_OPS_FRAMEWORK.md](Docs/Working%20Docs-Features-Incidents/CI_OPS_FRAMEWORK.md) | Versioning, IDs, release workflow, doc operating model |

#### Supporting folders

| Folder | Contents |
|--------|----------|
| [Integrations/](Docs/Integrations/) | OAuth, MCP, Hermes, Anytype, local-first architecture |
| [UI Graphics/](Docs/UI%20Graphics/) | Figma and GUI reference PNGs used by specs and QA |

#### Reading order

1. Product behavior or UX → `FEATURE_REGISTRY.md`
2. In-flight feature work → `ROADMAP.md`
3. Bugs or regressions → `INCIDENTS.md`
4. Release status → `CHANGELOG.md`
5. Manual verification → `MANUAL_TEST_PLAN.md`

**Deprecated doc stubs** (safe to delete): `Docs/CHANGELOG (Deprecated).md` · `Docs/README (Deprecated).md` — canonical content is root `README.md` + `Docs/Working Docs-Features-Incidents/CHANGELOG.md`.

### Tracking & CI ops

**Platforms:** DT Desktop · WB Web · AD Android · AP macOS · IO iOS · SH Shared UI · SB backend · MC MCP · CX CI

**Chat workflows:** `/NB` or **report bug** · `/NF` or **new feature** · `/RD` **next sprint planning** · `/BUILD` **release build for QA** (see `.cursor/skills/`)

**Release build (jump into testing):**

```bash
pnpm build:release:context   # show active batch + grep from ROADMAP
pnpm build:release           # compile · batch tests · Windows installer
pnpm test:features:roadmap:headed   # headed QA after install
```

### Testing

```bash
# Run all Playwright tests
pnpm test:e2e

# Run tests with UI
pnpm test:e2e:ui

# Run specific test file
pnpm test:e2e tests/e2e/kanban.spec.ts
```

## Desktop App Installation

### Windows

1. Download the latest `Blocks-Setup-x.x.x.exe` from [GitHub Releases](https://github.com/PoweredUpLabs/Blocks/releases)
2. Run the installer
3. Choose installation directory (optional)
4. Launch from Start Menu or Desktop shortcut

### Auto-Updates

- Updates are checked on app startup and once per day
- When an update is available, a subtle notification appears above the navigation bar
- Click "Install" to download and apply, or "Later" to dismiss
- Updates are never forced - you choose when to update

## Environment Variables

### Web App (`apps/web/.env.local`)

```env
# Google Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
```

### Desktop App

The Gemini API key is configured at build time. For development, you can set it in the renderer.

## Development Workflow

### Branch Strategy

- `master` - Production releases only
- `dev` - Active development branch

### Running specific apps

```bash
# Web app (http://localhost:3000)
pnpm dev --filter web

# Desktop app (development mode)
pnpm --filter desktop dev

# Build desktop for Windows
pnpm --filter desktop build:win
```

## Versioning

We use date-based versioning for active development:
- `v26.07.02` — Sprint 5 active release (batches `v26.07.02b1`, `b2`, ...)
- `0.1.0` - First MVP release (planned)
- `1.0.0` - Production release (future)

## Roadmap

Active sprint work, `N-####` specs, and the batch log live in **[ROADMAP.md](Docs/Working%20Docs-Features-Incidents/ROADMAP.md)**. Shipped summaries are in **[CHANGELOG.md](Docs/Working%20Docs-Features-Incidents/CHANGELOG.md)**.

High-level phases (see ROADMAP for current status):

- **Phase 1 — MVP Web + Desktop:** Core task management, Kanban, Timeline, Quick Blocks, AI, Windows installer
- **Phase 2 — Sync & Mobile:** P2P Yjs sync, React Native app
- **Phase 3 — Integrations:** Google Calendar, Anytype, advanced AI scheduling

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch from `dev`
3. Make your changes
4. Run tests (`pnpm test:e2e`)
5. Submit a pull request to `dev`

## License

MIT - See [LICENSE.md](LICENSE.md)

---

Built with [Turborepo](https://turbo.build/repo), [Next.js](https://nextjs.org/), [Electron](https://www.electronjs.org/), and [Tailwind CSS](https://tailwindcss.com/).
