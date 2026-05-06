import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  format, subDays, isSameDay, startOfMonth, startOfWeek,
  startOfYear, differenceInDays,
} from 'date-fns';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { nivoTheme, intTickValues, intTickFormat } from '@/lib/nivoTheme';
import { ITEM_TYPES, CHART_COLORS, PALETTE, getCategoryColor, getCategoryLabel } from '@/lib/constants';
import { cleanLabel, intTick } from '@/lib/labelUtils';
import InsightsFilterBar from '@/components/insights/InsightsFilterBar';

const CHART_CARD = {
  background: '#141414',
  border: '1px solid #1f1f1f',
  borderRadius: 12,
  padding: 22,
};

const TOOLTIP_STYLE = {
  background: '#141414',
  border: '1px solid #1f1f1f',
  borderRadius: 8,
  padding: '10px 14px',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 12,
  color: '#fff',
};

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

  const { data: allItems = [] } = useQuery({
    queryKey: ['items'],
    queryFn: () => base44.entities.Item.list('-created_date', 1000),
    initialData: [],
  });

  // Compute date range from filter
  const rangeStart = useMemo(() => {
    const now = new Date();
    switch (filters.range) {
      case 'today': return now;
      case 'week': return startOfWeek(now, { weekStartsOn: 1 });
      case 'month': return startOfMonth(now);
      case 'quarter': {
        const qMonth = Math.floor(now.getMonth() / 3) * 3;
        return new Date(now.getFullYear(), qMonth, 1);
      }
      case 'year': return startOfYear(now);
      default: return startOfMonth(now);
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
    const n = filters.range === 'today' ? 1
      : filters.range === 'week' ? 7
      : filters.range === 'month' ? 30
      : filters.range === 'quarter' ? 90
      : 365;
    return Array.from({ length: n }, (_, i) => {
      const day = subDays(new Date(), n - 1 - i);
      const count = allItems.filter(it => it.date && isSameDay(new Date(it.date), day)).length;
      const spent = allItems.filter(it => it.type === 'spend' && it.date && isSameDay(new Date(it.date), day))
        .reduce((sum, s) => sum + (s.amount || 0), 0);
      return {
        day: format(day, n <= 30 ? 'd' : 'MMM d'),
        label: format(day, 'MMM d'),
        count,
        spent,
      };
    });
  }, [allItems, filters.range]);

  // Type distribution
  const typeDistribution = useMemo(() => {
    const counts = {};
    items.forEach(i => { counts[i.type] = (counts[i.type] || 0) + 1; });
    return ITEM_TYPES.map(t => ({
      name: cleanLabel(t.label),
      value: counts[t.key] || 0,
      color: t.color,
    })).filter(t => t.value > 0);
  }, [items]);

  // Top spend categories — merge cigarettes_health → cigarettes
  const topSpendCats = useMemo(() => {
    const cats = {};
    items.filter(i => i.type === 'spend').forEach(i => {
      const rawCat = i.category === 'cigarettes_health' ? 'cigarettes' : (i.category || 'other');
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

  // Spend trend
  const spendTrendData = useMemo(() => [{
    id: 'Spend',
    color: PALETTE.orange,
    data: daysInRange.map(d => ({ x: d.day, y: parseFloat(d.spent.toFixed(2)) })),
  }], [daysInRange]);

  const maxSpend = Math.max(...daysInRange.map(d => d.spent), 1);
  const spendYMax = Math.ceil(maxSpend / 25) * 25 || 50;
  const spendYTicks = [0, spendYMax / 2, spendYMax].filter((v, i, a) => a.indexOf(v) === i);

  // Activity chart — integer Y axis
  const maxCount = Math.max(...daysInRange.map(d => d.count), 1);
  const countTickValues = intTickValues(maxCount, 5);

  // X-axis tick intervals to prevent crowding
  const n = daysInRange.length;
  const xTickInterval = n <= 7 ? 1 : n <= 14 ? 2 : n <= 31 ? 5 : 15;

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-5">
      <h1 className="font-mono text-[10px] uppercase tracking-[2px] text-[#7a7a7a]">INSIGHTS</h1>

      {/* Sticky filter bar */}
      <InsightsFilterBar filters={filters} onChange={setFilters} items={allItems} />

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="TOTAL ENTRIES" value={items.length} color={PALETTE.green} delay={0} />
        <KpiCard label="TOTAL SPEND" value={`€${totalSpend.toFixed(0)}`} color={PALETTE.orange} delay={0.05} />
        <KpiCard label="AVG DAILY SPEND" value={`€${avgDailySpend.toFixed(2)}`} color={PALETTE.yellow} delay={0.1} />
        <KpiCard label="JARS FILLED" value={(items.length / 10).toFixed(1)} color={PALETTE.blue} delay={0.15} />
      </div>

      {/* Activity bar chart */}
      <ChartCard title="ACTIVITY" delay={0.2}>
        <div className="h-48 md:h-56">
          <ResponsiveBar
            data={daysInRange}
            keys={['count']}
            indexBy="day"
            theme={nivoTheme}
            colors={PALETTE.blue}
            borderRadius={4}
            padding={0.35}
            enableLabel={false}
            enableGridY={true}
            axisBottom={{
              tickSize: 0,
              tickPadding: 6,
              tickRotation: n > 14 ? -45 : 0,
              format: (val, idx) => {
                // show only every Nth label
                const i = daysInRange.findIndex(d => d.day === val);
                return i % xTickInterval === 0 ? val : '';
              },
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 6,
              format: intTickFormat,
              tickValues: countTickValues,
            }}
            margin={{ top: 22, right: 22, bottom: n > 14 ? 40 : 26, left: 34 }}
            tooltip={({ data, value }) => (
              <div style={TOOLTIP_STYLE}>
                {data.label || data.day}: <strong>{value}</strong> entries
              </div>
            )}
            motionConfig="gentle"
          />
        </div>
      </ChartCard>

      {/* Two-col: Type distribution + Top spend categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {/* Type donut */}
        <ChartCard title="TYPE DISTRIBUTION" delay={0.25}>
          {typeDistribution.length > 0 ? (
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 shrink-0">
                <ResponsivePie
                  data={typeDistribution.map(t => ({ id: t.name, label: t.name, value: t.value, color: t.color }))}
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
                  tooltip={({ datum }) => (
                    <div style={TOOLTIP_STYLE}>
                      <span style={{ color: datum.color }}>■</span> {datum.id}: <strong>{datum.value}</strong>
                    </div>
                  )}
                />
              </div>
              <div className="space-y-1.5 flex-1">
                {typeDistribution.map(t => (
                  <div key={t.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: t.color }} />
                    <span className="font-mono text-[10px] text-[#7a7a7a] flex-1">{t.name}</span>
                    <span className="font-mono text-[10px] text-foreground">{t.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="font-mono text-[11px] text-[#7a7a7a] text-center py-8">No entries in this period</p>
          )}
        </ChartCard>

        {/* Top spend categories */}
        <ChartCard title="TOP SPEND CATEGORIES" delay={0.3}>
          {topSpendCats.length > 0 ? (
            <div className="h-48">
              <ResponsiveBar
                data={topSpendCats.map(c => ({ category: cleanLabel(c.name), value: parseFloat(c.value.toFixed(2)), color: c.color }))}
                keys={['value']}
                indexBy="category"
                layout="horizontal"
                theme={nivoTheme}
                colors={({ data }) => data.color}
                borderRadius={4}
                padding={0.3}
                enableLabel={true}
                label={({ value }) => `€${value.toFixed(0)}`}
                labelTextColor="#fff"
                enableGridX={true}
                enableGridY={false}
                axisLeft={{ tickSize: 0, tickPadding: 6 }}
                axisBottom={{ tickSize: 0, tickPadding: 4, format: v => `€${v}` }}
                margin={{ top: 22, right: 60, bottom: 26, left: 96 }}
                tooltip={({ data, value }) => (
                  <div style={TOOLTIP_STYLE}>
                    <span style={{ color: data.color }}>■</span> {data.category}: <strong>€{value.toFixed(2)}</strong>
                  </div>
                )}
                motionConfig="gentle"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <span className="text-2xl opacity-30">📊</span>
              <p className="font-mono text-[10px] text-[#7a7a7a] text-center">Start logging to see<br />top categories</p>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Daily spend trend */}
      <ChartCard title="DAILY SPEND TREND" delay={0.35}>
        <div className="h-48 md:h-56">
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
              tickPadding: 6,
              tickRotation: n > 14 ? -45 : 0,
              format: (val) => {
                const i = daysInRange.findIndex(d => d.day === val);
                return i >= 0 && i % xTickInterval === 0 ? val : '';
              },
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 8,
              format: v => `€${v}`,
              tickValues: spendYTicks,
            }}
            margin={{ top: 22, right: 22, bottom: n > 14 ? 40 : 26, left: 54 }}
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
        </div>
      </ChartCard>
    </div>
  );
}