import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import QuickItemForm from '@/components/forms/QuickItemForm';
import JarVisual from '@/components/jar/JarVisual';
import { Plus } from 'lucide-react';
import { format, startOfMonth, isSameDay } from 'date-fns';

export default function Payments() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: payments = [] } = useQuery({
    queryKey: ['items', 'payments'],
    queryFn: () => base44.entities.Item.filter({ type: 'payment' }, '-created_date', 200),
    initialData: [],
  });

  const monthPayments = useMemo(() => {
    const start = startOfMonth(new Date());
    return payments.filter(p => p.date && new Date(p.date) >= start);
  }, [payments]);

  const monthTotal = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mono-header text-xl text-foreground">PAYMENTS</h1>
          <p className="text-sm text-muted-foreground mt-1">{payments.length} total</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-mono text-sm"
        >
          <Plus className="w-4 h-4" /> ADD PAYMENT
        </motion.button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5">
          <p className="mono-header text-[10px] text-muted-foreground mb-2">THIS MONTH</p>
          <p className="font-mono text-3xl font-bold text-orange-400">€{monthTotal.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">{monthPayments.length} payments</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="mono-header text-[10px] text-muted-foreground mb-2">JAR STATUS</p>
            <p className="font-mono text-sm text-muted-foreground">{payments.length} total entries</p>
          </div>
          <JarVisual
            fillPercent={(payments.length % 10) * 10}
            completedJars={Math.floor(payments.length / 10)}
            size="md"
            color="#ff9f43"
          />
        </motion.div>
      </div>

      {/* Payment list */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="mono-header text-[10px] text-muted-foreground mb-4">ALL PAYMENTS</p>
        <div className="space-y-2">
          {payments.map((payment, i) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0"
            >
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <span className="font-mono text-xs font-bold text-orange-400">{payment.title?.[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{payment.title}</p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {payment.date ? format(new Date(payment.date), 'MMM d, yyyy') : '—'}
                  {payment.note ? ` · ${payment.note}` : ''}
                </p>
              </div>
              <span className="font-mono text-sm font-semibold text-orange-400">
                {payment.currency === 'EUR' ? '€' : payment.currency === 'USD' ? '$' : payment.currency || '€'}{payment.amount?.toFixed(2) || '—'}
              </span>
            </motion.div>
          ))}
          {payments.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No payments recorded</p>}
        </div>
      </div>

      {showForm && (
        <QuickItemForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['items'] }); }}
          itemType="payment"
        />
      )}
    </div>
  );
}