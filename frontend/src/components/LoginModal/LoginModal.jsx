import { useEffect, useState } from 'react';
import GoogleLoginButton from '../GoogleLoginButton/GoogleLoginButton';
import Input from '../common/Input/Input';
import Button from '../common/Button/Button';
import { useAuth } from '../../context/AuthContext';
import './LoginModal.css';

export default function LoginModal({ isOpen, onClose }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resetFields = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError(null);
  };

  const handleClose = () => {
    resetFields();
    onClose();
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data =
        mode === 'login'
          ? await login(email.trim(), password)
          : await signup(email.trim(), password, name.trim());

      if (data.success) {
        resetFields();
        onClose();
      } else {
        setError(data.message || 'Something went wrong.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-modal__overlay" onClick={handleClose}>
      <div className="login-modal__card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="login-modal__close"
          onClick={handleClose}
          aria-label="Close"
        >
          &times;
        </button>

        <div className="login-modal__left">
          <h2 className="login-modal__welcome">Welcome Back</h2>
          <p className="login-modal__subtext">
            Sign in to save favorites and submit property reports with confidence.
          </p>
        </div>

        <div className="login-modal__right">
          <div className="login-modal__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={`login-modal__tab${mode === 'login' ? ' login-modal__tab--active' : ''}`}
              onClick={() => switchMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              className={`login-modal__tab${mode === 'signup' ? ' login-modal__tab--active' : ''}`}
              onClick={() => switchMode('signup')}
            >
              Sign Up
            </button>
          </div>

          <form className="login-modal__form" onSubmit={handleSubmit} noValidate>
            {mode === 'signup' && (
              <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            )}
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <p className="login-modal__error" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              disabled={submitting || !email.trim() || !password}
            >
              {mode === 'login' ? 'Log In' : 'Create Account'}
            </Button>
          </form>

          <div className="login-modal__divider">or</div>

          <div className="login-modal__google-wrap">
            <GoogleLoginButton onSuccess={handleClose} />
          </div>
        </div>
      </div>
    </div>
  );
}