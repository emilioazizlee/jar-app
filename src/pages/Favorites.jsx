import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, Search, ExternalLink, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

export default function Favorites() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => base44.entities.Favorite.list('-created_date', 200),
    initialData: [],
  });

  const handleUnfavorite = async (id) => {
    await base44.entities.Favorite.delete(id);
    queryClient.invalidateQueries({ queryKey: ['favorites'] });
  };

  const filtered = useMemo(() => {
    if (!search) return favorites;
    const q = search.toLowerCase();
    return favorites.filter(f => f.display_name?.toLowerCase().includes(q) || f.display_type?.toLowerCase().includes(q));
  }, [favorites, search]);

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(f => {
      const type = f.display_type || 'Other';
      if (!g[type]) g[type] = [];
      g[type].push(f);
    });
    return g;
  }, [filtered]);

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="mono-header text-lg md:text-xl text-foreground">FAVORITES</h1>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search favorites..."
            className="bg-muted border-none pl-9 h-9"
          />
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center">
          <Star className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-mono text-sm text-muted-foreground">No favorites yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Star items across the app to pin them here.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([type, items]) => (
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <p className="mono-header text-[10px] text-muted-foreground mb-3">{type.toUpperCase()}</p>
            <div className="space-y-2">
              {items.map((fav, i) => (
                <div key={fav.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                  <span className="text-lg w-7 text-center">{fav.display_icon || '⭐'}</span>
                  <span className="flex-1 font-mono text-sm text-foreground truncate">{fav.display_name}</span>
                  {fav.route && (
                    <Link to={fav.route} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  <button
                    onClick={() => handleUnfavorite(fav.id)}
                    className="p-1.5 rounded hover:bg-muted text-yellow-400 hover:text-muted-foreground transition-colors"
                    title="Remove favorite"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}