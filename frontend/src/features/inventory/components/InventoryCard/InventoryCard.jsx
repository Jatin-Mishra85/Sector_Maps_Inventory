import { memo, useState } from 'react';
import './InventoryCard.css';
import InventoryTypeBadge from '../InventoryTypeBadge/InventoryTypeBadge';
import { inventoryService } from '../../services/inventoryService';
import { downloadFile } from '../../../../utils/download';
import { shareContent } from '../../../../utils/share';
import { truncateText } from '../../../../utils/formatters';
import { useToast } from '../../../../context/ToastContext';

function InventoryCard({ inventory, /* isBookmarked, onToggleBookmark, */ onPreview, onEdit, onDelete }) {
  const { showToast } = useToast();
  const [imgError, setImgError] = useState(false);

  const {
    id,
    name,
    sectorName,
    developerName,
    type,
    imageUrl,
    description,
    googleMapsUrl,
  } = inventory;

  const hasLocation = Boolean(googleMapsUrl);

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      await downloadFile(inventoryService.getDownloadUrl(id), `${name}.pdf`);
    } catch {
      showToast('Unable to download this file right now.', 'error');
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const result = await shareContent({
      title: name,
      text: `${name} — ${developerName}, ${sectorName}`,
      url: window.location.href,
    });
    if (result === 'copied') showToast('Link copied to clipboard.', 'success');
    if (result === 'unsupported') showToast('Sharing is not supported on this device.', 'info');
  };

  const handleLocation = (e) => {
    e.stopPropagation();
    if (!hasLocation) return;
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
  };

  // TEMPORARILY DISABLED — BOOKMARK FEATURE
  // Re-enable once login/authentication is added to the system.
  // Just uncomment this function + the button block below.
  // const handleBookmarkClick = (e) => {
  //   e.stopPropagation();
  //   onToggleBookmark(id);
  // };

  // TEMPORARY — remove this handler + the Edit button below once the
  // real Admin Panel replaces per-card editing.
  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit?.(inventory);
  };

  // TEMPORARY — remove this handler + the Delete button below once the
  // real Admin Panel replaces per-card deleting. This is only meant for
  // cleaning up accidentally/wrongly entered data.
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete?.(inventory);
  };

  return (
    <article className="inv-card">
      <button
        type="button"
        className="inv-card__thumb"
        onClick={() => onPreview(inventory)}
        aria-label={`Preview image of ${name}`}
      >
        {!imgError && imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="inv-card__thumb-fallback" aria-hidden="true" />
        )}
      </button>

      <div className="inv-card__content">
        <div className="inv-card__top">
          <h3 className="inv-card__title">{name}</h3>
          <div className="inv-card__top-actions">
            {/* TEMPORARY — remove this button when Admin Panel replaces it */}
            <button
              type="button"
              className="inv-card__edit-btn"
              onClick={handleEditClick}
              aria-label={`Edit ${name}`}
              title="Temporary: edit inventory data"
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

            {/* TEMPORARY — remove this button when Admin Panel replaces it.
                Hard-deletes the record permanently, only for fixing
                wrongly-entered data. */}
            <button
              type="button"
              className="inv-card__delete-btn"
              onClick={handleDeleteClick}
              aria-label={`Delete ${name}`}
              title="Temporary: permanently delete this inventory"
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

            {/* TEMPORARILY DISABLED — BOOKMARK FEATURE
                Re-enable once login/authentication is added.
                Just uncomment this whole button block + handleBookmarkClick above,
                and pass isBookmarked / onToggleBookmark props back in.
            <button
              type="button"
              className="inv-card__bookmark"
              onClick={handleBookmarkClick}
              aria-pressed={isBookmarked}
              aria-label={isBookmarked ? `Remove ${name} from bookmarks` : `Bookmark ${name}`}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path
                  d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-3.5L5 21V4.5a1 1 0 0 1 1-1Z"
                  fill={isBookmarked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            */}
          </div>
        </div>

        <div className="inv-card__badge-row">
          <InventoryTypeBadge type={type} />
        </div>

        <p className="inv-card__meta">
          {sectorName} &middot; {developerName}
        </p>

        {description ? (
          <p className="inv-card__description">{truncateText(description, 90)}</p>
        ) : null}

        <div className="inv-card__actions">
          <button
            type="button"
            className="inv-card__icon-btn"
            onClick={handleDownload}
            aria-label={`Download brochure for ${name}`}
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

          <button
            type="button"
            className="inv-card__icon-btn"
            onClick={handleShare}
            aria-label={`Share ${name}`}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <circle cx="18" cy="5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="6" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="18" cy="19" r="2.4" stroke="currentColor" strokeWidth="1.6" />
              <path d="M8.1 10.7 15.9 6.3M8.1 13.3l7.8 4.4" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>

          <button
            type="button"
            className="inv-card__icon-btn"
            onClick={handleLocation}
            disabled={!hasLocation}
            aria-disabled={!hasLocation}
            aria-label={hasLocation ? `View location of ${name}` : 'Location not available'}
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
      </div>
    </article>
  );
}

export default memo(InventoryCard);