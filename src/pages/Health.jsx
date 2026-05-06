import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format, subDays, isSameDay, startOfMonth, startOfWeek } from 'date-fns';
import { ResponsiveLine } from '@nivo/line';
import { nivoTheme } from '@/lib/nivoTheme';
import JarVisual from '@/components/jar/JarVisual';

export default function Health() {
  const { data: allItems = [] } = useQuery({
    queryKey: ['items-smoke'],
    queryFn: () => base44.entities.Item.filter({ type: 'spend' }, '-created_date', 1000),
  });

  const smokeItems = useMemo(
    () => allItems.filter(i => i.category === 'cigarettes_health'),
    [allItems]
  );

  const today = new Date();

  const todayCount = useMemo(
    () => smokeItems.filter(i => isSameDay(new Date(i.date), today)).reduce((s, i) => s + (i.quantity || 1), 0),
    [smokeItems]
  );

  const weekCount = useMemo(
    () => smokeItems.filter(i => {
      const d = new Date(i.date);
      return d >= startOfWeek(today) && d <= today;
    }).reduce((s, i) => s + (i.quantity || 1), 0),
    [smokeItems]
  );

  const monthCount = useMemo(
    () => smokeItems.filter(i => new Date(i.date) >= startOfMonth(today)).reduce((s, i) => s + (i.quantity || 1), 0),
    [smokeItems]
  );

  const weeklyAvg = useMemo(() => {
    const lastWeek = smokeItems.filter(i => new Date(i.date) >= subDays(today, 7));
    return (lastWeek.reduce((s, i) => s + (i.quantity || 1), 0) / 7).toFixed(1);
  }, [smokeItems]);

  const chartData = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const d = subDays(today, 29 - i);
      const count = smokeItems
        .filter(s => isSameDay(new Date(s.date), d))
        .reduce((sum, s) => sum + (s.quantity || 1), 0);
      return { date: format(d, 'MMM d'), Cigarettes: count };
    });
  }, [smokeItems]);

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
      <div>
        <h1 className="mono-header text-lg md:text-xl" style={{ color: '#c1121f' }}>HEALTH — SMOKE TRACKER</h1>
        <p className="text-sm text-muted-foreground mt-1">Dual-tracked from Spends — health impact view</p>
      </div>

      {/* Stat card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-4 md:p-5"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-2xl">🚬</span>
            <p className="mono-header text-xs text-muted-foreground mt-1">CIGARETTES</p>
          </div>
          <JarVisual fillPercent={(todayCount % 10) * 10} completedJars={Math.floor(todayCount / 10)} size="sm" color="#c1121f" showLabel={false} />
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 md:gap-4">
          <div>
            <p className="font-mono text-2xl font-bold text-destructive">{todayCount}</p>
            <p className="font-mono text-[10px] text-muted-foreground">TODAY</p>
          </div>
          <div>
            <p className="font-mono text-xl font-bold">{weeklyAvg}</p>
            <p className="font-mono text-[10px] text-muted-foreground">DAILY AVG</p>
          </div>
          <div>
            <p className="font-mono text-xl font-bold">{weekCount}</p>
            <p className="font-mono text-[10px] text-muted-foreground">THIS WEEK</p>
          </div>
          <div>
            <p className="font-mono text-xl font-bold">{monthCount}</p>
            <p className="font-mono text-[10px] text-muted-foreground">THIS MONTH</p>
          </div>
        </div>
      </motion.div>

      {/* 30-day trend chart */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="mono-header text-[10px] text-muted-foreground mb-4">30-DAY TREND</p>
        <div className="h-44">
          <ResponsiveLine
            data={[
              { id: 'Cigarettes', color: '#c1121f', data: chartData.map(d => ({ x: d.date, y: d.Cigarettes })) },
            ]}
            theme={nivoTheme}
            colors={['#c1121f']}
            curve="monotoneX"
            enableArea={true}
            areaOpacity={0.12}
            lineWidth={2}
            pointSize={0}
            enableSlices="x"
            useMesh={false}
            enableGridX={false}
            axisBottom={{ tickSize: 0, tickPadding: 6, tickValues: 5 }}
            axisLeft={{ tickSize: 0, tickPadding: 6 }}
            margin={{ top: 10, right: 10, bottom: 30, left: 30 }}
            motionConfig="gentle"
            sliceTooltip={({ slice }) => (
              <div style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 8, padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
                {slice.points.map(p => (
                  <div key={p.id}><span style={{ color: p.serieColor }}>■</span> {p.serieId}: <strong>{p.data.y}</strong></div>
                ))}
              </div>
            )}
          />
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1 rounded" style={{ background: '#c1121f' }} />
            <span className="font-mono text-[10px] text-muted-foreground">Cigarettes</span>
          </div>
        </div>
      </div>

      {/* Recent log */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="mono-header text-[10px] text-muted-foreground mb-3">RECENT LOG</p>
        <div className="space-y-2">
          {smokeItems.slice(0, 20).map(item => (
            <div key={item.id} className="flex items-center gap-3 py-1.5 border-b border-border/40 last:border-0">
              <span className="text-lg">🚬</span>
              <div className="flex-1">
                <p className="text-sm font-medium">Cigarettes</p>
                <p className="font-mono text-[10px] text-muted-foreground">{item.date ? format(new Date(item.date), 'MMM d, yyyy') : '—'}</p>
              </div>
              <span className="font-mono text-sm font-bold text-destructive">×{item.quantity || 1}</span>
            </div>
          ))}
          {smokeItems.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No data yet. Log Cigarettes in Spends.</p>
          )}
        </div>
      </div>
    </div>
  );
}