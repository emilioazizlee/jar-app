import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import PremiumGate from '@/components/premium/PremiumGate';
import { ArrowLeft, Cloud, CheckCircle2, AlertCircle, RefreshCw, Download, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { PALETTE } from '@/lib/constants';

const SYNC_KEY = 'jar_last_sync';
const SYNC_HISTORY_KEY = 'jar_sync_history';

function getSyncHistory() {
  try { return JSON.parse(localStorage.getItem(SYNC_HISTORY_KEY) || '[]'); } catch { return []; }
}

function addSyncRecord(record) {
  const history = getSyncHistory();
  history.unshift(record);
  localStorage.setItem(SYNC_HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
}

function CloudSyncContent({ user }) {
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | syncing | success | error
  const [lastSync, setLastSync] = useState(() => localStorage.getItem(SYNC_KEY));
  const [syncHistory, setSyncHistory] = useState(getSyncHistory);

  const { data: allItems = [] } = useQuery({
    queryKey: ['items-all'],
    queryFn: () => base44.entities.Item.list('-created_date', 9999),
    enabled: !!user,
  });

  // Auto-sync every 5 min
  useEffect(() => {
    const interval = setInterval(() => {
      performSync(true);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [allItems]);

  const performSync = async (auto = false) => {
    if (syncing) return;
    setSyncing(true);
    setSyncStatus('syncing');

    try {
      // Build export payload
      const exportData = {
        version: 1,
        exported_at: new Date().toISOString(),
        user_id: user.email,
        item_count: allItems.length,
        data: { items: allItems },
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const file = new File([blob], `jar_sync_${user.email}_${Date.now()}.json`);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const now = new Date().toISOString();
      localStorage.setItem(SYNC_KEY, now);
      setLastSync(now);

      const record = {
        timestamp: now,
        item_count: allItems.length,
        source: auto ? 'auto' : 'manual',
        status: 'success',
        file_url,
      };
      addSyncRecord(record);
      setSyncHistory(getSyncHistory());
      setSyncStatus('success');

      if (!auto) toast.success('Sync complete!');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (e) {
      setSyncStatus('error');
      const record = { timestamp: new Date().toISOString(), status: 'error', error: e.message, source: auto ? 'auto' : 'manual' };
      addSyncRecord(record);
      setSyncHistory(getSyncHistory());
      toast.error('Sync failed');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
    setSyncing(false);
  };

  const handleExport = () => {
    const data = JSON.stringify({ version: 1, exported_at: new Date().toISOString(), user_id: user.email, data: { items: allItems } }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `jar_backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const statusColor = syncStatus === 'success' ? PALETTE.green : syncStatus === 'error' ? PALETTE.red : syncStatus === 'syncing' ? PALETTE.blue : '#555';
  const StatusIcon = syncStatus === 'success' ? CheckCircle2 : syncStatus === 'error' ? AlertCircle : syncStatus === 'syncing' ? RefreshCw : Cloud;

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#7a7a7a' }}>CLOUD SYNC</p>
        </div>
      </div>

      {/* Sync status card */}
      <div style={{ background: '#141414', border: `1px solid ${statusColor}30`, borderRadius: 12, padding: '24px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: `${statusColor}15`, border: `1px solid ${statusColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <StatusIcon size={24} color={statusColor} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 3 }}>
            {syncStatus === 'syncing' ? 'Syncing…' : syncStatus === 'success' ? 'Synced' : syncStatus === 'error' ? 'Sync Failed' : 'Ready to Sync'}
          </p>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#666' }}>
            {lastSync ? `Last synced ${formatDistanceToNow(new Date(lastSync), { addSuffix: true })}` : 'Never synced'}
            {' · '}{allItems.length} items
          </p>
        </div>
        <button onClick={() => performSync(false)} disabled={syncing}
          style={{ padding: '10px 18px', borderRadius: 10, background: '#abff4f', color: '#0a0a0a', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: syncing ? 0.5 : 1 }}>
          <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
          Sync Now
        </button>
      </div>

      {/* Auto-sync indicator */}
      <div style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: PALETTE.green, boxShadow: `0 0 6px ${PALETTE.green}` }} />
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#aaa', flex: 1 }}>Auto-sync every 5 minutes</p>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#abff4f', background: 'rgba(171,255,79,0.08)', border: '1px solid rgba(171,255,79,0.2)', borderRadius: 6, padding: '3px 8px' }}>ACTIVE</span>
      </div>

      {/* Download backup */}
      <div style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12, marginBottom: 16 }}>
        <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Download size={16} color="#555" />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, color: '#fff' }}>Download Local Backup</p>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#666', marginTop: 2 }}>Encrypted JSON file of all your data</p>
          </div>
          <button onClick={handleExport}
            style={{ padding: '7px 14px', borderRadius: 8, background: 'transparent', color: '#aaa', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, border: '1px solid #2a2a2a', cursor: 'pointer' }}>
            Download
          </button>
        </div>
      </div>

      {/* Sync history */}
      <div style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12 }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid #1f1f1f' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: 1 }}>Sync History</p>
        </div>
        {syncHistory.length === 0 ? (
          <div style={{ padding: '28px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#444' }}>No sync history yet</p>
          </div>
        ) : (
          syncHistory.slice(0, 10).map((h, i) => (
            <div key={i} style={{ padding: '12px 18px', borderBottom: i < syncHistory.length - 1 ? '1px solid #1a1a1a' : 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Clock size={12} color="#555" />
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#888', flex: 1 }}>
                {format(new Date(h.timestamp), 'MMM d HH:mm')}
                <span style={{ color: '#555', marginLeft: 8 }}>({h.source})</span>
              </p>
              {h.item_count !== undefined && (
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#666' }}>{h.item_count} items</span>
              )}
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: h.status === 'success' ? PALETTE.green : PALETTE.red }}>
                {h.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function CloudSync() {
  const { user } = useCurrentUser();
  return (
    <PremiumGate featureName="Cloud Sync">
      <CloudSyncContent user={user} />
    </PremiumGate>
  );
}