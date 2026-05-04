import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, Star, TrendingDown, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['All', 'Produce', 'Dairy', 'Meat', 'Frozen', 'Pantry', 'Beverages', 'Household', 'Bakery', 'Snacks', 'Other'];

function ProductCard({ product, onToggleStaple }) {
  const [expanded, setExpanded] = useState(false);
  const priceHistory = (product.price_history || []).slice(0, 20).reverse();

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button className="w-full flex items-center gap-3 p-3.5 hover:bg-muted/30 transition-colors text-left" onClick={() => setExpanded(e => !e)}>
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground shrink-0">
          {product.name[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-sm font-bold truncate">{product.name}</div>
          <div className="flex items-center gap-3 mt-0.5">
            {product.brand && <span className="font-mono text-[10px] text-muted-foreground">{product.brand}</span>}
            {product.category && <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{product.category}</span>}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-mono text-sm text-secondary font-bold">
            {product.avg_price ? `€${product.avg_price.toFixed(2)}` : '—'}
            <span className="font-mono text-[10px] text-muted-foreground ml-1">avg/{product.default_unit || 'unit'}</span>
          </div>
          <div className="flex items-center gap-2 justify-end mt-0.5">
            <span className="font-mono text-[10px] text-muted-foreground">×{product.buy_count || 0}</span>
            {product.cheapest_store && (
              <span className="flex items-center gap-0.5 font-mono text-[10px] text-primary">
                <TrendingDown className="w-2.5 h-2.5" />{product.cheapest_store}
              </span>
            )}
            {product.is_staple && <Star className="w-3 h-3 text-secondary fill-secondary" />}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="border-t border-border p-4 space-y-4">
              <div className="grid grid-cols-4 gap-3 text-center">
                <div><div className="font-mono text-[10px] text-muted-foreground">MIN</div><div className="font-mono text-sm text-primary font-bold">€{(product.min_price || 0).toFixed(2)}</div></div>
                <div><div className="font-mono text-[10px] text-muted-foreground">AVG</div><div className="font-mono text-sm text-secondary font-bold">€{(product.avg_price || 0).toFixed(2)}</div></div>
                <div><div className="font-mono text-[10px] text-muted-foreground">MAX</div><div className="font-mono text-sm text-destructive font-bold">€{(product.max_price || 0).toFixed(2)}</div></div>
                <div><div className="font-mono text-[10px] text-muted-foreground">LAST</div><div className="font-mono text-sm font-bold">€{(product.last_price || 0).toFixed(2)}</div></div>
              </div>

              {product.has_nutrition && (
                <div className="grid grid-cols-4 gap-2 text-center bg-muted rounded-lg p-2">
                  {[
                    { label: 'KCAL', value: product.calories_per_100, unit: '/100' },
                    { label: 'PROT', value: product.protein_per_100, unit: 'g' },
                    { label: 'CARBS', value: product.carbs_per_100, unit: 'g' },
                    { label: 'FAT', value: product.fat_per_100, unit: 'g' },
                  ].map(({ label, value, unit }) => (
                    <div key={label}>
                      <div className="font-mono text-[10px] text-muted-foreground">{label}</div>
                      <div className="font-mono text-xs text-primary">{value ? value.toFixed(1) : '—'}<span className="text-[10px] text-muted-foreground">{unit}</span></div>
                    </div>
                  ))}
                </div>
              )}

              {priceHistory.length > 1 && (
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground mb-2">PRICE HISTORY</p>
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={priceHistory}>
                      <XAxis dataKey="date" tick={{ fontSize: 9, fontFamily: 'monospace' }} tickFormatter={d => d?.slice(5)} />
                      <YAxis tick={{ fontSize: 9, fontFamily: 'monospace' }} width={35} />
                      <Tooltip formatter={v => `€${v?.toFixed(2)}`} contentStyle={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 6, fontSize: 10, fontFamily: 'monospace' }} />
                      <Line type="monotone" dataKey="price" stroke="#39ff14" strokeWidth={1.5} dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <button onClick={() => onToggleStaple(product)}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono transition-colors ${product.is_staple ? 'bg-secondary/20 text-secondary' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                <Star className={`w-3 h-3 ${product.is_staple ? 'fill-secondary' : ''}`} />
                {product.is_staple ? 'Recurring Staple ✓' : 'Mark as Recurring Staple'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ItemsDatabasePage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');

  const { data: products = [] } = useQuery({
    queryKey: ['grocery-products'],
    queryFn: () => base44.entities.GroceryProduct.list('-buy_count', 200),
  });

  const filtered = useMemo(() => products.filter(p => {
    if (filterCat !== 'All' && p.category !== filterCat) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !(p.brand || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [products, filterCat, search]);

  const toggleStaple = async (product) => {
    await base44.entities.GroceryProduct.update(product.id, { is_staple: !product.is_staple });
    qc.invalidateQueries({ queryKey: ['grocery-products'] });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." className="pl-8 bg-muted border-none font-mono text-sm h-8" />
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${filterCat === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
            {cat}
          </button>
        ))}
      </div>
      <p className="font-mono text-[10px] text-muted-foreground">{filtered.length} products in database</p>
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-mono text-sm text-muted-foreground">No products yet. Start shopping to build your database.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => <ProductCard key={p.id} product={p} onToggleStaple={toggleStaple} />)}
        </div>
      )}
    </div>
  );
}