import { useCallback, useEffect, useState } from 'react';
import { inventoryService } from '../services/inventoryService';
import { parseApiError } from '../../../services/errorHandler';
import { ALL_DEVELOPERS_ID } from '../../../constants/appConstants';

export function useInventories({ developerId, searchTerm, page = 1, limit = 12 }) {
  const [inventories, setInventories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInventories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit };
      if (developerId && developerId !== ALL_DEVELOPERS_ID) params.developerId = developerId;
      if (searchTerm) params.q = searchTerm;

      const data = await inventoryService.getAll(params);
      const items = Array.isArray(data) ? data : data?.items || [];
      setInventories(items);
      setTotal(Array.isArray(data) ? items.length : data?.total ?? items.length);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [developerId, searchTerm, page, limit]);

  useEffect(() => {
    fetchInventories();
  }, [fetchInventories]);

  return { inventories, total, loading, error, refetch: fetchInventories };
}