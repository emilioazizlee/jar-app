import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, Database, Upload, Globe, Sparkles, Info, Tag, SlidersHorizontal } from 'lucide-react';
import BulkImport from '@/components/settings/BulkImport';
import ProjectSeed from '@/components/settings/ProjectSeed';
import SeedFromWeb from '@/components/settings/SeedFromWeb';
import InitialSetup from '@/components/settings/InitialSetup';
import SuggestionDBManager from '@/components/settings/SuggestionDBManager';
import MyBrands from '@/pages/MyBrands';
import { resetSidebarOrder } from '@/lib/sidebarOrder';

const TABS = [
  { id: 'about', label: 'ABOUT', icon: Info },
  { id: 'prefs', label: 'PREFS', icon: SlidersHorizontal },
  { id: 'setup', label: 'SETUP', icon: Sparkles },
  { id: 'import', label: 'IMPORT', icon: Upload },
  { id: 'web', label: 'WEB SEED', icon: Globe },
  { id: 'db', label: 'LEARN DB', icon: Database },
  { id: 'brands', label: 'MY BRANDS', icon: Tag },
];

export default function Settings() {
  const [tab, setTab] = useState('about');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="mono-header text-xl text-foreground">SETTINGS</h1>

      {/* Tab bar */}
      <div className="flex gap-1 flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${tab === id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            <Icon className="w-3 h-3" />{label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          {tab === 'about' && <AboutTab />}
          {tab === 'prefs' && <PrefsTab />}
          {tab === 'setup' && <InitialSetup />}
          {tab === 'import' && <BulkImport />}
          {tab === 'web' && <SeedFromWeb />}
          {tab === 'db' && <SuggestionDBManager />}
          {tab === 'brands' && <MyBrands />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function PrefsTab() {
  const [resetDone, setResetDone] = useState(false);
  const handleReset = () => {
    resetSidebarOrder();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2000);
  };
  return (
    <div className="space-y-6">
      <div>
        <p className="mono-header text-[10px] text-muted-foreground mb-3">SIDEBAR</p>
        <p className="text-sm text-muted-foreground mb-4">
          You can drag sidebar items to reorder them within each section. Reset below restores the default order.
        </p>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-muted border border-border rounded-lg font-mono text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
        >
          {resetDone ? '✓ Sidebar order reset' : 'Reset sidebar order'}
        </button>
      </div>
    </div>
  );
}

function AboutTab() {
  return (
    <div className="space-y-6">
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
        <p className="mono-header text-[10px] text-muted-foreground mb-3">SELF-LEARNING</p>
        <p className="text-sm text-muted-foreground">
          JAR learns from every entry. Text fields remember your past inputs and surface them as suggestions.
          The more you use JAR, the smarter it gets — entirely client-side, no AI, no servers.
        </p>
      </div>

      <div className="border-t border-border pt-6">
        <p className="mono-header text-[10px] text-muted-foreground mb-3">DATA</p>
        <p className="text-sm text-muted-foreground">
          All your data is stored securely in the cloud. Suggestions live in your browser's localStorage.
          Use the universal + button to log any item type.
        </p>
      </div>

      <div className="border-t border-border pt-6">
        <p className="mono-header text-[10px] text-muted-foreground mb-3">CURRENCIES</p>
        <p className="text-sm text-muted-foreground">EUR · USD · AZN · RUB</p>
      </div>
      <ProjectSeed />
    </div>
  );
}