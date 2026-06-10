import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { UpdateNotification } from "./components/UpdateNotification";
import { TaskEditPage } from "./components/TaskEditPage";
import { PlacementPickerModal } from "./components/PlacementPickerModal";
import { SettingsPage } from "./components/SettingsPage";
import { ProfilePage } from "./components/ProfilePage";
import { TimelinePage } from "./components/TimelinePage";
import { AppTrackingClock, TrackingControlBar } from "./components/TrackingBar";
import { useTimerStore } from "./hooks/useTimerStore";
import { useTheme } from "./hooks/useTheme";
import { notificationService } from "./hooks/useNotifications";
import { 
  useTaskStore, 
  useQuickBlocksStore,
  useOnlineStatus,
  BottomNav, 
  TaskCard,
  EditableQuickAddGrid,
  CreateBlockModal,
  cn,
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
  tasksToTimeBlocks,
  GeminiService,
  type ChatMessage
} from "@blocks/core";
import { 
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
  Menu,
  ChevronLeft,
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
      <div className="border-t border-border-default p-3 pb-10">
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
      {/* h-full with parent pb-20 ensures columns don't go behind nav bar */}
      <div className="flex h-full gap-4 overflow-x-auto p-4">
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

// Helper to convert duration in minutes to blockSize + blockCount
function durationToBlocks(minutes: number): { blockSize: "15min" | "30min" | "1hour" | "1week"; blockCount: number } {
  if (minutes <= 15) return { blockSize: "15min", blockCount: 1 };
  if (minutes <= 30) return { blockSize: "15min", blockCount: Math.ceil(minutes / 15) };
  if (minutes <= 60) return { blockSize: "30min", blockCount: Math.ceil(minutes / 30) };
  return { blockSize: "1hour", blockCount: Math.ceil(minutes / 60) };
}

function tasksToTimeBlocksLocal(tasks: Task[]): TimeBlockType[] {
  return tasksToTimeBlocks(tasks);
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
  const scheduledTimeBlocks = useMemo(() => tasksToTimeBlocksLocal(tasks), [tasks]);

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
      const unsubscribeNav = window.electronAPI.onNavigate((path) => {
        if (path === "/add-task") setCurrentPage("add-task");
        if (path === "/timeline") setCurrentPage("timeline");
      });
      return () => {
        unsubscribeNav();
      };
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

  // Show back button on sub-pages (edit-task, add-task)
  const showBackButton = ["add-task", "edit-task"].includes(currentPage);

  const activeTaskId = useTimerStore((s) => s.activeTaskId);
  const isRunning = useTimerStore((s) => s.isRunning);
  const isPaused = useTimerStore((s) => s.isPaused);
  const showTrackingChrome = !!activeTaskId && (isRunning || isPaused);
  
  return (
    <div className="flex flex-col h-screen bg-bg-primary">
      <TitleBar />
      {/* ============================================================
          TOP BAR - Figma Design: [☰ Menu] [Page Title] [Profile 👤]
          ============================================================ */}
      <div className="flex items-center justify-between border-b border-border-default bg-bg-primary px-4 h-14 relative">
        {/* LEFT: Hamburger Menu (Settings) or Back button */}
        <div className="flex items-center w-12">
          {showBackButton ? (
            <button
              onClick={handleBack}
              className="h-10 w-10 rounded-lg flex items-center justify-center text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors"
              aria-label="Back"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          ) : (
            <button
              onClick={handleOpenSettings}
              className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                currentPage === "settings" 
                  ? "bg-accent-magenta/20 text-accent-magenta" 
                  : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
              )}
              aria-label="Settings Menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
        </div>
        
        {/* CENTER: tracking clock or page title */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center max-w-[50%]">
          {showTrackingChrome ? (
            <AppTrackingClock />
          ) : (
            <h1 className="text-lg font-semibold text-text-primary truncate">
              {getPageTitle()}
            </h1>
          )}
        </div>
        
        {/* RIGHT: Profile button */}
        <div className="flex items-center w-12 justify-end">
          <button
            onClick={handleOpenProfile}
            className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
              currentPage === "profile" 
                ? "bg-accent-magenta/20 text-accent-magenta" 
                : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
            )}
            aria-label="Profile"
          >
            <User className="h-6 w-6" />
          </button>
        </div>
      </div>
      {/* ============================================================
          MAIN CONTENT - pb-24 ensures nav bar doesn't cover content
          ============================================================ */}
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden pb-20">
        {renderPage()}
      </main>
      <TrackingControlBar />
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
