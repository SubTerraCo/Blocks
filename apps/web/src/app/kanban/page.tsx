"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTaskStore, TaskCard, cn } from "@blocks/ui";
import type { Task, TaskStatus } from "@blocks/core";
import { KANBAN_COLUMNS } from "@blocks/core";
import { Plus } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

// Draggable task card wrapper
interface DraggableTaskCardProps {
  task: Task;
  onTaskToggle: (task: Task) => void;
  onTaskPress: (task: Task) => void;
}

function DraggableTaskCard({ task, onTaskToggle, onTaskPress }: DraggableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "touch-none",
        isDragging && "opacity-50"
      )}
    >
      <TaskCard
        task={task}
        onToggleComplete={onTaskToggle}
        onPress={onTaskPress}
        className={cn("animate-fade-in", isDragging && "ring-2 ring-accent-magenta")}
      />
    </div>
  );
}

// Droppable column wrapper
interface DroppableColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  accentColor: string;
  onTaskToggle: (task: Task) => void;
  onTaskPress: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
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
  isOver,
}: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      data-testid="kanban-column"
      className={cn(
        "flex h-full w-72 flex-shrink-0 flex-col rounded-lg",
        "border border-border-default bg-bg-secondary",
        "transition-all duration-200",
        isOver && "border-accent-magenta ring-2 ring-accent-magenta/30"
      )}
    >
      {/* Column header */}
      <div
        className="flex items-center justify-between rounded-t-lg px-3 py-3"
        style={{ backgroundColor: `${accentColor}20` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: accentColor }}
          />
          <h2
            className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: accentColor }}
          >
            {title}
          </h2>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ backgroundColor: accentColor, color: "#fff" }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Tasks container with vertical scroll */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-3">
          {tasks.map((task) => (
            <DraggableTaskCard
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
                isOver ? "border-accent-magenta bg-accent-magenta/5" : "border-border-default"
              )}
            >
              <p className="text-sm text-text-muted">
                {isOver ? "Drop here" : "No tasks"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add task button at bottom */}
      <div className="border-t border-border-default p-3">
        <button
          onClick={() => onAddTask(id)}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg py-2",
            "border-2 border-dashed border-border-default",
            "text-text-tertiary transition-colors",
            "hover:border-accent-magenta hover:text-accent-magenta"
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
  
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    })
  );

  // Group tasks by status using KANBAN_COLUMNS
  const groupedTasks = useMemo(() => {
    const groups: Record<TaskStatus, Task[]> = {
      backlog: [],
      design: [],
      todo: [],
      doing: [],
      review: [],
      done: [],
    };

    tasks.forEach((task) => {
      const status = task.status as TaskStatus;
      if (groups[status]) {
        groups[status].push(task);
      } else {
        groups.backlog.push(task);
      }
    });

    // Sort done tasks by completion date
    groups.done = groups.done.sort((a, b) => {
      if (!a.completedAt || !b.completedAt) return 0;
      return b.completedAt.getTime() - a.completedAt.getTime();
    });

    return groups;
  }, [tasks]);

  const handleTaskToggle = async (task: Task) => {
    if (task.status === "done") {
      await updateTask(task.id, { status: "todo", completedAt: undefined });
    } else {
      await completeTask(task.id);
    }
  };

  const handleTaskPress = (task: Task) => {
    router.push(`/edit-task/${task.id}`);
  };

  const handleAddTask = (status: TaskStatus) => {
    router.push(`/add-task?status=${status}`);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
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
    const newStatus = over.id as TaskStatus;

    // Find the task
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Update the task status
    const updates: { status: TaskStatus; completedAt?: Date | undefined } = { status: newStatus };
    
    // If moving to done, set completedAt
    if (newStatus === "done") {
      updates.completedAt = new Date();
    } else if (task.status === "done") {
      // If moving from done, clear completedAt
      updates.completedAt = undefined;
    }

    await updateTask(taskId, updates);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-text-secondary">Loading tasks...</div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-[calc(100vh-8rem)] gap-4 overflow-x-auto px-4 py-4">
        {KANBAN_COLUMNS.map((column) => (
          <DroppableColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={groupedTasks[column.id]}
            accentColor={column.color}
            onTaskToggle={handleTaskToggle}
            onTaskPress={handleTaskPress}
            onAddTask={handleAddTask}
            isOver={overId === column.id}
          />
        ))}
      </div>

      {/* Drag overlay - shows the dragged item */}
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
  );
}
