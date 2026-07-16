import { memo, useEffect, useRef, useState } from 'react';
import './InventoryCard.css';
import { downloadFile } from '../../../../utils/download';
import { shareContent } from '../../../../utils/share';
import { useToast } from '../../../../context/ToastContext';

function InventoryCard({
  inventory,
  onPreview,
  onEdit,
  onDelete,
  // NEW — selection mode, used by the "Grouping Inventories" page.
  selectable = false,
  isSelected = false,
  onToggleSelect,
}) {
  const { showToast } = useToast();
  const [imgError, setImgError] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef(null);

  const {
    id,
    name, // "Project"
    actualDeveloperName, // "Developer"
    sectorName,
    imageUrl,
    googleMapsUrl,
  } = inventory;

  // TOP LABEL — Sector normally. Agar iska Sector nahi hai, uski jagah
  // Project name dikhao.
  const topLabel = sectorName || name || '';

  // MIDDLE LABEL — "Developer, Project". Jo bhi field khaali hai wo drop
  // ho jayegi (Developer nahi hai to sirf Project, ya vice versa). Agar
  // DONO khaali hain (sirf Sector hai), to yahan bhi Sector hi dikhega —
  // taaki middle line kabhi poori tarah blank na ho jab kuch data hai.
  const middleParts = [actualDeveloperName, name].filter(Boolean);
  const middleLabel = middleParts.length ? middleParts.join(', ') : sectorName || '';

  // LOCATION — agar admin ne explicit Google Maps URL diya hai wahi use hoga,
  // warna Developer + Project + Sector se ek Maps search query ban jayegi.
  const locationQuery = [name, actualDeveloperName, sectorName].filter(Boolean).join(', ');
  const hasLocation = Boolean(googleMapsUrl) || Boolean(locationQuery);

  // Share dropdown ko bahar click karte hi band karo.
  useEffect(() => {
    if (!shareOpen) return undefined;
    const handleClickOutside = (e) => {
      if (shareRef.current && !shareRef.current.contains(e.target)) setShareOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [shareOpen]);

  // ---- Download: image seedha download hoti hai ----
  const handleDownload = async (e) => {
    e.stopPropagation();
    if (!imageUrl) {
      showToast('Is inventory ki koi image nahi hai.', 'error');
      return;
    }
    try {
      await downloadFile(imageUrl, `${topLabel || 'inventory'}.jpg`);
    } catch {
      showToast('Image download nahi ho payi. Dobara try karo.', 'error');
    }
  };

  // ---- Share: teen options — Image / Details / Link ----
  const handleShareImage = async (e) => {
    e.stopPropagation();
    setShareOpen(false);
    if (!imageUrl) {
      showToast('Is inventory ki koi image nahi hai.', 'error');
      return;
    }
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const file = new File([blob], `${topLabel || 'inventory'}.jpg`, {
        type: blob.type || 'image/jpeg',
      });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: middleLabel || topLabel });
      } else {
        await downloadFile(imageUrl, `${topLabel || 'inventory'}.jpg`);
        showToast('Is device par image share nahi ho sakti — download kar di gayi.', 'info');
      }
    } catch {
      showToast('Image share nahi ho payi. Dobara try karo.', 'error');
    }
  };

  const handleShareDetails = async (e) => {
    e.stopPropagation();
    setShareOpen(false);
    const detailsText = [actualDeveloperName, sectorName, name].filter(Boolean).join(' • ');
    const result = await shareContent({ title: middleLabel || topLabel, text: detailsText });
    if (result === 'copied') showToast('Details clipboard mein copy ho gayi.', 'success');
    if (result === 'unsupported') showToast('Sharing is not supported on this device.', 'info');
  };

  const handleShareUrl = async (e) => {
    e.stopPropagation();
    setShareOpen(false);
    // NOTE: /inventory/:id wala detail page abhi tak bana nahi hai —
    // URL yahan pehle se ready rakha hai jab wo page ban jaye.
    const detailUrl = `${window.location.origin}/inventory/${id}`;
    const result = await shareContent({ title: middleLabel || topLabel, url: detailUrl });
    if (result === 'copied') showToast('Link clipboard mein copy ho gaya.', 'success');
    if (result === 'unsupported') showToast('Sharing is not supported on this device.', 'info');
  };

  // ---- Location: Google Maps khulega ----
  const handleLocation = (e) => {
    e.stopPropagation();
    if (!hasLocation) return;
    const url =
      googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit?.(inventory);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete?.(inventory);
  };

  const handleThumbClick = () => {
    if (selectable) {
      onToggleSelect?.();
      return;
    }
    onPreview(inventory);
  };

  return (
    <article
      className={`inv-card${selectable ? ' inv-card--selectable' : ''}${
        isSelected ? ' inv-card--selected' : ''
      }`}
    >
      {selectable && (
        <label className="inv-card__select-checkbox" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect?.()}
            aria-label={`Select ${middleLabel || topLabel || 'inventory'}`}
          />
        </label>
      )}

      <button
        type="button"
        className="inv-card__thumb"
        onClick={handleThumbClick}
        aria-label={
          selectable
            ? `Toggle select ${middleLabel || topLabel || 'inventory'}`
            : `Preview image of ${middleLabel || topLabel || 'inventory'}`
        }
      >
        {!imgError && imageUrl ? (
          <img
            src={imageUrl}
            alt={middleLabel || topLabel || 'Inventory'}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="inv-card__thumb-fallback" aria-hidden="true" />
        )}
      </button>

      <div className="inv-card__content">
        {/* TOP — Sector (ya fallback Project name) + Edit/Delete */}
        <div className="inv-card__top">
          {topLabel ? <p className="inv-card__sector">{topLabel}</p> : <span />}

          {!selectable && (
            <div className="inv-card__top-actions">
              <button
                type="button"
                className="inv-card__icon-btn-sm"
                onClick={handleEditClick}
                aria-label={`Edit ${middleLabel || topLabel || 'inventory'}`}
                title="Edit inventory"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                  <path
                    d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <button
                type="button"
                className="inv-card__icon-btn-sm inv-card__icon-btn-sm--danger"
                onClick={handleDeleteClick}
                aria-label={`Delete ${middleLabel || topLabel || 'inventory'}`}
                title="Permanently delete this inventory"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                  <path
                    d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.8 12a2 2 0 0 1-2 1.9H9.8a2 2 0 0 1-2-1.9L7 7h10ZM10 11v6M14 11v6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* MIDDLE — Developer, Project (fallback rules apply) */}
        {middleLabel ? <h3 className="inv-card__title">{middleLabel}</h3> : null}

        {/* BOTTOM — Download / Share / Location */}
        {!selectable && (
          <div className="inv-card__actions">
            <button
              type="button"
              className="inv-card__action-btn"
              onClick={handleDownload}
              disabled={!imageUrl}
              aria-disabled={!imageUrl}
              aria-label={`Download image of ${middleLabel || topLabel || 'inventory'}`}
              title={imageUrl ? 'Download image' : 'No image available'}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                <path
                  d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div className="inv-card__share-wrap" ref={shareRef}>
              <button
                type="button"
                className="inv-card__action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShareOpen((open) => !open);
                }}
                aria-haspopup="true"
                aria-expanded={shareOpen}
                aria-label={`Share ${middleLabel || topLabel || 'inventory'}`}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                  <circle cx="18" cy="5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="6" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="18" cy="19" r="2.4" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M8.1 10.7 15.9 6.3M8.1 13.3l7.8 4.4" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </button>

              {shareOpen && (
                <ul className="inv-card__share-menu" onClick={(e) => e.stopPropagation()}>
                  <li>
                    <button type="button" onClick={handleShareImage} disabled={!imageUrl}>
                      Share Image
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={handleShareDetails}>
                      Share Details
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={handleShareUrl}>
                      Share Link
                    </button>
                  </li>
                </ul>
              )}
            </div>

            <button
              type="button"
              className="inv-card__action-btn"
              onClick={handleLocation}
              disabled={!hasLocation}
              aria-disabled={!hasLocation}
              aria-label={
                hasLocation
                  ? `View location of ${middleLabel || topLabel || 'inventory'}`
                  : 'Location not available'
              }
              title={hasLocation ? 'View on Google Maps' : 'Location not available'}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                <path
                  d="M12 21s7-6.2 7-11.2A7 7 0 0 0 5 9.8C5 14.8 12 21 12 21Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default memo(InventoryCard);