// ============================================================================
// BLOCKS - Task Templates Component
// Create tasks from reusable templates
// ============================================================================

import { useState, useEffect } from "react";
import { cn, Button } from "@blocks/ui";
import { v4 as uuidv4 } from "uuid";
import type { TaskTemplate, Task, BlockSize, TaskPriority, AccessContext } from "@blocks/core";
import { DexieStorage } from "@blocks/core";
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface TaskTemplatesProps {
  onCreateTask: (templateData: Partial<Task>) => void;
  className?: string;
}

interface TemplateFormData {
  name: string;
  description?: string;
  defaultName?: string;
  defaultDescription?: string;
  defaultPriority?: TaskPriority;
  defaultBlockSize?: BlockSize;
  defaultBlockCount?: number;
  defaultAccessContexts?: AccessContext[];
  defaultTags?: string[];
  category?: string;
  color?: string;
  icon?: string;
}

// ============================================================================
// Constants
// ============================================================================

const TEMPLATE_COLORS = [
  "#EF4444", "#F97316", "#EAB308", "#22C55E",
  "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899",
];

const TEMPLATE_ICONS = [
  "📝", "📋", "✅", "📊", "💼", "🎯", "⚡", "🔧",
  "📚", "💡", "🎨", "🏠", "🚀", "📧", "📞", "🛒",
];

// ============================================================================
// Component
// ============================================================================

export function TaskTemplates({ onCreateTask, className }: TaskTemplatesProps) {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: "",
  });
  
  const storage = DexieStorage.getInstance();
  
  // Load templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const loaded = await storage.getTaskTemplates();
        setTemplates(loaded);
      } catch (error) {
        console.error("Failed to load templates:", error);
      }
    };
    loadTemplates();
  }, [storage]);
  
  const handleCreateTemplate = async () => {
    if (!formData.name.trim()) return;
    
    const newTemplate: TaskTemplate = {
      id: uuidv4(),
      name: formData.name.trim(),
      description: formData.description,
      defaultName: formData.defaultName,
      defaultDescription: formData.defaultDescription,
      defaultPriority: formData.defaultPriority,
      defaultBlockSize: formData.defaultBlockSize,
      defaultBlockCount: formData.defaultBlockCount,
      defaultAccessContexts: formData.defaultAccessContexts,
      defaultTags: formData.defaultTags,
      category: formData.category,
      color: formData.color || TEMPLATE_COLORS[0],
      icon: formData.icon || TEMPLATE_ICONS[0],
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    try {
      await storage.createTaskTemplate(newTemplate);
      setTemplates((prev) => [...prev, newTemplate]);
      setFormData({ name: "" });
      setIsCreating(false);
    } catch (error) {
      console.error("Failed to create template:", error);
    }
  };
  
  const handleUpdateTemplate = async () => {
    if (!editingId || !formData.name.trim()) return;
    
    try {
      const updated = await storage.updateTaskTemplate(editingId, {
        name: formData.name.trim(),
        description: formData.description,
        defaultName: formData.defaultName,
        defaultDescription: formData.defaultDescription,
        defaultPriority: formData.defaultPriority,
        defaultBlockSize: formData.defaultBlockSize,
        defaultBlockCount: formData.defaultBlockCount,
        defaultAccessContexts: formData.defaultAccessContexts,
        defaultTags: formData.defaultTags,
        category: formData.category,
        color: formData.color,
        icon: formData.icon,
      });
      
      setTemplates((prev) =>
        prev.map((t) => (t.id === editingId ? updated : t))
      );
      setFormData({ name: "" });
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update template:", error);
    }
  };
  
  const handleDeleteTemplate = async (id: string) => {
    try {
      await storage.deleteTaskTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to delete template:", error);
    }
  };
  
  const handleUseTemplate = async (template: TaskTemplate) => {
    // Increment usage count
    try {
      await storage.incrementTemplateUsage(template.id);
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === template.id ? { ...t, usageCount: (t.usageCount || 0) + 1 } : t
        )
      );
    } catch (error) {
      console.error("Failed to increment usage:", error);
    }
    
    // Create task from template
    onCreateTask({
      name: template.defaultName || template.name,
      description: template.defaultDescription,
      priority: template.defaultPriority || "3",
      blockSize: template.defaultBlockSize || "30min",
      blockCount: template.defaultBlockCount || 1,
      accessContexts: template.defaultAccessContexts || [],
      tags: template.defaultTags || [],
      category: template.category,
      color: template.color,
    });
  };
  
  const startEditing = (template: TaskTemplate) => {
    setEditingId(template.id);
    setFormData({
      name: template.name,
      description: template.description,
      defaultName: template.defaultName,
      defaultDescription: template.defaultDescription,
      defaultPriority: template.defaultPriority,
      defaultBlockSize: template.defaultBlockSize,
      defaultBlockCount: template.defaultBlockCount,
      defaultAccessContexts: template.defaultAccessContexts,
      defaultTags: template.defaultTags,
      category: template.category,
      color: template.color,
      icon: template.icon,
    });
    setIsCreating(false);
  };
  
  const cancelForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ name: "" });
  };
  
  return (
    <div className={cn("rounded-lg border border-border-default bg-bg-secondary", className)}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="h-4 w-4 text-accent-cyan" />
          <span className="text-sm font-medium text-text-primary">
            Task Templates
          </span>
          {templates.length > 0 && (
            <span className="rounded-full bg-bg-tertiary px-2 py-0.5 text-xs text-text-muted">
              {templates.length}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-text-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-text-muted" />
        )}
      </button>
      
      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-border-default px-4 py-4 space-y-4">
          {/* Template list */}
          {templates.length > 0 && (
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center gap-3 rounded-lg bg-bg-tertiary p-3 group"
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-lg"
                    style={{ backgroundColor: template.color + "20" }}
                  >
                    {template.icon || "📝"}
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {template.name}
                    </p>
                    {template.description && (
                      <p className="text-xs text-text-muted truncate">
                        {template.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleUseTemplate(template)}
                      className="p-1.5 rounded-lg hover:bg-accent-green/20 text-accent-green"
                      title="Use template"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => startEditing(template)}
                      className="p-1.5 rounded-lg hover:bg-accent-cyan/20 text-accent-cyan"
                      title="Edit template"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-1.5 rounded-lg hover:bg-status-error/20 text-status-error"
                      title="Delete template"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Empty state */}
          {templates.length === 0 && !isCreating && (
            <div className="text-center py-6">
              <FileText className="h-8 w-8 text-text-muted mx-auto mb-2" />
              <p className="text-sm text-text-muted">No templates yet</p>
              <p className="text-xs text-text-muted mt-1">
                Create templates for tasks you do often
              </p>
            </div>
          )}
          
          {/* Create/Edit form */}
          {(isCreating || editingId) && (
            <div className="space-y-3 p-3 rounded-lg bg-bg-tertiary">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Template name"
                className="w-full rounded-lg border border-border-default bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-magenta focus:outline-none"
                autoFocus
              />
              
              <input
                type="text"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description (optional)"
                className="w-full rounded-lg border border-border-default bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-magenta focus:outline-none"
              />
              
              <input
                type="text"
                value={formData.defaultName || ""}
                onChange={(e) => setFormData({ ...formData, defaultName: e.target.value })}
                placeholder="Default task name (optional)"
                className="w-full rounded-lg border border-border-default bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-magenta focus:outline-none"
              />
              
              {/* Color picker */}
              <div>
                <label className="text-xs text-text-muted mb-1 block">Color</label>
                <div className="flex gap-2">
                  {TEMPLATE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={cn(
                        "h-6 w-6 rounded-full transition-transform",
                        formData.color === color && "ring-2 ring-white ring-offset-2 ring-offset-bg-tertiary scale-110"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Icon picker */}
              <div>
                <label className="text-xs text-text-muted mb-1 block">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATE_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center text-lg transition-colors",
                        formData.icon === icon
                          ? "bg-accent-magenta/20 ring-1 ring-accent-magenta"
                          : "bg-bg-secondary hover:bg-bg-secondary/80"
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={cancelForm}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="flex-1"
                  onClick={editingId ? handleUpdateTemplate : handleCreateTemplate}
                  disabled={!formData.name.trim()}
                >
                  <Check className="h-4 w-4 mr-1" />
                  {editingId ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          )}
          
          {/* Add button */}
          {!isCreating && !editingId && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => {
                setIsCreating(true);
                setFormData({ name: "", color: TEMPLATE_COLORS[0], icon: TEMPLATE_ICONS[0] });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

