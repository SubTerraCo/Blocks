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
import {
  AnytypeClient,
  AnytypeSyncEngine,
  applyPull,
  createTaskFromAnytypeObject,
  planTwoWaySync,
} from "@blocks/core";
import { BlocksMcpStore } from "./store.js";

const store = new BlocksMcpStore();

/** N-0050: Anytype sync engine from env (ANYTYPE_API_KEY + ANYTYPE_SPACE_ID). */
function createAnytypeEngine(): AnytypeSyncEngine {
  const apiKey = process.env.ANYTYPE_API_KEY;
  const spaceId = process.env.ANYTYPE_SPACE_ID;
  if (!apiKey || !spaceId) {
    throw new Error(
      "Anytype sync requires ANYTYPE_API_KEY and ANYTYPE_SPACE_ID env vars (see .cursor/mcp.json.example)",
    );
  }
  const client = new AnytypeClient({
    apiKey,
    baseUrl: process.env.ANYTYPE_API_BASE_URL,
  });
  return new AnytypeSyncEngine(client, { spaceId });
}

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
    {
      name: "push_task_to_anytype",
      description:
        "Push one Blocks task to the configured Anytype space (creates or updates the linked object)",
      inputSchema: {
        type: "object",
        properties: { taskId: { type: "string" } },
        required: ["taskId"],
      },
    },
    {
      name: "pull_tasks_from_anytype",
      description:
        "Pull Task objects from the configured Anytype space into the Blocks store (LWW merge; schedule conflicts reported, not applied)",
      inputSchema: {
        type: "object",
        properties: {
          confirmSchedule: {
            type: "boolean",
            description:
              "Apply schedule changes that overlap the timeline via push-back (default false: report only)",
            default: false,
          },
        },
      },
    },
    {
      name: "sync_linked_tasks",
      description:
        "Full two-way Anytype sync: pull, last-write-wins merge, push winners, create missing tasks on both sides",
      inputSchema: {
        type: "object",
        properties: {
          confirmSchedule: {
            type: "boolean",
            description:
              "Apply schedule changes that overlap the timeline via push-back (default false: report only)",
            default: false,
          },
        },
      },
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
      case "push_task_to_anytype": {
        const engine = createAnytypeEngine();
        const tasks = await store.listTasks();
        const task = tasks.find((t) => t.id === String(args?.taskId));
        if (!task) throw new Error(`Task not found: ${String(args?.taskId)}`);
        const linked = await engine.pushTask(task);
        await store.updateTask(linked);
        return { content: [{ type: "text", text: JSON.stringify(linked, null, 2) }] };
      }
      case "pull_tasks_from_anytype": {
        const engine = createAnytypeEngine();
        const tasks = await store.listTasks();
        const objects = await engine.pullObjects();
        const plan = planTwoWaySync(tasks, objects);

        let next = [...tasks];
        const skipped: string[] = [];
        let pulled = 0;
        for (const pull of plan.pullIntoBlocks) {
          const result = applyPull(next, pull, {
            confirmSchedule: Boolean(args?.confirmSchedule),
          });
          if (result.applied) {
            next = result.tasks;
            pulled += 1;
          } else {
            skipped.push(
              `${pull.task.name}: schedule overlaps ${result.scheduleConflicts
                .map((c) => c.taskName)
                .join(", ")} (re-run with confirmSchedule=true to apply with push-back)`,
            );
          }
        }
        for (const obj of plan.createInBlocks) {
          next.push(createTaskFromAnytypeObject(obj));
        }
        await store.replaceTasks(next);
        const summary = [
          `Pulled ${pulled} update(s), created ${plan.createInBlocks.length} task(s).`,
          ...skipped.map((s) => `Skipped — ${s}`),
        ].join("\n");
        return { content: [{ type: "text", text: summary }] };
      }
      case "sync_linked_tasks": {
        const engine = createAnytypeEngine();
        const tasks = await store.listTasks();
        const result = await engine.syncTasks(tasks, {
          confirmSchedule: Boolean(args?.confirmSchedule),
        });
        await store.replaceTasks(result.tasks);
        const summary = [
          `Synced: pushed ${result.pushed}, pulled ${result.pulled}, created ${result.createdInAnytype} in Anytype, ${result.createdInBlocks} in Blocks.`,
          ...result.pendingScheduleConflicts.map(
            (p) =>
              `Pending — ${p.task.name}: schedule overlaps ${p.scheduleConflicts
                .map((c) => c.taskName)
                .join(", ")} (re-run with confirmSchedule=true)`,
          ),
        ].join("\n");
        return { content: [{ type: "text", text: summary }] };
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
