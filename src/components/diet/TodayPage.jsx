import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Plus, Droplets, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProductAutocomplete from '@/components/shared/ProductAutocomplete';
import { motion, AnimatePresence } from 'framer-motion';

const MEAL_SLOTS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const DIET_UNITS = ['g', 'ml', 'pcs', 'serving', 'cup', 'tbsp', 'tsp', 'L'];
const SLOT_COLORS = { Breakfast: '#ffd60a', Lunch: '#abff4f', Dinner: '#4da6ff', Snack: '#ff9f43' };

function AddFoodForm({ slot, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: '', quantity: 100, unit: 'g', calories: '', protein: '', carbs: '', fat: '',
    notes: '', product_id: null,
  });
  const [saving, setSaving] = useState(false);

  const handleProductSelected = (product) => {
    const qty = form.quantity || 100;
    const factor = qty / 100;
    setForm(f => ({
      ...f,
      name: product.name,
      product_id: product.id || null,
      unit: product.default_serving_unit || f.unit,
      calories: product.calories_per_100 ? String((product.calories_per_100 * factor).toFixed(1)) : f.calories,
      protein: product.protein_per_100 ? String((product.protein_per_100 * factor).toFixed(1)) : f.protein,
      carbs: product.carbs_per_100 ? String((product.carbs_per_100 * factor).toFixed(1)) : f.carbs,
      fat: product.fat_per_100 ? String((product.fat_per_100 * factor).toFixed(1)) : f.fat,
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await onSave({
      ...form,
      meal_slot: slot,
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm'),
      calories: form.calories ? Number(form.calories) : undefined,
      protein: form.protein ? Number(form.protein) : undefined,
      carbs: form.carbs ? Number(form.carbs) : undefined,
      fat: form.fat ? Number(form.fat) : undefined,
      quantity: Number(form.quantity),
    });
    setSaving(false);
  };

  return (
    <div className="bg-muted rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs font-bold" style={{ color: SLOT_COLORS[slot] }}>+ {slot.toUpperCase()}</p>
        <button onClick={onCancel}><X className="w-4 h-4 text-muted-foreground hover:text-foreground" /></button>
      </div>
      <ProductAutocomplete value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))}
        onProductSelected={handleProductSelected} mode="diet"
        placeholder="Food name..." className="bg-background border-none font-mono text-sm h-8" />
      <div className="grid grid-cols-4 gap-2">
        <div>
          <Label className="font-mono text-[10px] text-muted-foreground">QUANTITY</Label>
          <Input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className="bg-background border-none font-mono text-sm h-8 mt-0.5" min={0.1} step={1} />
        </div>
        <div>
          <Label className="font-mono text-[10px] text-muted-foreground">UNIT</Label>
          <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="w-full bg-background border border-input rounded-md font-mono text-sm h-8 mt-0.5 px-2">
            {DIET_UNITS.map(u => <option key={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <Label className="font-mono text-[10px] text-muted-foreground">CALORIES</Label>
          <Input type="number" value={form.calories} onChange={e => setForm(f => ({ ...f, calories: e.target.value }))} placeholder="kcal" className="bg-background border-none font-mono text-sm h-8 mt-0.5" />
        </div>
        <div>
          <Label className="font-mono text-[10px] text-muted-foreground">PROTEIN g</Label>
          <Input type="number" value={form.protein} onChange={e => setForm(f => ({ ...f, protein: e.target.value }))} placeholder="g" className="bg-background border-none font-mono text-sm h-8 mt-0.5" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="font-mono text-[10px] text-muted-foreground">CARBS g</Label>
          <Input type="number" value={form.carbs} onChange={e => setForm(f => ({ ...f, carbs: e.target.value }))} placeholder="g" className="bg-background border-none font-mono text-sm h-8 mt-0.5" />
        </div>
        <div>
          <Label className="font-mono text-[10px] text-muted-foreground">FAT g</Label>
          <Input type="number" value={form.fat} onChange={e => setForm(f => ({ ...f, fat: e.target.value }))} placeholder="g" className="bg-background border-none font-mono text-sm h-8 mt-0.5" />
        </div>
      </div>
      <Button onClick={handleSave} disabled={saving || !form.name.trim()} className="w-full font-mono text-sm bg-primary text-primary-foreground">
        {saving ? 'SAVING...' : 'LOG FOOD'}
      </Button>
    </div>
  );
}

function MealSlot({ slot, logs, onAdd, onDelete }) {
  const [adding, setAdding] = useState(false);
  const qc = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');
  const slotCal = logs.reduce((s, l) => s + (l.calories || 0), 0);
  const slotProtein = logs.reduce((s, l) => s + (l.protein || 0), 0);
  const color = SLOT_COLORS[slot];

  const handleDelete = async (id) => {
    await base44.entities.DietLog.delete(id);
    qc.invalidateQueries({ queryKey: ['diet-logs', today] });
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="font-mono text-sm font-bold">{slot}</span>
        </div>
        <div className="flex items-center gap-3">
          {slotCal > 0 && <span className="font-mono text-xs" style={{ color }}>{Math.round(slotCal)} kcal {slotProtein > 0 && `· ${slotProtein.toFixed(0)}g P`}</span>}
          <button onClick={() => setAdding(a => !a)} className="p-1 rounded-lg bg-muted hover:bg-primary/20 hover:text-primary transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="px-4">
        {logs.map(log => (
          <div key={log.id} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0 group">
            <div className="flex-1 min-w-0">
              <span className="font-mono text-sm truncate">{log.name}</span>
              <span className="font-mono text-xs text-muted-foreground ml-2">{log.quantity} {log.unit}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {log.calories && <span className="font-mono text-xs text-primary">{Math.round(log.calories)} kcal</span>}
              {log.protein && <span className="font-mono text-xs text-blue-400">{log.protein.toFixed(0)}g</span>}
            </div>
            <button onClick={() => handleDelete(log.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"><X className="w-3.5 h-3.5" /></button>
          </div>
        ))}
        {logs.length === 0 && !adding && (
          <div className="py-3 text-center font-mono text-xs text-muted-foreground/40">Empty — tap + to log</div>
        )}
      </div>
      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="border-t border-border p-3">
              <AddFoodForm slot={slot} onSave={async (data) => { await onAdd(data); setAdding(false); }} onCancel={() => setAdding(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TodayPage() {
  const qc = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: logs = [] } = useQuery({
    queryKey: ['diet-logs', today],
    queryFn: () => base44.entities.DietLog.filter({ date: today }, 'created_date', 100),
  });
  const { data: waterLogs = [] } = useQuery({
    queryKey: ['water-logs', today],
    queryFn: () => base44.entities.WaterLog.filter({ date: today }, '-created_date', 1),
  });

  const waterTotal = waterLogs[0]?.amount_liters || 0;

  const addWater = async (ml) => {
    const liters = ml / 1000;
    const existing = waterLogs[0];
    if (existing) {
      await base44.entities.WaterLog.update(existing.id, { amount_liters: waterTotal + liters, entries: [...(existing.entries || []), { time: format(new Date(), 'HH:mm'), amount_ml: ml }] });
    } else {
      const me = await base44.auth.me();
      await base44.entities.WaterLog.create({ date: today, amount_liters: liters, entries: [{ time: format(new Date(), 'HH:mm'), amount_ml: ml }], created_by: me.email });
    }
    qc.invalidateQueries({ queryKey: ['water-logs', today] });
  };

  const addLog = async (data) => {
    const me = await base44.auth.me();
    const created = await base44.entities.DietLog.create({ ...data, created_by: me.email });
    qc.invalidateQueries({ queryKey: ['diet-logs', today] });
    // Trigger pantry decrement in background if product is linked
    if (created?.id && data.product_id) {
      base44.functions.invoke('pantryDecrement', { diet_log_id: created.id }).catch(() => {});
    }
  };

  const slotLogs = (slot) => logs.filter(l => l.meal_slot === slot);

  return (
    <div className="space-y-4">
      {/* Hydration quick-add */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span className="font-mono text-sm font-bold text-blue-400">{waterTotal.toFixed(2)} L</span>
            <span className="font-mono text-xs text-muted-foreground">water today</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[150, 250, 300, 500].map(ml => (
            <button key={ml} onClick={() => addWater(ml)} className="px-3 py-1.5 rounded-lg bg-blue-400/10 text-blue-400 font-mono text-xs hover:bg-blue-400/20 transition-colors">
              +{ml}ml
            </button>
          ))}
        </div>
      </div>

      {MEAL_SLOTS.map(slot => (
        <MealSlot key={slot} slot={slot} logs={slotLogs(slot)} onAdd={addLog} />
      ))}
    </div>
  );
}