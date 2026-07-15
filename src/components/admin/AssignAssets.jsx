import React, { useState, useEffect } from 'react';

// Assets will be fetched from database



export default function AssignAssets() {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [assetSearch, setAssetSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [deadlineDate, setDeadlineDate] = useState('');

  useEffect(() => {
    fetch('http://localhost:8080/api/auth/users')
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const mappedUsers = data.map(u => ({
          id: u.employeeId || 'USR-' + Math.floor(1000 + Math.random() * 9000),
          name: u.fullName || 'Unknown User',
          department: u.email || 'Registered User', 
          role: u.role === 'admin' ? 'Super Admin' 
                : (u.role.toLowerCase() === 'it admin' ? 'IT Admin' 
                : (u.role.toLowerCase() === 'manager' ? 'Manager' : 'Employee'))
        }));
        setUsers(mappedUsers);
      })
      .catch(err => console.error("Failed to fetch backend users:", err));

    fetch('http://localhost:8080/api/assets')
      .then(res => res.json())
      .then(data => {
        setAssets(data.filter(a => a.status === 'Available'));
      })
      .catch(err => console.error(err));
  }, []);

  const filteredAssets = assets.filter(a => a.name.toLowerCase().includes(assetSearch.toLowerCase()) || a.id.toLowerCase().includes(assetSearch.toLowerCase()));
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.department.toLowerCase().includes(userSearch.toLowerCase()));

  const handleAssign = () => {
    if (!selectedAsset || !selectedUser) return;
    
    // Update asset in database
    const updatedAsset = { 
      ...selectedAsset, 
      status: 'Assigned', 
      assignee: selectedUser.name,
      deadlineDate: deadlineDate || null 
    };

    fetch(`http://localhost:8080/api/assets/${selectedAsset.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedAsset)
    })
    .then(res => {
      if (res.ok) {
        setSuccessMessage(`Successfully assigned ${selectedAsset.name} to ${selectedUser.name}!`);
        // Remove assigned asset from available list
        setAssets(prev => prev.filter(a => a.id !== selectedAsset.id));

        // ✅ Write audit log entry
        const adminUser = (() => { try { return JSON.parse(localStorage.getItem('currentUser') || '{}').name || 'Admin'; } catch { return 'Admin'; } })();
        fetch('http://localhost:8080/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assetId: selectedAsset.id,
            assetName: selectedAsset.name,
            action: 'Assigned',
            user: selectedUser.name,
            userEmail: '',
            performedBy: adminUser
          })
        }).catch(e => console.warn('Audit log failed', e));

        setTimeout(() => {
          setSuccessMessage('');
          setSelectedAsset(null);
          setSelectedUser(null);
          setDeadlineDate('');
        }, 4000);
      }
    })
    .catch(e => console.error(e));
  };

  return (
    <div className="admin-page-container position-relative">
      {successMessage && (
        <div className="position-absolute top-0 start-50 translate-middle-x mt-3 z-3 w-100 px-4" style={{ maxWidth: '600px' }}>
          <div className="alert alert-success d-flex align-items-center shadow-lg border-0 rounded-4" role="alert" style={{ background: '#d1fae5', color: '#065f46' }}>
            <i className="bi bi-check-circle-fill fs-4 me-3"></i>
            <div className="fw-medium">{successMessage}</div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h2 className="fs-3 fw-bold text-dark mb-1">Assign Assets</h2>
        <p className="text-muted mb-0">Select an available asset and a user to create a new assignment.</p>
      </div>

      <div className="row g-4">
        {/* Left Column: Select Asset */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-bottom p-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}>1</div>
                Select Asset
              </h5>
              <div className="position-relative">
                <i className="bi bi-search position-absolute top-50 translate-middle-y text-muted ms-3"></i>
                <input 
                  type="text" 
                  className="form-control rounded-pill ps-5 bg-light border-0" 
                  placeholder="Search available assets..." 
                  value={assetSearch}
                  onChange={(e) => setAssetSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="card-body p-0" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <div className="list-group list-group-flush">
                {filteredAssets.map(asset => (
                  <button 
                    key={asset.id}
                    className={`list-group-item list-group-item-action p-4 border-bottom ${selectedAsset?.id === asset.id ? 'bg-primary-subtle border-primary' : ''}`}
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className={`rounded d-flex align-items-center justify-content-center fs-5 ${selectedAsset?.id === asset.id ? 'bg-primary text-white' : 'bg-light text-primary'}`} style={{ width: '48px', height: '48px' }}>
                        <i className={`bi ${asset.type === 'Hardware' ? 'bi-laptop' : 'bi-file-earmark-lock'}`}></i>
                      </div>
                      <div>
                        <div className={`fw-bold ${selectedAsset?.id === asset.id ? 'text-primary-emphasis' : 'text-dark'}`}>{asset.name}</div>
                        <div className="text-muted small">{asset.id} &bull; {asset.category}</div>
                      </div>
                      {selectedAsset?.id === asset.id && (
                        <div className="ms-auto text-primary">
                          <i className="bi bi-check-circle-fill fs-5"></i>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
                {filteredAssets.length === 0 && (
                  <div className="text-center p-5 text-muted">No assets found.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Select User */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-bottom p-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}>2</div>
                Select User
              </h5>
              <div className="position-relative">
                <i className="bi bi-search position-absolute top-50 translate-middle-y text-muted ms-3"></i>
                <input 
                  type="text" 
                  className="form-control rounded-pill ps-5 bg-light border-0" 
                  placeholder="Search users..." 
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="card-body p-0" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <div className="list-group list-group-flush">
                {filteredUsers.map(user => (
                  <button 
                    key={user.id}
                    className={`list-group-item list-group-item-action p-4 border-bottom ${selectedUser?.id === user.id ? 'bg-primary-subtle border-primary' : ''}`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className={`rounded-circle d-flex align-items-center justify-content-center fw-bold fs-5 ${selectedUser?.id === user.id ? 'bg-primary text-white' : 'bg-light text-primary'}`} style={{ width: '48px', height: '48px' }}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className={`fw-bold ${selectedUser?.id === user.id ? 'text-primary-emphasis' : 'text-dark'}`}>{user.name}</div>
                        <div className="text-muted small">{user.department} &bull; {user.role}</div>
                      </div>
                      {selectedUser?.id === user.id && (
                        <div className="ms-auto text-primary">
                          <i className="bi bi-check-circle-fill fs-5"></i>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="text-center p-5 text-muted">No users found.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Footer Banner */}
      <div className={`card border-0 shadow-lg rounded-4 mt-4 transition-all position-relative overflow-hidden ${selectedAsset && selectedUser ? 'opacity-100' : 'opacity-50'}`} style={{ background: '#fff', border: '1px solid rgba(226, 232, 240, 1)' }}>
        <div className="position-absolute top-0 start-0 w-100" style={{ height: '5px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)' }}></div>
        <div className="card-body p-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
          <div className="d-flex align-items-center gap-4 flex-grow-1 w-100">
            <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm flex-shrink-0" style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', color: '#2563eb' }}>
              <i className="bi bi-link-45deg fs-2"></i>
            </div>
            <div>
              <div className="text-uppercase fw-bold text-muted small mb-1" style={{ letterSpacing: '1px' }}>Assignment Pairing</div>
              <div className="d-flex align-items-center flex-wrap gap-2 fs-5 fw-bold text-dark">
                <span className="text-primary">{selectedAsset ? selectedAsset.name : 'Select Asset'}</span>
                <i className="bi bi-arrow-right text-muted opacity-50"></i>
                <span className="text-success">{selectedUser ? selectedUser.name : 'Select User'}</span>
              </div>
            </div>
          </div>
          
          <div className="d-flex flex-column flex-md-row align-items-center gap-3">
            <div className="bg-light rounded-3 px-3 py-2 border d-flex flex-column justify-content-center" style={{ minWidth: '200px', height: '100%' }}>
              <span className="text-muted mb-1" style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deadline (Required)</span>
              <input 
                type="date" 
                className="form-control form-control-sm bg-transparent border-0 shadow-none p-0 text-dark fw-bold w-100" 
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                style={{ outline: 'none', cursor: 'pointer' }}
              />
            </div>
            <button 
              className={`btn btn-lg rounded-3 px-4 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 ${successMessage ? 'btn-success' : 'btn-primary'}`}
              disabled={!selectedAsset || !selectedUser || !deadlineDate || !!successMessage}
              onClick={handleAssign}
              style={{ padding: '12px 24px', background: successMessage ? '#10b981' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', border: 'none', minWidth: '220px' }}
            >
              {successMessage ? (
                <><i className="bi bi-check-circle-fill"></i> Success!</>
              ) : (
                <>Confirm Assignment <i className="bi bi-arrow-right-circle ms-1"></i></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
