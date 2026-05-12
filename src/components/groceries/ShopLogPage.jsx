import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Store, Calendar, Package, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

async function linkExistingShops(shops, qc) {
  const unlinked = shops.filter(s => !s.linked_spend_id && s.total > 0);
  if (!unlinked.length) return;
  for (const shop of unlinked) {
    const linkedSpend = await base44.entities.Item.create({
      type: 'spend',
      title: `Groceries — ${shop.store}`,
      category: 'groceries',
      amount: shop.total,
      currency: shop.currency || 'EUR',
      date: shop.date,
      description: JSON.stringify({ shop_id: shop.id, store: shop.store, item_count: shop.item_count || 0, retroactive: true }),
    });
    await base44.entities.GroceryShop.update(shop.id, { linked_spend_id: linkedSpend.id });
  }
  qc.invalidateQueries({ queryKey: ['grocery-shops'] });
  qc.invalidateQueries({ queryKey: ['items'] });
}

function ShopCard({ shop, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button className="w-full flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors" onClick={() => setExpanded(e => !e)}>
        <Store className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="flex-1 text-left">
          <div className="font-mono text-sm font-bold">{shop.store}</div>
          <div className="font-mono text-xs text-muted-foreground">{shop.date} · {shop.item_count || (shop.items || []).length} items</div>
        </div>
        <div className="text-right mr-4">
          <div className="font-mono text-lg font-bold text-secondary">€{(shop.total || 0).toFixed(2)}</div>
          {shop.actual_receipt_total && Math.abs(shop.total - shop.actual_receipt_total) > 0.05 && (
            <div className="font-mono text-[10px] text-destructive">receipt: €{shop.actual_receipt_total.toFixed(2)}</div>
          )}
          {shop.linked_spend_id
            ? <div className="font-mono text-[10px] text-primary">✓ In Finance</div>
            : <div className="font-mono text-[10px] text-muted-foreground/50">not linked</div>
          }
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="border-t border-border px-4 pb-4 pt-3">
              <div className="space-y-1.5">
                {(shop.items || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-1 border-b border-border/30 last:border-0">
                    <div className="flex-1">
                      <span className="font-mono text-sm">{item.name}</span>
                      {item.brand && <span className="font-mono text-[10px] text-muted-foreground ml-2">{item.brand}</span>}
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{item.quantity} {item.unit}</span>
                    <span className="font-mono text-xs text-muted-foreground">@€{(item.price_per_unit || 0).toFixed(2)}</span>
                    <span className="font-mono text-xs text-secondary font-bold">€{(item.subtotal || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              {shop.notes && <p className="font-mono text-xs text-muted-foreground mt-3 pt-3 border-t border-border">{shop.notes}</p>}
              <div className="flex justify-end mt-3">
                <button onClick={() => onDelete(shop.id)} className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-3 h-3" />Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ShopLogPage({ onNewShop }) {
  const qc = useQueryClient();
  const { data: shops = [], isLoading } = useQuery({
    queryKey: ['grocery-shops'],
    queryFn: () => base44.entities.GroceryShop.list('-date', 100),
  });

  // Retroactive migration: link any existing unlinked shops to Finance (runs once per session)
  useEffect(() => {
    if (!shops.length || isLoading) return;
    const key = 'jar_grocery_migration_v1';
    if (localStorage.getItem(key)) return;
    linkExistingShops(shops, qc).then(() => localStorage.setItem(key, 'true'));
  }, [shops.length, isLoading]);

  const deleteShop = async (id) => {
    await base44.entities.GroceryShop.delete(id);
    qc.invalidateQueries({ queryKey: ['grocery-shops'] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-sm text-muted-foreground">{shops.length} shops logged</p>
        <Button size="sm" onClick={onNewShop} className="h-8 text-xs font-mono bg-secondary text-secondary-foreground">+ NEW SHOP</Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : shops.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground font-mono text-sm">No shops logged yet.</div>
      ) : (
        <div className="space-y-3">
          {shops.map(shop => <ShopCard key={shop.id} shop={shop} onDelete={deleteShop} />)}
        </div>
      )}
    </div>
  );
}