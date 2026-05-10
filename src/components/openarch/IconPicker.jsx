import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, Upload, Grid } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { toast } from 'sonner';

const EMOJI_LIST = ['📦','🛒','🥩','🥛','🥬','🧴','🍰','🥤','❄️','🏠','🛠️','🎮','🎬','📚','✈️','🎵','🍽️','☕','🚕','🎁','💊','💪','🧠','💡','🔥','⭐','❤️','🏆','🎯','🔑','🌟','💎','🚀','🎨','📱','💻','🌿','🌊','⚡','🦁','🐉','🌺','🍎','🍕','🎭','🏋️','🎸','🎤','📸','🗓️','💰','📈','🔐','🎪','🏖️','🌙','☀️','🌈','🎃','🦋','🌸'];

const LUCIDE_ICONS = [
  'ShoppingCart','Package','Apple','Coffee','Car','Home','Heart','Star','Zap','Music',
  'Camera','Book','Globe','Map','Clock','Bell','Bookmark','Check','Circle','Triangle',
  'Square','Flag','Tag','Gift','Award','Target','Compass','Cpu','Database','Server',
  'Mail','Phone','User','Users','Settings','Tool','Scissors','Pen','Edit','Trash',
  'Archive','Download','Upload','Share','Link','Lock','Unlock','Eye','Search','Filter',
  'Grid','List','Layout','Sidebar','Monitor','Tablet','Smartphone','Headphones','Mic',
  'Speaker','Video','Film','Image','FileText','File','Folder','Layers','Sliders',
];

const TABS = [
  { id: 'emoji', label: 'Emoji', icon: '😊' },
  { id: 'library', label: 'Icons', icon: '📐' },
  { id: 'upload', label: 'Upload', icon: '⬆️' },
];

export default function IconPicker({ value, iconType, onChange, compact = false }) {
  const { user } = useCurrentUser();
  const qc = useQueryClient();
  const [tab, setTab] = useState(iconType || 'emoji');
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const { data: customIcons = [] } = useQuery({
    queryKey: ['custom-icons', user?.email],
    queryFn: () => user ? base44.entities.CustomIcon.filter({ user_id: user.email }) : [],
    enabled: !!user,
  });

  const filteredEmoji = search ? EMOJI_LIST.filter(e => e.includes(search)) : EMOJI_LIST;
  const filteredIcons = LUCIDE_ICONS.filter(i => !search || i.toLowerCase().includes(search.toLowerCase()));

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { toast.error('Max file size is 500KB'); return; }
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const record = await base44.entities.CustomIcon.create({
      user_id: user.email, name: file.name.replace(/\.[^.]+$/, ''),
      file_url, file_size: file.size,
    });
    qc.invalidateQueries({ queryKey: ['custom-icons', user?.email] });
    onChange(file_url, 'custom');
    setUploading(false);
    toast.success('Icon uploaded');
  };

  const select = (val, type) => onChange(val, type);

  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, overflow: 'hidden', width: compact ? 280 : '100%' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #2a2a2a' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setSearch(''); }}
            style={{ flex: 1, padding: '8px 4px', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, cursor: 'pointer', border: 'none', background: tab === t.id ? '#2a2a2a' : 'transparent', color: tab === t.id ? '#fff' : '#555', borderBottom: tab === t.id ? '2px solid #abff4f' : '2px solid transparent', transition: 'all 0.15s' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      {tab !== 'upload' && (
        <div style={{ padding: '8px 10px', borderBottom: '1px solid #1f1f1f', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Search size={12} color="#555" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
            style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, outline: 'none' }} />
        </div>
      )}

      {/* Emoji */}
      {tab === 'emoji' && (
        <div style={{ padding: 8, display: 'flex', flexWrap: 'wrap', gap: 2, maxHeight: 180, overflowY: 'auto' }}>
          {filteredEmoji.map(e => (
            <button key={e} onClick={() => select(e, 'emoji')}
              style={{ width: 32, height: 32, fontSize: 18, borderRadius: 6, border: value === e && iconType === 'emoji' ? '2px solid #abff4f' : '2px solid transparent', background: value === e && iconType === 'emoji' ? 'rgba(171,255,79,0.1)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {e}
            </button>
          ))}
        </div>
      )}

      {/* Library */}
      {tab === 'library' && (
        <div style={{ padding: 8, display: 'flex', flexWrap: 'wrap', gap: 2, maxHeight: 180, overflowY: 'auto' }}>
          {filteredIcons.map(ic => (
            <button key={ic} onClick={() => select(ic, 'library')} title={ic}
              style={{ width: 32, height: 32, borderRadius: 6, border: value === ic && iconType === 'library' ? '2px solid #abff4f' : '2px solid transparent', background: value === ic && iconType === 'library' ? 'rgba(171,255,79,0.1)' : 'transparent', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {ic.slice(0, 4)}
            </button>
          ))}
        </div>
      )}

      {/* Upload */}
      {tab === 'upload' && (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, width: '100%', maxHeight: 100, overflowY: 'auto' }}>
            {customIcons.map(ci => (
              <button key={ci.id} onClick={() => select(ci.file_url, 'custom')}
                style={{ width: 40, height: 40, borderRadius: 8, border: value === ci.file_url ? '2px solid #abff4f' : '2px solid #2a2a2a', background: '#141414', cursor: 'pointer', overflow: 'hidden', padding: 0 }}>
                <img src={ci.file_url} alt={ci.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
          <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.svg,.webp" onChange={handleUpload} style={{ display: 'none' }} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            style={{ padding: '8px 16px', borderRadius: 8, background: '#2a2a2a', color: '#aaa', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, border: '1px solid #333', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Upload size={12} /> {uploading ? 'Uploading…' : 'Upload Image'}
          </button>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#444' }}>Max 500KB · JPG, PNG, SVG</p>
        </div>
      )}
    </div>
  );
}