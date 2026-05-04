import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, subDays, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function HistoryPage() {
  const { data: logs = [] } = useQuery({
    queryKey: ['diet-logs-history'],
    queryFn: () => base44.entities.DietLog.list('-date', 500),
  });
  const { data: goals = [] } = useQuery({
    queryKey: ['diet-goals'],
    queryFn: () => base44.entities.DietGoals.filter({ is_active: true }, '-created_date', 1),
  });
  const goal = goals[0];

  const last30Days = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const dayLogs = logs.filter(l => l.date === d);
      const cals = dayLogs.reduce((s, l) => s + (l.calories || 0), 0);
      const protein = dayLogs.reduce((s, l) => s + (l.protein || 0), 0);
      days.push({ date: d, calories: Math.round(cals), protein: Math.round(protein), label: d.slice(5) });
    }
    return days;
  }, [logs]);

  const calTarget = goal?.daily_calories || 2000;

  const calHeatmap = useMemo(() => last30Days.map(d => {
    const pct = d.calories / calTarget;
    if (d.calories === 0) return { ...d, color: '#1f1f1f' };
    if (pct >= 0.9 && pct <= 1.1) return { ...d, color: '#39ff14' };
    if (pct < 0.9) return { ...d, color: '#ffd60a' };
    return { ...d, color: '#ff2d2d' };
  }), [last30Days, calTarget]);

  const onTarget = calHeatmap.filter(d => d.color === '#39ff14').length;
  const daysLogged = calHeatmap.filter(d => d.calories > 0).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="font-mono text-[10px] text-muted-foreground">DAYS LOGGED</div>
          <div className="font-mono text-2xl font-bold text-primary mt-1">{daysLogged}</div>
          <div className="font-mono text-[10px] text-muted-foreground">last 30 days</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="font-mono text-[10px] text-muted-foreground">ON TARGET</div>
          <div className="font-mono text-2xl font-bold text-secondary mt-1">{onTarget}</div>
          <div className="font-mono text-[10px] text-muted-foreground">days ±10%</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="font-mono text-[10px] text-muted-foreground">ADHERENCE</div>
          <div className="font-mono text-2xl font-bold text-primary mt-1">{daysLogged > 0 ? Math.round(onTarget / daysLogged * 100) : 0}%</div>
          <div className="font-mono text-[10px] text-muted-foreground">goal hit rate</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <p className="font-mono text-[10px] text-muted-foreground mb-3">CALORIE HEATMAP — 30 DAYS</p>
        <div className="grid grid-cols-10 gap-1">
          {calHeatmap.map(d => (
            <div key={d.date} title={`${d.date}: ${d.calories} kcal`}
              className="h-7 rounded flex items-center justify-center" style={{ background: d.color + '30', border: `1px solid ${d.color}50` }}>
              <span className="font-mono text-[8px]" style={{ color: d.color }}>{d.label.slice(3)}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3">
          {[{ color: '#39ff14', label: 'On target' }, { color: '#ffd60a', label: 'Under' }, { color: '#ff2d2d', label: 'Over' }, { color: '#1f1f1f', label: 'No data' }].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ background: color }} />
              <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <p className="font-mono text-[10px] text-muted-foreground mb-3">WEEKLY CALORIES & PROTEIN</p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={last30Days.filter((_, i) => i % 3 === 0)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
            <XAxis dataKey="label" tick={{ fontSize: 9, fontFamily: 'monospace', fill: '#777' }} />
            <YAxis tick={{ fontSize: 9, fontFamily: 'monospace', fill: '#777' }} />
            <Tooltip contentStyle={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 8, fontFamily: 'monospace', fontSize: 11 }} />
            <Line type="monotone" dataKey="calories" stroke="#39ff14" strokeWidth={1.5} dot={false} name="kcal" />
            <Line type="monotone" dataKey="protein" stroke="#4da6ff" strokeWidth={1.5} dot={false} name="protein g" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}