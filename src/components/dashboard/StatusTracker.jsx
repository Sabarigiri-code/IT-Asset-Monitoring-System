import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

const initialRequests = [
  {
    id: 'REQ-8021',
    type: 'Request',
    title: 'Software License - Adobe CC',
    date: '2026-07-09',
    status: 'Pending Approval',
    priority: 'Normal',
    icon: 'bi-box-seam',
    color: 'amber',
    desc: 'Requested Adobe Creative Cloud All Apps license for marketing campaign design work.',
    comments: [
      { id: 1, author: 'System', date: '2026-07-09T09:00:00', text: 'Request routed to manager for approval.' }
    ]
  },
  {
    id: 'REQ-8025',
    type: 'Request',
    title: 'Dual Monitor Stand',
    date: '2026-07-10',
    status: 'Pending Approval',
    priority: 'Low',
    icon: 'bi-display',
    color: 'amber',
    desc: 'Need a dual monitor VESA mount to improve ergonomics at desk.',
    comments: []
  },
  {
    id: 'ISS-9042',
    type: 'Issue',
    title: 'Laptop screen flickering',
    date: '2026-07-08',
    status: 'In Progress',
    priority: 'High',
    icon: 'bi-exclamation-triangle',
    color: 'rose',
    desc: 'The Dell XPS 15 screen flickers randomly when on battery power. IT is currently diagnosing.',
    comments: [
      { id: 1, author: 'IT Support (Sarah)', date: '2026-07-08T14:30:00', text: 'We have escalated this to Dell support. Can you confirm if it happens while plugged in as well?' }
    ]
  },
  {
    id: 'REQ-7992',
    type: 'Request',
    title: 'Wireless Mouse Replacement',
    date: '2026-07-01',
    status: 'Approved',
    priority: 'Normal',
    icon: 'bi-mouse',
    color: 'emerald',
    desc: 'Old mouse wheel broke. Replacement approved and shipped.',
    comments: []
  },
  {
    id: 'REQ-7811',
    type: 'Request',
    title: 'Noise Cancelling Headset',
    date: '2026-06-15',
    status: 'Rejected',
    priority: 'Low',
    icon: 'bi-headphones',
    color: 'gray',
    desc: 'Request denied by department head due to budget constraints for this quarter.',
    comments: []
  },
];

export default function StatusTracker() {
  const navigate = useNavigate();
  const { userName, userEmail } = useOutletContext() || { userName: 'Saurabh Kumar', userEmail: 'saurabh.k@company.com' };
  const [requests, setRequests] = useState([]);
  
  React.useEffect(() => {
    // Read local mock requests
    let stored = [];
    try {
      const rawStored = JSON.parse(localStorage.getItem('mock_requests') || '[]');
      stored = rawStored.filter(r => r.requesterName === userName || r.requesterEmail === userEmail);
    } catch (e) {}

    // Fetch from backend DB
    fetch('http://localhost:8080/api/requests')
      .then(res => res.json())
      .then(data => {
        // Filter by user
        const userRequests = data.filter(r => r.requesterName === userName || r.requesterEmail === userEmail);
        // Map backend requests to expected format if necessary
        const backendRequests = userRequests.map(r => ({
          id: r.id || r._id,
          type: r.type || 'Request',
          title: r.title || 'Asset Request',
          date: r.date,
          status: r.status,
          priority: r.priority || 'Normal',
          icon: r.icon || 'bi-box-seam',
          color: r.color || 'amber',
          desc: r.desc || '',
          comments: r.comments || []
        }));
        
        // Merge without duplicates (favoring backend if same ID, or just concat)
        // Usually local ones start with REQ- or ISS-, backend uses MongoDB IDs or generated IDs.
        setRequests([...stored, ...backendRequests]);
      })
      .catch(err => {
        console.error("Failed to fetch requests:", err);
        setRequests(stored);
      });
  }, []);
  const [filter, setFilter] = useState('All');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isCommenting, setIsCommenting] = useState(false);
  const [newComment, setNewComment] = useState('');

  const selectedItem = requests.find(r => r.id === selectedItemId);

  const filteredRequests = requests.filter(req => {
    if (filter === 'All') return true;
    if (filter === 'Pending Requests') return req.type === 'Request' && req.status === 'Pending Approval';
    if (filter === 'Open Issues') return req.type === 'Issue' && req.status !== 'Resolved';
    if (filter === 'Completed') return req.status === 'Approved' || req.status === 'Rejected' || req.status === 'Resolved';
    return true;
  });

  const pendingCount = requests.filter(req => req.type === 'Request' && req.status === 'Pending Approval').length;
  const openIssuesCount = requests.filter(req => req.type === 'Issue' && req.status !== 'Resolved').length;

  const handlePostComment = () => {
    if (!newComment.trim() || !selectedItem) return;
    
    // Get user name from local storage or fallback
    let userName = 'You';
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) userName = JSON.parse(stored).name || 'You';
    } catch(e) {}

    const comment = {
      id: Date.now(),
      author: userName,
      date: new Date().toISOString(),
      text: newComment.trim()
    };

    setRequests(prev => prev.map(req => {
      if (req.id === selectedItemId) {
        return { ...req, comments: [...req.comments, comment] };
      }
      return req;
    }));
    
    setNewComment('');
    setIsCommenting(false);
  };

  return (
    <div className="page-container animation-fade-in">
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1 text-dark">Status Tracker</h1>
          <p className="text-muted mb-0">Track your pending hardware requests and open IT support issues.</p>
        </div>
        <button 
          className="btn btn-primary shadow-sm" 
          style={{ backgroundColor: 'var(--primary-600)', border: 'none' }}
          onClick={() => navigate('/dashboard/new-request')}
        >
          <i className="bi bi-plus-circle me-2" /> New Request
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
          <ul className="nav nav-tabs border-bottom-0 gap-3" style={{ borderBottom: '2px solid var(--gray-100)' }}>
            {['All', 'Pending Requests', 'Open Issues', 'Completed'].map(tab => (
              <li className="nav-item" key={tab}>
                <button 
                  className={`nav-link px-0 pb-3 fw-medium border-0 border-bottom ${filter === tab ? 'text-primary border-primary active' : 'text-muted border-transparent'}`}
                  style={{ borderBottomWidth: '2px !important', backgroundColor: 'transparent' }}
                  onClick={() => setFilter(tab)}
                >
                  {tab}
                  {tab === 'Pending Requests' && pendingCount > 0 && <span className="badge bg-warning text-dark ms-2 rounded-pill">{pendingCount}</span>}
                  {tab === 'Open Issues' && openIssuesCount > 0 && <span className="badge bg-danger ms-2 rounded-pill">{openIssuesCount}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="card-body p-0">
          <div className="list-group list-group-flush rounded-bottom-4">
            {filteredRequests.length > 0 ? filteredRequests.map((req, i) => (
              <div className="list-group-item p-4 border-bottom-0 border-top hover-bg-light transition-colors" key={req.id} style={{ animationDelay: `${i * 50}ms` }}>
                <div className="row align-items-center g-3">
                  <div className="col-auto">
                    <div className={`icon-box rounded-circle d-flex align-items-center justify-content-center bg-${req.color}-100 text-${req.color}-600`} style={{ width: '56px', height: '56px' }}>
                      <i className={`bi ${req.icon} fs-4`} />
                    </div>
                  </div>
                  <div className="col">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-light text-secondary border">{req.id}</span>
                        <h5 className="mb-0 fw-bold text-dark fs-6">{req.title}</h5>
                      </div>
                      <span className="text-muted small"><i className="bi bi-calendar3 me-1" /> {new Date(req.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-muted mb-2 text-truncate" style={{ maxWidth: '80%' }}>{req.desc}</p>
                    <div className="d-flex align-items-center gap-3">
                      <span className={`badge bg-${req.color}-subtle text-${req.color}-700 border border-${req.color}-subtle px-3 py-2 rounded-pill fw-medium`}>
                        {req.status === 'Pending Approval' && <span className="spinner-grow spinner-grow-sm me-2 align-middle" style={{ width: '0.6rem', height: '0.6rem' }} role="status"></span>}
                        {req.status}
                      </span>
                      <span className="text-muted small fw-medium">Priority: <span className={req.priority === 'High' ? 'text-danger' : 'text-dark'}>{req.priority}</span></span>
                    </div>
                  </div>
                  <div className="col-auto ms-auto d-none d-md-block">
                    <button 
                      className="btn btn-light btn-sm text-primary rounded-pill px-3 fw-medium"
                      onClick={() => setSelectedItemId(req.id)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-5 text-center text-muted">
                <i className="bi bi-inbox fs-1 mb-3 d-block opacity-50" />
                <h5>No {filter.toLowerCase()} found</h5>
                <p>You're all caught up!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <div className="modal-overlay d-flex align-items-center justify-content-center" onClick={() => { setSelectedItemId(null); setIsCommenting(false); }}>
          <div
            className="modal-card overflow-hidden animation-zoom-in d-flex flex-column"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '480px', width: '100%', margin: '1rem',
              maxHeight: '90vh', borderRadius: '20px',
              boxShadow: '0 32px 64px rgba(0,0,0,0.25)',
              background: '#fff'
            }}
          >
            {/* ── HERO HEADER with gradient ── */}
            {(() => {
              const gradients = {
                amber:   'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                rose:    'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                emerald: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                gray:    'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                blue:    'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              };
              const grad = gradients[selectedItem.color] || gradients.blue;
              const statusConfig = {
                'Approved':        { bg: 'rgba(255,255,255,0.25)', text: '#fff', dot: '#bbf7d0' },
                'Pending Approval':{ bg: 'rgba(255,255,255,0.2)',  text: '#fff', dot: '#fde68a' },
                'In Progress':     { bg: 'rgba(255,255,255,0.2)',  text: '#fff', dot: '#fed7aa' },
                'Rejected':        { bg: 'rgba(0,0,0,0.2)',        text: '#fff', dot: '#fecaca' },
                'Resolved':        { bg: 'rgba(255,255,255,0.25)', text: '#fff', dot: '#a7f3d0' },
              };
              const sc = statusConfig[selectedItem.status] || statusConfig['Pending Approval'];
              return (
                <div style={{ background: grad, padding: '24px 24px 20px', position: 'relative', flexShrink: 0 }}>
                  {/* Close btn */}
                  <button
                    onClick={() => { setSelectedItemId(null); setIsCommenting(false); }}
                    style={{
                      position: 'absolute', top: 16, right: 16,
                      background: 'rgba(255,255,255,0.2)', border: 'none',
                      borderRadius: '50%', width: 32, height: 32,
                      color: '#fff', fontSize: '1rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>

                  {/* Icon circle */}
                  <div style={{
                    width: 52, height: 52, borderRadius: '14px',
                    background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(6px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 12, border: '1.5px solid rgba(255,255,255,0.35)'
                  }}>
                    <i className={`bi ${selectedItem.icon} fs-4`} style={{ color: '#fff' }}></i>
                  </div>

                  <h4 style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', marginBottom: 6 }}>
                    {selectedItem.title}
                  </h4>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {/* Status pill */}
                    <span style={{
                      background: sc.bg, color: sc.text,
                      borderRadius: 20, padding: '3px 12px',
                      fontSize: '0.75rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: 5,
                      backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.3)'
                    }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: sc.dot, display: 'inline-block' }}></span>
                      {selectedItem.status}
                    </span>
                    {/* ID pill */}
                    <span style={{
                      background: 'rgba(0,0,0,0.15)', color: 'rgba(255,255,255,0.9)',
                      borderRadius: 20, padding: '3px 12px',
                      fontSize: '0.72rem', fontWeight: 600,
                      backdropFilter: 'blur(4px)'
                    }}>
                      {selectedItem.id}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* ── BODY ── */}
            <div className="overflow-auto" style={{ padding: '20px 24px', flex: 1 }}>

              {/* Info grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 12, marginBottom: 20
              }}>
                {[
                  { label: 'Type',           value: selectedItem.type,     icon: 'bi-tag-fill' },
                  { label: 'Priority',       value: selectedItem.priority, icon: 'bi-lightning-charge-fill' },
                  { label: 'Date Submitted', value: new Date(selectedItem.date).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }), icon: 'bi-calendar3' },
                  { label: 'Request By',     value: (() => { try { return JSON.parse(localStorage.getItem('currentUser') || '{}').name || 'You'; } catch { return 'You'; } })(), icon: 'bi-person-fill' },
                ].map(item => (
                  <div key={item.label} style={{
                    background: '#f8fafc', borderRadius: 12, padding: '12px 14px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <i className={`bi ${item.icon}`}></i> {item.label}
                    </div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div style={{
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                border: '1px solid #bae6fd', borderRadius: 12, padding: '14px 16px', marginBottom: 16
              }}>
                <div style={{ fontSize: '0.7rem', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700, marginBottom: 6 }}>
                  <i className="bi bi-chat-left-text-fill me-1"></i> Description
                </div>
                <p style={{ margin: 0, color: '#334155', fontSize: '0.88rem', lineHeight: 1.6 }}>{selectedItem.desc}</p>
              </div>

              {/* Attached Image */}
              {selectedItem.image && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700, marginBottom: 8 }}>
                    <i className="bi bi-paperclip me-1"></i> Attachment
                  </div>
                  <img src={selectedItem.image} alt="Attached" style={{ width: '100%', borderRadius: 10, border: '1px solid #e2e8f0', maxHeight: 220, objectFit: 'cover' }} />
                </div>
              )}

              {/* Comments */}
              {selectedItem.comments && selectedItem.comments.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700, marginBottom: 10 }}>
                    <i className="bi bi-chat-dots-fill me-1"></i> Activity ({selectedItem.comments.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedItem.comments.map(c => (
                      <div key={c.id} style={{
                        background: '#fff', borderRadius: 10, padding: '10px 14px',
                        border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.82rem' }}>{c.author}</span>
                          <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{new Date(c.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                        <p style={{ margin: 0, color: '#475569', fontSize: '0.82rem', lineHeight: 1.5 }}>{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isCommenting && (
                <div style={{ marginTop: 12 }}>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Type your comment here..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    autoFocus
                    style={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.88rem' }}
                  />
                </div>
              )}
            </div>

            {/* ── FOOTER ── */}
            <div style={{
              padding: '14px 20px', background: '#f8fafc',
              borderTop: '1px solid #e2e8f0', display: 'flex',
              justifyContent: 'flex-end', gap: 8, flexShrink: 0
            }}>
              {isCommenting ? (
                <>
                  <button
                    style={{ background: '#f1f5f9', border: 'none', borderRadius: 20, padding: '8px 20px', fontWeight: 600, color: '#64748b', cursor: 'pointer', fontSize: '0.85rem' }}
                    onClick={() => { setIsCommenting(false); setNewComment(''); }}
                  >Cancel</button>
                  <button
                    disabled={!newComment.trim()}
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', borderRadius: 20, padding: '8px 22px', fontWeight: 700, color: '#fff', cursor: 'pointer', fontSize: '0.85rem', opacity: !newComment.trim() ? 0.6 : 1 }}
                    onClick={handlePostComment}
                  ><i className="bi bi-send-fill me-1"></i> Post</button>
                </>
              ) : (
                <>
                  <button
                    style={{ background: '#f1f5f9', border: 'none', borderRadius: 20, padding: '8px 22px', fontWeight: 600, color: '#64748b', cursor: 'pointer', fontSize: '0.85rem' }}
                    onClick={() => setSelectedItemId(null)}
                  >Close</button>
                  {(selectedItem.status === 'Pending Approval' || selectedItem.status === 'In Progress') && (
                    <button
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none', borderRadius: 20, padding: '8px 22px', fontWeight: 700, color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}
                      onClick={() => setIsCommenting(true)}
                    ><i className="bi bi-chat-left-text me-1"></i> Add Comment</button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .hover-bg-light:hover {
          background-color: var(--gray-50);
        }
        .transition-colors {
          transition: background-color 0.2s ease;
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
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .text-amber-600 { color: #d97706; }
        .bg-amber-50 { background-color: #fffbeb; }
        .bg-amber-100 { background-color: #fef3c7; }
        .text-amber-700 { color: #b45309; }
        .bg-amber-subtle { background-color: #fef3c7; border-color: #fde68a !important; }
        
        .text-rose-600 { color: #e11d48; }
        .bg-rose-50 { background-color: #fff1f2; }
        .bg-rose-100 { background-color: #ffe4e6; }
        .text-rose-700 { color: #be123c; }
        .bg-rose-subtle { background-color: #ffe4e6; border-color: #fecdd3 !important; }
        
        .text-emerald-600 { color: #059669; }
        .bg-emerald-50 { background-color: #ecfdf5; }
        .bg-emerald-100 { background-color: #d1fae5; }
        .text-emerald-700 { color: #047857; }
        .bg-emerald-subtle { background-color: #d1fae5; border-color: #a7f3d0 !important; }

        .text-gray-600 { color: #4b5563; }
        .bg-gray-50 { background-color: #f9fafb; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .text-gray-700 { color: #374151; }
        .bg-gray-subtle { background-color: #f3f4f6; border-color: #e5e7eb !important; }
      `}</style>
    </div>
  );
}
