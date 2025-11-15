import { useState, useEffect, useCallback } from 'react';

export interface GoalMapMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  lastModified: Date;
  nodeCount: number;
}

const GOAL_MAPS_LIST_KEY = 'goalmap_list';
const ACTIVE_MAP_KEY = 'goalmap_active';
const DEFAULT_MAP_ID = 'default';

/**
 * Hook for managing multiple goal maps
 */
export function useGoalMapList() {
  const [maps, setMaps] = useState<GoalMapMetadata[]>([]);
  const [activeMapId, setActiveMapId] = useState<string>(DEFAULT_MAP_ID);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load maps from localStorage
  useEffect(() => {
    try {
      const storedMaps = localStorage.getItem(GOAL_MAPS_LIST_KEY);
      const storedActiveId = localStorage.getItem(ACTIVE_MAP_KEY);

      if (storedMaps) {
        const parsedMaps = JSON.parse(storedMaps);
        setMaps(parsedMaps);
      } else {
        // Create default map if none exists
        const defaultMap: GoalMapMetadata = {
          id: DEFAULT_MAP_ID,
          name: 'My Goal Map',
          createdAt: new Date(),
          lastModified: new Date(),
          nodeCount: 0,
        };
        setMaps([defaultMap]);
        localStorage.setItem(GOAL_MAPS_LIST_KEY, JSON.stringify([defaultMap]));
      }

      if (storedActiveId) {
        setActiveMapId(storedActiveId);
      }

      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading goal maps list:', error);
      setIsLoaded(true);
    }
  }, []);

  // Save maps to localStorage whenever they change
  const saveMaps = useCallback((updatedMaps: GoalMapMetadata[]) => {
    try {
      localStorage.setItem(GOAL_MAPS_LIST_KEY, JSON.stringify(updatedMaps));
      setMaps(updatedMaps);
    } catch (error) {
      console.error('Error saving goal maps list:', error);
    }
  }, []);

  // Create a new goal map
  const createMap = useCallback((name: string, description?: string) => {
    const newMap: GoalMapMetadata = {
      id: `map-${Date.now()}`,
      name,
      description,
      createdAt: new Date(),
      lastModified: new Date(),
      nodeCount: 0,
    };

    const updatedMaps = [...maps, newMap];
    saveMaps(updatedMaps);
    return newMap.id;
  }, [maps, saveMaps]);

  // Delete a goal map
  const deleteMap = useCallback((mapId: string) => {
    if (mapId === DEFAULT_MAP_ID && maps.length === 1) {
      // Don't allow deleting the last map
      return false;
    }

    // Delete the map data from localStorage
    localStorage.removeItem(`goalmap_nodes_${mapId}`);
    localStorage.removeItem(`goalmap_edges_${mapId}`);
    localStorage.removeItem(`goalmap_viewport_${mapId}`);

    const updatedMaps = maps.filter((m) => m.id !== mapId);
    saveMaps(updatedMaps);

    // If deleting active map, switch to first available map
    if (mapId === activeMapId) {
      const newActiveId = updatedMaps[0]?.id || DEFAULT_MAP_ID;
      setActiveMapId(newActiveId);
      localStorage.setItem(ACTIVE_MAP_KEY, newActiveId);
    }

    return true;
  }, [maps, activeMapId, saveMaps]);

  // Rename a goal map
  const renameMap = useCallback((mapId: string, newName: string, newDescription?: string) => {
    const updatedMaps = maps.map((m) =>
      m.id === mapId
        ? { ...m, name: newName, description: newDescription, lastModified: new Date() }
        : m
    );
    saveMaps(updatedMaps);
  }, [maps, saveMaps]);

  // Update map metadata (e.g., node count)
  const updateMapMetadata = useCallback((mapId: string, updates: Partial<GoalMapMetadata>) => {
    const updatedMaps = maps.map((m) =>
      m.id === mapId
        ? { ...m, ...updates, lastModified: new Date() }
        : m
    );
    saveMaps(updatedMaps);
  }, [maps, saveMaps]);

  // Set active map
  const setActiveMap = useCallback((mapId: string) => {
    setActiveMapId(mapId);
    localStorage.setItem(ACTIVE_MAP_KEY, mapId);
  }, []);

  // Duplicate a map
  const duplicateMap = useCallback((mapId: string, newName: string) => {
    const sourceMapsData = {
      nodes: localStorage.getItem(`goalmap_nodes_${mapId}`),
      edges: localStorage.getItem(`goalmap_edges_${mapId}`),
      viewport: localStorage.getItem(`goalmap_viewport_${mapId}`),
    };

    const newMapId = `map-${Date.now()}`;

    // Copy data to new map
    if (sourceMapsData.nodes) {
      localStorage.setItem(`goalmap_nodes_${newMapId}`, sourceMapsData.nodes);
    }
    if (sourceMapsData.edges) {
      localStorage.setItem(`goalmap_edges_${newMapId}`, sourceMapsData.edges);
    }
    if (sourceMapsData.viewport) {
      localStorage.setItem(`goalmap_viewport_${newMapId}`, sourceMapsData.viewport);
    }

    // Create metadata
    const sourceMap = maps.find((m) => m.id === mapId);
    const newMap: GoalMapMetadata = {
      id: newMapId,
      name: newName,
      description: sourceMap?.description,
      createdAt: new Date(),
      lastModified: new Date(),
      nodeCount: sourceMap?.nodeCount || 0,
    };

    const updatedMaps = [...maps, newMap];
    saveMaps(updatedMaps);
    return newMapId;
  }, [maps, saveMaps]);

  return {
    maps,
    activeMapId,
    isLoaded,
    createMap,
    deleteMap,
    renameMap,
    updateMapMetadata,
    setActiveMap,
    duplicateMap,
  };
}
