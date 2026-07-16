import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';

function StatusBadge({ status }) {
  const map = {
    Active: 'badge--active',
    'Under Review': 'badge--review',
    'Pending Return': 'badge--review',
    Returned: 'badge--returned',
  };
  return <span className={`asset-badge ${map[status] || ''}`}>{status}</span>;
}

const getAssetImage = (asset) => {
  const name = (asset.name || '').toLowerCase();
  const cat = (asset.category || '').toLowerCase();
  
  if (name.includes('iphone') || name.includes('phone') || name.includes('mobile') || cat.includes('phone')) {
    return 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80';
  } else if (name.includes('mac') || name.includes('apple') || name.includes('ipad')) {
    return '/images/laptop.png';
  } else if (cat.includes('monitor') || name.includes('monitor') || name.includes('display') || name.includes('ultrasharp') || name.includes('screen')) {
    return '/images/monitor.png';
  } else if (name.includes('dell') || name.includes('thinkpad') || name.includes('lenovo') || name.includes('hp')) {
    return '/images/laptop.png';
  } else if (cat.includes('laptop')) {
    return '/images/laptop.png';
  } else if (asset.type === 'Software' || cat.includes('license') || name.includes('software') || name.includes('office') || name.includes('adobe') || name.includes('jetbrains')) {
    return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80';
  } else if (name.includes('keyboard')) {
    return '/images/keyboard.png';
  } else if (name.includes('mouse')) {
    return '/images/mouse.png';
  }
  
  // default peripheral/hardware
  const arr = [
    '/images/keyboard.png',
    '/images/mouse.png'
  ];
  return arr[(asset.id || 'A').charCodeAt(0) % arr.length];
};

export default function MyAssets() {
  const { userName, userEmail } = useOutletContext() || { userName: 'Saurabh Kumar', userEmail: 'saurabh.k@company.com' };
  const [assets, setAssets] = useState([]);
  const [requests, setRequests] = useState([]);
  const [reportingAsset, setReportingAsset] = useState(null);
  const [issueDesc, setIssueDesc] = useState('');
  const [issueImage, setIssueImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [returnModalData, setReturnModalData] = useState(null); // { asset, reason, isDamaged, attachmentData }
  const [repairModalData, setRepairModalData] = useState(null); // { request, attachmentData }
  const [returningId, setReturningId] = useState(null);

  const handleReturnModalOpen = (asset) => {
    setReturnModalData({
      asset: asset,
      reason: '',
      isDamaged: false,
      attachmentData: ''
    });
  };

  const handleRepairModalOpen = (req) => {
    setRepairModalData({
      request: req,
      attachmentData: ''
    });
  };

  const handleReturnModalClose = () => {
    setReturnModalData(null);
  };

  const handleRepairModalClose = () => {
    setRepairModalData(null);
  };

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    if (!returnModalData) return;
    
    const asset = returnModalData.asset;
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
      returnReason: returnModalData.reason,
      isDamaged: returnModalData.isDamaged,
      attachmentData: returnModalData.attachmentData
    };

    fetch('https://it-asset-monitoring-system.onrender.com/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReq)
    })
    .then((res) => {
      if (!res.ok) throw new Error('Failed to create request');
      return fetch(`https://it-asset-monitoring-system.onrender.com/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...asset, status: 'Pending Return' })
      });
    })
    .then((res) => {
      if (!res.ok) throw new Error('Failed to update asset');
      toast.success(`Return request submitted for ${asset.name}`);
      setReturningId(null);
      setIsSubmitting(false);
      setReturnModalData(null);
      setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, status: 'Pending Return' } : a));
    })
    .catch(e => {
      toast.error('Failed to submit return request.');
      setReturningId(null);
      setIsSubmitting(false);
    });
  };

  const handleReturnFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReturnModalData(prev => prev ? ({ ...prev, attachmentData: reader.result }) : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRepairFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRepairModalData(prev => prev ? ({ ...prev, attachmentData: reader.result }) : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRepairSubmit = (e) => {
    e.preventDefault();
    if (!repairModalData || !repairModalData.attachmentData) {
      toast.error('Please attach proof of repair.');
      return;
    }
    setIsSubmitting(true);
    const updatedReq = { 
      ...repairModalData.request, 
      repairProofData: repairModalData.attachmentData,
      status: 'Repair Proof Submitted'
    };
    
    fetch(`https://it-asset-monitoring-system.onrender.com/api/requests/${repairModalData.request.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedReq)
    })
    .then(() => {
      toast.success('Repair proof submitted! Admin will review it shortly.');
      setRequests(prev => prev.map(r => r.id === updatedReq.id ? updatedReq : r));
      setIsSubmitting(false);
      setRepairModalData(null);
    })
    .catch(e => {
      console.error(e);
      toast.error('Failed to submit repair proof.');
      setIsSubmitting(false);
    });
  };

  const handlePayFine = (req) => {
    if(window.confirm(`Are you sure you want to pay the fine of $${req.fineAmount}?`)) {
       const updatedReq = { ...req, fineAmount: 0 };
       fetch(`https://it-asset-monitoring-system.onrender.com/api/requests/${req.id}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(updatedReq)
       }).then(() => {
         toast.success('Fine paid successfully.');
         setRequests(prev => prev.map(r => r.id === updatedReq.id ? updatedReq : r));
       });
    }
  };

  const exportCSV = () => {
    const headers = ['Asset ID', 'Name', 'Category', 'Type', 'Status', 'Date Assigned'];
    const rows = assets.map(a => [
      a.id, 
      `"${a.name}"`, 
      a.category, 
      a.type, 
      a.status, 
      new Date(a.dateAdded).toLocaleDateString()
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `assets_report_${userName.replace(' ', '_')}.csv`;
    link.click();
  };

  useEffect(() => {
    Promise.all([
      fetch('https://it-asset-monitoring-system.onrender.com/api/assets').then(r => r.json()),
      fetch('https://it-asset-monitoring-system.onrender.com/api/requests').then(r => r.json())
    ])
    .then(([assetsData, requestsData]) => {
      setAssets(assetsData.filter(a => String(a.assignee || '').trim().toLowerCase() === String(userName || '').trim().toLowerCase()));
      setRequests(requestsData.filter(r => String(r.requesterEmail || '').trim().toLowerCase() === String(userEmail || '').trim().toLowerCase()));
    })
    .catch(err => console.error(err));
  }, [userName, userEmail]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIssueImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReportSubmit = () => {
    if (!issueDesc.trim()) return;
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      // Create repair request
      const newReq = {
        item: reportingAsset.name,
        category: reportingAsset.type,
        justification: `Issue reported: ${issueDesc}`,
        requesterName: userName,
        requesterEmail: userEmail,
        status: 'Pending',
        assetId: reportingAsset.id
      };
      
      fetch('https://it-asset-monitoring-system.onrender.com/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReq)
      })
      .then(() => {
        setIsSubmitting(false);
        setReportingAsset(null);
        setIssueDesc('');
        setIssueImage(null);
        toast.success('Issue reported successfully! The Admin will review your repair request.');
      })
      .catch(err => {
        console.error(err);
        setIsSubmitting(false);
        toast.error('Failed to report issue.');
      });
    }, 800);
  };

  return (
    <div className="page-container animation-fade-in" id="print-area">
      {/* Print-only Formal Receipt */}
      <div className="d-none d-print-block print-receipt-container text-dark" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Receipt Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-2 border-dark pb-3">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-primary text-white p-2 rounded-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: 'var(--primary-600)' }}>
               <i className="bi bi-cpu fs-4" />
            </div>
            <div>
              <h3 className="fw-bold mb-0 text-uppercase" style={{ letterSpacing: '1px', color: 'var(--primary-600)' }}>ITAMS</h3>
              <small className="text-muted fw-semibold">IT Asset Monitoring System</small>
            </div>
          </div>
          <div className="text-end">
            <h5 className="fw-bold mb-1">OFFICIAL ASSET RECEIPT</h5>
            <div className="text-muted small">
              <strong>Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}<br/>
              <strong>Time:</strong> {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}<br/>
              <strong>Doc ID:</strong> RCPT-{Math.floor(100000 + Math.random() * 900000)}
            </div>
          </div>
        </div>

        {/* Employee Details */}
        <div className="bg-light p-4 rounded-3 border mb-4">
          <h6 className="fw-bold text-uppercase text-muted mb-3" style={{ letterSpacing: '0.5px' }}>Assignee Details</h6>
          <div className="row">
            <div className="col-6">
              <p className="mb-1"><strong>Name:</strong> {userName}</p>
              <p className="mb-0"><strong>Email:</strong> {userEmail}</p>
            </div>
            <div className="col-6">
              <p className="mb-1"><strong>Department:</strong> Engineering / Staff</p>
              <p className="mb-0"><strong>Status:</strong> Active Employee</p>
            </div>
          </div>
        </div>

        {/* Assets Table */}
        <div className="mb-4">
          <h6 className="fw-bold text-uppercase text-muted mb-3" style={{ letterSpacing: '0.5px' }}>Assigned Equipment ({assets.length} items)</h6>
          <table className="table table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th className="py-2 text-uppercase text-muted small" style={{ letterSpacing: '0.5px' }}>Asset ID</th>
                <th className="py-2 text-uppercase text-muted small" style={{ letterSpacing: '0.5px' }}>Item Name</th>
                <th className="py-2 text-uppercase text-muted small" style={{ letterSpacing: '0.5px' }}>Type</th>
                <th className="py-2 text-uppercase text-muted small" style={{ letterSpacing: '0.5px' }}>Assigned Date</th>
                <th className="py-2 text-uppercase text-muted small text-center" style={{ letterSpacing: '0.5px' }}>Health</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(asset => (
                <tr key={asset.id}>
                  <td className="fw-semibold font-monospace small">{asset.id}</td>
                  <td>
                    <div className="fw-bold text-dark">{asset.name}</div>
                    <div className="text-muted small">{asset.category}</div>
                  </td>
                  <td>{asset.type}</td>
                  <td>{asset.dateAdded ? new Date(asset.dateAdded).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</td>
                  <td className="text-center">{asset.health}%</td>
                </tr>
              ))}
              {assets.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">No assets currently assigned.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Terms and Conditions (Forced to next page) */}
        <div style={{ pageBreakBefore: 'always', breakBefore: 'page' }}>
          <div className="mb-5 px-4 py-3 border-start border-4 border-warning bg-warning bg-opacity-10 rounded-end">
            <h6 className="fw-bold mb-2">Terms & Conditions of Asset Assignment</h6>
            <p className="small text-muted mb-0 lh-lg" style={{ textAlign: 'justify' }}>
              I, the undersigned, acknowledge the receipt of the above-listed IT assets in good and working condition. 
              I agree to use these assets exclusively for company business and in compliance with the IT Acceptable Use Policy. 
              I understand that I am fully responsible for the care, physical security, and proper maintenance of these assets. 
              In the event of damage, loss, or theft, I will immediately report it to the IT Department. 
              I also agree to return all listed assets upon request, or immediately upon termination of my employment.
            </p>
          </div>

          {/* Signatures */}
          <div className="row mt-5 pt-4">
            <div className="col-6 text-center">
              <div className="border-bottom border-dark mx-auto mb-2" style={{ width: '80%' }}></div>
              <p className="fw-bold mb-0">Employee Signature</p>
              <small className="text-muted">Date: ________________</small>
            </div>
            <div className="col-6 text-center">
              <div className="border-bottom border-dark mx-auto mb-2" style={{ width: '80%' }}></div>
              <p className="fw-bold mb-0">IT Administrator Signature</p>
              <small className="text-muted">Date: ________________</small>
            </div>
          </div>
          
          {/* Footer */}
          <div className="text-center mt-5 pt-3 border-top text-muted small">
            Confidential & Proprietary • IT Asset Monitoring System • Page 2 of 2
          </div>
        </div>
      </div>

      <div className="page-header d-flex justify-content-between align-items-center mb-4 d-print-none">
        <div>
          <h1 className="h3 fw-bold mb-1 text-dark">My Assigned Assets</h1>
          <p className="text-muted mb-0">View and manage the hardware and software currently assigned to you ({assets.length} items).</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-primary shadow-sm bg-white" 
            onClick={exportCSV}
          >
            <i className="bi bi-filetype-csv me-2" /> Export CSV
          </button>
          <button 
            className="btn btn-primary shadow-sm" 
            style={{ backgroundColor: 'var(--primary-600)', border: 'none' }}
            onClick={() => window.print()}
          >
            <i className="bi bi-download me-2" /> Export PDF
          </button>
        </div>
      </div>

      <div className="row g-4 d-print-none">
        {assets.map((asset, index) => {
          const pendingRepairReq = requests.find(r => r.assetId === asset.id && r.status === 'Pending Repair');
          const isOverdue = pendingRepairReq && new Date(pendingRepairReq.returnDeadline) < new Date();
          const hasFine = pendingRepairReq && pendingRepairReq.fineAmount > 0;
          
          return (
          <div className="col-12 col-md-6 col-xl-4" key={asset.id} style={{ animationDelay: `${index * 100}ms` }}>
            <div className="card h-100 border-0 shadow-sm rounded-4 asset-card-hover overflow-hidden" style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}>
              <div className="bg-light d-flex align-items-center justify-content-center p-3" style={{ height: '160px', overflow: 'hidden' }}>
                 <img src={getAssetImage(asset)} alt={asset.category} className="w-100 h-100 object-fit-contain" />
              </div>
              <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="icon-box rounded-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)' }}>
                      <i className={`bi ${asset.type === 'Hardware' ? (asset.category === 'Laptop' ? 'bi-laptop' : 'bi-display') : 'bi-box-seam'} fs-4`} />
                    </div>
                    <div>
                      <h5 className="mb-1 fw-bold text-dark" style={{ fontSize: '1.1rem' }}>{asset.name}</h5>
                      <span className="text-muted small fw-medium">{asset.category}</span>
                    </div>
                  </div>
                  <StatusBadge status={asset.status === 'Assigned' ? 'Active' : asset.status} />
                </div>
                
                <div className="bg-light rounded-3 p-3 mb-3 border">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Asset ID:</span>
                    <span className="fw-semibold font-monospace small">{asset.id}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted small">Assigned:</span>
                    <span className="fw-medium small">{asset.dateAdded ? new Date(asset.dateAdded).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                  </div>
                </div>

                <div className="mb-4 d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small d-block mb-1">Health:</span>
                    <span className="text-dark small d-block">{asset.health}%</span>
                  </div>
                  <div className="text-end">
                    <span className="text-muted small d-block mb-1">Asset Type:</span>
                    <span className="text-dark fw-bold small d-block">{asset.type}</span>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-top d-print-none">
                  <div className="d-flex gap-2 w-100">
                    {pendingRepairReq ? (
                      <div className="d-flex flex-column gap-2 w-100">
                        {isOverdue && hasFine && (
                          <div className="alert alert-danger py-2 px-3 mb-1 small d-flex justify-content-between align-items-center">
                            <span><strong>Fine Due:</strong> ${pendingRepairReq.fineAmount}</span>
                            <button className="btn btn-sm btn-danger py-0" onClick={() => handlePayFine(pendingRepairReq)}>Pay Now</button>
                          </div>
                        )}
                        <button 
                          className="btn btn-warning w-100 fw-medium d-flex align-items-center justify-content-center gap-2"
                          onClick={() => handleRepairModalOpen(pendingRepairReq)}
                        >
                          <i className="bi bi-tools" /> Submit Repair Proof
                        </button>
                      </div>
                    ) : (
                      <>
                        <button 
                          className="btn btn-outline-danger flex-grow-1 fw-medium d-flex align-items-center justify-content-center gap-2"
                          onClick={() => handleReturnModalOpen(asset)}
                          disabled={returningId === asset.id || asset.status === 'Pending Return'}
                        >
                          {returningId === asset.id ? (
                            <span className="spinner-border spinner-border-sm" />
                          ) : (
                            <><i className="bi bi-arrow-return-left" /> {asset.status === 'Pending Return' ? 'Returning...' : 'Return'}</>
                          )}
                        </button>
                        <button 
                          className="btn btn-outline-secondary flex-grow-1 fw-medium d-flex align-items-center justify-content-center gap-2"
                          onClick={() => setReportingAsset(asset)}
                          disabled={asset.status === 'Pending Return'}
                        >
                          <i className="bi bi-exclamation-triangle" /> Report
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )})}
      </div>

      {/* Report Issue Modal */}
      {reportingAsset && (
        <div className="modal-overlay d-flex align-items-center justify-content-center" onClick={() => !isSubmitting && setReportingAsset(null)}>
          <div className="modal-card bg-white rounded-4 shadow-lg overflow-hidden animation-zoom-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '100%', margin: '1rem' }}>
            <div className="modal-header bg-danger-subtle border-bottom-0 p-4 d-flex justify-content-between align-items-start">
              <div className="d-flex align-items-center gap-3">
                <div className="icon-box rounded-circle d-flex align-items-center justify-content-center bg-white text-danger shadow-sm" style={{ width: '48px', height: '48px' }}>
                  <i className="bi bi-exclamation-triangle fs-4" />
                </div>
                <div>
                  <h4 className="mb-0 fw-bold text-dark fs-5">Report Issue</h4>
                  <span className="text-muted small">For {reportingAsset.name} ({reportingAsset.id})</span>
                </div>
              </div>
              <button className="btn-close shadow-none mt-1" onClick={() => !isSubmitting && setReportingAsset(null)} disabled={isSubmitting} aria-label="Close" />
            </div>
            
            <div className="modal-body p-4">
              <div className="mb-3">
                <label className="form-label fw-semibold small text-dark">Describe the problem</label>
                <textarea 
                  className="form-control" 
                  rows="4" 
                  placeholder="E.g., Screen is flickering, battery won't hold charge, etc."
                  value={issueDesc}
                  onChange={(e) => setIssueDesc(e.target.value)}
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold small text-dark">Upload Damage Photo (Optional)</label>
                <input 
                  type="file" 
                  className="form-control form-control-sm" 
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />
                {issueImage && (
                  <div className="mt-2 text-center bg-light rounded-3 p-2 border">
                    <img src={issueImage} alt="Damage preview" className="img-thumbnail rounded" style={{ maxHeight: '150px' }} />
                  </div>
                )}
              </div>
              <p className="text-muted small mb-0">
                <i className="bi bi-info-circle me-1" /> This will automatically create a high-priority ticket in the IT Helpdesk for this specific asset.
              </p>
            </div>
            
            <div className="modal-footer p-3 bg-light border-top d-flex justify-content-end gap-2">
              <button 
                className="btn btn-outline-secondary btn-sm px-4 rounded-pill" 
                onClick={() => setReportingAsset(null)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger btn-sm px-4 rounded-pill d-flex align-items-center" 
                onClick={handleReportSubmit} 
                disabled={!issueDesc.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Submitting...</>
                ) : 'Submit Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Repair Asset Modal */}
      {repairModalData && (
        <div className="app-modal-overlay" onClick={handleRepairModalClose}>
          <div className="app-modal-card" onClick={e => e.stopPropagation()}>
            <div className="app-modal-header">
              <h3 className="app-modal-title">
                <i className="bi bi-tools me-2 text-warning" />
                Submit Repair Proof: {repairModalData.request.title}
              </h3>
              <button className="app-modal-close" onClick={handleRepairModalClose} type="button">
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <form onSubmit={handleRepairSubmit}>
              <div className="app-modal-body">
                <div className="alert alert-warning small mb-3">
                  Your return request was rejected due to damage. Please repair the asset and upload proof to proceed with the return.
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-muted small">Upload After-Repair Photo</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    accept="image/*" 
                    onChange={handleRepairFileChange}
                    required
                  />
                  {repairModalData.attachmentData && (
                    <div className="mt-2 text-center bg-light rounded p-2">
                      <img src={repairModalData.attachmentData} alt="Repair Preview" style={{ maxHeight: '150px' }} className="img-thumbnail" />
                    </div>
                  )}
                </div>
              </div>
              <div className="app-modal-footer">
                <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={handleRepairModalClose}>Cancel</button>
                <button type="submit" className="btn btn-warning btn-sm px-4" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Proof'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
      
      <style>{`
        .asset-card-hover:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg) !important;
        }
        .animation-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 1050;
          backdrop-filter: blur(2px);
          animation: fadeIn 0.2s ease-out;
        }
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
