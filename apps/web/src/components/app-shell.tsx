"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { BottomNav, TopBar, type NavItem, useTaskStore, useSettingsStore, useQuickBlocksStore } from "@blocks/ui";

const routeToNav: Record<string, NavItem> = {
  "/ai": "search",
  "/kanban": "kanban",
  "/timeline": "timeline",
  "/blocks": "blocks",
  "/": "timeline",
};

const navToRoute: Record<NavItem, string> = {
  search: "/ai",
  kanban: "/kanban",
  timeline: "/timeline",
  blocks: "/blocks",
  add: "/add-task",
};

const routeTitles: Record<string, string> = {
  "/": "Timeline",
  "/timeline": "Timeline",
  "/kanban": "Kanban",
  "/blocks": "Blocks",
  "/ai": "AI Assistant",
  "/add-task": "Add Task",
  "/settings": "Settings",
  "/profile": "Profile",
};

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Initialize stores on mount
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const loadBlocks = useQuickBlocksStore((state) => state.loadBlocks);
  const initializeDefaultBlocks = useQuickBlocksStore((state) => state.initializeDefaultBlocks);

  useEffect(() => {
    // Load all data on app start
    const initializeApp = async () => {
      await loadSettings();
      await loadTasks();
      await loadBlocks();
      await initializeDefaultBlocks();
    };
    initializeApp();
  }, [loadTasks, loadSettings, loadBlocks, initializeDefaultBlocks]);

  const activeNav = routeToNav[pathname] ?? "timeline";
  const title = routeTitles[pathname] ?? "Blocks";
  const showBackButton = pathname === "/add-task" || pathname === "/settings" || pathname === "/profile" || pathname.startsWith("/edit-task");

  const handleNavPress = (item: NavItem) => {
    router.push(navToRoute[item]);
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleProfilePress = () => {
    router.push("/profile");
  };

  const handleMenuPress = () => {
    router.push("/settings");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar
        title={title}
        showBackButton={showBackButton}
        onBackPress={handleBackPress}
        onMenuPress={handleMenuPress}
        onProfilePress={handleProfilePress}
      />
      
      <main className="flex-1 pt-bar pb-nav overflow-auto">
        {children}
      </main>

      <BottomNav activeItem={activeNav} onItemPress={handleNavPress} />
    </div>
  );
}

