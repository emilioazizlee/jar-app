import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Star, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const TAG_ICONS = {
  'Cinema': '🎬', 'Concerts': '🎵', 'Gaming': '🎮', 'Dining': '🍽️',
  'Dating': '💕', 'Drinks & Bars': '🍻', 'Hobbies': '🎨', 'Streaming Events': '📺',
  'Travel': '✈️', 'Grooming': '💅', 'Books': '📚', 'Cigarettes': '🚬', 'Custom': '⭐',
};

export default function LeisureList({ entries, onRefresh }) {
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {
    setDeleting(id);
    await base44.entities.LeisureEntry.delete(id);
    onRefresh();
    setDeleting(null);
  };

  const handleFavorite = async (entry) => {
    // Toggle: add to global Favorites
    await base44.entities.Favorite.create({
      entity_type: 'LeisureEntry',
      entity_id: entry.id,
      display_name: entry.item,
      display_icon: TAG_ICONS[entry.sub_tag] || '⭐',
      display_type: 'Leisure',
      route: '/leisure',
    });
    queryClient.invalidateQueries({ queryKey: ['favorites'] });
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <p className="mono-header text-[10px] text-muted-foreground mb-4">ALL ENTRIES</p>
      <div className="space-y-2">
        {entries.slice(0, 30).map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0"
          >
            <span className="text-lg w-7 text-center">{TAG_ICONS[entry.sub_tag] || '⭐'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{entry.item}</p>
              <p className="font-mono text-[10px] text-muted-foreground">
                {entry.sub_tag}{entry.custom_sub_tag ? ` · ${entry.custom_sub_tag}` : ''} · {entry.context || 'Solo'} · {entry.date ? format(new Date(entry.date), 'MMM d') : '—'}
                {entry.location ? ` · ${entry.location}` : ''}
              </p>
            </div>
            {entry.amount && (
              <span className="font-mono text-sm font-semibold text-primary">
                {entry.currency === 'EUR' ? '€' : entry.currency}{entry.amount.toFixed(2)}
              </span>
            )}
            <button
              onClick={() => handleFavorite(entry)}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-yellow-400 transition-colors"
              title="Favorite"
            >
              <Star className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDelete(entry.id)}
              disabled={deleting === entry.id}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
        {entries.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">No leisure entries yet. Log your first one!</p>
        )}
      </div>
    </div>
  );
}