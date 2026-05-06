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
import TypePickerModal from '@/components/add/TypePickerModal';
import RepeatLastEntry from '@/components/dashboard/RepeatLastEntry';
import CatchUpModal from '@/components/dashboard/CatchUpModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { CHART_COLORS, CATEGORY_COLORS, PALETTE, getCategoryColor, getCategoryLabel } from '@/lib/constants';
import { nivoTheme } from '@/lib/nivoTheme';
import { intTickValues, intTickFormat, xTickFilter } from '@/lib/chartUtils';

const QUICK_TAPS = [
  { key: 'cigarettes', label: 'Cigarettes', icon: '🚬', color: CATEGORY_COLORS.cigarettes },
  { key: 'coffee',     label: 'Coffee',     icon: '☕', color: CATEGORY_COLORS.coffee     },
  { key: 'taxi',       label: 'Taxi',       icon: '🚕', color: CATEGORY_COLORS.taxi       },
  { key: 'food_out',   label: 'Food Out',   icon: '🍽️', color: CATEGORY_COLORS.food_out   },
  { key: 'groceries',  label: 'Groceries',  icon: '🛒', color: CATEGORY_COLORS.groceries  },
  { key: '__custom__', label: 'Custom',     icon: '➕', color: CATEGORY_COLORS.other       },
];

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [spendCategory, setSpendCategory] = useState(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [catchUpOpen, setCatchUpOpen] = useState(false);

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
  // Normalize category keys to clean display labels, merging _health suffixes
  const normalizeCategory = (raw) => {
    if (!raw) return 'Other';
    return getCategoryLabel(raw);
  };

  // For chart color lookups we also need the key (before label conversion)
  const normalizeCategoryKey = (raw) => {
    if (!raw) return 'other';
    // Merge cigarettes_health → cigarettes for color
    if (raw === 'cigarettes_health') return 'cigarettes';
    return raw.toLowerCase();
  };

  const categoryData = useMemo(() => {
    const counts = {};
    const keyMap = {};
    todayItems.forEach(i => {
      const label = normalizeCategory(i.category || i.type);
      const key = normalizeCategoryKey(i.category || i.type);
      counts[label] = (counts[label] || 0) + 1;
      keyMap[label] = key;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value, key: keyMap[name] }));
  }, [todayItems]);

  // Intentionally unused — donut uses getCategoryColor per segment

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
    if (cat === '__custom__') {
      setCustomOpen(true);
    } else {
      setSpendCategory(cat);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-3 md:space-y-4">
      {/* Top row - Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <StatCard title="THIS MONTH" value={totalJarsMonth} subtitle={`${monthItems.length} entries`} accent="primary" delay={0}>
          <div className="w-24 h-12">
                <ResponsiveBar
                  data={chartData.slice(-14).map(d => ({ day: d.day, count: d.count }))}
                  keys={['count']}
                  indexBy="day"
                  theme={nivoTheme}
                  colors={PALETTE.green}
                  borderRadius={2}
                  padding={0.3}
                  enableLabel={false}
                  enableGridY={false}
                  axisBottom={null}
                  axisLeft={null}
                  isInteractive={false}
                  animate={false}
                  valueFormat={intTickFormat}
                />
          </div>
        </StatCard>

        <StatCard title="TODAY" value={totalJarsToday} subtitle={`${todayItems.length} entries`} accent="secondary" delay={0.1}>
          <JarVisual
            fillPercent={(todayItems.length % 10) * 10}
            completedJars={Math.floor(todayItems.length / 10)}
            size="sm"
            color={PALETTE.yellow}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {/* Category donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <p className="mono-header text-[10px] text-muted-foreground mb-3">TODAY'S DISTRIBUTION</p>
          {categoryData.length > 0 ? (
            <div className="flex flex-row items-center gap-4">
              <div className="w-28 h-28 shrink-0">
                <ResponsivePie
                  data={categoryData.map((c, i) => ({
                    id: c.name,
                    label: c.name,
                    value: c.value,
                    color: getCategoryColor(c.key, i),
                  }))}
                  colors={({ data }) => data.color}
                  innerRadius={0.65}
                  padAngle={2}
                  cornerRadius={3}
                  borderWidth={0}
                  enableArcLinkLabels={false}
                  enableArcLabels={false}
                  activeOuterRadiusOffset={8}
                  theme={nivoTheme}
                  motionConfig="gentle"
                  isInteractive={true}
                  layers={['arcs', 'arcLabels', 'arcLinkLabels', 'legends', ({ centerX, centerY }) => {
                    const dominant = categoryData.sort((a, b) => b.value - a.value)[0];
                    const centerColor = dominant ? getCategoryColor(dominant.key, 0) : '#ffffff';
                    return (
                      <text
                        x={centerX}
                        y={centerY}
                        textAnchor="middle"
                        dominantBaseline="central"
                        style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, fill: centerColor }}
                      >
                        {todayItems.length}
                      </text>
                    );
                  }]}
                  tooltip={({ datum }) => (
                    <div style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 8, padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
                      <span style={{ color: datum.color }}>■</span> {datum.id}: <strong>{datum.value}</strong>
                    </div>
                  )}
                />
              </div>
              <div className="space-y-1 flex-1">
                {categoryData.slice(0, 5).map((cat, i) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: getCategoryColor(cat.key, i) }} />
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
            {[...categoryData].sort((a, b) => b.value - a.value).slice(0, 5).map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground w-4">{i + 1}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(cat.value / (categoryData[0]?.value || 1)) * 100}%`,
                      background: getCategoryColor(cat.key, i)
                    }}
                  />
                </div>
                <span className="font-mono text-[10px] text-foreground min-w-[60px] text-right truncate">{cat.name}</span>
              </div>
            ))}
            {categoryData.length === 0 && (
              <div className="flex flex-col items-center justify-center py-4 gap-2">
                <span className="text-2xl opacity-30">📊</span>
                <p className="font-mono text-[10px] text-muted-foreground text-center">Start logging to see your<br />top categories</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick-tap row */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="mono-header text-[10px] text-muted-foreground">QUICK TAP</p>
          <button
            onClick={() => setCatchUpOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 border border-border hover:border-secondary/40 transition-all font-mono text-[10px] text-muted-foreground hover:text-secondary"
          >
            <Zap className="w-3 h-3" />
            Catch-up
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
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
        {/* Repeat last entry */}
        <RepeatLastEntry items={allItems} />
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

      {/* Custom + picker */}
      <TypePickerModal open={customOpen} onClose={() => setCustomOpen(false)} />

      {/* Catch-up modal */}
      <AnimatePresence>
        {catchUpOpen && <CatchUpModal onClose={() => setCatchUpOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}