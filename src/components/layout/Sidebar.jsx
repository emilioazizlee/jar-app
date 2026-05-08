import React, { useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, DollarSign, RefreshCw, CreditCard, BarChart3,
  Calendar, CheckSquare, Apple, Heart, Settings, ShoppingBasket,
  ChevronLeft, ChevronRight, Plus, FolderOpen, Loader2, HelpCircle,
  Wallet, Martini, Star, GripVertical,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DynIcon from '@/components/projects/DynIcon';
import NewProjectModal from '@/components/projects/NewProjectModal';
import ProjectContextMenu from '@/components/projects/ProjectContextMenu';
import { loadSidebarOrder, saveSidebarOrder } from '@/lib/sidebarOrder';

const ALL_ITEMS = {
  '/': { icon: LayoutDashboard, label: 'Dashboard' },
  '/spends': { icon: DollarSign, label: 'Daily Spends' },
  '/subscriptions': { icon: RefreshCw, label: 'Subscriptions' },
  '/payments': { icon: CreditCard, label: 'Payments' },
  '/finance': { icon: Wallet, label: 'Finance' },
  '/insights': { icon: BarChart3, label: 'Insights' },
  '/calendar': { icon: Calendar, label: 'Calendar' },
  '/tasks': { icon: CheckSquare, label: 'Tasks' },
  '/diet': { icon: Apple, label: 'Diet' },
  '/groceries': { icon: ShoppingBasket, label: 'Groceries' },
  '/health': { icon: Heart, label: 'Health' },
  '/leisure': { icon: Martini, label: 'Leisure' },
};

export default function Sidebar({ collapsed, onToggle, onMobileClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNewProject, setShowNewProject] = useState(false);
  const [order, setOrder] = useState(() => loadSidebarOrder());
  const [dragging, setDragging] = useState(null); // { section, index }
  const [dragOver, setDragOver] = useState(null); // { section, index }
  const [crossSectionDrag, setCrossSectionDrag] = useState(false);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('created_date', 50).then(r => r.filter(p => !p.is_archived)),
    initialData: [],
  });

  const handleProjectCreated = (project) => {
    navigate(`/project/${project.id}`);
  };

  const handleDragStart = useCallback((section, index) => {
    setDragging({ section, index });
  }, []);

  const handleDragOver = useCallback((e, section, index) => {
    e.preventDefault();
    if (!dragging) return;
    if (dragging.section === section) {
      setDragOver({ section, index });
      setCrossSectionDrag(false);
    } else {
      setCrossSectionDrag(true);
      setDragOver(null);
    }
  }, [dragging]);

  const handleDrop = useCallback((e, section, index) => {
    e.preventDefault();
    if (!dragging || dragging.section !== section) return;
    const newOrder = { ...order };
    const arr = [...newOrder[section]];
    const [removed] = arr.splice(dragging.index, 1);
    arr.splice(index, 0, removed);
    newOrder[section] = arr;
    setOrder(newOrder);
    saveSidebarOrder(newOrder);
    setDragging(null);
    setDragOver(null);
  }, [dragging, order]);

  const handleDragEnd = useCallback(() => {
    setDragging(null);
    setDragOver(null);
    setCrossSectionDrag(false);
  }, []);

  const SECTIONS = [
    { label: 'TRACKING', key: 'TRACKING' },
    { label: 'LIFE', key: 'LIFE' },
  ];

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
            <Link to="/" onClick={onMobileClose} className="flex items-center gap-2 hover:opacity-80 transition-opacity active:opacity-60">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                <span className="font-mono text-xl font-bold text-primary tracking-widest">JAR</span>
                <span className="text-xs text-muted-foreground font-mono">Fill your life.</span>
              </motion.div>
            </Link>
          )}
          {collapsed && (
            <Link to="/" onClick={onMobileClose} className="mx-auto hover:opacity-80 transition-opacity">
              <span className="font-mono text-xl font-bold text-primary">J</span>
            </Link>
          )}
          <button onClick={onToggle} className="p-1 rounded-lg hover:bg-sidebar-accent transition-colors text-muted-foreground">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
          {SECTIONS.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <p className="font-mono text-[10px] uppercase tracking-[2px] text-muted-foreground px-3 mb-2">
                  {section.label}
                </p>
              )}
              <div
                className="space-y-0.5 relative"
                onDragOver={(e) => {
                  if (dragging && dragging.section !== section.key) e.preventDefault();
                }}
                onDrop={(e) => {
                  // Block cross-section drops
                  if (dragging && dragging.section !== section.key) {
                    e.preventDefault();
                    setCrossSectionDrag(false);
                  }
                }}
              >
                {/* Cross-section drop blocker overlay */}
                {crossSectionDrag && dragging && dragging.section !== section.key && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(193,18,31,0.15)', border: '1px solid rgba(193,18,31,0.4)', borderRadius: 8, zIndex: 10, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 16 }}>🚫</span>
                  </div>
                )}
                {order[section.key].map((path, index) => {
                  const item = ALL_ITEMS[path];
                  if (!item) return null;
                  const isActive = location.pathname === path;
                  const Icon = item.icon;
                  const isDragTarget = dragOver?.section === section.key && dragOver?.index === index;
                  return (
                    <div
                      key={path}
                      draggable
                      onDragStart={() => handleDragStart(section.key, index)}
                      onDragOver={(e) => handleDragOver(e, section.key, index)}
                      onDrop={(e) => handleDrop(e, section.key, index)}
                      onDragEnd={handleDragEnd}
                      style={{ userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
                      className={`group relative transition-all ${isDragTarget ? 'translate-y-0.5 opacity-60' : ''}`}
                    >
                      <Link
                        to={path}
                        onClick={onMobileClose}
                        style={{ borderRadius: 8 }}
                        className={`flex items-center gap-3 px-3 py-2 text-sm transition-all ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        {!collapsed && <span className="flex-1">{item.label}</span>}
                        {!collapsed && (
                          <GripVertical className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-40 cursor-grab transition-opacity" />
                        )}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Projects section */}
          <div>
            {!collapsed && (
              <div className="flex items-center justify-between px-3 mb-2">
                <p className="font-mono text-[10px] uppercase tracking-[2px] text-muted-foreground">PROJECTS</p>
                <button
                  onClick={() => setShowNewProject(true)}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-[#1f1f1f] hover:bg-[#2a2a2a] transition-colors text-primary"
                  title="New Project"
                >
                  <Plus className="w-4 h-4" />
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
                      <ProjectContextMenu project={project} onMobileClose={onMobileClose}>
                        <Link
                          to={path}
                          onClick={onMobileClose}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                            isActive ? 'bg-sidebar-accent' : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
                          }`}
                          style={isActive ? { color: project.color } : {}}
                        >
                          <DynIcon
                            name={project.icon || 'FolderOpen'}
                            className="w-4 h-4 shrink-0"
                            style={{ color: isActive ? project.color : undefined }}
                          />
                          {!collapsed && <span className="truncate">{project.name}</span>}
                        </Link>
                      </ProjectContextMenu>
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

        {/* Bottom fixed links */}
        <div className="px-2 pb-4 border-t border-sidebar-border pt-2 flex-shrink-0 space-y-0.5">
          {[
            { path: '/favorites', Icon: Star, label: 'Favorites' },
            { path: '/settings', Icon: Settings, label: 'Settings' },
            { path: '/help', Icon: HelpCircle, label: 'Help' },
          ].map(({ path, Icon, label }) => (
            <Link
              key={path}
              to={path}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all"
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}
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