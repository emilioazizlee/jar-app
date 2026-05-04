import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { CURRENCIES } from '@/lib/constants';
import { format } from 'date-fns';
import { Plus, X, ShoppingCart } from 'lucide-react';
import BrandInput from '@/components/brand/BrandInput';

const UNITS = ['pcs', 'kg', 'g', 'L', 'ml', 'pack'];

const QUICK_ITEMS = [
  { name: 'Bread', unit: 'pcs', qty: 1 },
  { name: 'Milk', unit: 'L', qty: 1 },
  { name: 'Eggs', unit: 'pcs', qty: 12 },
  { name: 'Chicken', unit: 'kg', qty: 1 },
  { name: 'Beef', unit: 'kg', qty: 0.5 },
  { name: 'Vegetables', unit: 'kg', qty: 0.5 },
  { name: 'Fruit', unit: 'kg', qty: 1 },
  { name: 'Pasta', unit: 'pack', qty: 1 },
  { name: 'Rice', unit: 'kg', qty: 1 },
  { name: 'Cheese', unit: 'kg', qty: 0.2 },
  { name: 'Coffee', unit: 'pack', qty: 1 },
  { name: 'Water', unit: 'L', qty: 6 },
];

const emptyRow = () => ({ name: '', brand: '', qty: 1, unit: 'pcs', price_per_unit: '', subtotal: 0 });

export default function GroceriesForm({ open, onClose, onSaved, category = 'groceries' }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [items, setItems] = useState([emptyRow()]);

  const updateItem = (i, k, v) => {
    setItems(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [k]: v };
      const qty = k === 'qty' ? Number(v) : Number(next[i].qty);
      const price = k === 'price_per_unit' ? Number(v) : Number(next[i].price_per_unit);
      next[i].subtotal = qty * price;
      return next;
    });
  };

  const addRow = () => setItems(prev => [...prev, emptyRow()]);
  const removeRow = (i) => setItems(prev => prev.filter((_, j) => j !== i));

  const addQuick = (qi) => {
    setItems(prev => [...prev.filter(r => r.name !== ''), { name: qi.name, qty: qi.qty, unit: qi.unit, price_per_unit: '', subtotal: 0 }]);
  };

  const total = items.reduce((sum, r) => sum + (r.subtotal || 0), 0);

  const isValid = items.some(r => r.name.trim());

  const LABEL_MAP = { groceries: 'Groceries', food_out: 'Food Out', pharmacy: 'Pharmacy' };

  const handleSave = async () => {
    setSaving(true);
    const validItems = items.filter(r => r.name.trim());
    const title = store ? `${LABEL_MAP[category] || 'Groceries'} — ${store}` : (LABEL_MAP[category] || 'Groceries');

    await base44.entities.Item.create({
      type: 'spend',
      title,
      category,
      amount: total || undefined,
      currency,
      date,
      note: store || undefined,
      subtasks: validItems.map(r => ({
        text: `${r.brand ? r.brand + ' ' : ''}${r.name} × ${r.qty}${r.unit} @ ${r.price_per_unit || '?'}`,
        done: false,
        // Store structured data in text for insights parsing
      })),
      // Store itemized data in description as JSON
      description: JSON.stringify({ store, items: validItems }),
    });

    queryClient.invalidateQueries({ queryKey: ['items'] });
    queryClient.invalidateQueries({ queryKey: ['items-spends'] });
    queryClient.invalidateQueries({ queryKey: ['items-month'] });
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="mono-header text-sm text-secondary flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" /> {LABEL_MAP[category] || 'GROCERIES'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Store + date + currency */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground font-mono">STORE (optional)</Label>
              <Input value={store} onChange={e => setStore(e.target.value)} className="bg-muted border-none mt-1 font-mono text-sm" placeholder="Mercadona..." />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground font-mono">DATE</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-muted border-none mt-1 font-mono text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground font-mono">CURRENCY</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="bg-muted border-none mt-1 font-mono text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick add chips */}
          <div>
            <Label className="text-xs text-muted-foreground font-mono">QUICK ADD</Label>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {QUICK_ITEMS.map(qi => (
                <button
                  key={qi.name}
                  onClick={() => addQuick(qi)}
                  className="px-2.5 py-1 rounded-lg bg-muted border border-border font-mono text-xs text-muted-foreground hover:text-secondary hover:border-secondary/40 transition-all"
                >
                  {qi.name}
                </button>
              ))}
            </div>
          </div>

          {/* Items table */}
          <div>
            <Label className="text-xs text-muted-foreground font-mono">ITEMS</Label>
            <div className="mt-2 space-y-2">
              {/* Header */}
              <div className="grid grid-cols-12 gap-1 px-1">
                <span className="col-span-3 font-mono text-[10px] text-muted-foreground">PRODUCT</span>
                <span className="col-span-3 font-mono text-[10px] text-muted-foreground">BRAND</span>
                <span className="col-span-1 font-mono text-[10px] text-muted-foreground">QTY</span>
                <span className="col-span-1 font-mono text-[10px] text-muted-foreground">UNIT</span>
                <span className="col-span-2 font-mono text-[10px] text-muted-foreground">PRICE</span>
                <span className="col-span-1 font-mono text-[10px] text-muted-foreground text-right">SUB</span>
                <span className="col-span-1" />
              </div>

              {items.map((row, i) => (
                <div key={i} className="grid grid-cols-12 gap-1 items-center">
                  <Input
                    value={row.name}
                    onChange={e => updateItem(i, 'name', e.target.value)}
                    className="col-span-3 bg-muted border-none font-mono text-sm h-8"
                    placeholder="Product..."
                  />
                  <BrandInput
                    value={row.brand || ''}
                    onChange={v => updateItem(i, 'brand', v)}
                    placeholder="Brand..."
                    className="col-span-3 bg-muted border-none font-mono text-sm h-8"
                  />
                  <Input
                    type="number"
                    value={row.qty}
                    onChange={e => updateItem(i, 'qty', e.target.value)}
                    className="col-span-1 bg-muted border-none font-mono text-sm h-8"
                    min={0} step={0.1}
                  />
                  <Select value={row.unit} onValueChange={v => updateItem(i, 'unit', v)}>
                    <SelectTrigger className="col-span-1 bg-muted border-none font-mono text-xs h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={row.price_per_unit}
                    onChange={e => updateItem(i, 'price_per_unit', e.target.value)}
                    className="col-span-2 bg-muted border-none font-mono text-sm h-8"
                    step="0.01" placeholder="0.00"
                  />
                  <span className="col-span-1 font-mono text-xs text-secondary text-right">
                    {row.subtotal > 0 ? row.subtotal.toFixed(2) : '—'}
                  </span>
                  <button onClick={() => removeRow(i)} className="col-span-1 flex justify-center text-muted-foreground hover:text-destructive transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              <button
                onClick={addRow}
                className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-primary transition-colors mt-1"
              >
                <Plus className="w-3 h-3" /> ADD ROW
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="font-mono text-sm text-muted-foreground">TOTAL</span>
            <span className="font-mono text-2xl font-bold text-secondary">{currency === 'EUR' ? '€' : currency}{total.toFixed(2)}</span>
          </div>

          <Button onClick={handleSave} disabled={saving || !isValid} className="w-full bg-secondary text-secondary-foreground font-mono">
            {saving ? 'SAVING...' : 'SAVE GROCERIES'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}