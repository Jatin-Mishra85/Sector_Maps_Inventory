import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import AdminInventoryFormPage from '../features/admin/pages/AdminInventoryFormPage';
import GroupingInventoriesPage from '../features/developer/pages/GroupingInventoriesPage';
import ReportsPage from '../features/admin/pages/ReportsPage';
import ProfilePage from '../pages/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="admin" element={<AdminInventoryFormPage />} />
        <Route path="grouping" element={<GroupingInventoriesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}