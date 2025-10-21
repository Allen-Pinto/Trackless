import { useAuth } from '../../contexts/AuthContext';
import { 
  BarChart3, 
  Globe, 
  Settings, 
  LogOut
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar = ({ currentPage, onNavigate }: SidebarProps) => {
  const { user, signOut } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'sites', label: 'Sites', icon: Globe },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    signOut();
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40">
      <div className="flex items-center gap-3 p-6 border-b border-gray-200">
        <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900">Trackless</span>
      </div>

      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FDC726] to-[#e5b520] rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-[#FDC726] text-gray-900 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};