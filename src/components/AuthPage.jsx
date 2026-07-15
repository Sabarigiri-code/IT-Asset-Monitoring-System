import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/* ──────────────────────────────────────────────
   Branding Panel (Left Side)
   ────────────────────────────────────────────── */
function BrandingPanel({ onFeatureClick }) {
  const features = [
    {
      id: 'assets',
      icon: 'bi-hdd-rack',
      label: 'Asset Tracking',
      desc: 'Real-time visibility into all hardware. Track check-ins, check-outs, assignments, and device lifecycles.',
      preview: [
        { name: 'MacBook Pro 16"', status: 'Assigned', info: 'Amit Sharma' },
        { name: 'Dell XPS 15"', status: 'Available', info: 'Ready' },
        { name: 'iPhone 15 Pro', status: 'In Repair', info: 'Screen Fix' }
      ],
      role: 'employee',
      path: '/dashboard'
    },
    {
      id: 'licenses',
      icon: 'bi-shield-check',
      label: 'License Mgmt',
      desc: 'Monitor software seat counts, activation keys, and subscription expirations to ensure constant compliance.',
      preview: [
        { name: 'Adobe Creative Cloud', status: 'Warning', info: '5 seats left' },
        { name: 'Slack Pro Plan', status: 'Active', info: '88/100 seats' },
        { name: 'Office 365 Enterprise', status: 'Active', info: '150/200 seats' }
      ],
      role: 'admin',
      path: '/admin'
    },
    {
      id: 'analytics',
      icon: 'bi-graph-up-arrow',
      label: 'Analytics',
      desc: 'Analyze organization-wide IT spend, allocation trends, active ticket queues, and software license usage metrics.',
      preview: [
        { name: 'Total Assets Owned', status: '1,482', info: 'Hardware & Software' },
        { name: 'Monthly IT Spend', status: '$14,250', info: 'On Track' },
        { name: 'Active Tickets', status: '28 Items', info: '8 Urgent' }
      ],
      role: 'admin',
      path: '/admin'
    },
    {
      id: 'maintenance',
      icon: 'bi-tools',
      label: 'Maintenance',
      desc: 'Submit maintenance tickets, track hardware repair pipelines, and review history logs for asset health.',
      preview: [
        { name: 'Dell 24" Monitor', status: 'Scheduled', info: 'Port Upgrade' },
        { name: 'Lenovo ThinkPad', status: 'In Progress', info: 'Flickering Screen' },
        { name: 'iPad Air (A14)', status: 'Completed', info: 'Battery Replaced' }
      ],
      role: 'admin',
      path: '/admin'
    }
  ];

  return (
    <section className="auth-branding" aria-label="System branding">
      {/* Decorative orbs */}
      <div className="floating-orb orb-1" />
      <div className="floating-orb orb-2" />
      <div className="floating-orb orb-3" />

      <div className="branding-content">
        <div className="brand-logo-wrapper">
          <i className="bi bi-cpu" />
        </div>

        <h2 className="branding-title">
          IT Asset <span>Monitoring System</span>
        </h2>

        <p className="branding-subtitle">
          Streamline your organization&apos;s IT asset lifecycle — from procurement
          to retirement — with real-time tracking & insights.
        </p>

        <div className="feature-pills">
          {features.map((f) => (
            <button
              className="feature-pill"
              key={f.label}
              onClick={() => onFeatureClick(f)}
              type="button"
            >
              <i className={`bi ${f.icon}`} />
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   Sign In Form
   ────────────────────────────────────────────── */
function SignInForm({ onSwitch }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: localStorage.getItem('rememberedEmail') || '',
    password: localStorage.getItem('rememberedPassword') || '',
    role: 'employee',
    remember: !!localStorage.getItem('rememberedEmail'),
  });
  const [savedAccounts, setSavedAccounts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('savedAccounts') || '[]'); } 
    catch { return []; }
  });
  const [showAccounts, setShowAccounts] = useState(false);
  const [validated, setValidated] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);
    setApiError(null);
    const formEl = e.currentTarget;
    if (!formEl.checkValidity()) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, role: form.role })
      });
      const data = await response.json();
      
      if (!response.ok) {
        const errorMsg = data.message || 'Login failed';
        setApiError(errorMsg);
        
        // Show a prominent popup message, especially for suspended accounts
        if (response.status === 403 || errorMsg.toLowerCase().includes('suspended')) {
          toast.error(errorMsg, {
            duration: 6000,
            style: {
              background: '#dc3545',
              color: '#fff',
              fontWeight: 'bold',
              padding: '16px',
              fontSize: '1.1rem'
            },
            icon: '⛔'
          });
        }
        
        setLoading(false);
        return;
      }
      
      // Save Remember Me settings
      if (form.remember) {
        localStorage.setItem('rememberedEmail', form.email);
        localStorage.setItem('rememberedPassword', form.password);
        
        // Also save to savedAccounts list for the dropdown feature
        const saved = JSON.parse(localStorage.getItem('savedAccounts') || '[]');
        const filtered = saved.filter(acc => acc.email !== form.email);
        filtered.push({ email: form.email, password: form.password, role: form.role });
        localStorage.setItem('savedAccounts', JSON.stringify(filtered));
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }
      
      // Save to localStorage
      localStorage.setItem('currentUser', JSON.stringify({
        name: data.user.fullName,
        email: data.user.email,
        role: data.user.role
      }));
      // The role the user SELECTED on the login form
      const selectedRole = form.role; // 'employee' or 'admin'
      const dbRole = data.user.role || '';

      // Strict check: if they selected Admin but DB says they're not, block them
      if (selectedRole === 'admin' && !dbRole.toLowerCase().includes('admin')) {
        setApiError('Access Denied: You do not have admin privileges.');
        toast.error('Access Denied! This account does not have admin access.', {
          duration: 5000,
          style: { background: '#dc2626', color: '#fff', fontWeight: 'bold', padding: '16px', fontSize: '1rem' },
          icon: '⛔'
        });
        setLoading(false);
        return;
      }

      // Show welcome popup based on SELECTED role
      const isAdminLogin = selectedRole === 'admin';
      const firstName = data.user.fullName ? data.user.fullName.split(' ')[0] : 'there';
      const dbRoleLower = dbRole.toLowerCase();

      // Detect if they have a promoted role (Manager, IT Admin, etc.)
      const isManager  = dbRoleLower === 'manager';
      const isITAdmin  = dbRoleLower === 'it admin';
      const isPromoted = !isAdminLogin && (isManager || isITAdmin);

      if (isAdminLogin) {
        // Admin dark premium toast
        toast.success(`Welcome Chief, ${firstName}! 👑`, {
          duration: 5000,
          style: {
            background: '#0f172a',
            color: '#fff',
            fontWeight: 'bold',
            padding: '16px 24px',
            fontSize: '1.2rem',
            border: '2px solid #3b82f6',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
            borderRadius: '12px'
          },
          icon: '🚀'
        });

      } else if (isPromoted) {
        // Standard welcome first
        toast.success(`Welcome back, ${firstName}! 👋`, {
          duration: 2500,
          style: {
            background: '#10b981',
            color: '#fff',
            fontWeight: 'bold',
            padding: '14px 22px',
            fontSize: '1.1rem',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(16,185,129,0.3)'
          },
          icon: '👋'
        });

        // Check if they already saw this promotion
        const promoKey = `promoted_${data.user.email}`;
        const lastSeenRole = localStorage.getItem(promoKey);

        if (lastSeenRole !== dbRoleLower) {
          // Update local storage so they don't see it again for this role
          localStorage.setItem(promoKey, dbRoleLower);

          // Then a special role promotion popup after a short delay
          setTimeout(() => {
          const roleMessages = {
            'manager'  : { emoji: '🌟', label: 'Manager', phrase: 'Your team is counting on you. Lead the way!' },
            'it admin' : { emoji: '🛡️', label: 'IT Admin', phrase: 'System access granted. You keep the engine running!' },
          };
          const rm = roleMessages[dbRoleLower] || { emoji: '⭐', label: dbRole, phrase: 'Big things ahead for you!' };

          toast(
            (t) => (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '2rem', lineHeight: 1 }}>{rm.emoji}</span>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1rem', marginBottom: '2px' }}>
                    You are promoted to {rm.label}!
                  </div>
                  <div style={{ fontSize: '0.82rem', opacity: 0.85, lineHeight: '1.4' }}>
                    {rm.phrase}
                  </div>
                </div>
              </div>
            ),
            {
              duration: 8000,
              style: {
                background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                color: '#fff',
                padding: '20px',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.5)',
                border: '1px solid rgba(255,255,255,0.2)'
              },
              position: 'top-center'
            }
          );
        }, 3000);
      }
      } else {
        // Regular employee toast
        toast.success(`Welcome back, ${firstName}! 👋`, {
          duration: 4500,
          style: {
            background: '#10b981',
            color: '#fff',
            fontWeight: 'bold',
            padding: '16px 24px',
            fontSize: '1.2rem',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(16,185,129,0.3)'
          },
          icon: '👋'
        });
      }

      // Navigate based on what the user CHOSE, not the DB role
      if (isAdminLogin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setApiError('Unable to connect to the server.');
      setLoading(false);
    }
  };

  return (
    <div className="form-enter" key="signin">
      <div className="form-header">
        <h1>Welcome Back</h1>
        <p>Sign in to your account to continue</p>
      </div>

      {apiError && (
        <div className="alert alert-danger py-2 small mb-3 border-0 d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-circle-fill"></i> {apiError}
        </div>
      )}

      <form noValidate className={validated ? 'was-validated' : ''} onSubmit={handleSubmit} id="signin-form">
        {/* Email */}
        <div className="form-floating-custom position-relative">
          <i className="bi bi-envelope input-icon" />
          <input
            type="email"
            className="form-control"
            id="signin-email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            onFocus={() => setShowAccounts(true)}
            onBlur={() => setTimeout(() => setShowAccounts(false), 200)}
            autoComplete="off"
            required
          />
          <div className="invalid-feedback">Please enter a valid email address.</div>
          
          {/* Custom Saved Accounts Dropdown */}
          {showAccounts && savedAccounts.length > 0 && (
            <div className="saved-accounts-dropdown">
              {savedAccounts.map((acc, idx) => (
                <div 
                  key={idx} 
                  className="saved-account-item"
                  onClick={() => {
                    setForm(prev => ({ ...prev, email: acc.email, password: acc.password, role: acc.role || 'employee', remember: true }));
                    setShowAccounts(false);
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <div className="account-avatar">
                      <i className="bi bi-person-circle" />
                    </div>
                    <div className="account-details">
                      <div className="account-email">{acc.email}</div>
                      <div className="account-password">••••••••</div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="saved-accounts-footer">
                <i className="bi bi-key-fill text-primary" /> Manage passwords...
              </div>
            </div>
          )}
        </div>

        {/* Password */}
        <div className="form-floating-custom">
          <i className="bi bi-lock input-icon" />
          <input
            type={showPw ? 'text' : 'password'}
            className="form-control"
            id="signin-password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
            minLength={6}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            <i className={`bi ${showPw ? 'bi-eye-slash' : 'bi-eye'}`} />
          </button>
          <div className="invalid-feedback">Password must be at least 6 characters.</div>
        </div>

        {/* Role Selector */}
        <div className="role-selector">
          <span className="role-selector-label">Login as</span>
          <div className="role-options">
            <div className="role-option">
              <input
                type="radio"
                id="role-employee"
                name="role"
                value="employee"
                checked={form.role === 'employee'}
                onChange={handleChange}
              />
              <label htmlFor="role-employee">
                <i className="bi bi-person-badge" />
                Employee
              </label>
            </div>
            <div className="role-option">
              <input
                type="radio"
                id="role-admin"
                name="role"
                value="admin"
                checked={form.role === 'admin'}
                onChange={handleChange}
              />
              <label htmlFor="role-admin">
                <i className="bi bi-shield-lock" />
                Admin
              </label>
            </div>
          </div>
        </div>

        {/* Remember / Forgot */}
        <div className="form-extras">
          <div className="form-check-custom">
            <input
              type="checkbox"
              className="form-check-input"
              id="remember-me"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="remember-me">
              Remember me
            </label>
          </div>
          <a href="#forgot" className="forgot-link" id="forgot-password-link">
            Forgot Password?
          </a>
        </div>

        {/* Submit */}
        <button type="submit" className="btn-auth-primary" id="signin-button" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
          {!loading && <i className="bi bi-arrow-right" />}
        </button>
      </form>

      <div className="auth-footer-text">
        Don&apos;t have an account?{' '}
        <a href="#register" onClick={(e) => { e.preventDefault(); onSwitch(); }} id="switch-to-register">
          Create Account
        </a>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Register Form
   ────────────────────────────────────────────── */
function RegisterForm({ onSwitch }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [validated, setValidated] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const passwordsMatch = form.password && form.confirmPassword && form.password === form.confirmPassword;
  const passwordsMismatch = form.confirmPassword && form.password !== form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);
    setApiError(null);
    const formEl = e.currentTarget;
    if (!formEl.checkValidity() || !passwordsMatch) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fullName: form.fullName, 
          email: form.email, 
          password: form.password 
        })
      });
      const data = await response.json();
      
      if (!response.ok) {
        setApiError(data.message || 'Registration failed');
        setLoading(false);
        return;
      }
      
      // Save to localStorage
      localStorage.setItem('currentUser', JSON.stringify({
        name: data.user.fullName,
        email: data.user.email,
        role: data.user.role
      }));

      // Navigate
      navigate('/dashboard');
    } catch (err) {
      setApiError('Unable to connect to the server.');
      setLoading(false);
    }
  };

  return (
    <div className="form-enter" key="register">
      <div className="form-header">
        <h1>Create Account</h1>
        <p>Register to get started with asset management</p>
      </div>

      {apiError && (
        <div className="alert alert-danger py-2 small mb-3 border-0 d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-circle-fill"></i> {apiError}
        </div>
      )}

      <form noValidate className={validated ? 'was-validated' : ''} onSubmit={handleSubmit} id="register-form">
        {/* Full Name */}
        <div className="form-floating-custom">
          <i className="bi bi-person input-icon" />
          <input
            type="text"
            className="form-control"
            id="register-fullname"
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            autoComplete="name"
            required
          />
          <div className="invalid-feedback">Full name is required.</div>
        </div>

        {/* Email */}
        <div className="form-floating-custom">
          <i className="bi bi-envelope input-icon" />
          <input
            type="email"
            className="form-control"
            id="register-email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
          <div className="invalid-feedback">Please enter a valid email address.</div>
        </div>

        {/* Password */}
        <div className="form-floating-custom">
          <i className="bi bi-lock input-icon" />
          <input
            type={showPw ? 'text' : 'password'}
            className="form-control"
            id="register-password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
            minLength={8}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            <i className={`bi ${showPw ? 'bi-eye-slash' : 'bi-eye'}`} />
          </button>
          <div className="invalid-feedback">Password must be at least 8 characters.</div>
        </div>

        {/* Confirm Password */}
        <div className="form-floating-custom">
          <i className="bi bi-lock-fill input-icon" />
          <input
            type={showCpw ? 'text' : 'password'}
            className={`form-control ${passwordsMismatch ? 'is-invalid' : ''} ${passwordsMatch ? 'is-valid' : ''}`}
            id="register-confirm-password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowCpw((v) => !v)}
            aria-label={showCpw ? 'Hide password' : 'Show password'}
            style={passwordsMatch || passwordsMismatch ? { right: '2.5rem' } : {}}
          >
            <i className={`bi ${showCpw ? 'bi-eye-slash' : 'bi-eye'}`} />
          </button>
          {passwordsMatch && <span className="input-success-check"><i className="bi bi-check-circle-fill" /></span>}
          {passwordsMismatch && <div className="invalid-feedback">Passwords do not match.</div>}
        </div>

        {/* Submit */}
        <button type="submit" className="btn-auth-primary" id="register-button" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
          {!loading && <i className="bi bi-arrow-right" />}
        </button>
      </form>

      <div className="auth-footer-text">
        Already have an account?{' '}
        <a href="#signin" onClick={(e) => { e.preventDefault(); onSwitch(); }} id="switch-to-signin">
          Sign In
        </a>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Auth Page (Main Component)
   ────────────────────────────────────────────── */
export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('signin');
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [authPrompt, setAuthPrompt] = useState(null); // { label, role }
  const navigate = useNavigate();

  const handleEnterConsole = (feature) => {
    // Close the modal and prompt user to sign in / register
    setSelectedFeature(null);
    setAuthPrompt({ label: feature.label, role: feature.role });
    setActiveTab('signin');

    // Auto-clear the prompt after 8 seconds
    setTimeout(() => setAuthPrompt(null), 8000);
  };

  const handleSwitchToRegister = (feature) => {
    setSelectedFeature(null);
    setAuthPrompt({ label: feature.label, role: feature.role });
    setActiveTab('register');
    setTimeout(() => setAuthPrompt(null), 8000);
  };

  const standardStatuses = ['assigned', 'available', 'in repair', 'warning', 'active', 'scheduled', 'in progress', 'completed'];

  return (
    <div className="auth-page">
      {/* Left — Branding */}
      <BrandingPanel onFeatureClick={setSelectedFeature} />

      {/* Right — Form Area */}
      <main className="auth-form-panel" aria-label="Authentication form">
        <div className="auth-form-container">
          <div className={`auth-card ${authPrompt ? 'auth-card-highlight' : ''}`}>
            <div className="auth-card-body">

              {/* Auth Prompt Banner */}
              {authPrompt && (
                <div className="auth-prompt-banner">
                  <i className="bi bi-shield-lock-fill" />
                  <div>
                    <strong>Authentication Required</strong>
                    <span>Please sign in or create an account to access <em>{authPrompt.label}</em></span>
                  </div>
                  <button className="auth-prompt-close" onClick={() => setAuthPrompt(null)} aria-label="Dismiss">
                    <i className="bi bi-x" />
                  </button>
                </div>
              )}

              {/* Tab Toggle */}
              <div className="auth-tabs" role="tablist" aria-label="Authentication tabs">
                <button
                  className={`auth-tab ${activeTab === 'signin' ? 'active' : ''}`}
                  onClick={() => setActiveTab('signin')}
                  role="tab"
                  aria-selected={activeTab === 'signin'}
                  id="tab-signin"
                >
                  <i className="bi bi-box-arrow-in-right me-2" />
                  Sign In
                </button>
                <button
                  className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                  onClick={() => setActiveTab('register')}
                  role="tab"
                  aria-selected={activeTab === 'register'}
                  id="tab-register"
                >
                  <i className="bi bi-person-plus me-2" />
                  Register
                </button>
              </div>

              {/* Form */}
              {activeTab === 'signin' ? (
                <SignInForm onSwitch={() => setActiveTab('register')} />
              ) : (
                <RegisterForm onSwitch={() => setActiveTab('signin')} />
              )}
            </div>
          </div>

          <p className="auth-copyright">
            &copy; {new Date().getFullYear()} IT Asset Monitoring System. All rights reserved.
          </p>
        </div>
      </main>

      {/* Interactive Feature Preview Modal */}
      {selectedFeature && (
        <div className="feature-modal-overlay" onClick={() => setSelectedFeature(null)}>
          <div className="feature-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="feature-modal-close" onClick={() => setSelectedFeature(null)} aria-label="Close modal">
              <i className="bi bi-x-lg" />
            </button>
            
            <div className="feature-modal-header">
              <div className="feature-modal-icon-wrapper">
                <i className={`bi ${selectedFeature.icon}`} />
              </div>
              <h3 className="feature-modal-title">{selectedFeature.label}</h3>
            </div>

            <div className="feature-modal-body">
              <p className="feature-modal-desc">{selectedFeature.desc}</p>
              
              <div className="feature-modal-preview-title">Live preview state</div>
              <div className="feature-modal-list">
                {selectedFeature.preview.map((item, idx) => {
                  const statusLower = item.status.toLowerCase();
                  const isStandard = standardStatuses.includes(statusLower);
                  const statusClass = isStandard ? statusLower.replace(' ', '-') : 'default';
                  return (
                    <div className="feature-modal-item" key={idx}>
                      <div className="feature-modal-item-name">{item.name}</div>
                      <div className="feature-modal-item-right">
                        <span className={`badge-preview badge-preview--${statusClass}`}>
                          {item.status}
                        </span>
                        <span className="feature-modal-item-info">{item.info}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Auth required notice */}
              <div className="feature-modal-auth-notice">
                <i className="bi bi-info-circle" />
                <span>You need to sign in or create an account to access this feature.</span>
              </div>
            </div>

            <div className="feature-modal-footer" style={{ gap: '0.75rem' }}>
              <button className="btn-feature-secondary" onClick={() => handleSwitchToRegister(selectedFeature)}>
                <i className="bi bi-person-plus" />
                Create Account
              </button>
              <button className="btn-feature-primary" onClick={() => handleEnterConsole(selectedFeature)}>
                <i className="bi bi-box-arrow-in-right" />
                Sign In to Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

