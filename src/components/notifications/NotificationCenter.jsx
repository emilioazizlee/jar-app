import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bell, X, ShoppingCart, DollarSign, Package, TrendingDown, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { format } from 'date-fns';

const TYPE_CONFIG = {
  price_alert:     { icon: TrendingDown, color: '#0096c7',  bg: 'rgba(0,150,199,0.1)' },
  staple_reminder: { icon: ShoppingCart, color: '#abff4f',  bg: 'rgba(171,255,79,0.1)' },
  budget_warning:  { icon: DollarSign,   color: '#ffee32',  bg: 'rgba(255,238,50,0.1)' },
  pantry_low:      { icon: Package,      color: '#ff6d00',  bg: 'rgba(255,109,0,0.1)' },
};

export default function NotificationCenter() {
  const { user } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => user
      ? base44.entities.Notification.filter({ user_id: user.email }, '-created_date', 50)
      : [],
    enabled: !!user,
    refetchInterval: 30000, // poll every 30s
  });

  const unread = notifications.filter(n => !n.is_read);

  const markRead = async (id) => {
    await base44.entities.Notification.update(id, { is_read: true });
    qc.invalidateQueries({ queryKey: ['notifications', user?.email] });
  };

  const markAllRead = async () => {
    await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    qc.invalidateQueries({ queryKey: ['notifications', user?.email] });
  };

  const deleteNotif = async (id) => {
    await base44.entities.Notification.delete(id);
    qc.invalidateQueries({ queryKey: ['notifications', user?.email] });
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unread.length > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full flex items-center justify-center font-mono text-[9px] font-bold text-black"
            style={{ background: '#abff4f' }}
          >
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-10 z-50 w-80 md:w-96"
              style={{
                background: '#141414',
                border: '1px solid #1f1f1f',
                borderRadius: 14,
                boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                maxHeight: '70vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #1f1f1f' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Bell size={14} color="#7a7a7a" />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#7a7a7a' }}>
                    Notifications
                  </span>
                  {unread.length > 0 && (
                    <span style={{ background: 'rgba(171,255,79,0.15)', color: '#abff4f', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, padding: '2px 6px', borderRadius: 10, border: '1px solid rgba(171,255,79,0.3)' }}>
                      {unread.length} new
                    </span>
                  )}
                </div>
                {unread.length > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#7a7a7a', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                    className="hover:text-foreground transition-colors"
                  >
                    <CheckCheck size={12} /> Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#555' }}>
                    <Bell size={24} color="#333" style={{ margin: '0 auto 8px' }} />
                    No notifications yet
                  </div>
                ) : (
                  notifications.map(notif => {
                    const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.budget_warning;
                    const Icon = cfg.icon;
                    return (
                      <div
                        key={notif.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                          padding: '12px 16px',
                          borderBottom: '1px solid #1a1a1a',
                          background: notif.is_read ? 'transparent' : 'rgba(255,255,255,0.02)',
                          cursor: notif.action_url ? 'pointer' : 'default',
                        }}
                        onClick={() => {
                          if (!notif.is_read) markRead(notif.id);
                          if (notif.action_url) {
                            window.location.href = notif.action_url;
                            setOpen(false);
                          }
                        }}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0, flexShrink: 0, marginTop: 2 }}>
                          <Icon size={13} color={cfg.color} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: notif.is_read ? '#555' : '#fff' }}>
                              {notif.title}
                            </span>
                            {!notif.is_read && (
                              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#abff4f', flexShrink: 0 }} />
                            )}
                          </div>
                          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#7a7a7a', lineHeight: 1.5, wordBreak: 'break-word' }}>
                            {notif.message}
                          </p>
                          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#444', marginTop: 4 }}>
                            {format(new Date(notif.created_date), 'MMM d, HH:mm')}
                          </p>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); deleteNotif(notif.id); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', padding: 2, flexShrink: 0 }}
                          className="hover:text-foreground transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}