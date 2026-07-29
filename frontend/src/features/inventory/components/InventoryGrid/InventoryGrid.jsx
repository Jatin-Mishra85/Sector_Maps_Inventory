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
import { useAdminAuth } from '../../../../context/AdminAuthContext'; // Ab sirf DELETE ke liye use hota hai
import { useAuth } from '../../../../context/AuthContext';
import LoginModal from '../../../../components/LoginModal/LoginModal';
import AdminAccessModal from '../../../admin/components/AdminAccessModal/AdminAccessModal';



export default function InventoryGrid({
  inventories,
  loading,
  loadingMore, // INFINITE SCROLL
  hasMore, // INFINITE SCROLL
  onLoadMore, // INFINITE SCROLL
  error,
  onRetry,
   savedOnly,   // ← NAYA
}) {
  // const { isBookmarked, toggleBookmark } = useBookmarks(); // TEMPORARILY DISABLED
  const { showToast } = useToast(); // TEMPORARY
  const { groups } = useGroups(); // NEW — passed to EditInventoryModal's Grouping dropdown
  const { isAdminAuthenticated } = useAdminAuth(); // Ab sirf Delete gate ke liye
  const { user } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [previewInventory, setPreviewInventory] = useState(null);
  const [editingInventory, setEditingInventory] = useState(null); // TEMPORARY
  const [photoUploadInventory, setPhotoUploadInventory] = useState(null); // NEW — camera/photo-add flow
  const [localOverrides, setLocalOverrides] = useState({}); // TEMPORARY — id -> patched fields
  const [deletedIds, setDeletedIds] = useState(new Set()); // TEMPORARY — ids removed from view immediately
  // Ab sirf 'delete' ke liye use hota hai — Edit/Photo ab admin code nahi maangte
  const [pendingAdminAction, setPendingAdminAction] = useState(null);

  // INFINITE SCROLL — watches an invisible div at the bottom of the grid.
  // As soon as it scrolls into view, load the next page (like Instagram
  // Reels). rootMargin gives it a head start so the next batch loads
  // slightly BEFORE the user hits the exact bottom, for a smooth feel.
  const [savedIds, setSavedIds] = useState(new Set());

useEffect(() => {
  if (!user) {
    setSavedIds(new Set());
    return;
  }
  fetch('/api/v1/interactions/saved', { credentials: 'include' })
    .then((r) => r.json())
    .then((data) => setSavedIds(new Set(data.data || [])))
    .catch(() => {});
}, [user]);

const handleSaveToggle = (inventoryId, nowSaved) => {
  setSavedIds((prev) => {
    const next = new Set(prev);
    if (nowSaved) next.add(inventoryId);
    else next.delete(inventoryId);
    return next;
  });
};
  const sentinelRef = useRef(null);

  const hasMoreRef = useRef(hasMore);
  hasMoreRef.current = hasMore;
  const loadingRef = useRef(loading);
  loadingRef.current = loading;
  const loadingMoreRef = useRef(loadingMore);
  loadingMoreRef.current = loadingMore;
  const savedOnlyRef = useRef(savedOnly);
  savedOnlyRef.current = savedOnly;

  useEffect(() => {
    if (!onLoadMore) return undefined;
    const node = sentinelRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        // savedOnly mode mein "hasMore" backend ki poori (unfiltered) list
        // ke hisab se calculate hota hai, saved-filtered list ke hisab se
        // nahi — isliye is mode mein auto-loadMore band rakhna zaroori hai,
        // warna chhoti filtered list ki wajah se background mein saara
        // "All" data load ho jaata hai bina scroll kiye.
        if (
          entries[0].isIntersecting &&
          hasMoreRef.current &&
          !loadingRef.current &&
          !loadingMoreRef.current &&
          !savedOnlyRef.current
        ) {
          onLoadMore();
        }
      },
      { rootMargin: '100px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [onLoadMore]);

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
  .filter((inv) => !savedOnly || savedIds.has(inv.id))
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

  // CHANGED — Edit ab admin gate ke bina seedha chalta hai
  const handleEditRequest = (inventory) => {
    setEditingInventory(inventory);
  };

  // Delete abhi bhi admin code maangta hai
  const handleDeleteRequest = (inventory) => {
    if (isAdminAuthenticated) {
      handleDelete(inventory);
    } else {
      setPendingAdminAction({ type: 'delete', inventory });
    }
  };

  // CHANGED — Photo-add ab admin gate ke bina seedha chalta hai
  const handleAddPhotoRequest = (inventory) => {
    setPhotoUploadInventory(inventory);
  };

  const handleAdminAccessSuccess = () => {
    if (!pendingAdminAction) return;
    const { type, inventory } = pendingAdminAction;
    if (type === 'delete') {
      handleDelete(inventory);
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
  isSaved={savedIds.has(inv.id)}
  onSaveToggle={handleSaveToggle}
  onRequireLogin={() => setLoginModalOpen(true)}
  onPreview={setPreviewInventory}
  onEdit={handleEditRequest}
  onDelete={handleDeleteRequest}
  onAddPhoto={handleAddPhotoRequest}
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

      {/* Ab sirf Delete se pehle dikhta hai */}
      {pendingAdminAction && (
        <AdminAccessModal
          onSuccess={handleAdminAccessSuccess}
          onCancel={() => setPendingAdminAction(null)}
          
        />
        
      )}

<LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />

    </>
  );
}