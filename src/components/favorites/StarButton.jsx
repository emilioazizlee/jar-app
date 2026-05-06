import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Reusable star/favorite button.
 * Props:
 *   entityType - e.g. 'Item', 'LeisureEntry', 'Recipe'
 *   entityId   - record id
 *   displayName - shown in favorites list
 *   displayIcon - emoji
 *   displayType - grouping label in favorites list (e.g. 'Tasks', 'Payments')
 *   route       - app route to open the item
 */
export default function StarButton({ entityType, entityId, displayName, displayIcon, displayType, route, size = 'sm' }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [starred, setStarred] = useState(false);

  const handleStar = async (e) => {
    e.stopPropagation();
    if (loading || starred) return;
    setLoading(true);
    await base44.entities.Favorite.create({
      entity_type: entityType,
      entity_id: entityId,
      display_name: displayName,
      display_icon: displayIcon || '⭐',
      display_type: displayType || entityType,
      route: route || '',
    });
    queryClient.invalidateQueries({ queryKey: ['favorites'] });
    setStarred(true);
    setLoading(false);
  };

  const iconSize = size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <button
      onClick={handleStar}
      disabled={loading}
      title={starred ? 'Favorited!' : 'Add to favorites'}
      className={`p-1 rounded transition-colors ${starred ? 'text-yellow-400' : 'text-muted-foreground hover:text-yellow-400'}`}
    >
      <Star className={`${iconSize} ${starred ? 'fill-current' : ''}`} />
    </button>
  );
}