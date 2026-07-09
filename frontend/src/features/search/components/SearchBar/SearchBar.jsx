import { memo, useCallback } from 'react';
import './SearchBar.css';
import Input from '../../../../components/common/Input/Input';
import { useVoiceSearch } from '../../hooks/useVoiceSearch';
import { useToast } from '../../../../context/ToastContext';
import { classNames } from '../../../../utils/classNames';

function SearchBar({ value, onChange, placeholder = 'Search by project, sector, or developer' }) {
  const { showToast } = useToast();

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

  return (
    <div className="search-bar">
      <div className="search-bar__field-wrap">
        <Input
          name="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isListening ? 'Listening...' : placeholder}
          aria-label="Search inventories"
          className="search-bar__input"
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
              width="20"
              height="20"
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
    </div>
  );
}

export default memo(SearchBar);