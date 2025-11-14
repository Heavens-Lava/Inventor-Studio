import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { RequirementNodeData } from '@/types/goalMap';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Wrench, Book, Box, Lightbulb, DollarSign } from 'lucide-react';

const typeIcons = {
  skill: Lightbulb,
  resource: Box,
  tool: Wrench,
  knowledge: Book,
};

const typeColors = {
  skill: 'bg-purple-100 border-purple-300 text-purple-900',
  resource: 'bg-green-100 border-green-300 text-green-900',
  tool: 'bg-orange-100 border-orange-300 text-orange-900',
  knowledge: 'bg-blue-100 border-blue-300 text-blue-900',
};

const priorityColors = {
  low: 'bg-gray-500',
  medium: 'bg-blue-500',
  high: 'bg-amber-500',
};

/**
 * RequirementCard Component
 * Custom node component for displaying requirements/resources on the canvas
 */
export const RequirementCard = memo(({ data, selected }: NodeProps<RequirementNodeData>) => {
  const TypeIcon = typeIcons[data.requirementType];
  const colorClass = typeColors[data.requirementType];

  return (
    <div
      className={`
        rounded-lg shadow-lg border-2 transition-all
        ${selected ? 'border-blue-500 shadow-xl' : `${colorClass}`}
        hover:shadow-xl
      `}
      style={{ width: '240px' }}
    >
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-blue-500"
      />

      {/* Card Content */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <TypeIcon className="w-4 h-4 flex-shrink-0" />
            <h3 className="font-semibold text-sm">{data.title}</h3>
          </div>
          {data.completed ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
          )}
        </div>

        {data.description && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {data.description}
          </p>
        )}

        {/* Type Badge */}
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs capitalize">
            {data.requirementType}
          </Badge>
          {data.completed && (
            <Badge variant="default" className="text-xs bg-green-600">
              Acquired
            </Badge>
          )}
        </div>

        {/* Priority and Cost */}
        <div className="flex items-center justify-between">
          {data.priority && (
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${priorityColors[data.priority]}`} />
              <span className="text-xs text-gray-600 capitalize">{data.priority}</span>
            </div>
          )}
          {data.cost !== undefined && data.cost > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-700">
              <DollarSign className="w-3 h-3" />
              <span className="font-medium">{data.cost}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

RequirementCard.displayName = 'RequirementCard';
