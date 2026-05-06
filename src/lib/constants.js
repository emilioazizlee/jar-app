/* ─── JAR Global Palette ──────────────────────────────────────────────────
   Single source of truth for all accent hex values used across the app.
   Reference via PALETTE.green, PALETTE.yellow, etc.
   ──────────────────────────────────────────────────────────────────────── */
export const PALETTE = {
  green:  '#abff4f',
  yellow: '#ffee32',
  red:    '#c1121f',
  blue:   '#0096c7',
  orange: '#ff6d00',
  violet: '#9d4edd',
  pink:   '#ffb3c6',
  muted:  '#7a7a7a',
};

export const PALETTE_DIM = {
  green:  'rgba(171,255, 79,0.10)',
  yellow: 'rgba(255,238, 50,0.10)',
  red:    'rgba(193, 18, 31,0.10)',
  blue:   'rgba(  0,150,199,0.10)',
  orange: 'rgba(255,109,  0,0.10)',
  violet: 'rgba(157, 78,221,0.10)',
  pink:   'rgba(255,179,198,0.10)',
  muted:  'rgba(122,122,122,0.10)',
};

/* ─── Semantic role tokens ────────────────────────────────────────────────
   Green  → brand identity, jar fills, CTAs, positive/on-track
   Yellow → subscriptions, recurring costs, monthly burn
   Red    → alerts, errors, overdue, health-warning categories
   Data rotation (category charts) → blue, orange, violet, pink ONLY
   ──────────────────────────────────────────────────────────────────────── */
export const SEMANTIC = {
  brand:     PALETTE.green,
  recurring: PALETTE.yellow,
  alert:     PALETTE.red,
  positive:  PALETTE.green,
  warning:   PALETTE.yellow,
  data1:     PALETTE.blue,
  data2:     PALETTE.orange,
  data3:     PALETTE.violet,
  data4:     PALETTE.pink,
};

export const ITEM_TYPES = [
  { key: 'task',         label: 'Task',         icon: 'CheckSquare', color: PALETTE.green  },
  { key: 'spend',        label: 'Spend',        icon: 'DollarSign',  color: PALETTE.orange },
  { key: 'subscription', label: 'Subscription', icon: 'RefreshCw',   color: PALETTE.yellow },
  { key: 'payment',      label: 'Payment',      icon: 'CreditCard',  color: PALETTE.blue   },
  { key: 'meeting',      label: 'Meeting',      icon: 'Users',       color: PALETTE.violet },
  { key: 'note',         label: 'Note',         icon: 'FileText',    color: PALETTE.muted  },
  { key: 'goal',         label: 'Goal',         icon: 'Target',      color: PALETTE.green  },
  { key: 'contact',      label: 'Contact',      icon: 'User',        color: PALETTE.pink   },
];

/* ─── Category color map ──────────────────────────────────────────────────
   Data viz rotation: blue → orange → violet → pink
   Green/yellow never appear in category donut charts or dots.
   Red reserved for health-alert tier only (cigarettes, fines).
   ──────────────────────────────────────────────────────────────────────── */
export const CATEGORY_COLORS = {
  groceries:        PALETTE.blue,
  food_out:         PALETTE.orange,
  coffee:           PALETTE.orange,
  cigarettes:       PALETTE.red,    // health-alert
  cigarettes_health:PALETTE.red,    // health-alert (internal tracking)
  phone:            PALETTE.blue,
  laundry:          PALETTE.blue,
  transport:        PALETTE.blue,
  taxi:             PALETTE.orange,
  fines:            PALETTE.red,
  gifts:            PALETTE.pink,
  subscriptions:    PALETTE.yellow,
  fixed_recurring:  PALETTE.yellow,
  football_work:    PALETTE.violet,
  studies:          PALETTE.violet,
  health:           PALETTE.pink,
  lifestyle:        PALETTE.pink,
  leisure:          PALETTE.pink,
  meeting:          PALETTE.violet,
  other:            PALETTE.muted,
};

/* ─── Label display map ───────────────────────────────────────────────────
   Converts internal category keys to clean display labels.
   No underscores should ever appear in the UI.
   ──────────────────────────────────────────────────────────────────────── */
export const CATEGORY_LABELS = {
  groceries:        'Groceries',
  food_out:         'Food Out',
  coffee:           'Coffee',
  cigarettes:       'Cigarettes',
  cigarettes_health:'Cigarettes',  // merged display label
  phone:            'Phone & Comms',
  laundry:          'Laundry',
  transport:        'Public Transport',
  taxi:             'Taxi',
  fines:            'Fines',
  gifts:            'Gifts',
  subscriptions:    'Subscriptions',
  fixed_recurring:  'Fixed Recurring',
  football_work:    'Football Work',
  studies:          'Studies',
  health:           'Health',
  lifestyle:        'Lifestyle',
  leisure:          'Leisure',
  meeting:          'Meeting',
  other:            'Other',
};

/* ─── Helper: convert any raw category key to clean display label ─────── */
export function getCategoryLabel(raw) {
  if (!raw) return 'Other';
  const key = raw.toLowerCase();
  if (CATEGORY_LABELS[key]) return CATEGORY_LABELS[key];
  // Fallback: strip underscores, title-case
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export const SPEND_CATEGORIES = [
  { key: 'cigarettes',     label: 'Cigarettes',      icon: '🚬', color: CATEGORY_COLORS.cigarettes     },
  { key: 'coffee',         label: 'Coffee',          icon: '☕', color: CATEGORY_COLORS.coffee         },
  { key: 'food_out',       label: 'Food Out',        icon: '🍽️', color: CATEGORY_COLORS.food_out       },
  { key: 'groceries',      label: 'Groceries',       icon: '🛒', color: CATEGORY_COLORS.groceries      },
  { key: 'transport',      label: 'Public Transport',icon: '🚌', color: CATEGORY_COLORS.transport      },
  { key: 'taxi',           label: 'Taxi',            icon: '🚕', color: CATEGORY_COLORS.taxi           },
  { key: 'phone',          label: 'Phone & Comms',   icon: '📱', color: CATEGORY_COLORS.phone          },
  { key: 'laundry',        label: 'Laundry',         icon: '👕', color: CATEGORY_COLORS.laundry        },
  { key: 'fines',          label: 'Fines',           icon: '⚠️', color: CATEGORY_COLORS.fines          },
  { key: 'gifts',          label: 'Gifts',           icon: '🎁', color: CATEGORY_COLORS.gifts          },
  { key: 'subscriptions',  label: 'Subscriptions',   icon: '🔄', color: CATEGORY_COLORS.subscriptions  },
  { key: 'fixed_recurring',label: 'Fixed Recurring', icon: '📅', color: CATEGORY_COLORS.fixed_recurring},
  { key: 'football_work',  label: 'Football Work',   icon: '⚽', color: CATEGORY_COLORS.football_work  },
  { key: 'studies',        label: 'Studies',         icon: '📚', color: CATEGORY_COLORS.studies        },
  { key: 'health',         label: 'Health',          icon: '💊', color: CATEGORY_COLORS.health         },
  { key: 'lifestyle',      label: 'Lifestyle',       icon: '✨', color: CATEGORY_COLORS.lifestyle      },
  { key: 'other',          label: 'Other',           icon: '📦', color: CATEGORY_COLORS.other          },
];

export const TASK_TYPES = ['Work', 'Study', 'Personal', 'Football', 'Health', 'Creative', 'Admin', 'Custom'];
export const TASK_STATUSES = ['Idea', 'Planned', 'In Progress', 'Blocked', 'Done', 'Archived'];
export const CURRENCIES = ['EUR', 'USD', 'AZN', 'RUB'];

export const SUBSCRIPTION_CATALOG = {
  'Streaming':          ['Netflix', 'Spotify', 'SoundCloud', 'Apple Music', 'YouTube Premium', 'Prime Video', 'Disney+', 'HBO Max', 'Twitch'],
  'AI & Productivity':  ['Claude Pro', 'ChatGPT Plus', 'Gemini Advanced', 'Perplexity Pro', 'Suno', 'ElevenLabs', 'Canva', 'Notion', 'Base44', 'LightPDF', 'Cursor'],
  'Gaming':             ['PlayStation Plus', 'Xbox Game Pass', 'Minecraft Realms', 'FIFA Mobile', 'Brawl Stars Pass', 'Clash Royale Pass', 'Steam'],
  'Telecom & Utilities':['Vodafone Spain', 'Revolut Metal', 'NordVPN', 'ExpressVPN', 'ProtonMail', 'iCloud', 'Google One', 'Dropbox'],
  'Food Delivery':      ['Uber', 'Uber Eats', 'Glovo', 'Just Eat', 'Bolt', 'Cabify'],
  'Travel':             ['ALSA', 'Renfe', 'Booking', 'Airbnb'],
  'Learning':           ['Duolingo', 'Elevate', 'Coursera', 'Udemy', 'Brilliant'],
  'Lifestyle':          ['Tinder', 'Bumble', 'Strava', 'Chess.com', 'Picsart'],
  'Local':              ['appWash', 'Gym Membership'],
};

/* ─── Data-viz chart palette ─────────────────────────────────────────────
   CHART_COLORS: cycles through blue/orange/violet/pink ONLY.
   Green and yellow are excluded from general category rotation.
   ──────────────────────────────────────────────────────────────────────── */
export const CHART_COLORS = [
  PALETTE.blue,
  PALETTE.orange,
  PALETTE.violet,
  PALETTE.pink,
  PALETTE.muted,
];

/* ─── Category-aware chart color helper ───────────────────────────────────
   Returns the semantic category color if known, otherwise falls back to
   the data-viz rotation (blue → orange → violet → pink).
   ──────────────────────────────────────────────────────────────────────── */
export function getCategoryColor(categoryKey, fallbackIndex = 0) {
  const key = (categoryKey || 'other').toLowerCase();
  // Merge cigarettes_health → cigarettes color
  if (key === 'cigarettes_health') return PALETTE.red;
  return CATEGORY_COLORS[key] || CHART_COLORS[fallbackIndex % CHART_COLORS.length];
}