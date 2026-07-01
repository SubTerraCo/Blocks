#!/usr/bin/env node
/**
 * Smoke tests for ci-roadmap-batch (CRLF dividers + Sprint heading).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  findBatchLogInsertIndex,
  insertBatchLogRow,
  parseBatchLogRows,
} from "./ci-roadmap-batch.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const roadmapPath = join(
  root,
  "docs/Working Docs-Features-Incidents/ROADMAP.md",
);

const SAMPLE_CRLF = [
  "### Batch log (Sprint 5)",
  "",
  "| Batch | Session | Items | Status |",
  "| v26.06.30b1 | test | N-0045 | 🧪 QA |",
  "---",
  "",
  "## Proposed",
].join("\r\n");

function testCrlfInsert() {
  const row = "| v26.06.30b3 | test insert | N-0045 | 🧪 QA |";
  const updated = insertBatchLogRow(SAMPLE_CRLF, row);
  assert.ok(updated.includes(row), "row inserted");
  assert.ok(updated.includes("v26.06.30b1"), "existing row preserved");
  assert.match(updated, /\r\n---\r\n\r\n## Proposed/);
  assert.equal(parseBatchLogRows(updated).length, 2);
}

function testLiveRoadmap() {
  const roadmap = readFileSync(roadmapPath, "utf8");
  assert.ok(findBatchLogInsertIndex(roadmap) >= 0, "live ROADMAP has insert point");
  const rows = parseBatchLogRows(roadmap);
  assert.ok(rows.some((r) => r.batch === "v26.06.30b2"), "parses v26.06.30b2");
}

testCrlfInsert();
testLiveRoadmap();
console.log("ci-roadmap-batch: ok");
