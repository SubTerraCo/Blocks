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
| `export_tasks_to_anytype_markdown` | Markdown export for Anytype MCP import workflows |
| `push_task_to_anytype` | N-0050 — push one task to the configured Anytype space |
| `pull_tasks_from_anytype` | N-0050 — pull Anytype Task objects (LWW merge; schedule conflicts reported) |
| `sync_linked_tasks` | N-0050 — full two-way sync pass (pull, merge, push, create both sides) |

Anytype sync tools need `ANYTYPE_API_KEY` + `ANYTYPE_SPACE_ID` env vars (optional `ANYTYPE_API_BASE_URL`). See [INTEGRATIONS_ANYTYPE_SYNC.md](./INTEGRATIONS_ANYTYPE_SYNC.md).

## Data modes

| Mode | Env | Use case |
|------|-----|----------|
| **file** (default) | `BLOCKS_MCP_DATA_PATH` | Isolated agent JSON at `~/.blocks/mcp-data.json` |
| **export** | `BLOCKS_MCP_MODE=export` + `BLOCKS_MCP_EXPORT_PATH` | Read/write Desktop **Export Data** JSON snapshot |

Export real user data from Blocks Desktop Settings → Export JSON, then point `BLOCKS_MCP_EXPORT_PATH` at that file.

## Timeline Rule

**Only tasks with `status=doing` and a `scheduledAt` appear on the timeline.**

Removing from timeline = `remove_from_timeline` → moves to **To Do** column.

## Setup

```bash
pnpm --filter @blocks/mcp-server build
```

See [`.cursor/mcp.json.example`](../../.cursor/mcp.json.example) for dual **blocks** + **blocks-export** configs alongside Anytype MCP.

See also: [HERMES_ECOSYSTEM_ARCHITECTURE.md](./HERMES_ECOSYSTEM_ARCHITECTURE.md) · [LOCAL_FIRST_ARCHITECTURE.md](./LOCAL_FIRST_ARCHITECTURE.md)
