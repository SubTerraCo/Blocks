"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useTaskStore,
  useKanbanViewStore,
  TaskCard,
  KanbanToolbar,
  cn,
} from "@blocks/ui";
import type { Task, TaskStatus } from "@blocks/core";
import { KANBAN_COLUMNS } from "@blocks/core";
import { Plus, RefreshCw } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  useDroppable,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const COLUMN_IDS = new Set<string>(KANBAN_COLUMNS.map((c) => c.id));

interface SortableTaskCardProps {
  task: Task;
  onTaskToggle: (task: Task) => void;
  onTaskPress: (task: Task) => void;
}

function SortableTaskCard({ task, onTaskToggle, onTaskPress }: SortableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none">
      <TaskCard
        task={task}
        onToggleComplete={onTaskToggle}
        onPress={onTaskPress}
        className={cn("animate-fade-in", isDragging && "ring-2 ring-accent-magenta")}
      />
    </div>
  );
}

interface DroppableColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  accentColor: string;
  onTaskToggle: (task: Task) => void;
  onTaskPress: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
  onRefreshColumn: (status: TaskStatus) => void;
  isOver: boolean;
}

function DroppableColumn({
  id,
  title,
  tasks,
  accentColor,
  onTaskToggle,
  onTaskPress,
  onAddTask,
  onRefreshColumn,
  isOver,
}: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({ id });
  const hasManual = tasks.some((t) => t.kanbanOrder > 0);

  return (
    <div
      ref={setNodeRef}
      data-testid="kanban-column"
      className={cn(
        "flex h-full w-72 flex-shrink-0 flex-col rounded-lg",
        "border border-border-default bg-bg-secondary",
        "transition-all duration-200",
        isOver && "border-accent-magenta ring-2 ring-accent-magenta/30",
      )}
    >
      <div
        className="flex items-center justify-between rounded-t-lg px-3 py-3"
        style={{ backgroundColor: `${accentColor}20` }}
      >
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: accentColor }} />
          <h2
            className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: accentColor }}
          >
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          {hasManual && (
            <button
              onClick={() => onRefreshColumn(id)}
              title="Refresh sort for this column"
              aria-label={`Refresh sort for ${title}`}
              data-testid={`kanban-refresh-${id}`}
              className="rounded p-1 text-text-muted hover:text-accent-magenta"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ backgroundColor: accentColor, color: "#fff" }}
          >
            {tasks.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onTaskToggle={onTaskToggle}
                onTaskPress={onTaskPress}
              />
            ))}

            {tasks.length === 0 && (
              <div
                className={cn(
                  "rounded-lg border-2 border-dashed py-8 text-center transition-colors",
                  isOver ? "border-accent-magenta bg-accent-magenta/5" : "border-border-default",
                )}
              >
                <p className="text-sm text-text-muted">{isOver ? "Drop here" : "No tasks"}</p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>

      <div className="border-t border-border-default p-3">
        <button
          onClick={() => onAddTask(id)}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg py-2",
            "border-2 border-dashed border-border-default",
            "text-text-tertiary transition-colors",
            "hover:border-accent-magenta hover:text-accent-magenta",
          )}
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">Add Task</span>
        </button>
      </div>
    </div>
  );
}

export default function KanbanPage() {
  const router = useRouter();
  const tasks = useTaskStore((state) => state.tasks);
  const isLoading = useTaskStore((state) => state.isLoading);
  const completeTask = useTaskStore((state) => state.completeTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const reorderKanbanColumn = useTaskStore((state) => state.reorderKanbanColumn);
  const clearKanbanOrder = useTaskStore((state) => state.clearKanbanOrder);

  const loadViews = useKanbanViewStore((state) => state.loadViews);
  const getBoard = useKanbanViewStore((state) => state.getBoard);
  // Subscribe to filter/sort so the board recomputes on change.
  const filter = useKanbanViewStore((state) => state.filter);
  const sort = useKanbanViewStore((state) => state.sort);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  useEffect(() => {
    void loadViews();
  }, [loadViews]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const board = useMemo(
    () => getBoard(tasks),
    // filter/sort are inputs to getBoard via the store closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tasks, filter, sort, getBoard],
  );

  const availableTags = useMemo(
    () => Array.from(new Set(tasks.flatMap((t) => t.tags))).sort(),
    [tasks],
  );
  const availableCategories = useMemo(
    () =>
      Array.from(
        new Set(tasks.map((t) => t.category).filter((c): c is string => Boolean(c))),
      ).sort(),
    [tasks],
  );
  const allTaskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  const overColumn: TaskStatus | null = (() => {
    if (!overId) return null;
    if (COLUMN_IDS.has(overId)) return overId as TaskStatus;
    const overTask = tasks.find((t) => t.id === overId);
    return overTask?.status ?? null;
  })();

  const handleTaskToggle = async (task: Task) => {
    if (task.status === "done") {
      await updateTask(task.id, { status: "todo", completedAt: undefined });
    } else {
      await completeTask(task.id);
    }
  };

  const handleTaskPress = (task: Task) => router.push(`/edit-task/${task.id}`);
  const handleAddTask = (status: TaskStatus) => router.push(`/add-task?status=${status}`);
  const handleRefreshColumn = (status: TaskStatus) => {
    void clearKanbanOrder(board[status].map((t) => t.id));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id?.toString() ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setOverId(null);
    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const overIdStr = over.id.toString();
    const droppedOnColumn = COLUMN_IDS.has(overIdStr);
    const overTask = droppedOnColumn ? null : tasks.find((t) => t.id === overIdStr);
    const targetStatus: TaskStatus = droppedOnColumn
      ? (overIdStr as TaskStatus)
      : overTask?.status ?? task.status;

    if (targetStatus !== task.status) {
      // Cross-column move → status change.
      const updates: { status: TaskStatus; completedAt?: Date | undefined } = {
        status: targetStatus,
      };
      if (targetStatus === "done") updates.completedAt = new Date();
      else if (task.status === "done") updates.completedAt = undefined;
      await updateTask(taskId, updates);

      // Place it into the target column's manual order at the drop point.
      const targetIds = board[targetStatus].map((t) => t.id).filter((id) => id !== taskId);
      const insertAt = overTask ? targetIds.indexOf(overTask.id) : targetIds.length;
      targetIds.splice(insertAt < 0 ? targetIds.length : insertAt, 0, taskId);
      await reorderKanbanColumn(targetIds);
      return;
    }

    // Same-column reorder (manual override).
    if (overTask && overTask.id !== taskId) {
      const ids = board[task.status].map((t) => t.id);
      const from = ids.indexOf(taskId);
      const to = ids.indexOf(overTask.id);
      if (from !== -1 && to !== -1) {
        ids.splice(from, 1);
        ids.splice(to, 0, taskId);
        await reorderKanbanColumn(ids);
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Toolbar stays mounted during task load so its local UI state (open
          filter panel, etc.) is never reset by a loading remount. */}
      <div className="px-4 pt-3">
        <KanbanToolbar
          availableTags={availableTags}
          availableCategories={availableCategories}
          allTaskIds={allTaskIds}
        />
      </div>
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-pulse text-text-secondary">Loading tasks...</div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-1 gap-4 overflow-x-auto px-4 py-4 pb-20">
            {KANBAN_COLUMNS.map((column) => (
              <DroppableColumn
                key={column.id}
                id={column.id}
                title={column.title}
                tasks={board[column.id]}
                accentColor={column.color}
                onTaskToggle={handleTaskToggle}
                onTaskPress={handleTaskPress}
                onAddTask={handleAddTask}
                onRefreshColumn={handleRefreshColumn}
                isOver={overColumn === column.id}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && (
              <div className="w-72 rotate-3 opacity-90">
                <TaskCard
                  task={activeTask}
                  showCheckbox={false}
                  className="shadow-2xl ring-2 ring-accent-magenta"
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
