import React from 'react';
import { Zap } from 'lucide-react';

export default function PremiumBadge({ size = 'sm' }) {
  const small = size === 'xs';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: small ? '2px 6px' : '3px 8px',
      borderRadius: 6,
      background: 'linear-gradient(135deg, rgba(255,238,50,0.15) 0%, rgba(255,109,0,0.15) 100%)',
      border: '1px solid rgba(255,238,50,0.35)',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: small ? 9 : 10,
      fontWeight: 700,
      color: '#ffee32',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    }}>
      <Zap size={small ? 8 : 10} fill="#ffee32" color="#ffee32" />
      PREMIUM
    </span>
  );
}