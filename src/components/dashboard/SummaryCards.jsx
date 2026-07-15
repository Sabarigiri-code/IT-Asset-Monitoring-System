import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

const getCost = (asset) => {
  if (asset.cost) {
    const parsed = parseFloat(String(asset.cost).replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed)) return parsed;
  }
  const typeStr = String(asset.category || asset.type).toLowerCase();
  if (typeStr.includes('laptop') || typeStr.includes('macbook')) return 85000;
  if (typeStr.includes('monitor') || typeStr.includes('display')) return 15000;
  if (typeStr.includes('license') || typeStr.includes('software')) return 12000;
  return 3500;
};

export default function SummaryCards() {
  const navigate = useNavigate();
  const { userName, userEmail } = useOutletContext() || { userName: 'Saurabh Kumar', userEmail: 'saurabh.k@company.com' };

  const [stats, setStats] = useState({
    assigned: 0,
    pending: 0,
    issues: 0,
    value: 0
  });

  useEffect(() => {
    // Fetch user's assigned assets
    fetch('https://it-asset-monitoring-system.onrender.com/api/assets')
      .then(res => res.json())
      .then(data => {
        const myAssets = data.filter(a => String(a.assignee || '').trim().toLowerCase() === String(userName || '').trim().toLowerCase());
        const totalValue = myAssets.reduce((acc, curr) => acc + getCost(curr), 0);
        setStats(prev => ({ ...prev, assigned: myAssets.length, value: totalValue }));
      })
      .catch(console.error);

    // Fetch user's requests and issues
    fetch('https://it-asset-monitoring-system.onrender.com/api/requests')
      .then(res => res.json())
      .then(data => {
        const myRequests = data.filter(r => r.requesterName === userName || r.requesterEmail === userEmail);
        let stored = [];
        try { 
          const rawStored = JSON.parse(localStorage.getItem('mock_requests') || '[]'); 
          stored = rawStored.filter(r => r.requesterName === userName || r.requesterEmail === userEmail);
        } catch(e){}
        
        const allReq = [...stored, ...myRequests];
        const pendingCount = allReq.filter(req => req.type === 'Request' && req.status === 'Pending Approval').length;
        const issuesCount = allReq.filter(req => req.type === 'Issue' && req.status !== 'Resolved').length;

        setStats(prev => ({ ...prev, pending: pendingCount, issues: issuesCount }));
      })
      .catch(err => {
        console.error(err);
        let stored = [];
        try { 
          const rawStored = JSON.parse(localStorage.getItem('mock_requests') || '[]'); 
          stored = rawStored.filter(r => r.requesterName === userName || r.requesterEmail === userEmail);
        } catch(e){}
        const pendingCount = stored.filter(req => req.type === 'Request' && req.status === 'Pending Approval').length;
        const issuesCount = stored.filter(req => req.type === 'Issue' && req.status !== 'Resolved').length;
        setStats(prev => ({ ...prev, pending: pendingCount, issues: issuesCount }));
      });
  }, [userName, userEmail]);

  const cards = [
    {
      id: 'card-assigned-assets',
      icon: 'bi-laptop',
      label: 'Assigned Assets',
      value: stats.assigned,
      trend: 'Currently assigned',
      trendUp: null,
      color: 'blue',
      path: '/dashboard/my-assets',
    },
    {
      id: 'card-pending-requests',
      icon: 'bi-hourglass-split',
      label: 'Pending Requests',
      value: stats.pending,
      trend: stats.pending > 0 ? `${stats.pending} awaiting approval` : 'All caught up',
      trendUp: null,
      color: 'amber',
      path: '/dashboard/status-tracker',
    },
    {
      id: 'card-open-issues',
      icon: 'bi-exclamation-triangle',
      label: 'Open Issues',
      value: stats.issues,
      trend: stats.issues > 0 ? 'Requires attention' : 'No active issues',
      trendUp: null,
      color: 'rose',
      path: '/dashboard/status-tracker',
    },
    {
      id: 'card-total-value',
      icon: 'bi-currency-rupee',
      label: 'Total Asset Value',
      value: `₹${stats.value.toLocaleString()}`,
      trend: 'Estimated value',
      trendUp: null,
      color: 'emerald',
      path: '/dashboard/my-assets',
    },
  ];

  return (
    <div className="summary-cards-row">
      {cards.map((card, idx) => (
        <div
          className={`summary-card summary-card--${card.color} clickable-summary-card`}
          key={card.id}
          id={card.id}
          style={{ animationDelay: `${idx * 80}ms` }}
          onClick={() => navigate(card.path)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigate(card.path);
            }
          }}
        >
          <div className="summary-card-icon-wrap">
            <i className={`bi ${card.icon}`} />
          </div>
          <div className="summary-card-body">
            <span className="summary-card-label">{card.label}</span>
            <span className="summary-card-value">{card.value}</span>
            <span className="summary-card-trend">
              {card.trendUp === true && <i className="bi bi-arrow-up-short" />}
              {card.trendUp === false && <i className="bi bi-arrow-down-short" />}
              {card.trend}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
