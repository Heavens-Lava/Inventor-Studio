import { useState, useCallback, useEffect, useRef } from 'react';
import { DrawingCanvas, DrawingTool, DrawingElement } from './DrawingCanvas';
import { DrawingToolbar } from './DrawingToolbar';
import { recognizeHandwriting, smoothPath, improveTextWithLocalLLM } from '@/utils/handwritingRecognition';
import { toast } from 'sonner';

interface DrawingEditorProps {
  drawingData?: DrawingElement[];
  onChange?: (data: DrawingElement[]) => void;
  onTextRecognized?: (text: string) => void;
}

export function DrawingEditor({ drawingData = [], onChange, onTextRecognized }: DrawingEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<DrawingTool>('pen');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('transparent');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [showGrid, setShowGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [elements, setElements] = useState<DrawingElement[]>(drawingData);
  const [history, setHistory] = useState<DrawingElement[][]>([drawingData]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Update elements when drawingData prop changes
  useEffect(() => {
    if (drawingData && drawingData.length > 0 && elements.length === 0) {
      setElements(drawingData);
      setHistory([drawingData]);
      setHistoryIndex(0);
    }
  }, [drawingData, elements.length]);

  // Handle canvas changes
  const handleCanvasChange = useCallback(
    (newElements: DrawingElement[]) => {
      setElements(newElements);

      // Add to history (remove any future states if we're not at the end)
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newElements);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      // Notify parent
      onChange?.(newElements);
    },
    [history, historyIndex, onChange]
  );

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const previousElements = history[newIndex];
      setElements(previousElements);
      onChange?.(previousElements);
    }
  }, [history, historyIndex, onChange]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextElements = history[newIndex];
      setElements(nextElements);
      onChange?.(nextElements);
    }
  }, [history, historyIndex, onChange]);

  // Clear canvas
  const handleClear = useCallback(() => {
    if (confirm('Are you sure you want to clear the canvas?')) {
      const emptyElements: DrawingElement[] = [];
      setElements(emptyElements);
      setHistory([...history.slice(0, historyIndex + 1), emptyElements]);
      setHistoryIndex(historyIndex + 1);
      onChange?.(emptyElements);
    }
  }, [history, historyIndex, onChange]);

  // OCR - Convert handwriting to text
  const handleOCR = useCallback(async () => {
    if (!canvasRef.current || elements.length === 0) {
      toast.error('No handwriting to recognize');
      return;
    }

    setIsProcessing(true);
    toast.info('Recognizing handwriting...');

    try {
      const text = await recognizeHandwriting(canvasRef.current, (progress) => {
        console.log('OCR Progress:', Math.round(progress * 100) + '%');
      });

      if (text) {
        toast.success('Handwriting recognized!');
        onTextRecognized?.(text);
      } else {
        toast.warning('No text recognized');
      }
    } catch (error) {
      console.error('OCR error:', error);
      toast.error('Failed to recognize handwriting');
    } finally {
      setIsProcessing(false);
    }
  }, [elements.length, onTextRecognized]);

  // Beautify - Smooth handwriting paths
  const handleBeautify = useCallback(() => {
    if (elements.length === 0) {
      toast.error('No handwriting to beautify');
      return;
    }

    setIsProcessing(true);
    toast.info('Beautifying handwriting...');

    try {
      const beautifiedElements = elements.map((element) => {
        if (element.type === 'pen' && element.points.length > 2) {
          return {
            ...element,
            points: smoothPath(element.points, 2),
          };
        }
        return element;
      });

      setElements(beautifiedElements);
      setHistory([...history.slice(0, historyIndex + 1), beautifiedElements]);
      setHistoryIndex(historyIndex + 1);
      onChange?.(beautifiedElements);

      toast.success('Handwriting beautified!');
    } catch (error) {
      console.error('Beautify error:', error);
      toast.error('Failed to beautify handwriting');
    } finally {
      setIsProcessing(false);
    }
  }, [elements, history, historyIndex, onChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  return (
    <div className="flex flex-col h-full">
      <DrawingToolbar
        tool={tool}
        onToolChange={setTool}
        strokeColor={strokeColor}
        onStrokeColorChange={setStrokeColor}
        fillColor={fillColor}
        onFillColorChange={setFillColor}
        strokeWidth={strokeWidth}
        onStrokeWidthChange={setStrokeWidth}
        showGrid={showGrid}
        onShowGridChange={setShowGrid}
        gridSize={gridSize}
        onGridSizeChange={setGridSize}
        snapToGrid={snapToGrid}
        onSnapToGridChange={setSnapToGrid}
        onClear={handleClear}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onOCR={handleOCR}
        onBeautify={handleBeautify}
        isProcessing={isProcessing}
      />
      <div className="flex-1 overflow-hidden p-4 bg-gray-50">
        <DrawingCanvas
          ref={canvasRef}
          tool={tool}
          strokeColor={strokeColor}
          fillColor={fillColor}
          strokeWidth={strokeWidth}
          showGrid={showGrid}
          gridSize={gridSize}
          snapToGrid={snapToGrid}
          canvasData={elements}
          onChange={handleCanvasChange}
        />
      </div>
    </div>
  );
}
