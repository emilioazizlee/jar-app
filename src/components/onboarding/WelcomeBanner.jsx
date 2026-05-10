import React from 'react';
import { motion } from 'framer-motion';

const TIPS = [
  { icon: '💰', text: 'Tap + to log your first spend' },
  { icon: '✅', text: 'Head to Tasks to capture your to-dos' },
  { icon: '🥗', text: 'Visit Diet to start tracking nutrition' },
  { icon: '❤️', text: 'Log health metrics in the Health section' },
];

export default function WelcomeBanner({ userName }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'linear-gradient(135deg, rgba(171,255,79,0.08) 0%, rgba(255,238,50,0.04) 100%)',
        border: '1px solid rgba(171,255,79,0.2)',
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 20,
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">🫙</span>
        <div>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: '#abff4f' }}>
            Welcome{userName ? `, ${userName.split(' ')[0]}` : ''}!
          </p>
          <p style={{ fontSize: 13, color: '#aaa', marginTop: 2 }}>
            JAR is ready. Start filling it up.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {TIPS.map((tip, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '8px 12px',
            }}
          >
            <span style={{ fontSize: 16 }}>{tip.icon}</span>
            <p style={{ fontSize: 12, color: '#bbb', lineHeight: 1.3 }}>{tip.text}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}