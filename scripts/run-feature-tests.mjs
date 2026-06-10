#!/usr/bin/env node
/**
 * Run Playwright feature-tagged suites with consistent env on all platforms.
 *
 * Usage: node scripts/run-feature-tests.mjs [all|headed|ui|roadmap|roadmap-headed]
 */
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const mode = process.argv[2] ?? "all";

function resolveGrep() {
  if (process.env.PLAYWRIGHT_GREP) return process.env.PLAYWRIGHT_GREP;
  if (mode === "roadmap" || mode === "roadmap-headed") {
    return execFileSync("node", ["scripts/playwright-feature-tags.mjs"], {
      cwd: root,
      encoding: "utf8",
    }).trim();
  }
  return "@N-|@core|@B-";
}

const playwrightArgs = [
  "exec",
  "playwright",
  "test",
  "tests/e2e",
  "--config=tests/playwright.config.ts",
  "--project=chromium",
];

if (mode === "headed" || mode === "roadmap-headed") {
  playwrightArgs.push("--headed", "--workers=1");
}
if (mode === "ui") {
  playwrightArgs.push("--ui");
}

const result = spawnSync("pnpm", playwrightArgs, {
  cwd: root,
  stdio: "inherit",
  env: {
    ...process.env,
    PLAYWRIGHT_FEATURES: "1",
    PLAYWRIGHT_GREP: resolveGrep(),
  },
  shell: true,
});

process.exit(result.status ?? 1);
