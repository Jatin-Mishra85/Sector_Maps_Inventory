import { useState } from 'react';
import './InventoryGrid.css';
import InventoryCard from '../InventoryCard/InventoryCard';
import InventoryCardSkeleton from '../InventoryCardSkeleton/InventoryCardSkeleton';
import ImagePreview from '../ImagePreview/ImagePreview';
import EditInventoryModal from '../EditInventoryModal/EditInventoryModal'; // TEMPORARY
import EmptyState from '../../../../components/common/EmptyState/EmptyState';
import RetryState from '../../../../components/common/RetryState/RetryState';
import { useBookmarks } from '../../hooks/useBookmarks';

export default function InventoryGrid({ inventories, loading, error, onRetry }) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [previewInventory, setPreviewInventory] = useState(null);
  const [editingInventory, setEditingInventory] = useState(null); // TEMPORARY
  const [localOverrides, setLocalOverrides] = useState({}); // TEMPORARY — id -> patched fields

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

  // TEMPORARY — merges edited fields into the list immediately, so the card
  // reflects changes without waiting for a full refetch. Safe to remove
  // once editing moves into the real Admin Panel with its own data flow.
  const displayInventories = inventories.map((inv) =>
    localOverrides[inv.id] ? { ...inv, ...localOverrides[inv.id] } : inv
  );

  const handleUpdated = (updatedInventory) => {
    setLocalOverrides((prev) => ({ ...prev, [updatedInventory.id]: updatedInventory }));
  };

  return (
    <>
      <div className="inv-grid">
        {displayInventories.map((inv) => (
          <InventoryCard
            key={inv.id}
            inventory={inv}
            isBookmarked={isBookmarked(inv.id)}
            onToggleBookmark={toggleBookmark}
            onPreview={setPreviewInventory}
            onEdit={setEditingInventory} // TEMPORARY
          />
        ))}
      </div>

      <ImagePreview
        isOpen={!!previewInventory}
        images={previewInventory ? [{ url: previewInventory.imageUrl, alt: previewInventory.name }] : []}
        onClose={() => setPreviewInventory(null)}
      />

      {/* TEMPORARY — remove this block along with EditInventoryModal import */}
      <EditInventoryModal
        inventory={editingInventory}
        isOpen={!!editingInventory}
        onClose={() => setEditingInventory(null)}
        onUpdated={handleUpdated}
      />
    </>
  );
}