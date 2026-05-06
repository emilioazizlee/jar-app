import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, ChevronDown, Paperclip, X, Check, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { getProjectName } from '@/lib/labelUtils';
import ReactMarkdown from 'react-markdown';

const STATUS_COLORS = {
  'Idea': '#7a7a7a',
  'Planned': '#4da6ff',
  'In Progress': '#ffd60a',
  'Blocked': '#ff2d2d',
  'Done': '#39ff14',
  'Archived': '#3a3a3a',
};
const STATUSES = ['Idea', 'Planned', 'In Progress', 'Blocked', 'Done', 'Archived'];
const PRIORITIES = [
  { label: 'Low',      color: '#7a7a7a', val: 1 },
  { label: 'Medium',   color: '#ffd60a', val: 2 },
  { label: 'High',     color: '#ff6d00', val: 3 },
  { label: 'Critical', color: '#ff2d2d', val: 4 },
];

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Steps ────────────────────────────────────────────────────────────────────
function StepItem({ step, depth = 0, onChange, onDelete }) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(!step.text);
  const [text, setText] = useState(step.text || '');
  const [showAddSub, setShowAddSub] = useState(false);

  const update = (patch) => onChange({ ...step, ...patch });

  const addSubStep = () => {
    const newSub = { id: Date.now().toString(), text: '', done: false, children: [] };
    update({ children: [...(step.children || []), newSub] });
    setShowAddSub(false);
  };

  return (
    <div style={{ paddingLeft: depth * 20 }} className="space-y-1">
      <div className="group flex items-start gap-2 py-1.5">
        <button
          onClick={() => update({ done: !step.done })}
          className="mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all"
          style={{ borderColor: step.done ? '#39ff14' : '#3a3a3a', background: step.done ? '#39ff14' : 'transparent' }}
        >
          {step.done && <Check className="w-2.5 h-2.5 text-black" />}
        </button>
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              autoFocus
              className="w-full bg-transparent text-sm text-foreground border-b border-border/50 focus:border-primary/50 outline-none pb-0.5"
              value={text}
              onChange={e => setText(e.target.value)}
              onBlur={() => { update({ text }); setEditing(false); }}
              onKeyDown={e => { if (e.key === 'Enter') { update({ text }); setEditing(false); } }}
              placeholder="Step description..."
            />
          ) : (
            <p
              onClick={() => setEditing(true)}
              className={`text-sm cursor-text ${step.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}
            >
              {step.text || <span className="text-muted-foreground italic">Empty step</span>}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {step.deadline && (
              <span className="font-mono text-[10px] text-muted-foreground">📅 {format(new Date(step.deadline), 'MMM d')}</span>
            )}
            {step.assignee && (
              <span className="font-mono text-[10px] text-muted-foreground">👤 {step.assignee}</span>
            )}
            {step.duration && (
              <span className="font-mono text-[10px] text-muted-foreground">⏱ {step.duration}m</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => setShowAddSub(!showAddSub)}
            className="text-[10px] font-mono text-muted-foreground hover:text-primary px-1.5 py-0.5 rounded transition-colors"
          >
            +sub
          </button>
          <button
            onClick={() => onDelete(step.id)}
            className="p-0.5 hover:text-destructive text-muted-foreground transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {showAddSub && (
        <div style={{ paddingLeft: (depth + 1) * 20 }} className="flex gap-2 py-1">
          <button
            onClick={addSubStep}
            className="text-xs text-primary font-mono hover:underline"
          >
            + Add sub-step
          </button>
        </div>
      )}

      {(step.children || []).map((child) => (
        <StepItem
          key={child.id}
          step={child}
          depth={depth + 1}
          onChange={(updated) => update({ children: (step.children || []).map(c => c.id === updated.id ? updated : c) })}
          onDelete={(id) => update({ children: (step.children || []).filter(c => c.id !== id) })}
        />
      ))}
    </div>
  );
}

// ─── Activity Log ─────────────────────────────────────────────────────────────
function ActivityLog({ log = [] }) {
  return (
    <div className="space-y-2">
      {log.length === 0 && <p className="text-xs text-muted-foreground">No activity yet.</p>}
      {[...log].reverse().map((entry, i) => (
        <div key={i} className="flex items-start gap-3 py-1.5 border-b border-border/30 last:border-0">
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground flex-1">{entry.text}</p>
          <span className="font-mono text-[10px] text-muted-foreground/60 flex-shrink-0">{entry.ts}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Comments ─────────────────────────────────────────────────────────────────
function Comments({ comments = [], onAdd }) {
  const [text, setText] = useState('');
  return (
    <div className="space-y-3">
      {comments.map((c, i) => (
        <div key={i} className="bg-muted/30 rounded-xl p-3">
          <p className="text-sm text-foreground">{c.text}</p>
          <span className="font-mono text-[10px] text-muted-foreground">{c.ts}</span>
        </div>
      ))}
      <div className="flex gap-2 mt-3">
        <Textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a comment..."
          className="bg-muted border-none text-sm resize-none h-20"
        />
      </div>
      <button
        onClick={() => { if (text.trim()) { onAdd(text.trim()); setText(''); } }}
        className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg font-mono text-xs hover:bg-primary/90 transition-colors"
      >
        Post Comment
      </button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function TaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: task, isLoading } = useQuery({
    queryKey: ['item', taskId],
    queryFn: async () => {
      const all = await base44.entities.Item.filter({ type: 'task' }, '-created_date', 500);
      return all.find(t => t.id === taskId) || null;
    },
    enabled: !!taskId,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('name', 50),
    initialData: [],
  });

  const [editTitle, setEditTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Planned');
  const [statusOpen, setStatusOpen] = useState(false);
  const [priority, setPriority] = useState(2);
  const [deadline, setDeadline] = useState('');
  const [responsible, setResponsible] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [editDesc, setEditDesc] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  // Init from task
  useEffect(() => {
    if (!task) return;
    setTitle(task.title || '');
    setStatus(task.status || 'Planned');
    setPriority(task.priority || 2);
    setDeadline(task.deadline || '');
    setResponsible(task.for_whom || '');
    setTags((task.tags || []).join(', '));
    setDescription(task.description || '');
    try {
      const meta = JSON.parse(task.note || '{}');
      setSteps(meta.steps || []);
      setActivityLog(meta.activity || []);
      setComments(meta.comments || []);
      setAttachments(meta.attachments || []);
    } catch {
      setSteps([]);
    }
  }, [task?.id]);

  const addLog = (text) => {
    const ts = format(new Date(), 'MMM d, HH:mm');
    setActivityLog(prev => [...prev, { text, ts }]);
  };

  const save = async (patch = {}) => {
    setSaving(true);
    const meta = JSON.stringify({
      steps,
      activity: activityLog,
      comments,
      attachments,
      ...patch.meta,
    });
    await base44.entities.Item.update(taskId, {
      title,
      status,
      priority,
      deadline: deadline || undefined,
      for_whom: responsible || undefined,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      description,
      note: meta,
      ...patch,
    });
    queryClient.invalidateQueries({ queryKey: ['items'] });
    queryClient.invalidateQueries({ queryKey: ['item', taskId] });
    setSaving(false);
  };

  const handleStatusChange = (s) => {
    const old = status;
    setStatus(s);
    setStatusOpen(false);
    addLog(`Status changed: ${old} → ${s}`);
    setTimeout(() => save({ status: s }), 100);
  };

  const handleAddStep = () => {
    const newStep = { id: Date.now().toString(), text: '', done: false, children: [] };
    setSteps(prev => [...prev, newStep]);
  };

  const handleAddComment = (text) => {
    const ts = format(new Date(), 'MMM d, HH:mm');
    const updated = [...comments, { text, ts }];
    setComments(updated);
    addLog('Comment added');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setAttachments(prev => [...prev, { name: file.name, url: file_url, type: file.type }]);
    addLog(`Attachment added: ${file.name}`);
  };

  const prioObj = PRIORITIES.find(p => p.val === priority) || PRIORITIES[1];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <p className="text-muted-foreground">Task not found.</p>
        <button onClick={() => navigate('/tasks')} className="mt-4 text-primary font-mono text-sm hover:underline">← Back to Tasks</button>
      </div>
    );
  }

  const projectName = getProjectName(task.category, projects);
  const completedSteps = steps.filter(s => s.done).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Back */}
      <button
        onClick={() => navigate('/tasks')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-mono text-xs transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> BACK TO TASKS
      </button>

      {/* ── Header ── */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        {/* Title */}
        {editTitle ? (
          <input
            autoFocus
            className="w-full text-xl font-bold bg-transparent border-b border-primary/50 outline-none pb-1 text-foreground"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={() => { setEditTitle(false); save({ title }); }}
            onKeyDown={e => { if (e.key === 'Enter') { setEditTitle(false); save({ title }); } }}
          />
        ) : (
          <h1
            onClick={() => setEditTitle(true)}
            className="text-xl font-bold text-foreground cursor-text hover:text-primary/90 transition-colors"
          >
            {title || 'Untitled Task'}
          </h1>
        )}

        {/* Status pill */}
        <div className="relative inline-block">
          <button
            onClick={() => setStatusOpen(!statusOpen)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs border transition-all"
            style={{ borderColor: STATUS_COLORS[status] + '50', color: STATUS_COLORS[status], background: STATUS_COLORS[status] + '15' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLORS[status] }} />
            {status}
            <ChevronDown className="w-3 h-3" />
          </button>
          {statusOpen && (
            <div className="absolute top-full mt-1 left-0 z-20 bg-card border border-border rounded-xl shadow-xl py-1 min-w-[160px]">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-left font-mono text-xs transition-colors"
                  style={{ color: STATUS_COLORS[s] }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[s] }} />
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
          {/* Project */}
          <div>
            <p className="font-mono text-[10px] text-muted-foreground mb-1">PROJECT</p>
            <p className="text-sm text-foreground">{projectName !== '—' ? projectName : <span className="text-muted-foreground">—</span>}</p>
          </div>
          {/* Due date */}
          <div>
            <p className="font-mono text-[10px] text-muted-foreground mb-1">DUE DATE</p>
            <input
              type="date"
              value={deadline}
              onChange={e => { setDeadline(e.target.value); }}
              onBlur={() => save({ deadline })}
              className="bg-transparent text-sm text-foreground border-none outline-none cursor-pointer hover:text-primary transition-colors"
              style={{ colorScheme: 'dark' }}
            />
          </div>
          {/* Priority */}
          <div>
            <p className="font-mono text-[10px] text-muted-foreground mb-1">PRIORITY</p>
            <div className="flex gap-1.5 flex-wrap">
              {PRIORITIES.map(p => (
                <button
                  key={p.val}
                  onClick={() => { setPriority(p.val); save({ priority: p.val }); }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border transition-all"
                  style={{
                    borderColor: priority === p.val ? p.color : '#3a3a3a',
                    color: priority === p.val ? p.color : '#7a7a7a',
                    background: priority === p.val ? p.color + '15' : 'transparent',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          {/* Responsible */}
          <div>
            <p className="font-mono text-[10px] text-muted-foreground mb-1">RESPONSIBLE</p>
            <input
              className="bg-transparent text-sm text-foreground border-b border-border/50 outline-none w-full focus:border-primary/50 transition-colors"
              value={responsible}
              onChange={e => setResponsible(e.target.value)}
              onBlur={() => save({ for_whom: responsible })}
              placeholder="Comma-separated names"
            />
          </div>
          {/* Tags */}
          <div className="col-span-2">
            <p className="font-mono text-[10px] text-muted-foreground mb-1">TAGS</p>
            <div className="flex flex-wrap gap-1 items-center">
              {tags.split(',').filter(t => t.trim()).map((t, i) => (
                <span key={i} className="px-2 py-0.5 bg-muted rounded-full font-mono text-[10px] text-foreground">{t.trim()}</span>
              ))}
              <input
                className="bg-transparent text-xs text-foreground border-none outline-none flex-1 min-w-[120px] font-mono"
                value={tags}
                onChange={e => setTags(e.target.value)}
                onBlur={() => save()}
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Description ── */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="mono-header text-[10px] text-muted-foreground">DESCRIPTION</p>
          <button onClick={() => setEditDesc(!editDesc)} className="font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors">
            {editDesc ? 'PREVIEW' : 'EDIT'}
          </button>
        </div>
        {editDesc ? (
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            onBlur={() => save({ description })}
            placeholder="Write a description... Markdown supported."
            className="bg-muted border-none resize-none min-h-[120px] text-sm font-mono"
          />
        ) : (
          <div
            onClick={() => setEditDesc(true)}
            className="min-h-[60px] cursor-text prose prose-sm prose-invert max-w-none"
          >
            {description ? (
              <ReactMarkdown>{description}</ReactMarkdown>
            ) : (
              <p className="text-muted-foreground text-sm italic">Click to add description...</p>
            )}
          </div>
        )}
      </div>

      {/* ── Steps ── */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="mono-header text-[10px] text-muted-foreground">
            STEPS {steps.length > 0 && <span className="text-muted-foreground/60">({completedSteps}/{steps.length})</span>}
          </p>
          {steps.length > 0 && (
            <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${steps.length ? (completedSteps / steps.length) * 100 : 0}%` }} />
            </div>
          )}
        </div>
        <div className="space-y-0.5">
          {steps.map((step) => (
            <StepItem
              key={step.id}
              step={step}
              depth={0}
              onChange={(updated) => {
                setSteps(prev => prev.map(s => s.id === updated.id ? updated : s));
                save();
              }}
              onDelete={(id) => {
                setSteps(prev => prev.filter(s => s.id !== id));
                save();
              }}
            />
          ))}
        </div>
        <button
          onClick={handleAddStep}
          className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary font-mono transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add step
        </button>
      </div>

      {/* ── Attachments ── */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="mono-header text-[10px] text-muted-foreground">ATTACHMENTS</p>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors"
          >
            <Paperclip className="w-3 h-3" /> Upload
          </button>
          <input ref={fileRef} type="file" className="hidden" onChange={handleFileUpload} />
        </div>
        {attachments.length === 0 && (
          <p className="text-xs text-muted-foreground italic">No attachments yet.</p>
        )}
        <div className="flex flex-wrap gap-2">
          {attachments.map((att, i) => (
            <div key={i} className="relative group">
              {att.type?.startsWith('image') ? (
                <img src={att.url} alt={att.name} className="w-20 h-20 object-cover rounded-xl border border-border" />
              ) : (
                <a href={att.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-2 bg-muted rounded-xl text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
                  <Paperclip className="w-3 h-3" /> {att.name}
                </a>
              )}
              <button
                onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}
                className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-2.5 h-2.5 text-white" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Activity Log ── */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="mono-header text-[10px] text-muted-foreground mb-3">ACTIVITY</p>
        <ActivityLog log={activityLog} />
      </div>

      {/* ── Comments ── */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="mono-header text-[10px] text-muted-foreground mb-3">COMMENTS</p>
        <Comments comments={comments} onAdd={handleAddComment} />
      </div>

      {/* Save button */}
      <button
        onClick={() => save()}
        disabled={saving}
        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-mono text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {saving ? 'SAVING...' : 'SAVE CHANGES'}
      </button>
    </div>
  );
}