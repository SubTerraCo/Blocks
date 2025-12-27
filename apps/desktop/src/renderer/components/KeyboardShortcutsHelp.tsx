// ============================================================================
// BLOCKS Desktop - Keyboard Shortcuts Help Modal
// Display available keyboard shortcuts
// ============================================================================

import { X, Keyboard } from "lucide-react";
import { formatShortcut } from "../hooks/useKeyboardShortcuts";

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
}

interface ShortcutsMap {
  [category: string]: ShortcutAction[];
}

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: ShortcutsMap;
}

// ============================================================================
// Component
// ============================================================================

export function KeyboardShortcutsHelp({
  isOpen,
  onClose,
  shortcuts,
}: KeyboardShortcutsHelpProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-bg-secondary border border-border-default shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <div className="flex items-center gap-3">
            <Keyboard className="h-5 w-5 text-accent-magenta" />
            <h2 className="text-lg font-semibold text-text-primary">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto space-y-6">
          {Object.entries(shortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-sm text-text-secondary">
                      {shortcut.description}
                    </span>
                    <kbd className="px-2 py-1 rounded bg-bg-tertiary border border-border-default text-xs font-mono text-text-primary">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 border-t border-border-default bg-bg-tertiary/50">
          <p className="text-xs text-text-muted text-center">
            Press <kbd className="px-1 py-0.5 rounded bg-bg-tertiary text-text-secondary">?</kbd> to toggle this help
          </p>
        </div>
      </div>
    </div>
  );
}

