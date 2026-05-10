/**
 * Default category definitions per entity type.
 * Used as fallback when user has no CustomCategory records yet.
 */
export const DEFAULT_CATEGORIES = {
  grocery: [
    { name: 'Produce',   icon_type: 'emoji', icon_value: '🥬', color: '#abff4f' },
    { name: 'Dairy',     icon_type: 'emoji', icon_value: '🥛', color: '#0096c7' },
    { name: 'Meat',      icon_type: 'emoji', icon_value: '🥩', color: '#c1121f' },
    { name: 'Frozen',    icon_type: 'emoji', icon_value: '❄️', color: '#90e0ef' },
    { name: 'Pantry',    icon_type: 'emoji', icon_value: '📦', color: '#ff6d00' },
    { name: 'Beverages', icon_type: 'emoji', icon_value: '🥤', color: '#0096c7' },
    { name: 'Household', icon_type: 'emoji', icon_value: '🏠', color: '#9d4edd' },
    { name: 'Bakery',    icon_type: 'emoji', icon_value: '🍰', color: '#ffb3c6' },
    { name: 'Snacks',    icon_type: 'emoji', icon_value: '🍿', color: '#ffee32' },
    { name: 'Other',     icon_type: 'emoji', icon_value: '📦', color: '#7a7a7a' },
  ],
  leisure: [
    { name: 'Cinema',          icon_type: 'emoji', icon_value: '🎬', color: '#ff6d00' },
    { name: 'Concerts',        icon_type: 'emoji', icon_value: '🎵', color: '#9d4edd' },
    { name: 'Gaming',          icon_type: 'emoji', icon_value: '🎮', color: '#0096c7' },
    { name: 'Dining',          icon_type: 'emoji', icon_value: '🍽️', color: '#ff6d00' },
    { name: 'Dating',          icon_type: 'emoji', icon_value: '❤️', color: '#ffb3c6' },
    { name: 'Drinks & Bars',   icon_type: 'emoji', icon_value: '🍺', color: '#ffee32' },
    { name: 'Hobbies',         icon_type: 'emoji', icon_value: '🎨', color: '#abff4f' },
    { name: 'Travel',          icon_type: 'emoji', icon_value: '✈️', color: '#0096c7' },
    { name: 'Grooming',        icon_type: 'emoji', icon_value: '💇', color: '#ffb3c6' },
    { name: 'Books',           icon_type: 'emoji', icon_value: '📚', color: '#9d4edd' },
    { name: 'Streaming',       icon_type: 'emoji', icon_value: '📺', color: '#c1121f' },
  ],
  spend: [
    { name: 'Groceries',       icon_type: 'emoji', icon_value: '🛒', color: '#0096c7' },
    { name: 'Food Out',        icon_type: 'emoji', icon_value: '🍽️', color: '#ff6d00' },
    { name: 'Coffee',          icon_type: 'emoji', icon_value: '☕', color: '#ff6d00' },
    { name: 'Transport',       icon_type: 'emoji', icon_value: '🚌', color: '#0096c7' },
    { name: 'Taxi',            icon_type: 'emoji', icon_value: '🚕', color: '#ff6d00' },
    { name: 'Health',          icon_type: 'emoji', icon_value: '💊', color: '#ffb3c6' },
    { name: 'Lifestyle',       icon_type: 'emoji', icon_value: '✨', color: '#ffb3c6' },
    { name: 'Other',           icon_type: 'emoji', icon_value: '📦', color: '#7a7a7a' },
  ],
  task: [
    { name: 'Work',      icon_type: 'emoji', icon_value: '💼', color: '#0096c7' },
    { name: 'Study',     icon_type: 'emoji', icon_value: '📚', color: '#9d4edd' },
    { name: 'Personal',  icon_type: 'emoji', icon_value: '👤', color: '#abff4f' },
    { name: 'Health',    icon_type: 'emoji', icon_value: '💪', color: '#ffb3c6' },
    { name: 'Creative',  icon_type: 'emoji', icon_value: '🎨', color: '#ff6d00' },
    { name: 'Admin',     icon_type: 'emoji', icon_value: '📋', color: '#7a7a7a' },
  ],
  recipe: [
    { name: 'Breakfast', icon_type: 'emoji', icon_value: '🍳', color: '#ffee32' },
    { name: 'Lunch',     icon_type: 'emoji', icon_value: '🥗', color: '#abff4f' },
    { name: 'Dinner',    icon_type: 'emoji', icon_value: '🍲', color: '#ff6d00' },
    { name: 'Snack',     icon_type: 'emoji', icon_value: '🍿', color: '#0096c7' },
    { name: 'Drink',     icon_type: 'emoji', icon_value: '🥤', color: '#0096c7' },
    { name: 'Dessert',   icon_type: 'emoji', icon_value: '🍰', color: '#ffb3c6' },
  ],
};