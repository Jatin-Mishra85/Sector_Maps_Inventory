import { useCallback, useEffect, useState } from 'react';
import { developerService } from '../services/developerService';
import { parseApiError } from '../../../services/errorHandler';

function mapDeveloper(item) {
  return {
    ...item,
    id: item.developerId,
    name: item.developerName,
  };
}

export function useDevelopers() {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDevelopers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await developerService.getAllWithCounts();
      const payload = response?.data ?? {};
      const rawItems = Array.isArray(payload) ? payload : payload?.items || [];
      setDevelopers(rawItems.map(mapDeveloper));
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