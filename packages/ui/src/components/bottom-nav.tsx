// ============================================================================
// BLOCKS - BottomNav Component
// Updated layout: [Search] --- [Kanban] [Timeline] [Blocks] --- [Add]
// ============================================================================

import { cn } from "../lib/utils";
import {
  AISearchIcon,
  KanbanIcon,
  TimelineIcon,
  BlocksIcon,
  AddIcon,
} from "./icons/nav-icons";

export type NavItem = "search" | "kanban" | "timeline" | "blocks" | "add";

export interface BottomNavProps {
  activeItem: NavItem;
  onItemPress: (item: NavItem) => void;
  className?: string;
}

interface NavItemConfig {
  id: NavItem;
  Icon: React.FC<{ className?: string; size?: number }>;
  label: string;
}

// Main navigation items (centered)
const mainNavItems: NavItemConfig[] = [
  { id: "kanban", Icon: KanbanIcon, label: "Kanban" },
  { id: "timeline", Icon: TimelineIcon, label: "Timeline" },
  { id: "blocks", Icon: BlocksIcon, label: "Blocks" },
];

export function BottomNav({ activeItem, onItemPress, className }: BottomNavProps) {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30",
        "border-t border-border-default bg-bg-secondary",
        "pb-[env(safe-area-inset-bottom)]",
        className
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {/* AI/Search button - left side, 48x48 */}
        <ActionButton
          icon={AISearchIcon}
          label="AI"
          isActive={activeItem === "search"}
          onPress={() => onItemPress("search")}
          variant="secondary"
        />

        {/* Main nav icons - centered */}
        <div className="flex flex-1 items-center justify-center gap-8">
          {mainNavItems.map((item) => (
            <MainNavButton
              key={item.id}
              item={item}
              isActive={activeItem === item.id}
              onPress={() => onItemPress(item.id)}
            />
          ))}
        </div>

        {/* Add button - right side, 48x48 */}
        <ActionButton
          icon={AddIcon}
          label="Add"
          isActive={activeItem === "add"}
          onPress={() => onItemPress("add")}
          variant="primary"
        />
      </div>
    </nav>
  );
}

interface ActionButtonProps {
  icon: React.FC<{ className?: string; size?: number }>;
  label: string;
  isActive: boolean;
  onPress: () => void;
  variant: "primary" | "secondary";
}

function ActionButton({ icon: Icon, label, isActive, onPress, variant }: ActionButtonProps) {
  const isPrimary = variant === "primary";
  
  return (
    <button
      onClick={onPress}
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-xl",
        "transition-all active:scale-95",
        isPrimary
          ? "bg-accent-magenta text-white shadow-lg hover:bg-accent-magenta-light hover:shadow-glow"
          : isActive
            ? "bg-accent-magenta/20 text-accent-magenta"
            : "bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
      )}
      aria-label={label}
    >
      <Icon size={24} />
    </button>
  );
}

interface MainNavButtonProps {
  item: NavItemConfig;
  isActive: boolean;
  onPress: () => void;
}

function MainNavButton({ item, isActive, onPress }: MainNavButtonProps) {
  const { Icon } = item;

  return (
    <button
      onClick={onPress}
      className={cn(
        "flex flex-col items-center justify-center gap-1 py-2",
        "transition-colors",
        isActive ? "text-accent-magenta" : "text-text-tertiary hover:text-text-secondary"
      )}
      aria-label={item.label}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon size={22} className={cn(isActive && "drop-shadow-glow")} />
      <span className="text-xs font-medium">{item.label}</span>
    </button>
  );
}
