import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const activities = [
  {
    id: 'act-1',
    icon: 'bi-mouse2',
    title: 'Mouse replacement',
    status: 'Approved',
    statusColor: 'emerald',
    time: '2 hours ago',
  },
  {
    id: 'act-2',
    icon: 'bi-windows',
    title: 'Software License — Adobe CC',
    status: 'Pending',
    statusColor: 'amber',
    time: '1 day ago',
  },
  {
    id: 'act-3',
    icon: 'bi-laptop',
    title: 'Laptop screen repair',
    status: 'In Progress',
    statusColor: 'blue',
    time: '3 days ago',
  },
  {
    id: 'act-4',
    icon: 'bi-keyboard',
    title: 'Keyboard replacement',
    status: 'Completed',
    statusColor: 'emerald',
    time: '1 week ago',
  },
  {
    id: 'act-5',
    icon: 'bi-headphones',
    title: 'Headset request',
    status: 'Rejected',
    statusColor: 'rose',
    time: '2 weeks ago',
  },
];

export default function QuickActionsPanel() {
  const navigate = useNavigate();
  const [isKBOpen, setIsKBOpen] = useState(false);

  return (
    <div className="quick-actions-column">
      {/* Quick Action Buttons */}
      <div className="dash-card" id="quick-actions-card">
        <div className="dash-card-header">
          <div className="dash-card-header-left">
            <i className="bi bi-lightning-charge dash-card-header-icon" />
            <h2 className="dash-card-title">Quick Actions</h2>
          </div>
        </div>
        <div className="dash-card-body">
          <div className="quick-action-btns">
            <button className="quick-action-btn quick-action-btn--primary" id="btn-request-asset" onClick={() => navigate('/dashboard/new-request')}>
              <div className="quick-action-btn-icon">
                <i className="bi bi-plus-circle" />
              </div>
              <div className="quick-action-btn-text">
                <span className="quick-action-btn-title">Request New Asset</span>
                <span className="quick-action-btn-desc">Submit a new hardware or software request</span>
              </div>
              <i className="bi bi-chevron-right quick-action-arrow" />
            </button>
            <button className="quick-action-btn quick-action-btn--warning" id="btn-report-issue" onClick={() => navigate('/dashboard/status-tracker')}>
              <div className="quick-action-btn-icon">
                <i className="bi bi-flag" />
              </div>
              <div className="quick-action-btn-text">
                <span className="quick-action-btn-title">Report an Issue</span>
                <span className="quick-action-btn-desc">Report a problem with an assigned asset</span>
              </div>
              <i className="bi bi-chevron-right quick-action-arrow" />
            </button>
            <button className="quick-action-btn" style={{ '--qa-color': '#10b981', '--qa-bg': '#ecfdf5', background: '#fff', border: '1px solid var(--gray-200)' }} onClick={() => setIsKBOpen(true)}>
              <div className="quick-action-btn-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                <i className="bi bi-journal-bookmark" />
              </div>
              <div className="quick-action-btn-text">
                <span className="quick-action-btn-title">Browse Knowledge Base</span>
                <span className="quick-action-btn-desc">Find IT policies, FAQs & troubleshooting</span>
              </div>
              <i className="bi bi-chevron-right quick-action-arrow" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="dash-card" id="recent-activity-card">
        <div className="dash-card-header">
          <div className="dash-card-header-left">
            <i className="bi bi-activity dash-card-header-icon" />
            <h2 className="dash-card-title">Recent Activity</h2>
          </div>
          <Link to="/dashboard/status-tracker" className="dash-card-view-all" id="view-all-activity">
            View All <i className="bi bi-arrow-right" />
          </Link>
        </div>
        <div className="dash-card-body">
          <div className="activity-timeline">
            {activities.map((act, idx) => (
              <div
                className="timeline-item"
                key={act.id}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="timeline-dot-line">
                  <div className={`timeline-dot timeline-dot--${act.statusColor}`} />
                  {idx < activities.length - 1 && <div className="timeline-line" />}
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="timeline-title">
                      <i className={`bi ${act.icon} timeline-title-icon`} />
                      {act.title}
                    </span>
                    <span className={`timeline-status timeline-status--${act.statusColor}`}>
                      {act.status}
                    </span>
                  </div>
                  <span className="timeline-time">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* IT Knowledge Base Modal */}
      {isKBOpen && (
        <div className="modal-overlay d-flex align-items-center justify-content-center" onClick={() => setIsKBOpen(false)}>
          <div className="modal-card bg-white rounded-4 shadow-lg overflow-hidden animation-zoom-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px', width: '100%', margin: '1rem', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header bg-light border-bottom p-4 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <div className="icon-box rounded d-flex align-items-center justify-content-center bg-primary text-white shadow-sm" style={{ width: '40px', height: '40px' }}>
                  <i className="bi bi-book fs-5" />
                </div>
                <div>
                  <h4 className="mb-0 fw-bold text-dark fs-5">IT Knowledge Base</h4>
                  <span className="text-muted small">Company policies & self-service guides</span>
                </div>
              </div>
              <button className="btn-close shadow-none" onClick={() => setIsKBOpen(false)} aria-label="Close" />
            </div>
            
            <div className="modal-body p-4" style={{ overflowY: 'auto' }}>
              <div className="accordion" id="kbAccordion">
                
                <div className="accordion-item border-0 mb-3 bg-light rounded-4 overflow-hidden">
                  <h2 className="accordion-header" id="headingOne">
                    <button className="accordion-button bg-transparent fw-bold text-dark shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                      <i className="bi bi-shield-lock text-primary me-3 fs-5"></i> 1. Connecting to Company VPN
                    </button>
                  </h2>
                  <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#kbAccordion">
                    <div className="accordion-body text-muted pt-0 pb-4 px-5">
                      Open the GlobalProtect app in your system tray. Enter <strong>vpn.company.com</strong> as the portal address. Log in using your standard SSO credentials. You must approve the Duo 2FA prompt on your mobile device.
                    </div>
                  </div>
                </div>

                <div className="accordion-item border-0 mb-3 bg-light rounded-4 overflow-hidden">
                  <h2 className="accordion-header" id="headingTwo">
                    <button className="accordion-button collapsed bg-transparent fw-bold text-dark shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                      <i className="bi bi-arrow-clockwise text-primary me-3 fs-5"></i> 2. Password Reset Policy
                    </button>
                  </h2>
                  <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#kbAccordion">
                    <div className="accordion-body text-muted pt-0 pb-4 px-5">
                      Passwords must be rotated every 90 days. They must be at least 12 characters long and contain a mix of uppercase, lowercase, numbers, and symbols. You can reset your password anytime via the Okta dashboard.
                    </div>
                  </div>
                </div>

                <div className="accordion-item border-0 mb-3 bg-light rounded-4 overflow-hidden">
                  <h2 className="accordion-header" id="headingThree">
                    <button className="accordion-button collapsed bg-transparent fw-bold text-dark shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                      <i className="bi bi-box-seam text-primary me-3 fs-5"></i> 3. Hardware Refresh Cycle
                    </button>
                  </h2>
                  <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#kbAccordion">
                    <div className="accordion-body text-muted pt-0 pb-4 px-5">
                      Laptops are eligible for a refresh every 3 years. Monitors and peripherals are refreshed every 4 years. If your device is damaged, you can request an early replacement via the "Report an Issue" tool.
                    </div>
                  </div>
                </div>
                
              </div>
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
