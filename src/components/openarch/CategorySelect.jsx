import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import CategoryIcon from './CategoryIcon';
import { Plus, ChevronDown } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '@/lib/defaultCategories';

/**
 * Drop-in replacement for any category selector.
 * Fetches from CustomCategory, falls back to defaults, lets user create inline.
 * 
 * Props:
 *   entityType: "leisure"|"grocery"|"spend"|"task"|"recipe"
 *   value: string (category name)
 *   onChange: (name, categoryId?) => void
 *   placeholder: string
 */
export default function CategorySelect({ entityType, value, onChange, placeholder = 'Category…' }) {
  const { user } = useCurrentUser();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const ref = useRef();

  const { data: customCategories = [] } = useQuery({
    queryKey: ['custom-categories', entityType, user?.email],
    queryFn: () => user ? base44.entities.CustomCategory.filter({ entity_type: entityType, user_id: user.email }) : [],
    enabled: !!user,
  });

  const defaults = DEFAULT_CATEGORIES[entityType] || [];
  const all = [
    ...customCategories.map(c => ({ id: c.id, name: c.name, icon_type: c.icon_type, icon_value: c.icon_value, color: c.color, isCustom: true })),
    ...defaults.filter(d => !customCategories.find(c => c.name.toLowerCase() === d.name.toLowerCase())),
  ];

  const filtered = all.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));
  const exactMatch = all.find(c => c.name.toLowerCase() === search.toLowerCase());

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = all.find(c => c.name === value);

  const handleSelect = (cat) => {
    onChange(cat.name, cat.id || null);
    setSearch('');
    setOpen(false);
  };

  const handleCreateInline = async () => {
    if (!search.trim() || !user) return;
    setCreating(true);
    const newCat = await base44.entities.CustomCategory.create({
      user_id: user.email,
      entity_type: entityType,
      name: search.trim(),
      icon_type: 'emoji',
      icon_value: '📦',
      usage_count: 1,
    });
    qc.invalidateQueries({ queryKey: ['custom-categories', entityType, user?.email] });
    onChange(search.trim(), newCat.id);
    setSearch('');
    setOpen(false);
    setCreating(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 10px', borderRadius: 8,
          background: '#1a1a1a', border: '1px solid #2a2a2a',
          color: value ? '#fff' : '#555', cursor: 'pointer',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 12, textAlign: 'left',
        }}>
        {selected ? (
          <CategoryIcon iconType={selected.icon_type} iconValue={selected.icon_value} size={16} color={selected.color} />
        ) : (
          <span style={{ width: 16, height: 16, borderRadius: 3, background: '#2a2a2a', flexShrink: 0 }} />
        )}
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || placeholder}</span>
        <ChevronDown size={12} color="#555" />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, marginTop: 4,
          background: '#141414', border: '1px solid #2a2a2a', borderRadius: 10,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)', overflow: 'hidden',
        }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid #1f1f1f' }}>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !exactMatch && search.trim()) handleCreateInline(); }}
              placeholder="Search or type new…"
              style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, outline: 'none' }}
            />
          </div>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {filtered.map(cat => (
              <button key={cat.id || cat.name} type="button" onClick={() => handleSelect(cat)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 12px', background: cat.name === value ? 'rgba(171,255,79,0.06)' : 'transparent',
                  border: 'none', cursor: 'pointer', color: cat.name === value ? '#abff4f' : '#ccc',
                  borderBottom: '1px solid #1a1a1a', textAlign: 'left',
                }}>
                <CategoryIcon iconType={cat.icon_type} iconValue={cat.icon_value} size={16} color={cat.color} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{cat.name}</span>
                {cat.isCustom && <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#555' }}>custom</span>}
              </button>
            ))}
            {search.trim() && !exactMatch && (
              <button type="button" onClick={handleCreateInline} disabled={creating}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: 'rgba(171,255,79,0.06)', border: 'none', cursor: 'pointer', color: '#abff4f', borderTop: '1px solid #1f1f1f' }}>
                <Plus size={13} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{creating ? 'Creating…' : `Create "${search.trim()}"`}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}