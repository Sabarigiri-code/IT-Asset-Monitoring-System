import React, { useState } from 'react';
import toast from 'react-hot-toast';

const initialTickets = [
  { id: 'TKT-901', asset: 'MacBook Pro M1', issue: 'Battery expanding', priority: 'High', status: 'In Progress', reportedBy: 'John Doe', date: '2026-07-09' },
  { id: 'TKT-902', asset: 'Dell Ultrasharp Monitor', issue: 'Dead pixels on left side', priority: 'Medium', status: 'Open', reportedBy: 'Jane Smith', date: '2026-07-10' },
  { id: 'TKT-903', asset: 'Logitech MX Keys', issue: 'Spacebar sticking', priority: 'Low', status: 'Open', reportedBy: 'Amit Sharma', date: '2026-07-10' },
  { id: 'TKT-895', asset: 'Lenovo ThinkPad X1', issue: 'Blue screen on boot', priority: 'Critical', status: 'In Progress', reportedBy: 'Priya Patel', date: '2026-07-08' },
  { id: 'TKT-890', asset: 'Office 365 License', issue: 'Cannot activate Outlook', priority: 'Medium', status: 'Resolved', reportedBy: 'Rohan Das', date: '2026-07-05' },
];

export default function MaintenanceTickets() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    fetch('http://localhost:8080/api/requests')
      .then(res => res.json())
      .then(data => {
        // Map the backend data to the frontend ticket structure
        const mapped = data.map(req => ({
          id: req.id,
          asset: req.title,
          assetId: req.assetId,
          issue: req.desc,
          priority: req.priority,
          status: req.status === 'Pending Approval' ? 'Open' : req.status,
          reportedBy: req.requesterName || 'Unknown',
          date: req.date || 'Unknown',
          type: req.type || 'Issue',
          _mongoId: req._mongoId || req.id
        }));
        // We can sort so Open/Pending are first
        mapped.sort((a, b) => (a.status === 'Open' ? -1 : 1));
        setTickets(mapped);
        setIsLoading(false);
      })
      .catch(e => {
        console.error("Failed to fetch requests", e);
        setIsLoading(false);
      });
  };

  const filteredTickets = tickets.filter(t => filter === 'All' || t.status === filter);

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Critical': return 'text-danger fw-bold';
      case 'High': return 'text-warning text-darken fw-bold';
      case 'Medium': return 'text-primary fw-medium';
      case 'Low': return 'text-secondary';
      default: return '';
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Open': return 'bg-info-subtle text-info border-info-subtle';
      case 'In Progress': return 'bg-warning-subtle text-warning border-warning-subtle';
      case 'Resolved': return 'bg-success-subtle text-success border-success-subtle';
      case 'Rejected': return 'bg-danger-subtle text-danger border-danger-subtle';
      default: return 'bg-secondary-subtle text-secondary border-secondary-subtle';
    }
  };

  const updateStatus = (id, newStatus) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const deleteTicket = (id) => {
    setTickets(tickets.filter(t => t.id !== id));
    const stored = JSON.parse(localStorage.getItem('mock_requests') || '[]');
    toast.success('Ticket deleted successfully');
    if (selectedTicket && selectedTicket.id === id) setSelectedTicket(null);
  };

  const handleApproveRequest = async (ticket) => {
    try {
      await fetch(`http://localhost:8080/api/requests/${ticket._mongoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ticket, status: 'Approved' })
      });

      if (ticket.assetId && (ticket.type === 'Return' || ticket.type === 'Request')) {
        const assetRes = await fetch(`http://localhost:8080/api/assets/${ticket.assetId}`);
        if (assetRes.ok) {
          const assetData = await assetRes.json();
          if (ticket.type === 'Return') {
            assetData.status = 'Available';
            assetData.assignee = null;
            assetData.deadlineDate = null;
          } else if (ticket.type === 'Request') {
            assetData.status = 'Active';
            assetData.assignee = ticket.reportedBy;
            assetData.deadlineDate = null;
          }
          await fetch(`http://localhost:8080/api/assets/${ticket.assetId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assetData)
          });

          // ✅ Write audit log entry
          const adminUser = (() => { try { return JSON.parse(localStorage.getItem('currentUser') || '{}').name || 'Admin'; } catch { return 'Admin'; } })();
          fetch('http://localhost:8080/api/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              assetId: ticket.assetId,
              assetName: ticket.asset,
              action: ticket.type === 'Return' ? 'Returned' : 'Assigned',
              user: ticket.reportedBy,
              userEmail: '',
              performedBy: adminUser
            })
          }).catch(e => console.warn('Failed to write audit log', e));
        }
      }
      toast.success(`${ticket.type} Request Approved Successfully!`);
      fetchRequests();
      setSelectedTicket(null);
    } catch (e) {
      console.error(e);
      toast.error("Failed to approve request");
    }
  };

  const handleRejectRequest = async (ticket) => {
    try {
      await fetch(`http://localhost:8080/api/requests/${ticket._mongoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ticket, status: 'Rejected' })
      });
      toast.success(`Request Rejected.`);
      fetchRequests();
      setSelectedTicket(null);
    } catch (e) {
      toast.error("Failed to reject request");
    }
  };

  return (
    <div className="page-container animation-fade-in">
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1 text-dark">Requests & Tickets</h1>
          <p className="text-muted mb-0">Manage asset requests, returns, and maintenance issues.</p>
        </div>
        <div className="d-flex gap-2">
          <button className={filter === 'All' ? 'btn btn-dark rounded-pill' : 'btn btn-outline-dark rounded-pill'} onClick={() => setFilter('All')}>All</button>
          <button className={filter === 'Open' ? 'btn btn-dark rounded-pill' : 'btn btn-outline-dark rounded-pill'} onClick={() => setFilter('Open')}>Open</button>
          <button className={filter === 'In Progress' ? 'btn btn-dark rounded-pill' : 'btn btn-outline-dark rounded-pill'} onClick={() => setFilter('In Progress')}>In Progress</button>
        </div>
      </div>

      <div className="row g-4">
        {filteredTickets.map(t => (
          <div className="col-12 col-md-6 col-xl-4" key={t.id}>
            <div className="card border-0 shadow-sm rounded-4 h-100 transition-all hover-shadow-lg" style={{ border: '1px solid rgba(0,0,0,0.05) !important' }}>
              <div className="card-body p-4 d-flex flex-column">
                
                {/* Header */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <span className={`badge rounded-pill ${getStatusBadge(t.status)}`} style={{ fontSize: '0.75rem', padding: '0.4em 0.8em' }}>
                    {t.status}
                  </span>
                  <div>
                    {t.type === 'Issue' && <span className="badge bg-secondary rounded-pill" style={{ opacity: 0.8 }}><i className="bi bi-tools me-1"></i> Repair</span>}
                    {t.type === 'Return' && <span className="badge bg-danger rounded-pill" style={{ opacity: 0.8 }}><i className="bi bi-arrow-return-left me-1"></i> Return</span>}
                    {t.type === 'Request' && <span className="badge bg-primary rounded-pill" style={{ opacity: 0.8 }}><i className="bi bi-box-seam me-1"></i> Request</span>}
                  </div>
                </div>

                {/* Content */}
                <h5 className="fw-bold text-dark mb-1 lh-sm">{t.asset || 'Unknown Asset'}</h5>
                <p className="text-muted small mb-4 line-clamp-2" style={{ minHeight: '2.5rem' }}>
                  {t.issue || 'No details provided.'}
                </p>

                {/* Footer */}
                <div className="mt-auto border-top pt-3 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-light text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                      {(t.reportedBy || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="small fw-bold text-dark lh-1">{t.reportedBy || 'Unknown'}</div>
                      <div className="text-muted mt-1" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {new Date(t.date).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    className="btn btn-light btn-sm rounded-pill fw-bold px-3 text-primary shadow-sm hover-primary-bg" 
                    onClick={() => setSelectedTicket(t)}
                    style={{ transition: 'all 0.2s' }}
                  >
                    Review <i className="bi bi-arrow-right ms-1"></i>
                  </button>
                </div>

              </div>
            </div>
          </div>
        ))}

        {filteredTickets.length === 0 && (
          <div className="col-12 text-center py-5">
            <div className="p-5 bg-light rounded-4 d-inline-block">
              <i className="bi bi-inbox fs-1 text-muted mb-3 d-block opacity-50"></i>
              <h5 className="fw-bold text-dark mb-1">Queue is Empty</h5>
              <p className="text-muted mb-0">There are no {filter === 'All' ? '' : filter.toLowerCase()} requests at the moment.</p>
            </div>
          </div>
        )}
      </div>

      {selectedTicket && (
        <div className="modal-overlay d-flex align-items-center justify-content-center" onClick={() => setSelectedTicket(null)}>
          <div className="modal-card bg-white rounded-4 shadow-lg overflow-hidden animation-zoom-in d-flex flex-column" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '100%', margin: '1rem', maxHeight: '90vh' }}>
            <div className="modal-header bg-light border-bottom p-4">
              <h4 className="mb-0 fw-bold text-dark fs-5">{selectedTicket.issue}</h4>
              <button className="btn-close" onClick={() => setSelectedTicket(null)} />
            </div>
            <div className="modal-body p-4 overflow-auto">
              <div className="row g-3 mb-4">
                <div className="col-6">
                  <span className="text-muted small d-block">Status</span>
                  <span className={`badge border rounded ${getStatusBadge(selectedTicket.status)}`}>{selectedTicket.status}</span>
                </div>
                <div className="col-6">
                  <span className="text-muted small d-block">Asset</span>
                  <span className="fw-medium text-dark">{selectedTicket.asset}</span>
                </div>
              </div>
              
              <div className="d-flex flex-column gap-2 mt-4 pt-4 border-top">
                {selectedTicket.status === 'Open' ? (
                  <>
                    <button className="btn btn-success fw-bold py-2 shadow-sm rounded-3" onClick={() => handleApproveRequest(selectedTicket)}>
                      <i className="bi bi-check-circle me-2"></i> Approve {selectedTicket.type}
                    </button>
                    <button className="btn btn-outline-danger fw-bold py-2 rounded-3" onClick={() => handleRejectRequest(selectedTicket)}>
                      <i className="bi bi-x-circle me-2"></i> Reject
                    </button>
                  </>
                ) : (
                  <div className="text-center p-3 bg-light rounded-3 text-muted fw-bold">
                    Request has been {selectedTicket.status}
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer p-3 bg-light border-top d-flex justify-content-between gap-2 flex-shrink-0">
              <button className="btn btn-outline-danger btn-sm px-4 rounded-pill fw-bold" onClick={() => deleteTicket(selectedTicket.id)}>
                <i className="bi bi-trash-fill me-1"></i> Delete
              </button>
              <button className="btn btn-outline-secondary btn-sm px-4 rounded-pill" onClick={() => setSelectedTicket(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
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
        .hover-shadow-lg:hover {
          box-shadow: 0 1rem 3rem rgba(0,0,0,.175) !important;
          transform: translateY(-2px);
        }
        .hover-primary-bg:hover {
          background-color: #0d6efd !important;
          color: white !important;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
