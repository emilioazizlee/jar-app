/**
 * JAR Autocomplete Engine
 * Per-field frequency-based autocomplete with decay.
 * Stored in localStorage under key: jar_autocomplete
 */

const AC_KEY = 'jar_autocomplete';
const DECAY_KEY = 'jar_ac_last_decay';
const DECAY_INTERVAL_DAYS = 30;
const DECAY_FACTOR = 0.9;
const PRUNE_THRESHOLD = 0.5;

function load() {
  try { return JSON.parse(localStorage.getItem(AC_KEY) || '{}'); } catch { return {}; }
}

function save(db) {
  localStorage.setItem(AC_KEY, JSON.stringify(db));
}

// Run on app startup: decay frequencies if 30 days have passed
export function runDecayIfNeeded() {
  const lastRun = localStorage.getItem(DECAY_KEY);
  const now = Date.now();
  if (lastRun && now - parseInt(lastRun, 10) < DECAY_INTERVAL_DAYS * 86400 * 1000) return;

  const db = load();
  for (const field in db) {
    db[field] = db[field]
      .map(entry => ({ ...entry, frequency: entry.frequency * DECAY_FACTOR }))
      .filter(entry => entry.frequency >= PRUNE_THRESHOLD);
  }
  save(db);
  localStorage.setItem(DECAY_KEY, String(now));
}

export function recordValue(fieldKey, value) {
  if (!value || !String(value).trim()) return;
  const val = String(value).trim();
  const db = load();
  if (!db[fieldKey]) db[fieldKey] = [];
  const idx = db[fieldKey].findIndex(e => e.value.toLowerCase() === val.toLowerCase());
  if (idx >= 0) {
    db[fieldKey][idx].frequency += 1;
    db[fieldKey][idx].lastUsed = Date.now();
  } else {
    db[fieldKey].push({ value: val, frequency: 1, lastUsed: Date.now() });
  }
  save(db);
}

export function getSuggestions(fieldKey, query = '', limit = 5) {
  const db = load();
  const entries = db[fieldKey] || [];
  const q = query.toLowerCase().trim();
  return entries
    .filter(e => q === '' || e.value.toLowerCase().startsWith(q))
    .sort((a, b) => b.frequency - a.frequency || b.lastUsed - a.lastUsed)
    .slice(0, limit)
    .map(e => e.value);
}

export function getTopValues(fieldKey, limit = 5) {
  return getSuggestions(fieldKey, '', limit);
}

export function exportAutocomplete() {
  return load();
}

export function importAutocomplete(data) {
  if (typeof data !== 'object') return;
  save(data);
}