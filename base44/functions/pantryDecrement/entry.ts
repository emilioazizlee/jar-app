import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Called after a DietLog entry is created.
// Payload: { diet_log_id }
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { diet_log_id } = await req.json();

  // Fetch the diet log
  const log = await base44.entities.DietLog.get(diet_log_id).catch(() => null);
  if (!log) return Response.json({ error: 'DietLog not found' }, { status: 404 });

  // Skip if already decremented or no product link
  if (log.decremented_pantry || !log.product_id) {
    return Response.json({ skipped: true });
  }

  // Find matching pantry item
  const pantryItems = await base44.entities.PantryItem.filter({ product_id: log.product_id });
  if (!pantryItems.length) {
    await base44.entities.DietLog.update(diet_log_id, { decremented_pantry: true });
    return Response.json({ skipped: true, reason: 'no_pantry_item' });
  }

  const pantry = pantryItems[0];

  // Decrement — assume log quantity matches pantry unit
  const consumed = log.quantity || 1;
  const newQty = Math.max(0, (pantry.quantity || 0) - consumed);
  await base44.entities.PantryItem.update(pantry.id, { quantity: newQty });
  await base44.entities.DietLog.update(diet_log_id, { decremented_pantry: true });

  const notifications = [];

  // Check reorder threshold
  if (pantry.min_quantity && newQty < pantry.min_quantity) {
    // Auto-add to shopping list (avoid duplicates)
    const existing = await base44.entities.ShoppingListItem.filter({ product_id: log.product_id, is_checked: false });
    if (!existing.length) {
      await base44.entities.ShoppingListItem.create({
        product_id: log.product_id,
        quantity: pantry.min_quantity * 2 || 1,
        unit: pantry.unit || 'pcs',
        source: 'pantry_low',
        is_checked: false,
      });
    }

    // Create notification
    await base44.entities.Notification.create({
      type: 'pantry_low',
      title: 'Running low',
      message: `Pantry updated: ${log.name} -${consumed}, now at ${newQty} (reorder soon)`,
      is_read: false,
      action_url: '/groceries',
      user_id: user.email,
    });
    notifications.push('pantry_low');
  }

  return Response.json({ decremented: true, old_qty: pantry.quantity, new_qty: newQty, notifications });
});