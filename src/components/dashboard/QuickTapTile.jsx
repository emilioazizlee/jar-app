import React from 'react';
import { motion } from 'framer-motion';
import JarVisual from '../jar/JarVisual';

export default function QuickTapTile({ label, icon, todayCount, color = '#abff4f', onClick, delay = 0 }) {
  const fillPercent = (todayCount % 10) * 10;
  const completedJars = Math.floor(todayCount / 10);

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-card border border-border rounded-2xl p-3 md:p-4 flex flex-col items-center gap-1.5 md:gap-2 hover:border-primary/30 transition-all active:scale-95 min-h-[44px]"
    >
      <span className="text-2xl">{icon}</span>
      <JarVisual fillPercent={fillPercent} completedJars={completedJars} size="sm" color={color} showLabel={false} />
      <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
      <span className="font-mono text-lg font-bold text-foreground">{todayCount}</span>
    </motion.button>
  );
}