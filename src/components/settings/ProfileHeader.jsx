import React, { useMemo, useState } from 'react';
import ProfileEditModal from './ProfileEditModal';
import { Pencil } from 'lucide-react';

export default function ProfileHeader({ user, items = [], onUserUpdated }) {
  const [showEdit, setShowEdit] = useState(false);

  const stats = useMemo(() => {
    const totalEntries = items.length;
    const totalJars = (totalEntries / 10).toFixed(1);
    const dates = new Set(items.map(i => i.date).filter(Boolean));
    const daysActive = dates.size;
    return { totalJars, totalEntries, daysActive };
  }, [items]);

  const initials = user?.full_name
    ? user.full_name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <>
      <div style={{
        background: '#141414',
        border: '1px solid #1f1f1f',
        borderRadius: 12,
        padding: 22,
        marginBottom: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}>
        {/* Top: avatar + identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Avatar */}
          <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
            {user?.photo_url ? (
              <img src={user.photo_url} alt="avatar" style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', border: '1px solid #2a2a2a' }} />
            ) : (
              <div style={{
                width: 64, height: 64, borderRadius: 12,
                background: '#1f1f1f',
                border: '1px solid #2a2a2a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 22,
                color: '#abff4f',
                fontWeight: 700,
              }}>
                {initials}
              </div>
            )}
          </div>

          {/* Name / email */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>
              {user?.full_name || 'Loading...'}
            </p>
            <p style={{ fontSize: 13, color: '#7a7a7a', fontFamily: 'Inter, sans-serif' }}>
              {user?.email || ''}
            </p>
            <button
              onClick={() => setShowEdit(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#abff4f', background: 'none', border: 'none', padding: 0, cursor: 'pointer', marginTop: 6 }}
            >
              <Pencil size={11} /> Edit Profile
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#1f1f1f' }} />

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
          {[
            { value: stats.totalJars, label: 'JARS FILLED' },
            { value: stats.totalEntries, label: 'ENTRIES LOGGED' },
            { value: stats.daysActive, label: 'DAYS ACTIVE' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{value}</p>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: '#7a7a7a', marginTop: 4 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {showEdit && (
        <ProfileEditModal
          user={user}
          onClose={() => setShowEdit(false)}
          onSaved={onUserUpdated}
        />
      )}
    </>
  );
}