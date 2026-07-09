import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import AdminInventoryFormPage from '../features/admin/pages/AdminInventoryFormPage';
import NotFoundPage from '../pages/NotFoundPage';
import { useSiteGate } from '../hooks/useSiteGate';

export default function AppRoutes() {
  const { isUnlocked } = useSiteGate();

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route
          index
          element={isUnlocked ? <HomePage /> : <Navigate to="/admin" replace />}
        />
        <Route path="admin" element={<AdminInventoryFormPage />} />
        {/* Future: /login */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}