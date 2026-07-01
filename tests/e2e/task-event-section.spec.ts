// ============================================================================
// BLOCKS - Task event section placement (N-0046)
// The "Is event" toggle + its time fields must sit directly below Task Name,
// above the duration/blocks section.
// ============================================================================

import { test, expect } from "@playwright/test";

test.describe("Task event section placement @N-0046", () => {
  test("event section renders directly under Task Name on add-task", async ({ page }) => {
    await page.goto("/add-task");

    const nameInput = page.getByLabel(/task name/i);
    const eventFields = page.getByTestId("task-event-fields");
    const eventToggle = page.getByTestId("add-task-is-event");

    await expect(nameInput).toBeVisible();
    await expect(eventFields).toBeVisible();
    await expect(eventToggle).toBeVisible();

    const nameBox = await nameInput.boundingBox();
    const eventBox = await eventFields.boundingBox();
    const durationLabel = page.getByText(/^Duration:/);
    const durationBox = await durationLabel.boundingBox();

    expect(nameBox).not.toBeNull();
    expect(eventBox).not.toBeNull();
    expect(durationBox).not.toBeNull();

    // Event section is below the name field...
    expect(eventBox!.y).toBeGreaterThan(nameBox!.y);
    // ...and above the duration/blocks section.
    expect(eventBox!.y).toBeLessThan(durationBox!.y);
  });

  test("toggling event hides the duration/blocks section", async ({ page }) => {
    await page.goto("/add-task");

    await expect(page.getByText(/^Duration:/)).toBeVisible();

    await page.getByTestId("add-task-is-event").click();

    // Once it's an event, duration/blocks is hidden (B-0019 interaction).
    await expect(page.getByText(/^Duration:/)).toHaveCount(0);
    await expect(page.getByTestId("add-task-event-all-day")).toBeVisible();
  });
});
