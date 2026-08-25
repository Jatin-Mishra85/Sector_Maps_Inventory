import { useAnalytics } from '../hooks/useAnalytics';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import AdminInventoryFormPage from '../features/admin/pages/AdminInventoryFormPage';
import GroupingInventoriesPage from '../features/developer/pages/GroupingInventoriesPage';
import ReportsPage from '../features/admin/pages/ReportsPage';
import SuperAdminPage from '../features/superadmin/pages/SuperAdminPage';
import ProfilePage from '../pages/ProfilePage';
import FeedbackPage from '../pages/FeedbackPage';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  useAnalytics();

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="admin" element={<AdminInventoryFormPage />} />
        <Route path="grouping" element={<GroupingInventoriesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="superadmin" element={<SuperAdminPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}