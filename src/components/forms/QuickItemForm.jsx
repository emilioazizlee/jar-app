import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { CURRENCIES } from '@/lib/constants';
import { format } from 'date-fns';

const TYPE_CONFIG = {
  payment: { fields: ['amount', 'currency', 'date', 'note'], accent: 'text-orange-400' },
  meeting: { fields: ['date', 'description', 'note'], accent: 'text-purple-400' },
  note: { fields: ['description', 'tags'], accent: 'text-gray-400' },
  goal: { fields: ['deadline', 'description', 'progress'], accent: 'text-red-400' },
  contact: { fields: ['contact_email', 'contact_phone', 'contact_company'], accent: 'text-emerald-400' },
};

export default function QuickItemForm({ open, onClose, onSaved, itemType }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const config = TYPE_CONFIG[itemType] || { fields: ['note'], accent: 'text-foreground' };
  const [form, setForm] = useState({
    title: '',
    amount: '',
    currency: 'EUR',
    date: format(new Date(), 'yyyy-MM-dd'),
    deadline: '',
    description: '',
    note: '',
    progress: 0,
    contact_email: '',
    contact_phone: '',
    contact_company: '',
  });

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const data = {
      type: itemType,
      title: form.title,
      date: form.date,
    };
    if (form.amount) data.amount = Number(form.amount);
    if (form.currency) data.currency = form.currency;
    if (form.deadline) data.deadline = form.deadline;
    if (form.description) data.description = form.description;
    if (form.note) data.note = form.note;
    if (form.progress) data.progress = form.progress;
    if (itemType === 'contact') {
      data.contact_info = {
        email: form.contact_email,
        phone: form.contact_phone,
        company: form.contact_company,
      };
    }
    await base44.entities.Item.create(data);
    queryClient.invalidateQueries({ queryKey: ['items'] });
    queryClient.invalidateQueries({ queryKey: ['items-month'] });
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className={`mono-header text-sm ${config.accent}`}>
            NEW {itemType.toUpperCase()}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Input
            placeholder={`${itemType} title...`}
            value={form.title}
            onChange={e => update('title', e.target.value)}
            className="bg-muted border-none text-lg font-medium"
            autoFocus
          />

          {config.fields.includes('amount') && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground font-mono">AMOUNT</Label>
                <Input type="number" value={form.amount} onChange={e => update('amount', e.target.value)} className="bg-muted border-none mt-1 font-mono" step="0.01" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground font-mono">CURRENCY</Label>
                <Select value={form.currency} onValueChange={v => update('currency', v)}>
                  <SelectTrigger className="bg-muted border-none mt-1 font-mono"><SelectValue /></SelectTrigger>
                  <SelectContent>{CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          )}

          {config.fields.includes('date') && (
            <div>
              <Label className="text-xs text-muted-foreground font-mono">DATE</Label>
              <Input type="date" value={form.date} onChange={e => update('date', e.target.value)} className="bg-muted border-none mt-1 font-mono" />
            </div>
          )}

          {config.fields.includes('deadline') && (
            <div>
              <Label className="text-xs text-muted-foreground font-mono">DEADLINE</Label>
              <Input type="date" value={form.deadline} onChange={e => update('deadline', e.target.value)} className="bg-muted border-none mt-1 font-mono" />
            </div>
          )}

          {config.fields.includes('description') && (
            <div>
              <Label className="text-xs text-muted-foreground font-mono">DESCRIPTION</Label>
              <Textarea value={form.description} onChange={e => update('description', e.target.value)} className="bg-muted border-none mt-1" rows={3} />
            </div>
          )}

          {config.fields.includes('note') && (
            <div>
              <Label className="text-xs text-muted-foreground font-mono">NOTE</Label>
              <Textarea value={form.note} onChange={e => update('note', e.target.value)} className="bg-muted border-none mt-1" rows={2} />
            </div>
          )}

          {config.fields.includes('contact_email') && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground font-mono">EMAIL</Label>
                <Input value={form.contact_email} onChange={e => update('contact_email', e.target.value)} className="bg-muted border-none mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground font-mono">PHONE</Label>
                <Input value={form.contact_phone} onChange={e => update('contact_phone', e.target.value)} className="bg-muted border-none mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground font-mono">COMPANY</Label>
                <Input value={form.contact_company} onChange={e => update('contact_company', e.target.value)} className="bg-muted border-none mt-1" />
              </div>
            </div>
          )}

          <Button onClick={handleSave} disabled={saving || !form.title.trim()} className="w-full bg-primary text-primary-foreground font-mono">
            {saving ? 'SAVING...' : 'SAVE'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}