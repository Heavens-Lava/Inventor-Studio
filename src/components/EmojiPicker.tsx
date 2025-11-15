import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Smile } from 'lucide-react';

const emojiCategories = {
  'Goals & Success': ['🎯', '🏆', '⭐', '💎', '🌟', '✨', '🔥', '💪', '🚀', '📈'],
  'Learning & Work': ['📚', '💼', '🎓', '✍️', '💡', '🔬', '🎨', '🎵', '🎬', '📊'],
  'Health & Fitness': ['💪', '🏃', '🧘', '🥗', '🍎', '⚽', '🏋️', '🚴', '🏊', '🧗'],
  'Money & Career': ['💰', '💵', '💸', '💳', '📈', '💼', '🏢', '📊', '💹', '🎯'],
  'Emotions': ['😊', '😎', '🤔', '😃', '🥳', '😍', '🤗', '😌', '🙌', '👍'],
  'Nature & Travel': ['🌍', '✈️', '🏖️', '🏔️', '🌊', '🌳', '🌺', '🌈', '⛰️', '🏝️'],
  'Food & Drink': ['☕', '🍕', '🍔', '🥗', '🍎', '🍇', '🥑', '🍰', '🍿', '🥤'],
  'Objects': ['📱', '💻', '⌚', '🔧', '🔑', '📝', '📅', '🎁', '🏠', '🚗'],
};

interface EmojiPickerProps {
  value?: string;
  onSelect: (emoji: string) => void;
  trigger?: React.ReactNode;
}

export function EmojiPicker({ value, onSelect, trigger }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="h-8">
            {value || <Smile className="w-4 h-4" />}
            <span className="ml-2 text-xs">{value ? 'Change' : 'Add emoji'}</span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="max-h-96 overflow-y-auto p-3">
          {Object.entries(emojiCategories).map(([category, emojis]) => (
            <div key={category} className="mb-4">
              <h4 className="text-xs font-semibold text-gray-600 mb-2">{category}</h4>
              <div className="grid grid-cols-10 gap-1">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleSelect(emoji)}
                    className="text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {value && (
            <div className="border-t pt-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleSelect('')}
              >
                Remove emoji
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
