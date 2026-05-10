import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTranslation } from 'react-i18next';
import { startOfMonth } from 'date-fns';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const JarVisual = ({ label, emoji, filled, color }) => {
  const pct = Math.min(100, (filled / 10) * 100);
  const dots = Math.round(pct / 10);

  return (
    <div style={{
      background: '#111', border: '1px solid #222', borderRadius: 16,
      padding: 20, display: 'flex', flexDirection: 'column', gap: 12
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 24 }}>{emoji}</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#555' }}>
          {filled} entries
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
          width: `${pct}%`, background: color,
          transition: 'width 0.6s ease'
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#aaa' }}>{label}</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color }}>
          {(filled / 10).toFixed(1)} JARS
        </span>
      </div>
    </div>
  );
};

export default function JarsPage() {
  const { t } = useTranslation();
  const { user } = useCurrentUser();

  const monthStart = startOfMonth(new Date()).toISOString().split('T')[0];

  const { data: items = [] } = useQuery({
    queryKey: ['items-jars', user?.email],
    queryFn: () => user
      ? base44.entities.Item.filter({ created_by: user.email }, '-created_date', 1000)
      : [],
    enabled: !!user,
    initialData: [],
  });

  const { data: dietLogs = [] } = useQuery({
    queryKey: ['dietlogs-jars', user?.email],
    queryFn: () => user
      ? base44.entities.DietLog.filter({ created_by: user.email }, '-created_date', 500)
      : [],
    enabled: !!user,
    initialData: [],
  });

  const { data: leisureEntries = [] } = useQuery({
    queryKey: ['leisure-jars', user?.email],
    queryFn: () => user
      ? base44.entities.LeisureEntry.filter({ created_by: user.email }, '-created_date', 500)
      : [],
    enabled: !!user,
    initialData: [],
  });

  const { data: waterLogs = [] } = useQuery({
    queryKey: ['water-jars', user?.email],
    queryFn: () => user
      ? base44.entities.WaterLog.filter({ created_by: user.email }, '-created_date', 500)
      : [],
    enabled: !!user,
    initialData: [],
  });

  const { data: groceryShops = [] } = useQuery({
    queryKey: ['shops-jars', user?.email],
    queryFn: () => user
      ? base44.entities.GroceryShop.filter({ created_by: user.email }, '-created_date', 500)
      : [],
    enabled: !!user,
    initialData: [],
  });

  // Filter to this month
  const thisMonth = (arr) => arr.filter(i => {
    const d = i.date || i.created_date;
    return d && d >= monthStart;
  });

  const monthItems = thisMonth(items);
  const monthDiet = thisMonth(dietLogs);
  const monthLeisure = thisMonth(leisureEntries);
  const monthWater = thisMonth(waterLogs);
  const monthShops = thisMonth(groceryShops);

  const spends = monthItems.filter(i => i.type === 'spend');
  const tasks = monthItems.filter(i => i.type === 'task');

  const totalEntries = spends.length + tasks.length + monthDiet.length + monthLeisure.length + monthWater.length + monthShops.length;
  const totalJars = totalEntries / 10;

  const categories = [
    { label: t('nav.finance'), emoji: '💰', filled: spends.length, color: '#22c55e' },
    { label: t('nav.tasks'), emoji: '✅', filled: tasks.length, color: '#3b82f6' },
    { label: t('nav.diet'), emoji: '🍽️', filled: monthDiet.length, color: '#f59e0b' },
    { label: t('nav.leisure'), emoji: '🎉', filled: monthLeisure.length, color: '#ec4899' },
    { label: t('nav.health'), emoji: '❤️', filled: monthWater.length, color: '#ef4444' },
    { label: t('nav.groceries'), emoji: '🛒', filled: monthShops.length, color: '#8b5cf6' },
  ];

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
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
          {t('nav.jars').toUpperCase()} FILLED THIS MONTH
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#444', marginTop: 8 }}>
          {totalEntries} total entries
        </div>
      </div>

      {/* Category grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {categories.map(cat => (
          <JarVisual key={cat.label} {...cat} />
        ))}
      </div>

      {/* Legend */}
      <div style={{
        marginTop: 24, padding: 16, background: '#0a0a0a',
        borderRadius: 12, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#444',
        textAlign: 'center'
      }}>
        ●●●●●●●●●● = 10 entries = 1.0 JAR
      </div>
    </div>
  );
}