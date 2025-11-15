import { useState, useCallback } from 'react';
import { GoalMapNode, GoalMapEdge } from '@/types/goalMap';

export interface HistoryState {
  nodes: GoalMapNode[];
  edges: GoalMapEdge[];
}

interface UseUndoRedoReturn {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => HistoryState | null;
  redo: () => HistoryState | null;
  pushHistory: (state: HistoryState) => void;
  clearHistory: () => void;
}

const MAX_HISTORY_SIZE = 50;

/**
 * Hook for managing undo/redo history for the goal map
 */
export function useUndoRedo(): UseUndoRedoReturn {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  /**
   * Add a new state to the history
   */
  const pushHistory = useCallback((state: HistoryState) => {
    setHistory((prev) => {
      // Remove any "future" states if we're not at the end
      const newHistory = prev.slice(0, currentIndex + 1);

      // Add the new state
      newHistory.push({
        nodes: JSON.parse(JSON.stringify(state.nodes)),
        edges: JSON.parse(JSON.stringify(state.edges)),
      });

      // Limit history size
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
        return newHistory;
      }

      return newHistory;
    });

    setCurrentIndex((prev) => {
      const newIndex = Math.min(prev + 1, MAX_HISTORY_SIZE - 1);
      return newIndex;
    });
  }, [currentIndex]);

  /**
   * Undo the last change
   */
  const undo = useCallback((): HistoryState | null => {
    if (!canUndo) return null;

    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    return history[newIndex];
  }, [canUndo, currentIndex, history]);

  /**
   * Redo the last undone change
   */
  const redo = useCallback((): HistoryState | null => {
    if (!canRedo) return null;

    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    return history[newIndex];
  }, [canRedo, currentIndex, history]);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    pushHistory,
    clearHistory,
  };
}
