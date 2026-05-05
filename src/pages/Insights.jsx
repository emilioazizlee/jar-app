import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format, subDays, isSameDay, startOfMonth, differenceInDays } from 'date-fns';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { nivoTheme } from '@/lib/nivoTheme';
import JarVisual from '@/components/jar/JarVisual';
import { ITEM_TYPES, CHART_COLORS, PALETTE, getCategoryColor } from '@/lib/constants';

export default function Insights() {
  const { data: items = [] } = useQuery({
    queryKey: ['items'],
    queryFn: () => base44.entities.Item.list('-created_date', 1000),
    initialData: [],
  });

  // Daily entry counts for last 30 days
  const dailyData = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const day = subDays(new Date(), 29 - i);
      const count = items.filter(item => item.date && isSameDay(new Date(item.date), day)).length;
      const spent = items.filter(item => item.type === 'spend' && item.date && isSameDay(new Date(item.date), day))
        .reduce((sum, s) => sum + (s.amount || 0), 0);
      return { day: format(day, 'd'), label: format(day, 'MMM d'), count, spent };
    });
  }, [items]);

  // Type distribution — use each type's semantic color
  const typeDistribution = useMemo(() => {
    const counts = {};
    items.forEach(i => { counts[i.type] = (counts[i.type] || 0) + 1; });
    return ITEM_TYPES.map((t) => ({
      name: t.label,
      value: counts[t.key] || 0,
      color: t.color,
    })).filter(t => t.value > 0);
  }, [items]);

  // Top spend categories
  const topSpendCats = useMemo(() => {
    const cats = {};
    items.filter(i => i.type === 'spend').forEach(i => {
      const cat = i.category || 'other';
      cats[cat] = (cats[cat] || 0) + (i.amount || 0);
    });
    return Object.entries(cats).sort(([,a], [,b]) => b - a).slice(0, 8).map(([name, value]) => ({
      name,
      value,
      color: getCategoryColor(name),
    }));
  }, [items]);

  // Averages
  const daysTracked = Math.max(1, differenceInDays(new Date(), new Date(items[items.length - 1]?.date || new Date())) || 1);
  const avgDaily = items.length / daysTracked;
  const avgDailySpend = items.filter(i => i.type === 'spend').reduce((s, i) => s + (i.amount || 0), 0) / daysTracked;

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
      <h1 className="mono-header text-lg md:text-xl text-foreground">INSIGHTS</h1>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'TOTAL ENTRIES', value: items.length, color: PALETTE.green  },
          { label: 'AVG DAILY', value: avgDaily.toFixed(1), color: PALETTE.yellow },
          { label: 'AVG DAILY SPEND', value: `€${avgDailySpend.toFixed(2)}`, color: PALETTE.orange },
          { label: 'TOTAL JARS', value: (items.length / 10).toFixed(1), color: PALETTE.blue  },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <p className="mono-header text-[10px] text-muted-foreground mb-2">{m.label}</p>
            <p className="font-mono text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Daily activity chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-2xl p-5">
        <p className="mono-header text-[10px] text-muted-foreground mb-4">30-DAY ACTIVITY</p>
        <div className="h-48">
          <ResponsiveBar
            data={dailyData}
            keys={['count']}
            indexBy="day"
            theme={nivoTheme}
            colors={PALETTE.blue}
            borderRadius={4}
            padding={0.3}
            enableLabel={false}
            enableGridY={true}
            axisBottom={{ tickSize: 0, tickPadding: 6, tickRotation: 0 }}
            axisLeft={{ tickSize: 0, tickPadding: 6 }}
            margin={{ top: 10, right: 10, bottom: 30, left: 35 }}
            tooltip={({ id, value, indexValue }) => (
              <div style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 8, padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
                <span style={{ color: PALETTE.blue }}>■</span> {indexValue}: <strong>{value}</strong> entries
              </div>
            )}
            motionConfig="gentle"
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {/* Type distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-2xl p-5">
        <p className="mono-header text-[10px] text-muted-foreground mb-4">TYPE DISTRIBUTION</p>
        <div className="flex items-center gap-4">
          <div className="w-32 h-32">
            <ResponsivePie
              data={typeDistribution.map(t => ({ id: t.name, label: t.name, value: t.value, color: t.color }))}
              colors={({ data }) => data.color}
              innerRadius={0.65}
              padAngle={2}
              cornerRadius={3}
              borderWidth={0}
              enableArcLinkLabels={false}
              enableArcLabels={false}
              activeOuterRadiusOffset={6}
              theme={nivoTheme}
              motionConfig="gentle"
              tooltip={({ datum }) => (
                <div style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 8, padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
                  <span style={{ color: datum.color }}>■</span> {datum.id}: <strong>{datum.value}</strong>
                </div>
              )}
            />
          </div>
          <div className="space-y-1.5 flex-1">
            {typeDistribution.map((t) => (
              <div key={t.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                <span className="font-mono text-xs text-muted-foreground flex-1">{t.name}</span>
                <span className="font-mono text-xs text-foreground">{t.value}</span>
              </div>
            ))}
          </div>
        </div>
        </motion.div>

        {/* Top spend categories */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card border border-border rounded-2xl p-5">
          <p className="mono-header text-[10px] text-muted-foreground mb-4">TOP SPEND CATEGORIES</p>
          <div className="h-48">
            <ResponsiveBar
              data={topSpendCats.map(c => ({ category: c.name, value: parseFloat(c.value.toFixed(2)), color: c.color }))}
              keys={['value']}
              indexBy="category"
              layout="horizontal"
              theme={nivoTheme}
              colors={({ data }) => data.color}
              borderRadius={4}
              padding={0.3}
              enableLabel={false}
              enableGridX={true}
              enableGridY={false}
              axisLeft={{ tickSize: 0, tickPadding: 6 }}
              axisBottom={{ tickSize: 0, tickPadding: 4, format: v => `€${v}` }}
              margin={{ top: 5, right: 10, bottom: 30, left: 90 }}
              tooltip={({ data, value }) => (
                <div style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 8, padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
                  <span style={{ color: data.color }}>■</span> {data.category}: <strong>€{value.toFixed(2)}</strong>
                </div>
              )}
              motionConfig="gentle"
            />
          </div>
        </motion.div>
      </div>

      {/* Spend trend */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-card border border-border rounded-2xl p-5">
        <p className="mono-header text-[10px] text-muted-foreground mb-4">DAILY SPEND TREND (30 DAYS)</p>
        <div className="h-48">
          <ResponsiveLine
            data={[{
              id: 'Spend',
              color: PALETTE.orange,
              data: dailyData.map(d => ({ x: d.day, y: d.spent })),
            }]}
            theme={nivoTheme}
            colors={[PALETTE.orange]}
            curve="monotoneX"
            enableArea={true}
            areaOpacity={0.15}
            lineWidth={2}
            pointSize={0}
            enableSlices="x"
            useMesh={false}
            enableGridX={false}
            axisBottom={{ tickSize: 0, tickPadding: 6, tickValues: 6 }}
            axisLeft={{ tickSize: 0, tickPadding: 6, format: v => `€${v}` }}
            margin={{ top: 10, right: 10, bottom: 30, left: 50 }}
            motionConfig="gentle"
            sliceTooltip={({ slice }) => (
              <div style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 8, padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
                {slice.points.map(p => (
                  <div key={p.id}><span style={{ color: PALETTE.orange }}>■</span> {p.data.xFormatted}: <strong>€{Number(p.data.y).toFixed(2)}</strong></div>
                ))}
              </div>
            )}
          />
        </div>
      </motion.div>
    </div>
  );
}