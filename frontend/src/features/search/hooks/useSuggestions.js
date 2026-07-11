import { useEffect, useRef, useState } from 'react';
import { inventoryService } from '../../inventory/services/inventoryService';

export function useSuggestions(keyword, delay = 300) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const trimmed = (keyword || '').trim();

    if (timerRef.current) clearTimeout(timerRef.current);

    if (!trimmed) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      try {
        const response = await inventoryService.suggest(trimmed);
        if (requestId !== requestIdRef.current) return;
        setSuggestions(response?.data || []);
      } catch {
        if (requestId !== requestIdRef.current) return;
        setSuggestions([]);
      } finally {
        if (requestId !== requestIdRef.current) return;
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timerRef.current);
  }, [keyword, delay]);

  return { suggestions, loading };
}