import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, DollarSign, RefreshCw, CreditCard, BarChart3,
  Briefcase, GraduationCap, Calendar, CheckSquare, Apple,
  Heart, Settings, ChevronLeft, ChevronRight
} from 'lucide-react';

const sections = [
  {
    label: 'TRACKING',
    items: [
      { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/spends', icon: DollarSign, label: 'Daily Spends' },
      { path: '/subscriptions', icon: RefreshCw, label: 'Subscriptions' },
      { path: '/payments', icon: CreditCard, label: 'Payments' },
      { path: '/insights', icon: BarChart3, label: 'Insights' },
    ]
  },
  {
    label: 'WORK',
    items: [
      { path: '/football', icon: Briefcase, label: 'Football Agent' },
      { path: '/studies', icon: GraduationCap, label: 'Studies' },
    ]
  },
  {
    label: 'LIFE',
    items: [
      { path: '/calendar', icon: Calendar, label: 'Calendar' },
      { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
      { path: '/diet', icon: Apple, label: 'Diet & Groceries' },
      { path: '/health', icon: Heart, label: 'Health' },
    ]
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();

  return (
    <motion.aside
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden z-30"
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2 }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-border">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <span className="font-mono text-xl font-bold text-primary tracking-widest">JAR</span>
            <span className="text-xs text-muted-foreground font-mono">Fill your life.</span>
          </motion.div>
        )}
        {collapsed && <span className="font-mono text-xl font-bold text-primary mx-auto">J</span>}
        <button
          onClick={onToggle}
          className="p-1 rounded hover:bg-sidebar-accent transition-colors text-muted-foreground"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {sections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="mono-header text-[10px] text-muted-foreground px-3 mb-2">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Settings */}
      <div className="px-2 pb-4 border-t border-sidebar-border pt-2">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all"
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>
    </motion.aside>
  );
}