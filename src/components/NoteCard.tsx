import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NoteNodeData, cardColors } from '@/types/goalMap';
import { Badge } from '@/components/ui/badge';
import { StickyNote } from 'lucide-react';

/**
 * NoteCard Component
 * Custom node component for displaying freeform notes on the canvas
 */
export const NoteCard = memo(({ data, selected }: NodeProps<NoteNodeData>) => {
  const colorClass = data.color && cardColors[data.color as keyof typeof cardColors]
    ? cardColors[data.color as keyof typeof cardColors]
    : cardColors.yellow;

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
          <h3 className={`font-semibold text-sm ${colorClass.text}`}>{data.title}</h3>
        </div>

        {data.description && (
          <p className="text-xs text-gray-600 mb-2 italic line-clamp-2">
            {data.description}
          </p>
        )}

        {data.content && (
          <div className={`text-sm ${colorClass.text} whitespace-pre-wrap mb-2`}>
            {data.content}
          </div>
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
