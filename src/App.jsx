import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './components/dashboard/DashboardHome';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardHome from './components/admin/AdminDashboardHome';
import AssetInventory from './components/admin/AssetInventory';
import AssignAssets from './components/admin/AssignAssets';
import MaintenanceTickets from './components/admin/MaintenanceTickets';
import LicenseManagement from './components/admin/LicenseManagement';
import UserRoles from './components/admin/UserRoles';
import AuditLogs from './components/admin/AuditLogs';
import MyAssets from './components/dashboard/MyAssets';
import StatusTracker from './components/dashboard/StatusTracker';
import NewRequest from './components/dashboard/NewRequest';
import { Toaster } from 'react-hot-toast';

function PlaceholderPage({ title, icon }) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-page-icon">
        <i className={`bi ${icon}`} />
      </div>
      <h2>{title}</h2>
      <p>This page is under development.</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<AuthPage />} />

        {/* Employee Dashboard */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="my-assets" element={<MyAssets />} />
          <Route path="new-request" element={<NewRequest />} />
          <Route path="status-tracker" element={<StatusTracker />} />
        </Route>

        {/* Admin Control Center */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardHome />} />
          <Route path="inventory" element={<AssetInventory />} />
          <Route path="assign" element={<AssignAssets />} />
          <Route path="tickets" element={<MaintenanceTickets />} />
          <Route path="licenses" element={<LicenseManagement />} />
          <Route path="roles" element={<UserRoles />} />
          <Route path="audit-logs" element={<AuditLogs />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster 
        position="top-center" 
        toastOptions={{ 
          duration: 3000, 
          style: { background: '#333', color: '#fff', borderRadius: '8px', fontWeight: '500' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } }
        }} 
      />
    </BrowserRouter>
  );
}

export default App;
