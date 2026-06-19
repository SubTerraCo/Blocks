// v26.06.14b2 · Timeline add-task + task edit bottom bar
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test, expect } from "@playwright/test";

function readRepoFile(relPath: string): string {
  return readFileSync(join(process.cwd(), relPath), "utf8");
}

test.describe("b14-b2 @B-0027 @B-0028 @N-0044 @core", () => {
  test("N-0044 task edit bottom bar is fixed above nav without bg strip", () => {
    const src = readRepoFile("packages/ui/src/lib/timeline-bottom-actions.ts");
    expect(src).toContain("TASK_EDIT_BOTTOM_BAR");
    expect(src).toContain("fixed bottom-[calc(4rem+12px)]");
    expect(src).not.toMatch(/TASK_EDIT_BOTTOM_BAR[\s\S]*bg-bg-primary/);
  });

  test("B-0027 bottom nav add button has QA test id", () => {
    const src = readRepoFile("packages/ui/src/components/bottom-nav.tsx");
    expect(src).toContain('data-testid="bottom-nav-add"');
  });

  test("B-0027 desktop App clears edit state on nav add from timeline", () => {
    const src = readRepoFile("apps/desktop/src/renderer/App.tsx");
    expect(src).toContain("setEditingTask(null)");
    expect(src).toContain('currentPage === "timeline" ? "doing" : "backlog"');
    expect(src).toContain("setReturnPage");
  });

  test("N-0044 task edit page flanks tracking controls in bottom bar", () => {
    const src = readRepoFile("apps/desktop/src/renderer/components/TaskEditPage.tsx");
    expect(src).toContain("task-edit-bottom-bar");
    expect(src).toContain('<TrackingControlBar layout="inline" />');
    expect(src).not.toContain("sticky bottom-0 bg-bg-primary");
  });

  test("B-0028 Now task hugs clock with right-aligned mirror layout", () => {
    const src = readRepoFile("apps/desktop/src/renderer/components/TrackingBar.tsx");
    expect(src).toContain('label="Now"');
    expect(src).toMatch(/flex min-w-0 justify-end[\s\S]*HeaderTaskChip[\s\S]*side="left"/);
    expect(src).toMatch(/flex min-w-0 justify-start[\s\S]*HeaderTaskChip[\s\S]*side="right"/);
  });
});
