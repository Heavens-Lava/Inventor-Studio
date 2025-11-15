import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { ClipboardManager } from './ClipboardManager';
import { ChartDialog } from './ChartDialog';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  CheckSquare,
  Table as TableIcon,
  FileCode,
  ImagePlus,
  Columns,
  Rows,
  Trash,
  Plus,
  Mic,
  MicOff,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');

        if (event.results[0].isFinal) {
          editor.commands.insertContent(transcript + ' ');
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [editor]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Try Chrome or Edge.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      editor.chain().focus().setImage({ src: base64 }).run();
    };
    reader.readAsDataURL(file);

    // Reset input value so same file can be selected again
    event.target.value = '';
  };

  const addImage = () => {
    const choice = window.confirm(
      'Click OK to upload from computer, or Cancel to enter image URL'
    );

    if (choice) {
      // Upload from computer
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => handleImageUpload(e as unknown as React.ChangeEvent<HTMLInputElement>);
      input.click();
    } else {
      // Enter URL
      const url = window.prompt('Enter image URL:');
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <TooltipProvider>
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10 flex flex-wrap items-center gap-1 p-2">
        {/* Undo/Redo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
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
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Redo (Ctrl+Y)</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Text Formatting */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Bold (Ctrl+B)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Italic (Ctrl+I)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Underline (Ctrl+U)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Strikethrough</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={editor.isActive('code') ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleCode().run()}
            >
              <Code className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Inline Code</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={editor.isActive('highlight') ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleHighlight().run()}
            >
              <Highlighter className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Highlight</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Headings */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={editor.isActive('heading', { level: 1 }) ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
              <Heading1 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Heading 1</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <Heading2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Heading 2</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={editor.isActive('heading', { level: 3 }) ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              <Heading3 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Heading 3</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Lists */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Bullet List</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Numbered List</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Blockquote</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={editor.isActive('taskList') ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleTaskList().run()}
            >
              <CheckSquare className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Task List</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Alignment */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={editor.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Align Left</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={editor.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Align Center</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={editor.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
            >
              <AlignRight className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Align Right</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={editor.isActive({ textAlign: 'justify' }) ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            >
              <AlignJustify className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Justify</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Link */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={editor.isActive('link') ? 'secondary' : 'ghost'}
              size="sm"
              onClick={setLink}
            >
              <LinkIcon className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Insert Link (Ctrl+K)</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Table */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={editor.isActive('table') ? 'secondary' : 'ghost'}
              size="sm"
              onClick={insertTable}
            >
              <TableIcon className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Insert Table</p>
          </TooltipContent>
        </Tooltip>

        {/* Table Controls - Only visible when in a table */}
        {editor.isActive('table') && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().addColumnBefore().run()}
                >
                  <Columns className="w-4 h-4" />
                  <Plus className="w-3 h-3 -ml-1" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Column Before</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                >
                  <Plus className="w-3 h-3 -mr-1" />
                  <Columns className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Column After</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                >
                  <Columns className="w-4 h-4" />
                  <Trash className="w-3 h-3 -ml-1" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Column</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().addRowBefore().run()}
                >
                  <Rows className="w-4 h-4" />
                  <Plus className="w-3 h-3 -ml-1" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Row Before</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                >
                  <Plus className="w-3 h-3 -mr-1" />
                  <Rows className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Row After</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().deleteRow().run()}
                >
                  <Rows className="w-4 h-4" />
                  <Trash className="w-3 h-3 -ml-1" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Row</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().deleteTable().run()}
                  className="text-red-600 hover:text-red-700"
                >
                  <TableIcon className="w-4 h-4" />
                  <Trash className="w-3 h-3 -ml-1" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Table</p>
              </TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6 mx-1" />
          </>
        )}

        {/* Code Block */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={editor.isActive('codeBlock') ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            >
              <FileCode className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Code Block</p>
          </TooltipContent>
        </Tooltip>

        {/* Image */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={addImage}
            >
              <ImagePlus className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Insert Image</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Voice Input */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isRecording ? 'default' : 'ghost'}
              size="sm"
              onClick={toggleVoiceInput}
              className={isRecording ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' : ''}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isRecording ? 'Stop Recording' : 'Voice Input (Speech-to-text)'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Clipboard Manager */}
        <ClipboardManager />

        {/* Chart Dialog */}
        <ChartDialog editor={editor} />
      </div>
    </TooltipProvider>
  );
}
