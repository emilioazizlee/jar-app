import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { CURRENCIES } from '@/lib/constants';

const SUB_TAGS = ['Cinema', 'Concerts', 'Gaming', 'Dining', 'Dating', 'Drinks & Bars', 'Hobbies', 'Streaming Events', 'Travel', 'Grooming', 'Books', 'Cigarettes', 'Custom'];
const CONTEXTS = ['Solo', 'With friend', 'On date', 'With family', 'Work-social'];

export default function LeisureForm({ open, onClose, onSaved, initial = null }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    item: initial?.item || '',
    sub_tag: initial?.sub_tag || 'Dining',
    custom_sub_tag: initial?.custom_sub_tag || '',
    amount: initial?.amount || '',
    currency: initial?.currency || 'EUR',
    context: initial?.context || 'Solo',
    people: initial?.people || '',
    location: initial?.location || '',
    date: initial?.date || format(new Date(), 'yyyy-MM-dd'),
    time: initial?.time || format(new Date(), 'HH:mm'),
    notes: initial?.notes || '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.item || !form.sub_tag) return;
    setSaving(true);
    const me = await base44.auth.me();
    // Create leisure entry
    const entry = await base44.entities.LeisureEntry.create({
      ...form,
      amount: form.amount ? Number(form.amount) : undefined,
      created_by: me.email,
    });

    // Auto-create a linked Spend entry
    if (form.amount) {
      await base44.entities.Item.create({
        type: 'spend',
        title: form.item,
        category: 'leisure',
        amount: Number(form.amount),
        currency: form.currency,
        note: form.notes || undefined,
        date: form.date,
        created_by: me.email,
      });
    }

    setSaving(false);
    onSaved(entry);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="mono-header text-sm text-primary">LOG LEISURE</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div>
            <Label className="text-xs text-muted-foreground font-mono">WHAT WAS IT?</Label>
            <Input
              value={form.item}
              onChange={e => set('item', e.target.value)}
              placeholder="e.g. Avengers movie, dinner at Zara..."
              className="bg-muted border-none mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground font-mono">CATEGORY</Label>
              <Select value={form.sub_tag} onValueChange={v => set('sub_tag', v)}>
                <SelectTrigger className="bg-muted border-none mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUB_TAGS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {form.sub_tag === 'Custom' && (
              <div>
                <Label className="text-xs text-muted-foreground font-mono">CUSTOM TAG</Label>
                <Input
                  value={form.custom_sub_tag}
                  onChange={e => set('custom_sub_tag', e.target.value)}
                  className="bg-muted border-none mt-1"
                  placeholder="e.g. Spa"
                />
              </div>
            )}
            <div>
              <Label className="text-xs text-muted-foreground font-mono">CONTEXT</Label>
              <Select value={form.context} onValueChange={v => set('context', v)}>
                <SelectTrigger className="bg-muted border-none mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTEXTS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground font-mono">AMOUNT</Label>
              <Input
                inputMode="decimal"
                type="text"
                value={form.amount}
                onChange={e => set('amount', e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="0.00"
                className="bg-muted border-none mt-1 font-mono"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground font-mono">CURRENCY</Label>
              <Select value={form.currency} onValueChange={v => set('currency', v)}>
                <SelectTrigger className="bg-muted border-none mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground font-mono">DATE</Label>
              <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="bg-muted border-none mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground font-mono">TIME</Label>
              <Input type="time" value={form.time} onChange={e => set('time', e.target.value)} className="bg-muted border-none mt-1" />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground font-mono">PEOPLE (optional)</Label>
            <Input
              value={form.people}
              onChange={e => set('people', e.target.value)}
              placeholder="e.g. John, Maria"
              className="bg-muted border-none mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground font-mono">LOCATION (optional)</Label>
            <Input
              value={form.location}
              onChange={e => set('location', e.target.value)}
              placeholder="e.g. Cine Callao, Madrid"
              className="bg-muted border-none mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground font-mono">NOTES</Label>
            <Textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Any notes..."
              className="bg-muted border-none mt-1 text-sm resize-none"
              rows={2}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !form.item}
            className="w-full bg-primary text-primary-foreground font-mono"
          >
            {saving ? 'SAVING...' : 'LOG LEISURE'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}