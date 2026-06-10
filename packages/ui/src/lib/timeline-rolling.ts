// ============================================================================
// BLOCKS - Rolling timeline constants (N-0003)
// ============================================================================

export const TIMELINE_HOUR_HEIGHT_PX = 120;

export function formatDayHeader(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}
