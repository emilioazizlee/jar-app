import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { resetSidebarOrder } from '@/lib/sidebarOrder';
import { useSettings } from '@/lib/settingsContext';
import { toast } from 'sonner';
import {
  User, Shield, Globe, DollarSign, Clock, Languages, Sun, AlignJustify,
  Circle, List, Moon, Database, Download, FileText, Trash2,
  Lock, Eye, EyeOff, Heart, Phone, Info, Mail, ScrollText,
  ChevronRight, CheckCircle2, AlertTriangle, Smartphone, Zap, BarChart2,
  Calendar, Cloud, RefreshCw, Tag, Sliders, LayoutGrid, LogOut
} from 'lucide-react';

import { usePremium } from '@/hooks/usePremium';
import PremiumBadge from '@/components/premium/PremiumBadge';
import PaywallModal from '@/components/premium/PaywallModal';
import ProfileHeader from '@/components/settings/ProfileHeader';
import CrisisResources from '@/components/settings/CrisisResources';
import ClearDataModal from '@/components/settings/ClearDataModal';
import { exportAllDataJSON, exportAllDataCSV } from '@/lib/exportData';

const COUNTRIES = ['Auto-detect','Spain','Azerbaijan','UK','US','France','Germany','Italy','Russia','Turkey','Other'];
const CURRENCIES = ['EUR','USD','AZN','RUB','TRY','GBP','Other'];
const TIMEZONES = ['Auto-detect','Europe/Madrid','Asia/Baku','Europe/London','America/New_York','Europe/Paris','Europe/Berlin','Europe/Rome','Europe/Moscow','Europe/Istanbul'];

function SectionLabel({ children }) {
  return (
    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: 'hsl(var(--muted-foreground))', marginBottom: 8, marginTop: 8 }}>
      {children}
    </p>
  );
}

function SectionCard({ children }) {
  return (
<div className="bg-card border border-border" style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
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
        borderBottom: last ? 'none' : '1px solid hsl(var(--border))',
        cursor: onClick ? 'pointer' : 'default',
      }}
      className={onClick ? 'hover:bg-white/[0.02] transition-colors' : ''}
    >
      {Icon && (
        <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={16} color={danger ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))'} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: danger ? 'hsl(var(--destructive))' : 'hsl(var(--foreground))', lineHeight: 1.3 }}>{title}</p>
        {subtitle && <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>{subtitle}</p>}
      </div>
      <div style={{ flexShrink: 0 }}>
        {control}
      </div>
    </div>
  );
}

function InlineSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ borderRadius: 8, background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))', padding: '5px 10px', fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}
      onClick={e => e.stopPropagation()}
    >
      {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
    </select>
  );
}

function ComingSoon() {
  return <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'hsl(var(--muted-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 6, padding: '3px 8px' }}>COMING SOON</span>;
}

function ActionBtn({ children, onClick, danger, done, small }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick && onClick(e); }}
      style={{
        borderRadius: 8,
        padding: small ? '4px 10px' : '6px 14px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 12,
        border: done ? '1px solid hsl(var(--primary) / 0.4)' : danger ? '1px solid hsl(var(--destructive) / 0.4)' : '1px solid hsl(var(--border))',
        color: done ? 'hsl(var(--primary))' : danger ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))',
        background: done ? 'hsl(var(--primary) / 0.08)' : danger ? 'hsl(var(--destructive) / 0.08)' : 'transparent',
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
    <div style={{ display: 'flex', background: 'hsl(var(--muted))', borderRadius: 8, border: '1px solid hsl(var(--border))', overflow: 'hidden' }}>
      {options.map(opt => (
        <button
          key={opt}
          onClick={e => { e.stopPropagation(); onChange(opt); }}
          style={{
            padding: '5px 12px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            background: value === opt ? 'hsl(var(--primary))' : 'transparent',
            color: value === opt ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
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

const THEME_PALETTES = [
  { key: 'Default', label: 'Default', colors: ['#0a0a0a', '#141414', '#1f1f1f', '#2a2a2a', '#abff4f', '#ffee32'], textColor: '#999' },
  { key: 'Ocean',   label: 'Ocean',   colors: ['#006466', '#065a60', '#0b525b', '#144552', '#1b3a4b', '#212f45', '#272640', '#312244', '#3e1f47', '#4d194d'], textColor: '#7ecfcf' },
  { key: 'Sand',    label: 'Sand',    colors: ['#e8d4b8', '#d4b896', '#f9c74f', '#90be6d', '#fcefb4', '#8d6e4a'], textColor: '#5a4a3a' },
];

export default function Settings() {
  const { prefs, setPref, saveAll, hasUnsaved } = useSettings();
  const { isPremium, subscription } = usePremium();
  const [showPaywall, setShowPaywall] = useState(false);
  const [user, setUser] = useState(null);
  const [sidebarResetDone, setSidebarResetDone] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [csvExportDone, setCsvExportDone] = useState(false);
  const [showClearData, setShowClearData] = useState(false);

  const { data: allItems = [] } = useQuery({
    queryKey: ['items'],
    queryFn: () => base44.entities.Item.list('-created_date', 9999),
    initialData: [],
  });

  useEffect(() => {
    base44.auth.me().then(u => { if (u) setUser(u); }).catch(() => {});
  }, []);

  const savePref = (key, val) => setPref(key, val);

  const handleSaveAll = () => {
    saveAll();
    toast.success('Settings saved');
  };

  const handleSidebarReset = () => {
    resetSidebarOrder();
    setSidebarResetDone(true);
    const t = setTimeout(() => setSidebarResetDone(false), 2500);
    return () => clearTimeout(t);
  };

  const handleExportJSON = async () => {
    if (allItems.length > 10000) { toast.error('Too many items. Contact support for bulk export.'); return; }
    try {
      await exportAllDataJSON(allItems);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 2500);
      toast.success('Export complete');
    } catch (err) {
      toast.error('Export failed. Try again.');
    }
  };

  const handleExportCSV = async () => {
    if (allItems.length > 10000) { toast.error('Too many items. Contact support for bulk export.'); return; }
    try {
      await exportAllDataCSV(allItems);
      setCsvExportDone(true);
      setTimeout(() => setCsvExportDone(false), 2500);
      toast.success('Export complete');
    } catch (err) {
      toast.error('Export failed. Try again.');
    }
  };

  const handleLogout = async () => {
    try { await base44.auth.logout(); } catch {}
    finally {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    }
  };

  const now = new Date();
  const exportFilename = `jar_export_${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}`;

  return (
    <div className="max-w-2xl mx-auto pb-32">
      <div className="flex items-center justify-between mb-5">
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'hsl(var(--muted-foreground))' }}>SETTINGS</p>
        {hasUnsaved && (
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'hsl(var(--secondary))', border: '1px solid hsl(var(--secondary) / 0.3)', borderRadius: 6, padding: '3px 8px' }}>
            Unsaved changes
          </span>
        )}
      </div>

      <ProfileHeader user={user} items={allItems} onUserUpdated={() => base44.auth.me().then(u => { if (u) setUser(u); })} />

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
          subtitle="Default currency"
          control={<InlineSelect value={prefs.currency || 'EUR'} onChange={v => savePref('currency', v)} options={CURRENCIES} />}
        />
        <SettingsRow
          icon={Clock} title="Time Zone"
          subtitle={prefs.timezone || 'Auto-detect'}
          control={<InlineSelect value={prefs.timezone || 'Auto-detect'} onChange={v => savePref('timezone', v)} options={TIMEZONES} />}
          last
        />
      </SectionCard>

      {/* PREFERENCES */}
      <SectionLabel>PREFERENCES</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={List} title="Manage Step Templates"
          subtitle="Saved task templates"
          control={<ActionBtn onClick={() => window.location.href = '/settings/templates'}>Manage</ActionBtn>}
        />


        {/* Color Theme — palette rectangles */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid hsl(var(--border))' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: 'hsl(var(--foreground))', marginBottom: 10 }}>Color Theme</p>
          <div style={{ display: 'flex', gap: 10 }}>
            {THEME_PALETTES.map(t => {
              const active = (prefs.colorTheme || 'Default') === t.key;
              return (
                <button
                  key={t.key}
                  onClick={e => { e.stopPropagation(); savePref('colorTheme', t.key); }}
                  style={{
                    flex: 1, borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                            border: active ? '2px solid hsl(var(--foreground))' : '2px solid transparent',
                    outline: active ? '1px solid hsl(var(--foreground) / 0.3)' : 'none',
                    transition: 'all 0.15s',
                    padding: 0, background: 'none',
                  }}
                >
                  <div style={{ display: 'flex', height: 36 }}>
                    {t.colors.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
                  </div>
                  <div style={{ background: t.colors[0], padding: '5px 8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: t.textColor, textAlign: 'center', margin: 0 }}>{t.label}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Light mode toggle — only shown for Default theme */}
          {(prefs.colorTheme || 'Default') === 'Default' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>☀️ Light mode</span>
              <button
                onClick={e => { e.stopPropagation(); savePref('defaultLight', !prefs.defaultLight); }}
                style={{
                  width: 40, height: 22, borderRadius: 11, padding: 0, position: 'relative',
                  background: prefs.defaultLight ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                  border: '1px solid hsl(var(--border))', cursor: 'pointer', transition: 'background 0.2s',
                }}
              >
                <div style={{
                  width: 16, height: 16, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 2,
                  left: prefs.defaultLight ? 20 : 2,
                  transition: 'left 0.2s ease',
                }} />
              </button>
            </div>
          )}
        </div>

        <SettingsRow
          icon={AlignJustify} title="Density"
          subtitle="Card padding & row height"
          control={<Toggle value={prefs.density || 'Comfortable'} onChange={v => savePref('density', v)} options={['Compact','Comfortable']} />}
        />
        <SettingsRow
          icon={Circle} title="Border Radius"
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
              style={{ background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))', padding: '5px 10px', fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}
            />
          }
        />
        <SettingsRow
          icon={Smartphone} title="One-Handed Mode"
          control={<Toggle value={prefs.oneHand || 'Off'} onChange={v => savePref('oneHand', v)} options={['Off','Left','Right']} />}
          last
        />
      </SectionCard>

      {/* DATA */}
      <SectionLabel>DATA</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={Download} title="Export JSON"
          subtitle={exportFilename + '.json'}
          control={<ActionBtn onClick={handleExportJSON} done={exportDone}>{exportDone ? '✓ Exported' : 'Export JSON'}</ActionBtn>}
        />
        <SettingsRow
          icon={FileText} title="Export CSV"
          subtitle="Flat entry data"
          control={<ActionBtn onClick={handleExportCSV} done={csvExportDone}>{csvExportDone ? '✓ Exported' : 'Export CSV'}</ActionBtn>}
        />
        <SettingsRow
          icon={Trash2} title="Clear All Data"
          subtitle="Permanently delete everything"
          control={<ActionBtn danger onClick={() => setShowClearData(true)}>Clear all</ActionBtn>}
          last
          danger
        />
      </SectionCard>

      {/* PRIVACY */}
      <SectionLabel>PRIVACY</SectionLabel>
      <SectionCard>
        <SettingsRow icon={Lock} title="Biometric Lock" control={<ComingSoon />} />
        <SettingsRow icon={Eye} title="Hide Entries" control={<ComingSoon />} />
        <SettingsRow icon={EyeOff} title="Family Safe" control={<ComingSoon />} last />
      </SectionCard>

      {/* PREMIUM */}
      <SectionLabel>PREMIUM</SectionLabel>
      <SectionCard>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', gap: 14, background: isPremium ? 'linear-gradient(135deg, hsl(var(--secondary) / 0.05) 0%, hsl(var(--destructive) / 0.05) 100%)' : 'transparent' }}>
          <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={16} color={isPremium ? 'hsl(var(--secondary))' : 'hsl(var(--muted-foreground))'} fill={isPremium ? 'hsl(var(--secondary))' : 'none'} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: 'hsl(var(--foreground))' }}>Current Plan</p>
              {isPremium ? <PremiumBadge /> : <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'hsl(var(--muted-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 6, padding: '2px 8px' }}>FREE</span>}
            </div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>
              {isPremium
                ? subscription?.status === 'trial'
                  ? `Trial ends ${subscription?.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'soon'}`
                  : 'Full Premium access'
                : 'Upgrade for advanced features'}
            </p>
          </div>
          {!isPremium && (
            <button onClick={() => setShowPaywall(true)}
              style={{ padding: '7px 14px', borderRadius: 8, background: 'linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--chart-3)) 100%)', color: 'hsl(var(--secondary-foreground))', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Upgrade ⚡
            </button>
          )}
        </div>
        <SettingsRow icon={Calendar} title="Visual Planner" subtitle="Drag & drop 24h schedule builder" control={isPremium ? <ActionBtn onClick={() => window.location.href = '/premium/planner'}>Open</ActionBtn> : <span onClick={() => setShowPaywall(true)} style={{ cursor: 'pointer' }}><PremiumBadge size="xs" /></span>} />
        <SettingsRow icon={BarChart2} title="Advanced Analytics" subtitle="Deep insights, macro charts, budget health" control={isPremium ? <ActionBtn onClick={() => window.location.href = '/premium/analytics'}>Open</ActionBtn> : <span onClick={() => setShowPaywall(true)} style={{ cursor: 'pointer' }}><PremiumBadge size="xs" /></span>} />
        <SettingsRow icon={RefreshCw} title="Multi-Currency" subtitle="Live FX rates and converted totals" control={isPremium ? <ActionBtn onClick={() => window.location.href = '/premium/currency'}>Open</ActionBtn> : <span onClick={() => setShowPaywall(true)} style={{ cursor: 'pointer' }}><PremiumBadge size="xs" /></span>} />
        <SettingsRow icon={Cloud} title="Cloud Sync" subtitle="Multi-device auto-sync every 5 minutes" control={isPremium ? <ActionBtn onClick={() => window.location.href = '/premium/sync'}>Open</ActionBtn> : <span onClick={() => setShowPaywall(true)} style={{ cursor: 'pointer' }}><PremiumBadge size="xs" /></span>} />
        <SettingsRow icon={FileText} title="Accountant Export" subtitle="Tax-ready CSV/PDF with business flags" control={isPremium ? <ActionBtn onClick={() => window.location.href = '/premium/export'}>Open</ActionBtn> : <span onClick={() => setShowPaywall(true)} style={{ cursor: 'pointer' }}><PremiumBadge size="xs" /></span>} last />
      </SectionCard>

      {/* OPEN ARCHITECTURE */}
      <SectionLabel>OPEN ARCHITECTURE</SectionLabel>
      <SectionCard>
        <SettingsRow icon={Tag} title="Category Manager" subtitle="Customize categories for grocery, leisure, tasks, recipes" control={<ActionBtn onClick={() => window.location.href = '/settings/categories'}>Manage</ActionBtn>} />
        <SettingsRow icon={Sliders} title="Custom Fields" subtitle="Add your own fields to any entity" control={<ActionBtn onClick={() => window.location.href = '/settings/custom-fields'}>Manage</ActionBtn>} />
        <SettingsRow icon={LayoutGrid} title="Component Marketplace" subtitle="Add widgets and charts to your dashboard" control={<ActionBtn onClick={() => window.location.href = '/marketplace'}>Browse</ActionBtn>} />
        <SettingsRow icon={Tag} title="Starter Library" subtitle="Browse pre-built categories and icons" control={<ActionBtn onClick={() => window.location.href = '/starter'}>Browse</ActionBtn>} last />
      </SectionCard>

      {/* BUDGETS */}
      <SectionLabel>BUDGETS</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={DollarSign} title="Budget Limits"
          subtitle="Set spend limits and get warnings"
          control={<ActionBtn onClick={() => window.location.href = '/settings/budgets'}>Manage</ActionBtn>}
          last
        />
      </SectionCard>

      {/* DIRECTORY */}
      <SectionLabel>DIRECTORY</SectionLabel>
      <SectionCard>
        <SettingsRow
          icon={AlignJustify} title="My Brands"
          subtitle="Manage known brands, domains, and logos"
          control={<ActionBtn onClick={() => window.location.href = '/settings/brands'}>View directory</ActionBtn>}
          last
        />
      </SectionCard>

      {/* ACCOUNT ACTIONS */}
      <SectionLabel>ACCOUNT</SectionLabel>
      <SectionCard>
        <div style={{ padding: '14px 18px' }}>
          <button
            onClick={handleLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', borderRadius: 8, background: 'hsl(var(--destructive) / 0.1)', border: '1px solid hsl(var(--destructive) / 0.3)', color: 'hsl(var(--destructive))', fontFamily: 'JetBrains Mono, monospace', fontSize: 14, cursor: 'pointer' }}
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </SectionCard>

      {/* CRISIS RESOURCES */}
      <SectionLabel>CRISIS RESOURCES</SectionLabel>
      <CrisisResources country={prefs.country || 'Auto-detect'} />

      {/* ABOUT */}
      <SectionLabel>ABOUT</SectionLabel>
      <SectionCard>
        <SettingsRow icon={Info} title="App" subtitle="JAR — Fill your life." control={<span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>v1.0.0</span>} />
        <SettingsRow icon={Info} title="Build Date" control={<span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>2026-05-06</span>} />
        <SettingsRow icon={Info} title="Credits" subtitle="Built with Base44 · Nivo · Framer Motion · PapaParse" control={null} />
        <SettingsRow icon={Mail} title="Send Feedback" control={<a href="mailto:feedback@jar.app" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'hsl(var(--primary))' }}>feedback@jar.app</a>} />
        <SettingsRow icon={ScrollText} title="Privacy Policy" onClick={() => window.location.href = '/privacy'} control={<ChevronRight size={16} color="hsl(var(--muted-foreground))" />} />
        <SettingsRow icon={ScrollText} title="Terms of Service" onClick={() => window.location.href = '/terms'} control={<ChevronRight size={16} color="hsl(var(--muted-foreground))" />} last />
      </SectionCard>

      {/* Modals */}
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
      {showClearData && <ClearDataModal onClose={() => setShowClearData(false)} />}

      {/* Sticky Save button */}
      {hasUnsaved && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 100, display: 'flex', gap: 8 }}>
          <button
            onClick={handleSaveAll}
            style={{
              background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', fontFamily: 'JetBrains Mono, monospace',
              fontSize: 14, fontWeight: 700, padding: '12px 32px', borderRadius: 12,
              border: 'none', cursor: 'pointer', boxShadow: '0 0 24px hsl(var(--primary) / 0.4)',
            }}
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}