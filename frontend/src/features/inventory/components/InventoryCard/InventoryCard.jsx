import { memo, useState } from 'react';
import './InventoryCard.css';
import InventoryTypeBadge from '../InventoryTypeBadge/InventoryTypeBadge';
import { inventoryService } from '../../services/inventoryService';
import { buildMapsLink } from '../../../../utils/mapsLink';
import { downloadFile } from '../../../../utils/download';
import { shareContent } from '../../../../utils/share';
import { useToast } from '../../../../context/ToastContext';

function InventoryCard({ inventory, isBookmarked, onToggleBookmark, onPreview }) {
  const { showToast } = useToast();
  const [imgError, setImgError] = useState(false);

  const {
    id,
    name,
    sectorName,
    developerName,
    type,
    imageUrl,
    latitude,
    longitude,
  } = inventory;

  const handleDownload = async () => {
    try {
      await downloadFile(inventoryService.getDownloadUrl(id), `${name}.pdf`);
    } catch {
      showToast('Unable to download this file right now.', 'error');
    }
  };

  const handleShare = async () => {
    const result = await shareContent({
      title: name,
      text: `${name} — ${developerName}, ${sectorName}`,
      url: window.location.href,
    });
    if (result === 'copied') showToast('Link copied to clipboard.', 'success');
    if (result === 'unsupported') showToast('Sharing is not supported on this device.', 'info');
  };

  const handleLocation = () => {
    if (!latitude || !longitude) {
      showToast('Location is not available for this inventory.', 'info');
      return;
    }
    window.open(buildMapsLink(latitude, longitude), '_blank', 'noopener,noreferrer');
  };

  return (
    <article className="inv-card">
      <button
        type="button"
        className="inv-card__image-wrap"
        onClick={() => onPreview(inventory)}
        aria-label={`Preview image of ${name}`}
      >
        {!imgError && imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="inv-card__image"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="inv-card__image-fallback" aria-hidden="true" />
        )}
        <div className="inv-card__badge-slot">
          <InventoryTypeBadge type={type} />
        </div>
      </button>

      <div className="inv-card__body">
        <h3 className="inv-card__title">{name}</h3>
        <p className="inv-card__meta">
          {sectorName} &middot; {developerName}
        </p>
      </div>

      <div className="inv-card__actions">
        <button
          type="button"
          className="inv-card__action-btn"
          onClick={handleDownload}
          aria-label={`Download brochure for ${name}`}
        >
          Download
        </button>
        <button
          type="button"
          className="inv-card__action-btn"
          onClick={handleShare}
          aria-label={`Share ${name}`}
        >
          Share
        </button>
        <button
          type="button"
          className="inv-card__action-btn"
          onClick={handleLocation}
          aria-label={`View location of ${name}`}
        >
          Location
        </button>
        <button
          type="button"
          className="inv-card__action-btn inv-card__bookmark"
          onClick={() => onToggleBookmark(id)}
          aria-pressed={isBookmarked}
          aria-label={isBookmarked ? `Remove ${name} from bookmarks` : `Bookmark ${name}`}
        >
          {isBookmarked ? '★ Saved' : '☆ Save'}
        </button>
      </div>
    </article>
  );
}

export default memo(InventoryCard);