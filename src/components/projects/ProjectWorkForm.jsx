/**
 * Generic work entry form for any Project.
 * Renders fields dynamically from the work type's field schema.
 */
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

const today = () => format(new Date(), 'yyyy-MM-dd');

function FieldInput({ field, value, onChange }) {
  const cls = "bg-muted border-none mt-1 text-sm";
  switch (field.field_type) {
    case 'textarea':
      return <Textarea value={value || ''} onChange={e => onChange(e.target.value)} className={cls} rows={2} />;
    case 'number':
      return <Input type="number" value={value || ''} onChange={e => onChange(e.target.value)} className={`${cls} font-mono`} />;
    case 'date':
      return <Input type="date" value={value || ''} onChange={e => onChange(e.target.value)} className={`${cls} font-mono`} lang="en" />;
    case 'select':
      return (
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger className={`${cls} font-mono text-xs`}><SelectValue /></SelectTrigger>
          <SelectContent>
            {(field.options || []).map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      );
    default:
      return <Input value={value || ''} onChange={e => onChange(e.target.value)} className={cls} />;
  }
}

export default function ProjectWorkForm({ open, onClose, onSaved, project }) {
  const queryClient = useQueryClient();
  const [workType, setWorkType] = useState(null);
  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState('Active');
  const [date, setDate] = useState(today());
  const [saving, setSaving] = useState(false);

  const workTypes = project?.work_types || [];
  const color = project?.color || '#39ff14';

  const setField = (key, val) => setFormData(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    if (!workType) return;
    setSaving(true);
    // Build a readable title from the most prominent field
    const fields = workType.fields || [];
    const titleField = fields.find(f => f.key === 'player_name' || f.key === 'title' || f.key === 'client' || f.key === 'subject' || f.key === 'track' || f.field_type === 'text');
    const titleVal = titleField ? formData[titleField.key] : '';
    const title = titleVal ? `${workType.label} — ${titleVal}` : workType.label;

    await base44.entities.Item.create({
      type: 'task',
      title,
      category: `project:${project.id}`,
      status,
      date,
      description: JSON.stringify({ work_type: workType.key, project_id: project.id, ...formData }),
      note: formData.notes || '',
    });
    queryClient.invalidateQueries({ queryKey: ['project-items', project.id] });
    queryClient.invalidateQueries({ queryKey: ['items'] });
    setSaving(false);
    onSaved();
  };

  // Work type selector
  if (!workType) {
    if (workTypes.length === 0) {
      return (
        <Dialog open={open} onOpenChange={onClose}>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader>
              <DialogTitle className="mono-header text-sm" style={{ color }}>ADD WORK</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground py-4 text-center">
              This project has no work types yet. Edit the project to add some.
            </p>
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="mono-header text-sm" style={{ color }}>SELECT WORK TYPE</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2 pt-2">
            {workTypes.map((wt, i) => (
              <motion.button
                key={wt.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setWorkType(wt)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 border border-border hover:border-opacity-60 transition-all text-center"
                onMouseEnter={e => e.currentTarget.style.borderColor = (wt.color || color) + '60'}
                onMouseLeave={e => e.currentTarget.style.borderColor = ''}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-mono text-sm font-bold"
                  style={{ background: (wt.color || color) + '20', color: wt.color || color }}>
                  {wt.short || wt.label.slice(0, 2).toUpperCase()}
                </div>
                <span className="font-mono text-[10px] text-muted-foreground leading-tight">{wt.label}</span>
              </motion.button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="mono-header text-sm flex items-center gap-2" style={{ color: workType.color || color }}>
            <button onClick={() => setWorkType(null)} className="hover:text-foreground transition-colors mr-1">
              <ArrowLeft className="w-4 h-4" />
            </button>
            {workType.label.toUpperCase()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Date + Status always present */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground font-mono">DATE</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-muted border-none mt-1 font-mono text-sm" lang="en" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground font-mono">STATUS</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-muted border-none mt-1 font-mono text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Active', 'Draft', 'Pending', 'Done', 'Closed', 'Cancelled'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dynamic fields from schema */}
          <div className="grid grid-cols-2 gap-3">
            {(workType.fields || []).map(field => (
              <div key={field.key} className={field.field_type === 'textarea' ? 'col-span-2' : ''}>
                <Label className="text-xs text-muted-foreground font-mono">{field.label.toUpperCase()}</Label>
                <FieldInput field={field} value={formData[field.key]} onChange={v => setField(field.key, v)} />
              </div>
            ))}
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full font-mono text-black"
            style={{ background: workType.color || color }}
          >
            {saving ? 'SAVING...' : `SAVE ${workType.label.toUpperCase()}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}