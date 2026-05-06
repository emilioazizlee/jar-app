import React from 'react';

const RANGES = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'quarter', label: 'Quarter' },
  { key: 'year', label: 'Year' },
];

/**
 * Range selector pill chips for charts.
 * Props:
 *   value       current range key
 *   onChange    (rangeKey) => void
 *   color       accent color for selected state (hex)
 *   storageKey  localStorage key to persist selection (optional)
 */
export default function ChartRangeSelector({ value, onChange, color = '#abff4f', storageKey }) {
  const handleChange = (key) => {
    if (storageKey) localStorage.setItem(storageKey, key);
    onChange(key);
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {RANGES.map(r => {
        const active = value === r.key;
        return (
          <button
            key={r.key}
            onClick={() => handleChange(r.key)}
            className="px-3 py-1 rounded-full font-mono text-[11px] border transition-all"
            style={active ? {
              background: `${color}22`,
              borderColor: `${color}66`,
              color: color,
            } : {
              background: 'transparent',
              borderColor: '#1f1f1f',
              color: '#7a7a7a',
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#fff'; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = '#1f1f1f'; e.currentTarget.style.color = '#7a7a7a'; } }}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}