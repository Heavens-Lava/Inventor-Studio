import { memo } from 'react';
import { EdgeProps, getSmoothStepPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';
import { GoalMapEdgeData, edgeStyles } from '@/types/goalMap';

/**
 * CustomEdge Component
 * Custom edge component with styled labels based on relationship type
 */
export const CustomEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<GoalMapEdgeData>) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const relationshipType = data?.relationshipType || 'related';
  const style = edgeStyles[relationshipType];
  const customLabel = data?.label || style.label;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: style.stroke,
          strokeWidth: selected ? style.strokeWidth + 1 : style.strokeWidth,
          opacity: selected ? 1 : 0.8,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div
            className={`
              px-2 py-1 rounded text-xs font-medium shadow-md
              transition-all cursor-pointer
              ${selected ? 'scale-110' : 'scale-100'}
            `}
            style={{
              backgroundColor: 'white',
              border: `2px solid ${style.stroke}`,
              color: style.stroke,
            }}
          >
            {customLabel}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

CustomEdge.displayName = 'CustomEdge';
