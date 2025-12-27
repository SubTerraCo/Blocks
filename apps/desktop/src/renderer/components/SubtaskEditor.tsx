// ============================================================================
// BLOCKS - Subtask Editor Component
// UI for managing task subtasks with progress tracking
// ============================================================================

import { useState, useCallback } from "react";
import { cn, Button } from "@blocks/ui";
import { v4 as uuidv4 } from "uuid";
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  GripVertical,
  X,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface Subtask {
  id: string;
  name: string;
  completed: boolean;
}

interface SubtaskEditorProps {
  subtasks: Subtask[];
  onChange: (subtasks: Subtask[]) => void;
  readOnly?: boolean;
  showProgress?: boolean;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function SubtaskEditor({
  subtasks,
  onChange,
  readOnly = false,
  showProgress = true,
  className,
}: SubtaskEditorProps) {
  const [newSubtaskName, setNewSubtaskName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  
  const completedCount = subtasks.filter((s) => s.completed).length;
  const totalCount = subtasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  const addSubtask = useCallback(() => {
    if (!newSubtaskName.trim()) return;
    
    const newSubtask: Subtask = {
      id: uuidv4(),
      name: newSubtaskName.trim(),
      completed: false,
    };
    
    onChange([...subtasks, newSubtask]);
    setNewSubtaskName("");
  }, [newSubtaskName, subtasks, onChange]);
  
  const toggleSubtask = useCallback((id: string) => {
    onChange(
      subtasks.map((s) =>
        s.id === id ? { ...s, completed: !s.completed } : s
      )
    );
  }, [subtasks, onChange]);
  
  const deleteSubtask = useCallback((id: string) => {
    onChange(subtasks.filter((s) => s.id !== id));
  }, [subtasks, onChange]);
  
  const startEditing = useCallback((subtask: Subtask) => {
    setEditingId(subtask.id);
    setEditingName(subtask.name);
  }, []);
  
  const saveEdit = useCallback(() => {
    if (!editingId) return;
    
    if (editingName.trim()) {
      onChange(
        subtasks.map((s) =>
          s.id === editingId ? { ...s, name: editingName.trim() } : s
        )
      );
    }
    
    setEditingId(null);
    setEditingName("");
  }, [editingId, editingName, subtasks, onChange]);
  
  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingName("");
  }, []);
  
  const handleKeyDown = (e: React.KeyboardEvent, action: "add" | "edit") => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (action === "add") {
        addSubtask();
      } else {
        saveEdit();
      }
    }
    if (e.key === "Escape" && action === "edit") {
      cancelEdit();
    }
  };
  
  return (
    <div className={cn("space-y-3", className)}>
      {/* Progress bar */}
      {showProgress && totalCount > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">
              {completedCount} of {totalCount} completed
            </span>
            <span className={cn(
              "font-medium",
              progressPercent === 100 ? "text-accent-green" : "text-text-secondary"
            )}>
              {progressPercent}%
            </span>
          </div>
          <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                progressPercent === 100 ? "bg-accent-green" : "bg-accent-magenta"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Subtask list */}
      <div className="space-y-1">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className={cn(
              "group flex items-center gap-2 rounded-lg px-2 py-2 transition-colors",
              "hover:bg-bg-tertiary"
            )}
          >
            {/* Drag handle (for future drag-and-drop) */}
            {!readOnly && (
              <GripVertical className="h-4 w-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
            )}
            
            {/* Checkbox */}
            <button
              type="button"
              onClick={() => toggleSubtask(subtask.id)}
              className="flex-shrink-0"
              disabled={readOnly}
            >
              {subtask.completed ? (
                <CheckCircle2 className="h-5 w-5 text-accent-green" />
              ) : (
                <Circle className="h-5 w-5 text-text-muted hover:text-accent-magenta transition-colors" />
              )}
            </button>
            
            {/* Name */}
            {editingId === subtask.id ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "edit")}
                  onBlur={saveEdit}
                  autoFocus
                  className="flex-1 bg-transparent border-b border-accent-magenta text-sm text-text-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-text-muted hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <span
                className={cn(
                  "flex-1 text-sm transition-colors cursor-pointer",
                  subtask.completed
                    ? "text-text-muted line-through"
                    : "text-text-primary"
                )}
                onClick={() => !readOnly && startEditing(subtask)}
              >
                {subtask.name}
              </span>
            )}
            
            {/* Delete button */}
            {!readOnly && editingId !== subtask.id && (
              <button
                type="button"
                onClick={() => deleteSubtask(subtask.id)}
                className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-status-error transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      
      {/* Add new subtask */}
      {!readOnly && (
        <div className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-text-muted" />
          <input
            type="text"
            value={newSubtaskName}
            onChange={(e) => setNewSubtaskName(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, "add")}
            placeholder="Add subtask..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          {newSubtaskName && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={addSubtask}
            >
              Add
            </Button>
          )}
        </div>
      )}
      
      {/* Empty state */}
      {subtasks.length === 0 && readOnly && (
        <p className="text-sm text-text-muted text-center py-4">
          No subtasks
        </p>
      )}
    </div>
  );
}

