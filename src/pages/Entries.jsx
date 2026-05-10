import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format, isSameDay } from 'date-fns';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowLeft } from 'lucide-react';
import { cleanLabel } from '@/lib/labelUtils';
import { SPEND_CATEGORIES, ITEM_TYPES } from '@/lib/constants';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const PAGE_SIZE = 30;

export default function Entries() {
  const { user } = useCurrentUser();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { data: allItems = [] } = useQuery({
    queryKey: ['items', 'all', user?.email],
    queryFn: () => user ? base44.entities.Item.filter({ created_by: user.email }, '-created_date', 9999) : [],
    enabled: !!user,
    initialData: [],
  });

  const filtered = useMemo(() => {
    let list = allItems;
    if (typeFilter !== 'all') list = list.filter(i => i.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        (i.title || '').toLowerCase().includes(q) ||
        (i.category || '').toLowerCase().includes(q) ||
        (i.note || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [allItems, search, typeFilter]);

  const visible = filtered.slice(0, visibleCount);

  const getIcon = (item) => {
    if (item.type === 'spend') {
      const key = item.category === 'cigarettes_health' ? 'cigarettes' : item.category;
      return SPEND_CATEGORIES.find(c => c.key === key)?.icon || '💰';
    }
    return ITEM_TYPES.find(t => t.key === item.type)?.label?.[0] || '•';
  };

  const types = ['all', ...ITEM_TYPES.map(t => t.key)];

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-mono text-[10px] uppercase tracking-[2px] text-[#7a7a7a]">ALL ENTRIES</h1>
        <span className="font-mono text-[10px] text-muted-foreground ml-auto">{filtered.length} total</span>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search entries..."
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono text-foreground outline-none focus:border-primary/40 transition-colors"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="bg-card border border-border rounded-xl px-3 py-2 text-xs font-mono text-muted-foreground outline-none"
        >
          {types.map(t => <option key={t} value={t}>{t === 'all' ? 'All types' : t}</option>)}
        </select>
      </div>

      {/* Entry list */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-0">
        {visible.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No entries found.</p>
        )}
        {visible.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: Math.min(i * 0.01, 0.3) }}
            className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0"
          >
            <span className="text-lg w-8 text-center shrink-0">{getIcon(item)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{cleanLabel(item.title)}</p>
              <p className="font-mono text-[10px] text-muted-foreground">
                {item.category
                  ? cleanLabel(item.category === 'cigarettes_health' ? 'cigarettes' : item.category)
                  : cleanLabel(item.type)}
                {' · '}
                {item.date ? format(new Date(item.date), 'MMM d, yyyy') : format(new Date(item.created_date), 'MMM d, yyyy')}
              </p>
            </div>
            {item.amount && (
              <span className="font-mono text-sm font-semibold text-white shrink-0">
                {item.currency === 'EUR' ? '€' : item.currency === 'USD' ? '$' : (item.currency || '')}
                {item.amount}
              </span>
            )}
            {item.quantity && item.quantity > 1 && !item.amount && (
              <span className="font-mono text-xs text-muted-foreground shrink-0">×{item.quantity}</span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Load more */}
      {filtered.length > visibleCount && (
        <button
          onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
          className="w-full py-3 font-mono text-[11px] text-muted-foreground hover:text-foreground border border-border/50 rounded-xl transition-colors"
        >
          Show more ({filtered.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
}