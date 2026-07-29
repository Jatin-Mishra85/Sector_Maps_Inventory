import { useState } from 'react';

const REPORT_REASONS = ['Wrong info', 'Spam', 'Duplicate', 'Other'];

export function InventoryActionsSave({ inventoryId, isSaved: initialSaved = false, onCloseMenu }) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);

  const toggleSave = async (e) => {
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    try {
      if (isSaved) {
        await fetch(`/api/v1/interactions/unsave/${inventoryId}`, { method: 'DELETE', credentials: 'include' });
        setIsSaved(false);
      } else {
        await fetch('/api/v1/interactions/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ inventoryId }),
        });
        setIsSaved(true);
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

export function InventoryActionsReport({ inventoryId, onCloseMenu }) {
  const [showReasons, setShowReasons] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);

  const submitReport = async (reason, e) => {
    e.stopPropagation();
    setReporting(true);
    try {
      const res = await fetch('/api/v1/interactions/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ inventoryId, reason }),
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
        <button type="button" onClick={(e) => { e.stopPropagation(); setShowReasons(true); }} role="menuitem">
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
      ) : (
        <div className="inv-card__report-reasons" onClick={(e) => e.stopPropagation()}>
          {REPORT_REASONS.map((reason) => (
            <button key={reason} type="button" onClick={(e) => submitReport(reason, e)} disabled={reporting}>
              {reason}
            </button>
          ))}
        </div>
      )}
    </li>
  );
}