/**
 * Application-wide constants.
 * Import from here instead of hardcoding magic numbers/strings.
 */

// Database & Query Limits
export const QUERY_LIMITS = {
  DEFAULT: 50,
  ITEMS: 500,
  PROJECTS: 50,
  LEISURE: 500,
  DIET: 500,
  GROCERIES: 500,
  MAX: 9999,
};

// File Upload Limits
export const FILE_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_SIZE_DISPLAY: '5MB',
};

// Cache & Session
export const CACHE_DURATION = {
  USER_ID: 10 * 60 * 1000,       // 10 minutes
  EXCHANGE_RATE: 60 * 60 * 1000, // 1 hour
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
};

// UI Timeouts (ms)
export const UI_DELAYS = {
  TOAST_AUTO_CLOSE: 1500,
  DEBOUNCE_SEARCH: 300,
  ANIMATION_DURATION: 200,
  SIDEBAR_RESET_FEEDBACK: 2500,
};

// Pagination
export const PAGINATION = {
  DASHBOARD_TASKS: 5,
  RECENT_SPENDS: 20,
  INSIGHTS_ITEMS: 1000,
  CALENDAR_ITEMS: 1000,
};

// JARS Scoring
export const JARS_CONFIG = {
  POINTS_PER_JAR: 10,
  WEIGHTS: {
    SPEND: 1,
    TASK_DONE: 3,
    TASK_OPEN: 1,
    MEAL: 2,
    WATER: 0.5,
    LEISURE: 1.5,
    EXERCISE: 3,
    HEALTH_LOG: 2,
  },
};

// LocalStorage Keys — all in one place to avoid typos
export const STORAGE_KEYS = {
  LANGUAGE: 'jar_language',
  DISPLAY_CURRENCY: 'jar_display_currency',
  LAST_ACTIVITY: 'jar_last_activity',
  SIDEBAR_COLLAPSED: 'jar_sidebar_collapsed',
  SIDEBAR_ORDER: 'jar_sidebar_order',
  PROJECTS_SEEDED: 'jar_projects_seeded_v1',
  IOS_PROMPT_DISMISSED: 'jar_ios_install_dismissed',
  BRANDS: 'jar_brands_v1',
  PRODUCTS_CACHE: 'jar_products_cache_v1',
  NAME_CATEGORY_MAP: 'jar_name_category_map',
};

// External API base URLs
export const EXTERNAL_APIS = {
  OPEN_FOOD_FACTS: 'https://world.openfoodfacts.org/api/v2',
  EXCHANGE_RATE: 'https://api.exchangerate-api.com/v4/latest',
  BRAND_FETCH: 'https://cdn.brandfetch.io',
};