import { differenceInDays } from 'date-fns';

/**
 * Analyzes subscription items and returns renewal alerts + unused suggestions.
 * @param {Array} items - All user items from the Item entity
 * @returns {{ totalMonthly: number, upcomingRenewals: Array, unusedSuggestions: Array }}
 */
export function analyzeSubscriptions(items) {
  const subs = items.filter(i => i.type === 'subscription' && i.is_active !== false);
  const now = new Date();

  let totalMonthly = 0;
  const upcomingRenewals = [];
  const unusedSuggestions = [];

  subs.forEach(sub => {
    // Monthly cost normalization
    if (sub.amount) {
      const multiplier =
        sub.billing_cycle === 'yearly'    ? 1 / 12 :
        sub.billing_cycle === 'quarterly' ? 1 / 3 :
        1; // monthly / default
      totalMonthly += sub.amount * multiplier;
    }

    // Upcoming renewals within 7 days
    if (sub.next_renewal) {
      const daysUntil = differenceInDays(new Date(sub.next_renewal), now);
      if (daysUntil >= 0 && daysUntil <= 7) {
        upcomingRenewals.push({ ...sub, daysUntil });
      }
    }

    // Detect unused: no spend/leisure entry with matching category in last 60 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 60);

    const relatedActivity = items.filter(i =>
      i.type !== 'subscription' &&
      i.category === sub.category &&
      i.date && new Date(i.date) >= cutoff
    );

    if (relatedActivity.length === 0 && sub.category) {
      unusedSuggestions.push(sub);
    }
  });

  // Sort renewals soonest first
  upcomingRenewals.sort((a, b) => a.daysUntil - b.daysUntil);

  return { totalMonthly, upcomingRenewals, unusedSuggestions };
}