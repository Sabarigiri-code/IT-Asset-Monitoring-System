import React, { useState, useEffect } from 'react';



export default function UserRoles() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  useEffect(() => {
    fetch('https://it-asset-monitoring-system.onrender.com/api/auth/users')
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const mappedUsers = data.map(u => ({
          id: u.employeeId || 'USR-' + Math.floor(1000 + Math.random() * 9000),
          name: u.fullName || 'Unknown User',
          email: u.email,
          department: 'Registered User', 
          role: u.role === 'admin' ? 'Super Admin' 
                : (u.role.toLowerCase() === 'it admin' ? 'IT Admin' 
                : (u.role.toLowerCase() === 'manager' ? 'Manager' : 'Employee')),
          status: u.status || 'Active',
          lastLogin: new Date(u.registeredAt).toLocaleDateString(),
          _mongoId: u.id
        }));
        
        setUsers(mappedUsers);
      })
      .catch(err => console.error("Failed to fetch backend users:", err));
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    if (!role) return 'bg-light text-dark';
    switch(role.toLowerCase()) {
      case 'super admin':
      case 'admin': return 'bg-dark text-white border-dark';
      case 'it admin': return 'bg-primary-subtle text-primary border-primary-subtle';
      case 'manager': return 'bg-info-subtle text-info border-info-subtle';
      case 'employee': return 'bg-secondary-subtle text-secondary border-secondary-subtle';
      default: return 'bg-light text-dark';
    }
  };

  const updateUserRole = (id, newRole) => {
    const userToToggle = users.find(u => u.id === id);
    if (!userToToggle) return;

    if (!userToToggle._mongoId) {
      setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
      return;
    }

    fetch(`https://it-asset-monitoring-system.onrender.com/api/auth/users/${userToToggle._mongoId || id}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: newRole })
    })
    .then(res => res.json())
    .then(data => {
      if (data.user) {
        setUsers(users.map(u => u.id === id ? { ...u, role: data.user.role } : u));
      }
    })
    .catch(err => console.error("Error updating role:", err));
  };

  const toggleUserStatus = (id) => {
    const userToToggle = users.find(u => u.id === id);
    if (!userToToggle) return;
    
    // If it's a purely mock user without a MongoDB ID
    if (!userToToggle._mongoId) {
      setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u));
      return;
    }
    
    fetch(`https://it-asset-monitoring-system.onrender.com/api/auth/users/${userToToggle._mongoId || id}/status`, {
      method: 'PUT'
    })
    .then(res => res.json())
    .then(data => {
      if (data.user) {
        setUsers(users.map(u => u.id === id ? { ...u, status: data.user.status } : u));
      }
    })
    .catch(err => console.error("Error toggling status:", err));
  };

  return (
    <div className="admin-page-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fs-3 fw-bold text-dark mb-1">Registered Users</h2>
          <p className="text-muted mb-0">Live database view of all users who have registered in the system.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm rounded-pill px-4" onClick={() => alert('Invite User modal would open here!')}>
          <i className="bi bi-person-plus-fill"></i> Invite User
        </button>
      </div>

      <div className="dash-card">
        <div className="dash-card-header bg-white border-bottom p-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="position-relative" style={{ maxWidth: '350px', width: '100%' }}>
            <i className="bi bi-search position-absolute top-50 translate-middle-y text-muted ms-3"></i>
            <input 
              type="text" 
              className="form-control rounded-pill ps-5 bg-light border-0" 
              placeholder="Search users by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="d-flex gap-2">
            <select className="form-select rounded-pill bg-light border-0 shadow-none" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ width: '160px' }}>
              <option value="All">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="IT Admin">IT Admin</option>
              <option value="Manager">Manager</option>
              <option value="Employee">Employee</option>
            </select>
          </div>
        </div>
        
        <div className="dash-card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.9rem' }}>
              <thead className="table-light text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <tr>
                  <th className="ps-4 py-3 fw-semibold border-0 rounded-top-start">User Profile</th>
                  <th className="py-3 fw-semibold border-0">Department</th>
                  <th className="py-3 fw-semibold border-0">System Role</th>
                  <th className="py-3 fw-semibold border-0">Status</th>
                  <th className="py-3 fw-semibold border-0">Last Login</th>
                  <th className="text-end pe-4 py-3 fw-semibold border-0 rounded-top-end">Manage</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? filteredUsers.map(user => (
                  <tr key={user.id} className="border-bottom" style={{ opacity: user.status === 'Suspended' ? 0.6 : 1 }}>
                    <td className="ps-4 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-5" style={{ width: '42px', height: '42px' }}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{user.name}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-dark">{user.department}</td>
                    <td className="py-3">
                      <span className={`badge border rounded-pill px-3 py-2 fw-medium ${getRoleBadge(user.role)}`}>
                        <i className={`bi ${user.role.includes('Admin') ? 'bi-shield-lock-fill' : 'bi-person-fill'} me-1`}></i>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className={`rounded-circle ${user.status === 'Active' ? 'bg-success' : 'bg-danger'}`} style={{ width: '8px', height: '8px' }}></div>
                        <span className={`fw-medium ${user.status === 'Active' ? 'text-success' : 'text-danger'}`}>{user.status}</span>
                      </div>
                    </td>
                    <td className="py-3 text-muted">{user.lastLogin}</td>
                    <td className="text-end pe-4 py-3">
                      <div className="dropdown">
                        <button className="btn btn-sm btn-light border rounded-pill shadow-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                          Actions
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3">
                          <li><h6 className="dropdown-header">Change Role</h6></li>
                          <li><button className="dropdown-item py-2" onClick={() => updateUserRole(user.id, 'IT Admin')}>Promote to IT Admin</button></li>
                          <li><button className="dropdown-item py-2" onClick={() => updateUserRole(user.id, 'Manager')}>Set as Manager</button></li>
                          <li><button className="dropdown-item py-2" onClick={() => updateUserRole(user.id, 'Employee')}>Demote to Employee</button></li>
                          <li><hr className="dropdown-divider" /></li>
                          <li>
                            <button className={`dropdown-item py-2 fw-medium ${user.status === 'Active' ? 'text-danger' : 'text-success'}`} onClick={() => toggleUserStatus(user.id)}>
                              <i className={`bi ${user.status === 'Active' ? 'bi-person-x-fill' : 'bi-person-check-fill'} me-2`}></i>
                              {user.status === 'Active' ? 'Suspend Account' : 'Reactivate Account'}
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <i className="bi bi-people fs-1 d-block mb-3 opacity-50"></i>
                      No users found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
