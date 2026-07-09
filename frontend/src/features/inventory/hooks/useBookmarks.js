import { useCallback, useEffect, useState } from 'react';
import { BOOKMARK_STORAGE_KEY } from '../../../constants/appConstants';

function readStoredIds() {
  try {
    const raw = localStorage.getItem(BOOKMARK_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useBookmarks() {
  const [bookmarkedIds, setBookmarkedIds] = useState(() => readStoredIds());

  useEffect(() => {
    localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  const isBookmarked = useCallback((id) => bookmarkedIds.includes(id), [bookmarkedIds]);

  const toggleBookmark = useCallback((id) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  return { isBookmarked, toggleBookmark };
}