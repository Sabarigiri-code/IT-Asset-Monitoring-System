import SummaryCards from './SummaryCards';
import AssetsTable from './AssetsTable';
import QuickActionsPanel from './QuickActionsPanel';

export default function DashboardHome() {
  return (
    <div className="dashboard-home">
      {/* Summary metric cards */}
      <SummaryCards />

      {/* Main 2-column content */}
      <div className="dashboard-columns">
        <div className="dashboard-col-primary">
          <AssetsTable />
        </div>
        <div className="dashboard-col-secondary">
          <QuickActionsPanel />
        </div>
      </div>
    </div>
  );
}
