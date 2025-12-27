import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { UpdateNotification } from "./components/UpdateNotification";
import { 
  useTaskStore, 
  useQuickBlocksStore,
  useOnlineStatus,
  BottomNav, 
  TopBar, 
  TaskCard,
  TimelineBlock,
  EditableQuickAddGrid,
  CreateBlockModal,
  Button,
  Input,
  Textarea,
  Select,
  cn,
  formatTime
} from "@blocks/ui";
import type { 
  Task, 
  TaskStatus, 
  TaskPriority,
  TimeBlock as TimeBlockType,
  QuickAddBlock,
  BlockSize,
  AccessContext,
  RecurrenceType
} from "@blocks/core";
import { 
  KANBAN_COLUMNS, 
  calculateDuration, 
  formatBlockSize,
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
  X,
  Tag,
  Calendar,
  Palette,
  Timer,
  MapPin,
  Home,
  Car,
  Monitor,
  Smartphone,
  Trash2,
  Pencil,
  Check
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

function TimelinePage({ onEditTask }: { onEditTask: (task: Task) => void }) {
  const tasks = useTaskStore((state) => state.tasks);
  const scheduleDoingTasks = useTaskStore((state) => state.scheduleDoingTasks);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isScheduling, setIsScheduling] = useState(false);
  const timeSlots = useMemo(() => generateTimeSlots(), []);
  const timeBlocks = useMemo(() => tasksToTimeBlocks(tasks), [tasks]);
  
  const doingTasksCount = useMemo(
    () => tasks.filter((t) => t.status === "doing").length,
    [tasks]
  );

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

  return (
    <div className="relative h-full overflow-y-auto px-4 py-6">
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
                {isCurrentHour && (
                  <div className="absolute left-0 right-0 z-10 flex items-center" style={{ top: `${currentMinutePercent}%` }}>
                    <div className="h-3 w-3 rounded-full bg-accent-magenta shadow-glow" />
                    <div className="h-0.5 flex-1 bg-accent-magenta shadow-glow" />
                  </div>
                )}
                {blocksInHour.map((block) => {
                  const startMinute = block.startTime.getMinutes();
                  const durationMinutes = Math.min(60 - startMinute, (block.endTime.getTime() - block.startTime.getTime()) / 60000);
                  const heightPercent = (durationMinutes / 60) * 100;
                  const topPercent = (startMinute / 60) * 100;
                  return (
                    <div key={block.id} className="absolute left-0 right-4" style={{ top: `${topPercent}%`, height: `${Math.max(heightPercent, 30)}%`, minHeight: "40px" }}>
                      <TimelineBlock block={block} onPress={handleBlockPress} className="h-full" />
                    </div>
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
  );
}

// ============================================================================
// Blocks Page
// ============================================================================
function BlocksPage() {
  const blocks = useQuickBlocksStore((state) => state.blocks);
  const timeLoggedToday = useQuickBlocksStore((state) => state.timeLoggedToday);
  const isLoading = useQuickBlocksStore((state) => state.isLoading);
  const addTaskFromBlock = useQuickBlocksStore((state) => state.addTaskFromBlock);
  const deleteBlock = useQuickBlocksStore((state) => state.deleteBlock);
  const reorderBlocks = useQuickBlocksStore((state) => state.reorderBlocks);
  const createBlock = useQuickBlocksStore((state) => state.createBlock);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [lastAddedTask, setLastAddedTask] = useState<string | null>(null);

  // Clear toast after delay
  useEffect(() => {
    if (lastAddedTask) {
      loadTasks();
      const timer = setTimeout(() => setLastAddedTask(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastAddedTask, loadTasks]);

  const handleBlockPress = async (block: QuickAddBlock) => {
    if (isEditMode) return;
    const task = await addTaskFromBlock(block.id);
    if (task) {
      setLastAddedTask(task.name);
      await loadTasks();
    }
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
        <p className="mt-6 text-center text-xs text-text-muted">Tap a block to add task to timeline. Tasks scheduled immediately.</p>
      )}

      {/* Create Block Modal */}
      <CreateBlockModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateBlock}
        nextSortOrder={nextSortOrder}
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
// Add Task Page
// ============================================================================
const PRIORITY_OPTIONS = [
  { value: "1", label: "1 - Urgent" },
  { value: "2", label: "2 - High" },
  { value: "3", label: "3 - Medium" },
  { value: "4", label: "4 - Low" },
  { value: "5", label: "5 - Minimal" },
];

const STATUS_OPTIONS = KANBAN_COLUMNS.map((col) => ({ value: col.id, label: col.title }));
const BLOCK_SIZE_OPTIONS = [
  { value: "15min", label: "15 Min" },
  { value: "30min", label: "30 Min" },
  { value: "1hour", label: "1 Hour" },
  { value: "1week", label: "1 Week" },
];
const BLOCK_COUNT_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }));
const ACCESS_CONTEXTS: { value: AccessContext; label: string; icon: React.ReactNode }[] = [
  { value: "home", label: "Home", icon: <Home className="h-4 w-4" /> },
  { value: "errand", label: "Errand", icon: <Car className="h-4 w-4" /> },
  { value: "computer", label: "Computer", icon: <Monitor className="h-4 w-4" /> },
  { value: "phone", label: "Phone", icon: <Smartphone className="h-4 w-4" /> },
];
const RECURRENCE_OPTIONS = [
  { value: "none", label: "No repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];
const COLOR_OPTIONS = ["#9b4dca", "#00bcd4", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899"];

function AddTaskPage({ onBack, initialStatus }: { onBack: () => void; initialStatus?: TaskStatus }) {
  const createTask = useTaskStore((state) => state.createTask);
  const [name, setName] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("3");
  const [status, setStatus] = useState<TaskStatus>(initialStatus || "backlog");
  const [blockSize, setBlockSize] = useState<BlockSize>("30min");
  const [blockCount, setBlockCount] = useState(1);
  const [accessContexts, setAccessContexts] = useState<AccessContext[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [recurrence, setRecurrence] = useState<RecurrenceType>("none");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const computedDuration = useMemo(() => calculateDuration(blockSize, blockCount), [blockSize, blockCount]);
  const formattedDuration = useMemo(() => {
    const mins = computedDuration;
    if (mins >= 10080) return `${Math.floor(mins / 10080)} week(s)`;
    if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? `${mins % 60}m` : ""}`;
    return `${mins}m`;
  }, [computedDuration]);

  const handleToggleAccess = (ctx: AccessContext) => {
    setAccessContexts((prev) => prev.includes(ctx) ? prev.filter((c) => c !== ctx) : [...prev, ctx]);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await createTask({
        name: name.trim(),
        description: notes.trim() || undefined,
        priority,
        status,
        blockSize,
        blockCount,
        accessContexts,
        assigneeId: "me",
        tags,
        color,
        recurrence,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        notes: notes.trim() || undefined,
        subtasks: [],
        reminders: [],
        isQuickAdd: false,
        isPutzing: false,
      });
      onBack();
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-6">
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
        <Input label="Task Name *" placeholder="What do you need to do?" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />

        <div className="space-y-2">
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            <Timer className="mr-1 inline h-4 w-4" />
            Duration: {formatBlockSize(blockSize)} × {blockCount} = <span className="text-accent-magenta">{formattedDuration}</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Block Size" options={BLOCK_SIZE_OPTIONS} value={blockSize} onChange={(v) => setBlockSize(v as BlockSize)} />
            <Select label="Block Count" options={BLOCK_COUNT_OPTIONS} value={String(blockCount)} onChange={(v) => setBlockCount(parseInt(v, 10))} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select label="Priority" options={PRIORITY_OPTIONS} value={priority} onChange={(v) => setPriority(v as TaskPriority)} />
          <Select label="Status" options={STATUS_OPTIONS} value={status} onChange={(v) => setStatus(v as TaskStatus)} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary"><MapPin className="mr-1 inline h-4 w-4" /> Access</label>
          <div className="flex flex-wrap gap-2">
            {ACCESS_CONTEXTS.map((ctx) => (
              <button key={ctx.value} type="button" onClick={() => handleToggleAccess(ctx.value)} className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors border", accessContexts.includes(ctx.value) ? "border-accent-magenta bg-accent-magenta/20 text-accent-magenta" : "border-border-default bg-bg-secondary text-text-secondary hover:border-accent-magenta/50")}>
                {ctx.icon} {ctx.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">Tags</label>
          <div className="flex gap-2">
            <Input placeholder="Add a tag" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())} leftIcon={<Tag className="h-4 w-4" />} />
            <Button type="button" variant="secondary" onClick={handleAddTag}><Plus className="h-4 w-4" /></Button>
          </div>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 rounded-full bg-bg-tertiary px-3 py-1 text-sm text-text-secondary">
                  {tag} <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} className="ml-1 text-text-muted hover:text-text-primary"><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select label="Repeat" options={RECURRENCE_OPTIONS} value={recurrence} onChange={(v) => setRecurrence(v as RecurrenceType)} />
          <Input label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} leftIcon={<Calendar className="h-4 w-4" />} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary"><Palette className="mr-1 inline h-4 w-4" /> Color</label>
          <div className="flex gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)} className={cn("h-8 w-8 rounded-full transition-transform", color === c && "scale-125 ring-2 ring-white ring-offset-2 ring-offset-bg-primary")} style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>

        <Textarea label="Notes" placeholder="Additional details..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" className="flex-1" onClick={onBack}>Cancel</Button>
          <Button type="submit" variant="primary" className="flex-1" isLoading={isSubmitting} disabled={!name.trim()}>Create Task</Button>
        </div>
      </form>
    </div>
  );
}

// ============================================================================
// Edit Task Page
// ============================================================================
function EditTaskPage({ task, onBack }: { task: Task; onBack: () => void }) {
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const [name, setName] = useState(task.name);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [blockSize, setBlockSize] = useState<BlockSize>(task.blockSize || "30min");
  const [blockCount, setBlockCount] = useState(task.blockCount || 1);
  const [accessContexts, setAccessContexts] = useState<AccessContext[]>(task.accessContexts || []);
  const [tags, setTags] = useState<string[]>(task.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [recurrence, setRecurrence] = useState<RecurrenceType>(task.recurrence || "none");
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.toISOString().split("T")[0] : "");
  const [notes, setNotes] = useState(task.notes || "");
  const [color, setColor] = useState(task.color || COLOR_OPTIONS[0]);
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const computedDuration = useMemo(() => calculateDuration(blockSize, blockCount), [blockSize, blockCount]);
  const formattedDuration = useMemo(() => {
    const mins = computedDuration;
    if (mins >= 10080) return `${Math.floor(mins / 10080)} week(s)`;
    if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? `${mins % 60}m` : ""}`;
    return `${mins}m`;
  }, [computedDuration]);

  const handleToggleAccess = (ctx: AccessContext) => setAccessContexts((prev) => prev.includes(ctx) ? prev.filter((c) => c !== ctx) : [...prev, ctx]);
  const handleAddTag = () => { if (tagInput.trim() && !tags.includes(tagInput.trim())) { setTags([...tags, tagInput.trim()]); setTagInput(""); } };
  const handleAddSubtask = () => { if (subtaskInput.trim()) { setSubtasks([...subtasks, { id: `st-${Date.now()}`, name: subtaskInput.trim(), completed: false }]); setSubtaskInput(""); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await updateTask(task.id, { name: name.trim(), description: notes.trim() || undefined, duration: computedDuration, priority, status, blockSize, blockCount, accessContexts, tags, color, recurrence, dueDate: dueDate ? new Date(dueDate) : undefined, notes: notes.trim() || undefined, subtasks });
      onBack();
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTask(task.id);
      onBack();
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-6">
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-bg-secondary p-6">
            <h3 className="text-lg font-semibold text-text-primary">Delete Task?</h3>
            <p className="mt-2 text-sm text-text-secondary">Are you sure you want to delete &ldquo;{task.name}&rdquo;?</p>
            <div className="mt-6 flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              <Button variant="primary" className="flex-1 bg-status-error hover:bg-status-error/80" onClick={handleDelete} isLoading={isDeleting}>Delete</Button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-text-primary">Edit Task</h1>
          <button type="button" onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-status-error hover:bg-status-error/10">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>

        <Input label="Task Name *" placeholder="What do you need to do?" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />

        <div className="space-y-2">
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            <Timer className="mr-1 inline h-4 w-4" />
            Duration: {formatBlockSize(blockSize)} × {blockCount} = <span className="text-accent-magenta">{formattedDuration}</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Block Size" options={BLOCK_SIZE_OPTIONS} value={blockSize} onChange={(v) => setBlockSize(v as BlockSize)} />
            <Select label="Block Count" options={BLOCK_COUNT_OPTIONS} value={String(blockCount)} onChange={(v) => setBlockCount(parseInt(v, 10))} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select label="Priority" options={PRIORITY_OPTIONS} value={priority} onChange={(v) => setPriority(v as TaskPriority)} />
          <Select label="Status" options={STATUS_OPTIONS} value={status} onChange={(v) => setStatus(v as TaskStatus)} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary"><MapPin className="mr-1 inline h-4 w-4" /> Access</label>
          <div className="flex flex-wrap gap-2">
            {ACCESS_CONTEXTS.map((ctx) => (
              <button key={ctx.value} type="button" onClick={() => handleToggleAccess(ctx.value)} className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors border", accessContexts.includes(ctx.value) ? "border-accent-magenta bg-accent-magenta/20 text-accent-magenta" : "border-border-default bg-bg-secondary text-text-secondary")}>
                {ctx.icon} {ctx.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">Tags</label>
          <div className="flex gap-2">
            <Input placeholder="Add a tag" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())} leftIcon={<Tag className="h-4 w-4" />} />
            <Button type="button" variant="secondary" onClick={handleAddTag}><Plus className="h-4 w-4" /></Button>
          </div>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 rounded-full bg-bg-tertiary px-3 py-1 text-sm text-text-secondary">
                  {tag} <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} className="ml-1 text-text-muted hover:text-text-primary"><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select label="Repeat" options={RECURRENCE_OPTIONS} value={recurrence} onChange={(v) => setRecurrence(v as RecurrenceType)} />
          <Input label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} leftIcon={<Calendar className="h-4 w-4" />} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary"><Palette className="mr-1 inline h-4 w-4" /> Color</label>
          <div className="flex gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)} className={cn("h-8 w-8 rounded-full transition-transform", color === c && "scale-125 ring-2 ring-white ring-offset-2 ring-offset-bg-primary")} style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">Subtasks</label>
          <div className="flex gap-2">
            <Input placeholder="Add a subtask" value={subtaskInput} onChange={(e) => setSubtaskInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSubtask())} />
            <Button type="button" variant="secondary" onClick={handleAddSubtask}><Plus className="h-4 w-4" /></Button>
          </div>
          {subtasks.length > 0 && (
            <ul className="mt-2 space-y-2">
              {subtasks.map((st) => (
                <li key={st.id} className="flex items-center justify-between rounded-lg bg-bg-secondary px-3 py-2">
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setSubtasks(subtasks.map((s) => s.id === st.id ? { ...s, completed: !s.completed } : s))} className={cn("flex h-5 w-5 items-center justify-center rounded border-2", st.completed ? "border-accent-magenta bg-accent-magenta" : "border-border-default")}>
                      {st.completed && <svg className="h-3 w-3 text-white" viewBox="0 0 12 12"><path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" fill="none" /></svg>}
                    </button>
                    <span className={cn("text-sm text-text-primary", st.completed && "line-through opacity-60")}>{st.name}</span>
                  </div>
                  <button type="button" onClick={() => setSubtasks(subtasks.filter((s) => s.id !== st.id))} className="text-text-muted hover:text-status-error"><X className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Textarea label="Notes" placeholder="Additional details..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" className="flex-1" onClick={onBack}>Cancel</Button>
          <Button type="submit" variant="primary" className="flex-1" isLoading={isSubmitting} disabled={!name.trim()}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
}

// ============================================================================
// Main App
// ============================================================================
type Page = "kanban" | "timeline" | "blocks" | "ai" | "add-task" | "edit-task";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("kanban");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [addTaskInitialStatus, setAddTaskInitialStatus] = useState<TaskStatus>("backlog");
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const loadBlocks = useQuickBlocksStore((state) => state.loadBlocks);
  const initializeDefaultBlocks = useQuickBlocksStore((state) => state.initializeDefaultBlocks);

  useEffect(() => {
    loadTasks();
    loadBlocks().then(() => initializeDefaultBlocks());
  }, [loadTasks, loadBlocks, initializeDefaultBlocks]);

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
      case "add-task": return <AddTaskPage onBack={handleBack} initialStatus={addTaskInitialStatus} />;
      case "edit-task": return editingTask ? <EditTaskPage task={editingTask} onBack={handleBack} /> : <KanbanPage onEditTask={handleEditTask} onAddTask={handleAddTask} />;
      default: return <KanbanPage onEditTask={handleEditTask} onAddTask={handleAddTask} />;
    }
  };

  const getPageTitle = () => {
    const titles: Record<Page, string> = { kanban: "Kanban Board", timeline: "Timeline", blocks: "Quick Blocks", ai: "AI Assistant", "add-task": "Add Task", "edit-task": "Edit Task" };
    return titles[currentPage] || "Blocks";
  };

  return (
    <div className="flex flex-col h-screen bg-bg-primary">
      <TitleBar />
      <TopBar title={getPageTitle()} showBackButton={currentPage === "add-task" || currentPage === "edit-task"} onBackPress={handleBack} />
      <main className="flex-1 overflow-hidden">{renderPage()}</main>
      <UpdateNotification />
      <BottomNav activeItem={currentPage === "ai" ? "search" : currentPage === "add-task" || currentPage === "edit-task" ? "add" : currentPage as "kanban" | "timeline" | "blocks"} onItemPress={handleNavigation} />
    </div>
  );
}
