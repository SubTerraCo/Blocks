# Anytype MCP Integration

Connect Blocks development workflow to your local Anytype knowledge base via the official MCP server.

## Prerequisites

- [Anytype Desktop](https://anytype.io) v0.46+ running locally
- Node.js 20+ (for `npx`)
- API key from Anytype: **Settings → API Keys → Create new**

## Cursor Setup

1. Copy the example config:

```bash
cp .cursor/mcp.json.example .cursor/mcp.json
```

2. Edit `.cursor/mcp.json` and replace `<YOUR_ANYTYPE_API_KEY>` with your bearer token.

3. Restart Cursor. Confirm the MCP plug icon shows `anytype` as connected.

## Configuration Reference

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

### Self-hosted / CLI port

If using `anytype-cli` on port `31012`:

```json
"ANYTYPE_API_BASE_URL": "http://localhost:31012"
```

Default local endpoint: `http://127.0.0.1:31009`

## Validation Commands (in Cursor chat)

- "List my Anytype spaces"
- "Create a note called Blocks Sprint v0.0.3"
- "Search Anytype for Morning Routine"

## Security Notes

- Never commit `.cursor/mcp.json` with real API keys (gitignored)
- API keys are local-only; Anytype desktop must be running
- Rotate keys if exposed

## Blocks ↔ Anytype Data Model Alignment

Blocks task schema mirrors Anytype object properties (status, priority, tags, recurrence). Future `blocks-mcp` will sync selected fields bidirectionally.

See also: [HERMES_ECOSYSTEM_ARCHITECTURE.md](./HERMES_ECOSYSTEM_ARCHITECTURE.md)
