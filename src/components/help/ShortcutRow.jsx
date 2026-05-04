import React from 'react';
import KbdKey from './KbdKey';

const isMac = typeof navigator !== 'undefined' && navigator.platform.startsWith('Mac');

export default function ShortcutRow({ shortcut }) {
  const keys = (isMac || !shortcut.win) ? shortcut.keys : shortcut.win;

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
      <span className="text-sm text-muted-foreground">{shortcut.description}</span>
      <div className="flex items-center gap-1 ml-4 shrink-0">
        {keys.map((k, i) => (
          <React.Fragment key={i}>
            <KbdKey>{k}</KbdKey>
            {i < keys.length - 1 && <span className="text-muted-foreground text-xs">+</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}