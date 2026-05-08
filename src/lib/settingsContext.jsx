import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'jar_prefs';

const defaults = {
  density: 'Comfortable',
  radius: 'Rounded',
  language: 'English',
  currency: 'EUR',
  country: 'Auto-detect',
  timezone: 'Auto-detect',
  bedtime: '01:00',
  oneHand: 'Off',
};

function getStored() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
  catch { return { ...defaults }; }
}

const SettingsContext = createContext(null);

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
  }, [prefs.density, prefs.radius]);

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