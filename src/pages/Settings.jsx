import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { resetSidebarOrder } from '@/lib/sidebarOrder';
import { useSettings } from '@/lib/settingsContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import {
  User, Shield, Globe, DollarSign, Clock, Languages, Sun, AlignJustify,
  Circle, List, Moon, Database, Download, Upload, FileText, Trash2,
  Lock, Eye, EyeOff, Heart, Phone, Info, Mail, FileCode, ScrollText,
  ChevronRight, CheckCircle2, AlertTriangle, Smartphone
} from 'lucide-react';
import ProfileHeader from '@/components/settings/ProfileHeader';
import CrisisResources from '@/components/settings/CrisisResources';
import BulkTextImportModal from '@/components/settings/BulkTextImportModal';
import CSVImportModal from '@/components/settings/CSVImportModal';
import ClearDataModal from '@/components/settings/ClearDataModal';
import { exportAllDataJSON, exportAllDataCSV } from '@/lib/exportData';

const COUNTRIES = ['Auto-detect','Spain','Azerbaijan','UK','US','France','Germany','Italy','Russia','Turkey','Other'];
const CURRENCIES = ['EUR','USD','AZN','RUB','TRY','GBP','Other'];
const TIMEZONES = ['Auto-detect','Europe/Madrid','Asia/Baku','Europe/London','America/New_York','Europe/Paris','Europe/Berlin','Europe/Rome','Europe/Moscow','Europe/Istanbul'];

function SectionLabel({ children }) {
  return (
    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#7a7a7a', marginBottom: 8, marginTop: 8 }}>
      {children}
    </p>
  );
}

function SectionCard({ children }) {
  return (
    <div style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
      {children}
    </div>
  );
}

function SettingsRow({ icon: Icon, title, subtitle, control, last, onClick, danger }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
        borderBottom: last ? 'none' : '1px solid #1f1f1f',
        cursor: onClick ? 'pointer' : 'default',
      }}
      className={onClick ? 'hover:bg-white/[0.02] transition-colors' : ''}
    >
      {Icon && (
        <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={16} color={danger ? '#c1121f' : '#7a7a7a'} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 15, color: danger ? '#ef4444' : '#ffffff', lineHeight: 1.3 }}>{title}</p>
        {subtitle && <p style={{ fontSize: 13, color: '#7a7a7a', marginTop: 2 }}>{subtitle}</p>}
      </div>
      <div style={{ flexShrink: 0 }}>
        {control}
      </div>
    </div>
  );
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'az', label: 'Azərbaycanca' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'de', label: 'Deutsch' },
];

function LanguageSelect({ value, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ borderRadius: 8, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#fff', padding: '5px 10px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}
        onClick={e => e.stopPropagation()}
      >
        {LANGUAGES.map(l => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function InlineSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ borderRadius: 8, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#fff', padding: '5px 10px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}
      onClick={e => e.stopPropagation()}
    >
      {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
    </select>
  );
}

function ComingSoon() {
  return <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#7a7a7a', border: '1px solid #2a2a2a', borderRadius: 6, padding: '3px 8px' }}>COMING SOON</span>;
}

function ActionBtn({ children, onClick, danger, done, small }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick && onClick(e); }}
      style={{
        borderRadius: 8,
        padding: small ? '4px 10px' : '6px 14px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11,
        border: done ? '1px solid rgba(171,255,79,0.4)' : danger ? '1px solid rgba(193,18,31,0.4)' : '1px solid #2a2a2a',
        color: done ? '#abff4f' : danger ? '#ef4444' : '#aaa',
        background: done ? 'rgba(171,255,79,0.08)' : danger ? 'rgba(193,18,31,0.08)' : 'transparent',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}

function Toggle({ value, onChange, options }) {
  return (
    <div style={{ display: 'flex', background: '#1a1a1a', borderRadius: 8, border: '1px solid #2a2a2a', overflow: 'hidden' }}>
      {options.map(opt => (
        <button
          key={opt}
          onClick={e => { e.stopPropagation(); onChange(opt); }}
          style={{
            padding: '5px 12px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            background: value === opt ? '#abff4f' : 'transparent',
            color: value === opt ? '#0a0a0a' : '#7a7a7a',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function Settings() {
  const { t } = useTranslation();
  const { prefs, setPref, saveAll, hasUnsaved } = useSettings();
  const [user, setUser] = useState(null);
  const [sidebarResetDone, setSidebarResetDone] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [csvExportDone, setCsvExportDone] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [showClearData, setShowClearData] = useState(false);

  const { data: allItems = [] } = useQuery({
    queryKey: ['items'],
    queryFn: () => base44.entities.Item.list('-created_date', 9999),
    initialData: [],
  });

  useEffect(() => {
    base44.auth.me().then(u => { if (u) setUser(u); }).catch(() => {});
    // Sync stored language into prefs if not already set
    const storedLang = localStorage.getItem('jar_language') || localStorage.getItem('i18nextLng');
    if (storedLang && !prefs.language) {
      setPref('language', storedLang);
    }
  }, []);

  const savePref = (key, val) => {
    setPref(key, val);
    if (key === 'language') {
      i18n.changeLanguage(val);
      localStorage.setItem('jar_language', val);
    }
  };

  const handleSaveAll = () => {
    saveAll();
    toast.success('Settings saved');
  };

  const handleSidebarReset = () => {
    resetSidebarOrder();
    setSidebarResetDone(true);
    setTimeout(() => setSidebarResetDone(false), 2500);
  };

  const handleExportJSON = async () => {
    await exportAllDataJSON(allItems);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 2500);
  };

  const handleExportCSV = async () => {
    await exportAllDataCSV(allItems);
    setCsvExportDone(true);
    setTimeout(() => setCsvExportDone(false), 2500);
  };

  const now = new Date();
  const exportFilename = `jar_export_${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}`;

  return (
    <div className="max-w-2xl mx-auto pb-32">
      <div className="flex items-center justify-between mb-5">
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#7a7a7a' }}>{t('set.settings')}</p>
        {hasUnsaved && (
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#ffee32', border: '1px solid rgba(255,238,50,0.3)', borderRadius: 6, padding: '3px 8px' }}>
            {t('set.unsavedChanges')}
          </span>
        )}

      </div>

      <ProfileHeader user={user} items={allItems} />

      {/* ACCOUNT */}
      <SectionLabel>{t('set.account')}</SectionLabel>
      <SectionCard>
        <SettingsRow icon={User} title={t('set.profile')} subtitle="Edit name, email, avatar" control={<ChevronRight size={16} color="#555" />} />
        <SettingsRow icon={Shield} title={t('set.accountSecurity')} subtitle="Password, two-factor auth" control={<ComingSoon />} />
        <SettingsRow
          icon={Globe} title={t('set.country')}
          subtitle={prefs.country || t('set.autoDetect')}
          control={<InlineSelect value={prefs.country || 'Auto-detect'} onChange={v => savePref('country', v)} options={COUNTRIES} />}
        />
        <SettingsRow
          icon={DollarSign} title={t('set.currency') || 'Currency'}
          subtitle={t('set.defaultCurrency')}
          control={<InlineSelect value={prefs.currency || 'EUR'} onChange={v => savePref('currency', v)} options={CURRENCIES} />}
        />
        <SettingsRow
          icon={Clock} title={t('set.timeZone')}
          subtitle={prefs.timezone || t('set.autoDetect')}
          control={<InlineSelect value={prefs.timezone || 'Auto-detect'} onChange={v => savePref('timezone', v)} options={TIMEZONES} />}
          last
        />
      </SectionCard>

      {/* PREFERENCES */}
      <SectionLabel>{t('set.preferences')}</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={List} title={t('set.manageStepTemplates')}
          subtitle={t('set.savedTaskTemplates')}
          control={<ActionBtn onClick={() => window.location.href = '/settings/templates'}>Manage</ActionBtn>}
        />
        <SettingsRow
          icon={Languages} title={t('set.language')}
          control={<LanguageSelect value={prefs.language || i18n.language || 'en'} onChange={v => savePref('language', v)} />}
        />
        <SettingsRow
          icon={Moon} title={t('set.theme')}
          control={<Toggle value={prefs.theme || 'Dark'} onChange={v => savePref('theme', v)} options={['Dark','Light']} />}
        />
        <SettingsRow
          icon={AlignJustify} title={t('set.density')}
          subtitle="Card padding & row height"
          control={<Toggle value={prefs.density || 'Comfortable'} onChange={v => savePref('density', v)} options={['Compact','Comfortable']} />}
        />
        <SettingsRow
          icon={Circle} title={t('set.borderRadius')}
          control={<Toggle value={prefs.radius || 'Rounded'} onChange={v => savePref('radius', v)} options={['Sharp','Rounded','Pill']} />}
        />
        <SettingsRow
          icon={List} title={t('set.sidebarReset') || 'Sidebar order'}
          control={<ActionBtn onClick={handleSidebarReset} done={sidebarResetDone}>{sidebarResetDone ? '✓ Reset done' : 'Reset to default'}</ActionBtn>}
        />
        <SettingsRow
          icon={Moon} title={t('set.bedtimeMode') || 'Bedtime mode trigger'}
          subtitle="Auto-activates at this time"
          control={
            <input
              type="time"
              value={prefs.bedtime || '01:00'}
              onChange={e => savePref('bedtime', e.target.value)}
              onClick={e => e.stopPropagation()}
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', padding: '5px 10px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}
            />
          }
        />
        <SettingsRow
          icon={Smartphone} title={t('set.oneHandedMode')}
          control={<Toggle value={prefs.oneHand || 'Off'} onChange={v => savePref('oneHand', v)} options={['Off','Left','Right']} />}
          last
        />
      </SectionCard>

      {/* DATA */}
      <SectionLabel>{t('set.data')}</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={Download} title={t('set.exportJson')}
          subtitle={exportFilename + '.json'}
          control={<ActionBtn onClick={handleExportJSON} done={exportDone}>{exportDone ? '✓ Exported' : 'Export JSON'}</ActionBtn>}
        />
        <SettingsRow
          icon={FileText} title={t('set.exportCsv')}
          subtitle="Flat entry data"
          control={<ActionBtn onClick={handleExportCSV} done={csvExportDone}>{csvExportDone ? '✓ Exported' : 'Export CSV'}</ActionBtn>}
        />
        <SettingsRow
          icon={Upload} title={t('set.importData')}
          subtitle="JSON or CSV file"
          control={<ActionBtn onClick={() => setShowCSVImport(true)}>Import</ActionBtn>}
        />
        <SettingsRow
          icon={FileCode} title={t('set.bulkTextImport')}
          subtitle="Paste freeform text, JAR parses it"
          control={<ActionBtn onClick={() => setShowBulkImport(true)}>Open</ActionBtn>}
        />
        <SettingsRow
          icon={Trash2} title={t('set.clearAllData')}
          subtitle="Permanently delete everything"
          control={<ActionBtn danger onClick={() => setShowClearData(true)}>Clear all</ActionBtn>}
          last
          danger
        />
      </SectionCard>

      {/* PRIVACY */}
      <SectionLabel>{t('set.privacy')}</SectionLabel>
      <SectionCard>
        <SettingsRow icon={Lock} title={t('set.biometricLock')} control={<ComingSoon />} />
        <SettingsRow icon={Eye} title={t('set.hideEntries')} control={<ComingSoon />} />
        <SettingsRow icon={EyeOff} title={t('set.familySafe')} control={<ComingSoon />} last />
      </SectionCard>

      {/* DIRECTORY */}
      <SectionLabel>DIRECTORY</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={AlignJustify} title={t('set.myBrands')}
          subtitle="Manage known brands, domains, and logos"
          control={<ActionBtn onClick={() => window.location.href = '/settings/brands'}>View directory</ActionBtn>}
          last
        />
      </SectionCard>

      {/* CRISIS RESOURCES */}
      <SectionLabel>{t('set.crisisResources')}</SectionLabel>
      <CrisisResources country={prefs.country || 'Auto-detect'} />

      {/* ABOUT */}
      <SectionLabel>{t('set.about')}</SectionLabel>
      <SectionCard>
        <SettingsRow icon={Info} title="App" subtitle="JAR — Fill your life." control={<span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#7a7a7a' }}>v1.0.0</span>} />
        <SettingsRow icon={Info} title={t('set.buildDate')} control={<span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#7a7a7a' }}>2026-05-06</span>} />
        <SettingsRow icon={Info} title={t('set.credits')} subtitle="Built with Base44 · Nivo · Framer Motion · PapaParse" control={null} />
        <SettingsRow icon={Mail} title={t('set.sendFeedback')} control={<a href="mailto:feedback@jar.app" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#abff4f' }}>feedback@jar.app</a>} />
        <SettingsRow icon={ScrollText} title={t('set.privacyPolicy')} onClick={() => window.location.href = '/privacy'} control={<ChevronRight size={16} color="#555" />} />
        <SettingsRow icon={ScrollText} title={t('set.terms')} onClick={() => window.location.href = '/terms'} control={<ChevronRight size={16} color="#555" />} last />
      </SectionCard>

      {/* Modals */}
      {showBulkImport && <BulkTextImportModal onClose={() => setShowBulkImport(false)} />}
      {showCSVImport && <CSVImportModal onClose={() => setShowCSVImport(false)} />}
      {showClearData && <ClearDataModal onClose={() => setShowClearData(false)} />}

      {/* Sticky Save button */}
      {hasUnsaved && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 100, display: 'flex', gap: 8 }}>
          <button
            onClick={handleSaveAll}
            style={{
              background: '#abff4f', color: '#0a0a0a', fontFamily: 'JetBrains Mono, monospace',
              fontSize: 13, fontWeight: 700, padding: '12px 32px', borderRadius: 12,
              border: 'none', cursor: 'pointer', boxShadow: '0 0 24px rgba(171,255,79,0.4)',
            }}
          >
            {t('set.saveChanges')}
          </button>
        </div>
      )}
    </div>
  );
}