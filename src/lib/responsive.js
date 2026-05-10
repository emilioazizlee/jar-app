/**
 * Responsive breakpoint constants — JS mirror of the CSS/Tailwind system.
 * Use with useBreakpoint() hook in components.
 */
export const BREAKPOINTS = {
  'xs':     320,   // iPhone SE, small Android (320-374)
  'sm':     375,   // iPhone 12/13/14, standard phones (375-424)
  'md':     425,   // iPhone Pro Max, large Android (425-767)
  'tablet': 768,   // iPad, Galaxy Tab, Mi Pad (768-1024)
  'lg':     1025,  // MacBook Air, small laptops (1025-1439)
  'xl':     1440,  // MacBook Pro, standard monitors (1440-1919)
  '2xl':    1920,  // iMac, 4K monitors (1920+)
};

/**
 * Get responsive padding for main content area
 */
export function getContentPadding(breakpoint) {
  switch (breakpoint) {
    case 'xs':
    case 'sm':
    case 'md': return { padding: '12px 12px 120px' };
    case 'tablet': return { padding: '20px 20px 80px' };
    case 'lg': return { padding: '24px 32px 40px' };
    case 'xl':
    case '2xl': return { padding: '32px 48px 40px' };
    default: return { padding: '24px 32px 40px' };
  }
}

/**
 * Get responsive grid columns
 */
export function getGridCols(breakpoint) {
  switch (breakpoint) {
    case 'xs':
    case 'sm':
    case 'md': return 1;
    case 'tablet': return 2;
    case 'lg': return 3;
    case 'xl':
    case '2xl': return 4;
    default: return 3;
  }
}

/**
 * Get responsive font size for stat values
 */
export function getStatFontSize(breakpoint) {
  switch (breakpoint) {
    case 'xs':
    case 'sm': return '1.5rem';
    case 'md': return '1.75rem';
    case 'tablet': return '2rem';
    default: return '2.25rem';
  }
}

/**
 * Returns true if the breakpoint is considered mobile
 */
export function isMobileBreakpoint(bp) {
  return bp === 'xs' || bp === 'sm' || bp === 'md';
}

/**
 * Returns true if the breakpoint is tablet
 */
export function isTabletBreakpoint(bp) {
  return bp === 'tablet';
}

/**
 * Returns true if the breakpoint is desktop (any desktop size)
 */
export function isDesktopBreakpoint(bp) {
  return bp === 'lg' || bp === 'xl' || bp === '2xl';
}