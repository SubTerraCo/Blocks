/** Shared bottom timeline / tracking controls (B-0010 · N-0012 · N-0015) */

/** Primary square — pause, view toggle, schedule */
export const TIMELINE_BOTTOM_ACTION_BTN =
  "flex h-12 w-12 items-center justify-center rounded-xl bg-accent-magenta text-white shadow-lg transition-all hover:bg-accent-magenta/90 disabled:opacity-50";

/** Secondary square — prev / next on tracking player row */
export const TIMELINE_BOTTOM_ACTION_BTN_SM =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-magenta text-white shadow-md transition-all hover:bg-accent-magenta/90 disabled:opacity-50";

/** Fixed row above bottom nav — h-16 nav + ~12px cushion (B-0013) */
export const TIMELINE_BOTTOM_ACTION_FIXED = "fixed bottom-[calc(4rem+12px)] z-20";

/** Centered tracking player cluster — items-center; add-time menu is out-of-flow (B-0013-003) */
export const TIMELINE_TRACKING_PLAYER_ROW =
  "fixed bottom-[calc(4rem+12px)] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2";
