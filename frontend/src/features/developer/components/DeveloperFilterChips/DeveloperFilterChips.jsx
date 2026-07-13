import { memo } from 'react';
import './DeveloperFilterChips.css';
import { ALL_DEVELOPERS_ID } from '../../../../constants/appConstants';
import { classNames } from '../../../../utils/classNames';

// Groups jo list mein kabhi nahi dikhne chahiye — junk/fallback entries.
const HIDDEN_GROUP_NAMES = ['UNKNOWN DEVELOPER', 'UNASSIGNED'];

// Same horizontal scrollable chips row on ALL screen sizes — just smaller
// on mobile via CSS media query. No dropdown.
function DeveloperFilterChips({ developers, selectedId, onSelect, totalCount }) {
  const visibleDevelopers = developers.filter(
    (dev) => !HIDDEN_GROUP_NAMES.includes((dev.name || '').trim().toUpperCase())
  );

  return (
    <div className="dev-chips">
      <div className="dev-chips__scroll" role="tablist" aria-label="Filter by grouping">
        <button
          type="button"
          role="tab"
          aria-selected={selectedId === ALL_DEVELOPERS_ID}
          className={classNames('dev-chip', selectedId === ALL_DEVELOPERS_ID && 'dev-chip--active')}
          onClick={() => onSelect(ALL_DEVELOPERS_ID)}
        >
          All
          {selectedId === ALL_DEVELOPERS_ID && typeof totalCount === 'number' ? ` (${totalCount})` : ''}
        </button>

        {visibleDevelopers.map((dev) => (
          <button
            key={dev.id}
            type="button"
            role="tab"
            aria-selected={selectedId === dev.id}
            className={classNames('dev-chip', selectedId === dev.id && 'dev-chip--active')}
            onClick={() => onSelect(dev.id)}
          >
            {dev.name}
            {selectedId === dev.id && typeof dev.inventoryCount === 'number' ? ` (${dev.inventoryCount})` : ''}
          </button>
        ))}
      </div>
    </div>
  );
}

export default memo(DeveloperFilterChips);