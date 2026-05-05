import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle, ShoppingCart, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ProductAutocomplete from '@/components/shared/ProductAutocomplete';
import { updateProductAfterPurchase, getOrCreateProduct, invalidateProductCache } from '@/lib/productDB';

const UNITS = ['pcs', 'kg', 'g', 'L', 'ml', 'pack', 'box', 'bottle', 'can'];
const CURRENCIES = ['EUR', 'USD', 'AZN', 'RUB'];
const SAVED_STORES = ['Mercadona', 'Carrefour', 'Lidl', 'Aldi', 'Bazar', 'Local Market'];

const CATEGORY_COLORS = {
  Produce: '#abff4f', Dairy: '#4da6ff', Meat: '#ff9f43', Frozen: '#a855f7',
  Pantry: '#ffd60a', Beverages: '#06d6a0', Household: '#7a7a7a', Bakery: '#ff9f43',
  Snacks: '#ff2d2d', Other: '#555',
};

const emptyRow = () => ({ id: Date.now() + Math.random(), name: '', brand: '', brandVisible: false, quantity: '', unit: 'pcs', price_per_unit: '', subtotal: 0, category: 'Other', product_id: null });

export default function ReceiptMode({ open, onClose, onSaved }) {
  const qc = useQueryClient();
  const [store, setStore] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [items, setItems] = useState([emptyRow()]);
  const [actualTotal, setActualTotal] = useState('');
  const [saving, setSaving] = useState(false);
  const nameRefs = useRef({});

  // Top frequent items for chips
  const { data: products = [] } = useQuery({
    queryKey: ['grocery-products'],
    queryFn: () => base44.entities.GroceryProduct.list('-buy_count', 20),
  });

  const topChips = useMemo(() => products.slice(0, 20), [products]);

  const updateItem = (id, k, v) => {
    setItems(prev => prev.map(row => {
      if (row.id !== id) return row;
      const next = { ...row, [k]: v };
      const qty = k === 'quantity' ? Number(v) : Number(next.quantity);
      const price = k === 'price_per_unit' ? Number(v) : Number(next.price_per_unit);
      next.subtotal = (qty && price) ? parseFloat((qty * price).toFixed(2)) : 0;
      return next;
    }));
  };

  const handleProductSelected = (id, product) => {
    setItems(prev => prev.map(row => {
      if (row.id !== id) return row;
      const next = {
        ...row,
        name: product.name,
        brand: product.brand || row.brand,
        unit: product.default_unit || row.unit,
        price_per_unit: product.last_price ? String(product.last_price) : row.price_per_unit,
        category: product.category || row.category,
        product_id: product.id || null,
      };
      const qty = Number(next.quantity) || 1;
      const price = Number(next.price_per_unit);
      next.subtotal = price ? parseFloat((qty * price).toFixed(2)) : 0;
      return next;
    }));
  };

  const addRow = (prefill = null) => {
    const row = emptyRow();
    if (prefill) {
      Object.assign(row, prefill, { subtotal: Number(prefill.quantity || 1) * Number(prefill.price_per_unit || 0) });
    }
    setItems(prev => [...prev, row]);
    setTimeout(() => nameRefs.current[row.id]?.focus(), 50);
  };

  const removeRow = (id) => setItems(prev => prev.filter(r => r.id !== id));

  const handleChipTap = (product) => {
    addRow({
      name: product.name,
      brand: product.brand || '',
      unit: product.default_unit || 'pcs',
      price_per_unit: product.last_price ? String(product.last_price) : '',
      category: product.category || 'Other',
      product_id: product.id,
      quantity: '1',
    });
  };

  const handleRowKeyDown = (e, id, field) => {
    if (e.key === 'Enter' && field === 'subtotal') {
      e.preventDefault();
      addRow();
    }
  };

  const total = useMemo(() => items.reduce((s, r) => s + (r.subtotal || 0), 0), [items]);
  const discrepancy = actualTotal && Math.abs(total - Number(actualTotal)) > 0.05 ? (total - Number(actualTotal)) : null;
  const isValid = store.trim() && items.some(r => r.name.trim());
  const currencySymbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : currency;

  const handleSave = async () => {
    setSaving(true);
    const validItems = items.filter(r => r.name.trim() && Number(r.price_per_unit) > 0);

    const shop = await base44.entities.GroceryShop.create({
      store, date, currency, total,
      actual_receipt_total: actualTotal ? Number(actualTotal) : undefined,
      item_count: validItems.length,
      items: validItems.map(r => ({
        product_id: r.product_id, name: r.name, brand: r.brand,
        quantity: Number(r.quantity) || 1, unit: r.unit,
        price_per_unit: Number(r.price_per_unit), subtotal: r.subtotal, category: r.category,
      })),
    });

    // Only update Items Database (no pantry auto-creation)
    for (const row of validItems) {
      let productId = row.product_id;
      if (!productId) {
        const p = await getOrCreateProduct(row.name, row.brand, row.category);
        productId = p.id;
      }
      await updateProductAfterPurchase(productId, { store, price: Number(row.price_per_unit), unit: row.unit, date });
    }

    // Create spend entry
    await base44.entities.Item.create({
      type: 'spend', title: `Groceries — ${store}`, category: 'groceries',
      amount: total, currency, date,
      description: JSON.stringify({ shop_id: shop.id, store, item_count: validItems.length }),
    });

    invalidateProductCache();
    qc.invalidateQueries({ queryKey: ['grocery-shops'] });
    qc.invalidateQueries({ queryKey: ['grocery-products'] });
    qc.invalidateQueries({ queryKey: ['items'] });
    qc.invalidateQueries({ queryKey: ['items-month'] });
    setSaving(false);
    setItems([emptyRow()]);
    setStore('');
    setActualTotal('');
    onSaved?.();
    onClose();
  };

  const handleClose = () => {
    setItems([emptyRow()]);
    setStore('');
    setActualTotal('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-2xl w-full h-full sm:h-auto max-h-full sm:max-h-[92vh] rounded-none sm:rounded-lg flex flex-col p-0 gap-0">
        {/* Header — compact single row */}
        <div className="flex items-center gap-2 px-3 md:px-4 py-3 border-b border-border shrink-0">
          <ShoppingCart className="w-4 h-4 text-secondary shrink-0" />
          <Input list="stores-list" value={store} onChange={e => setStore(e.target.value)}
            placeholder="Store..." className="flex-1 bg-muted border-none font-mono text-sm h-9" />
          <datalist id="stores-list">{SAVED_STORES.map(s => <option key={s} value={s} />)}</datalist>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-28 md:w-36 bg-muted border-none font-mono text-sm h-9" />
          <select value={currency} onChange={e => setCurrency(e.target.value)} className="bg-muted border-none font-mono text-sm h-9 rounded-md px-2">
            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Quick-add chips */}
        {topChips.length > 0 && (
          <div className="px-4 py-2 border-b border-border/40 overflow-x-auto shrink-0">
            <div className="flex gap-1.5 min-w-max">
              {topChips.map(p => (
                <button key={p.id} onClick={() => handleChipTap(p)}
                  className="flex flex-col items-start px-2.5 py-1.5 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors min-w-[80px] text-left">
                  <span className="font-mono text-xs font-bold leading-tight truncate max-w-[90px]">{p.name}</span>
                  {p.brand && <span className="font-mono text-[9px] text-muted-foreground leading-tight truncate max-w-[90px]">{p.brand}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Item rows */}
        <div className="flex-1 overflow-y-auto px-3 md:px-4 py-3 space-y-2">
          {items.map((row, idx) => (
            <div key={row.id} className="bg-muted/40 rounded-xl p-3 space-y-2 group/row relative">
              {/* Line 1: Category dot + Product name + brand */}
              <div className="flex items-center gap-2">
                <button
                  className="w-3 h-3 rounded-full shrink-0 border border-border/60"
                  style={{ background: CATEGORY_COLORS[row.category] || '#555' }}
                  title={row.category}
                  onClick={() => {
                    const cats = Object.keys(CATEGORY_COLORS);
                    const i = cats.indexOf(row.category);
                    updateItem(row.id, 'category', cats[(i + 1) % cats.length]);
                  }}
                />
                <div className="flex-1 min-w-0">
                  <ProductAutocomplete
                    value={row.name}
                    onChange={v => updateItem(row.id, 'name', v)}
                    onProductSelected={p => handleProductSelected(row.id, p)}
                    mode="groceries"
                    placeholder="Product name..."
                    className="bg-transparent border-none font-mono text-sm h-8 px-0 focus:bg-muted/60 focus:px-2 rounded transition-all w-full"
                    inputRef={el => (nameRefs.current[row.id] = el)}
                  />
                </div>
                {/* Delete always visible on mobile */}
                <button onClick={() => removeRow(row.id)}
                  className="text-muted-foreground hover:text-destructive shrink-0 p-1 active:scale-90 md:opacity-0 md:group-hover/row:opacity-100 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Line 2: Qty + Unit + Price/unit + Subtotal */}
              <div className="flex items-center gap-1.5">
                <Input
                  inputMode="decimal"
                  value={row.quantity}
                  onChange={e => updateItem(row.id, 'quantity', e.target.value)}
                  placeholder="Qty"
                  className="w-14 bg-muted border-none font-mono text-sm h-8 text-center"
                />
                <select value={row.unit} onChange={e => updateItem(row.id, 'unit', e.target.value)}
                  className="bg-muted rounded-md font-mono text-xs h-8 px-1 border-none">
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
                <Input
                  inputMode="decimal"
                  value={row.price_per_unit}
                  onChange={e => updateItem(row.id, 'price_per_unit', e.target.value)}
                  placeholder={`${currencySymbol}/unit`}
                  onKeyDown={e => handleRowKeyDown(e, row.id, 'price')}
                  className="flex-1 bg-muted border-none font-mono text-sm h-8"
                />
                <div
                  className="w-16 text-right font-mono text-sm font-bold shrink-0"
                  style={{ color: row.subtotal > 0 ? '#abff4f' : '#555' }}
                  tabIndex={0}
                  onKeyDown={e => handleRowKeyDown(e, row.id, 'subtotal')}
                >
                  {row.subtotal > 0 ? `${currencySymbol}${row.subtotal.toFixed(2)}` : '—'}
                </div>
              </div>
            </div>
          ))}

          <button onClick={() => addRow()}
            className="w-full py-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors border border-dashed border-border/40 rounded-xl hover:border-primary/40">
            + ADD ROW
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-border space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Total</span>
            <span className="font-mono text-3xl font-bold" style={{ color: '#abff4f' }}>
              {currencySymbol}{total.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-muted-foreground">Match receipt?</span>
            <Input inputMode="decimal" value={actualTotal} onChange={e => setActualTotal(e.target.value)}
              placeholder="0.00" className="w-28 bg-muted border-none font-mono text-sm h-7" />
            {discrepancy !== null && (
              <div className="flex items-center gap-1 text-xs font-mono font-bold" style={{ color: '#ffd60a' }}>
                <AlertTriangle className="w-3 h-3" />
                {discrepancy > 0 ? '+' : ''}{currencySymbol}{discrepancy.toFixed(2)} difference
              </div>
            )}
          </div>
          <Button onClick={handleSave} disabled={saving || !isValid} className="w-full bg-secondary text-secondary-foreground font-mono font-bold h-11">
            {saving ? 'SAVING...' : 'SAVE SHOP'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}