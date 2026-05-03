import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TASK_STATUSES, TASK_TYPES } from '@/lib/constants';
import JarVisual from '@/components/jar/JarVisual';
import TaskForm from '@/components/forms/TaskForm';
import { Plus, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_COLORS = {
  'Idea': '#7a7a7a',
  'Planned': '#4da6ff',
  'In Progress': '#ffd60a',
  'Blocked': '#ff2d2d',
  'Done': '#39ff14',
  'Archived': '#3a3a3a',
};

export default function Tasks() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const { data: tasks = [] } = useQuery({
    queryKey: ['items', 'tasks'],
    queryFn: () => base44.entities.Item.filter({ type: 'task' }, '-created_date', 200),
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mono-header text-xl text-foreground">TASKS</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} tasks</p>
        </div>
        <div className="flex items-center gap-4">
          <JarVisual fillPercent={jarFill} completedJars={completedJars} size="sm" label="completed" />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-mono text-sm neon-glow-hover"
          >
            <Plus className="w-4 h-4" /> NEW TASK
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 bg-card border-border font-mono text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {TASK_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40 bg-card border-border font-mono text-sm"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {TASK_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/20 transition-all group"
            >
              <div className="flex items-start gap-3">
                {/* Status dot */}
                <button
                  onClick={() => {
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
                    {task.category && (
                      <span className="font-mono text-[10px] text-muted-foreground">{task.category}</span>
                    )}
                    {task.deadline && (
                      <span className="font-mono text-[10px] text-muted-foreground">Due {format(new Date(task.deadline), 'MMM d')}</span>
                    )}
                  </div>
                  {task.progress > 0 && (
                    <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden w-32">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                    </div>
                  )}
                  {(() => {
                    try {
                      const desc = JSON.parse(task.description || '{}');
                      const steps = desc.steps || [];
                      if (steps.length > 0) {
                        const doneCount = steps.filter(s => s.status === 'done').length;
                        const totalMin = steps.reduce((sum, s) => sum + (Number(s.duration) || 0), 0);
                        return (
                          <div className="flex items-center gap-3 mt-1">
                            <p className="font-mono text-[10px] text-muted-foreground">{doneCount}/{steps.length} steps</p>
                            {totalMin > 0 && <p className="font-mono text-[10px] text-muted-foreground">{totalMin}m</p>}
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
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">No tasks found. Create your first task!</p>
        )}
      </div>

      {showForm && <TaskForm open={showForm} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['items'] }); }} />}
    </div>
  );
}