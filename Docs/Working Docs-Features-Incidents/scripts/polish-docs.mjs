/**
 * Pad and align all markdown + text-block tables in CI working docs.
 *
 * Usage: node scripts/polish-docs.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { matrixBlock } from "./format-matrix.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const FILES = ["FEATURE_REGISTRY.md", "INCIDENTS.md", "ROADMAP.md"];

/** Strip markdown for width measurement */
function plain(text) {
  return String(text)
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

function parseCells(line) {
  let s = line.trim();
  if (!s.startsWith("|")) return null;
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s
    .slice(1)
    .split("|")
    .map((c) => c.trim());
}

function isSeparatorRow(cells) {
  return cells.every((c) => /^:?-+:?$/.test(c));
}

function separatorFor(width, align) {
  if (align === "center") return `:${"-".repeat(Math.max(1, width - 2))}:`;
  if (align === "right") return `${"-".repeat(Math.max(1, width - 1))}:`;
  return "-".repeat(width);
}

function detectAlign(cell) {
  if (/^:-+:$/.test(cell)) return "center";
  if (/^-+:$/.test(cell)) return "right";
  return "left";
}

function formatRow(cells, widths, pad = " ") {
  return `| ${cells.map((c, i) => c.padEnd(widths[i], pad)).join(" | ")} |`;
}

function sortRows(rows, headers) {
  if (rows.length <= 1) return rows;
  const h0 = plain(headers[0]).toLowerCase();
  const sortable =
    h0 === "code" ||
    h0 === "id" ||
    h0.includes("feature") ||
    rows.every((r) => /^[A-Z]{2}\./.test(plain(r[0])) || /^B-\d+/.test(plain(r[0])) || /^N-\d+/.test(plain(r[0])));
  if (!sortable) return rows;
  return [...rows].sort((a, b) => plain(a[0]).localeCompare(plain(b[0]), undefined, { numeric: true }));
}

function formatMarkdownTable(header, alignments, rows) {
  const sorted = sortRows(rows, header);
  const all = [header, ...sorted];
  const widths = header.map((_, col) =>
    Math.max(3, ...all.map((row) => plain(row[col] ?? "").length))
  );

  const headerLine = formatRow(header, widths);
  const sepLine = formatRow(
    alignments.map((a, i) => separatorFor(widths[i], a)),
    widths,
    "-"
  );
  const body = sorted.map((row) =>
    formatRow(
      row.map((c, i) => {
        const p = plain(c);
        const w = widths[i];
        if (alignments[i] === "center" && p.length < w) {
          const pad = w - p.length;
          const left = Math.floor(pad / 2);
          return " ".repeat(left) + c.trim() + " ".repeat(pad - left);
        }
        return c.trim().padEnd(w);
      }),
      widths
    )
  );

  return [headerLine, sepLine, ...body].join("\n");
}

function polishMarkdownTables(content) {
  const lines = content.split("\n");
  const out = [];
  let i = 0;
  let inFence = false;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      out.push(line);
      i++;
      continue;
    }

    if (inFence) {
      out.push(line);
      i++;
      continue;
    }

    const cells = parseCells(line);
    if (!cells) {
      out.push(line);
      i++;
      continue;
    }

    const block = [lines[i]];
    i++;
    while (i < lines.length && parseCells(lines[i])) {
      block.push(lines[i]);
      i++;
    }

    const parsed = block.map(parseCells);
    if (parsed.length < 2) {
      out.push(...block);
      continue;
    }

    const header = parsed[0];
    let alignRowIdx = 1;
    let alignments = header.map(() => "left");
    if (isSeparatorRow(parsed[1])) {
      alignments = parsed[1].map(detectAlign);
      alignRowIdx = 1;
    }

    const dataStart = isSeparatorRow(parsed[1]) ? 2 : 1;
    const rows = parsed.slice(dataStart);
    out.push(formatMarkdownTable(header, alignments, rows));
  }

  return out.join("\n");
}

/** Re-wrap text matrices using matrixBlock (Feature col 32, cells 10) */
function polishTextMatrices(content) {
  return content.replace(/```text\n([\s\S]*?)```/g, (match, body) => {
    if (body.includes("|--------------------------------|")) return match;
    const lines = body.trim().split("\n");
    if (lines.length < 2 || !lines[0].includes("Feature")) return match;

    const headerCells = parseCells(lines[0]);
    if (!headerCells || headerCells[0] !== "Feature") return match;

    const cols = headerCells.slice(1);
    const dataLines = lines.slice(2); // skip header + separator
    const rows = [];
    for (const line of dataLines) {
      const cells = parseCells(line);
      if (!cells) continue;
      rows.push([cells[0], ...cells.slice(1)]);
    }

    rows.sort((a, b) => plain(a[0]).localeCompare(plain(b[0])));
    return "```text\n" + matrixBlock("Feature", cols, rows) + "\n```";
  });
}

function polishFile(name) {
  const filePath = path.join(root, name);
  let content = fs.readFileSync(filePath, "utf8");
  content = polishTextMatrices(content);
  content = polishMarkdownTables(content);
  fs.writeFileSync(filePath, content);
  console.log("Polished", name);
}

for (const f of FILES) polishFile(f);
