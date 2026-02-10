// ============================================================================
// BLOCKS - Bulk Actions Component
// Perform actions on multiple selected tasks
// ============================================================================

import { useState } from "react";
import { cn, Button, useTaskStore } from "@blocks/ui";
import type { Task, TaskStatus, TaskPriority } from "@blocks/core";
import {
  CheckCircle2,
  Trash2,
  Tag,
  Flag,
  Calendar,
  X,
  ChevronDown,
  Archive,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface BulkActionsProps {
  selectedTasks: Task[];
  onClearSelection: () => void;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: "backlog", label: "Backlog", color: "#3B82F6" },
  { value: "design", label: "Design", color: "#A855F7" },
  { value: "todo", label: "To Do", color: "#EC4899" },
  { value: "doing", label: "Doing", color: "#F97316" },
  { value: "review", label: "Review", color: "#EAB308" },
  { value: "done", label: "Done", color: "#22C55E" },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "1", label: "Highest" },
  { value: "2", label: "High" },
  { value: "3", label: "Medium" },
  { value: "4", label: "Low" },
  { value: "5", label: "Lowest" },
];

// ============================================================================
// Component
// ============================================================================

export function BulkActions({ selectedTasks, onClearSelection, className }: BulkActionsProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState("");
  
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  
  const count = selectedTasks.length;
  
  if (count === 0) return null;
  
  const handleBulkStatusChange = async (status: TaskStatus) => {
    for (const task of selectedTasks) {
      await updateTask(task.id, {
        status,
        completedAt: status === "done" ? new Date() : undefined,
      });
    }
    setShowStatusMenu(false);
    onClearSelection();
  };
  
  const handleBulkPriorityChange = async (priority: TaskPriority) => {
    for (const task of selectedTasks) {
      await updateTask(task.id, { priority });
    }
    setShowPriorityMenu(false);
    onClearSelection();
  };
  
  const handleBulkAddTag = async () => {
    if (!newTag.trim()) return;
    
    for (const task of selectedTasks) {
      const currentTags = task.tags || [];
      if (!currentTags.includes(newTag.trim())) {
        await updateTask(task.id, { tags: [...currentTags, newTag.trim()] });
      }
    }
    setNewTag("");
    setShowTagInput(false);
    onClearSelection();
  };
  
  const handleBulkComplete = async () => {
    for (const task of selectedTasks) {
      await updateTask(task.id, {
        status: "done",
        completedAt: new Date(),
      });
    }
    onClearSelection();
  };
  
  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${count} task${count > 1 ? "s" : ""}? This cannot be undone.`)) {
      return;
    }
    
    for (const task of selectedTasks) {
      await deleteTask(task.id);
    }
    onClearSelection();
  };
  
  const handleBulkArchive = async () => {
    for (const task of selectedTasks) {
      await updateTask(task.id, { status: "done", completedAt: new Date() });
    }
    onClearSelection();
  };
  
  return (
    <div className={cn(
      "fixed bottom-20 left-1/2 -translate-x-1/2 z-50",
      "flex items-center gap-3 rounded-xl bg-bg-secondary border border-border-default shadow-lg px-4 py-3",
      className
    )}>
      {/* Selection count */}
      <div className="flex items-center gap-2 pr-3 border-r border-border-default">
        <CheckCircle2 className="h-4 w-4 text-accent-magenta" />
        <span className="text-sm font-medium text-text-primary">
          {count} selected
        </span>
        <button
          onClick={onClearSelection}
          className="ml-1 p-1 rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {/* Status dropdown */}
      <div className="relative">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setShowStatusMenu(!showStatusMenu);
            setShowPriorityMenu(false);
            setShowTagInput(false);
          }}
        >
          <Calendar className="h-4 w-4 mr-1" />
          Status
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
        
        {showStatusMenu && (
          <div className="absolute bottom-full left-0 mb-2 w-36 rounded-lg border border-border-default bg-bg-secondary shadow-lg overflow-hidden">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleBulkStatusChange(option.value)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-tertiary transition-colors"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: option.color }}
                />
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Priority dropdown */}
      <div className="relative">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setShowPriorityMenu(!showPriorityMenu);
            setShowStatusMenu(false);
            setShowTagInput(false);
          }}
        >
          <Flag className="h-4 w-4 mr-1" />
          Priority
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
        
        {showPriorityMenu && (
          <div className="absolute bottom-full left-0 mb-2 w-32 rounded-lg border border-border-default bg-bg-secondary shadow-lg overflow-hidden">
            {PRIORITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleBulkPriorityChange(option.value)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-tertiary transition-colors"
              >
                P{option.value} - {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Add tag */}
      <div className="relative">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setShowTagInput(!showTagInput);
            setShowStatusMenu(false);
            setShowPriorityMenu(false);
          }}
        >
          <Tag className="h-4 w-4 mr-1" />
          Tag
        </Button>
        
        {showTagInput && (
          <div className="absolute bottom-full left-0 mb-2 rounded-lg border border-border-default bg-bg-secondary shadow-lg p-2 w-48">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBulkAddTag()}
                placeholder="Tag name"
                autoFocus
                className="flex-1 rounded-lg border border-border-default bg-bg-tertiary px-2 py-1 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-magenta"
              />
              <Button size="sm" onClick={handleBulkAddTag} disabled={!newTag.trim()}>
                Add
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Complete all */}
      <Button
        variant="secondary"
        size="sm"
        onClick={handleBulkComplete}
        className="text-accent-green hover:bg-accent-green/10"
      >
        <CheckCircle2 className="h-4 w-4 mr-1" />
        Complete
      </Button>
      
      {/* Archive */}
      <Button
        variant="secondary"
        size="sm"
        onClick={handleBulkArchive}
        className="text-accent-cyan hover:bg-accent-cyan/10"
      >
        <Archive className="h-4 w-4 mr-1" />
        Archive
      </Button>
      
      {/* Delete */}
      <Button
        variant="secondary"
        size="sm"
        onClick={handleBulkDelete}
        className="text-status-error hover:bg-status-error/10"
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete
      </Button>
    </div>
  );
}

