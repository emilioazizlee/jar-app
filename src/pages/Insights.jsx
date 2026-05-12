import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  format, subDays, isSameDay, startOfMonth, startOfWeek,
  startOfYear, differenceInDays,
} from 'date-fns';

function startOfQuarter(date) {
  const d = new Date(date);
  const qMonth = Math.floor(d.getMonth() / 3) * 3;
  return new Date(d.getFullYear(), qMonth, 1);
}
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { nivoTheme } from '@/lib/nivoTheme';
import { ITEM_TYPES, CHART_COLORS, PALETTE } from '@/lib/constants';
import { cleanLabel, isUUID } from '@/lib/labelUtils';
import { intTickValues, intTickFormat, xTickFilter } from '@/lib/chartUtils';
import InsightsFilterBar from '@/components/insights/InsightsFilterBar';
import { useCurrentUser } from '@/hooks/useCurrentUser';


const CHART_CARD = {
  background: '#141414',
  border: '1px solid #1f1f1f',
  borderRadius: 12,
  padding: 22,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
};

const TOOLTIP_STYLE = {
  background: '#141414', border: '1px solid #1f1f1f', borderRadius: 8,
  padding: '10px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#fff',
};

function ChartEmptyState({ noDataText = 'No data yet for this period', tryText = 'Try a different range or start logging.' }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 py-8">
      <span className="text-3xl opacity-20">🫙</span>
      <p className="font-mono text-[11px] text-muted-foreground text-center">{noDataText}</p>
      <p className="font-mono text-[10px] text-muted-foreground/60 text-center">{tryText}</p>
    </div>
  );
}

function ChartCard({ title, children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={CHART_CARD}
      className={className}
    >
      <p className="font-mono text-[10px] uppercase tracking-[2px] text-[#7a7a7a] mb-2">{title}</p>
      <div className="h-px bg-[#1f1f1f] mb-4" />
      {children}
    </motion.div>
  );
}

function KpiCard({ label, value, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={CHART_CARD}
    >
      <p className="font-mono text-[10px] uppercase tracking-[2px] text-[#7a7a7a] mb-2">{label}</p>
      <div className="h-px bg-[#1f1f1f] mb-3" />
      <p className="font-mono font-bold" style={{ fontSize: 30, color }}>{value}</p>
    </motion.div>
  );
}

export default function Insights() {

  const [filters, setFilters] = useState({
    range: 'month',
    categories: [],
  });

  const { user } = useCurrentUser();

  const { data: allItems = [] } = useQuery({
    queryKey: ['items', 'insights', user?.email],
    queryFn: () => user ? base44.entities.Item.filter({ created_by: user.email }, '-created_date', 1000) : [],
    enabled: !!user,
    initialData: [],
  });

  // Compute date range from filter
  const rangeStart = useMemo(() => {
    const now = new Date();
    switch (filters.range) {
      case 'today': return now;
      case 'week': return startOfWeek(now, { weekStartsOn: 1 });
      case 'month': return startOfMonth(now);
      case 'quarter': return startOfQuarter(now);
      case 'year': return startOfYear(now);
      default: return startOfMonth(now);
    }
  }, [filters.range]);

  const rangeDays = useMemo(() => {
    switch (filters.range) {
      case 'today': return 1;
      case 'week': return 7;
      case 'month': return 30;
      case 'quarter': return 90;
      case 'year': return 365;
      default: return 30;
    }
  }, [filters.range]);

  // Filtered items
  const items = useMemo(() => {
    let result = allItems.filter(i => {
      if (!i.date) return false;
      const d = new Date(i.date);
      return d >= rangeStart;
    });
    if (filters.categories.length > 0) {
      result = result.filter(i =>
        filters.categories.includes(i.category) || filters.categories.includes(i.type)
      );
    }
    return result;
  }, [allItems, rangeStart, filters]);

  // Days in range for chart
  const daysInRange = useMemo(() => {
    const n = rangeDays;
    return Array.from({ length: n }, (_, i) => {
      const d = subDays(new Date(), n - 1 - i);
      const count = allItems.filter(it => it.date && isSameDay(new Date(it.date), d)).length;
      const spent = allItems.filter(it => it.type === 'spend' && it.date && isSameDay(new Date(it.date), d))
        .reduce((sum, s) => sum + (s.amount || 0), 0);
      return {
        day: format(d, 'd'),
        label: format(d, 'MMM d'),
        count,
        spent,
      };
    });
  }, [allItems, rangeDays]);

  // X-axis config
  const n = daysInRange.length;
  const xInterval = n <= 7 ? 1 : n <= 14 ? 2 : n <= 31 ? 5 : n <= 90 ? 7 : 15;
  const xTickVals = xTickFilter(daysInRange, xInterval);

  // Type distribution
  const typeDistribution = useMemo(() => {
    const counts = {};
    items.forEach(i => { counts[i.type] = (counts[i.type] || 0) + 1; });
    return ITEM_TYPES.map(t => ({
      name: cleanLabel(t.label || t.key),
      value: counts[t.key] || 0,
      color: t.color,
      key: t.key,
    })).filter(t => t.value > 0);
  }, [items]);

  const totalTypeCount = typeDistribution.reduce((s, t) => s + t.value, 0);

  // Top spend categories
  const topSpendCats = useMemo(() => {
    const cats = {};
    items.filter(i => i.type === 'spend').forEach(i => {
      const rawCat = i.category === 'cigarettes_health' ? 'cigarettes' : (i.category || 'other');
      if (isUUID(rawCat)) return;
      const label = cleanLabel(rawCat);
      cats[label] = (cats[label] || 0) + (i.amount || 0);
    });
    return Object.entries(cats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, value], idx) => ({ name, value, color: CHART_COLORS[idx % CHART_COLORS.length] }));
  }, [items]);

  const totalSpend = items.filter(i => i.type === 'spend').reduce((s, i) => s + (i.amount || 0), 0);
  const avgDailySpend = totalSpend / Math.max(1, differenceInDays(new Date(), rangeStart) + 1);

  // Activity y-axis
  const maxCount = Math.max(...daysInRange.map(d => d.count), 1);
  const countTicks = intTickValues(maxCount);

  // Spend trend y-axis
  const maxSpend = Math.max(...daysInRange.map(d => d.spent), 1);
  const spendYMax = Math.ceil(maxSpend / 25) * 25 || 50;
  const spendYTicks = [0, spendYMax / 2, spendYMax].filter((v, i, a) => a.indexOf(v) === i);

  const spendTrendData = useMemo(() => [{
    id: 'Spend',
    color: PALETTE.orange,
    data: daysInRange.map(d => ({ x: d.day, y: parseFloat(d.spent.toFixed(2)) })),
  }], [daysInRange]);

  const hasActivityData = daysInRange.some(d => d.count > 0);
  const hasSpendData = daysInRange.some(d => d.spent > 0);

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-5">
      <h1 className="font-mono text-[10px] uppercase tracking-[2px] text-[#7a7a7a]">{t('insights')}</h1>

      {/* Sticky filter bar */}
      <InsightsFilterBar filters={filters} onChange={setFilters} items={allItems} />

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label=TOTAL ENTRIES value={items.length} color={PALETTE.green} delay={0} />
        <KpiCard label=TOTAL SPEND value={`€${totalSpend.toFixed(0)}`} color={PALETTE.orange} delay={0.05} />
        <KpiCard label=AVG DAILY SPEND value={`€${avgDailySpend.toFixed(2)}`} color={PALETTE.yellow} delay={0.1} />
        <KpiCard label={t('jars_filled')} value={(items.length / 10).toFixed(1)} color={PALETTE.blue} delay={0.15} />
      </div>

      {/* Activity bar chart */}
      <ChartCard title=ACTIVITY delay={0.2}>
        <div className="h-48 md:h-56">
          {hasActivityData ? (
            <ResponsiveBar
              data={daysInRange}
              keys={['count']}
              indexBy="day"
              theme={nivoTheme}
              colors={PALETTE.blue}
              borderRadius={3}
              padding={0.35}
              enableLabel={false}
              enableGridY={true}
              axisBottom={{
                tickSize: 0,
                tickPadding: 8,
                tickRotation: 0,
                tickValues: xTickVals,
              }}
              axisLeft={{
                tickSize: 0,
                tickPadding: 6,
                format: intTickFormat,
                tickValues: countTicks,
              }}
              margin={{ top: 16, right: 16, bottom: 36, left: 42 }}
              tooltip={({ data, value }) => (
                <div style={TOOLTIP_STYLE}>
                  {data.label}: <strong>{value}</strong> entries
                </div>
              )}
              motionConfig="gentle"
            />
          ) : (
            <ChartEmptyState noDataText=No data yet for this period tryText=Try a different range or start logging. />
          )}
        </div>
      </ChartCard>

      {/* Type distribution + Top spend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {/* Type distribution — horizontal stacked bar */}
        <ChartCard title="TYPE DISTRIBUTION" delay={0.25}>
          {typeDistribution.length > 0 ? (
            <div className="space-y-4">
              <p className="font-mono text-2xl font-bold text-foreground">{totalTypeCount} <span className="text-[11px] text-muted-foreground">total</span></p>
              {/* Horizontal stacked bar */}
              <div className="h-5 w-full rounded-full overflow-hidden flex">
                {typeDistribution.map(t => (
                  <motion.div
                    key={t.key}
                    initial={{ width: 0 }}
                    animate={{ width: `${(t.value / totalTypeCount) * 100}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{ background: t.color, minWidth: t.value > 0 ? 2 : 0 }}
                    title={`${t.name}: ${t.value}`}
                  />
                ))}
              </div>
              {/* Legend */}
              <div className="space-y-1.5">
                {typeDistribution.map(t => (
                  <div key={t.key} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: t.color }} />
                    <span className="font-mono text-[10px] text-[#7a7a7a] flex-1">{t.name}</span>
                    <span className="font-mono text-[10px] text-foreground">{t.value}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {Math.round((t.value / totalTypeCount) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <span className="text-2xl opacity-30">📊</span>
              <p className="font-mono text-[10px] text-[#7a7a7a] text-center">Log entries to see your<br />activity distribution.</p>
            </div>
          )}
        </ChartCard>

        {/* Top spend categories */}
        <ChartCard title="TOP SPEND CATEGORIES" delay={0.3}>
          {topSpendCats.length > 0 ? (
            <div className="h-48">
              <ResponsiveBar
                data={topSpendCats.map(c => ({ category: c.name, value: parseFloat(c.value.toFixed(2)), color: c.color }))}
                keys={['value']}
                indexBy="category"
                layout="horizontal"
                theme={nivoTheme}
                colors={({ data }) => data.color}
                borderRadius={3}
                padding={0.3}
                enableLabel={true}
                label={({ value }) => `€${value.toFixed(0)}`}
                labelTextColor="#fff"
                enableGridX={true}
                enableGridY={false}
                axisLeft={{ tickSize: 0, tickPadding: 6 }}
                axisBottom={{ tickSize: 0, tickPadding: 6, tickRotation: 0, tickValues: 6, format: v => `€${v >= 1000 ? (v/1000).toFixed(1)+'k' : v.toFixed(0)}` }}
                margin={{ top: 22, right: 70, bottom: 36, left: 110 }}
                labelPosition="end"
                labelOffset={8}
                tooltip={({ data, value }) => (
                  <div style={TOOLTIP_STYLE}>
                    <span style={{ color: data.color }}>■</span> {data.category}: <strong>€{value.toFixed(2)}</strong>
                  </div>
                )}
                motionConfig="gentle"
              />
            </div>
          ) : (
            <ChartEmptyState noDataText=No data yet for this period tryText=Try a different range or start logging. />
          )}
        </ChartCard>
      </div>

      {/* Daily spend trend */}
      <ChartCard title="DAILY SPEND TREND" delay={0.35}>
        <div className="h-48 md:h-56">
          {hasSpendData ? (
            <ResponsiveLine
              data={spendTrendData}
              theme={nivoTheme}
              colors={[PALETTE.orange]}
              curve="monotoneX"
              enableArea={true}
              areaOpacity={0.12}
              lineWidth={2}
              pointSize={4}
              pointColor={{ from: 'color' }}
              pointBorderWidth={0}
              enableSlices="x"
              useMesh={false}
              enableGridX={false}
              yScale={{ type: 'linear', min: 0, max: spendYMax, nice: false }}
              axisBottom={{
                tickSize: 0,
                tickPadding: 8,
                tickRotation: 0,
                tickValues: xTickVals,
              }}
              axisLeft={{
                tickSize: 0,
                tickPadding: 8,
                format: v => `€${v}`,
                tickValues: spendYTicks,
              }}
              margin={{ top: 22, right: 22, bottom: 30, left: 54 }}
              motionConfig="gentle"
              sliceTooltip={({ slice }) => (
                <div style={TOOLTIP_STYLE}>
                  {slice.points.map(p => (
                    <div key={p.id}>
                      <span style={{ color: PALETTE.orange }}>■</span> {p.data.xFormatted}: <strong>€{Number(p.data.y).toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
              )}
            />
          ) : (
            <ChartEmptyState noDataText=No data yet for this period tryText=Try a different range or start logging. />
          )}
        </div>
      </ChartCard>
    </div>
  );
}