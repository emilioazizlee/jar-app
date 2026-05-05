import React, { useState } from 'react';
import { Apple } from 'lucide-react';
import DietDashboard from '@/components/diet/DietDashboard';
import TodayPage from '@/components/diet/TodayPage';
import RecipesPage from '@/components/diet/RecipesPage';
import GoalsPage from '@/components/diet/GoalsPage';
import HistoryPage from '@/components/diet/HistoryPage';
import EatingOutPage from '@/components/diet/EatingOutPage';

const TABS = [
  { id: 'today', label: 'Today' },
  { id: 'eating_out', label: 'Eating Out' },
  { id: 'recipes', label: 'Recipes' },
  { id: 'goals', label: 'Goals' },
  { id: 'history', label: 'History' },
];

export default function Diet() {
  const [tab, setTab] = useState('today');

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 md:gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
          <Apple className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="mono-header text-lg text-foreground">DIET</h1>
          <p className="font-mono text-[10px] text-muted-foreground hidden sm:block">food log · macros · recipes · goals</p>
        </div>
      </div>

      {/* Tabs — scrollable on mobile */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none bg-muted/50 p-1 rounded-xl">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`shrink-0 flex-1 min-w-[70px] px-3 py-2 rounded-lg text-xs font-mono font-bold transition-colors ${tab === id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {tab === 'today' && <TodayPage />}
        {tab === 'eating_out' && <EatingOutPage />}
        {tab === 'recipes' && <RecipesPage />}
        {tab === 'goals' && <GoalsPage />}
        {tab === 'history' && <HistoryPage />}
      </div>
    </div>
  );
}