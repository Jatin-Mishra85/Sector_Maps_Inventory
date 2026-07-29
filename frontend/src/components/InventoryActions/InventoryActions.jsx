import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const REPORT_REASONS = ['Wrong info', 'Spam', 'Duplicate', 'Other'];

export function InventoryActionsSave({ inventoryId, isSaved, onToggleSave, onCloseMenu, onRequireLogin }) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const toggleSave = async (e) => {
    e.stopPropagation();
    if (!user) {
      onCloseMenu?.();
      onRequireLogin?.();
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      if (isSaved) {
        await fetch(`/api/v1/interactions/unsave/${inventoryId}`, { method: 'DELETE', credentials: 'include' });
        onToggleSave?.(inventoryId, false);
      } else {
        await fetch('/api/v1/interactions/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ inventoryId }),
        });
        onToggleSave?.(inventoryId, true);
      }
    } catch (err) {
      console.error('Save/unsave failed:', err);
    } finally {
      setSaving(false);
      onCloseMenu?.();
    }
  };

  return (
    <li>
      <button type="button" onClick={toggleSave} disabled={saving} role="menuitem">
        <svg viewBox="0 0 24 24" width="18" height="18" fill={isSaved ? 'currentColor' : 'none'} aria-hidden="true">
          <path
            d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
        {isSaved ? 'Saved' : 'Save'}
      </button>
    </li>
  );
}

export function InventoryActionsReport({ inventoryId, onCloseMenu, onRequireLogin }) {
  const { user } = useAuth();
  const [showReasons, setShowReasons] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [details, setDetails] = useState('');
  const [detailsError, setDetailsError] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);

  const handleReportClick = (e) => {
    e.stopPropagation();
    if (!user) {
      onCloseMenu?.();
      onRequireLogin?.();
      return;
    }
    setShowReasons(true);
  };

  const pickReason = (reason, e) => {
    e.stopPropagation();
    setSelectedReason(reason);
  };

  const submitReport = async (e) => {
    e.stopPropagation();
    const trimmed = details.trim();
    if (!trimmed) {
      setDetailsError(true);
      return;
    }
    setReporting(true);
    try {
      const res = await fetch('/api/v1/interactions/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ inventoryId, reason: selectedReason, details: trimmed }),
      });
      if (res.ok) setReported(true);
    } catch (err) {
      console.error('Report failed:', err);
    } finally {
      setReporting(false);
      setShowReasons(false);
      onCloseMenu?.();
    }
  };

  return (
    <li>
      {reported ? (
        <span className="inv-card__reported-label">Reported</span>
      ) : !showReasons ? (
        <button type="button" onClick={handleReportClick} role="menuitem">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
            <path
              d="M12 9v4m0 4h.01M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Report
        </button>
      ) : !selectedReason ? (
        <div className="inv-card__report-reasons" onClick={(e) => e.stopPropagation()}>
          {REPORT_REASONS.map((reason) => (
            <button key={reason} type="button" onClick={(e) => pickReason(reason, e)}>
              {reason}
            </button>
          ))}
        </div>
      ) : (
        <div className="inv-card__report-details" onClick={(e) => e.stopPropagation()}>
          <textarea
            value={details}
            onChange={(e) => {
              setDetails(e.target.value);
              if (detailsError) setDetailsError(false);
            }}
            placeholder="Kya galat hai, ye likhein..."
            maxLength={500}
            rows={3}
            required
          />
          {detailsError && <p className="inv-card__report-error">Please describe the issue.</p>}
          <div className="inv-card__report-actions">
            <button type="button" onClick={() => setSelectedReason(null)} disabled={reporting}>
              Back
            </button>
            <button type="button" onClick={submitReport} disabled={reporting}>
              {reporting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}