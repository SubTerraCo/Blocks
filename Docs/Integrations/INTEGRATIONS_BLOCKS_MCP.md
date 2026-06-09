# Blocks MCP Server

MCP tools for Hermes/Cursor to manage Blocks tasks and timeline.

## Tools

| Tool | Description |
|------|-------------|
| `list_tasks` | List Kanban tasks (optional status filter) |
| `list_timeline_tasks` | List today's timeline (status=**doing** only) |
| `create_task` | Create a task on the Kanban board |
| `add_to_timeline` | Set status=doing + scheduledAt |
| `remove_from_timeline` | Set status=todo, clear schedule (keeps on Kanban) |
| `clear_timeline` | Midnight reset logic |
| `spawn_routine` | Spawn routine tasks as doing + scheduled |

## Timeline Rule

**Only tasks with `status=doing` and a `scheduledAt` appear on the timeline.**

Removing from timeline = `remove_from_timeline` → moves to **To Do** column.

## Setup

```bash
pnpm --filter @blocks/mcp-server build
```

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "blocks": {
      "command": "node",
      "args": ["packages/mcp-server/dist/index.js"],
      "env": {
        "BLOCKS_MCP_DATA_PATH": "C:/Users/you/.blocks/mcp-data.json"
      }
    }
  }
}
```

Data persists to `BLOCKS_MCP_DATA_PATH` (default: `~/.blocks/mcp-data.json`).

See also: [HERMES_ECOSYSTEM_ARCHITECTURE.md](./HERMES_ECOSYSTEM_ARCHITECTURE.md)
