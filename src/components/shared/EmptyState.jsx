import React from 'react';
import { motion } from 'framer-motion';

export default function EmptyState({ icon = '🫙', title, subtitle, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 gap-4 text-center"
    >
      <span className="text-5xl opacity-40">{icon}</span>
      <div className="space-y-1">
        <p className="font-mono text-sm font-semibold text-foreground">{title}</p>
        {subtitle && <p className="text-sm text-muted-foreground max-w-xs mx-auto">{subtitle}</p>}
      </div>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </motion.div>
  );
}