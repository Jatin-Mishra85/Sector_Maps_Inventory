import { useCallback, useEffect, useState } from 'react';
import { developerService } from '../services/developerService';
import { parseApiError } from '../../../services/errorHandler';

export function useDevelopers() {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDevelopers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await developerService.getAllWithCounts();
      setDevelopers(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevelopers();
  }, [fetchDevelopers]);

  return { developers, loading, error, refetch: fetchDevelopers };
}