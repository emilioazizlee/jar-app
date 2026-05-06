/**
 * ScrollableModal — drop-in replacement for DialogContent that enforces:
 * - sticky header at top
 * - scrollable middle section
 * - sticky footer (primary action) at bottom
 * - max-height 90vh mobile / 85vh desktop
 *
 * Usage:
 *   <ScrollableModal open={open} onClose={onClose} title="LOG SPEND" titleColor="secondary"
 *     footer={<Button onClick={save}>LOG SPEND</Button>}>
 *     {/* form body *\/}
 *   </ScrollableModal>
 */
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

export default function ScrollableModal({
  open,
  onClose,
  title,
  titleNode,       // if you want a custom title node instead of string
  titleColor = 'foreground',
  maxWidth = 'max-w-lg',
  footer,          // sticky bottom action(s)
  children,
  className = '',
}) {
  const titleColorClass = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    foreground: 'text-foreground',
    muted: 'text-muted-foreground',
  }[titleColor] || 'text-foreground';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={`
          bg-card border-border ${maxWidth} w-full p-0 gap-0
          flex flex-col
          rounded-none sm:rounded-xl
          h-full sm:h-auto
          max-h-[100dvh] sm:max-h-[85vh]
          ${className}
        `}
        style={{ overflow: 'hidden' }}
      >
        {/* Sticky header */}
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
          <DialogTitle className={`mono-header text-sm ${titleColorClass}`}>
            {titleNode || title}
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 pb-6 overscroll-contain">
          {children}
        </div>

        {/* Sticky footer */}
        {footer && (
          <div className="px-5 pt-3 pb-5 border-t border-border shrink-0 bg-card">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}