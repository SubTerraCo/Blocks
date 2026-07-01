#!/usr/bin/env node
/**
 * Nightly dev-branch push (CI_OPS §12).
 *
 * PM-locked pipeline:
 * - 23:00 MST (06:00 UTC) via GitHub Actions cron
 * - Merge DAILY_PUSH_SOURCE_BRANCH → dev before build
 * - Auto-increment batch + full build:release before push
 * - Skip when no merge and no uncommitted changes
 *
 * Usage:
 *   node scripts/daily-dev-push.mjs
 *   node scripts/daily-dev-push.mjs --dry-run
 *   DAILY_PUSH_SOURCE_BRANCH=v0.0.5 node scripts/daily-dev-push.mjs
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { prepareNightlyBatch, todayReleaseTag } from "./daily-release-rollover.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dryRun = process.argv.includes("--dry-run");
const skipBuild = process.argv.includes("--skip-build");
const branch = process.env.DAILY_PUSH_BRANCH ?? "dev";
const sourceBranch =
  process.env.DAILY_PUSH_SOURCE_BRANCH ?? todayReleaseTag();

function run(cmd, args, opts = {}) {
  const label = [cmd, ...args].join(" ");
  if (dryRun && !opts.allowInDryRun) {
    console.log(`[dry-run] ${label}`);
    return { status: 0, stdout: "", stderr: "" };
  }
  const result = spawnSync(cmd, args, {
    cwd: root,
    encoding: "utf8",
    ...opts,
  });
  return result;
}

/** Git argv must not use shell — Windows cmd mangles `-m` messages and ref args. */
function git(...args) {
  return run("git", args, { shell: false, allowInDryRun: true });
}

function hasUncommittedChanges() {
  const status = git("status", "--porcelain");
  return (status.stdout ?? "").trim().length > 0;
}

function currentHead() {
  const result = git("rev-parse", "HEAD");
  return (result.stdout ?? "").trim();
}

/**
 * @param {string} source
 * @returns {{ merged: boolean; fastForward: boolean }}
 */
function mergeSourceBranch(source) {
  if (!source) return { merged: false, fastForward: false };

  console.log(`\nMerging origin/${source} → ${branch}`);
  const before = currentHead();

  const fetch = git("fetch", "origin", source);
  if ((fetch.status ?? 1) !== 0) {
    console.error(`Failed to fetch origin/${source}:`, fetch.stderr?.trim());
    process.exit(1);
  }

  const ref = `origin/${source}`;
  const mergeMessage = `chore(release): merge ${source} into ${branch} (nightly)`;

  let merge = git("merge", ref, "--ff-only");
  if ((merge.status ?? 1) !== 0) {
    merge = git("merge", ref, "--no-edit", "-m", mergeMessage);
  }
  if ((merge.status ?? 1) !== 0) {
    console.error(`Merge failed:`, merge.stderr?.trim() || merge.stdout?.trim());
    process.exit(1);
  }

  const after = currentHead();
  return { merged: before !== after, fastForward: before !== after };
}

function main() {
  console.log("=== Daily dev push ===");
  console.log(`Target:  origin/${branch}`);
  if (sourceBranch) console.log(`Source:  origin/${sourceBranch}`);
  if (dryRun) console.log("Mode:    dry-run\n");

  if (!dryRun) {
    const checkout = git("checkout", branch);
    if ((checkout.status ?? 1) !== 0) {
      console.error(`Failed to checkout ${branch}:`, checkout.stderr?.trim());
      process.exit(1);
    }

    const pull = git("pull", "--ff-only", "origin", branch);
    if ((pull.status ?? 1) !== 0) {
      console.error(`Failed to pull origin/${branch}:`, pull.stderr?.trim());
      process.exit(1);
    }
  }

  const mergeResult = mergeSourceBranch(sourceBranch);

  if (!mergeResult.merged && !hasUncommittedChanges()) {
    console.log("\nNo merge changes and no uncommitted work — skipping nightly push.");
    process.exit(0);
  }

  const nightly = prepareNightlyBatch({ dryRun });
  const { batchId, stamped, releaseTag } = nightly;
  const version = stamped.displayVersion;

  console.log(`\nRelease: ${releaseTag}`);
  console.log(`Batch:   ${batchId} (${version})`);
  console.log(`Stamped: npm ${stamped.npmVersion}`);

  if (!skipBuild && !dryRun) {
    const build = run("pnpm", ["build:release"], { stdio: "inherit", shell: true });
    if ((build.status ?? 1) !== 0) {
      console.error("\n✗ build:release failed — aborting push.");
      process.exit(1);
    }
  } else if (skipBuild) {
    console.log("\nSkipping build:release (--skip-build)");
  } else {
    console.log("\n[dry-run] pnpm build:release");
  }

  git("add", "-A");

  if (!hasUncommittedChanges()) {
    console.log("\nNo file changes after build — skipping commit/push.");
    process.exit(0);
  }

  const message = `chore(release): nightly dev push ${version}

Automated ${releaseTag} batch seal (CI_OPS §12).
${sourceBranch ? `Merged origin/${sourceBranch} → ${branch}.` : ""}`;

  const commit = git("commit", "-m", message);
  if ((commit.status ?? 1) !== 0) {
    const err = (commit.stderr ?? commit.stdout ?? "").trim();
    if (/nothing to commit/i.test(err)) {
      console.log("\nNo changes to commit — skipping push.");
      process.exit(0);
    }
    console.error("Commit failed:", err);
    process.exit(1);
  }

  const push = git("push", "origin", branch);
  if ((push.status ?? 1) !== 0) {
    console.error("Push failed:", push.stderr?.trim());
    process.exit(1);
  }

  console.log(`\n✓ Pushed ${version} to origin/${branch}`);
}

main();
