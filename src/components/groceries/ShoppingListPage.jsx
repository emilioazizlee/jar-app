import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Check, Plus, Trash2, Store, Split } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ProductAutocomplete from '@/components/shared/ProductAutocomplete';
import { motion, AnimatePresence } from 'framer-motion';

const UNITS = ['kg', 'g', 'L', 'ml', 'pcs', 'pack', 'box', 'bottle', 'can'];

export default function ShoppingListPage({ onOpenReceiptMode }) {
  const qc = useQueryClient();
  const [splitByStore, setSplitByStore] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', brand: '', quantity: 1, unit: 'pcs', notes: '' });

  const { data: list = [] } = useQuery({
    queryKey: ['shopping-list'],
    queryFn: () => base44.entities.ShoppingListItem.list('-created_date', 200),
  });

  const unchecked = useMemo(() => list.filter(i => !i.is_checked), [list]);
  const checked = useMemo(() => list.filter(i => i.is_checked), [list]);
  const totalEstimated = useMemo(() => unchecked.reduce((s, i) => s + ((i.estimated_price || 0) * (i.quantity || 1)), 0), [unchecked]);

  const toggle = async (item) => {
    await base44.entities.ShoppingListItem.update(item.id, { is_checked: !item.is_checked });
    qc.invalidateQueries({ queryKey: ['shopping-list'] });
  };

  const remove = async (id) => {
    await base44.entities.ShoppingListItem.delete(id);
    qc.invalidateQueries({ queryKey: ['shopping-list'] });
  };

  const addItem = async () => {
    if (!newItem.name.trim()) return;
    await base44.entities.ShoppingListItem.create({ ...newItem, source: 'manual', is_checked: false });
    setNewItem({ name: '', brand: '', quantity: 1, unit: 'pcs', notes: '' });
    setAdding(false);
    qc.invalidateQueries({ queryKey: ['shopping-list'] });
  };

  const clearChecked = async () => {
    await Promise.all(checked.map(i => base44.entities.ShoppingListItem.delete(i.id)));
    qc.invalidateQueries({ queryKey: ['shopping-list'] });
  };

  const byStore = useMemo(() => {
    const map = {};
    unchecked.forEach(i => {
      const store = i.best_store || 'Any Store';
      if (!map[store]) map[store] = [];
      map[store].push(i);
    });
    return map;
  }, [unchecked]);

  const byCategory = useMemo(() => {
    const map = {};
    unchecked.forEach(i => {
      const cat = i.category || 'Other';
      if (!map[cat]) map[cat] = [];
      map[cat].push(i);
    });
    return map;
  }, [unchecked]);

  const groups = splitByStore ? byStore : byCategory;

  const renderItem = (item) => (
    <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
      <button onClick={() => toggle(item)}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${item.is_checked ? 'bg-primary border-primary' : 'border-border hover:border-primary'}`}>
        {item.is_checked && <Check className="w-3 h-3 text-primary-foreground" />}
      </button>
      <div className="flex-1 min-w-0">
        <span className={`font-mono text-sm ${item.is_checked ? 'line-through text-muted-foreground' : ''}`}>{item.name}</span>
        {item.brand && <span className="font-mono text-[10px] text-muted-foreground ml-2">{item.brand}</span>}
      </div>
      <span className="font-mono text-xs text-muted-foreground shrink-0">{item.quantity} {item.unit}</span>
      {item.estimated_price && <span className="font-mono text-xs text-secondary shrink-0">~€{(item.estimated_price * item.quantity).toFixed(2)}</span>}
      {item.best_store && !splitByStore && <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">{item.best_store}</span>}
      {item.source !== 'manual' && <span className="font-mono text-[10px] text-muted-foreground/50 shrink-0">{item.source?.replace('_', ' ')}</span>}
      <button onClick={() => remove(item.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-mono text-sm font-bold">{unchecked.length} items</span>
          {totalEstimated > 0 && <span className="font-mono text-xs text-secondary ml-3">~€{totalEstimated.toFixed(2)}</span>}
        </div>
        <div className="flex gap-2">
          {checked.length > 0 && <Button size="sm" variant="ghost" onClick={clearChecked} className="h-7 text-xs font-mono text-muted-foreground">Clear Checked</Button>}
          <button onClick={() => setSplitByStore(s => !s)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${splitByStore ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            <Split className="w-3 h-3" />Split by Store
          </button>
          <Button size="sm" onClick={() => setAdding(a => !a)} className="h-7 text-xs font-mono bg-muted text-foreground"><Plus className="w-3 h-3 mr-1" />Add</Button>
          <Button size="sm" onClick={onOpenReceiptMode} className="h-7 text-xs font-mono bg-secondary text-secondary-foreground"><Store className="w-3 h-3 mr-1" />Start Shop</Button>
        </div>
      </div>

      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-muted rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <ProductAutocomplete value={newItem.name} onChange={v => setNewItem(d => ({ ...d, name: v }))}
                onProductSelected={p => setNewItem(d => ({ ...d, name: p.name, brand: p.brand || d.brand, unit: p.default_unit || d.unit }))}
                mode="groceries" placeholder="Product name..." className="bg-background border-none font-mono text-sm h-8" />
              <Input value={newItem.brand} onChange={e => setNewItem(d => ({ ...d, brand: e.target.value }))} placeholder="Brand (optional)" className="bg-background border-none font-mono text-sm h-8" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input type="number" value={newItem.quantity} onChange={e => setNewItem(d => ({ ...d, quantity: Number(e.target.value) }))} className="bg-background border-none font-mono text-sm h-8" min={0.1} step={0.1} />
              <select value={newItem.unit} onChange={e => setNewItem(d => ({ ...d, unit: e.target.value }))} className="bg-background border border-input rounded-md font-mono text-sm h-8 px-2">
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
              <Button size="sm" onClick={addItem} className="h-8 font-mono bg-secondary text-secondary-foreground">ADD</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {unchecked.length === 0 && !adding && (
        <div className="text-center py-12 text-muted-foreground font-mono text-sm">Shopping list is empty. Great job!</div>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {Object.entries(groups).map(([group, items]) => (
            <div key={group}>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2 px-1">{group}</p>
              <div className="bg-card border border-border rounded-xl px-4">
                {items.map(renderItem)}
              </div>
            </div>
          ))}
        </AnimatePresence>
      </div>

      {checked.length > 0 && (
        <div>
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2 px-1">CHECKED ({checked.length})</p>
          <div className="bg-card border border-border/40 rounded-xl px-4 opacity-50">
            {checked.map(renderItem)}
          </div>
        </div>
      )}
    </div>
  );
}