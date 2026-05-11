/* HIDDEN - Import system pending connection architecture */
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Papa from 'papaparse';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

const JAR_FIELDS = ['Date', 'Amount', 'Currency', 'Category', 'Subcategory', 'Project', 'Note', 'Quantity', 'Title', 'Skip'];

function autoMap(header) {
  const h = header.toLowerCase().trim();
  if (['date','when','day'].includes(h)) return 'Date';
  if (['amount','price','cost','value','sum','total'].includes(h)) return 'Amount';
  if (['currency','cur','ccy'].includes(h)) return 'Currency';
  if (['category','cat','type','kind'].includes(h)) return 'Category';
  if (['subcategory','subcat','sub'].includes(h)) return 'Subcategory';
  if (['project','proj'].includes(h)) return 'Project';
  if (['note','notes','description','desc','memo','comment'].includes(h)) return 'Note';
  if (['quantity','qty','count'].includes(h)) return 'Quantity';
  if (['title','name','item','what'].includes(h)) return 'Title';
  return 'Skip';
}

export default function CSVImportModal({ onClose }) {
  const queryClient = useQueryClient();
  const fileRef = useRef();
  const [rows, setRows] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [step, setStep] = useState('pick'); // pick | map | preview | importing | done
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [skipped, setSkipped] = useState([]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const hdrs = res.meta.fields || [];
        setHeaders(hdrs);
        setRows(res.data);
        const autoMapping = {};
        hdrs.forEach(h => { autoMapping[h] = autoMap(h); });
        setMapping(autoMapping);
        setStep('map');
      }
    });
  };

  const handleImport = async () => {
    setStep('importing');
    let count = 0;
    const skippedRows = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const entry = {};
      Object.entries(mapping).forEach(([col, field]) => {
        if (field !== 'Skip') entry[field] = row[col];
      });
      if (!entry.Date && !entry.Amount) { skippedRows.push(row); continue; }
      try {
        await base44.entities.Item.create({
          type: 'spend',
          title: entry.Title || entry.Category || 'Imported',
          category: entry.Category || 'other',
          amount: entry.Amount ? parseFloat(entry.Amount) : undefined,
          currency: entry.Currency || 'EUR',
          quantity: entry.Quantity ? parseFloat(entry.Quantity) : undefined,
          note: entry.Note || undefined,
          date: entry.Date || format(new Date(), 'yyyy-MM-dd'),
        });
        count++;
      } catch { skippedRows.push(row); }
      setProgress(Math.round(((i + 1) / rows.length) * 100));
    }
    queryClient.invalidateQueries({ queryKey: ['items'] });
    setResult(count);
    setSkipped(skippedRows);
    setStep('done');
  };

  const preview = rows ? rows.slice(0, 5) : [];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm text-primary">CSV IMPORT</DialogTitle>
        </DialogHeader>

        <div className="pt-2 space-y-4">
          {step === 'pick' && (
            <div className="text-center py-8 space-y-4">
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-[#2a2a2a] rounded-xl p-12 cursor-pointer hover:border-primary/40 transition-colors"
              >
                <p className="font-mono text-sm text-muted-foreground">Click to pick a CSV file</p>
                <p className="font-mono text-xs text-[#555] mt-2">.csv files only</p>
              </div>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
            </div>
          )}

          {step === 'map' && (
            <>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[1px]">MAP CSV COLUMNS TO JAR FIELDS</p>
              <div className="space-y-2">
                {headers.map(h => (
                  <div key={h} className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#aaa] w-32 shrink-0 truncate">{h}</span>
                    <span className="text-muted-foreground">→</span>
                    <select
                      value={mapping[h] || 'Skip'}
                      onChange={e => setMapping(prev => ({ ...prev, [h]: e.target.value }))}
                      style={{ borderRadius: 8, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#fff', padding: '5px 10px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, flex: 1 }}
                    >
                      {JAR_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <Button onClick={() => setStep('preview')} className="w-full bg-primary text-primary-foreground font-mono">Preview</Button>
            </>
          )}

          {step === 'preview' && (
            <>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[1px]">PREVIEW (first 5 rows)</p>
              <div className="overflow-x-auto">
                <table className="w-full font-mono text-xs">
                  <thead>
                    <tr>
                      {headers.filter(h => mapping[h] !== 'Skip').map(h => (
                        <th key={h} className="text-left text-muted-foreground px-2 py-1 border-b border-[#1f1f1f]">{mapping[h]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-b border-[#1a1a1a]">
                        {headers.filter(h => mapping[h] !== 'Skip').map(h => (
                          <td key={h} className="px-2 py-1.5 text-[#aaa] truncate max-w-[120px]">{row[h]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="font-mono text-xs text-muted-foreground">{rows.length} total rows to import</p>
              <div className="flex gap-2">
                <Button onClick={handleImport} className="flex-1 bg-primary text-primary-foreground font-mono">Import {rows.length} rows</Button>
                <Button variant="outline" onClick={() => setStep('map')}>Back</Button>
              </div>
            </>
          )}

          {step === 'importing' && (
            <div className="py-8 space-y-4 text-center">
              <p className="font-mono text-sm text-muted-foreground">Importing... {progress}%</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center py-8 space-y-3">
              <p className="text-4xl">✅</p>
              <p className="font-mono text-lg text-primary">Imported {result} entries</p>
              {skipped.length > 0 && <p className="font-mono text-xs text-yellow-400">{skipped.length} rows skipped due to errors</p>}
              <Button onClick={onClose} className="bg-primary text-primary-foreground font-mono">Done</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}