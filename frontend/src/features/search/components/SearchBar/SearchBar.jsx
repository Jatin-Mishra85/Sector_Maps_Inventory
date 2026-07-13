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

  const { suggestions } = useSuggestions(value);
  const showDropdown = isFocused && value.trim().length > 0 && suggestions.length > 0;

  const handleVoiceResult = useCallback(
    (transcript) => {
      onChange(transcript);
    },
    [onChange]
  );

  const { isSupported, isListening, error, startListening, stopListening } = useVoiceSearch({
    onResult: handleVoiceResult,
  });

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
      return;
    }
    startListening();
  };

  if (error === 'not-allowed') {
    showToast('Microphone access was denied. Please allow it to use voice search.', 'error');
  }

  const handleSuggestionClick = (label) => {
    onChange(label);
    setIsFocused(false);
  };

  return (
    <div className="search-bar" ref={wrapRef}>
      {/* Unified pill — search icon + input + mic all live inside ONE bordered shell */}
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          placeholder={isListening ? 'Listening...' : placeholder}
          aria-label="Search inventories"
          className="search-bar__input-wrap"
          autoComplete="off"
        />

        {isSupported && (
          <button
            type="button"
            onClick={handleMicClick}
            className={classNames('search-bar__mic', isListening && 'search-bar__mic--active')}
            aria-label={isListening ? 'Stop voice search' : 'Search by voice'}
            aria-pressed={isListening}
            title={isListening ? 'Stop voice search' : 'Search by voice'}
          >
            <svg
              viewBox="0 0 24 24"
              width="19"
              height="19"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M19 11a7 7 0 0 1-14 0M12 18v3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            {isListening && <span className="search-bar__mic-pulse" aria-hidden="true" />}
          </button>
        )}
      </div>

      {showDropdown && (
        <ul className="search-bar__dropdown" role="listbox">
          {suggestions.map((s, i) => (
            <li key={`${s.category}-${s.label}-${i}`}>
              <button
                type="button"
                className="search-bar__suggestion"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSuggestionClick(s.label)}
              >
                <span className="search-bar__suggestion-label">{s.label}</span>
                <span className="search-bar__suggestion-category">{s.category}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default memo(SearchBar);