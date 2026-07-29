import { useEffect } from 'react';
import GoogleLoginButton from '../GoogleLoginButton/GoogleLoginButton';
import './LoginModal.css';

export default function LoginModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="login-modal__overlay" onClick={onClose}>
      <div className="login-modal__card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="login-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        <div className="login-modal__left">
          <h2 className="login-modal__welcome">Welcome Back</h2>
          <p className="login-modal__subtext">
            Please sign in using your Google account to save favorites and submit reports.
          </p>
        </div>

        <div className="login-modal__right">
          <h3 className="login-modal__title">Login</h3>
          <p className="login-modal__hint">
            Continue with your Google account below
          </p>

          <div className="login-modal__google-wrap">
            <GoogleLoginButton onSuccess={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
}