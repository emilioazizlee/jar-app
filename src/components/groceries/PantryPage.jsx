import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { differenceInDays, parseISO } from 'date-fns';
import { Search, Minus, Trash2, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['All', 'Produce', 'Dairy', 'Meat', 'Frozen', 'Pantry', 'Beverages', 'Household', 'Bakery', 'Snacks', 'Other'];

function expiryTag(expiryDate) {
  if (!expiryDate) return null;
  const days = differenceInDays(parseISO(expiryDate), new Date());
  if (days < 0) return { label: 'EXPIRED', color: '#ff2d2d' };
  if (days <= 5) return { label: `${days}d`, color: '#ffd60a' };
  return { label: `${days}d`, color: '#abff4f' };
}

export default function PantryPage({ onAddItem }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');

  const { data: pantry = [], isLoading } = useQuery({
    queryKey: ['pantry'],
    queryFn: () => base44.entities.PantryItem.list('-created_date', 200),
  });

  const active = useMemo(() => pantry.filter(p => !p.is_wasted), [pantry]);
  const filtered = useMemo(() => active.filter(p => {
    if (filterCat !== 'All' && p.category !== filterCat) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !(p.brand || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [active, filterCat, search]);

  const consumeItem = async (item, amount = 1) => {
    const newQty = Math.max(0, (item.quantity || 0) - amount);
    await base44.entities.PantryItem.update(item.id, { quantity: newQty });
    if (newQty === 0) {
      await base44.entities.ShoppingListItem.create({
        name: item.name, brand: item.brand, quantity: 1, unit: item.unit,
        category: item.category, source: 'pantry_low',
      });
    }
    qc.invalidateQueries({ queryKey: ['pantry'] });
    qc.invalidateQueries({ queryKey: ['shopping-list'] });
  };

  const throwOut = async (item) => {
    await base44.entities.PantryItem.update(item.id, { is_wasted: true });
    qc.invalidateQueries({ queryKey: ['pantry'] });
  };

  if (isLoading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pantry..." className="pl-8 bg-muted border-none font-mono text-sm h-8" />
        </div>
        <Button size="sm" onClick={onAddItem} className="h-8 text-xs font-mono bg-secondary text-secondary-foreground">+ ADD ITEM</Button>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${filterCat === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Package className="w-12 h-12 text-muted-foreground/30" />
          <p className="font-mono text-sm text-muted-foreground">Pantry is empty.</p>
          <Button size="sm" onClick={onAddItem} className="font-mono text-xs bg-muted text-foreground">+ ADD ITEMS</Button>
        </div>
      ) : (
        <div className="space-y-1">
          <AnimatePresence>
            {filtered.map(item => {
              const tag = expiryTag(item.expiry_date);
              return (
                <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-border/80 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground text-xs">
                    {item.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium truncate">{item.name}</span>
                      {item.brand && <span className="font-mono text-[10px] text-muted-foreground">{item.brand}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="font-mono text-xs text-secondary font-bold">{item.quantity} {item.unit}</span>
                      {item.category && <span className="font-mono text-[10px] text-muted-foreground">{item.category}</span>}
                      {item.location && <span className="font-mono text-[10px] text-muted-foreground">{item.location}</span>}
                    </div>
                  </div>
                  {tag && (
                    <div className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold" style={{ background: `${tag.color}20`, color: tag.color }}>
                      {tag.label}
                    </div>
                  )}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => consumeItem(item)} className="p-1.5 rounded-lg bg-muted hover:bg-primary/20 hover:text-primary transition-colors">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => throwOut(item)} className="p-1.5 rounded-lg bg-muted hover:bg-destructive/20 hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}