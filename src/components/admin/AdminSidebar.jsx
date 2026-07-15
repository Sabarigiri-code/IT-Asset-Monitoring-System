import { NavLink } from 'react-router-dom';

const adminNavItems = [
  { to: '/admin', icon: 'bi-speedometer2', label: 'Overview', end: true },
  { to: '/admin/inventory', icon: 'bi-box-seam', label: 'Asset Inventory' },
  { to: '/admin/assign', icon: 'bi-person-plus', label: 'Assign Assets' },
  { to: '/admin/tickets', icon: 'bi-wrench', label: 'Maintenance Tickets' },
  { to: '/admin/licenses', icon: 'bi-file-earmark-lock', label: 'License Management' },
  { to: '/admin/roles', icon: 'bi-database', label: 'Registered Users (DB)' },
  { to: '/admin/audit-logs', icon: 'bi-clock-history', label: 'Asset Audit Logs' },
];

export default function AdminSidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />}

      <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`} id="admin-sidebar-nav" aria-label="Admin Navigation">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)' }}>
            <i className="bi bi-shield-lock" />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">ITAMS Admin</span>
            <span className="sidebar-brand-tagline">Control Center</span>
          </div>
          <button className="sidebar-close-btn d-lg-none" onClick={onClose} aria-label="Close sidebar">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {adminNavItems.map((item) => (
              <li key={item.to} className="sidebar-menu-item">
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                  id={`admin-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <span className="sidebar-link-icon">
                    <i className={`bi ${item.icon}`} />
                  </span>
                  <span className="sidebar-link-label">{item.label}</span>
                  {item.end && <span className="sidebar-link-indicator" />}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Help/Support Card */}
        <div className="sidebar-footer">
          <div className="sidebar-help-card" style={{ background: '#f0fdfa', borderColor: '#ccfbf1' }}>
            <div className="sidebar-help-icon" style={{ background: '#ccfbf1', color: '#0d9488' }}>
              <i className="bi bi-terminal" />
            </div>
            <p className="sidebar-help-text" style={{ fontSize: '0.78rem' }}>System status: <strong>All systems operational</strong></p>
            <a href="#logs" className="sidebar-help-link" style={{ color: '#0d9488' }} id="admin-sidebar-logs">
              View System Logs
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
