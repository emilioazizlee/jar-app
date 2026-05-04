import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, DollarSign, RefreshCw, CreditCard, BarChart3,
  Calendar, CheckSquare, Apple, Heart, Settings, ShoppingBasket,
  ChevronLeft, ChevronRight, Plus, FolderOpen, Loader2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DynIcon from '@/components/projects/DynIcon';
import NewProjectModal from '@/components/projects/NewProjectModal';

const CORE_SECTIONS = [
  {
    label: 'TRACKING',
    items: [
      { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/spends', icon: DollarSign, label: 'Daily Spends' },
      { path: '/subscriptions', icon: RefreshCw, label: 'Subscriptions' },
      { path: '/payments', icon: CreditCard, label: 'Payments' },
      { path: '/insights', icon: BarChart3, label: 'Insights' },
    ],
  },
  {
    label: 'LIFE',
    items: [
      { path: '/calendar', icon: Calendar, label: 'Calendar' },
      { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
      { path: '/diet', icon: Apple, label: 'Diet' },
      { path: '/groceries', icon: ShoppingBasket, label: 'Groceries' },
      { path: '/health', icon: Heart, label: 'Health' },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNewProject, setShowNewProject] = useState(false);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('created_date', 50).then(r => r.filter(p => !p.is_archived)),
    initialData: [],
  });

  const handleProjectCreated = (project) => {
    navigate(`/project/${project.id}`);
  };

  return (
    <>
      <motion.aside
        className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden z-30"
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-border flex-shrink-0">
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              <span className="font-mono text-xl font-bold text-primary tracking-widest">JAR</span>
              <span className="text-xs text-muted-foreground font-mono">Fill your life.</span>
            </motion.div>
          )}
          {collapsed && <span className="font-mono text-xl font-bold text-primary mx-auto">J</span>}
          <button onClick={onToggle} className="p-1 rounded hover:bg-sidebar-accent transition-colors text-muted-foreground">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
          {/* Core sections */}
          {CORE_SECTIONS.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <p className="mono-header text-[10px] text-muted-foreground px-3 mb-2">{section.label}</p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'}`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Projects section */}
          <div>
            {!collapsed && (
              <div className="flex items-center justify-between px-3 mb-2">
                <p className="mono-header text-[10px] text-muted-foreground">PROJECTS</p>
                <button
                  onClick={() => setShowNewProject(true)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  title="New Project"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
            <div className="space-y-0.5">
              {isLoading && !collapsed && (
                <div className="flex items-center gap-2 px-3 py-2">
                  <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                </div>
              )}
              <AnimatePresence>
                {projects.map((project) => {
                  const path = `/project/${project.id}`;
                  const isActive = location.pathname === path;
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      <Link
                        to={path}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${isActive ? 'bg-sidebar-accent' : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'}`}
                        style={isActive ? { color: project.color } : {}}
                      >
                        <DynIcon
                          name={project.icon || 'FolderOpen'}
                          className="w-4 h-4 shrink-0"
                          style={{ color: isActive ? project.color : undefined }}
                        />
                        {!collapsed && (
                          <span className="truncate">{project.name}</span>
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {!isLoading && projects.length === 0 && !collapsed && (
                <button
                  onClick={() => setShowNewProject(true)}
                  className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all border border-dashed border-border/40 mt-1"
                >
                  <FolderOpen className="w-3 h-3" />
                  <span className="font-mono">New Project</span>
                </button>
              )}
              {collapsed && (
                <button
                  onClick={() => setShowNewProject(true)}
                  className="flex items-center justify-center w-full py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-sidebar-accent transition-all"
                  title="New Project"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Settings */}
        <div className="px-2 pb-4 border-t border-sidebar-border pt-2 flex-shrink-0">
          <Link
            to="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all"
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>
        </div>
      </motion.aside>

      <NewProjectModal
        open={showNewProject}
        onClose={() => setShowNewProject(false)}
        onCreated={handleProjectCreated}
      />
    </>
  );
}