import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import UniversalAddButton from '../add/UniversalAddButton';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

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
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar totalJars={totalJars} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <UniversalAddButton />
    </div>
  );
}