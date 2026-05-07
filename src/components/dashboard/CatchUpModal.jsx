import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { format, subDays, parseISO } from 'date-fns';
import { toast } from 'sonner';

// ─── Regex-based parser ───────────────────────────────────────────────────────
const CATEGORY_KW = {
  cigarette: 'cigarettes', cig: 'cigarettes', smok: 'cigarettes',
  coffee: 'coffee', cafe: 'coffee', espresso: 'coffee',
  taxi: 'taxi', uber: 'taxi', cab: 'taxi', bolt: 'taxi',
  food: 'food_out', restaurant: 'food_out', lunch: 'food_out', dinner: 'food_out', breakfast: 'food_out',
  groceries: 'groceries', grocery: 'groceries', supermarket: 'groceries',
  gym: 'sport', fitness: 'sport', sport: 'sport',
  rent: 'housing', housing: 'housing',
  pharmacy: 'pharmacy', medicine: 'pharmacy', drug: 'pharmacy',
  netflix: 'entertainment', spotify: 'entertainment', cinema: 'entertainment', movie: 'entertainment',
  salary: 'income', income: 'income',
  transport: 'transport', bus: 'transport', metro: 'transport',
  alcohol: 'drinks', beer: 'drinks', wine: 'drinks', bar: 'drinks',
};

const DATE_KW = {
  today: () => format(new Date(), 'yyyy-MM-dd'),
  yesterday: () => format(subDays(new Date(), 1), 'yyyy-MM-dd'),
  'last monday': () => {
    const d = new Date(); const day = d.getDay(); const diff = (day === 0 ? 6 : day - 1);
    d.setDate(d.getDate() - diff - 7); return format(d, 'yyyy-MM-dd');
  },
};

const PLACEHOLDERS = [
  'Yesterday: 5 cigarettes, coffee €3, taxi €8',
  'March: rent 800, groceries 250, gym 40',
  'Today 6am: woke up tired, slept 5h, mood 4',
];

function parseLine(line, defaultDate) {
  const lower = line.toLowerCase().trim();
  if (!lower) return null;

  // Date detection
  let date = defaultDate;
  for (const [kw, fn] of Object.entries(DATE_KW)) {
    if (lower.includes(kw)) { date = fn(); break; }
  }
  // Pattern: "March 5" or "5/3" or "05-03"
  const mdMatch = lower.match(/\b(\d{1,2})[\/\-](\d{1,2})\b/);
  if (mdMatch) {
    const now = new Date();
    date = format(new Date(now.getFullYear(), parseInt(mdMatch[2]) - 1, parseInt(mdMatch[1])), 'yyyy-MM-dd');
  }

  // Amount detection: €10, $5, 10 EUR, 100 RUB, 8.50
  const amountMatch = line.match(/[€$£₼₽]\s*(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*(?:EUR|USD|AZN|RUB|TRY|GBP)\b|(\d+(?:[.,]\d+)?)(?=\s|$)/i);
  const amount = amountMatch
    ? parseFloat((amountMatch[1] || amountMatch[2] || amountMatch[3]).replace(',', '.'))
    : null;

  // Quantity: "5 cigarettes", "3 coffees"
  const qtyMatch = lower.match(/^(\d+)\s+/);
  const quantity = qtyMatch ? parseInt(qtyMatch[1]) : 1;

  // Category
  let category = 'other';
  for (const [kw, cat] of Object.entries(CATEGORY_KW)) {
    if (lower.includes(kw)) { category = cat; break; }
  }

  // Title: strip numbers/currency/date keywords
  let title = line
    .replace(/[€$£₼₽]\s*\d+(?:[.,]\d+)?/g, '')
    .replace(/\d+(?:[.,]\d+)?\s*(?:EUR|USD|AZN|RUB|TRY|GBP)\b/gi, '')
    .replace(/\b(today|yesterday|last\s+\w+)\b/gi, '')
    .replace(/\d+(?:[.,]\d+)?/g, '')
    .replace(/[,;:\/\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim() || 'Entry';

  const parsed = category !== 'other' && amount !== null;

  return { id: Math.random().toString(36).slice(2), title, amount, quantity, category, type: 'spend', date, parsed };
}

function parseText(text) {
  const today = format(new Date(), 'yyyy-MM-dd');
  // Split on commas, newlines, AND the conjunction "and" (with word boundaries)
  const segments = text
    .split(/[,\n]+|\s+and\s+/i)
    .map(s => s.trim())
    .filter(Boolean);
  return segments.map(s => parseLine(s, today)).filter(Boolean);
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function CatchUpModal({ onClose }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [importing, setImporting] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length), 3000);
    return () => clearInterval(t);
  }, []);

  const handleParse = () => setParsed(parseText(text));
  const removeCard = (id) => setParsed(prev => prev.filter(p => p.id !== id));
  const updateCard = (id, key, val) => setParsed(prev => prev.map(p => p.id === id ? { ...p, [key]: val } : p));

  const handleImport = async () => {
    setImporting(true);
    for (const item of parsed) {
      await base44.entities.Item.create({
        type: item.type,
        title: item.title,
        category: item.category,
        amount: item.amount || undefined,
        quantity: item.quantity || 1,
        currency: 'EUR',
        date: item.date,
      });
    }
    queryClient.invalidateQueries({ queryKey: ['items'] });
    setImporting(false);
    toast(`${parsed.length} entries imported`, { duration: 5000 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="relative w-full sm:max-w-2xl bg-card border border-border rounded-t-2xl sm:rounded-2xl flex flex-col"
        style={{ maxHeight: '90dvh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-secondary" />
            <span className="font-mono text-sm text-secondary uppercase tracking-widest">CATCH-UP MODE</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {!parsed ? (
            <>
              <p className="text-sm text-muted-foreground">Paste or type what you did. Be loose — JAR will figure it out.</p>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={PLACEHOLDERS[placeholderIdx]}
                className="w-full min-h-[140px] bg-muted border-none rounded-xl px-4 py-3 font-mono text-sm text-foreground placeholder:text-[#444] outline-none resize-none focus:ring-1 focus:ring-primary/30 transition-all"
                autoFocus
              />
            </>
          ) : (
            <>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[1px]">
                {parsed.length} entries detected — review &amp; edit
              </p>
              <div className="space-y-2">
                {parsed.map(card => (
                  <div
                    key={card.id}
                    style={{
                      background: card.parsed ? '#141414' : '#1a1400',
                      border: `1px solid ${card.parsed ? '#1f1f1f' : '#4a3a00'}`,
                      borderRadius: 10, padding: 12,
                    }}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        value={card.title}
                        onChange={e => updateCard(card.id, 'title', e.target.value)}
                        className="flex-1 bg-transparent font-medium text-sm text-white outline-none border-b border-[#2a2a2a] min-w-[100px]"
                      />
                      <input
                        type="number"
                        value={card.amount ?? ''}
                        onChange={e => updateCard(card.id, 'amount', parseFloat(e.target.value) || null)}
                        placeholder="€"
                        className="w-16 bg-transparent font-mono text-sm text-white outline-none border-b border-[#2a2a2a] text-right"
                      />
                      <input
                        value={card.category}
                        onChange={e => updateCard(card.id, 'category', e.target.value)}
                        className="w-24 bg-transparent font-mono text-[11px] text-muted-foreground outline-none border-b border-[#2a2a2a]"
                      />
                      <input
                        type="date"
                        value={card.date}
                        onChange={e => updateCard(card.id, 'date', e.target.value)}
                        className="bg-transparent font-mono text-[11px] text-muted-foreground outline-none border-b border-[#2a2a2a] w-28"
                      />
                      {!card.parsed && (
                        <span className="font-mono text-[9px] text-yellow-400 border border-yellow-400/30 rounded px-1.5 py-0.5 shrink-0">
                          NEEDS INPUT
                        </span>
                      )}
                      <button onClick={() => removeCard(card.id)} className="text-muted-foreground hover:text-red-400 transition-colors shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sticky footer */}
        <div className="px-5 pt-3 pb-5 border-t border-border shrink-0 bg-card">
          {!parsed ? (
            <Button
              onClick={handleParse}
              disabled={!text.trim()}
              className="w-full bg-secondary text-secondary-foreground font-mono hover:bg-secondary/90"
            >
              PARSE
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleImport}
                disabled={importing || parsed.length === 0}
                className="flex-1 bg-primary text-primary-foreground font-mono hover:bg-primary/90"
              >
                {importing ? 'IMPORTING...' : `IMPORT ALL (${parsed.length})`}
              </Button>
              <Button variant="outline" onClick={() => setParsed(null)} className="font-mono">
                Re-parse
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}