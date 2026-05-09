import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { runDecayIfNeeded } from '@/lib/autocomplete'
import { initI18n } from '@/i18n'

// Run autocomplete frequency decay check on startup
runDecayIfNeeded();

initI18n().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
  );
}).catch(() => {
  // Fall back to rendering without translations if init fails
  ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
  );
});