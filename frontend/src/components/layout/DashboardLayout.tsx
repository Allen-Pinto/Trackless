import React, { useState } from 'react';
import { BarChart3, LayoutDashboard, Globe, TrendingUp, Settings, LogOut, Bell, User, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Sidebar Component
const Sidebar = ({ currentPage, onNavigate }: { currentPage: string; onNavigate: (page: string) => void }) => {
  const { user, signOut } = useAuth();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sites', label: 'Sites', icon: Globe },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleLogout = () => {
    signOut();
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Trackless</h1>
            <p className="text-xs text-gray-500">Analytics Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#FDC726] text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-semibold text-sm">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-semibold text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

// TopBar Component
const TopBar = ({ title }: { title: string }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, signOut } = useAuth();

  const notifications = [
    {
      id: 1,
      type: 'traffic',
      title: 'Traffic Spike Detected',
      message: 'Your site experienced 50% more traffic than usual',
      time: '5 minutes ago',
      unread: true
    },
    {
      id: 2,
      type: 'milestone',
      title: 'Milestone Reached',
      message: 'You\'ve reached 10,000 pageviews this month!',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 3,
      type: 'system',
      title: 'System Update',
      message: 'New features have been added to your dashboard',
      time: '1 day ago',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = () => {
    signOut();
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-20">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button className="text-sm text-[#FDC726] hover:text-[#e5b520] font-semibold">
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      notification.unread ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 hover:bg-gray-50 rounded-xl px-3 py-2 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-xs">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Mobile Sidebar
const MobileSidebar = ({ 
  isOpen, 
  onClose, 
  currentPage, 
  onNavigate 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  currentPage: string; 
  onNavigate: (page: string) => void;
}) => {
  const { user, signOut } = useAuth();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sites', label: 'Sites', icon: Globe },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleLogout = () => {
    signOut();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 lg:hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Trackless</h1>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#FDC726] text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold text-sm">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile - Mobile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold text-sm">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

// Main Dashboard Layout Component
interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  title: string;
}

export const DashboardLayout = ({ 
  children, 
  currentPage, 
  onNavigate, 
  title 
}: DashboardLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentPage={currentPage}
        onNavigate={onNavigate}
      />

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-white rounded-xl shadow-md border border-gray-200"
      >
        <Menu className="w-6 h-6 text-gray-900" />
      </button>

      {/* TopBar */}
      <div className="hidden lg:block">
        <TopBar title={title} />
      </div>

      {/* Mobile TopBar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-center z-20">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
};