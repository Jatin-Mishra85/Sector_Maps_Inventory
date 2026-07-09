import './Loader.css';

export default function Loader({ label = 'Loading...', size = 'md', fullPage = false }) {
  return (
    <div className={`loader ${fullPage ? 'loader--full-page' : ''}`} role="status" aria-live="polite">
      <span className={`loader__spinner loader__spinner--${size}`} />
      {label ? <span className="loader__label">{label}</span> : null}
    </div>
  );
}