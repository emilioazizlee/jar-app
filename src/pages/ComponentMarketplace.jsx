import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Search, Plus, Zap, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import PremiumBadge from '@/components/premium/PremiumBadge';
import { usePremium } from '@/hooks/usePremium';

const SYSTEM_COMPONENTS = [
  { component_id: 'spending_heatmap', name: 'Spending Heatmap', description: 'Calendar heatmap of your daily spend intensity', category: 'chart', is_premium: false, usage_count: 142, tags: ['spend', 'calendar', 'heatmap'], preview_emoji: '🗓️' },
  { component_id: 'macro_ring', name: 'Macro Ring', description: 'Animated donut showing today\'s protein/carbs/fat progress', category: 'widget', is_premium: false, usage_count: 98, tags: ['diet', 'nutrition'], preview_emoji: '🍩' },
  { component_id: 'budget_gauge', name: 'Budget Gauge', description: 'Speedometer-style gauge for monthly budget health', category: 'widget', is_premium: true, usage_count: 67, tags: ['budget', 'finance'], preview_emoji: '⚡' },
  { component_id: 'pantry_expiry', name: 'Pantry Expiry Alert', description: 'List items expiring within 7 days', category: 'widget', is_premium: false, usage_count: 55, tags: ['pantry', 'grocery'], preview_emoji: '🥦' },
  { component_id: 'project_timeline', name: 'Project Timeline', description: 'Gantt-style mini timeline of active projects', category: 'chart', is_premium: true, usage_count: 43, tags: ['projects', 'gantt'], preview_emoji: '📅' },
  { component_id: 'habit_streak', name: 'Habit Streak Tracker', description: 'GitHub-style streak visualization for daily habits', category: 'chart', is_premium: false, usage_count: 88, tags: ['habits', 'health'], preview_emoji: '🔥' },
  { component_id: 'subscription_burn', name: 'Subscription Burn Rate', description: 'Monthly and yearly total across all subscriptions', category: 'widget', is_premium: false, usage_count: 120, tags: ['subscriptions', 'finance'], preview_emoji: '💸' },
  { component_id: 'recipe_wheel', name: 'Recipe Category Wheel', description: 'Pie chart of meals by category this week', category: 'chart', is_premium: true, usage_count: 31, tags: ['diet', 'recipe'], preview_emoji: '🍕' },
  { component_id: 'water_progress', name: 'Water Progress Bar', description: 'Animated water fill showing daily hydration goal', category: 'widget', is_premium: false, usage_count: 76, tags: ['health', 'water'], preview_emoji: '💧' },
  { component_id: 'task_board_mini', name: 'Mini Task Board', description: 'Compact kanban with drag-drop in dashboard', category: 'layout', is_premium: true, usage_count: 59, tags: ['tasks', 'kanban'], preview_emoji: '📋' },
  { component_id: 'price_trend', name: 'Price Trend Sparklines', description: 'Inline sparklines for your top grocery items', category: 'chart', is_premium: true, usage_count: 22, tags: ['grocery', 'price'], preview_emoji: '📈' },
  { component_id: 'mood_calendar', name: 'Mood Calendar', description: 'Color-coded calendar showing daily mood entries', category: 'chart', is_premium: false, usage_count: 45, tags: ['health', 'mood'], preview_emoji: '😊' },
];

const CATEGORIES = ['all', 'chart', 'widget', 'layout'];

const CATEGORY_COLORS = { chart: '#0096c7', widget: '#ff6d00', layout: '#9d4edd' };

export default function ComponentMarketplace() {
  const { isPremium } = usePremium();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [filterPremium, setFilterPremium] = useState('all');
  const [added, setAdded] = useState(new Set());

  const { data: dbComponents = [] } = useQuery({
    queryKey: ['component-library'],
    queryFn: () => base44.entities.ComponentLibrary.list('-usage_count', 50),
    initialData: [],
  });

  const allComponents = useMemo(() => {
    const dbIds = new Set(dbComponents.map(c => c.component_id));
    return [...SYSTEM_COMPONENTS, ...dbComponents.filter(c => !SYSTEM_COMPONENTS.find(s => s.component_id === c.component_id))];
  }, [dbComponents]);

  const filtered = useMemo(() => allComponents.filter(c => {
    if (filterCat !== 'all' && c.category !== filterCat) return false;
    if (filterPremium === 'free' && c.is_premium) return false;
    if (filterPremium === 'premium' && !c.is_premium) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [allComponents, filterCat, filterPremium, search]);

  const handleAdd = (comp) => {
    if (comp.is_premium && !isPremium) {
      toast.error('This component requires Premium');
      return;
    }
    setAdded(prev => new Set([...prev, comp.component_id]));
    toast.success(`${comp.name} added to your dashboard`);
  };

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Link to="/settings" className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1">
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#7a7a7a' }}>COMPONENT MARKETPLACE</p>
          <p className="text-sm text-muted-foreground mt-0.5">Add pre-built widgets and charts to your dashboard</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#141414', border: '1px solid #2a2a2a', borderRadius: 8, padding: '6px 10px', flex: 1, minWidth: 200 }}>
          <Search size={13} color="#555" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search components…"
            style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: 4, background: '#141414', border: '1px solid #2a2a2a', borderRadius: 8, padding: 3 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              style={{ padding: '5px 10px', borderRadius: 6, background: filterCat === c ? '#abff4f' : 'transparent', color: filterCat === c ? '#0a0a0a' : '#777', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5, transition: 'all 0.15s' }}>
              {c}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, background: '#141414', border: '1px solid #2a2a2a', borderRadius: 8, padding: 3 }}>
          {['all', 'free', 'premium'].map(p => (
            <button key={p} onClick={() => setFilterPremium(p)}
              style={{ padding: '5px 10px', borderRadius: 6, background: filterPremium === p ? (p === 'premium' ? 'rgba(255,238,50,0.15)' : '#abff4f') : 'transparent', color: filterPremium === p ? (p === 'premium' ? '#ffee32' : '#0a0a0a') : '#777', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5, transition: 'all 0.15s' }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Component grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((comp, i) => (
          <motion.div key={comp.component_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Preview area */}
            <div style={{ height: 100, background: `linear-gradient(135deg, ${CATEGORY_COLORS[comp.category] || '#2a2a2a'}15 0%, rgba(0,0,0,0) 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #1f1f1f', position: 'relative' }}>
              <span style={{ fontSize: 48 }}>{comp.preview_emoji || '🧩'}</span>
              {comp.is_premium && (
                <div style={{ position: 'absolute', top: 8, right: 8 }}>
                  <PremiumBadge size="xs" />
                </div>
              )}
              <span style={{ position: 'absolute', bottom: 8, left: 10, fontFamily: 'JetBrains Mono, monospace', fontSize: 9, padding: '2px 7px', borderRadius: 5, background: `${CATEGORY_COLORS[comp.category] || '#2a2a2a'}22`, color: CATEGORY_COLORS[comp.category] || '#888', border: `1px solid ${CATEGORY_COLORS[comp.category] || '#2a2a2a'}44`, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {comp.category}
              </span>
            </div>
            {/* Info */}
            <div style={{ padding: '14px 16px', flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{comp.name}</p>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#666', lineHeight: 1.5 }}>{comp.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                {(comp.tags || []).slice(0, 3).map(tag => (
                  <span key={tag} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#555', border: '1px solid #2a2a2a', borderRadius: 4, padding: '2px 6px' }}>#{tag}</span>
                ))}
              </div>
            </div>
            {/* Footer */}
            <div style={{ padding: '10px 16px', borderTop: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555', flex: 1 }}>
                <Star size={10} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
                {comp.usage_count || 0} uses
              </span>
              <button onClick={() => handleAdd(comp)}
                disabled={added.has(comp.component_id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 7,
                  background: added.has(comp.component_id) ? 'rgba(171,255,79,0.1)' : (comp.is_premium && !isPremium ? 'rgba(255,238,50,0.1)' : '#abff4f'),
                  color: added.has(comp.component_id) ? '#abff4f' : (comp.is_premium && !isPremium ? '#ffee32' : '#0a0a0a'),
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700,
                  border: added.has(comp.component_id) ? '1px solid rgba(171,255,79,0.3)' : (comp.is_premium && !isPremium ? '1px solid rgba(255,238,50,0.3)' : 'none'),
                  cursor: added.has(comp.component_id) ? 'default' : 'pointer',
                }}>
                {added.has(comp.component_id) ? '✓ Added' : comp.is_premium && !isPremium ? <><Zap size={11} /> Premium</> : <><Plus size={11} /> Add</>}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#444', padding: '60px 0' }}>No components found</p>
      )}
    </div>
  );
}