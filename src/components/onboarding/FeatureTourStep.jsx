import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FEATURES = [
  { icon: '💸', title: 'Track Spends', desc: 'Log daily expenses, subscriptions, and payments in seconds.' },
  { icon: '✅', title: 'Tasks & Projects', desc: 'Kanban board, step sequencer, and project workspaces.' },
  { icon: '🥗', title: 'Diet & Nutrition', desc: 'Log meals, track macros, and discover recipes.' },
  { icon: '🛒', title: 'Smart Groceries', desc: 'Shopping lists, pantry tracker, and price history.' },
  { icon: '❤️', title: 'Health Metrics', desc: 'Water, mood, sleep, and custom health data.' },
  { icon: '🎉', title: 'Leisure Log', desc: 'Track activities, outings, and life experiences.' },
];

export default function FeatureTourStep({ onFinish }) {
  const [active, setActive] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
      className="max-w-lg w-full space-y-6"
    >
      <div>
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-1">Step 4 of 4</p>
        <h2 className="font-mono text-2xl font-bold text-foreground">What JAR Can Do</h2>
        <p className="text-sm text-muted-foreground mt-1">A quick look at the main modules.</p>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-2 gap-3">
        {FEATURES.map((f, i) => (
          <motion.button
            key={i}
            onClick={() => setActive(i)}
            whileTap={{ scale: 0.97 }}
            className={`text-left p-4 rounded-2xl border transition-all ${
              active === i ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-muted-foreground'
            }`}
          >
            <span className="text-2xl block mb-2">{f.icon}</span>
            <p className="font-mono font-bold text-xs text-foreground">{f.title}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{f.desc}</p>
          </motion.button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        You can always explore more in Settings → Help
      </p>

      <button
        onClick={onFinish}
        className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-mono font-bold text-lg hover:opacity-90 transition-all"
        style={{ boxShadow: '0 0 30px rgba(171,255,79,0.3)' }}
      >
        Start Tracking 🚀
      </button>
    </motion.div>
  );
}