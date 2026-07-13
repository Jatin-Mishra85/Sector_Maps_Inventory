import { useState } from 'react';
import './HomePage.css';
import SearchBar from '../features/search/components/SearchBar/SearchBar';
import { useSearch } from '../features/search/hooks/useSearch';
import DeveloperFilterChips from '../features/developer/components/DeveloperFilterChips/DeveloperFilterChips';
import { useGroups } from '../features/developer/hooks/useGroups';
import InventoryGrid from '../features/inventory/components/InventoryGrid/InventoryGrid';
import { useInventories } from '../features/inventory/hooks/useInventories';
import { ALL_DEVELOPERS_ID } from '../constants/appConstants';

export default function HomePage() {
  const { term, setTerm, debouncedTerm } = useSearch();
  const [selectedGroupId, setSelectedGroupId] = useState(ALL_DEVELOPERS_ID);

  const { groups, loading: groupsLoading } = useGroups();
  const {
    inventories,
    total,
    loading: inventoriesLoading,
    loadingMore: inventoriesLoadingMore, // INFINITE SCROLL
    hasMore: inventoriesHasMore, // INFINITE SCROLL
    loadMore: loadMoreInventories, // INFINITE SCROLL
    error: inventoriesError,
    refetch,
  } = useInventories({
    developerId: selectedGroupId,
    searchTerm: debouncedTerm,
  });

  return (
    <div className="home-page">
      <section className="home-page__search-row">
        <SearchBar value={term} onChange={setTerm} />

        {!groupsLoading && (
          <DeveloperFilterChips
            developers={groups}
            selectedId={selectedGroupId}
            onSelect={setSelectedGroupId}
            totalCount={total}
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
      />
    </div>
  );
}