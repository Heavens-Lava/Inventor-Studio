import { useState, useEffect, useCallback, useRef } from 'react';
import { addEdge, Connection, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from 'reactflow';
import {
  GoalMapNode,
  GoalMapEdge,
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

/**
 * Hook for managing goal map data with localStorage persistence
 * Supports multiple maps with proper state synchronization
 */
export function useGoalMapStorage(mapId: string = 'default') {
  const [nodes, setNodes] = useState<GoalMapNode[]>([]);
  const [edges, setEdges] = useState<GoalMapEdge[]>([]);
  const [viewport, setViewport] = useState<GoalMapViewport>(defaultViewport);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const loadedMapIdRef = useRef<string | null>(null);

  console.log('[useGoalMapStorage] mapId:', mapId, 'loadedMapId:', loadedMapIdRef.current, 'needsLoad:', mapId !== loadedMapIdRef.current, 'isLoaded:', isLoaded);

  // Load data from localStorage when mapId changes
  useEffect(() => {
    const needsLoad = mapId !== loadedMapIdRef.current;

    if (!needsLoad) {
      console.log('[Load] Skipping load - already loaded map', mapId);
      return;
    }

    console.log('[Load] Starting load for map', mapId, '(was', loadedMapIdRef.current, ')');

    // CRITICAL FIX: Set switching flag and clear state IMMEDIATELY
    // This prevents the old state from being saved to the new map
    setIsSwitching(true);
    setIsLoaded(false);

    // Clear state immediately to prevent UI from showing old data
    setNodes([]);
    setEdges([]);
    setViewport(defaultViewport);

    // Small delay to ensure state is cleared before loading
    const timeoutId = setTimeout(() => {
      try {
        const nodesKey = `goalmap_nodes_${mapId}`;
        const edgesKey = `goalmap_edges_${mapId}`;
        const viewportKey = `goalmap_viewport_${mapId}`;

        console.log('[Load] localStorage keys:', { nodesKey, edgesKey, viewportKey });

        const storedNodes = localStorage.getItem(nodesKey);
        const storedEdges = localStorage.getItem(edgesKey);
        const storedViewport = localStorage.getItem(viewportKey);

        console.log('[Load] Raw localStorage data:', {
          nodes: storedNodes ? 'found' : 'empty',
          edges: storedEdges ? 'found' : 'empty',
          viewport: storedViewport ? 'found' : 'empty',
        });

        const loadedNodes = storedNodes ? JSON.parse(storedNodes) : [];
        const loadedEdges = storedEdges ? JSON.parse(storedEdges) : [];
        const loadedViewport = storedViewport ? JSON.parse(storedViewport) : defaultViewport;

        console.log('[Load] Parsed data for map', mapId + ':', loadedNodes.length, 'nodes,', loadedEdges.length, 'edges');
        console.log('[Load] Setting state:', { nodes: loadedNodes.length, edges: loadedEdges.length });

        // Set all state at once
        setNodes(loadedNodes);
        setEdges(loadedEdges);
        setViewport(loadedViewport);

        // Mark as loaded and done switching
        loadedMapIdRef.current = mapId;
        setIsLoaded(true);
        setIsSwitching(false);
      } catch (error) {
        console.error('[Load] Error loading goal map data:', error);
        setNodes([]);
        setEdges([]);
        setViewport(defaultViewport);
        loadedMapIdRef.current = mapId;
        setIsLoaded(true);
        setIsSwitching(false);
      }
    }, 50); // Small delay to ensure React has processed the clear

    return () => clearTimeout(timeoutId);
  }, [mapId]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    // CRITICAL FIX: Don't save if we're switching maps or not loaded yet
    if (!isLoaded || isSwitching) {
      if (isSwitching) {
        console.log('[Save] Blocked: Currently switching maps');
      }
      return;
    }

    console.log('[Save] Saving to map', mapId + ':', nodes.length, 'nodes,', edges.length, 'edges');

    try {
      const nodesKey = `goalmap_nodes_${mapId}`;
      const edgesKey = `goalmap_edges_${mapId}`;
      const viewportKey = `goalmap_viewport_${mapId}`;

      localStorage.setItem(nodesKey, JSON.stringify(nodes));
      localStorage.setItem(edgesKey, JSON.stringify(edges));
      localStorage.setItem(viewportKey, JSON.stringify(viewport));
    } catch (error) {
      console.error('[Save] Error saving goal map data:', error);
    }
  }, [nodes, edges, viewport, mapId, isLoaded, isSwitching]);

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

  return {
    nodes,
    edges,
    viewport,
    isLoaded,
    isSwitching,
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
  };
}
