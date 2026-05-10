import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Check, Plus } from 'lucide-react';
import { STARTER_CATEGORIES, ICON_DIRECTORY } from '@/lib/starterData';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { toast } from 'sonner';

const TABS = ['Categories', 'Icons'];

const CATEGORY_TYPES = ['all', 'grocery', 'leisure', 'spend', 'task'];

export default function StarterPackBrowser() {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('Categories');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [added, setAdded] = useState(new Set());
  const [loading, setLoading] = useState(null);

  const filtered = useMemo(() => {
    return STARTER_CATEGORIES.filter(c => {
      const matchType = filterType === 'all' || c.entity_type === filterType;
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [search, filterType]);

  const handleAdd = async (cat) => {
    if (added.has(cat.name) || !user) return;
    setLoading(cat.name);
    try {
      await base44.entities.CustomCategory.create({
        ...cat,
        user_id: user.email,
        is_default: true,
        usage_count: 0,
      });
      setAdded(s => new Set([...s, cat.name]));
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(`Added "${cat.name}"`);
    } catch (e) {
      toast.error('Failed to add category');
    }
    setLoading(null);
  };

  const handleAddAll = async () => {
    if (!user) return;
    const toAdd = filtered.filter(c => !added.has(c.name));
    for (const cat of toAdd) {
      try {
        await base44.entities.CustomCategory.create({
          ...cat, user_id: user.email, is_default: true, usage_count: 0,
        });
        setAdded(s => new Set([...s, cat.name]));
      } catch {}
    }
    queryClient.invalidateQueries({ queryKey: ['categories'] });
    toast.success(`Added ${toAdd.length} categories`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-20">
      <div>
        <h1 className="font-mono text-xl font-bold text-foreground">Starter Library</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse and add pre-built categories and icons to your JAR.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${tab === t ? 'bg-card text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Categories' && (
        <div className="space-y-4">
          {/* Search + filter */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm font-mono focus:outline-none focus:border-primary"
                placeholder="Search categories…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-card border border-border rounded-xl px-3 py-2 font-mono text-sm text-foreground"
            >
              {CATEGORY_TYPES.map(t => <option key={t} value={t}>{t === 'all' ? 'All types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>

          {/* Stats + bulk add */}
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs text-muted-foreground">{filtered.length} categories available</p>
            <button
              onClick={handleAddAll}
              className="font-mono text-xs text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all"
            >
              + Add all {filterType !== 'all' ? filterType : ''}
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((cat, i) => {
              const isAdded = added.has(cat.name);
              const isLoading = loading === cat.name;
              return (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-muted-foreground transition-all"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: cat.color + '20' }}
                  >
                    {cat.icon_value}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-medium text-foreground">{cat.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground capitalize">{cat.entity_type}</p>
                  </div>
                  <button
                    onClick={() => handleAdd(cat)}
                    disabled={isAdded || isLoading}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      isAdded ? 'bg-primary/20 text-primary' : 'bg-muted hover:bg-primary/20 hover:text-primary text-muted-foreground'
                    }`}
                  >
                    {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'Icons' && (
        <div className="space-y-6">
          {Object.entries(ICON_DIRECTORY).map(([collection, icons]) => (
            <div key={collection}>
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">{collection}</p>
              <div className="flex flex-wrap gap-2">
                {icons.map(icon => (
                  <button
                    key={icon}
                    onClick={() => { navigator.clipboard?.writeText(icon); toast.success(`Copied ${icon}`); }}
                    title="Click to copy"
                    className="w-12 h-12 text-2xl rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <p className="font-mono text-xs text-muted-foreground text-center pt-2">Click any icon to copy it to clipboard. Use it when creating categories.</p>
        </div>
      )}
    </div>
  );
}