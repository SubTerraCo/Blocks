import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const marker = path.join(__dirname, "..", "release", ".eb-output");

export function getElectronBuilderOutputDir() {
  if (fs.existsSync(marker)) {
    const value = fs.readFileSync(marker, "utf8").trim();
    if (value) return value;
  }
  return path.join(__dirname, "..", "release", ".build");
}

export function writeElectronBuilderOutputDir(dir) {
  fs.mkdirSync(path.dirname(marker), { recursive: true });
  fs.writeFileSync(marker, dir, "utf8");
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  console.log(getElectronBuilderOutputDir());
}
