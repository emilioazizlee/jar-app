import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { X, Camera, Loader2 } from 'lucide-react';

export default function ProfileEditModal({ user, onClose, onSaved }) {
  const [name, setName] = useState(user?.full_name || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photo_url || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPhotoUrl(file_url);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ full_name: name, photo_url: photoUrl });
      toast.success('Profile updated');
      onSaved?.();
      onClose();
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const initials = name
    ? name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 20 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#fff', textTransform: 'uppercase', letterSpacing: 1 }}>Edit Profile</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#7a7a7a', cursor: 'pointer', padding: 4 }}><X size={16} /></button>
        </div>

        {/* Avatar */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            style={{ position: 'relative', width: 88, height: 88, borderRadius: 16, cursor: 'pointer' }}
            onClick={() => fileRef.current?.click()}
          >
            {photoUrl ? (
              <img src={photoUrl} alt="avatar" style={{ width: 88, height: 88, borderRadius: 16, objectFit: 'cover', border: '1px solid #2a2a2a' }} />
            ) : (
              <div style={{ width: 88, height: 88, borderRadius: 16, background: '#1f1f1f', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 700, color: '#abff4f' }}>
                {initials}
              </div>
            )}
            <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#abff4f', borderRadius: 8, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {uploading ? <Loader2 size={12} color="#0a0a0a" className="animate-spin" /> : <Camera size={12} color="#0a0a0a" />}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Display Name</p>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', padding: '10px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Email</p>
            <input
              value={user?.email || ''}
              disabled
              style={{ width: '100%', background: '#111', border: '1px solid #1a1a1a', borderRadius: 8, color: '#555', padding: '10px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, boxSizing: 'border-box', cursor: 'not-allowed' }}
            />
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || uploading}
          style={{ padding: '12px 0', background: '#abff4f', color: '#0a0a0a', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, borderRadius: 10, border: 'none', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}