import { base44 } from '@/api/base44Client';
import { exportLearningDB, getAllTemplates } from '@/lib/learningDB';
import { format } from 'date-fns';

function getFilename(ext) {
  const now = new Date();
  return `jar_export_${format(now, 'yyyy-MM-dd_HH-mm')}.${ext}`;
}

export async function exportAllDataJSON(items = []) {
  const autocompleteData = exportLearningDB();
  const savedTemplates = getAllTemplates();

  const data = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    entries: items,
    autocompleteData,
    savedTemplates,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = getFilename('json');
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportAllDataCSV(items = []) {
  if (!items.length) return;
  const cols = ['id', 'type', 'title', 'category', 'amount', 'currency', 'date', 'deadline', 'status', 'priority', 'note', 'created_date'];
  const header = cols.join(',');
  const rows = items.map(item =>
    cols.map(c => {
      const v = item[c];
      if (v === undefined || v === null) return '';
      const str = String(v).replace(/"/g, '""');
      return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
    }).join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = getFilename('csv');
  a.click();
  URL.revokeObjectURL(url);
}