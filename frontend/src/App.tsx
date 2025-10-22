import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import { ForgotPassword } from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import { Sites } from './pages/Sites';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AddSiteModal } from './components/modals/AddSiteModal';
import OAuthCallback from './pages/OAuthCallback';
import OAuthSuccess from './pages/OAuthSuccess';

type AuthPage = 'landing' | 'signin' | 'signup' | 'forgot';
type DashboardPage = 'dashboard' | 'sites' | 'analytics' | 'settings';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [authPage, setAuthPage] = useState<AuthPage>('landing');
  const [currentPage, setCurrentPage] = useState<DashboardPage>('dashboard');
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);
  const [sitesRefreshKey, setSitesRefreshKey] = useState(0);

  // Check current path for OAuth routes
  const currentPath = window.location.pathname;
  const isOAuthCallback = currentPath === '/oauth-callback';
  const isOAuthSuccess = currentPath === '/oauth-success';

  useEffect(() => {
    if (!user && !loading && !isOAuthCallback && !isOAuthSuccess) {
      setAuthPage('landing');
    }
  }, [user, loading, isOAuthCallback, isOAuthSuccess]);

  // Handle OAuth callback route
  if (isOAuthCallback) {
    return <OAuthCallback />;
  }

  // Handle OAuth success route
  if (isOAuthSuccess) {
    return <OAuthSuccess />;
  }

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
    switch (authPage) {
      case 'landing':
        return (
          <LandingPage 
            onNavigateToSignIn={() => setAuthPage('signin')}
            onNavigateToSignUp={() => setAuthPage('signup')}
          />
        );
      case 'signin':
        return (
          <SignIn 
            onNavigateToSignUp={() => setAuthPage('signup')}
            onNavigateToForgotPassword={() => setAuthPage('forgot')}
            onBackToLanding={() => setAuthPage('landing')}
            onSignInSuccess={() => {
              // This will be handled by the auth context
            }}
          />
        );
      case 'signup':
        return (
          <SignUp 
            onToggle={() => setAuthPage('signin')}
            onBackToLanding={() => setAuthPage('landing')}
            onSignUpSuccess={() => {
              // This will be handled by the auth context
            }}
          />
        );
      case 'forgot':
        return <ForgotPassword onBack={() => setAuthPage('signin')} />;
      default:
        return <div>Error: Invalid page</div>;
    }
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
        return (
          <Sites
            onAddSite={() => setIsAddSiteModalOpen(true)}
            refreshKey={sitesRefreshKey}
          />
        );
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
          setSitesRefreshKey(prev => prev + 1);
          setIsAddSiteModalOpen(false);
          setCurrentPage('sites');
        }}
      />
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}