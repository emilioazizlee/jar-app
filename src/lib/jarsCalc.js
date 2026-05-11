/**
 * Shared JAR score calculation.
 * JAR = measure of intentional daily living.
 * 10 points = 1 JAR
 */
import { startOfMonth, startOfDay, format } from 'date-fns';

const WEIGHTS = {
  spend: 1,
  task_done: 3,
  task_open: 1,
  meal: 2,
  water: 0.5,
  leisure: 1.5,
  grocery: 0.5,
};

/**
 * @param {object} data
 * @param {Array} data.items          - Item records (spend, task, subscription, etc.)
 * @param {Array} data.dietLogs       - DietLog records
 * @param {Array} data.waterLogs      - WaterLog records
 * @param {Array} data.leisureEntries - LeisureEntry records
 * @param {Array} data.groceryShops   - GroceryShop records
 * @param {'month'|'today'} period    - Filter period (default: 'month')
 * @returns {number} JAR score (e.g. 2.4)
 */
export function calculateJars({ items = [], dietLogs = [], waterLogs = [], leisureEntries = [], groceryShops = [] }, period = 'month') {
  const now = new Date();
  const periodStart = period === 'today'
    ? format(startOfDay(now), 'yyyy-MM-dd')
    : format(startOfMonth(now), 'yyyy-MM-dd');

  const inPeriod = (record) => {
    const d = record.date || record.created_date;
    return d && d >= periodStart;
  };

  const filtered = {
    items: items.filter(inPeriod),
    dietLogs: dietLogs.filter(inPeriod),
    waterLogs: waterLogs.filter(inPeriod),
    leisureEntries: leisureEntries.filter(inPeriod),
    groceryShops: groceryShops.filter(inPeriod),
  };

  const spends = filtered.items.filter(i => i.type === 'spend');
  const tasksDone = filtered.items.filter(i => i.type === 'task' && i.status === 'done');
  const tasksOpen = filtered.items.filter(i => i.type === 'task' && i.status !== 'done');

  let score = 0;
  score += spends.length * WEIGHTS.spend;
  score += tasksDone.length * WEIGHTS.task_done;
  score += tasksOpen.length * WEIGHTS.task_open;
  score += filtered.dietLogs.length * WEIGHTS.meal;
  score += filtered.waterLogs.length * WEIGHTS.water;
  score += filtered.leisureEntries.length * WEIGHTS.leisure;
  score += filtered.groceryShops.length * WEIGHTS.grocery;

  return Math.round((score / 10) * 10) / 10;
}

/**
 * Filter any array of records to the current calendar month.
 */
export function filterThisMonth(arr, monthStart) {
  return arr.filter(i => {
    const d = i.date || i.created_date;
    return d && d >= monthStart;
  });
}