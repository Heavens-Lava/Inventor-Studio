import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { MilestoneNodeData, cardColors } from '@/types/goalMap';
import { Badge } from '@/components/ui/badge';
import { Flag, CheckCircle2, Calendar, Circle } from 'lucide-react';
import { format } from 'date-fns';

/**
 * MilestoneCard Component
 * Custom node component for displaying milestones on the canvas
 */
export const MilestoneCard = memo(({ data, selected, id }: NodeProps<MilestoneNodeData>) => {
  const colorClass = data.color && cardColors[data.color as keyof typeof cardColors]
    ? cardColors[data.color as keyof typeof cardColors]
    : cardColors.blue;

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(data.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    setEditedTitle(data.title);
  }, [data.title]);

  const handleTitleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingTitle(true);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (editedTitle.trim() && editedTitle !== data.title) {
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

      {/* Card Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Flag className={`w-5 h-5 flex-shrink-0 ${data.completed ? 'text-green-600' : 'text-amber-600'}`} />
            {isEditingTitle ? (
              <input
                ref={inputRef}
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className={`font-semibold text-sm border-b-2 border-blue-500 bg-transparent focus:outline-none flex-1 min-w-0 ${colorClass.text}`}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <h3
                className={`font-semibold text-sm cursor-text hover:bg-white/50 px-1 rounded ${colorClass.text}`}
                onDoubleClick={handleTitleDoubleClick}
                title="Double-click to edit"
              >
                {data.title}
              </h3>
            )}
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
