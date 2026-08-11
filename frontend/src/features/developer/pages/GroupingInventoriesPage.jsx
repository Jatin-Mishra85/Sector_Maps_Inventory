  import { useMemo, useState, useEffect } from 'react';
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
  import ManageGroupsModal from '../components/ManageGroupsModal/ManageGroupsModal';

  // NOTE: Admin-code gate REMOVED from this page on purpose — Grouping tab
  // ab bina admin code ke khulta hai. Only Delete still requires the code
  // (gated inside InventoryGrid.jsx).

  const FILTER_MODES = [
    { key: 'all', label: 'All' },
    { key: 'grouped', label: 'Grouped' },
    { key: 'ungrouped', label: 'Ungrouped' },
  ];

  export default function GroupingInventoriesPage() {
    const { showToast } = useToast();
    const { term, setTerm, debouncedTerm } = useSearch();
    const { groups, refetch: refetchGroups } = useGroups();

    const [groupNames, setGroupNames] = useState(['']);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [isSaving, setIsSaving] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    const [filterMode, setFilterMode] = useState('all');
    const [selectedGroupFilter, setSelectedGroupFilter] = useState(null);
    const [showManageGroups, setShowManageGroups] = useState(false);


    useEffect(() => {
      setSelectedIds(new Set());
    }, [debouncedTerm, filterMode]);

    const {
      inventories,
      loading,
      loadingMore,
      hasMore,
      loadMore,
      error,
      refetch: refetchInventories,
    } = useInventories({ searchTerm: debouncedTerm });

    const updateGroupName = (index, value) => {
      setGroupNames((prev) => prev.map((g, i) => (i === index ? value : g)));
    };

    const addGroupField = () => {
      setGroupNames((prev) => [...prev, '']);
    };

    const removeGroupField = (index) => {
      setGroupNames((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
    };

    const trimmedGroupNames = useMemo(() => {
      const seen = new Set();
      const result = [];
      groupNames.forEach((g) => {
        const t = g.trim();
        if (t && !seen.has(t.toUpperCase())) {
          seen.add(t.toUpperCase());
          result.push(t);
        }
      });
      return result;
    }, [groupNames]);



    const selectedInventoryObjs = useMemo(
    () => inventories.filter((inv) => selectedIds.has(inv.id)),
    [inventories, selectedIds]
  );

  const allSelectedAlreadyInAllGroups = useMemo(() => {
    if (!selectedInventoryObjs.length || !trimmedGroupNames.length) return false;
    const upperNames = trimmedGroupNames.map((n) => n.toUpperCase());
    return selectedInventoryObjs.every((inv) => {
      const invGroupNames = (inv.groups || []).map((g) => (g.groupName || '').toUpperCase());
      return upperNames.every((name) => invGroupNames.includes(name));
    });
  }, [selectedInventoryObjs, trimmedGroupNames]);

  const anySelectedInAnyGroup = useMemo(() => {
    if (!selectedInventoryObjs.length || !trimmedGroupNames.length) return false;
    const upperNames = trimmedGroupNames.map((n) => n.toUpperCase());
    return selectedInventoryObjs.some((inv) => {
      const invGroupNames = (inv.groups || []).map((g) => (g.groupName || '').toUpperCase());
      return upperNames.some((name) => invGroupNames.includes(name));
    });
  }, [selectedInventoryObjs, trimmedGroupNames]);
const canSave =
    trimmedGroupNames.length > 0 && selectedIds.size > 0 && !allSelectedAlreadyInAllGroups;
  const canRemove =
    trimmedGroupNames.length > 0 && selectedIds.size > 0 && anySelectedInAnyGroup;

    const displayedInventories = useMemo(() => {
      if (filterMode === 'ungrouped') {
        return inventories.filter((inv) => !(inv.groups && inv.groups.length > 0));
      }
      if (filterMode === 'grouped') {
        const groupedOnly = inventories.filter((inv) => inv.groups && inv.groups.length > 0);
        if (!selectedGroupFilter) return groupedOnly;
        const upperSelected = selectedGroupFilter.toUpperCase();
        return groupedOnly.filter((inv) =>
          (inv.groups || []).some((g) => (g.groupName || '').toUpperCase() === upperSelected)
        );
      }
      return inventories;
    }, [inventories, filterMode, selectedGroupFilter]);

    const handleFilterModeChange = (mode) => {
      setFilterMode(mode);
      if (mode !== 'grouped') setSelectedGroupFilter(null);
    };

    const allLoadedSelected =
      displayedInventories.length > 0 && displayedInventories.every((inv) => selectedIds.has(inv.id));

    const handleToggleSelectAll = () => {
      if (allLoadedSelected) {
        setSelectedIds(new Set());
      } else {
        setSelectedIds(new Set(displayedInventories.map((inv) => inv.id)));
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
        for (const name of trimmedGroupNames) {
          await groupService.addInventories(name, [...selectedIds]);
        }
        showToast(
          `${selectedIds.size} inventories ${trimmedGroupNames.length} group(s) [${trimmedGroupNames.join(', ')}] mein add ho gayi.`,
          'success'
        );
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
        `Selected inventories ko in group(s) se permanently hatana hai?\n\n${trimmedGroupNames.join(', ')}\n\nYe wapas nahi hoga.`
      );
      if (!confirmed) return;

      setIsRemoving(true);
      try {
        for (const name of trimmedGroupNames) {
          await groupService.removeInventories(name, [...selectedIds]);
        }
        showToast(
          `${selectedIds.size} inventories ${trimmedGroupNames.length} group(s) se hat gayi.`,
          'success'
        );
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

        <div className="grouping-page__filter-tabs">
          {FILTER_MODES.map((mode) => (
            <button
              key={mode.key}
              type="button"
              className={`grouping-page__filter-tab${filterMode === mode.key ? ' grouping-page__filter-tab--active' : ''}`}
              onClick={() => handleFilterModeChange(mode.key)}
            >
              {mode.label}
            </button>
          ))}
          <button
            type="button"
            className="grouping-page__filter-tab grouping-page__filter-tab--delete"
            onClick={() => setShowManageGroups(true)}
          >
            Delete
          </button>
        </div>

        {filterMode === 'grouped' && groups.length > 0 && (
          <div className="grouping-page__group-chips">
            <button
              type="button"
              className={`grouping-page__group-chip${!selectedGroupFilter ? ' grouping-page__group-chip--active' : ''}`}
              onClick={() => setSelectedGroupFilter(null)}
            >
              All Groups
            </button>
            {groups.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`grouping-page__group-chip${selectedGroupFilter === g.name ? ' grouping-page__group-chip--active' : ''}`}
                onClick={() => setSelectedGroupFilter(g.name)}
              >
                {g.name}
                {typeof g.inventoryCount === 'number' ? ` (${g.inventoryCount})` : ''}
              </button>
            ))}
          </div>
        )}

        <div className="grouping-page__group-inputs">
          {groupNames.map((name, index) => (
            <div className="grouping-page__group-input-row" key={index}>
              <GroupTypeInput
                value={name}
                onChange={(val) => updateGroupName(index, val)}
                availableGroups={groups}
              />
              {groupNames.length > 1 && (
                <button
                  type="button"
                  className="grouping-page__remove-group-field-btn"
                  onClick={() => removeGroupField(index)}
                  aria-label="Remove this group field"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" className="grouping-page__add-group-field-btn" onClick={addGroupField}>
            + Other Category
          </button>
        </div>

        {!loading && displayedInventories.length > 0 && (
          <div className="grouping-page__select-row">
            <button type="button" className="grouping-page__select-all-btn" onClick={handleToggleSelectAll}>
              {allLoadedSelected ? 'Deselect All' : 'Select All'}
            </button>
            <span className="grouping-page__selected-count">{selectedIds.size} selected</span>
          </div>
        )}

        {error && <p className="grouping-page__error">Inventories load nahi ho payi. Refresh try karo.</p>}

        <div className="grouping-page__grid">
          {loading && Array.from({ length: 8 }).map((_, i) => <InventoryCardSkeleton key={i} />)}

          {!loading &&
            displayedInventories.map((inv) => (
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

        {!loading && !displayedInventories.length && !error && (
          <p className="grouping-page__empty">
            {filterMode === 'grouped' && 'Is filter me koi grouped inventory nahi mili.'}
            {filterMode === 'ungrouped' && 'Sab inventories kisi na kisi group me hain.'}
            {filterMode === 'all' && 'Koi inventory nahi mili.'}
          </p>
        )}

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

        {showManageGroups && (
          <ManageGroupsModal
            groups={groups}
            onClose={() => setShowManageGroups(false)}
            onChanged={() => {
              refetchGroups();
              refetchInventories();
            }}
          />
        )}
      </div>
    );
  }