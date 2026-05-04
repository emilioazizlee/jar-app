import React, { useState } from 'react';
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportLearningDB, importLearningDB, clearLearningDB, getAllTemplates, deleteTemplate } from '@/lib/learningDB';

export default function SuggestionDBManager() {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [templates, setTemplates] = useState(getAllTemplates());

  const handleExport = () => {
    const data = exportLearningDB();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jar-suggestions-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        importLearningDB(data);
        alert('Suggestion database imported successfully.');
      } catch {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    clearLearningDB();
    setShowClearConfirm(false);
    setTemplates([]);
    alert('Suggestion database cleared.');
  };

  const handleDeleteTemplate = (id) => {
    deleteTemplate(id);
    setTemplates(getAllTemplates());
  };

  const dbKeys = (() => {
    const counts = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('jar_learn_')) {
        try { const v = JSON.parse(localStorage.getItem(k)); counts[k.replace('jar_learn_', '')] = typeof v === 'object' ? Object.keys(v).length : 1; } catch {}
      }
    }
    return counts;
  })();

  return (
    <div className="space-y-4">
      <p className="mono-header text-[10px] text-muted-foreground">SUGGESTION DATABASE</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(dbKeys).filter(([k]) => k !== 'step_templates').slice(0, 8).map(([k, v]) => (
          <div key={k} className="bg-muted/60 rounded-lg px-3 py-2 text-xs font-mono">
            <span className="text-muted-foreground">{k.replace(/_/g, ' ')}</span>
            <span className="text-primary ml-1">{v}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" onClick={handleExport} className="font-mono text-xs gap-2 flex-1">
          <Download className="w-3 h-3" />EXPORT JSON
        </Button>
        <label className="flex-1">
          <Button variant="outline" className="font-mono text-xs gap-2 w-full" asChild>
            <span><Upload className="w-3 h-3" />IMPORT JSON</span>
          </Button>
          <input type="file" accept=".json" className="hidden" onChange={handleImport} />
        </label>
      </div>

      {/* Templates */}
      {templates.length > 0 && (
        <div className="border-t border-border pt-4 space-y-2">
          <p className="mono-header text-[10px] text-muted-foreground">SAVED STEP TEMPLATES ({templates.length})</p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {templates.map(t => (
              <div key={t.id} className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2 text-xs">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-foreground truncate">{t.title}</p>
                  <p className="text-muted-foreground">{t.steps.length} steps · used {t.useCount || 1}x</p>
                </div>
                <button onClick={() => handleDeleteTemplate(t.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clear */}
      <div className="border-t border-border pt-4">
        {!showClearConfirm ? (
          <button onClick={() => setShowClearConfirm(true)} className="flex items-center gap-2 text-xs font-mono text-destructive hover:underline">
            <Trash2 className="w-3 h-3" />CLEAR ALL SUGGESTION DATA
          </button>
        ) : (
          <div className="flex items-start gap-2 bg-destructive/10 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-xs text-destructive font-mono">This will delete all learned suggestions and templates.</p>
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" onClick={handleClear} className="h-7 text-xs font-mono">CONFIRM CLEAR</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowClearConfirm(false)} className="h-7 text-xs font-mono">CANCEL</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}