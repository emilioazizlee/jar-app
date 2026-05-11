import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, subDays, parseISO } from 'date-fns';
import { ResponsiveLine } from '@nivo/line';
import { nivoTheme } from '@/lib/nivoTheme';

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
    if (pct >= 0.9 && pct <= 1.1) return { ...d, color: '#abff4f' };
    if (pct < 0.9) return { ...d, color: '#ffee32' };
    return { ...d, color: '#c1121f' };
  }), [last30Days, calTarget]);

  const onTarget = calHeatmap.filter(d => d.color === '#abff4f').length;
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
          {[{ color: '#abff4f', label: 'On target' }, { color: '#ffee32', label: 'Under' }, { color: '#c1121f', label: 'Over' }, { color: '#1f1f1f', label: 'No data' }].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ background: color }} />
              <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <p className="font-mono text-[10px] text-muted-foreground mb-3">WEEKLY CALORIES & PROTEIN</p>
        <div className="h-40">
          <ResponsiveLine
            data={[
              { id: 'kcal', color: '#abff4f', data: last30Days.map(d => ({ x: d.label, y: calTarget > 0 ? Math.round((d.calories / calTarget) * 100) : 0, raw: d.calories })) },
              { id: 'protein', color: '#0096c7', data: last30Days.map(d => ({ x: d.label, y: (goal?.daily_protein || 150) > 0 ? Math.round((d.protein / (goal?.daily_protein || 150)) * 100) : 0, raw: d.protein })) },
            ]}
            theme={nivoTheme}
            colors={['#abff4f', '#0096c7']}
            curve="monotoneX"
            lineWidth={1.5}
            pointSize={3}
            pointColor={{ from: 'color' }}
            enableArea={true}
            areaOpacity={0.1}
            enableSlices="x"
            useMesh={false}
            enableGridX={false}
            yScale={{ type: 'linear', min: 0, max: 150, nice: false }}
            markers={[{ axis: 'y', value: 100, lineStyle: { stroke: '#ffffff22', strokeWidth: 1, strokeDasharray: '4 4' } }]}
            axisBottom={{ tickSize: 0, tickPadding: 5, tickValues: 6 }}
            axisLeft={{ tickSize: 0, tickPadding: 5, format: v => `${v}%`, tickValues: [0, 50, 100] }}
            margin={{ top: 10, right: 16, bottom: 32, left: 44 }}
            motionConfig="gentle"
            sliceTooltip={({ slice }) => (
              <div style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 8, padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
                {slice.points.map(p => (
                  <div key={p.id}><span style={{ color: p.serieColor }}>■</span> {p.serieId}: <strong>{p.data.raw ?? p.data.y}</strong>{p.serieId === 'kcal' ? ' kcal' : 'g'} ({p.data.y}%)</div>
                ))}
              </div>
            )}
          />
        </div>
        <div className="flex items-center gap-4 mt-1">
          <div className="flex items-center gap-1.5"><div className="w-3 h-1 rounded" style={{ background: '#abff4f' }} /><span className="font-mono text-[10px] text-muted-foreground">kcal</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-1 rounded" style={{ background: '#0096c7' }} /><span className="font-mono text-[10px] text-muted-foreground">protein g</span></div>
        </div>
      </div>
    </div>
  );
}