import { useState, KeyboardEvent } from 'react';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags?: string[];
  placeholder?: string;
}

export function TagInput({ tags, onTagsChange, availableTags = [], placeholder = 'Add tag...' }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = availableTags.filter(
    (tag) =>
      !tags.includes(tag) &&
      tag.toLowerCase().includes(inputValue.toLowerCase())
  );

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagsChange([...tags, trimmedTag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1 mb-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="px-2 py-1 text-xs flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200"
          >
            <TagIcon className="w-3 h-3" />
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-blue-900 focus:outline-none"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className="flex-1 h-8 text-sm"
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => addTag(inputValue)}
          disabled={!inputValue.trim()}
          className="h-8 px-2"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Tag Suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
          {filteredSuggestions.map((tag) => (
            <button
              key={tag}
              onClick={() => addTag(tag)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <TagIcon className="w-3 h-3 text-gray-400" />
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
