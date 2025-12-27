"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  useQuickBlocksStore, 
  useTaskStore,
  EditableQuickAddGrid, 
  CreateBlockModal,
  cn 
} from "@blocks/ui";
import type { QuickAddBlock } from "@blocks/core";
import { Grid3X3, Pencil, Check } from "lucide-react";

export default function BlocksPage() {
  const router = useRouter();
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

  // Reload tasks when a block is pressed (so timeline updates)
  useEffect(() => {
    if (lastAddedTask) {
      loadTasks();
      // Clear after a short delay
      const timer = setTimeout(() => setLastAddedTask(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastAddedTask, loadTasks]);

  const handleBlockPress = async (block: QuickAddBlock) => {
    if (isEditMode) return;
    
    // Create task and schedule immediately
    const task = await addTaskFromBlock(block.id);
    if (task) {
      setLastAddedTask(task.name);
      // Reload tasks to ensure state is synced
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
        <p className="text-center text-sm text-text-secondary mb-4">
          Quick blocks will appear here for fast time logging
        </p>
        <button
          onClick={() => setIsEditMode(true)}
          className="px-4 py-2 rounded-lg bg-accent-magenta text-white font-medium hover:bg-accent-magenta/80 transition-colors"
        >
          Add Blocks
        </button>
      </div>
    );
  }

  // Calculate total time logged today
  const totalTimeLogged = Object.values(timeLoggedToday).reduce((sum, time) => sum + time, 0);
  const productiveTime = blocks
    .filter((b) => !b.isPutzing)
    .reduce((sum, b) => sum + (timeLoggedToday[b.id] ?? 0), 0);
  const putzingTime = blocks
    .filter((b) => b.isPutzing)
    .reduce((sum, b) => sum + (timeLoggedToday[b.id] ?? 0), 0);

  // Get next sort order for new blocks
  const nextSortOrder = blocks.length > 0 
    ? Math.max(...blocks.map(b => b.sortOrder)) + 1 
    : 0;

  return (
    <div className="h-full overflow-y-auto px-4 py-6">
      {/* Header with Edit button */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-text-primary">
          {isEditMode ? "Edit Blocks" : "Quick Blocks"}
        </h1>
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
            isEditMode
              ? "bg-accent-green text-white hover:bg-accent-green/80"
              : "bg-bg-secondary text-text-secondary hover:bg-bg-tertiary"
          )}
        >
          {isEditMode ? (
            <>
              <Check className="h-4 w-4" />
              Done
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4" />
              Edit
            </>
          )}
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
        <p className="mt-6 text-center text-xs text-text-muted">
          Tap a block to add task to timeline. Tasks scheduled immediately.
        </p>
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
