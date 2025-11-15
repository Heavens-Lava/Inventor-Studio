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
  const [isPanning, setIsPanning] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [elements, setElements] = useState<DrawingElement[]>(canvasData);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);

  // Infinite canvas state
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [lastPanPoint, setLastPanPoint] = useState<Point | null>(null);

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

  // Get mouse position relative to canvas (accounting for zoom and pan)
  const getMousePos = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>): Point => {
      const canvas = internalCanvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      // Transform to canvas coordinates, then account for zoom and pan
      const canvasX = (e.clientX - rect.left) * scaleX;
      const canvasY = (e.clientY - rect.top) * scaleY;

      const point = {
        x: (canvasX - panOffset.x) / zoom,
        y: (canvasY - panOffset.y) / zoom,
      };

      return snapPoint(point);
    },
    [snapPoint, zoom, panOffset]
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
      // Erase by clearing pixels (transparent)
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = element.strokeWidth * 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(element.points[0].x, element.points[0].y);
      for (let i = 1; i < element.points.length; i++) {
        ctx.lineTo(element.points[i].x, element.points[i].y);
      }
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
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

    // Clear canvas (transparent)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Apply zoom and pan transformations
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);

    // Draw grid
    drawGrid(ctx, canvas.width / zoom, canvas.height / zoom);

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

    // Restore context state
    ctx.restore();
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
    zoom,
    panOffset,
  ]);

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePos(e);

    // Middle mouse button or space + left click = pan
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    // Left mouse button = draw
    if (e.button === 0 && !isPanning) {
      setIsDrawing(true);
      setStartPoint(point);
      setCurrentPoint(point);

      if (tool === 'pen' || tool === 'eraser') {
        setCurrentPath([point]);
      }
    }
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Handle panning
    if (isPanning && lastPanPoint) {
      const dx = e.clientX - lastPanPoint.x;
      const dy = e.clientY - lastPanPoint.y;
      setPanOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    // Handle drawing
    if (!isDrawing) return;

    const point = getMousePos(e);
    setCurrentPoint(point);

    if (tool === 'pen' || tool === 'eraser') {
      setCurrentPath((prev) => [...prev, point]);
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    // End panning
    if (isPanning) {
      setIsPanning(false);
      setLastPanPoint(null);
      return;
    }

    // End drawing
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

  // Handle mouse wheel for zoom
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prevZoom) => Math.max(0.1, Math.min(5, prevZoom * zoomFactor)));
  }, []);

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
    // Always sync with canvasData prop, even if empty
    setElements(canvasData);
  }, [canvasData]);

  return (
    <div className="relative w-full h-full bg-gray-100">
      <canvas
        ref={internalCanvasRef}
        className={`absolute inset-0 ${isPanning ? 'cursor-grabbing' : 'cursor-crosshair'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex flex-col gap-2">
        <button
          onClick={() => setZoom((z) => Math.min(5, z * 1.2))}
          className="px-3 py-1 text-sm font-semibold bg-blue-500 text-white rounded hover:bg-blue-600"
          title="Zoom In"
        >
          +
        </button>
        <div className="text-center text-xs font-medium text-gray-700 px-1">
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={() => setZoom((z) => Math.max(0.1, z * 0.8))}
          className="px-3 py-1 text-sm font-semibold bg-blue-500 text-white rounded hover:bg-blue-600"
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPanOffset({ x: 0, y: 0 });
          }}
          className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          title="Reset View"
        >
          Reset
        </button>
      </div>

      {/* Pan Instructions */}
      <div className="absolute top-4 right-4 bg-white/90 rounded-lg shadow-sm border border-gray-200 px-3 py-2 text-xs text-gray-600">
        <div className="font-semibold mb-1">Controls:</div>
        <div>🖱️ Scroll: Zoom</div>
        <div>⇧ Shift+Drag: Pan</div>
      </div>
    </div>
  );
});
