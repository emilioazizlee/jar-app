import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Payload: { category, amount, currency, user_id }
// Called after any spend/leisure/eating-out entry is created.
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { category, amount, currency } = await req.json();
  if (!category || !amount) return Response.json({ skipped: true });

  // Find matching budget limits
  const limits = await base44.entities.BudgetLimit.filter({ category, user_id: user.email });
  if (!limits.length) return Response.json({ skipped: true, reason: 'no_budget_set' });

  const now = new Date();

  for (const limit of limits) {
    // Calculate period start
    let periodStart;
    if (limit.period === 'daily') {
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (limit.period === 'weekly') {
      const day = now.getDay();
      periodStart = new Date(now);
      periodStart.setDate(now.getDate() - day);
      periodStart.setHours(0, 0, 0, 0);
    } else {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const startStr = periodStart.toISOString().split('T')[0];

    // Sum all spends for this category in this period
    const items = await base44.entities.Item.filter({
      type: 'spend',
      category,
      created_by: user.email,
    });

    const periodSpend = items
      .filter(i => i.date >= startStr)
      .reduce((sum, i) => sum + (i.amount || 0), 0);

    const pct = (periodSpend / limit.limit_amount) * 100;

    if (pct >= 100) {
      await base44.entities.Notification.create({
        type: 'budget_warning',
        title: '🚨 Budget exceeded',
        message: `${category} budget exceeded: €${periodSpend.toFixed(2)}/€${limit.limit_amount} this ${limit.period}`,
        is_read: false,
        action_url: '/spends',
        user_id: user.email,
      });
    } else if (pct >= 80) {
      await base44.entities.Notification.create({
        type: 'budget_warning',
        title: '⚠️ Budget warning',
        message: `You've spent ${pct.toFixed(0)}% of your ${category} budget (€${periodSpend.toFixed(2)}/€${limit.limit_amount})`,
        is_read: false,
        action_url: '/spends',
        user_id: user.email,
      });
    }
  }

  return Response.json({ checked: limits.length });
});