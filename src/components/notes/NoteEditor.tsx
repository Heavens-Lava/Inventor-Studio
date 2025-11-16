import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { Image } from '@tiptap/extension-image';
import { common, createLowlight } from 'lowlight';
import { useEffect, useCallback, useState, useRef } from 'react';
import { EditorToolbar } from './EditorToolbar';
import { EditorBubbleMenu } from './EditorBubbleMenu';
import { DrawingEditor } from './DrawingEditor';
import type { DrawingElement } from '@/types/note';
import { Button } from '@/components/ui/button';
import { Pencil, Type, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle, ImperativePanelHandle } from 'react-resizable-panels';

// Create lowlight instance for syntax highlighting
const lowlight = createLowlight(common);

interface NoteEditorProps {
  content: string;
  onChange: (content: string) => void;
  drawingData?: DrawingElement[];
  onDrawingChange?: (data: DrawingElement[]) => void;
  placeholder?: string;
  editable?: boolean;
}

export function NoteEditor({
  content,
  onChange,
  drawingData = [],
  onDrawingChange,
  placeholder = 'Start typing your note...',
  editable = true,
}: NoteEditorProps) {
  const [isTextCollapsed, setIsTextCollapsed] = useState(false);
  const [isDrawingCollapsed, setIsDrawingCollapsed] = useState(false);
  const [isPanelsSwapped, setIsPanelsSwapped] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState<'text' | 'drawing' | null>(null);

  // Refs for programmatic panel control
  const textPanelRef = useRef<ImperativePanelHandle>(null);
  const drawingPanelRef = useRef<ImperativePanelHandle>(null);

  // Track panel sizes before collapse to restore them
  const textPanelSizeRef = useRef<number>(50);
  const drawingPanelSizeRef = useRef<number>(50);

  const handleDragStart = (e: React.DragEvent, panelType: 'text' | 'drawing') => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', panelType);
  };

  const handleDragOver = (e: React.DragEvent, panelType: 'text' | 'drawing') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDraggingOver(panelType);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(null);
  };

  const handleDrop = (e: React.DragEvent, targetPanel: 'text' | 'drawing') => {
    e.preventDefault();
    const sourcePanel = e.dataTransfer.getData('text/plain') as 'text' | 'drawing';

    if (sourcePanel !== targetPanel) {
      setIsPanelsSwapped(!isPanelsSwapped);
    }

    setIsDraggingOver(null);
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        codeBlock: false, // Disable default code block to use CodeBlockLowlight
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer hover:text-blue-700',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2',
        },
      }),
      Table.configure({
        resizable: true,
        allowTableNodeSelection: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-4 border-2 border-gray-400 relative',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'hover:bg-gray-50 transition-colors',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-400 bg-blue-50 font-semibold p-3 text-left min-w-[100px] hover:bg-blue-100 transition-colors',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 p-3 min-w-[100px] hover:bg-gray-50 transition-colors',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-gray-900 text-gray-100 rounded-lg p-4 my-4 overflow-x-auto',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[500px] p-6 [&_table]:table-fixed [&_td]:cursor-text [&_th]:cursor-text',
      },
      handleDOMEvents: {
        // Improve table cell selection
        mousedown: (view, event) => {
          const target = event.target as HTMLElement;
          if (target.tagName === 'TD' || target.tagName === 'TH') {
            // Let Tiptap handle the click for table cells
            return false;
          }
          return false;
        },
      },
    },
  });

  // Update editor content when prop changes (but not from the editor itself)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  // Handle OCR text recognition
  const handleTextRecognized = useCallback((text: string) => {
    if (editor && text) {
      // Insert the recognized text at the end of the document
      editor.commands.focus('end');
      editor.commands.insertContent(`<p><strong>Recognized Text:</strong></p><p>${text}</p>`);
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  const textPanel = (
    <Panel
      ref={textPanelRef}
      defaultSize={50}
      minSize={20}
      collapsible={true}
      onCollapse={() => {
        // Save current size before collapsing
        const currentSize = textPanelRef.current?.getSize();
        if (currentSize) {
          textPanelSizeRef.current = currentSize;
        }
        setIsTextCollapsed(true);
      }}
      onExpand={() => setIsTextCollapsed(false)}
      onResize={(size) => {
        // Track size changes when not collapsed
        if (!isTextCollapsed) {
          textPanelSizeRef.current = size;
        }
      }}
    >
      <div
        className="flex flex-col h-full bg-white border-r-2 border-gray-300"
        onDragOver={(e) => handleDragOver(e, 'text')}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 'text')}
      >
        <div
          className={`border-b border-gray-200 px-3 py-2 bg-gradient-to-r from-blue-50 to-white cursor-move transition-all ${
            isDraggingOver === 'text' ? 'ring-2 ring-blue-400 bg-blue-100' : ''
          }`}
          draggable
          onDragStart={(e) => handleDragStart(e, 'text')}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-400" />
            <Type className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Text Editor</h3>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-6 w-6 p-0"
              onClick={() => textPanelRef.current?.collapse()}
              title="Collapse Text Editor"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {editable && <EditorToolbar editor={editor} />}
        {editable && <EditorBubbleMenu editor={editor} />}
        <div className="flex-1 overflow-y-auto">
          <EditorContent editor={editor} />
        </div>
      </div>
    </Panel>
  );

  const drawingPanel = (
    <Panel
      ref={drawingPanelRef}
      defaultSize={50}
      minSize={20}
      collapsible={true}
      onCollapse={() => {
        // Save current size before collapsing
        const currentSize = drawingPanelRef.current?.getSize();
        if (currentSize) {
          drawingPanelSizeRef.current = currentSize;
        }
        setIsDrawingCollapsed(true);
      }}
      onExpand={() => setIsDrawingCollapsed(false)}
      onResize={(size) => {
        // Track size changes when not collapsed
        if (!isDrawingCollapsed) {
          drawingPanelSizeRef.current = size;
        }
      }}
    >
      <div
        className="flex flex-col h-full bg-white"
        onDragOver={(e) => handleDragOver(e, 'drawing')}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 'drawing')}
      >
        <div
          className={`border-b border-gray-200 px-3 py-2 bg-gradient-to-r from-purple-50 to-white cursor-move transition-all ${
            isDraggingOver === 'drawing' ? 'ring-2 ring-purple-400 bg-purple-100' : ''
          }`}
          draggable
          onDragStart={(e) => handleDragStart(e, 'drawing')}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-400" />
            <Pencil className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-800">Drawing Canvas</h3>
            <span className="text-xs text-gray-500 ml-auto">Infinite canvas with zoom & pan</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => drawingPanelRef.current?.collapse()}
              title="Collapse Drawing Canvas"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <DrawingEditor
          key={`drawing-${JSON.stringify(drawingData?.slice(0, 1))}`}
          drawingData={drawingData}
          onChange={onDrawingChange}
          onTextRecognized={handleTextRecognized}
        />
      </div>
    </Panel>
  );

  return (
    <div className="note-editor h-full bg-gray-50 relative">
      {/* Expand Buttons (shown when panels are collapsed) */}
      {isTextCollapsed && (
        <Button
          variant="outline"
          size="sm"
          className="absolute top-1/2 left-2 transform -translate-y-1/2 z-10 shadow-lg bg-white"
          onClick={() => {
            textPanelRef.current?.expand();
            // Restore previous size after a brief delay to let expand complete
            setTimeout(() => {
              textPanelRef.current?.resize(textPanelSizeRef.current);
            }, 0);
          }}
          title="Expand Text Editor"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
      {isDrawingCollapsed && (
        <Button
          variant="outline"
          size="sm"
          className="absolute top-1/2 right-2 transform -translate-y-1/2 z-10 shadow-lg bg-white"
          onClick={() => {
            drawingPanelRef.current?.expand();
            // Restore previous size after a brief delay to let expand complete
            setTimeout(() => {
              drawingPanelRef.current?.resize(drawingPanelSizeRef.current);
            }, 0);
          }}
          title="Expand Drawing Canvas"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      )}

      <PanelGroup direction="horizontal" className="h-full">
        {isPanelsSwapped ? (
          <>
            {drawingPanel}
            {!isTextCollapsed && !isDrawingCollapsed && (
              <PanelResizeHandle className="w-1 bg-gray-300 hover:bg-blue-500 transition-colors cursor-col-resize" />
            )}
            {textPanel}
          </>
        ) : (
          <>
            {textPanel}
            {!isTextCollapsed && !isDrawingCollapsed && (
              <PanelResizeHandle className="w-1 bg-gray-300 hover:bg-blue-500 transition-colors cursor-col-resize" />
            )}
            {drawingPanel}
          </>
        )}
      </PanelGroup>
    </div>
  );
}
