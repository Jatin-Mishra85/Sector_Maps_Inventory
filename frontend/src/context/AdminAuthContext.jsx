import { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

// Admin access ab seedha DB ke Users.IsAdmin column se aata hai (manually
// SSMS se set kiya jata hai) — koi secret code / cookie nahi. AuthContext
// ke user object me hi isAdmin flag hota hai (backend /auth/me se aata hai).
const AdminAuthContext = createContext(undefined);

export function AdminAuthProvider({ children }) {
  const { user, loading } = useAuth();

  const value = {
    isAdminAuthenticated: !!user?.isAdmin,
    checkingStatus: loading,
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