import React, { useState, useEffect } from 'react';
import { X, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'jar_pwa_prompt_dismissed';

export default function IOSInstallPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = window.navigator.standalone === true;
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (isIOS && !isStandalone && !dismissed) {
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 24 }}
          className="fixed bottom-0 left-0 right-0 z-[999] px-4 pb-8 md:hidden"
          style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
        >
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 flex items-start gap-3 shadow-2xl">
            <span className="text-2xl mt-0.5">🫙</span>
            <div className="flex-1">
              <p className="font-mono text-sm font-semibold text-foreground">Add JAR to your home screen</p>
              <p className="font-mono text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Tap <Share className="inline w-3 h-3 mx-0.5" /> then <strong>"Add to Home Screen"</strong> for a fullscreen experience — no browser toolbar.
              </p>
            </div>
            <button onClick={dismiss} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}