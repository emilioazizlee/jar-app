import React, { useState, useRef, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ITEM_TYPES, SPEND_CATEGORIES, getCategoryLabel } from '@/lib/constants';
import { cleanLabel, isUUID } from '@/lib/labelUtils';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { RotateCcw, Copy, Pencil, Trash2, ChevronDown, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 8;
const LOAD_MORE = 20;

export default function RecentEntries({ items = [] }) {
  const queryClient = useQueryClient();

  // Load projects for UUID resolution
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date', 200),
    staleTime: 60000,
  });

  const projectMap = useMemo(() => {
    const m = {};
    projects.forEach(p => { m[p.id] = p.name; });
    return m;
  }, [projects]);

  // Resolve a category string — handles "project:{uuid}" pattern
  const resolveCategory = (cat) => {
    if (!cat) return '';
    if (cat.startsWith('project:')) {
      const id = cat.replace('project:', '');
      return projectMap[id] || '—';
    }
    if (isUUID(cat)) return '—';
    return cleanLabel(cat);
  };
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [expandedId, setExpandedId] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [swipeId, setSwipeId] = useState(null); // which row is swiped
  const [swipeDir, setSwipeDir] = useState(null); // 'left' | 'right'

  const recent = items.slice(0, visibleCount);
  const hasMore = items.length > visibleCount;

  const getIcon = (item) => {
    if (item.type === 'spend') {
      const lookupKey = item.category === 'cigarettes_health' ? 'cigarettes' : item.category;
      const cat = SPEND_CATEGORIES.find(c => c.key === lookupKey);
      return cat?.icon || '💰';
    }
    return ITEM_TYPES.find(t => t.key === item.type)?.label?.[0] || '•';
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleRepeat = async (item) => {
    const { id, created_date, updated_date, ...rest } = item;
    const created = await base44.entities.Item.create({
      ...rest,
      date: format(new Date(), 'yyyy-MM-dd'),
    });
    queryClient.invalidateQueries({ queryKey: ['items'] });
    toast(`Logged — same as last time`, {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: async () => {
          await base44.entities.Item.delete(created.id);
          queryClient.invalidateQueries({ queryKey: ['items'] });
        },
      },
    });
  };

  const handleDuplicate = async (item) => {
    const { id, created_date, updated_date, ...rest } = item;
    const created = await base44.entities.Item.create({
      ...rest,
      date: format(new Date(), 'yyyy-MM-dd'),
    });
    queryClient.invalidateQueries({ queryKey: ['items'] });
    toast(`Duplicated "${cleanLabel(item.title)}"`, {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: async () => {
          await base44.entities.Item.delete(created.id);
          queryClient.invalidateQueries({ queryKey: ['items'] });
        },
      },
    });
    setSwipeId(null);
  };

  const handleDelete = async (item) => {
    await base44.entities.Item.delete(item.id);
    queryClient.invalidateQueries({ queryKey: ['items'] });
    toast(`Deleted "${cleanLabel(item.title)}"`, {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: async () => {
          const { id, created_date, updated_date, ...rest } = item;
          await base44.entities.Item.create(rest);
          queryClient.invalidateQueries({ queryKey: ['items'] });
        },
      },
    });
    setSwipeId(null);
  };

  const handleSaveEdit = async (item) => {
    const fields = editFields[item.id] || {};
    await base44.entities.Item.update(item.id, fields);
    queryClient.invalidateQueries({ queryKey: ['items'] });
    setExpandedId(null);
    setEditFields(prev => { const n = { ...prev }; delete n[item.id]; return n; });
    toast(`Updated "${cleanLabel(item.title)}"`, { duration: 3000 });
  };

  const updateEdit = (id, key, val) => {
    setEditFields(prev => ({ ...prev, [id]: { ...prev[id], [key]: val } }));
  };

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      setEditFields(prev => ({ ...prev })); // preserve existing
    }
  };

  // ── Swipe handling ─────────────────────────────────────────────────────────
  const touchStart = useRef({});
  const onTouchStart = (e, id) => {
    touchStart.current[id] = e.touches[0].clientX;
  };
  const onTouchEnd = (e, id) => {
    const start = touchStart.current[id];
    if (start == null) return;
    const dx = e.changedTouches[0].clientX - start;
    if (dx > 60) { setSwipeId(id); setSwipeDir('right'); }
    else if (dx < -60) { setSwipeId(id); setSwipeDir('left'); }
    else { setSwipeId(null); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-card border border-border rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="mono-header text-[10px] text-muted-foreground">RECENT ENTRIES</p>
        <Link to="/entries" className="font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
          View all <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-0">
        {recent.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No entries yet. Tap + to start logging.</p>
        )}
        {recent.map((item, i) => {
          const isExpanded = expandedId === item.id;
          const isSwipedRight = swipeId === item.id && swipeDir === 'right';
          const isSwipedLeft = swipeId === item.id && swipeDir === 'left';
          const ef = editFields[item.id] || {};

          return (
            <div key={item.id} className="relative">
              {/* Swipe reveal — right: Duplicate */}
              <AnimatePresence>
                {isSwipedRight && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-y-0 left-0 flex items-center px-3 bg-blue-500/20 rounded-lg"
                  >
                    <button onClick={() => handleDuplicate(item)} className="flex items-center gap-1 text-blue-400 font-mono text-xs">
                      <Copy className="w-4 h-4" /> Duplicate
                    </button>
                  </motion.div>
                )}
                {isSwipedLeft && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-y-0 right-0 flex items-center px-3 bg-red-500/20 rounded-lg"
                  >
                    <button onClick={() => handleDelete(item)} className="flex items-center gap-1 text-red-400 font-mono text-xs">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Row */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * i }}
                onTouchStart={e => onTouchStart(e, item.id)}
                onTouchEnd={e => onTouchEnd(e, item.id)}
                onClick={() => { setSwipeId(null); toggleExpand(item.id); }}
                className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0 cursor-pointer group hover:bg-white/[0.02] rounded-lg px-1 -mx-1 transition-colors relative"
              >
                <span className="text-lg w-8 text-center shrink-0">{getIcon(item)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{cleanLabel(item.title)}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {item.category
                      ? (resolveCategory(item.category) || cleanLabel(item.type))
                      : cleanLabel(item.type)}
                    {' · '}
                    {item.date ? format(new Date(item.date), 'MMM d') : format(new Date(item.created_date), 'MMM d')}
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

                {/* Desktop hover actions */}
                <div className="hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                  <button
                    onClick={e => { e.stopPropagation(); handleRepeat(item); }}
                    className="p-1 text-muted-foreground hover:text-primary transition-colors rounded"
                    title="Repeat"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleDuplicate(item); }}
                    className="p-1 text-muted-foreground hover:text-blue-400 transition-colors rounded"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(item); }}
                    className="p-1 text-muted-foreground hover:text-red-400 transition-colors rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>

              {/* Inline expand editor */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-muted/40 rounded-xl p-4 mb-2 space-y-3 border border-border/50">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-mono text-[10px] text-muted-foreground">AMOUNT</label>
                          <input
                            type="number"
                            defaultValue={item.amount || ''}
                            onChange={e => updateEdit(item.id, 'amount', parseFloat(e.target.value) || undefined)}
                            className="w-full mt-1 bg-muted border border-border rounded-lg px-3 py-2 font-mono text-sm text-white outline-none focus:border-primary/40"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="font-mono text-[10px] text-muted-foreground">DATE</label>
                          <input
                            type="date"
                            defaultValue={item.date || ''}
                            onChange={e => updateEdit(item.id, 'date', e.target.value)}
                            className="w-full mt-1 bg-muted border border-border rounded-lg px-3 py-2 font-mono text-sm text-white outline-none focus:border-primary/40"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="font-mono text-[10px] text-muted-foreground">NOTE</label>
                        <input
                          defaultValue={item.note || ''}
                          onChange={e => updateEdit(item.id, 'note', e.target.value)}
                          className="w-full mt-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary/40"
                          placeholder="Add note..."
                        />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleSaveEdit(item)}
                          className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-xs hover:bg-primary/90 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleRepeat(item); setExpandedId(null); }}
                          className="px-3 py-2 rounded-lg bg-muted font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
                          title="Repeat today"
                        >
                          <RotateCcw className="w-3.5 h-3.5 inline mr-1" />Repeat
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleDuplicate(item); setExpandedId(null); }}
                          className="px-3 py-2 rounded-lg bg-muted font-mono text-xs text-muted-foreground hover:text-blue-400 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5 inline mr-1" />Dupe
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(item); }}
                          className="px-3 py-2 rounded-lg bg-muted font-mono text-xs text-muted-foreground hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline mr-1" />Delete
                        </button>
                        <button
                          onClick={() => setExpandedId(null)}
                          className="px-4 py-2 rounded-lg bg-muted font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Load more */}
      {hasMore && (
        <button
          onClick={() => setVisibleCount(c => c + LOAD_MORE)}
          className="w-full mt-3 py-2.5 font-mono text-[11px] text-muted-foreground hover:text-foreground border border-border/50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <ChevronDown className="w-3.5 h-3.5" />
          Show more ({items.length - visibleCount} remaining)
        </button>
      )}
    </motion.div>
  );
}