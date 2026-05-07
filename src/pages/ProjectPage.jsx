import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, ChevronRight, Loader2, Pencil } from 'lucide-react';
import EditProjectModal from '@/components/projects/EditProjectModal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import JarVisual from '@/components/jar/JarVisual';
import ProjectWorkForm from '@/components/projects/ProjectWorkForm';
import DynIcon from '@/components/projects/DynIcon';
import { format } from 'date-fns';

export default function ProjectPage() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const results = await base44.entities.Project.list('-created_date', 100);
      return results.find(p => p.id === projectId) || null;
    },
    enabled: !!projectId,
  });

  const { data: items = [] } = useQuery({
    queryKey: ['project-items', projectId],
    queryFn: () => base44.entities.Item.filter({ category: `project:${projectId}` }, '-created_date', 500),
    enabled: !!projectId,
  });

  const workTypes = project?.work_types || [];
  const color = project?.color || '#39ff14';

  const filtered = useMemo(() => items.filter(item => {
    if (filterType !== 'all') {
      try {
        const d = JSON.parse(item.description || '{}');
        if (d.work_type !== filterType) return false;
      } catch { return false; }
    }
    if (search && !JSON.stringify(item).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [items, filterType, search]);

  const getWorkTypeInfo = (item) => {
    try {
      const d = JSON.parse(item.description || '{}');
      return workTypes.find(wt => wt.key === d.work_type);
    } catch { return null; }
  };

  if (loadingProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return <p className="text-center text-muted-foreground py-20 font-mono">Project not found.</p>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: color + '20' }}>
            <DynIcon name={project.icon || 'FolderOpen'} className="w-5 h-5" style={{ color }} />
          </div>
          <div>
            <h1 className="mono-header text-xl" style={{ color }}>{project.name.toUpperCase()}</h1>
            {project.description && <p className="text-sm text-muted-foreground mt-0.5 max-w-md">{project.description}</p>}
            <p className="text-xs text-muted-foreground mt-0.5">{items.length} work entries</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <JarVisual
            fillPercent={(items.length % 10) * 10}
            completedJars={Math.floor(items.length / 10)}
            size="sm"
            color={color}
          />
          <button
            onClick={() => setShowEdit(true)}
            className="p-2 rounded-lg bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors"
            title="Edit project"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm text-black"
            style={{ background: color }}
          >
            <Plus className="w-4 h-4" /> ADD WORK
          </motion.button>
        </div>
      </div>

      {/* Work type stat tiles */}
      {workTypes.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {workTypes.map(wt => {
            const count = items.filter(item => {
              try { return JSON.parse(item.description || '{}').work_type === wt.key; } catch { return false; }
            }).length;
            return (
              <button
                key={wt.key}
                onClick={() => setFilterType(filterType === wt.key ? 'all' : wt.key)}
                className="bg-card border rounded-xl p-3 flex items-center gap-3 transition-all text-left"
                style={filterType === wt.key ? { borderColor: (wt.color || color) + '80' } : { borderColor: '' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold"
                  style={{ background: (wt.color || color) + '20', color: wt.color || color }}>
                  {wt.short || wt.label.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-lg font-bold">{count}</p>
                  <p className="font-mono text-[9px] text-muted-foreground truncate leading-tight">{wt.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search all entries..." className="bg-card border-border pl-9 font-mono text-sm" />
        </div>
        {workTypes.length > 1 && (
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40 bg-card border-border font-mono text-sm"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {workTypes.map(wt => <SelectItem key={wt.key} value={wt.key}>{wt.label}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Entry list */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((item, i) => {
            const wtInfo = getWorkTypeInfo(item);
            let extraData = {};
            try { extraData = JSON.parse(item.description || '{}'); } catch {}
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="bg-card border border-border rounded-xl p-4 transition-all group cursor-pointer"
                onMouseEnter={e => e.currentTarget.style.borderColor = color + '30'}
                onMouseLeave={e => e.currentTarget.style.borderColor = ''}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 font-mono text-xs font-bold"
                    style={{ background: (wtInfo?.color || color) + '20', color: wtInfo?.color || color }}>
                    {wtInfo?.short || (wtInfo?.label || 'WK').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{item.title}</p>
                      {wtInfo && (
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: (wtInfo.color || color) + '20', color: wtInfo.color || color }}>
                          {wtInfo.label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {item.status && <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">{item.status}</Badge>}
                      {item.date && <span className="font-mono text-[10px] text-muted-foreground">{format(new Date(item.date), 'MMM d')}</span>}
                      {extraData.player_name && <span className="font-mono text-[10px] text-muted-foreground">· {extraData.player_name}</span>}
                      {extraData.subject && <span className="font-mono text-[10px] text-muted-foreground">· {extraData.subject}</span>}
                      {extraData.client && <span className="font-mono text-[10px] text-muted-foreground">· {extraData.client}</span>}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm font-mono">
            {items.length === 0 ? 'No work entries yet. Tap ADD WORK to start.' : 'No entries match the filter.'}
          </p>
        )}
      </div>

      {showForm && (
        <ProjectWorkForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            queryClient.invalidateQueries({ queryKey: ['project-items', projectId] });
            queryClient.invalidateQueries({ queryKey: ['items'] });
          }}
          project={project}
        />
      )}

      {showEdit && (
        <EditProjectModal
          open={showEdit}
          onClose={() => setShowEdit(false)}
          project={project}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
          }}
        />
      )}
    </div>
  );
}