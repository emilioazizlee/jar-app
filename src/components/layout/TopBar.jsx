import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function TopBar({ totalJars = 0 }) {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-6 z-20">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          className="pl-10 bg-muted border-none h-9 text-sm"
        />
      </div>

      <div className="flex items-center gap-4">
        {/* Monthly activity pill */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5"
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-xs text-primary font-semibold">
            <CountUp value={totalJars} /> JARS
          </span>
          <span className="text-xs text-muted-foreground">this month</span>
        </motion.div>

        {/* Date */}
        <div className="text-right">
          <p className="font-mono text-sm text-foreground">{format(date, 'EEE, MMM d')}</p>
          <p className="font-mono text-[10px] text-muted-foreground">{format(date, 'HH:mm')}</p>
        </div>
      </div>
    </header>
  );
}

function CountUp({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const duration = 800;
    const steps = 20;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.round(current * 10) / 10);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <>{display.toFixed(1)}</>;
}