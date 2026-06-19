#!/usr/bin/env node
/**
 * Cursor stop hook: run compile build checks after each agent turn.
 * On failure, auto-submits a follow-up so the agent can fix errors.
 *
 * Skips when: aborted, no source changes, or loop_limit reached.
 */
import { execSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const hookDir = dirname(fileURLToPath(import.meta.url));
const root = join(hookDir, "../..");

function readHookInput() {
  try {
    const raw = readFileSync(0, "utf8").trim();
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function listChangedSourceFiles() {
  try {
    const unstaged = execSync("git diff --name-only", {
      cwd: root,
      encoding: "utf8",
    }).trim();
    const staged = execSync("git diff --name-only --cached", {
      cwd: root,
      encoding: "utf8",
    }).trim();
    const untracked = execSync("git ls-files --others --exclude-standard", {
      cwd: root,
      encoding: "utf8",
    }).trim();
    const paths = new Set(
      `${unstaged}\n${staged}\n${untracked}`
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean),
    );
    return [...paths].filter(isBuildRelevantPath);
  } catch {
    return null;
  }
}

function isBuildRelevantPath(filePath) {
  if (!filePath) return false;
  if (filePath.startsWith("apps/") || filePath.startsWith("packages/")) {
    return /\.(tsx?|jsx?|json|css)$/.test(filePath) || filePath.endsWith(".mjs");
  }
  if (filePath.startsWith("scripts/") && filePath.endsWith(".mjs")) return true;
  return false;
}

function emit(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

const input = readHookInput();
const status = input.status ?? "completed";
const loopCount = input.loop_count ?? 0;

if (status === "aborted") {
  emit({});
  process.exit(0);
}

const changed = listChangedSourceFiles();
if (changed !== null && changed.length === 0) {
  emit({});
  process.exit(0);
}

console.error(
  `[blocks] Running compile build checks (${changed?.length ?? "?"} changed file(s), loop ${loopCount})…`,
);

const result = spawnSync("node", ["scripts/run-build-tests.mjs", "--capture"], {
  cwd: root,
  encoding: "utf8",
  shell: true,
  maxBuffer: 16 * 1024 * 1024,
});

if (result.status === 0) {
  console.error("[blocks] Build checks passed.");
  emit({});
  process.exit(0);
}

const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
const tail = output.slice(-5000) || "Build failed with no output.";

emit({
  followup_message: [
    "Build check failed after the last code changes. Fix the compile errors below, then stop — the hook will re-run checks automatically.",
    "",
    "```",
    tail,
    "```",
    "",
    "Verify locally with: `pnpm test:build`",
  ].join("\n"),
});

process.exit(0);
