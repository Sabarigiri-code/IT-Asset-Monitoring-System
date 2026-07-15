import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', icon: 'bi-grid-1x2-fill', label: 'Dashboard', end: true },
  { to: '/dashboard/my-assets', icon: 'bi-laptop', label: 'My Assets' },
  { to: '/dashboard/new-request', icon: 'bi-plus-circle', label: 'New Request' },
  { to: '/dashboard/status-tracker', icon: 'bi-clock-history', label: 'Status Tracker' },
];

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [chatMode, setChatMode] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am the IT Support Bot. How can I help you today?', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, chatMode]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    
    const userText = inputMsg.trim();
    const newMsg = { sender: 'user', text: userText, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setMessages(prev => [...prev, newMsg]);
    setInputMsg('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      
      let botResponse = "";
      const lower = userText.toLowerCase();
      
      if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
        botResponse = "Hello! How can I assist you with your IT assets today?";
      } else if (lower.includes('broken') || lower.includes('issue') || lower.includes('not working') || lower.includes('repair')) {
        botResponse = "I'm sorry to hear you're experiencing an issue. Could you please specify the asset tag or device type?";
      } else if (lower.includes('request') || lower.includes('need') || lower.includes('new') || lower.includes('want')) {
        botResponse = "If you need a new asset or software license, you can easily open a formal ticket via the 'New Request' page.";
      } else if (lower.includes('good') || lower.includes('great') || lower.includes('thanks') || lower.includes('ok')) {
        botResponse = "Awesome! Let me know if you need anything else.";
      } else if (lower.includes('status') || lower.includes('track') || lower.includes('where')) {
        botResponse = "You can securely track the status of all your pending requests and open issues on the 'Status Tracker' page.";
      } else {
        const genericResponses = [
          "Thanks for reaching out! An agent will be with you shortly. Your place in queue is #1.",
          "I've noted that down. Is there any additional context you'd like to provide?",
          "Let me check the system for that. One moment, please.",
          "Could you confirm your department so I can route this to the correct team?"
        ];
        botResponse = genericResponses[Math.floor(Math.random() * genericResponses.length)];
      }

      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: botResponse, 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
      }]);
    }, 1500);
  };

  const closeSupportModal = () => {
    setSupportModalOpen(false);
    setTimeout(() => {
      setChatMode(false);
      setMessages([{ sender: 'bot', text: 'Hi! I am the IT Support Bot. How can I help you today?', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    }, 300);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />}

      <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`} id="sidebar-nav" aria-label="Main navigation">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <i className="bi bi-cpu" />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">ITAMS</span>
            <span className="sidebar-brand-tagline">Asset Monitor</span>
          </div>
          <button className="sidebar-close-btn d-lg-none" onClick={onClose} aria-label="Close sidebar">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {navItems.map((item) => (
              <li key={item.to} className="sidebar-menu-item">
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                  id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <span className="sidebar-link-icon">
                    <i className={`bi ${item.icon}`} />
                  </span>
                  <span className="sidebar-link-label">{item.label}</span>
                  {item.end && <span className="sidebar-link-indicator" />}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="sidebar-footer">
          <div className="sidebar-help-card">
            <div className="sidebar-help-icon">
              <i className="bi bi-headset" />
            </div>
            <p className="sidebar-help-text">Need help?</p>
            <button 
              className="sidebar-help-link btn btn-link p-0 fw-bold text-primary text-decoration-none w-100 mt-2" 
              onClick={() => setSupportModalOpen(true)}
            >
              Contact IT Support
            </button>
          </div>
        </div>
      </aside>

      {/* IT Support Center Modal */}
      {supportModalOpen && (
        <div className="modal-overlay d-flex align-items-center justify-content-center" onClick={closeSupportModal} style={{ zIndex: 1100 }}>
          <div className="modal-card bg-white rounded-4 shadow-lg overflow-hidden animation-zoom-in d-flex flex-column" onClick={e => e.stopPropagation()} style={{ width: '400px', height: '600px', maxWidth: '90vw', maxHeight: '90vh', margin: '1rem' }}>
            <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center flex-shrink-0 shadow-sm z-1">
              <div className="d-flex align-items-center gap-3">
                {chatMode ? (
                  <button className="btn btn-link text-white p-0 border-0 shadow-none" onClick={() => setChatMode(false)}>
                    <i className="bi bi-arrow-left fs-5" />
                  </button>
                ) : (
                  <div className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-headset fs-5" />
                  </div>
                )}
                <div className="lh-sm">
                  <h6 className="mb-0 fw-bold">{chatMode ? 'Live Support Chat' : 'IT Support Center'}</h6>
                  <small className="opacity-75" style={{ fontSize: '0.75rem' }}>{chatMode ? (isTyping ? 'Agent typing...' : 'Online') : 'We are here to help'}</small>
                </div>
              </div>
              <button className="btn-close btn-close-white shadow-none" onClick={closeSupportModal} aria-label="Close" />
            </div>

            <div className="flex-grow-1 overflow-auto bg-light">
              {!chatMode ? (
                <div className="p-4">
                  <p className="text-muted small mb-4 text-center">How would you like to contact us?</p>
                  
                  <div className="d-flex flex-column gap-3">
                    <button className="btn btn-white border rounded-3 p-3 text-start d-flex align-items-center gap-3 shadow-sm hover-bg-light transition-colors" onClick={() => setChatMode(true)}>
                      <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '40px', height: '40px' }}>
                        <i className="bi bi-chat-dots-fill" />
                      </div>
                      <div>
                        <h6 className="mb-1 fw-bold text-dark fs-6">Live Chat</h6>
                        <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>Get instant help from our IT bot & agents.</p>
                      </div>
                    </button>
                    
                    <button className="btn btn-white border rounded-3 p-3 text-start d-flex align-items-center gap-3 shadow-sm hover-bg-light transition-colors" onClick={() => { closeSupportModal(); navigate('/dashboard/new-request'); }}>
                      <div className="bg-amber-100 text-amber-700 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '40px', height: '40px' }}>
                        <i className="bi bi-ticket-detailed-fill" />
                      </div>
                      <div>
                        <h6 className="mb-1 fw-bold text-dark fs-6">Open a Ticket</h6>
                        <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>Report an issue or request hardware.</p>
                      </div>
                    </button>

                    <button className="btn btn-white border rounded-3 p-3 text-start d-flex align-items-center gap-3 shadow-sm hover-bg-light transition-colors" onClick={() => alert('Dialing +1 (800) 555-0199...')}>
                      <div className="bg-emerald-100 text-emerald-700 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '40px', height: '40px' }}>
                        <i className="bi bi-telephone-fill" />
                      </div>
                      <div>
                        <h6 className="mb-1 fw-bold text-dark fs-6">Call Helpdesk</h6>
                        <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>+1 (800) 555-0199 (Mon-Fri 9AM-5PM)</p>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 d-flex flex-column gap-3">
                  <div className="text-center my-2">
                    <span className="badge bg-secondary-subtle text-secondary fw-normal">Today</span>
                  </div>
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`d-flex flex-column ${msg.sender === 'user' ? 'align-items-end' : 'align-items-start'}`}>
                      <div className={`p-3 rounded-4 shadow-sm ${msg.sender === 'user' ? 'bg-primary text-white rounded-bottom-end-0' : 'bg-white text-dark border rounded-bottom-start-0'}`} style={{ maxWidth: '85%' }}>
                        <p className="mb-0 small" style={{ lineHeight: '1.4' }}>{msg.text}</p>
                      </div>
                      <small className="text-muted mt-1" style={{ fontSize: '0.65rem' }}>{msg.time}</small>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="d-flex align-items-start">
                      <div className="bg-white border p-2 rounded-4 rounded-bottom-start-0 shadow-sm d-flex gap-1 align-items-center">
                        <span className="spinner-grow spinner-grow-sm text-muted" style={{ width: '4px', height: '4px', animationDuration: '1s' }} />
                        <span className="spinner-grow spinner-grow-sm text-muted" style={{ width: '4px', height: '4px', animationDuration: '1s', animationDelay: '0.2s' }} />
                        <span className="spinner-grow spinner-grow-sm text-muted" style={{ width: '4px', height: '4px', animationDuration: '1s', animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {chatMode && (
              <div className="p-3 bg-white border-top flex-shrink-0 shadow-sm z-1">
                <form onSubmit={handleSendMessage} className="d-flex gap-2">
                  <input 
                    type="text" 
                    className="form-control rounded-pill bg-light border-0 px-3" 
                    placeholder="Type your message..." 
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    autoFocus
                  />
                  <button type="submit" className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '40px', height: '40px' }} disabled={!inputMsg.trim() || isTyping}>
                    <i className="bi bi-send-fill" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .hover-bg-light:hover {
          background-color: var(--gray-50) !important;
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
      `}</style>
    </>
  );
}
