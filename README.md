# Blocks

> AI-powered time management app for productivity enhancement

Blocks is a cross-platform time/task management application that uses AI to suggest tasks and optimize your time. It integrates with Google Calendar and features intelligent task suggestions based on priority and available time.

## Features

- **Timeline View**: See your day at a glance with time-based task blocks
- **Kanban Board**: Organize tasks in Backlog, Today, and Done columns
- **Quick Add Blocks**: Instantly log time for frequently used tasks
- **AI Suggestions**: Smart task recommendations to fill time gaps
- **Google Calendar Integration**: Sync with your calendar events
- **Cross-Platform**: Web (PWA), Desktop (Windows/macOS), Mobile (Android/iOS)
- **Local-First**: Your data stays on your device with optional cloud sync

## Tech Stack

| Layer | Technology |
|-------|------------|
| Language | TypeScript (everywhere) |
| Monorepo | Turborepo + pnpm |
| Web | Next.js 14 (App Router) |
| Desktop | Electron |
| Mobile | React Native (Expo) |
| Styling | Tailwind CSS |
| State | Zustand |
| Local DB | Dexie.js / expo-sqlite |
| Auth | NextAuth.js v5 |
| AI | Vercel AI SDK (OpenAI, Claude, Ollama) |

## Project Structure

```
blocks/
├── packages/
│   ├── core/          # Shared business logic & types
│   └── ui/            # Shared React components
├── apps/
│   ├── web/           # Next.js PWA
│   ├── desktop/       # Electron app
│   └── mobile/        # React Native (Expo)
└── .github/
    └── workflows/     # CI/CD pipelines
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+

### Installation

```bash
# Install dependencies
pnpm install

# Start development (all apps)
pnpm dev

# Start web only
pnpm --filter web dev

# Build all packages
pnpm build

# Run linting
pnpm lint

# Type checking
pnpm type-check
```

## Development

### Adding a new package

```bash
# Create package directory
mkdir -p packages/my-package/src

# Initialize package.json
cd packages/my-package
pnpm init
```

### Running specific apps

```bash
# Web app
pnpm --filter web dev

# Desktop app
pnpm --filter desktop dev

# Mobile app
pnpm --filter mobile start
```

## Environment Variables

Create `.env.local` files in the respective app directories:

### Web App (`apps/web/.env.local`)

```env
# Auth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI Providers (optional - users can add their own)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

