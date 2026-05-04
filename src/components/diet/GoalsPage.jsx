import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Target, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MODES = ['Cut', 'Maintain', 'Bulk'];

export default function GoalsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ mode: 'Maintain', daily_calories: 2000, protein_pct: 25, carbs_pct: 50, fat_pct: 25, water_target_liters: 2.0, body_weight_target: '' });
  const [saving, setSaving] = useState(false);

  const { data: goals = [] } = useQuery({ queryKey: ['diet-goals'], queryFn: () => base44.entities.DietGoals.filter({ is_active: true }, '-created_date', 1) });
  const goal = goals[0];

  const totalPct = Number(form.protein_pct) + Number(form.carbs_pct) + Number(form.fat_pct);

  const startEditing = () => {
    if (goal) {
      setForm({ mode: goal.mode, daily_calories: goal.daily_calories, protein_pct: goal.protein_pct || 25, carbs_pct: goal.carbs_pct || 50, fat_pct: goal.fat_pct || 25, water_target_liters: goal.water_target_liters || 2.0, body_weight_target: goal.body_weight_target || '' });
    }
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);
    if (goal) await base44.entities.DietGoals.update(goal.id, { is_active: false });
    await base44.entities.DietGoals.create({ ...form, daily_calories: Number(form.daily_calories), protein_pct: Number(form.protein_pct), carbs_pct: Number(form.carbs_pct), fat_pct: Number(form.fat_pct), water_target_liters: Number(form.water_target_liters), body_weight_target: Number(form.body_weight_target) || undefined, is_active: true });
    qc.invalidateQueries({ queryKey: ['diet-goals'] });
    setEditing(false);
    setSaving(false);
  };

  if (!editing) {
    return (
      <div className="space-y-4">
        {goal ? (
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-secondary" />
                <div>
                  <p className="font-mono text-lg font-bold text-secondary">{goal.mode}</p>
                  <p className="font-mono text-xs text-muted-foreground">Active Goal</p>
                </div>
              </div>
              <Button size="sm" onClick={startEditing} className="h-8 text-xs font-mono bg-muted text-foreground">Edit</Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted rounded-xl p-3 text-center">
                <div className="font-mono text-[10px] text-muted-foreground">DAILY CALORIES</div>
                <div className="font-mono text-2xl font-bold text-primary mt-1">{goal.daily_calories}</div>
                <div className="font-mono text-[10px] text-muted-foreground">kcal</div>
              </div>
              <div className="bg-muted rounded-xl p-3 text-center">
                <div className="font-mono text-[10px] text-muted-foreground">WATER TARGET</div>
                <div className="font-mono text-2xl font-bold text-blue-400 mt-1">{goal.water_target_liters || 2}</div>
                <div className="font-mono text-[10px] text-muted-foreground">liters/day</div>
              </div>
            </div>
            <div>
              <p className="font-mono text-[10px] text-muted-foreground mb-3">MACRO SPLIT</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'PROTEIN', pct: goal.protein_pct || 25, color: '#4da6ff', grams: Math.round(goal.daily_calories * (goal.protein_pct || 25) / 100 / 4) },
                  { label: 'CARBS', pct: goal.carbs_pct || 50, color: '#ffd60a', grams: Math.round(goal.daily_calories * (goal.carbs_pct || 50) / 100 / 4) },
                  { label: 'FAT', pct: goal.fat_pct || 25, color: '#ff9f43', grams: Math.round(goal.daily_calories * (goal.fat_pct || 25) / 100 / 9) },
                ].map(({ label, pct, color, grams }) => (
                  <div key={label} className="bg-muted rounded-xl p-3 text-center">
                    <div className="font-mono text-[10px] text-muted-foreground">{label}</div>
                    <div className="font-mono text-xl font-bold mt-1" style={{ color }}>{pct}%</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{grams}g/day</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 space-y-4">
            <Target className="w-12 h-12 text-muted-foreground/30 mx-auto" />
            <p className="font-mono text-sm text-muted-foreground">No goal set yet.</p>
            <Button onClick={() => setEditing(true)} className="font-mono bg-primary text-primary-foreground">Set Diet Goal</Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-5">
      <p className="font-mono text-sm font-bold text-secondary">DIET GOAL</p>
      <div>
        <Label className="font-mono text-[10px] text-muted-foreground">MODE</Label>
        <div className="flex gap-2 mt-1">
          {MODES.map(m => (
            <button key={m} onClick={() => setForm(f => ({ ...f, mode: m }))}
              className={`px-4 py-2 rounded-lg text-sm font-mono font-bold transition-colors ${form.mode === m ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
              {m}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="font-mono text-[10px] text-muted-foreground">DAILY CALORIES</Label>
          <Input type="number" value={form.daily_calories} onChange={e => setForm(f => ({ ...f, daily_calories: e.target.value }))} className="bg-muted border-none font-mono mt-1" />
        </div>
        <div>
          <Label className="font-mono text-[10px] text-muted-foreground">WATER TARGET (L)</Label>
          <Input type="number" value={form.water_target_liters} onChange={e => setForm(f => ({ ...f, water_target_liters: e.target.value }))} className="bg-muted border-none font-mono mt-1" step="0.25" />
        </div>
      </div>
      <div>
        <Label className="font-mono text-[10px] text-muted-foreground mb-2 block">MACROS (must sum to 100%{totalPct !== 100 ? ` — currently ${totalPct}%` : ' ✓'})</Label>
        <div className="grid grid-cols-3 gap-3">
          {[['PROTEIN %', 'protein_pct'], ['CARBS %', 'carbs_pct'], ['FAT %', 'fat_pct']].map(([label, key]) => (
            <div key={key}>
              <Label className="font-mono text-[10px] text-muted-foreground">{label}</Label>
              <Input type="number" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="bg-muted border-none font-mono mt-0.5" min={0} max={100} />
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label className="font-mono text-[10px] text-muted-foreground">BODY WEIGHT TARGET (kg)</Label>
        <Input type="number" value={form.body_weight_target} onChange={e => setForm(f => ({ ...f, body_weight_target: e.target.value }))} className="bg-muted border-none font-mono mt-1" step="0.5" placeholder="Optional" />
      </div>
      <div className="flex gap-3">
        <Button onClick={save} disabled={saving || totalPct !== 100} className="font-mono bg-primary text-primary-foreground"><Check className="w-4 h-4 mr-1" />{saving ? 'SAVING...' : 'SAVE GOAL'}</Button>
        <Button variant="ghost" onClick={() => setEditing(false)} className="font-mono">Cancel</Button>
      </div>
    </div>
  );
}