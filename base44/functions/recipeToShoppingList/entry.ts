import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Payload: { recipe_id }
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { recipe_id } = await req.json();

  const recipe = await base44.entities.Recipe.get(recipe_id).catch(() => null);
  if (!recipe) return Response.json({ error: 'Recipe not found' }, { status: 404 });

  const ingredients = recipe.ingredients || [];
  if (!ingredients.length) return Response.json({ added: 0, skipped: 0 });

  // Fetch all pantry items once
  const pantryItems = await base44.entities.PantryItem.list();
  const pantryByProductId = {};
  for (const p of pantryItems) {
    if (p.product_id) pantryByProductId[p.product_id] = p;
  }

  let added = 0;
  let skipped = 0;

  for (const ing of ingredients) {
    if (!ing.name || !ing.name.trim()) continue;

    // Check if pantry has sufficient quantity (by product_id if available)
    if (ing.product_id && pantryByProductId[ing.product_id]) {
      const pantry = pantryByProductId[ing.product_id];
      if (pantry.quantity >= (ing.quantity || 0)) {
        skipped++;
        continue;
      }
    }

    await base44.entities.ShoppingListItem.create({
      product_id: ing.product_id || undefined,
      quantity: ing.quantity || 1,
      unit: ing.unit || 'pcs',
      source: 'recipe',
      recipe_id: recipe_id,
      is_checked: false,
    });
    added++;
  }

  return Response.json({ added, skipped, total: ingredients.length });
});