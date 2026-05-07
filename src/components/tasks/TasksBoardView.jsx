import React, { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { TASK_STATUSES } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS = {
  'Idea': '#7a7a7a',
  'Planned': '#4da6ff',
  'In Progress': '#ffd60a',
  'Blocked': '#ff2d2d',
  'Done': '#39ff14',
  'Archived': '#3a3a3a',
};

const COLUMNS = ['Planned', 'In Progress', 'Blocked', 'Done'];

export default function TasksBoardView({ tasks, projects, onAddTask }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Item.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
  });

  const tasksByStatus = (status) => tasks.filter(t => t.status === status);

  const handleDragStart = (e, taskId) => {
    setDraggingId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(status);
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    if (draggingId) {
      updateStatus.mutate({ id: draggingId, status });
    }
    setDraggingId(null);
    setDragOverCol(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverCol(null);
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1">
      {COLUMNS.map(status => (
        <div
          key={status}
          className={`flex-shrink-0 w-64 flex flex-col rounded-xl border transition-all ${
            dragOverCol === status ? 'border-primary/40 bg-primary/5' : 'border-border bg-muted/20'
          }`}
          onDragOver={e => handleDragOver(e, status)}
          onDrop={e => handleDrop(e, status)}
          onDragLeave={() => setDragOverCol(null)}
        >
          {/* Column header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[status] }} />
              <span className="font-mono text-xs text-foreground">{status}</span>
              <span className="font-mono text-[10px] text-muted-foreground">({tasksByStatus(status).length})</span>
            </div>
            <button
              onClick={() => onAddTask(status)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cards */}
          <div className="flex-1 p-2 space-y-2 min-h-[200px]">
            {tasksByStatus(status).map(task => (
              <motion.div
                key={task.id}
                layout
                draggable
                onDragStart={e => handleDragStart(e, task.id)}
                onDragEnd={handleDragEnd}
                onClick={() => navigate(`/tasks/${task.id}`)}
                className={`bg-card border border-border rounded-lg p-3 cursor-pointer hover:border-primary/20 transition-all select-none ${
                  draggingId === task.id ? 'opacity-40' : ''
                }`}
              >
                <p className={`text-sm font-medium leading-snug ${task.status === 'Done' ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </p>
                {task.deadline && (
                  <p className="font-mono text-[10px] text-muted-foreground mt-1">
                    Due {format(new Date(task.deadline), 'MMM d')}
                  </p>
                )}
                {task.category && (
                  <span className="font-mono text-[10px] text-muted-foreground">{task.category}</span>
                )}
              </motion.div>
            ))}

            {tasksByStatus(status).length === 0 && (
              <div className="flex items-center justify-center h-20">
                <p className="font-mono text-[10px] text-muted-foreground/50">Drop here</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}