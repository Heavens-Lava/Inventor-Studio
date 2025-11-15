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
    <div className="note-editor flex h-full bg-gray-50">
      {/* Left Panel - Text Editor */}
      <div className="w-1/2 flex flex-col bg-white border-r-2 border-gray-300">
        <div className="border-b border-gray-200 px-3 py-2 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Text Editor</h3>
          </div>
        </div>
        {editable && <EditorToolbar editor={editor} />}
        {editable && <EditorBubbleMenu editor={editor} />}
        <div className="flex-1 overflow-y-auto">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Right Panel - Drawing Canvas */}
      <div className="w-1/2 flex flex-col bg-white">
        <div className="border-b border-gray-200 px-3 py-2 bg-gradient-to-r from-purple-50 to-white">
          <div className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-800">Drawing Canvas</h3>
            <span className="text-xs text-gray-500 ml-auto">Infinite canvas with zoom & pan</span>
          </div>
        </div>
        <DrawingEditor
          key={`drawing-${JSON.stringify(drawingData?.slice(0, 1))}`}
          drawingData={drawingData}
          onChange={onDrawingChange}
          onTextRecognized={handleTextRecognized}
        />
      </div>
    </div>
  );
}
