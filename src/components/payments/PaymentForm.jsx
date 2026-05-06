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
import { Switch } from '@/components/ui/switch';

const PAYMENT_CATEGORIES = ['Rent', 'Utilities', 'Insurance', 'Tax', 'Loan', 'Tuition', 'Healthcare', 'Phone', 'Internet', 'Other'];
const RECURRENCE_OPTIONS = ['monthly', 'quarterly', 'yearly'];

export default function PaymentForm({ open, onClose, onSaved, existing = null }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(existing ? {
    title: existing.title || '',
    category: existing.category || 'Other',
    amount: existing.amount || '',
    currency: existing.currency || 'EUR',
    due_date: existing.deadline || '',
    recurring: existing.recurring && existing.recurring !== 'none',
    recurrence: existing.billing_cycle || 'monthly',
    notes: existing.note || '',
  } : {
    title: '',
    category: 'Other',
    amount: '',
    currency: 'EUR',
    due_date: '',
    recurring: false,
    recurrence: 'monthly',
    notes: '',
  });

  const u = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.title || !form.amount) return;
    setSaving(true);
    const data = {
      type: 'payment',
      title: form.title,
      category: form.category,
      amount: Number(form.amount),
      currency: form.currency,
      deadline: form.due_date || undefined,
      recurring: form.recurring ? form.recurrence : 'none',
      billing_cycle: form.recurring ? form.recurrence : undefined,
      note: form.notes || undefined,
      status: 'Pending',
      date: format(new Date(), 'yyyy-MM-dd'),
    };
    if (existing) {
      await base44.entities.Item.update(existing.id, data);
    } else {
      await base44.entities.Item.create(data);
    }
    queryClient.invalidateQueries({ queryKey: ['items'] });
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="mono-header text-sm text-orange-400">
            {existing ? 'EDIT PAYMENT' : 'ADD PAYMENT'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label className="text-xs text-muted-foreground font-mono">TITLE</Label>
            <Input value={form.title} onChange={e => u('title', e.target.value)} placeholder="Rent — May" className="bg-muted border-none mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground font-mono">CATEGORY</Label>
              <Select value={form.category} onValueChange={v => u('category', v)}>
                <SelectTrigger className="bg-muted border-none mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground font-mono">CURRENCY</Label>
              <Select value={form.currency} onValueChange={v => u('currency', v)}>
                <SelectTrigger className="bg-muted border-none mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground font-mono">AMOUNT</Label>
              <Input inputMode="decimal" type="text" value={form.amount} onChange={e => u('amount', e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.00" className="bg-muted border-none mt-1 font-mono text-lg" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground font-mono">DUE DATE</Label>
              <Input type="date" value={form.due_date} onChange={e => u('due_date', e.target.value)} className="bg-muted border-none mt-1" style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          {/* Recurring toggle */}
          <div className="flex items-center justify-between py-2 px-3 bg-muted rounded-xl">
            <Label className="text-sm font-mono">Recurring payment</Label>
            <Switch checked={form.recurring} onCheckedChange={v => u('recurring', v)} />
          </div>
          {form.recurring && (
            <div>
              <Label className="text-xs text-muted-foreground font-mono">RECURRENCE</Label>
              <Select value={form.recurrence} onValueChange={v => u('recurrence', v)}>
                <SelectTrigger className="bg-muted border-none mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RECURRENCE_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label className="text-xs text-muted-foreground font-mono">NOTES</Label>
            <Textarea value={form.notes} onChange={e => u('notes', e.target.value)} placeholder="Optional notes..." className="bg-muted border-none mt-1 resize-none h-20 text-sm" />
          </div>

          <Button onClick={handleSave} disabled={saving || !form.title || !form.amount} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-mono">
            {saving ? 'SAVING...' : existing ? 'UPDATE PAYMENT' : 'ADD PAYMENT'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}