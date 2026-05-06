import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { getCategoryLabel } from '@/lib/constants';
import { cleanLabel } from '@/lib/labelUtils';
import { toast } from 'sonner';

export default function RepeatLastEntry({ items = [] }) {
  const queryClient = useQueryClient();
  const [repeating, setRepeating] = useState(false);

  // Most recent spend or task item that has a title
  const last = items.find(i => i.title && (i.type === 'spend' || i.type === 'task'));
  if (!last) return null;

  const label = cleanLabel(last.title);
  const catLabel = last.category
    ? cleanLabel(last.category === 'cigarettes_health' ? 'cigarettes' : last.category)
    : cleanLabel(last.type);
  const amount = last.amount
    ? `${last.currency === 'EUR' ? '€' : last.currency === 'USD' ? '$' : (last.currency || '')}${last.amount}`
    : '';

  const icon = (() => {
    if (last.category === 'cigarettes' || last.category === 'cigarettes_health') return '🚬';
    if (last.category === 'coffee') return '☕';
    if (last.category === 'taxi') return '🚕';
    if (last.category === 'food_out') return '🍽️';
    if (last.category === 'groceries') return '🛒';
    if (last.type === 'task') return '✅';
    return '💰';
  })();

  const handleRepeat = async () => {
    setRepeating(true);
    const { id, created_date, updated_date, ...rest } = last;
    await base44.entities.Item.create({
      ...rest,
      date: format(new Date(), 'yyyy-MM-dd'),
    });
    queryClient.invalidateQueries({ queryKey: ['items'] });
    setRepeating(false);

    // Toast with undo (5s)
    toast(`Logged — same as last time`, {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: async () => {
          // fetch latest and delete it
          const fresh = await base44.entities.Item.list('-created_date', 1);
          if (fresh[0]) await base44.entities.Item.delete(fresh[0].id);
          queryClient.invalidateQueries({ queryKey: ['items'] });
        },
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2"
    >
      <p className="mono-header text-[10px] text-muted-foreground mb-2">REPEAT LAST</p>
      <motion.button
        onClick={handleRepeat}
        disabled={repeating}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-3 w-full sm:w-auto bg-card border border-border rounded-xl px-4 py-3 hover:border-primary/40 hover:bg-primary/5 transition-all group"
      >
        <span className="text-xl w-8 text-center">{icon}</span>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="font-mono text-[10px] text-muted-foreground">{catLabel}{amount ? ` · ${amount}` : ''}</p>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-primary transition-colors">
          <RotateCcw className="w-4 h-4" />
          <span className="font-mono text-[10px]">Repeat</span>
        </div>
      </motion.button>
    </motion.div>
  );
}