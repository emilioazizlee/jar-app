import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, DollarSign, CheckSquare, MoreHorizontal, X,
  RefreshCw, CreditCard, BarChart3, Calendar, Apple, ShoppingBasket,
  Heart, Settings, HelpCircle, FolderOpen, Wallet, Martini, Star,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const MORE_ITEMS = [
  { path: '/subscriptions', icon: RefreshCw, label: 'Subscriptions' },
  { path: '/payments', icon: CreditCard, label: 'Payments' },
  { path: '/finance', icon: Wallet, label: 'Finance' },
  { path: '/insights', icon: BarChart3, label: 'Insights' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/diet', icon: Apple, label: 'Diet' },
  { path: '/groceries', icon: ShoppingBasket, label: 'Groceries' },
  { path: '/health', icon: Heart, label: 'Health' },
  { path: '/leisure', icon: Martini, label: 'Leisure' },
  { path: '/favorites', icon: Star, label: 'Favorites' },
  { path: '/settings', icon: Settings, label: 'Settings' },
  { path: '/help', icon: HelpCircle, label: 'Help' },
];

export default function BottomNav({ onOpenAdd }) {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('created_date', 50).then(r => r.filter(p => !p.is_archived)),
    initialData: [],
  });

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Home' },
    { path: '/spends', icon: DollarSign, label: 'Spends' },
  ];

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-sidebar border-t border-sidebar-border flex items-center justify-around px-2 md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)', height: 'calc(56px + env(safe-area-inset-bottom))' }}
      >
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all min-w-[44px] min-h-[44px] justify-center active:scale-95 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-mono text-[9px]">{label}</span>
            </Link>
          );
        })}

        {/* Central + button placeholder (actual button is UniversalAddButton) */}
        <div className="w-14" />

        <Link
          to="/tasks"
          className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all min-w-[44px] min-h-[44px] justify-center active:scale-95 ${location.pathname === '/tasks' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <CheckSquare className="w-5 h-5" />
          <span className="font-mono text-[9px]">Tasks</span>
        </Link>

        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all min-w-[44px] min-h-[44px] justify-center text-muted-foreground active:scale-95"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="font-mono text-[9px]">More</span>
        </button>
      </nav>

      {/* More Overlay */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-background flex flex-col md:hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="font-mono text-sm font-bold text-primary tracking-widest">JAR — MENU</span>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {MORE_ITEMS.map(({ path, icon: Icon, label }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all active:scale-98 ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="font-mono text-sm">{label}</span>
                  </Link>
                );
              })}

              {projects.length > 0 && (
                <>
                  <p className="mono-header text-[10px] text-muted-foreground px-4 pt-4 pb-2">PROJECTS</p>
                  {projects.map(p => {
                    const path = `/project/${p.id}`;
                    const isActive = location.pathname === path;
                    return (
                      <Link
                        key={p.id}
                        to={path}
                        onClick={() => setMoreOpen(false)}
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all active:scale-98 ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                      >
                        <FolderOpen className="w-5 h-5 shrink-0" style={{ color: p.color }} />
                        <span className="font-mono text-sm">{p.name}</span>
                      </Link>
                    );
                  })}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}