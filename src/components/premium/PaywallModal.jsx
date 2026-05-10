import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Check, Lock } from 'lucide-react';
import { usePremium } from '@/hooks/usePremium';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const FREE_FEATURES = [
  'Daily spend & task tracking',
  'Basic analytics (30-day)',
  'Grocery & pantry management',
  'Budget alerts',
  'Diet & health logging',
  'Up to 500 entries/month',
];

const PREMIUM_FEATURES = [
  { label: 'Visual Planner (drag & drop)', icon: '🗓️' },
  { label: 'Advanced Analytics Dashboard', icon: '📊' },
  { label: 'Multi-Currency Conversion', icon: '💱' },
  { label: 'Cloud Sync (multi-device)', icon: '☁️' },
  { label: 'Accountant Export (CSV/PDF)', icon: '🧾' },
  { label: 'Unlimited entries', icon: '∞' },
  { label: 'Priority support', icon: '⚡' },
];

export default function PaywallModal({ onClose, featureName }) {
  const { activateTrial } = usePremium();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);

  const handleTrial = async () => {
    setLoading(true);
    await activateTrial();
    qc.invalidateQueries({ queryKey: ['subscriptions'] });
    toast.success('7-day free trial activated! Enjoy Premium 🎉');
    onClose();
    setLoading(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          style={{
            width: '100%', maxWidth: 520,
            background: '#111', border: '1px solid #2a2a2a',
            borderRadius: 16, overflow: 'hidden',
          }}
        >
          {/* Header gradient */}
          <div style={{
            padding: '28px 28px 20px',
            background: 'linear-gradient(135deg, rgba(255,238,50,0.08) 0%, rgba(255,109,0,0.08) 100%)',
            borderBottom: '1px solid #1f1f1f',
          }}>
            <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,238,50,0.12)', border: '1px solid rgba(255,238,50,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} fill="#ffee32" color="#ffee32" />
              </div>
              <div>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#ffee32', textTransform: 'uppercase', letterSpacing: 1 }}>Premium Feature</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginTop: 1 }}>{featureName || 'Unlock JAR Premium'}</p>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#888', lineHeight: 1.5 }}>
              This feature requires a Premium subscription. Start your 7-day free trial — no payment required.
            </p>
          </div>

          {/* Feature comparison */}
          <div style={{ padding: '20px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Free</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {FREE_FEATURES.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <Check size={12} color="#555" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#666', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#ffee32', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Premium</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {PREMIUM_FEATURES.map(f => (
                  <div key={f.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <span style={{ fontSize: 11 }}>{f.icon}</span>
                    <span style={{ fontSize: 12, color: '#ddd', lineHeight: 1.4 }}>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div style={{ padding: '0 28px 28px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={handleTrial}
              disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: 10,
                background: 'linear-gradient(135deg, #ffee32 0%, #ff6d00 100%)',
                color: '#0a0a0a', fontFamily: 'JetBrains Mono, monospace',
                fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Activating…' : '⚡ Start 7-Day Free Trial'}
            </button>
            <button
              style={{
                width: '100%', padding: '11px', borderRadius: 10,
                background: 'transparent', color: '#888',
                fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
                border: '1px solid #2a2a2a', cursor: 'pointer',
              }}
            >
              Upgrade to Premium — €2.99/month
            </button>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#444', textAlign: 'center', marginTop: 4 }}>
              Payment integration coming soon · No card required for trial
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}