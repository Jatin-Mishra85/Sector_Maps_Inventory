import { memo, useEffect, useMemo, useRef, useState } from 'react';
import './InventoryCard.css';
import { downloadFile } from '../../../../utils/download';
import { shareContent } from '../../../../utils/share';
import { useToast } from '../../../../context/ToastContext';
import { InventoryActionsSave, InventoryActionsReport } from '../../../../components/InventoryActions/InventoryActions';

const PLACEHOLDER_IMAGES = Array.from(
  { length: 10 },
  (_, i) => `/placeholders/placeholder-${i + 1}.jpg`
);

function getPlaceholderUrl(id) {
  const str = String(id ?? '');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return PLACEHOLDER_IMAGES[Math.abs(hash) % PLACEHOLDER_IMAGES.length];
}

function formatUpdatedAgo(dateInput) {
  if (!dateInput) return null;
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return null;

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    const diffHours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));
    return `Updated ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }
  return `Updated ${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

function InventoryCard({
  inventory,
  onPreview,
  onEdit,
  onDelete,
  onAddPhoto,
  isSaved = false,
  onSaveToggle,
  selectable = false,
  isSelected = false,
  onRequireLogin,
  onToggleSelect,
}) {
  const { showToast } = useToast();
  const [imgError, setImgError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const [menuOpenUpward, setMenuOpenUpward] = useState(false);
  const menuRef = useRef(null);
  const dotsBtnRef = useRef(null);

  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [shareMenuStyle, setShareMenuStyle] = useState(null);
  const [shareMenuOpenUpward, setShareMenuOpenUpward] = useState(false);
  const shareMenuRef = useRef(null);
  const shareBtnRef = useRef(null);

  const {
    id,
    name,
    actualDeveloperName,
    sectorName,
    imageUrl,
    googleMapsUrl,
    city,
    updatedAt,
  } = inventory;

  const placeholderThumbUrl = useMemo(() => getPlaceholderUrl(id), [id]);

  const topLabel = sectorName || name || '';

  const middleParts = [actualDeveloperName, name].filter(Boolean);
  const middleLabel = city || (middleParts.length ? middleParts.join(', ') : sectorName || '');

  const updatedLabel = formatUpdatedAgo(updatedAt);

  const locationQuery = [name, actualDeveloperName, sectorName].filter(Boolean).join(', ');
  const hasLocation = Boolean(googleMapsUrl) || Boolean(locationQuery);

  const showPhotoPlaceholder = !imageUrl || imgError;

  useEffect(() => {
    if (!menuOpen && !shareMenuOpen) return undefined;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target)) setShareMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen, shareMenuOpen]);

  // Smart positioning for the 3-dot menu — runs on EVERY screen size now
  // (mobile included), so the menu is always a small anchored popover
  // right under the button, with the tail pointing at it.
  useEffect(() => {
    if (!menuOpen) {
      setMenuStyle(null);
      setMenuOpenUpward(false);
      return undefined;
    }
    const btn = dotsBtnRef.current;
    if (!btn) return undefined;

    const computePosition = () => {
      const rect = btn.getBoundingClientRect();
      const MENU_WIDTH = Math.min(210, window.innerWidth - 24);
      const MENU_HEIGHT_ESTIMATE = 280;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openUpward = spaceBelow < MENU_HEIGHT_ESTIMATE && spaceAbove > spaceBelow;

      const left = Math.min(
        Math.max(8, rect.right - MENU_WIDTH),
        window.innerWidth - MENU_WIDTH - 8
      );

      const buttonCenter = rect.left + rect.width / 2;
      const arrowLeft = Math.min(Math.max(buttonCenter - left, 16), MENU_WIDTH - 16);

      setMenuOpenUpward(openUpward);
      setMenuStyle({
        position: 'fixed',
        left,
        width: MENU_WIDTH,
        '--menu-arrow-left': `${arrowLeft}px`,
        ...(openUpward
          ? { bottom: window.innerHeight - rect.top + 10, top: 'auto' }
          : { top: rect.bottom + 10, bottom: 'auto' }),
      });
    };

    computePosition();
    window.addEventListener('resize', computePosition);
    window.addEventListener('scroll', computePosition, true);
    return () => {
      window.removeEventListener('resize', computePosition);
      window.removeEventListener('scroll', computePosition, true);
    };
  }, [menuOpen]);

  // Same idea for the standalone share button's dropdown — also runs on
  // every screen size now.
  useEffect(() => {
    if (!shareMenuOpen) {
      setShareMenuStyle(null);
      setShareMenuOpenUpward(false);
      return undefined;
    }
    const btn = shareBtnRef.current;
    if (!btn) return undefined;

    const computePosition = () => {
      const rect = btn.getBoundingClientRect();
      const MENU_WIDTH = Math.min(190, window.innerWidth - 24);
      const MENU_HEIGHT_ESTIMATE = 150;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openUpward = spaceBelow < MENU_HEIGHT_ESTIMATE && spaceAbove > spaceBelow;

      const left = Math.min(
        Math.max(8, rect.right - MENU_WIDTH),
        window.innerWidth - MENU_WIDTH - 8
      );

      const buttonCenter = rect.left + rect.width / 2;
      const arrowLeft = Math.min(Math.max(buttonCenter - left, 16), MENU_WIDTH - 16);

      setShareMenuOpenUpward(openUpward);
      setShareMenuStyle({
        position: 'fixed',
        left,
        width: MENU_WIDTH,
        '--menu-arrow-left': `${arrowLeft}px`,
        ...(openUpward
          ? { bottom: window.innerHeight - rect.top + 10, top: 'auto' }
          : { top: rect.bottom + 10, bottom: 'auto' }),
      });
    };

    computePosition();
    window.addEventListener('resize', computePosition);
    window.addEventListener('scroll', computePosition, true);
    return () => {
      window.removeEventListener('resize', computePosition);
      window.removeEventListener('scroll', computePosition, true);
    };
  }, [shareMenuOpen]);

  const handleDownload = async (e) => {
    e.stopPropagation();
    setMenuOpen(false);
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

  const handleShareLocation = async (e) => {
    e.stopPropagation();
    setShareMenuOpen(false);
    if (!hasLocation) {
      showToast('Is inventory ki location available nahi hai.', 'error');
      return;
    }
    const url =
      googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`;
    const result = await shareContent({ title: middleLabel || topLabel, url });
    if (result === 'copied') showToast('Location link clipboard mein copy ho gaya.', 'success');
    if (result === 'unsupported') showToast('Sharing is not supported on this device.', 'info');
  };

  const handleShareImage = async (e) => {
    e.stopPropagation();
    setShareMenuOpen(false);
    if (!imageUrl) {
      showToast('Is inventory ki koi image nahi hai.', 'error');
      return;
    }
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
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

  const handleSharePageLink = async (e) => {
    e.stopPropagation();
    setShareMenuOpen(false);
    const detailUrl = `${window.location.origin}/inventory/${id}`;
    const result = await shareContent({ title: middleLabel || topLabel, url: detailUrl });
    if (result === 'copied') showToast('Link clipboard mein copy ho gaya.', 'success');
    if (result === 'unsupported') showToast('Sharing is not supported on this device.', 'info');
  };

  const handleLocation = (e) => {
    e.stopPropagation();
    if (!hasLocation) return;
    const url =
      googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onEdit?.(inventory);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete?.(inventory);
  };

  const handlePreviewClick = (e) => {
    e?.stopPropagation();
    if (selectable) {
      onToggleSelect?.();
      return;
    }
    if (showPhotoPlaceholder) {
      onAddPhoto?.(inventory);
      return;
    }
    onPreview(inventory);
  };

  return (
    <article
      className={`inv-card${selectable ? ' inv-card--selectable' : ''}${isSelected ? ' inv-card--selected' : ''
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

      <div className="inv-card__body">
        <button
          type="button"
          className="inv-card__thumb"
          onClick={handlePreviewClick}
          aria-label={
            selectable
              ? `Toggle select ${middleLabel || topLabel || 'inventory'}`
              : showPhotoPlaceholder
                ? `Add photo for ${middleLabel || topLabel || 'inventory'}`
                : `Preview image of ${middleLabel || topLabel || 'inventory'}`
          }
        >
          {!showPhotoPlaceholder ? (
            <img
              src={placeholderThumbUrl}
              alt={middleLabel || topLabel || 'Inventory'}
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="inv-card__thumb-fallback" aria-hidden="true" />
          )}
        </button>

        <div className="inv-card__content">
          <div className="inv-card__header">
            {topLabel ? (
              <h3 className="inv-card__title" title={topLabel}>
                {topLabel}
              </h3>
            ) : (
              <span />
            )}

            {!selectable && (
              <div className="inv-card__header-actions">
                <div className="inv-card__share-wrap" ref={shareMenuRef}>
                  <button
                    type="button"
                    ref={shareBtnRef}
                    className="inv-card__share-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      setShareMenuOpen((open) => !open);
                    }}
                    aria-haspopup="true"
                    aria-expanded={shareMenuOpen}
                    aria-label={`Share ${middleLabel || topLabel || 'inventory'}`}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
                      <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2.2" />
                      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2.2" />
                      <circle cx="18" cy="19" r="2.8" stroke="currentColor" strokeWidth="2.2" />
                      <path d="M8.1 10.7 15.9 6.3M8.1 13.3l7.8 4.4" stroke="currentColor" strokeWidth="2.2" />
                    </svg>
                  </button>

                  {shareMenuOpen && (
                    <>
                      <div className="inv-card__menu-backdrop" onClick={() => setShareMenuOpen(false)} />
                      <ul
                        className={`inv-card__menu inv-card__share-menu${shareMenuOpenUpward ? ' inv-card__menu--arrow-bottom' : ''}`}
                        style={shareMenuStyle || undefined}
                        onClick={(e) => e.stopPropagation()}
                        role="menu"
                      >
                        <li>
                          <button
                            type="button"
                            onClick={handleShareLocation}
                            disabled={!hasLocation}
                            role="menuitem"
                          >
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                              <path
                                d="M12 21s7-6.2 7-11.2A7 7 0 0 0 5 9.8C5 14.8 12 21 12 21Z"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              />
                              <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.8" />
                            </svg>
                            Share location
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={handleShareImage}
                            disabled={!imageUrl}
                            role="menuitem"
                          >
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                              <rect
                                x="3.5"
                                y="5.5"
                                width="17"
                                height="13"
                                rx="2"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              />
                              <circle cx="8.5" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.6" />
                              <path
                                d="m5 16 4.5-4.5L12 14l3-3 4 4"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Share image
                          </button>
                        </li>
                        <li>
                          <button type="button" onClick={handleSharePageLink} role="menuitem">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                              <path
                                d="M9 15 15 9M10 6l1.4-1.4a4 4 0 0 1 5.7 5.7L15.7 11.7M14 18l-1.4 1.4a4 4 0 0 1-5.7-5.7L8.3 12.3"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                              />
                            </svg>
                            Share page link
                          </button>
                        </li>
                      </ul>
                    </>
                  )}
                </div>

                <div className="inv-card__menu-wrap" ref={menuRef}>
                  <button
                    type="button"
                    ref={dotsBtnRef}
                    className="inv-card__dots-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShareMenuOpen(false);
                      setMenuOpen((open) => !open);
                    }}
                    aria-haspopup="true"
                    aria-expanded={menuOpen}
                    aria-label={`More actions for ${middleLabel || topLabel || 'inventory'}`}
                  >
                    <svg viewBox="0 0 24 24" width="15" height="14" fill="none" aria-hidden="true">
                      <circle cx="12" cy="5" r="2.3" fill="#777" />
                      <circle cx="12" cy="12" r="2.3" fill="#777" />
                      <circle cx="12" cy="19" r="2.3" fill="#777" />
                    </svg>
                  </button>

                  {menuOpen && (
                    <>
                      <div className="inv-card__menu-backdrop" onClick={() => setMenuOpen(false)} />
                      <ul
                        className={`inv-card__menu${menuOpenUpward ? ' inv-card__menu--arrow-bottom' : ''}`}
                        style={menuStyle || undefined}
                        onClick={(e) => e.stopPropagation()}
                        role="menu"
                      >
                        <InventoryActionsSave
                          inventoryId={id}
                          isSaved={isSaved}
                          onToggleSave={onSaveToggle}
                          onCloseMenu={() => setMenuOpen(false)}
                          onRequireLogin={onRequireLogin}
                        />
                        <li>
                          <button type="button" onClick={handleDownload} disabled={!imageUrl} role="menuitem">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                              <path
                                d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Download image
                          </button>
                        </li>
                        <li>
                          <button type="button" onClick={handleEditClick} role="menuitem">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                              <path
                                d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Edit
                          </button>
                        </li>
                        <InventoryActionsReport
                          inventoryId={id}
                          onCloseMenu={() => setMenuOpen(false)}
                          onRequireLogin={onRequireLogin}
                        />
                        <li>
                          <button
                            type="button"
                            className="inv-card__menu-danger"
                            onClick={handleDeleteClick}
                            role="menuitem"
                          >
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                              <path
                                d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.8 12a2 2 0 0 1-2 1.9H9.8a2 2 0 0 1-2-1.9L7 7h10ZM10 11v6M14 11v6"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Delete
                          </button>
                        </li>
                      </ul>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {middleLabel ? (
            <p className="inv-card__description" title={middleLabel}>
              {middleLabel}
            </p>
          ) : null}

          {updatedLabel && (
            <p className="inv-card__updated">
              <span className="inv-card__updated-dot" aria-hidden="true" />
              {updatedLabel}
            </p>
          )}

          {!selectable && (
            <div className="inv-card__pills">
              <button
                type="button"
                className="inv-card__pill"
                onClick={handlePreviewClick}
                aria-label={`Preview ${middleLabel || topLabel || 'inventory'}`}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                  <path
                    d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                Preview
              </button>

              <button
                type="button"
                className="inv-card__pill"
                onClick={handleLocation}
                disabled={!hasLocation}
                aria-disabled={!hasLocation}
                aria-label={
                  hasLocation
                    ? `View location of ${middleLabel || topLabel || 'inventory'}`
                    : 'Location not available'
                }
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                  <path
                    d="M12 21s7-6.2 7-11.2A7 7 0 0 0 5 9.8C5 14.8 12 21 12 21Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                Location
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default memo(InventoryCard);