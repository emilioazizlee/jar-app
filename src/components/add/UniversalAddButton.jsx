import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import TypePickerModal from './TypePickerModal';

export default function UniversalAddButton({ externalOpen, onExternalClose }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (externalOpen) setOpen(true);
  }, [externalOpen]);

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

      {/* Desktop floating button — bare icon, no background, no padding */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed z-40 hidden md:flex items-center justify-center"
        style={{ bottom: 28, right: 32, background: 'none', border: 'none', padding: 0, width: 'auto', height: 'auto', cursor: 'pointer' }}
        whileHover={{ scale: 1.3 }}
        whileTap={{ scale: 0.85 }}
        title="New entry (Ctrl+Shift+N)"
      >
        <Plus style={{ width: 24, height: 24, color: 'hsl(var(--primary))' }} strokeWidth={2} />
      </motion.button>

      <TypePickerModal open={open} onClose={handleClose} />
    </>
  );
}