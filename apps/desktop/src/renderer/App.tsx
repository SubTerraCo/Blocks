import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { UpdateNotification } from "./components/UpdateNotification";
import { TaskEditPage } from "./components/TaskEditPage";
import { PlacementPickerModal } from "./components/PlacementPickerModal";
import { SettingsPage } from "./components/SettingsPage";
import { ProfilePage } from "./components/ProfilePage";
import { useTheme } from "./hooks/useTheme";
import { ActiveTimer, TimerButton } from "./components/ActiveTimer";
import { notificationService } from "./hooks/useNotifications";
import { 
  useTaskStore, 
  useQuickBlocksStore,
  useOnlineStatus,
  BottomNav, 
  TaskCard,
  TimelineBlock,
  EditableQuickAddGrid,
  CreateBlockModal,
  cn,
  formatTime
} from "@blocks/ui";
import type { 
  Task, 
  TaskStatus, 
  TimeBlock as TimeBlockType,
  QuickAddBlock
} from "@blocks/core";
import { 
  KANBAN_COLUMNS, 
  calculateDuration,
  GeminiService,
  type ChatMessage
} from "@blocks/core";
import { 
  Clock, 
  CalendarPlus, 
  Grid3X3, 
  Sparkles, 
  Search, 
  MessageSquare,
  Send,
  Wifi,
  WifiOff,
  Plus,
  Pencil,
  Check,
  Settings,
  User
} from "lucide-react";
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

// ============================================================================
// Desktop Title Bar
// ============================================================================
function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const checkMaximized = async () => {
      if (window.electronAPI) {
        const maximized = await window.electronAPI.isMaximized();
        setIsMaximized(maximized);
      }
    };
    checkMaximized();
  }, []);

  const handleMinimize = () => window.electronAPI?.minimize();
  const handleMaximize = async () => {
    await window.electronAPI?.maximize();
    const maximized = await window.electronAPI?.isMaximized();
    setIsMaximized(maximized ?? false);
  };
  const handleClose = () => window.electronAPI?.close();

  return (
    <div className="drag-region flex h-10 items-center justify-between bg-bg-primary px-4 border-b border-border-default">
      <div className="flex items-center gap-2">
        <span className="text-accent-magenta font-bold text-lg no-drag">⬡</span>
        <span className="text-text-primary font-semibold text-sm">Blocks</span>
      </div>
      <div className="no-drag flex items-center gap-1">
        <button
          onClick={handleMinimize}
          className="h-8 w-8 flex items-center justify-center rounded hover:bg-bg-tertiary transition-colors"
        >
          <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <button
          onClick={handleMaximize}
          className="h-8 w-8 flex items-center justify-center rounded hover:bg-bg-tertiary transition-colors"
        >
          {isMaximized ? (
            <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v2m0 8v2a2 2 0 002 2h2m8 0h2a2 2 0 002-2v-2m0-8V6a2 2 0 00-2-2h-2" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2m8 0h2a2 2 0 002-2v-2m0-8V6a2 2 0 00-2-2h-2" />
            </svg>
          )}
        </button>
        <button
          onClick={handleClose}
          className="h-8 w-8 flex items-center justify-center rounded hover:bg-red-600 transition-colors"
        >
          <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Kanban Page with Drag & Drop
// ============================================================================

// Draggable task card wrapper
function DraggableTaskCard({ 
  task, 
  onTaskToggle, 
  onTaskPress 
}: { 
  task: Task; 
  onTaskToggle: (task: Task) => void; 
  onTaskPress: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn("touch-none", isDragging && "opacity-50")}
    >
      <TaskCard
        task={task}
        onToggleComplete={onTaskToggle}
        onPress={onTaskPress}
        className={cn("animate-fade-in cursor-grab active:cursor-grabbing", isDragging && "ring-2 ring-accent-magenta")}
      />
    </div>
  );
}

// Droppable column wrapper
function DroppableColumn({
  id,
  title,
  tasks,
  accentColor,
  onTaskToggle,
  onTaskPress,
  onAddTask,
  isOver,
}: {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  accentColor: string;
  onTaskToggle: (task: Task) => void;
  onTaskPress: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({ id });

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
      <div
        className="flex items-center justify-between rounded-t-lg px-3 py-3"
        style={{ backgroundColor: `${accentColor}20` }}
      >
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: accentColor }} />
          <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: accentColor }}>
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
              <p className="text-sm text-text-muted">{isOver ? "Drop here" : "No tasks"}</p>
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-border-default p-3 pb-4">
        <button
          onClick={() => onAddTask(id)}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-2 border-2 border-dashed border-border-default text-text-tertiary transition-colors hover:border-accent-magenta hover:text-accent-magenta"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">Add Task</span>
        </button>
      </div>
    </div>
  );
}

function KanbanPage({ onEditTask, onAddTask }: { onEditTask: (task: Task) => void; onAddTask: (status: TaskStatus) => void }) {
  const tasks = useTaskStore((state) => state.tasks);
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

  // Group tasks by status
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
    const newStatus = over.id as TaskStatus;
    const task = tasks.find((t) => t.id === taskId);
    
    if (!task || task.status === newStatus) return;

    const updates: { status: TaskStatus; completedAt?: Date | undefined } = { status: newStatus };
    
    if (newStatus === "done") {
      updates.completedAt = new Date();
    } else if (task.status === "done") {
      updates.completedAt = undefined;
    }

    await updateTask(taskId, updates);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-[calc(100%-1rem)] gap-4 overflow-x-auto p-4 pb-2">
        {KANBAN_COLUMNS.map((column) => (
          <DroppableColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={groupedTasks[column.id]}
            accentColor={column.color}
            onTaskToggle={handleTaskToggle}
            onTaskPress={onEditTask}
            onAddTask={onAddTask}
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

// ============================================================================
// Timeline Page
// ============================================================================
function generateTimeSlots(): Date[] {
  const slots: Date[] = [];
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  for (let hour = 0; hour < 24; hour++) {
    const slot = new Date(startOfDay);
    slot.setHours(hour);
    slots.push(slot);
  }
  return slots;
}

// Helper to convert duration in minutes to blockSize + blockCount
function durationToBlocks(minutes: number): { blockSize: "15min" | "30min" | "1hour" | "1week"; blockCount: number } {
  if (minutes <= 15) return { blockSize: "15min", blockCount: 1 };
  if (minutes <= 30) return { blockSize: "15min", blockCount: Math.ceil(minutes / 15) };
  if (minutes <= 60) return { blockSize: "30min", blockCount: Math.ceil(minutes / 30) };
  return { blockSize: "1hour", blockCount: Math.ceil(minutes / 60) };
}

function tasksToTimeBlocks(tasks: Task[]): TimeBlockType[] {
  return tasks
    .filter((t) => t.scheduledAt && (t.status === "todo" || t.status === "doing"))
    .map((task) => {
      const duration = task.duration ?? calculateDuration(task.blockSize, task.blockCount);
      return {
        id: task.id,
        type: "task" as const,
        startTime: task.scheduledAt!,
        endTime: new Date(task.scheduledAt!.getTime() + duration * 60000),
        task,
      };
    });
}

// Draggable Timeline Block component
function DraggableTimelineBlock({ 
  block, 
  onPress,
  style,
}: { 
  block: TimeBlockType;
  onPress: (block: TimeBlockType) => void;
  style: React.CSSProperties;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: block.id,
    data: { type: "timeline-block", block },
  });

  const dragStyle = transform
    ? {
        ...style,
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 50 : 1,
        opacity: isDragging ? 0.8 : 1,
        cursor: isDragging ? "grabbing" : "grab",
      }
    : { ...style, cursor: "grab" };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={dragStyle}
      className="absolute left-0 right-4 group"
      onClick={(e) => {
        // Only trigger onPress if not dragging
        if (!isDragging) {
          e.stopPropagation();
          onPress(block);
        }
      }}
    >
      <TimelineBlock 
        block={block} 
        onPress={() => {}} 
        className={cn("h-full transition-shadow", isDragging && "shadow-2xl ring-2 ring-accent-magenta")} 
      />
      {/* Timer button overlay */}
      {block.task && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <TimerButton task={block.task} size="sm" />
        </div>
      )}
    </div>
  );
}

// Droppable time slot component
function DroppableTimeSlot({ 
  hour, 
  minute, 
  children,
  isOver,
}: { 
  hour: number;
  minute: number;
  children?: React.ReactNode;
  isOver?: boolean;
}) {
  const slotId = `slot-${hour}-${minute}`;
  const { setNodeRef } = useDroppable({
    id: slotId,
    data: { type: "time-slot", hour, minute },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "absolute left-0 right-0 h-[20px]",
        isOver && "bg-accent-magenta/20 rounded"
      )}
      style={{ top: `${(minute / 60) * 100}%` }}
    >
      {children}
    </div>
  );
}

function TimelinePage({ onEditTask }: { onEditTask: (task: Task) => void }) {
  const tasks = useTaskStore((state) => state.tasks);
  const updateTask = useTaskStore((state) => state.updateTask);
  const scheduleDoingTasks = useTaskStore((state) => state.scheduleDoingTasks);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isScheduling, setIsScheduling] = useState(false);
  const [activeBlock, setActiveBlock] = useState<TimeBlockType | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [previewTime, setPreviewTime] = useState<Date | null>(null);
  
  const timeSlots = useMemo(() => generateTimeSlots(), []);
  const timeBlocks = useMemo(() => tasksToTimeBlocks(tasks), [tasks]);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const doingTasksCount = useMemo(
    () => tasks.filter((t) => t.status === "doing").length,
    [tasks]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const block = timeBlocks.find((b) => b.id === active.id);
    if (block) {
      setActiveBlock(block);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      setOverId(String(over.id));
      // Calculate preview time from the drop target
      const data = over.data.current as { hour?: number; minute?: number } | undefined;
      if (data?.hour !== undefined && data?.minute !== undefined) {
        const newTime = new Date();
        newTime.setHours(data.hour, data.minute, 0, 0);
        setPreviewTime(newTime);
      }
    } else {
      setOverId(null);
      setPreviewTime(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveBlock(null);
    setOverId(null);
    setPreviewTime(null);

    if (!over) return;

    const block = timeBlocks.find((b) => b.id === active.id);
    if (!block || !block.task) return;

    // Get the target time from the drop zone
    const data = over.data.current as { hour?: number; minute?: number } | undefined;
    if (data?.hour === undefined || data?.minute === undefined) return;

    // Round to nearest 15-minute increment
    const roundedMinute = Math.round(data.minute / 15) * 15;
    const newScheduledAt = new Date();
    newScheduledAt.setHours(data.hour, roundedMinute, 0, 0);

    // Update the task with new scheduled time
    await updateTask(block.task.id, { scheduledAt: newScheduledAt });
  };

  const handleScheduleDoingTasks = async () => {
    setIsScheduling(true);
    try {
      await scheduleDoingTasks();
    } catch (error) {
      console.error("Failed to schedule tasks:", error);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleBlockPress = (block: TimeBlockType) => {
    if (block.type === "task" && block.task) {
      onEditTask(block.task);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const currentHour = new Date().getHours();
    const element = document.getElementById(`hour-${currentHour}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const currentHour = currentTime.getHours();
  const currentMinutePercent = (currentTime.getMinutes() / 60) * 100;

  // Generate 15-minute drop zones for each hour
  const generateDropZones = (hour: number) => {
    return [0, 15, 30, 45].map((minute) => (
      <DroppableTimeSlot
        key={`${hour}-${minute}`}
        hour={hour}
        minute={minute}
        isOver={overId === `slot-${hour}-${minute}`}
      />
    ));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="relative h-full overflow-y-auto px-4 py-6">
        {/* Preview time indicator */}
        {previewTime && activeBlock && (
          <div className="fixed top-20 right-4 z-50 rounded-lg bg-accent-magenta px-3 py-2 text-white text-sm font-medium shadow-lg">
            Move to {previewTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}

        <div className="space-y-0">
          {timeSlots.map((slot) => {
            const hour = slot.getHours();
            const isCurrentHour = hour === currentHour;
            const blocksInHour = timeBlocks.filter((block) => block.startTime.getHours() === hour);

            return (
              <div key={hour} id={`hour-${hour}`} className="relative flex min-h-[80px] border-t border-border-default">
                <div className="w-16 shrink-0 pr-3 pt-2 text-right">
                  <span className={cn("text-sm", isCurrentHour ? "font-semibold text-accent-magenta" : "text-text-tertiary")}>
                    {formatTime(slot)}
                  </span>
                </div>
                <div className="relative flex-1 py-2">
                  {/* Drop zones for 15-minute increments */}
                  {generateDropZones(hour)}
                  
                  {/* Current time indicator */}
                  {isCurrentHour && (
                    <div className="absolute left-0 right-0 z-10 flex items-center pointer-events-none" style={{ top: `${currentMinutePercent}%` }}>
                      <div className="h-3 w-3 rounded-full bg-accent-magenta shadow-glow" />
                      <div className="h-0.5 flex-1 bg-accent-magenta shadow-glow" />
                    </div>
                  )}
                  
                  {/* Time blocks */}
                  {blocksInHour.map((block) => {
                    const startMinute = block.startTime.getMinutes();
                    const durationMinutes = Math.min(60 - startMinute, (block.endTime.getTime() - block.startTime.getTime()) / 60000);
                    const heightPercent = (durationMinutes / 60) * 100;
                    const topPercent = (startMinute / 60) * 100;
                    
                    return (
                      <DraggableTimelineBlock
                        key={block.id}
                        block={block}
                        onPress={handleBlockPress}
                        style={{ 
                          top: `${topPercent}%`, 
                          height: `${Math.max(heightPercent, 30)}%`, 
                          minHeight: "40px" 
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {timeBlocks.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
            <Clock className="mb-4 h-16 w-16 text-text-muted" />
            <h3 className="mb-2 text-lg font-semibold text-text-primary">No tasks scheduled</h3>
            <p className="text-center text-sm text-text-secondary">Add tasks and schedule them to see them on your timeline</p>
            {doingTasksCount > 0 && (
              <button onClick={handleScheduleDoingTasks} disabled={isScheduling} className="mt-6 flex items-center gap-2 rounded-xl bg-accent-cyan px-6 py-3 font-medium text-bg-primary transition-colors hover:bg-accent-cyan/80 disabled:opacity-50">
                <CalendarPlus className="h-5 w-5" />
                {isScheduling ? "Scheduling..." : `Schedule ${doingTasksCount} Doing Task${doingTasksCount > 1 ? "s" : ""}`}
              </button>
            )}
          </div>
        )}

        {doingTasksCount > 0 && timeBlocks.length > 0 && (
          <button onClick={handleScheduleDoingTasks} disabled={isScheduling} className="fixed bottom-24 right-4 z-20 flex items-center gap-2 rounded-xl bg-accent-cyan px-4 py-3 font-medium text-bg-primary shadow-lg transition-all hover:bg-accent-cyan/80 disabled:opacity-50">
            <CalendarPlus className="h-5 w-5" />
            {isScheduling ? "..." : `Schedule ${doingTasksCount}`}
          </button>
        )}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeBlock && (
          <div className="w-64 opacity-80 rotate-2">
            <TimelineBlock 
              block={activeBlock} 
              onPress={() => {}} 
              className="shadow-2xl ring-2 ring-accent-magenta" 
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

// ============================================================================
// Blocks Page
// ============================================================================
function BlocksPage() {
  const blocks = useQuickBlocksStore((state) => state.blocks);
  const timeLoggedToday = useQuickBlocksStore((state) => state.timeLoggedToday);
  const isLoading = useQuickBlocksStore((state) => state.isLoading);
  const deleteBlock = useQuickBlocksStore((state) => state.deleteBlock);
  const reorderBlocks = useQuickBlocksStore((state) => state.reorderBlocks);
  const createBlock = useQuickBlocksStore((state) => state.createBlock);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const tasks = useTaskStore((state) => state.tasks);
  const createTask = useTaskStore((state) => state.createTask);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPlacementPicker, setShowPlacementPicker] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<QuickAddBlock | null>(null);
  const [lastAddedTask, setLastAddedTask] = useState<string | null>(null);

  // Get the currently active task (the one scheduled at current time)
  const activeTask = useMemo(() => {
    const now = new Date();
    return tasks.find((task) => {
      if (!task.scheduledAt) return false;
      const duration = task.duration || calculateDuration(task.blockSize || "30min", task.blockCount || 1);
      const endTime = new Date(task.scheduledAt);
      endTime.setMinutes(endTime.getMinutes() + duration);
      return task.scheduledAt <= now && endTime > now;
    }) || null;
  }, [tasks]);

  // Get scheduled tasks as TimeBlocks for the placement picker
  const scheduledTimeBlocks = useMemo(() => tasksToTimeBlocks(tasks), [tasks]);

  // Clear toast after delay
  useEffect(() => {
    if (lastAddedTask) {
      loadTasks();
      const timer = setTimeout(() => setLastAddedTask(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastAddedTask, loadTasks]);

  const handleBlockPress = (block: QuickAddBlock) => {
    if (isEditMode) return;
    // Show placement picker instead of immediately scheduling
    setSelectedBlock(block);
    setShowPlacementPicker(true);
  };

  const handleScheduleFromPicker = async (block: QuickAddBlock, scheduledAt: Date) => {
    // Create task with the selected scheduled time
    const { blockSize, blockCount } = durationToBlocks(block.defaultDuration);
    
    const newTask = await createTask({
      name: block.name,
      status: "doing",
      blockSize,
      blockCount,
      scheduledAt,
      isPutzing: block.isPutzing,
      isQuickAdd: true,
      priority: "3",
      assigneeId: "me",
      accessContexts: [],
      tags: [],
      subtasks: [],
      reminders: [],
      recurrence: "none",
    });
    
    if (newTask) {
      setLastAddedTask(newTask.name);
      await loadTasks();
    }
    
    setShowPlacementPicker(false);
    setSelectedBlock(null);
  };

  const handleBlockDelete = async (block: QuickAddBlock) => {
    if (confirm(`Delete "${block.name}" block?`)) {
      await deleteBlock(block.id);
    }
  };

  const handleBlockReorder = async (orderedIds: string[]) => {
    await reorderBlocks(orderedIds);
  };

  const handleCreateBlock = async (blockData: Omit<QuickAddBlock, "id" | "createdAt" | "usageCount">) => {
    await createBlock(blockData);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-text-secondary">Loading blocks...</div>
      </div>
    );
  }

  if (blocks.length === 0 && !isEditMode) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8">
        <Grid3X3 className="mb-4 h-16 w-16 text-text-muted" />
        <h3 className="mb-2 text-lg font-semibold text-text-primary">No quick blocks</h3>
        <p className="text-center text-sm text-text-secondary mb-4">Quick blocks will appear here for fast time logging</p>
        <button onClick={() => setIsEditMode(true)} className="px-4 py-2 rounded-lg bg-accent-magenta text-white font-medium hover:bg-accent-magenta/80 transition-colors">
          Add Blocks
        </button>
      </div>
    );
  }

  const totalTimeLogged = Object.values(timeLoggedToday).reduce((sum, time) => sum + time, 0);
  const productiveTime = blocks.filter((b) => !b.isPutzing).reduce((sum, b) => sum + (timeLoggedToday[b.id] ?? 0), 0);
  const putzingTime = blocks.filter((b) => b.isPutzing).reduce((sum, b) => sum + (timeLoggedToday[b.id] ?? 0), 0);
  const nextSortOrder = blocks.length > 0 ? Math.max(...blocks.map(b => b.sortOrder)) + 1 : 0;

  return (
    <div className="h-full overflow-y-auto px-4 py-6">
      {/* Header with Edit button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-text-primary">{isEditMode ? "Edit Blocks" : "Quick Blocks"}</h2>
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
            isEditMode ? "bg-accent-green text-white hover:bg-accent-green/80" : "bg-bg-secondary text-text-secondary hover:bg-bg-tertiary"
          )}
        >
          {isEditMode ? <><Check className="h-4 w-4" /> Done</> : <><Pencil className="h-4 w-4" /> Edit</>}
        </button>
      </div>

      {/* Success toast */}
      {lastAddedTask && (
        <div className="mb-4 flex items-center justify-center">
          <div className="animate-fade-in rounded-lg bg-accent-green/20 px-4 py-2 text-accent-green text-sm font-medium">
            ✓ Added &quot;{lastAddedTask}&quot; to timeline
          </div>
        </div>
      )}

      {/* Stats summary (hide in edit mode) */}
      {!isEditMode && (
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-bg-secondary p-3 text-center">
            <p className="text-2xl font-bold text-text-primary">{totalTimeLogged}</p>
            <p className="text-xs text-text-secondary">Total mins</p>
          </div>
          <div className="rounded-lg bg-bg-secondary p-3 text-center">
            <p className="text-2xl font-bold text-accent-green">{productiveTime}</p>
            <p className="text-xs text-text-secondary">Productive</p>
          </div>
          <div className="rounded-lg bg-bg-secondary p-3 text-center">
            <p className="text-2xl font-bold text-status-warning">{putzingTime}</p>
            <p className="text-xs text-text-secondary">Putzing</p>
          </div>
        </div>
      )}

      {/* Edit mode instructions */}
      {isEditMode && (
        <div className="mb-4 rounded-lg bg-accent-magenta/10 p-3 text-sm text-accent-magenta">
          <p>Drag to reorder • Tap X to delete • Tap + to add new block</p>
        </div>
      )}

      {/* Editable Quick add grid */}
      <EditableQuickAddGrid
        blocks={blocks}
        timeLoggedMap={timeLoggedToday}
        isEditMode={isEditMode}
        onBlockPress={handleBlockPress}
        onBlockDelete={handleBlockDelete}
        onBlockReorder={handleBlockReorder}
        onCreateBlock={() => setShowCreateModal(true)}
        maxSlots={15}
      />

      {/* Tip (hide in edit mode) */}
      {!isEditMode && (
        <p className="mt-6 text-center text-xs text-text-muted">Tap a block to choose where to schedule it on the timeline.</p>
      )}

      {/* Create Block Modal */}
      <CreateBlockModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateBlock}
        nextSortOrder={nextSortOrder}
      />

      {/* Placement Picker Modal */}
      <PlacementPickerModal
        isOpen={showPlacementPicker}
        block={selectedBlock}
        activeTask={activeTask}
        scheduledTasks={scheduledTimeBlocks}
        workEndTime="17:00"
        onClose={() => {
          setShowPlacementPicker(false);
          setSelectedBlock(null);
        }}
        onSchedule={handleScheduleFromPicker}
      />
    </div>
  );
}

// ============================================================================
// AI Page
// ============================================================================
function AIPage({ onEditTask }: { onEditTask: (task: Task) => void }) {
  const [activeTab, setActiveTab] = useState<"chat" | "search">("chat");
  const [chatInput, setChatInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [geminiService, setGeminiService] = useState<GeminiService | null>(null);
  const isOnline = useOnlineStatus();
  const tasks = useTaskStore((state) => state.tasks);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiKey = (window as { GEMINI_API_KEY?: string }).GEMINI_API_KEY;
    if (apiKey) {
      setGeminiService(new GeminiService({ apiKey }));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !geminiService || !isOnline) return;
    const userMessage = chatInput.trim();
    setChatInput("");
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: userMessage, timestamp: new Date() }]);

    try {
      const response = await geminiService.chat(userMessage, { tasks, currentTime: new Date(), workStartTime: "09:00", workEndTime: "17:00" });
      setMessages((prev) => [...prev, { role: "assistant", content: response, timestamp: new Date() }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't process that request.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return task.name.toLowerCase().includes(query) || task.description?.toLowerCase().includes(query) || task.tags.some((tag) => tag.toLowerCase().includes(query));
  });

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      <div className="border-b border-border-default bg-bg-secondary">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-accent-cyan" />
            <h1 className="text-lg font-semibold text-text-primary">AI Assistant</h1>
          </div>
          <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium", isOnline ? "bg-accent-green/20 text-accent-green" : "bg-red-500/20 text-red-400")}>
            {isOnline ? <><Wifi className="h-3 w-3" /> Online</> : <><WifiOff className="h-3 w-3" /> Offline</>}
          </div>
        </div>
        <div className="flex px-4 gap-4">
          <button onClick={() => setActiveTab("chat")} className={cn("flex items-center gap-2 pb-3 border-b-2 transition-colors", activeTab === "chat" ? "border-accent-cyan text-accent-cyan" : "border-transparent text-text-tertiary hover:text-text-secondary")}>
            <MessageSquare className="h-4 w-4" /> Chat
          </button>
          <button onClick={() => setActiveTab("search")} className={cn("flex items-center gap-2 pb-3 border-b-2 transition-colors", activeTab === "search" ? "border-accent-cyan text-accent-cyan" : "border-transparent text-text-tertiary hover:text-text-secondary")}>
            <Search className="h-4 w-4" /> Search
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === "chat" ? (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-8 text-center">
                  <Sparkles className="h-16 w-16 text-accent-cyan mb-4" />
                  <h2 className="text-lg font-semibold text-text-primary mb-2">AI Task Assistant</h2>
                  <p className="text-text-secondary max-w-sm mb-6">Ask me to help schedule your tasks, prioritize your work, or get recommendations!</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[80%] rounded-2xl px-4 py-3", msg.role === "user" ? "bg-accent-cyan text-bg-primary rounded-br-md" : "bg-bg-tertiary text-text-primary rounded-bl-md")}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-bg-tertiary rounded-2xl px-4 py-3 flex gap-1">
                    <div className="w-2 h-2 bg-accent-cyan rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-accent-cyan rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    <div className="w-2 h-2 bg-accent-cyan rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search tasks..." className="w-full bg-bg-tertiary border border-border-default rounded-xl pl-12 pr-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-magenta focus:outline-none" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
              {filteredTasks.length === 0 ? (
                <div className="text-center text-text-secondary py-12">No tasks found</div>
              ) : (
                filteredTasks.map((task) => <TaskCard key={task.id} task={task} onPress={onEditTask} />)
              )}
            </div>
          </div>
        )}
      </div>

      {activeTab === "chat" && (
        <div className="border-t border-border-default bg-bg-secondary p-4">
          <div className="flex items-center gap-3">
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendMessage()} placeholder={!isOnline ? "AI unavailable offline..." : !geminiService ? "Configure API key..." : "Ask about your tasks..."} disabled={!isOnline || !geminiService || isLoading} className="flex-1 bg-bg-tertiary border border-border-default rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none disabled:opacity-50" />
            <button onClick={handleSendMessage} disabled={!isOnline || !geminiService || !chatInput.trim() || isLoading} className="flex items-center justify-center h-12 w-12 rounded-xl bg-accent-cyan text-bg-primary hover:bg-accent-cyan/80 disabled:opacity-50">
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main App
// ============================================================================
type Page = "kanban" | "timeline" | "blocks" | "ai" | "add-task" | "edit-task" | "settings" | "profile";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("kanban");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [addTaskInitialStatus, setAddTaskInitialStatus] = useState<TaskStatus>("backlog");
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const loadBlocks = useQuickBlocksStore((state) => state.loadBlocks);
  const initializeDefaultBlocks = useQuickBlocksStore((state) => state.initializeDefaultBlocks);
  
  // Initialize theme on app load
  useTheme();

  useEffect(() => {
    loadTasks();
    loadBlocks().then(() => initializeDefaultBlocks());
  }, [loadTasks, loadBlocks, initializeDefaultBlocks]);
  
  // Daily summary notification listener
  useEffect(() => {
    const handleDailySummary = () => {
      const tasks = useTaskStore.getState().tasks;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const completedToday = tasks.filter((t) => {
        if (t.status !== "done" || !t.completedAt) return false;
        const completedDate = new Date(t.completedAt);
        completedDate.setHours(0, 0, 0, 0);
        return completedDate.getTime() === today.getTime();
      });
      
      const totalTime = completedToday.reduce((sum, t) => sum + (t.timeSpent || 0), 0);
      notificationService.sendDailySummary(completedToday.length, totalTime);
    };
    
    window.addEventListener("daily-summary-trigger", handleDailySummary);
    return () => window.removeEventListener("daily-summary-trigger", handleDailySummary);
  }, []);

  useEffect(() => {
    if (window.electronAPI) {
      const unsubscribe = window.electronAPI.onNavigate((path) => {
        if (path === "/add-task") setCurrentPage("add-task");
      });
      return unsubscribe;
    }
  }, []);

  const handleNavigation = useCallback((item: "search" | "kanban" | "timeline" | "blocks" | "add") => {
    const pageMap: Record<string, Page> = { search: "ai", kanban: "kanban", timeline: "timeline", blocks: "blocks", add: "add-task" };
    setCurrentPage(pageMap[item] || "kanban");
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setCurrentPage("edit-task");
  }, []);

  const handleAddTask = useCallback((status: TaskStatus) => {
    setAddTaskInitialStatus(status);
    setCurrentPage("add-task");
  }, []);

  const handleBack = useCallback(() => {
    setEditingTask(null);
    setCurrentPage("kanban");
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "kanban": return <KanbanPage onEditTask={handleEditTask} onAddTask={handleAddTask} />;
      case "timeline": return <TimelinePage onEditTask={handleEditTask} />;
      case "blocks": return <BlocksPage />;
      case "ai": return <AIPage onEditTask={handleEditTask} />;
      case "add-task": return <TaskEditPage onBack={handleBack} initialStatus={addTaskInitialStatus} />;
      case "edit-task": return editingTask ? <TaskEditPage task={editingTask} onBack={handleBack} /> : <KanbanPage onEditTask={handleEditTask} onAddTask={handleAddTask} />;
      case "settings": return <SettingsPage />;
      case "profile": return <ProfilePage onBack={() => setCurrentPage("kanban")} />;
      default: return <KanbanPage onEditTask={handleEditTask} onAddTask={handleAddTask} />;
    }
  };

  const getPageTitle = () => {
    const titles: Record<Page, string> = { 
      kanban: "Kanban Board", 
      timeline: "Timeline", 
      blocks: "Quick Blocks", 
      ai: "AI Assistant", 
      "add-task": "Add Task", 
      "edit-task": "Edit Task",
      settings: "Settings",
      profile: "Profile"
    };
    return titles[currentPage] || "Blocks";
  };

  const handleOpenSettings = useCallback(() => {
    setCurrentPage("settings");
  }, []);

  const handleOpenProfile = useCallback(() => {
    setCurrentPage("profile");
  }, []);

  const showBackButton = ["add-task", "edit-task", "settings", "profile"].includes(currentPage);
  
  return (
    <div className="flex flex-col h-screen bg-bg-primary">
      <TitleBar />
      <div className="flex items-center justify-between border-b border-border-default bg-bg-primary px-4 h-14">
        {/* Left: Back button or title */}
        <div className="flex items-center gap-3">
          {showBackButton ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm">Back</span>
            </button>
          ) : (
            <h1 className="text-lg font-semibold text-text-primary">{getPageTitle()}</h1>
          )}
        </div>
        
        {/* Center: Title (when back button shown) */}
        {showBackButton && (
          <h1 className="text-lg font-semibold text-text-primary absolute left-1/2 -translate-x-1/2">
            {getPageTitle()}
          </h1>
        )}
        
        {/* Right: Profile & Settings buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenProfile}
            className={cn(
              "h-9 w-9 rounded-lg flex items-center justify-center transition-colors",
              currentPage === "profile" 
                ? "bg-accent-magenta/20 text-accent-magenta" 
                : "text-text-muted hover:bg-bg-tertiary hover:text-text-primary"
            )}
            title="Profile"
          >
            <User className="h-5 w-5" />
          </button>
          <button
            onClick={handleOpenSettings}
            className={cn(
              "h-9 w-9 rounded-lg flex items-center justify-center transition-colors",
              currentPage === "settings" 
                ? "bg-accent-magenta/20 text-accent-magenta" 
                : "text-text-muted hover:bg-bg-tertiary hover:text-text-primary"
            )}
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
      <main className="flex-1 overflow-hidden">{renderPage()}</main>
      <ActiveTimer onTaskClick={(taskId) => {
        const task = useTaskStore.getState().tasks.find(t => t.id === taskId);
        if (task) handleEditTask(task);
      }} />
      <UpdateNotification />
      <BottomNav 
        activeItem={
          currentPage === "ai" ? "search" : 
          ["add-task", "edit-task"].includes(currentPage) ? "add" : 
          ["settings", "profile"].includes(currentPage) ? "kanban" :
          currentPage as "kanban" | "timeline" | "blocks"
        } 
        onItemPress={handleNavigation} 
      />
    </div>
  );
}
