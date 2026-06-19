# Blocks OAuth Proxy

Minimal serverless-friendly Google OAuth proxy. **Exchanges auth codes only** — does not store user tasks or calendar data.

**Retail rollout:** [GOOGLE_OAUTH_ROLLOUT.md](../../Docs/Integrations/GOOGLE_OAUTH_ROLLOUT.md)

## Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/auth/google?returnUrl=...` | GET | Start OAuth (PKCE) → redirect to Google |
| `/auth/google/callback` | GET | Exchange code, redirect to `returnUrl` with tokens |
| `/auth/google/refresh` | POST | Refresh access token (`{ "refreshToken": "..." }`) |
| `/health` | GET | Health check (`googleConfigured` flag) |

## Environment

See [`.env.example`](./.env.example).

Register redirect URI in Google Cloud Console:

```
{OAUTH_PROXY_BASE_URL}/auth/google/callback
```

## Local dev

```bash
cp .env.example .env
# Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET

pnpm --filter @blocks/oauth-proxy dev
curl http://localhost:8787/health
```

## Deploy — Vercel

1. Import project with root directory `apps/oauth-proxy`
2. Set env vars in Vercel dashboard (see rollout doc)
3. Deploy — `vercel.json` routes all paths to `api/index.mjs`

```bash
cd apps/oauth-proxy
vercel --prod
```

## Deploy — Node host (Railway / Fly / VPS)

```bash
pnpm start   # respects PORT env
```

## Client env (web/desktop)

| App | Variable |
|-----|----------|
| Web | `NEXT_PUBLIC_OAUTH_PROXY_URL` |
| Desktop | `VITE_OAUTH_PROXY_URL` |

When unset, clients use `http://localhost:8787` in dev and `https://auth.blocks.app` in production builds.
