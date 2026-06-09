// ============================================================================
// BLOCKS Desktop - Keyboard Shortcuts Hook
// Global keyboard shortcuts for power users
// ============================================================================

import { useEffect, useCallback, useState } from "react";

// ============================================================================
// Types
// ============================================================================

interface ShortcutAction {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
  global?: boolean; // Works everywhere (not just when focused on app)
}

interface ShortcutsMap {
  [category: string]: ShortcutAction[];
}

// ============================================================================
// Default shortcuts
// ============================================================================

export function useKeyboardShortcuts(
  onNavigate: (page: string) => void,
  onAddTask: () => void,
  onSearch: () => void,
  options?: {
    onToggleTheme?: () => void;
    onSave?: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
  }
) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  const shortcuts: ShortcutsMap = {
    Navigation: [
      { key: "1", ctrl: true, description: "Go to Kanban", action: () => onNavigate("kanban") },
      { key: "2", ctrl: true, description: "Go to Timeline", action: () => onNavigate("timeline") },
      { key: "3", ctrl: true, description: "Go to Blocks", action: () => onNavigate("blocks") },
      { key: "4", ctrl: true, description: "Go to AI/Search", action: () => onNavigate("ai") },
      { key: "5", ctrl: true, description: "Go to Settings", action: () => onNavigate("settings") },
      { key: "6", ctrl: true, description: "Go to Profile", action: () => onNavigate("profile") },
    ],
    Tasks: [
      { key: "n", ctrl: true, description: "New Task", action: onAddTask },
      { key: "f", ctrl: true, description: "Search", action: onSearch },
      { key: "s", ctrl: true, description: "Save", action: options?.onSave || (() => {}) },
    ],
    General: [
      { key: "z", ctrl: true, description: "Undo", action: options?.onUndo || (() => {}) },
      { key: "z", ctrl: true, shift: true, description: "Redo", action: options?.onRedo || (() => {}) },
      { key: "d", ctrl: true, description: "Toggle Theme", action: options?.onToggleTheme || (() => {}) },
      { key: "?", shift: true, description: "Show Help", action: () => setIsHelpOpen(true) },
      { key: "b", ctrl: true, shift: true, description: "Focus Blocks Window", action: () => window.electronAPI?.showWindow?.() },
      { key: "Escape", description: "Close Modal/Help", action: () => setIsHelpOpen(false) },
    ],
  };
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      // Allow Escape to work in inputs
      if (event.key !== "Escape") {
        return;
      }
    }
    
    // Check all shortcuts
    for (const category of Object.values(shortcuts)) {
      for (const shortcut of category) {
        const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !(event.ctrlKey || event.metaKey);
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        
        if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    }
  }, [shortcuts]);
  
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
  
  return {
    shortcuts,
    isHelpOpen,
    setIsHelpOpen,
  };
}

// ============================================================================
// Keyboard Shortcuts Help Modal
// ============================================================================

export function formatShortcut(shortcut: ShortcutAction): string {
  const parts: string[] = [];
  
  if (shortcut.ctrl) parts.push("Ctrl");
  if (shortcut.alt) parts.push("Alt");
  if (shortcut.shift) parts.push("Shift");
  if (shortcut.meta) parts.push("⌘");
  
  // Format key nicely
  let key = shortcut.key;
  if (key === " ") key = "Space";
  else if (key.length === 1) key = key.toUpperCase();
  
  parts.push(key);
  
  return parts.join(" + ");
}

