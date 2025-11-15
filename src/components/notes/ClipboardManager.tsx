import { useState, useEffect, useCallback } from 'react';
import { Clipboard, X, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';

interface ClipboardItem {
  id: string;
  content: string;
  timestamp: number;
}

const MAX_HISTORY = 20;
const STORAGE_KEY = 'clipboard-history';

export function ClipboardManager() {
  const [history, setHistory] = useState<ClipboardItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load clipboard history:', error);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = useCallback((newHistory: ClipboardItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      console.error('Failed to save clipboard history:', error);
    }
  }, []);

  // Listen for copy/cut events
  useEffect(() => {
    const handleCopy = async (e: ClipboardEvent) => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 0) {
        const newItem: ClipboardItem = {
          id: Date.now().toString(),
          content: text,
          timestamp: Date.now(),
        };

        setHistory((prev) => {
          // Remove duplicates and limit size
          const filtered = prev.filter((item) => item.content !== text);
          const newHistory = [newItem, ...filtered].slice(0, MAX_HISTORY);
          saveHistory(newHistory);
          return newHistory;
        });
      }
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCopy);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCopy);
    };
  }, [saveHistory]);

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Copied to clipboard');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to copy');
      console.error('Copy failed:', error);
    }
  };

  const removeItem = (id: string) => {
    const newHistory = history.filter((item) => item.id !== id);
    saveHistory(newHistory);
  };

  const clearHistory = () => {
    if (confirm('Clear all clipboard history?')) {
      saveHistory([]);
      toast.success('Clipboard history cleared');
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          title="Clipboard History"
        >
          <Clipboard className="w-4 h-4" />
          {history.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {history.length > 9 ? '9+' : history.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clipboard className="w-4 h-4" />
            <h3 className="font-semibold text-sm">Clipboard History</h3>
          </div>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="h-7 px-2 text-xs"
            >
              Clear All
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Clipboard className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No clipboard history yet</p>
            <p className="text-xs mt-1">Copy text to see it here</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="p-2 space-y-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="group p-3 rounded-md hover:bg-gray-100 cursor-pointer flex items-start gap-2"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(item.content)}
                    className="flex-1 h-auto p-0 justify-start text-left hover:bg-transparent"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2 break-words">
                        {item.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimestamp(item.timestamp)}
                      </p>
                    </div>
                  </Button>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(item.content)}
                      className="h-7 w-7 p-0"
                      title="Copy"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
