import React from 'react';
import { motion } from 'framer-motion';

export default function Settings() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="mono-header text-xl text-foreground">SETTINGS</h1>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 space-y-6">
        <div>
          <p className="mono-header text-[10px] text-muted-foreground mb-2">ABOUT</p>
          <div className="flex items-center gap-3">
            <span className="font-mono text-3xl font-bold text-primary">JAR</span>
            <div>
              <p className="text-sm text-foreground">Fill your life.</p>
              <p className="font-mono text-[10px] text-muted-foreground">v1.0 — Personal Life Management</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <p className="mono-header text-[10px] text-muted-foreground mb-3">JAR SYSTEM</p>
          <p className="text-sm text-muted-foreground">
            Every item you log fills a jar by 10%. At 100%, the jar completes and a new one appears.
            Jars are visual measurement units — not limits. Compare your daily activity to your baseline.
          </p>
        </div>

        <div className="border-t border-border pt-6">
          <p className="mono-header text-[10px] text-muted-foreground mb-3">DATA</p>
          <p className="text-sm text-muted-foreground">
            All your data is stored securely in the cloud. Use the universal + button to log any item type.
          </p>
        </div>

        <div className="border-t border-border pt-6">
          <p className="mono-header text-[10px] text-muted-foreground mb-3">CURRENCIES</p>
          <p className="text-sm text-muted-foreground">EUR · USD · AZN · RUB</p>
        </div>
      </motion.div>
    </div>
  );
}