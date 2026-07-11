import { useCallback, useEffect, useRef, useState } from 'react';
import { inventoryService } from '../services/inventoryService';
import { parseApiError } from '../../../services/errorHandler';
import { ALL_DEVELOPERS_ID, ALL_TYPES_ID } from '../../../constants/appConstants';
import { ENV } from '../../../constants/env';

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${ENV.STATIC_BASE_URL}${imageUrl}`;
}

function mapInventory(item) {
  return {
    ...item,
    id: item.inventoryId,
    name: item.inventoryName,
    type: item.inventoryType,
    googleMapsUrl: item.googleMapUrl,
    imageUrl: resolveImageUrl(item.imageUrl),
  };
}

// INFINITE SCROLL — accumulates pages instead of replacing them.
// When a searchTerm is present, hits the dedicated /search/inventories
// endpoint (matches Developer, Sector, Inventory Name, Inventory Type —
// all free-text fields). Otherwise uses the normal list endpoint with the
// developer chip filter.
export function useInventories({ developerId, type, searchTerm, limit = 12 }) {
  const [inventories, setInventories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const requestIdRef = useRef(0);
  const trimmedSearch = (searchTerm || '').trim();

  const fetchPage = useCallback(
    async (pageToFetch, { append }) => {
      const requestId = ++requestIdRef.current;
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      try {
        let response;

        if (trimmedSearch) {
          // Search mode — searches Developer, Sector, Inventory Name, Type together.
          const params = { keyword: trimmedSearch, page: pageToFetch, limit };
          if (type && type !== ALL_TYPES_ID) params.inventoryType = type;
          response = await inventoryService.search(params);
        } else {
          // Normal browse mode — developer chip filter applies here.
          const params = { page: pageToFetch, limit };
          if (developerId && developerId !== ALL_DEVELOPERS_ID) params.developerId = developerId;
          if (type && type !== ALL_TYPES_ID) params.type = type;
          response = await inventoryService.getAll(params);
        }

        const payload = response?.data ?? {};
        const rawItems = Array.isArray(payload) ? payload : payload?.items || [];
        const items = rawItems.map(mapInventory);

        if (requestId !== requestIdRef.current) return;

        setInventories((prev) => (append ? [...prev, ...items] : items));
        setTotal(payload?.pagination?.total ?? items.length);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(parseApiError(err));
      } finally {
        if (requestId !== requestIdRef.current) return;
        if (append) setLoadingMore(false);
        else setLoading(false);
      }
    },
    [developerId, type, trimmedSearch, limit]
  );

  useEffect(() => {
    setPage(1);
    fetchPage(1, { append: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [developerId, type, trimmedSearch, limit]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(nextPage, { append: true });
  }, [page, loading, loadingMore, fetchPage]);

  const hasMore = inventories.length < total;

  const refetch = useCallback(() => {
    setPage(1);
    fetchPage(1, { append: false });
  }, [fetchPage]);

  return { inventories, total, loading, loadingMore, hasMore, loadMore, error, refetch };
}