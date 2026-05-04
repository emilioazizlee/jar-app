import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, X, AlertTriangle, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import ProductAutocomplete from '@/components/shared/ProductAutocomplete';
import { updateProductAfterPurchase, getOrCreateProduct } from '@/lib/productDB';
import { invalidateProductCache } from '@/lib/productDB';

const UNITS = ['kg', 'g', 'L', 'ml', 'pcs', 'pack', 'box', 'bottle', 'can'];
const CATEGORIES = ['Produce', 'Dairy', 'Meat', 'Frozen', 'Pantry', 'Beverages', 'Household', 'Bakery', 'Snacks', 'Other'];
const CURRENCIES = ['EUR', 'USD', 'AZN', 'RUB'];
const SAVED_STORES = ['Mercadona', 'Carrefour', 'Lidl', 'Aldi', 'Bazar', 'Local Market'];

const EXPIRY_DEFAULTS = {
  Produce: 7, Dairy: 14, Meat: 5, Frozen: 90, Pantry: 365,
  Beverages: 180, Household: 730, Bakery: 5, Snacks: 60, Other: 30,
};

const emptyRow = () => ({ name: '', brand: '', quantity: 1, unit: 'pcs', price_per_unit: '', subtotal: 0, category: 'Other', product_id: null });

export default function ReceiptMode({ open, onClose, onSaved }) {
  const qc = useQueryClient();
  const [store, setStore] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [items, setItems] = useState([emptyRow()]);
  const [actualTotal, setActualTotal] = useState('');
  const [saving, setSaving] = useState(false);

  const updateItem = (i, k, v) => {
    setItems(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [k]: v };
      const qty = k === 'quantity' ? Number(v) : Number(next[i].quantity);
      const price = k === 'price_per_unit' ? Number(v) : Number(next[i].price_per_unit);
      next[i].subtotal = qty * price;
      return next;
    });
  };

  const handleProductSelected = (i, product) => {
    setItems(prev => {
      const next = [...prev];
      next[i] = {
        ...next[i],
        name: product.name,
        brand: product.brand || next[i].brand,
        unit: product.default_unit || next[i].unit,
        price_per_unit: product.last_price ? String(product.last_price) : next[i].price_per_unit,
        category: product.category || next[i].category,
        product_id: product.id || null,
      };
      const qty = Number(next[i].quantity);
      const price = Number(next[i].price_per_unit);
      next[i].subtotal = qty * price;
      return next;
    });
  };

  const addRow = () => setItems(prev => [...prev, emptyRow()]);
  const removeRow = (i) => setItems(prev => prev.filter((_, j) => j !== i));

  const total = useMemo(() => items.reduce((s, r) => s + (r.subtotal || 0), 0), [items]);
  const discrepancy = actualTotal && Math.abs(total - Number(actualTotal)) > 0.05;
  const isValid = store.trim() && items.some(r => r.name.trim());

  const handleSave = async () => {
    setSaving(true);
    const validItems = items.filter(r => r.name.trim() && Number(r.price_per_unit) > 0);

    // 1. Create GroceryShop record
    const shop = await base44.entities.GroceryShop.create({
      store, date, currency, total, actual_receipt_total: actualTotal ? Number(actualTotal) : undefined,
      item_count: validItems.length,
      items: validItems.map(r => ({
        product_id: r.product_id, name: r.name, brand: r.brand,
        quantity: Number(r.quantity), unit: r.unit,
        price_per_unit: Number(r.price_per_unit), subtotal: r.subtotal, category: r.category,
      })),
    });

    // 2. Update pantry + product DB for each item
    for (const row of validItems) {
      let productId = row.product_id;
      if (!productId) {
        const p = await getOrCreateProduct(row.name, row.brand, row.category);
        productId = p.id;
      }
      await updateProductAfterPurchase(productId, { store, price: Number(row.price_per_unit), unit: row.unit, date });

      const expiryDays = EXPIRY_DEFAULTS[row.category] || 30;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiryDays);

      const existing = await base44.entities.PantryItem.list().then(all =>
        all.find(p => p.name.toLowerCase() === row.name.toLowerCase() && !p.is_wasted)
      );
      if (existing) {
        await base44.entities.PantryItem.update(existing.id, {
          quantity: (existing.quantity || 0) + Number(row.quantity),
          expiry_date: format(expiryDate, 'yyyy-MM-dd'),
          purchase_price: Number(row.price_per_unit),
          shop_id: shop.id,
        });
      } else {
        await base44.entities.PantryItem.create({
          product_id: productId, name: row.name, brand: row.brand,
          category: row.category, quantity: Number(row.quantity), unit: row.unit,
          expiry_date: format(expiryDate, 'yyyy-MM-dd'),
          purchase_price: Number(row.price_per_unit), currency, shop_id: shop.id,
        });
      }
    }

    // 3. Create spend entry
    await base44.entities.Item.create({
      type: 'spend', title: `Groceries — ${store}`, category: 'groceries',
      amount: total, currency, date,
      description: JSON.stringify({ shop_id: shop.id, store, item_count: validItems.length }),
    });

    invalidateProductCache();
    qc.invalidateQueries({ queryKey: ['grocery-shops'] });
    qc.invalidateQueries({ queryKey: ['pantry'] });
    qc.invalidateQueries({ queryKey: ['items'] });
    qc.invalidateQueries({ queryKey: ['items-spends'] });
    qc.invalidateQueries({ queryKey: ['items-month'] });
    setSaving(false);
    setItems([emptyRow()]);
    setStore('');
    setActualTotal('');
    onSaved?.();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="mono-header text-sm text-secondary flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" /> NEW SHOP
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="font-mono text-[10px] text-muted-foreground">STORE</Label>
              <div className="mt-1">
                <Input list="stores-list" value={store} onChange={e => setStore(e.target.value)} className="bg-muted border-none font-mono text-sm" placeholder="Mercadona..." />
                <datalist id="stores-list">{SAVED_STORES.map(s => <option key={s} value={s} />)}</datalist>
              </div>
            </div>
            <div>
              <Label className="font-mono text-[10px] text-muted-foreground">DATE</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-muted border-none mt-1 font-mono text-sm" />
            </div>
            <div>
              <Label className="font-mono text-[10px] text-muted-foreground">CURRENCY</Label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full bg-muted border-none mt-1 font-mono text-sm h-9 rounded-md px-3">
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-12 gap-1 px-1 mb-1">
              <span className="col-span-3 font-mono text-[10px] text-muted-foreground">PRODUCT</span>
              <span className="col-span-2 font-mono text-[10px] text-muted-foreground">BRAND</span>
              <span className="col-span-1 font-mono text-[10px] text-muted-foreground">QTY</span>
              <span className="col-span-1 font-mono text-[10px] text-muted-foreground">UNIT</span>
              <span className="col-span-2 font-mono text-[10px] text-muted-foreground">PRICE/UNIT</span>
              <span className="col-span-2 font-mono text-[10px] text-muted-foreground">CATEGORY</span>
              <span className="col-span-1" />
            </div>
            <div className="space-y-1.5">
              {items.map((row, i) => (
                <div key={i} className="grid grid-cols-12 gap-1 items-center">
                  <ProductAutocomplete value={row.name} onChange={v => updateItem(i, 'name', v)}
                    onProductSelected={p => handleProductSelected(i, p)} mode="groceries"
                    placeholder="Product..." className="col-span-3 bg-muted border-none font-mono text-sm h-8" />
                  <Input value={row.brand} onChange={e => updateItem(i, 'brand', e.target.value)} placeholder="Brand" className="col-span-2 bg-muted border-none font-mono text-sm h-8" />
                  <Input type="number" value={row.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} className="col-span-1 bg-muted border-none font-mono text-sm h-8" min={0} step={0.1} />
                  <select value={row.unit} onChange={e => updateItem(i, 'unit', e.target.value)} className="col-span-1 bg-muted rounded-md font-mono text-xs h-8 px-1">
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                  <Input type="number" value={row.price_per_unit} onChange={e => updateItem(i, 'price_per_unit', e.target.value)} placeholder="0.00" step="0.01" className="col-span-2 bg-muted border-none font-mono text-sm h-8" />
                  <select value={row.category} onChange={e => updateItem(i, 'category', e.target.value)} className="col-span-2 bg-muted rounded-md font-mono text-xs h-8 px-1">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <div className="col-span-1 flex items-center gap-1">
                    {row.subtotal > 0 && <span className="font-mono text-[10px] text-secondary">{row.subtotal.toFixed(2)}</span>}
                    <button onClick={() => removeRow(i)} className="text-muted-foreground hover:text-destructive transition-colors ml-auto"><X className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addRow} className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-primary transition-colors mt-2">
              <Plus className="w-3 h-3" /> ADD ROW
            </button>
          </div>

          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-muted-foreground">CALCULATED TOTAL</span>
              <span className="font-mono text-2xl font-bold text-secondary">{currency === 'EUR' ? '€' : currency}{total.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-muted-foreground">Receipt total (optional)</span>
              <Input type="number" value={actualTotal} onChange={e => setActualTotal(e.target.value)} placeholder="0.00" step="0.01" className="w-32 bg-muted border-none font-mono text-sm h-7" />
              {discrepancy && <div className="flex items-center gap-1 text-xs text-destructive font-mono"><AlertTriangle className="w-3 h-3" />Δ€{Math.abs(total - Number(actualTotal)).toFixed(2)}</div>}
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving || !isValid} className="w-full bg-secondary text-secondary-foreground font-mono">
            {saving ? 'SAVING...' : 'SAVE SHOP'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}