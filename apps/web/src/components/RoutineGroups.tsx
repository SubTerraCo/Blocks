// ============================================================================
// BLOCKS Desktop - Routine Groups Component
// Spawn grouped tasks from saved routines (e.g. Morning Routine)
// ============================================================================

import { useEffect, useState } from "react";
import { cn, Button, useRoutinesStore, useTaskStore } from "@blocks/ui";
import type { Routine } from "@blocks/core";
import { Layers, Play, ChevronDown, ChevronUp } from "lucide-react";

interface RoutineGroupsProps {
  className?: string;
  onSpawned?: (count: number) => void;
}

export function RoutineGroups({ className, onSpawned }: RoutineGroupsProps) {
  const routines = useRoutinesStore((s) => s.routines);
  const loadRoutines = useRoutinesStore((s) => s.loadRoutines);
  const spawnRoutine = useTaskStore((s) => s.spawnRoutine);
  const scheduleDoingTasks = useTaskStore((s) => s.scheduleDoingTasks);
  const [expanded, setExpanded] = useState(true);
  const [spawningId, setSpawningId] = useState<string | null>(null);

  useEffect(() => {
    void loadRoutines();
  }, [loadRoutines]);

  const handleSpawn = async (routine: Routine) => {
    setSpawningId(routine.id);
    try {
      const startAt = parseRoutineStartTime(routine.scheduledTime);
      const tasks = await spawnRoutine(routine, startAt);
      if (tasks.length > 0) {
        await scheduleDoingTasks();
      }
      onSpawned?.(tasks.length);
    } catch (error) {
      console.error("Failed to spawn routine:", error);
    } finally {
      setSpawningId(null);
    }
  };

  if (routines.length === 0) return null;

  return (
    <div className={cn("rounded-xl border border-border-default bg-bg-secondary", className)}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-accent-cyan" />
          <span className="text-sm font-medium text-text-primary">Routines</span>
          <span className="rounded-full bg-bg-tertiary px-2 py-0.5 text-xs text-text-muted">
            {routines.length}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-text-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-text-muted" />
        )}
      </button>

      {expanded && (
        <div className="space-y-2 border-t border-border-default px-4 py-3">
          {routines.map((routine) => (
            <div
              key={routine.id}
              className="flex items-center gap-3 rounded-lg bg-bg-tertiary p-3"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg"
                style={{ backgroundColor: (routine.color ?? "#3B82F6") + "25" }}
              >
                {routine.icon ?? "📋"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">{routine.name}</p>
                <p className="text-xs text-text-muted">
                  {routine.items.length} tasks
                  {routine.scheduledTime ? ` · ${routine.scheduledTime}` : ""}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={spawningId === routine.id}
                onClick={() => void handleSpawn(routine)}
                className="shrink-0"
              >
                <Play className="mr-1 h-3.5 w-3.5" />
                {spawningId === routine.id ? "Adding..." : "Run"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function parseRoutineStartTime(time?: string): Date | undefined {
  if (!time) return new Date();
  const [h, m] = time.split(":").map(Number);
  const start = new Date();
  start.setHours(h ?? 0, m ?? 0, 0, 0);
  if (start < new Date()) {
    return new Date();
  }
  return start;
}
