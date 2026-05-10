import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ArrowLeft, Plus, Trash2, Edit2, GripVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const ENTITY_TYPES = [
  { key: 'GroceryProduct', label: 'Grocery Products', emoji: '🛒' },
  { key: 'Recipe',         label: 'Recipes',          emoji: '🍳' },
  { key: 'Item',           label: 'Items / Tasks',    emoji: '✅' },
  { key: 'LeisureEntry',   label: 'Leisure',          emoji: '🎭' },
];

const FIELD_TYPES = [
  { key: 'text',    label: 'Text',        example: 'Any text value' },
  { key: 'number',  label: 'Number',      example: 'Numeric value' },
  { key: 'boolean', label: 'Yes / No',    example: 'Toggle on/off' },
  { key: 'date',    label: 'Date',        example: 'Calendar date' },
  { key: 'select',  label: 'Select',      example: 'Pick from options' },
];

const slugify = (str) => str.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

function FieldModal({ field, entityName, onClose, onSave }) {
  const [form, setForm] = useState({
    field_label: field?.field_label || '',
    field_key: field?.field_key || '',
    field_type: field?.field_type || 'text',
    options: field?.options || [],
    default_value: field?.default_value || '',
    is_required: field?.is_required || false,
  });
  const [optionInput, setOptionInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [keyManual, setKeyManual] = useState(!!field);

  const handleLabelChange = (val) => {
    setForm(f => ({ ...f, field_label: val, field_key: keyManual ? f.field_key : slugify(val) }));
  };

  const addOption = () => {
    if (!optionInput.trim()) return;
    setForm(f => ({ ...f, options: [...f.options, optionInput.trim()] }));
    setOptionInput('');
  };

  const handleSave = async () => {
    if (!form.field_label.trim() || !form.field_key.trim()) return;
    setSaving(true);
    await onSave({ ...form, entity_name: entityName });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ width: '100%', maxWidth: 460, background: '#111', border: '1px solid #2a2a2a', borderRadius: 16, overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1f1f1f' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#fff', fontWeight: 700 }}>{field ? 'Edit Field' : 'New Custom Field'}</p>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555', marginTop: 2 }}>for {entityName}</p>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555', marginBottom: 5, textTransform: 'uppercase' }}>Display Name</p>
            <input value={form.field_label} onChange={e => handleLabelChange(e.target.value)} placeholder="e.g. Halal Certified"
              style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }} />
          </div>
          <div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555', marginBottom: 5, textTransform: 'uppercase' }}>Field Key (auto-generated)</p>
            <input value={form.field_key} onChange={e => { setKeyManual(true); setForm(f => ({ ...f, field_key: slugify(e.target.value) })); }} placeholder="e.g. halal_certified"
              style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#888', padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }} />
          </div>
          <div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555', marginBottom: 8, textTransform: 'uppercase' }}>Field Type</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {FIELD_TYPES.map(ft => (
                <button key={ft.key} type="button" onClick={() => setForm(f => ({ ...f, field_type: ft.key }))}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: form.field_type === ft.key ? 'rgba(171,255,79,0.08)' : '#1a1a1a', border: `1px solid ${form.field_type === ft.key ? 'rgba(171,255,79,0.3)' : '#2a2a2a'}`, cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: form.field_type === ft.key ? '#abff4f' : '#333', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: form.field_type === ft.key ? '#abff4f' : '#aaa' }}>{ft.label}</p>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#555' }}>{ft.example}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          {form.field_type === 'select' && (
            <div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>Options</p>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <input value={optionInput} onChange={e => setOptionInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addOption()} placeholder="Add option…"
                  style={{ flex: 1, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 6, color: '#fff', padding: '6px 10px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }} />
                <button onClick={addOption} style={{ padding: '6px 12px', borderRadius: 6, background: '#abff4f', color: '#0a0a0a', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, border: 'none', cursor: 'pointer' }}>Add</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {form.options.map((opt, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#aaa' }}>
                    {opt}
                    <button onClick={() => setForm(f => ({ ...f, options: f.options.filter((_, j) => j !== i) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 0, lineHeight: 1 }}>×</button>
                  </span>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id="isReq" checked={form.is_required} onChange={e => setForm(f => ({ ...f, is_required: e.target.checked }))} style={{ accentColor: '#abff4f', width: 14, height: 14 }} />
            <label htmlFor="isReq" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#888', cursor: 'pointer' }}>Required field</label>
          </div>
        </div>
        <div style={{ padding: '0 20px 20px', display: 'flex', gap: 8 }}>
          <button onClick={handleSave} disabled={saving || !form.field_label.trim()}
            style={{ flex: 1, padding: '10px', borderRadius: 8, background: '#abff4f', color: '#0a0a0a', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', opacity: !form.field_label.trim() ? 0.4 : 1 }}>
            {saving ? 'Saving…' : field ? 'Update' : 'Add Field'}
          </button>
          <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: 8, background: 'transparent', color: '#666', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, border: '1px solid #2a2a2a', cursor: 'pointer' }}>Cancel</button>
        </div>
      </motion.div>
    </div>
  );
}

export default function CustomFieldsManager() {
  const { user } = useCurrentUser();
  const qc = useQueryClient();
  const [activeEntity, setActiveEntity] = useState('GroceryProduct');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: fields = [] } = useQuery({
    queryKey: ['custom-fields', activeEntity, user?.email],
    queryFn: () => user ? base44.entities.CustomField.filter({ entity_name: activeEntity, user_id: user.email }, 'order', 50) : [],
    enabled: !!user,
  });

  const handleSave = async (data) => {
    if (editing) {
      await base44.entities.CustomField.update(editing.id, data);
      toast.success('Field updated');
    } else {
      await base44.entities.CustomField.create({ ...data, user_id: user.email, order: fields.length });
      toast.success('Field added');
    }
    qc.invalidateQueries({ queryKey: ['custom-fields', activeEntity, user?.email] });
    setEditing(null);
  };

  const handleDelete = async (id) => {
    await base44.entities.CustomField.delete(id);
    qc.invalidateQueries({ queryKey: ['custom-fields', activeEntity, user?.email] });
    toast.success('Field removed');
  };

  const FIELD_TYPE_COLORS = { text: '#0096c7', number: '#ff6d00', boolean: '#abff4f', date: '#9d4edd', select: '#ffee32' };

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/settings" className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1">
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#7a7a7a' }}>CUSTOM FIELDS</p>
          <p className="text-sm text-muted-foreground mt-0.5">Add your own data fields to any entity</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: '#abff4f', color: '#0a0a0a', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          <Plus size={13} /> Add Field
        </button>
      </div>

      {/* Entity tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 2 }}>
        {ENTITY_TYPES.map(t => (
          <button key={t.key} onClick={() => setActiveEntity(t.key)}
            style={{ padding: '7px 14px', borderRadius: 8, background: activeEntity === t.key ? '#abff4f' : '#141414', color: activeEntity === t.key ? '#0a0a0a' : '#888', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, border: '1px solid ' + (activeEntity === t.key ? 'transparent' : '#2a2a2a'), cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: activeEntity === t.key ? 700 : 400 }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {fields.length === 0 && (
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#444', textAlign: 'center', padding: '40px 0' }}>
            No custom fields for {ENTITY_TYPES.find(e => e.key === activeEntity)?.label} yet
          </p>
        )}
        <AnimatePresence>
          {fields.map((field, i) => (
            <motion.div key={field.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <GripVertical size={14} color="#333" style={{ flexShrink: 0, cursor: 'grab' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <p style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{field.field_label}</p>
                  {field.is_required && <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#c1121f', border: '1px solid rgba(193,18,31,0.3)', borderRadius: 4, padding: '1px 5px' }}>required</span>}
                </div>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555', marginTop: 1 }}>
                  key: {field.field_key}
                  {field.options?.length > 0 && ` · ${field.options.length} options`}
                </p>
              </div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, padding: '3px 8px', borderRadius: 6, background: `${FIELD_TYPE_COLORS[field.field_type]}15`, color: FIELD_TYPE_COLORS[field.field_type], border: `1px solid ${FIELD_TYPE_COLORS[field.field_type]}30`, flexShrink: 0 }}>
                {field.field_type}
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => { setEditing(field); setShowModal(true); }} style={{ padding: '6px', borderRadius: 6, background: 'transparent', border: '1px solid #2a2a2a', cursor: 'pointer', color: '#666' }}><Edit2 size={12} /></button>
                <button onClick={() => handleDelete(field.id)} style={{ padding: '6px', borderRadius: 6, background: 'transparent', border: '1px solid #2a2a2a', cursor: 'pointer', color: '#666' }}><Trash2 size={12} /></button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {(showModal || editing) && (
        <FieldModal
          field={editing}
          entityName={activeEntity}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}