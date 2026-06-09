#!/usr/bin/env node
/**
 * Fails CI when deprecated branding (Poweredupbass) appears in the repo.
 * Allowed canonical org: PoweredUpLabs
 */

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const DEPRECATED_PATTERNS = [/poweredupbass/i];

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".turbo",
  "dist",
  ".next",
  "release",
  "playwright-report",
  "test-results",
]);

const SKIP_FILES = new Set([
  "pnpm-lock.yaml",
  "check-deprecated-branding.mjs",
]);

const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".yml",
  ".yaml",
  ".html",
  ".css",
  ".sh",
  ".nsh",
]);

async function walk(dir, matches = []) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relative = path.relative(ROOT, fullPath);

    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await walk(fullPath, matches);
      continue;
    }

    if (SKIP_FILES.has(entry.name)) continue;

    const ext = path.extname(entry.name);
    if (!TEXT_EXTENSIONS.has(ext)) continue;

    const content = await readFile(fullPath, "utf8");
    for (const pattern of DEPRECATED_PATTERNS) {
      if (pattern.test(content)) {
        const fileStat = await stat(fullPath);
        matches.push({ file: relative, pattern: pattern.source });
        break;
      }
    }
  }

  return matches;
}

const matches = await walk(ROOT);

if (matches.length > 0) {
  console.error("Deprecated branding found. Replace with PoweredUpLabs:\n");
  for (const { file, pattern } of matches) {
    console.error(`  - ${file} (matched /${pattern}/)`);
  }
  process.exit(1);
}

console.log("Branding check passed: no deprecated usernames found.");
