import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, GripVertical, X, ArrowUpDown, Clock } from 'lucide-react';

const STEP_STATUS_COLORS = {
  pending: '#4a4a4a',
  active: '#ffd60a',
  done: '#39ff14',
};

const emptyStep = () => ({
  id: Date.now().toString() + Math.random(),
  name: '',
  priority: 3,
  duration: '',
  scheduled_time: '',
  status: 'pending',
  notes: '',
});

export default function StepSequencer({ steps = [], onChange }) {
  const [expandedStep, setExpandedStep] = useState(null);

  const addStep = () => {
    const s = emptyStep();
    onChange([...steps, s]);
    setExpandedStep(s.id);
  };

  const updateStep = (id, k, v) => {
    onChange(steps.map(s => s.id === id ? { ...s, [k]: v } : s));
  };

  const removeStep = (id) => {
    onChange(steps.filter(s => s.id !== id));
    if (expandedStep === id) setExpandedStep(null);
  };

  const markDone = (id) => {
    updateStep(id, 'status', steps.find(s => s.id === id)?.status === 'done' ? 'pending' : 'done');
  };

  const sortByPriority = () => {
    onChange([...steps].sort((a, b) => b.priority - a.priority));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const arr = Array.from(steps);
    const [moved] = arr.splice(result.source.index, 1);
    arr.splice(result.destination.index, 0, moved);
    onChange(arr);
  };

  const totalMinutes = steps.reduce((sum, s) => sum + (Number(s.duration) || 0), 0);
  const activeSteps = steps.filter(s => s.status !== 'done');
  const doneSteps = steps.filter(s => s.status === 'done');

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground">STEPS ({steps.length})</span>
          {totalMinutes > 0 && (
            <span className="flex items-center gap-1 font-mono text-xs text-secondary">
              <Clock className="w-3 h-3" />{totalMinutes}m total
            </span>
          )}
        </div>
        {steps.length > 1 && (
          <button
            onClick={sortByPriority}
            className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowUpDown className="w-3 h-3" /> SORT BY PRIORITY
          </button>
        )}
      </div>

      {/* Active steps */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="steps">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1.5">
              <AnimatePresence>
                {activeSteps.map((step, i) => (
                  <Draggable key={step.id} draggableId={step.id} index={steps.indexOf(step)}>
                    {(drag, snapshot) => (
                      <div
                        ref={drag.innerRef}
                        {...drag.draggableProps}
                        className={`bg-muted/60 border rounded-xl overflow-hidden transition-all ${snapshot.isDragging ? 'border-primary/50 shadow-lg' : 'border-border/50'}`}
                      >
                        {/* Step row */}
                        <div className="flex items-center gap-2 px-3 py-2">
                          <div {...drag.dragHandleProps} className="text-muted-foreground/40 hover:text-muted-foreground cursor-grab">
                            <GripVertical className="w-3 h-3" />
                          </div>
                          {/* Status dot */}
                          <button
                            onClick={() => markDone(step.id)}
                            className="w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all"
                            style={{
                              borderColor: STEP_STATUS_COLORS[step.status],
                              background: step.status === 'done' ? STEP_STATUS_COLORS.done : 'transparent'
                            }}
                          />
                          {/* Step number */}
                          <span className="font-mono text-[10px] text-muted-foreground w-4 text-center">{i + 1}</span>
                          {/* Name input */}
                          <Input
                            value={step.name}
                            onChange={e => updateStep(step.id, 'name', e.target.value)}
                            placeholder="Step name..."
                            className="flex-1 bg-transparent border-none h-7 text-sm p-0 font-medium focus-visible:ring-0"
                          />
                          {/* Priority badge */}
                          <span
                            className="font-mono text-[10px] w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                            style={{
                              background: step.priority >= 4 ? '#ff2d2d20' : step.priority >= 3 ? '#ffd60a20' : '#ffffff10',
                              color: step.priority >= 4 ? '#ff2d2d' : step.priority >= 3 ? '#ffd60a' : '#7a7a7a'
                            }}
                          >
                            {step.priority}
                          </span>
                          {step.duration && (
                            <span className="font-mono text-[10px] text-muted-foreground">{step.duration}m</span>
                          )}
                          <button
                            onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                            className="text-muted-foreground/40 hover:text-muted-foreground text-[10px] font-mono transition-colors"
                          >
                            {expandedStep === step.id ? '▲' : '▼'}
                          </button>
                          <button onClick={() => removeStep(step.id)} className="text-muted-foreground/30 hover:text-destructive transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Expanded detail */}
                        <AnimatePresence>
                          {expandedStep === step.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-border/40 px-3 py-3 grid grid-cols-2 gap-3"
                            >
                              <div>
                                <span className="font-mono text-[10px] text-muted-foreground">PRIORITY</span>
                                <Select value={String(step.priority)} onValueChange={v => updateStep(step.id, 'priority', Number(v))}>
                                  <SelectTrigger className="bg-muted border-none mt-1 h-8 font-mono text-xs"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={String(n)}>{n} — {['lowest','low','medium','high','critical'][n-1]}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <span className="font-mono text-[10px] text-muted-foreground">DURATION (min)</span>
                                <Input
                                  type="number"
                                  value={step.duration}
                                  onChange={e => updateStep(step.id, 'duration', e.target.value)}
                                  className="bg-muted border-none mt-1 h-8 font-mono text-sm"
                                  placeholder="30"
                                />
                              </div>
                              <div>
                                <span className="font-mono text-[10px] text-muted-foreground">TIME SLOT</span>
                                <Input
                                  type="time"
                                  value={step.scheduled_time}
                                  onChange={e => updateStep(step.id, 'scheduled_time', e.target.value)}
                                  className="bg-muted border-none mt-1 h-8 font-mono text-sm"
                                />
                              </div>
                              <div>
                                <span className="font-mono text-[10px] text-muted-foreground">STATUS</span>
                                <Select value={step.status} onValueChange={v => updateStep(step.id, 'status', v)}>
                                  <SelectTrigger className="bg-muted border-none mt-1 h-8 font-mono text-xs"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="done">Done</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="col-span-2">
                                <span className="font-mono text-[10px] text-muted-foreground">NOTES</span>
                                <Input
                                  value={step.notes}
                                  onChange={e => updateStep(step.id, 'notes', e.target.value)}
                                  className="bg-muted border-none mt-1 h-8 text-sm"
                                  placeholder="Notes..."
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </Draggable>
                ))}
              </AnimatePresence>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Done steps */}
      {doneSteps.length > 0 && (
        <div className="space-y-1 opacity-50">
          <span className="font-mono text-[10px] text-muted-foreground">COMPLETED</span>
          {doneSteps.map(step => (
            <div key={step.id} className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-lg">
              <button
                onClick={() => markDone(step.id)}
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ background: STEP_STATUS_COLORS.done }}
              />
              <span className="text-sm line-through text-muted-foreground flex-1">{step.name}</span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={addStep}
        className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors w-full justify-center py-2 border border-dashed border-border/50 rounded-xl hover:border-primary/30"
      >
        <Plus className="w-3 h-3" /> ADD STEP
      </button>
    </div>
  );
}