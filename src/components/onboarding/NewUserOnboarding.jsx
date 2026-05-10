import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useSettings } from '@/lib/settingsContext';
import i18n from '@/i18n';
import StarterPackStep from './StarterPackStep';
import FeatureTourStep from './FeatureTourStep';

const ONBOARDING_KEY = 'jar_onboarding_done';

const COUNTRY_CURRENCY = {
  Azerbaijan: 'AZN',
  Spain: 'EUR',
  France: 'EUR',
  Germany: 'EUR',
  USA: 'USD',
  UK: 'GBP',
  Russia: 'RUB',
  Turkey: 'TRY',
  Other: 'EUR',
};

const COUNTRIES = Object.keys(COUNTRY_CURRENCY);

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'az', label: 'Azərbaycanca' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'de', label: 'Deutsch' },
];

const TIMEZONES = [
  'Auto-detect', 'UTC', 'Europe/Madrid', 'Asia/Baku', 'Europe/London',
  'America/New_York', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow', 'Europe/Istanbul',
];

export function isOnboardingDone() {
  return !!localStorage.getItem(ONBOARDING_KEY);
}

export function markOnboardingDone() {
  localStorage.setItem(ONBOARDING_KEY, '1');
}

export default function NewUserOnboarding({ user, onDone }) {
  const { setPref, saveAll } = useSettings();
  const [step, setStep] = useState(0); // 0=welcome 1=profile 2=starter 3=tour
  const [profile, setProfile] = useState({
    country: 'Other',
    currency: 'EUR',
    timezone: 'Auto-detect',
    language: 'en',
  });
  const [saving, setSaving] = useState(false);

  const updateProfile = (key, val) => {
    setProfile(p => {
      const next = { ...p, [key]: val };
      if (key === 'country') next.currency = COUNTRY_CURRENCY[val] || 'EUR';
      return next;
    });
  };

  const handleProfileNext = () => {
    setPref('country', profile.country);
    setPref('currency', profile.currency);
    setPref('timezone', profile.timezone);
    setPref('language', profile.language);
    saveAll();
    i18n.changeLanguage(profile.language);
    localStorage.setItem('jar_language', profile.language);
    setStep(2);
  };

  const handleStarterDone = async (choice, importedCategories) => {
    setSaving(true);
    try {
      await base44.entities.OnboardingAnalytics.create({
        user_id: user?.email || '',
        starter_pack: choice,
        categories_imported: importedCategories || [],
        steps_completed: 3,
        completed_at: new Date().toISOString(),
        country: profile.country,
        language: profile.language,
        currency: profile.currency,
      });
    } catch {}
    setSaving(false);
    setStep(3);
  };

  const handleFinish = () => {
    markOnboardingDone();
    onDone();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <WelcomeStep key="welcome" onNext={() => setStep(1)} userName={user?.full_name} />
        )}
        {step === 1 && (
          <ProfileStep
            key="profile"
            profile={profile}
            onUpdate={updateProfile}
            onNext={handleProfileNext}
            onBack={() => setStep(0)}
            countries={COUNTRIES}
            languages={LANGUAGES}
            timezones={TIMEZONES}
          />
        )}
        {step === 2 && (
          <StarterPackStep
            key="starter"
            user={user}
            onDone={handleStarterDone}
            onBack={() => setStep(1)}
            saving={saving}
          />
        )}
        {step === 3 && (
          <FeatureTourStep key="tour" onFinish={handleFinish} />
        )}
      </AnimatePresence>

      {/* Step dots */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`w-2 h-2 rounded-full transition-all ${step === i ? 'bg-primary w-6' : 'bg-muted'}`} />
        ))}
      </div>
    </div>
  );
}

function WelcomeStep({ onNext, userName }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
      className="max-w-lg w-full text-center space-y-8"
    >
      <div className="space-y-4">
        <div className="text-7xl">🫙</div>
        <h1 className="font-mono text-3xl font-bold text-primary tracking-wider">
          Welcome{userName ? `, ${userName.split(' ')[0]}` : ''} to JAR
        </h1>
        <p className="font-mono text-lg text-foreground">Fill Your Life.</p>
        <div className="text-left bg-card border border-border rounded-2xl p-6 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            JAR is your personal life tracker — expenses, tasks, grocery, diet, fitness, and more — all in one place.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every entry fills your jar. The fuller your jar, the more intentional your life.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            It takes 2 minutes to set up. Let's go.
          </p>
        </div>
      </div>
      <button
        onClick={onNext}
        className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-mono font-bold text-lg hover:opacity-90 transition-all"
        style={{ boxShadow: '0 0 30px rgba(171,255,79,0.3)' }}
      >
        Let's set up your JAR →
      </button>
    </motion.div>
  );
}

function ProfileStep({ profile, onUpdate, onNext, onBack, countries, languages, timezones }) {
  const sel = { borderRadius: 10, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#fff', padding: '10px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, width: '100%' };
  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
      className="max-w-md w-full space-y-6"
    >
      <div>
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-1">Step 2 of 4</p>
        <h2 className="font-mono text-2xl font-bold text-foreground">Your Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">These help JAR tailor the experience for you.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider block mb-2">Country</label>
          <select style={sel} value={profile.country} onChange={e => onUpdate('country', e.target.value)}>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider block mb-2">Currency</label>
          <div className="bg-card border border-border rounded-xl px-4 py-3 font-mono text-foreground">
            {profile.currency} <span className="text-muted-foreground text-xs">(auto-set from country)</span>
          </div>
        </div>
        <div>
          <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider block mb-2">Timezone</label>
          <select style={sel} value={profile.timezone} onChange={e => onUpdate('timezone', e.target.value)}>
            {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>
        <div>
          <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider block mb-2">Language</label>
          <select style={sel} value={profile.language} onChange={e => onUpdate('language', e.target.value)}>
            {languages.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-mono text-sm hover:border-foreground transition-all">
          ← Back
        </button>
        <button onClick={onNext} className="flex-2 flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-mono font-bold hover:opacity-90 transition-all">
          Continue →
        </button>
      </div>
    </motion.div>
  );
}