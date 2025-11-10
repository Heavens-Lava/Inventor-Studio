import { useRef, useEffect } from "react";
import { DrawingStroke, ArrowConnection, IdeaCard } from "@/types/ideas";

interface DrawingDisplayProps {
  strokes: DrawingStroke[];
  arrows: ArrowConnection[];
  ideas: IdeaCard[];
  width: number;
  height: number;
}

export const DrawingDisplay = ({
  strokes,
  arrows,
  ideas,
  width,
  height
}: DrawingDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Helper function to draw an arrowhead
  const drawArrowhead = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string
  ) => {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const arrowLength = 15;
    const arrowAngle = Math.PI / 6; // 30 degrees

    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - arrowLength * Math.cos(angle - arrowAngle),
      toY - arrowLength * Math.sin(angle - arrowAngle)
    );
    ctx.lineTo(
      toX - arrowLength * Math.cos(angle + arrowAngle),
      toY - arrowLength * Math.sin(angle + arrowAngle)
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  // Redraw canvas when strokes, arrows, or ideas change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0 || height === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw all strokes
    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;

      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });

    // Draw arrows between cards
    arrows.forEach((arrow) => {
      const fromCard = ideas.find((idea) => idea.id === arrow.fromCardId);
      const toCard = ideas.find((idea) => idea.id === arrow.toCardId);

      if (!fromCard?.position || !toCard?.position) return;

      // Calculate card centers
      const fromWidth = fromCard.size?.width || 250;
      const fromHeight = fromCard.size?.height || 200;
      const toWidth = toCard.size?.width || 250;
      const toHeight = toCard.size?.height || 200;

      const fromX = fromCard.position.x + fromWidth / 2;
      const fromY = fromCard.position.y + fromHeight / 2;
      const toX = toCard.position.x + toWidth / 2;
      const toY = toCard.position.y + toHeight / 2;

      // Draw the arrow line
      ctx.beginPath();
      ctx.strokeStyle = arrow.color;
      ctx.lineWidth = 2;
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      // Draw arrowhead
      drawArrowhead(ctx, fromX, fromY, toX, toY, arrow.color);

      // Draw label if exists
      if (arrow.label) {
        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2;

        ctx.save();
        ctx.fillStyle = "white";
        ctx.strokeStyle = arrow.color;
        ctx.lineWidth = 1;

        const textMetrics = ctx.measureText(arrow.label);
        const padding = 4;
        const rectWidth = textMetrics.width + padding * 2;
        const rectHeight = 16;

        ctx.fillRect(
          midX - rectWidth / 2,
          midY - rectHeight / 2,
          rectWidth,
          rectHeight
        );
        ctx.strokeRect(
          midX - rectWidth / 2,
          midY - rectHeight / 2,
          rectWidth,
          rectHeight
        );

        ctx.fillStyle = arrow.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "12px sans-serif";
        ctx.fillText(arrow.label, midX, midY);
        ctx.restore();
      }
    });
  }, [strokes, arrows, ideas, width, height]);

  if (width === 0 || height === 0) return null;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        width: `${width}px`,
        height: `${height}px`
      }}
    />
  );
};
