"use client";

import { useQuickBlocksStore, QuickAddGrid } from "@blocks/ui";
import type { QuickAddBlock } from "@blocks/core";
import { Grid3X3 } from "lucide-react";

export default function BlocksPage() {
  const blocks = useQuickBlocksStore((state) => state.blocks);
  const timeLoggedToday = useQuickBlocksStore((state) => state.timeLoggedToday);
  const logTime = useQuickBlocksStore((state) => state.logTime);
  const isLoading = useQuickBlocksStore((state) => state.isLoading);

  const handleBlockPress = async (block: QuickAddBlock) => {
    await logTime(block.id);
    
    // Visual feedback - could add a toast notification here
    console.log(`Logged ${block.defaultDuration} minutes for ${block.name}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-text-secondary">Loading blocks...</div>
      </div>
    );
  }

  if (blocks.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8">
        <Grid3X3 className="mb-4 h-16 w-16 text-text-muted" />
        <h3 className="mb-2 text-lg font-semibold text-text-primary">No quick blocks</h3>
        <p className="text-center text-sm text-text-secondary">
          Quick blocks will appear here for fast time logging
        </p>
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

  return (
    <div className="px-4 py-6">
      {/* Stats summary */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-bg-secondary p-3 text-center">
          <p className="text-2xl font-bold text-text-primary">{totalTimeLogged}</p>
          <p className="text-xs text-text-secondary">Total mins</p>
        </div>
        <div className="rounded-lg bg-bg-secondary p-3 text-center">
          <p className="text-2xl font-bold text-block-green">{productiveTime}</p>
          <p className="text-xs text-text-secondary">Productive</p>
        </div>
        <div className="rounded-lg bg-bg-secondary p-3 text-center">
          <p className="text-2xl font-bold text-status-warning">{putzingTime}</p>
          <p className="text-xs text-text-secondary">Putzing</p>
        </div>
      </div>

      {/* Quick add grid */}
      <QuickAddGrid
        blocks={blocks}
        timeLoggedMap={timeLoggedToday}
        onBlockPress={handleBlockPress}
      />

      {/* Tip */}
      <p className="mt-6 text-center text-xs text-text-muted">
        Tap a block to log time. Green = productive, dark = putzing.
      </p>
    </div>
  );
}

