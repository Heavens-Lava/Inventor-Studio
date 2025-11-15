import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { useEffect, useState } from 'react';
import { EditorToolbar } from './EditorToolbar';
import { EditorBubbleMenu } from './EditorBubbleMenu';
import { DrawingEditor } from './DrawingEditor';
import type { DrawingElement } from '@/types/note';
import { Button } from '@/components/ui/button';
import { FileText, Pen } from 'lucide-react';

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

  if (!editor) {
    return null;
  }

  return (
    <div className="note-editor flex flex-col h-full">
      {/* Mode Switcher */}
      {editable && (
        <div className="border-b border-gray-200 bg-white px-2 py-1 flex items-center gap-2">
          <Button
            variant={mode === 'text' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setMode('text')}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            Text
          </Button>
          <Button
            variant={mode === 'drawing' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setMode('drawing')}
            className="gap-2"
          >
            <Pen className="w-4 h-4" />
            Drawing
          </Button>
        </div>
      )}

      {/* Text Editor Mode */}
      {mode === 'text' && (
        <>
          {editable && <EditorToolbar editor={editor} />}
          {editable && <EditorBubbleMenu editor={editor} />}
          <div className="flex-1 overflow-y-auto">
            <EditorContent editor={editor} />
          </div>
        </>
      )}

      {/* Drawing Mode */}
      {mode === 'drawing' && (
        <div className="flex-1 overflow-hidden">
          <DrawingEditor drawingData={drawingData} onChange={onDrawingChange} />
        </div>
      )}
    </div>
  );
}
