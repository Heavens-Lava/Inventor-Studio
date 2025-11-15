import { memo, useState } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);
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
  const animationDirection = data?.animationDirection || 'forward';

  return (
    <>
      {/* Invisible wider path for easier hover */}
      <path
        d={edgePath}
        fill="none"
        strokeWidth={20}
        stroke="transparent"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ cursor: 'pointer' }}
      />

      {/* Glow effect when hovering */}
      {isHovered && (
        <path
          d={edgePath}
          fill="none"
          stroke={style.stroke}
          strokeWidth={style.strokeWidth + 4}
          opacity={0.3}
          className="animate-pulse"
        />
      )}

      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: style.stroke,
          strokeWidth: selected || isHovered ? style.strokeWidth + 2 : style.strokeWidth,
          opacity: selected || isHovered ? 1 : 0.8,
          transition: 'all 0.2s ease-in-out',
        }}
        className={animationDirection === 'reverse' ? 'animated-reverse' : ''}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className={`
              px-2 py-1 rounded text-xs font-medium shadow-md
              transition-all cursor-pointer
              ${selected || isHovered ? 'scale-110 shadow-lg' : 'scale-100'}
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
