#!/usr/bin/env node
/**
 * Daily release + batch versioning (CI_OPS §2.2).
 *
 * - Release tag always matches the calendar build day: vYY.MM.DD
 * - Batch counter resets to b1 on each new calendar day
 * - Within a day: b1 → b2 → b3 … (no leading zero)
 *
 * Usage:
 *   node scripts/daily-release-rollover.mjs              # sync ROADMAP release to today
 *   node scripts/daily-release-rollover.mjs --next-batch # print next batch id for today
 *   node scripts/daily-release-rollover.mjs --stamp      # sync ROADMAP + package versions
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { todayLocalDate } from "./validate-build-release.mjs";
import { readCiContext } from "./read-ci-context.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const roadmapPath = join(
  root,
  "docs/Working Docs-Features-Incidents/ROADMAP.md",
);
const rootPkgPath = join(root, "package.json");
const desktopPkgPath = join(root, "apps/desktop/package.json");

/** @returns {string} e.g. v26.06.19 */
export function todayReleaseTag(now = new Date()) {
  const d = todayLocalDate();
  const yy = String(d.year).slice(-2);
  const mm = String(d.month).padStart(2, "0");
  const dd = String(d.day).padStart(2, "0");
  return `v${yy}.${mm}.${dd}`;
}

/**
 * @param {string} roadmap
 * @returns {{ batch: string; session: string; items: string[]; status: string }[]}
 */
export function parseBatchLogRows(roadmap) {
  const inBatchLog =
    roadmap.indexOf("### Batch log") >= 0
      ? roadmap.slice(roadmap.indexOf("### Batch log"))
      : roadmap;

  /** @type {{ batch: string; session: string; items: string[]; status: string }[]} */
  const rows = [];

  for (const line of inBatchLog.split("\n")) {
    if (!line.startsWith("|") || line.includes("Batch |") || line.includes("-----")) {
      continue;
    }
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length < 4) continue;
    const [batch, session, itemsCell, status] = cells;
    if (!/^v[\d.]+b\d+$/.test(batch)) continue;
    const items = [...itemsCell.matchAll(/\b(N-\d{4}|B-\d{4})\b/g)].map((m) => m[1]);
    rows.push({ batch, session, items, status });
  }

  return rows;
}

/**
 * @param {string} releaseTag e.g. v26.06.19
 * @param {{ batch: string }[]} rows
 */
export function maxBatchIndexForRelease(releaseTag, rows) {
  const prefix = releaseTag.replace(/^v/, "");
  let max = 0;
  for (const row of rows) {
    const match = row.batch.match(/^v([\d.]+)b(\d+)$/);
    if (!match || match[1] !== prefix) continue;
    max = Math.max(max, parseInt(match[2], 10));
  }
  return max;
}

/**
 * @param {string} releaseTag
 * @param {{ batch: string }[]} rows
 */
export function nextBatchId(releaseTag, rows) {
  const next = maxBatchIndexForRelease(releaseTag, rows) + 1;
  const prefix = releaseTag.replace(/^v/, "");
  return `v${prefix}b${next}`;
}

/**
 * @param {string} roadmap
 * @param {string} releaseTag
 */
export function syncRoadmapRelease(roadmap, releaseTag) {
  let updated = roadmap.replace(
    /(\*\*Release:\*\*\s+)v[\d.]+/,
    `$1${releaseTag}`,
  );

  updated = updated.replace(
    /(### Active sprint \d+ \()(v[\d.]+)(\))/,
    `$1${releaseTag}$3`,
  );

  updated = updated.replace(
    /(at release \*\*)(v[\d.]+)(\*\*)/g,
    `$1${releaseTag}$3`,
  );

  return updated;
}

/**
 * @param {string} batchId
 */
export function stampPackageVersions(batchId) {
  const ctx = readCiContext({ batchId });
  const { displayVersion, npmVersion } = ctx.version;

  const rootPkg = JSON.parse(readFileSync(rootPkgPath, "utf8"));
  rootPkg.version = npmVersion.replace(/-b\d+$/, "") || npmVersion.split("-")[0];
  writeFileSync(rootPkgPath, `${JSON.stringify(rootPkg, null, 2)}\n`, "utf8");

  const desktopPkg = JSON.parse(readFileSync(desktopPkgPath, "utf8"));
  desktopPkg.version = npmVersion;
  desktopPkg.blocksVersion = displayVersion;
  writeFileSync(desktopPkgPath, `${JSON.stringify(desktopPkg, null, 2)}\n`, "utf8");

  return { batchId, displayVersion, npmVersion, release: ctx.release };
}

/**
 * Insert a row into the ROADMAP batch log table (before the section divider).
 * @param {string} roadmap
 * @param {string} row
 */
export function insertBatchLogRow(roadmap, row) {
  const sectionStart = roadmap.indexOf("### Batch log");
  if (sectionStart < 0) return roadmap;
  const afterSection = roadmap.slice(sectionStart);
  const dividerIdx = afterSection.indexOf("\n---\n");
  if (dividerIdx < 0) return roadmap;
  const insertAt = sectionStart + dividerIdx;
  return `${roadmap.slice(0, insertAt)}\n${row}${roadmap.slice(insertAt)}`;
}

/**
 * Nightly seal: sync today's release, auto-increment batch, append log row, stamp versions.
 * @param {{ session?: string; dryRun?: boolean }} [opts]
 */
export function prepareNightlyBatch(opts = {}) {
  const releaseTag = todayReleaseTag();
  let roadmap = readFileSync(roadmapPath, "utf8");
  const previousRelease =
    roadmap.match(/\*\*Release:\*\*\s+(v[\d.]+)/)?.[1] ?? null;

  if (previousRelease !== releaseTag) {
    roadmap = syncRoadmapRelease(roadmap, releaseTag);
  }

  const rows = parseBatchLogRows(roadmap);
  const batchId = nextBatchId(releaseTag, rows);
  const prefix = releaseTag.replace(/^v/, "");
  const todayRows = rows.filter((r) => {
    const m = r.batch.match(/^v([\d.]+)b\d+$/);
    return m?.[1] === prefix;
  });
  const carryItems = todayRows.at(-1)?.items ?? [];
  const session = opts.session ?? `Nightly dev push seal · ${releaseTag}`;

  if (!rows.some((r) => r.batch === batchId)) {
    const itemsCell = carryItems.length > 0 ? carryItems.join(" · ") : "—";
    const row = `| ${batchId} | ${session} | ${itemsCell} | 🧪 QA |`;
    roadmap = insertBatchLogRow(roadmap, row);
    if (!opts.dryRun) {
      writeFileSync(roadmapPath, roadmap, "utf8");
    }
  }

  const stamped = opts.dryRun
    ? { batchId, displayVersion: batchId, npmVersion: batchId.replace(/^v/, "").replace("b", "-b") }
    : stampPackageVersions(batchId);
  return {
    releaseTag,
    batchId,
    stamped,
    isNewReleaseDay: previousRelease !== releaseTag,
    previousRelease,
  };
}

/**
 * @param {{ stamp?: boolean }} [opts]
 */
export function runDailyRollover(opts = {}) {
  const releaseTag = todayReleaseTag();
  let roadmap = readFileSync(roadmapPath, "utf8");
  const previousRelease =
    roadmap.match(/\*\*Release:\*\*\s+(v[\d.]+)/)?.[1] ?? null;

  const rows = parseBatchLogRows(roadmap);
  const nextBatch = nextBatchId(releaseTag, rows);
  const isNewReleaseDay = previousRelease !== releaseTag;

  if (isNewReleaseDay) {
    roadmap = syncRoadmapRelease(roadmap, releaseTag);
    writeFileSync(roadmapPath, roadmap, "utf8");
  }

  let stamped = null;
  if (opts.stamp) {
    const ctx = readCiContext({});
    const batchId = ctx.batch ?? nextBatch;
    stamped = stampPackageVersions(batchId);
  }

  return {
    releaseTag,
    previousRelease,
    isNewReleaseDay,
    nextBatch,
    activeBatch: readCiContext({}).batch,
    stamped,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes("--next-batch")) {
    const releaseTag = todayReleaseTag();
    const roadmap = readFileSync(roadmapPath, "utf8");
    const rows = parseBatchLogRows(roadmap);
    console.log(nextBatchId(releaseTag, rows));
    process.exit(0);
  }

  const result = runDailyRollover({ stamp: process.argv.includes("--stamp") });

  console.log(`Release: ${result.releaseTag}`);
  if (result.isNewReleaseDay) {
    console.log(`  updated from ${result.previousRelease ?? "none"} → ${result.releaseTag}`);
    console.log(`  next new session batch: ${result.releaseTag}b1`);
  } else {
    console.log(`  already current`);
  }
  console.log(`Active QA batch: ${result.activeBatch ?? "none"}`);
  console.log(`Next batch slot: ${result.nextBatch}`);
  if (result.stamped) {
    console.log(
      `Stamped: ${result.stamped.displayVersion} (npm ${result.stamped.npmVersion})`,
    );
  }
}
