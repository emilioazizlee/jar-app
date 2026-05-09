import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const LANGS = ['en', 'ru', 'es', 'fr', 'tr', 'de', 'az'];
const BASE_URL = 'https://raw.githubusercontent.com/emilioazizlee/jar-app/main/public/locales';

// Determine initial language: jar_language > i18nextLng > browser > 'en'
function getInitialLang() {
  const stored = localStorage.getItem('jar_language') || localStorage.getItem('i18nextLng');
  if (stored && LANGS.includes(stored)) return stored;
  const browser = navigator.language?.slice(0, 2);
  if (browser && LANGS.includes(browser)) return browser;
  return 'en';
}

const resources = Object.fromEntries(LANGS.map(l => [l, { translation: {} }]));

export async function initI18n() {
  const results = await Promise.allSettled(
    LANGS.map(lang =>
      fetch(`${BASE_URL}/${lang}.json`)
        .then(r => r.json())
        .then(data => ({ lang, data }))
    )
  );

  results.forEach(result => {
    if (result.status === 'fulfilled') {
      resources[result.value.lang].translation = result.value.data;
    } else {
      console.warn('[i18n] Failed to load translation:', result.reason);
    }
  });

  const lng = getInitialLang();

  await i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      lng,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      detection: { order: ['localStorage'], lookupLocalStorage: 'i18nextLng', caches: ['localStorage'] },
    });

  return i18n;
}

export default i18n;