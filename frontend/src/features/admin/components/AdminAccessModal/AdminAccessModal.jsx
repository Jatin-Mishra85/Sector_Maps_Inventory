import { useState } from 'react';
import './AdminAccessModal.css';
import Input from '../../../../components/common/Input/Input';
import Button from '../../../../components/common/Button/Button';
import { useAdminAuth } from '../../../../context/AdminAuthContext';

// Shared admin-code gate, used before Add Inventory, Edit Inventory, and
// Delete Inventory.
//
// variant="page"    → inline/full-page look (AdminInventoryFormPage).
// variant="overlay" → modal look (default; used from InventoryGrid before
//                      resuming an Edit or Delete action).
export default function AdminAccessModal({ onSuccess, onCancel, variant = 'overlay' }) {
  const { verifyCode, isVerifying, error } = useAdminAuth();
  const [code, setCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    const success = await verifyCode(code.trim());
    if (success) {
      setCode('');
      onSuccess?.();
    }
  };

  const content = (
    <div className="admin-access__body">
      <h2 className="admin-access__title">Admin Access Required</h2>
      <p className="admin-access__hint">
        This action needs the admin code. Access lasts only for this
        browser session — it resets on refresh.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <Input
          type="password"
          label="Admin Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoFocus
        />

        {error && <p className="admin-access__error">{error}</p>}

        <div className="admin-access__actions">
          <Button
            type="submit"
            variant="primary"
            loading={isVerifying}
            disabled={isVerifying || !code.trim()}
          >
            Verify
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isVerifying}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );

  if (variant === 'page') {
    return <div className="admin-access admin-access--page">{content}</div>;
  }

  return (
    <div className="admin-access__overlay" role="presentation" onClick={onCancel}>
      <div
        className="admin-access admin-access--overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Admin access required"
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </div>
    </div>
  );
}