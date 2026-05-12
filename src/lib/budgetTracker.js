import { startOfMonth, startOfWeek, startOfDay, isSameDay, isSameWeek, isSameMonth } from 'date-fns';

/**
 * Compares actual spending this period against defined budget limits.
 * @param {Array} items - All user items
 * @param {Array} limits - BudgetLimit records
 * @returns {{ alerts: Array, byCategory: Object }}
 */
export function trackBudget(items, limits) {
  if (!limits?.length) return { alerts: [], byCategory: {} };

  const now = new Date();

  // Only spending items
  const spends = items.filter(i =>
    (i.type === 'spend' || i.type === 'eating_out' || i.type === 'leisure') && i.amount > 0
  );

  const byCategory = {};

  limits.forEach(limit => {
    // Determine period start
    let periodStart;
    if (limit.period === 'daily')   periodStart = startOfDay(now);
    else if (limit.period === 'weekly')  periodStart = startOfWeek(now, { weekStartsOn: 1 });
    else                            periodStart = startOfMonth(now);

    const periodSpends = spends.filter(i => {
      if (i.category !== limit.category) return false;
      if (!i.date) return false;
      return new Date(i.date) >= periodStart;
    });

    const spent = periodSpends.reduce((sum, i) => sum + (i.amount || 0), 0);
    const percentage = limit.limit_amount > 0 ? (spent / limit.limit_amount) * 100 : 0;

    byCategory[limit.category] = {
      spent,
      limit: limit.limit_amount,
      currency: limit.currency,
      period: limit.period,
      percentage,
      status: percentage >= 100 ? 'over' : percentage >= 80 ? 'warning' : 'ok',
    };
  });

  const alerts = Object.entries(byCategory)
    .filter(([, data]) => data.percentage >= 80)
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.percentage - a.percentage);

  return { byCategory, alerts };
}