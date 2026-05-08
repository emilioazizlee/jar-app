import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { resetSidebarOrder } from '@/lib/sidebarOrder';
import { useSettings } from '@/lib/settingsContext';
import { toast } from 'sonner';
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
  { value: 'English', label: 'English', available: true },
  { value: 'Russian', label: 'Русский — Coming soon', available: false },
  { value: 'Azerbaijani', label: 'Azərbaycanca — Coming soon', available: false },
  { value: 'Spanish', label: 'Español — Coming soon', available: false },
  { value: 'French', label: 'Français — Coming soon', available: false },
  { value: 'Turkish', label: 'Türkçe — Coming soon', available: false },
  { value: 'German', label: 'Deutsch — Coming soon', available: false },
];

function LanguageSelect({ value, onChange }) {
  const handleChange = (e) => {
    const selected = LANGUAGES.find(l => l.value === e.target.value);
    if (selected && !selected.available) {
      // show toast via simple alert approach; toast isn't imported here
      // We'll use a custom inline banner approach
      return;
    }
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <select
        value={value}
        onChange={handleChange}
        style={{ borderRadius: 8, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#fff', padding: '5px 10px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}
        onClick={e => e.stopPropagation()}
      >
        {LANGUAGES.map(l => (
          <option key={l.value} value={l.value} disabled={!l.available} style={{ color: l.available ? '#fff' : '#5a5a5a' }}>
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
  }, []);

  const savePref = (key, val) => {
    setPref(key, val);
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
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#7a7a7a' }}>SETTINGS</p>
        {hasUnsaved && (
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#ffee32', border: '1px solid rgba(255,238,50,0.3)', borderRadius: 6, padding: '3px 8px' }}>
            UNSAVED CHANGES
          </span>
        )}
      </div>

      <ProfileHeader user={user} items={allItems} />

      {/* ACCOUNT */}
      <SectionLabel>ACCOUNT</SectionLabel>
      <SectionCard>
        <SettingsRow icon={User} title="Profile" subtitle="Edit name, email, avatar" control={<ChevronRight size={16} color="#555" />} />
        <SettingsRow icon={Shield} title="Account Security" subtitle="Password, two-factor auth" control={<ComingSoon />} />
        <SettingsRow
          icon={Globe} title="Country"
          subtitle={prefs.country || 'Auto-detect'}
          control={<InlineSelect value={prefs.country || 'Auto-detect'} onChange={v => savePref('country', v)} options={COUNTRIES} />}
        />
        <SettingsRow
          icon={DollarSign} title="Currency"
          subtitle="Default display currency"
          control={<InlineSelect value={prefs.currency || 'EUR'} onChange={v => savePref('currency', v)} options={CURRENCIES} />}
        />
        <SettingsRow
          icon={Clock} title="Time zone"
          subtitle={prefs.timezone || 'Auto-detect'}
          control={<InlineSelect value={prefs.timezone || 'Auto-detect'} onChange={v => savePref('timezone', v)} options={TIMEZONES} />}
          last
        />
      </SectionCard>

      {/* PREFERENCES */}
      <SectionLabel>PREFERENCES</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={List} title="Manage step templates"
          subtitle="Saved task templates"
          control={<ActionBtn onClick={() => window.location.href = '/settings/templates'}>Manage</ActionBtn>}
        />
        <SettingsRow
          icon={Languages} title="Language"
          control={<LanguageSelect value={prefs.language || 'English'} onChange={v => savePref('language', v)} />}
        />
        <SettingsRow
          icon={Moon} title="Theme"
          subtitle="Dark only"
          control={<ComingSoon />}
        />
        <SettingsRow
          icon={AlignJustify} title="Density"
          subtitle="Card padding & row height"
          control={<Toggle value={prefs.density || 'Comfortable'} onChange={v => savePref('density', v)} options={['Compact','Comfortable']} />}
        />
        <SettingsRow
          icon={Circle} title="Border radius"
          control={<Toggle value={prefs.radius || 'Rounded'} onChange={v => savePref('radius', v)} options={['Sharp','Rounded','Pill']} />}
        />
        <SettingsRow
          icon={List} title="Sidebar order"
          control={<ActionBtn onClick={handleSidebarReset} done={sidebarResetDone}>{sidebarResetDone ? '✓ Reset done' : 'Reset to default'}</ActionBtn>}
        />
        <SettingsRow
          icon={Moon} title="Bedtime mode trigger"
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
          icon={Smartphone} title="One-handed mode"
          control={<Toggle value={prefs.oneHand || 'Off'} onChange={v => savePref('oneHand', v)} options={['Off','Left','Right']} />}
          last
        />
      </SectionCard>

      {/* DATA */}
      <SectionLabel>DATA</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={Download} title="Export all data as JSON"
          subtitle={exportFilename + '.json'}
          control={<ActionBtn onClick={handleExportJSON} done={exportDone}>{exportDone ? '✓ Exported' : 'Export JSON'}</ActionBtn>}
        />
        <SettingsRow
          icon={FileText} title="Export to CSV"
          subtitle="Flat entry data"
          control={<ActionBtn onClick={handleExportCSV} done={csvExportDone}>{csvExportDone ? '✓ Exported' : 'Export CSV'}</ActionBtn>}
        />
        <SettingsRow
          icon={Upload} title="Import data"
          subtitle="JSON or CSV file"
          control={<ActionBtn onClick={() => setShowCSVImport(true)}>Import</ActionBtn>}
        />
        <SettingsRow
          icon={FileCode} title="Bulk text import"
          subtitle="Paste freeform text, JAR parses it"
          control={<ActionBtn onClick={() => setShowBulkImport(true)}>Open</ActionBtn>}
        />
        <SettingsRow
          icon={Trash2} title="Clear all data"
          subtitle="Permanently delete everything"
          control={<ActionBtn danger onClick={() => setShowClearData(true)}>Clear all</ActionBtn>}
          last
          danger
        />
      </SectionCard>

      {/* PRIVACY */}
      <SectionLabel>PRIVACY</SectionLabel>
      <SectionCard>
        <SettingsRow icon={Lock} title="Biometric lock" control={<ComingSoon />} />
        <SettingsRow icon={Eye} title="Hide sensitive entries from Recent" control={<ComingSoon />} />
        <SettingsRow icon={EyeOff} title="Family-safe mode" control={<ComingSoon />} last />
      </SectionCard>

      {/* DIRECTORY */}
      <SectionLabel>DIRECTORY</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={AlignJustify} title="My Brands Directory"
          subtitle="Manage known brands, domains, and logos"
          control={<ActionBtn onClick={() => window.location.href = '/settings/brands'}>View directory</ActionBtn>}
          last
        />
      </SectionCard>

      {/* CRISIS RESOURCES */}
      <SectionLabel>CRISIS RESOURCES</SectionLabel>
      <CrisisResources country={prefs.country || 'Auto-detect'} />

      {/* ABOUT */}
      <SectionLabel>ABOUT</SectionLabel>
      <SectionCard>
        <SettingsRow icon={Info} title="App" subtitle="JAR — Fill your life." control={<span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#7a7a7a' }}>v1.0.0</span>} />
        <SettingsRow icon={Info} title="Build date" control={<span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#7a7a7a' }}>2026-05-06</span>} />
        <SettingsRow icon={Info} title="Credits" subtitle="Built with Base44 · Nivo · Framer Motion · PapaParse" control={null} />
        <SettingsRow icon={Mail} title="Send feedback" control={<a href="mailto:feedback@jar.app" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#abff4f' }}>feedback@jar.app</a>} />
        <SettingsRow icon={ScrollText} title="Privacy Policy" control={<span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#7a7a7a' }}>#</span>} />
        <SettingsRow icon={ScrollText} title="Terms of Service" control={<span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#7a7a7a' }}>#</span>} last />
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
            SAVE CHANGES
          </button>
        </div>
      )}
    </div>
  );
}