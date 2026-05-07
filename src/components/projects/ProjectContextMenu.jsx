import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import EditProjectModal from './EditProjectModal';

export default function ProjectContextMenu({ project, children, onMobileClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [menuPos, setMenuPos] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const longPressTimer = useRef(null);
  const containerRef = useRef(null);

  const openMenu = (e) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    setMenuPos({ x: rect ? rect.left + rect.width / 2 : e.clientX, y: rect ? rect.bottom : e.clientY });
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    openMenu(e);
  };

  const handleTouchStart = (e) => {
    longPressTimer.current = setTimeout(() => openMenu(e.touches[0]), 500);
  };
  const handleTouchEnd = () => clearTimeout(longPressTimer.current);
  const handleTouchMove = () => clearTimeout(longPressTimer.current);

  const closeMenu = () => setMenuPos(null);

  const handleOpen = () => { closeMenu(); navigate(`/project/${project.id}`); onMobileClose?.(); };
  const handleEdit = () => { closeMenu(); setShowEdit(true); };
  const handleArchive = async () => {
    closeMenu();
    await base44.entities.Project.update(project.id, { is_archived: !project.is_archived });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };
  const handleDelete = async () => {
    closeMenu();
    if (!window.confirm(`Delete project "${project.name}"? This cannot be undone.`)) return;
    await base44.entities.Project.delete(project.id);
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    navigate('/');
  };

  // Close menu on outside click
  useEffect(() => {
    if (!menuPos) return;
    const close = (e) => { if (!e.target.closest('[data-project-menu]')) closeMenu(); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuPos]);

  return (
    <>
      <div
        ref={containerRef}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        {children}
      </div>

      <AnimatePresence>
        {menuPos && (
          <>
            <div className="fixed inset-0 z-40" onClick={closeMenu} />
            <motion.div
              data-project-menu
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.12 }}
              className="fixed z-50 bg-card border border-border rounded-xl shadow-2xl overflow-hidden min-w-[160px]"
              style={{ left: Math.min(menuPos.x, window.innerWidth - 180), top: menuPos.y + 4 }}
            >
              {[
                { label: '→ Open', action: handleOpen, color: '' },
                { label: '✏️ Edit', action: handleEdit, color: '' },
                { label: project.is_archived ? '📤 Unarchive' : '📦 Archive', action: handleArchive, color: '' },
                { label: '🗑️ Delete', action: handleDelete, color: 'text-destructive' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`w-full text-left px-4 py-2.5 font-mono text-xs hover:bg-muted transition-colors ${item.color}`}
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {showEdit && (
        <EditProjectModal
          open={showEdit}
          onClose={() => setShowEdit(false)}
          project={project}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['project', project.id] });
          }}
        />
      )}
    </>
  );
}