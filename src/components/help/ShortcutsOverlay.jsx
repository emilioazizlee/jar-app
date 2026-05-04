import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SHORTCUT_SECTIONS } from '@/lib/shortcuts';
import ShortcutRow from './ShortcutRow';
import { Link } from 'react-router-dom';

export default function ShortcutsOverlay({ open, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const q = query.toLowerCase();
  const filtered = SHORTCUT_SECTIONS.map(section => ({
    ...section,
    shortcuts: section.shortcuts.filter(s =>
      !q || s.description.toLowerCase().includes(q) || s.keys.join(' ').toLowerCase().includes(q)
    ),
  })).filter(s => s.shortcuts.length > 0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <motion.div
            className="relative z-10 w-full max-w-2xl max-h-[85vh] flex flex-col bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <h2 className="font-mono text-lg font-bold text-primary tracking-widest uppercase">Keyboard Shortcuts</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="px-6 py-3 border-b border-border shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  placeholder="Search shortcuts..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="pl-9 bg-muted border-none h-9"
                />
              </div>
            </div>

            {/* Sections */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {filtered.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-8">No shortcuts match "{query}"</p>
              )}
              {filtered.map(section => (
                <div key={section.id}>
                  <p className="mono-header text-[10px] text-primary mb-2">{section.label}</p>
                  <div>
                    {section.shortcuts.map((s, i) => (
                      <ShortcutRow key={i} shortcut={s} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-border shrink-0 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Press <kbd className="font-mono bg-white/5 border border-white/20 px-1 rounded text-[10px]">Esc</kbd> to close</span>
              <Link to="/help" onClick={onClose} className="text-xs text-primary hover:underline">View full guide →</Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}