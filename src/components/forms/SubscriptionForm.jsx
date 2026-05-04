import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { SUBSCRIPTION_CATALOG, CURRENCIES } from '@/lib/constants';
import { motion } from 'framer-motion';
import { Search, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export default function SubscriptionForm({ open, onClose, onSaved }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState('catalog');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: '',
    amount: '',
    currency: 'EUR',
    billing_cycle: 'monthly',
    next_renewal: format(new Date(), 'yyyy-MM-dd'),
    note: '',
  });

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const filteredCatalog = useMemo(() => {
    if (!search) return SUBSCRIPTION_CATALOG;
    const result = {};
    Object.entries(SUBSCRIPTION_CATALOG).forEach(([cat, services]) => {
      const filtered = services.filter(s => s.toLowerCase().includes(search.toLowerCase()));
      if (filtered.length) result[cat] = filtered;
    });
    return result;
  }, [search]);

  const selectService = (name, category) => {
    setForm(prev => ({ ...prev, title: name, category }));
    setStep('details');
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await base44.entities.Item.create({
      type: 'subscription',
      title: form.title,
      category: form.category,
      amount: form.amount ? Number(form.amount) : undefined,
      currency: form.currency,
      billing_cycle: form.billing_cycle,
      next_renewal: form.next_renewal,
      note: form.note || undefined,
      date: format(new Date(), 'yyyy-MM-dd'),
      is_active: true,
    });
    queryClient.invalidateQueries({ queryKey: ['items'] });
    queryClient.invalidateQueries({ queryKey: ['items-month'] });
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="mono-header text-sm text-blue-400">
            {step === 'catalog' ? 'ADD SUBSCRIPTION' : (
              <button onClick={() => setStep('catalog')} className="flex items-center gap-2 hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />{form.title}
              </button>
            )}
          </DialogTitle>
        </DialogHeader>

        {step === 'catalog' ? (
          <div className="space-y-4 pt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-muted border-none pl-10"
                autoFocus
              />
            </div>

            {Object.entries(filteredCatalog).map(([cat, services]) => (
              <div key={cat}>
                <p className="mono-header text-[10px] text-muted-foreground mb-2">{cat}</p>
                <div className="flex flex-wrap gap-1.5">
                  {services.map(service => (
                    <motion.button
                      key={service}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => selectService(service, cat)}
                      className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border text-xs font-mono text-muted-foreground hover:text-foreground hover:border-blue-400/40 transition-all"
                    >
                      {service}
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={() => { setForm(prev => ({ ...prev, title: '', category: 'Custom' })); setStep('details'); }}
              className="w-full py-3 rounded-xl border border-dashed border-border text-sm font-mono text-muted-foreground hover:text-foreground hover:border-blue-400/40 transition-all"
            >
              + Custom Subscription
            </button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-xs text-muted-foreground font-mono">SERVICE NAME</Label>
              <Input value={form.title} onChange={e => update('title', e.target.value)} className="bg-muted border-none mt-1 font-medium" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground font-mono">COST</Label>
                <Input type="number" value={form.amount} onChange={e => update('amount', e.target.value)} className="bg-muted border-none mt-1 font-mono text-lg" step="0.01" placeholder="0.00" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground font-mono">CURRENCY</Label>
                <Select value={form.currency} onValueChange={v => update('currency', v)}>
                  <SelectTrigger className="bg-muted border-none mt-1 font-mono"><SelectValue /></SelectTrigger>
                  <SelectContent>{CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground font-mono">BILLING CYCLE</Label>
                <Select value={form.billing_cycle} onValueChange={v => update('billing_cycle', v)}>
                  <SelectTrigger className="bg-muted border-none mt-1 font-mono"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground font-mono">NEXT RENEWAL</Label>
                <Input type="date" value={form.next_renewal} onChange={e => update('next_renewal', e.target.value)} className="bg-muted border-none mt-1 font-mono" lang="en" />
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving || !form.title.trim()} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-mono">
              {saving ? 'SAVING...' : 'ADD SUBSCRIPTION'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}