import { useRef, useState } from 'react';
import './GroupTypeInput.css';

/**
 * Single-value "which Group" typeahead — for the Grouping Inventories page.
 * NOT the same as GroupMultiSelect (that one is for tagging multiple Groups
 * onto one Inventory during Add/Edit). This one picks/types ONE Group name
 * to work with at a time.
 */
export default function GroupTypeInput({ value, onChange, availableGroups = [] }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const trimmedValue = (value || '').trim();

  const suggestions = availableGroups
    .filter((g) => g.name.toLowerCase().includes(trimmedValue.toLowerCase()))
    .slice(0, 8);

  const isNewGroup =
    trimmedValue.length > 0 &&
    !availableGroups.some((g) => g.name.toLowerCase() === trimmedValue.toLowerCase());

  return (
    <div className="group-type-input">
      <label className="group-type-input__label">Group</label>
      <input
        ref={inputRef}
        type="text"
        className="group-type-input__field"
        placeholder="e.g. BPTP — existing group select karo ya naya type karo"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
      />

      {showSuggestions && trimmedValue && suggestions.length > 0 && (
        <ul className="group-type-input__suggestions">
          {suggestions.map((g) => (
            <li key={g.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(g.name);
                  setShowSuggestions(false);
                }}
              >
                {g.name}
                {typeof g.inventoryCount === 'number' ? ` (${g.inventoryCount})` : ''}
              </button>
            </li>
          ))}
        </ul>
      )}

      {isNewGroup && (
        <p className="group-type-input__hint">
          "{trimmedValue}" naya group hai — Save dabane par create ho jayega.
        </p>
      )}
    </div>
  );
}