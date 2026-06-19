# Blocks Local-First Architecture (Sprint 5)

## Summary

Blocks **does not require a user data server** for web or desktop. Task, kanban, timeline, and settings data live in **IndexedDB (Dexie)** in the browser/Electron renderer.

The only backend component in Sprint 5 is the **OAuth proxy** ([`apps/oauth-proxy`](../../apps/oauth-proxy/README.md)), which exchanges Google auth codes for tokens. It never stores tasks.

**Retail rollout:** [GOOGLE_OAUTH_ROLLOUT.md](./GOOGLE_OAUTH_ROLLOUT.md) — deploy to `https://auth.blocks.app`, Google verification, production env wiring.

## Data by platform

| Platform | Storage | Sync |
|----------|---------|------|
| Web | IndexedDB (`BlocksDB`) | Yjs + WebRTC P2P (optional) |
| Desktop | IndexedDB (same schema) | Yjs + WebRTC P2P (optional) |
| Mobile | AsyncStorage (separate; future Dexie/SQLite) | Simulated stub |

## Google Calendar

- OAuth tokens → `User.providers[]` in Dexie
- Event cache → `calendarEvents` table (offline read of last sync)
- Timeline merge → `calendarEventsToTimeBlocks` + `mergeTimelineBlocks`

## P2P sync (not AnySync)

Sprint 5 completes **Yjs + y-webrtc** with a **Dexie↔Yjs bridge** (`DexieYjsBridge`). Same room ID on trusted devices syncs tasks without a Blocks-hosted database.

**AnySync** (Anytype's Go protocol) is documented as a **v0.1+ research spike** — not a drop-in replacement. See [HERMES_ECOSYSTEM_ARCHITECTURE.md](./HERMES_ECOSYSTEM_ARCHITECTURE.md).

## PWA

Web manifest exists; service worker for asset caching is **stretch / v0.0.6**. Offline task CRUD works today via IndexedDB without a service worker.

## Hosting

| Component | Hosting |
|-----------|---------|
| Web app | Static (Vercel, Netlify, Cloudflare Pages) |
| OAuth proxy | Serverless function or small Node service |
| User data | **None** (client-side only) |
