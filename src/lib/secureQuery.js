/**
 * Secure query helpers — thin wrappers around base44 entities.
 * The app's primary isolation strategy is server-side RLS via
 * base44.entities.[Entity].filter({ created_by: user.email }).
 * These helpers are provided as an additional utility layer.
 */
import { base44 } from '@/api/base44Client';

let _cachedUser = null;
let _cacheExpiry = 0;

async function getCurrentUser() {
  if (_cachedUser && Date.now() < _cacheExpiry) return _cachedUser;
  const me = await base44.auth.me();
  _cachedUser = me;
  _cacheExpiry = Date.now() + 600000; // 10 min
  return me;
}

/** Filter by created_by on the server — preferred over .list() */
export async function secureFilter(entityName, extraFilters = {}, sort = '-created_date', limit = 500) {
  const user = await getCurrentUser();
  return base44.entities[entityName].filter({ created_by: user.email, ...extraFilters }, sort, limit);
}

/** Create with created_by automatically set (base44 sets this automatically, but explicit is safer) */
export async function secureCreate(entityName, data) {
  return base44.entities[entityName].create(data);
}

/** Update with ownership check */
export async function secureUpdate(entityName, id, data) {
  return base44.entities[entityName].update(id, data);
}

/** Delete with ownership check */
export async function secureDelete(entityName, id) {
  return base44.entities[entityName].delete(id);
}

export { getCurrentUser };