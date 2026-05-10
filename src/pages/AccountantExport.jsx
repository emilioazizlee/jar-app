import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import PremiumGate from '@/components/premium/PremiumGate';
import { ArrowLeft, Download, FileText, Table, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, getYear, startOfYear, endOfYear } from 'date-fns';
import { toast } from 'sonner';
import { PALETTE, SPEND_CATEGORIES } from '@/lib/constants';

const BUSINESS_CATEGORIES = ['studies', 'football_work', 'phone', 'subscriptions', 'fixed_recurring'];

function ExportContent({ user }) {
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());
  const [groupBy, setGroupBy] = useState('category'); // category | month | type
  const [flagBusiness, setFlagBusiness] = useState(true);
  const [exporting, setExporting] = useState(false);

  const { data: allItems = [] } = useQuery({
    queryKey: ['items', user?.email],
    queryFn: () => base44.entities.Item.filter({ created_by: user.email }, '-date', 9999),
    enabled: !!user,
  });

  const yearStart = startOfYear(new Date(taxYear, 0, 1));
  const yearEnd = endOfYear(new Date(taxYear, 0, 1));

  const yearItems = useMemo(() =>
    allItems.filter(i => i.type === 'spend' && i.date && new Date(i.date) >= yearStart && new Date(i.date) <= yearEnd && i.amount),
  [allItems, taxYear]);

  const grouped = useMemo(() => {
    const groups = {};
    yearItems.forEach((item, idx) => {
      let key;
      if (groupBy === 'category') key = item.category || 'other';
      else if (groupBy === 'month') key = item.date ? format(new Date(item.date), 'yyyy-MM') : 'Unknown';
      else key = item.type || 'spend';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [yearItems, groupBy]);

  const totalByGroup = useMemo(() =>
    Object.fromEntries(Object.entries(grouped).map(([k, items]) => [k, items.reduce((s, i) => s + i.amount, 0)])),
  [grouped]);

  const grandTotal = useMemo(() => yearItems.reduce((s, i) => s + i.amount, 0), [yearItems]);
  const businessTotal = useMemo(() => yearItems.filter(i => BUSINESS_CATEGORIES.includes(i.category)).reduce((s, i) => s + i.amount, 0), [yearItems]);

  const exportCSV = () => {
    const rows = [
      ['Date', 'Category', 'Description', 'Amount', 'Currency', 'Receipt#', 'Tax-deductible', 'Business/Personal'],
    ];
    yearItems.forEach((item, i) => {
      const isBusiness = flagBusiness && BUSINESS_CATEGORIES.includes(item.category);
      rows.push([
        item.date || '',
        item.category || 'other',
        item.title || '',
        (item.amount || 0).toFixed(2),
        item.currency || 'EUR',
        `REC-${taxYear}-${String(i + 1).padStart(4, '0')}`,
        isBusiness ? 'Y' : 'N',
        isBusiness ? 'Business' : 'Personal',
      ]);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `jar_accountant_${taxYear}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const exportPDF = async () => {
    setExporting(true);
    const rows = yearItems.map((item, i) => {
      const isBusiness = flagBusiness && BUSINESS_CATEGORIES.includes(item.category);
      return [item.date || '', item.category || 'other', item.title || '', `${(item.amount || 0).toFixed(2)} ${item.currency || 'EUR'}`, isBusiness ? 'Business' : 'Personal'];
    });
    const content = `JAR — Accountant Export\nTax Year: ${taxYear}\nGenerated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}\nUser: ${user.email}\n\n${'='.repeat(60)}\n\nSUMMARY\n${'—'.repeat(40)}\nTotal Spend: ${grandTotal.toFixed(2)} EUR\nBusiness: ${businessTotal.toFixed(2)} EUR\nPersonal: ${(grandTotal - businessTotal).toFixed(2)} EUR\n\nBY ${groupBy.toUpperCase()}\n${'—'.repeat(40)}\n${Object.entries(totalByGroup).map(([k, v]) => `${k}: ${v.toFixed(2)}`).join('\n')}\n\nDETAILED ENTRIES (${yearItems.length} records)\n${'—'.repeat(60)}\nDate | Category | Description | Amount | Type\n${rows.map(r => r.join(' | ')).join('\n')}\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `jar_accountant_${taxYear}.txt`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('Report exported');
    setExporting(false);
  };

  const currentYears = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2];

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Link to="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#7a7a7a' }}>ACCOUNTANT EXPORT</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={exportCSV}
            style={{ padding: '8px 14px', borderRadius: 8, background: '#1a1a1a', color: '#abff4f', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, border: '1px solid rgba(171,255,79,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Table size={12} /> Export CSV
          </button>
          <button onClick={exportPDF} disabled={exporting}
            style={{ padding: '8px 14px', borderRadius: 8, background: '#abff4f', color: '#0a0a0a', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: exporting ? 0.6 : 1 }}>
            <FileText size={12} /> {exporting ? 'Exporting…' : 'Export Report'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12, padding: '16px 18px', marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555', marginBottom: 5 }}>TAX YEAR</p>
          <select value={taxYear} onChange={e => setTaxYear(Number(e.target.value))}
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', padding: '7px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
            {currentYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555', marginBottom: 5 }}>GROUP BY</p>
          <select value={groupBy} onChange={e => setGroupBy(e.target.value)}
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', padding: '7px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
            <option value="category">Category</option>
            <option value="month">Month</option>
            <option value="type">Type</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18 }}>
          <input type="checkbox" checked={flagBusiness} onChange={e => setFlagBusiness(e.target.checked)} id="flagBiz" style={{ accentColor: '#abff4f', width: 14, height: 14 }} />
          <label htmlFor="flagBiz" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#888', cursor: 'pointer' }}>Flag business expenses</label>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Total Spend', value: grandTotal.toFixed(2), color: PALETTE.green },
          { label: 'Business', value: businessTotal.toFixed(2), color: PALETTE.blue },
          { label: 'Personal', value: (grandTotal - businessTotal).toFixed(2), color: PALETTE.orange },
        ].map(c => (
          <div key={c.label} style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12, padding: '14px 16px' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{c.label}</p>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700, color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Grouped breakdown table */}
      <div style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid #1f1f1f', display: 'flex', justifyContent: 'space-between' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: 1 }}>
            {yearItems.length} entries — grouped by {groupBy}
          </p>
        </div>
        <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
          {Object.entries(grouped).sort(([, a], [, b]) => b.reduce((s, i) => s + i.amount, 0) - a.reduce((s, i) => s + i.amount, 0)).map(([group, items]) => (
            <div key={group}>
              <div style={{ padding: '10px 18px', background: '#1a1a1a', borderBottom: '1px solid #1f1f1f', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#ccc', textTransform: 'capitalize' }}>{group}</p>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: PALETTE.green, fontWeight: 700 }}>{(totalByGroup[group] || 0).toFixed(2)}</p>
              </div>
              {items.slice(0, 5).map((item, i) => (
                <div key={item.id} style={{ padding: '9px 18px 9px 32px', borderBottom: '1px solid #111', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555', flexShrink: 0 }}>{item.date}</p>
                  <p style={{ fontSize: 12, color: '#888', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title || 'Untitled'}</p>
                  {flagBusiness && BUSINESS_CATEGORIES.includes(item.category) && (
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: PALETTE.blue, border: `1px solid ${PALETTE.blue}40`, borderRadius: 4, padding: '2px 5px', flexShrink: 0 }}>BIZ</span>
                  )}
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#ccc', flexShrink: 0 }}>{item.amount?.toFixed(2)} {item.currency || 'EUR'}</p>
                </div>
              ))}
              {items.length > 5 && (
                <p style={{ padding: '8px 18px 8px 32px', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#444', borderBottom: '1px solid #111' }}>
                  +{items.length - 5} more rows (visible in CSV export)
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {yearItems.length === 0 && (
        <p style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#444', marginTop: 24 }}>
          No spend entries for {taxYear}
        </p>
      )}
    </div>
  );
}

export default function AccountantExport() {
  const { user } = useCurrentUser();
  return (
    <PremiumGate featureName="Accountant Export">
      <ExportContent user={user} />
    </PremiumGate>
  );
}