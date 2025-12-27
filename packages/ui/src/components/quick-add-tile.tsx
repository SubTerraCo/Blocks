// ============================================================================
// BLOCKS - QuickAddTile Component
// ============================================================================

import { useState } from "react";
import type { QuickAddBlock } from "@blocks/core";
import { cn } from "../lib/utils";
import { X, Plus, GripVertical } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface QuickAddTileProps {
  block: QuickAddBlock;
  timeLogged?: number; // Minutes logged today for this block
  onPress?: (block: QuickAddBlock) => void;
  className?: string;
  isEditMode?: boolean;
  onDelete?: (block: QuickAddBlock) => void;
}

export function QuickAddTile({
  block,
  timeLogged = 0,
  onPress,
  className,
  isEditMode = false,
  onDelete,
}: QuickAddTileProps) {
  const displayTime = timeLogged > 0 ? `+${timeLogged}` : `+${block.defaultDuration}`;
  const isPutzing = block.isPutzing;
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    if (isEditMode) return; // Don't trigger in edit mode
    setIsPressed(true);
    onPress?.(block);
    // Reset animation after a short delay
    setTimeout(() => setIsPressed(false), 200);
  };

  return (
    <div className="relative">
      {/* Delete button in edit mode */}
      {isEditMode && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(block);
          }}
          className="absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      
      <button
        className={cn(
          "quick-block flex flex-col items-center justify-center rounded-xl p-4 text-center transition-all",
          "min-h-[100px] w-full",
          !isEditMode && "active:scale-95 hover:brightness-110",
          isEditMode && "animate-wiggle cursor-grab",
          isPressed && "scale-90 brightness-125",
          className
        )}
        style={{
          backgroundColor: block.color,
          opacity: isPutzing ? 0.7 : 1,
        }}
        onClick={handlePress}
        disabled={isEditMode}
      >
        {/* Drag handle in edit mode */}
        {isEditMode && (
          <div className="absolute top-2 left-2">
            <GripVertical className="h-4 w-4 text-white/50" />
          </div>
        )}

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
    </div>
  );
}

// Sortable tile wrapper for drag-and-drop
interface SortableQuickAddTileProps extends QuickAddTileProps {
  id: string;
}

function SortableQuickAddTile({ id, ...props }: SortableQuickAddTileProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <QuickAddTile {...props} />
    </div>
  );
}

// Empty slot component for adding new blocks
interface EmptySlotProps {
  onClick: () => void;
  isEditMode: boolean;
}

function EmptySlot({ onClick, isEditMode }: EmptySlotProps) {
  if (!isEditMode) return null;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center rounded-xl p-4 text-center",
        "min-h-[100px] w-full",
        "border-2 border-dashed border-border-default",
        "bg-bg-tertiary/50 hover:bg-bg-tertiary hover:border-accent-magenta",
        "transition-all"
      )}
    >
      <Plus className="h-8 w-8 text-text-muted" />
      <span className="mt-2 text-sm text-text-muted">Add Block</span>
    </button>
  );
}

// Grid wrapper for quick add tiles (non-editable version)
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
  // Sort blocks by sort order
  const sortedBlocks = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder);

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

// ============================================================================
// Editable Grid with Drag-and-Drop
// ============================================================================
export interface EditableQuickAddGridProps {
  blocks: QuickAddBlock[];
  timeLoggedMap?: Record<string, number>;
  isEditMode: boolean;
  onBlockPress?: (block: QuickAddBlock) => void;
  onBlockDelete?: (block: QuickAddBlock) => void;
  onBlockReorder?: (orderedIds: string[]) => void;
  onCreateBlock?: () => void;
  maxSlots?: number;
  className?: string;
}

export function EditableQuickAddGrid({
  blocks,
  timeLoggedMap = {},
  isEditMode,
  onBlockPress,
  onBlockDelete,
  onBlockReorder,
  onCreateBlock,
  maxSlots = 15,
  className,
}: EditableQuickAddGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Sort blocks by sort order
  const sortedBlocks = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder);
  const blockIds = sortedBlocks.map((b) => b.id);
  
  // Calculate empty slots
  const emptySlots = Math.max(0, maxSlots - blocks.length);
  
  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = blockIds.indexOf(active.id as string);
    const newIndex = blockIds.indexOf(over.id as string);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = [...blockIds];
      newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, active.id as string);
      onBlockReorder?.(newOrder);
    }
  };

  const activeBlock = activeId ? sortedBlocks.find((b) => b.id === activeId) : null;

  // Non-edit mode: simple grid
  if (!isEditMode) {
    return (
      <div className={cn("grid grid-cols-3 gap-3", className)}>
        {sortedBlocks.map((block) => (
          <QuickAddTile
            key={block.id}
            block={block}
            timeLogged={timeLoggedMap[block.id]}
            onPress={onBlockPress}
            isEditMode={false}
          />
        ))}
      </div>
    );
  }

  // Edit mode: sortable grid with drag-and-drop
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={blockIds} strategy={rectSortingStrategy}>
        <div className={cn("grid grid-cols-3 gap-3", className)}>
          {sortedBlocks.map((block) => (
            <SortableQuickAddTile
              key={block.id}
              id={block.id}
              block={block}
              timeLogged={timeLoggedMap[block.id]}
              onPress={onBlockPress}
              isEditMode={isEditMode}
              onDelete={onBlockDelete}
            />
          ))}
          
          {/* Empty slots for adding new blocks */}
          {Array.from({ length: Math.min(emptySlots, 3) }).map((_, index) => (
            <EmptySlot
              key={`empty-${index}`}
              onClick={() => onCreateBlock?.()}
              isEditMode={isEditMode}
            />
          ))}
        </div>
      </SortableContext>

      {/* Drag overlay */}
      <DragOverlay>
        {activeBlock && (
          <div className="opacity-80 rotate-3">
            <QuickAddTile
              block={activeBlock}
              timeLogged={timeLoggedMap[activeBlock.id]}
              isEditMode={true}
              className="shadow-2xl ring-2 ring-accent-magenta"
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
