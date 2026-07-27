import { createPortal } from 'react-dom';
import './VoiceSearchOverlay.css';

function VoiceSearchOverlay({ isOpen, interimTranscript, onStop }) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="voice-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Voice search"
      onClick={onStop}
    >
      <button
        type="button"
        className="voice-overlay__close"
        onClick={(e) => {
          e.stopPropagation();
          onStop();
        }}
        aria-label="Stop voice search"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      <div className="voice-overlay__center" onClick={(e) => e.stopPropagation()}>
        <div
          className="voice-overlay__mic-wrap"
          onClick={onStop}
          role="button"
          tabIndex={0}
          aria-label="Tap to stop listening"
        >
          <span className="voice-overlay__ring voice-overlay__ring--1" />
          <span className="voice-overlay__ring voice-overlay__ring--2" />
          <span className="voice-overlay__ring voice-overlay__ring--3" />
          <span className="voice-overlay__mic-circle">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" aria-hidden="true">
              <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" stroke="currentColor" strokeWidth="1.8" />
              <path d="M19 11a7 7 0 0 1-14 0M12 18v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
        </div>

        <div className="voice-overlay__waveform" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`voice-overlay__bar voice-overlay__bar--${i}`} />
          ))}
        </div>

        <p className="voice-overlay__status">{interimTranscript || 'Listening...'}</p>
        <p className="voice-overlay__hint">Tap anywhere to stop</p>
      </div>
    </div>,
    document.body
  );
}

export default VoiceSearchOverlay;