import React from 'react';
import { format, subDays, isSameDay } from 'date-fns';
import { motion } from 'framer-motion';

export default function DayStrip({ selectedDate, onSelectDate, items = [] }) {
  const days = Array.from({ length: 14 }, (_, i) => subDays(new Date(), 13 - i));

  const getCount = (day) => items.filter(item => {
    if (!item.date) return false;
    return isSameDay(new Date(item.date), day);
  }).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card border border-border rounded-2xl p-4"
    >
      <p className="mono-header text-[10px] text-muted-foreground mb-3">14-DAY ACTIVITY</p>
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
        {days.map((day) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const count = getCount(day);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl min-w-[44px] transition-all ${
                isSelected
                  ? 'bg-primary/10 border border-primary/30'
                  : isToday
                  ? 'border border-border/60 hover:bg-muted'
                  : 'hover:bg-muted'
              }`}
            >
              <span className={`font-mono text-[10px] ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                {format(day, 'EEE')}
              </span>
              <span className={`font-mono text-sm font-semibold ${isSelected ? 'text-primary' : isToday ? 'text-primary' : 'text-foreground'}`}>
                {format(day, 'd')}
              </span>
              {count > 0 && (
                <div className="flex gap-0.5">
                  {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
                    <div key={i} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-primary' : 'bg-muted-foreground'}`} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}