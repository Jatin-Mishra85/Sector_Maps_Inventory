import { useCallback, useEffect, useRef, useState } from 'react';
import { inventoryService } from '../services/inventoryService';
import { parseApiError } from '../../../services/errorHandler';
import { ALL_DEVELOPERS_ID, ALL_TYPES_ID } from '../../../constants/appConstants';
import { ENV } from '../../../constants/env';

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;

  // Extract just the "/uploads/filename.ext" part, no matter what host
  // (old machine's IP, localhost, etc.) happens to be baked into the
  // stored value. This makes old backup data (saved with a different
  // machine's IP/hostname) work correctly on any new machine.
  const match = imageUrl.match(/\/uploads\/[^/?#]+/i);
  const path = match ? match[0] : imageUrl;

  if (/^https?:\/\//i.test(path)) return path; // fallback, shouldn't happen
  return `${ENV.STATIC_BASE_URL}${path}`;
}

// FIELD MAPPING NOTE:
// - "name"               -> item.inventoryName        -> shown as "Project" in the UI
// - "block"               -> item.block                -> shown as "Block" in the UI
// - "actualDeveloperName" -> item.inventoryDeveloperName -> shown as "Developer" in the UI
// - "developerName"       -> item.developerName (via ...item spread) -> shown as "Grouping" in the UI
//   (this is the OLD Developer concept — DeveloperId FK joined from the Developers table,
//   NOT the same as actualDeveloperName above. Kept as "developerName" internally on purpose,
//   only its UI label changed to "Grouping".)
function mapInventory(item) {
  return {
    ...item,
    id: item.inventoryId,
    name: item.inventoryName,
    block: item.block,
    actualDeveloperName: item.inventoryDeveloperName,
    groups: Array.isArray(item.groups) ? item.groups : [], // "Grouping" — array of {groupId, groupName} now
    googleMapsUrl: item.googleMapUrl,
    imageUrl: resolveImageUrl(item.imageUrl),
  };
}
// INFINITE SCROLL — accumulates pages instead of replacing them.
// When a searchTerm is present, hits the dedicated /search/inventories
// endpoint (matches Grouping, Sector, Project, Block, Developer —
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
          // Search mode — searches Grouping, Sector, Project, Block, Developer together.
          const params = { keyword: trimmedSearch, page: pageToFetch, limit };
          response = await inventoryService.search(params);
        } else {
          // Normal browse mode — developer chip filter applies here.
          const params = { page: pageToFetch, limit };
          if (developerId && developerId !== ALL_DEVELOPERS_ID) params.developerId = developerId;
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