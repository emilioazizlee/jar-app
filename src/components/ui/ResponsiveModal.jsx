import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useIsMobile, useIsTablet } from '@/hooks/useBreakpoint';

/**
 * ResponsiveModal — unified modal that:
 * - Mobile: slides up from bottom as a sheet (swipe-down to dismiss)
 * - Tablet: 80% width centered
 * - Desktop: 600px centered
 *
 * Props:
 *   open: boolean
 *   onClose: () => void
 *   title: string
 *   children: ReactNode
 *   maxWidth?: number (desktop override)
 *   noPadding?: boolean
 */
export default function ResponsiveModal({ open, onClose, title, children, maxWidth = 600, noPadding = false }) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const startY = useRef(null);
  const sheetRef = useRef(null);

  // Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && open) onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Swipe down to close on mobile
  const handleTouchStart = (e) => { startY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e) => {
    if (startY.current === null) return;
    const delta = e.changedTouches[0].clientY - startY.current;
    if (delta > 80) onClose();
    startY.current = null;
  };

  const mobilVariants = {
    hidden: { y: '100%' },
    visible: { y: 0 },
    exit: { y: '100%' },
  };

  const centeredVariants = {
    hidden: { opacity: 0, scale: 0.96, y: 12 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.96, y: 12 },
  };

  const contentMaxWidth = isTablet ? '80vw' : maxWidth;

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex"
          style={{ alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center' }}
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet / Modal */}
          <motion.div
            ref={sheetRef}
            variants={isMobile ? mobilVariants : centeredVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={isMobile
              ? { type: 'spring', damping: 28, stiffness: 300 }
              : { type: 'spring', damping: 30, stiffness: 350 }
            }
            onTouchStart={isMobile ? handleTouchStart : undefined}
            onTouchEnd={isMobile ? handleTouchEnd : undefined}
            style={{
              position: 'relative',
              width: isMobile ? '100%' : contentMaxWidth,
              maxWidth: isMobile ? '100%' : contentMaxWidth,
              maxHeight: isMobile ? '92dvh' : '90dvh',
              background: '#111',
              border: '1px solid #2a2a2a',
              borderRadius: isMobile ? '20px 20px 0 0' : 16,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Drag handle on mobile */}
            {isMobile && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px', flexShrink: 0 }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
              </div>
            )}

            {/* Header */}
            {title && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 12px', borderBottom: '1px solid #1f1f1f', flexShrink: 0 }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: '#fff' }}>{title}</p>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="touch-target"
                  style={{ borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: noPadding ? 0 : '16px 20px 20px' }}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}