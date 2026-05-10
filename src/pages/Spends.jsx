import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { SPEND_CATEGORIES, getCategoryLabel } from '@/lib/constants';
import SpendForm from '@/components/forms/SpendForm';
import JarVisual from '@/components/jar/JarVisual';
import { format, isSameDay, subDays, startOfMonth } from 'date-fns';
import { Plus, RotateCcw } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function Spends() {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);

  const { data: spends = [] } = useQuery({
    queryKey: ['items-spends', user?.email],
    queryFn: () => user ? base44.entities.Item.filter({ type: 'spend', created_by: user.email }, '-created_date', 500) : [],
    enabled: !!user,
    initialData: [],
  });

  const todaySpends = useMemo(() => spends.filter(s => s.date && isSameDay(new Date(s.date), new Date())), [spends]);
  const monthSpends = useMemo(() => {
    const start = startOfMonth(new Date());
    return spends.filter(s => s.date && new Date(s.date) >= start);
  }, [spends]);

  const todayTotal = todaySpends.reduce((sum, s) => sum + (s.amount || 0), 0);
  const monthTotal = monthSpends.reduce((sum, s) => sum + (s.amount || 0), 0);

  const getCatCount = (key) => todaySpends.filter(s => s.category === key).length;
  const getCatTotal = (key) => todaySpends.filter(s => s.category === key).reduce((sum, s) => sum + (s.amount || 0), 0);

  const repeatLast = async (catKey) => {
    const last = spends.find(s => s.category === catKey);
    if (!last) return;
    await base44.entities.Item.create({
      type: 'spend',
      title: last.title,
      category: last.category,
      quantity: last.quantity || 1,
      amount: last.amount,
      currency: last.currency,
      date: format(new Date(), 'yyyy-MM-dd'),
    });
    queryClient.invalidateQueries({ queryKey: ['items-spends'] });
    queryClient.invalidateQueries({ queryKey: ['items'] });
    queryClient.invalidateQueries({ queryKey: ['items-month'] });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="mono-header text-lg md:text-xl text-foreground">DAILY SPENDS</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Today: <span className="font-mono text-secondary font-semibold">€{todayTotal.toFixed(2)}</span>
            {' · '}This month: <span className="font-mono text-foreground">€{monthTotal.toFixed(2)}</span>
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-secondary text-secondary-foreground rounded-xl font-mono text-sm min-h-[44px]"
        >
          <Plus className="w-4 h-4" /> LOG SPEND
        </motion.button>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {SPEND_CATEGORIES.map((cat, i) => {
          const count = getCatCount(cat.key);
          const total = getCatTotal(cat.key);
          return (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              className="bg-card border border-border rounded-2xl p-4 hover:border-secondary/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xl">{cat.icon}</span>
                  <p className="font-mono text-xs text-muted-foreground mt-1">{cat.label}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setSelectedCat(cat.key); setShowForm(true); }}
                    className="p-1 rounded hover:bg-muted transition-colors"
                    title="Log"
                  >
                    <Plus className="w-3 h-3 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => repeatLast(cat.key)}
                    className="p-1 rounded hover:bg-muted transition-colors"
                    title="Repeat last"
                  >
                    <RotateCcw className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="font-mono text-lg font-bold text-foreground">{count}</p>
                  {total > 0 && <p className="font-mono text-[10px] text-secondary">€{total.toFixed(2)}</p>}
                </div>
                <JarVisual
                  fillPercent={(count % 10) * 10}
                  completedJars={Math.floor(count / 10)}
                  size="sm"
                  color="#ffee32"
                  showLabel={false}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent spends */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="mono-header text-[10px] text-muted-foreground mb-4">RECENT SPENDS</p>
        <div className="space-y-2">
          {spends.filter(s => s.category !== 'cigarettes_health').slice(0, 15).map((spend, i) => {
            const lookupKey = spend.category === 'cigarettes_health' ? 'cigarettes' : spend.category;
            const cat = SPEND_CATEGORIES.find(c => c.key === lookupKey);
            return (
              <motion.div
                key={spend.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0"
              >
                <span className="text-lg w-8 text-center">{cat?.icon || '💰'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{spend.title}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {getCategoryLabel(spend.category)} · {spend.date ? format(new Date(spend.date), 'MMM d') : '—'}
                    {spend.quantity > 1 ? ` · x${spend.quantity}` : ''}
                    {spend.note ? ` · ${spend.note}` : ''}
                  </p>
                </div>
                {spend.amount && (
                  <span className="font-mono text-sm font-semibold text-secondary">
                    {spend.currency === 'EUR' ? '€' : spend.currency === 'USD' ? '$' : spend.currency}{spend.amount}
                  </span>
                )}
              </motion.div>
            );
          })}
          {spends.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No spends logged yet</p>}
        </div>
      </div>

      {showForm && (
        <SpendForm
          open={showForm}
          onClose={() => { setShowForm(false); setSelectedCat(null); }}
          onSaved={() => { setShowForm(false); setSelectedCat(null); }}
          initialCategory={selectedCat}
        />
      )}
    </div>
  );
}