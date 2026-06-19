#!/usr/bin/env node
/**
 * Build a Playwright --grep pattern from ROADMAP active QA batch (or in-progress features).
 * Falls back to all feature + core + incident tags when none are active.
 */
import { readCiContext, itemsToGrepPattern } from "./read-ci-context.mjs";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const roadmapPath = join(
  root,
  "docs/Working Docs-Features-Incidents/ROADMAP.md",
);

const ctx = readCiContext();

if (ctx.items.length > 0) {
  process.stdout.write(itemsToGrepPattern(ctx.items, { includeCore: true }));
  process.exit(0);
}

// Fallback: scan quick-reference rows for in-progress / QA features
const roadmap = readFileSync(roadmapPath, "utf8");
const activeStatuses = /🧪 QA|🔄 In progress|📋 Proposed/;
const tags = new Set();

for (const line of roadmap.split("\n")) {
  if (!activeStatuses.test(line)) continue;
  for (const match of line.matchAll(/\bN-\d{4}\b/g)) {
    tags.add(`@${match[0]}`);
  }
}

const pattern =
  tags.size > 0 ? [...tags, "@core"].join("|") : "@N-|@core|@B-";

process.stdout.write(pattern);
