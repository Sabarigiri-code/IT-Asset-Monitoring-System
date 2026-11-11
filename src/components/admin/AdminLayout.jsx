import { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopNavbar from './AdminTopNavbar';
import { Outlet, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState('Admin User');
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (!stored) {
        toast.error('Please sign in to access the Admin Control Center.');
        navigate('/');
        return;
      }
      const parsed = JSON.parse(stored);
      const isDesignatedAdmin = parsed.email?.toLowerCase() === 'girimsabari7@gmail.com' || (parsed.role && parsed.role.toLowerCase() === 'admin');
      if (!isDesignatedAdmin) {
        toast.error('Access Denied: Only the designated Administrator can access this section.', {
          duration: 5000,
          style: { background: '#dc2626', color: '#fff', fontWeight: 'bold' },
          icon: '⛔'
        });
        navigate('/dashboard');
        return;
      }
      if (parsed.name) setAdminName(parsed.name);
    } catch (e) {
      navigate('/');
    }
  }, [navigate]);

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
