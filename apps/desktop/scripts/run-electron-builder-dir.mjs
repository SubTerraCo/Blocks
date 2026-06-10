import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getElectronBuilderOutputDir } from "./eb-output-path.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const output = getElectronBuilderOutputDir();

execSync(
  `npx electron-builder --dir -c.directories.output=${JSON.stringify(output)}`,
  { stdio: "inherit", cwd: root },
);
