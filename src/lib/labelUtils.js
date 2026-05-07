/**
 * Central label-cleanup utility.
 * Converts internal snake_case keys to display-friendly Title Case.
 * Handles known overrides and strips _health suffixes.
 */

const OVERRIDES = {
  cigarettes_health: 'Cigarettes',
  food_out: 'Food Out',
  fixed_recurring: 'Fixed Recurring',
  public_transport: 'Public Transport',
  phone_comms: 'Phone & Comms',
  football_work: 'Football',
  food_groceries: 'Groceries',
  eating_out: 'Eating Out',
};

export function cleanLabel(raw) {
  if (!raw) return '';
  const s = String(raw);
  // Strip internal "project:" prefix — show nothing (caller resolves via getProjectName)
  if (s.startsWith('project:')) return '—';
  const key = s.toLowerCase();
  // Direct override
  if (OVERRIDES[key]) return OVERRIDES[key];
  // Strip _health suffix first, then check overrides again
  const stripped = key.replace(/_health$/, '');
  if (OVERRIDES[stripped]) return OVERRIDES[stripped];
  // If it looks like a UUID (contains hex + dashes, long), return empty string
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)) return '';
  // Title-case remaining
  return stripped.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/** Returns true if the string looks like a UUID */
export function isUUID(val) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(val || ''));
}

/** Format axis tick — integer only */
export function intTick(v) {
  const n = Number(v);
  return Number.isInteger(n) ? String(n) : '';
}

/**
 * Resolves a project ID to its display name.
 * Pass in the projects array from your query.
 * Returns "—" if not found, and the raw value if it's clearly not a UUID.
 */
export function getProjectName(projectId, projects = []) {
  if (!projectId) return '—';
  // If it doesn't look like a UUID/ID (no hex chars, short), return as-is
  if (projectId.length < 10) return projectId;
  const found = projects.find(p => p.id === projectId);
  return found ? found.name : '—';
}