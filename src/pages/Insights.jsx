import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format, subDays, isSameDay, startOfMonth, differenceInDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import JarVisual from '@/components/jar/JarVisual';
import { ITEM_TYPES } from '@/lib/constants';

const COLORS = ['#39ff14', '#ffd60a', '#ff2d2d', '#4da6ff', '#a855f7', '#ff9f43', '#06d6a0', '#7a7a7a'];

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

  // Type distribution
  const typeDistribution = useMemo(() => {
    const counts = {};
    items.forEach(i => { counts[i.type] = (counts[i.type] || 0) + 1; });
    return ITEM_TYPES.map((t, idx) => ({
      name: t.label,
      value: counts[t.key] || 0,
      color: COLORS[idx],
    })).filter(t => t.value > 0);
  }, [items]);

  // Top spend categories
  const topSpendCats = useMemo(() => {
    const cats = {};
    items.filter(i => i.type === 'spend').forEach(i => {
      const cat = i.category || 'other';
      cats[cat] = (cats[cat] || 0) + (i.amount || 0);
    });
    return Object.entries(cats).sort(([,a], [,b]) => b - a).slice(0, 8).map(([name, value]) => ({ name, value }));
  }, [items]);

  // Averages
  const daysTracked = Math.max(1, differenceInDays(new Date(), new Date(items[items.length - 1]?.date || new Date())) || 1);
  const avgDaily = items.length / daysTracked;
  const avgDailySpend = items.filter(i => i.type === 'spend').reduce((s, i) => s + (i.amount || 0), 0) / daysTracked;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="mono-header text-xl text-foreground">INSIGHTS</h1>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL ENTRIES', value: items.length, color: '#39ff14' },
          { label: 'AVG DAILY', value: avgDaily.toFixed(1), color: '#ffd60a' },
          { label: 'AVG DAILY SPEND', value: `€${avgDailySpend.toFixed(2)}`, color: '#ff9f43' },
          { label: 'TOTAL JARS', value: (items.length / 10).toFixed(1), color: '#4da6ff' },
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
          <ResponsiveContainer>
            <BarChart data={dailyData}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#7a7a7a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#7a7a7a' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip
                contentStyle={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#7a7a7a', fontFamily: 'JetBrains Mono' }}
              />
              <Bar dataKey="count" fill="#39ff14" radius={[4, 4, 0, 0]} fillOpacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Type distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-2xl p-5">
          <p className="mono-header text-[10px] text-muted-foreground mb-4">TYPE DISTRIBUTION</p>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={typeDistribution} innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value">
                    {typeDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
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
            <ResponsiveContainer>
              <BarChart data={topSpendCats} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: '#7a7a7a' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#7a7a7a' }} axisLine={false} tickLine={false} width={80} />
                <Bar dataKey="value" fill="#ffd60a" radius={[0, 4, 4, 0]} fillOpacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Spend trend */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-card border border-border rounded-2xl p-5">
        <p className="mono-header text-[10px] text-muted-foreground mb-4">DAILY SPEND TREND (30 DAYS)</p>
        <div className="h-48">
          <ResponsiveContainer>
            <LineChart data={dailyData}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#7a7a7a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#7a7a7a' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                contentStyle={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 8, fontSize: 12 }}
                formatter={(v) => `€${v.toFixed(2)}`}
              />
              <Line type="monotone" dataKey="spent" stroke="#ffd60a" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}