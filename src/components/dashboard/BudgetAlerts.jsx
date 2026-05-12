import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { trackBudget } from '@/lib/budgetTracker';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function BudgetAlerts({ items }) {
  const navigate = useNavigate();
  const { user } = useCurrentUser();

  const { data: limits = [] } = useQuery({
    queryKey: ['budget-limits', user?.email],
    queryFn: () => user ? base44.entities.BudgetLimit.filter({ user_id: user.email }) : [],
    enabled: !!user,
  });

  if (!limits.length) return null;

  const { alerts } = trackBudget(items, limits);
  if (!alerts.length) return null;

  const currSym = (cur) => cur === 'USD' ? '$' : cur === 'AZN' ? '₼' : cur === 'RUB' ? '₽' : '€';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-card border border-destructive/20 rounded-xl p-4 cursor-pointer hover:border-destructive/40 transition-all"
      onClick={() => navigate('/settings/budgets')}
    >
      <p className="mono-header text-[10px] text-muted-foreground mb-3">BUDGET ALERTS</p>
      <div className="space-y-2">
        {alerts.map(alert => (
          <div key={alert.category} className="flex items-center gap-3">
            <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${alert.status === 'over' ? 'text-destructive' : 'text-yellow-500'}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs capitalize truncate">{alert.category}</span>
                <span className={`font-mono text-[10px] shrink-0 ${alert.status === 'over' ? 'text-destructive' : 'text-yellow-500'}`}>
                  {currSym(alert.currency)}{alert.spent.toFixed(0)}/{currSym(alert.currency)}{alert.limit} ({alert.percentage.toFixed(0)}%)
                </span>
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full rounded-full transition-all ${alert.status === 'over' ? 'bg-destructive' : 'bg-yellow-500'}`}
                  style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}