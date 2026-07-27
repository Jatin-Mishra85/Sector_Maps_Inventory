import { useState } from 'react';
import './AdminInventoryFormPage.css';
import InventoryCard from '../../inventory/components/InventoryCard/InventoryCard';
import Button from '../../../components/common/Button/Button';
import { useBookmarks } from '../../inventory/hooks/useBookmarks';
import { useGroups } from '../../developer/hooks/useGroups';
import DeveloperBatchInventoryForm from '../components/DeveloperBatchInventoryForm/DeveloperBatchInventoryForm';

// Temporary standalone page — will be removed once the real Admin Panel exists.
// NOTE: Admin-code gate REMOVED from this page on purpose — Add Inventory
// ab bina admin code ke khulta hai. Only Delete still requires the code
// (gated inside InventoryGrid.jsx).

const FORM_TYPES = [
  { id: 'developer-batch', label: 'Developer Batch (Bulk Projects)' },
];

export default function AdminInventoryFormPage() {
  const [createdInventory, setCreatedInventory] = useState(null);
  const [formType, setFormType] = useState('developer-batch');
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { groups } = useGroups();

  const handleAddAnother = () => setCreatedInventory(null);

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