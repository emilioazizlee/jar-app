import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format, subDays, isSameDay, startOfMonth, startOfWeek } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import JarVisual from '@/components/jar/JarVisual';

const SMOKE_CATS = ['zz', 'cigarettes'];
const SMOKE_HEALTH_CATS = ['zz_health', 'cigarettes_health'];

export default function Health() {
  const { data: allItems = [] } = useQuery({
    queryKey: ['items-smoke'],
    queryFn: () => base44.entities.Item.filter({ type: 'spend' }, '-created_date', 1000),
  });

  const smokeItems = useMemo(() => allItems.filter(i => SMOKE_HEALTH_CATS.includes(i.category)), [allItems]);

  const today = new Date();
  const todaySmokeByType = useMemo(() => {
    return SMOKE_HEALTH_CATS.map(cat => ({
      cat,
      label: cat === 'zz_health' ? 'Zz' : 'Cigarettes',
      icon: cat === 'zz_health' ? '💨' : '🚬',
      today: smokeItems.filter(i => i.category === cat && isSameDay(new Date(i.date), today)).reduce((s, i) => s + (i.quantity || 1), 0),
      week: smokeItems.filter(i => {
        const d = new Date(i.date);
        return i.category === cat && d >= startOfWeek(today) && d <= today;
      }).reduce((s, i) => s + (i.quantity || 1), 0),
      month: smokeItems.filter(i => {
        const d = new Date(i.date);
        return i.category === cat && d >= startOfMonth(today);
      }).reduce((s, i) => s + (i.quantity || 1), 0),
    }));
  }, [smokeItems, today]);

  // 30-day chart data
  const chartData = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const d = subDays(today, 29 - i);
      const dateStr = format(d, 'MMM d');
      const zzCount = smokeItems.filter(s => s.category === 'zz_health' && isSameDay(new Date(s.date), d)).reduce((sum, s) => sum + (s.quantity || 1), 0);
      const cigCount = smokeItems.filter(s => s.category === 'cigarettes_health' && isSameDay(new Date(s.date), d)).reduce((sum, s) => sum + (s.quantity || 1), 0);
      return { date: dateStr, Zz: zzCount, Cigarettes: cigCount };
    });
  }, [smokeItems]);

  const weeklyAvg = (cat) => {
    const lastWeek = smokeItems.filter(i => {
      const d = new Date(i.date);
      return i.category === cat && d >= subDays(today, 7);
    });
    const totalQty = lastWeek.reduce((s, i) => s + (i.quantity || 1), 0);
    return (totalQty / 7).toFixed(1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="mono-header text-xl" style={{ color: '#c1121f' }}>HEALTH — SMOKE TRACKER</h1>
        <p className="text-sm text-muted-foreground mt-1">Dual-tracked from Spends — health impact view</p>
      </div>

      {/* Per-type stat cards */}
      <div className="grid grid-cols-2 gap-4">
        {todaySmokeByType.map(t => (
          <motion.div
            key={t.cat}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-2xl">{t.icon}</span>
                <p className="mono-header text-xs text-muted-foreground mt-1">{t.label.toUpperCase()}</p>
              </div>
              <JarVisual fillPercent={(t.today % 10) * 10} completedJars={Math.floor(t.today / 10)} size="sm" color="#c1121f" showLabel={false} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <p className="font-mono text-2xl font-bold text-destructive">{t.today}</p>
                <p className="font-mono text-[10px] text-muted-foreground">TODAY</p>
              </div>
              <div>
                <p className="font-mono text-lg font-bold">{weeklyAvg(t.cat)}</p>
                <p className="font-mono text-[10px] text-muted-foreground">DAILY AVG</p>
              </div>
              <div>
                <p className="font-mono text-lg font-bold">{t.month}</p>
                <p className="font-mono text-[10px] text-muted-foreground">THIS MONTH</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 30-day trend chart */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="mono-header text-[10px] text-muted-foreground mb-4">30-DAY TREND</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gZz" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffee32" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ffee32" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gCig" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c1121f" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#c1121f" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#666' }} tickLine={false} axisLine={false} interval={6} />
            <YAxis tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#666' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }} />
            <Area type="monotone" dataKey="Zz" stroke="#ffee32" fill="url(#gZz)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="Cigarettes" stroke="#c1121f" fill="url(#gCig)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5"><div className="w-3 h-1 rounded bg-yellow-400" /><span className="font-mono text-[10px] text-muted-foreground">Zz</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-1 rounded bg-red-500" /><span className="font-mono text-[10px] text-muted-foreground">Cigarettes</span></div>
        </div>
      </div>

      {/* Recent log */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="mono-header text-[10px] text-muted-foreground mb-3">RECENT LOG</p>
        <div className="space-y-2">
          {smokeItems.slice(0, 20).map(item => (
            <div key={item.id} className="flex items-center gap-3 py-1.5 border-b border-border/40 last:border-0">
              <span className="text-lg">{item.category === 'zz_health' ? '💨' : '🚬'}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.category === 'zz_health' ? 'Zz' : 'Cigarettes'}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{item.date ? format(new Date(item.date), 'MMM d, yyyy') : '—'}</p>
              </div>
              <span className="font-mono text-sm font-bold text-destructive">×{item.quantity || 1}</span>
            </div>
          ))}
          {smokeItems.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No smoke data yet. Log Zz or Cigarettes in Spends.</p>
          )}
        </div>
      </div>
    </div>
  );
}