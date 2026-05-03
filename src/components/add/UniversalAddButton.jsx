import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import TypePickerModal from './TypePickerModal';

export default function UniversalAddButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
        whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(57, 255, 20, 0.4)' }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </motion.button>

      <TypePickerModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}