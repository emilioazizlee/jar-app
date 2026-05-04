import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Store, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StoresPage() {
  const [expanded, setExpanded] = useState(null);

  const { data: shops = [] } = useQuery({
    queryKey: ['grocery-shops'],
    queryFn: () => base44.entities.GroceryShop.list('-date', 200),
  });
  const { data: products = [] } = useQuery({
    queryKey: ['grocery-products'],
    queryFn: () => base44.entities.GroceryProduct.list(),
  });

  const storeStats = useMemo(() => {
    const map = {};
    shops.forEach(s => {
      if (!map[s.store]) map[s.store] = { name: s.store, totalSpent: 0, shopCount: 0, shopList: [] };
      map[s.store].totalSpent += s.total || 0;
      map[s.store].shopCount += 1;
      map[s.store].shopList.push(s);
    });
    // cheapest items per store
    products.forEach(p => {
      if (p.cheapest_store && map[p.cheapest_store]) {
        map[p.cheapest_store].cheapestItems = (map[p.cheapest_store].cheapestItems || 0) + 1;
      }
    });
    return Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [shops, products]);

  return (
    <div className="space-y-3">
      {storeStats.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground font-mono text-sm">No stores yet. Log a shop to see them here.</div>
      ) : storeStats.map(store => (
        <div key={store.name} className="bg-card border border-border rounded-xl overflow-hidden">
          <button className="w-full flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors" onClick={() => setExpanded(expanded === store.name ? null : store.name)}>
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Store className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-mono text-sm font-bold">{store.name}</div>
              <div className="font-mono text-xs text-muted-foreground">{store.shopCount} shops</div>
            </div>
            <div className="text-right mr-3">
              <div className="font-mono text-lg font-bold text-secondary">€{store.totalSpent.toFixed(2)}</div>
              {store.cheapestItems > 0 && (
                <div className="flex items-center gap-1 justify-end font-mono text-[10px] text-primary">
                  <TrendingDown className="w-2.5 h-2.5" />{store.cheapestItems} cheapest
                </div>
              )}
            </div>
            {expanded === store.name ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
          <AnimatePresence>
            {expanded === store.name && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="border-t border-border p-4 space-y-2">
                  <p className="font-mono text-[10px] text-muted-foreground mb-2">RECENT SHOPS</p>
                  {store.shopList.slice(0, 5).map(sh => (
                    <div key={sh.id} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                      <span className="font-mono text-xs text-muted-foreground">{sh.date}</span>
                      <span className="font-mono text-xs">{(sh.items || []).length} items</span>
                      <span className="font-mono text-sm font-bold text-secondary">€{(sh.total || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}