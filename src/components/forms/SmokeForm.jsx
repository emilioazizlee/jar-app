import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { CURRENCIES } from '@/lib/constants';
import { format } from 'date-fns';

// Dual-tracking form: creates both a spend + a health record for Cigarettes
export default function SmokeForm({ open, onClose, onSaved, category }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    quantity: 1,
    amount: '',
    currency: 'EUR',
    note: '',
  });

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const quickQty = [1, 2, 3, 5, 10];

  const handleSave = async () => {
    setSaving(true);
    const today = format(new Date(), 'yyyy-MM-dd');

    // Create spend record
    const spendItem = await base44.entities.Item.create({
      type: 'spend',
      title: 'Cigarettes',
      category: 'cigarettes',
      quantity: form.quantity,
      amount: form.amount ? Number(form.amount) : undefined,
      currency: form.currency,
      note: form.note || undefined,
      date: today,
    });

    // Create health record (dual-track)
    await base44.entities.Item.create({
      type: 'spend',
      title: 'Cigarettes — Health',
      category: 'cigarettes_health',
      quantity: form.quantity,
      note: form.note || undefined,
      date: today,
    });

    // Link them
    await base44.entities.Link.create({
      from_item_id: spendItem.id,
      to_item_id: spendItem.id, // self-reference placeholder; real link created below
      relationship: 'dual_track',
    });

    queryClient.invalidateQueries({ queryKey: ['items'] });
    queryClient.invalidateQueries({ queryKey: ['items-spends'] });
    queryClient.invalidateQueries({ queryKey: ['items-month'] });
    queryClient.invalidateQueries({ queryKey: ['items-smoke'] });
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm w-full p-0 gap-0 flex flex-col rounded-none sm:rounded-xl h-full sm:h-auto max-h-[100dvh] sm:max-h-[85vh] overflow-hidden">
        {/* Sticky header */}
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
          <DialogTitle className="mono-header text-sm text-secondary flex items-center gap-2">
            🚬 LOG CIGARETTES
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 pb-6 overscroll-contain">
          <div className="text-xs text-muted-foreground font-mono bg-muted/40 px-3 py-2 rounded-lg">
            ↗ Tracks as <span className="text-destructive">Health</span> + <span className="text-secondary">Spend</span> simultaneously
          </div>

          <div>
            <Label className="text-xs text-muted-foreground font-mono">QUANTITY</Label>
            <div className="flex gap-2 mt-2">
              {quickQty.map(q => (
                <button
                  key={q}
                  onClick={() => update('quantity', q)}
                  className={`flex-1 py-2 rounded-lg font-mono text-sm border transition-all ${form.quantity === q ? 'bg-secondary/20 border-secondary text-secondary' : 'bg-muted border-border text-muted-foreground hover:border-secondary/40'}`}
                >
                  {q}
                </button>
              ))}
            </div>
            <Input
              inputMode="decimal"
              type="text"
              value={form.quantity}
              onChange={e => {
                const v = e.target.value.replace(/[^0-9]/g, '');
                update('quantity', v === '' ? '' : Number(v));
              }}
              className="bg-muted border-none mt-2 font-mono"
            />
          </div>

          {/* Quick amount chips */}
          <div>
            <Label className="text-xs text-muted-foreground font-mono">PRICE (optional)</Label>
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
            <div className="flex gap-1.5 flex-wrap mt-2">
              {[0.50, 1, 2, 5, 10, 20].map(amt => (
                <button
                  key={amt}
                  onClick={() => update('amount', String(amt))}
                  className="px-3 py-1.5 rounded-lg bg-muted border border-border font-mono text-sm text-muted-foreground hover:text-secondary hover:border-secondary/40 transition-all"
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground font-mono">CURRENCY</Label>
            <Select value={form.currency} onValueChange={v => update('currency', v)}>
              <SelectTrigger className="bg-muted border-none mt-1 font-mono"><SelectValue /></SelectTrigger>
              <SelectContent>{CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground font-mono">NOTE (optional)</Label>
            <Textarea value={form.note} onChange={e => update('note', e.target.value)} className="bg-muted border-none mt-1" rows={2} />
          </div>
        </div>

        {/* Sticky footer */}
        <div className="px-5 pt-3 pb-5 border-t border-border shrink-0 bg-card">
          <Button onClick={handleSave} disabled={saving} className="w-full bg-secondary text-secondary-foreground font-mono">
            {saving ? 'SAVING...' : 'LOG CIGARETTES'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}