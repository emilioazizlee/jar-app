/**
 * Open Food Facts API — free, no API key
 */

export async function searchOFF(query) {
  if (!query || query.length < 2) return [];
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=15&fields=product_name,brands,nutriments,image_small_url,categories_tags,countries_tags`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    const json = await res.json();
    const seen = new Set();
    const results = [];
    for (const p of (json.products || [])) {
      const name = (p.product_name || '').trim();
      const brand = (p.brands || '').split(',')[0].trim();
      if (!name) continue;
      const key = `${name.toLowerCase()}|${brand.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const n = p.nutriments || {};
      results.push({
        name,
        brand,
        image_url: p.image_small_url || '',
        calories_per_100: n['energy-kcal_100g'] || n['energy-kcal'] || null,
        protein_per_100: n.proteins_100g || null,
        carbs_per_100: n.carbohydrates_100g || null,
        fat_per_100: n.fat_100g || null,
        has_nutrition: !!(n['energy-kcal_100g'] || n['energy-kcal']),
        source: 'open_food_facts',
      });
      if (results.length >= 8) break;
    }
    return results;
  } catch {
    return [];
  }
}