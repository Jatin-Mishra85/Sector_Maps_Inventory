import { useCallback, useEffect, useState } from 'react';
import { groupService } from '../services/groupService';
import { parseApiError } from '../../../services/errorHandler';

function mapGroup(item) {
  return {
    ...item,
    id: item.GroupId,
    name: item.GroupName,
    inventoryCount: item.inventoryCount ?? 0, // backend abhi count nahi bhejta, default 0
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
      const response = await groupService.getAll(); // apiClient interceptor already unwraps .data
      const rawItems = Array.isArray(response) ? response : response?.items || [];
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