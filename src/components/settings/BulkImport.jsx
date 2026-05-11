/* HIDDEN - PapaParse integration pending full architecture design */
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ClipboardList, CheckCircle2, XCircle, Loader2, FileText, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { ITEM_TYPES } from '@/lib/constants';

function parseCSV(text) {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (!lines.length) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const obj = {};
    headers.forEach((h, i) => { if (vals[i]) obj[h] = vals[i]; });
    return obj;
  }).filter(r => r.name || r.title);
}

function parsePlainText(text) {
  const items = text.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0);
  return items.map(title => ({ title }));
}

export default function BulkImport() {
  const queryClient = useQueryClient();
  const fileRef = useRef();
  const [mode, setMode] = useState('csv'); // 'csv' | 'text'
  const [csvText, setCsvText] = useState('');
  const [plainText, setPlainText] = useState('');
  const [plainType, setPlainType] = useState('task');
  const [preview, setPreview] = useState([]);
  const [step, setStep] = useState('input'); // 'input' | 'preview' | 'done'
  const [results, setResults] = useState({ ok: 0, fail: 0 });
  const [importing, setImporting] = useState(false);

  const handleFileRead = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setCsvText(ev.target.result); };
    reader.readAsText(file);
  };

  const buildPreview = () => {
    if (mode === 'csv') {
      const rows = parseCSV(csvText);
      setPreview(rows.map(r => ({
        title: r.name || r.title || '',
        type: r.type || 'task',
        category: r.category || '',
        priority: r.priority ? Number(r.priority) : undefined,
        deadline: r.deadline || '',
        note: r.notes || r.note || '',
        tags: r.tags ? r.tags.split(';') : [],
      })));
    } else {
      const rows = parsePlainText(plainText);
      setPreview(rows.map(r => ({ title: r.title, type: plainType })));
    }
    setStep('preview');
  };

  const runImport = async () => {
    setImporting(true);
    let ok = 0, fail = 0;
    for (const item of preview) {
      if (!item.title) { fail++; continue; }
      await base44.entities.Item.create({
        type: item.type || 'task',
        title: item.title,
        category: item.category || undefined,
        priority: item.priority || undefined,
        deadline: item.deadline || undefined,
        note: item.note || undefined,
        tags: item.tags?.length ? item.tags : undefined,
        status: 'Planned',
      }).then(() => ok++).catch(() => fail++);
    }
    queryClient.invalidateQueries({ queryKey: ['items'] });
    setResults({ ok, fail });
    setStep('done');
    setImporting(false);
  };

  const reset = () => { setStep('input'); setCsvText(''); setPlainText(''); setPreview([]); };

  const csvTypes = ITEM_TYPES?.map(t => t.key || t.value || t) || ['task','spend','subscription','payment','meeting','note','goal','contact'];

  return (
    <div className="space-y-4">
      <p className="mono-header text-[10px] text-muted-foreground">BULK IMPORT</p>

      <AnimatePresence mode="wait">
        {step === 'input' && (
          <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Mode tabs */}
            <div className="flex gap-2">
              {[{ m: 'csv', Icon: FileText, label: 'CSV FILE' }, { m: 'text', Icon: List, label: 'PLAIN TEXT' }].map(({ m, Icon, label }) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${mode === m ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                >
                  <Icon className="w-3 h-3" />{label}
                </button>
              ))}
            </div>

            {mode === 'csv' && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground font-mono">
                  Required: <span className="text-primary">name</span>, <span className="text-primary">type</span> — 
                  Optional: category, priority, deadline, notes, tags (semicolon-separated)
                </p>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 text-center cursor-pointer transition-colors"
                >
                  <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground font-mono">DROP CSV OR CLICK</p>
                  <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileRead} />
                </div>
                {csvText && (
                  <Textarea
                    value={csvText}
                    onChange={e => setCsvText(e.target.value)}
                    className="bg-muted border-none font-mono text-xs"
                    rows={6}
                    placeholder="Or paste CSV content here..."
                  />
                )}
                {!csvText && (
                  <Textarea
                    value={csvText}
                    onChange={e => setCsvText(e.target.value)}
                    className="bg-muted border-none font-mono text-xs"
                    rows={4}
                    placeholder={"name,type,category,priority\nLearn Spanish,task,Studies,3\nNetflix,subscription,,\n"}
                  />
                )}
              </div>
            )}

            {mode === 'text' && (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground font-mono mb-2">ALL ITEMS TYPE</p>
                  <Select value={plainType} onValueChange={setPlainType}>
                    <SelectTrigger className="bg-muted border-none"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {csvTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  value={plainText}
                  onChange={e => setPlainText(e.target.value)}
                  className="bg-muted border-none font-mono text-sm"
                  rows={8}
                  placeholder={"Paste items separated by commas or newlines:\n\nLearn piano\nRead Clean Code\nFinish report\nor: item1, item2, item3"}
                />
              </div>
            )}

            <Button
              onClick={buildPreview}
              disabled={mode === 'csv' ? !csvText.trim() : !plainText.trim()}
              className="w-full font-mono"
            >
              PREVIEW IMPORT
            </Button>
          </motion.div>
        )}

        {step === 'preview' && (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm text-foreground">{preview.length} items ready</p>
              <button onClick={reset} className="text-xs font-mono text-muted-foreground hover:text-foreground">← BACK</button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
              {preview.map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted/60 rounded-lg px-3 py-2 text-sm">
                  <span className="font-mono text-xs text-primary w-20 truncate">[{item.type}]</span>
                  <span className="flex-1 truncate">{item.title}</span>
                  {item.category && <span className="text-xs text-muted-foreground font-mono">{item.category}</span>}
                  {item.priority && <span className="text-xs text-secondary font-mono">P{item.priority}</span>}
                </div>
              ))}
            </div>
            <Button onClick={runImport} disabled={importing} className="w-full font-mono bg-primary">
              {importing ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />IMPORTING...</> : `IMPORT ${preview.length} ITEMS`}
            </Button>
          </motion.div>
        )}

        {step === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-4">
            {results.fail === 0
              ? <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
              : <XCircle className="w-12 h-12 text-destructive mx-auto" />
            }
            <div>
              <p className="font-mono text-lg text-foreground">{results.ok} imported</p>
              {results.fail > 0 && <p className="font-mono text-sm text-destructive">{results.fail} failed</p>}
            </div>
            <Button onClick={reset} variant="outline" className="font-mono">IMPORT MORE</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}