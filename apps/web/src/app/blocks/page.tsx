"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useQuickBlocksStore,
  useTaskStore,
  useSettingsStore,
  EditableQuickAddGrid,
  CreateBlockModal,
  PlacementPickerModal,
  cn,
} from "@blocks/ui";
import type { QuickAddBlock } from "@blocks/core";
import { tasksToTimeBlocks, calculateDuration } from "@blocks/core";
import { Grid3X3, Pencil, Check } from "lucide-react";

export default function BlocksPage() {
  return (
    <Suspense fallback={<div className="p-4 text-text-secondary">Loading…</div>}>
      <BlocksPageContent />
    </Suspense>
  );
}

function BlocksPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const blocks = useQuickBlocksStore((state) => state.blocks);
  const timeLoggedToday = useQuickBlocksStore((state) => state.timeLoggedToday);
  const isLoading = useQuickBlocksStore((state) => state.isLoading);
  const loadBlocks = useQuickBlocksStore((state) => state.loadBlocks);
  const scheduleBlock = useQuickBlocksStore((state) => state.scheduleBlock);
  const deleteBlock = useQuickBlocksStore((state) => state.deleteBlock);
  const reorderBlocks = useQuickBlocksStore((state) => state.reorderBlocks);
  const createBlock = useQuickBlocksStore((state) => state.createBlock);
  const tasks = useTaskStore((state) => state.tasks);
  const currentTask = useTaskStore((state) => state.currentTask);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const workEndTime = useSettingsStore((state) => state.settings.workEndTime);

  const [isEditMode, setIsEditMode] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [lastAddedTask, setLastAddedTask] = useState<string | null>(null);
  const [placementBlock, setPlacementBlock] = useState<QuickAddBlock | null>(null);

  useEffect(() => {
    void loadTasks();
    void loadBlocks();
  }, [loadTasks, loadBlocks]);

  // N-0045: returning from first-use editor with ?place=<id> opens the picker
  // exactly once. A ref guards against the param re-opening the picker after the
  // block store updates (e.g. once the task is scheduled).
  const consumedPlaceRef = useRef<string | null>(null);
  useEffect(() => {
    const placeId = searchParams?.get("place");
    if (!placeId) return;
    if (consumedPlaceRef.current === placeId) return;
    const block = blocks.find((b) => b.id === placeId);
    if (block?.configured) {
      consumedPlaceRef.current = placeId;
      setPlacementBlock(block);
      router.replace("/blocks");
    }
  }, [searchParams, blocks, router]);

  useEffect(() => {
    if (lastAddedTask) {
      void loadTasks();
      const timer = setTimeout(() => setLastAddedTask(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastAddedTask, loadTasks]);

  const handleBlockPress = async (block: QuickAddBlock) => {
    if (isEditMode) return;
    const linked =
      block.linkedTaskId && tasks.find((t) => t.id === block.linkedTaskId);
    if (!block.configured || !linked) {
      // First use → open the task editor prefilled from the block.
      router.push(`/add-task?blockId=${block.id}`);
      return;
    }
    // Configured → choose where to place the reused task.
    setPlacementBlock(block);
  };

  const handleBlockLongPress = (block: QuickAddBlock) => {
    if (block.configured && block.linkedTaskId) {
      router.push(`/edit-task/${block.linkedTaskId}`);
    } else {
      router.push(`/add-task?blockId=${block.id}`);
    }
  };

  const handleSchedule = async (scheduledAt: Date) => {
    if (!placementBlock) return;
    const task = await scheduleBlock(placementBlock.id, scheduledAt);
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

  const handleCreateBlock = async (
    blockData: Parameters<typeof createBlock>[0],
  ) => {
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

  const totalTimeLogged = Object.values(timeLoggedToday).reduce((sum, time) => sum + time, 0);
  const productiveTime = blocks
    .filter((b) => !b.isPutzing)
    .reduce((sum, b) => sum + (timeLoggedToday[b.id] ?? 0), 0);
  const putzingTime = blocks
    .filter((b) => b.isPutzing)
    .reduce((sum, b) => sum + (timeLoggedToday[b.id] ?? 0), 0);

  const nextSortOrder =
    blocks.length > 0 ? Math.max(...blocks.map((b) => b.sortOrder)) + 1 : 0;

  const scheduledBlocks = tasksToTimeBlocks(tasks);
  const placementDuration = placementBlock
    ? (() => {
        const linked = placementBlock.linkedTaskId
          ? tasks.find((t) => t.id === placementBlock.linkedTaskId)
          : null;
        return linked
          ? calculateDuration(linked.blockSize, linked.blockCount)
          : placementBlock.defaultDuration;
      })()
    : 30;

  return (
    <div className="h-full overflow-y-auto px-4 py-6 pb-24">
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
              : "bg-bg-secondary text-text-secondary hover:bg-bg-tertiary",
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

      {lastAddedTask && (
        <div className="mb-4 flex items-center justify-center">
          <div className="animate-fade-in rounded-lg bg-accent-green/20 px-4 py-2 text-accent-green text-sm font-medium">
            ✓ Scheduled &quot;{lastAddedTask}&quot; on timeline
          </div>
        </div>
      )}

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

      {isEditMode && (
        <div className="mb-4 rounded-lg bg-accent-magenta/10 p-3 text-sm text-accent-magenta">
          <p>Drag to reorder • Tap X to delete • Tap + to add new block</p>
        </div>
      )}

      <EditableQuickAddGrid
        blocks={blocks}
        timeLoggedMap={timeLoggedToday}
        isEditMode={isEditMode}
        onBlockPress={handleBlockPress}
        onBlockLongPress={handleBlockLongPress}
        onBlockDelete={handleBlockDelete}
        onBlockReorder={handleBlockReorder}
        onCreateBlock={() => setShowCreateModal(true)}
        maxSlots={15}
      />

      {!isEditMode && (
        <p className="mt-6 text-center text-xs text-text-muted">
          Tap a block to schedule it. First use fills out the task; long-press to edit.
        </p>
      )}

      <CreateBlockModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateBlock}
        nextSortOrder={nextSortOrder}
      />

      <PlacementPickerModal
        isOpen={placementBlock !== null}
        title={placementBlock?.name ?? ""}
        durationMinutes={placementDuration}
        activeTask={currentTask}
        scheduledTasks={scheduledBlocks}
        workEndTime={workEndTime}
        onClose={() => setPlacementBlock(null)}
        onSchedule={handleSchedule}
      />
    </div>
  );
}
