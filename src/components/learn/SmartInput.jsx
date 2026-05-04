/**
 * SmartInput — text input with frequency-based autocomplete + suggestion chips
 * Uses learningDB for all suggestions. No AI, no API.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { getSuggestions, getTopSuggestions } from '@/lib/learningDB';

export default function SmartInput({
  fieldKey,
  value,
  onChange,
  placeholder,
  className,
  showChips = true,
  chipsLimit = 4,
  autoFocus,
  onKeyDown,
  inputClassName,
  label,
  ...props
}) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const chips = getTopSuggestions(fieldKey, chipsLimit);

  useEffect(() => {
    if (value && value.length >= 1) {
      const s = getSuggestions(fieldKey, value, 8);
      setSuggestions(s.filter(x => x.toLowerCase() !== value.toLowerCase()));
    } else {
      setSuggestions(getSuggestions(fieldKey, '', 6));
    }
  }, [value, fieldKey]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (v) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div className="relative w-full">
      {/* Suggestion chips */}
      {showChips && chips.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {chips.filter(c => c !== value).slice(0, chipsLimit).map(chip => (
            <button
              key={chip}
              type="button"
              onClick={() => select(chip)}
              className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20 truncate max-w-[120px]"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={className || inputClassName}
          autoFocus={autoFocus}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
            onKeyDown && onKeyDown(e);
          }}
          {...props}
        />

        {/* Dropdown */}
        {open && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto"
          >
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={e => { e.preventDefault(); select(s); }}
                className="w-full text-left px-3 py-2 text-sm font-mono hover:bg-accent transition-colors text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}