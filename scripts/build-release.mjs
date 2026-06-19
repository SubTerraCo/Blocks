#!/usr/bin/env node
/**
 * CI Ops release build — compile, test active batch, package desktop (Windows).
 * Run after returning to a release branch to jump straight into QA.
 *
 * Usage:
 *   node scripts/build-release.mjs
 *   node scripts/build-release.mjs --batch v26.06.12b2
 *   node scripts/build-release.mjs --skip-install --skip-tests
 *   node scripts/build-release.mjs --desktop-only
 *
 * Env:
 *   SKIP_INSTALL=1  SKIP_TESTS=1  SKIP_DESKTOP=1  BUILD_RELEASE_GREP=...
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readCiContext } from "./read-ci-context.mjs";
import {
  recordBatchBuild,
  validateReleaseBuild,
  printValidationResult,
} from "./validate-build-release.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

function hasFlag(name) {
  return args.includes(name);
}

function flagValue(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

const batchId = flagValue("--batch");
const grepOverride =
  process.env.BUILD_RELEASE_GREP ?? flagValue("--grep") ?? null;
const skipInstall =
  hasFlag("--skip-install") || process.env.SKIP_INSTALL === "1";
const skipTests = hasFlag("--skip-tests") || process.env.SKIP_TESTS === "1";
const skipDesktop =
  hasFlag("--skip-desktop") ||
  process.env.SKIP_DESKTOP === "1" ||
  (process.platform !== "win32" && !hasFlag("--force-desktop"));
const desktopOnly = hasFlag("--desktop-only");
const allowDateDrift =
  hasFlag("--allow-date-drift") || process.env.ALLOW_RELEASE_DATE_DRIFT === "1";
const forceRebuild =
  hasFlag("--force-rebuild") || process.env.FORCE_BATCH_REBUILD === "1";

const ctx = readCiContext({ batchId });
const grep = grepOverride ?? ctx.grep;
const integrationGrep = grepOverride ?? ctx.integrationGrep;

function run(label, cmd, cmdArgs, opts = {}) {
  console.log(`\n▶ ${label}`);
  const started = Date.now();
  const result = spawnSync(cmd, cmdArgs, {
    cwd: root,
    stdio: "inherit",
    shell: true,
    ...opts,
  });
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  if ((result.status ?? 1) !== 0) {
    console.error(`\n✗ Failed: ${label} (${seconds}s)`);
    process.exit(result.status ?? 1);
  }
  console.log(`✓ ${label} (${seconds}s)`);
}

function findInstaller() {
  const releaseDir = join(root, "apps/desktop/release");
  if (!existsSync(releaseDir)) return null;
  const names = readdirSync(releaseDir).filter((n) =>
    /^Blocks-Setup-.*\.exe$/.test(n),
  );
  if (names.length === 0) return null;

  const npmVersion = ctx.version?.npmVersion;
  if (npmVersion) {
    const expected = `Blocks-Setup-${npmVersion}.exe`;
    if (names.includes(expected)) {
      return join(releaseDir, expected);
    }
  }

  names.sort();
  return join(releaseDir, names[names.length - 1]);
}

function printHandoff(installerPath) {
  const batchLabel = ctx.batch ?? "active batch";
  const releaseLabel = ctx.release ?? "current release";
  const versionLabel = ctx.version.displayVersion;

  console.log("\n" + "=".repeat(72));
  console.log(`  READY FOR QA — ${versionLabel}`);
  console.log(`  ${releaseLabel} · ${batchLabel}`);
  console.log("=".repeat(72));

  if (ctx.items.length) {
    console.log(`\nBatch items: ${ctx.items.join(" · ")}`);
  }
  if (ctx.batchSession) {
    console.log(`Session:     ${ctx.batchSession}`);
  }

  if (installerPath) {
    console.log(`\nDesktop installer:\n  ${installerPath}`);
  } else if (!skipDesktop && process.platform !== "win32") {
    console.log(
      "\nDesktop installer: skipped (Windows only). Re-run on Windows or use GitHub Actions build-release workflow.",
    );
  }

  console.log("\n--- Automated QA (integration, batch-only) ---");
  console.log(`PLAYWRIGHT_GREP="${integrationGrep}" pnpm exec playwright test tests/integration \\`);
  console.log(`  --config=tests/playwright.config.ts --project=chromium`);

  console.log("\n--- Headed follow-along (desktop) ---");
  console.log("pnpm test:features:roadmap:headed");
  console.log("# or batch-specific:");
  console.log(
    `PLAYWRIGHT_GREP="${grep}" pnpm exec playwright test tests/e2e --headed --workers=1 --config=tests/playwright.config.ts --project=chromium`,
  );

  console.log("\n--- Manual QA ---");
  console.log(
    "docs/Working Docs-Features-Incidents/MANUAL_TEST_PLAN.md",
  );

  console.log("\n--- After PM confirms QA ---");
  console.log(
    "Update ROADMAP batch log → ✅ Shipped · FEATURE_REGISTRY · CHANGELOG",
  );
  console.log("=".repeat(72) + "\n");
}

console.log("=== Blocks release build ===");
console.log(`Release: ${ctx.release ?? "?"}`);
console.log(`Sprint:  ${ctx.sprint ?? "?"}`);
console.log(`Batch:   ${ctx.batch ?? "?"} (${ctx.batchStatus ?? "—"})`);
console.log(`Version:  ${ctx.version.displayVersion} (npm ${ctx.version.npmVersion})`);
console.log(`Grep:    ${grep}`);
console.log(`Integration scope: ${integrationGrep}`);

const preflight = validateReleaseBuild(ctx, { allowDateDrift, forceRebuild });
if (!printValidationResult(preflight)) {
  process.exit(1);
}

if (!desktopOnly) {
  if (!skipInstall) {
    run("Install dependencies", "pnpm", ["install"]);
  }

  run("Build shared packages", "pnpm", [
    "build",
    "--filter",
    "@blocks/core",
    "--filter",
    "@blocks/ui",
  ]);

  if (!skipTests) {
    run("Integration tests (batch scope)", "pnpm", [
      "exec",
      "playwright",
      "test",
      "tests/integration",
      "--config=tests/playwright.config.ts",
      "--project=chromium",
    ], {
      env: {
        ...process.env,
        PLAYWRIGHT_GREP: integrationGrep,
        PLAYWRIGHT_FEATURES: "1",
      },
    });

    run("Compile build tests", "node", ["scripts/run-build-tests.mjs"]);
  }
}

if (!skipDesktop) {
  if (process.platform !== "win32") {
    console.log(
      "\n⚠ Desktop packaging requires Windows. Skipping build:win (use --force-desktop to attempt anyway).",
    );
  } else {
    run("Windows desktop installer", "pnpm", [
      "--filter",
      "blocks-desktop",
      "run",
      "build:win",
    ]);
  }
} else {
  console.log("\n— Desktop packaging skipped (SKIP_DESKTOP / --skip-desktop) —");
}

const installerPath = findInstaller();
printHandoff(installerPath);

recordBatchBuild(ctx, {
  installerPath,
  platform: process.platform,
});
console.log(`Build recorded in docs/Working Docs-Features-Incidents/build-log.json`);
