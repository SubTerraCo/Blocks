#!/usr/bin/env node
/**
 * Pre-flight checks for `/BUILD` and `pnpm build:release`.
 * - Release date vs today (date-based versioning)
 * - Duplicate batch build guard (log + installer artifact)
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
export const BUILD_LOG_PATH = join(
  root,
  "docs/Working Docs-Features-Incidents/build-log.json",
);

/**
 * v26.06.12 → { year: 2026, month: 6, day: 12, iso: '2026-06-12' }
 * @param {string | null | undefined} releaseTag
 */
export function parseReleaseDate(releaseTag) {
  if (!releaseTag) return null;
  const match = releaseTag.match(/^v(\d{2})\.(\d{2})\.(\d{2})$/);
  if (!match) return null;
  const year = 2000 + parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return { year, month, day, iso, tag: releaseTag };
}

/** @returns {{ year: number; month: number; day: number; iso: string }} */
export function todayLocalDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return { year, month, day, iso };
}

/**
 * @param {string | null | undefined} releaseTag
 * @param {Date} [now]
 */
export function checkReleaseDateDrift(releaseTag, now = new Date()) {
  const release = parseReleaseDate(releaseTag);
  if (!release) {
    return {
      ok: false,
      code: "INVALID_RELEASE",
      message: `ROADMAP release tag is missing or invalid (expected vYY.MM.DD, got ${releaseTag ?? "none"}).`,
    };
  }

  const today = todayLocalDate();
  if (release.iso === today.iso) {
    return { ok: true, release, today };
  }

  return {
    ok: false,
    code: "DATE_DRIFT",
    release,
    today,
    message:
      `Release date ${release.tag} (${release.iso}) does not match today (${today.iso}). ` +
      `Date-based versioning expects ROADMAP **Release:** to match the build day, ` +
      `or start a new release row for today (e.g. v${String(today.year).slice(-2)}.${String(today.month).padStart(2, "0")}.${String(today.day).padStart(2, "0")}).`,
  };
}

/** @returns {{ builds: object[] }} */
export function readBuildLog() {
  if (!existsSync(BUILD_LOG_PATH)) {
    return { builds: [] };
  }
  try {
    const data = JSON.parse(readFileSync(BUILD_LOG_PATH, "utf8"));
    return { builds: Array.isArray(data.builds) ? data.builds : [] };
  } catch {
    return { builds: [] };
  }
}

/**
 * @param {{ batch?: string | null; release?: string | null; version: { displayVersion: string; npmVersion: string } }} ctx
 */
export function findInstallerForBatch(ctx) {
  const releaseDir = join(root, "apps/desktop/release");
  if (!existsSync(releaseDir)) return null;
  const expected = `Blocks-Setup-${ctx.version.npmVersion}.exe`;
  const path = join(releaseDir, expected);
  return existsSync(path) ? path : null;
}

/**
 * @param {{ batch?: string | null; release?: string | null; version: { displayVersion: string; npmVersion: string } }} ctx
 */
export function checkDuplicateBatchBuild(ctx) {
  const batchId = ctx.batch;
  if (!batchId) {
    return {
      ok: false,
      code: "NO_BATCH",
      message:
        "No active batch in ROADMAP batch log. Add a 🧪 QA row before running build:release.",
    };
  }

  const log = readBuildLog();
  const logEntry = log.builds.find((b) => b.batch === batchId);
  const installerPath = findInstallerForBatch(ctx);

  if (logEntry || installerPath) {
    const parts = [];
    if (logEntry) {
      parts.push(
        `build-log entry (${logEntry.builtAt ?? "unknown time"}${logEntry.gitSha ? ` · ${logEntry.gitSha.slice(0, 7)}` : ""})`,
      );
    }
    if (installerPath) {
      parts.push(`installer at ${installerPath}`);
    }

    return {
      ok: false,
      code: "DUPLICATE_BATCH",
      batchId,
      logEntry: logEntry ?? null,
      installerPath,
      message:
        `Batch ${batchId} was already built (${parts.join("; ")}). ` +
        `Increment the batch in ROADMAP (e.g. next bX) for new work, or pass --force-rebuild to rebuild the same batch intentionally.`,
    };
  }

  return { ok: true, batchId };
}

function gitShortSha() {
  const result = spawnSync("git", ["rev-parse", "--short", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  });
  if ((result.status ?? 1) !== 0) return null;
  return result.stdout.trim() || null;
}

/**
 * @param {{ batch?: string | null; release?: string | null; version: { displayVersion: string; npmVersion: string } }} ctx
 * @param {{ installerPath?: string | null; platform?: string }} [meta]
 */
export function recordBatchBuild(ctx, meta = {}) {
  const batchId = ctx.batch;
  if (!batchId) return;

  const log = readBuildLog();
  const entry = {
    batch: batchId,
    release: ctx.release ?? null,
    displayVersion: ctx.version.displayVersion,
    npmVersion: ctx.version.npmVersion,
    builtAt: new Date().toISOString(),
    gitSha: gitShortSha(),
    platform: meta.platform ?? process.platform,
    installer: meta.installerPath
      ? meta.installerPath.replace(/\\/g, "/").replace(/^.*\/apps\//, "apps/")
      : null,
  };

  const idx = log.builds.findIndex((b) => b.batch === batchId);
  if (idx >= 0) {
    log.builds[idx] = { ...log.builds[idx], ...entry, rebuildCount: (log.builds[idx].rebuildCount ?? 0) + 1 };
  } else {
    log.builds.push(entry);
  }

  mkdirSync(dirname(BUILD_LOG_PATH), { recursive: true });
  writeFileSync(BUILD_LOG_PATH, `${JSON.stringify(log, null, 2)}\n`, "utf8");
}

/**
 * @param {object} ctx from readCiContext()
 * @param {{ allowDateDrift?: boolean; forceRebuild?: boolean; skipDuplicateCheck?: boolean }} [opts]
 */
export function validateReleaseBuild(ctx, opts = {}) {
  const errors = [];
  const warnings = [];

  if (!opts.allowDateDrift) {
    const dateCheck = checkReleaseDateDrift(ctx.release);
    if (!dateCheck.ok) {
      errors.push(dateCheck);
    }
  } else {
    const dateCheck = checkReleaseDateDrift(ctx.release);
    if (!dateCheck.ok && dateCheck.code === "DATE_DRIFT") {
      warnings.push({
        code: "DATE_DRIFT_ALLOWED",
        message: `Date drift allowed: ${dateCheck.message}`,
      });
    }
  }

  if (!opts.skipDuplicateCheck && !opts.forceRebuild) {
    const dupCheck = checkDuplicateBatchBuild(ctx);
    if (!dupCheck.ok) {
      errors.push(dupCheck);
    }
  } else if (opts.forceRebuild) {
    const dupCheck = checkDuplicateBatchBuild(ctx);
    if (!dupCheck.ok && dupCheck.code === "DUPLICATE_BATCH") {
      warnings.push({
        code: "FORCE_REBUILD",
        message: `--force-rebuild: rebuilding ${dupCheck.batchId} despite prior build.`,
      });
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

export function printValidationResult(result, opts = {}) {
  const { quiet = false } = opts;
  for (const w of result.warnings) {
    console.warn(`\n⚠ ${w.message}`);
  }
  if (!result.ok) {
    console.error("\n✗ Build release pre-flight failed:\n");
    for (const e of result.errors) {
      console.error(`  • [${e.code}] ${e.message}`);
    }
    console.error(
      "\nFix ROADMAP release/batch, or override with --allow-date-drift / --force-rebuild (see CI_OPS_FRAMEWORK.md §2.1).",
    );
    return false;
  }
  if (!quiet) {
    console.log("\n✓ Release pre-flight checks passed (date + batch).");
  }
  return true;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { readCiContext } = await import("./read-ci-context.mjs");
  const batchIdx = process.argv.indexOf("--batch");
  const batchId = batchIdx >= 0 ? process.argv[batchIdx + 1] : undefined;
  const ctx = readCiContext({ batchId });
  const result = validateReleaseBuild(ctx, {
    allowDateDrift: process.argv.includes("--allow-date-drift"),
    forceRebuild: process.argv.includes("--force-rebuild"),
  });
  if (!printValidationResult(result)) {
    process.exit(1);
  }
}
