import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import HealthReportList from '../medical/HealthReportList';
import HealthReportDetail from '../medical/HealthReportDetail';
import SettingsPage from '../settings/SettingsPage';
import YourTwinPage from '../twin/YourTwinPage';
interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [selectedScanId, setSelectedScanId] = useState<number | null>(null);
  const [searchParams] = useSearchParams();

  // Check if we should switch to settings tab (e.g., after OAuth callback)
  React.useEffect(() => {
    const tab = searchParams.get('tab');
    
    // If tab parameter is specified, switch to that tab
    if (tab === 'settings') {
      setSelectedMenu('settings');
    }
  }, [searchParams]);

  const handleMenuSelect = (key: string) => {
    setSelectedMenu(key);
    setSelectedScanId(null); // Reset scan detail view when changing menu
  };

  const handleViewDetail = (scanId: number) => {
    setSelectedScanId(scanId);
  };

  const handleBackToList = () => {
    setSelectedScanId(null);
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case 'health-report':
        if (selectedScanId) {
          return (
            <HealthReportDetail 
              scanId={selectedScanId} 
              onBack={handleBackToList}
            />
          );
        }
        return <HealthReportList onViewDetail={handleViewDetail} />;
      case 'settings':
        return <SettingsPage />;
      case 'your-twin':
        return <YourTwinPage />;
      case 'dashboard':
      default:
        return children;
    }
  };

  return (
    <div className="h-screen flex bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        selectedKey={selectedMenu}
        onMenuSelect={handleMenuSelect}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <TopNavigation />

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-900 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;