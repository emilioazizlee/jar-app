import React, { useState, useEffect } from 'react';
import { Keyboard, Menu } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import NotificationCenter from '@/components/notifications/NotificationCenter';

const isMac = typeof navigator !== 'undefined' && navigator.platform.startsWith('Mac');
const modKey = isMac ? '⌘' : 'Ctrl';

export default function TopBar({ totalJars = 0, searchRef, onOpenShortcuts, onOpenAdd, onToggleSidebar }) {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header
      className="border-b border-border bg-background/80 backdrop-blur-sm z-20 flex-shrink-0"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Desktop layout */}
      <div className="hidden md:flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
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
        </div>
        <div className="flex items-center gap-3">
          <NotificationCenter />
          {/* Shortcuts button — desktop only (hidden on mobile/touch-only devices) */}
          <button
            onClick={onOpenShortcuts}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={`Keyboard shortcuts (${modKey}?)`}
          >
            <Keyboard className="w-4 h-4" />
          </button>
          <div className="text-right">
            <p className="font-mono text-sm text-foreground">{format(date, 'EEE, MMM d')}</p>
            <p className="font-mono text-[10px] text-muted-foreground">{format(date, 'HH:mm')}</p>
          </div>
        </div>
      </div>

      {/* Mobile layout — hamburger | JAR | jars-pill */}
      <div className="flex md:hidden h-14 items-center justify-between px-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-muted-foreground active:bg-muted active:scale-95 transition-all min-w-[40px] min-h-[40px] flex items-center justify-center"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="font-mono text-lg font-bold text-primary tracking-widest">JAR</span>

        <div className="flex items-center gap-2">
          <NotificationCenter />
        <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-[10px] text-primary font-semibold">
            <CountUp value={totalJars} /> JARS
          </span>
        </div>
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