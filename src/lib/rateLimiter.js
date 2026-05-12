/**
 * Client-side rate limiter.
 * Prevents rapid-fire form submissions / accidental duplicate creates.
 */

const _limits = {};

/**
 * @param {string} action  - unique key, e.g. 'create_spend'
 * @param {number} maxPerMinute - max calls allowed per 60-second window
 * @throws Error if limit exceeded
 */
export function checkRateLimit(action, maxPerMinute = 30) {
  const now = Date.now();
  if (!_limits[action]) _limits[action] = [];
  // Evict timestamps older than 1 minute
  _limits[action] = _limits[action].filter(t => now - t < 60000);
  if (_limits[action].length >= maxPerMinute) {
    throw new Error(`Too many requests for "${action}". Please slow down.`);
  }
  _limits[action].push(now);
  return true;
}

export function resetRateLimit(action) {
  delete _limits[action];
}

export function getRateLimitStatus(action, maxPerMinute = 30) {
  const now = Date.now();
  const recent = (_limits[action] || []).filter(t => now - t < 60000);
  return { used: recent.length, remaining: Math.max(0, maxPerMinute - recent.length) };
}