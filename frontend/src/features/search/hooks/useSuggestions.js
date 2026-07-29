import { useEffect, useRef, useState } from 'react';
import { inventoryService } from '../../inventory/services/inventoryService';

export function useSuggestions(keyword, delay = 300) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fuzzy, setFuzzy] = useState(false); // NEW — true hai to "Did you mean" wale results hain
  const [searched, setSearched] = useState(false); // NEW — fetch complete hui ya nahi (not-found dikhane ke liye)
  const timerRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const trimmed = (keyword || '').trim();

    if (timerRef.current) clearTimeout(timerRef.current);

    if (!trimmed) {
      setSuggestions([]);
      setLoading(false);
      setFuzzy(false);
      setSearched(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      setSearched(false);
      try {
        const response = await inventoryService.suggest(trimmed);
        if (requestId !== requestIdRef.current) return;
        const payload = response?.data || {};
        setSuggestions(Array.isArray(payload.items) ? payload.items : []);
        setFuzzy(!!payload.fuzzy);
      } catch {
        if (requestId !== requestIdRef.current) return;
        setSuggestions([]);
        setFuzzy(false);
      } finally {
        if (requestId !== requestIdRef.current) return;
        setLoading(false);
        setSearched(true);
      }
    }, delay);

    return () => clearTimeout(timerRef.current);
  }, [keyword, delay]);

  return { suggestions, loading, fuzzy, searched };
}