import { useState } from 'react';
import './AdminInventoryFormPage.css';
import InventoryCard from '../../inventory/components/InventoryCard/InventoryCard';
import Button from '../../../components/common/Button/Button';
import { useBookmarks } from '../../inventory/hooks/useBookmarks';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { useGroups } from '../../developer/hooks/useGroups';
import DeveloperBatchInventoryForm from '../components/DeveloperBatchInventoryForm/DeveloperBatchInventoryForm';
import AdminAccessModal from '../components/AdminAccessModal/AdminAccessModal';

// Temporary standalone page — will be removed once the real Admin Panel exists.

const FORM_TYPES = [
  { id: 'developer-batch', label: 'Developer Batch (Bulk Projects)' },
];

export default function AdminInventoryFormPage() {
  const [createdInventory, setCreatedInventory] = useState(null);
  const [formType, setFormType] = useState('developer-batch');
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { isAdminAuthenticated } = useAdminAuth();
  const { groups } = useGroups();

  const handleAddAnother = () => setCreatedInventory(null);

  if (!isAdminAuthenticated) {
    return (
      <div className="admin-page">
        <AdminAccessModal variant="page" />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1 className="admin-page__title">
        {createdInventory ? 'Inventory Added' : 'Add Inventory'}
      </h1>

      {createdInventory ? (
        <div className="admin-page__result">
          <p className="admin-page__result-hint">
            Here's how it will appear to visitors:
          </p>
          <div className="admin-page__card-wrap">
            <InventoryCard
              inventory={createdInventory}
              isBookmarked={isBookmarked(createdInventory.id)}
              onToggleBookmark={toggleBookmark}
              onPreview={() => {}}
            />
          </div>
          <div className="admin-page__result-actions">
            <Button variant="primary" onClick={handleAddAnother}>
              Add Another Inventory
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="admin-page__type-select">
            <label htmlFor="admin-page-form-type" className="admin-page__type-select-label">
              Type
            </label>
            <select
              id="admin-page-form-type"
              className="admin-page__type-select-input"
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
            >
              {FORM_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {formType === 'developer-batch' && (
            <DeveloperBatchInventoryForm onSuccess={setCreatedInventory} />
          )}
        </>
      )}
    </div>
  );
}