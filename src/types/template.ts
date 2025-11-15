import { Node, Edge } from 'reactflow';
import { GoalNodeData, MilestoneNodeData, RequirementNodeData, NoteNodeData } from './goalMap';

export type TemplateCategory = 'career' | 'fitness' | 'learning' | 'business' | 'custom';

export interface GoalMapTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail?: string;
  nodes: Node<GoalNodeData | MilestoneNodeData | RequirementNodeData | NoteNodeData>[];
  edges: Edge[];
  createdAt: Date;
  lastModified: Date;
  isCustom: boolean;
}

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail?: string;
  createdAt: Date;
  lastModified: Date;
  isCustom: boolean;
}
