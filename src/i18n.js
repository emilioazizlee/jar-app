import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const LANGS = ['en', 'ru', 'es', 'fr', 'tr', 'de', 'az'];

function getInitialLang() {
  const stored = localStorage.getItem('jar_language') || localStorage.getItem('i18nextLng');
  if (stored && LANGS.includes(stored)) return stored;
  const browser = navigator.language?.slice(0, 2);
  if (browser && LANGS.includes(browser)) return browser;
  return 'en';
}

const resources = {
  en: { translation: { 'nav.dashboard': 'Dashboard', 'nav.dailySpends': 'Daily Spends', 'nav.subscriptions': 'Subscriptions', 'nav.payments': 'Payments', 'nav.finance': 'Finance', 'nav.insights': 'Insights', 'nav.calendar': 'Calendar', 'nav.tasks': 'Tasks', 'nav.diet': 'Diet', 'nav.groceries': 'Groceries', 'nav.health': 'Health', 'nav.leisure': 'Leisure', 'nav.favorites': 'Favorites', 'nav.settings': 'Settings', 'nav.help': 'Help', 'nav.projects': 'Projects' } },
  ru: { translation: { 'nav.dashboard': 'Панель управления', 'nav.dailySpends': 'Ежедневные расходы', 'nav.subscriptions': 'Подписки', 'nav.payments': 'Платежи', 'nav.finance': 'Финансы', 'nav.insights': 'Insights', 'nav.calendar': 'Календарь', 'nav.tasks': 'Задачи', 'nav.diet': 'Диета', 'nav.groceries': 'Продукты', 'nav.health': 'Здоровье', 'nav.leisure': 'Досуг', 'nav.favorites': 'Избранное', 'nav.settings': 'Настройки', 'nav.help': 'Справка', 'nav.projects': 'Проекты' } },
  es: { translation: { 'nav.dashboard': 'Panel de Control', 'nav.dailySpends': 'Gastos Diarios', 'nav.subscriptions': 'Suscripciones', 'nav.payments': 'Pagos', 'nav.finance': 'Finanzas', 'nav.insights': 'Insights', 'nav.calendar': 'Calendario', 'nav.tasks': 'Tareas', 'nav.diet': 'Dieta', 'nav.groceries': 'Comestibles', 'nav.health': 'Salud', 'nav.leisure': 'Ocio', 'nav.favorites': 'Favoritos', 'nav.settings': 'Configuración', 'nav.help': 'Ayuda', 'nav.projects': 'Proyectos' } },
  fr: { translation: { 'nav.dashboard': 'Tableau de Bord', 'nav.dailySpends': 'Dépenses Quotidiennes', 'nav.subscriptions': 'Abonnements', 'nav.payments': 'Paiements', 'nav.finance': 'Finance', 'nav.insights': 'Insights', 'nav.calendar': 'Calendrier', 'nav.tasks': 'Tâches', 'nav.diet': 'Régime', 'nav.groceries': 'Épicerie', 'nav.health': 'Santé', 'nav.leisure': 'Loisirs', 'nav.favorites': 'Favoris', 'nav.settings': 'Paramètres', 'nav.help': 'Aide', 'nav.projects': 'Projets' } },
  tr: { translation: { 'nav.dashboard': 'Kontrol Paneli', 'nav.dailySpends': 'Günlük Harcamalar', 'nav.subscriptions': 'Abonelikler', 'nav.payments': 'Ödemeler', 'nav.finance': 'Finans', 'nav.insights': 'İçgörüler', 'nav.calendar': 'Takvim', 'nav.tasks': 'Görevler', 'nav.diet': 'Diyeti', 'nav.groceries': 'Bakkaliye', 'nav.health': 'Sağlık', 'nav.leisure': 'Boş Zaman', 'nav.favorites': 'Favoriler', 'nav.settings': 'Ayarlar', 'nav.help': 'Yardım', 'nav.projects': 'Projeler' } },
  de: { translation: { 'nav.dashboard': 'Armaturenbrett', 'nav.dailySpends': 'Tägliche Ausgaben', 'nav.subscriptions': 'Abos', 'nav.payments': 'Zahlungen', 'nav.finance': 'Finanzen', 'nav.insights': 'Einblicke', 'nav.calendar': 'Kalender', 'nav.tasks': 'Aufgaben', 'nav.diet': 'Diät', 'nav.groceries': 'Lebensmittel', 'nav.health': 'Gesundheit', 'nav.leisure': 'Freizeit', 'nav.favorites': 'Favoriten', 'nav.settings': 'Einstellungen', 'nav.help': 'Hilfe', 'nav.projects': 'Projekte' } },
  az: { translation: { 'nav.dashboard': 'İnformasiya Paneli', 'nav.dailySpends': 'Gündəlik Xərclər', 'nav.subscriptions': 'Aboneliklər', 'nav.payments': 'Ödənişlər', 'nav.finance': 'Maliyyə', 'nav.insights': 'İnsaytlar', 'nav.calendar': 'Təqvim', 'nav.tasks': 'Tapşırıqlar', 'nav.diet': 'Diyeta', 'nav.groceries': 'Bakaliya', 'nav.health': 'Səhiyyə', 'nav.leisure': 'Boş Vaxt', 'nav.favorites': 'Seçimlərim', 'nav.settings': 'Parametrlər', 'nav.help': 'Kömək', 'nav.projects': 'Layihələr' } }
};

export async function initI18n() {
  console.log('[i18n] Initializing with embedded resources');
  const lng = getInitialLang();
  await i18n.use(LanguageDetector).use(initReactI18next).init({ resources, lng, fallbackLng: 'en', interpolation: { escapeValue: false }, detection: { order: ['localStorage'], lookupLocalStorage: 'i18nextLng', caches: ['localStorage'] } });
  console.log(`[i18n] Ready in language: ${lng}`);
  return i18n;
}

export default i18n;