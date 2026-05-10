import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import PremiumGate from '@/components/premium/PremiumGate';
import { ArrowLeft, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, subDays, startOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import { PALETTE, CHART_COLORS, getCategoryColor, SPEND_CATEGORIES } from '@/lib/constants';

const RANGE_OPTIONS = ['7d', '30d', '90d'];

function ChartCard({ title, children }) {
  return (
    <div style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#7a7a7a', marginBottom: 14 }}>{title}</p>
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
      <p style={{ color: '#888', marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</p>
      ))}
    </div>
  );
};

function AnalyticsContent({ user }) {
  const [range, setRange] = useState('30d');
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;

  const { data: items = [] } = useQuery({
    queryKey: ['items', user?.email],
    queryFn: () => base44.entities.Item.filter({ created_by: user.email }, '-date', 2000),
    enabled: !!user,
  });

  const { data: dietLogs = [] } = useQuery({
    queryKey: ['diet-logs', user?.email],
    queryFn: () => base44.entities.DietLog.filter({ created_by: user.email }, '-date', 500),
    enabled: !!user,
  });

  const { data: dietGoals = [] } = useQuery({
    queryKey: ['diet-goals'],
    queryFn: () => base44.entities.DietGoals.filter({ is_active: true }, '-created_date', 1),
    enabled: !!user,
  });

  const { data: budgetLimits = [] } = useQuery({
    queryKey: ['budget-limits', user?.email],
    queryFn: () => base44.entities.BudgetLimit.filter({ user_id: user.email }),
    enabled: !!user,
  });

  const { data: pantryItems = [] } = useQuery({
    queryKey: ['pantry-wasted'],
    queryFn: () => base44.entities.PantryItem.filter({ is_wasted: true }),
    enabled: !!user,
  });

  const { data: priceHistory = [] } = useQuery({
    queryKey: ['price-history'],
    queryFn: () => base44.entities.PriceHistory.list('-date', 200),
    enabled: !!user,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', user?.email],
    queryFn: () => base44.entities.Project.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const cutoff = subDays(new Date(), days);

  // 1) Spending trends by day
  const spendTrend = useMemo(() => {
    const spends = items.filter(i => i.type === 'spend' && i.date && new Date(i.date) >= cutoff && i.amount);
    const byDay = {};
    spends.forEach(i => {
      const d = i.date.slice(0, 10);
      byDay[d] = (byDay[d] || 0) + (i.amount || 0);
    });
    return Array.from({ length: days }, (_, idx) => {
      const d = format(subDays(new Date(), days - 1 - idx), 'yyyy-MM-dd');
      return { date: format(new Date(d), days > 30 ? 'MMM d' : 'MMM d'), amount: byDay[d] || 0 };
    });
  }, [items, days, cutoff]);

  // 2) Spend by category (pie)
  const spendByCategory = useMemo(() => {
    const spends = items.filter(i => i.type === 'spend' && i.date && new Date(i.date) >= cutoff && i.amount);
    const bycat = {};
    spends.forEach(i => { const k = i.category || 'other'; bycat[k] = (bycat[k] || 0) + i.amount; });
    return Object.entries(bycat).map(([k, v]) => ({ name: k, value: Number(v.toFixed(2)) })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [items, days, cutoff]);

  // 3) Macro adherence
  const macroData = useMemo(() => {
    const goal = dietGoals[0];
    const targetCal = goal?.daily_calories || 2000;
    const targetProt = (targetCal * (goal?.protein_pct || 25) / 100) / 4;
    const targetCarbs = (targetCal * (goal?.carbs_pct || 50) / 100) / 4;
    const targetFat = (targetCal * (goal?.fat_pct || 25) / 100) / 9;

    const recentDays = Array.from({ length: Math.min(days, 14) }, (_, i) => subDays(new Date(), i)).reverse();
    return recentDays.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const logs = dietLogs.filter(l => l.date === dayStr);
      const prot = logs.reduce((s, l) => s + (l.protein || 0), 0);
      const carbs = logs.reduce((s, l) => s + (l.carbs || 0), 0);
      const fat = logs.reduce((s, l) => s + (l.fat || 0), 0);
      return {
        date: format(day, 'MMM d'),
        Protein: Math.round(prot),
        Carbs: Math.round(carbs),
        Fat: Math.round(fat),
        TargetProt: Math.round(targetProt),
      };
    });
  }, [dietLogs, dietGoals, days]);

  // 4) Budget health
  const budgetHealth = useMemo(() => {
    return budgetLimits.map(b => {
      const spent = items
        .filter(i => i.type === 'spend' && i.category === b.category && i.date && new Date(i.date) >= cutoff && i.amount)
        .reduce((s, i) => s + i.amount, 0);
      const pct = Math.min(100, (spent / b.limit_amount) * 100);
      return { name: b.category, spent: Number(spent.toFixed(2)), limit: b.limit_amount, pct: Math.round(pct) };
    });
  }, [budgetLimits, items, cutoff]);

  // 5) Time by project
  const timeByProject = useMemo(() => {
    const tasks = items.filter(i => i.type === 'task' && i.time_logged > 0);
    const byProj = {};
    tasks.forEach(t => {
      const tag = (t.tags || []).find(tg => tg.startsWith('project:'));
      const projId = tag ? tag.replace('project:', '') : 'unassigned';
      const proj = projects.find(p => p.id === projId);
      const name = proj?.name || 'Unassigned';
      byProj[name] = (byProj[name] || 0) + (t.time_logged || 0);
    });
    return Object.entries(byProj).map(([name, hours]) => ({ name, hours: Number(hours.toFixed(1)) })).sort((a, b) => b.hours - a.hours).slice(0, 8);
  }, [items, projects]);

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Link to="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#7a7a7a' }}>ADVANCED ANALYTICS</p>
        </div>
        <div style={{ display: 'flex', gap: 4, background: '#1a1a1a', borderRadius: 8, border: '1px solid #2a2a2a', padding: 3 }}>
          {RANGE_OPTIONS.map(r => (
            <button key={r} onClick={() => setRange(r)}
              style={{ padding: '4px 10px', borderRadius: 6, background: range === r ? '#abff4f' : 'transparent', color: range === r ? '#0a0a0a' : '#777', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Spending trend */}
        <ChartCard title={`Spending Trend (${range})`}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={spendTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="date" tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fill: '#555' }} interval={Math.floor(days / 6)} />
              <YAxis tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fill: '#555' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="amount" stroke={PALETTE.blue} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Category breakdown */}
        <ChartCard title="Spend by Category">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={spendByCategory} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value">
                  {spendByCategory.map((entry, i) => (
                    <Cell key={i} fill={getCategoryColor(entry.name, i)} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {spendByCategory.slice(0, 6).map((c, i) => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: getCategoryColor(c.name, i), flexShrink: 0 }} />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#888', flex: 1, textTransform: 'capitalize' }}>{c.name}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#ccc' }}>{c.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Macro adherence */}
        <ChartCard title="Macro Adherence (last 14 days)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={macroData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="date" tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fill: '#555' }} />
              <YAxis tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fill: '#555' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }} />
              <Bar dataKey="Protein" stackId="a" fill={PALETTE.blue} />
              <Bar dataKey="Carbs" stackId="a" fill={PALETTE.orange} />
              <Bar dataKey="Fat" stackId="a" fill={PALETTE.violet} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Budget health */}
        <ChartCard title="Budget Health">
          {budgetHealth.length === 0 ? (
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#444', textAlign: 'center', padding: '40px 0' }}>No budget limits configured</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {budgetHealth.map(b => (
                <div key={b.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#ccc', textTransform: 'capitalize' }}>{b.name}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: b.pct >= 100 ? PALETTE.red : b.pct >= 80 ? PALETTE.yellow : '#abff4f' }}>
                      {b.spent} / {b.limit} ({b.pct}%)
                    </span>
                  </div>
                  <div style={{ height: 6, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${b.pct}%`, background: b.pct >= 100 ? PALETTE.red : b.pct >= 80 ? PALETTE.yellow : '#abff4f', borderRadius: 3, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        {/* Time tracking */}
        <ChartCard title="Time Logged by Project">
          {timeByProject.length === 0 ? (
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#444', textAlign: 'center', padding: '40px 0' }}>No time logged yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timeByProject} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis type="number" tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fill: '#555' }} />
                <YAxis dataKey="name" type="category" tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fill: '#888' }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hours" fill={PALETTE.violet} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Pantry waste */}
        <ChartCard title="Pantry Waste Analysis">
          {pantryItems.length === 0 ? (
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#444', textAlign: 'center', padding: '40px 0' }}>No wasted items recorded</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {pantryItems.slice(0, 8).map((item, i) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #1a1a1a' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555', width: 16 }}>{i + 1}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#ccc', flex: 1 }}>{item.product_id || 'Unknown'}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: PALETTE.red }}>{item.quantity} {item.unit}</span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

export default function AdvancedAnalytics() {
  const { user } = useCurrentUser();
  return (
    <PremiumGate featureName="Advanced Analytics">
      <AnalyticsContent user={user} />
    </PremiumGate>
  );
}