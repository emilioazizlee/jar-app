import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import SubscriptionForm from '@/components/forms/SubscriptionForm';
import { Plus, Pause, Play, Trash2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export default function Subscriptions() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: subs = [] } = useQuery({
    queryKey: ['items', 'subscriptions'],
    queryFn: () => base44.entities.Item.filter({ type: 'subscription' }, '-created_date', 200),
    initialData: [],
  });

  const activeSubs = subs.filter(s => s.is_active !== false);
  const monthlyTotal = activeSubs.reduce((sum, s) => {
    if (!s.amount) return sum;
    const multiplier = s.billing_cycle === 'yearly' ? 1/12 : s.billing_cycle === 'quarterly' ? 1/3 : 1;
    return sum + (s.amount * multiplier);
  }, 0);
  const yearlyTotal = monthlyTotal * 12;

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.Item.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
  });

  const deleteSub = useMutation({
    mutationFn: (id) => base44.entities.Item.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
  });

  const grouped = useMemo(() => {
    const groups = {};
    subs.forEach(s => {
      const cat = s.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    });
    return groups;
  }, [subs]);

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="mono-header text-lg md:text-xl text-foreground">SUBSCRIPTIONS</h1>
          <p className="text-sm text-muted-foreground mt-1">{activeSubs.length} active</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-500 text-white rounded-xl font-mono text-sm min-h-[44px]"
        >
          <Plus className="w-4 h-4" /> ADD
        </motion.button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5">
          <p className="mono-header text-[10px] text-muted-foreground mb-2">MONTHLY</p>
          <p className="font-mono text-3xl font-bold text-secondary">€{monthlyTotal.toFixed(2)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-5">
          <p className="mono-header text-[10px] text-muted-foreground mb-2">YEARLY</p>
          <p className="font-mono text-3xl font-bold text-foreground">€{yearlyTotal.toFixed(2)}</p>
        </motion.div>
      </div>

      {/* Grouped list */}
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <p className="mono-header text-[10px] text-muted-foreground mb-2">{category}</p>
          <div className="space-y-2">
            {items.map((sub, i) => {
              const daysUntil = sub.next_renewal ? differenceInDays(new Date(sub.next_renewal), new Date()) : null;
              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`bg-card border border-border rounded-xl p-4 transition-all ${sub.is_active === false ? 'opacity-50' : 'hover:border-blue-400/20'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <span className="font-mono text-sm font-bold text-blue-400">{sub.title?.[0]?.toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{sub.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] text-muted-foreground">{sub.billing_cycle}</span>
                        {daysUntil !== null && daysUntil >= 0 && (
                          <Badge variant="outline" className={`text-[10px] font-mono ${daysUntil <= 3 ? 'text-destructive border-destructive/30' : 'text-muted-foreground'}`}>
                            {daysUntil === 0 ? 'Today' : `${daysUntil}d`}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="font-mono text-sm font-semibold text-foreground">
                      {sub.currency === 'EUR' ? '€' : sub.currency === 'USD' ? '$' : sub.currency || '€'}{sub.amount?.toFixed(2) || '0.00'}
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => toggleActive.mutate({ id: sub.id, is_active: sub.is_active === false })}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                      >
                        {sub.is_active === false ? <Play className="w-3.5 h-3.5 text-primary" /> : <Pause className="w-3.5 h-3.5 text-muted-foreground" />}
                      </button>
                      <button
                        onClick={() => deleteSub.mutate(sub.id)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {subs.length === 0 && (
        <p className="text-center text-muted-foreground py-12 text-sm">No subscriptions yet</p>
      )}

      {showForm && (
        <SubscriptionForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['items'] }); }}
        />
      )}
    </div>
  );
}