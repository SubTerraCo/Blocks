# Hermes Agent + Cursor Integration

Use Hermes Agent as the local orchestrator with Cursor subscription billing for model access.

## Prerequisites

- [Hermes Agent](https://github.com/NousResearch/hermes-agent) installed locally
- Active Cursor subscription
- Anytype MCP configured (see `INTEGRATIONS_ANYTYPE_MCP.md`)

## Install Hermes

```bash
pip install hermes-agent
# or follow upstream install docs for your platform
```

## Cursor Provider (Billing + Models)

As of June 2026, Hermes supports a native Cursor provider:

```bash
hermes auth add cursor
```

This OAuth flow links your Cursor subscription. Hermes routes agent turns through Cursor's Agent API for model selection and billing.

### Verify

```bash
hermes auth list
hermes models list --provider cursor
```

## Connect Anytype to Hermes

Add to Hermes MCP config (location varies by install; often `~/.hermes/mcp.json`):

```json
{
  "mcpServers": {
    "anytype": {
      "command": "npx",
      "args": ["-y", "@anyproto/anytype-mcp"],
      "env": {
        "OPENAPI_MCP_HEADERS": "{\"Authorization\":\"Bearer <YOUR_ANYTYPE_API_KEY>\", \"Anytype-Version\":\"2025-11-08\"}"
      }
    }
  }
}
```

## Can Hermes Connect Blocks ↔ Anytype via Cursor?

**Yes, indirectly:**

| Path | How |
|------|-----|
| Cursor IDE | Add both `anytype` MCP and future `blocks` MCP to `.cursor/mcp.json` |
| Hermes (Poe) | Register same MCP servers; Hermes orchestrates cross-tool workflows |
| Blocks app | Direct UI + local IndexedDB; MCP is for AI agents, not in-app yet |

**Recommended:** Hermes/Poe orchestrates; Blocks Desktop remains the task UI. v0.0.4 adds `@blocks/mcp-server` so agents can mutate Blocks data.

## Example Cross-Tool Prompt (Hermes)

> "Search Anytype for today's priorities, then tell me which ones aren't on my Blocks timeline yet."

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Cursor auth expired | Re-run `hermes auth add cursor` |
| Anytype MCP 401 | Regenerate API key; ensure desktop app running |
| No Blocks tools | Expected until v0.0.4 `blocks-mcp` ships |

See: [HERMES_ECOSYSTEM_ARCHITECTURE.md](./HERMES_ECOSYSTEM_ARCHITECTURE.md)
