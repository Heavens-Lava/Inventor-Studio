import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GoalNodeData } from '@/types/goalMap';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Flag, AlertCircle, CheckCircle2, Pause, XCircle } from 'lucide-react';

const statusIcons = {
  'not-started': AlertCircle,
  'in-progress': Flag,
  'on-hold': Pause,
  'completed': CheckCircle2,
  'cancelled': XCircle,
};

const statusColors = {
  'not-started': 'bg-gray-100 text-gray-700 border-gray-300',
  'in-progress': 'bg-blue-100 text-blue-700 border-blue-300',
  'on-hold': 'bg-amber-100 text-amber-700 border-amber-300',
  'completed': 'bg-green-100 text-green-700 border-green-300',
  'cancelled': 'bg-red-100 text-red-700 border-red-300',
};

const priorityColors = {
  'low': 'bg-gray-500',
  'medium': 'bg-blue-500',
  'high': 'bg-amber-500',
  'critical': 'bg-red-500',
};

const typeColors = {
  'major': 'bg-purple-600 text-white',
  'minor': 'bg-indigo-600 text-white',
};

/**
 * GoalMapCard Component
 * Custom node component for displaying goals on the canvas
 */
export const GoalMapCard = memo(({ data, selected, id }: NodeProps<GoalNodeData>) => {
  const StatusIcon = statusIcons[data.status];
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(data.title);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingTitle(true);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (editedTitle.trim() && editedTitle !== data.title) {
      // Trigger a custom event to update the node
      const event = new CustomEvent('updateNode', {
        detail: { nodeId: id, updates: { title: editedTitle.trim() } },
      });
      window.dispatchEvent(event);
    } else {
      setEditedTitle(data.title);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleBlur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditedTitle(data.title);
      setIsEditingTitle(false);
    }
  };

  // Update local state when data changes
  useEffect(() => {
    setEditedTitle(data.title);
  }, [data.title]);

  return (
    <div
      className={`
        bg-white rounded-lg shadow-lg border-2 transition-all
        ${selected ? 'border-blue-500 shadow-xl' : 'border-gray-200'}
        hover:shadow-xl
      `}
      style={{ width: '280px' }}
    >
      {/* Connection Handles - All 4 sides support both input and output */}
      {/* Top */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="w-3 h-3 !bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        className="w-3 h-3 !bg-blue-500"
      />

      {/* Bottom */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        className="w-3 h-3 !bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className="w-3 h-3 !bg-blue-500"
      />

      {/* Left */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className="w-3 h-3 !bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        className="w-3 h-3 !bg-blue-500"
      />

      {/* Right */}
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        className="w-3 h-3 !bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className="w-3 h-3 !bg-blue-500"
      />

      {/* Card Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Target className="w-4 h-4 text-blue-600 flex-shrink-0" />
            {isEditingTitle ? (
              <input
                ref={inputRef}
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className="font-semibold text-sm border-b-2 border-blue-500 bg-transparent focus:outline-none flex-1 min-w-0"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <h3
                className="font-semibold text-sm truncate cursor-text hover:bg-gray-100 px-1 rounded"
                onDoubleClick={handleTitleDoubleClick}
                title="Double-click to edit"
              >
                {data.title}
              </h3>
            )}
          </div>
          <Badge variant="outline" className={`${typeColors[data.type]} text-xs flex-shrink-0`}>
            {data.type}
          </Badge>
        </div>

        {data.description && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
            {data.description}
          </p>
        )}

        {/* Priority Indicator */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${priorityColors[data.priority]}`} />
          <span className="text-xs text-gray-500 capitalize">{data.priority} priority</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3">
        {/* Status */}
        <div className={`flex items-center gap-2 px-2 py-1 rounded border mb-3 ${statusColors[data.status]}`}>
          <StatusIcon className="w-3 h-3" />
          <span className="text-xs font-medium capitalize">{data.status.replace('-', ' ')}</span>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-700">Progress</span>
            <span className="text-xs font-semibold text-gray-900">{data.progress}%</span>
          </div>
          <Progress value={data.progress} className="h-2" />
        </div>

        {/* Category */}
        {data.category && (
          <div className="mb-2">
            <Badge variant="secondary" className="text-xs">
              {data.category}
            </Badge>
          </div>
        )}

        {/* Tags */}
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {data.tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {data.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{data.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

GoalMapCard.displayName = 'GoalMapCard';
