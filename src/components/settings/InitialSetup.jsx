import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { seedFieldValues, saveStepTemplate, recordFieldValue } from '@/lib/learningDB';
import { SUBSCRIPTION_CATALOG } from '@/lib/constants';

const DEFAULT_TASK_TYPES = ['Study', 'Work', 'Personal', 'Football', 'Health', 'Finance', 'Travel', 'Creative'];
const DEFAULT_CATEGORIES = ['Urgent', 'Important', 'Routine', 'Long-term', 'Recurring', 'One-time'];
const FLAT_SUBSCRIPTIONS = Object.values(SUBSCRIPTION_CATALOG || {}).flat().map(s => typeof s === 'string' ? s : s.name).filter(Boolean);

function EditableList({ items, setItems, placeholder }) {
  const [input, setInput] = useState('');
  const add = () => { if (input.trim()) { setItems(prev => [...prev, input.trim()]); setInput(''); } };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-lg text-xs font-mono text-foreground">
            {item}
            <button onClick={() => setItems(prev => prev.filter((_, j) => j !== i))}><X className="w-3 h-3 text-muted-foreground hover:text-destructive" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())} placeholder={placeholder} className="bg-muted border-none text-sm h-8" />
        <Button size="sm" variant="ghost" onClick={add} className="h-8"><Plus className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}

function ToggleList({ all, selected, setSelected }) {
  const toggle = (item) => setSelected(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);
  return (
    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
      {all.map((item, i) => (
        <button key={i} onClick={() => toggle(item)}
          className={`px-2 py-1 rounded-lg text-xs font-mono transition-colors ${selected.includes(item) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
          {item}
        </button>
      ))}
    </div>
  );
}

export default function InitialSetup() {
  const [taskTypes, setTaskTypes] = useState([...DEFAULT_TASK_TYPES]);
  const [categories, setCategories] = useState([...DEFAULT_CATEGORIES]);
  const [contacts, setContacts] = useState([]);
  const [selectedSubs, setSelectedSubs] = useState([]);
  const [customSubs, setCustomSubs] = useState([]);
  const [templateName, setTemplateName] = useState('');
  const [templateSteps, setTemplateSteps] = useState('');
  const [templates, setTemplates] = useState([]);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const addTemplate = () => {
    if (!templateName.trim() || !templateSteps.trim()) return;
    const steps = templateSteps.split('\n').map(s => s.trim()).filter(Boolean).map((name, i) => ({ name, priority: 3, duration: '', notes: '', id: String(i) }));
    setTemplates(prev => [...prev, { name: templateName.trim(), steps }]);
    setTemplateName('');
    setTemplateSteps('');
  };

  const handleSeed = () => {
    setSaving(true);
    // Seed all task types
    seedFieldValues('task_category', taskTypes);
    seedFieldValues('task_type', taskTypes);
    // Seed categories
    seedFieldValues('item_category', categories);
    seedFieldValues('task_category', categories);
    // Seed contacts
    contacts.forEach(c => {
      recordFieldValue('for_whom', c);
      recordFieldValue('contact_name', c);
    });
    // Seed subscriptions
    const allSubs = [...selectedSubs, ...customSubs];
    allSubs.forEach(s => recordFieldValue('subscription_name', s));
    // Save step templates
    templates.forEach(t => saveStepTemplate(t.name, '', t.steps));

    setTimeout(() => { setSaving(false); setDone(true); }, 400);
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-6">
        <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
        <p className="font-mono text-foreground">JAR is seeded and ready.</p>
        <p className="text-xs text-muted-foreground">Suggestions will appear in all forms from now on.</p>
        <Button onClick={() => setDone(false)} variant="outline" className="font-mono text-xs">EDIT AGAIN</Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="mono-header text-[10px] text-muted-foreground">INITIAL SETUP</p>
      <p className="text-xs text-muted-foreground">Pre-fill your common values so suggestions work from day one.</p>

      <Section title="TASK TYPES">
        <EditableList items={taskTypes} setItems={setTaskTypes} placeholder="Add type..." />
      </Section>

      <Section title="CATEGORIES">
        <EditableList items={categories} setItems={setCategories} placeholder="Add category..." />
      </Section>

      <Section title="KEY CONTACTS">
        <EditableList items={contacts} setItems={setContacts} placeholder="Player, professor, agent..." />
      </Section>

      <Section title="YOUR SUBSCRIPTIONS">
        <p className="text-xs text-muted-foreground mb-2">Toggle your active subscriptions:</p>
        <ToggleList all={FLAT_SUBSCRIPTIONS.slice(0, 40)} selected={selectedSubs} setSelected={setSelectedSubs} />
        <div className="mt-2">
          <EditableList items={customSubs} setItems={setCustomSubs} placeholder="Custom subscription..." />
        </div>
      </Section>

      <Section title="STEP TEMPLATES">
        <p className="text-xs text-muted-foreground mb-2">Add recurring workflows as templates.</p>
        <div className="space-y-2">
          <Input value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="Template name (e.g. Weekly Review)" className="bg-muted border-none text-sm h-8" />
          <textarea
            value={templateSteps}
            onChange={e => setTemplateSteps(e.target.value)}
            placeholder={"One step per line:\nStep 1\nStep 2\nStep 3"}
            className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            rows={4}
          />
          <Button size="sm" onClick={addTemplate} variant="outline" className="font-mono text-xs h-7">+ ADD TEMPLATE</Button>
        </div>
        {templates.length > 0 && (
          <div className="mt-2 space-y-1">
            {templates.map((t, i) => (
              <div key={i} className="flex items-center gap-2 bg-muted/60 rounded-lg px-3 py-1.5 text-xs font-mono">
                <span className="text-foreground flex-1">{t.name}</span>
                <span className="text-muted-foreground">{t.steps.length} steps</span>
                <button onClick={() => setTemplates(prev => prev.filter((_, j) => j !== i))}><X className="w-3 h-3 text-muted-foreground hover:text-destructive" /></button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Button onClick={handleSeed} disabled={saving} className="w-full font-mono bg-primary">
        {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />SEEDING...</> : 'SEED JAR DATABASE'}
      </Button>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="border-t border-border pt-4 space-y-3">
      <p className="mono-header text-[10px] text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}