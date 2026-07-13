import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminInventoryFormPage.css';
import AdminInventoryForm from '../components/AdminInventoryForm/AdminInventoryForm';
import SectorBasedInventoryForm from '../components/SectorBasedInventoryForm/SectorBasedInventoryForm';
import SectorBlockImageForm from '../components/SectorBlockImageForm/SectorBlockImageForm';
import InventoryCard from '../../inventory/components/InventoryCard/InventoryCard';
import Button from '../../../components/common/Button/Button';
import { useBookmarks } from '../../inventory/hooks/useBookmarks';
import { useSiteGate } from '../../../hooks/useSiteGate';
import { useGroups } from '../../developer/hooks/useGroups';

// Temporary standalone page — will be removed once the real Admin Panel exists.

// Add more entries here as new form "types" get built later.
const FORM_TYPES = [
  { id: 'normal', label: 'Normal (Project + Block linked)' },
  { id: 'sector-based', label: 'Sector-based' },
  { id: 'sector-block-image', label: 'Sector + Block + Image' },
];

export default function AdminInventoryFormPage() {
  const [createdInventory, setCreatedInventory] = useState(null);
  const [formType, setFormType] = useState('normal');
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { isUnlocked, unlock } = useSiteGate();
  const { groups } = useGroups();
  const navigate = useNavigate();

  const handleAddAnother = () => setCreatedInventory(null);
  const handleFinish = () => {
    unlock();
    navigate('/');
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page__title">
        {createdInventory ? 'Inventory Added' : 'Add Inventory'}
      </h1>

      {!isUnlocked && (
        <p className="admin-page__gate-hint">
          The website is hidden from visitors while you add inventories. Click
          "Finish &amp; View Website" below once you're done adding data.
        </p>
      )}

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
            <Button variant="secondary" onClick={handleFinish}>
              Finish &amp; View Website
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Type selector — dropdown at the top, form below switches with it */}
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

          {formType === 'normal' && (
            <AdminInventoryForm onSuccess={setCreatedInventory} availableGroups={groups} />
          )}
          {formType === 'sector-based' && (
            <SectorBasedInventoryForm onSuccess={setCreatedInventory} availableGroups={groups} />
          )}
          {formType === 'sector-block-image' && (
            <SectorBlockImageForm onSuccess={setCreatedInventory} />
          )}

          {!isUnlocked && (
            <div className="admin-page__finish-early">
              <Button variant="ghost" onClick={handleFinish}>
                Skip for now &amp; view website
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}