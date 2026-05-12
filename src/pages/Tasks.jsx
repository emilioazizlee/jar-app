import React, { useState, useMemo } from 'react';
import { useT } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TASK_STATUSES, TASK_TYPES } from '@/lib/constants';
import JarVisual from '@/components/jar/JarVisual';
import TaskForm from '@/components/forms/TaskForm';
import TaskCardMenu from '@/components/tasks/TaskCardMenu';
import { Plus, ChevronRight, LayoutList, LayoutGrid } from 'lucide-react';
import TasksBoardView from '@/components/tasks/TasksBoardView.jsx';
import { format } from 'date-fns';
import { getProjectName } from '@/lib/labelUtils';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import QueryStateWrapper from '@/components/shared/QueryStateWrapper';

const STATUS_COLORS = {
  'Idea': '#7a7a7a',
  'Planned': '#4da6ff',
  'In Progress': '#ffd60a',
  'Blocked': '#ff2d2d',
  'Done': '#39ff14',
  'Archived': '#3a3a3a',
};

export default function Tasks() {
  const t = useT();
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'board'
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [boardInitialStatus, setBoardInitialStatus] = useState('Planned');

  const { data: tasks = [], isLoading: tasksLoading, error: tasksError, refetch: refetchTasks } = useQuery({
    queryKey: ['items', 'tasks', user?.email],
    queryFn: () => user ? base44.entities.Item.filter({ type: 'task', created_by: user.email }, '-created_date', 200) : [],
    enabled: !!user,
    initialData: [],
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', user?.email],
    queryFn: () => user ? base44.entities.Project.filter({ created_by: user.email }, 'name', 50) : [],
    enabled: !!user,
    initialData: [],
  });

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      if (filterType !== 'all' && t.category !== filterType) return false;
      return true;
    });
  }, [tasks, filterStatus, filterType]);

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Item.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
  });

  const jarFill = (tasks.filter(t => t.status === 'Done').length % 10) * 10;
  const completedJars = Math.floor(tasks.filter(t => t.status === 'Done').length / 10);

  const deleteTask = async (task) => {
    await base44.entities.Item.delete(task.id);
    queryClient.invalidateQueries({ queryKey: ['items'] });
    toast.success('Task deleted', {
      action: {
        label: 'Undo',
        onClick: async () => {
          const { id, created_date, updated_date, ...restData } = task;
          await base44.entities.Item.create(restData);
          queryClient.invalidateQueries({ queryKey: ['items'] });
          toast.success('Task restored');
        },
      },
    });
  };

  const openDetail = (taskId, e) => {
    if (e) e.stopPropagation();
    navigate(`/tasks/${taskId}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="mono-header text-lg md:text-xl text-foreground">{t('tasks')}</h1>
          <p className="text-sm text-muted-foreground mt-1" aria-live="polite" aria-atomic="true">{filtered.length} {t('tasks').toLowerCase()}</p>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:block">
          <JarVisual fillPercent={jarFill} completedJars={completedJars} size="sm" label={t('completed')} />
          </div>
          {/* View toggle */}
          <div className="flex bg-muted rounded-lg p-1 gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-card text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title="List view"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded transition-all ${viewMode === 'board' ? 'bg-card text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              title="Board view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-primary text-primary-foreground rounded-xl font-mono text-sm neon-glow-hover min-h-[44px]"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">NEW </span>TASK
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 md:gap-3 flex-wrap">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 bg-card border-border font-mono text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_statuses')}</SelectItem>
            {TASK_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40 bg-card border-border font-mono text-sm"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_types')}</SelectItem>
            {TASK_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Board view */}
      {viewMode === 'board' && (
        <TasksBoardView
          tasks={tasks}
          projects={projects}
          onAddTask={(status) => { setBoardInitialStatus(status); setShowForm(true); }}
        />
      )}

      {/* Task list */}
      {viewMode === 'list' && <div className="space-y-2">
      <QueryStateWrapper isLoading={tasksLoading && tasks.length === 0} error={tasksError} onRetry={refetchTasks} skeletonCount={4} skeletonHeight="h-[72px]">
        <AnimatePresence>
          {filtered.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/20 transition-all group cursor-pointer"
              onClick={(e) => openDetail(task.id, e)}
            >
              <div className="flex items-start gap-3">
                {/* Status dot / checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = task.status === 'Done' ? 'Planned' : 'Done';
                    updateStatus.mutate({ id: task.id, status: next });
                  }}
                  className="mt-1 w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all"
                  style={{ borderColor: STATUS_COLORS[task.status], background: task.status === 'Done' ? STATUS_COLORS['Done'] : 'transparent' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${task.status === 'Done' ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </p>
                    {task.priority >= 4 && <span className="text-destructive text-xs">●</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0" style={{ borderColor: STATUS_COLORS[task.status] + '40', color: STATUS_COLORS[task.status] }}>
                      {task.status}
                    </Badge>
                    {/* Project name — never show raw UUID */}
                    {task.for_whom && !task.for_whom.match(/^[0-9a-f]{20,}$/) && (
                      <span className="font-mono text-[10px] text-muted-foreground">{task.for_whom}</span>
                    )}
                    {task.category && !task.category.match(/^[0-9a-f]{20,}$/) && (
                      <span className="font-mono text-[10px] text-muted-foreground">{task.category}</span>
                    )}
                    {/* Show project name if linked — never show raw UUID */}
                    {task.tags?.find(t => t.startsWith('project:')) && (() => {
                      const projId = task.tags.find(t => t.startsWith('project:')).replace('project:', '');
                      const name = getProjectName(projId, projects);
                      return <span className="font-mono text-[10px] text-primary/70">{name !== '—' ? name : ''}</span>;
                    })()}
                    {task.deadline && (
                      <span className="font-mono text-[10px] text-muted-foreground">Due {format(new Date(task.deadline), 'MMM d')}</span>
                    )}
                  </div>
                  {(() => {
                    try {
                      const meta = JSON.parse(task.note || '{}');
                      const steps = meta.steps || [];
                      if (steps.length > 0) {
                        const doneCount = steps.filter(s => s.done).length;
                        return (
                          <div className="flex items-center gap-3 mt-1">
                            <p className="font-mono text-[10px] text-muted-foreground">{doneCount}/{steps.length} steps</p>
                            <div className="h-1 bg-muted rounded-full overflow-hidden w-24">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${steps.length ? (doneCount / steps.length) * 100 : 0}%` }} />
                            </div>
                          </div>
                        );
                      }
                    } catch {}
                    return task.subtasks?.length > 0 ? (
                      <p className="font-mono text-[10px] text-muted-foreground mt-1">
                        {task.subtasks.filter(s => s.done).length}/{task.subtasks.length} subtasks
                      </p>
                    ) : null;
                  })()}
                </div>

                {/* Three-dot menu */}
                <div onClick={e => e.stopPropagation()}>
                  <TaskCardMenu task={task} onEdit={(t) => navigate(`/tasks/${t.id}`)} />
                </div>

                {/* Chevron */}
                <ChevronRight
                  className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0 mt-0.5"
                  onClick={(e) => openDetail(task.id, e)}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && tasks.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <p className="font-mono text-sm text-foreground mb-1">{t('no_tasks')}</p>
            <p className="text-muted-foreground text-sm mb-4">{t('create_first_task')}</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-mono text-sm"
            >
              + {t('new_task')}
            </button>
          </div>
        )}
        {filtered.length === 0 && tasks.length > 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">No tasks match the current filters.</p>
        )}
        {filtered.length > 0 && tasks.length > 0 && tasks.every(t => t.status === 'Done') && (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">🎉</div>
            <p className="font-mono text-xs text-muted-foreground">All tasks completed!</p>
          </div>
        )}
      </QueryStateWrapper>
      </div>}


      {showForm && (
        <TaskForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['items'] }); }}
        />
      )}
    </div>
  );
}