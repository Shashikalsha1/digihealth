import React from 'react';
import { Button, Dropdown, Avatar } from 'antd';
import { LogOut, User, Settings, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import apiService from '../../services/apiService';

const TopNavigation: React.FC = () => {
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    apiService.logout();
    clearAuth();
    window.location.href = '/login';
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <User className="w-4 h-4" />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <Settings className="w-4 h-4" />,
      label: 'Settings',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogOut className="w-4 h-4" />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
      {/* Left side - could add breadcrumbs or page title here */}
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
      </div>

      {/* Right side - User info and actions */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <Button
          type="text"
          icon={<Bell className="w-5 h-5" />}
          className="text-gray-400 hover:text-white hover:bg-gray-700"
        />

        {/* User Menu */}
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          trigger={['click']}
        >
          <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-700 rounded-lg px-3 py-2 transition-colors">
            <Avatar
              size={32}
              style={{ backgroundColor: '#00B58E' }}
              icon={<User className="w-4 h-4" />}
            />
            <div className="hidden md:block">
              <div className="text-sm font-medium text-white">
                {user?.first_name} {user?.last_name}
              </div>
              <div className="text-xs text-gray-400">@{user?.username}</div>
            </div>
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export default TopNavigation;