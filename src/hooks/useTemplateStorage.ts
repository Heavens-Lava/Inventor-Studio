import { useState, useCallback, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { GoalMapTemplate, TemplateMetadata } from '@/types/template';
import { GoalNodeData, MilestoneNodeData, RequirementNodeData, NoteNodeData } from '@/types/goalMap';

const TEMPLATES_STORAGE_KEY = 'goalmap_templates';

// Pre-made templates
const PREDEFINED_TEMPLATES: GoalMapTemplate[] = [
  {
    id: 'career-path',
    name: 'Career Path',
    description: 'Plan your professional development and career advancement',
    category: 'career',
    nodes: [
      {
        id: 'career-goal-1',
        type: 'goal',
        position: { x: 250, y: 50 },
        data: {
          nodeType: 'goal',
          title: 'Senior Software Engineer',
          description: 'Advance to senior engineering role within 2 years',
          type: 'major',
          status: 'in-progress',
          priority: 'high',
          progress: 35,
          category: 'Career',
          tags: ['promotion', 'technical-growth'],
          emoji: '🎯',
        } as GoalNodeData,
      },
      {
        id: 'career-milestone-1',
        type: 'milestone',
        position: { x: 100, y: 200 },
        data: {
          nodeType: 'milestone',
          title: 'Complete Architecture Course',
          description: 'Finish system design and architecture certification',
          color: 'blue',
          completed: false,
          targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          emoji: '📚',
        } as MilestoneNodeData,
      },
      {
        id: 'career-milestone-2',
        type: 'milestone',
        position: { x: 400, y: 200 },
        data: {
          nodeType: 'milestone',
          title: 'Lead Major Project',
          description: 'Take ownership of a critical company initiative',
          color: 'purple',
          completed: false,
          targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          emoji: '🚀',
        } as MilestoneNodeData,
      },
      {
        id: 'career-req-1',
        type: 'requirement',
        position: { x: 50, y: 350 },
        data: {
          nodeType: 'requirement',
          title: 'System Design Knowledge',
          description: 'Deep understanding of scalable architectures',
          requirementType: 'skill',
          priority: 'high',
          completed: false,
          emoji: '💡',
        } as RequirementNodeData,
      },
      {
        id: 'career-req-2',
        type: 'requirement',
        position: { x: 250, y: 350 },
        data: {
          nodeType: 'requirement',
          title: 'Leadership Training',
          description: 'Complete management and leadership workshop',
          requirementType: 'knowledge',
          priority: 'medium',
          completed: false,
          emoji: '📖',
        } as RequirementNodeData,
      },
      {
        id: 'career-req-3',
        type: 'requirement',
        position: { x: 450, y: 350 },
        data: {
          nodeType: 'requirement',
          title: 'Mentor Junior Developers',
          description: 'Guide 2-3 junior team members',
          requirementType: 'skill',
          priority: 'medium',
          completed: false,
          emoji: '👥',
        } as RequirementNodeData,
      },
    ],
    edges: [
      {
        id: 'career-e1',
        source: 'career-goal-1',
        target: 'career-milestone-1',
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target',
        type: 'custom',
        data: { relationshipType: 'requires', animationDirection: 'forward' },
      },
      {
        id: 'career-e2',
        source: 'career-goal-1',
        target: 'career-milestone-2',
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target',
        type: 'custom',
        data: { relationshipType: 'requires', animationDirection: 'forward' },
      },
      {
        id: 'career-e3',
        source: 'career-milestone-1',
        target: 'career-req-1',
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target',
        type: 'custom',
        data: { relationshipType: 'needs', animationDirection: 'forward' },
      },
      {
        id: 'career-e4',
        source: 'career-milestone-1',
        target: 'career-req-2',
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target',
        type: 'custom',
        data: { relationshipType: 'related', animationDirection: 'forward' },
      },
      {
        id: 'career-e5',
        source: 'career-milestone-2',
        target: 'career-req-3',
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target',
        type: 'custom',
        data: { relationshipType: 'needs', animationDirection: 'forward' },
      },
    ],
    createdAt: new Date(),
    lastModified: new Date(),
    isCustom: false,
  },
  {
    id: 'fitness-journey',
    name: 'Fitness Journey',
    description: 'Track your health and fitness transformation goals',
    category: 'fitness',
    nodes: [
      {
        id: 'fitness-goal-1',
        type: 'goal',
        position: { x: 250, y: 50 },
        data: {
          nodeType: 'goal',
          title: 'Complete Half Marathon',
          description: 'Run a half marathon in under 2 hours',
          type: 'major',
          status: 'in-progress',
          priority: 'high',
          progress: 25,
          category: 'Health & Fitness',
          tags: ['running', 'endurance'],
          emoji: '🏃',
        } as GoalNodeData,
      },
      {
        id: 'fitness-milestone-1',
        type: 'milestone',
        position: { x: 100, y: 200 },
        data: {
          nodeType: 'milestone',
          title: 'Run 5K Consistently',
          description: 'Complete 5K runs 3 times per week',
          color: 'green',
          completed: false,
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          emoji: '✅',
        } as MilestoneNodeData,
      },
      {
        id: 'fitness-milestone-2',
        type: 'milestone',
        position: { x: 400, y: 200 },
        data: {
          nodeType: 'milestone',
          title: 'Run 10K Race',
          description: 'Complete first official 10K race',
          color: 'blue',
          completed: false,
          targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          emoji: '🏆',
        } as MilestoneNodeData,
      },
      {
        id: 'fitness-req-1',
        type: 'requirement',
        position: { x: 50, y: 350 },
        data: {
          nodeType: 'requirement',
          title: 'Running Shoes',
          description: 'Get proper running shoes with good support',
          requirementType: 'resource',
          priority: 'high',
          completed: false,
          cost: 150,
          emoji: '👟',
        } as RequirementNodeData,
      },
      {
        id: 'fitness-req-2',
        type: 'requirement',
        position: { x: 250, y: 350 },
        data: {
          nodeType: 'requirement',
          title: 'Training Plan',
          description: 'Follow structured 12-week training program',
          requirementType: 'knowledge',
          priority: 'high',
          completed: false,
          emoji: '📋',
        } as RequirementNodeData,
      },
      {
        id: 'fitness-note-1',
        type: 'note',
        position: { x: 450, y: 350 },
        data: {
          nodeType: 'note',
          title: 'Nutrition Tips',
          description: 'Focus on carbs before runs',
          content: 'Hydrate well, eat light meals 2-3 hours before running. Recovery meals within 30 minutes.',
          color: 'yellow',
          tags: ['nutrition'],
          emoji: '🍎',
        } as NoteNodeData,
      },
    ],
    edges: [
      {
        id: 'fitness-e1',
        source: 'fitness-goal-1',
        target: 'fitness-milestone-1',
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target',
        type: 'custom',
        data: { relationshipType: 'requires', animationDirection: 'forward' },
      },
      {
        id: 'fitness-e2',
        source: 'fitness-goal-1',
        target: 'fitness-milestone-2',
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target',
        type: 'custom',
        data: { relationshipType: 'requires', animationDirection: 'forward' },
      },
      {
        id: 'fitness-e3',
        source: 'fitness-milestone-1',
        target: 'fitness-req-1',
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target',
        type: 'custom',
        data: { relationshipType: 'needs', animationDirection: 'forward' },
      },
      {
        id: 'fitness-e4',
        source: 'fitness-milestone-1',
        target: 'fitness-req-2',
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target',
        type: 'custom',
        data: { relationshipType: 'needs', animationDirection: 'forward' },
      },
      {
        id: 'fitness-e5',
        source: 'fitness-milestone-2',
        target: 'fitness-note-1',
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target',
        type: 'custom',
        data: { relationshipType: 'related', animationDirection: 'forward' },
      },
    ],
    createdAt: new Date(),
    lastModified: new Date(),
    isCustom: false,
  },
  {
    id: 'learning-plan',
    name: 'Learning Plan',
    description: 'Master new skills and expand your knowledge',
    category: 'learning',
    nodes: [
      {
        id: 'learning-goal-1',
        type: 'goal',
        position: { x: 250, y: 50 },
        data: {
          nodeType: 'goal',
          title: 'Master TypeScript',
          description: 'Become proficient in TypeScript for enterprise applications',
          type: 'major',
          status: 'in-progress',
          priority: 'high',
          progress: 40,
          category: 'Learning',
          tags: ['programming', 'typescript'],
          emoji: '💻',
        } as GoalNodeData,
      },
      {
        id: 'learning-milestone-1',
        type: 'milestone',
        position: { x: 100, y: 200 },
        data: {
          nodeType: 'milestone',
          title: 'Complete TypeScript Course',
          description: 'Finish comprehensive online TypeScript course',
          color: 'blue',
          completed: false,
          targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          emoji: '📚',
        } as MilestoneNodeData,
      },
      {
        id: 'learning-milestone-2',
        type: 'milestone',
        position: { x: 400, y: 200 },
        data: {
          nodeType: 'milestone',
          title: 'Build TypeScript Project',
          description: 'Create a full-stack application using TypeScript',
          color: 'purple',
          completed: false,
          targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          emoji: '🚀',
        } as MilestoneNodeData,
      },
      {
        id: 'learning-req-1',
        type: 'requirement',
        position: { x: 50, y: 350 },
        data: {
          nodeType: 'requirement',
          title: 'Development Environment',
          description: 'Set up VS Code with TypeScript extensions',
          requirementType: 'tool',
          priority: 'high',
          completed: false,
          emoji: '🛠️',
        } as RequirementNodeData,
      },
      {
        id: 'learning-req-2',
        type: 'requirement',
        position: { x: 250, y: 350 },
        data: {
          nodeType: 'requirement',
          title: 'Course Subscription',
          description: 'Subscribe to learning platform',
          requirementType: 'resource',
          priority: 'high',
          completed: false,
          cost: 49,
          emoji: '💳',
        } as RequirementNodeData,
      },
      {
        id: 'learning-note-1',
        type: 'note',
        position: { x: 450, y: 350 },
        data: {
          nodeType: 'note',
          title: 'Key Concepts',
          description: 'Important TypeScript patterns',
          content: 'Generics, Type Guards, Utility Types, Decorators, Advanced Types',
          color: 'blue',
          tags: ['reference'],
          emoji: '📝',
        } as NoteNodeData,
      },
    ],
    edges: [
      {
        id: 'learning-e1',
        source: 'learning-goal-1',
        target: 'learning-milestone-1',
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target',
        type: 'custom',
        data: { relationshipType: 'requires', animationDirection: 'forward' },
      },
      {
        id: 'learning-e2',
        source: 'learning-goal-1',
        target: 'learning-milestone-2',
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target',
        type: 'custom',
        data: { relationshipType: 'requires', animationDirection: 'forward' },
      },
      {
        id: 'learning-e3',
        source: 'learning-milestone-1',
        target: 'learning-req-1',
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target',
        type: 'custom',
        data: { relationshipType: 'needs', animationDirection: 'forward' },
      },
      {
        id: 'learning-e4',
        source: 'learning-milestone-1',
        target: 'learning-req-2',
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target',
        type: 'custom',
        data: { relationshipType: 'needs', animationDirection: 'forward' },
      },
      {
        id: 'learning-e5',
        source: 'learning-milestone-1',
        target: 'learning-note-1',
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target',
        type: 'custom',
        data: { relationshipType: 'related', animationDirection: 'forward' },
      },
    ],
    createdAt: new Date(),
    lastModified: new Date(),
    isCustom: false,
  },
  {
    id: 'business-launch',
    name: 'Business Launch',
    description: 'Plan and execute your business startup',
    category: 'business',
    nodes: [
      {
        id: 'business-goal-1',
        type: 'goal',
        position: { x: 250, y: 50 },
        data: {
          nodeType: 'goal',
          title: 'Launch SaaS Product',
          description: 'Build and launch a profitable SaaS application',
          type: 'major',
          status: 'not-started',
          priority: 'critical',
          progress: 10,
          category: 'Business',
          tags: ['startup', 'saas', 'product'],
          emoji: '🚀',
        } as GoalNodeData,
      },
      {
        id: 'business-milestone-1',
        type: 'milestone',
        position: { x: 100, y: 200 },
        data: {
          nodeType: 'milestone',
          title: 'MVP Development',
          description: 'Build minimum viable product with core features',
          color: 'purple',
          completed: false,
          targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
          emoji: '💻',
        } as MilestoneNodeData,
      },
      {
        id: 'business-milestone-2',
        type: 'milestone',
        position: { x: 400, y: 200 },
        data: {
          nodeType: 'milestone',
          title: 'First 10 Customers',
          description: 'Acquire initial customer base',
          color: 'green',
          completed: false,
          targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          emoji: '👥',
        } as MilestoneNodeData,
      },
      {
        id: 'business-req-1',
        type: 'requirement',
        position: { x: 50, y: 350 },
        data: {
          nodeType: 'requirement',
          title: 'Market Research',
          description: 'Validate product-market fit',
          requirementType: 'knowledge',
          priority: 'critical',
          completed: false,
          emoji: '📊',
        } as RequirementNodeData,
      },
      {
        id: 'business-req-2',
        type: 'requirement',
        position: { x: 250, y: 350 },
        data: {
          nodeType: 'requirement',
          title: 'Initial Funding',
          description: 'Secure seed funding or bootstrap',
          requirementType: 'resource',
          priority: 'high',
          completed: false,
          cost: 50000,
          emoji: '💰',
        } as RequirementNodeData,
      },
      {
        id: 'business-req-3',
        type: 'requirement',
        position: { x: 450, y: 350 },
        data: {
          nodeType: 'requirement',
          title: 'Marketing Strategy',
          description: 'Develop go-to-market plan',
          requirementType: 'knowledge',
          priority: 'high',
          completed: false,
          emoji: '📈',
        } as RequirementNodeData,
      },
    ],
    edges: [
      {
        id: 'business-e1',
        source: 'business-goal-1',
        target: 'business-milestone-1',
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target',
        type: 'custom',
        data: { relationshipType: 'requires', animationDirection: 'forward' },
      },
      {
        id: 'business-e2',
        source: 'business-goal-1',
        target: 'business-milestone-2',
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target',
        type: 'custom',
        data: { relationshipType: 'requires', animationDirection: 'forward' },
      },
      {
        id: 'business-e3',
        source: 'business-milestone-1',
        target: 'business-req-1',
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target',
        type: 'custom',
        data: { relationshipType: 'needs', animationDirection: 'forward' },
      },
      {
        id: 'business-e4',
        source: 'business-milestone-1',
        target: 'business-req-2',
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target',
        type: 'custom',
        data: { relationshipType: 'needs', animationDirection: 'forward' },
      },
      {
        id: 'business-e5',
        source: 'business-milestone-2',
        target: 'business-req-3',
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target',
        type: 'custom',
        data: { relationshipType: 'needs', animationDirection: 'forward' },
      },
    ],
    createdAt: new Date(),
    lastModified: new Date(),
    isCustom: false,
  },
];

export function useTemplateStorage() {
  const [templates, setTemplates] = useState<GoalMapTemplate[]>([]);

  // Load templates from localStorage on mount
  useEffect(() => {
    const loadTemplates = () => {
      try {
        const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
        if (stored) {
          const customTemplates = JSON.parse(stored);
          // Combine predefined and custom templates
          setTemplates([...PREDEFINED_TEMPLATES, ...customTemplates]);
        } else {
          setTemplates(PREDEFINED_TEMPLATES);
        }
      } catch (error) {
        console.error('Error loading templates:', error);
        setTemplates(PREDEFINED_TEMPLATES);
      }
    };

    loadTemplates();
  }, []);

  const saveTemplate = useCallback(
    (
      name: string,
      description: string,
      category: 'custom',
      nodes: Node<GoalNodeData | MilestoneNodeData | RequirementNodeData | NoteNodeData>[],
      edges: Edge[]
    ) => {
      try {
        const newTemplate: GoalMapTemplate = {
          id: `custom-${Date.now()}`,
          name,
          description,
          category,
          nodes,
          edges,
          createdAt: new Date(),
          lastModified: new Date(),
          isCustom: true,
        };

        // Get existing custom templates
        const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
        const customTemplates = stored ? JSON.parse(stored) : [];

        // Add new template
        const updatedCustomTemplates = [...customTemplates, newTemplate];
        localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(updatedCustomTemplates));

        // Update state
        setTemplates([...PREDEFINED_TEMPLATES, ...updatedCustomTemplates]);

        return newTemplate;
      } catch (error) {
        console.error('Error saving template:', error);
        return null;
      }
    },
    []
  );

  const loadTemplate = useCallback((templateId: string): GoalMapTemplate | null => {
    const template = templates.find((t) => t.id === templateId);
    return template || null;
  }, [templates]);

  const deleteTemplate = useCallback(
    (templateId: string) => {
      try {
        // Only allow deleting custom templates
        const template = templates.find((t) => t.id === templateId);
        if (!template || !template.isCustom) {
          return false;
        }

        // Get existing custom templates
        const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
        const customTemplates = stored ? JSON.parse(stored) : [];

        // Remove template
        const updatedCustomTemplates = customTemplates.filter(
          (t: GoalMapTemplate) => t.id !== templateId
        );
        localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(updatedCustomTemplates));

        // Update state
        setTemplates([...PREDEFINED_TEMPLATES, ...updatedCustomTemplates]);

        return true;
      } catch (error) {
        console.error('Error deleting template:', error);
        return false;
      }
    },
    [templates]
  );

  const getAllTemplates = useCallback((): TemplateMetadata[] => {
    return templates.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
      thumbnail: t.thumbnail,
      createdAt: t.createdAt,
      lastModified: t.lastModified,
      isCustom: t.isCustom,
    }));
  }, [templates]);

  const getTemplatesByCategory = useCallback(
    (category: string) => {
      return templates.filter((t) => t.category === category);
    },
    [templates]
  );

  return {
    templates,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    getAllTemplates,
    getTemplatesByCategory,
  };
}
