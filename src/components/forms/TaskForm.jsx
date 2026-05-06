import React, { useState, useEffect, useCallback } from 'react';
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { TASK_TYPES, TASK_STATUSES } from '@/lib/constants';
import { format } from 'date-fns';
import StepSequencer from '@/components/tasks/StepSequencer';
import SmartInput from '@/components/learn/SmartInput';
import StepTemplatePrompt from '@/components/learn/StepTemplatePrompt';
import {
  recordFieldValue,
  recordMultipleValues,
  recordCategoryPriority,
  saveStepTemplate,
  findSimilarTemplate,
  getDefaultPriorityForCategory,
} from '@/lib/learningDB';

export default function TaskForm({ open, onClose, onSaved, initialCategory }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [templateSuggestion, setTemplateSuggestion] = useState(null);
  const [dismissedTemplate, setDismissedTemplate] = useState(false);
  const [form, setForm] = useState(() => ({
    title: '',
    category: initialCategory || 'Personal',
    status: 'Planned',
    priority: getDefaultPriorityForCategory(initialCategory || 'Personal'),
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
  }));
  const [tagInput, setTagInput] = useState('');
  const [subtaskInput, setSubtaskInput] = useState('');
  const [showSaveTemplateToast, setShowSaveTemplateToast] = useState(false);

  // When category changes, update default priority
  const update = (k, v) => setForm(prev => {
    const next = { ...prev, [k]: v };
    if (k === 'category') {
      next.priority = getDefaultPriorityForCategory(v);
    }
    return next;
  });

  // Suggest step template when title changes
  useEffect(() => {
    if (!dismissedTemplate && form.title.length > 3 && form.steps.length === 0) {
      const t = findSimilarTemplate(form.title, form.category);
      setTemplateSuggestion(t);
    } else if (form.steps.length > 0) {
      setTemplateSuggestion(null);
    }
  }, [form.title, form.category]);

  const applyTemplate = (template) => {
    const steps = template.steps.map(s => ({
      ...s,
      id: Date.now().toString() + Math.random(),
      status: 'pending',
    }));
    update('steps', steps);
    setTemplateSuggestion(null);
    setDismissedTemplate(true);
  };

  const addTag = () => {
    if (tagInput.trim()) {
      update('tags', [...form.tags, tagInput.trim()]);
      recordFieldValue('task_tag', tagInput.trim());
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

    // Record learned values
    recordFieldValue('task_title', form.title);
    recordFieldValue('task_category', form.category);
    recordFieldValue('for_whom', form.for_whom);
    recordFieldValue('assigned_by', form.assigned_by);
    recordCategoryPriority(form.category, form.priority);
    if (form.tags.length) recordMultipleValues('task_tag', form.tags);
    if (form.steps.length > 1) saveStepTemplate(form.title, form.category, form.steps);

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
    // Offer to save step template if 3+ steps
    if (form.steps.length >= 3) {
      setShowSaveTemplateToast(true);
    } else {
      onSaved();
    }
  };

  // Step template save toast
  if (showSaveTemplateToast) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="mono-header text-sm text-primary">SAVE STEP TEMPLATE?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">Save these {form.steps.length} steps as a reusable template for future tasks?</p>
            <div className="flex gap-2">
              <button
                onClick={() => { saveStepTemplate(form.title, form.category, form.steps); setShowSaveTemplateToast(false); onSaved(); }}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-mono text-sm hover:bg-primary/90 transition-colors"
              >
                Save Template
              </button>
              <button
                onClick={() => { setShowSaveTemplateToast(false); onSaved(); }}
                className="flex-1 py-2.5 rounded-xl bg-muted font-mono text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg w-full p-0 gap-0 flex flex-col rounded-none sm:rounded-xl h-full sm:h-auto max-h-[100dvh] sm:max-h-[85vh] overflow-hidden">
        {/* Sticky header */}
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
          <DialogTitle className="mono-header text-sm text-primary">New Task</DialogTitle>
        </DialogHeader>
        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 overscroll-contain">
        <div className="space-y-4 pb-2">
          <div>
            <SmartInput
              fieldKey="task_title"
              value={form.title}
              onChange={v => update('title', v)}
              placeholder="Task title..."
              className="bg-muted border-none text-lg font-medium"
              autoFocus
            />
          </div>

          {/* Step template suggestion */}
          <AnimatePresence>
            {templateSuggestion && !dismissedTemplate && (
              <StepTemplatePrompt
                template={templateSuggestion}
                onApply={() => applyTemplate(templateSuggestion)}
                onDismiss={() => { setTemplateSuggestion(null); setDismissedTemplate(true); }}
              />
            )}
          </AnimatePresence>

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
              <Input type="date" value={form.start_date} onChange={e => update('start_date', e.target.value)} className="bg-muted border-none mt-1 font-mono text-sm" lang="en" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground font-mono">DEADLINE</Label>
              <Input type="date" value={form.deadline} onChange={e => update('deadline', e.target.value)} className="bg-muted border-none mt-1 font-mono text-sm" lang="en" />
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
                  <SmartInput
                    fieldKey="for_whom"
                    value={form.for_whom}
                    onChange={v => update('for_whom', v)}
                    className="bg-muted border-none mt-1"
                    showChips
                    chipsLimit={3}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground font-mono">ASSIGNED BY</Label>
                  <SmartInput
                    fieldKey="assigned_by"
                    value={form.assigned_by}
                    onChange={v => update('assigned_by', v)}
                    className="bg-muted border-none mt-1"
                    showChips
                    chipsLimit={3}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground font-mono">EXPECTED OUTPUT</Label>
                <Textarea value={form.expected_output} onChange={e => update('expected_output', e.target.value)} className="bg-muted border-none mt-1" rows={2} />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground font-mono">TAGS</Label>
                <div className="flex gap-2 mt-1">
                  <SmartInput
                    fieldKey="task_tag"
                    value={tagInput}
                    onChange={setTagInput}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tag..."
                    className="bg-muted border-none text-sm"
                    showChips
                    chipsLimit={4}
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

        </div>
        </div>
        {/* Sticky footer */}
        <div className="px-5 pt-3 pb-5 border-t border-border shrink-0 bg-card">
          <Button onClick={handleSave} disabled={saving || !form.title.trim()} className="w-full bg-primary text-primary-foreground font-mono hover:bg-primary/90">
            {saving ? 'SAVING...' : 'SAVE TASK'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}