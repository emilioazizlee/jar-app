import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Trash2 } from 'lucide-react';
import { PALETTE } from '@/lib/constants';
import { format } from 'date-fns';

export default function GoalCard({ goal, onRefresh }) {
  const [adding, setAdding] = useState('');
  const [saving, setSaving] = useState(false);

  const pct = Math.min(100, Math.round(((goal.saved_amount || 0) / (goal.target_amount || 1)) * 100));

  const handleAdd = async () => {
    if (!adding) return;
    setSaving(true);
    await base44.entities.FinanceGoal.update(goal.id, {
      saved_amount: (goal.saved_amount || 0) + Number(adding),
    });
    setAdding('');
    setSaving(false);
    onRefresh();
  };

  const handleDelete = async () => {
    await base44.entities.FinanceGoal.delete(goal.id);
    onRefresh();
  };

  const handleComplete = async () => {
    await base44.entities.FinanceGoal.update(goal.id, { is_completed: true });
    onRefresh();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {goal.icon && <span className="text-lg">{goal.icon}</span>}
          <div>
            <p className="font-mono text-sm font-medium text-foreground">{goal.title}</p>
            {goal.target_date && (
              <p className="font-mono text-[10px] text-muted-foreground">Target: {format(new Date(goal.target_date), 'MMM d, yyyy')}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-primary font-bold">€{(goal.saved_amount || 0).toFixed(0)} / €{(goal.target_amount || 0).toFixed(0)}</span>
          <button onClick={handleComplete} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors" title="Mark complete">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleDelete} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: pct >= 100 ? PALETTE.green : PALETTE.blue }}
        />
      </div>

      <div className="flex items-center gap-2">
        <Input
          inputMode="decimal"
          type="text"
          value={adding}
          onChange={e => setAdding(e.target.value.replace(/[^0-9.]/g, ''))}
          placeholder="Add amount..."
          className="bg-muted border-none h-8 text-sm font-mono"
        />
        <Button onClick={handleAdd} disabled={saving || !adding} size="sm" className="bg-primary text-primary-foreground font-mono text-xs h-8">
          ADD
        </Button>
      </div>
    </div>
  );
}