import { useCallback } from 'react';
import { GoalMapNode, GoalMapEdge, GoalMapViewport } from './useGoalMapStorage';

interface MapBackupData {
  version: string;
  mapId: string;
  mapName: string;
  description?: string;
  nodes: GoalMapNode[];
  edges: GoalMapEdge[];
  viewport: GoalMapViewport;
  createdAt: string;
  backupDate: string;
}

export function useMapBackup() {
  /**
   * Export current map data as a JSON file
   */
  const exportBackup = useCallback((
    mapId: string,
    mapName: string,
    description: string | undefined,
    nodes: GoalMapNode[],
    edges: GoalMapEdge[],
    viewport: GoalMapViewport
  ) => {
    const backupData: MapBackupData = {
      version: '1.0',
      mapId,
      mapName,
      description,
      nodes,
      edges,
      viewport,
      createdAt: new Date().toISOString(),
      backupDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${mapName.replace(/\s+/g, '_')}_backup_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  /**
   * Import map data from a JSON backup file
   */
  const importBackup = useCallback((): Promise<MapBackupData> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';

      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string) as MapBackupData;

            // Validate backup data structure
            if (!data.nodes || !data.edges || !data.viewport) {
              throw new Error('Invalid backup file format');
            }

            resolve(data);
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      };

      input.click();
    });
  }, []);

  return {
    exportBackup,
    importBackup,
  };
}
