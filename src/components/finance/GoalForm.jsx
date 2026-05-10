import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { CURRENCIES } from '@/lib/constants';

const GOAL_ICONS = ['✈️', '🏠', '💻', '🎸', '🏋️', '🎓', '💍', '🚗', '📱', '🎯', '💰', '🌴'];

export default function GoalForm({ open, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', target_amount: '', saved_amount: '', currency: 'EUR', target_date: '', icon: '🎯' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.title || !form.target_amount) return;
    setSaving(true);
    const me = await base44.auth.me();
    await base44.entities.FinanceGoal.create({
      ...form,
      target_amount: Number(form.target_amount),
      saved_amount: Number(form.saved_amount) || 0,
      created_by: me.email,
    });
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md w-full rounded-lg">
        <DialogHeader>
          <DialogTitle className="mono-header text-sm text-primary">NEW SAVINGS GOAL</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <div>
            <Label className="text-xs text-muted-foreground font-mono">ICON</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {GOAL_ICONS.map(ic => (
                <button
                  key={ic}
                  onClick={() => set('icon', ic)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${form.icon === ic ? 'bg-primary/20 border border-primary' : 'bg-muted hover:bg-muted/80'}`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground font-mono">GOAL NAME</Label>
            <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Trip to Japan" className="bg-muted border-none mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground font-mono">TARGET AMOUNT</Label>
              <Input inputMode="decimal" type="text" value={form.target_amount} onChange={e => set('target_amount', e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.00" className="bg-muted border-none mt-1 font-mono" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground font-mono">ALREADY SAVED</Label>
              <Input inputMode="decimal" type="text" value={form.saved_amount} onChange={e => set('saved_amount', e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.00" className="bg-muted border-none mt-1 font-mono" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground font-mono">CURRENCY</Label>
              <Select value={form.currency} onValueChange={v => set('currency', v)}>
                <SelectTrigger className="bg-muted border-none mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground font-mono">TARGET DATE</Label>
              <Input type="date" value={form.target_date} onChange={e => set('target_date', e.target.value)} className="bg-muted border-none mt-1" />
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving || !form.title || !form.target_amount} className="w-full bg-primary text-primary-foreground font-mono">
            {saving ? 'SAVING...' : 'CREATE GOAL'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}