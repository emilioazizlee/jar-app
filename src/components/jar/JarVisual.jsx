import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function JarVisual({ fillPercent = 0, completedJars = 0, label, size = 'md', color = '#39ff14', showLabel = true }) {
  const [animatedFill, setAnimatedFill] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedFill(fillPercent), 100);
    return () => clearTimeout(timer);
  }, [fillPercent]);

  const sizes = {
    sm: { w: 32, h: 44, text: 'text-xs' },
    md: { w: 48, h: 64, text: 'text-sm' },
    lg: { w: 64, h: 88, text: 'text-base' },
    xl: { w: 80, h: 110, text: 'text-lg' },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div className="flex items-end gap-1">
      {/* Completed jars */}
      <AnimatePresence>
        {Array.from({ length: Math.min(completedJars, 5) }).map((_, i) => (
          <motion.div
            key={`full-${i}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <SingleJar width={s.w * 0.6} height={s.h * 0.6} fill={100} color={color} opacity={0.5} />
          </motion.div>
        ))}
      </AnimatePresence>
      {completedJars > 5 && (
        <span className="font-mono text-xs text-muted-foreground mb-1">+{completedJars - 5}</span>
      )}

      {/* Current jar */}
      <div className="flex flex-col items-center gap-1">
        <SingleJar width={s.w} height={s.h} fill={animatedFill} color={color} />
        {showLabel && (
          <span className={`font-mono ${s.text} text-muted-foreground`}>
            {label || `${Math.round(animatedFill)}%`}
          </span>
        )}
      </div>
    </div>
  );
}

function SingleJar({ width, height, fill, color, opacity = 1 }) {
  const fillHeight = (fill / 100) * (height - 12);
  const isFlashing = fill >= 100;

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ opacity }}
      animate={isFlashing ? { filter: [`drop-shadow(0 0 6px ${color})`, `drop-shadow(0 0 2px ${color})`] } : {}}
      transition={isFlashing ? { duration: 0.8, repeat: Infinity, repeatType: 'reverse' } : {}}
    >
      {/* Jar body */}
      <rect
        x={2}
        y={10}
        width={width - 4}
        height={height - 12}
        rx={6}
        fill="transparent"
        stroke="#1f1f1f"
        strokeWidth={1.5}
      />
      {/* Jar neck */}
      <rect
        x={width * 0.25}
        y={2}
        width={width * 0.5}
        height={10}
        rx={3}
        fill="transparent"
        stroke="#1f1f1f"
        strokeWidth={1.5}
      />
      {/* Fill */}
      <motion.rect
        x={4}
        y={height - 2 - fillHeight}
        width={width - 8}
        rx={4}
        fill={color}
        fillOpacity={0.3}
        initial={{ height: 0 }}
        animate={{ height: Math.max(0, fillHeight - 2) }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      <motion.rect
        x={4}
        y={height - 2 - fillHeight}
        width={width - 8}
        height={2}
        rx={1}
        fill={color}
        fillOpacity={0.8}
        initial={{ y: height - 2 }}
        animate={{ y: height - 2 - fillHeight }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </motion.svg>
  );
}