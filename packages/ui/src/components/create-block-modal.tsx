// ============================================================================
// BLOCKS - Create/Edit Block Modal Component
// ============================================================================

import { useState, useEffect } from "react";
import type { QuickAddBlock, BlockCategory } from "@blocks/core";
import { cn } from "../lib/utils";
import { X } from "lucide-react";

// Duration presets in minutes
const DURATION_PRESETS = [5, 10, 15, 30, 60, 120];

// Category color presets (local copy to ensure type safety)
const CATEGORY_COLORS = {
  productive: "#6B4423",
  chores: "#16a34a",
  putzing: "#166534",
  custom: "#9b4dca",
} as const;

// Helper function to get color by category
function getCategoryColor(cat: string): string {
  const colors: Record<string, string> = CATEGORY_COLORS;
  return colors[cat] || CATEGORY_COLORS.productive;
}

// Category options
const CATEGORY_OPTIONS: { value: BlockCategory; label: string; color: string }[] = [
  { value: "productive", label: "Productive", color: CATEGORY_COLORS.productive },
  { value: "chores", label: "Chores", color: CATEGORY_COLORS.chores },
  { value: "putzing", label: "Putzing", color: CATEGORY_COLORS.putzing },
  { value: "custom", label: "Custom", color: CATEGORY_COLORS.custom },
];

// Custom color options (only shown when category is "custom")
const CUSTOM_COLORS = [
  "#9b4dca", // Magenta
  "#00bcd4", // Teal
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#f59e0b", // Orange
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
];

export interface CreateBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    block: Omit<
      QuickAddBlock,
      "id" | "createdAt" | "usageCount" | "configured" | "linkedTaskId"
    >,
  ) => void;
  editingBlock?: QuickAddBlock | null;
  nextSortOrder: number;
}

export function CreateBlockModal({
  isOpen,
  onClose,
  onSave,
  editingBlock,
  nextSortOrder,
}: CreateBlockModalProps) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(30);
  const [category, setCategory] = useState<BlockCategory>("productive");
  const [customColor, setCustomColor] = useState<string>(CUSTOM_COLORS[0] ?? "#9b4dca");
  const [isPutzing, setIsPutzing] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editingBlock) {
      setName(editingBlock.name);
      setDuration(editingBlock.defaultDuration);
      setCategory(editingBlock.category || "productive");
      setCustomColor(editingBlock.color);
      setIsPutzing(editingBlock.isPutzing);
    } else {
      // Reset form for new block
      setName("");
      setDuration(30);
      setCategory("productive");
      setCustomColor(CUSTOM_COLORS[0] ?? "#9b4dca");
      setIsPutzing(false);
    }
  }, [editingBlock, isOpen]);

  // Auto-set isPutzing when category changes
  useEffect(() => {
    setIsPutzing(category === "putzing");
  }, [category]);

  const handleSave = () => {
    if (!name.trim()) return;

    const color = category === "custom" ? customColor : getCategoryColor(category);

    onSave({
      name: name.trim(),
      defaultDuration: duration,
      category,
      color,
      isPutzing,
      sortOrder: editingBlock?.sortOrder ?? nextSortOrder,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-bg-secondary p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-primary">
            {editingBlock ? "Edit Block" : "Create Block"}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-bg-tertiary hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Name input */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Block Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Exercise, Reading, Coffee Break"
              className={cn(
                "w-full rounded-lg border border-border-default bg-bg-tertiary px-4 py-3",
                "text-text-primary placeholder:text-text-muted",
                "focus:border-accent-magenta focus:outline-none"
              )}
              autoFocus
            />
          </div>

          {/* Duration selector */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Duration (minutes)
            </label>
            <div className="flex flex-wrap gap-2">
              {DURATION_PRESETS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    duration === d
                      ? "bg-accent-magenta text-white"
                      : "bg-bg-tertiary text-text-secondary hover:bg-bg-elevated"
                  )}
                >
                  {d < 60 ? `${d}m` : `${d / 60}h`}
                </button>
              ))}
            </div>
            {/* Custom duration input */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-text-muted">Custom:</span>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Math.max(1, Math.min(480, parseInt(e.target.value) || 1)))}
                min={1}
                max={480}
                className={cn(
                  "w-20 rounded-lg border border-border-default bg-bg-tertiary px-3 py-2 text-center",
                  "text-text-primary focus:border-accent-magenta focus:outline-none"
                )}
              />
              <span className="text-sm text-text-muted">min</span>
            </div>
          </div>

          {/* Category selector */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCategory(opt.value)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-lg transition-colors border-2",
                    category === opt.value
                      ? "border-accent-magenta bg-accent-magenta/10"
                      : "border-border-default bg-bg-tertiary hover:border-accent-magenta/50"
                  )}
                >
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: opt.color }}
                  />
                  <span className={cn(
                    "text-sm font-medium",
                    category === opt.value ? "text-accent-magenta" : "text-text-secondary"
                  )}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom color picker (only when category is "custom") */}
          {category === "custom" && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Custom Color
              </label>
              <div className="flex flex-wrap gap-2">
                {CUSTOM_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCustomColor(color)}
                    className={cn(
                      "h-10 w-10 rounded-full transition-transform",
                      customColor === color && "scale-110 ring-2 ring-white ring-offset-2 ring-offset-bg-secondary"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Preview
            </label>
            <div className="flex justify-center">
              <div
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl p-4 text-center",
                  "min-h-[100px] w-32"
                )}
                style={{
                  backgroundColor: category === "custom" ? customColor : getCategoryColor(category),
                  opacity: isPutzing ? 0.7 : 1,
                }}
              >
                <span className={cn(
                  "font-medium leading-tight",
                  isPutzing ? "text-text-secondary" : "text-white"
                )}>
                  {name || "Block Name"}
                </span>
                <span className={cn(
                  "mt-1 text-2xl font-bold",
                  isPutzing ? "text-text-tertiary" : "text-white"
                )}>
                  {isPutzing ? `-${duration}` : `+${duration}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg border border-border-default text-text-secondary hover:bg-bg-tertiary transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className={cn(
              "flex-1 px-4 py-3 rounded-lg font-medium transition-colors",
              "bg-accent-magenta text-white hover:bg-accent-magenta/80",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {editingBlock ? "Save Changes" : "Create Block"}
          </button>
        </div>
      </div>
    </div>
  );
}

