import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import TypePickerModal from './TypePickerModal';

export default function UniversalAddButton({ externalOpen, onExternalClose }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (externalOpen) setOpen(true);
  }, [externalOpen]);

  const handleClose = () => {
    setOpen(false);
    if (onExternalClose) onExternalClose();
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed left-1/2 -translate-x-1/2 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom) + 14px)',
        }}
        whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(171,255,79,0.4)' }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </motion.button>

      <TypePickerModal open={open} onClose={handleClose} />
    </>
  );
}