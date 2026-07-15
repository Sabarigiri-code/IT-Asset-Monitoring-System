import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';

const initialAssets = [
  { id: 'AST-1024', name: 'Dell XPS 15', type: 'Hardware', category: 'Laptop', status: 'Assigned', assignee: 'Amit Sharma', dateAdded: '2025-01-15', health: 85 },
  { id: 'AST-1031', name: 'Dell UltraSharp 27"', type: 'Hardware', category: 'Monitor', status: 'Available', assignee: '-', dateAdded: '2025-02-10', health: 98 },
  { id: 'AST-1042', name: 'Logitech MX Master 3', type: 'Hardware', category: 'Peripheral', status: 'In Repair', assignee: '-', dateAdded: '2025-03-08', health: 45 },
  { id: 'AST-1055', name: 'Microsoft Office 365', type: 'Software', category: 'License', status: 'Assigned', assignee: 'Priya Patel', dateAdded: '2024-11-20', health: 100 },
  { id: 'AST-1063', name: 'Jabra Evolve2 75', type: 'Hardware', category: 'Peripheral', status: 'Available', assignee: '-', dateAdded: '2025-06-20', health: 92 },
  { id: 'AST-1088', name: 'Adobe Creative Cloud', type: 'Software', category: 'License', status: 'Available', assignee: '-', dateAdded: '2026-01-05', health: 100 },
  { id: 'AST-1092', name: 'MacBook Pro M3 Max', type: 'Hardware', category: 'Laptop', status: 'Under Review', assignee: 'Rohan Das', dateAdded: '2026-07-01', health: 78 },
];

export default function AssetInventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [qrAsset, setQrAsset] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: '', type: 'Hardware', category: 'Laptop', status: 'Available', health: 100, assignee: '-'
  });

  const [assets, setAssets] = useState([]);

  useEffect(() => {
    fetch('https://it-asset-monitoring-system.onrender.com/api/assets')
      .then(res => res.json())
      .then(data => setAssets(data))
      .catch(err => console.error("Failed to fetch assets:", err));
  }, []);
  
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      fetch(`https://it-asset-monitoring-system.onrender.com/api/assets/${id}`, { method: 'DELETE' })
        .then(() => {
          setAssets(assets.filter(a => a.id !== id));
          toast.success('Asset deleted successfully');
        })
        .catch(err => {
          console.error("Failed to delete asset:", err);
          toast.error('Failed to delete asset');
        });
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    fetch(`https://it-asset-monitoring-system.onrender.com/api/assets/${editingAsset.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingAsset)
    })
      .then(res => res.json())
      .then(updated => {
        setAssets(assets.map(a => a.id === updated.id ? updated : a));
        setEditingAsset(null);
        toast.success('Asset updated successfully');
      })
      .catch(err => {
        console.error("Failed to update asset:", err);
        toast.error('Failed to update asset');
      });
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const newId = 'AST-' + Math.floor(1000 + Math.random() * 9000);
    const assetToAdd = {
      ...newAsset,
      id: newId,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    fetch('https://it-asset-monitoring-system.onrender.com/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assetToAdd)
    })
      .then(res => res.json())
      .then(added => {
        setAssets([added, ...assets]);
        setShowAddModal(false);
        setNewAsset({ name: '', type: 'Hardware', category: 'Laptop', status: 'Available', assignee: '-', health: 100 });
        toast.success(`Asset "${added.name}" created successfully!`);
      })
      .catch(err => {
        console.error("Failed to add asset:", err);
        toast.error('Failed to create asset');
      });
  };
  
  const getHealthColor = (health) => {
    if (health >= 90) return 'text-success';
    if (health >= 70) return 'text-warning';
    return 'text-danger';
  };
  
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || asset.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || asset.type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Available': return 'bg-success-subtle text-success border-success-subtle';
      case 'Assigned': return 'bg-primary-subtle text-primary border-primary-subtle';
      case 'In Repair': return 'bg-danger-subtle text-danger border-danger-subtle';
      case 'Under Review': return 'bg-warning-subtle text-warning border-warning-subtle';
      default: return 'bg-secondary-subtle text-secondary border-secondary-subtle';
    }
  };

  const getIcon = (category) => {
    switch(category) {
      case 'Laptop': return 'bi-laptop';
      case 'Monitor': return 'bi-display';
      case 'Peripheral': return 'bi-mouse2';
      case 'License': return 'bi-file-earmark-lock';
      default: return 'bi-box-seam';
    }
  };

  return (
    <div className="admin-page-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fs-3 fw-bold text-dark mb-1">Asset Inventory</h2>
          <p className="text-muted mb-0">Manage and track all company hardware and software assets.</p>
        </div>
        <button 
          className="btn btn-primary d-flex align-items-center gap-2 shadow-sm rounded-pill px-4"
          onClick={() => setShowAddModal(true)}
        >
          <i className="bi bi-plus-lg"></i> Add Asset
        </button>
      </div>

      <div className="dash-card">
        <div className="dash-card-header bg-white border-bottom p-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="position-relative" style={{ maxWidth: '350px', width: '100%' }}>
            <i className="bi bi-search position-absolute top-50 translate-middle-y text-muted ms-3"></i>
            <input 
              type="text" 
              className="form-control rounded-pill ps-5 bg-light border-0" 
              placeholder="Search by Asset Name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="d-flex gap-2">
            <select className="form-select rounded-pill bg-light border-0 shadow-none" value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ width: '150px' }}>
              <option value="All">All Types</option>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
            </select>
          </div>
        </div>
        
        <div className="dash-card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.9rem' }}>
              <thead className="table-light text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <tr>
                  <th className="ps-4 py-3 fw-semibold border-0 rounded-top-start">Asset Info</th>
                  <th className="py-3 fw-semibold border-0">Asset ID</th>
                  <th className="py-3 fw-semibold border-0">Health</th>
                  <th className="py-3 fw-semibold border-0">Status</th>
                  <th className="py-3 fw-semibold border-0">Assignee</th>
                  <th className="py-3 fw-semibold border-0">Date Added</th>
                  <th className="text-end pe-4 py-3 fw-semibold border-0 rounded-top-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.length > 0 ? filteredAssets.map(asset => (
                  <tr 
                    key={asset.id} 
                    className="border-bottom hover-bg-light" 
                    style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <td className="ps-4 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-light text-primary rounded d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                          <i className={`bi ${getIcon(asset.category)} fs-5`}></i>
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{asset.name}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{asset.category} &bull; {asset.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3"><code className="bg-light text-dark px-2 py-1 rounded border">{asset.id}</code></td>
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-2" title={`${asset.health}% Healthy`}>
                        <div className="progress" style={{ width: '40px', height: '6px' }}>
                          <div className={`progress-bar ${getHealthColor(asset.health).replace('text-', 'bg-')}`} style={{ width: `${asset.health}%` }}></div>
                        </div>
                        <span className={`small fw-bold ${getHealthColor(asset.health)}`}>{asset.health}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`badge border rounded-pill fw-medium ${getStatusBadge(asset.status)}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {asset.assignee !== '-' ? (
                        asset.assignee ? (
                          <div className="d-flex align-items-center gap-2">
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}>
                              {asset.assignee.charAt(0)}
                            </div>
                            <span>{asset.assignee}</span>
                          </div>
                        ) : (
                          <span className="text-muted small fst-italic">Unassigned</span>
                        )
                      ) : <span className="text-muted">-</span>}
                    </td>
                    <td className="py-3 text-muted">{new Date(asset.dateAdded).toLocaleDateString()}</td>
                    <td className="text-end pe-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button className="btn btn-sm btn-light text-secondary border me-2 shadow-sm" onClick={() => setQrAsset(asset)} title="Generate QR Code"><i className="bi bi-qr-code-scan"></i></button>
                      <button className="btn btn-sm btn-light text-primary border me-2 shadow-sm" onClick={() => setEditingAsset(asset)}><i className="bi bi-pencil"></i></button>
                      <button className="btn btn-sm btn-light text-danger border shadow-sm" onClick={() => handleDelete(asset.id)}><i className="bi bi-trash3"></i></button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <i className="bi bi-inboxes fs-1 d-block mb-3 opacity-50"></i>
                      No assets found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* QR Code Modal */}
      {qrAsset && (
        <div className="modal-overlay d-flex align-items-center justify-content-center" onClick={() => setQrAsset(null)}>
          <div className="modal-card bg-white rounded-4 shadow-lg p-4 text-center animation-zoom-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '350px', width: '100%', margin: '1rem' }}>
            <h4 className="fw-bold text-dark mb-1">Asset QR Code</h4>
            <p className="text-muted small mb-4">{qrAsset.name} ({qrAsset.id})</p>
            
            <div className="bg-light p-3 rounded-4 mb-4 border d-inline-block shadow-sm qr-print-area">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://app.itassetsystem.com/verify/' + qrAsset.id)}`} alt="QR Code" style={{ width: '200px', height: '200px' }} />
            </div>
            
            <div className="d-flex gap-2 justify-content-center print-hide">
              <button className="btn btn-light rounded-pill px-4 fw-medium" onClick={() => setQrAsset(null)}>Close</button>
              <button className="btn btn-dark rounded-pill px-4 fw-medium" onClick={() => window.print()}><i className="bi bi-printer me-2"></i> Print Tag</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Asset Details Modal */}
      {selectedAsset && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }} onClick={(e) => { if (e.target === e.currentTarget) setSelectedAsset(null); }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header border-bottom-0 pb-0">
                  <h5 className="modal-title fw-bold">Asset Details</h5>
                  <button type="button" className="btn-close" onClick={() => setSelectedAsset(null)}></button>
                </div>
                <div className="modal-body pt-4">
                  <div className="mb-4 d-flex align-items-center gap-3">
                    <div className="bg-light text-primary rounded d-flex align-items-center justify-content-center fs-3" style={{ width: '64px', height: '64px' }}>
                      <i className={`bi ${getIcon(selectedAsset.category)}`}></i>
                    </div>
                    <div>
                      <h5 className="mb-1 fw-bold text-dark">{selectedAsset.name}</h5>
                      <div className="text-muted">{selectedAsset.category} &bull; {selectedAsset.type}</div>
                    </div>
                  </div>
                  
                  <div className="bg-light rounded-4 p-4 mb-4">
                    <div className="row g-4">
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Asset ID</small>
                        <code className="bg-white text-dark px-2 py-1 rounded border fs-6">{selectedAsset.id}</code>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Status</small>
                        <div>
                          <span className={`badge border rounded-pill fw-medium ${getStatusBadge(selectedAsset.status)}`}>
                            {selectedAsset.status}
                          </span>
                        </div>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Health Score</small>
                        <div className="d-flex align-items-center gap-2">
                          <span className={`fw-bold fs-5 ${getHealthColor(selectedAsset.health)}`}>{selectedAsset.health}%</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Assignee</small>
                        <div className="fw-medium text-dark">{selectedAsset.assignee}</div>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block mb-1">Date Added</small>
                        <div className="fw-medium text-dark">{new Date(selectedAsset.dateAdded).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-0 pb-4 px-4 d-flex justify-content-end">
                  <button type="button" className="btn btn-light rounded-pill px-4 fw-medium" onClick={() => setSelectedAsset(null)}>Close</button>
                  <button type="button" className="btn btn-primary rounded-pill px-4 fw-medium shadow-sm" onClick={() => { setEditingAsset(selectedAsset); setSelectedAsset(null); }}><i className="bi bi-pencil me-2"></i>Edit Asset</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Asset Modal */}
      {editingAsset && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <form onSubmit={handleEditSubmit}>
                  <div className="modal-header border-bottom-0 pb-0">
                    <h5 className="modal-title fw-bold">Edit Asset</h5>
                    <button type="button" className="btn-close" onClick={() => setEditingAsset(null)}></button>
                  </div>
                  <div className="modal-body pt-4">
                    <div className="mb-3">
                      <label className="form-label text-muted small mb-1">Asset Name</label>
                      <input type="text" className="form-control" value={editingAsset.name} onChange={e => setEditingAsset({...editingAsset, name: e.target.value})} required />
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <label className="form-label text-muted small mb-1">Status</label>
                        <select className="form-select" value={editingAsset.status} onChange={e => setEditingAsset({...editingAsset, status: e.target.value})}>
                          <option value="Available">Available</option>
                          <option value="Assigned">Assigned</option>
                          <option value="In Repair">In Repair</option>
                          <option value="Under Review">Under Review</option>
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label text-muted small mb-1">Health Score (%)</label>
                        <input type="number" className="form-control" min="0" max="100" value={editingAsset.health} onChange={e => setEditingAsset({...editingAsset, health: parseInt(e.target.value)})} required />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small mb-1">Assignee</label>
                      <input type="text" className="form-control" value={editingAsset.assignee} onChange={e => setEditingAsset({...editingAsset, assignee: e.target.value})} />
                    </div>
                  </div>
                  <div className="modal-footer border-top-0 pt-0 pb-4 px-4 d-flex justify-content-end mt-2">
                    <button type="button" className="btn btn-light rounded-pill px-4 fw-medium" onClick={() => setEditingAsset(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary rounded-pill px-4 fw-medium shadow-sm">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Asset Modal */}
      {showAddModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <form onSubmit={handleAddSubmit}>
                  <div className="modal-header border-bottom-0 pb-0">
                    <h5 className="modal-title fw-bold">Add New Asset</h5>
                    <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                  </div>
                  <div className="modal-body pt-4">
                    <div className="mb-3">
                      <label className="form-label text-muted small mb-1">Asset Name</label>
                      <input type="text" className="form-control" placeholder="e.g. MacBook Pro 14&quot;" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} required />
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <label className="form-label text-muted small mb-1">Type</label>
                        <select className="form-select" value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value})}>
                          <option value="Hardware">Hardware</option>
                          <option value="Software">Software</option>
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label text-muted small mb-1">Category</label>
                        <select className="form-select" value={newAsset.category} onChange={e => setNewAsset({...newAsset, category: e.target.value})}>
                          <option value="Laptop">Laptop</option>
                          <option value="Monitor">Monitor</option>
                          <option value="Peripheral">Peripheral</option>
                          <option value="License">License</option>
                        </select>
                      </div>
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <label className="form-label text-muted small mb-1">Status</label>
                        <select className="form-select" value={newAsset.status} onChange={e => setNewAsset({...newAsset, status: e.target.value})}>
                          <option value="Available">Available</option>
                          <option value="Assigned">Assigned</option>
                          <option value="In Repair">In Repair</option>
                          <option value="Under Review">Under Review</option>
                        </select>
                      </div>
                      <div className="col-6">
                        <label className="form-label text-muted small mb-1">Health Score (%)</label>
                        <input type="number" className="form-control" min="0" max="100" value={newAsset.health} onChange={e => setNewAsset({...newAsset, health: parseInt(e.target.value)})} required />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-muted small mb-1">Assignee</label>
                      <input type="text" className="form-control" placeholder="Name or '-'" value={newAsset.assignee} onChange={e => setNewAsset({...newAsset, assignee: e.target.value})} />
                    </div>
                  </div>
                  <div className="modal-footer border-top-0 pt-0 pb-4 px-4 d-flex justify-content-end mt-2">
                    <button type="button" className="btn btn-light rounded-pill px-4 fw-medium" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary rounded-pill px-4 fw-medium shadow-sm"><i className="bi bi-plus-lg me-2"></i>Create Asset</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .hover-bg-light:hover { background-color: #f8f9fa !important; }
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
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .modal-card, .modal-card * {
            visibility: visible;
          }
          .modal-card {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0 !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
          }
          .print-hide {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
