import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Plus, UtensilsCrossed, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';

const PLACE_TYPES = ['Restaurant', 'Bar', 'Cafe', 'Fast Food', 'Bakery', 'Other'];
const OCCASIONS = ['Casual', 'Date', 'Work', 'Celebration', 'Solo'];
const MEAL_SLOTS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const CURRENCIES = ['EUR', 'USD', 'AZN', 'RUB'];

const OCCASION_EMOJI = { Casual: '😊', Date: '❤️', Work: '💼', Celebration: '🎉', Solo: '🎧' };
const TYPE_EMOJI = { Restaurant: '🍽️', Bar: '🍺', Cafe: '☕', 'Fast Food': '🍔', Bakery: '🥐', Other: '🍴' };

const emptyForm = () => ({
  place: '', place_type: 'Restaurant', items_ordered: '', total: '',
  currency: 'EUR', people_with: '', occasion: 'Casual',
  meal_slot: 'Lunch', date: format(new Date(), 'yyyy-MM-dd'),
  time: format(new Date(), 'HH:mm'), notes: '',
});

function EatingOutForm({ existingPlaces = [], onSave, onCancel }) {
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.place.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="mono-header text-xs text-primary">NEW EATING OUT</p>
        <button onClick={onCancel}><X className="w-4 h-4 text-muted-foreground hover:text-foreground" /></button>
      </div>

      {/* Place */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="font-mono text-[10px] text-muted-foreground">PLACE</Label>
          <Input list="places-list" value={form.place} onChange={e => set('place', e.target.value)}
            placeholder="Restaurant name..." className="bg-muted border-none font-mono text-sm h-9 mt-1" />
          <datalist id="places-list">
            {existingPlaces.map(p => <option key={p} value={p} />)}
          </datalist>
        </div>
        <div>
          <Label className="font-mono text-[10px] text-muted-foreground">TYPE</Label>
          <select value={form.place_type} onChange={e => set('place_type', e.target.value)}
            className="w-full bg-muted border-none mt-1 font-mono text-sm h-9 rounded-md px-3">
            {PLACE_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Items ordered */}
      <div>
        <Label className="font-mono text-[10px] text-muted-foreground">ITEMS ORDERED</Label>
        <Input value={form.items_ordered} onChange={e => set('items_ordered', e.target.value)}
          placeholder="Burger, fries, coke..." className="bg-muted border-none font-mono text-sm h-9 mt-1" />
      </div>

      {/* Price */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <Label className="font-mono text-[10px] text-muted-foreground">TOTAL</Label>
          <Input inputMode="decimal" value={form.total} onChange={e => set('total', e.target.value)}
            placeholder="0.00" className="bg-muted border-none font-mono text-sm h-9 mt-1" />
        </div>
        <div>
          <Label className="font-mono text-[10px] text-muted-foreground">CURRENCY</Label>
          <select value={form.currency} onChange={e => set('currency', e.target.value)}
            className="w-full bg-muted border-none mt-1 font-mono text-sm h-9 rounded-md px-3">
            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Meal slot + occasion */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="font-mono text-[10px] text-muted-foreground">MEAL SLOT</Label>
          <select value={form.meal_slot} onChange={e => set('meal_slot', e.target.value)}
            className="w-full bg-muted border-none mt-1 font-mono text-sm h-9 rounded-md px-3">
            {MEAL_SLOTS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <Label className="font-mono text-[10px] text-muted-foreground">OCCASION</Label>
          <select value={form.occasion} onChange={e => set('occasion', e.target.value)}
            className="w-full bg-muted border-none mt-1 font-mono text-sm h-9 rounded-md px-3">
            {OCCASIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* People + date/time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="font-mono text-[10px] text-muted-foreground">WITH (optional)</Label>
          <Input value={form.people_with} onChange={e => set('people_with', e.target.value)}
            placeholder="Names..." className="bg-muted border-none font-mono text-sm h-9 mt-1" />
        </div>
        <div>
          <Label className="font-mono text-[10px] text-muted-foreground">DATE</Label>
          <Input type="date" value={form.date} onChange={e => set('date', e.target.value)}
            className="bg-muted border-none font-mono text-sm h-9 mt-1" />
        </div>
      </div>

      <div>
        <Label className="font-mono text-[10px] text-muted-foreground">NOTES (optional)</Label>
        <Input value={form.notes} onChange={e => set('notes', e.target.value)}
          placeholder="Was it good?" className="bg-muted border-none font-mono text-sm h-9 mt-1" />
      </div>

      <Button onClick={handleSave} disabled={saving || !form.place.trim()} className="w-full font-mono bg-primary text-primary-foreground">
        {saving ? 'SAVING...' : 'SAVE'}
      </Button>
    </div>
  );
}

export default function EatingOutPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: entries = [] } = useQuery({
    queryKey: ['eating-out'],
    queryFn: () => base44.entities.EatingOut.list('-date', 100),
  });

  const existingPlaces = useMemo(() => [...new Set(entries.map(e => e.place))], [entries]);

  const handleSave = async (form) => {
    // Create EatingOut record
    await base44.entities.EatingOut.create({
      ...form,
      total: form.total ? Number(form.total) : undefined,
    });

    // Auto-create Spend entry
    if (form.total && Number(form.total) > 0) {
      await base44.entities.Item.create({
        type: 'spend',
        title: `${TYPE_EMOJI[form.place_type] || '🍴'} ${form.place}`,
        category: 'food_out',
        amount: Number(form.total),
        currency: form.currency,
        date: form.date,
        note: form.items_ordered || '',
      });
    }

    // Auto-create Diet log entry
    await base44.entities.DietLog.create({
      date: form.date,
      meal_slot: form.meal_slot,
      name: form.items_ordered ? `${form.place}: ${form.items_ordered}` : form.place,
      quantity: 1,
      unit: 'serving',
      time: form.time,
      notes: `[Eating Out] ${form.occasion}${form.people_with ? ' · ' + form.people_with : ''}`,
    });

    qc.invalidateQueries({ queryKey: ['eating-out'] });
    qc.invalidateQueries({ queryKey: ['items'] });
    qc.invalidateQueries({ queryKey: ['diet-logs'] });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-muted-foreground">{entries.length} entries</p>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 text-primary font-mono text-xs hover:bg-primary/30 transition-colors">
          <Plus className="w-3.5 h-3.5" /> LOG MEAL OUT
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <EatingOutForm existingPlaces={existingPlaces} onSave={handleSave} onCancel={() => setShowForm(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {entries.length === 0 && !showForm ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <UtensilsCrossed className="w-12 h-12 text-muted-foreground/20" />
          <p className="font-mono text-sm text-muted-foreground">No eating out logged yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map(entry => (
            <div key={entry.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="text-2xl">{TYPE_EMOJI[entry.place_type] || '🍴'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold truncate">{entry.place}</span>
                  <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{entry.place_type}</span>
                </div>
                {entry.items_ordered && <p className="font-mono text-xs text-muted-foreground mt-0.5 truncate">{entry.items_ordered}</p>}
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-mono text-[10px] text-muted-foreground">{entry.date}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{entry.meal_slot}</span>
                  {entry.occasion && <span className="font-mono text-[10px]">{OCCASION_EMOJI[entry.occasion]} {entry.occasion}</span>}
                  {entry.people_with && <span className="font-mono text-[10px] text-muted-foreground">with {entry.people_with}</span>}
                </div>
              </div>
              {entry.total && (
                <div className="font-mono text-sm font-bold text-secondary shrink-0">
                  {entry.currency === 'EUR' ? '€' : entry.currency}{Number(entry.total).toFixed(2)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}