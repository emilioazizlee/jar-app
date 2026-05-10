import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, DollarSign, RefreshCw, CreditCard, BarChart3,
  Calendar, CheckSquare, Apple, Heart, Settings, ShoppingBasket,
  ChevronLeft, ChevronRight, Plus, FolderOpen, Loader2, HelpCircle,
  Wallet, Martini, Star, GripVertical, Package,
} from 'lucide-react';
import { useIsDesktop } from '@/hooks/useBreakpoint';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DynIcon from '@/components/projects/DynIcon';
import NewProjectModal from '@/components/projects/NewProjectModal';
import ProjectContextMenu from '@/components/projects/ProjectContextMenu';
import { loadSidebarOrder, saveSidebarOrder } from '@/lib/sidebarOrder';

const NAV_KEYS = {
  '/': 'nav.dashboard',
  '/jars': 'nav.jars',
  '/spends': 'nav.dailySpends',
  '/subscriptions': 'nav.subscriptions',
  '/payments': 'nav.payments',
  '/finance': 'nav.finance',
  '/insights': 'nav.insights',
  '/calendar': 'nav.calendar',
  '/tasks': 'nav.tasks',
  '/diet': 'nav.diet',
  '/groceries': 'nav.groceries',
  '/health': 'nav.health',
  '/leisure': 'nav.leisure',
};

const NAV_ICONS = {
  '/': LayoutDashboard,
  '/jars': Package,
  '/spends': DollarSign,
  '/subscriptions': RefreshCw,
  '/payments': CreditCard,
  '/finance': Wallet,
  '/insights': BarChart3,
  '/calendar': Calendar,
  '/tasks': CheckSquare,
  '/diet': Apple,
  '/groceries': ShoppingBasket,
  '/health': Heart,
  '/leisure': Martini,
};

export default function Sidebar({ collapsed, onToggle, onMobileClose }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const [showNewProject, setShowNewProject] = useState(false);
  const [order, setOrder] = useState(() => loadSidebarOrder());
  const [dragging, setDragging] = useState(null); // { section, index }
  const [dragOver, setDragOver] = useState(null); // { section, index }
  const [crossSectionDrag, setCrossSectionDrag] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    return parseInt(localStorage.getItem('jar_sidebar_width') || '240');
  });
  const resizing = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);

  // Desktop sidebar resize
  const handleResizeMouseDown = (e) => {
    if (!isDesktop || collapsed) return;
    resizing.current = true;
    startX.current = e.clientX;
    startW.current = sidebarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!resizing.current) return;
      const delta = e.clientX - startX.current;
      const next = Math.max(200, Math.min(360, startW.current + delta));
      setSidebarWidth(next);
    };
    const onUp = () => {
      if (!resizing.current) return;
      resizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      localStorage.setItem('jar_sidebar_width', String(sidebarWidth));
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [sidebarWidth]);

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
    staleTime: 60000,
  });
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', currentUser?.email],
    queryFn: () => currentUser
      ? base44.entities.Project.filter({ created_by: currentUser.email }, 'created_date', 50).then(r => r.filter(p => !p.is_archived))
      : [],
    enabled: !!currentUser,
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
    { label: t('nav.tracking'), key: 'TRACKING' },
    { label: t('nav.life'), key: 'LIFE' },
  ];

  const targetWidth = collapsed ? 64 : (isDesktop ? sidebarWidth : 240);

  return (
    <>
      <motion.aside
        className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden z-30 relative"
        animate={{ width: targetWidth }}
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
                  const Icon = NAV_ICONS[path];
                  if (!Icon) return null;
                  const isActive = location.pathname === path;
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
                        {!collapsed && <span className="flex-1">{t(NAV_KEYS[path] || path)}</span>}
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

        {/* Resize handle — desktop only */}
        {isDesktop && !collapsed && (
          <div
            className="sidebar-resize-handle absolute right-0 top-0 bottom-0"
            onMouseDown={handleResizeMouseDown}
            title="Drag to resize"
          />
        )}

        {/* Bottom fixed links */}
        <div className="px-2 pb-4 border-t border-sidebar-border pt-2 flex-shrink-0 space-y-0.5">
          {[
            { path: '/favorites', Icon: Star, labelKey: 'nav.favorites' },
            { path: '/settings', Icon: Settings, labelKey: 'nav.settings' },
            { path: '/help', Icon: HelpCircle, labelKey: 'nav.help' },
          ].map(({ path, Icon, labelKey }) => (
            <Link
              key={path}
              to={path}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all"
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{t(labelKey)}</span>}
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