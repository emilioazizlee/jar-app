import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import UniversalAddButton from '../add/UniversalAddButton';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { startOfMonth, format } from 'date-fns';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';
import ShortcutsOverlay from '@/components/help/ShortcutsOverlay';
import ShortcutsTip from '@/components/help/ShortcutsTip';
import IOSInstallPrompt from '@/components/pwa/IOSInstallPrompt';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import NewUserOnboarding, { isOnboardingDone, markOnboardingDone } from '@/components/onboarding/NewUserOnboarding';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const SIDEBAR_PREF_KEY = 'jar_sidebar_collapsed';

export default function AppLayout() {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'xs' || breakpoint === 'sm' || breakpoint === 'md';
  const isTablet = breakpoint === 'tablet';
  const { user } = useCurrentUser();
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingDone());

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (window.innerWidth <= 1024) return true;
    return localStorage.getItem(SIDEBAR_PREF_KEY) === 'true';
  });
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const searchRef = useRef(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Auto-collapse on tablet
  useEffect(() => {
    if (isTablet) setCollapsed(true);
  }, [isTablet]);

  const handleToggleSidebar = useCallback(() => {
    if (isMobile) {
      setMobileDrawerOpen(d => !d);
    } else {
      setCollapsed(c => {
        const next = !c;
        if (!isTablet) localStorage.setItem(SIDEBAR_PREF_KEY, String(next));
        return next;
      });
    }
  }, [isMobile, isTablet]);

  // Close drawer on escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setMobileDrawerOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Cmd+Shift+H → home
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        navigate('/');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  useKeyboardShortcuts({
    onOpenAdd: useCallback(() => setAddOpen(true), []),
    onToggleSidebar: handleToggleSidebar,
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

  const mainPadding = isMobile ? '12px 12px 120px' : isTablet ? '20px 20px 80px' : '24px 32px 40px';

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <div className="flex overflow-hidden bg-background" style={{ height: '100dvh' }}>
        {/* Sidebar — tablet and desktop only */}
        {!isMobile && (
          <Sidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed(c => {
              const next = !c;
              if (!isTablet) localStorage.setItem(SIDEBAR_PREF_KEY, String(next));
              return next;
            })}
          />
        )}

        {/* Mobile drawer overlay */}
        {isMobile && mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Navigation menu">
            <div className="w-64 max-w-[80vw] h-full">
              <Sidebar collapsed={false} onToggle={() => setMobileDrawerOpen(false)} onMobileClose={() => setMobileDrawerOpen(false)} />
            </div>
            <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setMobileDrawerOpen(false)} aria-hidden="true" />
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <TopBar
            totalJars={totalJars}
            searchRef={searchRef}
            onOpenShortcuts={() => setShortcutsOpen(true)}
            onOpenAdd={() => setAddOpen(true)}
            onToggleSidebar={handleToggleSidebar}
          />
          <main
            id="main-content"
            className="flex-1 overflow-y-auto"
            style={{ padding: mainPadding }}
          >
            <Outlet />
          </main>
        </div>

        <UniversalAddButton externalOpen={addOpen} onExternalClose={() => setAddOpen(false)} />
        {isMobile && <BottomNav onOpenAdd={() => setAddOpen(true)} />}
        <ShortcutsOverlay open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
        <ShortcutsTip />
        <IOSInstallPrompt />

        {showOnboarding && user && (
          <NewUserOnboarding
            user={user}
            onDone={() => setShowOnboarding(false)}
          />
        )}
      </div>
    </>
  );
}