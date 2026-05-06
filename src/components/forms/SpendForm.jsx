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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg w-full h-full sm:h-auto max-h-full sm:max-h-[90vh] rounded-none sm:rounded-lg flex flex-col overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="mono-header text-sm text-secondary">
            {step === 'category' ? 'LOG SPEND' : (
              <button onClick={() => setStep('category')} className="flex items-center gap-2 hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                {SPEND_CATEGORIES.find(c => c.key === category)?.label || category}
              </button>
            )}
          </DialogTitle>
        </DialogHeader>

        {step === 'category' ? (
          <div className="grid grid-cols-3 gap-2 pt-2">
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
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground font-mono">QUANTITY</Label>
                <Input
                  inputMode="decimal"
                  type="text"
                  value={form.quantity}
                  onChange={e => {
                    const v = e.target.value.replace(/[^0-9]/g, '');
                    update('quantity', v === '' ? '' : Number(v));
                  }}
                  className="bg-muted border-none mt-1 font-mono text-lg"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground font-mono">CURRENCY</Label>
                <Select value={form.currency} onValueChange={v => update('currency', v)}>
                  <SelectTrigger className="bg-muted border-none mt-1 font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground font-mono">PRICE</Label>
              <Input
                inputMode="decimal"
                type="text"
                placeholder="0.00"
                value={form.amount}
                onChange={e => {
                  const v = e.target.value.replace(/[^0-9.]/g, '');
                  update('amount', v);
                }}
                className="bg-muted border-none mt-1 font-mono text-2xl h-14"
              />
            </div>

            {/* Quick amount chips — locked set */}
            <div>
              <div className="flex gap-1.5 flex-wrap">
                {QUICK_CHIPS_DEFAULT.map(amt => (
                  <button
                    key={amt}
                    onClick={() => update('amount', String(amt))}
                    className="px-3 py-1.5 rounded-lg bg-muted border border-border font-mono text-sm text-muted-foreground hover:text-secondary hover:border-secondary/40 transition-all"
                  >
                    {amt}
                  </button>
                ))}
                <button
                  onClick={() => setShowMoreChips(!showMoreChips)}
                  className="px-2 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showMoreChips ? 'Less' : 'More'}
                </button>
              </div>
              {showMoreChips && (
                <div className="flex gap-1.5 flex-wrap mt-1.5">
                  {QUICK_CHIPS_MORE.map(amt => (
                    <button
                      key={amt}
                      onClick={() => update('amount', String(amt))}
                      className="px-3 py-1.5 rounded-lg bg-muted border border-border font-mono text-sm text-muted-foreground hover:text-secondary hover:border-secondary/40 transition-all"
                    >
                      {amt}
                    </button>
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

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-secondary text-secondary-foreground font-mono hover:bg-secondary/90"
            >
              {saving ? 'SAVING...' : 'LOG SPEND'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}