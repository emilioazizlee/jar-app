import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit2, Copy, CheckCircle, Circle, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function TaskCardMenu({ task, onEdit }) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [undoTask, setUndoTask] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const menuRef = useRef();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['items'] });

  const handleDuplicate = async () => {
    setOpen(false);
    const { id, created_date, updated_date, created_by, ...rest } = task;
    await base44.entities.Item.create({ ...rest, title: rest.title + ' (copy)' });
    invalidate();
  };

  const handleToggleDone = async () => {
    setOpen(false);
    const next = task.status === 'Done' ? 'Planned' : 'Done';
    await base44.entities.Item.update(task.id, { status: next });
    invalidate();
  };

  const handleDeleteConfirm = async () => {
    setConfirmDelete(false);
    // Store for undo
    const { id, created_date, updated_date, created_by, ...rest } = task;
    setUndoTask({ ...rest, _deletedId: id });
    await base44.entities.Item.delete(task.id);
    invalidate();
    setToastVisible(true);
    setTimeout(() => { setToastVisible(false); setUndoTask(null); }, 5000);
  };

  const handleUndo = async () => {
    if (!undoTask) return;
    setToastVisible(false);
    const { _deletedId, ...rest } = undoTask;
    await base44.entities.Item.create(rest);
    invalidate();
    setUndoTask(null);
  };

  return (
    <>
      <div ref={menuRef} className="relative flex-shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 z-30 bg-card border border-border rounded-xl shadow-xl py-1 min-w-[160px]">
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(task); }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-sm transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-muted-foreground" /> Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDuplicate(); }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-sm transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-muted-foreground" /> Duplicate
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleToggleDone(); }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-sm transition-colors"
            >
              {task.status === 'Done'
                ? <><Circle className="w-3.5 h-3.5 text-muted-foreground" /> Mark as Planned</>
                : <><CheckCircle className="w-3.5 h-3.5 text-primary" /> Mark as Done</>
              }
            </button>
            <div className="h-px bg-border my-1" />
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); setConfirmDelete(true); }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-destructive/10 text-sm text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setConfirmDelete(false)}>
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-foreground mb-2">Delete this task?</h3>
            <p className="text-sm text-muted-foreground mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2 rounded-xl border border-border font-mono text-sm hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 rounded-xl bg-destructive text-white font-mono text-sm hover:bg-destructive/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Undo toast */}
      {toastVisible && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-2.5 shadow-xl">
          <span className="text-sm font-mono text-foreground">Task deleted</span>
          <button onClick={handleUndo} className="font-mono text-xs text-primary hover:underline">Undo</button>
        </div>
      )}
    </>
  );
}