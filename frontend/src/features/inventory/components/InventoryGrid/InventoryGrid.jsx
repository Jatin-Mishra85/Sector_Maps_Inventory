import { useEffect, useRef, useState } from 'react';
import './InventoryGrid.css';
import InventoryCard from '../InventoryCard/InventoryCard';
import InventoryCardSkeleton from '../InventoryCardSkeleton/InventoryCardSkeleton';
import ImagePreview from '../ImagePreview/ImagePreview';
import EditInventoryModal from '../EditInventoryModal/EditInventoryModal'; // TEMPORARY
import InventoryPhotoUploadModal from '../InventoryPhotoUploadModal/InventoryPhotoUploadModal'; // NEW
import EmptyState from '../../../../components/common/EmptyState/EmptyState';
import RetryState from '../../../../components/common/RetryState/RetryState';
import { inventoryService } from '../../services/inventoryService'; // TEMPORARY — for hard delete
import { useToast } from '../../../../context/ToastContext'; // TEMPORARY — for delete toasts
import { useGroups } from '../../../developer/hooks/useGroups'; // NEW — for Grouping multi-select dropdown
import { useAdminAuth } from '../../../../context/AdminAuthContext';
import { useAuth } from '../../../../context/AuthContext';
import LoginModal from '../../../../components/LoginModal/LoginModal';
import AdminAccessModal from '../../../admin/components/AdminAccessModal/AdminAccessModal';

// NEW — resolves relative /uploads/xxx.jpg paths from the API into full URLs.
// Uses VITE_API_BASE_URL so it automatically points to localhost:8080 in dev
// and to the Render backend in production — set both in .env.development
// and .env.production, no hardcoding needed here.
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
  const [pendingAdminAction, setPendingAdminAction] = useState(null);

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

  const displayInventories = inventories
    .filter((inv) => !deletedIds.has(inv.id))
    .filter((inv) => !savedOnly || savedIds.has(inv.id))
    .map((inv) => (localOverrides[inv.id] ? { ...inv, ...localOverrides[inv.id] } : inv));

  const handleUpdated = (updatedInventory) => {
    setLocalOverrides((prev) => ({ ...prev, [updatedInventory.id]: updatedInventory }));
  };

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

  const handleEditRequest = (inventory) => {
    setEditingInventory(inventory);
  };

  const handleDeleteRequest = (inventory) => {
    if (isAdminAuthenticated) {
      handleDelete(inventory);
    } else {
      setPendingAdminAction({ type: 'delete', inventory });
    }
  };

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

      {photoUploadInventory && (
        <InventoryPhotoUploadModal
          inventory={photoUploadInventory}
          onUploaded={handleUpdated}
          onClose={() => setPhotoUploadInventory(null)}
        />
      )}

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