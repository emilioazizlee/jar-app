import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function ClearDataModal({ onClose }) {
  const queryClient = useQueryClient();
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [done, setDone] = useState(false);

  const handleClear = async () => {
    if (confirmText !== 'DELETE') return;
    setDeleting(true);
    const items = await base44.entities.Item.list('-created_date', 9999);
    for (const item of items) {
      await base44.entities.Item.delete(item.id);
    }
    queryClient.invalidateQueries({ queryKey: ['items'] });
    setDeleting(false);
    setDone(true);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm text-red-400">CLEAR ALL DATA</DialogTitle>
        </DialogHeader>
        {!done ? (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">This will permanently delete all your entries, tasks, subscriptions, and payments. This action cannot be undone.</p>
            <p className="font-mono text-xs text-red-400">Type <strong>DELETE</strong> to confirm:</p>
            <Input
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="bg-muted border-none font-mono"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                onClick={handleClear}
                disabled={confirmText !== 'DELETE' || deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-mono"
              >
                {deleting ? 'DELETING...' : 'Delete Everything'}
              </Button>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-3">
            <p className="font-mono text-primary text-lg">✓ All data cleared</p>
            <Button onClick={onClose} className="bg-primary text-primary-foreground font-mono">Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}