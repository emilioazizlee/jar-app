import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import PremiumGate from '@/components/premium/PremiumGate';
import { ArrowLeft, RefreshCw, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { PALETTE } from '@/lib/constants';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const SUPPORTED_CURRENCIES = ['EUR', 'USD', 'AZN', 'RUB', 'GBP', 'TRY'];

const FLAG = { EUR: '🇪🇺', USD: '🇺🇸', AZN: '🇦🇿', RUB: '🇷🇺', GBP: '🇬🇧', TRY: '🇹🇷' };

function CurrencyContent({ user }) {
  const qc = useQueryClient();
  const [baseCurrency, setBaseCurrency] = useState('EUR');
  const [fetching, setFetching] = useState(false);

  const { data: rates = [] } = useQuery({
    queryKey: ['currency-rates'],
    queryFn: () => base44.entities.CurrencyRate.filter({ base_currency: baseCurrency }, '-updated_at', 10),
    enabled: !!user,
  });

  const { data: items = [] } = useQuery({
    queryKey: ['items', user?.email],
    queryFn: () => base44.entities.Item.filter({ created_by: user.email, type: 'spend' }, '-date', 500),
    enabled: !!user,
  });

  const fetchRates = async () => {
    setFetching(true);
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
      const data = await res.json();
      if (data.result === 'success') {
        const targets = SUPPORTED_CURRENCIES.filter(c => c !== baseCurrency);
        for (const target of targets) {
          const rate = data.rates[target];
          if (!rate) continue;
          // Check if rate already exists
          const existing = await base44.entities.CurrencyRate.filter({ base_currency: baseCurrency, target_currency: target });
          if (existing.length > 0) {
            await base44.entities.CurrencyRate.update(existing[0].id, { rate, updated_at: new Date().toISOString(), source: 'open.er-api.com' });
          } else {
            await base44.entities.CurrencyRate.create({ base_currency: baseCurrency, target_currency: target, rate, updated_at: new Date().toISOString(), source: 'open.er-api.com' });
          }
        }
        qc.invalidateQueries({ queryKey: ['currency-rates'] });
        toast.success('Exchange rates updated');
      }
    } catch (e) {
      toast.error('Failed to fetch rates. Check network.');
    }
    setFetching(false);
  };

  // Calculate total spend in each currency
  const totalSpendBase = items.reduce((s, i) => {
    if (i.currency === baseCurrency) return s + (i.amount || 0);
    const rateObj = rates.find(r => r.target_currency === i.currency);
    if (rateObj) return s + (i.amount || 0) / rateObj.rate;
    return s;
  }, 0);

  const lastUpdated = rates.length > 0 ? rates[0].updated_at : null;

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#7a7a7a' }}>MULTI-CURRENCY</p>
          {lastUpdated && <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#444', marginTop: 2 }}>Updated {format(new Date(lastUpdated), 'MMM d HH:mm')}</p>}
        </div>
        <select value={baseCurrency} onChange={e => setBaseCurrency(e.target.value)}
          style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', padding: '6px 10px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
          {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={fetchRates} disabled={fetching}
          style={{ padding: '8px 14px', borderRadius: 8, background: '#abff4f', color: '#0a0a0a', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: fetching ? 0.6 : 1 }}>
          <RefreshCw size={12} className={fetching ? 'animate-spin' : ''} /> {fetching ? 'Fetching…' : 'Refresh'}
        </button>
      </div>

      {/* Exchange rates grid */}
      <div style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid #1f1f1f' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: 1 }}>1 {baseCurrency} equals</p>
        </div>
        {rates.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#444' }}>Click "Refresh" to fetch live rates</p>
          </div>
        ) : (
          SUPPORTED_CURRENCIES.filter(c => c !== baseCurrency).map(target => {
            const rateObj = rates.find(r => r.target_currency === target);
            return (
              <div key={target} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid #1a1a1a' }}>
                <span style={{ fontSize: 20 }}>{FLAG[target] || '💱'}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#fff' }}>{target}</p>
                </div>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, color: PALETTE.green, fontWeight: 700 }}>
                  {rateObj ? rateObj.rate.toFixed(4) : '—'}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Multi-currency spend total */}
      <div style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Total Spend (converted to {baseCurrency})</p>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 700, color: PALETTE.green }}>
          {baseCurrency} {totalSpendBase.toFixed(2)}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {SUPPORTED_CURRENCIES.filter(c => c !== baseCurrency).map(c => {
            const rateObj = rates.find(r => r.target_currency === c);
            if (!rateObj) return null;
            const converted = (totalSpendBase * rateObj.rate).toFixed(2);
            return (
              <span key={c} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#888', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 6, padding: '4px 10px' }}>
                ≈ {c} {converted}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function CurrencyRates() {
  const { user } = useCurrentUser();
  return (
    <PremiumGate featureName="Multi-Currency Conversion">
      <CurrencyContent user={user} />
    </PremiumGate>
  );
}