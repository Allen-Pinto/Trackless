import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { Sites } from './pages/Sites';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AddSiteModal } from './components/modals/AddSiteModal';

type AuthPage = 'signin' | 'signup' | 'forgot';
type DashboardPage = 'dashboard' | 'sites' | 'analytics' | 'settings';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [authPage, setAuthPage] = useState<AuthPage>('signin');
  const [currentPage, setCurrentPage] = useState<DashboardPage>('dashboard');
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);
  const [sitesRefreshKey, setSitesRefreshKey] = useState(0); // Add this state

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#59A5D8] via-[#4A9BC8] to-[#3B8CB8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authPage === 'signin') {
      return (
        <SignIn
          onToggle={() => setAuthPage('signup')}
          onForgotPassword={() => setAuthPage('forgot')}
        />
      );
    }

    if (authPage === 'signup') {
      return <SignUp onToggle={() => setAuthPage('signin')} />;
    }

    return <ForgotPassword onBack={() => setAuthPage('signin')} />;
  }

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Dashboard';
      case 'sites':
        return 'Sites';
      case 'analytics':
        return 'Analytics';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'sites':
        return <Sites 
          onAddSite={() => setIsAddSiteModalOpen(true)} 
          refreshKey={sitesRefreshKey} // Pass refresh key to Sites component
        />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <DashboardLayout
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page as DashboardPage)}
        title={getPageTitle()}
      >
        {renderPage()}
      </DashboardLayout>

      <AddSiteModal
        isOpen={isAddSiteModalOpen}
        onClose={() => setIsAddSiteModalOpen(false)}
        onSiteAdded={() => {
          // Instead of reloading, trigger a refresh of the sites data
          setSitesRefreshKey(prev => prev + 1);
          setIsAddSiteModalOpen(false);
        }}
      />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;