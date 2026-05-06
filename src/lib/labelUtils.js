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
  const key = String(raw).toLowerCase();
  if (OVERRIDES[key]) return OVERRIDES[key];
  // Strip _health suffix
  const stripped = key.replace(/_health$/, '');
  if (OVERRIDES[stripped]) return OVERRIDES[stripped];
  // Title-case remaining
  return stripped.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
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