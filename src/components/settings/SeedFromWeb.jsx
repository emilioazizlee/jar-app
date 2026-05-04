import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Download, CheckSquare, Square, Loader2, AlertTriangle, ClipboardPaste } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

function extractListItems(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const items = new Set();

  // <li> items
  doc.querySelectorAll('li').forEach(el => {
    const text = el.textContent.trim().replace(/\s+/g, ' ');
    if (text.length > 2 && text.length < 200) items.add(text);
  });

  // Table cells (first column of each row)
  doc.querySelectorAll('tr').forEach(row => {
    const first = row.querySelector('td');
    if (first) {
      const text = first.textContent.trim().replace(/\s+/g, ' ');
      if (text.length > 2 && text.length < 200) items.add(text);
    }
  });

  return [...items].slice(0, 200);
}

export default function SeedFromWeb() {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState('');
  const [rawHtml, setRawHtml] = useState('');
  const [mode, setMode] = useState('url'); // 'url' | 'paste'
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [itemType, setItemType] = useState('task');
  const [step, setStep] = useState('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imported, setImported] = useState(0);

  const ITEM_TYPES = ['task', 'spend', 'subscription', 'payment', 'meeting', 'note', 'goal', 'contact'];

  const fetchUrl = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error('fetch failed');
      const html = await res.text();
      const extracted = extractListItems(html);
      if (!extracted.length) throw new Error('No list items found');
      setItems(extracted);
      setSelected(new Set(extracted));
      setStep('select');
    } catch (e) {
      setError('CORS blocked or no list items found. Try "Paste HTML" mode instead.');
      setMode('paste');
    }
    setLoading(false);
  };

  const parseHtml = () => {
    const extracted = extractListItems(rawHtml);
    if (!extracted.length) { setError('No list items extracted from HTML.'); return; }
    setItems(extracted);
    setSelected(new Set(extracted));
    setStep('select');
    setError('');
  };

  const toggle = (item) => {
    setSelected(prev => {
      const s = new Set(prev);
      s.has(item) ? s.delete(item) : s.add(item);
      return s;
    });
  };

  const importSelected = async () => {
    setLoading(true);
    let ok = 0;
    for (const title of selected) {
      await base44.entities.Item.create({ type: itemType, title, status: 'Planned' })
        .then(() => ok++).catch(() => {});
    }
    queryClient.invalidateQueries({ queryKey: ['items'] });
    setImported(ok);
    setStep('done');
    setLoading(false);
  };

  const reset = () => { setStep('input'); setUrl(''); setRawHtml(''); setItems([]); setSelected(new Set()); setError(''); setMode('url'); };

  return (
    <div className="space-y-4">
      <p className="mono-header text-[10px] text-muted-foreground">SEED FROM WEB</p>
      <p className="text-xs text-muted-foreground">Extract list items from any public webpage (Wikipedia, GitHub READMEs, etc.) — no API key, no AI.</p>

      <AnimatePresence mode="wait">
        {step === 'input' && (
          <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Mode tabs */}
            <div className="flex gap-2">
              {[{ m: 'url', Icon: Globe, label: 'URL' }, { m: 'paste', Icon: ClipboardPaste, label: 'PASTE HTML' }].map(({ m, Icon, label }) => (
                <button key={m} onClick={() => setMode(m)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${mode === m ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                  <Icon className="w-3 h-3" />{label}
                </button>
              ))}
            </div>

            <div>
              <p className="text-xs text-muted-foreground font-mono mb-2">IMPORT AS TYPE</p>
              <Select value={itemType} onValueChange={setItemType}>
                <SelectTrigger className="bg-muted border-none"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ITEM_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {mode === 'url' && (
              <div className="space-y-3">
                <Input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://en.wikipedia.org/wiki/List_of_..."
                  className="bg-muted border-none font-mono text-sm"
                  onKeyDown={e => e.key === 'Enter' && url && fetchUrl()}
                />
                <Button onClick={fetchUrl} disabled={!url || loading} className="w-full font-mono">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />FETCHING...</> : <><Download className="w-4 h-4 mr-2" />FETCH & EXTRACT</>}
                </Button>
              </div>
            )}

            {mode === 'paste' && (
              <div className="space-y-3">
                <Textarea
                  value={rawHtml}
                  onChange={e => setRawHtml(e.target.value)}
                  placeholder="Paste raw HTML or plain text here..."
                  className="bg-muted border-none font-mono text-xs"
                  rows={8}
                />
                <Button onClick={parseHtml} disabled={!rawHtml.trim()} className="w-full font-mono">EXTRACT ITEMS</Button>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 rounded-lg p-3">
                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </motion.div>
        )}

        {step === 'select' && (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm">{selected.size}/{items.length} selected</p>
              <div className="flex gap-2">
                <button onClick={() => setSelected(new Set(items))} className="text-xs font-mono text-primary hover:underline">ALL</button>
                <button onClick={() => setSelected(new Set())} className="text-xs font-mono text-muted-foreground hover:underline">NONE</button>
                <button onClick={reset} className="text-xs font-mono text-muted-foreground hover:text-foreground">← BACK</button>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
              {items.map((item, i) => (
                <button key={i} onClick={() => toggle(item)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${selected.has(item) ? 'bg-primary/10 text-foreground' : 'bg-muted/40 text-muted-foreground'}`}
                >
                  {selected.has(item) ? <CheckSquare className="w-4 h-4 text-primary flex-shrink-0" /> : <Square className="w-4 h-4 flex-shrink-0" />}
                  <span className="truncate">{item}</span>
                </button>
              ))}
            </div>
            <Button onClick={importSelected} disabled={!selected.size || loading} className="w-full font-mono">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />IMPORTING...</> : `IMPORT ${selected.size} AS ${itemType.toUpperCase()}`}
            </Button>
          </motion.div>
        )}

        {step === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-4">
            <Globe className="w-12 h-12 text-primary mx-auto" />
            <p className="font-mono text-lg text-foreground">{imported} items imported</p>
            <Button onClick={reset} variant="outline" className="font-mono">SEED MORE</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}