/*
 * SECURITY NOTE: localStorage is unencrypted and accessible via XSS.
 * Only non-sensitive, user-preference data should be stored here.
 * Sensitive data (auth tokens, personal info) must use secure backend storage.
 */

/**
 * JAR Brand Database
 * Personal brand memory stored in localStorage.
 * No external APIs — those are queried live in BrandInput.
 */

const BRAND_KEY = 'jar_brands_v1';

export function getAllBrands() {
  try {
    return JSON.parse(localStorage.getItem(BRAND_KEY) || '[]');
  } catch { return []; }
}

function saveBrands(brands) {
  localStorage.setItem(BRAND_KEY, JSON.stringify(brands));
}

export function getBrandSuggestions(query = '', limit = 5) {
  const all = getAllBrands();
  if (!query.trim()) return all.sort((a, b) => b.useCount - a.useCount).slice(0, limit);
  const q = query.toLowerCase();
  return all
    .filter(b => b.name.toLowerCase().includes(q))
    .sort((a, b) => b.useCount - a.useCount)
    .slice(0, limit);
}

export function saveBrand(brand) {
  const brands = getAllBrands();
  const idx = brands.findIndex(b => b.name.toLowerCase() === brand.name.toLowerCase());
  if (idx >= 0) {
    brands[idx] = {
      ...brands[idx],
      ...brand,
      useCount: (brands[idx].useCount || 0) + 1,
      source: brand.source || brands[idx].source,
    };
  } else {
    brands.unshift({
      name: brand.name,
      country: brand.country || '',
      countryFlag: brand.countryFlag || '',
      website: brand.website || '',
      logo: brand.logo || '',
      source: brand.source || 'manual',
      firstUsed: new Date().toISOString(),
      useCount: 1,
    });
  }
  saveBrands(brands);
}

export function updateBrand(originalName, updates) {
  const brands = getAllBrands();
  const idx = brands.findIndex(b => b.name.toLowerCase() === originalName.toLowerCase());
  if (idx >= 0) {
    brands[idx] = { ...brands[idx], ...updates, source: 'corrected' };
    saveBrands(brands);
  }
}

export function deleteBrand(name) {
  saveBrands(getAllBrands().filter(b => b.name.toLowerCase() !== name.toLowerCase()));
}

export function addBrandManually(brand) {
  saveBrand({ ...brand, source: 'manual' });
}