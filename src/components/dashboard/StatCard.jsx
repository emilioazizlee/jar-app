import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ title, value, subtitle, accent = 'primary', delay = 0, children, onClick }) {
  const accentColors = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    destructive: 'text-destructive',
    muted: 'text-muted-foreground',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <p className="mono-header text-[10px] text-muted-foreground mb-3">{title}</p>
      <div className="flex items-end justify-between">
        <div>
          <p className={`font-mono text-2xl md:text-3xl font-bold ${accentColors[accent]}`}>
            <AnimatedNumber value={value} />
          </p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {children}
      </div>
    </motion.div>
  );
}

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;

  useEffect(() => {
    if (numValue === 0) { setDisplay(0); return; }
    const steps = 15;
    const inc = numValue / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += inc;
      if (current >= numValue) {
        setDisplay(numValue);
        clearInterval(timer);
      } else {
        setDisplay(Math.round(current * 10) / 10);
      }
    }, 40);
    return () => clearInterval(timer);
  }, [numValue]);

  if (typeof value === 'string' && isNaN(parseFloat(value))) return value;
  return Number.isInteger(numValue) ? Math.round(display) : display.toFixed(1);
}