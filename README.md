# Blocks

> AI-powered time management app for productivity enhancement

Blocks is a cross-platform time/task management application that uses AI to help schedule tasks and optimize your time. Built with a local-first architecture, your data stays on your device with optional sync capabilities.

**Current Version: 0.0.2** (Pre-release development)

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
git clone https://github.com/poweredupbass/Blocks.git
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

### Building

```bash
# Build all packages
pnpm build

# Build web app only
pnpm build --filter web

# Build Windows desktop installer
cd apps/desktop
pnpm build:win
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

1. Download the latest `Blocks-Setup-x.x.x.exe` from [GitHub Releases](https://github.com/poweredupbass/Blocks/releases)
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

We use semantic versioning:
- `0.0.x` - Pre-release development (current)
- `0.1.0` - First MVP release (planned)
- `1.0.0` - Production release (future)

## Roadmap

### Phase 1 (Current) - MVP Web + Desktop
- [x] Core task management
- [x] Kanban board with drag-drop
- [x] Timeline view
- [x] Quick blocks for fast time logging
- [x] AI assistant (Gemini)
- [x] Windows desktop app
- [x] Auto-update system
- [ ] Polish and bug fixes

### Phase 2 - Sync & Mobile
- [ ] Local-first P2P sync (Yjs/WebRTC)
- [ ] React Native mobile app
- [ ] iOS/Android builds
- [ ] Cross-device sync

### Phase 3 - Integrations
- [ ] Google Calendar sync
- [ ] Anytype integration
- [ ] Advanced AI scheduling

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
