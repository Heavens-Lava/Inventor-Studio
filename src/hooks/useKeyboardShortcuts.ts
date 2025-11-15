import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

/**
 * Hook for managing keyboard shortcuts
 * Handles key press events and triggers associated actions
 */
export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          event.stopPropagation();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);

  return {
    shortcuts,
  };
}

/**
 * Common keyboard shortcuts for goal map
 */
export const createGoalMapShortcuts = (handlers: {
  onUndo: () => void;
  onRedo: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onFitView: () => void;
}): KeyboardShortcut[] => [
  {
    key: 'z',
    ctrl: true,
    description: 'Undo',
    action: handlers.onUndo,
  },
  {
    key: 'z',
    ctrl: true,
    shift: true,
    description: 'Redo',
    action: handlers.onRedo,
  },
  {
    key: 'y',
    ctrl: true,
    description: 'Redo (alternative)',
    action: handlers.onRedo,
  },
  {
    key: 'd',
    ctrl: true,
    description: 'Duplicate selected',
    action: handlers.onDuplicate,
  },
  {
    key: 'Delete',
    description: 'Delete selected',
    action: handlers.onDelete,
  },
  {
    key: 'Backspace',
    description: 'Delete selected (alternative)',
    action: handlers.onDelete,
  },
  {
    key: 'a',
    ctrl: true,
    description: 'Select all',
    action: handlers.onSelectAll,
  },
  {
    key: 'Escape',
    description: 'Clear selection',
    action: handlers.onClearSelection,
  },
  {
    key: 'f',
    ctrl: true,
    description: 'Fit view',
    action: handlers.onFitView,
  },
];
