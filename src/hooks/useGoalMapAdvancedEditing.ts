import { useCallback, useState } from 'react';
import { GoalMapNode, GoalMapEdge } from '@/types/goalMap';
import { useHistory } from './useHistory';

interface GoalMapState {
  nodes: GoalMapNode[];
  edges: GoalMapEdge[];
}

interface UseGoalMapAdvancedEditingProps {
  initialNodes: GoalMapNode[];
  initialEdges: GoalMapEdge[];
  onNodesChange: (nodes: GoalMapNode[]) => void;
  onEdgesChange: (edges: GoalMapEdge[]) => void;
}

/**
 * Hook for managing advanced editing features like undo/redo, bulk operations, and duplication
 */
export function useGoalMapAdvancedEditing({
  initialNodes,
  initialEdges,
  onNodesChange,
  onEdgesChange,
}: UseGoalMapAdvancedEditingProps) {
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());

  // Undo/Redo history
  const {
    state: historyState,
    setState: setHistoryState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<GoalMapState>({
    nodes: initialNodes,
    edges: initialEdges,
  });

  // Save current state to history
  const saveToHistory = useCallback(
    (nodes: GoalMapNode[], edges: GoalMapEdge[]) => {
      setHistoryState({ nodes, edges });
    },
    [setHistoryState]
  );

  // Apply history state to canvas
  const applyHistoryState = useCallback(
    (state: GoalMapState) => {
      onNodesChange(state.nodes);
      onEdgesChange(state.edges);
    },
    [onNodesChange, onEdgesChange]
  );

  // Undo with state application
  const performUndo = useCallback(() => {
    undo();
    applyHistoryState(historyState);
  }, [undo, applyHistoryState, historyState]);

  // Redo with state application
  const performRedo = useCallback(() => {
    redo();
    applyHistoryState(historyState);
  }, [redo, applyHistoryState, historyState]);

  // Toggle node selection
  const toggleNodeSelection = useCallback((nodeId: string) => {
    setSelectedNodeIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  // Select all nodes
  const selectAllNodes = useCallback((nodes: GoalMapNode[]) => {
    setSelectedNodeIds(new Set(nodes.map((n) => n.id)));
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedNodeIds(new Set());
  }, []);

  // Duplicate a single node
  const duplicateNode = useCallback(
    (node: GoalMapNode, nodes: GoalMapNode[]): GoalMapNode => {
      const newId = `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newNode: GoalMapNode = {
        ...node,
        id: newId,
        position: {
          x: node.position.x + 50,
          y: node.position.y + 50,
        },
        data: {
          ...node.data,
          title: `${node.data.title} (Copy)`,
        },
      };

      // Save to history before making changes
      saveToHistory(nodes, initialEdges);
      return newNode;
    },
    [saveToHistory, initialEdges]
  );

  // Duplicate selected nodes
  const duplicateSelectedNodes = useCallback(
    (nodes: GoalMapNode[]) => {
      if (selectedNodeIds.size === 0) return nodes;

      saveToHistory(nodes, initialEdges);

      const nodesToDuplicate = nodes.filter((n) => selectedNodeIds.has(n.id));
      const duplicates = nodesToDuplicate.map((node) => {
        const newId = `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return {
          ...node,
          id: newId,
          position: {
            x: node.position.x + 50,
            y: node.position.y + 50,
          },
          data: {
            ...node.data,
            title: `${node.data.title} (Copy)`,
          },
        };
      });

      return [...nodes, ...duplicates];
    },
    [selectedNodeIds, saveToHistory, initialEdges]
  );

  // Delete selected nodes
  const deleteSelectedNodes = useCallback(
    (nodes: GoalMapNode[], edges: GoalMapEdge[]) => {
      if (selectedNodeIds.size === 0) return { nodes, edges };

      saveToHistory(nodes, edges);

      const newNodes = nodes.filter((n) => !selectedNodeIds.has(n.id));
      const newEdges = edges.filter(
        (e) => !selectedNodeIds.has(e.source) && !selectedNodeIds.has(e.target)
      );

      setSelectedNodeIds(new Set());
      return { nodes: newNodes, edges: newEdges };
    },
    [selectedNodeIds, saveToHistory]
  );

  // Move selected nodes by offset
  const moveSelectedNodes = useCallback(
    (nodes: GoalMapNode[], offsetX: number, offsetY: number) => {
      if (selectedNodeIds.size === 0) return nodes;

      return nodes.map((node) => {
        if (selectedNodeIds.has(node.id)) {
          return {
            ...node,
            position: {
              x: node.position.x + offsetX,
              y: node.position.y + offsetY,
            },
          };
        }
        return node;
      });
    },
    [selectedNodeIds]
  );

  // Update data for selected nodes
  const updateSelectedNodes = useCallback(
    (nodes: GoalMapNode[], updates: Partial<GoalMapNode['data']>) => {
      if (selectedNodeIds.size === 0) return nodes;

      saveToHistory(nodes, initialEdges);

      return nodes.map((node) => {
        if (selectedNodeIds.has(node.id)) {
          return {
            ...node,
            data: {
              ...node.data,
              ...updates,
            },
          };
        }
        return node;
      });
    },
    [selectedNodeIds, saveToHistory, initialEdges]
  );

  return {
    // Selection
    selectedNodeIds,
    toggleNodeSelection,
    selectAllNodes,
    clearSelection,
    hasSelection: selectedNodeIds.size > 0,
    selectionCount: selectedNodeIds.size,

    // History
    undo: performUndo,
    redo: performRedo,
    canUndo,
    canRedo,
    saveToHistory,

    // Bulk operations
    duplicateNode,
    duplicateSelectedNodes,
    deleteSelectedNodes,
    moveSelectedNodes,
    updateSelectedNodes,
  };
}
