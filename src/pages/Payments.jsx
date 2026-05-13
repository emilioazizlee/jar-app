import React, { useState, useMemo } from 'react';

import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Star, MoreVertical, ChevronDown, ChevronUp, Edit2, Copy, Trash2, Check, Search } from 'lucide-react';
import { format, isBefore, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import PaymentForm from '@/components/payments/PaymentForm';
import { CURRENCIES } from '@/lib/constants';

const SORT_OPTIONS = [
  { key: 'due_date', label: 'Due Date' },
  { key: 'amount_asc', label: 'Price ↑' },
  { key: 'amount_desc', label: 'Price ↓' },
  { key: 'category', label: 'Category' },
  { key: 'recent', label: 'Recently Added' },
  { key: 'favorite', label: 'Favorites First' },
];
const FILTER_CATEGORIES = ['Rent', 'Utilities', 'Insurance', 'Tax', 'Loan', 'Tuition', 'Healthcare', 'Phone', 'Internet', 'Other'];
const STATUS_STYLES = {
  Paid:    { color: '#39ff14', bg: 'rgba(57,255,20,0.12)',   label: 'Paid'    },
  Pending: { color: '#ffd60a', bg: 'rgba(255,214,10,0.12)',  label: 'Pending' },
  Overdue: { color: '#ff2d2d', bg: 'rgba(255,45,45,0.12)',   label: 'Overdue' },
};
const PAYMENT_CAT_ICONS = {
  Rent: '🏠', Utilities: '💡', Insurance: '🛡️', Tax: '🏛️', Loan: '💳',
  Tuition: '🎓', Healthcare: '💊', Phone: '📱', Internet: '🌐', Other: '📋',
};

function computeStatus(payment) {
  if (payment.status === 'Paid') return 'Paid';
  const paidDate = payment.note ? (() => { try { return JSON.parse(payment.note).paid_date; } catch { return null; } })() : null;
  if (paidDate) return 'Paid';
  if (!payment.deadline) return 'Pending';
  const due = parseISO(payment.deadline);
  return isBefore(due, new Date()) ? 'Overdue' : 'Pending';
}

function PaymentRow({ payment, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  const statusKey = computeStatus(payment);
  const style = STATUS_STYLES[statusKey];
  const currSym = payment.currency === 'EUR' ? '€' : payment.currency === 'USD' ? '$' : payment.currency || '€';
  const icon = PAYMENT_CAT_ICONS[payment.category] || '📋';
  const isFav = payment.tags?.includes('__favorite__');

  const toggleFav = async (e) => {
    e.stopPropagation();
    const tags = isFav ? (payment.tags || []).filter(t => t !== '__favorite__') : [...(payment.tags || []), '__favorite__'];
    await base44.entities.Item.update(payment.id, { tags });
    queryClient.invalidateQueries({ queryKey: ['items'] });
  };

  const markPaid = async (e) => {
    e.stopPropagation();
    const paidDate = format(new Date(), 'yyyy-MM-dd');
    const meta = { paid_date: paidDate };
    await base44.entities.Item.update(payment.id, { status: 'Paid', note: JSON.stringify(meta) });
    queryClient.invalidateQueries({ queryKey: ['items'] });
  };

  const handleDelete = async () => {
    await base44.entities.Item.delete(payment.id);
    queryClient.invalidateQueries({ queryKey: ['items'] });
  };

  const handleDuplicate = async () => {
    const { id, created_date, updated_date, created_by, ...rest } = payment;
    await base44.entities.Item.create({ ...rest, title: rest.title + ' (copy)' });
    queryClient.invalidateQueries({ queryKey: ['items'] });
  };

  const paidMeta = (() => { try { return JSON.parse(payment.note || '{}'); } catch { return {}; } })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      {/* Row header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-500/10 flex-shrink-0">
          <span className="text-lg">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{payment.title}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="font-mono text-[10px] text-muted-foreground">{payment.category || 'Other'}</span>
            {payment.deadline && (
              <span className="font-mono text-[10px] text-muted-foreground">Due {format(parseISO(payment.deadline), 'MMM d')}</span>
            )}
            {payment.recurring && payment.recurring !== 'none' && (
              <span className="font-mono text-[10px] text-muted-foreground capitalize">🔄 {payment.billing_cycle}</span>
            )}
          </div>
        </div>
        <p className="font-mono text-sm font-bold text-orange-400 flex-shrink-0">{currSym}{(payment.amount || 0).toFixed(2)}</p>
        <span className="px-2 py-0.5 rounded-full font-mono text-[10px] flex-shrink-0" style={{ color: style.color, background: style.bg }}>
          {style.label}
        </span>

        {/* Favorite */}
        <button onClick={toggleFav} className="p-1 flex-shrink-0 transition-colors">
          <Star className="w-3.5 h-3.5" style={{ fill: isFav ? '#ffd60a' : 'none', color: isFav ? '#ffd60a' : '#7a7a7a' }} />
        </button>

        {/* 3-dot menu */}
        <div className="relative flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-30 bg-card border border-border rounded-xl shadow-xl py-1 min-w-[150px]">
              <button onClick={() => { setMenuOpen(false); onEdit(payment); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-sm transition-colors">
                <Edit2 className="w-3.5 h-3.5 text-muted-foreground" /> Edit
              </button>
              <button onClick={() => { setMenuOpen(false); handleDuplicate(); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-sm transition-colors">
                <Copy className="w-3.5 h-3.5 text-muted-foreground" /> Duplicate
              </button>
              <button onClick={() => { setMenuOpen(false); handleDelete(); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-destructive/10 text-sm text-destructive transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>

        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/50 overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {payment.note && !payment.note.startsWith('{') && (
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground mb-1">NOTES</p>
                  <p className="text-sm text-foreground">{payment.note}</p>
                </div>
              )}
              {paidMeta.paid_date && (
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground mb-1">PAID ON</p>
                  <p className="text-sm text-primary font-mono">{format(parseISO(paidMeta.paid_date), 'MMM d, yyyy')}</p>
                </div>
              )}
              <div className="flex gap-2 flex-wrap">
                {statusKey !== 'Paid' && (
                  <button
                    onClick={markPaid}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-xl font-mono text-xs text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark as Paid
                  </button>
                )}
                <button onClick={() => onEdit(payment)} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-xl font-mono text-xs text-foreground hover:bg-muted/80 transition-colors">
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 border border-destructive/30 rounded-xl font-mono text-xs text-destructive hover:bg-destructive/20 transition-colors">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Payments() {

  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [sortKey, setSortKey] = useState(() => localStorage.getItem('jar_payment_sort') || 'due_date');
  const [filterCats, setFilterCats] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  const { data: payments = [] } = useQuery({
    queryKey: ['items', 'payments'],
    queryFn: () => base44.entities.Item.filter({ type: 'payment' }, '-created_date', 200),
    initialData: [],
  });

  const totalPending = payments.filter(p => computeStatus(p) === 'Pending').reduce((s, p) => s + (p.amount || 0), 0);
  const totalPaid = payments.filter(p => computeStatus(p) === 'Paid').reduce((s, p) => s + (p.amount || 0), 0);
  const totalOverdue = payments.filter(p => computeStatus(p) === 'Overdue').reduce((s, p) => s + (p.amount || 0), 0);

  const sorted = useMemo(() => {
    let result = [...payments];
    if (search) result = result.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()));
    if (filterCats.length) result = result.filter(p => filterCats.includes(p.category));
    if (filterStatus !== 'all') result = result.filter(p => computeStatus(p) === filterStatus);
    const isFav = p => p.tags?.includes('__favorite__');
    switch (sortKey) {
      case 'due_date': result.sort((a, b) => (a.deadline || '9999') < (b.deadline || '9999') ? -1 : 1); break;
      case 'amount_asc': result.sort((a, b) => (a.amount || 0) - (b.amount || 0)); break;
      case 'amount_desc': result.sort((a, b) => (b.amount || 0) - (a.amount || 0)); break;
      case 'category': result.sort((a, b) => (a.category || '').localeCompare(b.category || '')); break;
      case 'recent': result.sort((a, b) => b.created_date > a.created_date ? 1 : -1); break;
      case 'favorite': result.sort((a, b) => isFav(b) ? 1 : isFav(a) ? -1 : 0); break;
    }
    return result;
  }, [payments, sortKey, filterCats, filterStatus, search]);

  const toggleCat = (cat) => setFilterCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  const handleSort = (key) => {
    setSortKey(key);
    localStorage.setItem('jar_payment_sort', key);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="mono-header text-lg md:text-xl text-foreground">PAYMENTS</h1>
          <p className="text-sm text-muted-foreground mt-1">{payments.length} total</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-orange-500 text-white rounded-xl font-mono text-sm min-h-[44px]"
        >
          <Plus className="w-4 h-4" /> ADD
        </motion.button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'PENDING', val: totalPending, color: '#ffd60a' },
          { label: 'PAID', val: totalPaid, color: '#39ff14' },
          { label: 'OVERDUE', val: totalOverdue, color: '#ff2d2d' },
        ].map(c => (
          <div key={c.label} className="bg-card border border-border rounded-2xl p-3 md:p-5">
            <p className="mono-header text-[10px] text-muted-foreground mb-1">{c.label}</p>
            <p className="font-mono text-xl md:text-2xl font-bold" style={{ color: c.color }}>€{c.val.toFixed(0)}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-card border border-border rounded-xl p-3 space-y-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 flex-1 bg-muted rounded-lg px-3 py-1.5 min-w-[160px]">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <input className="bg-transparent text-sm flex-1 outline-none font-mono" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={sortKey} onChange={e => handleSort(e.target.value)} className="bg-muted border-none rounded-lg px-3 py-1.5 font-mono text-xs text-foreground outline-none">
            {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
          {['all', 'Pending', 'Paid', 'Overdue'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-full font-mono text-[11px] border transition-all ${filterStatus === s ? 'bg-orange-500/20 border-orange-400/40 text-orange-400' : 'border-border text-muted-foreground hover:text-foreground'}`}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTER_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => toggleCat(cat)}
              className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] border transition-all ${filterCats.includes(cat) ? 'bg-secondary/20 border-secondary/40 text-secondary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
              {cat}
            </button>
          ))}
          {filterCats.length > 0 && <button onClick={() => setFilterCats([])} className="px-2.5 py-0.5 rounded-full font-mono text-[10px] border border-border text-muted-foreground hover:text-foreground">Clear</button>}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        <AnimatePresence>
          {sorted.map(p => (
            <PaymentRow key={p.id} payment={p} onEdit={(pay) => { setEditingPayment(pay); setShowForm(true); }} />
          ))}
        </AnimatePresence>
        {sorted.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">No payments found</p>
        )}
      </div>

      {showForm && (
        <PaymentForm
          open={showForm}
          existing={editingPayment}
          onClose={() => { setShowForm(false); setEditingPayment(null); }}
          onSaved={() => { setShowForm(false); setEditingPayment(null); queryClient.invalidateQueries({ queryKey: ['items'] }); }}
        />
      )}
    </div>
  );
}