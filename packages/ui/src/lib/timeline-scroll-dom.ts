import { clampTimelineNowBarRatio } from "@blocks/core";

/** Scroll timeline container so current time aligns at viewport ratio (N-0006 / N-0007 / N-0014) */
export function scrollTimelineContainerToNow(
  scrollEl: HTMLElement,
  now: Date,
  behavior: ScrollBehavior = "auto",
  viewportRatio = 0.5,
): boolean {
  const selector = `[data-slot-time="${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}"]`;
  const slot = scrollEl.querySelector<HTMLElement>(selector);
  if (!slot) return false;

  const minutePct = now.getMinutes() / 60;
  const scrollRect = scrollEl.getBoundingClientRect();
  const slotRect = slot.getBoundingClientRect();
  const slotTopInScroll = slotRect.top - scrollRect.top + scrollEl.scrollTop;
  const nowY = slotTopInScroll + slotRect.height * minutePct;
  const ratio = clampTimelineNowBarRatio(viewportRatio);
  const top = Math.max(0, nowY - scrollEl.clientHeight * ratio);

  scrollEl.scrollTo({ top, behavior });
  return true;
}

/** Scroll to midnight of `day` */
export function scrollTimelineContainerToDay(
  scrollEl: HTMLElement,
  day: Date,
  behavior: ScrollBehavior = "smooth",
): boolean {
  const d = new Date(day);
  d.setHours(0, 0, 0, 0);
  const selector = `[data-slot-time="${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-0"]`;
  const slot = scrollEl.querySelector<HTMLElement>(selector);
  if (!slot) return false;

  const scrollRect = scrollEl.getBoundingClientRect();
  const slotRect = slot.getBoundingClientRect();
  const top = slotRect.top - scrollRect.top + scrollEl.scrollTop;
  scrollEl.scrollTo({ top: Math.max(0, top), behavior });
  return true;
}
