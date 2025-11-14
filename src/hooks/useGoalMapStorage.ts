import { useState, useEffect, useCallback, useRef } from 'react';
import { addEdge, Connection, Edge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from 'reactflow';
import {
  GoalMapNode,
  GoalMapEdge,
  GoalMapData,
  GoalNodeData,
  MilestoneNodeData,
  RequirementNodeData,
  NoteNodeData,
  NodeData,
  GoalMapEdgeData,
  defaultViewport,
  GoalMapViewport,
} from '@/types/goalMap';
import { Goal } from '@/types/goal';

const STORAGE_KEY = 'daily-haven-goal-map';
const MAX_HISTORY = 50; // Maximum undo/redo history

interface HistoryState {
  nodes: GoalMapNode[];
  edges: GoalMapEdge[];
}

/**
 * Hook for managing goal map data with localStorage persistence
 */
export function useGoalMapStorage() {
  const [nodes, setNodes] = useState<GoalMapNode[]>([]);
  const [edges, setEdges] = useState<GoalMapEdge[]>([]);
  const [viewport, setViewport] = useState<GoalMapViewport>(defaultViewport);
  const [isLoaded, setIsLoaded] = useState(false);

  // Undo/Redo state
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoAction = useRef(false);

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data: GoalMapData = JSON.parse(stored);
          setNodes(data.nodes || []);
          setEdges(data.edges || []);
          setViewport(data.viewport || defaultViewport);
          // Initialize history with current state
          setHistory([{ nodes: data.nodes || [], edges: data.edges || [] }]);
          setHistoryIndex(0);
        } else {
          // Initialize empty history
          setHistory([{ nodes: [], edges: [] }]);
          setHistoryIndex(0);
        }
      } catch (error) {
        console.error('Error loading goal map data:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return;

    const data: GoalMapData = {
      nodes,
      edges,
      viewport,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving goal map data:', error);
    }
  }, [nodes, edges, viewport, isLoaded]);

  // Save to history when nodes or edges change (but not during undo/redo)
  useEffect(() => {
    if (!isLoaded || isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }

    const newState: HistoryState = { nodes, edges };

    setHistory((prev) => {
      // Remove any future history if we're not at the end
      const newHistory = prev.slice(0, historyIndex + 1);
      // Add new state
      newHistory.push(newState);
      // Limit history size
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });

    setHistoryIndex((prev) => {
      const newIndex = prev + 1;
      return newIndex >= MAX_HISTORY ? MAX_HISTORY - 1 : newIndex;
    });
  }, [nodes, edges, isLoaded, historyIndex]);

  /**
   * Undo the last action
   */
  const undo = useCallback(() => {
    if (historyIndex <= 0) return false;

    isUndoRedoAction.current = true;
    const prevState = history[historyIndex - 1];
    setNodes(prevState.nodes);
    setEdges(prevState.edges);
    setHistoryIndex((prev) => prev - 1);
    return true;
  }, [history, historyIndex]);

  /**
   * Redo the last undone action
   */
  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return false;

    isUndoRedoAction.current = true;
    const nextState = history[historyIndex + 1];
    setNodes(nextState.nodes);
    setEdges(nextState.edges);
    setHistoryIndex((prev) => prev + 1);
    return true;
  }, [history, historyIndex]);

  /**
   * Add a new goal node to the canvas
   */
  const addGoalNode = useCallback((goal: Goal, position: { x: number; y: number }) => {
    const newNode: GoalMapNode = {
      id: goal.id,
      type: 'goalCard',
      position,
      data: {
        nodeType: 'goal',
        goalId: goal.id,
        title: goal.title,
        description: goal.description,
        type: goal.type,
        status: goal.status,
        priority: goal.priority,
        progress: goal.progress,
        category: goal.category,
        tags: goal.tags,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    return newNode;
  }, []);

  /**
   * Add a new milestone node to the canvas
   */
  const addMilestoneNode = useCallback((
    data: Omit<MilestoneNodeData, 'nodeType'>,
    position: { x: number; y: number }
  ) => {
    const id = `milestone-${Date.now()}`;
    const newNode: GoalMapNode = {
      id,
      type: 'milestoneCard',
      position,
      data: {
        nodeType: 'milestone',
        ...data,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    return newNode;
  }, []);

  /**
   * Add a new requirement node to the canvas
   */
  const addRequirementNode = useCallback((
    data: Omit<RequirementNodeData, 'nodeType'>,
    position: { x: number; y: number }
  ) => {
    const id = `requirement-${Date.now()}`;
    const newNode: GoalMapNode = {
      id,
      type: 'requirementCard',
      position,
      data: {
        nodeType: 'requirement',
        ...data,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    return newNode;
  }, []);

  /**
   * Add a new note node to the canvas
   */
  const addNoteNode = useCallback((
    data: Omit<NoteNodeData, 'nodeType'>,
    position: { x: number; y: number }
  ) => {
    const id = `note-${Date.now()}`;
    const newNode: GoalMapNode = {
      id,
      type: 'noteCard',
      position,
      data: {
        nodeType: 'note',
        ...data,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    return newNode;
  }, []);

  /**
   * Remove a node from the canvas
   */
  const removeNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    // Also remove any edges connected to this node
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, []);

  /**
   * Update a node's data
   */
  const updateNode = useCallback((nodeId: string, data: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, ...data },
          };
        }
        return node;
      })
    );
  }, []);

  /**
   * Handle node changes (drag, select, etc.)
   */
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  /**
   * Handle edge changes
   */
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  /**
   * Handle new connections
   */
  const onConnect = useCallback((connection: Connection) => {
    const newEdge: GoalMapEdge = {
      ...connection,
      id: `${connection.source}-${connection.target}-${Date.now()}`,
      type: 'smoothstep',
      animated: true,
      data: {
        relationshipType: 'related',
      },
    } as GoalMapEdge;

    setEdges((eds) => addEdge(newEdge, eds));
  }, []);

  /**
   * Update an edge's data
   */
  const updateEdge = useCallback((edgeId: string, data: Partial<GoalMapEdgeData>) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === edgeId) {
          return {
            ...edge,
            data: { ...edge.data, ...data },
          };
        }
        return edge;
      })
    );
  }, []);

  /**
   * Remove an edge
   */
  const removeEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
  }, []);

  /**
   * Update viewport (zoom/pan position)
   */
  const updateViewport = useCallback((newViewport: GoalMapViewport) => {
    setViewport(newViewport);
  }, []);

  /**
   * Check if a goal is already on the canvas
   */
  const hasGoalNode = useCallback((goalId: string) => {
    return nodes.some((node) => node.id === goalId);
  }, [nodes]);

  /**
   * Get all goal IDs that are on the canvas
   */
  const getCanvasGoalIds = useCallback(() => {
    return nodes
      .filter((node) => node.data.nodeType === 'goal')
      .map((node) => (node.data as GoalNodeData).goalId);
  }, [nodes]);

  /**
   * Clear all nodes and edges
   */
  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setViewport(defaultViewport);
  }, []);

  /**
   * Sync node data with updated goal data
   */
  const syncNodeWithGoal = useCallback((goal: Goal) => {
    updateNode(goal.id, {
      nodeType: 'goal',
      goalId: goal.id,
      title: goal.title,
      description: goal.description,
      type: goal.type,
      status: goal.status,
      priority: goal.priority,
      progress: goal.progress,
      category: goal.category,
      tags: goal.tags,
    } as GoalNodeData);
  }, [updateNode]);

  /**
   * Duplicate a node
   */
  const duplicateNode = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return null;

    // Generate new ID and offset position
    const timestamp = Date.now();
    const newId = `${node.type}-${timestamp}`;
    const newNode: GoalMapNode = {
      ...node,
      id: newId,
      position: {
        x: node.position.x + 30,
        y: node.position.y + 30,
      },
      data: {
        ...node.data,
        // For non-goal nodes, update the title to indicate it's a copy
        title: node.data.nodeType === 'goal'
          ? node.data.title
          : `${node.data.title} (Copy)`,
      },
      selected: false,
    };

    setNodes((nds) => [...nds, newNode]);
    return newNode;
  }, [nodes]);

  /**
   * Bulk delete nodes
   */
  const bulkDeleteNodes = useCallback((nodeIds: string[]) => {
    setNodes((nds) => nds.filter((node) => !nodeIds.includes(node.id)));
    // Also remove any edges connected to these nodes
    setEdges((eds) =>
      eds.filter((edge) => !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target))
    );
  }, []);

  /**
   * Get selected nodes
   */
  const getSelectedNodes = useCallback(() => {
    return nodes.filter((node) => node.selected);
  }, [nodes]);

  /**
   * Check if can undo
   */
  const canUndo = historyIndex > 0;

  /**
   * Check if can redo
   */
  const canRedo = historyIndex < history.length - 1;

  return {
    nodes,
    edges,
    viewport,
    isLoaded,
    addGoalNode,
    addMilestoneNode,
    addRequirementNode,
    addNoteNode,
    removeNode,
    updateNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    updateEdge,
    removeEdge,
    updateViewport,
    hasGoalNode,
    getCanvasGoalIds,
    clearCanvas,
    syncNodeWithGoal,
    undo,
    redo,
    canUndo,
    canRedo,
    duplicateNode,
    bulkDeleteNodes,
    getSelectedNodes,
  };
}
