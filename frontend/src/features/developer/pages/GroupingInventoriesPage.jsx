import { useMemo, useState } from 'react';
import './GroupingInventoriesPage.css';
import SearchBar from '../../search/components/SearchBar/SearchBar';
import { useSearch } from '../../search/hooks/useSearch';
import GroupTypeInput from '../components/GroupTypeInput/GroupTypeInput';
import InventoryCard from '../../inventory/components/InventoryCard/InventoryCard';
import InventoryCardSkeleton from '../../inventory/components/InventoryCardSkeleton/InventoryCardSkeleton';
import Button from '../../../components/common/Button/Button';
import { useGroups } from '../hooks/useGroups';
import { useInventories } from '../../inventory/hooks/useInventories';
import { groupService } from '../services/groupService';
import { useToast } from '../../../context/ToastContext';

export default function GroupingInventoriesPage() {
  const { showToast } = useToast();
  const { term, setTerm, debouncedTerm } = useSearch();
  const { groups, refetch: refetchGroups } = useGroups();

  const [groupName, setGroupName] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const {
    inventories,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    error,
    refetch: refetchInventories,
  } = useInventories({ searchTerm: debouncedTerm });

  const trimmedGroupName = groupName.trim();

  const membership = useMemo(() => {
    const upperGroupName = trimmedGroupName.toUpperCase();
    let anyInGroup = false;
    let anyNotInGroup = false;

    selectedIds.forEach((id) => {
      const inv = inventories.find((i) => i.id === id);
      if (!inv) return;
      const isMember = (inv.groups || []).some(
        (g) => (g.groupName || '').toUpperCase() === upperGroupName
      );
      if (isMember) anyInGroup = true;
      else anyNotInGroup = true;
    });

    return { anyInGroup, anyNotInGroup };
  }, [selectedIds, inventories, trimmedGroupName]);

  const canSave = trimmedGroupName.length > 0 && selectedIds.size > 0 && membership.anyNotInGroup;
  const canRemove = trimmedGroupName.length > 0 && selectedIds.size > 0 && membership.anyInGroup;

  // SELECT ALL / DESELECT ALL — operates on whatever is currently loaded
  // (via infinite scroll / "Load More"), not the full DB. If every loaded
  // card is already selected, the button flips to "Deselect All".
  const allLoadedSelected =
    inventories.length > 0 && inventories.every((inv) => selectedIds.has(inv.id));

  const handleToggleSelectAll = () => {
    if (allLoadedSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(inventories.map((inv) => inv.id)));
    }
  };

  const toggleSelect = (inventory) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(inventory.id)) next.delete(inventory.id);
      else next.add(inventory.id);
      return next;
    });
  };

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      const response = await groupService.addInventories(trimmedGroupName, [...selectedIds]);
      const addedCount = response?.data?.addedCount ?? 0;
      showToast(`${addedCount} inventories "${trimmedGroupName}" group mein add ho gayi.`, 'success');
      setSelectedIds(new Set());
      refetchGroups();
      refetchInventories();
    } catch {
      showToast('Save nahi ho paya. Dobara try karo.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!canRemove) return;
    const confirmed = window.confirm(
      `Selected inventories ko "${trimmedGroupName}" group se permanently hatana hai?\n\nYe wapas nahi hoga.`
    );
    if (!confirmed) return;

    setIsRemoving(true);
    try {
      const response = await groupService.removeInventories(trimmedGroupName, [...selectedIds]);
      const removedCount = response?.data?.removedCount ?? 0;
      showToast(`${removedCount} inventories "${trimmedGroupName}" group se hat gayi.`, 'success');
      setSelectedIds(new Set());
      refetchGroups();
      refetchInventories();
    } catch {
      showToast('Remove nahi ho paya. Dobara try karo.', 'error');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="grouping-page">
      <h1 className="grouping-page__title">Grouping Inventories</h1>

      <div className="grouping-page__search-row">
        <SearchBar value={term} onChange={setTerm} />
      </div>

      <GroupTypeInput value={groupName} onChange={setGroupName} availableGroups={groups} />

      {!loading && inventories.length > 0 && (
        <div className="grouping-page__select-row">
          <button
            type="button"
            className="grouping-page__select-all-btn"
            onClick={handleToggleSelectAll}
          >
            {allLoadedSelected ? 'Deselect All' : 'Select All'}
          </button>
          <span className="grouping-page__selected-count">
            {selectedIds.size} selected
          </span>
        </div>
      )}

      {error && <p className="grouping-page__error">Inventories load nahi ho payi. Refresh try karo.</p>}

      <div className="grouping-page__grid">
        {loading && Array.from({ length: 8 }).map((_, i) => <InventoryCardSkeleton key={i} />)}

        {!loading &&
          inventories.map((inv) => (
            <InventoryCard
              key={inv.id}
              inventory={inv}
              selectable
              isSelected={selectedIds.has(inv.id)}
              onToggleSelect={() => toggleSelect(inv)}
              onPreview={() => {}}
            />
          ))}
      </div>

      {!loading && hasMore && (
        <div className="grouping-page__load-more">
          <Button variant="secondary" onClick={loadMore} loading={loadingMore} disabled={loadingMore}>
            Load More
          </Button>
        </div>
      )}

      <footer className="grouping-page__footer">
        <button
          type="button"
          className={`grouping-page__save-btn${canSave ? ' grouping-page__save-btn--active' : ''}`}
          onClick={handleSave}
          disabled={!canSave || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          className={`grouping-page__remove-btn${canRemove ? ' grouping-page__remove-btn--active' : ''}`}
          onClick={handleRemove}
          disabled={!canRemove || isRemoving}
        >
          {isRemoving ? 'Removing...' : 'Remove'}
        </button>
      </footer>
    </div>
  );
}