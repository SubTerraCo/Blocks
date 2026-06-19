#!/usr/bin/env node
/**
 * Stamp desktop package.json with batch-aware version before build:win.
 * Display: v26.06.12b2 · npm/electron-builder: 26.6.12-b2
 *
 * Usage: node scripts/apply-batch-version.mjs [--batch v26.06.12b2]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readCiContext } from "./read-ci-context.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const desktopPkgPath = join(root, "apps/desktop/package.json");

const batchIdx = process.argv.indexOf("--batch");
const batchId = batchIdx >= 0 ? process.argv[batchIdx + 1] : undefined;

const ctx = readCiContext({ batchId });
const { displayVersion, npmVersion, batchId: appliedBatch } = ctx.version;

const pkg = JSON.parse(readFileSync(desktopPkgPath, "utf8"));
const previous = { version: pkg.version, blocksVersion: pkg.blocksVersion };

pkg.version = npmVersion;
pkg.blocksVersion = displayVersion;

writeFileSync(desktopPkgPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");

console.log(
  `Version stamp: ${displayVersion} (npm ${npmVersion})` +
    (appliedBatch ? ` · batch ${appliedBatch}` : ""),
);
if (previous.version !== npmVersion || previous.blocksVersion !== displayVersion) {
  console.log(
    `  was: ${previous.blocksVersion ?? previous.version ?? "?"} / npm ${previous.version ?? "?"}`,
  );
}
