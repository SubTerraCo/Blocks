/**
 * Prepare Windows desktop packaging:
 * 1. Stop running Blocks.exe (installed or unpacked)
 * 2. Ensure release/.build exists (avoids stale locks on release/win-unpacked)
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const releaseRoot = path.join(__dirname, "..", "release");
const buildOutput = path.join(releaseRoot, ".build");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function killBlocksProcesses() {
  if (process.platform !== "win32") return;
  try {
    execSync('taskkill /F /IM Blocks.exe /T', { stdio: "ignore" });
    console.log("Stopped running Blocks.exe");
  } catch {
    // Not running
  }
}

async function tryRemoveDir(dir) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
      return true;
    } catch {
      await sleep(1000 * (attempt + 1));
    }
  }
  return false;
}

async function main() {
  killBlocksProcesses();
  await sleep(1500);

  await tryRemoveDir(buildOutput);

  const legacyUnpacked = path.join(releaseRoot, "win-unpacked");
  if (fs.existsSync(legacyUnpacked)) {
    const removed = await tryRemoveDir(legacyUnpacked);
    if (!removed) {
      console.warn(
        "Note: Could not remove release/win-unpacked (file in use). " +
          "Building to release/.build instead."
      );
    }
  }

  fs.mkdirSync(buildOutput, { recursive: true });
  console.log(`Build output: ${buildOutput}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
