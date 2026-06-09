/**
 * Aligned pipe matrices for FEATURE_REGISTRY / INCIDENTS / ROADMAP.
 * Column widths: Feature 32 · each platform cell 10 · pipes align vertically.
 *
 * Usage: node scripts/format-matrix.mjs
 */
const FEATURE_W = 32;
const CELL_W = 10;

export function padCell(text, width = CELL_W) {
  const s = String(text);
  if (s.length >= width) return s.slice(0, width);
  const pad = width - s.length;
  const left = Math.floor(pad / 2);
  return " ".repeat(left) + s + " ".repeat(pad - left);
}

export function matrixBlock(title, columns, rows) {
  const header = `|${padCell(title, FEATURE_W)}|${columns.map((c) => padCell(c)).join("|")}|`;
  const sep = `|${"-".repeat(FEATURE_W)}|${columns.map(() => "-".repeat(CELL_W)).join("|")}|`;
  const body = rows
    .map(([feature, ...cells]) => `|${padCell(feature, FEATURE_W)}|${cells.map((c) => padCell(c)).join("|")}|`)
    .join("\n");
  return `${header}\n${sep}\n${body}`;
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  console.log(
    matrixBlock("Feature", ["DT", "WB", "AD", "SH"], [
      ["Dark theme", "✅", "✅", "✅", "—"],
      ["Light theme", "✅ B-0003", "✅ B-0003", "✅", "—"],
    ])
  );
}
