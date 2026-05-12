/**
 * Centralized React Query configuration and cache key registry.
 * Import CACHE_KEYS everywhere instead of using raw strings.
 */

/**
 * All query cache keys in one place — prevents typos and enables
 * precise invalidation without magic strings scattered across files.
 */
export const CACHE_KEYS = {
  // Core
  ITEMS: 'items',
  PROJECTS: 'projects',
  CURRENT_USER: 'current-user',

  // Leisure
  LEISURE: 'leisure',

  // Diet & Health
  DIET: 'diet',
  RECIPES: 'recipes',
  WATER_LOGS: 'water-logs',
  DIET_GOALS: 'diet-goals',
  EATING_OUT: 'eating-out',

  // Groceries
  GROCERY_SHOPS: 'grocery-shops',
  GROCERY_PRODUCTS: 'grocery-products',
  SHOPPING_LIST: 'shopping-list',
  PANTRY: 'pantry',

  // Finance
  FINANCE_SNAPSHOTS: 'finance-snapshots',
  FINANCE_GOALS: 'finance-goals',

  // Misc
  NOTIFICATIONS: 'notifications',
  CUSTOM_CATEGORIES: 'custom-categories',
  BUDGET_LIMITS: 'budget-limits',
  FAVORITES: 'favorites',
};

/**
 * Smart invalidation helper — invalidates the given entity's cache
 * AND any related caches that might be stale.
 *
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {string} entityType - Entity name e.g. 'Item', 'Project'
 */
export function invalidateRelated(queryClient, entityType) {
  const map = {
    Item: [CACHE_KEYS.ITEMS],
    Project: [CACHE_KEYS.PROJECTS, CACHE_KEYS.ITEMS],
    LeisureEntry: [CACHE_KEYS.LEISURE],
    DietLog: [CACHE_KEYS.DIET],
    GroceryShop: [CACHE_KEYS.GROCERY_SHOPS],
    GroceryProduct: [CACHE_KEYS.GROCERY_PRODUCTS],
    ShoppingListItem: [CACHE_KEYS.SHOPPING_LIST],
    PantryItem: [CACHE_KEYS.PANTRY],
    FinanceSnapshot: [CACHE_KEYS.FINANCE_SNAPSHOTS],
    FinanceGoal: [CACHE_KEYS.FINANCE_GOALS],
    WaterLog: [CACHE_KEYS.WATER_LOGS],
    Recipe: [CACHE_KEYS.RECIPES],
  };

  const keys = map[entityType] ?? [];
  keys.forEach(key => queryClient.invalidateQueries({ queryKey: [key] }));
}