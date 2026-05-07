import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { Plus, X, Archive } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { ICON_OPTIONS, COLOR_OPTIONS } from '@/lib/projectTemplates';
import DynIcon from './DynIcon';
import StructurePicker from './StructurePicker';

export default function EditProjectModal({ open, onClose, project, onSaved }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    icon: project?.icon || 'FolderOpen',
    color: project?.color || '#39ff14',
    structure: project?.structure || 'A',
    work_types: project?.work_types ? project.work_types.map(wt => ({ ...wt })) : [],
    is_archived: project?.is_archived || false,
  });
  const [newWTName, setNewWTName] = useState('');
  const [newWTColor, setNewWTColor] = useState(project?.color || '#39ff14');

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const addWorkType = () => {
    if (!newWTName.trim()) return;
    const key = newWTName.toLowerCase().replace(/\s+/g, '_');
    update('work_types', [...form.work_types, {
      key, label: newWTName.trim(), color: newWTColor,
      short: newWTName.slice(0, 2).toUpperCase(),
      fields: [{ key: 'notes', label: 'Notes', field_type: 'textarea' }],
    }]);
    setNewWTName('');
  };

  const removeWT = (key) => update('work_types', form.work_types.filter(w => w.key !== key));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await base44.entities.Project.update(project.id, {
      name: form.name.trim(),
      description: form.description,
      icon: form.icon,
      color: form.color,
      structure: form.structure,
      work_types: form.work_types,
      is_archived: form.is_archived,
    });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['project', project.id] });
    setSaving(false);
    onSaved?.();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="mono-header text-sm text-primary">EDIT PROJECT</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="space-y-3">
            <Input
              value={form.name}
              onChange={e => update('name', e.target.value)}
              placeholder="Project name..."
              className="bg-muted border-none text-lg font-medium"
              autoFocus
            />
            <Textarea
              value={form.description}
              onChange={e => update('description', e.target.value)}
              placeholder="Mission / description..."
              className="bg-muted border-none text-sm"
              rows={2}
            />
          </div>

          {/* Icon picker */}
          <div>
            <p className="mono-header text-[10px] text-muted-foreground mb-2">ICON</p>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(iconName => (
                <button
                  key={iconName}
                  onClick={() => update('icon', iconName)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all border ${form.icon === iconName ? 'border-primary bg-primary/10' : 'border-border bg-muted'}`}
                >
                  <DynIcon name={iconName} className="w-4 h-4" style={{ color: form.icon === iconName ? form.color : undefined }} />
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <p className="mono-header text-[10px] text-muted-foreground mb-2">ACCENT COLOR</p>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c}
                  onClick={() => update('color', c)}
                  className="w-7 h-7 rounded-full border-2 transition-all"
                  style={{ background: c, borderColor: form.color === c ? '#fff' : 'transparent' }}
                />
              ))}
            </div>
          </div>

          <StructurePicker value={form.structure || 'A'} onChange={v => update('structure', v)} />

          {/* Work types */}
          <div>
            <p className="mono-header text-[10px] text-muted-foreground mb-2">WORK TYPES ({form.work_types.length})</p>
            <div className="space-y-1.5 mb-3">
              {form.work_types.map(wt => (
                <div key={wt.key} className="flex items-center gap-2 bg-muted/60 rounded-lg px-3 py-2">
                  <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0"
                    style={{ background: (wt.color || form.color) + '30', color: wt.color || form.color }}>
                    {wt.short}
                  </div>
                  <span className="text-sm font-mono flex-1">{wt.label}</span>
                  <button onClick={() => removeWT(wt.key)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <Input
                value={newWTName}
                onChange={e => setNewWTName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addWorkType())}
                placeholder="Add work type..."
                className="bg-muted border-none text-sm h-8"
              />
              {/* Color chip for new WT */}
              <div className="flex gap-1 shrink-0">
                {[form.color, '#4da6ff', '#ff6d00', '#9d4edd', '#06d6a0', '#ff2d2d'].map(c => (
                  <button key={c} onClick={() => setNewWTColor(c)}
                    className="w-5 h-5 rounded-full border-2 transition-all"
                    style={{ background: c, borderColor: newWTColor === c ? '#fff' : 'transparent' }}
                  />
                ))}
              </div>
              <Button size="sm" variant="outline" onClick={addWorkType} className="h-8 font-mono text-xs shrink-0">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Archive toggle */}
          <div className="flex items-center gap-3 py-3 border-t border-border">
            <Archive className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-mono">Archive project</p>
              <p className="text-[10px] text-muted-foreground">Hidden from sidebar, data preserved</p>
            </div>
            <button
              onClick={() => update('is_archived', !form.is_archived)}
              className={`w-10 h-6 rounded-full transition-all ${form.is_archived ? 'bg-destructive' : 'bg-muted border border-border'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white mx-auto transition-transform ${form.is_archived ? 'translate-x-2' : '-translate-x-2'}`} />
            </button>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
            className="w-full font-mono text-black"
            style={{ background: form.color }}
          >
            {saving ? 'SAVING...' : 'SAVE CHANGES'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}