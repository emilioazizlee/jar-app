import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TypePickerModal from './TypePickerModal';

export default function UniversalAddButton({ externalOpen, onExternalClose }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (externalOpen) setOpen(true);
  }, [externalOpen]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleClose = () => {
    setOpen(false);
    if (onExternalClose) onExternalClose();
  };

  return (
    <>
      {/* Mobile floating button — sits above bottom nav */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed right-4 z-40 w-14 h-14 flex items-center justify-center md:hidden hollow-plus-mobile"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom) + 56px + 4px)',
        }}
        whileTap={{ scale: 0.92 }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7"
        >
          {/* Vertical bar */}
          <rect x="10.5" y="4" width="3" height="16" className="plus-bar" />
          {/* Horizontal bar */}
          <rect x="4" y="10.5" width="16" height="3" className="plus-bar" />
        </svg>
      </motion.button>

      {/* Desktop floating button — bare hollow plus icon */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed z-40 hidden md:flex items-center justify-center p-0 bg-transparent border-none cursor-pointer hollow-plus-desktop"
        style={{ bottom: 28, right: 32 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.85 }}
        title="New entry (Ctrl+Shift+N)"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7"
        >
          {/* Vertical bar */}
          <rect x="10.5" y="4" width="3" height="16" className="plus-bar" />
          {/* Horizontal bar */}
          <rect x="4" y="10.5" width="16" height="3" className="plus-bar" />
        </svg>
      </motion.button>

      <TypePickerModal open={open} onClose={handleClose} />

      <style jsx>{`
        /* Mobile Hollow Plus Button */
        .hollow-plus-mobile {
          background: transparent;
          border: none;
          cursor: pointer;
        }

        /* Mobile: Default state - hollow green outline + glow */
        .hollow-plus-mobile .plus-bar {
          fill: none;
          stroke: #abff4f;
          stroke-width: 3;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          filter: drop-shadow(0 0 8px rgba(171, 255, 79, 0.35));
        }

        /* Mobile: Hover - brighter green */
        .hollow-plus-mobile:hover .plus-bar {
          stroke: #d4ff8f;
          filter: drop-shadow(0 0 12px rgba(171, 255, 79, 0.5));
        }

        /* Mobile: Active/Press - solid green fill */
        .hollow-plus-mobile:active .plus-bar {
          fill: #abff4f;
          stroke: #abff4f;
        }

        /* Desktop Hollow Plus Button */
        .hollow-plus-desktop {
          background: transparent;
          border: none;
          cursor: pointer;
        }

        /* Desktop: Default state - hollow green outline */
        .hollow-plus-desktop .plus-bar {
          fill: none;
          stroke: #abff4f;
          stroke-width: 2.5;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Desktop: Hover - brighter green */
        .hollow-plus-desktop:hover .plus-bar {
          stroke: #d4ff8f;
        }

        /* Desktop: Active/Press - solid green fill */
        .hollow-plus-desktop:active .plus-bar {
          fill: #abff4f;
          stroke: #abff4f;
        }

        /* Focus states for accessibility */
        .hollow-plus-mobile:focus-visible,
        .hollow-plus-desktop:focus-visible {
          outline: 2px solid #abff4f;
          outline-offset: 4px;
          border-radius: 50%;
        }
      `}</style>
    </>
  );
}