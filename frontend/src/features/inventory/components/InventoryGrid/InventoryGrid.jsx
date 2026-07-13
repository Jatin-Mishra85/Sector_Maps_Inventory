import { useEffect, useRef, useState } from 'react';
import './InventoryGrid.css';
import InventoryCard from '../InventoryCard/InventoryCard';
import InventoryCardSkeleton from '../InventoryCardSkeleton/InventoryCardSkeleton';
import ImagePreview from '../ImagePreview/ImagePreview';
import EditInventoryModal from '../EditInventoryModal/EditInventoryModal'; // TEMPORARY
import EmptyState from '../../../../components/common/EmptyState/EmptyState';
import RetryState from '../../../../components/common/RetryState/RetryState';
// TEMPORARILY DISABLED — BOOKMARK FEATURE
// Re-enable once login/authentication is added: uncomment this import
// and the useBookmarks() line below, and pass isBookmarked/onToggleBookmark
// back into <InventoryCard />.
// import { useBookmarks } from '../../hooks/useBookmarks';
import { inventoryService } from '../../services/inventoryService'; // TEMPORARY — for hard delete
import { useToast } from '../../../../context/ToastContext'; // TEMPORARY — for delete toasts
import { useGroups } from '../../../developer/hooks/useGroups'; // NEW — for Grouping multi-select dropdown

export default function InventoryGrid({
  inventories,
  loading,
  loadingMore, // INFINITE SCROLL
  hasMore, // INFINITE SCROLL
  onLoadMore, // INFINITE SCROLL
  error,
  onRetry,
}) {
  // const { isBookmarked, toggleBookmark } = useBookmarks(); // TEMPORARILY DISABLED
  const { showToast } = useToast(); // TEMPORARY
  const { groups } = useGroups(); // NEW — passed to EditInventoryModal's Grouping dropdown
  const [previewInventory, setPreviewInventory] = useState(null);
  const [editingInventory, setEditingInventory] = useState(null); // TEMPORARY
  const [localOverrides, setLocalOverrides] = useState({}); // TEMPORARY — id -> patched fields
  const [deletedIds, setDeletedIds] = useState(new Set()); // TEMPORARY — ids removed from view immediately

  // INFINITE SCROLL — watches an invisible div at the bottom of the grid.
  // As soon as it scrolls into view, load the next page (like Instagram
  // Reels). rootMargin gives it a head start so the next batch loads
  // slightly BEFORE the user hits the exact bottom, for a smooth feel.
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!onLoadMore) return undefined;
    const node = sentinelRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          onLoadMore();
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, loading, loadingMore]);

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
  // reflects changes without waiting for a full refetch. Also filters out
  // anything just hard-deleted. Safe to remove once editing/deleting move
  // into the real Admin Panel with its own data flow.
  const displayInventories = inventories
    .filter((inv) => !deletedIds.has(inv.id))
    .map((inv) => (localOverrides[inv.id] ? { ...inv, ...localOverrides[inv.id] } : inv));

  const handleUpdated = (updatedInventory) => {
    setLocalOverrides((prev) => ({ ...prev, [updatedInventory.id]: updatedInventory }));
  };

  // TEMPORARY — permanently (hard) deletes an inventory. Only for cleaning
  // up accidentally/wrongly entered data. Remove once the real Admin Panel
  // is built with a proper delete flow.
  const handleDelete = async (inventory) => {
    const confirmed = window.confirm(
      `"${inventory.name}" ko permanently delete karna hai?\n\nYe wapas nahi hoga — data hamesha ke liye chala jayega.`
    );
    if (!confirmed) return;

    try {
      await inventoryService.remove(inventory.id);
      setDeletedIds((prev) => new Set(prev).add(inventory.id));
      showToast(`"${inventory.name}" delete ho gaya.`, 'success');
    } catch {
      showToast('Delete nahi ho paya. Dobara try karo.', 'error');
    }
  };

  return (
    <>
      <div className="inv-grid">
        {displayInventories.map((inv) => (
          <InventoryCard
            key={inv.id}
            inventory={inv}
            // isBookmarked={isBookmarked(inv.id)} // TEMPORARILY DISABLED
            // onToggleBookmark={toggleBookmark} // TEMPORARILY DISABLED
            onPreview={setPreviewInventory}
            onEdit={setEditingInventory} // TEMPORARY
            onDelete={handleDelete} // TEMPORARY
          />
        ))}
      </div>

      {/* INFINITE SCROLL — invisible trigger + small loading text while next page fetches */}
      <div ref={sentinelRef} style={{ height: '1px' }} />
      {loadingMore && (
        <div className="inv-grid" style={{ marginTop: '12px' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <InventoryCardSkeleton key={`more-${i}`} />
          ))}
        </div>
      )}

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
        availableGroups={groups}
      />
    </>
  );
}