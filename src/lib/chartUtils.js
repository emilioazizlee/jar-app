/**
 * Central chart utilities — integer axes, X-axis config, empty states.
 * Import and use in every chart across the app.
 */

import { subDays, startOfWeek, startOfMonth, startOfYear, format, isSameDay } from 'date-fns';

function startOfQuarter(date) {
  const d = new Date(date);
  const qMonth = Math.floor(d.getMonth() / 3) * 3;
  return new Date(d.getFullYear(), qMonth, 1);
}

// ─── Count-based metrics (never show decimal Y ticks) ───────────────────────
const COUNT_METRICS = new Set([
  'cigarettes', 'cigarettes_health', 'coffee', 'taxi', 'food_out', 'groceries',
  'entries', 'tasks', 'jars', 'meals', 'drinks', 'sleep_hours_count',
  'activity_count', 'count', 'quantity',
]);

export function isCountMetric(name) {
  return COUNT_METRICS.has(String(name).toLowerCase());
}

/**
 * Build integer-only Y-axis tick values for count charts.
 * Returns [0, 1, 2, … max], capped at maxTicks steps.
 */
export function intTickValues(max, maxTicks = 6) {
  const m = Math.max(1, Math.ceil(max));
  if (m <= maxTicks) return Array.from({ length: m + 1 }, (_, i) => i);
  const step = Math.ceil(m / maxTicks);
  const ticks = [];
  for (let i = 0; i <= m; i += step) ticks.push(i);
  if (ticks[ticks.length - 1] < m) ticks.push(m);
  return ticks;
}

/** Format tick — integer only, empty string for decimals */
export function intTickFormat(v) {
  const n = Number(v);
  return Number.isInteger(n) ? String(n) : '';
}

/**
 * Build standard X-axis date config for time-series charts.
 * @param {number} totalDays  – number of data points
 * @param {boolean} isMobile  – narrow viewport
 * @returns nivo axisBottom config object
 */
export function xAxisConfig(totalDays, isMobile = false) {
  // How often to show a tick label
  let interval;
  if (totalDays <= 7) interval = 1;
  else if (totalDays <= 14) interval = 2;
  else if (totalDays <= 31) interval = isMobile ? 7 : 5;
  else if (totalDays <= 90) interval = isMobile ? 14 : 7;
  else interval = isMobile ? 30 : 15;

  return {
    tickSize: 0,
    tickPadding: 8,
    tickRotation: 0, // NEVER rotate
    format: (val, idx) => {
      // val is the day label — we rely on index-based filtering
      // For nivo bar charts indexBy="day", val === data[idx].day
      return val; // filtering done via tickValues
    },
    tickValues: interval, // nivo uses this as "every N ticks"
  };
}

/**
 * For nivo bar charts: return tickValues array of indices that should show labels.
 * Pass the full data array and interval.
 */
export function xTickFilter(data, interval) {
  return data
    .map((d, i) => i % interval === 0 ? d.day || d.x || d.date : null)
    .filter(Boolean);
}

// ─── Date range utilities ────────────────────────────────────────────────────

export function getRangeStart(range) {
  const now = new Date();
  switch (range) {
    case 'today':   return now;
    case 'week':    return startOfWeek(now, { weekStartsOn: 1 });
    case 'month':   return startOfMonth(now);
    case 'quarter': return startOfQuarter(now);
    case 'year':    return startOfYear(now);
    default:        return startOfMonth(now);
  }
}

export function getRangeDays(range) {
  switch (range) {
    case 'today':   return 1;
    case 'week':    return 7;
    case 'month':   return 30;
    case 'quarter': return 90;
    case 'year':    return 365;
    default:        return 30;
  }
}

/**
 * Build time-series data array for a given range.
 * @param {Array}    items    – all data items
 * @param {string}   range    – 'today'|'week'|'month'|'quarter'|'year'
 * @param {Function} getValue – (item) => numeric value to sum per day
 * @returns Array of { day: string (day number), label: string, value: number }
 */
export function buildTimeSeriesData(items, range, getValue = () => 1) {
  const n = getRangeDays(range);
  return Array.from({ length: n }, (_, i) => {
    const d = subDays(new Date(), n - 1 - i);
    const value = items
      .filter(item => item.date && isSameDay(new Date(item.date), d))
      .reduce((sum, item) => sum + getValue(item), 0);
    return {
      day: format(d, 'd'),
      label: format(d, 'MMM d'),
      value,
    };
  });
}