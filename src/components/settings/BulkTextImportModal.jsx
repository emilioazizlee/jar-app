import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

const EXAMPLES = [
  'March: rent 800, groceries 250, gym 40',
  'Yesterday: 5 cigarettes, coffee 3.50, taxi 8',
  'Spotify 10.99 monthly, Netflix 13.99 monthly',
];

const CATEGORY_KEYWORDS = {
  rent: 'housing', grocery: 'groceries', groceries: 'groceries',
  coffee: 'coffee', cafe: 'food_out', restaurant: 'food_out', food: 'food_out',
  taxi: 'taxi', uber: 'taxi', transport: 'transport',
  gym: 'sport', sport: 'sport', fitness: 'sport',
  cigarette: 'cigarettes', smoking: 'cigarettes',
  netflix: 'entertainment', spotify: 'entertainment', youtube: 'entertainment',
  movie: 'entertainment', cinema: 'entertainment',
  pharmacy: 'pharmacy', medicine: 'pharmacy',
  salary: 'income', income: 'income',
  other: 'other',
};

function parseText(text) {
  const lines = text.split(/[,\n]/).map(l => l.trim()).filter(Boolean);
  const results = [];
  const today = format(new Date(), 'yyyy-MM-dd');

  for (const line of lines) {
    // Try to extract amount
    const amountMatch = line.match(/(\d+(?:\.\d+)?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : null;

    // Try to extract category from known keywords
    const lower = line.toLowerCase();
    let category = 'other';
    for (const [kw, cat] of Object.entries(CATEGORY_KEYWORDS)) {
      if (lower.includes(kw)) { category = cat; break; }
    }

    // Detect if subscription
    const isSubscription = /monthly|weekly|yearly|subscription/i.test(line);

    // Clean title: strip number, currency symbols
    const title = line.replace(/[\d.,]+/, '').replace(/[€$£₼₽]/, '').replace(/monthly|weekly|yearly/i, '').replace(/\s+/g, ' ').trim() || 'Entry';

    if (amount !== null || title) {
      results.push({
        id: Math.random().toString(36).slice(2),
        title,
        amount,
        category,
        type: isSubscription ? 'subscription' : 'spend',
        date: today,
        parsed: !!(amount && category !== 'other'),
        note: '',
      });
    }
  }
  return results;
}

export default function BulkTextImportModal({ onClose }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(null);

  const handleParse = () => {
    const results = parseText(text);
    setParsed(results);
  };

  const removeCard = (id) => setParsed(prev => prev.filter(p => p.id !== id));
  const updateCard = (id, key, val) => setParsed(prev => prev.map(p => p.id === id ? { ...p, [key]: val } : p));

  const handleImport = async () => {
    setImporting(true);
    let count = 0;
    for (const item of parsed) {
      await base44.entities.Item.create({
        type: item.type,
        title: item.title,
        category: item.category,
        amount: item.amount || undefined,
        currency: 'EUR',
        date: item.date,
        note: item.note || undefined,
      });
      count++;
    }
    queryClient.invalidateQueries({ queryKey: ['items'] });
    setImporting(false);
    setDone(count);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm text-primary">BULK TEXT IMPORT</DialogTitle>
        </DialogHeader>

        {!done ? (
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[1px]">Examples</p>
              {EXAMPLES.map(e => (
                <p key={e} className="font-mono text-xs text-[#555] pl-2 border-l border-[#2a2a2a]">{e}</p>
              ))}
            </div>
            <Textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste your entries here..."
              className="bg-muted border-none min-h-[120px] font-mono text-sm"
              autoFocus
            />
            {!parsed && (
              <Button onClick={handleParse} disabled={!text.trim()} className="w-full bg-primary text-primary-foreground font-mono">
                PARSE
              </Button>
            )}

            {parsed && (
              <div className="space-y-2">
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[1px]">{parsed.length} ENTRIES DETECTED — REVIEW & EDIT</p>
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
                        className="flex-1 bg-transparent font-medium text-sm text-white outline-none border-b border-[#2a2a2a] min-w-[120px]"
                      />
                      <input
                        type="number"
                        value={card.amount || ''}
                        onChange={e => updateCard(card.id, 'amount', parseFloat(e.target.value))}
                        placeholder="Amount"
                        className="w-20 bg-transparent font-mono text-sm text-white outline-none border-b border-[#2a2a2a]"
                      />
                      <input
                        value={card.category}
                        onChange={e => updateCard(card.id, 'category', e.target.value)}
                        className="w-24 bg-transparent font-mono text-xs text-muted-foreground outline-none border-b border-[#2a2a2a]"
                      />
                      {!card.parsed && (
                        <span className="font-mono text-[9px] text-yellow-400 border border-yellow-400/30 rounded px-1.5 py-0.5">NEEDS INPUT</span>
                      )}
                      <button onClick={() => removeCard(card.id)} className="text-muted-foreground hover:text-red-400 transition-colors text-xs font-mono">✕</button>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button onClick={handleImport} disabled={importing || parsed.length === 0} className="flex-1 bg-primary text-primary-foreground font-mono">
                    {importing ? 'IMPORTING...' : `IMPORT ALL (${parsed.length})`}
                  </Button>
                  <Button variant="outline" onClick={() => setParsed(null)}>Re-parse</Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 space-y-3">
            <p className="text-4xl">✅</p>
            <p className="font-mono text-lg text-primary">Imported {done} entries</p>
            <Button onClick={onClose} className="bg-primary text-primary-foreground font-mono">Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}