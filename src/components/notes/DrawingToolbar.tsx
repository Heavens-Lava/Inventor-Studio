import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Pencil,
  Square,
  Circle,
  Minus,
  Eraser,
  Grid3x3,
  Trash2,
  Undo,
  Redo,
} from 'lucide-react';
import { DrawingTool } from './DrawingCanvas';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DrawingToolbarProps {
  tool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  strokeColor: string;
  onStrokeColorChange: (color: string) => void;
  fillColor: string;
  onFillColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  showGrid: boolean;
  onShowGridChange: (show: boolean) => void;
  gridSize: number;
  onGridSizeChange: (size: number) => void;
  snapToGrid: boolean;
  onSnapToGridChange: (snap: boolean) => void;
  onClear: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const COMMON_COLORS = [
  '#000000', // Black
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#eab308', // Yellow
  '#a855f7', // Purple
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#ffffff', // White
];

const GRID_SIZES = [
  { label: 'Small (10px)', value: 10 },
  { label: 'Medium (20px)', value: 20 },
  { label: 'Large (40px)', value: 40 },
  { label: 'Extra Large (60px)', value: 60 },
];

export function DrawingToolbar({
  tool,
  onToolChange,
  strokeColor,
  onStrokeColorChange,
  fillColor,
  onFillColorChange,
  strokeWidth,
  onStrokeWidthChange,
  showGrid,
  onShowGridChange,
  gridSize,
  onGridSizeChange,
  snapToGrid,
  onSnapToGridChange,
  onClear,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: DrawingToolbarProps) {
  return (
    <TooltipProvider>
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10 p-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Undo/Redo */}
          {onUndo && onRedo && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onUndo}
                    disabled={!canUndo}
                  >
                    <Undo className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Undo (Ctrl+Z)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRedo}
                    disabled={!canRedo}
                  >
                    <Redo className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Redo (Ctrl+Y)</p>
                </TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6" />
            </>
          )}

          {/* Drawing Tools */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={tool === 'pen' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onToolChange('pen')}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Pen Tool</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={tool === 'line' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onToolChange('line')}
              >
                <Minus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Line Tool</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={tool === 'rectangle' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onToolChange('rectangle')}
              >
                <Square className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Rectangle Tool</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={tool === 'circle' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onToolChange('circle')}
              >
                <Circle className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Circle Tool</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={tool === 'eraser' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onToolChange('eraser')}
              >
                <Eraser className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Eraser Tool</p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6" />

          {/* Stroke Color */}
          <div className="flex items-center gap-2">
            <Label className="text-xs">Stroke:</Label>
            <div className="flex gap-1">
              {COMMON_COLORS.map((color) => (
                <button
                  key={`stroke-${color}`}
                  className={`w-6 h-6 rounded border-2 ${
                    strokeColor === color ? 'border-blue-500' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onStrokeColorChange(color)}
                  title={color}
                />
              ))}
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => onStrokeColorChange(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer"
                title="Custom color"
              />
            </div>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Fill Color */}
          <div className="flex items-center gap-2">
            <Label className="text-xs">Fill:</Label>
            <div className="flex gap-1">
              <button
                className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                  fillColor === 'transparent' ? 'border-blue-500' : 'border-gray-300'
                }`}
                onClick={() => onFillColorChange('transparent')}
                title="No fill"
              >
                <div className="w-4 h-0.5 bg-red-500 rotate-45" />
              </button>
              {COMMON_COLORS.map((color) => (
                <button
                  key={`fill-${color}`}
                  className={`w-6 h-6 rounded border-2 ${
                    fillColor === color ? 'border-blue-500' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onFillColorChange(color)}
                  title={color}
                />
              ))}
              <input
                type="color"
                value={fillColor === 'transparent' ? '#ffffff' : fillColor}
                onChange={(e) => onFillColorChange(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer"
                title="Custom fill color"
              />
            </div>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Stroke Width */}
          <div className="flex items-center gap-2 min-w-[150px]">
            <Label className="text-xs">Width:</Label>
            <Slider
              value={[strokeWidth]}
              onValueChange={(values) => onStrokeWidthChange(values[0])}
              min={1}
              max={20}
              step={1}
              className="flex-1"
            />
            <span className="text-xs w-6 text-right">{strokeWidth}</span>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Grid Controls */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showGrid ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onShowGridChange(!showGrid)}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Grid</p>
            </TooltipContent>
          </Tooltip>

          {showGrid && (
            <>
              <Select
                value={gridSize.toString()}
                onValueChange={(value) => onGridSizeChange(parseInt(value))}
              >
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRID_SIZES.map((size) => (
                    <SelectItem key={size.value} value={size.value.toString()}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={snapToGrid ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => onSnapToGridChange(!snapToGrid)}
                  >
                    <span className="text-xs font-semibold">SNAP</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Snap to Grid</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}

          <Separator orientation="vertical" className="h-6" />

          {/* Clear Canvas */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onClear} className="text-red-600">
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clear Canvas</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
