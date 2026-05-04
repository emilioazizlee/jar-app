import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, startOfMonth } from 'date-fns';
import { ShoppingCart, Package, AlertTriangle, Store, Database } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#abff4f', '#ffd60a', '#4da6ff', '#ff9f43', '#a855f7', '#ff2d2d', '#06d6a0', '#f97316'];

function StatCard({ icon: Icon, label, value, sub, color = '#abff4f' }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{label}</span>
      </div>
      <div className="font-mono text-2xl font-bold" style={{ color }}>{value}</div>
      {sub && <div className="font-mono text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export default function GroceriesDashboard() {
  const now = new Date();
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');

  const { data: shops = [] } = useQuery({ queryKey: ['grocery-shops'], queryFn: () => base44.entities.GroceryShop.list('-date', 50) });
  const { data: products = [] } = useQuery({ queryKey: ['grocery-products'], queryFn: () => base44.entities.GroceryProduct.list('-buy_count', 500) });

  const monthShops = useMemo(() => shops.filter(s => s.date >= monthStart), [shops, monthStart]);
  const monthTotal = useMemo(() => monthShops.reduce((s, sh) => s + (sh.total || 0), 0), [monthShops]);

  const expiringSoon = [];
  const wasted = [];

  const byStore = useMemo(() => {
    const map = {};
    monthShops.forEach(s => { map[s.store] = (map[s.store] || 0) + (s.total || 0); });
    return Object.entries(map).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }));
  }, [monthShops]);

  const byCategory = useMemo(() => {
    const map = {};
    monthShops.forEach(s => {
      (s.items || []).forEach(item => {
        const cat = item.category || 'Other';
        map[cat] = (map[cat] || 0) + (item.subtotal || 0);
      });
    });
    return Object.entries(map).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }));
  }, [monthShops]);

  const recentShops = useMemo(() => shops.slice(0, 5), [shops]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={ShoppingCart} label="This Month" value={`€${monthTotal.toFixed(2)}`} sub={`${monthShops.length} shops`} color="#ffd60a" />
        <StatCard icon={Database} label="Items DB" value={products.length} sub="unique products" />
        <StatCard icon={AlertTriangle} label="Expiring Soon" value={expiringSoon.length} sub="within 5 days" color={expiringSoon.length > 0 ? '#ff2d2d' : '#abff4f'} />
        <StatCard icon={Store} label="Shops This Month" value={monthShops.length} sub="trips" color="#ff9f43" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {byStore.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="font-mono text-[10px] text-muted-foreground mb-3">SPEND BY STORE</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={byStore} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} strokeWidth={0}>
                  {byStore.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `€${v.toFixed(2)}`} contentStyle={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 8, fontFamily: 'monospace', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2">
              {byStore.map((s, i) => (
                <div key={s.name} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="font-mono text-[10px] text-muted-foreground">{s.name} €{s.value.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {byCategory.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="font-mono text-[10px] text-muted-foreground mb-3">SPEND BY CATEGORY</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} strokeWidth={0}>
                  {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `€${v.toFixed(2)}`} contentStyle={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 8, fontFamily: 'monospace', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {recentShops.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="font-mono text-[10px] text-muted-foreground mb-3">RECENT SHOPS</p>
          <div className="space-y-2">
            {recentShops.map(s => (
              <div key={s.id} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
                <div className="flex items-center gap-3">
                  <Store className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <div>
                    <span className="font-mono text-sm">{s.store}</span>
                    <span className="font-mono text-[10px] text-muted-foreground ml-2">{s.item_count || 0} items</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-secondary">€{(s.total || 0).toFixed(2)}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{s.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}