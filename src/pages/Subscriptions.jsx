import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pause, Play, Trash2, Star, ChevronDown, ChevronUp, Search, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays } from 'date-fns';
import SubscriptionForm from '@/components/forms/SubscriptionForm';
import BrandLogo from '@/components/subscriptions/BrandLogo';

const SORT_OPTIONS = [
  { key: 'due_date', label: 'Next Due' },
  { key: 'amount_asc', label: 'Price ↑' },
  { key: 'amount_desc', label: 'Price ↓' },
  { key: 'alpha', label: 'Alphabetical' },
  { key: 'recent', label: 'Recently Added' },
  { key: 'favorite', label: 'Favorites First' },
];
const FILTER_CATEGORIES = ['Streaming', 'AI & Productivity', 'Gaming', 'Telecom & Utilities', 'Food Delivery', 'Travel', 'Learning', 'Lifestyle', 'Local', 'Other'];

function SubscriptionRow({ sub }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);

  const daysUntil = sub.next_renewal ? differenceInDays(new Date(sub.next_renewal), new Date()) : null;
  const currSym = sub.currency === 'EUR' ? '€' : sub.currency === 'USD' ? '$' : sub.currency || '€';
  const isFav = sub.tags?.includes('__favorite__');

  const note = (() => { try { return JSON.parse(sub.note || '{}'); } catch { return {}; } })();

  const toggleFav = async (e) => {
    e.stopPropagation();
    const tags = isFav ? (sub.tags || []).filter(t => t !== '__favorite__') : [...(sub.tags || []), '__favorite__'];
    await base44.entities.Item.update(sub.id, { tags });
    queryClient.invalidateQueries({ queryKey: ['items'] });
  };

  const toggleActive = async (e) => {
    e.stopPropagation();
    await base44.entities.Item.update(sub.id, { is_active: sub.is_active === false });
    queryClient.invalidateQueries({ queryKey: ['items'] });
  };

  const deleteSub = async (e) => {
    e.stopPropagation();
    await base44.entities.Item.delete(sub.id);
    queryClient.invalidateQueries({ queryKey: ['items'] });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card border border-border rounded-xl overflow-hidden transition-all ${sub.is_active === false ? 'opacity-50' : 'hover:border-blue-400/20'}`}
    >
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <BrandLogo name={sub.title} size={40} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{sub.title}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="font-mono text-[10px] text-muted-foreground capitalize">{sub.billing_cycle}</span>
            {daysUntil !== null && daysUntil >= 0 && (
              <Badge variant="outline" className={`text-[10px] font-mono ${daysUntil <= 3 ? 'text-destructive border-destructive/30' : 'text-muted-foreground'}`}>
                {daysUntil === 0 ? 'Today' : `${daysUntil}d`}
              </Badge>
            )}
          </div>
        </div>
        <p className="font-mono text-sm font-semibold text-foreground">{currSym}{sub.amount?.toFixed(2) || '0.00'}</p>

        <button onClick={toggleFav} className="p-1.5 flex-shrink-0">
          <Star className="w-3.5 h-3.5" style={{ fill: isFav ? '#ffd60a' : 'none', color: isFav ? '#ffd60a' : '#7a7a7a' }} />
        </button>
        <button onClick={toggleActive} className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0">
          {sub.is_active === false ? <Play className="w-3.5 h-3.5 text-primary" /> : <Pause className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
        <button onClick={deleteSub} className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0">
          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
        </button>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/50 overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                {sub.next_renewal && (
                  <div>
                    <p className="font-mono text-[10px] text-muted-foreground mb-1">NEXT BILLING</p>
                    <p className="text-sm font-mono">{format(new Date(sub.next_renewal), 'MMM d, yyyy')}</p>
                  </div>
                )}
                {note.payment_method && (
                  <div>
                    <p className="font-mono text-[10px] text-muted-foreground mb-1">PAYMENT METHOD</p>
                    <p className="text-sm">{note.payment_method}</p>
                  </div>
                )}
                {note.website && (
                  <div>
                    <p className="font-mono text-[10px] text-muted-foreground mb-1">WEBSITE</p>
                    <a href={note.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <ExternalLink className="w-3 h-3" /> {note.website}
                    </a>
                  </div>
                )}
                {note.cancel_url && (
                  <div>
                    <p className="font-mono text-[10px] text-muted-foreground mb-1">CANCEL LINK</p>
                    <a href={note.cancel_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-destructive hover:underline">
                      <ExternalLink className="w-3 h-3" /> Cancel Subscription
                    </a>
                  </div>
                )}
              </div>
              {sub.description && (
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground mb-1">NOTES</p>
                  <p className="text-sm text-muted-foreground">{sub.description}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Subscriptions() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [sortKey, setSortKey] = useState(() => localStorage.getItem('jar_sub_sort') || 'due_date');
  const [filterCats, setFilterCats] = useState([]);
  const [search, setSearch] = useState('');

  const { data: subs = [] } = useQuery({
    queryKey: ['items', 'subscriptions'],
    queryFn: () => base44.entities.Item.filter({ type: 'subscription' }, '-created_date', 200),
    initialData: [],
  });

  const activeSubs = subs.filter(s => s.is_active !== false);
  const monthlyTotal = activeSubs.reduce((sum, s) => {
    if (!s.amount) return sum;
    const m = s.billing_cycle === 'yearly' ? 1/12 : s.billing_cycle === 'quarterly' ? 1/3 : 1;
    return sum + (s.amount * m);
  }, 0);
  const yearlyTotal = monthlyTotal * 12;

  const sorted = useMemo(() => {
    let result = [...subs];
    if (search) result = result.filter(s => s.title?.toLowerCase().includes(search.toLowerCase()));
    if (filterCats.length) result = result.filter(s => filterCats.includes(s.category));
    const isFav = s => s.tags?.includes('__favorite__');
    switch (sortKey) {
      case 'due_date': result.sort((a, b) => (a.next_renewal || '9999') < (b.next_renewal || '9999') ? -1 : 1); break;
      case 'amount_asc': result.sort((a, b) => (a.amount || 0) - (b.amount || 0)); break;
      case 'amount_desc': result.sort((a, b) => (b.amount || 0) - (a.amount || 0)); break;
      case 'alpha': result.sort((a, b) => (a.title || '').localeCompare(b.title || '')); break;
      case 'recent': result.sort((a, b) => b.created_date > a.created_date ? 1 : -1); break;
      case 'favorite': result.sort((a, b) => isFav(b) ? 1 : isFav(a) ? -1 : 0); break;
    }
    return result;
  }, [subs, sortKey, filterCats, search]);

  const toggleCat = (cat) => setFilterCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  const handleSort = (key) => { setSortKey(key); localStorage.setItem('jar_sub_sort', key); };

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="mono-header text-lg md:text-xl text-foreground">SUBSCRIPTIONS</h1>
          <p className="text-sm text-muted-foreground mt-1">{activeSubs.length} active</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-500 text-white rounded-xl font-mono text-sm min-h-[44px]">
          <Plus className="w-4 h-4" /> ADD
        </motion.button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 md:p-5">
          <p className="mono-header text-[10px] text-muted-foreground mb-2">MONTHLY</p>
          <p className="font-mono text-2xl md:text-3xl font-bold text-secondary">€{monthlyTotal.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 md:p-5">
          <p className="mono-header text-[10px] text-muted-foreground mb-2">YEARLY</p>
          <p className="font-mono text-2xl md:text-3xl font-bold text-foreground">€{yearlyTotal.toFixed(2)}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-card border border-border rounded-xl p-3 space-y-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 flex-1 bg-muted rounded-lg px-3 py-1.5 min-w-[160px]">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <input className="bg-transparent text-sm flex-1 outline-none font-mono" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={sortKey} onChange={e => handleSort(e.target.value)} className="bg-muted border-none rounded-lg px-3 py-1.5 font-mono text-xs text-foreground outline-none">
            {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTER_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => toggleCat(cat)}
              className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] border transition-all ${filterCats.includes(cat) ? 'bg-secondary/20 border-secondary/40 text-secondary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
              {cat}
            </button>
          ))}
          {filterCats.length > 0 && <button onClick={() => setFilterCats([])} className="px-2.5 py-0.5 rounded-full font-mono text-[10px] border border-border text-muted-foreground">Clear</button>}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        <AnimatePresence>
          {sorted.map(sub => <SubscriptionRow key={sub.id} sub={sub} />)}
        </AnimatePresence>
        {sorted.length === 0 && <p className="text-center text-muted-foreground py-12 text-sm">No subscriptions found</p>}
      </div>

      {showForm && (
        <SubscriptionForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['items'] }); }}
        />
      )}
    </div>
  );
}