import React from 'react';

const OPTIONS = [
  { value: 'A', label: 'Steps only', desc: 'Linear steps / tasks within the project' },
  { value: 'B', label: 'Steps + Sub-projects', desc: 'Both top-level steps and nested sub-projects' },
  { value: 'C', label: 'Sub-projects only', desc: 'Nested sub-projects with no direct steps' },
];

export default function StructurePicker({ value, onChange }) {
  return (
    <div>
      <p className="mono-header text-[10px] text-muted-foreground mb-2">STRUCTURE</p>
      <div className="flex flex-col gap-2">
        {OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
              value === opt.value
                ? 'border-primary bg-primary/10'
                : 'border-border bg-muted/40 hover:border-border/80'
            }`}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold transition-all ${
              value === opt.value ? 'border-primary text-primary' : 'border-muted-foreground text-muted-foreground'
            }`}>
              {opt.value}
            </div>
            <div>
              <p className={`text-sm font-mono font-medium ${value === opt.value ? 'text-primary' : 'text-foreground'}`}>
                {opt.label}
              </p>
              <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}