import { useState, useRef } from 'react';
import './GroupMultiSelect.css';

/**
 * Tag-style multi-select for "Grouping".
 * - Type + Enter/comma to add a tag (existing OR brand new — backend does
 *   findOrCreate on save, so typing a new group name creates it).
 * - Typing shows matching existing groups from `availableGroups` as suggestions.
 * - Click "x" on a chip to remove it. Backspace on empty input removes last chip.
 *
 * value: array of strings (group names)
 * onChange: (newArray) => void
 * availableGroups: array of { id, name }
 */
export default function GroupMultiSelect({ label = 'Grouping', value = [], onChange, availableGroups = [] }) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const normalizedValue = Array.isArray(value) ? value : [];

  const suggestions = availableGroups
    .filter((g) => g.name.toLowerCase().includes(inputValue.trim().toLowerCase()))
    .filter((g) => !normalizedValue.some((v) => v.toLowerCase() === g.name.toLowerCase()))
    .slice(0, 8);

  const addTag = (rawName) => {
    const name = (rawName || '').trim();
    if (!name) return;
    const alreadyAdded = normalizedValue.some((v) => v.toLowerCase() === name.toLowerCase());
    if (alreadyAdded) {
      setInputValue('');
      return;
    }
    onChange([...normalizedValue, name]);
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (name) => {
    onChange(normalizedValue.filter((v) => v !== name));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && normalizedValue.length > 0) {
      removeTag(normalizedValue[normalizedValue.length - 1]);
    }
  };

  return (
    <div className="group-multiselect">
      <label className="group-multiselect__label">{label}</label>

      <div className="group-multiselect__box" onClick={() => inputRef.current?.focus()}>
        {normalizedValue.map((name) => (
          <span className="group-multiselect__chip" key={name}>
            {name}
            <button
              type="button"
              className="group-multiselect__chip-remove"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(name);
              }}
              aria-label={`Remove ${name}`}
            >
              &times;
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          className="group-multiselect__input"
          placeholder={normalizedValue.length === 0 ? 'e.g. BPTP — Enter dabao add karne ke liye' : ''}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        />
      </div>

      {showSuggestions && inputValue.trim() && suggestions.length > 0 && (
        <ul className="group-multiselect__suggestions">
          {suggestions.map((g) => (
            <li key={g.id}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => addTag(g.name)}>
                {g.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {showSuggestions && inputValue.trim() && suggestions.length === 0 && (
        <div className="group-multiselect__hint">Enter dabao naya group "{inputValue.trim()}" banane ke liye</div>
      )}
    </div>
  );
}