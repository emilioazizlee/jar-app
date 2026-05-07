import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { SPEND_CATEGORIES, CURRENCIES } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import SmokeForm from './SmokeForm';
import GroceriesForm from './GroceriesForm';
import SmartInput from '@/components/learn/SmartInput';
import { recordFieldValue } from '@/lib/learningDB';

const SMOKE_CATEGORIES = ['cigarettes'];
const ITEMIZED_CATEGORIES = ['groceries', 'food_out', 'pharmacy'];

export default function SpendForm({ open, onClose, onSaved, initialCategory }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(initialCategory ? 'details' : 'category');
  const [category, setCategory] = useState(initialCategory || '');
  const [saving, setSaving] = useState(false);
  const [showMoreChips, setShowMoreChips] = useState(false);
  const [form, setForm] = useState({
    quantity: 1,
    amount: '',
    currency: 'EUR',
    note: '',
  });

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  // Route to specialized forms (after all hooks)
  if (category && SMOKE_CATEGORIES.includes(category)) {
    return <SmokeForm open={open} onClose={onClose} onSaved={onSaved} category={category} />;
  }
  if (category && ITEMIZED_CATEGORIES.includes(category)) {
    return <GroceriesForm open={open} onClose={onClose} onSaved={onSaved} category={category} />;
  }

  const selectCategory = (cat) => {
    setCategory(cat);
    // Smoke and itemized categories are handled by routing above — just set category
    if (!SMOKE_CATEGORIES.includes(cat) && !ITEMIZED_CATEGORIES.includes(cat)) {
      setStep('details');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    if (form.note) recordFieldValue('spend_note_' + category, form.note);
    const catObj = SPEND_CATEGORIES.find(c => c.key === category);
    await base44.entities.Item.create({
      type: 'spend',
      title: catObj?.label || category,
      category: category,
      quantity: form.quantity,
      amount: form.amount ? Number(form.amount) : undefined,
      currency: form.currency,
      note: form.note || undefined,
      date: format(new Date(), 'yyyy-MM-dd'),
    });
    queryClient.invalidateQueries({ queryKey: ['items'] });
    queryClient.invalidateQueries({ queryKey: ['items-month'] });
    queryClient.invalidateQueries({ queryKey: ['items-spends'] });
    setSaving(false);
    onSaved();
  };

  const QUICK_CHIPS_DEFAULT = [0.5, 1, 2, 5, 10, 20];
  const QUICK_CHIPS_MORE = [50, 100, 500, 1000, 2000, 5000];

  const saveButton = (
    <Button
      onClick={handleSave}
      disabled={saving}
      className="w-full bg-secondary text-secondary-foreground font-mono hover:bg-secondary/90"
    >
      {saving ? 'SAVING...' : 'LOG SPEND'}
    </Button>
  );

  const titleNode = step === 'category' ? 'LOG SPEND' : (
    <button onClick={() => setStep('category')} className="flex items-center gap-2 text-secondary hover:text-foreground transition-colors">
      <ArrowLeft className="w-4 h-4" />
      {SPEND_CATEGORIES.find(c => c.key === category)?.label || category}
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg w-full p-0 gap-0 flex flex-col rounded-none sm:rounded-xl h-full sm:h-auto max-h-[100dvh] sm:max-h-[85vh] overflow-hidden">
        {/* Sticky header */}
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
          <DialogTitle className="mono-header text-sm">{titleNode}</DialogTitle>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 overscroll-contain">
          {step === 'category' ? (
            <div className="grid grid-cols-3 gap-2">
              {SPEND_CATEGORIES.map((cat, i) => (
                <motion.button
                  key={cat.key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => selectCategory(cat.key)}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted/50 border border-border hover:border-secondary/40 transition-all text-center"
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="font-mono text-[10px] text-muted-foreground leading-tight">{cat.label}</span>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="space-y-5 pb-2">

              {/* ── QUANTITY section ───────────────────────────────── */}
              <div className="bg-muted/40 rounded-xl p-4 border border-border/60">
                <Label className="text-xs text-muted-foreground font-mono block mb-2">QUANTITY <span className="text-muted-foreground/50">(how many)</span></Label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => update('quantity', Math.max(1, (form.quantity || 1) - 1))}
                    className="w-10 h-10 rounded-lg bg-muted border border-border font-mono text-lg hover:border-primary/40 transition-all flex items-center justify-center"
                  >−</button>
                  <Input
                    inputMode="numeric"
                    type="text"
                    value={form.quantity}
                    onChange={e => {
                      const v = e.target.value.replace(/[^0-9]/g, '');
                      update('quantity', v === '' ? '' : Number(v));
                    }}
                    className="flex-1 bg-muted border-none font-mono text-2xl text-center h-12"
                  />
                  <button
                    onClick={() => update('quantity', (form.quantity || 0) + 1)}
                    className="w-10 h-10 rounded-lg bg-muted border border-border font-mono text-lg hover:border-primary/40 transition-all flex items-center justify-center"
                  >+</button>
                </div>
                <div className="flex gap-1.5 flex-wrap mt-2.5">
                  {[1, 2, 3, 5, 10, 20].map(n => (
                    <button
                      key={n}
                      onClick={() => update('quantity', n)}
                      className={`px-3 py-1.5 rounded-lg border font-mono text-sm transition-all ${form.quantity === n ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-muted border-border text-muted-foreground hover:text-foreground hover:border-primary/30'}`}
                    >{n}</button>
                  ))}
                </div>
              </div>

              {/* ── PRICE section ──────────────────────────────────── */}
              <div className="bg-muted/20 rounded-xl p-4 border border-border/40">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-muted-foreground font-mono">PRICE <span className="text-muted-foreground/50">(optional – cost in {form.currency})</span></Label>
                  <Select value={form.currency} onValueChange={v => update('currency', v)}>
                    <SelectTrigger className="bg-muted border-none h-7 w-20 font-mono text-xs px-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  inputMode="decimal"
                  type="text"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={e => {
                    const v = e.target.value.replace(/[^0-9.]/g, '');
                    update('amount', v);
                  }}
                  className="bg-muted border-none font-mono text-2xl h-14"
                />
                <div className="flex gap-1.5 flex-wrap mt-2.5">
                  {QUICK_CHIPS_DEFAULT.map(amt => (
                    <button
                      key={amt}
                      onClick={() => update('amount', String(amt))}
                      className={`px-3 py-1.5 rounded-lg border font-mono text-sm transition-all ${String(form.amount) === String(amt) ? 'bg-secondary/20 border-secondary/40 text-secondary' : 'bg-muted border-border text-muted-foreground hover:text-secondary hover:border-secondary/40'}`}
                    >{amt}</button>
                  ))}
                  <button
                    onClick={() => setShowMoreChips(!showMoreChips)}
                    className="px-2 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >{showMoreChips ? 'Less' : 'More'}</button>
                </div>
                {showMoreChips && (
                  <div className="flex gap-1.5 flex-wrap mt-1.5">
                    {QUICK_CHIPS_MORE.map(amt => (
                      <button
                        key={amt}
                        onClick={() => update('amount', String(amt))}
                        className="px-3 py-1.5 rounded-lg bg-muted border border-border font-mono text-sm text-muted-foreground hover:text-secondary hover:border-secondary/40 transition-all"
                      >{amt}</button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-xs text-muted-foreground font-mono">NOTE (optional)</Label>
                <SmartInput
                  fieldKey={`spend_note_${category}`}
                  value={form.note}
                  onChange={v => update('note', v)}
                  placeholder="Add note..."
                  className="bg-muted border-none mt-1 text-sm"
                  showChips
                  chipsLimit={3}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sticky footer — only in details step */}
        {step === 'details' && (
          <div className="px-5 pt-3 pb-5 border-t border-border shrink-0 bg-card">
            {saveButton}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}