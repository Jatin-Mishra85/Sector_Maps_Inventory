import { memo, useEffect, useRef, useState } from 'react';
import './TypeFilterButton.css';
import { classNames } from '../../../../utils/classNames';
import {
  INVENTORY_TYPES,
  INVENTORY_TYPE_LABELS,
  ALL_TYPES_ID,
} from '../../../../constants/appConstants';

const OPTIONS = [
  { value: ALL_TYPES_ID, label: 'All Types' },
  ...Object.values(INVENTORY_TYPES).map((type) => ({
    value: type,
    label: INVENTORY_TYPE_LABELS[type],
  })),
];

function TypeFilterButton({ selectedType, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value) => {
    onSelect(value);
    setIsOpen(false);
  };

  const isActive = selectedType !== ALL_TYPES_ID;

  return (
    <div className="type-filter" ref={containerRef}>
      <button
        type="button"
        className={classNames('type-filter__trigger', isActive && 'type-filter__trigger--active')}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Filter by inventory type"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
          <path
            d="M4 6h16M7 12h10M10 18h4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {isOpen && (
        <ul className="type-filter__menu" role="listbox">
          {OPTIONS.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                role="option"
                aria-selected={selectedType === opt.value}
                className={classNames(
                  'type-filter__option',
                  selectedType === opt.value && 'type-filter__option--selected'
                )}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default memo(TypeFilterButton);