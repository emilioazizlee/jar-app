/**
 * Starter categories pre-populated for new users.
 * These are inserted as CustomCategory records on onboarding.
 */

export const STARTER_CATEGORIES = [
  // GROCERY
  { entity_type: 'grocery', name: 'Produce', icon_type: 'emoji', icon_value: '🥬', color: '#10b981', translations: { en: 'Produce', ru: 'Овощи и фрукты', az: 'Meyvə-tərəvəz', es: 'Frutas y verduras', fr: 'Fruits & légumes', tr: 'Meyve & Sebze', de: 'Obst & Gemüse' } },
  { entity_type: 'grocery', name: 'Dairy', icon_type: 'emoji', icon_value: '🥛', color: '#3b82f6', translations: { en: 'Dairy', ru: 'Молочное', az: 'Süd məhsulları', es: 'Lácteos', fr: 'Produits laitiers', tr: 'Süt Ürünleri', de: 'Milchprodukte' } },
  { entity_type: 'grocery', name: 'Meat & Fish', icon_type: 'emoji', icon_value: '🥩', color: '#ef4444', translations: { en: 'Meat & Fish', ru: 'Мясо и рыба', az: 'Ət & Balıq', es: 'Carne y pescado', fr: 'Viande & poisson', tr: 'Et & Balık', de: 'Fleisch & Fisch' } },
  { entity_type: 'grocery', name: 'Bakery', icon_type: 'emoji', icon_value: '🍞', color: '#f59e0b', translations: { en: 'Bakery', ru: 'Выпечка', az: 'Çörək məhsulları', es: 'Panadería', fr: 'Boulangerie', tr: 'Fırın', de: 'Bäckerei' } },
  { entity_type: 'grocery', name: 'Beverages', icon_type: 'emoji', icon_value: '☕', color: '#8b5cf6', translations: { en: 'Beverages', ru: 'Напитки', az: 'İçkilər', es: 'Bebidas', fr: 'Boissons', tr: 'İçecekler', de: 'Getränke' } },
  { entity_type: 'grocery', name: 'Snacks', icon_type: 'emoji', icon_value: '🍿', color: '#ec4899', translations: { en: 'Snacks', ru: 'Снеки', az: 'Qəlyanaltı', es: 'Snacks', fr: 'Snacks', tr: 'Atıştırmalık', de: 'Snacks' } },
  { entity_type: 'grocery', name: 'Household', icon_type: 'emoji', icon_value: '🧹', color: '#6b7280', translations: { en: 'Household', ru: 'Хозтовары', az: 'Ev əşyaları', es: 'Hogar', fr: 'Maison', tr: 'Ev Gereçleri', de: 'Haushalt' } },
  { entity_type: 'grocery', name: 'Personal Care', icon_type: 'emoji', icon_value: '🧴', color: '#14b8a6', translations: { en: 'Personal Care', ru: 'Личная гигиена', az: 'Şəxsi gigiyena', es: 'Cuidado personal', fr: 'Soin personnel', tr: 'Kişisel Bakım', de: 'Körperpflege' } },

  // LEISURE
  { entity_type: 'leisure', name: 'Cinema', icon_type: 'emoji', icon_value: '🎬', color: '#8b5cf6', translations: { en: 'Cinema', ru: 'Кино', az: 'Kino', es: 'Cine', fr: 'Cinéma', tr: 'Sinema', de: 'Kino' } },
  { entity_type: 'leisure', name: 'Concerts', icon_type: 'emoji', icon_value: '🎵', color: '#ec4899', translations: { en: 'Concerts', ru: 'Концерты', az: 'Konsertlər', es: 'Conciertos', fr: 'Concerts', tr: 'Konserler', de: 'Konzerte' } },
  { entity_type: 'leisure', name: 'Gaming', icon_type: 'emoji', icon_value: '🎮', color: '#3b82f6', translations: { en: 'Gaming', ru: 'Игры', az: 'Oyunlar', es: 'Videojuegos', fr: 'Jeux vidéo', tr: 'Oyun', de: 'Gaming' } },
  { entity_type: 'leisure', name: 'Dining', icon_type: 'emoji', icon_value: '🍽️', color: '#f59e0b', translations: { en: 'Dining', ru: 'Рестораны', az: 'Restoran', es: 'Restaurantes', fr: 'Restauration', tr: 'Yemek', de: 'Essen gehen' } },
  { entity_type: 'leisure', name: 'Dating', icon_type: 'emoji', icon_value: '❤️', color: '#ef4444', translations: { en: 'Dating', ru: 'Свидания', az: 'Görüşlər', es: 'Citas', fr: 'Rendez-vous', tr: 'Buluşmalar', de: 'Dating' } },
  { entity_type: 'leisure', name: 'Drinks & Bars', icon_type: 'emoji', icon_value: '🍺', color: '#f97316', translations: { en: 'Drinks & Bars', ru: 'Бары', az: 'Barlar', es: 'Bares', fr: 'Bars', tr: 'Barlar', de: 'Bars' } },
  { entity_type: 'leisure', name: 'Travel', icon_type: 'emoji', icon_value: '✈️', color: '#06b6d4', translations: { en: 'Travel', ru: 'Путешествия', az: 'Səyahət', es: 'Viajes', fr: 'Voyages', tr: 'Seyahat', de: 'Reisen' } },
  { entity_type: 'leisure', name: 'Sports', icon_type: 'emoji', icon_value: '⚽', color: '#10b981', translations: { en: 'Sports', ru: 'Спорт', az: 'İdman', es: 'Deportes', fr: 'Sports', tr: 'Spor', de: 'Sport' } },
  { entity_type: 'leisure', name: 'Reading', icon_type: 'emoji', icon_value: '📚', color: '#6366f1', translations: { en: 'Reading', ru: 'Чтение', az: 'Oxu', es: 'Lectura', fr: 'Lecture', tr: 'Okuma', de: 'Lesen' } },

  // SPEND
  { entity_type: 'spend', name: 'Rent', icon_type: 'emoji', icon_value: '🏠', color: '#ef4444', translations: { en: 'Rent', ru: 'Аренда', az: 'İcarə', es: 'Alquiler', fr: 'Loyer', tr: 'Kira', de: 'Miete' } },
  { entity_type: 'spend', name: 'Utilities', icon_type: 'emoji', icon_value: '💡', color: '#f59e0b', translations: { en: 'Utilities', ru: 'Коммунальные', az: 'Kommunal', es: 'Servicios', fr: 'Charges', tr: 'Faturalar', de: 'Nebenkosten' } },
  { entity_type: 'spend', name: 'Transport', icon_type: 'emoji', icon_value: '🚗', color: '#3b82f6', translations: { en: 'Transport', ru: 'Транспорт', az: 'Nəqliyyat', es: 'Transporte', fr: 'Transport', tr: 'Ulaşım', de: 'Transport' } },
  { entity_type: 'spend', name: 'Healthcare', icon_type: 'emoji', icon_value: '🏥', color: '#10b981', translations: { en: 'Healthcare', ru: 'Здоровье', az: 'Səhiyyə', es: 'Salud', fr: 'Santé', tr: 'Sağlık', de: 'Gesundheit' } },
  { entity_type: 'spend', name: 'Education', icon_type: 'emoji', icon_value: '📚', color: '#8b5cf6', translations: { en: 'Education', ru: 'Образование', az: 'Təhsil', es: 'Educación', fr: 'Éducation', tr: 'Eğitim', de: 'Bildung' } },
  { entity_type: 'spend', name: 'Shopping', icon_type: 'emoji', icon_value: '🛍️', color: '#ec4899', translations: { en: 'Shopping', ru: 'Шоппинг', az: 'Alış-veriş', es: 'Compras', fr: 'Shopping', tr: 'Alışveriş', de: 'Einkaufen' } },

  // TASK
  { entity_type: 'task', name: 'Work', icon_type: 'emoji', icon_value: '💼', color: '#3b82f6', translations: { en: 'Work', ru: 'Работа', az: 'İş', es: 'Trabajo', fr: 'Travail', tr: 'İş', de: 'Arbeit' } },
  { entity_type: 'task', name: 'Personal', icon_type: 'emoji', icon_value: '👤', color: '#10b981', translations: { en: 'Personal', ru: 'Личное', az: 'Şəxsi', es: 'Personal', fr: 'Personnel', tr: 'Kişisel', de: 'Persönlich' } },
  { entity_type: 'task', name: 'Study', icon_type: 'emoji', icon_value: '📖', color: '#8b5cf6', translations: { en: 'Study', ru: 'Учёба', az: 'Təhsil', es: 'Estudio', fr: 'Études', tr: 'Çalışma', de: 'Studium' } },
  { entity_type: 'task', name: 'Health', icon_type: 'emoji', icon_value: '💪', color: '#ef4444', translations: { en: 'Health', ru: 'Здоровье', az: 'Sağlıq', es: 'Salud', fr: 'Santé', tr: 'Sağlık', de: 'Gesundheit' } },
  { entity_type: 'task', name: 'Household', icon_type: 'emoji', icon_value: '🏡', color: '#f59e0b', translations: { en: 'Household', ru: 'Быт', az: 'Ev', es: 'Hogar', fr: 'Maison', tr: 'Ev', de: 'Haushalt' } },
];

export const ICON_DIRECTORY = {
  'Food & Drink': ['🍕', '🍔', '🍟', '🌮', '🍱', '🍜', '🍝', '🥗', '🍰', '🍪', '🧁', '🍩', '🥤', '☕', '🍺', '🍷', '🥐', '🍣', '🥩', '🧀'],
  'Activities': ['🎮', '🎬', '🎵', '🎨', '🏋️', '⚽', '🏀', '🎾', '🏊', '🚴', '🧘', '📚', '✈️', '🎭', '🎪', '🏕️', '🎯', '♟️', '🎲', '🃏'],
  'Shopping': ['🛒', '🛍️', '👕', '👗', '👠', '💄', '💍', '🎁', '📱', '💻', '🏠', '🚗', '🧴', '🧹', '🔧', '💡', '🖥️', '⌚', '📷', '🎒'],
  'Finance': ['💰', '💳', '💸', '💵', '📊', '📈', '💼', '🏦', '🪙', '💹', '📉', '🧾', '🤑', '💲', '🏧', '💶', '💷', '💴'],
  'Health': ['💊', '🏥', '🩺', '💉', '🦷', '👁️', '🧠', '❤️', '🫁', '🦴', '🧬', '🩻', '💪', '🧘', '🏃', '🥦', '💤', '🧘'],
  'Mood': ['😊', '😢', '😡', '😰', '😴', '🤔', '💪', '🎉', '👍', '👎', '😍', '🥳', '😤', '😌', '🤩', '😔', '😎', '🥺'],
};