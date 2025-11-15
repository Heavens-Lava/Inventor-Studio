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
import { Pencil, Type } from 'lucide-react';

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
  const [mode, setMode] = useState<'text' | 'drawing'>('text');

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

  return (
    <div className="note-editor flex flex-col h-full">
      {/* Mode Toggle */}
      {editable && (
        <div className="border-b border-gray-200 bg-white px-4 py-2 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Mode:</span>
          <div className="flex gap-1">
            <Button
              variant={mode === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('text')}
              className="gap-2"
            >
              <Type className="w-4 h-4" />
              Text
            </Button>
            <Button
              variant={mode === 'drawing' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('drawing')}
              className="gap-2"
            >
              <Pencil className="w-4 h-4" />
              Drawing
            </Button>
          </div>
          <span className="text-xs text-gray-500 ml-2">
            {mode === 'text'
              ? 'Type your notes - drawing layer is visible below'
              : 'Draw on the canvas - text is visible below'}
          </span>
        </div>
      )}

      {/* Integrated Editor with Overlay Canvas */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Text Editor Layer */}
        <div
          className={`absolute inset-0 flex flex-col ${
            mode === 'drawing' ? 'pointer-events-none opacity-70' : ''
          }`}
        >
          {editable && <EditorToolbar editor={editor} />}
          {editable && mode === 'text' && <EditorBubbleMenu editor={editor} />}
          <div className="flex-1 overflow-y-auto">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Drawing Canvas Layer (Overlay) */}
        <div
          className={`absolute inset-0 flex flex-col ${
            mode === 'text' ? 'pointer-events-none' : ''
          }`}
          style={{
            backgroundColor: mode === 'drawing' ? 'rgba(255, 255, 255, 0.95)' : 'transparent'
          }}
        >
          <DrawingEditor
            drawingData={drawingData}
            onChange={onDrawingChange}
            onTextRecognized={handleTextRecognized}
          />
        </div>
      </div>
    </div>
  );
}
