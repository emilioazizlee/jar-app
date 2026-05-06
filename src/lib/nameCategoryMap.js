/**
 * JAR Smart Category Memory
 * Maps item names → categories based on user history.
 * Stored in localStorage under key: jar_name_category_map
 */

const KEY = 'jar_name_category_map';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

function save(db) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

// Record or strengthen a name → category mapping
export function recordNameCategory(name, category) {
  if (!name || !category) return;
  const db = load();
  const n = name.trim().toLowerCase();
  if (!db[n]) db[n] = {};
  db[n][category] = (db[n][category] || 0) + 1;
  save(db);
}

// Get the best category for a name (highest confidence), returns null if unknown
export function getCategoryForName(name) {
  if (!name || name.length < 2) return null;
  const db = load();
  const n = name.trim().toLowerCase();
  // Exact match
  if (db[n]) {
    const entries = Object.entries(db[n]).sort((a, b) => b[1] - a[1]);
    return entries[0]?.[0] || null;
  }
  // Partial match (name contains a known key or vice versa)
  for (const key of Object.keys(db)) {
    if (key.length >= 3 && (n.includes(key) || key.includes(n))) {
      const entries = Object.entries(db[key]).sort((a, b) => b[1] - a[1]);
      return entries[0]?.[0] || null;
    }
  }
  return null;
}

export function exportNameCategoryMap() {
  return load();
}