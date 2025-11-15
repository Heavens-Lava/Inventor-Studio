import { useState, useEffect, useCallback } from 'react';

export interface GoalMap {
  id: string;
  name: string;
  createdAt: string;
  lastModified: string;
  nodeCount: number;
}

const MAPS_STORAGE_KEY = 'goal-maps-list';
const ACTIVE_MAP_KEY = 'active-goal-map-id';
const DEFAULT_MAP_ID = 'default';

/**
 * Hook for managing the list of goal maps
 */
export function useGoalMapList() {
  const [maps, setMaps] = useState<GoalMap[]>([]);
  const [activeMapId, setActiveMapId] = useState<string>(DEFAULT_MAP_ID);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load maps list and active map from localStorage
  useEffect(() => {
    try {
      // Load maps list
      const storedMaps = localStorage.getItem(MAPS_STORAGE_KEY);
      if (storedMaps) {
        const parsedMaps: GoalMap[] = JSON.parse(storedMaps);
        setMaps(parsedMaps);
        console.log('[useGoalMapList] Loaded maps:', parsedMaps.length);
      } else {
        // Create default map if none exist
        const defaultMap: GoalMap = {
          id: DEFAULT_MAP_ID,
          name: 'My Goal Map',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          nodeCount: 0,
        };
        setMaps([defaultMap]);
        localStorage.setItem(MAPS_STORAGE_KEY, JSON.stringify([defaultMap]));
        console.log('[useGoalMapList] Created default map');
      }

      // Load active map ID
      const storedActiveId = localStorage.getItem(ACTIVE_MAP_KEY);
      if (storedActiveId) {
        setActiveMapId(storedActiveId);
        console.log('[useGoalMapList] Active map:', storedActiveId);
      } else {
        setActiveMapId(DEFAULT_MAP_ID);
        localStorage.setItem(ACTIVE_MAP_KEY, DEFAULT_MAP_ID);
      }
    } catch (error) {
      console.error('[useGoalMapList] Error loading:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save maps list to localStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(MAPS_STORAGE_KEY, JSON.stringify(maps));
      console.log('[useGoalMapList] Saved maps:', maps.length);
    } catch (error) {
      console.error('[useGoalMapList] Error saving maps:', error);
    }
  }, [maps, isLoaded]);

  /**
   * Create a new map
   */
  const createMap = useCallback((name: string, autoSwitch: boolean = false) => {
    const newMap: GoalMap = {
      id: `map-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      nodeCount: 0,
    };

    setMaps((prev) => [...prev, newMap]);
    console.log('[useGoalMapList] Creating new map:', newMap.id, 'autoSwitch:', autoSwitch);

    if (autoSwitch) {
      console.log('[useGoalMapList] Auto-switching to new map:', newMap.id);
      setActiveMapId(newMap.id);
      localStorage.setItem(ACTIVE_MAP_KEY, newMap.id);
    }

    return newMap;
  }, []);

  /**
   * Delete a map
   */
  const deleteMap = useCallback((mapId: string) => {
    if (mapId === DEFAULT_MAP_ID) {
      console.warn('[useGoalMapList] Cannot delete default map');
      return false;
    }

    setMaps((prev) => {
      const filtered = prev.filter((m) => m.id !== mapId);

      // If we're deleting the active map, switch to default
      if (mapId === activeMapId) {
        setActiveMapId(DEFAULT_MAP_ID);
        localStorage.setItem(ACTIVE_MAP_KEY, DEFAULT_MAP_ID);
      }

      // Clean up localStorage for this map
      localStorage.removeItem(`goalmap_nodes_${mapId}`);
      localStorage.removeItem(`goalmap_edges_${mapId}`);
      localStorage.removeItem(`goalmap_viewport_${mapId}`);

      return filtered;
    });

    console.log('[useGoalMapList] Deleted map:', mapId);
    return true;
  }, [activeMapId]);

  /**
   * Rename a map
   */
  const renameMap = useCallback((mapId: string, newName: string) => {
    setMaps((prev) =>
      prev.map((m) =>
        m.id === mapId
          ? { ...m, name: newName, lastModified: new Date().toISOString() }
          : m
      )
    );
    console.log('[useGoalMapList] Renamed map:', mapId, 'to:', newName);
  }, []);

  /**
   * Update map metadata (node count, last modified)
   */
  const updateMapMetadata = useCallback((mapId: string, updates: Partial<Omit<GoalMap, 'id' | 'createdAt'>>) => {
    setMaps((prev) =>
      prev.map((m) =>
        m.id === mapId
          ? { ...m, ...updates, lastModified: new Date().toISOString() }
          : m
      )
    );
  }, []);

  /**
   * Switch to a different map
   */
  const switchToMap = useCallback((mapId: string) => {
    console.log('[useGoalMapList] Switching to map:', mapId);
    setActiveMapId(mapId);
    localStorage.setItem(ACTIVE_MAP_KEY, mapId);
  }, []);

  /**
   * Get the current active map
   */
  const activeMap = maps.find((m) => m.id === activeMapId);

  return {
    maps,
    activeMapId,
    activeMap,
    isLoaded,
    createMap,
    deleteMap,
    renameMap,
    updateMapMetadata,
    switchToMap,
  };
}
