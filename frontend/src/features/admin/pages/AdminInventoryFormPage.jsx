// import AdminInventoryForm from '../components/AdminInventoryForm/AdminInventoryForm';

// // Temporary standalone page — will be removed once the real Admin Panel exists.
// export default function AdminInventoryFormPage() {
//   return (
//     <div>
//       <h1 style={{ textAlign: 'center', marginBottom: 'var(--space-6)', fontFamily: 'var(--font-heading)' }}>
//         Add Inventory
//       </h1>
//       <AdminInventoryForm />
//     </div>
//   );
// }





import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminInventoryFormPage.css';
import AdminInventoryForm from '../components/AdminInventoryForm/AdminInventoryForm';
import InventoryCard from '../../inventory/components/InventoryCard/InventoryCard';
import Button from '../../../components/common/Button/Button';
import { useBookmarks } from '../../inventory/hooks/useBookmarks';
import { useSiteGate } from '../../../hooks/useSiteGate';

// Temporary standalone page — will be removed once the real Admin Panel exists.
export default function AdminInventoryFormPage() {
  const [createdInventory, setCreatedInventory] = useState(null);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { isUnlocked, unlock } = useSiteGate();
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
          <AdminInventoryForm onSuccess={setCreatedInventory} />
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