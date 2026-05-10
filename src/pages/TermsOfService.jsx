import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using JAR ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App. These terms apply to all users of the App.`,
  },
  {
    title: '2. Description of Service',
    content: `JAR is a personal life-management application designed to help you track expenses, tasks, health data, diet, and other personal records. The App is provided for personal, non-commercial use. We reserve the right to modify or discontinue the service at any time.`,
  },
  {
    title: '3. User Accounts',
    content: `You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized access to your account. You are responsible for all activity that occurs under your account. We reserve the right to terminate accounts that violate these terms.`,
  },
  {
    title: '4. Acceptable Use',
    content: `You agree not to use JAR for any unlawful purpose, to upload malicious content, to attempt to gain unauthorized access to any part of the service, to reverse-engineer or copy any part of the App, or to use the App in any way that could damage or impair the service or interfere with other users.`,
  },
  {
    title: '5. Your Content',
    content: `You retain ownership of all data you enter into JAR. By using the App, you grant us a limited license to store and process your data solely for the purpose of providing the service to you. You are responsible for the accuracy and legality of the content you submit.`,
  },
  {
    title: '6. Privacy',
    content: `Your use of JAR is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices regarding your personal data.`,
  },
  {
    title: '7. Disclaimer of Warranties',
    content: `JAR is provided "as is" and "as available" without warranties of any kind, express or implied. We do not warrant that the App will be error-free, uninterrupted, or free of viruses. The App is not a substitute for professional medical, financial, legal, or other advice.`,
  },
  {
    title: '8. Limitation of Liability',
    content: `To the fullest extent permitted by law, JAR and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the App, even if we have been advised of the possibility of such damages.`,
  },
  {
    title: '9. Termination',
    content: `We reserve the right to suspend or terminate your access to JAR at our discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties. You may terminate your account at any time from the Settings page.`,
  },
  {
    title: '10. Changes to Terms',
    content: `We reserve the right to modify these Terms at any time. We will notify you of material changes via in-app notification or email. Your continued use of JAR after changes take effect constitutes acceptance of the revised Terms.`,
  },
  {
    title: '11. Governing Law',
    content: `These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from these Terms or your use of the App shall be subject to the exclusive jurisdiction of the competent courts.`,
  },
  {
    title: '12. Contact',
    content: `For questions about these Terms, contact us at legal@jar.app.`,
  },
];

export default function TermsOfService() {
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
          Terms of Service
        </p>
      </div>

      <div style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12, padding: '24px 28px', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Terms of Service</h1>
        <p style={{ fontSize: 13, color: '#7a7a7a', fontFamily: 'JetBrains Mono, monospace' }}>Last updated: May 2026 · JAR App</p>
        <p style={{ fontSize: 14, color: '#aaa', marginTop: 16, lineHeight: 1.7 }}>
          Please read these Terms of Service carefully before using JAR. These terms constitute a legally binding agreement between you and JAR regarding your use of the application.
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
          JAR is a personal productivity tool. It is not a medical, financial, or legal service. Always consult qualified professionals for such matters.
        </p>
      </div>
    </div>
  );
}