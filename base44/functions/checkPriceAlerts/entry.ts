import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Scheduled daily. No payload needed.
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Use service role — this runs as a scheduled job
  const shoppingList = await base44.asServiceRole.entities.ShoppingListItem.list();
  const productIds = [...new Set(shoppingList.map(i => i.product_id).filter(Boolean))];

  let alertsCreated = 0;

  for (const productId of productIds) {
    const product = await base44.asServiceRole.entities.GroceryProduct.get(productId).catch(() => null);
    if (!product || !product.typical_store || !product.last_price) continue;

    const priceHistory = await base44.asServiceRole.entities.PriceHistory.filter({ product_id: productId });
    if (!priceHistory.length) continue;

    const typicalPrice = product.last_price;
    const typicalStore = product.typical_store;

    // Find cheapest alternative store
    const byStore = {};
    for (const ph of priceHistory) {
      if (ph.store === typicalStore) continue;
      if (!byStore[ph.store] || ph.price < byStore[ph.store].price) {
        byStore[ph.store] = ph;
      }
    }

    for (const [store, ph] of Object.entries(byStore)) {
      const savings = ((typicalPrice - ph.price) / typicalPrice) * 100;
      if (savings >= 15) {
        // Check if we already created this alert recently (last 7 days)
        const recent = await base44.asServiceRole.entities.Notification.filter({ type: 'price_alert' });
        const alreadyExists = recent.some(n =>
          n.message.includes(product.name) && n.message.includes(store) &&
          new Date(n.created_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
        if (alreadyExists) continue;

        await base44.asServiceRole.entities.Notification.create({
          type: 'price_alert',
          title: 'Price alert',
          message: `${product.name} is ${savings.toFixed(0)}% cheaper at ${store} (€${ph.price.toFixed(2)} vs €${typicalPrice.toFixed(2)})`,
          is_read: false,
          action_url: '/groceries',
          user_id: 'system',
        });
        alertsCreated++;
      }
    }
  }

  return Response.json({ checked: productIds.length, alertsCreated });
});