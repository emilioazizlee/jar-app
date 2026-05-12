import React, { useMemo } from 'react';
import { SPEND_CATEGORIES } from '@/lib/constants';
import { cleanLabel, isUUID } from '@/lib/labelUtils';
import { X } from 'lucide-react';
import ChartRangeSelector from '@/components/charts/ChartRangeSelector';


export default function InsightsFilterBar({ filters, onChange, items = [] }) {

  // Build category list from actual data — skip UUIDs
  const availableCategories = useMemo(() => {
    const cats = new Set();
    items.forEach(i => {
      if (i.category && !isUUID(i.category)) {
        cats.add(i.category === 'cigarettes_health' ? 'cigarettes' : i.category);
      }
      if (i.type && !isUUID(i.type)) {
        cats.add(i.type);
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
        <ChartRangeSelector
          value={filters.range}
          onChange={(r) => onChange({ ...filters, range: r })}
          color="#abff4f"
        />
      </div>

      {/* Category filter chips */}
      {availableCategories.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-mono text-[10px] uppercase tracking-[2px] text-[#7a7a7a] mr-1 shrink-0">FILTER</span>
          {availableCategories.slice(0, 12).map(c => {
            const active = filters.categories.includes(c.key);
            return (
              <button
                key={c.key}
                onClick={() => toggleCategory(c.key)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-[11px] border transition-all"
                style={active ? {
                  background: 'rgba(255,238,50,0.15)',
                  borderColor: 'rgba(255,238,50,0.5)',
                  color: '#ffee32',
                } : {
                  background: 'transparent',
                  borderColor: '#1f1f1f',
                  color: '#7a7a7a',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#fff'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = '#1f1f1f'; e.currentTarget.style.color = '#7a7a7a'; } }}
              >
                {c.label}
                {active && <X className="w-2.5 h-2.5 ml-0.5 opacity-80" />}
              </button>
            );
          })}
          {filters.categories.length > 0 && (
            <button
              onClick={() => onChange({ ...filters, categories: [] })}
              className="px-2.5 py-1 rounded-full font-mono text-[11px] border border-[#2a2a2a] text-[#7a7a7a] hover:text-foreground hover:border-[#3a3a3a] transition-all"
            >
              CLEAR ALL
            </button>
          )}
        </div>
      )}
    </div>
  );
}