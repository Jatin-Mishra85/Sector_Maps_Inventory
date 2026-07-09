import { useState } from 'react';
import './InventoryGrid.css';
import InventoryCard from '../InventoryCard/InventoryCard';
import InventoryCardSkeleton from '../InventoryCardSkeleton/InventoryCardSkeleton';
import ImagePreview from '../ImagePreview/ImagePreview';
import EmptyState from '../../../../components/common/EmptyState/EmptyState';
import RetryState from '../../../../components/common/RetryState/RetryState';
import { useBookmarks } from '../../hooks/useBookmarks';

export default function InventoryGrid({ inventories, loading, error, onRetry }) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [previewInventory, setPreviewInventory] = useState(null);

  if (error) {
    return <RetryState message={error.message} onRetry={onRetry} />;
  }

  if (loading) {
    return (
      <div className="inv-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <InventoryCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!inventories.length) {
    return (
      <EmptyState
        title="No inventories found"
        description="Try adjusting your search or selecting a different developer."
      />
    );
  }

  return (
    <>
      <div className="inv-grid">
        {inventories.map((inv) => (
          <InventoryCard
            key={inv.id}
            inventory={inv}
            isBookmarked={isBookmarked(inv.id)}
            onToggleBookmark={toggleBookmark}
            onPreview={setPreviewInventory}
          />
        ))}
      </div>

      <ImagePreview
        isOpen={!!previewInventory}
        images={previewInventory ? [{ url: previewInventory.imageUrl, alt: previewInventory.name }] : []}
        onClose={() => setPreviewInventory(null)}
      />
    </>
  );
}