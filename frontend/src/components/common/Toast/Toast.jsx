import './Toast.css';

export default function Toast({ message, type = 'info', onDismiss }) {
  return (
    <div className={`toast toast--${type}`} role="status">
      <span className="toast__message">{message}</span>
      <button
        type="button"
        className="toast__close"
        aria-label="Dismiss notification"
        onClick={onDismiss}
      >
        &times;
      </button>
    </div>
  );
}
