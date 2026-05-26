import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  List,
  Shield,
  DollarSign,
  Languages,
  Sun,
  AlertTriangle,
  Smartphone,
  FileText,
  Database,
  BarChart2,
} from 'lucide-react';

// Import refactored components
import { SettingsCard } from '@/components/settings/SettingsCard';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { SettingsLabel } from '@/components/settings/SettingsLabel';
import { ActionBtn } from '@/components/settings/ActionBtn';
import { Toggle } from '@/components/settings/Toggle';
import { InlineSelect } from '@/components/settings/InlineSelect';
import { ColorThemePicker } from '@/components/settings/ColorThemePicker';

import { useSettings } from '@/lib/settingsContext';
import { usePremium } from '@/hooks/usePremium';
import { toast } from 'sonner';

export default function Settings() {
  const { prefs, setPref, saveAll, hasUnsaved } = useSettings();
  const { isPremium, subscription } = usePremium();

  const [isExporting, setIsExporting] = useState(false);

  const handleExportJSON = async () => {
    try {
      setIsExporting(true);
      // TODO: Replace with actual data fetch
      const allItems = [];
      
      if (allItems.length > 10000) {
        toast.error('Too many items. Contact support for bulk export');
        return;
      }

      const dataStr = JSON.stringify(allItems, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `jar-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Export complete');
    } catch (err) {
      toast.error('Export failed. Try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      // TODO: Replace with actual data fetch
      const allItems = [];

      if (allItems.length > 10000) {
        toast.error('Too many items. Contact support for bulk export');
        return;
      }

      const keys = allItems.length > 0 ? Object.keys(allItems[0]) : [];
      const csvContent = [
        keys.join(','),
        ...allItems.map(item =>
          keys.map(key => {
            const val = item[key];
            if (typeof val === 'string' && val.includes(',')) {
              return `"${val}"`;
            }
            return val ?? '';
          }).join(',')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `jar-backup-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Export complete');
    } catch (err) {
      toast.error('Export failed. Try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Customize your JAR experience and manage your account
          </p>
        </div>

        {/* Preferences Section */}
        <section className="space-y-4">
          <SettingsLabel>Preferences</SettingsLabel>

          <SettingsCard>
            {/* Theme Settings */}
            <SettingsRow
              icon={Sun}
              title="Color Theme"
              subtitle="Choose how JAR looks"
            />
            <div className="px-4 py-3 border-t border-sidebar-border">
              <ColorThemePicker
                value={prefs.colorTheme || 'default'}
                onChange={(theme) => setPref('colorTheme', theme)}
              />
            </div>

            {/* Language Settings */}
            <SettingsRow
              icon={Languages}
              title="Language"
              subtitle="Select your preferred language"
              control={
                <InlineSelect
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Español' },
                    { value: 'fr', label: 'Français' },
                    { value: 'de', label: 'Deutsch' },
                  ]}
                  value={prefs.language || 'en'}
                  onChange={(lang) => setPref('language', lang)}
                />
              }
              last={false}
            />

            {/* Currency Settings */}
            <SettingsRow
              icon={DollarSign}
              title="Default Currency"
              subtitle="Set your primary currency"
              control={
                <InlineSelect
                  options={[
                    { value: 'USD', label: 'USD ($)' },
                    { value: 'EUR', label: 'EUR (€)' },
                    { value: 'GBP', label: 'GBP (£)' },
                    { value: 'JPY', label: 'JPY (¥)' },
                  ]}
                  value={prefs.currency || 'USD'}
                  onChange={(curr) => setPref('currency', curr)}
                />
              }
              last={false}
            />

            {/* Notifications */}
            <SettingsRow
              icon={Smartphone}
              title="Notifications"
              subtitle="Receive updates about your expenses"
              control={
                <Toggle
                  checked={prefs.notificationsEnabled !== false}
                  onChange={(val) => setPref('notificationsEnabled', val)}
                />
              }
              last={true}
            />
          </SettingsCard>
        </section>

        {/* Data & Privacy Section */}
        <section className="space-y-4">
          <SettingsLabel>Data &amp; Privacy</SettingsLabel>

          <SettingsCard>
            {/* Templates Management */}
            <SettingsRow
              icon={List}
              title="Manage Templates"
              subtitle="Saved task templates for quick entry"
              control={
                <ActionBtn
                  text="Manage"
                  onClick={() => (window.location.href = '/settings/templates')}
                />
              }
              last={false}
            />

            {/* Privacy Settings */}
            <SettingsRow
              icon={Shield}
              title="Privacy Settings"
              subtitle="Control who can see your data"
              control={
                <ActionBtn
                  text="Configure"
                  onClick={() => (window.location.href = '/settings/privacy')}
                />
              }
              last={false}
            />

            {/* Export Data */}
            <SettingsRow
              icon={FileText}
              title="Export Data"
              subtitle="Download your data as JSON or CSV"
              control={
                <div className="flex gap-2">
                  <ActionBtn
                    text="JSON"
                    onClick={handleExportJSON}
                  />
                  <ActionBtn
                    text="CSV"
                    onClick={handleExportCSV}
                  />
                </div>
              }
              last={false}
            />

            {/* Data Sync */}
            <SettingsRow
              icon={Database}
              title="Cloud Sync"
              subtitle="Auto-sync your data across devices"
              control={
                <Toggle
                  checked={prefs.cloudSyncEnabled !== false}
                  onChange={(val) => setPref('cloudSyncEnabled', val)}
                />
              }
              last={true}
            />
          </SettingsCard>
        </section>

        {/* Account Section */}
        <section className="space-y-4">
          <SettingsLabel>Account</SettingsLabel>

          <SettingsCard>
            {/* Subscription Status */}
            <SettingsRow
              icon={BarChart2}
              title="Subscription"
              subtitle={isPremium ? `Premium (${subscription?.plan})` : 'Free Plan'}
              control={
                <ActionBtn
                  text={isPremium ? 'Manage' : 'Upgrade'}
                  onClick={() => (window.location.href = '/upgrade')}
                />
              }
              last={false}
            />

            {/* Delete Account */}
            <SettingsRow
              icon={AlertTriangle}
              title="Delete Account"
              subtitle="Permanently remove all your data"
              control={
                <ActionBtn
                  text="Delete"
                  danger={true}
                  onClick={() => {
                    if (window.confirm('Are you sure? This cannot be undone.')) {
                      window.location.href = '/settings/delete-account';
                    }
                  }}
                />
              }
              last={true}
            />
          </SettingsCard>
        </section>

        {/* Save Notice */}
        {hasUnsaved && (
          <div className="fixed bottom-6 right-6">
            <button
              onClick={saveAll}
              className="font-medium bg-primary text-primary-foreground px-6 py-2.5 rounded-full shadow-lg hover:opacity-90 transition-opacity"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}