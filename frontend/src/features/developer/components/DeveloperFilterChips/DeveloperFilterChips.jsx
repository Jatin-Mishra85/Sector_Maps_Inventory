import { memo } from 'react';
import './DeveloperFilterChips.css';
import { ALL_DEVELOPERS_ID } from '../../../../constants/appConstants';
import { classNames } from '../../../../utils/classNames';

function DeveloperFilterChips({ developers, selectedId, onSelect, totalCount }) {
  return (
    <div className="dev-chips" role="tablist" aria-label="Filter by developer">
      <div className="dev-chips__scroll">
        <button
          type="button"
          role="tab"
          aria-selected={selectedId === ALL_DEVELOPERS_ID}
          className={classNames(
            'dev-chip',
            selectedId === ALL_DEVELOPERS_ID && 'dev-chip--active'
          )}
          onClick={() => onSelect(ALL_DEVELOPERS_ID)}
        >
          All{typeof totalCount === 'number' ? ` (${totalCount})` : ''}
        </button>

        {developers.map((dev) => (
          <button
            key={dev.id}
            type="button"
            role="tab"
            aria-selected={selectedId === dev.id}
            className={classNames(
              'dev-chip',
              selectedId === dev.id && 'dev-chip--active'
            )}
            onClick={() => onSelect(dev.id)}
          >
            {dev.name}
            {typeof dev.inventoryCount === 'number' ? ` (${dev.inventoryCount})` : ''}
          </button>
        ))}
      </div>
    </div>
  );
}

export default memo(DeveloperFilterChips);