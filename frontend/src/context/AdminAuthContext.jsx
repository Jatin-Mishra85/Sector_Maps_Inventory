import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { adminService } from '../features/admin/services/adminService';
import { ENV } from '../constants/env';

const AdminAuthContext = createContext(undefined);

// Admin access ab ek real backend cookie (admin_access, 7 din valid) se
// backed hai — is context ka kaam bas is cookie ki current state ko React
// state me reflect karna hai (cookie httpOnly hai, JS seedha padh nahi sakta).
export function AdminAuthProvider({ children }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);

  // Page load / refresh par backend se poochho ki cookie abhi bhi valid hai ya nahi.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${ENV.API_BASE_URL}/admin/status`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (!cancelled) setIsAdminAuthenticated(!!data?.data?.unlocked);
      } catch (err) {
        if (!cancelled) setIsAdminAuthenticated(false);
      } finally {
        if (!cancelled) setCheckingStatus(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const lockAdmin = useCallback(() => {
    setIsAdminAuthenticated(false);
  }, []);

  const value = {
    isAdminAuthenticated,
    checkingStatus,
    isVerifying,
    error,
    verifyCode,
    lockAdmin,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return ctx;
}