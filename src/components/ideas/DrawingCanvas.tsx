import { useRef, useState, useEffect } from "react";
import { DrawingStroke, DrawingTool, ArrowConnection } from "@/types/ideas";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Pen,
  Eraser,
  ArrowRight,
  Minus,
  MousePointer,
  Undo,
  Redo,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateId } from "@/lib/utils-todo";

interface DrawingCanvasProps {
  strokes: DrawingStroke[];
  arrows: ArrowConnection[];
  onStrokesChange: (strokes: DrawingStroke[]) => void;
  onArrowsChange: (arrows: ArrowConnection[]) => void;
  width: number;
  height: number;
}

const DRAWING_COLORS = [
  "#000000", "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"
];

export const DrawingCanvas = ({
  strokes,
  arrows,
  onStrokesChange,
  onArrowsChange,
  width,
  height
}: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(null);
  const [tool, setTool] = useState<DrawingTool>("pen");
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(2);
  const [history, setHistory] = useState<DrawingStroke[][]>([strokes]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Redraw canvas when strokes or arrows change
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

    // Draw arrows
    arrows.forEach((arrow) => {
      // For now, just draw simple arrows - in a full implementation,
      // you'd calculate positions based on card locations
      ctx.strokeStyle = arrow.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }, [strokes, arrows, width, height]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === "select") return;

    const pos = getMousePos(e);
    setIsDrawing(true);

    const newStroke: DrawingStroke = {
      id: generateId(),
      tool,
      color,
      width: lineWidth,
      points: [pos]
    };

    setCurrentStroke(newStroke);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke) return;

    const pos = getMousePos(e);
    const updatedStroke = {
      ...currentStroke,
      points: [...currentStroke.points, pos]
    };

    setCurrentStroke(updatedStroke);

    // Draw in real-time
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const points = updatedStroke.points;
    if (points.length >= 2) {
      const lastPoint = points[points.length - 2];
      const currentPoint = points[points.length - 1];

      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentStroke) return;

    setIsDrawing(false);

    const newStrokes = [...strokes, currentStroke];
    onStrokesChange(newStrokes);

    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newStrokes);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    setCurrentStroke(null);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      onStrokesChange(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      onStrokesChange(history[historyIndex + 1]);
    }
  };

  const handleClear = () => {
    onStrokesChange([]);
    const newHistory = [...history, []];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {/* Drawing Toolbar */}
      <div className="absolute bottom-4 right-4 pointer-events-auto z-50">
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-2">
          <div className="flex items-center gap-1 flex-wrap justify-center max-w-md">
            {/* Tool Selection */}
            <Button
              variant={tool === "select" ? "default" : "ghost"}
              size="icon"
              onClick={() => setTool("select")}
              title="Select"
            >
              <MousePointer className="h-4 w-4" />
            </Button>

            <Button
              variant={tool === "pen" ? "default" : "ghost"}
              size="icon"
              onClick={() => setTool("pen")}
              title="Pen"
            >
              <Pen className="h-4 w-4" />
            </Button>

            <Button
              variant={tool === "eraser" ? "default" : "ghost"}
              size="icon"
              onClick={() => setTool("eraser")}
              title="Eraser"
            >
              <Eraser className="h-4 w-4" />
            </Button>

            <Button
              variant={tool === "line" ? "default" : "ghost"}
              size="icon"
              onClick={() => setTool("line")}
              title="Line"
            >
              <Minus className="h-4 w-4" />
            </Button>

            <Button
              variant={tool === "arrow" ? "default" : "ghost"}
              size="icon"
              onClick={() => setTool("arrow")}
              title="Arrow"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-8 mx-1" />

            {/* Color Selection */}
            {DRAWING_COLORS.map((c) => (
              <button
                key={c}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                  color === c ? "border-foreground scale-110" : "border-muted"
                )}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
                title={`Color ${c}`}
              />
            ))}

            <Separator orientation="vertical" className="h-8 mx-1" />

            {/* Line Width */}
            <div className="flex gap-1">
              <Button
                variant={lineWidth === 1 ? "default" : "ghost"}
                size="sm"
                onClick={() => setLineWidth(1)}
                className="w-8 h-8"
              >
                <div className="w-1 h-1 bg-current rounded-full" />
              </Button>
              <Button
                variant={lineWidth === 2 ? "default" : "ghost"}
                size="sm"
                onClick={() => setLineWidth(2)}
                className="w-8 h-8"
              >
                <div className="w-2 h-2 bg-current rounded-full" />
              </Button>
              <Button
                variant={lineWidth === 4 ? "default" : "ghost"}
                size="sm"
                onClick={() => setLineWidth(4)}
                className="w-8 h-8"
              >
                <div className="w-3 h-3 bg-current rounded-full" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-8 mx-1" />

            {/* Actions */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              title="Clear All"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={cn(
          "absolute inset-0 touch-none",
          tool !== "select" && "pointer-events-auto cursor-crosshair"
        )}
        style={{
          width: `${width}px`,
          height: `${height}px`
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Debug info - remove in production */}
      {width === 0 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded pointer-events-none">
          Canvas loading...
        </div>
      )}
    </div>
  );
};
