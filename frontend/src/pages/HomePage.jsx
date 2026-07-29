import { useState, useEffect } from 'react';
import './HomePage.css';
import SearchBar from '../features/search/components/SearchBar/SearchBar';
import { useSearch } from '../features/search/hooks/useSearch';
import GroupFilterChips from '../features/developer/components/GroupFilterChips/GroupFilterChips';
import { useGroups } from '../features/developer/hooks/useGroups';
import InventoryGrid from '../features/inventory/components/InventoryGrid/InventoryGrid';
import { useInventories } from '../features/inventory/hooks/useInventories';
import { ALL_DEVELOPERS_ID } from '../constants/appConstants';

export default function HomePage() {
  const { term, setTerm, debouncedTerm } = useSearch();
  const [selectedGroupId, setSelectedGroupId] = useState(ALL_DEVELOPERS_ID);
  const [savedOnly, setSavedOnly] = useState(false);

  const { groups, loading: groupsLoading } = useGroups();
  const {
    inventories,
    total,
    loading: inventoriesLoading,
    loadingMore: inventoriesLoadingMore,
    hasMore: inventoriesHasMore,
    loadMore: loadMoreInventories,
    error: inventoriesError,
    refetch,
  } = useInventories({
    developerId: selectedGroupId,
    searchTerm: debouncedTerm,
  });

  // Filter badalne pe (Saved <-> All <-> koi developer) scroll top pe reset
  // karo — warna purani scroll position ki wajah se infinite-scroll ka
  // sentinel turant viewport mein aa jaata hai aur saara data ek saath
  // load ho jaata hai.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedGroupId, savedOnly]);

  const handleSelectGroup = (id) => {
    setSavedOnly(false);
    setSelectedGroupId(id);
  };

  const handleToggleSaved = () => {
    setSavedOnly((v) => !v);
  };

  return (
    <div className="home-page">
      <section className="home-page__search-row">
        <SearchBar value={term} onChange={setTerm} />

        {!groupsLoading && (
          <GroupFilterChips
            developers={groups}
            selectedId={selectedGroupId}
            onSelect={handleSelectGroup}
            totalCount={total}
            savedOnly={savedOnly}
            onToggleSaved={handleToggleSaved}
          />
        )}
      </section>

      <InventoryGrid
        inventories={inventories}
        loading={inventoriesLoading}
        loadingMore={inventoriesLoadingMore}
        hasMore={inventoriesHasMore}
        onLoadMore={loadMoreInventories}
        error={inventoriesError}
        onRetry={refetch}
        savedOnly={savedOnly}
      />
    </div>
  );
}