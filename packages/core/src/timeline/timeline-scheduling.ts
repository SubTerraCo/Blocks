// ============================================================================
// BLOCKS - Single-focus timeline scheduling (N-0021 / B-0015)
// Core principle: two task blocks must never overlap in time.
// Calendar events are handled separately (N-0020 / N-0021).
// ============================================================================

import type { Task, TimeBlock } from "../types";
import { getTaskDurationMinutes } from "./timeline-tracking";

export interface CalendarScheduleConflict {
  eventId: string;
  title: string;
  start: Date;
  end: Date;
}

/** Product invariant — task-task overlap is never allowed without push-back. */
export const SINGLE_FOCUS_TASK_SCHEDULING = true;

export interface TaskTimeRange {
  id: string;
  startMs: number;
  endMs: number;
  durationMs: number;
}

export interface ScheduleConflict {
  taskId: string;
  taskName: string;
  start: Date;
  end: Date;
}

export function taskTimeRange(task: Task): TaskTimeRange | null {
  if (task.status !== "doing" || !task.scheduledAt) return null;
  const startMs = new Date(task.scheduledAt).getTime();
  const durationMs = getTaskDurationMinutes(task) * 60_000;
  return { id: task.id, startMs, endMs: startMs + durationMs, durationMs };
}

export function rangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/** Doing tasks whose scheduled window overlaps [start, start + duration). */
export function findOverlappingScheduledTasks(
  tasks: Task[],
  start: Date,
  durationMinutes: number,
  excludeId?: string,
): ScheduleConflict[] {
  const probeStart = start.getTime();
  const probeEnd = probeStart + durationMinutes * 60_000;

  return tasks
    .filter((t) => t.id !== excludeId)
    .map((t) => ({ task: t, range: taskTimeRange(t) }))
    .filter((x): x is { task: Task; range: TaskTimeRange } => x.range !== null)
    .filter(({ range }) =>
      rangesOverlap(probeStart, probeEnd, range.startMs, range.endMs),
    )
    .map(({ task, range }) => ({
      taskId: task.id,
      taskName: task.name,
      start: new Date(range.startMs),
      end: new Date(range.endMs),
    }));
}

/** Static calendar events overlapping a proposed task window. */
export function findOverlappingCalendarEvents(
  timeBlocks: TimeBlock[],
  start: Date,
  durationMinutes: number,
): CalendarScheduleConflict[] {
  const probeStart = start.getTime();
  const probeEnd = probeStart + durationMinutes * 60_000;

  return timeBlocks
    .filter((b) => b.type === "calendar_event" && b.calendarEvent)
    .filter((b) =>
      rangesOverlap(
        probeStart,
        probeEnd,
        b.startTime.getTime(),
        b.endTime.getTime(),
      ),
    )
    .map((b) => ({
      eventId: b.id,
      title: b.calendarEvent!.title,
      start: b.startTime,
      end: b.endTime,
    }));
}

export interface SchedulePlacementAnalysis {
  taskConflicts: ScheduleConflict[];
  calendarConflicts: CalendarScheduleConflict[];
  pushBackUpdates: { id: string; scheduledAt: Date }[];
}

/** Analyze insert: task push-back + calendar conflicts (N-0020 / N-0021). */
export function analyzeSchedulePlacement(
  tasks: Task[],
  timeBlocks: TimeBlock[],
  insertId: string,
  scheduledAt: Date,
  durationMinutes: number,
): SchedulePlacementAnalysis {
  return {
    taskConflicts: findOverlappingScheduledTasks(
      tasks,
      scheduledAt,
      durationMinutes,
      insertId,
    ),
    calendarConflicts: findOverlappingCalendarEvents(
      timeBlocks,
      scheduledAt,
      durationMinutes,
    ),
    pushBackUpdates: buildTimelineInsertPushBackUpdates(
      tasks,
      insertId,
      scheduledAt,
      durationMinutes,
    ),
  };
}

/**
 * Pin a task at `scheduledAt` and push any overlapping / downstream task blocks later.
 * Returns updates for tasks that move (not including the inserted task).
 */
export function buildTimelineInsertPushBackUpdates(
  tasks: Task[],
  insertId: string,
  scheduledAt: Date,
  durationMinutes: number,
): { id: string; scheduledAt: Date }[] {
  const insertStart = scheduledAt.getTime();
  const insertEnd = insertStart + durationMinutes * 60_000;

  const blocks = tasks
    .filter((t) => t.status === "doing" && t.scheduledAt && t.id !== insertId)
    .map((t) => {
      const range = taskTimeRange(t)!;
      return { id: t.id, start: range.startMs, duration: range.durationMs };
    })
    .sort((a, b) => a.start - b.start);

  const updates = new Map<string, number>();
  let cursor = insertEnd;

  for (const block of blocks) {
    const blockEnd = block.start + block.duration;
    const overlapsInsert = rangesOverlap(
      block.start,
      blockEnd,
      insertStart,
      insertEnd,
    );
    const overlappedByCascade = block.start < cursor && block.start >= insertStart;

    if (overlapsInsert || overlappedByCascade) {
      updates.set(block.id, cursor);
      cursor = cursor + block.duration;
    }
  }

  return [...updates.entries()].map(([id, startMs]) => ({
    id,
    scheduledAt: new Date(startMs),
  }));
}

/** True when any pair of doing scheduled tasks overlap. */
export function hasTaskTimelineOverlaps(tasks: Task[]): boolean {
  const ranges = tasks
    .map(taskTimeRange)
    .filter((r): r is TaskTimeRange => r !== null)
    .sort((a, b) => a.startMs - b.startMs);

  for (let i = 0; i < ranges.length; i++) {
    for (let j = i + 1; j < ranges.length; j++) {
      const a = ranges[i]!;
      const b = ranges[j]!;
      if (rangesOverlap(a.startMs, a.endMs, b.startMs, b.endMs)) {
        return true;
      }
    }
  }
  return false;
}
