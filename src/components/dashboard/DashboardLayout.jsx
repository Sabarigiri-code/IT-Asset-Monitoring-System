import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('Saurabh Kumar');
  const [userEmail, setUserEmail] = useState('saurabh.k@company.com');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) setUserName(parsed.name);
        if (parsed.email) setUserEmail(parsed.email);
      }
    } catch (e) {
      console.error('Error loading user data', e);
    }
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-main">
        <TopNavbar 
          onToggleSidebar={() => setSidebarOpen((v) => !v)} 
          userName={userName}
          userEmail={userEmail}
          onUpdateUser={(name, email) => {
            setUserName(name);
            setUserEmail(email);
          }}
        />

        <div className="dashboard-content">
          <Outlet context={{ userName, userEmail }} />
        </div>
      </div>
    </div>
  );
}
