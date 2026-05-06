import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart2, Package, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

function StatSection({ title, children }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <p className="mono-header text-[10px] text-muted-foreground mb-4">{title}</p>
      {children}
    </div>
  );
}

export default function GroceryStatsPage() {
  const { data: products = [] } = useQuery({
    queryKey: ['grocery-products'],
    queryFn: () => base44.entities.GroceryProduct.list('-buy_count', 200),
    initialData: [],
  });

  const { data: shops = [] } = useQuery({
    queryKey: ['grocery-shops'],
    queryFn: () => base44.entities.GroceryShop.list('-date', 200),
    initialData: [],
  });

  // Most bought items
  const mostBought = useMemo(() =>
    [...products].filter(p => p.buy_count > 0).sort((a, b) => (b.buy_count || 0) - (a.buy_count || 0)).slice(0, 10),
    [products]
  );

  // Most spent on (avg_price × buy_count)
  const mostSpentOn = useMemo(() =>
    [...products]
      .filter(p => p.avg_price && p.buy_count)
      .map(p => ({ ...p, total_spent: (p.avg_price || 0) * (p.buy_count || 0) }))
      .sort((a, b) => b.total_spent - a.total_spent)
      .slice(0, 10),
    [products]
  );

  // Co-occurrence pairs (items bought in the same shop)
  const coPairs = useMemo(() => {
    const pairs = {};
    shops.forEach(shop => {
      const items = (shop.items || []).map(i => i.name).filter(Boolean);
      for (let a = 0; a < items.length; a++) {
        for (let b = a + 1; b < items.length; b++) {
          const key = [items[a], items[b]].sort().join(' + ');
          pairs[key] = (pairs[key] || 0) + 1;
        }
      }
    });
    return Object.entries(pairs).sort(([, a], [, b]) => b - a).slice(0, 8);
  }, [shops]);

  // Seasonality: which months have highest spend
  const monthlySpend = useMemo(() => {
    const months = {};
    shops.forEach(shop => {
      if (!shop.date) return;
      const m = shop.date.slice(0, 7); // YYYY-MM
      months[m] = (months[m] || 0) + (shop.total || 0);
    });
    return Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([month, total]) => ({
      month: month.slice(5), // MM
      total: parseFloat(total.toFixed(2)),
    }));
  }, [shops]);

  // Store loyalty per item (most common store)
  const storeLoyalty = useMemo(() =>
    products
      .filter(p => p.cheapest_store || p.typical_store)
      .slice(0, 8)
      .map(p => ({ name: p.name, store: p.cheapest_store || p.typical_store, buys: p.buy_count || 0 })),
    [products]
  );

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="font-mono text-sm text-muted-foreground">No grocery data yet. Log your first shop to unlock stats.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overview */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'UNIQUE ITEMS', value: products.length },
          { label: 'TOTAL SHOPS', value: shops.length },
          { label: 'TOTAL SPEND', value: `€${shops.reduce((s, sh) => s + (sh.total || 0), 0).toFixed(0)}` },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="mono-header text-[9px] text-muted-foreground">{s.label}</p>
            <p className="font-mono text-lg font-bold text-primary mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Most bought */}
      <StatSection title="MOST BOUGHT ITEMS">
        <div className="space-y-2">
          {mostBought.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground w-5">{i + 1}</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(p.buy_count / mostBought[0].buy_count) * 100}%` }} />
              </div>
              <span className="font-mono text-xs text-foreground min-w-[80px] truncate">{p.name}</span>
              <span className="font-mono text-xs text-primary w-8 text-right">×{p.buy_count}</span>
            </div>
          ))}
        </div>
      </StatSection>

      {/* Most spent on */}
      <StatSection title="MOST SPENT ON (LIFETIME)">
        <div className="space-y-2">
          {mostSpentOn.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground w-5">{i + 1}</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(p.total_spent / mostSpentOn[0].total_spent) * 100}%` }} />
              </div>
              <span className="font-mono text-xs text-foreground min-w-[80px] truncate">{p.name}</span>
              <span className="font-mono text-xs text-orange-400 w-16 text-right">€{p.total_spent.toFixed(0)}</span>
            </div>
          ))}
        </div>
      </StatSection>

      {/* Co-occurrence pairs */}
      {coPairs.length > 0 && (
        <StatSection title="OFTEN BOUGHT TOGETHER">
          <div className="flex flex-wrap gap-2">
            {coPairs.map(([pair, count]) => (
              <div key={pair} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-xl">
                <span className="font-mono text-xs text-foreground">{pair}</span>
                <span className="font-mono text-[10px] text-primary">{count}x</span>
              </div>
            ))}
          </div>
        </StatSection>
      )}

      {/* Monthly spend trend */}
      {monthlySpend.length > 1 && (
        <StatSection title="MONTHLY SPEND TREND">
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySpend}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis tick={{ fontSize: 10, fontFamily: 'monospace' }} width={40} />
                <Tooltip formatter={v => `€${v}`} contentStyle={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 6, fontSize: 10, fontFamily: 'monospace' }} />
                <Line type="monotone" dataKey="total" stroke="#abff4f" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </StatSection>
      )}

      {/* Store loyalty */}
      {storeLoyalty.length > 0 && (
        <StatSection title="STORE LOYALTY PER ITEM">
          <div className="space-y-2">
            {storeLoyalty.map(item => (
              <div key={item.name} className="flex items-center gap-3 py-1.5 border-b border-border/50 last:border-0">
                <span className="font-mono text-xs text-foreground flex-1 truncate">{item.name}</span>
                <span className="font-mono text-xs text-blue-400">{item.store}</span>
                <span className="font-mono text-[10px] text-muted-foreground">×{item.buys}</span>
              </div>
            ))}
          </div>
        </StatSection>
      )}
    </div>
  );
}