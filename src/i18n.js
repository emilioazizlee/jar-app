import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const LANGS = ['en', 'ru', 'es', 'fr', 'tr', 'de', 'az'];
const BASE_URL = 'https://raw.githubusercontent.com/emilioazizlee/jar-app/main/public/locales';
const FETCH_TIMEOUT_MS = 5000;

// Determine initial language: jar_language > i18nextLng > browser > 'en'
function getInitialLang() {
  const stored = localStorage.getItem('jar_language') || localStorage.getItem('i18nextLng');
  if (stored && LANGS.includes(stored)) return stored;
  const browser = navigator.language?.slice(0, 2);
  if (browser && LANGS.includes(browser)) return browser;
  return 'en';
}

// Fetch a single locale JSON with timeout and CORS options
async function fetchLocale(lang) {
  const url = `${BASE_URL}/${lang}.json`;
  console.log(`[i18n] Fetching ${lang}.json from ${url}`);

  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
    console.warn(`[i18n] Timeout reached (${FETCH_TIMEOUT_MS}ms) for ${lang}.json`);
  }, FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      mode: 'cors',
      credentials: 'omit',
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const keyCount = Object.keys(data).length;
    console.log(`[i18n] Successfully loaded ${lang}.json (${keyCount} keys)`);
    return { lang, data };
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      console.error(`[i18n] Failed to load ${lang}.json: Request timed out after ${FETCH_TIMEOUT_MS}ms`);
    } else {
      console.error(`[i18n] Failed to load ${lang}.json: ${err.message}`);
    }
    return { lang, data: {} };
  }
}

const resources = Object.fromEntries(LANGS.map(l => [l, { translation: {} }]));

export async function initI18n() {
  console.log('[i18n] Starting translation file fetch');

  const results = await Promise.all(LANGS.map(fetchLocale));

  results.forEach(({ lang, data }) => {
    resources[lang] = { translation: data };
  });

  console.log('[i18n] Loaded resources:', resources);

  const hasAnyTranslations = results.some(r => Object.keys(r.data).length > 0);
  if (!hasAnyTranslations) {
    console.warn('[i18n] Using empty translations as fallback — all fetches returned empty or failed');
  }

  const lng = getInitialLang();
  console.log(`[i18n] Initializing with language: ${lng}`);

  await i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      lng,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      detection: {
        order: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
        caches: ['localStorage'],
      },
    });

  console.log('[i18n] Initialization complete');
  return i18n;
}

export default i18n;