import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NoteNodeData, cardColors } from '@/types/goalMap';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote } from 'lucide-react';

/**
 * NoteCard Component
 * Custom node component for displaying freeform notes on the canvas
 */
export const NoteCard = memo(({ data, selected, id }: NodeProps<NoteNodeData>) => {
  const colorClass = data.color && cardColors[data.color as keyof typeof cardColors]
    ? cardColors[data.color as keyof typeof cardColors]
    : cardColors.yellow;

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedTitle, setEditedTitle] = useState(data.title);
  const [editedDescription, setEditedDescription] = useState(data.description || '');
  const [editedContent, setEditedContent] = useState(data.content || '');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const contentInputRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    if (isEditingContent && contentInputRef.current) {
      contentInputRef.current.focus();
      contentInputRef.current.select();
    }
  }, [isEditingContent]);

  // Update local state when data changes
  useEffect(() => {
    setEditedTitle(data.title);
    setEditedDescription(data.description || '');
    setEditedContent(data.content || '');
  }, [data.title, data.description, data.content]);

  const handleTitleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingTitle(true);
  }, []);

  const handleDescriptionDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingDescription(true);
  }, []);

  const handleContentDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingContent(true);
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

  const handleContentBlur = useCallback(() => {
    setIsEditingContent(false);
    if (editedContent.trim() !== (data.content || '')) {
      window.dispatchEvent(
        new CustomEvent('updateNodeData', {
          detail: { id, data: { content: editedContent.trim() } },
        })
      );
    } else {
      setEditedContent(data.content || '');
    }
  }, [editedContent, data.content, id]);

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

  const handleContentKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        handleContentBlur();
      } else if (e.key === 'Escape') {
        setEditedContent(data.content || '');
        setIsEditingContent(false);
      }
    },
    [handleContentBlur, data.content]
  );

  return (
    <div
      className={`
        ${colorClass.bg} rounded-lg shadow-lg border-2 transition-all
        ${selected ? 'border-blue-500 shadow-xl' : `${colorClass.border}`}
        hover:shadow-xl
      `}
      style={{ width: '220px', minHeight: '140px' }}
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
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <StickyNote className={`w-4 h-4 flex-shrink-0 ${colorClass.text}`} />
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

        {(data.description || isEditingDescription) && (
          isEditingDescription ? (
            <Textarea
              ref={descriptionInputRef}
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              onKeyDown={handleDescriptionKeyDown}
              className="text-xs min-h-[40px] nodrag mb-2 italic"
              onClick={(e) => e.stopPropagation()}
              rows={2}
            />
          ) : (
            <p
              className="text-xs text-gray-600 mb-2 italic line-clamp-2 cursor-text hover:bg-gray-100 px-1 rounded"
              onDoubleClick={handleDescriptionDoubleClick}
              title="Double-click to edit (Ctrl+Enter to save)"
            >
              {data.description}
            </p>
          )
        )}

        {(data.content || isEditingContent) && (
          isEditingContent ? (
            <Textarea
              ref={contentInputRef}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              onBlur={handleContentBlur}
              onKeyDown={handleContentKeyDown}
              className={`text-sm nodrag mb-2 ${colorClass.text}`}
              onClick={(e) => e.stopPropagation()}
              rows={4}
            />
          ) : (
            <div
              className={`text-sm ${colorClass.text} whitespace-pre-wrap mb-2 cursor-text hover:bg-gray-100 px-1 rounded`}
              onDoubleClick={handleContentDoubleClick}
              title="Double-click to edit (Ctrl+Enter to save)"
            >
              {data.content}
            </div>
          )
        )}

        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {data.tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

NoteCard.displayName = 'NoteCard';
