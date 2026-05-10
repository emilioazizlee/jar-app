import React, { useState, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import PremiumGate from '@/components/premium/PremiumGate';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Eye, Trash2, Palette } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { PALETTE } from '@/lib/constants';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const SLOT_H = 48; // px per hour

const PROJECT_COLORS = [
  PALETTE.blue, PALETTE.orange, PALETTE.violet, PALETTE.pink, PALETTE.green, PALETTE.yellow, PALETTE.red,
];

function TimeLabel({ hour }) {
  return (
    <div style={{ height: SLOT_H, display: 'flex', alignItems: 'flex-start', paddingTop: 4, paddingRight: 8, flexShrink: 0, width: 44 }}>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555' }}>
        {String(hour).padStart(2, '0')}:00
      </span>
    </div>
  );
}

function PlannerBlock({ block, onMove, onResize, onDelete, onColorChange }) {
  const dragStart = useRef(null);

  const handleMouseDown = (e) => {
    e.preventDefault();
    dragStart.current = { y: e.clientY, startHour: block.start_hour, startMin: block.start_min };
    const onMove_ = (me) => {
      const dy = me.clientY - dragStart.current.y;
      const deltaSlots = Math.round(dy / (SLOT_H / 2));
      const newStartMin = dragStart.current.startMin + deltaSlots * 30;
      const totalMins = dragStart.current.startHour * 60 + newStartMin;
      const clampedMins = Math.max(0, Math.min(23 * 60, totalMins));
      const newHour = Math.floor(clampedMins / 60);
      const newMin = clampedMins % 60;
      onMove(block.id, newHour, newMin);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove_);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove_);
    window.addEventListener('mouseup', onUp);
  };

  const top = (block.start_hour * 60 + block.start_min) / 60 * SLOT_H;
  const height = Math.max(SLOT_H / 2, (block.duration_min / 60) * SLOT_H);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        position: 'absolute',
        top, left: 4, right: 4, height,
        background: block.color + '22',
        border: `2px solid ${block.color}55`,
        borderLeft: `3px solid ${block.color}`,
        borderRadius: 8,
        padding: '4px 8px',
        cursor: 'grab',
        overflow: 'hidden',
        userSelect: 'none',
        zIndex: 10,
      }}
      onMouseDown={handleMouseDown}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: block.color, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {block.title}
        </p>
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={() => onDelete(block.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#555', flexShrink: 0 }}
        >
          <Trash2 size={10} />
        </button>
      </div>
      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#666', marginTop: 1 }}>
        {String(block.start_hour).padStart(2,'0')}:{String(block.start_min).padStart(2,'0')} · {block.duration_min}min
      </p>
    </motion.div>
  );
}

function PlannerContent({ user }) {
  const qc = useQueryClient();
  const [blocks, setBlocks] = useState([]);
  const [planDate, setPlanDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [newTitle, setNewTitle] = useState('');
  const [newHour, setNewHour] = useState(9);
  const [newDur, setNewDur] = useState(60);
  const [newColor, setNewColor] = useState(PROJECT_COLORS[0]);
  const [previewMode, setPreviewMode] = useState(false);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', user?.email],
    queryFn: () => base44.entities.Project.filter({ created_by: user?.email }),
    enabled: !!user,
  });

  const addBlock = () => {
    if (!newTitle.trim()) return;
    setBlocks(b => [...b, {
      id: Date.now().toString(),
      title: newTitle,
      start_hour: newHour,
      start_min: 0,
      duration_min: newDur,
      color: newColor,
    }]);
    setNewTitle('');
  };

  const moveBlock = useCallback((id, newHour, newMin) => {
    setBlocks(b => b.map(bl => bl.id === id ? { ...bl, start_hour: newHour, start_min: newMin } : bl));
  }, []);

  const deleteBlock = (id) => setBlocks(b => b.filter(bl => bl.id !== id));

  const saveAsTasks = async () => {
    if (blocks.length === 0) return;
    const tasks = blocks.map(bl => ({
      type: 'task',
      title: bl.title,
      date: planDate,
      status: 'Planned',
      note: JSON.stringify({ plannerColor: bl.color, plannerHour: bl.start_hour, plannerMin: bl.start_min }),
    }));
    await base44.entities.Item.bulkCreate(tasks);
    qc.invalidateQueries({ queryKey: ['items'] });
    toast.success(`${tasks.length} tasks created for ${format(new Date(planDate), 'MMM d')}`);
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#7a7a7a' }}>VISUAL PLANNER</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={planDate}
            onChange={e => setPlanDate(e.target.value)}
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', padding: '6px 10px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}
          />
          <button onClick={() => setPreviewMode(m => !m)}
            style={{ padding: '7px 12px', borderRadius: 8, background: previewMode ? 'rgba(171,255,79,0.1)' : '#1a1a1a', border: `1px solid ${previewMode ? '#abff4f40' : '#2a2a2a'}`, color: previewMode ? '#abff4f' : '#888', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Eye size={12} /> Preview
          </button>
          <button onClick={saveAsTasks}
            style={{ padding: '7px 14px', borderRadius: 8, background: '#abff4f', color: '#0a0a0a', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Save size={12} /> Save as Tasks
          </button>
        </div>
      </div>

      {/* Add block form */}
      <div style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12, padding: 16, marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555', marginBottom: 5 }}>TASK NAME</p>
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addBlock()}
            placeholder="e.g. Deep Work"
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', padding: '7px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, width: 180 }}
          />
        </div>
        <div>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555', marginBottom: 5 }}>START HOUR</p>
          <select value={newHour} onChange={e => setNewHour(Number(e.target.value))}
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', padding: '7px 10px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
            {HOURS.map(h => <option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>)}
          </select>
        </div>
        <div>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555', marginBottom: 5 }}>DURATION</p>
          <select value={newDur} onChange={e => setNewDur(Number(e.target.value))}
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', padding: '7px 10px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
            {[30, 60, 90, 120, 180, 240].map(d => <option key={d} value={d}>{d}min</option>)}
          </select>
        </div>
        <div>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#555', marginBottom: 5 }}>COLOR</p>
          <div style={{ display: 'flex', gap: 4 }}>
            {PROJECT_COLORS.map(c => (
              <button key={c} onClick={() => setNewColor(c)}
                style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: newColor === c ? `2px solid #fff` : '2px solid transparent', cursor: 'pointer' }} />
            ))}
          </div>
        </div>
        <button onClick={addBlock}
          style={{ padding: '8px 16px', borderRadius: 8, background: '#abff4f', color: '#0a0a0a', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={12} /> Add Block
        </button>
      </div>

      {/* 24h Timeline */}
      <div style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #1f1f1f', padding: '10px 16px' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: 1 }}>
            {format(new Date(planDate), 'EEEE, MMMM d')} — {blocks.length} blocks
          </p>
        </div>
        <div style={{ overflowY: 'auto', maxHeight: '60vh', display: 'flex' }}>
          {/* Hour labels */}
          <div style={{ flexShrink: 0 }}>
            {HOURS.map(h => <TimeLabel key={h} hour={h} />)}
          </div>
          {/* Grid + blocks */}
          <div style={{ flex: 1, position: 'relative' }}>
            {HOURS.map(h => (
              <div key={h} style={{ height: SLOT_H, borderBottom: '1px solid #1a1a1a', borderTop: h === 0 ? 'none' : 'none' }}>
                <div style={{ height: SLOT_H / 2, borderBottom: '1px dashed #151515' }} />
              </div>
            ))}
            {/* Current time indicator */}
            <div style={{
              position: 'absolute',
              top: (new Date().getHours() * 60 + new Date().getMinutes()) / 60 * SLOT_H,
              left: 0, right: 0, height: 2,
              background: '#c1121f', opacity: 0.6, zIndex: 5,
            }} />
            {blocks.map(bl => (
              <PlannerBlock key={bl.id} block={bl} onMove={moveBlock} onDelete={deleteBlock} />
            ))}
          </div>
        </div>
      </div>

      {blocks.length === 0 && (
        <p style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#444', marginTop: 20 }}>
          Add blocks above to build your visual schedule
        </p>
      )}
    </div>
  );
}

export default function PlannerVisual() {
  const { user } = useCurrentUser();
  return (
    <PremiumGate featureName="Visual Planner">
      <PlannerContent user={user} />
    </PremiumGate>
  );
}