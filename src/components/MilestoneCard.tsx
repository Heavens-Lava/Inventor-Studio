import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { MilestoneNodeData, cardColors } from '@/types/goalMap';
import { Badge } from '@/components/ui/badge';
import { Flag, CheckCircle2, Calendar, Circle } from 'lucide-react';
import { format } from 'date-fns';

/**
 * MilestoneCard Component
 * Custom node component for displaying milestones on the canvas
 */
export const MilestoneCard = memo(({ data, selected }: NodeProps<MilestoneNodeData>) => {
  const colorClass = data.color && cardColors[data.color as keyof typeof cardColors]
    ? cardColors[data.color as keyof typeof cardColors]
    : cardColors.blue;

  const formatDate = (date?: Date | string) => {
    if (!date) return null;
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, 'MMM d, yyyy');
    } catch {
      return null;
    }
  };

  return (
    <div
      className={`
        ${colorClass.bg} rounded-lg shadow-lg border-2 transition-all
        ${selected ? 'border-blue-500 shadow-xl' : `${colorClass.border}`}
        hover:shadow-xl
      `}
      style={{ width: '260px' }}
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
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Flag className={`w-5 h-5 flex-shrink-0 ${data.completed ? 'text-green-600' : 'text-amber-600'}`} />
            <h3 className={`font-semibold text-sm ${colorClass.text}`}>{data.title}</h3>
          </div>
          {data.completed ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
          )}
        </div>

        {data.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-3">
            {data.description}
          </p>
        )}

        {/* Status Badge */}
        <div className="mb-3">
          <Badge
            variant={data.completed ? "default" : "secondary"}
            className={data.completed ? "bg-green-600" : ""}
          >
            {data.completed ? 'Completed' : 'In Progress'}
          </Badge>
        </div>

        {/* Dates */}
        <div className="space-y-2">
          {data.targetDate && (
            <div className="flex items-center gap-2 text-xs">
              <Calendar className="w-3 h-3 text-gray-500" />
              <span className="text-gray-600">Target:</span>
              <span className={`font-medium ${colorClass.text}`}>
                {formatDate(data.targetDate)}
              </span>
            </div>
          )}
          {data.completed && data.completedDate && (
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-3 h-3 text-green-600" />
              <span className="text-gray-600">Completed:</span>
              <span className="font-medium text-green-700">
                {formatDate(data.completedDate)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

MilestoneCard.displayName = 'MilestoneCard';
