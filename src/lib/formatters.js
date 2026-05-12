/**
 * Formatting utilities — currency, numbers, dates, text.
 * Use these instead of inline Intl/date-fns calls in components.
 */

/**
 * Formats a monetary amount with currency symbol.
 * @param {number} amount
 * @param {string} currency - ISO code e.g. 'EUR'
 * @param {string} locale
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'EUR', locale = 'en-US') {
  if (amount == null || isNaN(amount)) return '—';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a number with k/M suffix.
 * @param {number} num
 * @param {number} decimals
 * @returns {string}
 */
export function formatNumber(num, decimals = 1) {
  if (num == null || isNaN(num)) return '—';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(decimals)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(decimals)}k`;
  return Number.isInteger(num) ? String(num) : num.toFixed(decimals);
}

/**
 * Formats a date as a short or long string.
 * @param {string|Date} date
 * @param {'short'|'long'|'relative'} format
 * @returns {string}
 */
export function formatDate(date, format = 'short') {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  if (format === 'relative') return _getRelativeTime(d);
  const opts = {
    short: { month: 'short', day: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
  };
  return new Intl.DateTimeFormat('en-US', opts[format] || opts.short).format(d);
}

function _getRelativeTime(date) {
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return formatDate(date, 'short');
}

/**
 * Truncates text with ellipsis.
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Formats a value as a percentage of a total.
 * @param {number} value
 * @param {number} total
 * @param {number} decimals
 * @returns {string}
 */
export function formatPercent(value, total, decimals = 0) {
  if (!total) return '0%';
  return `${((value / total) * 100).toFixed(decimals)}%`;
}