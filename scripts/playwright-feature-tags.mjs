#!/usr/bin/env node
/**
 * Build a Playwright --grep pattern from ROADMAP features in active QA / build.
 * Falls back to all feature + core + incident tags when none are active.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const roadmapPath = join(
  root,
  "docs/Working Docs-Features-Incidents/ROADMAP.md",
);

const roadmap = readFileSync(roadmapPath, "utf8");
const activeStatuses = /🧪 QA|🔄 In progress|📋 Proposed/;
const tags = new Set();

for (const line of roadmap.split("\n")) {
  if (!activeStatuses.test(line)) continue;
  const match = line.match(/N-\d{4}/);
  if (match) tags.add(`@${match[0]}`);
}

const pattern =
  tags.size > 0 ? [...tags, "@core"].join("|") : "@N-|@core|@B-";

process.stdout.write(pattern);
