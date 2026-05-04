import React from 'react';

/** Renders a styled keyboard key badge */
export default function KbdKey({ children }) {
  return (
    <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 rounded border border-white/20 bg-white/5 font-mono text-[11px] text-foreground leading-none min-w-[1.4rem]">
      {children}
    </kbd>
  );
}