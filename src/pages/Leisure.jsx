import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { startOfMonth, format } from 'date-fns';
import { ResponsivePie } from '@nivo/pie';
import { nivoTheme } from '@/lib/nivoTheme';
import { PALETTE, CHART_COLORS } from '@/lib/constants';
import LeisureForm from '@/components/leisure/LeisureForm';
import LeisureList from '@/components/leisure/LeisureList';

const SUB_TAG_COLORS = {
  'Cinema':           PALETTE.blue,
  'Concerts':         PALETTE.violet,
  'Gaming':           PALETTE.orange,
  'Dining':           PALETTE.orange,
  'Dating':           PALETTE.pink,
  'Drinks & Bars':    PALETTE.violet,
  'Hobbies':          PALETTE.blue,
  'Streaming Events': PALETTE.blue,
  'Travel':           PALETTE.orange,
  'Grooming':         PALETTE.pink,
  'Books':            PALETTE.muted,
  'Cigarettes':       PALETTE.red,
  'Custom':           PALETTE.muted,
};

function getTagColor(tag, idx = 0) {
  return SUB_TAG_COLORS[tag] || CHART_COLORS[idx % CHART_COLORS.length];
}

const CONTEXT_COLORS = {
  'Solo':        PALETTE.blue,
  'With friend': PALETTE.orange,
  'On date':     PALETTE.pink,
  'With family': PALETTE.violet,
  'Work-social': PALETTE.muted,
};

export default function Leisure() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: entries = [] } = useQuery({
    queryKey: ['leisure'],
    queryFn: () => base44.entities.LeisureEntry.list('-created_date', 500),
    initialData: [],
  });

  const monthStart = startOfMonth(new Date());
  const monthEntries = useMemo(() => entries.filter(e => e.date && new Date(e.date) >= monthStart), [entries]);

  const monthTotal = monthEntries.reduce((s, e) => s + (e.amount || 0), 0);

  const subTagData = useMemo(() => {
    const counts = {};
    monthEntries.forEach(e => {
      const tag = e.custom_sub_tag || e.sub_tag || 'Custom';
      counts[tag] = (counts[tag] || 0) + (e.amount || 1);
    });
    return Object.entries(counts).map(([name, value], i) => ({
      id: name, label: name, value, color: getTagColor(name, i),
    }));
  }, [monthEntries]);

  const contextData = useMemo(() => {
    const counts = {};
    monthEntries.forEach(e => {
      const ctx = e.context || 'Solo';
      counts[ctx] = (counts[ctx] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      id: name, label: name, value, color: CONTEXT_COLORS[name] || PALETTE.muted,
    }));
  }, [monthEntries]);

  const top5 = useMemo(() =>
    [...monthEntries].filter(e => e.amount).sort((a, b) => b.amount - a.amount).slice(0, 5),
    [monthEntries]
  );

  const favPeople = useMemo(() => {
    const counts = {};
    entries.forEach(e => {
      if (e.people) {
        e.people.split(',').map(p => p.trim()).filter(Boolean).forEach(p => {
          counts[p] = (counts[p] || 0) + 1;
        });
      }
    });
    return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 5);
  }, [entries]);

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="mono-header text-lg md:text-xl text-foreground">LEISURE</h1>
          <p className="text-sm text-muted-foreground mt-1">
            This month: <span className="font-mono text-primary font-semibold">€{monthTotal.toFixed(2)}</span>
            {' · '}{monthEntries.length} entries
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-primary text-primary-foreground rounded-xl font-mono text-sm min-h-[44px]"
        >
          <Plus className="w-4 h-4" /> LOG
        </motion.button>
      </div>

      {/* Dashboard cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {/* Sub-tag donut */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="mono-header text-[10px] text-muted-foreground mb-3">BY CATEGORY</p>
          {subTagData.length > 0 ? (
            <div className="flex items-center gap-3">
              <div className="w-24 h-24 shrink-0">
                <ResponsivePie
                  data={subTagData}
                  colors={({ data }) => data.color}
                  innerRadius={0.65} padAngle={2} cornerRadius={3}
                  borderWidth={0} enableArcLinkLabels={false} enableArcLabels={false}
                  activeOuterRadiusOffset={6} theme={nivoTheme}
                  tooltip={({ datum }) => (
                    <div style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 8, padding: '8px 12px', fontFamily: 'JetBrains Mono', fontSize: 11 }}>
                      <span style={{ color: datum.color }}>■</span> {datum.id}: <strong>€{datum.value.toFixed(2)}</strong>
                    </div>
                  )}
                />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                {subTagData.slice(0, 5).map(d => (
                  <div key={d.id} className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="font-mono text-[10px] text-muted-foreground truncate flex-1">{d.label}</span>
                    <span className="font-mono text-[10px] text-foreground">€{d.value.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-sm text-muted-foreground text-center py-6">No data this month</p>}
        </div>

        {/* Context donut */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="mono-header text-[10px] text-muted-foreground mb-3">BY CONTEXT</p>
          {contextData.length > 0 ? (
            <div className="flex items-center gap-3">
              <div className="w-24 h-24 shrink-0">
                <ResponsivePie
                  data={contextData}
                  colors={({ data }) => data.color}
                  innerRadius={0.65} padAngle={2} cornerRadius={3}
                  borderWidth={0} enableArcLinkLabels={false} enableArcLabels={false}
                  activeOuterRadiusOffset={6} theme={nivoTheme}
                />
              </div>
              <div className="space-y-1 flex-1">
                {contextData.map(d => (
                  <div key={d.id} className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="font-mono text-[10px] text-muted-foreground flex-1">{d.label}</span>
                    <span className="font-mono text-[10px] text-foreground">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-sm text-muted-foreground text-center py-6">No data this month</p>}
        </div>

        {/* Top 5 most expensive */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="mono-header text-[10px] text-muted-foreground mb-3">TOP 5 ENTRIES</p>
          <div className="space-y-2">
            {top5.length > 0 ? top5.map((e, i) => (
              <div key={e.id} className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground w-4">{i + 1}</span>
                <span className="flex-1 font-mono text-xs truncate">{e.item}</span>
                <span className="font-mono text-xs text-primary">€{e.amount.toFixed(2)}</span>
              </div>
            )) : <p className="text-sm text-muted-foreground py-4 text-center">—</p>}
          </div>
        </div>
      </div>

      {/* Favorite people */}
      {favPeople.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="mono-header text-[10px] text-muted-foreground mb-3">FAVORITE PEOPLE TO SPEND WITH</p>
          <div className="flex flex-wrap gap-2">
            {favPeople.map(([person, count]) => (
              <div key={person} className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-xl">
                <span className="font-mono text-xs text-foreground">{person}</span>
                <span className="font-mono text-[10px] text-primary">{count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Entries list */}
      <LeisureList entries={entries} onRefresh={() => queryClient.invalidateQueries({ queryKey: ['leisure'] })} />

      {showForm && (
        <LeisureForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['leisure'] }); queryClient.invalidateQueries({ queryKey: ['items'] }); }}
        />
      )}
    </div>
  );
}