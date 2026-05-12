/**
 * Open Food Facts API — free, no API key required
 * v1 search endpoint + v2 barcode lookup
 */

const API_V2 = 'https://world.openfoodfacts.org/api/v2';

// ─── Existing search (used by Groceries / Diet autocomplete) ──────────────────
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

// ─── v2 search (richer: image, nutriscore, barcode) ──────────────────────────
export async function searchProduct(query) {
  if (!query || query.length < 2) return [];
  try {
    const res = await fetch(
      `${API_V2}/search?search_terms=${encodeURIComponent(query)}&page_size=10&fields=product_name,brands,image_url,nutriscore_grade,nutriments,code`,
      { signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    return (data.products || [])
      .filter(p => p.product_name)
      .map(p => ({
        name: p.product_name || 'Unknown Product',
        brand: p.brands || '',
        barcode: p.code || '',
        image: p.image_url || '',
        nutriscore: p.nutriscore_grade || '',
        nutrition: {
          kcal: p.nutriments?.['energy-kcal_100g'] || 0,
          protein: p.nutriments?.proteins_100g || 0,
          carbs: p.nutriments?.carbohydrates_100g || 0,
          fat: p.nutriments?.fat_100g || 0,
          fiber: p.nutriments?.fiber_100g || 0,
        },
        // Also expose flat fields for direct GroceryProduct mapping
        calories_per_100: p.nutriments?.['energy-kcal_100g'] || null,
        protein_per_100: p.nutriments?.proteins_100g || null,
        carbs_per_100: p.nutriments?.carbohydrates_100g || null,
        fat_per_100: p.nutriments?.fat_100g || null,
        image_url: p.image_url || '',
        has_nutrition: !!(p.nutriments?.['energy-kcal_100g']),
        source: 'open_food_facts',
      }));
  } catch (e) {
    console.error('OFF v2 search error:', e);
    return [];
  }
}

// ─── Barcode lookup ───────────────────────────────────────────────────────────
export async function getProductByBarcode(barcode) {
  if (!barcode) return null;
  try {
    const res = await fetch(
      `${API_V2}/product/${barcode}?fields=product_name,brands,image_url,nutriscore_grade,nutriments`,
      { signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    if (data.status !== 1) return null;
    const p = data.product;
    return {
      name: p.product_name || 'Unknown',
      brand: p.brands || '',
      barcode,
      image: p.image_url || '',
      image_url: p.image_url || '',
      nutriscore: p.nutriscore_grade || '',
      nutrition: {
        kcal: p.nutriments?.['energy-kcal_100g'] || 0,
        protein: p.nutriments?.proteins_100g || 0,
        carbs: p.nutriments?.carbohydrates_100g || 0,
        fat: p.nutriments?.fat_100g || 0,
      },
      calories_per_100: p.nutriments?.['energy-kcal_100g'] || null,
      protein_per_100: p.nutriments?.proteins_100g || null,
      carbs_per_100: p.nutriments?.carbohydrates_100g || null,
      fat_per_100: p.nutriments?.fat_100g || null,
      has_nutrition: !!(p.nutriments?.['energy-kcal_100g']),
      source: 'open_food_facts',
    };
  } catch (e) {
    console.error('Barcode lookup error:', e);
    return null;
  }
}