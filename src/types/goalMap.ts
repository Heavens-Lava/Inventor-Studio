import { Node, Edge } from 'reactflow';

/**
 * Base Node Data
 * Common properties for all node types
 */
export interface BaseNodeData {
  nodeType: 'goal' | 'milestone' | 'requirement' | 'note';
  title: string;
  description?: string;
  emoji?: string;
}

/**
 * Goal Node Data
 * Represents a goal card on the canvas
 */
export interface GoalNodeData extends BaseNodeData {
  nodeType: 'goal';
  goalId: string;
  type: 'major' | 'minor';
  status: 'not-started' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  category?: string;
  tags: string[];
}

/**
 * Milestone Node Data
 * Represents a milestone card on the canvas
 */
export interface MilestoneNodeData extends BaseNodeData {
  nodeType: 'milestone';
  targetDate?: Date | string;
  completed: boolean;
  completedDate?: Date | string;
  color?: string;
}

/**
 * Requirement Node Data
 * Represents a requirement/resource card on the canvas
 */
export interface RequirementNodeData extends BaseNodeData {
  nodeType: 'requirement';
  requirementType: 'skill' | 'resource' | 'tool' | 'knowledge';
  completed: boolean;
  cost?: number;
  priority?: 'low' | 'medium' | 'high';
}

/**
 * Note Node Data
 * Represents a freeform note card on the canvas
 */
export interface NoteNodeData extends BaseNodeData {
  nodeType: 'note';
  content: string;
  color?: string;
  tags?: string[];
}

/**
 * Union type for all node data types
 */
export type NodeData = GoalNodeData | MilestoneNodeData | RequirementNodeData | NoteNodeData;

/**
 * Goal Map Node
 * Extends React Flow Node with our custom data
 */
export type GoalMapNode = Node<NodeData>;

/**
 * Goal Map Edge Data
 * Represents connections between goals
 */
export interface GoalMapEdgeData {
  label?: string;
  relationshipType?: 'depends-on' | 'leads-to' | 'related' | 'blocks';
  animationDirection?: 'forward' | 'reverse';
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
export type ConnectionMode = 'depends-on' | 'leads-to' | 'related' | 'blocks' | 'requires' | 'contributes-to';

/**
 * Edge styles based on relationship type
 */
export const edgeStyles = {
  'depends-on': {
    stroke: '#ef4444',
    strokeWidth: 2,
    label: 'Depends On',
    animated: true,
  },
  'leads-to': {
    stroke: '#3b82f6',
    strokeWidth: 2,
    label: 'Leads To',
    animated: false,
  },
  'related': {
    stroke: '#8b5cf6',
    strokeWidth: 2,
    label: 'Related',
    animated: false,
  },
  'blocks': {
    stroke: '#f59e0b',
    strokeWidth: 2,
    label: 'Blocks',
    animated: true,
  },
  'requires': {
    stroke: '#10b981',
    strokeWidth: 2,
    label: 'Requires',
    animated: false,
  },
  'contributes-to': {
    stroke: '#06b6d4',
    strokeWidth: 2,
    label: 'Contributes To',
    animated: false,
  },
};

/**
 * Type guards for node data
 */
export const isGoalNode = (data: NodeData): data is GoalNodeData => data.nodeType === 'goal';
export const isMilestoneNode = (data: NodeData): data is MilestoneNodeData => data.nodeType === 'milestone';
export const isRequirementNode = (data: NodeData): data is RequirementNodeData => data.nodeType === 'requirement';
export const isNoteNode = (data: NodeData): data is NoteNodeData => data.nodeType === 'note';

/**
 * Color options for notes and milestones
 */
export const cardColors = {
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-900' },
  green: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-900' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-900' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-900' },
  pink: { bg: 'bg-pink-50', border: 'border-pink-300', text: 'text-pink-900' },
  gray: { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-900' },
};

/**
 * Default viewport settings
 */
export const defaultViewport: GoalMapViewport = {
  x: 0,
  y: 0,
  zoom: 1,
};
