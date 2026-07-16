# Integrations Docs

Supporting docs for external services, architecture, and MCP workflows.

| Doc | Purpose |
|-----|---------|
| [`LOCAL_FIRST_ARCHITECTURE.md`](./LOCAL_FIRST_ARCHITECTURE.md) | Data/storage model, sync boundaries, hosting assumptions |
| [`GOOGLE_OAUTH_ROLLOUT.md`](./GOOGLE_OAUTH_ROLLOUT.md) | Retail Google Calendar auth rollout and hosted proxy plan |
| [`INTEGRATIONS_BLOCKS_MCP.md`](./INTEGRATIONS_BLOCKS_MCP.md) | Blocks MCP server tools and setup |
| [`INTEGRATIONS_ANYTYPE_MCP.md`](./INTEGRATIONS_ANYTYPE_MCP.md) | Anytype MCP configuration for local knowledge-base workflows |
| [`INTEGRATIONS_ANYTYPE_SYNC.md`](./INTEGRATIONS_ANYTYPE_SYNC.md) | Two-way task sync architecture, field mapping, agent recipes (N-0050) |
| [`INTEGRATIONS_HERMES_CURSOR.md`](./INTEGRATIONS_HERMES_CURSOR.md) | Hermes Agent + Cursor provider setup |
| [`HERMES_ECOSYSTEM_ARCHITECTURE.md`](./HERMES_ECOSYSTEM_ARCHITECTURE.md) | Higher-level multi-product orchestration architecture |

Suggested reading order:

1. `LOCAL_FIRST_ARCHITECTURE.md`
2. `GOOGLE_OAUTH_ROLLOUT.md` if touching Google Calendar
3. `INTEGRATIONS_BLOCKS_MCP.md` or `INTEGRATIONS_ANYTYPE_MCP.md` for MCP work
4. Hermes docs only when working on cross-tool orchestration
