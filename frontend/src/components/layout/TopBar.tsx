import { useAuth } from '../../contexts/AuthContext';

interface TopBarProps {
  title: string;
}

export const TopBar = ({ title }: TopBarProps) => {
  const { user } = useAuth();

  return (
    <div className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-8">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#FDC726] to-[#e5b520] rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-xs">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};