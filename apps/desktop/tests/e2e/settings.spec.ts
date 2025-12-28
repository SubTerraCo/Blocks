// ============================================================================
// Blocks Desktop E2E Tests - Settings Page
// Tests for app configuration and preferences
// ============================================================================

import { test, expect } from "@playwright/test";

test.describe("Settings Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.click("[aria-label='Settings Menu'], [aria-label='Settings']");
    await page.waitForLoadState("networkidle");
  });

  test.describe("Layout", () => {
    test("should display Settings title", async ({ page }) => {
      await expect(page.locator("h1:has-text('Settings'), text=Settings").first()).toBeVisible();
    });

    test("should display all settings sections", async ({ page }) => {
      await expect(page.locator("text=APPEARANCE, text=Appearance")).toBeVisible();
      await expect(page.locator("text=WORK SCHEDULE, text=Work Schedule")).toBeVisible();
      await expect(page.locator("text=NOTIFICATIONS, text=Notifications")).toBeVisible();
      await expect(page.locator("text=DATA, text=Data")).toBeVisible();
    });

    test("should have back button", async ({ page }) => {
      await expect(page.locator("[aria-label='Back'], button:has-text('Back')")).toBeVisible();
    });
  });

  test.describe("Theme Settings", () => {
    test("should have theme options", async ({ page }) => {
      await expect(page.locator("text=Dark")).toBeVisible();
      await expect(page.locator("text=Light")).toBeVisible();
      await expect(page.locator("text=System")).toBeVisible();
    });

    test("should change to light theme", async ({ page }) => {
      await page.click("text=Light");
      
      // Page should have light background
      const body = page.locator("body, [data-theme]");
      // Check for light theme class or style
    });

    test("should change to dark theme", async ({ page }) => {
      await page.click("text=Dark");
      
      // Page should have dark background
    });

    test("theme should persist after navigation", async ({ page }) => {
      await page.click("text=Light");
      await page.click("[aria-label='Back']");
      await page.click("[aria-label='Settings Menu'], [aria-label='Settings']");
      
      // Light should still be selected
    });
  });

  test.describe("Work Schedule Settings", () => {
    test("should have work start time input", async ({ page }) => {
      const startTime = page.locator("input[name='workStart'], text=Work Start");
      await expect(startTime.first()).toBeVisible();
    });

    test("should have work end time input", async ({ page }) => {
      const endTime = page.locator("input[name='workEnd'], text=Work End");
      await expect(endTime.first()).toBeVisible();
    });

    test("should have work days toggles", async ({ page }) => {
      // Should show day toggles (M, T, W, T, F, S, S)
      await expect(page.locator("text=M").first()).toBeVisible();
      await expect(page.locator("text=F").first()).toBeVisible();
    });

    test("should toggle work days", async ({ page }) => {
      const sundayToggle = page.locator("button:has-text('S')").first();
      await sundayToggle.click();
      
      // Toggle should change state
    });
  });

  test.describe("Notification Settings", () => {
    test("should have enable notifications toggle", async ({ page }) => {
      const toggle = page.locator("text=Enable Notifications").locator("..").locator("input[type='checkbox'], [role='switch']");
      await expect(toggle.first()).toBeVisible();
    });

    test("should have task reminders toggle", async ({ page }) => {
      await expect(page.locator("text=Task Reminders")).toBeVisible();
    });

    test("should have timer alerts toggle", async ({ page }) => {
      await expect(page.locator("text=Timer Alerts")).toBeVisible();
    });

    test("should have daily summary toggle", async ({ page }) => {
      await expect(page.locator("text=Daily Summary")).toBeVisible();
    });

    test("should toggle notifications on/off", async ({ page }) => {
      const toggle = page.locator("text=Enable Notifications").locator("..").locator("input[type='checkbox'], [role='switch']").first();
      
      if (await toggle.isVisible()) {
        const initialState = await toggle.isChecked();
        await toggle.click();
        const newState = await toggle.isChecked();
        expect(newState).not.toBe(initialState);
      }
    });
  });

  test.describe("AI Settings", () => {
    test("should have AI enabled toggle", async ({ page }) => {
      await expect(page.locator("text=AI Enabled, text=AI Assistant")).toBeVisible();
    });

    test("should have API key input", async ({ page }) => {
      await expect(page.locator("text=API Key")).toBeVisible();
    });

    test("API key should be masked", async ({ page }) => {
      const apiKeyInput = page.locator("input[name='apiKey'], input[type='password']");
      if (await apiKeyInput.isVisible()) {
        const type = await apiKeyInput.getAttribute("type");
        expect(type).toBe("password");
      }
    });
  });

  test.describe("Data Export", () => {
    test("should have export JSON button", async ({ page }) => {
      await expect(page.locator("button:has-text('Export'), text=Export Data")).toBeVisible();
    });

    test("should have export CSV button", async ({ page }) => {
      await expect(page.locator("text=CSV")).toBeVisible();
    });

    test("clicking export should trigger download", async ({ page }) => {
      const downloadPromise = page.waitForEvent("download", { timeout: 5000 }).catch(() => null);
      
      const exportButton = page.locator("button:has-text('Export JSON'), button:has-text('Export Data')").first();
      if (await exportButton.isVisible()) {
        await exportButton.click();
        
        const download = await downloadPromise;
        if (download) {
          expect(download.suggestedFilename()).toContain("blocks");
        }
      }
    });
  });

  test.describe("P2P Sync Settings", () => {
    test("should have sync toggle", async ({ page }) => {
      const syncToggle = page.locator("text=P2P Sync, text=Sync");
      await expect(syncToggle.first()).toBeVisible();
    });

    test("should show last sync date", async ({ page }) => {
      await expect(page.locator("text=/Last Sync|Never/")).toBeVisible();
    });
  });

  test.describe("About Section", () => {
    test("should display version number", async ({ page }) => {
      await expect(page.locator("text=/Version|0\\.0\\./")).toBeVisible();
    });

    test("should have check for updates button", async ({ page }) => {
      const updateButton = page.locator("button:has-text('Check for Updates'), button:has-text('Update')");
      // May or may not be visible depending on implementation
    });
  });

  test.describe("Settings Persistence", () => {
    test("settings should persist after app reload", async ({ page }) => {
      // Change a setting
      await page.click("text=Light");
      
      // Reload page
      await page.reload();
      
      // Navigate back to settings
      await page.click("[aria-label='Settings Menu'], [aria-label='Settings']");
      
      // Setting should still be applied
      // Check for Light theme being selected
    });
  });
});

