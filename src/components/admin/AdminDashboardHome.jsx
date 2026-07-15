import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminDashboardHome() {
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // --- State for Real Stats ---
  const [stats, setStats] = useState({
    totalAssets: 1482,
    hwAssets: 856,
    swAssets: 626,
    availableAssets: 142,
    activeTickets: 28,
    urgentTickets: 8,
    expiringLicenses: 14
  });

  // --- State for Recent Requests ---
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/requests')
      .then(res => res.json())
      .then(data => {
        const pending = data
          .filter(r => (r.type === 'Request' || r.type === 'Return') && r.status === 'Pending Approval')
          .map(r => ({
            id: r.id,
            name: r.requesterName || 'Anonymous',
            email: r.requesterEmail || 'user@company.com',
            asset: r.title,
            assetId: r.assetId,
            type: r.type === 'Return' ? 'Return' : (r.icon === 'bi-laptop' ? 'Hardware' : r.icon === 'bi-box-seam' ? 'Software' : 'Access'),
            date: r.date,
            desc: r.desc || 'No justification provided.',
            priority: r.priority || 'Normal',
            returnReason: r.returnReason,
            isDamaged: r.isDamaged,
            attachmentData: r.attachmentData,
            fullRequest: r
          }));
        setRequests(pending);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    try {
      // Inventory from MongoDB
      fetch('http://localhost:8080/api/assets')
        .then(res => res.json())
        .then(inventory => {
          const hw = inventory.filter(a => a.type === 'Hardware').length;
          const sw = inventory.filter(a => a.type === 'Software').length;
          const available = inventory.filter(a => a.status === 'Available').length;
          
          setStats(prev => ({
            ...prev,
            totalAssets: inventory.length,
            hwAssets: hw,
            swAssets: sw,
            availableAssets: available
          }));
        })
        .catch(e => console.error(e));

      // Tickets (Issues)
      const allRequests = JSON.parse(localStorage.getItem('mock_requests') || '[]');
      const activeIssues = allRequests.filter(r => r.type === 'Issue' && r.status !== 'Resolved' && r.status !== 'Completed');
      const urgentIssues = activeIssues.filter(r => r.priority === 'High' || r.priority === 'Urgent');

      // Licenses
      let expiring = 0;
      const storedLicenses = localStorage.getItem('mock_licenses');
      if (storedLicenses) {
        const licenses = JSON.parse(storedLicenses);
        const today = new Date('2026-07-10'); // using same mock today as LicenseManagement
        licenses.forEach(l => {
          const diffTime = new Date(l.expiryDate) - today;
          const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (daysLeft > 0 && daysLeft <= 30) expiring++;
        });
      } else {
        expiring = 2; // based on initial hardcoded data Figma and Adobe
      }

      setStats(prev => ({
        ...prev,
        activeTickets: activeIssues.length,
        urgentTickets: urgentIssues.length,
        expiringLicenses: expiring
      }));
    } catch(e) {}
  }, [requests]);

  // --- State for Inventory ---
  const [newAsset, setNewAsset] = useState({
    name: '',
    type: 'Hardware',
    tag: '',
    serial: '',
    status: 'Available'
  });
  const [assetSuccessMessage, setAssetSuccessMessage] = useState('');
  const [assetValidated, setAssetValidated] = useState(false);

  // --- State for Maintenance ---
  const [maintenance, setMaintenance] = useState({
    assetId: '',
    type: 'Repair',
    status: 'In Progress',
    notes: ''
  });
  const [maintenanceSuccessMessage, setMaintenanceSuccessMessage] = useState('');
  const [maintValidated, setMaintValidated] = useState(false);

  // --- Handlers ---
  const handleRequestAction = (id, action, employee, asset) => {
    const req = requests.find(r => r.id === id);
    if (!req || !req.fullRequest) return;

    setRequests((prev) => prev.filter((r) => r.id !== id));
    
    const updatedRequest = { ...req.fullRequest, status: action === 'approve' ? 'Approved' : 'Rejected' };
    
    fetch(`http://localhost:8080/api/requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedRequest)
    }).catch(e => console.error(e));

    // Handle side-effects for Approve/Reject
    if (action === 'approve') {
      if (req.type === 'Return' && req.assetId) {
        fetch(`http://localhost:8080/api/assets/${req.assetId}`)
          .then(res => res.json())
          .then(assetObj => {
             assetObj.status = (req.isDamaged && !req.fullRequest.repairProofData) ? 'In Repair' : 'Available';
             assetObj.assignee = '-';
             return fetch(`http://localhost:8080/api/assets/${req.assetId}`, {
               method: 'PUT',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(assetObj)
             });
          })
          .catch(e => console.error(e));
      } else if (req.assetId) {
        fetch(`http://localhost:8080/api/assets/${req.assetId}`)
          .then(res => res.json())
          .then(assetObj => {
             assetObj.status = 'Assigned';
             assetObj.assignee = employee;
             return fetch(`http://localhost:8080/api/assets/${req.assetId}`, {
               method: 'PUT',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(assetObj)
             });
          })
          .catch(e => console.error(e));
      } else {
        // Auto-create new asset and assign it since they requested a custom/new item
        const newAssetData = {
          id: 'AST-' + Math.floor(1000 + Math.random() * 9000),
          name: asset,
          type: req.type === 'Software' ? 'Software' : 'Hardware',
          category: req.type === 'Software' ? 'License' : 'Peripheral',
          status: 'Assigned',
          assignee: employee,
          health: 100,
          dateAdded: new Date().toISOString().split('T')[0]
        };
        fetch('http://localhost:8080/api/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAssetData)
        }).catch(e => console.error(e));
      }
    } else if (action === 'reject') {
      // If Admin rejects a Return request, the asset should revert to 'Assigned' and stay with the employee
      if (req.type === 'Return' && req.assetId) {
        fetch(`http://localhost:8080/api/assets/${req.assetId}`)
          .then(res => res.json())
          .then(assetObj => {
             assetObj.status = 'Assigned';
             // keep the existing assignee (the employee)
             return fetch(`http://localhost:8080/api/assets/${req.assetId}`, {
               method: 'PUT',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(assetObj)
             });
          })
          .catch(e => console.error(e));
      }
      // If Admin rejects a New Request for a specific asset, revert asset from 'Requested' to 'Available'
      else if (req.type === 'Request' && req.assetId) {
         fetch(`http://localhost:8080/api/assets/${req.assetId}`)
          .then(res => res.json())
          .then(assetObj => {
             assetObj.status = 'Available';
             return fetch(`http://localhost:8080/api/assets/${req.assetId}`, {
               method: 'PUT',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(assetObj)
             });
          })
          .catch(e => console.error(e));
      }
    } else if (action === 'reject-for-repair') {
      updatedRequest.status = 'Pending Repair';
      
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + 7); // 7 days from now
      updatedRequest.returnDeadline = deadlineDate.toISOString();
      updatedRequest.fineAmount = 50.0;
      
      fetch(`http://localhost:8080/api/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRequest)
      }).catch(e => console.error(e));
      
      // Ensure asset stays Assigned
      if (req.assetId) {
        fetch(`http://localhost:8080/api/assets/${req.assetId}`)
          .then(res => res.json())
          .then(assetObj => {
             assetObj.status = 'Assigned';
             return fetch(`http://localhost:8080/api/assets/${req.assetId}`, {
               method: 'PUT',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(assetObj)
             });
          }).catch(e => console.error(e));
      }
      toast.error(`Sent to repair. Deadline set to 7 days for ${employee}.`);
      return;
    }
    
    if (action === 'approve') {
      toast.success(`Request Approved for ${employee} (${asset})`);
    } else {
      toast.error(`Request Rejected for ${employee} (${asset})`);
    }
  };

  const handleAssetSubmit = (e) => {
    e.preventDefault();
    setAssetValidated(true);
    const formEl = e.currentTarget;
    if (!formEl.checkValidity()) return;

    toast.success(`Asset "${newAsset.name}" successfully added to inventory! Tag: ${newAsset.tag}`);
    setNewAsset({ name: '', type: 'Hardware', tag: '', serial: '', status: 'Available' });
    setAssetValidated(false);
  };

  const handleMaintSubmit = (e) => {
    e.preventDefault();
    setMaintValidated(true);
    const formEl = e.currentTarget;
    if (!formEl.checkValidity()) return;

    toast.success(`Maintenance ticket submitted for Asset ID "${maintenance.assetId}".`);
    setMaintenance({ assetId: '', type: 'Repair', status: 'In Progress', notes: '' });
    setMaintValidated(false);
  };

  return (
    <div className="admin-dashboard-home">
      {/* ──────────────────────────────────────────────
         Top Row: Analytics Cards
         ────────────────────────────────────────────── */}
      <div className="summary-cards-row">
        {/* Total Assets */}
        <div className="summary-card summary-card--blue" id="card-total-assets" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/inventory')}>
          <div className="summary-card-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <i className="bi bi-boxes" />
          </div>
          <div className="summary-card-body">
            <span className="summary-card-label">Total Assets</span>
            <span className="summary-card-value">{stats.totalAssets.toLocaleString()}</span>
            <span className="summary-card-trend">
              {stats.hwAssets} HW / {stats.swAssets} SW
            </span>
          </div>
        </div>

        {/* Available Assets */}
        <div className="summary-card summary-card--emerald" id="card-available-assets" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/inventory')}>
          <div className="summary-card-icon-wrap" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <i className="bi bi-check-circle" />
          </div>
          <div className="summary-card-body">
            <span className="summary-card-label">Available Assets</span>
            <span className="summary-card-value">{stats.availableAssets.toLocaleString()}</span>
            <span className="summary-card-trend">
              <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill" style={{ fontSize: '0.7rem' }}>Ready to Assign</span>
            </span>
          </div>
        </div>

        {/* Active Maintenance Tickets - Yellow warning */}
        <div className="summary-card summary-card--amber" id="card-active-tickets" style={{ animationDelay: '80ms', cursor: 'pointer' }} onClick={() => navigate('/admin/tickets')}>
          <div className="summary-card-icon-wrap" style={{ background: '#fffbeb', color: '#d97706' }}>
            <i className="bi bi-wrench-adjustable" />
          </div>
          <div className="summary-card-body">
            <span className="summary-card-label">Active Tickets</span>
            <span className="summary-card-value">{stats.activeTickets.toLocaleString()}</span>
            <span className="summary-card-trend text-warning-emphasis" style={{ fontWeight: '500' }}>
              <i className="bi bi-exclamation-triangle-fill me-1 text-amber" /> {stats.urgentTickets} urgent items
            </span>
          </div>
        </div>

        {/* Expiring Licenses (30 Days) - Red warning */}
        <div className="summary-card summary-card--rose" id="card-expiring-licenses" style={{ animationDelay: '160ms', cursor: 'pointer' }} onClick={() => navigate('/admin/licenses')}>
          <div className="summary-card-icon-wrap" style={{ background: '#fff1f2', color: '#e11d48' }}>
            <i className="bi bi-clock-fill" />
          </div>
          <div className="summary-card-body">
            <span className="summary-card-label">Expiring Licenses</span>
            <span className="summary-card-value" style={{ color: '#e11d48' }}>{stats.expiringLicenses.toLocaleString()}</span>
            <span className="summary-card-trend text-danger-emphasis" style={{ fontWeight: '500' }}>
              <i className="bi bi-x-octagon-fill me-1 text-danger" /> Action required
            </span>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────
         Middle Row: Recent Asset Requests Table
         ────────────────────────────────────────────── */}
      <div className="dash-card mb-4" id="recent-asset-requests">
        <div className="dash-card-header">
          <div className="dash-card-header-left">
            <i className="bi bi-envelope-paper dash-card-header-icon" style={{ color: '#0d9488' }} />
            <h2 className="dash-card-title">Recent Asset Requests</h2>
          </div>
          <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-pill">
            {requests.length} Pending Actions
          </span>
        </div>
        <div className="dash-card-body dash-card-body--table">
          {requests.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <i className="bi bi-clipboard2-check fs-2 mb-2 d-block" />
              All requests resolved! No pending items.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="dash-table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Asset Requested</th>
                    <th>Category</th>
                    <th>Date Requested</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr 
                      key={r.id} 
                      onClick={() => setSelectedRequest(r)} 
                      style={{ cursor: 'pointer' }}
                      className="transition-colors hover-bg-light"
                    >
                      <td>
                        <div className="d-flex flex-column">
                          <span className="fw-semibold text-gray-800">{r.name}</span>
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>{r.email}</span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <i className={`bi ${r.type === 'Hardware' ? 'bi-laptop' : 'bi-file-earmark-lock'} text-primary-emphasis`} />
                          <span>{r.asset}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${r.type === 'Hardware' ? 'bg-primary-subtle text-primary border border-primary-subtle' : 'bg-info-subtle text-info border border-info-subtle'} rounded-pill`}>
                          {r.type}
                        </span>
                      </td>
                      <td>{new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td className="text-end" onClick={(e) => e.stopPropagation()}>
                        <div className="d-inline-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                            onClick={() => handleRequestAction(r.id, 'approve', r.name, r.asset)}
                          >
                            <i className="bi bi-check-lg" /> Approve
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                            onClick={() => handleRequestAction(r.id, 'reject', r.name, r.asset)}
                          >
                            <i className="bi bi-x-lg" /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────────
         Bottom Row: Quick Management Forms
         ────────────────────────────────────────────── */}
      <div className="dashboard-columns">
        {/* Add New Asset Form */}
        <div className="dash-card col-item" id="add-asset-card">
          <div className="dash-card-header">
            <div className="dash-card-header-left">
              <i className="bi bi-plus-square dash-card-header-icon" style={{ color: '#0d9488' }} />
              <h2 className="dash-card-title">Add New Asset to Inventory</h2>
            </div>
          </div>
          <div className="dash-card-body">
            {assetSuccessMessage && (
              <div className="alert alert-success d-flex align-items-center gap-2" role="alert">
                <i className="bi bi-check-circle-fill" />
                <div>{assetSuccessMessage}</div>
              </div>
            )}
            <form noValidate className={assetValidated ? 'was-validated' : ''} onSubmit={handleAssetSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label htmlFor="asset-name" className="form-label fw-semibold text-gray-600" style={{ fontSize: '0.82rem' }}>Asset Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="asset-name"
                    required
                    placeholder="e.g., MacBook Pro M3"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  />
                  <div className="invalid-feedback">Asset name is required.</div>
                </div>

                <div className="col-sm-6">
                  <label htmlFor="asset-type" className="form-label fw-semibold text-gray-600" style={{ fontSize: '0.82rem' }}>Type</label>
                  <select
                    className="form-select"
                    id="asset-type"
                    value={newAsset.type}
                    onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                  >
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                  </select>
                </div>

                <div className="col-sm-6">
                  <label htmlFor="asset-status" className="form-label fw-semibold text-gray-600" style={{ fontSize: '0.82rem' }}>Initial Status</label>
                  <select
                    className="form-select"
                    id="asset-status"
                    value={newAsset.status}
                    onChange={(e) => setNewAsset({ ...newAsset, status: e.target.value })}
                  >
                    <option value="Available">Available</option>
                    <option value="Under Review">Under Review</option>
                    <option value="In Repair">In Repair</option>
                  </select>
                </div>

                <div className="col-sm-6">
                  <label htmlFor="asset-tag" className="form-label fw-semibold text-gray-600" style={{ fontSize: '0.82rem' }}>Asset Tag ID</label>
                  <input
                    type="text"
                    className="form-control"
                    id="asset-tag"
                    required
                    placeholder="e.g., TAG-8902"
                    pattern="[A-Za-z0-9\-]+"
                    value={newAsset.tag}
                    onChange={(e) => setNewAsset({ ...newAsset, tag: e.target.value })}
                  />
                  <div className="invalid-feedback">Enter a valid Tag ID (letters, numbers, hyphens).</div>
                </div>

                <div className="col-sm-6">
                  <label htmlFor="asset-serial" className="form-label fw-semibold text-gray-600" style={{ fontSize: '0.82rem' }}>Serial Number</label>
                  <input
                    type="text"
                    className="form-control"
                    id="asset-serial"
                    required
                    placeholder="e.g., C02F9X10Q05D"
                    value={newAsset.serial}
                    onChange={(e) => setNewAsset({ ...newAsset, serial: e.target.value })}
                  />
                  <div className="invalid-feedback">Serial number is required.</div>
                </div>

                <div className="col-12 mt-4">
                  <button type="submit" className="btn btn-teal w-100" style={{ background: '#0d9488', color: '#fff', fontWeight: '600' }}>
                    <i className="bi bi-save me-2" /> Add Asset to Registry
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Perform Maintenance Update Form */}
        <div className="dash-card col-item" id="maint-update-card">
          <div className="dash-card-header">
            <div className="dash-card-header-left">
              <i className="bi bi-wrench-adjustable dash-card-header-icon" style={{ color: '#0d9488' }} />
              <h2 className="dash-card-title">Perform Maintenance Update</h2>
            </div>
          </div>
          <div className="dash-card-body">
            {maintenanceSuccessMessage && (
              <div className="alert alert-success d-flex align-items-center gap-2" role="alert">
                <i className="bi bi-check-circle-fill" />
                <div>{maintenanceSuccessMessage}</div>
              </div>
            )}
            <form noValidate className={maintValidated ? 'was-validated' : ''} onSubmit={handleMaintSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label htmlFor="maint-asset" className="form-label fw-semibold text-gray-600" style={{ fontSize: '0.82rem' }}>Select Asset (Tag / Name)</label>
                  <input
                    type="text"
                    className="form-control"
                    id="maint-asset"
                    required
                    placeholder="e.g., AST-1024 (Dell XPS 15)"
                    value={maintenance.assetId}
                    onChange={(e) => setMaintenance({ ...maintenance, assetId: e.target.value })}
                  />
                  <div className="invalid-feedback">Asset search identifier is required.</div>
                </div>

                <div className="col-sm-6">
                  <label htmlFor="maint-type" className="form-label fw-semibold text-gray-600" style={{ fontSize: '0.82rem' }}>Type of Service</label>
                  <select
                    className="form-select"
                    id="maint-type"
                    value={maintenance.type}
                    onChange={(e) => setMaintenance({ ...maintenance, type: e.target.value })}
                  >
                    <option value="Repair">Hardware Repair</option>
                    <option value="Upgrade">System Upgrade</option>
                    <option value="Tune-up">General Maintenance</option>
                    <option value="Sanitization">Data Wipe</option>
                  </select>
                </div>

                <div className="col-sm-6">
                  <label htmlFor="maint-status" className="form-label fw-semibold text-gray-600" style={{ fontSize: '0.82rem' }}>Service Status</label>
                  <select
                    className="form-select"
                    id="maint-status"
                    value={maintenance.status}
                    onChange={(e) => setMaintenance({ ...maintenance, status: e.target.value })}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="col-12">
                  <label htmlFor="maint-notes" className="form-label fw-semibold text-gray-600" style={{ fontSize: '0.82rem' }}>Maintenance Action Notes</label>
                  <textarea
                    className="form-control"
                    id="maint-notes"
                    rows="3"
                    required
                    placeholder="Provide details about the parts changed, diagnostics run, or software updated."
                    value={maintenance.notes}
                    onChange={(e) => setMaintenance({ ...maintenance, notes: e.target.value })}
                  />
                  <div className="invalid-feedback">Maintenance details are required.</div>
                </div>

                <div className="col-12 mt-3">
                  <button type="submit" className="btn btn-teal w-100" style={{ background: '#0f172a', color: '#fff', fontWeight: '600' }}>
                    <i className="bi bi-clock-history me-2" /> Log Maintenance Activity
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }} onClick={(e) => { if (e.target === e.currentTarget) setSelectedRequest(null); }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header border-bottom-0 pb-0">
                  <h5 className="modal-title fw-bold">Request Details</h5>
                  <button type="button" className="btn-close" onClick={() => setSelectedRequest(null)}></button>
                </div>
                <div className="modal-body pt-4">
                  <div className="mb-4 d-flex align-items-center gap-3">
                    <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold fs-4" style={{ width: '56px', height: '56px' }}>
                      {selectedRequest.name.charAt(0)}
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold">{selectedRequest.name}</h6>
                      <small className="text-muted">{selectedRequest.email}</small>
                    </div>
                  </div>
                  
                  <div className="bg-light rounded-4 p-4 mb-4">
                    <div className="row g-3">
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Asset Requested</small>
                        <div className="fw-semibold text-dark">{selectedRequest.asset}</div>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Category</small>
                        <div>
                          <span className={`badge ${selectedRequest.type === 'Hardware' ? 'bg-primary-subtle text-primary' : 'bg-info-subtle text-info'} rounded-pill`}>
                            {selectedRequest.type}
                          </span>
                        </div>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Date</small>
                        <div className="fw-medium text-dark">{new Date(selectedRequest.date).toLocaleDateString()}</div>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Priority</small>
                        <div>
                          <span className={`badge ${selectedRequest.priority === 'High' ? 'bg-danger-subtle text-danger' : selectedRequest.priority === 'Low' ? 'bg-secondary-subtle text-secondary' : 'bg-success-subtle text-success'} rounded-pill`}>
                            {selectedRequest.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedRequest.type === 'Return' ? (
                    <>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-2">Reason for Return</small>
                        <div className="p-3 bg-light rounded-3 text-dark small lh-base border border-opacity-50">
                          {selectedRequest.returnReason || selectedRequest.desc}
                        </div>
                      </div>
                      
                      {(selectedRequest.isDamaged || selectedRequest.attachmentData) && (
                        <div className="mb-3">
                          {selectedRequest.isDamaged && (
                             <span className="badge bg-danger text-white mb-2"><i className="bi bi-exclamation-triangle-fill me-1" /> Marked as Damaged</span>
                          )}
                          <small className="text-muted d-block mb-2">Attachment (Photo / Document)</small>
                          {selectedRequest.attachmentData ? (
                            <div className="p-2 border rounded text-center bg-light">
                              {selectedRequest.attachmentData.startsWith('data:image') ? (
                                <img src={selectedRequest.attachmentData} alt="Attachment" className="img-fluid rounded shadow-sm" style={{ maxHeight: '200px' }} />
                              ) : (
                                <div className="p-3 text-muted">
                                  <i className="bi bi-file-earmark-pdf fs-1" />
                                  <div>Document Attached</div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-muted small italic">No attachment provided.</div>
                          )}
                        </div>
                      )}
                      {selectedRequest.fullRequest.repairProofData && (
                        <div className="mb-3 mt-4 pt-3 border-top">
                          <span className="badge bg-success text-white mb-2"><i className="bi bi-tools me-1" /> Repair Proof Submitted</span>
                          <small className="text-muted d-block mb-2">After Repair (Attachment)</small>
                          <div className="p-2 border rounded text-center bg-light">
                            {selectedRequest.fullRequest.repairProofData.startsWith('data:image') ? (
                              <img src={selectedRequest.fullRequest.repairProofData} alt="Repair Proof" className="img-fluid rounded shadow-sm" style={{ maxHeight: '200px' }} />
                            ) : (
                              <div className="p-3 text-muted">
                                <i className="bi bi-file-earmark-pdf fs-1" />
                                <div>Document Attached</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      <small className="text-muted d-block mb-2">Business Justification</small>
                      <div className="p-3 bg-light rounded-3 text-dark small lh-base border border-opacity-50">
                        {selectedRequest.desc}
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer border-top-0 pt-0 pb-4 px-4 d-flex gap-2 justify-content-end mt-2">
                  <button type="button" className="btn btn-outline-secondary px-4 rounded-pill fw-medium" onClick={() => { handleRequestAction(selectedRequest.id, 'reject', selectedRequest.name, selectedRequest.asset); setSelectedRequest(null); }}>
                    Reject Request
                  </button>
                  {selectedRequest.isDamaged && !selectedRequest.fullRequest.repairProofData && (
                    <button type="button" className="btn btn-warning px-4 rounded-pill fw-medium text-dark" onClick={() => { handleRequestAction(selectedRequest.id, 'reject-for-repair', selectedRequest.name, selectedRequest.asset); setSelectedRequest(null); }}>
                      <i className="bi bi-tools" /> Reject & Require Repair
                    </button>
                  )}
                  <button type="button" className="btn btn-success px-4 rounded-pill fw-medium" onClick={() => { handleRequestAction(selectedRequest.id, 'approve', selectedRequest.name, selectedRequest.asset); setSelectedRequest(null); }}>
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
