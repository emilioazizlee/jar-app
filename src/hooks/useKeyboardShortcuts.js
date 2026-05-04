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

    // ⌘N / Ctrl+N — open add menu
    if (mod && e.key === 'n') {
      e.preventDefault();
      onOpenAdd?.();
      return;
    }

    // ⌘K / Ctrl+K — focus search
    if (mod && e.key === 'k') {
      e.preventDefault();
      searchRef?.current?.focus();
      return;
    }

    // ⌘/ / Ctrl+/ — toggle sidebar
    if (mod && e.key === '/') {
      e.preventDefault();
      onToggleSidebar?.();
      return;
    }

    // ⌘, / Ctrl+, — settings
    if (mod && e.key === ',') {
      e.preventDefault();
      navigate('/settings');
      return;
    }

    // ⌘? / Ctrl+? (Shift+/) — shortcuts overlay
    if (mod && e.shiftKey && e.key === '/') {
      e.preventDefault();
      onOpenShortcuts?.();
      return;
    }

    // ⌘1-9 / Ctrl+1-9 — navigate sidebar sections
    if (mod && e.key >= '1' && e.key <= '9') {
      e.preventDefault();
      const idx = parseInt(e.key, 10) - 1;
      if (NAV_ROUTES[idx]) navigate(NAV_ROUTES[idx]);
      return;
    }

    // Skip rest if in input
    if (inInput) return;
  }, [onOpenAdd, onToggleSidebar, onOpenShortcuts, navigate, searchRef]);

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}