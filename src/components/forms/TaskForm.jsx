import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { TASK_TYPES, TASK_STATUSES } from '@/lib/constants';
import { format } from 'date-fns';
import StepSequencer from '@/components/tasks/StepSequencer';

export default function TaskForm({ open, onClose, onSaved }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: 'Personal',
    status: 'Planned',
    priority: 3,
    progress: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    deadline: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    duration_estimate: '',
    recurring: 'none',
    description: '',
    for_whom: '',
    assigned_by: '',
    expected_output: '',
    tags: [],
    subtasks: [],
    steps: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [subtaskInput, setSubtaskInput] = useState('');

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const addTag = () => {
    if (tagInput.trim()) {
      update('tags', [...form.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const addSubtask = () => {
    if (subtaskInput.trim()) {
      update('subtasks', [...form.subtasks, { text: subtaskInput.trim(), done: false }]);
      setSubtaskInput('');
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await base44.entities.Item.create({
      type: 'task',
      title: form.title,
      category: form.category,
      status: form.status,
      priority: form.priority,
      progress: form.progress,
      date: form.date,
      deadline: form.deadline || undefined,
      start_date: form.start_date,
      duration_estimate: form.duration_estimate ? Number(form.duration_estimate) : undefined,
      recurring: form.recurring,
      description: form.description,
      for_whom: form.for_whom,
      assigned_by: form.assigned_by,
      expected_output: form.expected_output,
      tags: form.tags.length ? form.tags : undefined,
      subtasks: form.subtasks.length ? form.subtasks : undefined,
      description: form.steps.length ? JSON.stringify({ steps: form.steps }) : form.description,
    });
    queryClient.invalidateQueries({ queryKey: ['items'] });
    queryClient.invalidateQueries({ queryKey: ['items-month'] });
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="mono-header text-sm text-primary">New Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Input
              placeholder="Task title..."
              value={form.title}
              onChange={e => update('title', e.target.value)}
              className="bg-muted border-none text-lg font-medium"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground font-mono">TYPE</Label>
              <Select value={form.category} onValueChange={v => update('category', v)}>
                <SelectTrigger className="bg-muted border-none mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TASK_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground font-mono">STATUS</Label>
              <Select value={form.status} onValueChange={v => update('status', v)}>
                <SelectTrigger className="bg-muted border-none mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground font-mono">PRIORITY ({form.priority})</Label>
            <Slider
              value={[form.priority]}
              onValueChange={([v]) => update('priority', v)}
              min={1} max={5} step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground font-mono">PROGRESS ({form.progress}%)</Label>
            <Slider
              value={[form.progress]}
              onValueChange={([v]) => update('progress', v)}
              min={0} max={100} step={5}
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground font-mono">START DATE</Label>
              <Input type="date" value={form.start_date} onChange={e => update('start_date', e.target.value)} className="bg-muted border-none mt-1 font-mono text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground font-mono">DEADLINE</Label>
              <Input type="date" value={form.deadline} onChange={e => update('deadline', e.target.value)} className="bg-muted border-none mt-1 font-mono text-sm" />
            </div>
          </div>

          {/* Step Sequencer */}
          <div className="border-t border-border pt-4">
            <StepSequencer steps={form.steps} onChange={v => update('steps', v)} />
          </div>

          {/* Subtasks */}
          <div>
            <Label className="text-xs text-muted-foreground font-mono">SUBTASKS</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Add subtask..."
                value={subtaskInput}
                onChange={e => setSubtaskInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                className="bg-muted border-none text-sm"
              />
              <Button size="sm" variant="ghost" onClick={addSubtask}><Plus className="w-4 h-4" /></Button>
            </div>
            {form.subtasks.map((st, i) => (
              <div key={i} className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <span>•</span><span>{st.text}</span>
                <button onClick={() => update('subtasks', form.subtasks.filter((_, j) => j !== i))} className="ml-auto"><X className="w-3 h-3" /></button>
              </div>
            ))}
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-2"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            <span className="font-mono">{expanded ? 'LESS' : 'MORE OPTIONS'}</span>
          </button>

          {expanded && (
            <div className="space-y-4 border-t border-border pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground font-mono">DURATION (hours)</Label>
                  <Input type="number" value={form.duration_estimate} onChange={e => update('duration_estimate', e.target.value)} className="bg-muted border-none mt-1 font-mono" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground font-mono">RECURRING</Label>
                  <Select value={form.recurring} onValueChange={v => update('recurring', v)}>
                    <SelectTrigger className="bg-muted border-none mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['none', 'daily', 'weekly', 'monthly', 'custom'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground font-mono">DESCRIPTION</Label>
                <Textarea value={form.description} onChange={e => update('description', e.target.value)} className="bg-muted border-none mt-1" rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground font-mono">FOR WHOM</Label>
                  <Input value={form.for_whom} onChange={e => update('for_whom', e.target.value)} className="bg-muted border-none mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground font-mono">ASSIGNED BY</Label>
                  <Input value={form.assigned_by} onChange={e => update('assigned_by', e.target.value)} className="bg-muted border-none mt-1" />
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground font-mono">EXPECTED OUTPUT</Label>
                <Textarea value={form.expected_output} onChange={e => update('expected_output', e.target.value)} className="bg-muted border-none mt-1" rows={2} />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground font-mono">TAGS</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="bg-muted border-none text-sm"
                  />
                  <Button size="sm" variant="ghost" onClick={addTag}><Plus className="w-4 h-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.tags.map((tag, i) => (
                    <span key={i} className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-mono px-2 py-0.5 rounded-full">
                      {tag}
                      <button onClick={() => update('tags', form.tags.filter((_, j) => j !== i))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <Button onClick={handleSave} disabled={saving || !form.title.trim()} className="w-full bg-primary text-primary-foreground font-mono hover:bg-primary/90">
            {saving ? 'SAVING...' : 'SAVE TASK'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}