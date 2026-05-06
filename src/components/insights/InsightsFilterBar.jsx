import React, { useMemo } from 'react';
import { SPEND_CATEGORIES } from '@/lib/constants';
import { cleanLabel, isUUID } from '@/lib/labelUtils';

const RANGES = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'quarter', label: 'Quarter' },
  { key: 'year', label: 'Year' },
];

export default function InsightsFilterBar({ filters, onChange, items = [] }) {
  // Build category list from actual data
  const availableCategories = useMemo(() => {
    const cats = new Set();
    items.forEach(i => {
      if (i.category && !isUUID(i.category)) {
        cats.add(i.category === 'cigarettes_health' ? 'cigarettes' : i.category);
      }
    });
    return [...cats].map(k => ({ key: k, label: cleanLabel(k) })).filter(c => c.label);
  }, [items]);

  const toggleCategory = (key) => {
    const cats = filters.categories.includes(key)
      ? filters.categories.filter(c => c !== key)
      : [...filters.categories, key];
    onChange({ ...filters, categories: cats });
  };

  return (
    <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border border-[#1f1f1f] rounded-xl p-3 space-y-2.5">
      {/* Time range */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-mono text-[10px] uppercase tracking-[2px] text-[#7a7a7a] mr-1 shrink-0">RANGE</span>
        {RANGES.map(r => (
          <button
            key={r.key}
            onClick={() => onChange({ ...filters, range: r.key })}
            className={`px-3 py-1 rounded-full font-mono text-[11px] transition-all border ${
              filters.range === r.key
                ? 'bg-primary/20 border-primary/40 text-primary'
                : 'border-[#2a2a2a] text-[#7a7a7a] hover:text-foreground hover:border-[#3a3a3a]'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Category filter chips */}
      {availableCategories.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[10px] uppercase tracking-[2px] text-[#7a7a7a] mr-1 shrink-0">FILTER</span>
          {availableCategories.slice(0, 10).map(c => (
            <button
              key={c.key}
              onClick={() => toggleCategory(c.key)}
              className={`px-3 py-1 rounded-full font-mono text-[11px] transition-all border ${
                filters.categories.includes(c.key)
                  ? 'bg-secondary/20 border-secondary/40 text-secondary'
                  : 'border-[#2a2a2a] text-[#7a7a7a] hover:text-foreground hover:border-[#3a3a3a]'
              }`}
            >
              {c.label}
            </button>
          ))}
          {filters.categories.length > 0 && (
            <button
              onClick={() => onChange({ ...filters, categories: [] })}
              className="px-3 py-1 rounded-full font-mono text-[11px] border border-[#3a3a3a] text-[#7a7a7a] hover:text-foreground transition-all"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}