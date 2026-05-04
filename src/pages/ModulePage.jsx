import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import TaskForm from '@/components/forms/TaskForm';
import QuickItemForm from '@/components/forms/QuickItemForm';
import JarVisual from '@/components/jar/JarVisual';
import { format } from 'date-fns';

export default function ModulePage({ moduleTitle, filterCategory, itemType = 'task', color = '#39ff14' }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: items = [] } = useQuery({
    queryKey: ['items', moduleTitle],
    queryFn: () => base44.entities.Item.filter(
      filterCategory ? { category: filterCategory } : { type: itemType },
      '-created_date', 200
    ),
    initialData: [],
  });

  const deleteItem = useMutation({
    mutationFn: (id) => base44.entities.Item.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mono-header text-xl text-foreground">{moduleTitle}</h1>
          <p className="text-sm text-muted-foreground mt-1">{items.length} entries</p>
        </div>
        <div className="flex items-center gap-4">
          <JarVisual
            fillPercent={(items.length % 10) * 10}
            completedJars={Math.floor(items.length / 10)}
            size="sm"
            color={color}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm text-white"
            style={{ background: color }}
          >
            <Plus className="w-4 h-4" /> ADD
          </motion.button>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-card border border-border rounded-xl p-4 hover:border-primary/20 transition-all flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.title}</p>
              <p className="font-mono text-[10px] text-muted-foreground">
                {item.date ? format(new Date(item.date), 'MMM d, yyyy') : format(new Date(item.created_date), 'MMM d')}
                {item.status ? ` · ${item.status}` : ''}
                {item.note ? ` · ${item.note}` : ''}
              </p>
            </div>
            {item.amount && (
              <span className="font-mono text-sm font-semibold" style={{ color }}>
                €{item.amount}
              </span>
            )}
            <button onClick={() => deleteItem.mutate(item.id)} className="p-1 rounded hover:bg-muted transition-colors">
              <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
            </button>
          </motion.div>
        ))}
        {items.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">No entries yet</p>
        )}
      </div>

      {showForm && itemType === 'task' && (
        <TaskForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['items'] }); }}
          initialCategory={filterCategory}
        />
      )}
      {showForm && itemType !== 'task' && (
        <QuickItemForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['items'] }); }}
          itemType={itemType}
        />
      )}
    </div>
  );
}