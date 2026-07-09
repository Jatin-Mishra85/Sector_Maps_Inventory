import { useCallback, useEffect, useState } from 'react';
import { sectorService } from '../services/sectorService';
import { parseApiError } from '../../../services/errorHandler';

export function useSectorsByDeveloper(developerId) {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSectors = useCallback(async () => {
    if (!developerId) {
      setSectors([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await sectorService.getByDeveloper(developerId);
      setSectors(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      setError(parseApiError(err));
      setSectors([]);
    } finally {
      setLoading(false);
    }
  }, [developerId]);

  useEffect(() => {
    fetchSectors();
  }, [fetchSectors]);

  return { sectors, loading, error, refetch: fetchSectors };
}