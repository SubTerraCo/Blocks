// N-0019 · MCP export mode (markdown + ExportData shape)
import { test, expect } from "@playwright/test";
import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { TaskEngine, type ExportData } from "@blocks/core";

function exportTasksMarkdown(
  tasks: ReturnType<typeof TaskEngine.createTask>[],
): string {
  const lines = ["# Blocks tasks export", ""];
  for (const task of tasks) {
    lines.push(`## ${task.name}`);
    lines.push(`- Status: ${task.status}`);
    lines.push(`- Priority: ${task.priority}`);
    if (task.scheduledAt) {
      lines.push(`- Scheduled: ${new Date(task.scheduledAt).toISOString()}`);
    }
    if (task.notes) lines.push(`\n${task.notes}\n`);
  }
  return lines.join("\n");
}

test.describe("MC.EN.02.110 · MCP export mode @N-0019 @core", () => {
  test("export markdown includes task fields", () => {
    const task = TaskEngine.createTask({
      name: "Manual QA task",
      status: "todo",
      priority: "3",
      assigneeId: "me",
      accessContexts: [],
      blockSize: "30min",
      blockCount: 1,
      tags: [],
      subtasks: [],
      reminders: [],
      recurrence: "none",
      isQuickAdd: false,
      isPutzing: false,
    });
    const md = exportTasksMarkdown([task]);
    expect(md).toContain("Manual QA task");
    expect(md).toContain("# Blocks tasks export");
    expect(md).toContain("- Status: todo");
  });

  test("export mode writes ExportData JSON snapshot", async () => {
    const dir = await mkdtemp(join(tmpdir(), "blocks-mcp-"));
    const exportPath = join(dir, "export.json");
    const task = TaskEngine.createTask({
      name: "Snapshot task",
      status: "doing",
      priority: "2",
      assigneeId: "me",
      accessContexts: [],
      blockSize: "30min",
      blockCount: 1,
      tags: [],
      subtasks: [],
      reminders: [],
      recurrence: "none",
      isQuickAdd: false,
      isPutzing: false,
    });
    const payload: ExportData = {
      version: "0.0.5",
      exportedAt: new Date().toISOString(),
      tasks: [task],
      quickAddBlocks: [],
      timeEntries: [],
      settings: {} as ExportData["settings"],
    };
    await mkdir(dirname(exportPath), { recursive: true });
    await writeFile(exportPath, JSON.stringify(payload, null, 2), "utf8");
    const raw = await readFile(exportPath, "utf8");
    const parsed = JSON.parse(raw);
    expect(parsed.version).toBe("0.0.5");
    expect(parsed.tasks).toHaveLength(1);
    expect(parsed.tasks[0].name).toBe("Snapshot task");
    await rm(dir, { recursive: true, force: true });
  });
});
