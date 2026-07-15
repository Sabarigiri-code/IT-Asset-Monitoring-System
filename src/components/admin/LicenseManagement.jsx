import React from 'react';
import toast from 'react-hot-toast';

const initialLicenses = [
  { id: 'LIC-001', name: 'Adobe Creative Cloud', vendor: 'Adobe Inc.', assigned: 45, total: 50, expiryDate: '2026-07-25', cost: '₹4,200/mo' },
  { id: 'LIC-002', name: 'Microsoft Office 365', vendor: 'Microsoft', assigned: 142, total: 150, expiryDate: '2026-12-01', cost: '₹1,000/mo' },
  { id: 'LIC-003', name: 'IntelliJ IDEA Ultimate', vendor: 'JetBrains', assigned: 28, total: 30, expiryDate: '2026-08-10', cost: '₹12,000/yr' },
  { id: 'LIC-004', name: 'Figma Organization', vendor: 'Figma', assigned: 15, total: 15, expiryDate: '2026-07-15', cost: '₹3,600/mo' },
  { id: 'LIC-005', name: 'Zoom Enterprise', vendor: 'Zoom Video Comm.', assigned: 200, total: 200, expiryDate: '2026-09-30', cost: '₹1,600/mo' },
];

export default function LicenseManagement() {
  const [showPurchaseModal, setShowPurchaseModal] = React.useState(false);
  const [managingLicense, setManagingLicense] = React.useState(null);
  const [newLicense, setNewLicense] = React.useState({ name: '', vendor: '', total: 10, cost: '₹800/mo', expiryDate: '2026-12-31' });
  const [licenses, setLicenses] = React.useState(() => {
    try {
      const stored = localStorage.getItem('mock_licenses_inr');
      if (stored) return JSON.parse(stored);
      localStorage.setItem('mock_licenses_inr', JSON.stringify(initialLicenses));
      return initialLicenses;
    } catch(e) {
      return initialLicenses;
    }
  });

  const handleRenew = (id) => {
    const updated = licenses.map(lic => {
      if (lic.id === id) {
         const oldDate = new Date(lic.expiryDate);
         oldDate.setFullYear(oldDate.getFullYear() + 1);
         return { ...lic, expiryDate: oldDate.toISOString().split('T')[0] };
      }
      return lic;
    });
    setLicenses(updated);
    localStorage.setItem('mock_licenses_inr', JSON.stringify(updated));
    alert(`License ${id} successfully renewed for another year!`);
  };
  const getDaysUntilExpiry = (dateString) => {
    const today = new Date('2026-07-10');
    const expiry = new Date(dateString);
    const diffTime = Math.abs(expiry - today);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateUsagePercentage = (assigned, total) => {
    return Math.round((assigned / total) * 100);
  };

  return (
    <div className="admin-page-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fs-3 fw-bold text-dark mb-1">License Management</h2>
          <p className="text-muted mb-0">Monitor software subscriptions and upcoming renewals.</p>
        </div>
        <button 
          className="btn btn-outline-primary d-flex align-items-center gap-2 rounded-pill px-4 bg-white shadow-sm"
          onClick={() => setShowPurchaseModal(true)}
        >
          <i className="bi bi-cart-plus"></i> Purchase Licenses
        </button>
      </div>

      <div className="dash-card">
        <div className="dash-card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.95rem' }}>
              <thead className="table-light text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <tr>
                  <th className="ps-4 py-3 fw-semibold border-0 rounded-top-start">Software License</th>
                  <th className="py-3 fw-semibold border-0">Usage Allocation</th>
                  <th className="py-3 fw-semibold border-0">Cost (Per User)</th>
                  <th className="py-3 fw-semibold border-0">Expiration</th>
                  <th className="text-end pe-4 py-3 fw-semibold border-0 rounded-top-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {licenses.map(license => {
                  const daysLeft = getDaysUntilExpiry(license.expiryDate);
                  const usagePct = calculateUsagePercentage(license.assigned, license.total);
                  const isExpiringSoon = daysLeft <= 30;
                  const isFullyAssigned = usagePct >= 100;

                  return (
                    <tr key={license.id} className="border-bottom">
                      <td className="ps-4 py-4">
                        <div className="d-flex align-items-center gap-3">
                          <div className={`rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm ${isExpiringSoon ? 'bg-danger' : 'bg-primary'}`} style={{ width: '45px', height: '45px' }}>
                            <i className="bi bi-window-stack fs-5"></i>
                          </div>
                          <div>
                            <div className="fw-bold text-dark fs-6">{license.name}</div>
                            <div className="text-muted small">{license.vendor} &bull; {license.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4" style={{ width: '25%' }}>
                        <div className="d-flex justify-content-between align-items-end mb-1">
                          <span className="small fw-medium text-dark">{license.assigned} / {license.total} Seats</span>
                          <span className={`badge ${isFullyAssigned ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'} rounded-pill`} style={{ fontSize: '0.7rem' }}>
                            {usagePct}%
                          </span>
                        </div>
                        <div className="progress rounded-pill bg-light" style={{ height: '6px' }}>
                          <div className={`progress-bar rounded-pill ${isFullyAssigned ? 'bg-danger' : 'bg-success'}`} role="progressbar" style={{ width: `${usagePct}%` }}></div>
                        </div>
                      </td>
                      <td className="py-4 text-muted fw-medium">{license.cost}</td>
                      <td className="py-4">
                        <div className="d-flex flex-column">
                          <span className={`fw-bold ${isExpiringSoon ? 'text-danger' : 'text-dark'}`}>
                            {new Date(license.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className={`small ${isExpiringSoon ? 'text-danger fw-medium' : 'text-muted'}`}>
                            {isExpiringSoon ? <><i className="bi bi-exclamation-circle-fill me-1"></i> Expires in {daysLeft} days</> : `In ${daysLeft} days`}
                          </span>
                        </div>
                      </td>
                      <td className="text-end pe-4 py-4">
                        {isExpiringSoon ? (
                          <button 
                            className="btn btn-sm btn-danger shadow-sm rounded-pill px-3 fw-medium"
                            onClick={() => handleRenew(license.id)}
                          >
                            Renew Now
                          </button>
                        ) : (
                          <button 
                            className="btn btn-sm btn-light border text-primary shadow-sm rounded-pill px-3 fw-medium"
                            onClick={() => setManagingLicense(license)}
                          >
                            Manage
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="modal-overlay d-flex align-items-center justify-content-center" style={{ zIndex: 1100, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}>
          <div className="bg-white rounded-4 shadow-lg p-4 animation-zoom-in" style={{ maxWidth: '500px', width: '95%' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0">Vendor Marketplace</h4>
              <button className="btn-close" onClick={() => setShowPurchaseModal(false)}></button>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-bold">Software Name</label>
              <input type="text" className="form-control" placeholder="e.g. Slack Pro" value={newLicense.name} onChange={e => setNewLicense({...newLicense, name: e.target.value})} />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-bold">Vendor</label>
              <input type="text" className="form-control" placeholder="e.g. Slack Technologies" value={newLicense.vendor} onChange={e => setNewLicense({...newLicense, vendor: e.target.value})} />
            </div>
            <div className="row mb-3">
              <div className="col-6">
                <label className="form-label small fw-bold">Seats (Quantity)</label>
                <input type="number" className="form-control" value={newLicense.total} onChange={e => setNewLicense({...newLicense, total: parseInt(e.target.value) || 0})} />
              </div>
              <div className="col-6">
                <label className="form-label small fw-bold">Cost</label>
                <input type="text" className="form-control" value={newLicense.cost} onChange={e => setNewLicense({...newLicense, cost: e.target.value})} />
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label small fw-bold">Expiration Date</label>
              <input type="date" className="form-control" value={newLicense.expiryDate} onChange={e => setNewLicense({...newLicense, expiryDate: e.target.value})} />
            </div>
            <button className="btn btn-primary w-100 rounded-pill py-2 fw-bold" onClick={() => {
              if(!newLicense.name || !newLicense.vendor) return toast.error("Please fill in software and vendor names");
              const toAdd = {
                id: 'LIC-' + Math.floor(100 + Math.random() * 900),
                name: newLicense.name,
                vendor: newLicense.vendor,
                assigned: 0,
                total: newLicense.total,
                expiryDate: newLicense.expiryDate,
                cost: newLicense.cost
              };
              const updated = [...licenses, toAdd];
              setLicenses(updated);
              localStorage.setItem('mock_licenses_inr', JSON.stringify(updated));
              setShowPurchaseModal(false);
              toast.success(`Purchased ${newLicense.total} seats of ${newLicense.name}!`);
              setNewLicense({ name: '', vendor: '', total: 10, cost: '₹800/mo', expiryDate: '2026-12-31' });
            }}>Confirm Purchase</button>
          </div>
        </div>
      )}

      {/* Manage Modal */}
      {managingLicense && (
        <div className="modal-overlay d-flex align-items-center justify-content-center" style={{ zIndex: 1100, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}>
          <div className="bg-white rounded-4 shadow-lg p-4 animation-zoom-in" style={{ maxWidth: '400px', width: '95%' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Manage License</h5>
              <button className="btn-close" onClick={() => setManagingLicense(null)}></button>
            </div>
            <div className="bg-light p-3 rounded-3 mb-4">
              <h6 className="fw-bold">{managingLicense.name}</h6>
              <div className="text-muted small mb-2">{managingLicense.vendor} • {managingLicense.id}</div>
              <div className="d-flex justify-content-between mb-1 small">
                <span>Usage:</span>
                <span className="fw-bold">{managingLicense.assigned} / {managingLicense.total} Seats</span>
              </div>
              <div className="d-flex justify-content-between mb-1 small">
                <span>Cost:</span>
                <span className="fw-bold">{managingLicense.cost}</span>
              </div>
            </div>
            <button className="btn btn-outline-primary w-100 rounded-pill mb-2" onClick={() => {
              const updated = licenses.map(l => l.id === managingLicense.id ? { ...l, total: l.total + 5 } : l);
              setLicenses(updated);
              localStorage.setItem('mock_licenses_inr', JSON.stringify(updated));
              setManagingLicense({...managingLicense, total: managingLicense.total + 5});
              toast.success("Successfully added 5 more seats!");
            }}>
              <i className="bi bi-plus-circle me-2"></i>Buy 5 More Seats
            </button>
            <button className="btn btn-outline-danger w-100 rounded-pill" onClick={() => {
              const updated = licenses.filter(l => l.id !== managingLicense.id);
              setLicenses(updated);
              localStorage.setItem('mock_licenses_inr', JSON.stringify(updated));
              setManagingLicense(null);
              toast.success("License subscription cancelled.");
            }}>
              <i className="bi bi-x-circle me-2"></i>Cancel Subscription
            </button>
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
    </div>
  );
}
