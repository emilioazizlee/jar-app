import React, { useState, useEffect } from 'react';
import { resetSidebarOrder } from '@/lib/sidebarOrder';
import { base44 } from '@/api/base44Client';

const CARD = {
  background: '#141414',
  border: '1px solid #1f1f1f',
  borderRadius: 12,
  padding: 22,
  marginBottom: 16,
};

function SettingsCard({ title, children }) {
  return (
    <div style={CARD}>
      <p className="font-mono text-[10px] uppercase tracking-[2px] text-[#7a7a7a] mb-4">{title}</p>
      <div className="h-px bg-[#1f1f1f] mb-4" />
      {children}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm text-[#aaa] font-mono">{label}</span>
      <div>{children}</div>
    </div>
  );
}

const COUNTRIES = ['Auto-detect', 'Spain', 'Azerbaijan', 'Russia', 'United States', 'United Kingdom', 'Germany', 'France', 'Italy', 'Turkey', 'UAE', 'Other'];
const LANGUAGES = ['English (default)', 'Spanish', 'Russian', 'Azerbaijani'];
const CURRENCIES = ['EUR (€)', 'USD ($)', 'AZN (₼)', 'RUB (₽)'];

export default function Settings() {
  const [profile, setProfile] = useState({ name: '', email: '', country: 'Auto-detect' });
  const [sidebarResetDone, setSidebarResetDone] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [clearDone, setClearDone] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u) setProfile(p => ({ ...p, name: u.full_name || '', email: u.email || '' }));
    }).catch(() => {});
  }, []);

  const handleSidebarReset = () => {
    resetSidebarOrder();
    setSidebarResetDone(true);
    setTimeout(() => setSidebarResetDone(false), 2500);
  };

  const handleExport = async () => {
    try {
      const [items, spends, health, leisure] = await Promise.all([
        base44.entities.Item.list('-created_date', 9999),
        base44.entities.LeisureEntry.list('-created_date', 9999),
        base44.entities.WaterLog?.list('-created_date', 9999).catch(() => []),
        base44.entities.FinanceSnapshot?.list('-created_date', 9999).catch(() => []),
      ]);
      const blob = new Blob([JSON.stringify({ items, spends, health, leisure, exported_at: new Date().toISOString() }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `jar-export-${new Date().toISOString().slice(0,10)}.json`;
      a.click(); URL.revokeObjectURL(url);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 2500);
    } catch {}
  };

  const handleClearAll = async () => {
    if (!clearConfirm) { setClearConfirm(true); return; }
    try {
      const items = await base44.entities.Item.list('-created_date', 9999);
      for (const i of items) await base44.entities.Item.delete(i.id);
      setClearDone(true);
      setClearConfirm(false);
      setTimeout(() => setClearDone(false), 3000);
    } catch {}
  };

  const SettingBtn = ({ onClick, children, danger, done }) => (
    <button
      onClick={onClick}
      style={{ borderRadius: 8 }}
      className={`px-4 py-2 font-mono text-xs border transition-all ${
        done ? 'border-green-500/40 text-green-400 bg-green-500/10'
          : danger ? 'border-red-500/40 text-red-400 bg-red-500/10 hover:bg-red-500/20'
          : 'border-[#2a2a2a] text-[#aaa] hover:text-white hover:border-[#444]'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-0 pb-12">
      <h1 className="font-mono text-[10px] uppercase tracking-[2px] text-[#7a7a7a] mb-6">SETTINGS</h1>

      {/* Profile */}
      <SettingsCard title="Profile">
        <div className="space-y-3">
          <Row label="Name">
            <span className="font-mono text-sm text-white">{profile.name || '—'}</span>
          </Row>
          <div className="h-px bg-[#1f1f1f]" />
          <Row label="Email">
            <span className="font-mono text-sm text-white">{profile.email || '—'}</span>
          </Row>
          <div className="h-px bg-[#1f1f1f]" />
          <Row label="Country">
            <select
              value={profile.country}
              onChange={e => setProfile(p => ({ ...p, country: e.target.value }))}
              style={{ borderRadius: 8, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#fff', padding: '4px 10px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}
            >
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Row>
        </div>
      </SettingsCard>

      {/* Preferences */}
      <SettingsCard title="Preferences">
        <div className="space-y-3">
          <Row label="Theme">
            <span className="font-mono text-xs text-[#7a7a7a] border border-[#2a2a2a] px-3 py-1.5 rounded-lg">Dark (only)</span>
          </Row>
          <div className="h-px bg-[#1f1f1f]" />
          <Row label="Language">
            <select
              disabled
              style={{ borderRadius: 8, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#555', padding: '4px 10px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}
            >
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
          </Row>
          <div className="h-px bg-[#1f1f1f]" />
          <Row label="Sidebar order">
            <SettingBtn onClick={handleSidebarReset} done={sidebarResetDone}>
              {sidebarResetDone ? '✓ Reset done' : 'Reset sidebar to default order'}
            </SettingBtn>
          </Row>
        </div>
      </SettingsCard>

      {/* Display */}
      <SettingsCard title="Display">
        <div className="space-y-3">
          <Row label="Border radius">
            <span className="font-mono text-xs text-[#7a7a7a] border border-[#2a2a2a] px-3 py-1.5 rounded-lg">12px (default)</span>
          </Row>
          <div className="h-px bg-[#1f1f1f]" />
          <Row label="Density">
            <span className="font-mono text-xs text-[#7a7a7a] border border-[#2a2a2a] px-3 py-1.5 rounded-lg">Comfortable</span>
          </Row>
          <div className="h-px bg-[#1f1f1f]" />
          <Row label="Currency symbol">
            <select
              style={{ borderRadius: 8, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#fff', padding: '4px 10px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}
            >
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Row>
        </div>
      </SettingsCard>

      {/* Data */}
      <SettingsCard title="Data">
        <div className="space-y-3">
          <Row label="Export all data">
            <SettingBtn onClick={handleExport} done={exportDone}>
              {exportDone ? '✓ Exported' : 'Export as JSON'}
            </SettingBtn>
          </Row>
          <div className="h-px bg-[#1f1f1f]" />
          <Row label="Import data">
            <SettingBtn onClick={() => {}}>Import JSON</SettingBtn>
          </Row>
          <div className="h-px bg-[#1f1f1f]" />
          <Row label="Clear all data">
            <div className="flex items-center gap-2">
              {clearConfirm && (
                <span className="font-mono text-[10px] text-red-400">This deletes all items. Sure?</span>
              )}
              <SettingBtn onClick={handleClearAll} danger done={clearDone}>
                {clearDone ? '✓ Cleared' : clearConfirm ? 'Confirm — delete all' : 'Clear all data'}
              </SettingBtn>
              {clearConfirm && (
                <button onClick={() => setClearConfirm(false)} className="font-mono text-[10px] text-[#7a7a7a] hover:text-white">cancel</button>
              )}
            </div>
          </Row>
        </div>
      </SettingsCard>

      {/* Privacy */}
      <SettingsCard title="Privacy">
        <p className="font-mono text-xs text-[#555]">Biometric lock — coming soon</p>
      </SettingsCard>

      {/* Help & Crisis */}
      <SettingsCard title="Help & Crisis Resources">
        <p className="font-mono text-xs text-[#555]">Emergency contacts and mental health resources — coming soon</p>
      </SettingsCard>

      {/* About */}
      <SettingsCard title="About">
        <div className="space-y-2">
          <Row label="App"><span className="font-mono text-sm text-white font-bold">JAR</span></Row>
          <div className="h-px bg-[#1f1f1f]" />
          <Row label="Tagline"><span className="font-mono text-xs text-[#7a7a7a]">Fill your life.</span></Row>
          <div className="h-px bg-[#1f1f1f]" />
          <Row label="Version"><span className="font-mono text-xs text-[#7a7a7a]">v1.0.0</span></Row>
          <div className="h-px bg-[#1f1f1f]" />
          <Row label="Build date"><span className="font-mono text-xs text-[#7a7a7a]">2026-05-06</span></Row>
          <div className="h-px bg-[#1f1f1f]" />
          <Row label="Credits"><span className="font-mono text-xs text-[#7a7a7a]">Built with Base44 + Nivo + Framer Motion</span></Row>
        </div>
      </SettingsCard>
    </div>
  );
}