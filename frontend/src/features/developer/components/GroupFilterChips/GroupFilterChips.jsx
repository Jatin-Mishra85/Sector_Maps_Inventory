import { memo } from 'react';
import './GroupFilterChips.css';
import { ALL_DEVELOPERS_ID } from '../../../../constants/appConstants';
import { classNames } from '../../../../utils/classNames';

const HIDDEN_GROUP_NAMES = ['UNKNOWN DEVELOPER', 'UNASSIGNED'];

function GroupFilterChips({ developers, selectedId, onSelect, totalCount, savedOnly, onToggleSaved }) {
  const visibleDevelopers = developers.filter(
    (dev) => !HIDDEN_GROUP_NAMES.includes((dev.name || '').trim().toUpperCase())
  );

  return (
    <div className="dev-chips">
      <div className="dev-chips__scroll" role="tablist" aria-label="Filter by grouping">

<button
  type="button"
  role="tab"
  aria-selected={!savedOnly && selectedId === ALL_DEVELOPERS_ID}
  className={classNames('dev-chip', !savedOnly && selectedId === ALL_DEVELOPERS_ID && 'dev-chip--active')}
  onClick={() => onSelect(ALL_DEVELOPERS_ID)}
>
  All
  {!savedOnly && selectedId === ALL_DEVELOPERS_ID && typeof totalCount === 'number' ? ` (${totalCount})` : ''}
</button>

<button
  type="button"
  role="tab"
  aria-selected={savedOnly}
  className={classNames('dev-chip', 'dev-chip--saved', savedOnly && 'dev-chip--active')}
  onClick={onToggleSaved}
>
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
    <path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z" />
  </svg>
  Saved
</button>

{visibleDevelopers.map((dev) => (
  <button
    key={dev.id}
    type="button"
    role="tab"
    aria-selected={!savedOnly && selectedId === dev.id}
    className={classNames('dev-chip', !savedOnly && selectedId === dev.id && 'dev-chip--active')}
    onClick={() => onSelect(dev.id)}
  >
    {dev.name}
    {!savedOnly && selectedId === dev.id && typeof dev.inventoryCount === 'number' ? ` (${dev.inventoryCount})` : ''}
  </button>
))}
      </div>
    </div>
  );
}

export default memo(GroupFilterChips);