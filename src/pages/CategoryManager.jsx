import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ArrowLeft, Plus, Trash2, Edit2, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import IconPicker from '@/components/openarch/IconPicker';
import CategoryIcon from '@/components/openarch/CategoryIcon';
import { DEFAULT_CATEGORIES } from '@/lib/defaultCategories';

const ENTITY_TYPES = [
  { key: 'grocery',  label: 'Grocery',  emoji: '🛒' },
  { key: 'leisure',  label: 'Leisure',  emoji: '🎭' },
  { key: 'spend',    label: 'Spend',    emoji: '💸' },
  { key: 'task',     label: 'Tasks',    emoji: '✅' },
  { key: 'recipe',   label: 'Recipes',  emoji: '🍳' },
];

const LANG_LABELS = { en: 'English', ru: 'Русский', es: 'Español', fr: 'Français', tr: 'Türkçe', de: 'Deutsch', az: 'Azərbaycanca' };
const PRESET_COLORS = ['#abff4f','#ffee32','#ff6d00','#0096c7','#9d4edd','#ffb3c6','#c1121f','#7a7a7a','#90e0ef','#ffb347'];

function CategoryModal({ category, entityType, onClose, onSave }) {
  const [form, setForm] = useState({
    name: category?.name || '',
    icon_type: category?.icon_type || 'emoji',
    icon_value: category?.icon_value || '📦',
    color: category?.color || '#0096c7',
    translations: category?.translations || {},
    showTranslations: false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await onSave({ ...form, entity_type: entityType });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ width: '100%', maxWidth: 500, background: '#111', border: '1px solid #2a2a2a', borderRadius: 16, overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #1f1f1f' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#fff', fontWeight: 700 }}>{category ? 'Edit Category' : 'New Category'}</p>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#1a1a1a', borderRadius: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${form.color}22`, border: `1px solid ${form.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CategoryIcon iconType={form.icon_type} iconValue={form.icon_value} size={24} color={form.color} />
            </div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#fff', fontWeight: 600 }}>{form.name || 'Category Name'}</p>
          </div>

          {/* Name */}
          <div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>Name</p>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Halal Food"
              style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }} />
          </div>

          {/* Color */}
          <div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>Color</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: form.color === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer' }} />
              ))}
              <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #2a2a2a', cursor: 'pointer', background: 'none', padding: 0 }} />
            </div>
          </div>

          {/* Icon */}
          <div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>Icon</p>
            <IconPicker value={form.icon_value} iconType={form.icon_type} onChange={(val, type) => setForm(f => ({ ...f, icon_value: val, icon_type: type }))} />
          </div>

          {/* Translations (collapsible) */}
          <div>
            <button onClick={() => setForm(f => ({ ...f, showTranslations: !f.showTranslations }))}
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1 }}>
              {form.showTranslations ? '▾' : '▸'} Translations (optional)
            </button>
            <AnimatePresence>
              {form.showTranslations && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                  <div style={{ paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {Object.entries(LANG_LABELS).map(([code, label]) => (
                      <div key={code} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555', width: 90 }}>{label}</span>
                        <input value={form.translations[code] || ''} onChange={e => setForm(f => ({ ...f, translations: { ...f.translations, [code]: e.target.value } }))}
                          placeholder={form.name}
                          style={{ flex: 1, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 6, color: '#aaa', padding: '5px 8px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div style={{ padding: '0 20px 20px', display: 'flex', gap: 8 }}>
          <button onClick={handleSave} disabled={saving || !form.name.trim()}
            style={{ flex: 1, padding: '10px', borderRadius: 8, background: '#abff4f', color: '#0a0a0a', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', opacity: !form.name.trim() ? 0.4 : 1 }}>
            {saving ? 'Saving…' : category ? 'Update' : 'Create Category'}
          </button>
          <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: 8, background: 'transparent', color: '#666', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, border: '1px solid #2a2a2a', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function CategoryManager() {
  const { user } = useCurrentUser();
  const qc = useQueryClient();
  const [activeType, setActiveType] = useState('grocery');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [importingDefaults, setImportingDefaults] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['custom-categories', activeType, user?.email],
    queryFn: () => user ? base44.entities.CustomCategory.filter({ entity_type: activeType, user_id: user.email }, 'name', 100) : [],
    enabled: !!user,
  });

  const handleSave = async (data) => {
    if (editing) {
      await base44.entities.CustomCategory.update(editing.id, data);
      toast.success('Category updated');
    } else {
      await base44.entities.CustomCategory.create({ ...data, user_id: user.email });
      toast.success('Category created');
    }
    qc.invalidateQueries({ queryKey: ['custom-categories', activeType, user?.email] });
    setEditing(null);
  };

  const handleDelete = async (id) => {
    await base44.entities.CustomCategory.delete(id);
    qc.invalidateQueries({ queryKey: ['custom-categories', activeType, user?.email] });
    toast.success('Category deleted');
  };

  const importDefaults = async () => {
    setImportingDefaults(true);
    const defaults = DEFAULT_CATEGORIES[activeType] || [];
    for (const d of defaults) {
      const exists = categories.find(c => c.name.toLowerCase() === d.name.toLowerCase());
      if (!exists) {
        await base44.entities.CustomCategory.create({ ...d, user_id: user.email, entity_type: activeType, is_default: true, usage_count: 0 });
      }
    }
    qc.invalidateQueries({ queryKey: ['custom-categories', activeType, user?.email] });
    toast.success('Default categories imported');
    setImportingDefaults(false);
  };

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/settings" className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1">
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#7a7a7a' }}>CATEGORY MANAGER</p>
          <p className="text-sm text-muted-foreground mt-0.5">Customize categories across all modules</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: '#abff4f', color: '#0a0a0a', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          <Plus size={13} /> Add
        </button>
      </div>

      {/* Entity type tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 2 }}>
        {ENTITY_TYPES.map(t => (
          <button key={t.key} onClick={() => setActiveType(t.key)}
            style={{ padding: '7px 14px', borderRadius: 8, background: activeType === t.key ? '#abff4f' : '#141414', color: activeType === t.key ? '#0a0a0a' : '#888', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, border: '1px solid ' + (activeType === t.key ? 'transparent' : '#2a2a2a'), cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: activeType === t.key ? 700 : 400 }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Import defaults */}
      {categories.length === 0 && (
        <div style={{ background: '#141414', border: '1px dashed #2a2a2a', borderRadius: 12, padding: '20px', textAlign: 'center', marginBottom: 16 }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#666', marginBottom: 10 }}>No custom categories yet</p>
          <button onClick={importDefaults} disabled={importingDefaults}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#1a1a1a', color: '#aaa', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, border: '1px solid #2a2a2a', cursor: 'pointer' }}>
            <Download size={12} /> {importingDefaults ? 'Importing…' : 'Import Default Categories'}
          </button>
        </div>
      )}

      {/* Category list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <AnimatePresence>
          {categories.map(cat => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${cat.color || '#0096c7'}22`, border: `1px solid ${cat.color || '#0096c7'}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CategoryIcon iconType={cat.icon_type} iconValue={cat.icon_value} size={20} color={cat.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{cat.name}</p>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555', marginTop: 1 }}>
                  Used {cat.usage_count || 0} times{cat.is_default ? ' · default' : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => { setEditing(cat); setShowModal(true); }}
                  style={{ padding: '6px', borderRadius: 6, background: 'transparent', border: '1px solid #2a2a2a', cursor: 'pointer', color: '#666' }}>
                  <Edit2 size={12} />
                </button>
                <button onClick={() => handleDelete(cat.id)}
                  style={{ padding: '6px', borderRadius: 6, background: 'transparent', border: '1px solid #2a2a2a', cursor: 'pointer', color: '#666' }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {(showModal || editing) && (
        <CategoryModal
          category={editing}
          entityType={activeType}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}