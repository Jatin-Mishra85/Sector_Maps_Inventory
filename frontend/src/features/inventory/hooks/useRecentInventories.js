import { useCallback, useEffect, useState } from 'react';
import { inventoryService } from '../services/inventoryService';
import { parseApiError } from '../../../services/errorHandler';

export function useRecentInventories(limit = 8) {
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getRecent({ limit });
      setRecent(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  return { recent, loading, error, refetch: fetchRecent };
}