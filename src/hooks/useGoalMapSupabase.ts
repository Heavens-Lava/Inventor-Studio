import { useState, useEffect, useCallback } from 'react';
import { addEdge, Connection, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from 'reactflow';
import {
  supabase,
  GoalMapDB,
  GoalMapNodeDB,
  GoalMapEdgeDB,
  GoalMapViewportDB,
} from '@/lib/supabase';
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
import { toast } from 'sonner';

// Helper functions to convert between app types and database types
const dbNodeToNode = (dbNode: GoalMapNodeDB): GoalMapNode => ({
  id: dbNode.id,
  type: dbNode.node_type,
  position: {
    x: dbNode.position_x,
    y: dbNode.position_y,
  },
  data: dbNode.data,
  width: dbNode.width,
  height: dbNode.height,
  selected: dbNode.selected,
  dragging: dbNode.dragging,
  positionAbsolute: {
    x: dbNode.position_x,
    y: dbNode.position_y,
  },
});

const nodeToDbNode = (node: GoalMapNode, userId: string, mapId: string): Partial<GoalMapNodeDB> => ({
  id: node.id,
  user_id: userId,
  map_id: mapId,
  node_type: node.type || 'goalCard',
  position_x: node.position.x,
  position_y: node.position.y,
  width: node.width,
  height: node.height,
  selected: node.selected || false,
  dragging: node.dragging || false,
  data: node.data,
});

const dbEdgeToEdge = (dbEdge: GoalMapEdgeDB): GoalMapEdge => ({
  id: dbEdge.id,
  source: dbEdge.source,
  sourceHandle: dbEdge.source_handle || null,
  target: dbEdge.target,
  targetHandle: dbEdge.target_handle || null,
  type: dbEdge.edge_type,
  animated: dbEdge.animated,
  style: dbEdge.style,
  selected: dbEdge.selected,
  data: dbEdge.data,
});

const edgeToDbEdge = (edge: GoalMapEdge, userId: string, mapId: string): Partial<GoalMapEdgeDB> => ({
  id: edge.id,
  user_id: userId,
  map_id: mapId,
  source: edge.source,
  source_handle: edge.sourceHandle || undefined,
  target: edge.target,
  target_handle: edge.targetHandle || undefined,
  edge_type: edge.type || 'smoothstep',
  animated: edge.animated || false,
  style: edge.style,
  selected: edge.selected || false,
  data: edge.data,
});

const dbViewportToViewport = (dbViewport: GoalMapViewportDB | null): GoalMapViewport => {
  if (!dbViewport) return defaultViewport;
  return {
    x: dbViewport.x,
    y: dbViewport.y,
    zoom: dbViewport.zoom,
  };
};

const viewportToDbViewport = (viewport: GoalMapViewport, userId: string, mapId: string): Partial<GoalMapViewportDB> => ({
  user_id: userId,
  map_id: mapId,
  x: viewport.x,
  y: viewport.y,
  zoom: viewport.zoom,
});

/**
 * Hook for managing goal map data with Supabase persistence
 * @param mapId - The ID of the goal map to manage
 */
export function useGoalMapSupabase(mapId: string = 'default') {
  const [nodes, setNodes] = useState<GoalMapNode[]>([]);
  const [edges, setEdges] = useState<GoalMapEdge[]>([]);
  const [viewport, setViewport] = useState<GoalMapViewport>(defaultViewport);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadedMapId, setLoadedMapId] = useState<string | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Track if we're currently switching maps or need initial load
  const needsLoad = mapId !== loadedMapId;

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Load data from Supabase when mapId changes or on initial mount
  useEffect(() => {
    if (!userId || !needsLoad) {
      console.log(`[Load] Skipping load - userId: ${userId}, needsLoad: ${needsLoad}`);
      return;
    }

    console.log(`[Load] Starting load for map ${mapId} (was ${loadedMapId})`);

    // Block saves and clear state IMMEDIATELY before loading
    setIsLoadingMap(true);
    setIsLoaded(false);

    // Clear the current state immediately to prevent old data from bleeding through
    setNodes([]);
    setEdges([]);
    setViewport(defaultViewport);

    const fetchData = async () => {
      try {
        // Ensure goal map exists
        const { data: mapData, error: mapError } = await supabase
          .from('goal_maps')
          .select('*')
          .eq('user_id', userId)
          .eq('map_id', mapId)
          .single();

        if (mapError && mapError.code === 'PGRST116') {
          // Map doesn't exist, create it
          const { error: createError } = await supabase
            .from('goal_maps')
            .insert({
              user_id: userId,
              map_id: mapId,
              map_name: 'My Goal Map',
              version: '1.0',
            });

          if (createError) throw createError;
        } else if (mapError) {
          throw mapError;
        }

        // Fetch nodes
        const { data: nodesData, error: nodesError } = await supabase
          .from('goal_map_nodes')
          .select('*')
          .eq('user_id', userId)
          .eq('map_id', mapId);

        if (nodesError) throw nodesError;

        const convertedNodes = (nodesData || []).map(dbNodeToNode);
        console.log(`[Load] Loaded ${convertedNodes.length} nodes for map ${mapId}`);
        setNodes(convertedNodes);

        // Fetch edges
        const { data: edgesData, error: edgesError } = await supabase
          .from('goal_map_edges')
          .select('*')
          .eq('user_id', userId)
          .eq('map_id', mapId);

        if (edgesError) throw edgesError;

        const convertedEdges = (edgesData || []).map(dbEdgeToEdge);
        console.log(`[Load] Loaded ${convertedEdges.length} edges for map ${mapId}`);
        setEdges(convertedEdges);

        // Fetch viewport
        const { data: viewportData, error: viewportError } = await supabase
          .from('goal_map_viewports')
          .select('*')
          .eq('user_id', userId)
          .eq('map_id', mapId)
          .single();

        if (viewportError && viewportError.code !== 'PGRST116') {
          throw viewportError;
        }

        setViewport(dbViewportToViewport(viewportData));
        setLoadedMapId(mapId); // Mark this map as loaded
      } catch (error: any) {
        console.error('Error loading goal map data:', error);
        toast.error('Failed to load goal map');
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
    };

    fetchData();
  }, [userId, mapId, loadedMapId, needsLoad]);

  // Save data to Supabase whenever it changes
  useEffect(() => {
    // Don't save if not loaded, currently switching maps, or actively loading
    if (!userId || !isLoaded || needsLoad || isLoadingMap) {
      return;
    }

    const saveData = async () => {
      try {
        // Save nodes
        // Delete all nodes for this map first, then insert new ones
        await supabase
          .from('goal_map_nodes')
          .delete()
          .eq('user_id', userId)
          .eq('map_id', loadedMapId!);

        if (nodes.length > 0) {
          const dbNodes = nodes.map(node => nodeToDbNode(node, userId, loadedMapId!));
          const { error: nodesError } = await supabase
            .from('goal_map_nodes')
            .insert(dbNodes);

          if (nodesError) throw nodesError;
        }

        // Save edges
        await supabase
          .from('goal_map_edges')
          .delete()
          .eq('user_id', userId)
          .eq('map_id', loadedMapId!);

        if (edges.length > 0) {
          const dbEdges = edges.map(edge => edgeToDbEdge(edge, userId, loadedMapId!));
          const { error: edgesError } = await supabase
            .from('goal_map_edges')
            .insert(dbEdges);

          if (edgesError) throw edgesError;
        }

        console.log(`[Save] Saved ${nodes.length} nodes, ${edges.length} edges to map ${loadedMapId}`);
      } catch (error: any) {
        console.error('Error saving goal map data:', error);
        toast.error('Failed to save goal map');
      }
    };

    // Debounce saves to avoid too many database writes
    const timeoutId = setTimeout(saveData, 1000);
    return () => clearTimeout(timeoutId);
  }, [nodes, edges, userId, isLoaded, needsLoad, isLoadingMap, loadedMapId]);

  // Save viewport separately (it changes very frequently during panning/zooming)
  useEffect(() => {
    if (!userId || !isLoaded || needsLoad || isLoadingMap) {
      return;
    }

    const saveViewport = async () => {
      try {
        const dbViewport = viewportToDbViewport(viewport, userId, loadedMapId!);

        // Use upsert to insert or update
        const { error } = await supabase
          .from('goal_map_viewports')
          .upsert(dbViewport, {
            onConflict: 'user_id,map_id',
          });

        if (error) throw error;
      } catch (error: any) {
        console.error('Error saving viewport:', error);
      }
    };

    // Debounce viewport saves even more aggressively
    const timeoutId = setTimeout(saveViewport, 2000);
    return () => clearTimeout(timeoutId);
  }, [viewport, userId, isLoaded, needsLoad, isLoadingMap, loadedMapId]);

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
