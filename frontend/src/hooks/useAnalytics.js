import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useAnalytics() {
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', 'G-B9YVM658BC', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);
}