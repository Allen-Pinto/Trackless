import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import OAuthSuccess from './pages/OAuthSuccess';
import { AddSiteModal } from './components/modals/AddSiteModal';

type DashboardPage = 'dashboard' | 'sites' | 'analytics' | 'settings';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

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
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

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

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Dashboard Wrapper Component
const DashboardWrapper = () => {
  const [currentPage, setCurrentPage] = useState<DashboardPage>('dashboard');
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);
  const [sitesRefreshKey, setSitesRefreshKey] = useState(0);

  // Listen for navigation events from Dashboard (when "Add Your First Site" is clicked)
  useEffect(() => {
    const handleNavigateToSites = () => {
      setCurrentPage('sites');
      setIsAddSiteModalOpen(true);
    };

    window.addEventListener('navigate-to-sites', handleNavigateToSites);
    return () => window.removeEventListener('navigate-to-sites', handleNavigateToSites);
  }, []);

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
          // Stay on sites page after adding
        }}
      />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingPage 
                  onNavigateToSignIn={() => window.location.href = '/signin'}
                  onNavigateToSignUp={() => window.location.href = '/signup'}
                />
              </PublicRoute>
            }
          />
          <Route
            path="/signin"
            element={
              <PublicRoute>
                <SignIn 
                  onNavigateToSignUp={() => window.location.href = '/signup'}
                  onNavigateToForgotPassword={() => window.location.href = '/forgot-password'}
                  onBackToLanding={() => window.location.href = '/'}
                />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUp 
                  onToggle={() => window.location.href = '/signin'}
                  onBackToLanding={() => window.location.href = '/'}
                />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword onBack={() => window.location.href = '/signin'} />
              </PublicRoute>
            }
          />

          {/* OAuth Success Route - No auth required */}
          <Route path="/oauth-success" element={<OAuthSuccess />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardWrapper />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;