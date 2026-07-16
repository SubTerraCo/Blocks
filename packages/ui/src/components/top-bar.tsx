// ============================================================================
// BLOCKS - TopBar Component
// ============================================================================

import { cn, getInitials } from "../lib/utils";
import { Menu, Bell, ChevronLeft } from "lucide-react";

export interface TopBarProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  userName?: string;
  userAvatarUrl?: string;
  notificationCount?: number;
  /** When set, replaces the centered title (e.g. desktop tracking clock). */
  centerContent?: React.ReactNode;
  /** Web uses fixed under viewport top; desktop uses static below TitleBar. */
  layout?: "fixed" | "static";
  className?: string;
}

export function TopBar({
  title,
  showBackButton = false,
  onBackPress,
  onMenuPress,
  onNotificationPress,
  onProfilePress,
  userName,
  userAvatarUrl,
  notificationCount = 0,
  centerContent,
  layout = "fixed",
  className,
}: TopBarProps) {
  return (
    <header
      data-testid="top-bar"
      className={cn(
        layout === "fixed" && "fixed left-0 right-0 top-0 z-30 pt-[env(safe-area-inset-top)]",
        layout === "static" && "relative shrink-0",
        "border-b border-border-default bg-bg-secondary",
        className
      )}
    >
      <div className="relative flex h-14 items-center justify-between px-4">
        {/* Left section */}
        <div className="z-10 flex items-center gap-2">
          {showBackButton ? (
            <button
              onClick={onBackPress}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
              aria-label="Go back"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          ) : (
            <button
              onClick={onMenuPress}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Title or custom center (tracking clock on desktop) */}
        <div className="absolute left-12 right-12 flex items-center justify-center">
          {centerContent ?? (
            <h1 className="truncate text-lg font-semibold text-text-primary">{title}</h1>
          )}
        </div>

        {/* Right section */}
        <div className="z-10 flex items-center gap-2">
          {/* Notifications */}
          {onNotificationPress && (
            <button
              onClick={onNotificationPress}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
              aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ""}`}
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-error px-1 text-xs font-bold text-white">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>
          )}

          {/* Profile */}
          {onProfilePress && (
            <button
              onClick={onProfilePress}
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-border-default transition-colors hover:border-accent-magenta"
              aria-label="Profile"
            >
              {userAvatarUrl ? (
                <img
                  src={userAvatarUrl}
                  alt={userName ?? "Profile"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-accent-magenta text-sm font-medium text-white">
                  {userName ? getInitials(userName) : "?"}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

