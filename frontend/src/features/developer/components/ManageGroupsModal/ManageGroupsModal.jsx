import { useState } from 'react';
import './ManageGroupsModal.css';
import { groupService } from '../../services/groupService';
import { useToast } from '../../../../context/ToastContext';

export default function ManageGroupsModal({ groups, onClose, onChanged }) {
  const { showToast } = useToast();
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [busyId, setBusyId] = useState(null);

  const startEdit = (group) => {
    setEditingId(group.id);
    setEditValue(group.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEdit = async (group) => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === group.name) {
      cancelEdit();
      return;
    }
    setBusyId(group.id);
    try {
      await groupService.renameGroup(group.id, trimmed);
      showToast(`Group "${group.name}" ka naam "${trimmed}" ho gaya.`, 'success');
      cancelEdit();
      onChanged();
    } catch {
      showToast('Rename nahi ho paya. Dobara try karo.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (group) => {
    const confirmed = window.confirm(
      `"${group.name}" group ko delete karna hai?\n\nIससे jude sabhi inventories is group se hat jayengi. Ye wapas nahi hoga.`
    );
    if (!confirmed) return;

    setBusyId(group.id);
    try {
      await groupService.deleteGroup(group.id);
      showToast(`Group "${group.name}" delete ho gaya.`, 'success');
      onChanged();
    } catch {
      showToast('Delete nahi ho paya. Dobara try karo.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="manage-groups-modal__overlay" onClick={onClose}>
      <div className="manage-groups-modal" onClick={(e) => e.stopPropagation()}>
        <div className="manage-groups-modal__header">
          <h2 className="manage-groups-modal__title">Manage Groups</h2>
          <button type="button" className="manage-groups-modal__close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="manage-groups-modal__list">
          {groups.length === 0 && (
            <p className="manage-groups-modal__empty">Koi group nahi bana hai.</p>
          )}

          {groups.map((group) => (
            <div className="manage-groups-modal__row" key={group.id}>
              {editingId === group.id ? (
                <>
                  <input
                    className="manage-groups-modal__edit-input"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    autoFocus
                    disabled={busyId === group.id}
                  />
                  <button
                    type="button"
                    className="manage-groups-modal__action-btn manage-groups-modal__action-btn--save"
                    onClick={() => saveEdit(group)}
                    disabled={busyId === group.id}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="manage-groups-modal__action-btn"
                    onClick={cancelEdit}
                    disabled={busyId === group.id}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className="manage-groups-modal__name">
                    {group.name}
                    {typeof group.inventoryCount === 'number' ? ` (${group.inventoryCount})` : ''}
                  </span>
                  <button
                    type="button"
                    className="manage-groups-modal__action-btn"
                    onClick={() => startEdit(group)}
                    disabled={busyId === group.id}
                    aria-label={`Edit ${group.name}`}
                  >
                    ✎ Edit
                  </button>
                  <button
                    type="button"
                    className="manage-groups-modal__action-btn manage-groups-modal__action-btn--danger"
                    onClick={() => handleDelete(group)}
                    disabled={busyId === group.id}
                    aria-label={`Delete ${group.name}`}
                  >
                    {busyId === group.id ? '...' : '🗑 Delete'}
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}