#!/usr/bin/env node
/**
 * Compile all workspace apps/packages to catch TypeScript and bundler errors
 * after the Playwright suite (without slow electron-builder packaging).
 *
 * Usage: node scripts/run-build-tests.mjs
 * Skip when chained: SKIP_BUILD_TESTS=1
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const capture =
  process.argv.includes("--capture") || process.env.BUILD_TESTS_CAPTURE === "1";

/** @type {{ name: string; args: string[] }[]} */
const STEPS = [
  { name: "@blocks/core", args: ["--filter", "@blocks/core", "build"] },
  { name: "@blocks/ui", args: ["--filter", "@blocks/ui", "build"] },
  { name: "web", args: ["--filter", "web", "build"] },
  { name: "blocks-desktop (tsc + vite)", args: ["--filter", "blocks-desktop", "run", "build:check"] },
];

function runStep(step) {
  if (!capture) console.log(`\n▶ Build test: ${step.name}`);
  const started = Date.now();
  const result = spawnSync("pnpm", step.args, {
    cwd: root,
    stdio: capture ? "pipe" : "inherit",
    shell: true,
    encoding: capture ? "utf8" : undefined,
    maxBuffer: 16 * 1024 * 1024,
  });
  const seconds = ((Date.now() - started) / 1000).toFixed(1);

  if (result.status !== 0) {
    if (capture) {
      const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
      console.error(output.slice(-6000) || `Build failed: ${step.name}`);
    } else {
      console.error(`\n✗ Build test failed: ${step.name} (${seconds}s)`);
    }
    return false;
  }

  if (!capture) console.log(`✓ Build test passed: ${step.name} (${seconds}s)`);
  return true;
}

if (!capture) console.log("=== Build tests ===");

let failedStep = null;
for (const step of STEPS) {
  if (!runStep(step)) {
    failedStep = step.name;
    break;
  }
}

if (failedStep) {
  if (!capture) {
    console.error(`\nBuild tests stopped after failure in ${failedStep}.`);
  }
  process.exit(1);
}

if (!capture) console.log("\n✓ All build tests passed.");
process.exit(0);
