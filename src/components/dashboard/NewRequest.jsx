import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function NewRequest() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('Hardware');
  const [formData, setFormData] = useState({
    item: '',
    assetId: '', // To store the specific asset ID if selected
    priority: 'Normal',
    justification: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inventory, setInventory] = useState([]);

  React.useEffect(() => {
    fetch('http://localhost:8080/api/assets')
      .then(res => res.json())
      .then(data => setInventory(data))
      .catch(e => console.error(e));
  }, []);

  const availableAssets = inventory.filter(a => a.status === 'Available' && a.type === category);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Optional client-side duplicate check
    // Ensure they didn't just submit this
    setIsSubmitting(true);
    
    setTimeout(() => {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const newReqId = 'REQ-' + Math.floor(1000 + Math.random() * 9000);
      const newReq = {
        id: newReqId,
        type: 'Request',
        title: formData.item,
        assetId: formData.assetId,
        date: new Date().toISOString(),
        status: 'Pending Approval',
        priority: formData.priority,
        icon: category === 'Hardware' ? 'bi-laptop' : category === 'Software' ? 'bi-box-seam' : 'bi-key',
        color: 'amber',
        desc: formData.justification,
        requesterName: user.name || 'Anonymous User',
        requesterEmail: user.email || 'user@example.com'
      };
      
      fetch('http://localhost:8080/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReq)
      })
      .then(res => res.json())
      .then(() => {
        // If they requested a specific asset, update its backend status so it disappears from the available list
        if (formData.assetId) {
          const requestedAsset = inventory.find(a => a.id === formData.assetId);
          if (requestedAsset) {
            fetch(`http://localhost:8080/api/assets/${formData.assetId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...requestedAsset, status: 'Requested' })
            });
          }
        }
        setIsSubmitting(false);
        toast.success(`Request for ${formData.item} submitted!`);
        navigate('/dashboard/status-tracker');
      })
      .catch(e => {
        console.error(e);
        toast.error('Failed to submit request.');
        setIsSubmitting(false);
      });
    }, 800);
  };

  const categories = [
    { id: 'Hardware', icon: 'bi-laptop', desc: 'Laptops, Monitors, Peripherals' },
    { id: 'Software', icon: 'bi-box-seam', desc: 'Licenses, Applications, Tools' },
    { id: 'Access', icon: 'bi-key', desc: 'VPN, Server Access, Accounts' }
  ];

  return (
    <div className="page-container animation-fade-in">
      <div className="page-header mb-4">
        <h1 className="h3 fw-bold mb-1 text-dark">Submit New Request</h1>
        <p className="text-muted mb-0">Request new hardware, software licenses, or system access.</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="row g-0">
              
              {/* Left Side: Instructions / Info */}
              <div className="col-md-4 bg-primary text-white p-5 d-flex flex-column justify-content-between" style={{ backgroundColor: 'var(--primary-600) !important' }}>
                <div>
                  <div className="icon-box bg-white text-primary rounded-circle d-flex align-items-center justify-content-center mb-4" style={{ width: '64px', height: '64px' }}>
                    <i className="bi bi-rocket-takeoff fs-3" />
                  </div>
                  <h3 className="fw-bold mb-3">Request Process</h3>
                  <ul className="list-unstyled opacity-75 small lh-lg">
                    <li className="mb-2"><i className="bi bi-1-circle me-2" /> Fill out the details</li>
                    <li className="mb-2"><i className="bi bi-2-circle me-2" /> Manager approval</li>
                    <li className="mb-2"><i className="bi bi-3-circle me-2" /> IT processing</li>
                    <li className="mb-2"><i className="bi bi-4-circle me-2" /> Procurement & Setup</li>
                  </ul>
                </div>
                <div className="mt-5 pt-4 border-top border-light border-opacity-25">
                  <p className="small mb-0 opacity-75">
                    Standard requests usually take 2-3 business days after manager approval.
                  </p>
                </div>
              </div>

              {/* Right Side: Form */}
              <div className="col-md-8 p-5">
                <form onSubmit={handleSubmit}>
                  
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark mb-3">Select Category</label>
                    <div className="row g-3">
                      {categories.map(c => (
                        <div className="col-sm-4" key={c.id}>
                          <div 
                            className={`card h-100 border text-center p-3 cursor-pointer transition-colors ${category === c.id ? 'border-primary bg-primary-subtle' : 'border-gray-200 hover-bg-light'}`}
                            onClick={() => {
                              setCategory(c.id);
                              // IMPORTANT: Clear form data when switching categories so we don't submit hardware under 'Access'
                              setFormData({ ...formData, item: '', assetId: '' });
                            }}
                            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                          >
                            <i className={`bi ${c.icon} fs-3 mb-2 ${category === c.id ? 'text-primary' : 'text-muted'}`} />
                            <h6 className={`mb-1 fw-bold ${category === c.id ? 'text-primary' : 'text-dark'}`}>{c.id}</h6>
                            <small className="text-muted" style={{ fontSize: '0.7rem' }}>{c.desc}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="row g-4 mb-4">
                    <div className="col-md-8">
                      <label className="form-label fw-semibold text-dark">Item Needed</label>
                      {category !== 'Access' ? (
                        <>
                          {availableAssets.length > 0 ? (
                            <select 
                              className="form-select form-select-lg bg-light border-0"
                              value={formData.assetId || ''}
                              onChange={e => {
                                const selectedAsset = availableAssets.find(a => a.id === e.target.value);
                                setFormData({
                                  ...formData, 
                                  item: selectedAsset ? selectedAsset.name : '', 
                                  assetId: e.target.value
                                });
                              }}
                              required
                            >
                              <option value="" disabled>Select an available {category} asset...</option>
                              {availableAssets.map(a => (
                                <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
                              ))}
                            </select>
                          ) : (
                            <input 
                              type="text"
                              className="form-control form-control-lg bg-light border-0" 
                              placeholder={`No inventory. Type your custom ${category} request...`}
                              value={formData.item}
                              onChange={e => setFormData({ ...formData, item: e.target.value, assetId: '' })}
                              required
                            />
                          )}
                        </>
                      ) : (
                        <input 
                          type="text" 
                          className="form-control form-control-lg bg-light border-0" 
                          placeholder="E.g., AWS Console Access"
                          value={formData.item}
                          onChange={e => setFormData({...formData, item: e.target.value})}
                          required
                        />
                      )}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold text-dark">Priority</label>
                      <select 
                        className="form-select form-select-lg bg-light border-0"
                        value={formData.priority}
                        onChange={e => setFormData({...formData, priority: e.target.value})}
                      >
                        <option>Low</option>
                        <option>Normal</option>
                        <option>High</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="form-label fw-semibold text-dark">Business Justification</label>
                    <textarea 
                      className="form-control bg-light border-0" 
                      rows="4" 
                      placeholder="Please explain why this is needed for your role..."
                      value={formData.justification}
                      onChange={e => setFormData({...formData, justification: e.target.value})}
                      required
                    ></textarea>
                    <div className="form-text mt-2">Required for manager approval.</div>
                  </div>

                  <div className="d-flex justify-content-end gap-3 pt-3 border-top">
                    <button type="button" className="btn btn-light px-4 rounded-pill" onClick={() => navigate('/dashboard')}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary px-5 rounded-pill d-flex align-items-center shadow-sm" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Processing...</>
                      ) : 'Submit Request'}
                    </button>
                  </div>

                </form>
              </div>

            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .bg-primary-subtle {
          background-color: var(--primary-50) !important;
        }
        .hover-bg-light:hover {
          background-color: var(--gray-50);
        }
        .form-control:focus, .form-select:focus {
          box-shadow: 0 0 0 4px var(--primary-100);
          background-color: #fff !important;
        }
      `}</style>
    </div>
  );
}
