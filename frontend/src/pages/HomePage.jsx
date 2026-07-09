import { useState } from 'react';
import './HomePage.css';
import SearchBar from '../features/search/components/SearchBar/SearchBar';
import { useSearch } from '../features/search/hooks/useSearch';
import RecentSection from '../features/inventory/components/RecentSection/RecentSection';
import DeveloperFilterChips from '../features/developer/components/DeveloperFilterChips/DeveloperFilterChips';
import { useDevelopers } from '../features/developer/hooks/useDevelopers';
import InventoryGrid from '../features/inventory/components/InventoryGrid/InventoryGrid';
import { useInventories } from '../features/inventory/hooks/useInventories';
import { ALL_DEVELOPERS_ID } from '../constants/appConstants';

export default function HomePage() {
  const { term, setTerm, debouncedTerm } = useSearch();
  const [selectedDeveloperId, setSelectedDeveloperId] = useState(ALL_DEVELOPERS_ID);

  const { developers, loading: developersLoading } = useDevelopers();
  const {
    inventories,
    total,
    loading: inventoriesLoading,
    error: inventoriesError,
    refetch,
  } = useInventories({ developerId: selectedDeveloperId, searchTerm: debouncedTerm });

  return (
    <div className="home-page">
      <section className="home-page__search">
        <SearchBar value={term} onChange={setTerm} />
      </section>

      <RecentSection />

      {!developersLoading && (
        <DeveloperFilterChips
          developers={developers}
          selectedId={selectedDeveloperId}
          onSelect={setSelectedDeveloperId}
          totalCount={total}
        />
      )}

      <InventoryGrid
        inventories={inventories}
        loading={inventoriesLoading}
        error={inventoriesError}
        onRetry={refetch}
      />
    </div>
  );
}