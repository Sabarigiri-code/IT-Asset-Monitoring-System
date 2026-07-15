import { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopNavbar from './AdminTopNavbar';
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState('Admin User');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) setAdminName(parsed.name);
      }
    } catch (e) {
      console.error('Error loading admin data', e);
    }
  }, []);

  return (
    <div className="dashboard-layout">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-main">
        <AdminTopNavbar onToggleSidebar={() => setSidebarOpen((v) => !v)} adminName={adminName} />

        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
