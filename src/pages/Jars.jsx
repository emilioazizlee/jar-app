import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTranslation } from 'react-i18next';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { calculateJars, filterThisMonth } from '@/lib/jarsCalc';
import { ChevronDown } from 'lucide-react';

const JarVisual = ({ label, emoji, score, entryCount, color }) => {
  const dots = Math.min(10, Math.floor(score));
  const pct = Math.min(100, (score / 1) * 100); // 1 JAR = full bar per category

  return (
    <div style={{
      background: '#111', border: '1px solid #222', borderRadius: 16,
      padding: 20, display: 'flex', flexDirection: 'column', gap: 12
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 24 }}>{emoji}</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#555' }}>
          {entryCount} entries
        </span>
      </div>

      {/* Dot fill visualization */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: i < dots ? color : '#222',
            transition: 'background 0.4s ease'
          }} />
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: '#1a1a1a', borderRadius: 2 }}>
        <div style={{
          height: '100%', borderRadius: 2,
          width: `${Math.min(100, pct)}%`, background: color,
          transition: 'width 0.6s ease'
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#aaa' }}>{label}</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color }}>
          {score.toFixed(1)} pts
        </span>
      </div>
    </div>
  );
};

export default function JarsPage() {
  const { t } = useTranslation();
  const { user } = useCurrentUser();

  const { data: items = [] } = useQuery({
    queryKey: ['items-jars', user?.email],
    queryFn: () => user ? base44.entities.Item.filter({ created_by: user.email }, '-created_date', 1000) : [],
    enabled: !!user,
    initialData: [],
  });

  const { data: dietLogs = [] } = useQuery({
    queryKey: ['dietlogs-jars', user?.email],
    queryFn: () => user ? base44.entities.DietLog.filter({ created_by: user.email }, '-created_date', 500) : [],
    enabled: !!user,
    initialData: [],
  });

  const { data: leisureEntries = [] } = useQuery({
    queryKey: ['leisure-jars', user?.email],
    queryFn: () => user ? base44.entities.LeisureEntry.filter({ created_by: user.email }, '-created_date', 500) : [],
    enabled: !!user,
    initialData: [],
  });

  const { data: waterLogs = [] } = useQuery({
    queryKey: ['water-jars', user?.email],
    queryFn: () => user ? base44.entities.WaterLog.filter({ created_by: user.email }, '-created_date', 500) : [],
    enabled: !!user,
    initialData: [],
  });

  const { data: groceryShops = [] } = useQuery({
    queryKey: ['shops-jars', user?.email],
    queryFn: () => user ? base44.entities.GroceryShop.filter({ created_by: user.email }, '-created_date', 500) : [],
    enabled: !!user,
    initialData: [],
  });

  const jarData = useMemo(() => ({
    items, dietLogs, waterLogs: waterLogs, leisureEntries, groceryShops
  }), [items, dietLogs, waterLogs, leisureEntries, groceryShops]);

  const totalJars = useMemo(() => calculateJars(jarData, 'month'), [jarData]);

  // Month-filtered slices for per-category display
  const now = new Date();
  const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const monthItems = useMemo(() => filterThisMonth(items, monthStartStr), [items, monthStartStr]);
  const monthDiet = useMemo(() => filterThisMonth(dietLogs, monthStartStr), [dietLogs, monthStartStr]);
  const monthLeisure = useMemo(() => filterThisMonth(leisureEntries, monthStartStr), [leisureEntries, monthStartStr]);
  const monthWater = useMemo(() => filterThisMonth(waterLogs, monthStartStr), [waterLogs, monthStartStr]);
  const monthShops = useMemo(() => filterThisMonth(groceryShops, monthStartStr), [groceryShops, monthStartStr]);

  const totalEntries = monthItems.length + monthDiet.length + monthLeisure.length + monthWater.length + monthShops.length;

  // Per-category scores
  const spends = monthItems.filter(i => i.type === 'spend');
  const tasksDone = monthItems.filter(i => i.type === 'task' && i.status === 'done');
  const tasksOpen = monthItems.filter(i => i.type === 'task' && i.status !== 'done');

  const categoryScores = [
    { label: t('nav.finance'),   emoji: '💰', score: spends.length * 1,                                             entryCount: spends.length,        color: '#22c55e' },
    { label: t('nav.tasks'),     emoji: '✅', score: tasksDone.length * 3 + tasksOpen.length * 1,                   entryCount: tasksDone.length + tasksOpen.length, color: '#3b82f6' },
    { label: t('nav.diet'),      emoji: '🍽️', score: monthDiet.length * 2,                                          entryCount: monthDiet.length,     color: '#f59e0b' },
    { label: t('nav.leisure'),   emoji: '🎉', score: monthLeisure.length * 1.5,                                     entryCount: monthLeisure.length,  color: '#ec4899' },
    { label: t('nav.health'),    emoji: '💧', score: monthWater.length * 0.5,                                       entryCount: monthWater.length,    color: '#ef4444' },
    { label: t('nav.groceries'), emoji: '🛒', score: monthShops.length * 0.5,                                       entryCount: monthShops.length,    color: '#8b5cf6' },
  ];

  const [scoringOpen, setScoringOpen] = useState(false);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', paddingBottom: scoringOpen ? 260 : 60 }}>
      {/* Hero */}
      <div style={{
        textAlign: 'center', padding: '32px 0',
        borderBottom: '1px solid #1a1a1a', marginBottom: 24
      }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>🫙</div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 48, fontWeight: 700, color: '#abff4f' }}>
          {totalJars.toFixed(1)}
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#555', letterSpacing: 4, marginTop: 4 }}>
          {t('jars.filledThisMonth')}
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#444', marginTop: 8 }}>
          {totalEntries} {t('jars.totalEntries')}
        </div>
      </div>

      {/* Category grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {categoryScores.map(cat => (
          <JarVisual key={cat.label} {...cat} />
        ))}
      </div>

      {/* Expandable scoring panel — fixed at bottom */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#111', borderTop: '1px solid #222', zIndex: 40,
      }}>
        <button
          onClick={() => setScoringOpen(v => !v)}
          style={{
            width: '100%', padding: '12px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#7a7a7a' }}>
            <span>💡</span>
            <span>How JAR Scoring Works</span>
          </div>
          <ChevronDown
            style={{
              width: 16, height: 16, color: '#7a7a7a',
              transform: scoringOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease',
            }}
          />
        </button>

        {scoringOpen && (
          <div style={{ padding: '0 16px 16px', maxHeight: 300, overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 12 }}>
              {[
                { emoji: '💰', label: 'Finance',   rows: ['Spend logged = 1pt', 'Budget under limit = +2pts'] },
                { emoji: '✅', label: 'Tasks',     rows: ['Task completed = 3pts', 'Task created = 1pt'] },
                { emoji: '🍽️', label: 'Diet',      rows: ['Meal logged = 2pts', 'Within calorie goal = +3pts'] },
                { emoji: '💧', label: 'Health',    rows: ['Water logged = 0.5pts', 'Health metric = 2pts'] },
                { emoji: '🎉', label: 'Leisure',   rows: ['Activity logged = 1.5pts'] },
                { emoji: '🛒', label: 'Groceries', rows: ['Shop logged = 0.5pts'] },
              ].map(cat => (
                <div key={cat.label} style={{
                  background: '#0a0a0a', borderRadius: 10,
                  border: '1px solid #1f1f1f', padding: '10px 12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 16 }}>{cat.emoji}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#aaa' }}>{cat.label}</span>
                  </div>
                  {cat.rows.map(row => {
                    const parts = row.split('=');
                    return (
                      <div key={row} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555', marginBottom: 2 }}>
                        {parts[0]}= <span style={{ color: '#abff4f' }}>{parts[1]}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#444',
              textAlign: 'center', borderTop: '1px solid #1f1f1f', paddingTop: 10,
            }}>
              <span style={{ color: '#abff4f' }}>10 points = 1.0 JAR</span>
              <span style={{ margin: '0 8px' }}>·</span>
              The fuller your JAR, the more intentional your life
            </div>
          </div>
        )}
      </div>
    </div>
  );
}