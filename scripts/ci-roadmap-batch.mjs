/**
 * Shared ROADMAP batch-log helpers (read-ci-context, daily-release-rollover).
 * Handles headings like "### Batch log (Sprint 5)" and CRLF section dividers.
 */

/** @param {string} roadmap */
export function batchLogSectionStart(roadmap) {
  const match = roadmap.match(/^### Batch log\b/m);
  return match?.index ?? -1;
}

/** @param {string} roadmap */
export function sliceFromBatchLog(roadmap) {
  const start = batchLogSectionStart(roadmap);
  return start >= 0 ? roadmap.slice(start) : roadmap;
}

/** Closes the batch log table (before ## Proposed, etc.) */
const BATCH_LOG_DIVIDER_RE = /\r?\n---\r?\n/;

/**
 * Index immediately before the batch-log section divider.
 * @param {string} roadmap
 * @returns {number}
 */
export function findBatchLogInsertIndex(roadmap) {
  const start = batchLogSectionStart(roadmap);
  if (start < 0) return -1;

  const afterSection = roadmap.slice(start);
  const dividerMatch = afterSection.match(BATCH_LOG_DIVIDER_RE);
  if (!dividerMatch || dividerMatch.index === undefined) return -1;

  return start + dividerMatch.index;
}

/**
 * @param {string} roadmap
 * @returns {string}
 */
export function detectLineEnding(roadmap) {
  return roadmap.includes("\r\n") ? "\r\n" : "\n";
}

/**
 * Insert a row into the ROADMAP batch log table (before the section divider).
 * @param {string} roadmap
 * @param {string} row
 */
export function insertBatchLogRow(roadmap, row) {
  const insertAt = findBatchLogInsertIndex(roadmap);
  if (insertAt < 0) return roadmap;

  const eol = detectLineEnding(roadmap);
  const normalizedRow = row.endsWith("\n") || row.endsWith("\r\n") ? row : `${row}${eol}`;
  const before = roadmap.slice(0, insertAt);
  const after = roadmap.slice(insertAt);
  const needsLeadingEol =
    before.length > 0 && !before.endsWith("\n") && !before.endsWith("\r\n");
  const prefix = needsLeadingEol ? eol : "";
  return `${before}${prefix}${normalizedRow}${after}`;
}

/**
 * @param {string} roadmap
 * @returns {{ batch: string; session: string; items: string[]; status: string }[]}
 */
export function parseBatchLogRows(roadmap) {
  const inBatchLog = sliceFromBatchLog(roadmap);

  /** @type {{ batch: string; session: string; items: string[]; status: string }[]} */
  const rows = [];

  for (const line of inBatchLog.split(/\r?\n/)) {
    if (!line.startsWith("|") || line.includes("Batch |") || line.includes("-----")) {
      continue;
    }
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length < 4) continue;
    const [batch, session, itemsCell, status] = cells;
    if (!/^v[\d.]+b\d+$/.test(batch)) continue;
    const items = [...itemsCell.matchAll(/\b(N-\d{4}|B-\d{4})\b/g)].map((m) => m[1]);
    rows.push({ batch, session, items, status });
  }

  return rows;
}
