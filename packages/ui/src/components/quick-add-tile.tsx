// ============================================================================
// BLOCKS - QuickAddTile Component
// ============================================================================

import type { QuickAddBlock } from "@blocks/core";
import { cn } from "../lib/utils";

export interface QuickAddTileProps {
  block: QuickAddBlock;
  timeLogged?: number; // Minutes logged today for this block
  onPress?: (block: QuickAddBlock) => void;
  className?: string;
}

export function QuickAddTile({
  block,
  timeLogged = 0,
  onPress,
  className,
}: QuickAddTileProps) {
  const displayTime = timeLogged > 0 ? `+${timeLogged}` : `+${block.defaultDuration}`;
  const isPutzing = block.isPutzing;

  return (
    <button
      className={cn(
        "quick-block flex flex-col items-center justify-center rounded-xl p-4 text-center transition-all",
        "active:scale-95 hover:brightness-110",
        "min-h-[100px] w-full",
        className
      )}
      style={{
        backgroundColor: block.color,
        opacity: isPutzing ? 0.7 : 1,
      }}
      onClick={() => onPress?.(block)}
    >
      {/* Icon or Emoji */}
      {block.icon && (
        <span className="mb-1 text-2xl" role="img" aria-label={block.name}>
          {block.icon}
        </span>
      )}

      {/* Block name */}
      <span
        className={cn(
          "font-medium leading-tight",
          isPutzing ? "text-text-secondary" : "text-white"
        )}
      >
        {block.name}
      </span>

      {/* Time display */}
      <span
        className={cn(
          "mt-1 text-2xl font-bold",
          isPutzing ? "text-text-tertiary" : "text-white"
        )}
      >
        {isPutzing ? `-${timeLogged || block.defaultDuration}` : displayTime}
      </span>
    </button>
  );
}

// Grid wrapper for quick add tiles
export interface QuickAddGridProps {
  blocks: QuickAddBlock[];
  timeLoggedMap?: Record<string, number>;
  onBlockPress?: (block: QuickAddBlock) => void;
  className?: string;
}

export function QuickAddGrid({
  blocks,
  timeLoggedMap = {},
  onBlockPress,
  className,
}: QuickAddGridProps) {
  // Sort blocks: non-putzing first, then by sort order
  const sortedBlocks = [...blocks].sort((a, b) => {
    if (a.isPutzing !== b.isPutzing) {
      return a.isPutzing ? 1 : -1;
    }
    return a.sortOrder - b.sortOrder;
  });

  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-3",
        className
      )}
    >
      {sortedBlocks.map((block) => (
        <QuickAddTile
          key={block.id}
          block={block}
          timeLogged={timeLoggedMap[block.id]}
          onPress={onBlockPress}
        />
      ))}
    </div>
  );
}

