import { useState, useEffect } from 'react';

/**
 * Returns the current responsive breakpoint name.
 * xs:     320–374px  (small phones)
 * sm:     375–424px  (standard phones)
 * md:     425–767px  (large phones / phablets)
 * tablet: 768–1024px (iPad, Galaxy Tab, Mi Pad)
 * lg:     1025–1439px (laptop)
 * xl:     1440–1919px (desktop)
 * 2xl:    1920px+    (large desktop / 4K)
 */
function getBreakpoint(width) {
  if (width < 375) return 'xs';
  if (width < 425) return 'sm';
  if (width < 768) return 'md';
  if (width <= 1024) return 'tablet';
  if (width < 1440) return 'lg';
  if (width < 1920) return 'xl';
  return '2xl';
}

export function useBreakpoint() {
  const [bp, setBp] = useState(() => getBreakpoint(window.innerWidth));

  useEffect(() => {
    let raf;
    const handler = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setBp(getBreakpoint(window.innerWidth)));
    };
    window.addEventListener('resize', handler, { passive: true });
    return () => {
      window.removeEventListener('resize', handler);
      cancelAnimationFrame(raf);
    };
  }, []);

  return bp;
}

export function useIsMobile() {
  const bp = useBreakpoint();
  return bp === 'xs' || bp === 'sm' || bp === 'md';
}

export function useIsTablet() {
  return useBreakpoint() === 'tablet';
}

export function useIsDesktop() {
  const bp = useBreakpoint();
  return bp === 'lg' || bp === 'xl' || bp === '2xl';
}