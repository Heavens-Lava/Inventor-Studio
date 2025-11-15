import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { useEffect, useCallback, useState } from 'react';
import { EditorToolbar } from './EditorToolbar';
import { EditorBubbleMenu } from './EditorBubbleMenu';
import { DrawingEditor } from './DrawingEditor';
import type { DrawingElement } from '@/types/note';
import { Button } from '@/components/ui/button';
import { Pencil, Type, ChevronLeft, ChevronRight, ArrowLeftRight } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

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

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
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
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[500px] p-6',
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
      defaultSize={50}
      minSize={20}
      collapsible={true}
      collapsedSize={0}
      onCollapse={() => setIsTextCollapsed(true)}
      onExpand={() => setIsTextCollapsed(false)}
      className={isTextCollapsed ? 'hidden' : ''}
    >
      <div className="flex flex-col h-full bg-white border-r-2 border-gray-300">
        <div className="border-b border-gray-200 px-3 py-2 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Text Editor</h3>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-6 w-6 p-0"
              onClick={() => setIsTextCollapsed(true)}
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
      defaultSize={50}
      minSize={20}
      collapsible={true}
      collapsedSize={0}
      onCollapse={() => setIsDrawingCollapsed(true)}
      onExpand={() => setIsDrawingCollapsed(false)}
      className={isDrawingCollapsed ? 'hidden' : ''}
    >
      <div className="flex flex-col h-full bg-white">
        <div className="border-b border-gray-200 px-3 py-2 bg-gradient-to-r from-purple-50 to-white">
          <div className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-800">Drawing Canvas</h3>
            <span className="text-xs text-gray-500 ml-auto">Infinite canvas with zoom & pan</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsDrawingCollapsed(true)}
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
      {/* Swap Button */}
      <Button
        variant="outline"
        size="sm"
        className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 shadow-lg bg-white"
        onClick={() => setIsPanelsSwapped(!isPanelsSwapped)}
        title="Swap Panels"
      >
        <ArrowLeftRight className="w-4 h-4 mr-2" />
        Swap
      </Button>

      {/* Expand Buttons (shown when panels are collapsed) */}
      {isTextCollapsed && (
        <Button
          variant="outline"
          size="sm"
          className="absolute top-1/2 left-2 transform -translate-y-1/2 z-10 shadow-lg bg-white"
          onClick={() => setIsTextCollapsed(false)}
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
          onClick={() => setIsDrawingCollapsed(false)}
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
