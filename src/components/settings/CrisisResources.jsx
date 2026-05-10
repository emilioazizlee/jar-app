import React from 'react';
import { Phone } from 'lucide-react';

const RESOURCES = {
  Spain: [
    { label: 'Mental Health Crisis Line', number: '024', type: 'mental' },
    { label: 'Eating Disorder Helpline', number: '900 931 237', type: 'eating' },
    { label: 'Addiction Support', number: '900 161 515', type: 'addiction' },
    { label: 'General Health Line', number: '061', type: 'health' },
  ],
  Azerbaijan: [
    { label: 'Mental Health Crisis Line', number: '103', type: 'mental' },
    { label: 'Addiction Support', number: '055-123-45-67', type: 'addiction' },
    { label: 'General Health Line', number: '103', type: 'health' },
  ],
  UK: [
    { label: 'Mental Health Crisis Line', number: '111', type: 'mental' },
    { label: 'Eating Disorder Helpline', number: '0808 801 0677', type: 'eating' },
    { label: 'Addiction Support', number: '0300 123 6600', type: 'addiction' },
    { label: 'General Health Line', number: '111', type: 'health' },
  ],
  US: [
    { label: 'Mental Health Crisis Line', number: '988', type: 'mental' },
    { label: 'Anti-Smoking Helpline', number: '1-800-QUIT-NOW', type: 'smoking' },
    { label: 'Eating Disorder Helpline', number: '1-800-931-2237', type: 'eating' },
    { label: 'Addiction Support (SAMHSA)', number: '1-800-662-4357', type: 'addiction' },
    { label: 'General Health Line', number: '211', type: 'health' },
  ],
  France: [
    { label: 'Mental Health Crisis Line', number: '3114', type: 'mental' },
    { label: 'Eating Disorder Helpline', number: '0 810 037 037', type: 'eating' },
    { label: 'Addiction Support', number: '0 800 23 13 13', type: 'addiction' },
    { label: 'General Health Line', number: '15', type: 'health' },
  ],
  Germany: [
    { label: 'Mental Health Crisis Line', number: '0800 1110111', type: 'mental' },
    { label: 'Eating Disorder Helpline', number: '0221 892031', type: 'eating' },
    { label: 'Addiction Support', number: '01805 313031', type: 'addiction' },
    { label: 'General Health Line', number: '116117', type: 'health' },
  ],
  Russia: [
    { label: 'Mental Health Crisis Line', number: '8-800-2000-122', type: 'mental' },
    { label: 'Addiction Support', number: '8-800-200-0-200', type: 'addiction' },
    { label: 'General Health Line', number: '103', type: 'health' },
  ],
  Turkey: [
    { label: 'Mental Health Crisis Line', number: '182', type: 'mental' },
    { label: 'Addiction Support', number: '444 0 833', type: 'addiction' },
    { label: 'General Health Line', number: '112', type: 'health' },
  ],
};

const DEFAULT_RESOURCES = RESOURCES['US'];

export default function CrisisResources({ country }) {
  const resources = RESOURCES[country] || DEFAULT_RESOURCES;
  return (
    <div style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
      {resources.map((r, i) => (
        <div
          key={r.label}
          style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
            borderBottom: i < resources.length - 1 ? '1px solid #1f1f1f' : 'none',
          }}
        >
          <Phone size={16} color="#7a7a7a" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, color: '#fff' }}>{r.label}</p>
            <p style={{ fontSize: 13, color: '#7a7a7a', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>{r.number}</p>
          </div>
          <a
            href={`tel:${r.number.replace(/[^0-9+]/g, '')}`}
            style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
              color: '#abff4f', border: '1px solid rgba(171,255,79,0.3)',
              borderRadius: 8, padding: '4px 12px', textDecoration: 'none',
              background: 'rgba(171,255,79,0.06)',
            }}
          >
            Call
          </a>
        </div>
      ))}
      <div style={{ padding: '12px 18px', borderTop: '1px solid #1f1f1f' }}>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555', lineHeight: 1.5 }}>
          These are public resources for your country. JAR is not a medical service.
        </p>
      </div>
    </div>
  );
}