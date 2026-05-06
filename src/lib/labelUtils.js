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