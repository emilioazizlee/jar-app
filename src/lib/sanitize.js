/**
 * Input sanitization utilities
 * Apply at form submission boundaries before persisting data.
 */

export function sanitizeText(input, maxLength = 1000) {
  if (!input) return '';
  return String(input)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeAmount(input) {
  const num = parseFloat(input);
  if (isNaN(num) || num < 0 || num > 999999) return 0;
  return Math.round(num * 100) / 100;
}

export function sanitizeDate(input) {
  if (!input) return new Date().toISOString().split('T')[0];
  const d = new Date(input);
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
  return d.toISOString().split('T')[0];
}

export function sanitizeEmail(input) {
  if (!input) return '';
  const cleaned = String(input).trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned) ? cleaned : '';
}

export function sanitizeUrl(input) {
  if (!input) return '';
  try {
    const url = new URL(input);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    return url.href;
  } catch {
    return '';
  }
}

export function sanitizeInt(input, min = 0, max = 999999) {
  const n = parseInt(input, 10);
  if (isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}