#!/usr/bin/env node
/**
 * Read release / sprint / active QA batch from ROADMAP.md.
 * Used by build-release, playwright-feature-tags, and CI workflows.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseBatchLogRows } from "./ci-roadmap-batch.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const roadmapPath = join(
  root,
  "docs/Working Docs-Features-Incidents/ROADMAP.md",
);

/** @param {string} roadmap */
function parseRelease(roadmap) {
  return roadmap.match(/\*\*Release:\*\*\s+(v[\d.]+)/)?.[1] ?? null;
}

/** @param {string} roadmap */
function parseSprint(roadmap) {
  return roadmap.match(/Sprint\s+\d+/)?.[0] ?? null;
}

/**
 * Batch log rows: | v26.06.12b2 | Session | N-0024 · N-0025 | 🧪 QA |
 * @param {string} roadmap
 * @param {string | undefined} batchId e.g. v26.06.12b2 — latest 🧪 QA batch if omitted
 */
function parseBatchLog(roadmap, batchId) {
  const rows = parseBatchLogRows(roadmap);

  if (batchId) {
    const match = rows.find((r) => r.batch === batchId);
    return match ?? null;
  }

  const qaRows = rows.filter((r) => /🧪\s*QA/.test(r.status));
  return qaRows.length > 0 ? qaRows[qaRows.length - 1] : rows[rows.length - 1] ?? null;
}

/**
 * v26.06.12 → 26.6.12 (npm semver base)
 * @param {string} releaseTag e.g. v26.06.12
 */
export function releaseToNpmBase(releaseTag) {
  if (!releaseTag) return null;
  const raw = releaseTag.replace(/^v/, "");
  const parts = raw.split(".").map((p) => String(parseInt(p, 10)));
  if (parts.some((p) => p === "NaN")) return null;
  return parts.join(".");
}

/**
 * Batch + release → display (v26.06.12b2) and npm (26.6.12-b2)
 * @param {{ batch?: string | null; release?: string | null }} ctx
 */
export function resolveVersionInfo(ctx) {
  const batchId = ctx.batch ?? null;
  const releaseTag = ctx.release ?? null;

  if (batchId && /^v[\d.]+b\d+$/.test(batchId)) {
    const match = batchId.match(/^v([\d.]+)(b\d+)$/);
    const npmBase =
      releaseToNpmBase(`v${match[1]}`) ?? releaseToNpmBase(releaseTag);
    const batchSuffix = match[2];
    if (npmBase) {
      return {
        batchId,
        displayVersion: batchId,
        npmVersion: `${npmBase}-${batchSuffix}`,
      };
    }
  }

  const npmBase = releaseToNpmBase(releaseTag);
  if (!npmBase) {
    return {
      batchId: null,
      displayVersion: releaseTag ?? "unknown",
      npmVersion: "0.0.0",
    };
  }

  return {
    batchId: null,
    displayVersion: releaseTag ?? `v${npmBase}`,
    npmVersion: npmBase,
  };
}

/**
 * @param {string[]} items
 * @param {{ includeCore?: boolean; includeFallback?: boolean }} [opts]
 */
export function itemsToGrepPattern(items, opts = {}) {
  const { includeCore = true, includeFallback = false } = opts;
  const tags = new Set(items.map((id) => `@${id}`));
  if (includeCore) tags.add("@core");
  if (tags.size === 0 || (tags.size === 1 && tags.has("@core"))) {
    return includeFallback ? "@N-|@core|@B-" : "@core";
  }
  return [...tags].join("|");
}

/**
 * @param {{ batchId?: string }} [opts]
 */
export function readCiContext(opts = {}) {
  const roadmap = readFileSync(roadmapPath, "utf8");
  const release = parseRelease(roadmap);
  const sprint = parseSprint(roadmap);
  const batch = parseBatchLog(roadmap, opts.batchId);

  const items = batch?.items ?? [];
  const grep = itemsToGrepPattern(items, { includeCore: true, includeFallback: true });
  const integrationGrep =
    items.length > 0
      ? itemsToGrepPattern(items, { includeCore: false })
      : grep;
  const version = resolveVersionInfo({
    batch: batch?.batch ?? null,
    release,
  });

  return {
    roadmapPath,
    release,
    sprint,
    batch: batch?.batch ?? null,
    batchSession: batch?.session ?? null,
    batchStatus: batch?.status ?? null,
    items,
    grep,
    integrationGrep,
    version,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const format = process.argv.includes("--json") ? "json" : "text";
  const batchIdx = process.argv.indexOf("--batch");
  const batchId = batchIdx >= 0 ? process.argv[batchIdx + 1] : undefined;
  const ctx = readCiContext({ batchId });

  if (process.argv.includes("--validate")) {
    const { validateReleaseBuild, printValidationResult } = await import(
      "./validate-build-release.mjs"
    );
    const result = validateReleaseBuild(ctx, {
      allowDateDrift: process.argv.includes("--allow-date-drift"),
      forceRebuild: process.argv.includes("--force-rebuild"),
    });
    if (!printValidationResult(result, { quiet: format === "json" })) {
      process.exit(1);
    }
  }

  if (format === "json") {
    console.log(JSON.stringify(ctx, null, 2));
  } else {
    console.log(`Release: ${ctx.release ?? "unknown"}`);
    console.log(`Sprint:  ${ctx.sprint ?? "unknown"}`);
    console.log(`Batch:   ${ctx.batch ?? "none"} (${ctx.batchStatus ?? "—"})`);
    console.log(`Items:   ${ctx.items.join(" · ") || "—"}`);
    console.log(`Grep:    ${ctx.grep}`);
    console.log(`Integration: ${ctx.integrationGrep}`);
    console.log(`Version: ${ctx.version.displayVersion} (npm ${ctx.version.npmVersion})`);
  }
}
