import { memo, useCallback, useRef, useState } from 'react';
import './SearchBar.css';
import Input from '../../../../components/common/Input/Input';
import { useVoiceSearch } from '../../hooks/useVoiceSearch';
import { useSuggestions } from '../../hooks/useSuggestions';
import { useToast } from '../../../../context/ToastContext';
import { classNames } from '../../../../utils/classNames';

function SearchBar({ value, onChange, placeholder = 'Search by project, sector, or developer' }) {
  const { showToast } = useToast();
  const [isFocused, setIsFocused] = useState(false);
  const wrapRef = useRef(null);

  const { suggestions, fuzzy, searched } = useSuggestions(value);
  const trimmedValue = value.trim();
  const hasSuggestions = suggestions.length > 0;
  const showNotFound = searched && trimmedValue.length > 0 && !hasSuggestions;

  // Dropdown UI hidden as per requirement — underlying suggestion/search logic stays untouched
  const showDropdown = false;

  const handleVoiceResult = useCallback(
    (transcript) => {
      onChange(transcript);
    },
    [onChange]
  );

  const handleVoiceError = useCallback(
    (_code, message) => {
      showToast(message, 'error');
    },
    [showToast]
  );

  const { isSupported, isListening, interimTranscript, startListening, stopListening } = useVoiceSearch({
    onResult: handleVoiceResult,
    onError: handleVoiceError,
  });

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
      return;
    }
    startListening();
  };

  const handleClear = () => {
    if (isListening) {
      stopListening();
    }
    onChange('');
  };

  const handleSuggestionClick = (name) => {
    onChange(name);
    setIsFocused(false);
  };

  const displayValue = isListening ? interimTranscript : value;
  const showClear = !isListening && trimmedValue.length > 0;

  return (
    <div className="search-bar" ref={wrapRef}>
      <div className="search-bar__row">
        <div className={classNames('search-bar__pill', isFocused && 'search-bar__pill--focused')}>
          <svg
            className="search-bar__search-icon"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>

          <Input
            name="search"
            value={displayValue}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            placeholder={isListening ? 'Listening...' : placeholder}
            aria-label="Search inventories"
            className="search-bar__input-wrap"
            autoComplete="off"
            spellCheck="false"
            autoCorrect="off"
            autoCapitalize="off"
            readOnly={isListening}
          />

          {showClear && (
            <button
              type="button"
              onClick={handleClear}
              onMouseDown={(e) => e.preventDefault()}
              className="search-bar__clear"
              aria-label="Clear search"
              title="Clear search"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true" focusable="false">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>

        {isSupported && (
          <button
            type="button"
            onClick={handleMicClick}
            className={classNames('search-bar__mic', isListening && 'search-bar__mic--active')}
            aria-label={isListening ? 'Stop voice search' : 'Search by voice'}
            aria-pressed={isListening}
            title={isListening ? 'Stop voice search' : 'Search by voice'}
          >
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true" focusable="false">
              <path
                d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path d="M19 11a7 7 0 0 1-14 0M12 18v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {showDropdown && (
        <ul className="search-bar__dropdown" role="listbox">
          {fuzzy && hasSuggestions && (
            <li className="search-bar__dropdown-hint">Did you mean:</li>
          )}

          {hasSuggestions &&
            suggestions.map((s) => (
              <li key={`${s.Category}-${s.Id}`}>
                <button
                  type="button"
                  className="search-bar__suggestion"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSuggestionClick(s.Name)}
                >
                  <span className="search-bar__suggestion-label">{s.Name}</span>
                  <span className="search-bar__suggestion-category">{s.Category}</span>
                </button>
              </li>
            ))}

          {showNotFound && (
            <li className="search-bar__suggestion search-bar__suggestion--not-found">
              "{trimmedValue}" not found
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export default memo(SearchBar);