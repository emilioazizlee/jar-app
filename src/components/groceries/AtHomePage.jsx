import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, Minus, Trash2, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

// Only shows items explicitly tracked (flagged in Items DB via track_at_home on PantryItem)

export default function AtHomePage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: pantry = [], isLoading } = useQuery({
    queryKey: ['pantry'],
    queryFn: () => base44.entities.PantryItem.list('-created_date', 200),
  });

  // Only show items explicitly added by user (not auto-created by receipt)
  // We filter to non-wasted items
  const active = useMemo(() => pantry.filter(p => !p.is_wasted), [pantry]);
  const filtered = useMemo(() => active.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [active, search]);

  const consumeItem = async (item) => {
    const newQty = Math.max(0, (item.quantity || 1) - 1);
    await base44.entities.PantryItem.update(item.id, { quantity: newQty });
    if (newQty === 0) {
      await base44.entities.ShoppingListItem.create({
        name: item.name, brand: item.brand, quantity: 1, unit: item.unit || 'pcs',
        category: item.category, source: 'pantry_low',
      });
    }
    qc.invalidateQueries({ queryKey: ['pantry'] });
  };

  const removeItem = async (item) => {
    await base44.entities.PantryItem.update(item.id, { is_wasted: true });
    qc.invalidateQueries({ queryKey: ['pantry'] });
  };

  if (isLoading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="bg-muted/30 border border-border/40 rounded-xl p-4 text-center space-y-1">
        <Home className="w-5 h-5 text-muted-foreground mx-auto" />
        <p className="font-mono text-xs text-muted-foreground">
          Track specific items you keep stocked at home.<br />
          Flag items as "Track at home" in the Items Database to have them appear here.
        </p>
      </div>

      {active.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-8 bg-muted border-none font-mono text-sm h-8" />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Home className="w-12 h-12 text-muted-foreground/20" />
          <p className="font-mono text-sm text-muted-foreground">Nothing tracked at home yet.</p>
          <p className="font-mono text-xs text-muted-foreground/60">Go to Items Database → expand a product → "Track at home"</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          <AnimatePresence>
            {filtered.map(item => (
              <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl group">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                  {item.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-sm font-medium">{item.name}</span>
                  {item.brand && <span className="font-mono text-[10px] text-muted-foreground ml-2">{item.brand}</span>}
                  <div className="font-mono text-xs text-primary font-bold mt-0.5">{item.quantity} {item.unit}</div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => consumeItem(item)} className="p-1.5 rounded-lg bg-muted hover:bg-primary/20 hover:text-primary transition-colors" title="Used one">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => removeItem(item)} className="p-1.5 rounded-lg bg-muted hover:bg-destructive/20 hover:text-destructive transition-colors" title="Remove">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}