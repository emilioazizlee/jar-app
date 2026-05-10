/**
 * Shared JAR score calculation.
 * JAR = measure of intentional daily living.
 * 10 points = 1 JAR
 */

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
 * @param {Array} data.items         - Item records (spend, task, subscription, etc.)
 * @param {Array} data.dietLogs      - DietLog records
 * @param {Array} data.waterLogs     - WaterLog records
 * @param {Array} data.leisureEntries - LeisureEntry records
 * @param {Array} data.groceryShops  - GroceryShop records
 * @returns {number} JAR score (e.g. 2.4)
 */
export function calculateJars({ items = [], dietLogs = [], waterLogs = [], leisureEntries = [], groceryShops = [] }) {
  const spends = items.filter(i => i.type === 'spend');
  const tasksDone = items.filter(i => i.type === 'task' && i.status === 'done');
  const tasksOpen = items.filter(i => i.type === 'task' && i.status !== 'done');

  let score = 0;
  score += spends.length * WEIGHTS.spend;
  score += tasksDone.length * WEIGHTS.task_done;
  score += tasksOpen.length * WEIGHTS.task_open;
  score += dietLogs.length * WEIGHTS.meal;
  score += waterLogs.length * WEIGHTS.water;
  score += leisureEntries.length * WEIGHTS.leisure;
  score += groceryShops.length * WEIGHTS.grocery;

  return score / 10;
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