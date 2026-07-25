import { useEffect, useRef, useState } from 'react';
import './InventoryGrid.css';
import InventoryCard from '../InventoryCard/InventoryCard';
import InventoryCardSkeleton from '../InventoryCardSkeleton/InventoryCardSkeleton';
import ImagePreview from '../ImagePreview/ImagePreview';
import EditInventoryModal from '../EditInventoryModal/EditInventoryModal'; // TEMPORARY
import InventoryPhotoUploadModal from '../InventoryPhotoUploadModal/InventoryPhotoUploadModal'; // NEW
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
import { useAdminAuth } from '../../../../context/AdminAuthContext'; // NEW — gates Edit/Delete
import AdminAccessModal from '../../../admin/components/AdminAccessModal/AdminAccessModal'; // NEW

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
  const { isAdminAuthenticated } = useAdminAuth(); // NEW
  const [previewInventory, setPreviewInventory] = useState(null);
  const [editingInventory, setEditingInventory] = useState(null); // TEMPORARY
  const [photoUploadInventory, setPhotoUploadInventory] = useState(null); // NEW — camera/photo-add flow
  const [localOverrides, setLocalOverrides] = useState({}); // TEMPORARY — id -> patched fields
  const [deletedIds, setDeletedIds] = useState(new Set()); // TEMPORARY — ids removed from view immediately
  // NEW — { type: 'edit' | 'delete' | 'photo', inventory } while waiting on admin code verification
  const [pendingAdminAction, setPendingAdminAction] = useState(null);

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

  // NEW — Edit, Delete, aur Photo-add — teeno isi gate se guzarte hain. Agar
  // is session mein already authenticated hai to action seedha chal jaata
  // hai; warna `pendingAdminAction` mein park ho jaata hai jab tak admin
  // code verify nahi ho jaata.
  const handleEditRequest = (inventory) => {
    if (isAdminAuthenticated) {
      setEditingInventory(inventory);
    } else {
      setPendingAdminAction({ type: 'edit', inventory });
    }
  };

  const handleDeleteRequest = (inventory) => {
    if (isAdminAuthenticated) {
      handleDelete(inventory);
    } else {
      setPendingAdminAction({ type: 'delete', inventory });
    }
  };

  // NEW — InventoryCard ke "add photo" placeholder se aata hai.
  const handleAddPhotoRequest = (inventory) => {
    if (isAdminAuthenticated) {
      setPhotoUploadInventory(inventory);
    } else {
      setPendingAdminAction({ type: 'photo', inventory });
    }
  };

  const handleAdminAccessSuccess = () => {
    if (!pendingAdminAction) return;
    const { type, inventory } = pendingAdminAction;
    if (type === 'edit') {
      setEditingInventory(inventory);
    } else if (type === 'delete') {
      handleDelete(inventory);
    } else if (type === 'photo') {
      setPhotoUploadInventory(inventory);
    }
    setPendingAdminAction(null);
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
            onEdit={handleEditRequest} // CHANGED — gated behind admin auth
            onDelete={handleDeleteRequest} // CHANGED — gated behind admin auth
            onAddPhoto={handleAddPhotoRequest} // NEW — gated behind admin auth
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

      {/* NEW — camera-first photo capture flow for the placeholder click */}
      {photoUploadInventory && (
        <InventoryPhotoUploadModal
          inventory={photoUploadInventory}
          onUploaded={handleUpdated}
          onClose={() => setPhotoUploadInventory(null)}
        />
      )}

      {/* NEW — shown before Edit, Delete, or Photo-add runs, unless already authenticated this session */}
      {pendingAdminAction && (
        <AdminAccessModal
          onSuccess={handleAdminAccessSuccess}
          onCancel={() => setPendingAdminAction(null)}
        />
      )}
    </>
  );
}