import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: `JAR collects information you provide directly, including account details (name, email), and data you log within the app (expenses, tasks, health entries, dietary logs, and other personal records). We also collect usage data automatically, such as app interactions and device information, to improve your experience.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use your data solely to provide and improve the JAR service. This includes displaying your data back to you, generating insights and analytics within the app, and maintaining your account. We do not sell your personal data to third parties.`,
  },
  {
    title: '3. Data Storage & Security',
    content: `Your data is stored securely on servers provided by our infrastructure partners. We use industry-standard encryption in transit (TLS) and at rest. Access to your data is restricted to authorized personnel only. However, no system is perfectly secure, and we encourage you to use a strong password.`,
  },
  {
    title: '4. Data Retention',
    content: `We retain your data for as long as your account is active or as needed to provide services. You may delete your data at any time from Settings → Data → Clear All Data. Upon account deletion, your data is permanently removed within 30 days.`,
  },
  {
    title: '5. Sharing of Information',
    content: `We do not share your personal data with third parties except as necessary to operate the service (e.g., infrastructure providers), comply with legal obligations, or with your explicit consent. Any service providers we use are bound by confidentiality agreements.`,
  },
  {
    title: '6. Cookies & Local Storage',
    content: `JAR uses browser local storage to save your preferences and session data. We do not use third-party advertising cookies. Essential cookies may be used to maintain your login session.`,
  },
  {
    title: '7. Your Rights',
    content: `Depending on your jurisdiction, you may have the right to access, correct, export, or delete your personal data. To exercise these rights, use the in-app data tools in Settings or contact us at privacy@jar.app. EU/EEA residents have additional rights under GDPR.`,
  },
  {
    title: '8. Children\'s Privacy',
    content: `JAR is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such data, please contact us immediately.`,
  },
  {
    title: '9. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes via in-app notification or email. Continued use of JAR after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: '10. Contact',
    content: `For privacy-related questions or requests, contact us at privacy@jar.app.`,
  },
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto pb-32">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
        >
          <ArrowLeft size={18} color="#7a7a7a" />
        </button>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#7a7a7a' }}>
          Privacy Policy
        </p>
      </div>

      <div style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12, padding: '24px 28px', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Privacy Policy</h1>
        <p style={{ fontSize: 13, color: '#7a7a7a', fontFamily: 'JetBrains Mono, monospace' }}>Last updated: May 2026 · JAR App</p>
        <p style={{ fontSize: 14, color: '#aaa', marginTop: 16, lineHeight: 1.7 }}>
          JAR ("we", "our", "us") is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information when you use the JAR application.
        </p>
      </div>

      {SECTIONS.map((s) => (
        <div
          key={s.title}
          style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12, padding: '20px 28px', marginBottom: 10 }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 10 }}>{s.title}</h2>
          <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.75 }}>{s.content}</p>
        </div>
      ))}

      <div style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12, padding: '16px 28px', marginTop: 8 }}>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555', lineHeight: 1.6 }}>
          JAR is not a medical service. Data you log is for personal tracking only. Always consult a qualified professional for health, financial, or legal advice.
        </p>
      </div>
    </div>
  );
}