import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ITEM_TYPES, SPEND_CATEGORIES, getCategoryLabel } from '@/lib/constants';
import { cleanLabel } from '@/lib/labelUtils';

export default function RecentEntries({ items = [] }) {
  const recent = items.slice(0, 8);

  const getIcon = (item) => {
    if (item.type === 'spend') {
      // cigarettes_health is internal — show cigarettes icon
      const lookupKey = item.category === 'cigarettes_health' ? 'cigarettes' : item.category;
      const cat = SPEND_CATEGORIES.find(c => c.key === lookupKey);
      return cat?.icon || '💰';
    }
    return ITEM_TYPES.find(t => t.key === item.type)?.label?.[0] || '•';
  };

  // Prices in neutral lists are white — red is reserved for alerts only
  const getAmountColor = () => '#ffffff';

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
              <p className="text-sm font-medium truncate">{cleanLabel(item.title)}</p>
              <p className="font-mono text-[10px] text-muted-foreground">
                {item.category
                  ? cleanLabel(item.category === 'cigarettes_health' ? 'cigarettes' : item.category)
                  : cleanLabel(item.type)} • {item.date ? format(new Date(item.date), 'MMM d') : format(new Date(item.created_date), 'MMM d')}
              </p>
            </div>
            {item.amount && (
              <span className="font-mono text-sm font-semibold" style={{ color: getAmountColor() }}>
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