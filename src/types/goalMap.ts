import { Node, Edge } from 'reactflow';

/**
 * Goal Map Node Data
 * Represents a goal card on the canvas
 */
export interface GoalMapNodeData {
  goalId: string;
  title: string;
  description?: string;
  type: 'major' | 'minor';
  status: 'not-started' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  category?: string;
  tags: string[];
}

/**
 * Goal Map Node
 * Extends React Flow Node with our custom data
 */
export type GoalMapNode = Node<GoalMapNodeData>;

/**
 * Goal Map Edge Data
 * Represents connections between goals
 */
export interface GoalMapEdgeData {
  label?: string;
  relationshipType?: 'depends-on' | 'leads-to' | 'related' | 'blocks';
}

/**
 * Goal Map Edge
 * Extends React Flow Edge with our custom data
 */
export type GoalMapEdge = Edge<GoalMapEdgeData>;

/**
 * Goal Map Viewport
 * Stores the current zoom and pan position
 */
export interface GoalMapViewport {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Goal Map Data
 * Complete goal map state
 */
export interface GoalMapData {
  nodes: GoalMapNode[];
  edges: GoalMapEdge[];
  viewport?: GoalMapViewport;
}

/**
 * Connection Mode
 * Different types of connections available
 */
export type ConnectionMode = 'depends-on' | 'leads-to' | 'related' | 'blocks';

/**
 * Edge styles based on relationship type
 */
export const edgeStyles = {
  'depends-on': {
    stroke: '#ef4444',
    strokeWidth: 2,
    label: 'Depends On',
  },
  'leads-to': {
    stroke: '#3b82f6',
    strokeWidth: 2,
    label: 'Leads To',
  },
  'related': {
    stroke: '#8b5cf6',
    strokeWidth: 2,
    label: 'Related',
  },
  'blocks': {
    stroke: '#f59e0b',
    strokeWidth: 2,
    label: 'Blocks',
  },
};

/**
 * Default viewport settings
 */
export const defaultViewport: GoalMapViewport = {
  x: 0,
  y: 0,
  zoom: 1,
};
