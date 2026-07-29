import { memo, useEffect, useMemo, useRef, useState } from 'react';
import './InventoryCard.css';
import { downloadFile } from '../../../../utils/download';
import { shareContent } from '../../../../utils/share';
import { useToast } from '../../../../context/ToastContext';
import { InventoryActionsSave, InventoryActionsReport } from '../../../../components/InventoryActions/InventoryActions';

// TEMP — 10 placeholder images used for the card thumbnail only, so real
// property photos aren't shown on the listing grid yet. Preview mode still
// opens the ACTUAL image (see handlePreviewClick -> onPreview(inventory),
// which is untouched). To revert: delete this block + getPlaceholderUrl(),
// and change the thumb <img src={...}> back to {imageUrl}.
//
// Files must exist at: frontend/public/placeholders/placeholder-1.jpg ... placeholder-10.jpg
// (Vite serves anything in /public/ directly from the site root, no import needed.)
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

// "Updated X days/hours ago" — purely optional. Only renders if the
// inventory object actually carries an updatedAt/updatedAtISO field; older
// records without it simply don't show this row (no fabricated data).
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
  onAddPhoto, // NEW — placeholder click par photo-capture flow trigger karta hai
  // NEW — selection mode, used by the "Grouping Inventories" page.
  selectable = false,
  isSelected = false,
  onToggleSelect,
}) {
  const { showToast } = useToast();
  const [imgError, setImgError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null); // fixed-position coords, computed on open
  const menuRef = useRef(null);
  const dotsBtnRef = useRef(null);

  // Standalone share button + its own small dropdown (Share with details / Share link).
  // Lives OUTSIDE the 3-dot menu now — see header JSX below.
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [shareMenuStyle, setShareMenuStyle] = useState(null);
  const shareMenuRef = useRef(null);
  const shareBtnRef = useRef(null);

  const {
    id,
    name, // "Project"
    actualDeveloperName, // "Developer"
    sectorName,
    imageUrl,
    googleMapsUrl,
    city, // optional — only used if present on the record
    updatedAt, // optional — only used if present on the record
  } = inventory;

  // TEMP — same placeholder every render for a given card (based on id),
  // so it doesn't flicker/change on re-render.
  const placeholderThumbUrl = useMemo(() => getPlaceholderUrl(id), [id]);

  // TOP LABEL — Sector normally. Agar iska Sector nahi hai, uski jagah
  // Project name dikhao.
  const topLabel = sectorName || name || '';

  // SECONDARY LINE — city if we have it, otherwise fall back to the old
  // "Developer, Project" combo so nothing goes blank on existing data.
  const middleParts = [actualDeveloperName, name].filter(Boolean);
  const middleLabel = city || (middleParts.length ? middleParts.join(', ') : sectorName || '');

  const updatedLabel = formatUpdatedAgo(updatedAt);

  // LOCATION — agar admin ne explicit Google Maps URL diya hai wahi use hoga,
  // warna Developer + Project + Sector se ek Maps search query ban jayegi.
  const locationQuery = [name, actualDeveloperName, sectorName].filter(Boolean).join(', ');
  const hasLocation = Boolean(googleMapsUrl) || Boolean(locationQuery);

  // Image na ho ya load fail ho jaye to placeholder "add photo" mode mein chala jaata hai.
  // (Ye "no real image at all" wala case hai — is se PLACEHOLDER_IMAGES ka koi lena dena nahi,
  // wo sirf temp-display ke liye hai jab image EXIST karti hai.)
  const showPhotoPlaceholder = !imageUrl || imgError;

  // 3-dot menu aur share menu — dono ko bahar click karte hi band karo.
  useEffect(() => {
    if (!menuOpen && !shareMenuOpen) return undefined;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target)) setShareMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen, shareMenuOpen]);

  // Smart positioning — dropdown apne hi card par overlay na kare. Agar
  // neeche (viewport mein) space kam hai to menu UPAR khulega (previous
  // card ke upar), warna neeche (agle card ke upar) — jaisa position sahi
  // baithe waisa flip ho jaata hai. Mobile (<640px) par CSS bottom-sheet
  // sambhal leta hai, isliye wahan inline positioning skip.
  useEffect(() => {
    if (!menuOpen) {
      setMenuStyle(null);
      return undefined;
    }
    const isMobile = window.innerWidth < 640;
    if (isMobile) {
      setMenuStyle(null);
      return undefined;
    }
    const btn = dotsBtnRef.current;
    if (!btn) return undefined;

    const computePosition = () => {
      const rect = btn.getBoundingClientRect();
      const MENU_WIDTH = 210;
      const MENU_HEIGHT_ESTIMATE = 280; // bumped up — menu now has Save + Report too
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openUpward = spaceBelow < MENU_HEIGHT_ESTIMATE && spaceAbove > spaceBelow;

      const left = Math.min(
        Math.max(8, rect.right - MENU_WIDTH),
        window.innerWidth - MENU_WIDTH - 8
      );

      setMenuStyle({
        position: 'fixed',
        left,
        width: MENU_WIDTH,
        ...(openUpward
          ? { bottom: window.innerHeight - rect.top + 6, top: 'auto' }
          : { top: rect.bottom + 6, bottom: 'auto' }),
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

  // Same smart positioning, standalone share button ke liye — chhota menu
  // hai (sirf 3 options) isliye height estimate kam rakha.
  useEffect(() => {
    if (!shareMenuOpen) {
      setShareMenuStyle(null);
      return undefined;
    }
    const isMobile = window.innerWidth < 640;
    if (isMobile) {
      setShareMenuStyle(null);
      return undefined;
    }
    const btn = shareBtnRef.current;
    if (!btn) return undefined;

    const computePosition = () => {
      const rect = btn.getBoundingClientRect();
      const MENU_WIDTH = 190;
      const MENU_HEIGHT_ESTIMATE = 150; // 3 items now (location, image, page link)
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openUpward = spaceBelow < MENU_HEIGHT_ESTIMATE && spaceAbove > spaceBelow;

      const left = Math.min(
        Math.max(8, rect.right - MENU_WIDTH),
        window.innerWidth - MENU_WIDTH - 8
      );

      setShareMenuStyle({
        position: 'fixed',
        left,
        width: MENU_WIDTH,
        ...(openUpward
          ? { bottom: window.innerHeight - rect.top + 6, top: 'auto' }
          : { top: rect.bottom + 6, bottom: 'auto' }),
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

  // ---- Download: image seedha download hoti hai ----
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

  // ---- Share: TEEN options — Location, Image, Page Link ----
  // Ye teeno standalone share button ke apne dropdown mein hain, 3-dot
  // menu mein nahi (wahan Download/Edit/Save/Report/Delete hai).

  // Option 1: Location share — googleMapsUrl (agar admin ne diya hai) warna
  // Developer + Project + Sector se bani Maps search query, link ki tarah share hoti hai.
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

  // Option 2: Sirf image share hoti hai — bina caption/details overlay ke,
  // seedha original imageUrl ki file native share sheet mein jaati hai.
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

  // Option 3: Page link share — /inventory/:id wala detail page abhi tak
  // bana nahi hai, URL yahan pehle se ready rakha hai jab wo page ban jaye.
  const handleSharePageLink = async (e) => {
    e.stopPropagation();
    setShareMenuOpen(false);
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
    setMenuOpen(false);
    onEdit?.(inventory);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete?.(inventory);
  };

  // Shared by the thumbnail click AND the "Preview" pill — image ho to
  // preview kholo, na ho to camera/photo-add flow trigger karo.
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
    // TEMP note: thumbnail placeholder dikha raha hai, lekin yahan `inventory`
    // as-is (real imageUrl ke saath) pass ho raha hai — preview mein ACTUAL
    // image hi khulegi, kyunki downstream ImagePreview `inventory.imageUrl`
    // use karta hai, thumbnail wala placeholder nahi.
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
              src={placeholderThumbUrl /* TEMP — was: imageUrl */}
              alt={middleLabel || topLabel || 'Inventory'}
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="inv-card__thumb-fallback" aria-hidden="true" />
          )}
        </button>

        <div className="inv-card__content">
          {/* HEADER — bold sector name + standalone share button + 3-dot menu button */}
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
                {/* ===== Standalone SHARE button — separate from 3-dot menu ===== */}
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
                        className="inv-card__menu inv-card__share-menu"
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

                {/* ===== 3-dot menu — Save / Download / Edit / Report / Delete ===== */}
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
                        className="inv-card__menu"
                        style={menuStyle || undefined}
                        onClick={(e) => e.stopPropagation()}
                        role="menu"
                      >
                        <InventoryActionsSave inventoryId={id} onCloseMenu={() => setMenuOpen(false)} />
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
                        <InventoryActionsReport inventoryId={id} onCloseMenu={() => setMenuOpen(false)} />
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

          {/* Secondary line — city (or Developer/Project fallback) */}
          {middleLabel ? (
            <p className="inv-card__description" title={middleLabel}>
              {middleLabel}
            </p>
          ) : null}

          {/* Updated-ago row — only renders when the record actually has updatedAt */}
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