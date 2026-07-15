import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = () => {
    setIsLoading(true);
    fetch('https://it-asset-monitoring-system.onrender.com/api/logs')
      .then(res => res.json())
      .then(data => {
        setLogs(data);
        setIsLoading(false);
      })
      .catch(e => {
        console.error('Failed to fetch logs', e);
        setIsLoading(false);
      });
  };

  const filteredLogs = logs.filter(log => {
    const matchFilter = filter === 'All' || log.action === filter;
    const matchSearch = search === '' ||
      log.assetName?.toLowerCase().includes(search.toLowerCase()) ||
      log.user?.toLowerCase().includes(search.toLowerCase()) ||
      log.assetId?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const getActionStyle = (action) => {
    switch (action) {
      case 'Returned': return { bg: '#fff1f2', color: '#e11d48', icon: 'bi-arrow-return-left', border: '#fecdd3' };
      case 'Assigned': return { bg: '#eff6ff', color: '#2563eb', icon: 'bi-person-check-fill', border: '#bfdbfe' };
      case 'Created':  return { bg: '#f0fdf4', color: '#16a34a', icon: 'bi-plus-circle-fill', border: '#bbf7d0' };
      default:         return { bg: '#f8fafc', color: '#64748b', icon: 'bi-info-circle-fill', border: '#e2e8f0' };
    }
  };

  return (
    <div className="page-container animation-fade-in">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1 text-dark">Asset Audit Logs</h1>
          <p className="text-muted mb-0">Complete lifecycle history of every asset — assignments, returns & more.</p>
        </div>
        <button className="btn btn-outline-secondary btn-sm rounded-pill" onClick={fetchLogs}>
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh
        </button>
      </div>

      {/* Filters + Search */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 p-3">
        <div className="d-flex flex-wrap gap-3 align-items-center">
          <div className="input-group" style={{ maxWidth: '280px' }}>
            <span className="input-group-text bg-light border-0"><i className="bi bi-search text-muted"></i></span>
            <input
              type="text"
              className="form-control bg-light border-0"
              placeholder="Search asset or employee…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="d-flex gap-2 ms-auto">
            {['All', 'Assigned', 'Returned', 'Created'].map(f => (
              <button
                key={f}
                className={`btn btn-sm rounded-pill px-3 fw-medium ${filter === f ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Events', value: logs.length, icon: 'bi-clock-history', bg: '#eff6ff', color: '#2563eb' },
          { label: 'Assignments', value: logs.filter(l => l.action === 'Assigned').length, icon: 'bi-person-check-fill', bg: '#eff6ff', color: '#2563eb' },
          { label: 'Returns', value: logs.filter(l => l.action === 'Returned').length, icon: 'bi-arrow-return-left', bg: '#fff1f2', color: '#e11d48' },
        ].map(stat => (
          <div className="col-12 col-md-4" key={stat.label}>
            <div className="card border-0 shadow-sm rounded-4 p-4 d-flex flex-row align-items-center gap-3">
              <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: stat.bg, color: stat.color }}>
                <i className={`bi ${stat.icon} fs-5`}></i>
              </div>
              <div>
                <div className="text-muted small">{stat.label}</div>
                <div className="fw-bold fs-4 lh-1">{stat.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-muted mt-3">Loading audit history…</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-4">
          <i className="bi bi-journal-text fs-1 text-muted opacity-50 d-block mb-3"></i>
          <h5 className="fw-bold text-dark mb-1">No Events Found</h5>
          <p className="text-muted mb-0">Asset movements will be recorded here automatically.</p>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-body p-0">
            {filteredLogs.map((log, idx) => {
              const style = getActionStyle(log.action);
              return (
                <div
                  key={log.id}
                  className="d-flex align-items-start gap-4 px-4 py-4"
                  style={{
                    borderBottom: idx < filteredLogs.length - 1 ? '1px solid #f1f5f9' : 'none',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Icon */}
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 44, height: 44, background: style.bg, color: style.color, border: `1.5px solid ${style.border}` }}
                  >
                    <i className={`bi ${style.icon} fs-6`}></i>
                  </div>

                  {/* Body */}
                  <div className="flex-grow-1 min-w-0">
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                      <span className="fw-bold text-dark">{log.assetName || 'Unknown Asset'}</span>
                      <span
                        className="badge rounded-pill fw-medium"
                        style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}`, fontSize: '0.72rem' }}
                      >
                        {log.action}
                      </span>
                      <span className="badge bg-light text-secondary border rounded-pill fw-normal" style={{ fontSize: '0.7rem' }}>
                        {log.assetId}
                      </span>
                    </div>
                    <div className="small text-muted">
                      {log.action === 'Returned' ? (
                        <><i className="bi bi-person-x me-1"></i><strong>{log.user}</strong> returned this asset</>
                      ) : log.action === 'Assigned' ? (
                        <><i className="bi bi-person-check me-1"></i>Assigned to <strong>{log.user}</strong></>
                      ) : (
                        <><i className="bi bi-info-circle me-1"></i>{log.user}</>
                      )}
                      {log.performedBy && (
                        <span className="ms-2 text-muted opacity-75">· Approved by {log.performedBy}</span>
                      )}
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="text-end text-muted flex-shrink-0" style={{ fontSize: '0.75rem', minWidth: '110px' }}>
                    <div className="fw-medium text-dark" style={{ fontSize: '0.8rem' }}>
                      {new Date(log.timestamp).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>
                    <div>{new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        .animation-fade-in { animation: fadeInUp 0.4s ease-out; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
