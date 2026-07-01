#!/usr/bin/env node
/**
 * Safe Playwright runner for local + CI use.
 *
 * - Blocks --debug / --ui unless PLAYWRIGHT_ALLOW_INTERACTIVE=1 (prevents inspector hangs)
 * - Defaults to --project=chromium unless PLAYWRIGHT_ALL_BROWSERS=1
 * - Wall-clock cap via PLAYWRIGHT_MAX_MINUTES (default 45)
 * - Optional dev-server preflight when PLAYWRIGHT_BASE_URL is set
 *
 * Usage: node scripts/run-playwright.mjs [extra playwright args...]
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const userArgs = process.argv.slice(2);

let allowInteractive = process.env.PLAYWRIGHT_ALLOW_INTERACTIVE === "1";
const allowIdx = userArgs.indexOf("--allow-interactive");
if (allowIdx >= 0) {
  allowInteractive = true;
  userArgs.splice(allowIdx, 1);
}

const INTERACTIVE_FLAGS = ["--debug", "--ui"];
const blocked = INTERACTIVE_FLAGS.filter((flag) => userArgs.includes(flag));
if (blocked.length > 0 && !allowInteractive) {
  console.error(
    `Blocked interactive Playwright flags: ${blocked.join(", ")}. ` +
      "These wait for manual input and will hang automated runs.",
  );
  console.error("For local debugging: pnpm test:ui  (or set PLAYWRIGHT_ALLOW_INTERACTIVE=1).");
  process.exit(2);
}

const hasProject = userArgs.some(
  (arg, index) => arg === "--project" || arg.startsWith("--project=") || userArgs[index - 1] === "--project",
);
if (!hasProject && process.env.PLAYWRIGHT_ALL_BROWSERS !== "1") {
  userArgs.push("--project=chromium");
}

async function devServerHealthy(baseUrl) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/timeline`, {
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

const explicitBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
if (explicitBaseUrl && process.env.PLAYWRIGHT_SKIP_DEV_CHECK !== "1") {
  const healthy = await devServerHealthy(explicitBaseUrl);
  if (!healthy) {
    console.error(`Dev server not responding at ${explicitBaseUrl} within 10s.`);
    console.error("Restart with: pnpm dev:web");
    process.exit(1);
  }
}

const maxMinutes = Number(process.env.PLAYWRIGHT_MAX_MINUTES ?? "45");
const maxMs = Number.isFinite(maxMinutes) && maxMinutes > 0 ? maxMinutes * 60_000 : 45 * 60_000;

const playwrightArgs = [
  "exec",
  "playwright",
  "test",
  "--config=tests/playwright.config.ts",
  ...userArgs,
];

console.log(
  `[playwright] project=${hasProject || process.env.PLAYWRIGHT_ALL_BROWSERS === "1" ? "custom" : "chromium"} ` +
    `wall-clock-cap=${Math.round(maxMs / 60_000)}m`,
);

const child = spawn("pnpm", playwrightArgs, {
  cwd: root,
  stdio: "inherit",
  shell: true,
  env: process.env,
});

const wallClock = setTimeout(() => {
  console.error(`\n[playwright] Exceeded ${Math.round(maxMs / 60_000)}m wall-clock limit — terminating.`);
  child.kill("SIGTERM");
  setTimeout(() => child.kill("SIGKILL"), 5_000);
}, maxMs);

child.on("exit", (code, signal) => {
  clearTimeout(wallClock);
  if (signal === "SIGTERM" || signal === "SIGKILL") {
    process.exit(1);
  }
  process.exit(code ?? 1);
});
