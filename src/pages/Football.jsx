import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, FileText, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import JarVisual from '@/components/jar/JarVisual';
import FootballWorkForm from '@/components/forms/FootballWorkForm';
import { FOOTBALL_WORK_TYPES } from '@/lib/footballConstants';
import { format } from 'date-fns';

export default function Football() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const { data: items = [] } = useQuery({
    queryKey: ['football-items'],
    queryFn: () => base44.entities.Item.filter({ category: 'Football' }, '-created_date', 500),
  });

  const filtered = useMemo(() => items.filter(i => {
    if (filterType !== 'all' && i.status !== filterType) return false;
    if (search && !JSON.stringify(i).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [items, filterType, search]);

  const getTypeInfo = (item) => {
    try {
      const desc = JSON.parse(item.description || '{}');
      return FOOTBALL_WORK_TYPES.find(t => t.key === desc.work_type);
    } catch { return null; }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mono-header text-xl" style={{ color: '#ff9f43' }}>FOOTBALL AGENT</h1>
          <p className="text-sm text-muted-foreground mt-1">{items.length} work entries</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm text-black"
          style={{ background: '#ff9f43' }}
        >
          <Plus className="w-4 h-4" /> ADD WORK
        </motion.button>
      </div>

      {/* Work type stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {FOOTBALL_WORK_TYPES.map(wt => {
          const count = items.filter(i => {
            try { return JSON.parse(i.description || '{}').work_type === wt.key; } catch { return false; }
          }).length;
          const Icon = wt.icon;
          return (
            <div key={wt.key} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: wt.color + '20' }}>
                <Icon className="w-4 h-4" style={{ color: wt.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-lg font-bold">{count}</p>
                <p className="font-mono text-[9px] text-muted-foreground truncate leading-tight">{wt.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search all fields..." className="bg-card border-border pl-9 font-mono text-sm" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40 bg-card border-border font-mono text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Final">Final</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Work list */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((item, i) => {
            const typeInfo = getTypeInfo(item);
            const Icon = typeInfo?.icon || FileText;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="bg-card border border-border rounded-xl p-4 hover:border-orange-400/20 transition-all group cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: (typeInfo?.color || '#ff9f43') + '20' }}>
                    <Icon className="w-4 h-4" style={{ color: typeInfo?.color || '#ff9f43' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{item.title}</p>
                      {typeInfo && (
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: typeInfo.color + '20', color: typeInfo.color }}>
                          {typeInfo.short}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {item.status && (
                        <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">{item.status}</Badge>
                      )}
                      {item.date && (
                        <span className="font-mono text-[10px] text-muted-foreground">{format(new Date(item.date), 'MMM d')}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm font-mono">No work entries. Tap ADD WORK to start.</p>
        )}
      </div>

      {showForm && (
        <FootballWorkForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['football-items'] }); }}
        />
      )}
    </div>
  );
}