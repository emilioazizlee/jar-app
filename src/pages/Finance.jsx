import React, { useState, useMemo, useEffect } from 'react';

import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, Target, Wallet, Edit2, Check, AlertTriangle } from 'lucide-react';
import { startOfMonth, subMonths, format, differenceInDays } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PALETTE } from '@/lib/constants';
import GoalCard from '@/components/finance/GoalCard';
import GoalForm from '@/components/finance/GoalForm';
import FavoritesBar from '@/components/favorites/FavoritesBar';
import { CategoryBreakdownPanel, BurnRatePanel, NetWorthPanel, SpendingHeatmap } from '@/components/finance/FinancePanels';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function Finance() {

  const queryClient = useQueryClient();
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingSnapshot, setEditingSnapshot] = useState(false);
  const [snapForm, setSnapForm] = useState({ cash_on_hand: '', bank_balance: '', savings: '', monthly_income: '' });

  // Queries
  const { data: snapshots = [] } = useQuery({
    queryKey: ['finance-snapshots'],
    queryFn: () => base44.entities.FinanceSnapshot.list('-created_date', 10),
    initialData: [],
  });
  const { data: goals = [] } = useQuery({
    queryKey: ['finance-goals'],
    queryFn: () => base44.entities.FinanceGoal.list('-created_date', 50),
    initialData: [],
  });
  const { user } = useCurrentUser();

  const { data: items = [] } = useQuery({
    queryKey: ['items', 'finance', user?.email],
    queryFn: () => user ? base44.entities.Item.filter({ created_by: user.email }, '-created_date', 1000) : [],
    enabled: !!user,
    initialData: [],
  });

  const latest = snapshots[0] || null;

  // When snapshot loaded, pre-fill form
  React.useEffect(() => {
    if (latest) {
      setSnapForm({
        cash_on_hand: latest.cash_on_hand || '',
        bank_balance: latest.bank_balance || '',
        savings: latest.savings || '',
        monthly_income: latest.monthly_income || '',
      });
    }
  }, [latest?.id]);

  const totalAvailable = (Number(snapForm.cash_on_hand) || 0) + (Number(snapForm.bank_balance) || 0) + (Number(snapForm.savings) || 0);

  const monthStart = startOfMonth(new Date());
  const monthItems = useMemo(() => items.filter(i => i.date && new Date(i.date) >= monthStart), [items]);

  const monthSpend = useMemo(() => monthItems.filter(i => i.type === 'spend').reduce((s, i) => s + (i.amount || 0), 0), [monthItems]);
  const monthIncome = Number(snapForm.monthly_income) || 0;
  const netChange = monthIncome - monthSpend;

  // Recurring outflow — normalize billing cycles to monthly
  const subBurn = useMemo(() => items.filter(i => i.type === 'subscription' && i.is_active !== false && i.amount).reduce((s, i) => {
    if (i.billing_cycle === 'yearly') return s + (i.amount / 12);
    if (i.billing_cycle === 'quarterly') return s + (i.amount / 3);
    return s + i.amount;
  }, 0), [items]);
  const paymentsBurn = useMemo(() => items.filter(i => i.type === 'payment' && i.is_active && i.amount).reduce((s, i) => s + (i.amount || 0), 0), [items]);

  // Avg daily spend over last 90 days
  const past90 = useMemo(() => {
    const start = subMonths(new Date(), 3);
    return items.filter(i => i.type === 'spend' && i.date && new Date(i.date) >= start);
  }, [items]);
  const avgDailySpend = past90.reduce((s, i) => s + (i.amount || 0), 0) / 90;
  const daysInMonth = 30;
  const extrapolatedSpend = avgDailySpend * daysInMonth;

  const totalRecurring = subBurn + paymentsBurn + extrapolatedSpend;

  const goalsReserved = goals.filter(g => !g.is_completed).reduce((s, g) => s + ((g.target_amount || 0) - (g.saved_amount || 0)), 0);
  const freeToSpend = totalAvailable - totalRecurring - goalsReserved;

  // End-of-month forecast (linear regression on last 3 months)
  const monthlySpendHistory = useMemo(() => {
    return [0, 1, 2].map(offset => {
      const start = startOfMonth(subMonths(new Date(), offset + 1));
      const end = startOfMonth(subMonths(new Date(), offset));
      return items.filter(i => i.type === 'spend' && i.date && new Date(i.date) >= start && new Date(i.date) < end)
        .reduce((s, i) => s + (i.amount || 0), 0);
    }).reverse();
  }, [items]);

  const avgMonthlySpend = monthlySpendHistory.length ? monthlySpendHistory.reduce((a, b) => a + b, 0) / monthlySpendHistory.length : 0;
  const daysElapsed = differenceInDays(new Date(), monthStart) + 1;
  const projectedMonthEnd = daysElapsed > 0 ? (monthSpend / daysElapsed) * daysInMonth : 0;
  const isAnomaly = avgMonthlySpend > 0 && monthSpend > avgMonthlySpend * 2;

  const handleSaveSnapshot = async () => {
    const data = {
      cash_on_hand: Number(snapForm.cash_on_hand) || 0,
      bank_balance: Number(snapForm.bank_balance) || 0,
      savings: Number(snapForm.savings) || 0,
      monthly_income: Number(snapForm.monthly_income) || 0,
      date: format(new Date(), 'yyyy-MM-dd'),
    };
    if (latest) {
      await base44.entities.FinanceSnapshot.update(latest.id, data);
    } else {
      await base44.entities.FinanceSnapshot.create(data);
    }
    queryClient.invalidateQueries({ queryKey: ['finance-snapshots'] });
    setEditingSnapshot(false);
  };

  const numField = (key, label, prefix = '€') => (
    <div>
      <Label className="text-xs text-muted-foreground font-mono">{label}</Label>
      {editingSnapshot ? (
        <Input
          inputMode="decimal"
          type="text"
          value={snapForm[key]}
          onChange={e => setSnapForm(p => ({ ...p, [key]: e.target.value.replace(/[^0-9.]/g, '') }))}
          className="bg-muted border-none mt-1 font-mono"
          placeholder="0.00"
        />
      ) : (
        <p className="font-mono text-xl font-bold text-foreground mt-1">
          {prefix}{(Number(snapForm[key]) || 0).toFixed(2)}
        </p>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="mono-header text-lg md:text-xl text-foreground">FINANCE DASHBOARD</h1>
        {isAnomaly && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 border border-destructive/30 rounded-xl">
            <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
            <span className="font-mono text-xs text-destructive">SPEND ANOMALY</span>
          </div>
        )}
      </div>

      {/* Favorites bar */}
      <FavoritesBar filter="finance" />

      {/* What You Have */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="mono-header text-[10px] text-muted-foreground">WHAT YOU HAVE</p>
          <button
            onClick={() => editingSnapshot ? handleSaveSnapshot() : setEditingSnapshot(true)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-mono transition-colors"
          >
            {editingSnapshot ? <><Check className="w-3.5 h-3.5" /> SAVE</> : <><Edit2 className="w-3.5 h-3.5" /> EDIT</>}
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {numField('cash_on_hand', 'Cash on Hand')}
          {numField('bank_balance', 'Bank Balance')}
          {numField('savings', 'Savings')}
          {numField('monthly_income', 'Monthly Income')}
        </div>
        {editingSnapshot && (
          <Button onClick={handleSaveSnapshot} className="w-full bg-primary text-primary-foreground font-mono mt-2">
            SAVE SNAPSHOT
          </Button>
        )}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground">TOTAL AVAILABLE</span>
          <span className="font-mono text-2xl font-bold text-primary">€{totalAvailable.toFixed(2)}</span>
        </div>
      </div>

      {/* This Month */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="mono-header text-[10px] text-muted-foreground mb-2">INCOME THIS MONTH</p>
          <p className="font-mono text-2xl font-bold text-primary">€{monthIncome.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="mono-header text-[10px] text-muted-foreground mb-2">SPENT THIS MONTH</p>
          <p className="font-mono text-2xl font-bold" style={{ color: PALETTE.orange }}>€{monthSpend.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="mono-header text-[10px] text-muted-foreground mb-2">NET CHANGE</p>
          <div className="flex items-center gap-2">
            {netChange >= 0
              ? <TrendingUp className="w-5 h-5 text-primary" />
              : <TrendingDown className="w-5 h-5 text-destructive" />}
            <p className="font-mono text-2xl font-bold" style={{ color: netChange >= 0 ? PALETTE.green : PALETTE.red }}>
              {netChange >= 0 ? '+' : ''}€{netChange.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Recurring Outflow */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="mono-header text-[10px] text-muted-foreground mb-4">RECURRING OUTFLOW (ESTIMATED)</p>
        <div className="space-y-2">
          {[
            { label: 'Subscriptions', value: subBurn, color: PALETTE.yellow },
            { label: 'Fixed Payments', value: paymentsBurn, color: PALETTE.blue },
            { label: 'Daily Extrapolation', value: extrapolatedSpend, color: PALETTE.orange },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
              <span className="font-mono text-xs text-muted-foreground">{r.label}</span>
              <span className="font-mono text-sm font-semibold" style={{ color: r.color }}>€{r.value.toFixed(2)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2">
            <span className="font-mono text-xs font-bold text-foreground">TOTAL EXPECTED</span>
            <span className="font-mono text-lg font-bold" style={{ color: PALETTE.red }}>€{totalRecurring.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Available to Spend */}
      <div className="bg-card border-2 rounded-2xl p-5" style={{ borderColor: freeToSpend >= 0 ? PALETTE.green : PALETTE.red }}>
        <p className="mono-header text-[10px] text-muted-foreground mb-2">AVAILABLE TO SPEND FREELY</p>
        <p className="font-mono text-3xl md:text-4xl font-bold" style={{ color: freeToSpend >= 0 ? PALETTE.green : PALETTE.red }}>
          {freeToSpend >= 0 ? '' : '-'}€{Math.abs(freeToSpend).toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground mt-2">After recurring costs and goal reserves</p>
      </div>

      {/* Forecast */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="mono-header text-[10px] text-muted-foreground mb-3">END-OF-MONTH FORECAST</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-mono text-xs text-muted-foreground">Projected spend</p>
            <p className="font-mono text-xl font-bold" style={{ color: PALETTE.orange }}>€{projectedMonthEnd.toFixed(2)}</p>
          </div>
          <div>
            <p className="font-mono text-xs text-muted-foreground">3-month avg</p>
            <p className="font-mono text-xl font-bold text-foreground">€{avgMonthlySpend.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Goals */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="mono-header text-[10px] text-muted-foreground">SAVINGS GOALS</p>
          <button
            onClick={() => setShowGoalForm(true)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-mono"
          >
            <Plus className="w-3.5 h-3.5" /> ADD GOAL
          </button>
        </div>
        {goals.length > 0 ? (
          <div className="space-y-3">
            {goals.map(goal => (
              <GoalCard key={goal.id} goal={goal} onRefresh={() => queryClient.invalidateQueries({ queryKey: ['finance-goals'] })} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No goals yet. Add a savings goal!</p>
        )}
      </div>

      {/* BI Panels B–E */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CategoryBreakdownPanel items={items} snapshots={snapshots} delay={0.05} />
        <BurnRatePanel items={items} snapshots={snapshots} delay={0.1} />
      </div>
      <NetWorthPanel snapshots={snapshots} delay={0.15} />
      <SpendingHeatmap items={items} delay={0.2} />

      {showGoalForm && (
        <GoalForm
          open={showGoalForm}
          onClose={() => setShowGoalForm(false)}
          onSaved={() => { setShowGoalForm(false); queryClient.invalidateQueries({ queryKey: ['finance-goals'] }); }}
        />
      )}
    </div>
  );
}