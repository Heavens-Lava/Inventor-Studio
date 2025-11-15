import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { MilestoneNodeData, cardColors } from '@/types/goalMap';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Flag, CheckCircle2, Calendar, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { EmojiPicker } from '@/components/EmojiPicker';

/**
 * MilestoneCard Component
 * Custom node component for displaying milestones on the canvas
 */
export const MilestoneCard = memo(({ data, selected, id }: NodeProps<MilestoneNodeData>) => {
  const colorClass = data.color && cardColors[data.color as keyof typeof cardColors]
    ? cardColors[data.color as keyof typeof cardColors]
    : cardColors.blue;

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedTitle, setEditedTitle] = useState(data.title);
  const [editedDescription, setEditedDescription] = useState(data.description || '');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
      descriptionInputRef.current.select();
    }
  }, [isEditingDescription]);

  // Update local state when data changes
  useEffect(() => {
    setEditedTitle(data.title);
    setEditedDescription(data.description || '');
  }, [data.title, data.description]);

  const handleTitleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingTitle(true);
  }, []);

  const handleDescriptionDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingDescription(true);
  }, []);

  const handleTitleBlur = useCallback(() => {
    setIsEditingTitle(false);
    if (editedTitle.trim() !== data.title && editedTitle.trim() !== '') {
      window.dispatchEvent(
        new CustomEvent('updateNodeData', {
          detail: { id, data: { title: editedTitle.trim() } },
        })
      );
    } else {
      setEditedTitle(data.title);
    }
  }, [editedTitle, data.title, id]);

  const handleDescriptionBlur = useCallback(() => {
    setIsEditingDescription(false);
    if (editedDescription.trim() !== (data.description || '')) {
      window.dispatchEvent(
        new CustomEvent('updateNodeData', {
          detail: { id, data: { description: editedDescription.trim() } },
        })
      );
    } else {
      setEditedDescription(data.description || '');
    }
  }, [editedDescription, data.description, id]);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleTitleBlur();
      } else if (e.key === 'Escape') {
        setEditedTitle(data.title);
        setIsEditingTitle(false);
      }
    },
    [handleTitleBlur, data.title]
  );

  const handleDescriptionKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        handleDescriptionBlur();
      } else if (e.key === 'Escape') {
        setEditedDescription(data.description || '');
        setIsEditingDescription(false);
      }
    },
    [handleDescriptionBlur, data.description]
  );

  const handleEmojiSelect = useCallback((emoji: string) => {
    window.dispatchEvent(
      new CustomEvent('updateNodeData', {
        detail: { id, data: { emoji } },
      })
    );
  }, [id]);

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
            <div className="flex-shrink-0 nodrag" onClick={(e) => e.stopPropagation()}>
              {data.emoji ? (
                <EmojiPicker
                  value={data.emoji}
                  onSelect={handleEmojiSelect}
                  trigger={
                    <button className="text-xl hover:scale-110 transition-transform">
                      {data.emoji}
                    </button>
                  }
                />
              ) : (
                <EmojiPicker
                  onSelect={handleEmojiSelect}
                  trigger={
                    <button className="hover:bg-gray-100 p-1 rounded transition-colors">
                      <Flag className={`w-5 h-5 ${data.completed ? 'text-green-600' : 'text-amber-600'}`} />
                    </button>
                  }
                />
              )}
            </div>
            {isEditingTitle ? (
              <Input
                ref={titleInputRef}
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className="h-6 text-sm font-semibold px-1 py-0 nodrag"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <h3
                className={`font-semibold text-sm cursor-text hover:bg-gray-100 px-1 rounded ${colorClass.text}`}
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

        {(data.description || isEditingDescription) && (
          isEditingDescription ? (
            <Textarea
              ref={descriptionInputRef}
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              onKeyDown={handleDescriptionKeyDown}
              className="text-xs min-h-[60px] nodrag mb-3"
              onClick={(e) => e.stopPropagation()}
              rows={3}
            />
          ) : (
            <p
              className="text-xs text-gray-600 mb-3 line-clamp-3 cursor-text hover:bg-gray-100 px-1 rounded"
              onDoubleClick={handleDescriptionDoubleClick}
              title="Double-click to edit (Ctrl+Enter to save)"
            >
              {data.description}
            </p>
          )
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
