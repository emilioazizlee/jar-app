import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Trash2, Plus, ArrowLeft, GripVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#abff4f','#ffee32','#ff6b6b','#74b9ff','#fd79a8','#a29bfe','#55efc4','#fdcb6e','#e17055','#00cec9'];

const DEFAULT_PRESETS = [
  { label: 'Cigarettes', icon: '🚬', category_key: 'cigarettes', color: '#e17055' },
  { label: 'Coffee',     icon: '☕', category_key: 'coffee',     color: '#fdcb6e' },
  { label: 'Taxi',       icon: '🚕', category_key: 'taxi',       color: '#74b9ff' },
  { label: 'Food Out',   icon: '🍽️', category_key: 'food_out',   color: '#abff4f' },
  { label: 'Groceries',  icon: '🛒', category_key: 'groceries',  color: '#55efc4' },
];

export default function QuickTapManager() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();

  const [form, setForm] = useState({ label: '', icon: '⚡', category_key: '', color: COLORS[0] });
  const [saving, setSaving] = useState(false);

  const { data: presets = [], isLoading } = useQuery({
    queryKey: ['quick-tap-presets', user?.email],
    queryFn: () => user ? base44.entities.QuickTapPreset.filter({ created_by: user.email }, 'order', 100) : [],
    enabled: !!user,
    initialData: [],
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['quick-tap-presets'] });

  const handleAdd = async () => {
    if (!form.label.trim() || !form.category_key.trim()) return;
    setSaving(true);
    await base44.entities.QuickTapPreset.create({
      ...form,
      label: form.label.trim(),
      category_key: form.category_key.trim().toLowerCase().replace(/\s+/g, '_'),
      order: presets.length,
    });
    setForm({ label: '', icon: '⚡', category_key: '', color: COLORS[0] });
    refresh();
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.QuickTapPreset.delete(id);
    refresh();
  };

  const handleSeedDefaults = async () => {
    for (let i = 0; i < DEFAULT_PRESETS.length; i++) {
      await base44.entities.QuickTapPreset.create({ ...DEFAULT_PRESETS[i], order: i });
    }
    refresh();
  };

  return (
    <div className="max-w-xl mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft size={16} className="text-muted-foreground" />
        </button>
        <div>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'hsl(var(--muted-foreground))' }}>QUICK TAP MANAGER</p>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>Create your own fast-log buttons</p>
        </div>
      </div>

      {/* Current presets */}
      <div className="bg-card border border-border rounded-xl overflow-hidden mb-4">
        {isLoading ? (
          <div className="p-8 text-center font-mono text-sm text-muted-foreground">Loading...</div>
        ) : presets.length === 0 ? (
          <div className="p-8 flex flex-col items-center gap-3">
            <p className="font-mono text-xs text-muted-foreground text-center">No custom quick taps yet.<br />Add your own or load the defaults.</p>
            <button
              onClick={handleSeedDefaults}
              className="font-mono text-xs px-4 py-2 rounded-lg border border-border hover:border-primary/40 text-muted-foreground hover:text-primary transition-all"
            >
              Load defaults (cigarettes, coffee, taxi…)
            </button>
          </div>
        ) : (
          presets.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: i < presets.length - 1 ? '1px solid hsl(var(--border))' : 'none' }}
            >
              <GripVertical size={14} className="text-muted-foreground/40 shrink-0" />
              <span className="text-xl shrink-0">{p.icon}</span>
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: p.color || '#abff4f' }}
              />
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'hsl(var(--foreground))' }}>{p.label}</p>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'hsl(var(--muted-foreground))' }}>key: {p.category_key}</p>
              </div>
              <button
                onClick={() => handleDelete(p.id)}
                className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors shrink-0"
              >
                <Trash2 size={13} className="text-destructive" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add new */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'hsl(var(--muted-foreground))', marginBottom: 12 }}>NEW QUICK TAP</p>

        <div className="space-y-3">
          {/* Icon + Label row */}
          <div className="flex gap-2">
            <input
              value={form.icon}
              onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
              placeholder="🔥"
              style={{ width: 52, textAlign: 'center', fontSize: 22, background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))', borderRadius: 8, padding: '8px 6px', fontFamily: 'monospace' }}
            />
            <input
              value={form.label}
              onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              placeholder="Marlboro Red"
              style={{ flex: 1, background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))', borderRadius: 8, padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'hsl(var(--foreground))' }}
            />
          </div>

          {/* Category key */}
          <div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'hsl(var(--muted-foreground))', marginBottom: 4 }}>CATEGORY KEY (auto-slug)</p>
            <input
              value={form.category_key}
              onChange={e => setForm(f => ({ ...f, category_key: e.target.value }))}
              placeholder="marlboro_red  (or leave blank = auto)"
              style={{ width: '100%', background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))', borderRadius: 8, padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'hsl(var(--foreground))' }}
            />
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'hsl(var(--muted-foreground))', marginTop: 4 }}>
              Leave blank and it will be auto-generated from the label
            </p>
          </div>

          {/* Color picker */}
          <div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'hsl(var(--muted-foreground))', marginBottom: 6 }}>ACCENT COLOR</p>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  style={{
                    width: 26, height: 26, borderRadius: 6, background: c,
                    border: form.color === c ? '2px solid hsl(var(--foreground))' : '2px solid transparent',
                    cursor: 'pointer', padding: 0,
                  }}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={saving || !form.label.trim()}
            style={{
              width: '100%', padding: '10px', borderRadius: 8,
              background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))',
              fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700,
              border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <Plus size={14} />
            {saving ? 'Adding...' : 'Add Quick Tap'}
          </button>
        </div>
      </div>
    </div>
  );
}