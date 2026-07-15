import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminTopNavbar({ onToggleSidebar, adminName = 'Admin User' }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [newUsers, setNewUsers] = useState([]);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8080/api/auth/users')
      .then(res => res.json())
      .then(data => {
        setNewUsers(data.filter(u => u.role !== 'admin').sort((a,b) => new Date(b.registeredAt) - new Date(a.registeredAt)));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = adminName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <header className="top-navbar" id="admin-top-navbar">
      <div className="top-navbar-left">
        <button
          className="sidebar-toggle-btn d-lg-none"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          id="admin-sidebar-toggle"
        >
          <i className="bi bi-list" />
        </button>
        <div className="navbar-greeting">
          <h1 className="navbar-welcome">
            Admin <span style={{ color: '#0d9488' }}>Control Center</span>
          </h1>
          <p className="navbar-date">
            Enterprise Asset Management Panel
          </p>
        </div>
      </div>

      <div className="top-navbar-right">
        {/* System Alert Indicators */}
        <div className="d-none d-md-flex align-items-center gap-2 me-3">
          <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1.5 d-flex align-items-center gap-1.5" style={{ fontSize: '0.75rem' }}>
            <span className="d-inline-block rounded-circle bg-success" style={{ width: '6px', height: '6px' }} />
            Vanguard-DB: Connected
          </span>
        </div>

        {/* Notifications */}
        <div className="position-relative" ref={notifRef}>
          <button 
            className="navbar-icon-btn" 
            aria-label="System Alerts" 
            id="admin-notifications-btn"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <i className="bi bi-bell" />
            {newUsers.length > 0 && (
              <span className="navbar-badge" style={{ backgroundColor: '#f59e0b' }}>{newUsers.length}</span>
            )}
          </button>

          {notificationsOpen && (
            <div className="profile-dropdown shadow-lg rounded-4 overflow-hidden border-0 p-0" style={{ right: 0, left: 'auto', minWidth: '350px', marginTop: '0.5rem', zIndex: 1050 }}>
              <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-bold">New Registrations</h6>
                <span className="badge bg-white text-primary rounded-pill small">{newUsers.length} New</span>
              </div>
              <div className="list-group list-group-flush" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {newUsers.length > 0 ? newUsers.map(user => (
                  <div key={user.id} className="list-group-item p-3 bg-light border-start border-3 border-primary">
                    <div className="d-flex w-100 justify-content-between align-items-center mb-1">
                      <h6 className="mb-0 fs-6 text-dark fw-bold">New Employee Joined</h6>
                      <small className="text-muted" style={{ fontSize: '0.7rem' }}>{new Date(user.registeredAt).toLocaleDateString()}</small>
                    </div>
                    <p className="mb-2 small text-dark">{user.fullName || 'Unknown User'} ({user.email}) has registered.</p>
                    
                    <div className="d-flex gap-2 mt-2">
                      <button className="btn btn-info btn-sm text-white rounded-pill py-1 px-3 fw-medium" style={{ fontSize: '0.75rem' }} onClick={() => { setNotificationsOpen(false); navigate('/admin/roles'); }}>
                        <i className="bi bi-box-arrow-up-right me-1" /> View Details
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="p-4 text-center text-muted">No new notifications</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="profile-dropdown-wrapper" ref={dropdownRef}>
          <button
            className="profile-trigger"
            onClick={() => setDropdownOpen((v) => !v)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            id="admin-profile-dropdown-trigger"
          >
            <div className="profile-avatar" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)' }}>{initials}</div>
            <div className="profile-info d-none d-md-flex">
              <span className="profile-name" title={adminName}>{adminName}</span>
              <span className="profile-role">Super Admin</span>
            </div>
            <i className={`bi bi-chevron-down profile-chevron ${dropdownOpen ? 'rotated' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="profile-dropdown" role="menu" id="admin-profile-dropdown-menu">
              <div className="profile-dropdown-header">
                <div className="profile-avatar profile-avatar-lg" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)' }}>{initials}</div>
                <div>
                  <div className="profile-dropdown-name">{adminName}</div>
                  <div className="profile-dropdown-email">admin.center@company.com</div>
                </div>
              </div>
              <div className="profile-dropdown-divider" />
              <button 
                className="profile-dropdown-item bg-transparent border-0 w-100 text-start" 
                onClick={() => { setDropdownOpen(false); setActiveModal('config'); }} 
                id="admin-dropdown-settings"
              >
                <i className="bi bi-sliders" />
                Global Config
              </button>
              <button 
                className="profile-dropdown-item bg-transparent border-0 w-100 text-start" 
                onClick={() => { setDropdownOpen(false); setActiveModal('logs'); }} 
                id="admin-dropdown-logs"
              >
                <i className="bi bi-file-earmark-medical" />
                Audit Logs
              </button>
              <div className="profile-dropdown-divider" />
              <a href="/" onClick={handleLogout} className="profile-dropdown-item profile-dropdown-logout" role="menuitem" id="admin-dropdown-logout">
                <i className="bi bi-box-arrow-right" />
                Logout
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Feature Modals */}
      {activeModal === 'config' && (
        <div className="modal-overlay d-flex align-items-center justify-content-center" onClick={() => setActiveModal(null)} style={{ zIndex: 1100, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}>
          <div className="bg-white rounded-4 shadow-lg p-4 text-center animation-zoom-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', width: '90%' }}>
            <div className="icon-box bg-primary-subtle text-primary rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
              <i className="bi bi-sliders fs-2" />
            </div>
            <h4 className="fw-bold mb-2">Global Configuration</h4>
            <p className="text-muted mb-4 small">System-wide parameters, API gateways, and notification integrations can be configured here. (Feature coming soon)</p>
            <button className="btn btn-primary rounded-pill px-4 w-100" onClick={() => setActiveModal(null)}>Understood</button>
          </div>
        </div>
      )}

      {activeModal === 'logs' && (
        <div className="modal-overlay d-flex align-items-center justify-content-center" onClick={() => setActiveModal(null)} style={{ zIndex: 1100, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}>
          <div className="bg-white rounded-4 shadow-lg p-4 animation-zoom-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '95%' }}>
            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
              <div className="icon-box bg-secondary-subtle text-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                <i className="bi bi-file-earmark-medical fs-4" />
              </div>
              <div>
                <h4 className="fw-bold mb-0">System Audit Logs</h4>
                <span className="text-muted small">Real-time security events</span>
              </div>
            </div>
            <div className="bg-dark rounded-3 p-3 font-monospace small text-success overflow-auto mb-4" style={{ height: '180px' }}>
              [2026-07-13 15:35:12] INFO  - User John Doe (USR-2948) successfully registered.<br/>
              [2026-07-13 15:32:01] WARN  - Failed login attempt from IP 192.168.1.45<br/>
              [2026-07-13 15:28:44] INFO  - Admin Sabarigiri updated status of Ticket ISS-2201<br/>
              [2026-07-13 15:15:10] INFO  - Asset Dell XPS 15 (AST-1024) health score dropped to 65%<br/>
              [2026-07-13 15:01:20] DEBUG - Syncing AD user directory... OK.<br/>
              [2026-07-13 14:58:11] INFO  - Application started on port 8080.
            </div>
            <div className="text-end">
               <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setActiveModal(null)}>Close Logs</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animation-zoom-in {
          animation: zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </header>
  );
}
