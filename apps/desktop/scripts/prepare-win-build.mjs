/**
 * Prepare Windows desktop packaging:
 * 1. Stop running Blocks.exe (installed or unpacked)
 * 2. Ensure release/.build exists (avoids stale locks on release/win-unpacked)
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeElectronBuilderOutputDir } from "./eb-output-path.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const releaseRoot = path.join(__dirname, "..", "release");
const buildOutput = path.join(releaseRoot, ".build");
const stagingOutput = path.join(releaseRoot, ".build-staging");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function killBlocksProcesses() {
  if (process.platform !== "win32") return;

  const kills = [
    'taskkill /F /IM Blocks.exe /T',
    // Dev mode uses electron.exe from this app
    'powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"name=\'electron.exe\'\\" | Where-Object { $_.ExecutablePath -like \'*\\\\Blocks\\\\*\' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"',
  ];

  for (const cmd of kills) {
    try {
      execSync(cmd, { stdio: "ignore" });
      console.log("Stopped Blocks-related process");
    } catch {
      // Not running
    }
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
  await sleep(2000);

  let outputDir = buildOutput;
  const clearedBuild = await tryRemoveDir(buildOutput);

  if (!clearedBuild && fs.existsSync(buildOutput)) {
    console.warn(
      "release/.build is locked (app.asar in use). Using release/.build-staging instead.\n" +
        "Quit Blocks / dev server, then delete release/.build manually when convenient.\n",
    );
    await tryRemoveDir(stagingOutput);
    outputDir = stagingOutput;
  }

  writeElectronBuilderOutputDir(outputDir);

  const legacyUnpacked = path.join(releaseRoot, "win-unpacked");
  if (fs.existsSync(legacyUnpacked)) {
    const removed = await tryRemoveDir(legacyUnpacked);
    if (!removed) {
      console.warn(
        "Note: Could not remove release/win-unpacked (file in use). " +
          "Building to staging output instead.",
      );
    }
  }

  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Build output: ${outputDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
