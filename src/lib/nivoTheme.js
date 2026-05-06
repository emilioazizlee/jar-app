export const nivoTheme = {
  background: 'transparent',
  textColor: '#7a7a7a',
  fontSize: 11,
  fontFamily: 'JetBrains Mono, monospace',
  axis: {
    domain: { line: { stroke: '#1f1f1f' } },
    ticks: {
      line: { stroke: '#1f1f1f' },
      text: { fill: '#7a7a7a', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.6 },
    },
    legend: {
      text: { fill: '#ffffff', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' },
    },
  },
  grid: { line: { stroke: '#1f1f1f', strokeDasharray: '2 4' } },
  tooltip: {
    container: {
      background: '#141414',
      color: '#ffffff',
      fontSize: 12,
      borderRadius: 8,
      border: '1px solid #1f1f1f',
      padding: '10px 14px',
      fontFamily: 'JetBrains Mono, monospace',
    },
  },
  legends: {
    text: { fill: '#7a7a7a', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' },
  },
  crosshair: { line: { stroke: '#1f1f1f', strokeWidth: 1, strokeOpacity: 1 } },
};

/**
 * Build an integer-only tickValues array for count-based Y-axes.
 * Returns an array [0, 1, 2, … max], capped at maxTicks steps.
 */
export function intTickValues(max, maxTicks = 6) {
  const m = Math.max(1, Math.ceil(max));
  if (m <= maxTicks) return Array.from({ length: m + 1 }, (_, i) => i);
  const step = Math.ceil(m / maxTicks);
  const ticks = [];
  for (let i = 0; i <= m; i += step) ticks.push(i);
  if (ticks[ticks.length - 1] < m) ticks.push(m);
  return ticks;
}

/** Format integer tick — empty string for non-integers */
export function intTickFormat(v) {
  const n = Number(v);
  return Number.isInteger(n) ? String(n) : '';
}