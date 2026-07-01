import type { TrackingPauseSegment } from "../hooks/useTimerStore";

export interface PauseSegmentLayout {
  beforeRatio: number;
  gapRatio: number;
  afterRatio: number;
}

/** Flex ratios for work / pause gap / resume segments on an active task card */
export function computePauseSegmentLayout(
  blockStartMs: number,
  blockEndMs: number,
  sessionWallStart: number | null,
  segments: TrackingPauseSegment[],
  nowMs: number = Date.now(),
): PauseSegmentLayout | null {
  if (!sessionWallStart || segments.length === 0) return null;

  const blockMs = Math.max(blockEndMs - blockStartMs, 60000);

  let gapMs = 0;
  for (const seg of segments) {
    gapMs += (seg.wallEnd ?? nowMs) - seg.wallStart;
  }

  const beforePauseMs = Math.max(0, segments[0]!.wallStart - sessionWallStart);
  const afterMs = Math.max(0, blockMs - beforePauseMs - gapMs);

  const total = beforePauseMs + gapMs + afterMs;
  if (total <= 0) return null;

  return {
    beforeRatio: beforePauseMs / total,
    gapRatio: gapMs / total,
    afterRatio: afterMs / total,
  };
}
