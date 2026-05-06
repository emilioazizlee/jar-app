import React, { useState, useEffect } from 'react';
import { getAllTemplates, deleteTemplate, saveStepTemplate } from '@/lib/learningDB';
import { format } from 'date-fns';
import { Trash2, ChevronDown, ChevronRight } from 'lucide-react';

const SUGGESTED_TEMPLATES = [
  {
    id: 'suggested_morning',
    title: 'Daily morning routine',
    category: 'Health',
    steps: [
      { name: 'Wake up & hydrate', priority: 5 },
      { name: 'Morning workout', priority: 4 },
      { name: 'Shower & grooming', priority: 3 },
      { name: 'Breakfast', priority: 4 },
      { name: 'Plan the day', priority: 5 },
    ],
    savedAt: null,
    useCount: 0,
    suggested: true,
  },
  {
    id: 'suggested_weekly_review',
    title: 'Weekly review',
    category: 'Personal',
    steps: [
      { name: 'Review last week goals', priority: 5 },
      { name: 'Update task list', priority: 4 },
      { name: 'Review finances', priority: 4 },
      { name: 'Set next week priorities', priority: 5 },
    ],
    savedAt: null,
    useCount: 0,
    suggested: true,
  },
  {
    id: 'suggested_project_setup',
    title: 'New project setup',
    category: 'Work',
    steps: [
      { name: 'Define scope & goals', priority: 5 },
      { name: 'Identify stakeholders', priority: 4 },
      { name: 'Create timeline', priority: 4 },
      { name: 'Set up tools & repos', priority: 3 },
      { name: 'Kickoff meeting', priority: 3 },
      { name: 'First milestone', priority: 5 },
    ],
    savedAt: null,
    useCount: 0,
    suggested: true,
  },
  {
    id: 'suggested_travel_prep',
    title: 'Travel prep',
    category: 'Travel',
    steps: [
      { name: 'Book flights', priority: 5 },
      { name: 'Book accommodation', priority: 5 },
      { name: 'Check visa requirements', priority: 5 },
      { name: 'Pack clothes', priority: 3 },
      { name: 'Pack toiletries', priority: 3 },
      { name: 'Download maps & guides', priority: 2 },
      { name: 'Notify bank', priority: 4 },
      { name: 'Emergency contacts noted', priority: 3 },
    ],
    savedAt: null,
    useCount: 0,
    suggested: true,
  },
];

function TemplateCard({ template, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', cursor: 'pointer' }}
        className="hover:bg-white/[0.02] transition-colors"
      >
        {expanded ? <ChevronDown size={14} color="#7a7a7a" /> : <ChevronRight size={14} color="#7a7a7a" />}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{template.title}</p>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#7a7a7a', marginTop: 2 }}>
            {template.steps.length} steps
            {template.savedAt ? ` · saved ${format(new Date(template.savedAt), 'MMM d, yyyy')}` : ''}
            {template.useCount > 0 ? ` · used ${template.useCount}×` : ''}
          </p>
        </div>
        {!template.suggested && onDelete && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(template.id); }}
            style={{ color: '#7a7a7a', padding: 4 }}
            className="hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
        {template.suggested && (
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#7a7a7a', border: '1px solid #2a2a2a', borderRadius: 4, padding: '2px 6px' }}>SUGGESTED</span>
        )}
      </div>
      {expanded && (
        <div style={{ borderTop: '1px solid #2a2a2a', padding: '10px 14px 14px' }}>
          <div className="space-y-1.5">
            {template.steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555', width: 16 }}>{i + 1}.</span>
                <span style={{ fontSize: 13, color: '#ccc' }}>{s.name}</span>
                {s.priority && (
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: s.priority >= 4 ? '#ff2d2d' : '#7a7a7a', marginLeft: 'auto' }}>P{s.priority}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StepTemplateLibrary() {
  const [userTemplates, setUserTemplates] = useState([]);

  useEffect(() => {
    setUserTemplates(getAllTemplates());
  }, []);

  const handleDelete = (id) => {
    deleteTemplate(id);
    setUserTemplates(getAllTemplates());
  };

  return (
    <div className="max-w-2xl mx-auto pb-16">
      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#7a7a7a', marginBottom: 20 }}>STEP TEMPLATES</p>

      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#7a7a7a', marginBottom: 8 }}>USER-CREATED ({userTemplates.length})</p>
      {userTemplates.length === 0 ? (
        <div style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12, padding: 22, marginBottom: 16 }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#555', textAlign: 'center' }}>No saved templates yet. Create a task with 3+ steps to save a template.</p>
        </div>
      ) : (
        <div style={{ marginBottom: 16 }}>
          {userTemplates.map(t => <TemplateCard key={t.id} template={t} onDelete={handleDelete} />)}
        </div>
      )}

      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#7a7a7a', marginBottom: 8, marginTop: 8 }}>SUGGESTED ({SUGGESTED_TEMPLATES.length})</p>
      <div>
        {SUGGESTED_TEMPLATES.map(t => <TemplateCard key={t.id} template={t} />)}
      </div>
    </div>
  );
}