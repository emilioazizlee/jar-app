/**
 * ExchangeRate API — free tier, no key required for v4/latest
 * https://api.exchangerate-api.com
 */

const API_BASE = 'https://api.exchangerate-api.com/v4/latest';

let rateCache = {};
let cacheExpiry = 0;

export async function getRate(from, to) {
  if (from === to) return 1;
  const key = `${from}_${to}`;
  if (rateCache[key] && Date.now() < cacheExpiry) return rateCache[key];

  try {
    const res = await fetch(`${API_BASE}/${from}`, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    // Cache all rates from this base to avoid redundant fetches
    Object.entries(data.rates || {}).forEach(([currency, rate]) => {
      rateCache[`${from}_${currency}`] = rate;
    });
    cacheExpiry = Date.now() + 3600000; // 1 hour
    return rateCache[key] ?? 1;
  } catch (e) {
    console.error('Exchange rate error:', e);
    return 1;
  }
}

export async function convertAmount(amount, from, to) {
  if (!amount || from === to) return amount;
  const rate = await getRate(from, to);
  return amount * rate;
}

export async function getAllRates(baseCurrency = 'EUR') {
  try {
    const res = await fetch(`${API_BASE}/${baseCurrency}`, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    return data.rates || {};
  } catch (e) {
    console.error('getAllRates error:', e);
    return {};
  }
}

export function getDisplayCurrency() {
  return localStorage.getItem('jar_display_currency') || 'EUR';
}

export function setDisplayCurrency(currency) {
  localStorage.setItem('jar_display_currency', currency);
}

export const CURRENCY_SYMBOLS = {
  EUR: '€', USD: '$', AZN: '₼', RUB: '₽', TRY: '₺', GBP: '£',
};

export function formatAmount(amount, currency) {
  const sym = CURRENCY_SYMBOLS[currency] || currency;
  return `${sym}${Number(amount).toFixed(2)}`;
}