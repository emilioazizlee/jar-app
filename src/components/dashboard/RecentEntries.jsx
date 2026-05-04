import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ITEM_TYPES, SPEND_CATEGORIES, CATEGORY_COLORS } from '@/lib/constants';

export default function RecentEntries({ items = [] }) {
  const recent = items.slice(0, 8);

  const getIcon = (item) => {
    if (item.type === 'spend') {
      const cat = SPEND_CATEGORIES.find(c => c.key === item.category);
      return cat?.icon || '💰';
    }
    return ITEM_TYPES.find(t => t.key === item.type)?.label?.[0] || '•';
  };

  const getColor = (item) => {
    if (item.type === 'spend' && item.category) {
      return CATEGORY_COLORS[item.category] || '#7a7a7a';
    }
    return ITEM_TYPES.find(t => t.key === item.type)?.color || '#7a7a7a';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-card border border-border rounded-2xl p-5"
    >
      <p className="mono-header text-[10px] text-muted-foreground mb-4">RECENT ENTRIES</p>
      <div className="space-y-2">
        {recent.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No entries yet. Tap + to start logging.</p>
        )}
        {recent.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
            className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0"
          >
            <span className="text-lg w-8 text-center">{getIcon(item)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.title}</p>
              <p className="font-mono text-[10px] text-muted-foreground">
                {item.type.toUpperCase()} • {item.date ? format(new Date(item.date), 'MMM d, HH:mm') : format(new Date(item.created_date), 'MMM d, HH:mm')}
              </p>
            </div>
            {item.amount && (
              <span className="font-mono text-sm font-semibold" style={{ color: getColor(item) }}>
                {item.currency === 'EUR' ? '€' : item.currency === 'USD' ? '$' : item.currency}{item.amount}
              </span>
            )}
            {item.quantity && item.quantity > 1 && (
              <span className="font-mono text-xs text-muted-foreground">x{item.quantity}</span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}