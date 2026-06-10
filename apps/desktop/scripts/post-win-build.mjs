/**
 * Copy installer artifacts from release/.build to release/ for easy discovery.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getElectronBuilderOutputDir } from "./eb-output-path.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const releaseRoot = path.join(__dirname, "..", "release");
const buildDir = getElectronBuilderOutputDir();

if (!fs.existsSync(buildDir)) {
  process.exit(0);
}

const artifacts = fs.readdirSync(buildDir).filter(
  (name) =>
    /^Blocks-Setup-.*\.(exe|blockmap)$/.test(name) ||
    /^blocks-desktop Setup .*\.(exe|blockmap)$/.test(name) ||
    name === "latest.yml"
);

for (const name of artifacts) {
  const src = path.join(buildDir, name);
  let destName = name;
  // Normalize legacy default name to Blocks-Setup-x.x.x.exe
  const legacyMatch = name.match(/^blocks-desktop Setup (.*)\.(exe|blockmap)$/);
  if (legacyMatch) {
    destName = `Blocks-Setup-${legacyMatch[1]}.${legacyMatch[2]}`;
  }
  const dest = path.join(releaseRoot, destName);
  fs.copyFileSync(src, dest);
  console.log(`Copied ${name} -> release/${destName}`);
}
