import React from 'react';
import { Tabs, Typography } from 'antd';
import { Settings, Smartphone } from 'lucide-react';
import GoogleFitSettings from './GoogleFitSettings';

const { Title, Text } = Typography;

const SettingsPage: React.FC = () => {
  const tabItems = [
    {
      key: 'google-fit',
      label: (
        <div className="flex items-center space-x-2">
          <Smartphone className="w-4 h-4" />
          <span>Google Fit</span>
        </div>
      ),
      children: <GoogleFitSettings />,
    },
    // Add more tabs here in the future
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#00B58E' }}
        >
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <Title level={2} style={{ color: '#F7F7F7', marginBottom: 4 }}>
            Settings
          </Title>
          <Text style={{ color: '#9CA3AF' }}>
            Manage your account and application preferences
          </Text>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs
        defaultActiveKey="google-fit"
        size="large"
        className="dark-tabs"
        items={tabItems}
        tabBarStyle={{
          borderBottom: '1px solid #374151',
          marginBottom: '24px',
        }}
      />
    </div>
  );
};

export default SettingsPage;