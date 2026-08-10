import { HashRouter } from 'react-router-dom';
import { ToastProvider } from '../context/ToastContext';
import { AdminAuthProvider } from '../context/AdminAuthContext';
import ErrorBoundary from '../components/common/ErrorBoundary/ErrorBoundary';

export default function AppProviders({ children }) {
  return (
    <ErrorBoundary>
      <HashRouter>
        <ToastProvider>
          <AdminAuthProvider>{children}</AdminAuthProvider>
        </ToastProvider>
      </HashRouter>
    </ErrorBoundary>
  );
}