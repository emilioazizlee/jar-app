import React, { useState, useEffect } from 'react';
import { Search, Keyboard, Menu, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const isMac = typeof navigator !== 'undefined' && navigator.platform.startsWith('Mac');
const modKey = isMac ? '⌘' : 'Ctrl';

export default function TopBar({ totalJars = 0, searchRef, onOpenShortcuts, onOpenAdd, onToggleSidebar }) {
  const [date, setDate] = useState(new Date());
  const [searchOpen, setSearchOpen] = useState(false);

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
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={searchRef}
            placeholder={`Search items... (${modKey}K)`}
            className="pl-10 pr-10 bg-muted border-none h-9 text-sm"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground bg-white/5 border border-white/10 px-1 rounded pointer-events-none">{modKey}K</kbd>
        </div>
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

      {/* Mobile layout */}
      <div className="flex md:hidden h-14 items-center justify-between px-4 gap-2">
        <span className="font-mono text-lg font-bold text-primary tracking-widest">JAR</span>

        <div className="flex items-center gap-1 ml-auto">
          {/* Monthly burn pill */}
          <div className="flex items-center gap-1.5 bg-secondary/10 border border-secondary/20 rounded-full px-3 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            <span className="font-mono text-[10px] text-secondary font-semibold">
              <CountUp value={totalJars} /> JARS
            </span>
          </div>

          {/* Date */}
          <span className="font-mono text-[10px] text-muted-foreground px-2 hidden xs:block">
            {format(date, 'MMM d')}
          </span>

          {/* Search icon */}
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-lg text-muted-foreground active:bg-muted active:scale-95 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-50 bg-background flex flex-col md:hidden"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
          >
            <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                ref={searchRef}
                autoFocus
                placeholder="Search items..."
                className="flex-1 bg-transparent text-base outline-none text-foreground placeholder:text-muted-foreground"
                style={{ fontSize: '16px' }}
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-2 rounded-lg text-muted-foreground active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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