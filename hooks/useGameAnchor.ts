'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export function useGameAnchor() {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const pathname = usePathname();

  const scrollToAndHighlight = useCallback((hash: string) => {
    if (!hash) return;
    const id = hash.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedId(id);
      setTimeout(() => setHighlightedId(null), 3000);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => scrollToAndHighlight(hash), 100);
    }
  }, [pathname, scrollToAndHighlight]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleHashChange = () => {
      scrollToAndHighlight(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [scrollToAndHighlight]);

  return { highlightedId };
}
