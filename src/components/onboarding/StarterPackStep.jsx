import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { STARTER_CATEGORIES } from '@/lib/starterData';

const OPTIONS = [
  {
    key: 'scratch',
    emoji: '🪄',
    title: 'Start from scratch',
    desc: 'Completely blank. Build your own categories, workflows, and habits.',
  },
  {
    key: 'templates',
    emoji: '📦',
    title: 'Import starter templates',
    desc: 'Pre-built categories for grocery, leisure, spend & tasks. No demo data.',
    recommended: true,
  },
  {
    key: 'sample',
    emoji: '🎭',
    title: 'Load sample data',
    desc: 'Demo entries to explore all features before adding your own data.',
  },
];

export default function StarterPackStep({ user, onDone, onBack, saving }) {
  const [selected, setSelected] = useState('templates');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    const imported = [];

    if (selected === 'templates') {
      setProgress('Importing categories…');
      try {
        for (const cat of STARTER_CATEGORIES) {
          await base44.entities.CustomCategory.create({
            ...cat,
            user_id: user?.email || '',
            is_default: true,
            usage_count: 0,
          });
          imported.push(cat.name);
        }
      } catch (e) {
        console.warn('Category import partial:', e.message);
      }
    } else if (selected === 'sample') {
      setProgress('Loading sample data…');
      // Sample data: a few items across types
      try {
        const sampleItems = [
          { type: 'spend', title: 'Coffee at Starbucks', category: 'coffee', amount: 4.5, currency: 'EUR', date: new Date().toISOString().slice(0, 10), is_sample: true },
          { type: 'spend', title: 'Grocery run', category: 'groceries', amount: 32.1, currency: 'EUR', date: new Date().toISOString().slice(0, 10), is_sample: true },
          { type: 'task', title: 'Set up JAR', category: 'Personal', status: 'Done', date: new Date().toISOString().slice(0, 10), is_sample: true },
          { type: 'task', title: 'Explore Diet tracker', category: 'Health', status: 'Planned', date: new Date().toISOString().slice(0, 10), is_sample: true },
          { type: 'subscription', title: 'Netflix', category: 'streaming', amount: 15.99, currency: 'EUR', is_active: true, is_sample: true },
        ];
        for (const item of sampleItems) {
          await base44.entities.Item.create(item);
          imported.push(item.title);
        }
        setProgress('Importing categories…');
        for (const cat of STARTER_CATEGORIES.slice(0, 8)) {
          await base44.entities.CustomCategory.create({
            ...cat,
            user_id: user?.email || '',
            is_default: true,
            usage_count: 0,
          });
          imported.push(cat.name);
        }
      } catch (e) {
        console.warn('Sample data partial:', e.message);
      }
    }

    setLoading(false);
    setProgress('');
    onDone(selected, imported);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
      className="max-w-lg w-full space-y-6"
    >
      <div>
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-1">Step 3 of 4</p>
        <h2 className="font-mono text-2xl font-bold text-foreground">Choose Your Start</h2>
        <p className="text-sm text-muted-foreground mt-1">You can always change this later in Settings.</p>
      </div>

      <div className="space-y-3">
        {OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => setSelected(opt.key)}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
              selected === opt.key
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground bg-card'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">{opt.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-foreground">{opt.title}</span>
                  {opt.recommended && (
                    <span className="font-mono text-[9px] bg-primary/20 text-primary border border-primary/30 rounded-full px-2 py-0.5">RECOMMENDED</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{opt.desc}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all flex items-center justify-center ${selected === opt.key ? 'border-primary bg-primary' : 'border-muted'}`}>
                {selected === opt.key && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
              </div>
            </div>
          </button>
        ))}
      </div>

      {progress && (
        <p className="font-mono text-xs text-primary text-center animate-pulse">{progress}</p>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} disabled={loading} className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-mono text-sm hover:border-foreground transition-all disabled:opacity-40">
          ← Back
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading || saving}
          className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-mono font-bold hover:opacity-90 transition-all disabled:opacity-60"
        >
          {loading ? 'Setting up…' : 'Confirm →'}
        </button>
      </div>
    </motion.div>
  );
}