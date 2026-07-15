import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';

const getIcon = (category) => {
  if(category === 'Laptop') return 'bi-laptop';
  if(category === 'Monitor') return 'bi-display';
  if(category === 'Peripheral') return 'bi-mouse2';
  if(category === 'License' || category === 'Software') return 'bi-windows';
  return 'bi-box-seam';
};

function StatusBadge({ status }) {
  const map = {
    Active: 'badge--active',
    'Under Review': 'badge--review',
    Returned: 'badge--returned',
  };
  return <span className={`asset-badge ${map[status] || ''}`}>{status}</span>;
}

export default function AssetsTable() {
  const { userName, userEmail } = useOutletContext() || { userName: 'Saurabh Kumar', userEmail: 'saurabh.k@company.com' };
  const [assets, setAssets] = useState([]);
  const [returnModalData, setReturnModalData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [returningId, setReturningId] = useState(null);

  const handleReturnModalOpen = (asset) => {
    setReturnModalData({ asset, reason: '', isDamaged: false, attachmentData: '' });
  };

  const handleReturnModalClose = () => {
    setReturnModalData(null);
  };

  const handleReturnFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setReturnModalData(prev => ({ ...prev, attachmentData: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    if (!returnModalData) return;
    const { asset, reason, isDamaged, attachmentData } = returnModalData;
    setReturningId(asset.id);
    setIsSubmitting(true);

    const newReq = {
      id: 'REQ-' + Math.floor(1000 + Math.random() * 9000),
      type: 'Return',
      title: asset.name,
      assetId: asset.id,
      date: new Date().toISOString(),
      status: 'Pending Approval',
      priority: 'Normal',
      icon: 'bi-arrow-return-left',
      color: 'rose',
      desc: 'Asset surrender request.',
      requesterName: userName,
      requesterEmail: userEmail,
      returnReason: reason,
      isDamaged: isDamaged,
      attachmentData: attachmentData
    };

    fetch('http://localhost:8080/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReq)
    })
    .then((res) => {
      if (!res.ok) throw new Error('Failed to create request');
      return fetch(`http://localhost:8080/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...asset, status: 'Pending Return' })
      });
    })
    .then((res) => {
      if (!res.ok) throw new Error('Failed to update asset');
      toast.success(`Return request for ${asset.name} submitted!`);
      setAssets(prev => prev.filter(a => a.id !== asset.id));
    })
    .catch(e => {
      console.error(e);
      toast.error('Failed to submit return request.');
    })
    .finally(() => {
      setReturningId(null);
      setIsSubmitting(false);
      setReturnModalData(null);
    });
  };

  useEffect(() => {
    fetch('http://localhost:8080/api/assets')
      .then(res => res.json())
      .then(data => {
        // Exclude 'Pending Return' assets from this quick dashboard view
        setAssets(data.filter(a => 
          String(a.assignee || '').trim().toLowerCase() === String(userName || '').trim().toLowerCase()
          && a.status !== 'Pending Return'
        ));
      })
      .catch(err => console.error(err));
  }, [userName]);

  return (
    <div className="dash-card" id="my-current-assets">
      <div className="dash-card-header d-flex justify-content-between align-items-center">
        <div className="dash-card-header-left d-flex align-items-center">
          <i className="bi bi-hdd-stack dash-card-header-icon me-2" />
          <h2 className="dash-card-title mb-0">My Current Assets</h2>
        </div>
        <div className="d-flex align-items-center gap-3">
          <Link to="/dashboard/new-request" className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm d-flex align-items-center" style={{ fontSize: '0.8rem', backgroundColor: 'var(--primary-600)', border: 'none' }}>
            <i className="bi bi-plus-lg me-1" /> Request Asset
          </Link>
          <Link to="/dashboard/my-assets" className="dash-card-view-all text-decoration-none d-flex align-items-center" id="view-all-assets">
            View All <i className="bi bi-arrow-right ms-1" />
          </Link>
        </div>
      </div>
      <div className="dash-card-body dash-card-body--table">
        <div className="table-responsive">
          <table className="dash-table" aria-label="Currently assigned assets">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Asset ID</th>
                <th>Type</th>
                <th>Date Assigned</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="asset-name-cell">
                      <div className="asset-icon-sm">
                        <i className={`bi ${getIcon(a.category)}`} />
                      </div>
                      <span className="asset-name-text">{a.name}</span>
                    </div>
                  </td>
                  <td><code className="asset-id-code">{a.id}</code></td>
                  <td>{a.category || a.type}</td>
                  <td>{new Date(a.dateAdded || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td><StatusBadge status="Active" /></td>
                  <td className="text-end">
                    <button 
                      className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 text-nowrap d-inline-flex align-items-center gap-1"
                      style={{ fontSize: '0.75rem' }}
                      disabled={returningId === a.id}
                      onClick={() => handleReturnModalOpen(a)}
                    >
                      {returningId === a.id ? (
                        <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span></>
                      ) : (
                        <><i className="bi bi-arrow-return-left" /> Return</>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {assets.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">No assets assigned yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Asset Modal */}
      {returnModalData && (
        <div className="app-modal-overlay" onClick={handleReturnModalClose}>
          <div className="app-modal-card" onClick={e => e.stopPropagation()}>
            <div className="app-modal-header">
              <h3 className="app-modal-title">
                <i className="bi bi-arrow-return-left me-2 text-danger" />
                Return Asset: {returnModalData.asset.name}
              </h3>
              <button className="app-modal-close" onClick={handleReturnModalClose} type="button">
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <form onSubmit={handleReturnSubmit}>
              <div className="app-modal-body">
                <p className="text-muted small mb-3">Please provide the reason for returning this asset and attach a photo to verify its condition.</p>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-muted small">Reason for Return</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    required 
                    placeholder="e.g. Device is constantly overheating and shutting down."
                    value={returnModalData.reason}
                    onChange={(e) => setReturnModalData(prev => ({...prev, reason: e.target.value}))}
                  />
                </div>
                <div className="mb-3 form-check">
                  <input 
                    type="checkbox" 
                    className="form-check-input" 
                    id="isDamagedCheck" 
                    checked={returnModalData.isDamaged}
                    onChange={(e) => setReturnModalData(prev => ({...prev, isDamaged: e.target.checked}))}
                  />
                  <label className="form-check-label fw-semibold text-muted small" htmlFor="isDamagedCheck">
                    Asset is damaged or requires maintenance
                  </label>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-muted small">Attachment (Photo / Document)</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    accept="image/*,.pdf" 
                    onChange={handleReturnFileChange}
                    required 
                  />
                  <div className="form-text text-danger">A photo of the asset is required for all returns.</div>
                  {returnModalData.attachmentData && (
                    <div className="mt-2 text-success small">
                      <i className="bi bi-check-circle-fill me-1" /> File successfully attached
                    </div>
                  )}
                </div>
              </div>
              <div className="app-modal-footer">
                <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={handleReturnModalClose}>Cancel</button>
                <button type="submit" className="btn btn-danger btn-sm px-4" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Return Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
