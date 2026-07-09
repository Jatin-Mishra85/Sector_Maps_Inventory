import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../context/ToastContext';
import ErrorBoundary from '../components/common/ErrorBoundary/ErrorBoundary';

export default function AppProviders({ children }) {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>{children}</ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}