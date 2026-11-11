import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const [activePortalTab, setActivePortalTab] = useState('employee');
  const [openFaq, setOpenFaq] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Can normal employees access or modify the Admin control center?",
      a: "No. The system enforces strict Zero-Trust role protection. The Admin portal (/admin) is exclusively accessible to the designated System Administrator (girimsabari7@gmail.com). Employees cannot access, view, or manage admin panels or other users' profiles."
    },
    {
      q: "How do new employees register for an account?",
      a: "Employees can register directly via the self-service registration form. Every registration is strictly created with the 'Employee' role, giving instant access to requisition assets, view assigned equipment, and track tickets without any administrative risks."
    },
    {
      q: "Is asset and user data safely saved without data loss?",
      a: "Yes. All asset records, maintenance tickets, user credentials, and audit logs are persistently stored in the high-availability MongoDB Atlas cloud database. Data is never lost across sessions, deployments, or server restarts."
    },
    {
      q: "What happens when an asset requires maintenance or repair?",
      a: "Employees can submit a maintenance or return ticket directly from their dashboard, specifying damage reasons, condition ratings, and repair requirements. The Admin receives real-time updates to approve repairs, reallocate backups, and maintain audit logs."
    },
    {
      q: "Can the system track both Hardware and Software licenses?",
      a: "Absolutely. ITAMS is built to handle laptops, servers, monitors, and peripherals under Hardware, while managing software license keys, seat allocations, and deadline expirations under Software."
    }
  ];

  return (
    <div className="landing-wrapper">
      {/* Glass Top Navigation (Constantly Fixed at Top) */}
      <header className={`landing-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container d-flex align-items-center justify-content-between">
          <Link to="/" className="landing-brand">
            <div className="landing-brand-icon">
              <i className="bi bi-cpu-fill" />
            </div>
            <div>
              <span className="fw-bold">ITAMS</span>
              <span className="ms-2 text-primary" style={{ fontSize: '0.78rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Enterprise</span>
            </div>
          </Link>

          <nav className="d-none d-lg-block">
            <ul className="landing-nav-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#portals">Portal Showcase</a></li>
              <li><a href="#workflow">How It Works</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </nav>

          <div className="d-flex align-items-center gap-2">
            <Link to="/login" className="btn-landing-secondary px-3 py-2 small">
              <i className="bi bi-box-arrow-in-right" />
              Sign In
            </Link>
            <Link to="/register" className="btn-landing-primary px-3 py-2 small d-none d-sm-inline-flex">
              <i className="bi bi-person-plus-fill" />
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="hero-pill">
                <span className="pulse-dot" />
                <span>Next-Gen Enterprise IT Asset Intelligence</span>
              </div>

              <h1 className="hero-title">
                Smart Asset Tracking Built for <span className="gradient-text">Modern Workspaces</span>
              </h1>

              <p className="hero-subtitle">
                Streamline company hardware, monitors, software licenses, and repair tickets with unified real-time telemetry. Empower employees with instant requisition while preserving absolute administrative control.
              </p>

              <div className="hero-cta-group">
                <Link to="/login" className="btn-landing-primary">
                  <i className="bi bi-speedometer2" />
                  Launch Workspace
                </Link>
                <a href="#portals" className="btn-landing-secondary">
                  <i className="bi bi-eye" />
                  Explore Live Demo
                </a>
              </div>

              <div className="hero-stats-row">
                <div className="hero-stat-card">
                  <div className="stat-value">1,250+</div>
                  <div className="stat-label">Assets Monitored</div>
                </div>
                <div className="hero-stat-card">
                  <div className="stat-value">99.98%</div>
                  <div className="stat-label">System Uptime</div>
                </div>
                <div className="hero-stat-card">
                  <div className="stat-value">1 Admin</div>
                  <div className="stat-label">Zero-Trust Isolation</div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="hero-preview-frame">
                <div className="preview-window-header">
                  <div className="preview-window-dots">
                    <span className="preview-dot red" />
                    <span className="preview-dot yellow" />
                    <span className="preview-dot green" />
                  </div>
                  <div className="preview-tab-pill">
                    <i className="bi bi-broadcast text-success me-1" />
                    Live Cloud Sync
                  </div>
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle small px-2 py-1">
                    MongoDB Atlas Connected
                  </span>
                </div>

                <div className="mock-asset-card">
                  <div className="mock-asset-info">
                    <div className="mock-asset-icon">
                      <i className="bi bi-laptop" />
                    </div>
                    <div>
                      <div className="mock-asset-name">MacBook Pro 16-inch (M3 Max)</div>
                      <div className="mock-asset-tag">AST-1092 • Assigned to Aakash S</div>
                    </div>
                  </div>
                  <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1">
                    Health: 100%
                  </span>
                </div>

                <div className="mock-asset-card">
                  <div className="mock-asset-info">
                    <div className="mock-asset-icon text-info" style={{ background: 'rgba(6, 182, 212, 0.2)' }}>
                      <i className="bi bi-display" />
                    </div>
                    <div>
                      <div className="mock-asset-name">Dell UltraSharp 32" 4K Monitor</div>
                      <div className="mock-asset-tag">AST-1031 • Assigned to Aakash S</div>
                    </div>
                  </div>
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1">
                    Health: 95%
                  </span>
                </div>

                <div className="mock-asset-card">
                  <div className="mock-asset-info">
                    <div className="mock-asset-icon text-warning" style={{ background: 'rgba(245, 158, 11, 0.2)' }}>
                      <i className="bi bi-mouse3" />
                    </div>
                    <div>
                      <div className="mock-asset-name">Logitech MX Master 3S Mouse</div>
                      <div className="mock-asset-tag">AST-1042 • Assigned to Sabari Giri M</div>
                    </div>
                  </div>
                  <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1">
                    Health: 100%
                  </span>
                </div>

                <div className="mock-asset-card">
                  <div className="mock-asset-info">
                    <div className="mock-asset-icon text-purple" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc' }}>
                      <i className="bi bi-file-earmark-lock" />
                    </div>
                    <div>
                      <div className="mock-asset-name">Adobe Creative Cloud License</div>
                      <div className="mock-asset-tag">LIC-504 • Assigned to Aakash S</div>
                    </div>
                  </div>
                  <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-3 py-1">
                    Active License
                  </span>
                </div>

                <div className="d-flex align-items-center justify-content-between pt-2 px-1 text-muted" style={{ fontSize: '0.8rem' }}>
                  <span><i className="bi bi-shield-check text-primary me-1" /> Encrypted Audit Trail</span>
                  <span><i className="bi bi-check-circle-fill text-success me-1" /> Real-Time Telemetry</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="landing-section" id="features">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Enterprise Capabilities</span>
            <h2 className="section-title">Engineered for Complete Asset Governance</h2>
            <p className="section-desc">
              From hardware procurement to maintenance ticketing and software renewals, ITAMS provides full lifecycle transparency without organizational friction.
            </p>
          </div>

          <div className="feature-grid">
            {/* Feature 1 */}
            <div className="feature-card">
              <div className="feature-icon-box">
                <i className="bi bi-box-seam" />
              </div>
              <h3 className="feature-title">Hardware Inventory Engine</h3>
              <p className="feature-desc">
                Comprehensive tracking of laptops, servers, ultrawide monitors, and peripherals with health diagnostics, condition history, and automated asset tagging.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon-box text-cyan" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', borderColor: 'rgba(6, 182, 212, 0.25)' }}>
                <i className="bi bi-key" />
              </div>
              <h3 className="feature-title">Software License Vault</h3>
              <p className="feature-desc">
                Centralized registry for enterprise software seats, license keys, and automated deadline reminders to prevent unexpected compliance expirations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card">
              <div className="feature-icon-box text-success" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.25)' }}>
                <i className="bi bi-send-check" />
              </div>
              <h3 className="feature-title">1-Click Request & Requisition</h3>
              <p className="feature-desc">
                Employees browse available inventory and requisition devices with business justifications. Admins approve or dispatch equipment with single-click precision.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="feature-card">
              <div className="feature-icon-box text-warning" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.25)' }}>
                <i className="bi bi-wrench-adjustable" />
              </div>
              <h3 className="feature-title">Maintenance & Issue Ticketing</h3>
              <p className="feature-desc">
                Automated diagnostics, damage photo submission, and repair ticket tracking. Keep devices operating at maximum health with continuous status updates.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="feature-card">
              <div className="feature-icon-box text-purple" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', borderColor: 'rgba(168, 85, 247, 0.25)' }}>
                <i className="bi bi-shield-lock" />
              </div>
              <h3 className="feature-title">Strict Single-Admin Security</h3>
              <p className="feature-desc">
                Rigorous Zero-Trust boundary ensures only the designated Administrator can manage users, assign assets, and alter permissions. Normal employees cannot escalate roles.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="feature-card">
              <div className="feature-icon-box text-info" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.25)' }}>
                <i className="bi bi-journal-text" />
              </div>
              <h3 className="feature-title">Audited Lifecycle History</h3>
              <p className="feature-desc">
                Every asset transaction, assignment, return, and repair is immutably logged with timestamps and operator signatures, ensuring foolproof enterprise compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Portal Showcase */}
      <section className="landing-section" id="portals" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Role-Based Experiences</span>
            <h2 className="section-title">Tailored Portals for Every Stakeholder</h2>
            <p className="section-desc">
              Experience the dual architecture: a clean self-service workspace for employees and an all-seeing command center for the Administrator.
            </p>

            <div className="portal-switcher mt-4">
              <button 
                type="button" 
                className={`portal-switch-btn ${activePortalTab === 'employee' ? 'active' : ''}`}
                onClick={() => setActivePortalTab('employee')}
              >
                <i className="bi bi-person-badge" />
                Employee Workspace
              </button>
              <button 
                type="button" 
                className={`portal-switch-btn ${activePortalTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActivePortalTab('admin')}
              >
                <i className="bi bi-shield-lock" />
                Admin Command Center
              </button>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-10">
              {activePortalTab === 'employee' ? (
                <div className="hero-preview-frame">
                  <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3 border-secondary border-opacity-25">
                    <div>
                      <h4 className="fw-bold mb-1 text-white">Employee Self-Service Portal</h4>
                      <p className="small mb-0" style={{ color: '#cbd5e1' }}>Empowers employees to manage personal gear, open tickets, and requisition hardware.</p>
                    </div>
                    <span className="badge bg-primary px-3 py-2 rounded-pill">
                      <i className="bi bi-check-circle-fill me-1" /> Active Session
                    </span>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="p-3 rounded-3" style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                          <i className="bi bi-laptop fs-5" />
                          <span className="fw-bold">My Assigned Assets</span>
                        </div>
                        <p className="small mb-0" style={{ color: '#94a3b8' }}>View all hardware laptops, peripherals, and software seats assigned to you with live health ratings.</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 rounded-3" style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="d-flex align-items-center gap-2 mb-2 text-info">
                          <i className="bi bi-plus-circle fs-5" />
                          <span className="fw-bold">Asset Requisition</span>
                        </div>
                        <p className="small mb-0" style={{ color: '#94a3b8' }}>Request new equipment with justification, urgency tags, and custom specifications directly to Admin.</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 rounded-3" style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="d-flex align-items-center gap-2 mb-2 text-warning">
                          <i className="bi bi-clock-history fs-5" />
                          <span className="fw-bold">Status Tracker</span>
                        </div>
                        <p className="small mb-0" style={{ color: '#94a3b8' }}>Real-time status tracking across Pending, In-Review, Dispatched, and Returned lifecycle states.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-top border-secondary border-opacity-25 text-center">
                    <Link to="/login" className="btn-landing-primary">
                      Enter Employee Portal <i className="bi bi-arrow-right ms-1" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="hero-preview-frame">
                  <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3 border-secondary border-opacity-25">
                    <div>
                      <h4 className="fw-bold mb-1 text-white">Admin Control Center</h4>
                      <p className="small mb-0" style={{ color: '#cbd5e1' }}>Comprehensive telemetry, role allocation, inventory management, and audit enforcement.</p>
                    </div>
                    <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold">
                      <i className="bi bi-crown-fill me-1" /> Chief Admin Access
                    </span>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="p-3 rounded-3" style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="d-flex align-items-center gap-2 mb-2 text-success">
                          <i className="bi bi-collection-fill fs-5" />
                          <span className="fw-bold">Global Inventory</span>
                        </div>
                        <p className="small mb-0" style={{ color: '#94a3b8' }}>Live stock grid with health statuses, QR code generator, asset filters, and equipment addition.</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 rounded-3" style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                          <i className="bi bi-people-fill fs-5" />
                          <span className="fw-bold">User Roles & Management</span>
                        </div>
                        <p className="small mb-0" style={{ color: '#94a3b8' }}>Live view of registered employees in MongoDB Atlas. Suspend, reactivate, and manage team permissions safely.</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 rounded-3" style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="d-flex align-items-center gap-2 mb-2 text-danger">
                          <i className="bi bi-wrench-adjustable-circle-fill fs-5" />
                          <span className="fw-bold">Approval & Ticket Desk</span>
                        </div>
                        <p className="small mb-0" style={{ color: '#94a3b8' }}>Evaluate employee requests, assign available hardware, verify damaged return proofs, and maintain logs.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-top border-secondary border-opacity-25 text-center">
                    <Link to="/login" className="btn-landing-primary" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)' }}>
                      Admin Sign In <i className="bi bi-shield-lock ms-1" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Workflow */}
      <section className="landing-section" id="workflow">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Intuitive Lifecycle</span>
            <h2 className="section-title">How ITAMS Operates in 4 Simple Steps</h2>
            <p className="section-desc">
              A frictionless workflow designed to save IT departments hundreds of hours every quarter.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="workflow-step-card">
                <span className="step-number">STEP 01</span>
                <h4 className="fw-bold text-white mb-2">Employee Registration</h4>
                <p className="small mb-0" style={{ color: '#cbd5e1' }}>
                  Employees self-register with company credentials. Accounts are securely created with standard Employee permissions.
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="workflow-step-card">
                <span className="step-number">STEP 02</span>
                <h4 className="fw-bold text-white mb-2">Requisition & Browse</h4>
                <p className="small mb-0" style={{ color: '#cbd5e1' }}>
                  Employees browse available inventory for laptops, curved monitors, or software tools and submit requests with justification.
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="workflow-step-card">
                <span className="step-number">STEP 03</span>
                <h4 className="fw-bold text-white mb-2">Admin Approval</h4>
                <p className="small mb-0" style={{ color: '#cbd5e1' }}>
                  The primary Administrator receives notification, reviews the ticket, and assigns the asset with an immutable audit entry.
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="workflow-step-card">
                <span className="step-number">STEP 04</span>
                <h4 className="fw-bold text-white mb-2">Health & Maintenance</h4>
                <p className="small mb-0" style={{ color: '#cbd5e1' }}>
                  Continuous health tracking, scheduled return deadlines, and repair diagnostics ensure zero equipment loss.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="landing-section" id="faq" style={{ background: 'rgba(11, 19, 41, 0.6)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Frequently Answered</span>
            <h2 className="section-title">Security & System FAQs</h2>
            <p className="section-desc">
              Everything you need to know about system access, user roles, and data protection.
            </p>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-8">
              {faqs.map((faq, index) => (
                <div key={index} className="landing-faq-item">
                  <div className="landing-faq-question" onClick={() => toggleFaq(index)}>
                    <span>{faq.q}</span>
                    <i className={`bi bi-chevron-${openFaq === index ? 'up' : 'down'} text-primary`} />
                  </div>
                  {openFaq === index && (
                    <div className="landing-faq-answer">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="container py-5">
        <div className="landing-cta-banner">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <h2 className="display-6 fw-bold landing-cta-title mb-3">
                Ready to Modernize Your IT Asset Ecosystem?
              </h2>
              <p className="landing-cta-desc mb-4">
                Experience seamless inventory management, zero-trust role security, and real-time equipment tracking today.
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Link to="/register" className="btn-landing-primary px-4 py-3">
                  <i className="bi bi-person-plus-fill me-1" />
                  Create Employee Account
                </Link>
                <Link to="/login" className="btn-landing-secondary px-4 py-3">
                  <i className="bi bi-box-arrow-in-right me-1" />
                  Sign In to Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-md-6">
              <div className="footer-brand-tag">
                <i className="bi bi-cpu-fill text-primary fs-5" />
                <span className="fs-5">ITAMS Enterprise</span>
              </div>
              <p className="mb-2 small" style={{ color: '#cbd5e1' }}>
                Enterprise-grade IT Asset Monitoring and Lifecycle Management Platform.
              </p>
              <div className="status-badge-live">
                <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />
                <span>All ITAMS Services Operational</span>
              </div>
            </div>

            <div className="col-md-6 text-md-end">
              <div className="footer-links d-flex justify-content-md-end gap-3 mb-2 small">
                <a href="#features">Features</a>
                <a href="#portals">Portals</a>
                <a href="#workflow">Workflow</a>
                <a href="#faq">FAQ</a>
                <Link to="/login" className="text-primary text-decoration-none fw-semibold">Sign In</Link>
              </div>
              <p className="small mb-0" style={{ color: '#94a3b8' }}>
                © {new Date().getFullYear()} ITAMS. All rights reserved. Persistent MongoDB Atlas Cloud Infrastructure.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

