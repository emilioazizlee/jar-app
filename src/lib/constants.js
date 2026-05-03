export const ITEM_TYPES = [
  { key: 'task', label: 'Task', icon: 'CheckSquare', color: '#39ff14' },
  { key: 'spend', label: 'Spend', icon: 'DollarSign', color: '#ffd60a' },
  { key: 'subscription', label: 'Subscription', icon: 'RefreshCw', color: '#4da6ff' },
  { key: 'payment', label: 'Payment', icon: 'CreditCard', color: '#ff9f43' },
  { key: 'meeting', label: 'Meeting', icon: 'Users', color: '#a855f7' },
  { key: 'note', label: 'Note', icon: 'FileText', color: '#7a7a7a' },
  { key: 'goal', label: 'Goal', icon: 'Target', color: '#ff2d2d' },
  { key: 'contact', label: 'Contact', icon: 'User', color: '#06d6a0' },
];

export const SPEND_CATEGORIES = [
  { key: 'cigarettes', label: 'Cigarettes', icon: '🚬' },
  { key: 'zz', label: 'Zz', icon: '💨' },
  { key: 'coffee', label: 'Coffee', icon: '☕' },
  { key: 'food_out', label: 'Food Out', icon: '🍽️' },
  { key: 'groceries', label: 'Groceries', icon: '🛒' },
  { key: 'transport', label: 'Public Transport', icon: '🚌' },
  { key: 'taxi', label: 'Taxi', icon: '🚕' },
  { key: 'phone', label: 'Phone & Comms', icon: '📱' },
  { key: 'laundry', label: 'Laundry', icon: '👕' },
  { key: 'fines', label: 'Fines', icon: '⚠️' },
  { key: 'gifts', label: 'Gifts', icon: '🎁' },
  { key: 'subscriptions', label: 'Subscriptions', icon: '🔄' },
  { key: 'fixed_recurring', label: 'Fixed Recurring', icon: '📅' },
  { key: 'football_work', label: 'Football Work', icon: '⚽' },
  { key: 'studies', label: 'Studies', icon: '📚' },
  { key: 'health', label: 'Health', icon: '💊' },
  { key: 'lifestyle', label: 'Lifestyle', icon: '✨' },
  { key: 'other', label: 'Other', icon: '📦' },
];

export const TASK_TYPES = ['Work', 'Study', 'Personal', 'Football', 'Health', 'Creative', 'Admin', 'Custom'];
export const TASK_STATUSES = ['Idea', 'Planned', 'In Progress', 'Blocked', 'Done', 'Archived'];
export const CURRENCIES = ['EUR', 'USD', 'AZN', 'RUB'];

export const SUBSCRIPTION_CATALOG = {
  'Streaming': ['Netflix', 'Spotify', 'SoundCloud', 'Apple Music', 'YouTube Premium', 'Prime Video', 'Disney+', 'HBO Max', 'Twitch'],
  'AI & Productivity': ['Claude Pro', 'ChatGPT Plus', 'Gemini Advanced', 'Perplexity Pro', 'Suno', 'ElevenLabs', 'Canva', 'Notion', 'Base44', 'LightPDF', 'Cursor'],
  'Gaming': ['PlayStation Plus', 'Xbox Game Pass', 'Minecraft Realms', 'FIFA Mobile', 'Brawl Stars Pass', 'Clash Royale Pass', 'Steam'],
  'Telecom & Utilities': ['Vodafone Spain', 'Revolut Metal', 'NordVPN', 'ExpressVPN', 'ProtonMail', 'iCloud', 'Google One', 'Dropbox'],
  'Food Delivery': ['Uber', 'Uber Eats', 'Glovo', 'Just Eat', 'Bolt', 'Cabify'],
  'Travel': ['ALSA', 'Renfe', 'Booking', 'Airbnb'],
  'Learning': ['Duolingo', 'Elevate', 'Coursera', 'Udemy', 'Brilliant'],
  'Lifestyle': ['Tinder', 'Bumble', 'Strava', 'Chess.com', 'Picsart'],
  'Local': ['appWash', 'Gym Membership'],
};