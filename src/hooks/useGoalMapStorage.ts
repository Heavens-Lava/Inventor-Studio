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

const OLD_STORAGE_KEY = 'daily-haven-goal-map';
const MIGRATION_FLAG_KEY = 'goalmap_migration_complete';

/**
 * Hook for managing goal map data with localStorage persistence
 * @param mapId - The ID of the goal map to manage
 */
export function useGoalMapStorage(mapId: string = 'default') {
  const [nodes, setNodes] = useState<GoalMapNode[]>([]);
  const [edges, setEdges] = useState<GoalMapEdge[]>([]);
  const [viewport, setViewport] = useState<GoalMapViewport>(defaultViewport);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadedMapId, setLoadedMapId] = useState<string | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(false);

  // Track if we're currently switching maps or need initial load
  const needsLoad = mapId !== loadedMapId;

  // Log state changes for debugging
  useEffect(() => {
    console.log(`[useGoalMapStorage] mapId: ${mapId}, loadedMapId: ${loadedMapId}, needsLoad: ${needsLoad}, isLoaded: ${isLoaded}, isLoadingMap: ${isLoadingMap}`);
  }, [mapId, loadedMapId, needsLoad, isLoaded, isLoadingMap]);

  // Load data from localStorage when mapId changes or on initial mount
  useEffect(() => {
    if (!needsLoad) {
      console.log(`[Load] Skipping load - already loaded map ${mapId}`);
      return; // Only load if we need to switch or haven't loaded yet
    }

    console.log(`[Load] Starting load for map ${mapId} (was ${loadedMapId})`);
    setIsLoadingMap(true); // Block all saves during load
    setIsLoaded(false);

    const NODES_KEY = `goalmap_nodes_${mapId}`;
    const EDGES_KEY = `goalmap_edges_${mapId}`;
    const VIEWPORT_KEY = `goalmap_viewport_${mapId}`;

    try {
      // Check if we need to migrate old data (only for default map)
      if (mapId === 'default') {
        const migrationComplete = localStorage.getItem(MIGRATION_FLAG_KEY);
        const oldData = localStorage.getItem(OLD_STORAGE_KEY);

        if (!migrationComplete && oldData) {
          try {
            const parsed: GoalMapData = JSON.parse(oldData);

            // Migrate to new storage format
            if (parsed.nodes) {
              localStorage.setItem(NODES_KEY, JSON.stringify(parsed.nodes));
            }
            if (parsed.edges) {
              localStorage.setItem(EDGES_KEY, JSON.stringify(parsed.edges));
            }
            if (parsed.viewport) {
              localStorage.setItem(VIEWPORT_KEY, JSON.stringify(parsed.viewport));
            }

            // Mark migration as complete
            localStorage.setItem(MIGRATION_FLAG_KEY, 'true');

            console.log('Successfully migrated old goal map data to new format');
          } catch (migrationError) {
            console.error('Error migrating old goal map data:', migrationError);
          }
        }
      }

      const storedNodes = localStorage.getItem(NODES_KEY);
      const storedEdges = localStorage.getItem(EDGES_KEY);
      const storedViewport = localStorage.getItem(VIEWPORT_KEY);

      console.log(`[Load] localStorage keys:`, { NODES_KEY, EDGES_KEY, VIEWPORT_KEY });
      console.log(`[Load] Raw localStorage data:`, {
        nodes: storedNodes,
        edges: storedEdges,
        viewport: storedViewport
      });

      const parsedNodes = storedNodes ? JSON.parse(storedNodes) : [];
      const parsedEdges = storedEdges ? JSON.parse(storedEdges) : [];

      console.log(`[Load] Parsed data for map ${mapId}: ${parsedNodes.length} nodes, ${parsedEdges.length} edges`);
      console.log(`[Load] Setting state:`, {
        nodes: parsedNodes,
        edges: parsedEdges,
        loadedMapId: mapId
      });

      setNodes(parsedNodes);
      setEdges(parsedEdges);
      setViewport(storedViewport ? JSON.parse(storedViewport) : defaultViewport);
      setLoadedMapId(mapId); // Mark this map as loaded
    } catch (error) {
      console.error('Error loading goal map data:', error);
      setNodes([]);
      setEdges([]);
      setViewport(defaultViewport);
      setLoadedMapId(mapId);
    } finally {
      setIsLoaded(true);
      // Use setTimeout to ensure state updates are processed before allowing saves
      setTimeout(() => {
        console.log(`[Load] Finished loading map ${mapId}, enabling saves`);
        setIsLoadingMap(false);
      }, 0);
    }
  }, [mapId, loadedMapId, needsLoad]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    // Don't save if not loaded, currently switching maps, or actively loading
    if (!isLoaded || needsLoad || isLoadingMap) {
      if (needsLoad) {
        console.log('[Save] Blocked: Currently switching maps');
      } else if (isLoadingMap) {
        console.log('[Save] Blocked: Map is loading');
      }
      return;
    }

    try {
      const NODES_KEY = `goalmap_nodes_${loadedMapId}`;
      const EDGES_KEY = `goalmap_edges_${loadedMapId}`;
      const VIEWPORT_KEY = `goalmap_viewport_${loadedMapId}`;

      console.log(`[Save] Saving to map ${loadedMapId}: ${nodes.length} nodes, ${edges.length} edges`);

      localStorage.setItem(NODES_KEY, JSON.stringify(nodes));
      localStorage.setItem(EDGES_KEY, JSON.stringify(edges));
      localStorage.setItem(VIEWPORT_KEY, JSON.stringify(viewport));
    } catch (error) {
      console.error('Error saving goal map data:', error);
    }
  }, [nodes, edges, viewport, isLoaded, needsLoad, isLoadingMap, loadedMapId]);

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

    const newId = `${node.type}-${Date.now()}`;
    const newNode: GoalMapNode = {
      ...node,
      id: newId,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
      data: {
        ...node.data,
        // Update title to indicate it's a copy
        title: `${node.data.title} (Copy)`,
      },
      selected: false,
    };

    setNodes((nds) => [...nds, newNode]);
    return newNode;
  }, [nodes]);

  /**
   * Duplicate multiple nodes
   */
  const duplicateNodes = useCallback((nodeIds: string[]) => {
    const newNodes: GoalMapNode[] = [];

    nodeIds.forEach((nodeId) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

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
        selected: false,
      };

      newNodes.push(newNode);
    });

    setNodes((nds) => [...nds, ...newNodes]);
    return newNodes;
  }, [nodes]);

  /**
   * Remove multiple nodes
   */
  const removeNodes = useCallback((nodeIds: string[]) => {
    setNodes((nds) => nds.filter((node) => !nodeIds.includes(node.id)));
    setEdges((eds) => eds.filter((edge) =>
      !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target)
    ));
  }, []);

  /**
   * Update multiple nodes
   */
  const updateNodes = useCallback((nodeIds: string[], data: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (nodeIds.includes(node.id)) {
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
   * Set nodes (used for undo/redo)
   */
  const setNodesState = useCallback((newNodes: GoalMapNode[]) => {
    setNodes(newNodes);
  }, []);

  /**
   * Set edges (used for undo/redo)
   */
  const setEdgesState = useCallback((newEdges: GoalMapEdge[]) => {
    setEdges(newEdges);
  }, []);

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
    removeNodes,
    updateNode,
    updateNodes,
    duplicateNode,
    duplicateNodes,
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
    setNodesState,
    setEdgesState,
  };
}
