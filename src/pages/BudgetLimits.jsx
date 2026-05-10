import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SPEND_CATEGORIES } from '@/lib/constants';

const PERIODS = ['daily', 'weekly', 'monthly'];
const CURRENCIES = ['EUR', 'USD', 'AZN', 'RUB'];

const PERIOD_LABELS = { daily: 'Day', weekly: 'Week', monthly: 'Month' };

function BudgetCard({ budget, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}
    >
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#fff', textTransform: 'capitalize' }}>{budget.category}</p>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#7a7a7a', marginTop: 3 }}>
          {budget.currency} {budget.limit_amount} / {PERIOD_LABELS[budget.period] || budget.period}
        </p>
      </div>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, padding: '3px 8px', borderRadius: 6, border: '1px solid #2a2a2a', color: '#aaa', textTransform: 'uppercase' }}>
        {budget.period}
      </span>
      <button onClick={() => onDelete(budget.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export default function BudgetLimits() {
  const { user } = useCurrentUser();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: '', limit_amount: '', period: 'monthly', currency: 'EUR' });
  const [saving, setSaving] = useState(false);

  const { data: budgets = [] } = useQuery({
    queryKey: ['budget-limits', user?.email],
    queryFn: () => user ? base44.entities.BudgetLimit.filter({ user_id: user.email }) : [],
    enabled: !!user,
  });

  const handleSave = async () => {
    if (!form.category.trim() || !form.limit_amount) return;
    setSaving(true);
    await base44.entities.BudgetLimit.create({
      ...form,
      limit_amount: Number(form.limit_amount),
      user_id: user.email,
    });
    qc.invalidateQueries({ queryKey: ['budget-limits', user?.email] });
    setForm({ category: '', limit_amount: '', period: 'monthly', currency: 'EUR' });
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.BudgetLimit.delete(id);
    qc.invalidateQueries({ queryKey: ['budget-limits', user?.email] });
  };

  return (
    <div className="max-w-2xl mx-auto pb-32">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#7a7a7a' }}>BUDGET LIMITS</p>
          <p className="text-sm text-muted-foreground mt-0.5">Get warnings when you approach your spend limits</p>
        </div>
      </div>

      {/* Add button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(s => !s)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: '#abff4f', color: '#0a0a0a', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}
        >
          <Plus className="w-4 h-4" /> Add Limit
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: 12, padding: '18px', space: '12px' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>New Budget Limit</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#7a7a7a', marginBottom: 6 }}>CATEGORY</p>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', padding: '7px 10px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}
                  >
                    <option value="">Select category...</option>
                    {SPEND_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                    <option value="dining">Dining Out</option>
                    <option value="leisure">Leisure</option>
                  </select>
                </div>
                <div>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#7a7a7a', marginBottom: 6 }}>PERIOD</p>
                  <select
                    value={form.period}
                    onChange={e => setForm(f => ({ ...f, period: e.target.value }))}
                    style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', padding: '7px 10px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}
                  >
                    {PERIODS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#7a7a7a', marginBottom: 6 }}>LIMIT AMOUNT</p>
                  <input
                    type="number"
                    value={form.limit_amount}
                    onChange={e => setForm(f => ({ ...f, limit_amount: e.target.value }))}
                    placeholder="e.g. 200"
                    style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', padding: '7px 10px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}
                  />
                </div>
                <div>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#7a7a7a', marginBottom: 6 }}>CURRENCY</p>
                  <select
                    value={form.currency}
                    onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                    style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', padding: '7px 10px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}
                  >
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !form.category || !form.limit_amount}
                  style={{ padding: '8px 20px', borderRadius: 8, background: '#abff4f', color: '#0a0a0a', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', opacity: (!form.category || !form.limit_amount) ? 0.4 : 1 }}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  style={{ padding: '8px 16px', borderRadius: 8, background: 'transparent', color: '#7a7a7a', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, border: '1px solid #2a2a2a', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Budget list */}
      <div className="space-y-2">
        {budgets.length === 0 ? (
          <div className="text-center py-16" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#555' }}>
            No budget limits set.<br />
            <span style={{ color: '#444', fontSize: 11 }}>Add limits to get warnings when you overspend.</span>
          </div>
        ) : (
          budgets.map(b => <BudgetCard key={b.id} budget={b} onDelete={handleDelete} />)
        )}
      </div>
    </div>
  );
}