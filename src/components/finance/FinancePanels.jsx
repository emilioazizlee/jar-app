import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveLine } from '@nivo/line';
import { nivoTheme } from '@/lib/nivoTheme';
import { PALETTE } from '@/lib/constants';
import { format, isSameDay, startOfMonth, subMonths, parseISO } from 'date-fns';

// ─── Panel B: Category Breakdown Donut ───────────────────────────────────────
export function CategoryBreakdownPanel({ items, snapshots, delay = 0 }) {
  const monthStart = startOfMonth(new Date());

  const breakdown = useMemo(() => {
    const monthItems = items.filter(i => i.date && new Date(i.date) >= monthStart);
    const subs = items.filter(i => i.type === 'subscription' && i.is_active).reduce((s, i) => s + (i.amount || 0), 0);
    const payments = monthItems.filter(i => i.type === 'payment').reduce((s, i) => s + (i.amount || 0), 0);
    const spends = monthItems.filter(i => i.type === 'spend').reduce((s, i) => s + (i.amount || 0), 0);
    const diet = monthItems.filter(i => i.type === 'spend' && ['groceries', 'food_out'].includes(i.category)).reduce((s, i) => s + (i.amount || 0), 0);
    return [
      { id: 'Subscriptions', value: Math.round(subs * 100) / 100, color: PALETTE.yellow },
      { id: 'Payments', value: Math.round(payments * 100) / 100, color: PALETTE.orange },
      { id: 'Daily Spends', value: Math.round(spends * 100) / 100, color: PALETTE.blue },
      { id: 'Groceries & Diet', value: Math.round(diet * 100) / 100, color: PALETTE.violet },
    ].filter(d => d.value > 0);
  }, [items]);

  const total = breakdown.reduce((s, d) => s + d.value, 0);

  const TOOLTIP_STYLE = { background: '#141414', border: '1px solid #1f1f1f', borderRadius: 8, padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#fff' };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="bg-card border border-border rounded-2xl p-5">
      <p className="mono-header text-[10px] text-muted-foreground mb-4">CATEGORY BREAKDOWN</p>
      {breakdown.length > 0 ? (
        <div className="flex items-center gap-4">
          <div className="w-36 h-36 shrink-0">
            <ResponsivePie
              data={breakdown}
              colors={({ data }) => data.color}
              innerRadius={0.65}
              padAngle={2}
              cornerRadius={3}
              borderWidth={0}
              enableArcLinkLabels={false}
              enableArcLabels={false}
              theme={nivoTheme}
              motionConfig="gentle"
              layers={['arcs', 'arcLabels', 'arcLinkLabels', 'legends', ({ centerX, centerY }) => (
                <text x={centerX} y={centerY} textAnchor="middle" dominantBaseline="central"
                  style={{ fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 700, fill: '#fff' }}>
                  €{total.toFixed(0)}
                </text>
              )]}
              tooltip={({ datum }) => (
                <div style={TOOLTIP_STYLE}>
                  <span style={{ color: datum.color }}>■</span> {datum.id}: <strong>€{datum.value.toFixed(2)}</strong>
                  <span style={{ color: '#7a7a7a' }}> ({total > 0 ? ((datum.value / total) * 100).toFixed(1) : 0}%)</span>
                </div>
              )}
            />
          </div>
          <div className="space-y-2 flex-1">
            {breakdown.map(d => (
              <div key={d.id} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="font-mono text-[10px] text-muted-foreground flex-1">{d.id}</span>
                <span className="font-mono text-[10px] text-foreground">€{d.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-6">No spend data this month</p>
      )}
    </motion.div>
  );
}

// ─── Panel C: Burn Rate Gauge ─────────────────────────────────────────────────
export function BurnRatePanel({ items, snapshots, delay = 0 }) {
  const latest = snapshots[0];
  const monthIncome = latest?.monthly_income || 0;

  const { subBurn, payBurn, avgDailySpend } = useMemo(() => {
    const subBurn = items.filter(i => i.type === 'subscription' && i.is_active && i.amount).reduce((s, i) => s + (i.amount || 0), 0);
    const payBurn = items.filter(i => i.type === 'payment' && i.amount).reduce((s, i) => s + (i.amount || 0), 0);
    const past30 = items.filter(i => i.type === 'spend' && i.date && new Date(i.date) >= subMonths(new Date(), 1));
    const avgDailySpend = past30.reduce((s, i) => s + (i.amount || 0), 0) / 30;
    return { subBurn, payBurn, avgDailySpend };
  }, [items]);

  if (!monthIncome) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
        className="bg-card border border-border rounded-2xl p-5">
        <p className="mono-header text-[10px] text-muted-foreground mb-3">BURN RATE</p>
        <p className="text-sm text-muted-foreground text-center py-6">Add monthly income in "What You Have" to see burn rate.</p>
      </motion.div>
    );
  }

  const totalMonthlyFixed = subBurn + payBurn;
  const available = monthIncome - totalMonthlyFixed;
  const daysUntilBroke = avgDailySpend > 0 ? Math.floor(available / avgDailySpend) : 999;
  const pct = Math.min(100, Math.max(0, (daysUntilBroke / 90) * 100));

  const gaugeColor = daysUntilBroke >= 60 ? PALETTE.green : daysUntilBroke >= 30 ? PALETTE.yellow : PALETTE.red;

  // SVG semicircle gauge
  const r = 70; const cx = 90; const cy = 80;
  const startAngle = Math.PI; const endAngle = 0;
  const needleAngle = Math.PI - (pct / 100) * Math.PI;
  const nx = cx + r * Math.cos(needleAngle);
  const ny = cy + r * Math.sin(needleAngle);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="bg-card border border-border rounded-2xl p-5">
      <p className="mono-header text-[10px] text-muted-foreground mb-3">BURN RATE</p>
      <div className="flex flex-col items-center">
        <svg width="180" height="100" viewBox="0 0 180 100">
          {/* Track */}
          <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#1f1f1f" strokeWidth="12" strokeLinecap="round" />
          {/* Green zone (60-100%) */}
          <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(Math.PI - (40/90) * Math.PI)} ${cy + r * Math.sin(Math.PI - (40/90) * Math.PI)}`} fill="none" stroke={PALETTE.green + '40'} strokeWidth="12" strokeLinecap="round" />
          {/* Yellow zone (30-60%) */}
          <path d={`M ${cx + r * Math.cos(Math.PI - (40/90) * Math.PI)} ${cy + r * Math.sin(Math.PI - (40/90) * Math.PI)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(Math.PI * (1 - 30/90))} ${cy + r * Math.sin(Math.PI * (1 - 30/90))}`} fill="none" stroke={PALETTE.yellow + '40'} strokeWidth="12" strokeLinecap="round" />
          {/* Needle */}
          <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={gaugeColor} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="4" fill={gaugeColor} />
        </svg>
        <p className="font-mono text-3xl font-bold mt-1" style={{ color: gaugeColor }}>
          {daysUntilBroke >= 999 ? '∞' : daysUntilBroke}
        </p>
        <p className="font-mono text-[10px] text-muted-foreground">days until broke at current rate</p>
        <div className="mt-3 space-y-1 w-full">
          <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
            <span>Daily spend</span><span>€{avgDailySpend.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
            <span>Fixed monthly</span><span>€{totalMonthlyFixed.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
            <span>Available</span><span style={{ color: gaugeColor }}>€{available.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Panel D: Net Worth Tracker ───────────────────────────────────────────────
export function NetWorthPanel({ snapshots, delay = 0 }) {
  const chartData = useMemo(() => {
    if (snapshots.length < 2) return null;
    const sorted = [...snapshots].sort((a, b) => a.date < b.date ? -1 : 1);
    return [{
      id: 'Net Worth',
      color: PALETTE.green,
      data: sorted.slice(-12).map(s => ({
        x: s.date ? format(parseISO(s.date), 'MMM yy') : '—',
        y: (s.cash_on_hand || 0) + (s.bank_balance || 0) + (s.savings || 0),
      }))
    }];
  }, [snapshots]);

  const latest = snapshots[0];
  const prev = snapshots[1];
  const latestNet = latest ? (latest.cash_on_hand || 0) + (latest.bank_balance || 0) + (latest.savings || 0) : 0;
  const prevNet = prev ? (prev.cash_on_hand || 0) + (prev.bank_balance || 0) + (prev.savings || 0) : 0;
  const diff = latestNet - prevNet;
  const trending = diff > 0 ? PALETTE.green : diff < 0 ? PALETTE.red : '#ffffff';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="bg-card border border-border rounded-2xl p-5">
      <p className="mono-header text-[10px] text-muted-foreground mb-2">NET WORTH TRACKER</p>
      {latest && (
        <div className="flex items-center gap-3 mb-3">
          <p className="font-mono text-xl font-bold text-foreground">€{latestNet.toFixed(2)}</p>
          {diff !== 0 && (
            <span className="font-mono text-xs" style={{ color: trending }}>
              {diff >= 0 ? '+' : ''}€{diff.toFixed(2)}
            </span>
          )}
        </div>
      )}
      {chartData ? (
        <div className="h-36">
          <ResponsiveLine
            data={chartData}
            theme={nivoTheme}
            colors={[trending]}
            curve="monotoneX"
            enableArea={true}
            areaOpacity={0.1}
            lineWidth={2}
            pointSize={4}
            pointColor={{ from: 'color' }}
            pointBorderWidth={0}
            enableSlices={false}
            useMesh={true}
            enableGridX={false}
            axisBottom={{ tickSize: 0, tickPadding: 4 }}
            axisLeft={{ tickSize: 0, tickPadding: 6, format: v => `€${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}` }}
            margin={{ top: 10, right: 10, bottom: 24, left: 50 }}
            motionConfig="gentle"
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-6">Track your balance monthly to see net worth trend.</p>
      )}
    </motion.div>
  );
}

// ─── Panel E: Spending Heatmap Calendar ───────────────────────────────────────
export function SpendingHeatmap({ items, delay = 0 }) {
  const [selectedDay, setSelectedDay] = useState(null);

  const today = new Date();
  const monthStart = startOfMonth(today);

  const daysInMonth = useMemo(() => {
    const days = [];
    const d = new Date(monthStart);
    while (d.getMonth() === today.getMonth()) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, []);

  const spendByDay = useMemo(() => {
    const map = {};
    items.forEach(i => {
      if (i.type === 'spend' && i.date) {
        const key = i.date.slice(0, 10);
        map[key] = (map[key] || 0) + (i.amount || 0);
      }
    });
    return map;
  }, [items]);

  const maxSpend = Math.max(...Object.values(spendByDay), 1);

  const getIntensity = (spend) => {
    if (!spend) return '#141414';
    const ratio = Math.min(1, spend / maxSpend);
    const alpha = 0.15 + ratio * 0.85;
    return `rgba(0, 150, 199, ${alpha.toFixed(2)})`;
  };

  const selectedItems = useMemo(() => {
    if (!selectedDay) return [];
    return items.filter(i => i.type === 'spend' && i.date && isSameDay(new Date(i.date), selectedDay));
  }, [items, selectedDay]);

  // Pad with empty slots for alignment
  const firstDow = daysInMonth[0]?.getDay() || 0; // 0=Sun
  const padded = [...Array(firstDow).fill(null), ...daysInMonth];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="bg-card border border-border rounded-2xl p-5">
      <p className="mono-header text-[10px] text-muted-foreground mb-3">
        SPENDING HEATMAP — {format(today, 'MMMM yyyy').toUpperCase()}
      </p>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center font-mono text-[9px] text-muted-foreground/60">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {padded.map((day, i) => {
          if (!day) return <div key={`pad-${i}`} />;
          const key = format(day, 'yyyy-MM-dd');
          const spend = spendByDay[key] || 0;
          const isToday = isSameDay(day, today);
          const isSelected = selectedDay && isSameDay(day, selectedDay);
          return (
            <button
              key={key}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              className="aspect-square rounded-lg transition-all hover:opacity-80 relative flex items-center justify-center"
              style={{
                background: getIntensity(spend),
                border: isToday ? `1.5px solid ${PALETTE.green}` : isSelected ? '1.5px solid #fff' : '1.5px solid transparent',
              }}
            >
              <span className="font-mono text-[9px] text-foreground/70">{day.getDate()}</span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-3">
        <span className="font-mono text-[9px] text-muted-foreground">Daily spend intensity — tap a day</span>
        <div className="flex items-center gap-1">
          {[0.1, 0.3, 0.6, 1.0].map((op, i) => (
            <div key={i} className="w-3 h-3 rounded-sm" style={{ background: `rgba(0,150,199,${op})` }} />
          ))}
        </div>
      </div>

      {/* Day detail slide-up */}
      {selectedDay && (
        <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
          <p className="font-mono text-[10px] text-muted-foreground">{format(selectedDay, 'EEEE, MMM d').toUpperCase()}</p>
          {selectedItems.length === 0 ? (
            <p className="text-xs text-muted-foreground">No spends this day.</p>
          ) : (
            selectedItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                <span className="text-sm">{item.title}</span>
                <span className="font-mono text-xs text-muted-foreground">€{(item.amount || 0).toFixed(2)}</span>
              </div>
            ))
          )}
          <p className="font-mono text-xs text-foreground font-bold pt-1">
            Total: €{selectedItems.reduce((s, i) => s + (i.amount || 0), 0).toFixed(2)}
          </p>
        </div>
      )}
    </motion.div>
  );
}