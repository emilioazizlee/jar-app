// /src/components/settings/InlineSelect.jsx
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function InlineSelect({ options = [], value, onChange, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          px-3 py-1.5 rounded border
          text-xs font-medium
          transition-colors duration-200
          flex items-center gap-2
          bg-sidebar-muted border-sidebar-border
          hover:bg-sidebar-muted-hover
        `}
      >
        <span>{selectedOption?.label}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-card border border-sidebar-border rounded shadow-lg z-10 min-w-48">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange?.(opt.value);
                setIsOpen(false);
              }}
              className={`
                w-full text-left px-3 py-2 text-xs
                transition-colors duration-150
                ${value === opt.value
                  ? 'bg-primary bg-opacity-10 text-primary font-medium'
                  : 'text-foreground hover:bg-sidebar-muted'
                }
                first:rounded-t last:rounded-b
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
