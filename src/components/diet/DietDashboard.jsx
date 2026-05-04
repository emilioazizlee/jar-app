import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, startOfMonth } from 'date-fns';
import { Apple, Droplets, Flame, Dumbbell, Target, Zap } from 'lucide-react';

function RadialProgress({ value, max, color, label, sub }) {
  const pct = Math.min(1, (value || 0) / (max || 1));
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#1f1f1f" strokeWidth="8" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-base font-bold" style={{ color }}>{Math.round(value || 0)}</span>
          <span className="font-mono text-[9px] text-muted-foreground">/ {max}</span>
        </div>
      </div>
      <span className="font-mono text-xs font-bold text-foreground">{label}</span>
      {sub && <span className="font-mono text-[10px] text-muted-foreground">{sub}</span>}
    </div>
  );
}

export default function DietDashboard() {
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: todayLogs = [] } = useQuery({
    queryKey: ['diet-logs', today],
    queryFn: () => base44.entities.DietLog.filter({ date: today }, '-created_date', 50),
  });
  const { data: goals = [] } = useQuery({
    queryKey: ['diet-goals'],
    queryFn: () => base44.entities.DietGoals.filter({ is_active: true }, '-created_date', 1),
  });
  const { data: waterLogs = [] } = useQuery({
    queryKey: ['water-logs', today],
    queryFn: () => base44.entities.WaterLog.filter({ date: today }, '-created_date', 1),
  });

  const goal = goals[0];
  const totalCal = useMemo(() => todayLogs.reduce((s, l) => s + (l.calories || 0), 0), [todayLogs]);
  const totalProtein = useMemo(() => todayLogs.reduce((s, l) => s + (l.protein || 0), 0), [todayLogs]);
  const totalCarbs = useMemo(() => todayLogs.reduce((s, l) => s + (l.carbs || 0), 0), [todayLogs]);
  const totalFat = useMemo(() => todayLogs.reduce((s, l) => s + (l.fat || 0), 0), [todayLogs]);
  const waterTotal = waterLogs[0]?.amount_liters || 0;

  const recentMeals = useMemo(() => {
    const slots = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
    return slots.map(slot => ({
      slot,
      items: todayLogs.filter(l => l.meal_slot === slot),
    }));
  }, [todayLogs]);

  return (
    <div className="space-y-6">
      {/* Macro rings */}
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="font-mono text-[10px] text-muted-foreground mb-4">TODAY'S PROGRESS</p>
        <div className="flex justify-around flex-wrap gap-4">
          <RadialProgress value={totalCal} max={goal?.daily_calories || 2000} color="#abff4f" label="CALORIES" sub="kcal" />
          <RadialProgress value={totalProtein} max={goal ? Math.round(goal.daily_calories * (goal.protein_pct || 25) / 100 / 4) : 150} color="#0096c7" label="PROTEIN" sub="g" />
          <RadialProgress value={totalCarbs} max={goal ? Math.round(goal.daily_calories * (goal.carbs_pct || 50) / 100 / 4) : 250} color="#ffee32" label="CARBS" sub="g" />
          <RadialProgress value={totalFat} max={goal ? Math.round(goal.daily_calories * (goal.fat_pct || 25) / 100 / 9) : 55} color="#ff6d00" label="FAT" sub="g" />
        </div>
      </div>

      {/* Hydration */}
      <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
        <Droplets className="w-6 h-6 shrink-0" style={{ color: '#0096c7' }} />
        <div className="flex-1">
          <p className="font-mono text-[10px] text-muted-foreground">HYDRATION</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-mono text-2xl font-bold" style={{ color: '#0096c7' }}>{waterTotal.toFixed(1)}</span>
            <span className="font-mono text-sm text-muted-foreground">/ {goal?.water_target_liters || 2.0} L</span>
          </div>
        </div>
        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (waterTotal / (goal?.water_target_liters || 2)) * 100)}%`, background: '#0096c7' }} />
        </div>
      </div>

      {/* Today's meals summary */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="font-mono text-[10px] text-muted-foreground mb-3">TODAY'S MEALS</p>
        <div className="space-y-2">
          {recentMeals.map(({ slot, items }) => {
            const slotCal = items.reduce((s, l) => s + (l.calories || 0), 0);
            return (
              <div key={slot} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                <div>
                  <span className="font-mono text-sm font-medium">{slot}</span>
                  {items.length > 0 && (
                    <span className="font-mono text-[10px] text-muted-foreground ml-2">
                      {items.map(i => i.name).join(', ').slice(0, 40)}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  {slotCal > 0 && <span className="font-mono text-sm text-primary">{Math.round(slotCal)} kcal</span>}
                  {items.length === 0 && <span className="font-mono text-xs text-muted-foreground/50">—</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {goal ? (
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <Target className="w-5 h-5 text-secondary shrink-0" />
          <div>
            <p className="font-mono text-xs"><span className="text-secondary font-bold">{goal.mode}</span> mode · {goal.daily_calories} kcal/day</p>
            <p className="font-mono text-[10px] text-muted-foreground">P:{goal.protein_pct || 25}% C:{goal.carbs_pct || 50}% F:{goal.fat_pct || 25}%</p>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-dashed border-border rounded-xl p-4 text-center">
          <p className="font-mono text-xs text-muted-foreground">No diet goal set. Go to Goals tab to set one.</p>
        </div>
      )}
    </div>
  );
}