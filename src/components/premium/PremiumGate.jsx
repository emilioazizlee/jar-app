import React, { useState } from 'react';
import { usePremium } from '@/hooks/usePremium';
import PaywallModal from './PaywallModal';
import PremiumBadge from './PremiumBadge';
import { Lock } from 'lucide-react';

/**
 * Wraps a premium feature page/section.
 * If user is not premium, shows a locked overlay with upgrade CTA.
 */
export default function PremiumGate({ children, featureName, preview }) {
  const { isPremium, isLoading } = usePremium();
  const [showPaywall, setShowPaywall] = useState(false);

  if (isLoading) return null;
  if (isPremium) return <>{children}</>;

  return (
    <>
      <div style={{ position: 'relative', minHeight: 320, borderRadius: 16, overflow: 'hidden', border: '1px solid #2a2a2a' }}>
        {/* Blurred preview */}
        {preview && (
          <div style={{ filter: 'blur(4px)', pointerEvents: 'none', opacity: 0.4, userSelect: 'none' }}>
            {preview}
          </div>
        )}
        {!preview && <div style={{ height: 280 }} />}

        {/* Lock overlay */}
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: preview ? 'rgba(10,10,10,0.7)' : '#0d0d0d',
            gap: 12,
          }}
        >
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,238,50,0.08)', border: '1px solid rgba(255,238,50,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={22} color="#ffee32" />
          </div>
          <PremiumBadge />
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#ddd', fontWeight: 600 }}>{featureName}</p>
          <p style={{ fontSize: 12, color: '#666', textAlign: 'center', maxWidth: 260, lineHeight: 1.5 }}>
            Upgrade to Premium to unlock this feature
          </p>
          <button
            onClick={() => setShowPaywall(true)}
            style={{
              marginTop: 4, padding: '10px 24px', borderRadius: 10,
              background: 'linear-gradient(135deg, #ffee32 0%, #ff6d00 100%)',
              color: '#0a0a0a', fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
            }}
          >
            ⚡ Unlock Premium
          </button>
        </div>
      </div>

      {showPaywall && <PaywallModal featureName={featureName} onClose={() => setShowPaywall(false)} />}
    </>
  );
}