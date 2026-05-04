import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ChevronDown, ChevronUp, Play, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

const TEMPLATE_KEY = 'jar_grocery_templates_v1';

function getTemplates() {
  try { return JSON.parse(localStorage.getItem(TEMPLATE_KEY) || '[]'); } catch { return []; }
}
function saveTemplates(t) { localStorage.setItem(TEMPLATE_KEY, JSON.stringify(t)); }

export default function TemplatesPage() {
  const qc = useQueryClient();
  const [templates, setTemplates] = useState(getTemplates);
  const [expanded, setExpanded] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newItems, setNewItems] = useState([{ name: '', quantity: 1, unit: 'pcs' }]);

  const saveTemplate = () => {
    if (!newName.trim()) return;
    const updated = [...templates, { id: Date.now(), name: newName.trim(), items: newItems.filter(i => i.name.trim()) }];
    saveTemplates(updated);
    setTemplates(updated);
    setCreating(false);
    setNewName('');
    setNewItems([{ name: '', quantity: 1, unit: 'pcs' }]);
  };

  const deleteTemplate = (id) => {
    const updated = templates.filter(t => t.id !== id);
    saveTemplates(updated);
    setTemplates(updated);
  };

  const applyTemplate = async (template) => {
    for (const item of template.items) {
      await base44.entities.ShoppingListItem.create({ name: item.name, quantity: item.quantity, unit: item.unit, source: 'manual', is_checked: false });
    }
    qc.invalidateQueries({ queryKey: ['shopping-list'] });
    alert(`Added ${template.items.length} items to Shopping List!`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-sm text-muted-foreground">{templates.length} templates</p>
        <Button size="sm" onClick={() => setCreating(c => !c)} className="h-8 text-xs font-mono bg-muted text-foreground"><Plus className="w-3 h-3 mr-1" />New Template</Button>
      </div>

      <AnimatePresence>
        {creating && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-muted rounded-xl p-4 space-y-3">
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Template name (e.g. Weekly Shop, BBQ Prep)" className="bg-background border-none font-mono text-sm h-8" />
            {newItems.map((item, i) => (
              <div key={i} className="grid grid-cols-5 gap-2">
                <Input value={item.name} onChange={e => setNewItems(items => items.map((it, j) => j === i ? { ...it, name: e.target.value } : it))} placeholder="Item name" className="col-span-3 bg-background border-none font-mono text-sm h-8" />
                <Input type="number" value={item.quantity} onChange={e => setNewItems(items => items.map((it, j) => j === i ? { ...it, quantity: Number(e.target.value) } : it))} className="col-span-1 bg-background border-none font-mono text-sm h-8" min={0.1} step={0.1} />
                <select value={item.unit} onChange={e => setNewItems(items => items.map((it, j) => j === i ? { ...it, unit: e.target.value } : it))} className="bg-background border border-input rounded-md font-mono text-xs h-8 px-1">
                  {['kg', 'g', 'L', 'ml', 'pcs', 'pack'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            ))}
            <div className="flex gap-2">
              <button onClick={() => setNewItems(items => [...items, { name: '', quantity: 1, unit: 'pcs' }])} className="text-xs font-mono text-muted-foreground hover:text-primary flex items-center gap-1"><Plus className="w-3 h-3" />Add Item</button>
              <Button size="sm" onClick={saveTemplate} className="h-7 text-xs font-mono bg-secondary text-secondary-foreground">Save Template</Button>
              <Button size="sm" variant="ghost" onClick={() => setCreating(false)} className="h-7 text-xs font-mono">Cancel</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {templates.length === 0 && !creating ? (
        <div className="text-center py-16 text-muted-foreground font-mono text-sm">No templates yet. Create reusable shopping lists.</div>
      ) : (
        <div className="space-y-3">
          {templates.map(t => (
            <div key={t.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <div className="flex-1">
                  <div className="font-mono text-sm font-bold">{t.name}</div>
                  <div className="font-mono text-xs text-muted-foreground">{t.items.length} items</div>
                </div>
                <button onClick={() => applyTemplate(t)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 text-primary font-mono text-xs hover:bg-primary/30 transition-colors">
                  <Play className="w-3 h-3" />Add to List
                </button>
                <button onClick={() => setExpanded(expanded === t.id ? null : t.id)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                  {expanded === t.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button onClick={() => deleteTemplate(t.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              {expanded === t.id && (
                <div className="border-t border-border px-4 pb-3 pt-2 space-y-1">
                  {t.items.map((item, i) => (
                    <div key={i} className="flex gap-3 text-xs font-mono text-muted-foreground">
                      <span>{item.quantity} {item.unit}</span><span>{item.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}