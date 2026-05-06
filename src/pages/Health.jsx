import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format, subDays, isSameDay, startOfMonth, startOfWeek } from 'date-fns';
import { ResponsiveBar } from '@nivo/bar';
import { nivoTheme } from '@/lib/nivoTheme';
import JarCenterpiece from '@/components/jar/JarCenterpiece';
import ChartRangeSelector from '@/components/charts/ChartRangeSelector';
import { intTickValues, intTickFormat, buildTimeSeriesData, getRangeDays, xTickFilter } from '@/lib/chartUtils';
import SpendForm from '@/components/forms/SpendForm';
import { Plus } from 'lucide-react';

const DAILY_GOAL = 10; // default cigarette daily goal
const COLOR = '#c1121f';

function ChartEmptyState({ label = 'Cigarettes', onLog }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
      <span className="text-3xl opacity-20">🫙</span>
      <p className="font-mono text-[11px] text-muted-foreground text-center">No data yet for this period</p>
      <p className="font-mono text-[10px] text-muted-foreground/60 text-center">Try a different range or start logging.</p>
      <button
        onClick={onLog}
        className="mt-1 px-4 py-1.5 rounded-xl font-mono text-xs border transition-all"
        style={{ borderColor: `${COLOR}44`, color: COLOR, background: `${COLOR}11` }}
      >
        Log {label} now
      </button>
    </div>
  );
}

export default function Health() {
  const [range, setRange] = useState(() => localStorage.getItem('jar_health_range') || 'month');
  const [showForm, setShowForm] = useState(false);

  const { data: allItems = [] } = useQuery({
    queryKey: ['items-smoke'],
    queryFn: () => base44.entities.Item.filter({ type: 'spend' }, '-created_date', 1000),
  });

  const smokeItems = useMemo(
    () => allItems.filter(i => i.category === 'cigarettes_health' || i.category === 'cigarettes'),
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
      return d >= startOfWeek(today, { weekStartsOn: 1 }) && d <= today;
    }).reduce((s, i) => s + (i.quantity || 1), 0),
    [smokeItems]
  );

  const monthCount = useMemo(
    () => smokeItems.filter(i => new Date(i.date) >= startOfMonth(today)).reduce((s, i) => s + (i.quantity || 1), 0),
    [smokeItems]
  );

  const dailyAvg = useMemo(() => {
    const last7 = smokeItems.filter(i => new Date(i.date) >= subDays(today, 7));
    return (last7.reduce((s, i) => s + (i.quantity || 1), 0) / 7).toFixed(1);
  }, [smokeItems]);

  const fillPercent = Math.min((todayCount / DAILY_GOAL) * 100, 110);
  const overGoal = todayCount > DAILY_GOAL;
  const overGoalBy = Math.max(0, todayCount - DAILY_GOAL);

  // Chart data based on range
  const chartData = useMemo(() => {
    return buildTimeSeriesData(smokeItems, range, (item) => item.quantity || 1);
  }, [smokeItems, range]);

  const maxVal = Math.max(...chartData.map(d => d.value), 1);
  const yTicks = intTickValues(maxVal);
  const n = chartData.length;
  const interval = n <= 7 ? 1 : n <= 14 ? 2 : n <= 31 ? 5 : n <= 90 ? 7 : 15;
  const xTicks = xTickFilter(chartData, interval);
  const hasData = chartData.some(d => d.value > 0);

  const TOOLTIP_STYLE = {
    background: '#141414', border: '1px solid #1f1f1f', borderRadius: 8,
    padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#fff',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 md:space-y-6 pb-24">
      <div>
        <h1 className="mono-header text-lg md:text-xl" style={{ color: COLOR }}>HEALTH — SMOKE TRACKER</h1>
        <p className="text-sm text-muted-foreground mt-1">Dual-tracked from Spends — health impact view</p>
      </div>

      {/* JAR CENTERPIECE */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center py-4"
        style={{
          height: 'clamp(280px, 40vw, 360px)',
          alignItems: 'flex-end',
        }}
      >
        <JarCenterpiece
          fillPercent={fillPercent}
          color={COLOR}
          todayCount={todayCount}
          goalLabel={`daily goal: ${DAILY_GOAL}`}
          overGoal={overGoal}
          overGoalBy={overGoalBy}
          animate
        />
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-2 bg-card border border-border rounded-2xl p-4"
      >
        {[
          { label: 'TODAY', val: todayCount, color: overGoal ? COLOR : '#fff' },
          { label: 'DAILY AVG', val: dailyAvg, color: '#fff' },
          { label: 'THIS WEEK', val: weekCount, color: '#fff' },
          { label: 'THIS MONTH', val: monthCount, color: '#fff' },
        ].map(s => (
          <div key={s.label} className="text-center">
            <p className="font-mono font-bold text-2xl md:text-3xl" style={{ color: s.color }}>{s.val}</p>
            <p className="font-mono text-[10px] text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Range selector */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <ChartRangeSelector
          value={range}
          onChange={setRange}
          color={COLOR}
          storageKey="jar_health_range"
        />
      </motion.div>

      {/* Trend chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-2xl p-5"
        style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}
      >
        <p className="mono-header text-[10px] text-muted-foreground mb-4">TREND</p>
        <div className="h-44">
          {hasData ? (
            <ResponsiveBar
              data={chartData.map(d => ({ day: d.day, label: d.label, count: d.value }))}
              keys={['count']}
              indexBy="day"
              theme={nivoTheme}
              colors={COLOR}
              borderRadius={3}
              padding={0.35}
              enableLabel={false}
              enableGridY={true}
              enableGridX={false}
              axisBottom={{
                tickSize: 0,
                tickPadding: 8,
                tickRotation: 0,
                tickValues: xTicks,
              }}
              axisLeft={{
                tickSize: 0,
                tickPadding: 6,
                format: intTickFormat,
                tickValues: yTicks,
              }}
              margin={{ top: 10, right: 10, bottom: 30, left: 32 }}
              motionConfig="gentle"
              tooltip={({ data, value }) => (
                <div style={TOOLTIP_STYLE}>
                  <span style={{ color: COLOR }}>■</span> {data.label}: <strong>{value}</strong>
                </div>
              )}
            />
          ) : (
            <ChartEmptyState label="Cigarettes" onLog={() => setShowForm(true)} />
          )}
        </div>
      </motion.div>

      {/* Recent log */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-card border border-border rounded-2xl p-5"
      >
        <p className="mono-header text-[10px] text-muted-foreground mb-3">RECENT LOG</p>
        <div className="space-y-2">
          {smokeItems.slice(0, 20).map(item => (
            <div key={item.id} className="flex items-center gap-3 py-1.5 border-b border-border/40 last:border-0">
              <span className="text-lg">🚬</span>
              <div className="flex-1">
                <p className="text-sm font-medium">Cigarettes</p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {item.date ? format(new Date(item.date), 'MMM d, yyyy') : '—'}
                </p>
              </div>
              <span className="font-mono text-sm font-bold text-destructive">×{item.quantity || 1}</span>
            </div>
          ))}
          {smokeItems.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8">
              <span className="text-3xl opacity-20">🫙</span>
              <p className="text-sm text-muted-foreground text-center">No data yet. Log Cigarettes in Spends.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Sticky quick-log button */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-mono text-sm font-semibold shadow-lg"
          style={{ background: COLOR, color: '#fff' }}
        >
          <Plus className="w-4 h-4" /> Log Cigarette
        </motion.button>
      </div>

      {showForm && (
        <SpendForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSaved={() => setShowForm(false)}
          initialCategory="cigarettes_health"
        />
      )}
    </div>
  );
}