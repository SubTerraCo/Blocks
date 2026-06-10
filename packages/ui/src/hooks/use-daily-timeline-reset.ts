// ============================================================================
// BLOCKS - Daily Timeline Reset Hook (deprecated — N-0003 rolling window)
// ============================================================================

/** @deprecated Rolling timeline (N-0003) replaces midnight auto-clear. No-op. */
export function useDailyTimelineReset(_enabled = false): void {
  // Intentionally empty — tasks fall off the ±7 day view without status changes.
}
