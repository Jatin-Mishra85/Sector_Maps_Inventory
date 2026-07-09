import { useState } from 'react';
import './RecentSection.css';
import { useRecentInventories } from '../../hooks/useRecentInventories';
import InventoryCardSkeleton from '../InventoryCardSkeleton/InventoryCardSkeleton';

const HIDE_FLAG_KEY = 'recent_section_hidden';

function readHiddenFlag() {
  try {
    return sessionStorage.getItem(HIDE_FLAG_KEY) === 'true';
  } catch {
    return false;
  }
}

export default function RecentSection() {
  const { recent, loading, error } = useRecentInventories(8);
  const [isHidden, setIsHidden] = useState(readHiddenFlag);

  const handleHide = () => {
    try {
      sessionStorage.setItem(HIDE_FLAG_KEY, 'true');
    } catch {
      // sessionStorage unavailable (e.g. private mode) — hide for this render only.
    }
    setIsHidden(true);
  };

  if (isHidden) return null;
  if (error || (!loading && !recent.length)) return null;

  return (
    <section className="recent-section" aria-label="Recently added inventories">
      <div className="recent-section__header">
        <h2 className="recent-section__title">Recently Added</h2>
        <button
          type="button"
          className="recent-section__hide-btn"
          onClick={handleHide}
          aria-label="Hide recently added section for this session"
        >
          Hide
        </button>
      </div>

      <div className="recent-section__scroll">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="recent-section__item">
                <InventoryCardSkeleton />
              </div>
            ))
          : recent.map((item) => (
              <div key={item.id} className="recent-section__item recent-section__item--compact">
                <img src={item.imageUrl} alt={item.name} loading="lazy" />
                <span>{item.name}</span>
              </div>
            ))}
      </div>
    </section>
  );
}