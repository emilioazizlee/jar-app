import React from 'react';

/**
 * Renders a category icon regardless of type: emoji, library name, or custom URL.
 * Props: iconType ("emoji"|"library"|"custom"), iconValue (string), size (number), color (string)
 */
export default function CategoryIcon({ iconType = 'emoji', iconValue = '📦', size = 20, color, style = {} }) {
  if (!iconValue) return <span style={{ fontSize: size, lineHeight: 1, ...style }}>📦</span>;

  if (iconType === 'emoji' || (!iconType && iconValue.length <= 4)) {
    return <span style={{ fontSize: size * 0.85, lineHeight: 1, ...style }}>{iconValue}</span>;
  }

  if (iconType === 'custom') {
    return (
      <img
        src={iconValue}
        alt=""
        style={{ width: size, height: size, borderRadius: 4, objectFit: 'cover', flexShrink: 0, ...style }}
      />
    );
  }

  // library - show abbreviated text badge as fallback (no dynamic imports needed)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: 4,
      background: color ? `${color}22` : 'rgba(255,255,255,0.08)',
      color: color || '#888',
      fontSize: Math.max(8, size * 0.35),
      fontFamily: 'JetBrains Mono, monospace',
      fontWeight: 700,
      flexShrink: 0,
      ...style,
    }}>
      {iconValue.slice(0, 2).toUpperCase()}
    </span>
  );
}