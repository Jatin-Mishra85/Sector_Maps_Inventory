import { createContext, useCallback, useContext, useState } from 'react';
import { adminService } from '../features/admin/services/adminService';

const AdminAuthContext = createContext(undefined);

// Session-only admin access. Deliberately NOT persisted anywhere (no
// localStorage/sessionStorage) — plain React state, so a page refresh,
// tab close, or browser restart wipes it automatically. This is not a
// login system; it's a temporary gate for Add/Edit Inventory only.
export function AdminAuthProvider({ children }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);

  const verifyCode = useCallback(async (code) => {
    setIsVerifying(true);
    setError(null);
    try {
      await adminService.verifyCode(code);
      setIsAdminAuthenticated(true);
      return true;
    } catch (err) {
      setIsAdminAuthenticated(false);
      setError(err?.message || 'Invalid admin code. Please try again.');
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  // Not required by current rules (refresh already clears access), but
  // exposed for completeness in case a manual "lock" UI is ever needed.
  const lockAdmin = useCallback(() => {
    setIsAdminAuthenticated(false);
  }, []);

  const value = { isAdminAuthenticated, isVerifying, error, verifyCode, lockAdmin };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return ctx;
}