import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function TopNavbar({ onToggleSidebar, userName = 'Saurabh Kumar', userEmail = 'saurabh.k@company.com', onUpdateUser }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'profile' | 'settings' | null
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [profileForm, setProfileForm] = useState({ name: userName, email: userEmail });
  
  const [appSettings, setAppSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('appSettings');
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    return {
      language: 'English (US)',
      timezone: '(GMT-05:00) Eastern Time (US & Canada)',
      theme: 'light',
      notifyEmailApproval: true,
      notifyMaint: true,
      notifyAlerts: false
    };
  });
  const [settingsForm, setSettingsForm] = useState(appSettings);
  const [myAssets, setMyAssets] = useState([]);
  
  const [notifications, setNotifications] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const hasFetchedOnce = useRef(false);

  const handleAction = (id, actionType) => {
    if (actionType === 'submitReply') {
      // Simulate sending reply
      setReplyingTo(null);
      setReplyText('');
    }
    // Mark as read
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  // Close dropdown on outside click
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

  // Update profile form values when props change
  useEffect(() => {
    let extraFields = { dob: '', address: '', professionalDetails: '', officeLocation: '', department: '', employeeId: 'EMP-' + Math.floor(1000 + Math.random() * 9000) };
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
         const cu = JSON.parse(stored);
         if (cu.dob) extraFields.dob = cu.dob;
         if (cu.address) extraFields.address = cu.address;
         if (cu.professionalDetails) extraFields.professionalDetails = cu.professionalDetails;
         if (cu.officeLocation) extraFields.officeLocation = cu.officeLocation;
         if (cu.department) extraFields.department = cu.department;
         if (cu.employeeId) extraFields.employeeId = cu.employeeId;
      }
    } catch(e) {}
    setProfileForm({ name: userName, email: userEmail, ...extraFields });
  }, [userName, userEmail, activeModal]);

  useEffect(() => {
    if (activeModal === 'settings') {
      setSettingsForm(appSettings);
    }
  }, [activeModal, appSettings]);

  // ─── Notification polling ───────────────────────────────────────
  const checkNotifications = () => {
    if (!userName) return;

    Promise.all([
      fetch('http://localhost:8080/api/assets').then(r => r.json()).catch(() => []),
      fetch('http://localhost:8080/api/requests').then(r => r.json()).catch(() => [])
    ]).then(([assetsData, requestsData]) => {
        const allAlerts = [];

        // 1️⃣ Deadline alerts
        const userAssets = assetsData.filter(
          a => String(a.assignee || '').trim().toLowerCase() === String(userName || '').trim().toLowerCase()
               && a.deadlineDate
        );
        
        userAssets.forEach(asset => {
          const todayStr    = new Date().toLocaleDateString('en-CA');
          const deadlineStr = asset.deadlineDate.slice(0, 10);
          const today    = new Date(todayStr);
          const deadline = new Date(deadlineStr);
          const diffDays = Math.round((deadline - today) / (1000 * 60 * 60 * 24));

          if (diffDays >= 0 && diffDays <= 3) {
            const label = diffDays === 0 ? 'due TODAY!' : `due in ${diffDays} day(s)`;
            allAlerts.push({
              id: 'deadline-' + asset.id,
              type: 'alert',
              title: '⏰ Asset Return Deadline!',
              time: 'Just now',
              desc: `"${asset.name}" (${asset.id}) is ${label}. Please return it on time.`,
              isRead: false,
              action: 'View Assets'
            });
          }
        });

        // 2️⃣ Request approval / rejection notifications
        const myRequests = requestsData.filter(
          r => (r.requesterName || '').trim().toLowerCase() === (userName || '').trim().toLowerCase()
        );
        
        myRequests.forEach(req => {
          if (req.status === 'Approved') {
            allAlerts.push({
              id: 'req-approved-' + (req.id || req._id),
              type: 'success',
              title: '✅ Request Approved!',
              time: req.date ? new Date(req.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Recently',
              desc: `Your request for "${req.title}" has been approved by the admin.`,
              isRead: false,
              action: 'View Status'
            });
          } else if (req.status === 'Rejected') {
            allAlerts.push({
              id: 'req-rejected-' + (req.id || req._id),
              type: 'error',
              title: '❌ Request Rejected',
              time: req.date ? new Date(req.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Recently',
              desc: `Your request for "${req.title}" was rejected. Contact IT for details.`,
              isRead: false,
              action: 'View Status'
            });
          } else if (req.status === 'Pending Repair') {
            allAlerts.push({
              id: 'req-repair-' + (req.id || req._id),
              type: 'warning',
              title: '🛠️ Repair Required',
              time: req.date ? new Date(req.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Recently',
              desc: `Your return for "${req.title}" was rejected due to damage. You must repair it and submit proof by the deadline.`,
              isRead: false,
              action: 'View My Assets'
            });
          }
        });

        // 3️⃣ Role Promotion Notification
        try {
          const currentUserStr = localStorage.getItem('currentUser');
          if (currentUserStr) {
             const cu = JSON.parse(currentUserStr);
             const role = (cu.role || '').toLowerCase();
             if (role === 'manager' || role === 'it admin') {
                allAlerts.push({
                   id: 'role-promo-' + role,
                   type: 'success',
                   title: '🎉 Promoted to ' + (role === 'manager' ? 'Manager' : 'IT Admin'),
                   time: 'Recently',
                   desc: role === 'manager' ? 'Your team is counting on you. Lead the way!' : 'System access granted. You keep the engine running!',
                   isRead: false,
                   action: 'View Profile'
                });
             }
          }
        } catch(e) {}

        // Side effects for notifications (outside setState to prevent double-firing in Strict Mode)
        const repairAlerts = allAlerts.filter(n => n.id.startsWith('req-repair-'));
        repairAlerts.forEach(alert => {
            if (!sessionStorage.getItem('notified_' + alert.id)) {
                if (hasFetchedOnce.current) {
                    try {
                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                        audio.volume = 0.5;
                        audio.play().catch(e => console.log('Audio autoplay blocked', e));
                    } catch(e) {}
                }
                toast(alert.desc, {
                    icon: '🛠️',
                    duration: 10000,
                    position: 'top-right',
                    style: { border: '1px solid #ffc107', padding: '16px', color: '#856404', backgroundColor: '#fff3cd' }
                });
                sessionStorage.setItem('notified_' + alert.id, 'true');
            }
        });
        hasFetchedOnce.current = true;

        // Merge and preserve isRead so notifications don't reappear after being dismissed
        setNotifications(prev => {
          const prevMap = new Map(prev.map(n => [n.id, n]));
          return allAlerts.map(n => {
             const existing = prevMap.get(n.id);
             return existing ? { ...n, isRead: existing.isRead } : n;
          });
        });
    });
  };

  useEffect(() => {
    checkNotifications();              // run immediately
    const interval = setInterval(checkNotifications, 30000); // then every 30s
    return () => clearInterval(interval);
  }, [userName]);

  useEffect(() => {
    if (activeModal === 'profile') {
      fetch('http://localhost:8080/api/assets')
        .then(res => res.json())
        .then(data => {
          setMyAssets(data.filter(a => String(a.assignee || '').trim().toLowerCase() === String(userName || '').trim().toLowerCase()));
        })
        .catch(err => console.error(err));
    }
  }, [activeModal, userName]);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', appSettings.theme);
  }, [appSettings.theme]);

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    
    let mongoId = '';
    let storedUser = null;
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
         storedUser = JSON.parse(stored);
         mongoId = storedUser.id || storedUser._id;
      }
    } catch(e) {}
    
    if (mongoId) {
      fetch(`http://localhost:8080/api/auth/users/${mongoId}/profile`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            name: profileForm.name,
            email: profileForm.email,
            dob: profileForm.dob,
            address: profileForm.address,
            professionalDetails: profileForm.professionalDetails,
            department: profileForm.department,
            officeLocation: profileForm.officeLocation
         })
      })
      .then(res => res.json())
      .then(data => {
         if (data.user) {
            localStorage.setItem('currentUser', JSON.stringify({
               ...storedUser,
               ...data.user,
               name: data.user.fullName
            }));
            if (onUpdateUser) onUpdateUser(data.user.fullName, data.user.email);
            setActiveModal(null);
            toast.success('Profile successfully updated!');
         } else {
            toast.error(data.message || 'Error updating profile');
         }
      })
      .catch(err => toast.error('Server error updating profile'));
    } else {
       if (onUpdateUser) onUpdateUser(profileForm.name, profileForm.email);
       setActiveModal(null);
       toast.success('Profile successfully updated locally (No DB ID found)');
    }
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    setAppSettings(settingsForm);
    localStorage.setItem('appSettings', JSON.stringify(settingsForm));
    setActiveModal(null);
    toast.success('Settings saved successfully!');
  };

  return (
    <header className="top-navbar" id="top-navbar">
      <div className="top-navbar-left">
        <button
          className="sidebar-toggle-btn d-lg-none"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          id="sidebar-toggle"
        >
          <i className="bi bi-list" />
        </button>
        <div className="navbar-greeting">
          <h1 className="navbar-welcome">
            {greeting}, <span className="navbar-user-name">{userName.split(' ')[0]}</span>
          </h1>
          <p className="navbar-date">
            {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="top-navbar-right">
        {/* Notifications */}
        <div className="position-relative" ref={notifRef}>
          <button 
            className="navbar-icon-btn" 
            aria-label="Notifications" 
            id="notifications-btn"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <i className="bi bi-bell" />
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="navbar-badge">{notifications.filter(n => !n.isRead).length}</span>
            )}
          </button>

          {notificationsOpen && (
            <div className="profile-dropdown shadow-lg rounded-4 overflow-hidden border-0 p-0" style={{ right: 0, left: 'auto', minWidth: '350px', marginTop: '0.5rem', zIndex: 1050 }}>
              <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-bold">Notifications</h6>
                <span className="badge bg-white text-primary rounded-pill small">{notifications.filter(n => !n.isRead).length} New</span>
              </div>
              <div className="list-group list-group-flush" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {notifications.filter(n => !n.isRead).length > 0 ? notifications.filter(n => !n.isRead).map(notif => (
                  <div key={notif.id} className="list-group-item p-3 bg-light border-start border-3 border-primary animation-fade-in">
                    <div className="d-flex w-100 justify-content-between align-items-center mb-1">
                      <h6 className="mb-0 fs-6 text-dark fw-bold">{notif.title}</h6>
                      <small className="text-muted" style={{ fontSize: '0.7rem' }}>{notif.time}</small>
                    </div>
                    <p className="mb-2 small text-dark">{notif.desc}</p>
                    
                    {replyingTo === notif.id ? (
                      <div className="mt-2 animation-fade-in">
                        <textarea 
                          className="form-control form-control-sm mb-2" 
                          rows="2" 
                          placeholder="Type your reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          autoFocus
                        />
                        <div className="d-flex justify-content-end gap-2">
                          <button className="btn btn-outline-secondary btn-sm px-3 rounded-pill py-1" onClick={() => { setReplyingTo(null); setReplyText(''); }}>Cancel</button>
                          <button className="btn btn-primary btn-sm px-3 rounded-pill py-1" onClick={() => handleAction(notif.id, 'submitReply')} disabled={!replyText.trim()}>Send</button>
                        </div>
                      </div>
                    ) : (
                      <div className="d-flex gap-2 mt-2">
                        {notif.action === 'Reply' && !notif.isRead && (
                          <button className="btn btn-primary btn-sm rounded-pill py-1 px-3 fw-medium" style={{ fontSize: '0.75rem' }} onClick={() => setReplyingTo(notif.id)}>
                            <i className="bi bi-reply-fill me-1" /> Reply
                          </button>
                        )}
                        {notif.action === 'Acknowledge' && !notif.isRead && (
                          <button className="btn btn-success btn-sm rounded-pill py-1 px-3 fw-medium" style={{ fontSize: '0.75rem' }} onClick={() => handleAction(notif.id, 'acknowledge')}>
                            <i className="bi bi-check-circle me-1" /> Acknowledge
                          </button>
                        )}
                        {notif.action === 'View Request' && !notif.isRead && (
                          <button className="btn btn-info btn-sm text-white rounded-pill py-1 px-3 fw-medium" style={{ fontSize: '0.75rem' }} onClick={() => { window.location.href = '/dashboard/status-tracker'; }}>
                            <i className="bi bi-box-arrow-up-right me-1" /> View Request
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="p-4 text-center text-muted small">No new notifications</div>
                )}
              </div>
              {notifications.filter(n => !n.isRead).length > 0 && (
                <div className="p-2 border-top text-center bg-white">
                  <button className="btn btn-link btn-sm text-decoration-none fw-medium w-100" onClick={() => setNotifications(prev => prev.map(n => ({...n, isRead: true})))}>Mark all as read</button>
                </div>
              )}
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
            id="profile-dropdown-trigger"
          >
            <div className="profile-avatar">{initials}</div>
            <div className="profile-info d-none d-md-flex">
              <span className="profile-name" title={userName}>{userName}</span>
              <span className="profile-role">Employee</span>
            </div>
            <i className={`bi bi-chevron-down profile-chevron ${dropdownOpen ? 'rotated' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="profile-dropdown" role="menu" id="profile-dropdown-menu">
              <div className="profile-dropdown-header">
                <div className="profile-avatar profile-avatar-lg">{initials}</div>
                <div>
                  <div className="profile-dropdown-name">{userName}</div>
                  <div className="profile-dropdown-email">{userEmail}</div>
                </div>
              </div>
              <div className="profile-dropdown-divider" />
              <a href="#profile" onClick={(e) => { e.preventDefault(); setDropdownOpen(false); setActiveModal('profile'); }} className="profile-dropdown-item" role="menuitem" id="dropdown-profile">
                <i className="bi bi-person" />
                My Profile
              </a>
              <a href="#settings" onClick={(e) => { e.preventDefault(); setDropdownOpen(false); setActiveModal('settings'); }} className="profile-dropdown-item" role="menuitem" id="dropdown-settings">
                <i className="bi bi-gear" />
                Settings
              </a>
              <div className="profile-dropdown-divider" />
              <a href="/" className="profile-dropdown-item profile-dropdown-logout" role="menuitem" id="dropdown-logout">
                <i className="bi bi-box-arrow-right" />
                Logout
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {activeModal === 'profile' && (
        <div className="app-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="app-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="app-modal-header">
              <h3 className="app-modal-title">
                <i className="bi bi-person-circle me-2 text-primary" />
                My Profile
              </h3>
              <button className="app-modal-close" onClick={() => setActiveModal(null)} type="button">
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <form onSubmit={handleProfileSubmit}>
              <div className="app-modal-body">
                <div className="profile-modal-top text-center mb-4">
                  <div className="profile-modal-avatar mx-auto mb-2">{initials}</div>
                  <h4 className="mb-0 fw-bold">{profileForm.name}</h4>
                  <p className="text-muted small mb-0">{profileForm.professionalDetails || 'Employee'} &bull; {profileForm.department || 'General Dept'}</p>
                </div>

                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold text-muted small">Full Name</label>
                    <input type="text" className="form-control" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold text-muted small">Email Address</label>
                    <input type="email" className="form-control" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} required />
                  </div>
                  
                  <div className="col-sm-6">
                    <label className="form-label fw-semibold text-muted small">Date of Birth</label>
                    <input type="date" className="form-control" value={profileForm.dob} onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })} />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label fw-semibold text-muted small">Department</label>
                    <input type="text" className="form-control" value={profileForm.department} onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })} placeholder="e.g. IT, HR, Sales" />
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label fw-semibold text-muted small">Home Address</label>
                    <input type="text" className="form-control" value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} placeholder="123 Main St, City, Country" />
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label fw-semibold text-muted small">Professional Details (Bio / Skills)</label>
                    <textarea className="form-control" rows="2" value={profileForm.professionalDetails} onChange={(e) => setProfileForm({ ...profileForm, professionalDetails: e.target.value })} placeholder="Senior Developer, expert in React and Spring Boot..." />
                  </div>

                  <div className="col-sm-6">
                    <label className="form-label fw-semibold text-muted small">Employee ID</label>
                    <input type="text" className="form-control bg-light" value={profileForm.employeeId} readOnly />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label fw-semibold text-muted small">Office Location</label>
                    <input type="text" className="form-control" value={profileForm.officeLocation} onChange={(e) => setProfileForm({ ...profileForm, officeLocation: e.target.value })} placeholder="e.g. Tower B, 4th Floor" />
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="fw-semibold text-dark mb-3" style={{ fontSize: '0.95rem' }}>Assigned IT Assets ({myAssets.length})</h5>
                  {myAssets.length === 0 ? (
                    <div className="text-muted small text-center p-3 border rounded bg-light">No assets currently assigned to you.</div>
                  ) : (
                    <div className="list-group list-group-flush border rounded overflow-hidden">
                      {myAssets.map(asset => (
                        <div key={asset.id} className="list-group-item d-flex justify-content-between align-items-center py-3">
                          <div className="d-flex align-items-center gap-3">
                            <i className={`bi ${asset.type === 'Hardware' ? (asset.category === 'Laptop' ? 'bi-laptop' : 'bi-display') : 'bi-box-seam'} text-primary fs-5 flex-shrink-0`} />
                            <div>
                              <div className="fw-semibold text-dark mb-1" style={{ fontSize: '0.85rem' }}>{asset.name}</div>
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>Tag: {asset.id} &bull; Type: {asset.category}</div>
                            </div>
                          </div>
                          <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill flex-shrink-0" style={{ fontSize: '0.7rem' }}>Active</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="app-modal-footer">
                <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm px-4">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {activeModal === 'settings' && (
        <div className="app-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="app-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="app-modal-header">
              <h3 className="app-modal-title">
                <i className="bi bi-gear-fill me-2 text-primary" />
                Settings
              </h3>
              <button className="app-modal-close" onClick={() => setActiveModal(null)} type="button">
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <form onSubmit={handleSettingsSubmit}>
              <div className="app-modal-body">
                <div className="settings-tabs d-flex border-bottom mb-4">
                  <button
                    type="button"
                    className={`settings-tab-btn py-2 px-3 fw-semibold ${activeSettingsTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveSettingsTab('general')}
                  >
                    General
                  </button>
                  <button
                    type="button"
                    className={`settings-tab-btn py-2 px-3 fw-semibold ${activeSettingsTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveSettingsTab('notifications')}
                  >
                    Notifications
                  </button>
                  <button
                    type="button"
                    className={`settings-tab-btn py-2 px-3 fw-semibold ${activeSettingsTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveSettingsTab('security')}
                  >
                    Security & PW
                  </button>
                </div>

                {activeSettingsTab === 'general' && (
                  <div className="settings-tab-content">
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted small">System Language</label>
                      <select className="form-select form-select-sm" value={settingsForm.language} onChange={(e) => setSettingsForm({ ...settingsForm, language: e.target.value })}>
                        <option>English (US)</option>
                        <option>Spanish (ES)</option>
                        <option>German (DE)</option>
                        <option>French (FR)</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted small">Timezone</label>
                      <select className="form-select form-select-sm" value={settingsForm.timezone} onChange={(e) => setSettingsForm({ ...settingsForm, timezone: e.target.value })}>
                        <option>(GMT-05:00) Eastern Time (US & Canada)</option>
                        <option>(GMT+00:00) Greenwich Mean Time</option>
                        <option>(GMT+05:30) India Standard Time</option>
                        <option>(GMT+09:00) Tokyo Standard Time</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted small d-block">System Theme Preference</label>
                      <div className="btn-group w-100" role="group">
                        <input type="radio" className="btn-check" name="theme-radio" id="theme-light" autoComplete="off" checked={settingsForm.theme === 'light'} onChange={() => setSettingsForm({ ...settingsForm, theme: 'light' })} />
                        <label className="btn btn-outline-secondary btn-sm" htmlFor="theme-light">
                          <i className="bi bi-sun-fill me-1" /> Light Mode
                        </label>
                        <input type="radio" className="btn-check" name="theme-radio" id="theme-dark" autoComplete="off" checked={settingsForm.theme === 'dark'} onChange={() => setSettingsForm({ ...settingsForm, theme: 'dark' })} />
                        <label className="btn btn-outline-secondary btn-sm" htmlFor="theme-dark">
                          <i className="bi bi-moon-stars-fill me-1" /> Dark Mode
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingsTab === 'notifications' && (
                  <div className="settings-tab-content">
                    <div className="form-check form-switch mb-3">
                      <input className="form-check-input" type="checkbox" id="notify-email-approval" checked={settingsForm.notifyEmailApproval} onChange={(e) => setSettingsForm({ ...settingsForm, notifyEmailApproval: e.target.checked })} />
                      <label className="form-check-label fw-semibold text-dark small" htmlFor="notify-email-approval">
                        Email on request status update
                        <span className="text-muted d-block fw-normal" style={{ fontSize: '0.75rem' }}>Get notified immediately when an admin approves or rejects your hardware requests.</span>
                      </label>
                    </div>
                    <div className="form-check form-switch mb-3">
                      <input className="form-check-input" type="checkbox" id="notify-maint" checked={settingsForm.notifyMaint} onChange={(e) => setSettingsForm({ ...settingsForm, notifyMaint: e.target.checked })} />
                      <label className="form-check-label fw-semibold text-dark small" htmlFor="notify-maint">
                        Maintenance tickets notifications
                        <span className="text-muted d-block fw-normal" style={{ fontSize: '0.75rem' }}>Get alerts when a diagnostic or repair ticket is scheduled for your assigned assets.</span>
                      </label>
                    </div>
                    <div className="form-check form-switch mb-3">
                      <input className="form-check-input" type="checkbox" id="notify-alerts" checked={settingsForm.notifyAlerts} onChange={(e) => setSettingsForm({ ...settingsForm, notifyAlerts: e.target.checked })} />
                      <label className="form-check-label fw-semibold text-dark small" htmlFor="notify-alerts">
                        Weekly summary newsletter
                        <span className="text-muted d-block fw-normal" style={{ fontSize: '0.75rem' }}>Receive a digest of company IT policies and compliance updates.</span>
                      </label>
                    </div>
                  </div>
                )}

                {activeSettingsTab === 'security' && (
                  <div className="settings-tab-content">
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted small">Current Password</label>
                      <input type="password" className="form-control form-control-sm" placeholder="••••••••" required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted small">New Password</label>
                      <input type="password" className="form-control form-control-sm" placeholder="Minimum 8 characters" required minLength={8} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-muted small">Confirm New Password</label>
                      <input type="password" className="form-control form-control-sm" placeholder="Must match exactly" required />
                    </div>
                  </div>
                )}
              </div>

              <div className="app-modal-footer">
                <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm px-4">Save Settings</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
