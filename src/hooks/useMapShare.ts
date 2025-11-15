import { useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { toast } from 'sonner';
import { GoalMapNode, GoalMapEdge } from '@/types/goalMap';

interface ShareData {
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
}

export function useMapShare() {
  const encodeMapData = useCallback((name: string, description: string | undefined, nodes: GoalMapNode[], edges: GoalMapEdge[]): string => {
    const data: ShareData = {
      name,
      description,
      nodes,
      edges,
    };

    // Convert to JSON and compress with base64
    const json = JSON.stringify(data);
    const base64 = btoa(unescape(encodeURIComponent(json)));

    return base64;
  }, []);

  const decodeMapData = useCallback((encoded: string): ShareData | null => {
    try {
      const json = decodeURIComponent(escape(atob(encoded)));
      const data: ShareData = JSON.parse(json);
      return data;
    } catch (error) {
      console.error('Error decoding map data:', error);
      return null;
    }
  }, []);

  const generateShareLink = useCallback((name: string, description: string | undefined, nodes: GoalMapNode[], edges: GoalMapEdge[]): string => {
    const encoded = encodeMapData(name, description, nodes, edges);
    const url = new URL(window.location.href);
    url.searchParams.set('shared', encoded);
    url.searchParams.set('view', 'true');
    return url.toString();
  }, [encodeMapData]);

  const copyShareLink = useCallback(async (name: string, description: string | undefined, nodes: GoalMapNode[], edges: GoalMapEdge[]): Promise<boolean> => {
    try {
      const link = generateShareLink(name, description, nodes, edges);

      await navigator.clipboard.writeText(link);
      toast.success('Share link copied to clipboard!');
      return true;
    } catch (error) {
      console.error('Error copying share link:', error);
      toast.error('Failed to copy share link');
      return false;
    }
  }, [generateShareLink]);

  return {
    encodeMapData,
    decodeMapData,
    generateShareLink,
    copyShareLink,
  };
}
