/**
 * JAR Self-Learning Database
 * All data stored in localStorage. No external APIs. Client-side only.
 */

const PREFIX = 'jar_learn_';

// ─── Core frequency store ───────────────────────────────────────────────────

export function getFieldHistory(fieldKey) {
  try {
    const raw = localStorage.getItem(PREFIX + fieldKey);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function recordFieldValue(fieldKey, value) {
  if (!value || !String(value).trim()) return;
  const val = String(value).trim();
  const store = getFieldHistory(fieldKey);
  store[val] = (store[val] || 0) + 1;
  localStorage.setItem(PREFIX + fieldKey, JSON.stringify(store));
}

export function recordMultipleValues(fieldKey, values) {
  if (!Array.isArray(values)) return;
  values.forEach(v => recordFieldValue(fieldKey, v));
}

export function getSuggestions(fieldKey, query = '', limit = 8) {
  const store = getFieldHistory(fieldKey);
  const entries = Object.entries(store)
    .sort((a, b) => b[1] - a[1]);

  const filtered = query.length >= 1
    ? entries.filter(([k]) => k.toLowerCase().includes(query.toLowerCase()))
    : entries;

  return filtered.slice(0, limit).map(([k]) => k);
}

export function getTopSuggestions(fieldKey, limit = 5) {
  return getSuggestions(fieldKey, '', limit);
}

// ─── Category → priority memory ─────────────────────────────────────────────

export function recordCategoryPriority(category, priority) {
  if (!category) return;
  const key = PREFIX + 'catpri_' + category;
  const store = JSON.parse(localStorage.getItem(key) || '{}');
  store[String(priority)] = (store[String(priority)] || 0) + 1;
  localStorage.setItem(key, JSON.stringify(store));
}

export function getDefaultPriorityForCategory(category) {
  if (!category) return 3;
  const key = PREFIX + 'catpri_' + category;
  const store = JSON.parse(localStorage.getItem(key) || '{}');
  const entries = Object.entries(store).sort((a, b) => b[1] - a[1]);
  return entries.length ? Number(entries[0][0]) : 3;
}

// ─── Step templates ──────────────────────────────────────────────────────────

export function saveStepTemplate(title, category, steps) {
  if (!steps || steps.length < 2) return;
  const key = PREFIX + 'step_templates';
  const templates = JSON.parse(localStorage.getItem(key) || '[]');
  const template = {
    id: Date.now(),
    title: title.trim(),
    category,
    steps: steps.map(s => ({ name: s.name, priority: s.priority, duration: s.duration, notes: s.notes })),
    savedAt: new Date().toISOString(),
    useCount: 1,
  };
  // If same title exists, update it
  const idx = templates.findIndex(t => t.title.toLowerCase() === title.toLowerCase());
  if (idx >= 0) {
    templates[idx] = { ...templates[idx], steps: template.steps, savedAt: template.savedAt, useCount: (templates[idx].useCount || 1) + 1 };
  } else {
    templates.unshift(template);
  }
  // Keep max 50 templates
  localStorage.setItem(key, JSON.stringify(templates.slice(0, 50)));
}

export function findSimilarTemplate(title, category) {
  const key = PREFIX + 'step_templates';
  const templates = JSON.parse(localStorage.getItem(key) || '[]');
  if (!templates.length) return null;
  const titleLower = title.toLowerCase();
  // Exact title match first
  const exact = templates.find(t => t.title.toLowerCase() === titleLower);
  if (exact) return exact;
  // Category match
  const catMatch = templates.find(t => t.category === category && t.steps.length > 1);
  if (catMatch) return catMatch;
  // Partial title word match
  const words = titleLower.split(' ').filter(w => w.length > 3);
  const partial = templates.find(t => words.some(w => t.title.toLowerCase().includes(w)));
  return partial || null;
}

export function getAllTemplates() {
  const key = PREFIX + 'step_templates';
  return JSON.parse(localStorage.getItem(key) || '[]');
}

export function deleteTemplate(id) {
  const key = PREFIX + 'step_templates';
  const templates = JSON.parse(localStorage.getItem(key) || '[]');
  localStorage.setItem(key, JSON.stringify(templates.filter(t => t.id !== id)));
}

// ─── Export / Import entire DB ───────────────────────────────────────────────

export function exportLearningDB() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX)) {
      try { data[k] = JSON.parse(localStorage.getItem(k)); } catch { data[k] = localStorage.getItem(k); }
    }
  }
  return data;
}

export function importLearningDB(data) {
  if (typeof data !== 'object') return;
  Object.entries(data).forEach(([k, v]) => {
    if (k.startsWith(PREFIX)) {
      localStorage.setItem(k, JSON.stringify(v));
    }
  });
}

export function clearLearningDB() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX)) keys.push(k);
  }
  keys.forEach(k => localStorage.removeItem(k));
}

// ─── Seed initial data ───────────────────────────────────────────────────────

export function seedFieldValues(fieldKey, values) {
  values.forEach(v => recordFieldValue(fieldKey, v));
}