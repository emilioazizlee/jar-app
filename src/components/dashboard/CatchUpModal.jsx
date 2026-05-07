import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { toast } from 'sonner';

// ─── Month keyword map ────────────────────────────────────────────────────────
const MONTH_NAMES = {
  january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2,
  april: 3, apr: 3, may: 4, june: 5, jun: 5,
  july: 6, jul: 6, august: 7, aug: 7, september: 8, sep: 8, sept: 8,
  october: 9, oct: 9, november: 10, nov: 10, december: 11, dec: 11,
};

// ─── Unit detection ───────────────────────────────────────────────────────────
const UNIT_PATTERNS = [
  { regex: /\b(packs?|pack of)\b/i, unit: 'pack' },
  { regex: /\b(l|liters?|litres?)\b/i, unit: 'L' },
  { regex: /\b(ml|milliliters?)\b/i, unit: 'ml' },
  { regex: /\b(kg|kilograms?)\b/i, unit: 'kg' },
  { regex: /\b(g|grams?)\b/i, unit: 'g' },
  { regex: /\b(cups?)\b/i, unit: 'cup' },
  { regex: /\b(glasses?)\b/i, unit: 'glass' },
  { regex: /\b(bottles?)\b/i, unit: 'bottle' },
  { regex: /\b(cans?)\b/i, unit: 'can' },
  { regex: /\b(slices?)\b/i, unit: 'slice' },
  { regex: /\b(pieces?|pcs?)\b/i, unit: 'pcs' },
];

// ─── Category keyword map ─────────────────────────────────────────────────────
const CATEGORY_KW = {
  cigarette: 'cigarettes', cig: 'cigarettes', smok: 'cigarettes', marlboro: 'cigarettes', tobacco: 'cigarettes',
  coffee: 'coffee', cafe: 'coffee', espresso: 'coffee', latte: 'coffee', cappuccino: 'coffee',
  taxi: 'taxi', uber: 'taxi', cab: 'taxi', bolt: 'taxi', lyft: 'taxi',
  food: 'food_out', restaurant: 'food_out', lunch: 'food_out', dinner: 'food_out', breakfast: 'food_out', sushi: 'food_out', pizza: 'food_out',
  groceries: 'groceries', grocery: 'groceries', supermarket: 'groceries', apples: 'groceries', apricot: 'groceries', vegetables: 'groceries', fruit: 'groceries', bread: 'groceries', milk: 'groceries',
  gym: 'sport', fitness: 'sport', sport: 'sport',
  rent: 'housing', housing: 'housing',
  pharmacy: 'pharmacy', medicine: 'pharmacy', drug: 'pharmacy',
  netflix: 'entertainment', spotify: 'entertainment', cinema: 'entertainment', movie: 'entertainment',
  salary: 'income', income: 'income',
  transport: 'transport', bus: 'transport', metro: 'transport',
  alcohol: 'drinks', beer: 'drinks', wine: 'drinks', bar: 'drinks', whiskey: 'drinks',
};

const DATE_KW = {
  today: () => format(new Date(), 'yyyy-MM-dd'),
  yesterday: () => format(subDays(new Date(), 1), 'yyyy-MM-dd'),
};

const PLACEHOLDERS = [
  'Yesterday: 5 cigarettes, coffee €3, taxi €8',
  'April: 10 Pack of Cigarettes, 2L of Wine, 6 kg of apples',
  'March: rent 800, groceries 250, gym 40',
];

// ─── Parse a single line ──────────────────────────────────────────────────────
function parseLine(line, contextDate) {
  const lower = line.toLowerCase().trim();
  if (!lower || lower.length < 2) return null;

  // Date detection
  let date = contextDate;
  for (const [kw, fn] of Object.entries(DATE_KW)) {
    if (lower.includes(kw)) { date = fn(); break; }
  }
  const mdMatch = lower.match(/\b(\d{1,2})[\/\-](\d{1,2})\b/);
  if (mdMatch) {
    const now = new Date();
    date = format(new Date(now.getFullYear(), parseInt(mdMatch[2]) - 1, parseInt(mdMatch[1])), 'yyyy-MM-dd');
  }

  // Unit detection
  let unit = null;
  for (const { regex, unit: u } of UNIT_PATTERNS) {
    if (regex.test(line)) { unit = u; break; }
  }

  // Quantity + unit pattern: "10 Pack of Cigarettes", "2L of Wine", "6 kg of apples"
  // Try: number + optional-unit + "of"? + product
  const qtyUnitMatch = line.match(/^(\d+(?:[.,]\d+)?)\s*(?:Pack\s+of|packs?\s+of|l|liters?|litres?|ml|kg|g|cups?|glasses?|bottles?|cans?|slices?|pieces?|pcs?)?\s*(?:of\s+)?(.+)/i);

  let quantity = 1;
  let title = line.trim();

  if (qtyUnitMatch) {
    const possibleQty = parseFloat(qtyUnitMatch[1].replace(',', '.'));
    if (!isNaN(possibleQty)) {
      quantity = possibleQty;
      title = qtyUnitMatch[2]?.trim() || title;
    }
  }

  // Special: "10 Pack of Cigarettes" → unit=pack, category=cigarettes, qty=10
  const packOfMatch = line.match(/(\d+)\s+packs?\s+of\s+(.+)/i);
  if (packOfMatch) {
    quantity = parseInt(packOfMatch[1]);
    unit = 'pack';
    title = packOfMatch[2].trim();
  }

  // "2L of Wine" / "2 liters of wine"
  const liquidMatch = line.match(/(\d+(?:[.,]\d+)?)\s*(?:l|liters?|litres?)\s+(?:of\s+)?(.+)/i);
  if (liquidMatch) {
    quantity = parseFloat(liquidMatch[1].replace(',', '.'));
    unit = 'L';
    title = liquidMatch[2].trim();
  }

  // "6 kg of apples"
  const weightMatch = line.match(/(\d+(?:[.,]\d+)?)\s*kg\s+(?:of\s+)?(.+)/i);
  if (weightMatch) {
    quantity = parseFloat(weightMatch[1].replace(',', '.'));
    unit = 'kg';
    title = weightMatch[2].trim();
  }

  // Amount detection: €10, $5, 10 EUR, 100 RUB, trailing number
  const amountMatch = line.match(/[€$£₼₽]\s*(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*(?:EUR|USD|AZN|RUB|TRY|GBP)\b/i);
  const amount = amountMatch
    ? parseFloat((amountMatch[1] || amountMatch[2]).replace(',', '.'))
    : null;

  // Category detection
  let category = null;
  const lowerTitle = title.toLowerCase();
  for (const [kw, cat] of Object.entries(CATEGORY_KW)) {
    if (lowerTitle.includes(kw) || lower.includes(kw)) { category = cat; break; }
  }

  // Pack + cigarette = cigarettes category
  if (unit === 'pack' && (lowerTitle.includes('cigaret') || lowerTitle.includes('cig') || lower.includes('cigaret'))) {
    category = 'cigarettes';
  }

  // Clean up title: remove currency/amount strings
  title = title
    .replace(/[€$£₼₽]\s*\d+(?:[.,]\d+)?/g, '')
    .replace(/\d+(?:[.,]\d+)?\s*(?:EUR|USD|AZN|RUB|TRY|GBP)\b/gi, '')
    .replace(/\b(today|yesterday)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim() || 'Entry';

  // Capitalise first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);

  // Determine what's missing
  const needsPrice = !amount && category !== 'cigarettes_health';
  const needsCategory = !category;
  const needsDate = !date;

  const fullyParsed = !needsCategory && !needsDate;

  return {
    id: Math.random().toString(36).slice(2),
    title,
    amount,
    quantity,
    unit,
    category: category || 'other',
    type: 'spend',
    date: date || format(new Date(), 'yyyy-MM-dd'),
    parsed: fullyParsed,
    needsPrice,
    needsCategory,
    needsDate,
  };
}

// ─── Parse full text, respecting month context ────────────────────────────────
function parseText(text) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const lines = [];
  let contextDate = today;

  // Split on commas and newlines
  const rawSegments = text.split(/[,\n]+|\s+and\s+/i).map(s => s.trim()).filter(Boolean);

  for (const seg of rawSegments) {
    const lower = seg.toLowerCase();

    // Check if this segment is a month header: "April:", "January", "March:"
    let isMonthHeader = false;
    for (const [name, idx] of Object.entries(MONTH_NAMES)) {
      const monthRegex = new RegExp(`^${name}\\s*:?\\s*$`, 'i');
      const monthPrefixRegex = new RegExp(`^${name}:?\\s+`, 'i');
      if (monthRegex.test(seg.trim())) {
        // Pure month label — set context, no entry
        const now = new Date();
        contextDate = format(new Date(now.getFullYear(), idx, 1), 'yyyy-MM-dd');
        isMonthHeader = true;
        break;
      }
      if (monthPrefixRegex.test(seg)) {
        // "April: 5 coffees" — set context date and parse the rest
        const now = new Date();
        contextDate = format(new Date(now.getFullYear(), idx, 1), 'yyyy-MM-dd');
        const rest = seg.replace(monthPrefixRegex, '').trim();
        if (rest) {
          const parsed = parseLine(rest, contextDate);
          if (parsed) lines.push(parsed);
        }
        isMonthHeader = true;
        break;
      }
    }

    if (!isMonthHeader) {
      const parsed = parseLine(seg, contextDate);
      if (parsed) lines.push(parsed);
    }
  }

  return lines;
}

// ─── Needs badge ──────────────────────────────────────────────────────────────
function NeedsBadge({ card }) {
  if (card.parsed && !card.needsPrice && !card.needsCategory && !card.needsDate) return null;
  if (card.needsCategory) return <span className="font-mono text-[9px] text-orange-400 border border-orange-400/30 rounded px-1.5 py-0.5 shrink-0">NEEDS CATEGORY</span>;
  if (card.needsDate) return <span className="font-mono text-[9px] text-blue-400 border border-blue-400/30 rounded px-1.5 py-0.5 shrink-0">NEEDS DATE</span>;
  if (card.needsPrice) return <span className="font-mono text-[9px] text-yellow-400 border border-yellow-400/30 rounded px-1.5 py-0.5 shrink-0">NEEDS PRICE</span>;
  return null;
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
        unit: item.unit || undefined,
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
              <p className="text-[10px] font-mono text-muted-foreground">
                Supports: month headers ("April:"), units (kg, L, pack), conjunctions ("and"), prices (€5, $10)
              </p>
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
                      background: card.parsed && !card.needsPrice ? '#141414' : '#1a1400',
                      border: `1px solid ${card.parsed && !card.needsPrice ? '#1f1f1f' : '#4a3a00'}`,
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
                        placeholder="€ price"
                        className="w-20 bg-transparent font-mono text-sm text-white outline-none border-b border-[#2a2a2a] text-right"
                      />
                      <input
                        type="number"
                        value={card.quantity ?? 1}
                        onChange={e => updateCard(card.id, 'quantity', parseFloat(e.target.value) || 1)}
                        placeholder="qty"
                        className="w-10 bg-transparent font-mono text-xs text-muted-foreground outline-none border-b border-[#2a2a2a] text-right"
                      />
                      {card.unit && <span className="font-mono text-[10px] text-muted-foreground">{card.unit}</span>}
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
                      <NeedsBadge card={card} />
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