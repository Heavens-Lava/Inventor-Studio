import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';

export type DrawingTool = 'pen' | 'rectangle' | 'circle' | 'line' | 'eraser';

export interface Point {
  x: number;
  y: number;
}

export interface DrawingElement {
  type: DrawingTool;
  points: Point[];
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
}

export interface DrawingCanvasProps {
  tool: DrawingTool;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  canvasData?: DrawingElement[];
  onChange?: (elements: DrawingElement[]) => void;
}

export const DrawingCanvas = forwardRef<HTMLCanvasElement, DrawingCanvasProps>(function DrawingCanvas({
  tool,
  strokeColor,
  fillColor,
  strokeWidth,
  showGrid,
  gridSize,
  snapToGrid,
  canvasData = [],
  onChange,
}, ref) {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);

  // Expose the canvas ref to parent
  useImperativeHandle(ref, () => internalCanvasRef.current as HTMLCanvasElement);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [elements, setElements] = useState<DrawingElement[]>(canvasData);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);

  // Snap point to grid if enabled
  const snapPoint = useCallback(
    (point: Point): Point => {
      if (!snapToGrid) return point;
      return {
        x: Math.round(point.x / gridSize) * gridSize,
        y: Math.round(point.y / gridSize) * gridSize,
      };
    },
    [snapToGrid, gridSize]
  );

  // Get mouse position relative to canvas
  const getMousePos = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>): Point => {
      const canvas = internalCanvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const point = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };

      return snapPoint(point);
    },
    [snapPoint]
  );

  // Draw grid
  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      if (!showGrid) return;

      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    },
    [showGrid, gridSize]
  );

  // Draw a single element
  const drawElement = useCallback((ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    if (element.points.length === 0) return;

    ctx.strokeStyle = element.strokeColor;
    ctx.fillStyle = element.fillColor;
    ctx.lineWidth = element.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (element.type === 'pen') {
      // Draw freehand path
      ctx.beginPath();
      ctx.moveTo(element.points[0].x, element.points[0].y);
      for (let i = 1; i < element.points.length; i++) {
        ctx.lineTo(element.points[i].x, element.points[i].y);
      }
      ctx.stroke();
    } else if (element.type === 'eraser') {
      // Erase by drawing with white (larger size for better erasing)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = element.strokeWidth * 5;
      ctx.beginPath();
      ctx.moveTo(element.points[0].x, element.points[0].y);
      for (let i = 1; i < element.points.length; i++) {
        ctx.lineTo(element.points[i].x, element.points[i].y);
      }
      ctx.stroke();
    } else if (element.type === 'line' && element.points.length >= 2) {
      // Draw line
      const [start, end] = element.points;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    } else if (element.type === 'rectangle' && element.points.length >= 2) {
      // Draw rectangle
      const [start, end] = element.points;
      const width = end.x - start.x;
      const height = end.y - start.y;

      if (element.fillColor !== 'transparent') {
        ctx.fillRect(start.x, start.y, width, height);
      }
      ctx.strokeRect(start.x, start.y, width, height);
    } else if (element.type === 'circle' && element.points.length >= 2) {
      // Draw circle
      const [start, end] = element.points;
      const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));

      ctx.beginPath();
      ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
      if (element.fillColor !== 'transparent') {
        ctx.fill();
      }
      ctx.stroke();
    }
  }, []);

  // Redraw entire canvas
  const redraw = useCallback(() => {
    const canvas = internalCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height);

    // Draw all elements
    elements.forEach((element) => drawElement(ctx, element));

    // Draw current element being drawn
    if (isDrawing && startPoint && currentPoint) {
      const currentElement: DrawingElement = {
        type: tool,
        points: tool === 'pen' || tool === 'eraser' ? currentPath : [startPoint, currentPoint],
        strokeColor,
        fillColor,
        strokeWidth,
      };
      drawElement(ctx, currentElement);
    }
  }, [
    elements,
    isDrawing,
    startPoint,
    currentPoint,
    currentPath,
    tool,
    strokeColor,
    fillColor,
    strokeWidth,
    drawGrid,
    drawElement,
  ]);

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePos(e);
    setIsDrawing(true);
    setStartPoint(point);
    setCurrentPoint(point);

    if (tool === 'pen' || tool === 'eraser') {
      setCurrentPath([point]);
    }
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const point = getMousePos(e);
    setCurrentPoint(point);

    if (tool === 'pen' || tool === 'eraser') {
      setCurrentPath((prev) => [...prev, point]);
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    if (!isDrawing || !startPoint) return;

    const newElement: DrawingElement = {
      type: tool,
      points: tool === 'pen' || tool === 'eraser' ? currentPath : [startPoint, currentPoint!],
      strokeColor,
      fillColor,
      strokeWidth,
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    onChange?.(newElements);

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoint(null);
    setCurrentPath([]);
  };

  // Initialize canvas
  useEffect(() => {
    const canvas = internalCanvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    // Set canvas size to container size
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    redraw();
  }, [redraw]);

  // Redraw when anything changes
  useEffect(() => {
    redraw();
  }, [redraw]);

  // Update elements when canvasData prop changes
  useEffect(() => {
    if (canvasData && canvasData.length > 0) {
      setElements(canvasData);
    }
  }, [canvasData]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={internalCanvasRef}
        className="absolute inset-0 cursor-crosshair border border-gray-300 bg-white"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
});
