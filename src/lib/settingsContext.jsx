import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'jar_prefs';

const defaults = {
  density: 'Comfortable',
  radius: 'Rounded',
  currency: 'EUR',
  country: 'Auto-detect',
  timezone: 'Auto-detect',
  bedtime: '01:00',
  oneHand: 'Off',
  theme: 'Dark',
  colorTheme: 'Default',
};

function getStored() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
  catch { return { ...defaults }; }
}

export const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [prefs, setPrefs] = useState(getStored);
  const [savedPrefs, setSavedPrefs] = useState(getStored);

  const hasUnsaved = JSON.stringify(prefs) !== JSON.stringify(savedPrefs);

  const setPref = useCallback((key, val) => {
    setPrefs(p => ({ ...p, [key]: val }));
  }, []);

  const saveAll = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setSavedPrefs(prefs);
    return true;
  }, [prefs]);

  const discardChanges = useCallback(() => {
    setPrefs(savedPrefs);
  }, [savedPrefs]);

  // Apply CSS variables immediately on prefs change (live preview)
  useEffect(() => {
    const root = document.documentElement;

    // Density
    if (prefs.density === 'Compact') {
      root.style.setProperty('--card-padding', '14px');
      root.style.setProperty('--row-padding', '8px 14px');
    } else {
      root.style.setProperty('--card-padding', '22px');
      root.style.setProperty('--row-padding', '14px 18px');
    }

    // Border radius
    if (prefs.radius === 'Sharp') {
      root.style.setProperty('--radius', '0px');
    } else if (prefs.radius === 'Pill') {
      root.style.setProperty('--radius', '24px');
    } else {
      root.style.setProperty('--radius', '0.75rem');
    }
    // Color theme classes
    const allThemeClasses = ['dark', 'light', 'ocean', 'sand', 'grayscale', 'fire'];
    allThemeClasses.forEach(c => root.classList.remove(c));

    const ct = prefs.colorTheme || 'Default';
    if (ct === 'Ocean') {
      root.classList.add('ocean');
    } else if (ct === 'Sand') {
      root.classList.add('sand');
    } else {
      // Default: respect dark/light pref
      root.classList.add(prefs.theme === 'Light' ? 'light' : 'dark');
    }

    // One-handed mode
    const body = document.body;
    body.removeAttribute('data-onehand');
    if (prefs.oneHand === 'Left') body.setAttribute('data-onehand', 'left');
    else if (prefs.oneHand === 'Right') body.setAttribute('data-onehand', 'right');
  }, [prefs.density, prefs.radius, prefs.theme, prefs.colorTheme, prefs.oneHand]);

  // On mount, load from storage
  useEffect(() => {
    const stored = getStored();
    setPrefs(stored);
    setSavedPrefs(stored);
  }, []);

  return (
    <SettingsContext.Provider value={{ prefs, setPref, saveAll, discardChanges, hasUnsaved }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}