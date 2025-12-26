import { useState, useEffect, useCallback } from "react";
import { useTaskStore, BottomNav, TopBar, TaskCard } from "@blocks/ui";
import type { Task, TaskStatus } from "@blocks/core";
import { KANBAN_COLUMNS } from "@blocks/core";

// Desktop-specific title bar component
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

// Page components
type Page = "kanban" | "timeline" | "blocks" | "ai" | "add-task" | "edit-task";

function KanbanPage({ onEditTask }: { onEditTask: (task: Task) => void }) {
  const tasks = useTaskStore((state) => state.tasks);
  const completeTask = useTaskStore((state) => state.completeTask);
  const updateTask = useTaskStore((state) => state.updateTask);

  const groupedTasks = KANBAN_COLUMNS.reduce((acc, column) => {
    acc[column.id] = tasks.filter((t) => t.status === column.id);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  const handleToggle = async (task: Task) => {
    if (task.status === "done") {
      await updateTask(task.id, { status: "todo", completedAt: undefined });
    } else {
      await completeTask(task.id);
    }
  };

  return (
    <div className="flex h-full gap-4 overflow-x-auto p-4">
      {KANBAN_COLUMNS.map((column) => (
        <div
          key={column.id}
          className="flex h-full w-72 flex-shrink-0 flex-col rounded-lg border border-border-default bg-bg-secondary"
        >
          <div
            className="flex items-center justify-between rounded-t-lg px-3 py-3"
            style={{ backgroundColor: `${column.color}20` }}
          >
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: column.color }} />
              <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: column.color }}>
                {column.title}
              </h2>
            </div>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: column.color, color: "#fff" }}
            >
              {groupedTasks[column.id]?.length || 0}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {groupedTasks[column.id]?.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={handleToggle}
                onPress={onEditTask}
              />
            ))}
            {(!groupedTasks[column.id] || groupedTasks[column.id].length === 0) && (
              <div className="rounded-lg border-2 border-dashed border-border-default py-8 text-center">
                <p className="text-sm text-text-muted">No tasks</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TimelinePage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">📅</div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">Timeline View</h2>
        <p className="text-text-secondary">Schedule your tasks throughout the day</p>
      </div>
    </div>
  );
}

function BlocksPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">⬡</div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">Quick Blocks</h2>
        <p className="text-text-secondary">Tap to quickly log activities</p>
      </div>
    </div>
  );
}

function AIPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🤖</div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">AI Assistant</h2>
        <p className="text-text-secondary">Chat with AI to schedule your tasks</p>
        <p className="text-text-muted text-sm mt-2">(Coming in Phase 2.3)</p>
      </div>
    </div>
  );
}

function AddTaskPage({ onBack }: { onBack: () => void }) {
  const createTask = useTaskStore((state) => state.createTask);
  const [name, setName] = useState("");
  const [priority, setPriority] = useState<"1" | "2" | "3" | "4" | "5">("3");
  const [status, setStatus] = useState<TaskStatus>("backlog");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createTask({
      name: name.trim(),
      priority,
      status,
      blockSize: "30min",
      blockCount: 1,
      assigneeId: "me",
      accessContexts: [],
      tags: [],
      subtasks: [],
      reminders: [],
      recurrence: "none",
      isQuickAdd: false,
      isPutzing: false,
    });

    setName("");
    onBack();
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Add New Task</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Task Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-bg-secondary border border-border-default rounded-lg px-4 py-3 text-text-primary focus:border-accent-magenta focus:outline-none"
            placeholder="What needs to be done?"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as typeof priority)}
            className="w-full bg-bg-secondary border border-border-default rounded-lg px-4 py-3 text-text-primary focus:border-accent-magenta focus:outline-none"
          >
            <option value="1">1 - Highest</option>
            <option value="2">2 - High</option>
            <option value="3">3 - Medium</option>
            <option value="4">4 - Low</option>
            <option value="5">5 - Lowest</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="w-full bg-bg-secondary border border-border-default rounded-lg px-4 py-3 text-text-primary focus:border-accent-magenta focus:outline-none"
          >
            {KANBAN_COLUMNS.map((col) => (
              <option key={col.id} value={col.id}>
                {col.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-4 py-3 rounded-lg border border-border-default text-text-secondary hover:bg-bg-tertiary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 rounded-lg bg-accent-magenta text-white font-medium hover:bg-accent-magenta/80 transition-colors"
          >
            Add Task
          </button>
        </div>
      </form>
    </div>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("kanban");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const loadTasks = useTaskStore((state) => state.loadTasks);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Listen for navigation from main process
  useEffect(() => {
    if (window.electronAPI) {
      const unsubscribe = window.electronAPI.onNavigate((path) => {
        if (path === "/add-task") {
          setCurrentPage("add-task");
        }
      });
      return unsubscribe;
    }
  }, []);

  const handleNavigation = useCallback((item: "search" | "kanban" | "timeline" | "blocks" | "add") => {
    const pageMap: Record<string, Page> = {
      "search": "ai",
      "kanban": "kanban",
      "timeline": "timeline",
      "blocks": "blocks",
      "add": "add-task",
    };
    setCurrentPage(pageMap[item] || "kanban");
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setCurrentPage("edit-task");
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "kanban":
        return <KanbanPage onEditTask={handleEditTask} />;
      case "timeline":
        return <TimelinePage />;
      case "blocks":
        return <BlocksPage />;
      case "ai":
        return <AIPage />;
      case "add-task":
        return <AddTaskPage onBack={() => setCurrentPage("kanban")} />;
      case "edit-task":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-text-primary mb-4">Edit Task</h1>
            <p className="text-text-secondary mb-4">Editing: {editingTask?.name}</p>
            <button
              onClick={() => setCurrentPage("kanban")}
              className="px-4 py-2 rounded-lg bg-accent-magenta text-white"
            >
              Back to Kanban
            </button>
          </div>
        );
      default:
        return <KanbanPage onEditTask={handleEditTask} />;
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case "kanban":
        return "Kanban Board";
      case "timeline":
        return "Timeline";
      case "blocks":
        return "Quick Blocks";
      case "ai":
        return "AI Assistant";
      case "add-task":
        return "Add Task";
      case "edit-task":
        return "Edit Task";
      default:
        return "Blocks";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-bg-primary">
      <TitleBar />
      <TopBar title={getPageTitle()} />
      <main className="flex-1 overflow-hidden">
        {renderPage()}
      </main>
      <BottomNav 
        activeItem={currentPage === "ai" ? "search" : currentPage === "add-task" ? "add" : currentPage as "kanban" | "timeline" | "blocks"} 
        onItemPress={handleNavigation} 
      />
    </div>
  );
}

