import type { TimeBlock, TimelineHourSlot } from "@blocks/core";

import { TIMELINE_HOUR_HEIGHT_PX } from "./timeline-rolling";



export interface TimelineDropPreview {

  scheduledAt: Date;

  /** px from top of scroll content (not viewport) */

  topPx: number;

  heightPx: number;

}



const SNAP_MINUTES = 15;

const EDGE_MAGNET_MINUTES = 8;



/** Snap a date to the nearest 15-minute mark. */

export function snapToQuarterHour(date: Date): Date {

  const snapped = new Date(date);

  const rounded = Math.round(snapped.getMinutes() / SNAP_MINUTES) * SNAP_MINUTES;

  snapped.setMinutes(rounded, 0, 0);

  return snapped;

}



function rowContentTop(row: HTMLElement, scrollContainer: HTMLElement): number {

  const containerRect = scrollContainer.getBoundingClientRect();

  return row.getBoundingClientRect().top - containerRect.top + scrollContainer.scrollTop;

}



/** Collect start/end edge times (minute-of-day) for task blocks on the same calendar day. */

function collectTaskEdgeMinutes(

  timeBlocks: TimeBlock[],

  excludeId: string,

  day: Date,

): number[] {

  const dayKey = day.toDateString();

  const edges: number[] = [];



  for (const block of timeBlocks) {

    if (block.type !== "task" || !block.task || block.task.id === excludeId) continue;

    if (block.startTime.toDateString() !== dayKey) continue;

    edges.push(block.startTime.getHours() * 60 + block.startTime.getMinutes());

    edges.push(block.endTime.getHours() * 60 + block.endTime.getMinutes());

  }



  return edges;

}



/** B-0021 · Prefer snapping to another task card edge within magnet window. */

export function snapWithTaskEdges(

  candidate: Date,

  timeBlocks: TimeBlock[],

  excludeId: string,

): Date {

  const minuteOfDay = candidate.getHours() * 60 + candidate.getMinutes();

  const edges = collectTaskEdgeMinutes(timeBlocks, excludeId, candidate);



  let bestEdge: number | null = null;

  let bestDist = Infinity;

  for (const edge of edges) {

    const dist = Math.abs(edge - minuteOfDay);

    if (dist <= EDGE_MAGNET_MINUTES && dist < bestDist) {

      bestDist = dist;

      bestEdge = edge;

    }

  }



  if (bestEdge !== null) {

    const snapped = new Date(candidate);

    snapped.setHours(Math.floor(bestEdge / 60), bestEdge % 60, 0, 0);

    return snapped;

  }



  return snapToQuarterHour(candidate);

}



/**

 * Resolve drop time + ghost position from a viewport pointer Y inside the timeline scroller.

 */

export function resolveTimelineDropFromPointer(

  clientY: number,

  scrollContainer: HTMLElement,

  slots: TimelineHourSlot[],

  block: TimeBlock,

  hourHeightPx: number = TIMELINE_HOUR_HEIGHT_PX,

  timeBlocks: TimeBlock[] = [],

): TimelineDropPreview | null {

  const containerRect = scrollContainer.getBoundingClientRect();

  const contentY = clientY - containerRect.top + scrollContainer.scrollTop;



  const hourRows = scrollContainer.querySelectorAll<HTMLElement>("[data-timeline-hour-row]");

  for (const row of hourRows) {

    const rowTop = rowContentTop(row, scrollContainer);

    const rowHeight = row.offsetHeight;

    if (contentY < rowTop || contentY > rowTop + rowHeight) continue;



    const slotIndex = Number(row.dataset.slotIndex);

    const slot = slots.find((s) => s.slotIndex === slotIndex);

    if (!slot) return null;



    const offsetInHour = contentY - rowTop;

    const minute = Math.max(

      0,

      Math.min(59, Math.round((offsetInHour / rowHeight) * 60)),

    );

    const scheduled = new Date(slot.startTime);

    scheduled.setMinutes(minute, 0, 0);



    const excludeId = block.task?.id ?? block.id;

    const snapped = snapWithTaskEdges(scheduled, timeBlocks, excludeId);



    const durationMin =

      (block.endTime.getTime() - block.startTime.getTime()) / 60000;

    const topPx = rowTop + (snapped.getMinutes() / 60) * hourHeightPx;

    const heightPx = Math.max((durationMin / 60) * hourHeightPx, 40);



    return { scheduledAt: snapped, topPx, heightPx };

  }



  return null;

}



/** B-0021 · Schedule immediately uses exact now — no quarter-hour or edge snap. */

export function scheduleImmediatelyAt(now: Date = new Date()): Date {

  const d = new Date(now);

  d.setSeconds(0, 0);

  return d;

}


