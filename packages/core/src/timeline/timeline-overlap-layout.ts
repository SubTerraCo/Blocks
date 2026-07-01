// ============================================================================
// BLOCKS - Timeline overlap column layout (N-0021 · Google Calendar style)
// N-0047 · Events (user isEvent + calendar) keep the right-hand column(s)
// ============================================================================

import type { TimeBlock } from "../types";
import { rangesOverlap } from "./timeline-scheduling";

export interface OverlapLayout {
  column: number;
  totalColumns: number;
}

/**
 * Column bias rank for N-0047. Regular tasks stay left (rank 0); user events
 * (`task.isEvent`) and Google Calendar events are pushed to the right (rank 1)
 * whenever they overlap another block in the same cluster.
 */
type ColumnRank = 0 | 1;

type LayoutableBlock = {
  id: string;
  startMs: number;
  endMs: number;
  rank: ColumnRank;
};

/** N-0047: events and calendar blocks bias to the right column on conflict. */
function columnRank(block: TimeBlock): ColumnRank {
  if (block.type === "calendar_event") return 1;
  if (block.type === "task" && block.task?.isEvent === true) return 1;
  return 0;
}

function toLayoutable(block: TimeBlock): LayoutableBlock | null {
  if (block.type !== "task" && block.type !== "calendar_event") return null;
  return {
    id: block.id,
    startMs: block.startTime.getTime(),
    endMs: block.endTime.getTime(),
    rank: columnRank(block),
  };
}

/** Group blocks that overlap in time (transitive clusters). */
function clusterLayoutables(blocks: LayoutableBlock[]): LayoutableBlock[][] {
  const sorted = [...blocks].sort((a, b) => a.startMs - b.startMs);
  const clusters: LayoutableBlock[][] = [];

  for (const block of sorted) {
    let placed = false;
    for (const cluster of clusters) {
      const overlapsCluster = cluster.some((other) =>
        rangesOverlap(block.startMs, block.endMs, other.startMs, other.endMs),
      );
      if (overlapsCluster) {
        cluster.push(block);
        placed = true;
        break;
      }
    }
    if (!placed) clusters.push([block]);
  }

  // Merge clusters that bridged through transitive overlap
  let merged = true;
  while (merged) {
    merged = false;
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const a = clusters[i]!;
        const b = clusters[j]!;
        const shouldMerge = a.some((x) =>
          b.some((y) =>
            rangesOverlap(x.startMs, x.endMs, y.startMs, y.endMs),
          ),
        );
        if (shouldMerge) {
          clusters[i] = [...a, ...b];
          clusters.splice(j, 1);
          merged = true;
          break;
        }
      }
      if (merged) break;
    }
  }

  return clusters;
}

/** Assign columns within a cluster (greedy lane packing). */
function layoutCluster(cluster: LayoutableBlock[]): Map<string, OverlapLayout> {
  const result = new Map<string, OverlapLayout>();
  if (cluster.length === 0) return result;

  // N-0047: process regular tasks first so they claim the left lanes; events
  // and calendar blocks then fall into the remaining right-hand lane(s) whenever
  // they actually overlap a task. Ties within a rank keep start-time order.
  const sorted = [...cluster].sort(
    (a, b) => a.rank - b.rank || a.startMs - b.startMs,
  );
  const columnEnds: number[] = [];

  for (const block of sorted) {
    let column = columnEnds.findIndex(
      (end) => end <= block.startMs,
    );
    if (column < 0) {
      column = columnEnds.length;
      columnEnds.push(block.endMs);
    } else {
      columnEnds[column] = block.endMs;
    }
    result.set(block.id, { column, totalColumns: 0 });
  }

  const totalColumns = columnEnds.length;
  for (const [, layout] of result) {
    layout.totalColumns = totalColumns;
  }
  return result;
}

/**
 * Column positions for task + calendar blocks that overlap in time.
 * Single non-overlapping blocks span full width (column 0 / totalColumns 1).
 */
export function computeTimelineOverlapLayout(
  timeBlocks: TimeBlock[],
): Map<string, OverlapLayout> {
  const layoutables = timeBlocks
    .map(toLayoutable)
    .filter((b): b is LayoutableBlock => b !== null);

  const out = new Map<string, OverlapLayout>();
  for (const block of layoutables) {
    out.set(block.id, { column: 0, totalColumns: 1 });
  }

  for (const cluster of clusterLayoutables(layoutables)) {
    if (cluster.length <= 1) continue;
    const clusterLayout = layoutCluster(cluster);
    for (const [id, layout] of clusterLayout) {
      out.set(id, layout);
    }
  }

  return out;
}

export function overlapLayoutToStyle(
  layout: OverlapLayout | undefined,
  gapPx = 4,
): { left: number | string; width?: string; right: number | string } {
  if (!layout || layout.totalColumns <= 1) {
    return { left: 0, right: "1rem" };
  }
  const colWidth = 100 / layout.totalColumns;
  return {
    left: `calc(${layout.column * colWidth}% + ${gapPx / 2}px)`,
    width: `calc(${colWidth}% - ${gapPx}px)`,
    right: "auto",
  };
}
