import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import TypePickerModal from './TypePickerModal';

export default function UniversalAddButton({ externalOpen, onExternalClose }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (externalOpen) setOpen(true);
  }, [externalOpen]);

  // Keyboard shortcut: Cmd+Shift+N or Ctrl+Shift+N
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleClose = () => {
    setOpen(false);
    if (onExternalClose) onExternalClose();
  };

  return (
    <>
      {/* Mobile floating button — sits above bottom nav */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed left-1/2 -translate-x-1/2 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg md:hidden"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom) + 56px + 4px)',
          boxShadow: '0 0 20px rgba(171,255,79,0.35)',
        }}
        whileTap={{ scale: 0.92 }}
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </motion.button>

      {/* Desktop floating button — bottom-right */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground items-center justify-center shadow-lg hidden md:flex"
        style={{
          bottom: 24,
          right: 24,
          boxShadow: '0 0 20px rgba(171,255,79,0.35)',
        }}
        whileHover={{ scale: 1.08, boxShadow: '0 0 28px rgba(171,255,79,0.5)' }}
        whileTap={{ scale: 0.92 }}
        title="New entry (Ctrl+Shift+N)"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </motion.button>

      <TypePickerModal open={open} onClose={handleClose} />
    </>
  );
}