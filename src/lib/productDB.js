/**
 * Shared product database utilities — cross-module (Groceries + Diet)
 * Products stored in GroceryProduct entity. Local cache in localStorage for fast autocomplete.
 */

import { base44 } from '@/api/base44Client';

const CACHE_KEY = 'jar_products_cache_v1';
const CACHE_TTL = 5 * 60 * 1000; // 5 min

export function getLocalProductCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, products } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return products;
  } catch { return null; }
}

export function setLocalProductCache(products) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), products }));
  } catch {}
}

export function invalidateProductCache() {
  localStorage.removeItem(CACHE_KEY);
}

export function searchLocalProducts(query, products) {
  if (!query || !products) return [];
  const q = query.toLowerCase();
  return products
    .filter(p => p.name.toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q))
    .sort((a, b) => (b.buy_count || 0) - (a.buy_count || 0))
    .slice(0, 8);
}

// Update product commerce fields after a purchase
export async function updateProductAfterPurchase(productId, { store, price, unit, date }) {
  const p = await base44.entities.GroceryProduct.list().then(all => all.find(x => x.id === productId));
  if (!p) return;
  const history = p.price_history || [];
  history.unshift({ store, price, unit, date: date || new Date().toISOString().slice(0, 10) });
  const prices = history.map(h => h.price).filter(Boolean);
  const minPrice = Math.min(...prices);
  const cheapestEntry = history.reduce((best, h) => (!best || h.price < best.price) ? h : best, null);

  await base44.entities.GroceryProduct.update(productId, {
    last_price: price,
    avg_price: prices.length ? (prices.reduce((a, b) => a + b, 0) / prices.length) : price,
    min_price: minPrice,
    max_price: Math.max(...prices),
    cheapest_store: cheapestEntry?.store || store,
    typical_store: store,
    buy_count: (p.buy_count || 0) + 1,
    price_history: history.slice(0, 50),
    default_unit: unit || p.default_unit,
  });
  invalidateProductCache();
}

// Get or create a product by name+brand
export async function getOrCreateProduct(name, brand = '', category = 'Other') {
  const all = await base44.entities.GroceryProduct.list();
  const found = all.find(p =>
    p.name.toLowerCase() === name.toLowerCase() &&
    (p.brand || '').toLowerCase() === brand.toLowerCase()
  );
  if (found) return found;
  const created = await base44.entities.GroceryProduct.create({ name, brand, category, buy_count: 0 });
  invalidateProductCache();
  return created;
}