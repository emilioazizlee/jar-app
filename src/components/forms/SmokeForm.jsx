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

// Dual-tracking form: creates both a spend + a health record for Zz or Cigarettes
export default function SmokeForm({ open, onClose, onSaved, category }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const isZz = category === 'zz';
  const label = isZz ? 'Zz' : 'Cigarettes';
  const icon = isZz ? '💨' : '🚬';

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
      title: label,
      category,
      quantity: form.quantity,
      amount: form.amount ? Number(form.amount) : undefined,
      currency: form.currency,
      note: form.note || undefined,
      date: today,
    });

    // Create health record
    const healthItem = await base44.entities.Item.create({
      type: 'spend', // reuse spend type, differentiated by category
      title: `${label} — Health`,
      category: `${category}_health`,
      quantity: form.quantity,
      note: form.note || undefined,
      date: today,
    });

    // Link them
    await base44.entities.Link.create({
      from_item_id: spendItem.id,
      to_item_id: healthItem.id,
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
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="mono-header text-sm text-secondary flex items-center gap-2">
            {icon} LOG {label.toUpperCase()}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
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
              type="number"
              value={form.quantity}
              onChange={e => update('quantity', Number(e.target.value))}
              className="bg-muted border-none mt-2 font-mono"
              min={1}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground font-mono">PRICE (optional)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={form.amount}
                onChange={e => update('amount', e.target.value)}
                className="bg-muted border-none mt-1 font-mono"
                step="0.01"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground font-mono">CURRENCY</Label>
              <Select value={form.currency} onValueChange={v => update('currency', v)}>
                <SelectTrigger className="bg-muted border-none mt-1 font-mono"><SelectValue /></SelectTrigger>
                <SelectContent>{CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground font-mono">NOTE (optional)</Label>
            <Textarea value={form.note} onChange={e => update('note', e.target.value)} className="bg-muted border-none mt-1" rows={2} />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full bg-secondary text-secondary-foreground font-mono">
            {saving ? 'SAVING...' : `LOG ${label.toUpperCase()}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}