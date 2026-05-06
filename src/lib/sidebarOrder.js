const STORAGE_KEY = 'jar_sidebar_order_v1';

const DEFAULT_TRACKING = ['/', '/spends', '/subscriptions', '/payments', '/finance', '/insights'];
const DEFAULT_LIFE = ['/calendar', '/tasks', '/diet', '/groceries', '/health', '/leisure'];

export function getDefaultOrder() {
  return {
    TRACKING: [...DEFAULT_TRACKING],
    LIFE: [...DEFAULT_LIFE],
  };
}

export function loadSidebarOrder() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return getDefaultOrder();
    const parsed = JSON.parse(saved);
    // Validate — add any missing items from defaults
    const def = getDefaultOrder();
    for (const section of ['TRACKING', 'LIFE']) {
      const existing = parsed[section] || [];
      const missing = def[section].filter(p => !existing.includes(p));
      parsed[section] = [...existing.filter(p => def[section].includes(p)), ...missing];
    }
    return parsed;
  } catch {
    return getDefaultOrder();
  }
}

export function saveSidebarOrder(order) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
}

export function resetSidebarOrder() {
  localStorage.removeItem(STORAGE_KEY);
  return getDefaultOrder();
}