/**
 * Dashboard Layout
 * Layout for all authenticated dashboard pages
 * Includes Sidebar and TopHeader
 */

import Sidebar from '../components/navigation/Sidebar';
import TopHeader from '../components/navigation/TopHeader';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-wrapper">
        <TopHeader />
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
