import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const STORAGE_KEY = 'jar_shortcuts_tip_dismissed';
const isMac = typeof navigator !== 'undefined' && navigator.platform.startsWith('Mac');

/** One-time floating tip pointing users to ⌘? */
export default function ShortcutsTip() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show on desktop (width >= 768) — mobile has no keyboard shortcuts
    const isMobile = window.innerWidth < 768;
    if (!isMobile && !localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, '1');
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-card border border-primary/30 rounded-xl px-4 py-3 shadow-xl"
        >
          <span className="text-sm text-muted-foreground">
            Press{' '}
            <kbd className="font-mono bg-white/5 border border-white/20 px-1.5 py-0.5 rounded text-[11px] text-foreground">
              {isMac ? '⌘' : 'Ctrl'}
            </kbd>
            {' + '}
            <kbd className="font-mono bg-white/5 border border-white/20 px-1.5 py-0.5 rounded text-[11px] text-foreground">?</kbd>
            {' '}anytime to see all keyboard shortcuts
          </span>
          <button onClick={dismiss} className="text-muted-foreground hover:text-foreground ml-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}