import React, { useState, useMemo } from 'react';

import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ITEM_TYPES, CATEGORY_COLORS, getCategoryColor } from '@/lib/constants';

export default function CalendarPage() {

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: items = [] } = useQuery({
    queryKey: ['items'],
    queryFn: () => base44.entities.Item.list('-created_date', 1000),
    initialData: [],
  });

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const startPadding = getDay(startOfMonth(currentMonth));

  const dayItems = useMemo(() => {
    return items.filter(i => i.date && isSameDay(new Date(i.date), selectedDate));
  }, [items, selectedDate]);

  const getItemCount = (day) => items.filter(i => i.date && isSameDay(new Date(i.date), day)).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="mono-header text-xl text-foreground">CALENDAR</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-card border border-border rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <p className="mono-header text-sm text-foreground">{format(currentMonth, 'MMMM yyyy')}</p>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center font-mono text-[10px] text-muted-foreground py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startPadding }).map((_, i) => <div key={`pad-${i}`} />)}
            {days.map(day => {
              const count = getItemCount(day);
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${
                    isSelected ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted'
                  }`}
                >
                  <span className={`font-mono text-sm ${isToday ? 'text-primary font-bold' : isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {format(day, 'd')}
                  </span>
                  {count > 0 && (
                    <div className="flex gap-0.5">
                      {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                        <div key={i} className="w-1 h-1 rounded-full bg-primary" />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Day detail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <p className="mono-header text-[10px] text-muted-foreground mb-3">
            {format(selectedDate, 'EEEE, MMM d')}
          </p>
          <p className="font-mono text-sm text-muted-foreground mb-4">{dayItems.length} entries</p>
          <div className="space-y-2">
            {dayItems.map((item) => {
              const typeInfo = ITEM_TYPES.find(t => t.key === item.type);
              const dotColor = item.type === 'spend' && item.category
                ? getCategoryColor(item.category)
                : typeInfo?.color || '#7a7a7a';
              return (
                <div key={item.id} className="flex items-center gap-2 py-2 border-b border-border/50 last:border-0">
                  <div className="w-2 h-2 rounded-full" style={{ background: dotColor }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.title}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{item.type}</p>
                  </div>
                  {item.amount && (
                    <span className="font-mono text-xs" style={{ color: dotColor }}>
                      €{item.amount}
                    </span>
                  )}
                </div>
              );
            })}
            {dayItems.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No entries this day</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}