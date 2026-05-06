import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

// Finance-related display types
const FINANCE_TYPES = ['Payments', 'Subscriptions', 'Finance Goals', 'Leisure'];

export default function FavoritesBar({ filter }) {
  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => base44.entities.Favorite.list('-created_date', 200),
    initialData: [],
  });

  const shown = filter === 'finance'
    ? favorites.filter(f => FINANCE_TYPES.includes(f.display_type))
    : favorites;

  if (shown.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
        <p className="mono-header text-[10px] text-muted-foreground">PINNED FAVORITES</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {shown.map(fav => (
          fav.route ? (
            <Link
              key={fav.id}
              to={fav.route}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
            >
              <span className="text-sm">{fav.display_icon || '⭐'}</span>
              <span className="font-mono text-xs text-foreground truncate max-w-[120px]">{fav.display_name}</span>
            </Link>
          ) : (
            <div key={fav.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-xl">
              <span className="text-sm">{fav.display_icon || '⭐'}</span>
              <span className="font-mono text-xs text-foreground truncate max-w-[120px]">{fav.display_name}</span>
            </div>
          )
        ))}
      </div>
    </div>
  );
}