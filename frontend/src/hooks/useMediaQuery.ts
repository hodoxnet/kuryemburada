import { useEffect, useState } from 'react';

/**
 * Responsive breakpoint'leri takip etmek için custom hook
 * @param query - Media query string (örn: '(max-width: 768px)')
 * @returns boolean - Query match durumu
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // SSR kontrolü
    if (typeof window === 'undefined') {
      return;
    }

    // İlk değeri ayarla
    const media = window.matchMedia(query);
    setMatches(media.matches);

    // Listener fonksiyonu
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern tarayıcılar için addEventListener kullan
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // Eski tarayıcılar için fallback
      media.addListener(listener);
    }

    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}

// Yaygın breakpoint'ler için hazır helper'lar
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');