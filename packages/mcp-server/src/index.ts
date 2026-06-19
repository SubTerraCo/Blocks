#!/usr/bin/env node
/**
 * @blocks/mcp-server — MCP tools for Blocks task/timeline management.
 *
 * Usage (Cursor / Hermes mcp.json):
 * {
 *   "mcpServers": {
 *     "blocks": {
 *       "command": "node",
 *       "args": ["path/to/packages/mcp-server/dist/index.js"],
 *       "env": { "BLOCKS_MCP_DATA_PATH": "C:/Users/you/.blocks/mcp-data.json" }
 *     }
 *   }
 * }
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { BlocksMcpStore } from "./store.js";

const store = new BlocksMcpStore();

const server = new Server(
  { name: "blocks-mcp", version: "0.0.5" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "list_tasks",
      description: "List all tasks, optionally filtered by status",
      inputSchema: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["backlog", "design", "todo", "doing", "review", "done"],
          },
        },
      },
    },
    {
      name: "list_timeline_tasks",
      description: "List tasks currently on today's timeline (status=doing with schedule)",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "create_task",
      description: "Create a new task on the Kanban board",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string" },
          status: {
            type: "string",
            enum: ["backlog", "design", "todo", "doing", "review", "done"],
            default: "todo",
          },
          priority: { type: "string", enum: ["1", "2", "3", "4", "5"], default: "3" },
        },
        required: ["name"],
      },
    },
    {
      name: "add_to_timeline",
      description: "Place a task on the timeline (sets status=doing and scheduledAt)",
      inputSchema: {
        type: "object",
        properties: {
          taskId: { type: "string" },
          scheduledAt: { type: "string", description: "ISO datetime" },
        },
        required: ["taskId", "scheduledAt"],
      },
    },
    {
      name: "remove_from_timeline",
      description: "Remove task from timeline without deleting (status→todo, clears schedule)",
      inputSchema: {
        type: "object",
        properties: { taskId: { type: "string" } },
        required: ["taskId"],
      },
    },
    {
      name: "clear_timeline",
      description: "Clear timeline for a new day (midnight reset logic)",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "spawn_routine",
      description: "Spawn tasks from a saved routine (e.g. Morning Routine)",
      inputSchema: {
        type: "object",
        properties: {
          routineId: { type: "string" },
          startAt: { type: "string", description: "ISO datetime for first task" },
        },
        required: ["routineId"],
      },
    },
    {
      name: "export_tasks_to_anytype_markdown",
      description:
        "Export all tasks as markdown for import into Anytype via anytype-mcp",
      inputSchema: { type: "object", properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list_tasks": {
        const tasks = await store.listTasks(args?.status as string | undefined);
        return { content: [{ type: "text", text: JSON.stringify(tasks, null, 2) }] };
      }
      case "list_timeline_tasks": {
        const tasks = await store.listTimelineTasks();
        return { content: [{ type: "text", text: JSON.stringify(tasks, null, 2) }] };
      }
      case "create_task": {
        const task = await store.createTask({
          name: String(args?.name),
          status: (args?.status as string) ?? "todo",
          priority: (args?.priority as string) ?? "3",
        });
        return { content: [{ type: "text", text: JSON.stringify(task, null, 2) }] };
      }
      case "add_to_timeline": {
        const task = await store.addToTimeline(
          String(args?.taskId),
          new Date(String(args?.scheduledAt))
        );
        return { content: [{ type: "text", text: JSON.stringify(task, null, 2) }] };
      }
      case "remove_from_timeline": {
        const task = await store.removeFromTimeline(String(args?.taskId));
        return { content: [{ type: "text", text: JSON.stringify(task, null, 2) }] };
      }
      case "clear_timeline": {
        const count = await store.clearTimeline();
        return { content: [{ type: "text", text: `Cleared ${count} task(s) from timeline` }] };
      }
      case "spawn_routine": {
        const tasks = await store.spawnRoutine(
          String(args?.routineId),
          args?.startAt ? new Date(String(args.startAt)) : new Date()
        );
        return { content: [{ type: "text", text: JSON.stringify(tasks, null, 2) }] };
      }
      case "export_tasks_to_anytype_markdown": {
        const md = await store.exportTasksMarkdown();
        return { content: [{ type: "text", text: md }] };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
      isError: true,
    };
  }
});

async function main() {
  await store.init();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
