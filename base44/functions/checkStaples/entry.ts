import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Scheduled daily. Checks all staple products and auto-adds to shopping list.
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const staples = await base44.asServiceRole.entities.GroceryProduct.filter({ is_staple: true });
  const today = new Date();
  let added = 0;

  for (const product of staples) {
    if (!product.staple_frequency_days) continue;

    // Find the last time this product was added to shopping list
    const lastAdds = await base44.asServiceRole.entities.ShoppingListItem.filter({ product_id: product.id });
    let lastAddDate = null;

    if (lastAdds.length) {
      const sorted = lastAdds.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      lastAddDate = new Date(sorted[0].created_date);
    }

    const daysSinceLastAdd = lastAddDate
      ? Math.floor((today - lastAddDate) / (1000 * 60 * 60 * 24))
      : product.staple_frequency_days; // treat as overdue if never added

    if (daysSinceLastAdd >= product.staple_frequency_days) {
      // Check if already on shopping list (unchecked)
      const unchecked = (lastAdds || []).filter(i => !i.is_checked);
      if (unchecked.length) continue; // already on the list

      await base44.asServiceRole.entities.ShoppingListItem.create({
        product_id: product.id,
        quantity: 1,
        unit: product.default_unit || 'pcs',
        source: 'staple',
        is_checked: false,
      });

      await base44.asServiceRole.entities.Notification.create({
        type: 'staple_reminder',
        title: 'Staple reminder',
        message: `Added ${product.name} to your list (you buy it every ${product.staple_frequency_days} days)`,
        is_read: false,
        action_url: '/groceries',
        user_id: 'system',
      });

      added++;
    }
  }

  return Response.json({ checked: staples.length, added });
});