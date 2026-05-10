import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { PROJECT_TEMPLATES, ICON_OPTIONS, COLOR_OPTIONS } from '@/lib/projectTemplates';

const ARCHETYPE_QUICK = [
  { name: 'Work', icon: 'Briefcase', color: '#4da6ff', emoji: '💼' },
  { name: 'Studies', icon: 'GraduationCap', color: '#4da6ff', emoji: '📚' },
  { name: 'Side Hustle', icon: 'Zap', color: '#ffd60a', emoji: '⚡' },
  { name: 'Health Journey', icon: 'Heart', color: '#ff2d2d', emoji: '❤️' },
  { name: 'Travel', icon: 'Plane', color: '#40c4ff', emoji: '✈️' },
  { name: 'Home Renovation', icon: 'Building2', color: '#ff9f43', emoji: '🏠' },
  { name: 'Job Search', icon: 'Target', color: '#39ff14', emoji: '🎯' },
  { name: 'Fitness Goal', icon: 'Dumbbell', color: '#06d6a0', emoji: '💪' },
  { name: 'Learning a Language', icon: 'Globe', color: '#a855f7', emoji: '🌍' },
  { name: 'Business', icon: 'Rocket', color: '#ff2d2d', emoji: '🚀' },
  { name: 'Personal Finance', icon: 'Activity', color: '#39ff14', emoji: '💰' },
  { name: 'Hobby', icon: 'Palette', color: '#e040fb', emoji: '🎨' },
];
import DynIcon from './DynIcon';
import StructurePicker from './StructurePicker';

export default function NewProjectModal({ open, onClose, onCreated }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState('template'); // 'template' | 'configure'
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState({
    name: '',
    description: '',
    icon: 'FolderOpen',
    color: '#39ff14',
    structure: 'A',
    work_types: [],
  });
  const [newWTName, setNewWTName] = useState('');

  const selectTemplate = (tpl) => {
    setProject({
      name: tpl.id === 'custom' ? '' : tpl.name,
      description: tpl.description,
      icon: tpl.icon,
      color: tpl.color,
      structure: tpl.structure || 'A',
      work_types: tpl.work_types.map(wt => ({ ...wt })),
    });
    setStep('configure');
  };

  const addWorkType = () => {
    if (!newWTName.trim()) return;
    const key = newWTName.toLowerCase().replace(/\s+/g, '_');
    setProject(p => ({
      ...p,
      work_types: [...p.work_types, {
        key, label: newWTName.trim(), color: p.color,
        short: newWTName.slice(0, 2).toUpperCase(),
        fields: [{ key: 'notes', label: 'Notes', field_type: 'textarea' }],
      }],
    }));
    setNewWTName('');
  };

  const removeWT = (key) => setProject(p => ({ ...p, work_types: p.work_types.filter(w => w.key !== key) }));

  const handleCreate = async () => {
    if (!project.name.trim()) return;
    setSaving(true);
    const me = await base44.auth.me();
    const created = await base44.entities.Project.create({
      name: project.name.trim(),
      description: project.description,
      icon: project.icon,
      color: project.color,
      structure: project.structure || 'A',
      work_types: project.work_types,
      is_archived: false,
      created_by: me.email,
    });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    setSaving(false);
    onCreated(created);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="mono-header text-sm text-primary flex items-center gap-2">
            {step === 'configure' && (
              <button onClick={() => setStep('template')} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            {step === 'template' ? 'NEW PROJECT — CHOOSE TEMPLATE' : 'CONFIGURE PROJECT'}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'template' && (
            <motion.div key="template" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-4 pt-2">
              {/* Quick archetype chips */}
              <div>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[2px] mb-2">QUICK START</p>
                <div className="flex flex-wrap gap-1.5">
                  {ARCHETYPE_QUICK.map(a => (
                    <motion.button
                      key={a.name}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        setProject({ name: a.name, description: '', icon: a.icon, color: a.color, work_types: [] });
                        setStep('configure');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border text-xs font-mono text-muted-foreground hover:text-foreground transition-all"
                      style={{ borderRadius: 999 }}
                    >
                      <span>{a.emoji}</span>{a.name}
                    </motion.button>
                  ))}
                </div>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[2px] mt-2">OR CHOOSE TEMPLATE</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PROJECT_TEMPLATES.map((tpl, i) => (
                <motion.button
                  key={tpl.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => selectTemplate(tpl)}
                  className="flex flex-col items-start gap-2 p-4 rounded-xl bg-muted/50 border border-border hover:border-opacity-60 transition-all text-left"
                  onMouseEnter={e => e.currentTarget.style.borderColor = tpl.color + '60'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = ''}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: tpl.color + '20' }}>
                    <DynIcon name={tpl.icon} className="w-5 h-5" style={{ color: tpl.color }} />
                  </div>
                  <div>
                    <p className="font-mono text-sm text-foreground font-medium">{tpl.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{tpl.description}</p>
                  </div>
                  {tpl.work_types.length > 0 && (
                    <p className="font-mono text-[10px] text-muted-foreground">{tpl.work_types.length} work types</p>
                  )}
                </motion.button>
              ))}
              </div>
            </motion.div>
          )}

          {step === 'configure' && (
            <motion.div key="configure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-5 pt-2">
              <div className="space-y-3">
                <Input
                  value={project.name}
                  onChange={e => setProject(p => ({ ...p, name: e.target.value }))}
                  placeholder="Project name..."
                  className="bg-muted border-none text-lg font-medium"
                  autoFocus
                />
                <Textarea
                  value={project.description}
                  onChange={e => setProject(p => ({ ...p, description: e.target.value }))}
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
                      onClick={() => setProject(p => ({ ...p, icon: iconName }))}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all border ${project.icon === iconName ? 'border-primary bg-primary/10' : 'border-border bg-muted'}`}
                    >
                      <DynIcon name={iconName} className="w-4 h-4" style={{ color: project.icon === iconName ? project.color : undefined }} />
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
                      onClick={() => setProject(p => ({ ...p, color: c }))}
                      className="w-7 h-7 rounded-full border-2 transition-all"
                      style={{ background: c, borderColor: project.color === c ? '#fff' : 'transparent' }}
                    />
                  ))}
                </div>
              </div>

              <StructurePicker value={project.structure || 'A'} onChange={v => setProject(p => ({ ...p, structure: v }))} />

              {/* Work types */}
              <div>
                <p className="mono-header text-[10px] text-muted-foreground mb-2">WORK TYPES ({project.work_types.length})</p>
                <div className="space-y-1.5 mb-3">
                  {project.work_types.map(wt => (
                    <div key={wt.key} className="flex items-center gap-2 bg-muted/60 rounded-lg px-3 py-2">
                      <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0"
                        style={{ background: (wt.color || project.color) + '30', color: wt.color || project.color }}>
                        {wt.short}
                      </div>
                      <span className="text-sm font-mono flex-1">{wt.label}</span>
                      <span className="text-[10px] text-muted-foreground">{wt.fields?.length || 0} fields</span>
                      <button onClick={() => removeWT(wt.key)} className="text-muted-foreground hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newWTName}
                    onChange={e => setNewWTName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addWorkType())}
                    placeholder="Add work type..."
                    className="bg-muted border-none text-sm h-8"
                  />
                  <Button size="sm" variant="outline" onClick={addWorkType} className="h-8 font-mono text-xs">
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleCreate}
                disabled={saving || !project.name.trim()}
                className="w-full font-mono text-black"
                style={{ background: project.color }}
              >
                {saving ? 'CREATING...' : 'CREATE PROJECT'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}