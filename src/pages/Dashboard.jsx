import React, { useState, useMemo, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { useNavigate } from 'react-router-dom';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { CHART_COLORS, CATEGORY_COLORS, PALETTE, getCategoryColor, getCategoryLabel } from '@/lib/constants';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useT } from '@/lib/i18n';
import { calculateJars } from '@/lib/jarsCalc';
import WelcomeBanner from '@/components/onboarding/WelcomeBanner';
import SubscriptionInsights from '@/components/dashboard/SubscriptionInsights';
import BudgetAlerts from '@/components/dashboard/BudgetAlerts';
import { nivoTheme } from '@/lib/nivoTheme';
import { intTickValues, intTickFormat, xTickFilter } from '@/lib/chartUtils';

export default function Dashboard() {
  const t = useT();
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(null);
  const [spendCategory, setSpendCategory] = useState(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [catchUpOpen, setCatchUpOpen] = useState(false);

  // Clear cache on mount to prevent seeing other users' data
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['items'] });
  }, []);

  const { data: allItems = [] } = useQuery({
    queryKey: ['items', user?.email],
    queryFn: () => user ? base44.entities.Item.filter({ created_by: user.email }, '-created_date', 500) : [],
    enabled: !!user,
    staleTime: 0,
    initialData: [],
  });

  const { data: dashDietLogs = [] } = useQuery({
    queryKey: ['dietlogs-dashboard', user?.email],
    queryFn: () => user ? base44.entities.DietLog.filter({ created_by: user.email }, '-created_date', 200) : [],
    enabled: !!user,
    initialData: [],
  });

  const { data: dashLeisure = [] } = useQuery({
    queryKey: ['leisure-dashboard', user?.email],
    queryFn: () => user ? base44.entities.LeisureEntry.filter({ created_by: user.email }, '-created_date', 200) : [],
    enabled: !!user,
    initialData: [],
  });

  const { data: dashWaterLogs = [] } = useQuery({
    queryKey: ['water-dashboard', user?.email],
    queryFn: () => user ? base44.entities.WaterLog.filter({ created_by: user.email }, '-created_date', 200) : [],
    enabled: !!user,
    initialData: [],
  });

  const { data: dashShops = [] } = useQuery({
    queryKey: ['shops-dashboard', user?.email],
    queryFn: () => user ? base44.entities.GroceryShop.filter({ created_by: user.email }, '-created_date', 200) : [],
    enabled: !!user,
    initialData: [],
  });

  // Active tasks for dashboard widget
  const urgentTasks = useMemo(() => {
    const activeTasks = allItems.filter(i => i.type === 'task' && i.status !== 'done');
    return activeTasks
      .filter(t => t.priority >= 4 || t.due_date)
      .sort((a, b) => {
        if (a.due_date && b.due_date) return new Date(a.due_date) - new Date(b.due_date);
        if (a.due_date) return -1;
        if (b.due_date) return 1;
        return (b.priority || 0) - (a.priority || 0);
      })
      .slice(0, 5);
  }, [allItems]);
  const activeTotalTasks = useMemo(() => allItems.filter(i => i.type === 'task' && i.status !== 'done').length, [allItems]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayItems = useMemo(() => allItems.filter(i => i.date && isSameDay(new Date(i.date), new Date())), [allItems]);
  const monthItems = useMemo(() => {
    const start = startOfMonth(new Date());
    return allItems.filter(i => i.date && new Date(i.date) >= start);
  }, [allItems]);

  // Date filter: when a date is selected in DayStrip, filter dashboard display items
  const filteredItems = useMemo(() => {
    if (!selectedDate) return null; // null means no filter active
    return allItems.filter(i => i.date && isSameDay(new Date(i.date), selectedDate));
  }, [allItems, selectedDate]);

  const jarData = { items: allItems, dietLogs: dashDietLogs, leisureEntries: dashLeisure, waterLogs: dashWaterLogs, groceryShops: dashShops };
  const totalJarsMonth = calculateJars(jarData, 'month');
  const totalJarsToday = calculateJars(jarData, 'today');

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

  // Subscription-only categories to exclude from spend breakdown
  const SUBSCRIPTION_CATEGORIES = useMemo(() => new Set([
    'streaming', 'entertainment', 'ai_productivity', 'ai & productivity',
    'saas', 'gaming', 'news', 'music', 'cloud', 'software',
  ]), []);

  // Use filteredItems if a date is selected, else fall back to today's items
  const displayItems = filteredItems ?? todayItems;

  const categoryData = useMemo(() => {
    const counts = {};
    const keyMap = {};
    displayItems
      .filter(i => i.type !== 'subscription' && !SUBSCRIPTION_CATEGORIES.has((i.category || '').toLowerCase()))
      .forEach(i => {
        const label = normalizeCategory(i.category || i.type);
        const key = normalizeCategoryKey(i.category || i.type);
        counts[label] = (counts[label] || 0) + 1;
        keyMap[label] = key;
      });
    return Object.entries(counts).map(([name, value]) => ({ name, value, key: keyMap[name] }));
  }, [displayItems]);

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

  // Monthly subscription burn (normalized per billing cycle)
  const monthlyBurn = useMemo(() => {
    return allItems
      .filter(i => i.type === 'subscription' && i.is_active !== false && i.amount)
      .reduce((sum, i) => {
        if (i.billing_cycle === 'yearly') return sum + (i.amount / 12);
        if (i.billing_cycle === 'quarterly') return sum + (i.amount / 3);
        return sum + i.amount;
      }, 0);
  }, [allItems]);

  const QUICK_TAPS = [
    { key: 'cigarettes', label: t('qt_cigarettes'), icon: '🚬', color: CATEGORY_COLORS.cigarettes },
    { key: 'coffee',     label: t('qt_coffee'),     icon: '☕', color: CATEGORY_COLORS.coffee     },
    { key: 'taxi',       label: t('qt_taxi'),       icon: '🚕', color: CATEGORY_COLORS.taxi       },
    { key: 'food_out',   label: t('qt_food_out'),   icon: '🍽️', color: CATEGORY_COLORS.food_out   },
    { key: 'groceries',  label: t('qt_groceries'),  icon: '🛒', color: CATEGORY_COLORS.groceries  },
    { key: '__custom__', label: t('qt_custom'),     icon: '➕', color: CATEGORY_COLORS.other       },
  ];

  const getQuickTapCount = (category) => displayItems.filter(i => i.category === category).length;

  const handleQuickTap = async (cat) => {
    if (cat === '__custom__') {
      setCustomOpen(true);
    } else {
      setSpendCategory(cat);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-3 md:space-y-4">
      {/* Welcome banner for new users */}
      {allItems.length === 0 && user && <WelcomeBanner userName={user.full_name} />}

      {/* Top row - Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <StatCard title={t('this_month')} value={totalJarsMonth.toFixed(1)} subtitle={`${monthItems.length} ${t('entries')}`} accent="primary" delay={0} onClick={() => navigate('/spends')}>
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
                  />
          </div>
        </StatCard>

        <StatCard title={selectedDate ? format(selectedDate, 'MMM d') : t('today')} value={totalJarsToday.toFixed(1)} subtitle={`${displayItems.length} ${t('entries')}`} accent="secondary" delay={0.1} onClick={() => navigate('/spends')}>
          <JarVisual
            fillPercent={(displayItems.length % 10) * 10}
            completedJars={Math.floor(displayItems.length / 10)}
            size="sm"
            color={PALETTE.yellow}
          />
        </StatCard>

        <StatCard title={t('upcoming')} value={upcoming.length} subtitle={t('payments_due')} accent="destructive" delay={0.2} onClick={() => navigate('/payments')}>
          <div className="space-y-1">
            {upcoming.map(item => (
              <p key={item.id} className="font-mono text-[10px] text-muted-foreground truncate max-w-[120px]">
                {item.title}
              </p>
            ))}
          </div>
        </StatCard>
      </div>

      {/* Active tasks widget */}
      {urgentTasks.length > 0 && (
        <div
          className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/30 transition-all"
          onClick={() => navigate('/tasks')}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[10px] uppercase tracking-[2px] text-muted-foreground">{t('active_tasks')}</p>
            <span className="font-mono text-[10px] text-primary">{activeTotalTasks} {t('total_arrow')}</span>
          </div>
          <div className="space-y-2">
            {urgentTasks.map(task => (
              <div
                key={task.id}
                className="flex items-center gap-3 py-1.5 border-b border-border/40 last:border-0"
                onClick={(e) => { e.stopPropagation(); navigate('/tasks'); }}
              >
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  task.priority >= 4 ? 'bg-red-500' :
                  task.priority >= 3 ? 'bg-yellow-500' : 'bg-primary'
                }`} />
                <span className="font-mono text-xs text-foreground flex-1 truncate">{task.title || task.label}</span>
                {task.due_date && (
                  <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                    {new Date(task.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day strip */}
      <DayStrip
        selectedDate={selectedDate}
        onSelectDate={(day) => setSelectedDate(prev => (prev && isSameDay(prev, day)) ? null : day)}
        items={allItems}
      />
      {selectedDate && (
        <div className="flex items-center gap-2 -mt-1">
          <span className="text-xs text-muted-foreground font-mono">{t('filtered')}: {format(selectedDate, 'MMM d, yyyy')}</span>
          <button onClick={() => setSelectedDate(null)} className="text-xs text-primary hover:underline font-mono">{t('clear')}</button>
        </div>
      )}

      {/* Middle row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {/* Category donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-primary/30 transition-all"
          onClick={() => navigate('/insights')}
        >
          <p className="mono-header text-[10px] text-muted-foreground mb-3">{t('todays_dist')}</p>
          {selectedDate && (
            <p className="text-[10px] text-primary font-mono mb-2">{format(selectedDate, 'EEE, MMM d')}</p>
          )}
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
                        {displayItems.length}
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
            <p className="text-sm text-muted-foreground text-center py-6">{t('no_entries_today')}</p>
          )}
        </motion.div>

        {/* Subscription burn */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-primary/30 transition-all"
          onClick={() => navigate('/subscriptions')}
        >
          <p className="mono-header text-[10px] text-muted-foreground mb-3">{t('monthly_burn')}</p>
          <p className="font-mono text-3xl font-bold text-secondary">€{monthlyBurn.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('active_subs')}</p>
        </motion.div>

        {/* Top categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-primary/30 transition-all"
          onClick={() => navigate('/insights')}
        >
          <p className="mono-header text-[10px] text-muted-foreground mb-3">{t('top_cats')}</p>
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
                <p className="font-mono text-[10px] text-muted-foreground text-center">{t('start_logging')}<br />{t('top_categories')}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Subscription insights + Budget alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <SubscriptionInsights items={allItems} />
        <BudgetAlerts items={allItems} />
      </div>

      {/* Quick-tap row */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="mono-header text-[10px] text-muted-foreground">{t('quick_tap')}</p>
          <button
            onClick={() => setCatchUpOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 border border-border hover:border-secondary/40 transition-all font-mono text-[10px] text-muted-foreground hover:text-secondary"
          >
            <Zap className="w-3 h-3" />
            {t('catch_up')}
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