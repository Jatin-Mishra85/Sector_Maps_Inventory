import { useCallback, useEffect, useState } from 'react';
import { groupService } from '../services/groupService';
import { parseApiError } from '../../../services/errorHandler';

function mapGroup(item) {
  return {
    ...item,
    id: item.id,
    name: item.name,
    inventoryCount: item.inventoryCount,
  };
}

export function useGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await groupService.getAll();
      const payload = response?.data ?? {};
      const rawItems = Array.isArray(payload) ? payload : payload?.items || [];
      setGroups(rawItems.map(mapGroup));
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return { groups, loading, error, refetch: fetchGroups };
}