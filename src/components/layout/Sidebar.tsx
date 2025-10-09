import React from 'react';
import { Menu } from 'antd';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings,
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  selectedKey: string;
  onMenuSelect: (key: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onCollapse,
  selectedKey,
  onMenuSelect,
}) => {
  const menuItems = [
    {
      key: 'dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      label: 'Dashboard',
    },
    {
      key: 'your-twin',
      icon: <Users className="w-4 h-4" />,
      label: 'Your Twin',
    },
    {
      key: 'health-report',
      icon: <FileText className="w-4 h-4" />,
      label: 'Check Health Report',
    },
    {
      key: 'settings',
      icon: <Settings className="w-4 h-4" />,
      label: 'Settings',
    },
  ];

  return (
    <div
      className={`h-full bg-gray-900 border-r border-gray-700 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <img
              src="/QQ Health Logo-01 1.png"
              alt="QQ Health Logo"
              className="h-8 w-auto"
            />
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center w-full">
            <img
              src="/QQ Health Logo-01 1.png"
              alt="QQ Health Logo"
              className="h-8 w-auto"
            />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => onCollapse(!collapsed)}
            className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        inlineCollapsed={collapsed}
        onClick={({ key }) => onMenuSelect(key)}
        className="border-none bg-transparent"
        items={menuItems}
        style={{
          backgroundColor: 'transparent',
          border: 'none',
        }}
        theme="dark"
      />
    </div>
  );
};

export default Sidebar;