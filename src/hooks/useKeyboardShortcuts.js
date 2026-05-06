import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const NAV_ROUTES = ['/', '/spends', '/subscriptions', '/payments', '/insights', '/calendar', '/tasks', '/diet', '/groceries'];

/**
 * Global keyboard shortcut handler.
 * onOpenAdd    — opens universal + menu
 * onToggleSidebar — toggles sidebar collapse
 * onOpenShortcuts — opens shortcuts overlay
 */
export default function useKeyboardShortcuts({ onOpenAdd, onToggleSidebar, onOpenShortcuts, searchRef }) {
  const navigate = useNavigate();

  const handler = useCallback((e) => {
    const isMac = navigator.platform.startsWith('Mac');
    const mod = isMac ? e.metaKey : e.ctrlKey;
    const tag = document.activeElement?.tagName?.toLowerCase();
    const inInput = ['input', 'textarea', 'select'].includes(tag) || document.activeElement?.isContentEditable;

    // ⌘Shift+N / Ctrl+Shift+N — open add menu (avoids Chrome new window)
    if (mod && e.shiftKey && e.key === 'N') {
      e.preventDefault();
      onOpenAdd?.();
      return;
    }

    // ⌘K / Ctrl+K — focus search
    if (mod && !e.shiftKey && e.key === 'k') {
      e.preventDefault();
      searchRef?.current?.focus();
      return;
    }

    // ⌘/ / Ctrl+/ — toggle sidebar
    if (mod && !e.shiftKey && e.key === '/') {
      e.preventDefault();
      onToggleSidebar?.();
      return;
    }

    // ⌘Shift+, / Ctrl+Shift+, — settings (avoids Chrome conflict)
    if (mod && e.shiftKey && e.key === '<') {
      e.preventDefault();
      navigate('/settings');
      return;
    }

    // ⌘Shift+? / Ctrl+Shift+? (Shift+/) — shortcuts overlay
    if (mod && e.shiftKey && e.key === '?') {
      e.preventDefault();
      onOpenShortcuts?.();
      return;
    }

    // ⌘Shift+1-9 / Ctrl+Shift+1-9 — navigate sidebar sections (avoids Chrome tab switching)
    if (mod && e.shiftKey && e.key >= '1' && e.key <= '9') {
      e.preventDefault();
      const idx = parseInt(e.key, 10) - 1;
      if (NAV_ROUTES[idx]) navigate(NAV_ROUTES[idx]);
      return;
    }

    // Skip all single-key shortcuts if user is typing in any input
    if (inInput) return;
  }, [onOpenAdd, onToggleSidebar, onOpenShortcuts, navigate, searchRef]);

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}