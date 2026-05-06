import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { runDecayIfNeeded } from '@/lib/autocomplete'

// Run autocomplete frequency decay check on startup
runDecayIfNeeded();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)