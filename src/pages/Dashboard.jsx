import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format, isSameDay, startOfMonth, subDays } from 'date-fns';
import StatCard from '@/components/dashboard/StatCard';
import QuickTapTile from '@/components/dashboard/QuickTapTile';
import DayStrip from '@/components/dashboard/DayStrip';
import RecentEntries from '@/components/dashboard/RecentEntries';
import JarVisual from '@/components/jar/JarVisual';
import SpendForm from '@/components/forms/SpendForm';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';

const QUICK_TAPS = [
{ key: 'cigarettes', label: 'Cigarettes', icon: '🚬', color: '#ff9f43' },
{ key: 'zz', label: 'Zz', icon: '💨', color: '#a855f7' },
{ key: 'coffee', label: 'Coffee', icon: '☕', color: '#ffd60a' },
{ key: 'taxi', label: 'Taxi', icon: '🚕', color: '#4da6ff' },
{ key: 'food_out', label: 'Food Out', icon: '🍽️', color: '#ff2d2d' },
{ key: 'groceries', label: 'Groceries', icon: '🛒', color: '#abff4f' },
];

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [spendCategory, setSpendCategory] = useState(null);

  const { data: allItems = [] } = useQuery({
    queryKey: ['items'],
    queryFn: () => base44.entities.Item.list('-created_date', 500),
    initialData: [],
  });

  const todayItems = useMemo(() => allItems.filter(i => i.date && isSameDay(new Date(i.date), new Date())), [allItems]);
  const monthItems = useMemo(() => {
    const start = startOfMonth(new Date());
    return allItems.filter(i => i.date && new Date(i.date) >= start);
  }, [allItems]);

  const selectedDayItems = useMemo(() => allItems.filter(i => i.date && isSameDay(new Date(i.date), selectedDate)), [allItems, selectedDate]);

  const totalJarsMonth = (monthItems.length / 10).toFixed(1);
  const totalJarsToday = (todayItems.length / 10).toFixed(1);

  // Category distribution for donut
  // Normalize category names: strip underscores, title-case, merge duplicates
  const normalizeCategory = (raw) => {
    if (!raw) return 'Other';
    // Strip suffixes like _health, keep base name
    const base = raw.replace(/_health$/, '').replace(/_/g, ' ');
    return base.replace(/\b\w/g, c => c.toUpperCase());
  };

  const categoryData = useMemo(() => {
    const counts = {};
    todayItems.forEach(i => {
      const cat = normalizeCategory(i.category || i.type);
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [todayItems]);

  const DONUT_COLORS = ['#abff4f', '#ffd60a', '#ff2d2d', '#4da6ff', '#a855f7', '#ff9f43', '#06d6a0', '#7a7a7a'];

  // 30-day chart data
  const chartData = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const day = subDays(new Date(), 29 - i);
      const count = allItems.filter(item => item.date && isSameDay(new Date(item.date), day)).length;
      return { day: format(day, 'd'), count };
    });
  }, [allItems]);

  // Upcoming payments/subscriptions
  const upcoming = useMemo(() => {
    return allItems
      .filter(i => (i.type === 'payment' || i.type === 'subscription') && i.next_renewal)
      .sort((a, b) => new Date(a.next_renewal) - new Date(b.next_renewal))
      .slice(0, 3);
  }, [allItems]);

  // Monthly subscription burn
  const monthlyBurn = useMemo(() => {
    return allItems
      .filter(i => i.type === 'subscription' && i.is_active && i.amount)
      .reduce((sum, i) => sum + (i.amount || 0), 0);
  }, [allItems]);

  const getQuickTapCount = (category) => todayItems.filter(i => i.category === category).length;

  const handleQuickTap = async (cat) => {
    setSpendCategory(cat);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Top row - Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="THIS MONTH" value={totalJarsMonth} subtitle={`${monthItems.length} entries`} accent="primary" delay={0}>
          <div className="w-24 h-12">
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <Area type="monotone" dataKey="count" stroke="#abff4f" fill="#abff4f" fillOpacity={0.1} strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </StatCard>

        <StatCard title="TODAY" value={totalJarsToday} subtitle={`${todayItems.length} entries`} accent="secondary" delay={0.1}>
          <JarVisual
            fillPercent={(todayItems.length % 10) * 10}
            completedJars={Math.floor(todayItems.length / 10)}
            size="sm"
            color="#ffd60a"
          />
        </StatCard>

        <StatCard title="UPCOMING" value={upcoming.length} subtitle="payments due" accent="destructive" delay={0.2}>
          <div className="space-y-1">
            {upcoming.map(item => (
              <p key={item.id} className="font-mono text-[10px] text-muted-foreground truncate max-w-[120px]">
                {item.title}
              </p>
            ))}
          </div>
        </StatCard>
      </div>

      {/* Day strip */}
      <DayStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} items={allItems} />

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Category donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <p className="mono-header text-[10px] text-muted-foreground mb-3">TODAY'S DISTRIBUTION</p>
          {categoryData.length > 0 ? (
            <div className="flex items-center gap-4">
              <div className="w-28 h-28">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={categoryData} innerRadius={30} outerRadius={50} paddingAngle={2} dataKey="value">
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 flex-1">
                {categoryData.slice(0, 5).map((cat, i) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                    <span className="font-mono text-[10px] text-muted-foreground truncate">{cat.name}</span>
                    <span className="font-mono text-[10px] text-foreground ml-auto">{cat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No entries today</p>
          )}
        </motion.div>

        {/* Subscription burn */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <p className="mono-header text-[10px] text-muted-foreground mb-3">MONTHLY BURN</p>
          <p className="font-mono text-3xl font-bold text-secondary">€{monthlyBurn.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">active subscriptions</p>
        </motion.div>

        {/* Top categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <p className="mono-header text-[10px] text-muted-foreground mb-3">TOP CATEGORIES</p>
          <div className="space-y-2">
            {categoryData.sort((a, b) => b.value - a.value).slice(0, 5).map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground w-4">{i + 1}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(cat.value / (categoryData[0]?.value || 1)) * 100}%`,
                      background: DONUT_COLORS[i % DONUT_COLORS.length]
                    }}
                  />
                </div>
                <span className="font-mono text-[10px] text-foreground min-w-[60px] text-right truncate">{cat.name}</span>
              </div>
            ))}
            {categoryData.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">—</p>}
          </div>
        </motion.div>
      </div>

      {/* Quick-tap row */}
      <div>
        <p className="mono-header text-[10px] text-muted-foreground mb-3">QUICK TAP</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {QUICK_TAPS.map((tap, i) => (
            <QuickTapTile
              key={tap.key}
              label={tap.label}
              icon={tap.icon}
              todayCount={getQuickTapCount(tap.key)}
              color={tap.color}
              onClick={() => handleQuickTap(tap.key)}
              delay={0.05 * i}
            />
          ))}
        </div>
      </div>

      {/* Recent entries */}
      <RecentEntries items={allItems} />

      {/* Spend form for quick taps */}
      {spendCategory && (
        <SpendForm
          open={!!spendCategory}
          onClose={() => setSpendCategory(null)}
          onSaved={() => setSpendCategory(null)}
          initialCategory={spendCategory}
        />
      )}
    </div>
  );
}