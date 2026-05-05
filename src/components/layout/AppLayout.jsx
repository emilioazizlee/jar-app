import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import UniversalAddButton from '../add/UniversalAddButton';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { startOfMonth, format } from 'date-fns';
import { PROJECT_TEMPLATES } from '@/lib/projectTemplates';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';
import ShortcutsOverlay from '@/components/help/ShortcutsOverlay';
import ShortcutsTip from '@/components/help/ShortcutsTip';

const SEED_KEY = 'jar_projects_seeded_v1';

async function autoSeedProjects(queryClient) {
  if (localStorage.getItem(SEED_KEY)) return;
  const toSeed = PROJECT_TEMPLATES.filter(t => t.id === 'football_agent' || t.id === 'studies');
  for (const tpl of toSeed) {
    const existing = await base44.entities.Project.list('created_date', 100).then(r => r.filter(p => p.name === tpl.name));
    if (existing.length === 0) {
      await base44.entities.Project.create({
        name: tpl.name, description: tpl.description, icon: tpl.icon,
        color: tpl.color, work_types: tpl.work_types, is_archived: false,
      });
    }
  }
  localStorage.setItem(SEED_KEY, '1');
  queryClient.invalidateQueries({ queryKey: ['projects'] });
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const searchRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => { autoSeedProjects(queryClient); }, []);

  useKeyboardShortcuts({
    onOpenAdd: useCallback(() => setAddOpen(true), []),
    onToggleSidebar: useCallback(() => setCollapsed(c => !c), []),
    onOpenShortcuts: useCallback(() => setShortcutsOpen(true), []),
    searchRef,
  });

  const { data: items = [] } = useQuery({
    queryKey: ['items-month'],
    queryFn: () => {
      const start = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      return base44.entities.Item.filter({ date: { $gte: start } }, '-created_date', 500);
    },
    initialData: [],
  });

  const totalJars = items.length / 10;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar totalJars={totalJars} searchRef={searchRef} onOpenShortcuts={() => setShortcutsOpen(true)} onOpenAdd={() => setAddOpen(true)} onToggleSidebar={() => setCollapsed(c => !c)} />
        {/* pb for bottom nav on mobile */}
        <main className="flex-1 overflow-y-auto p-3 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
      <UniversalAddButton externalOpen={addOpen} onExternalClose={() => setAddOpen(false)} />
      {/* Bottom nav — mobile only */}
      <BottomNav onOpenAdd={() => setAddOpen(true)} />
      <ShortcutsOverlay open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <ShortcutsTip />
    </div>
  );
}