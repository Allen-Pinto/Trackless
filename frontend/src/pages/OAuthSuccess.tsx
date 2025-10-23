import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface OAuthUser {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  authProvider?: string;
  isVerified: boolean;
  maxSites: number;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
  connectedProviders?: {
    local: boolean;
    google: boolean;
    github: boolean;
  };
}

const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState('processing');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    console.log('🔄 OAuthSuccess - Starting...');
    console.log('📊 URL Params:', {
      token: searchParams.get('token') ? '✅ Present' : '❌ Missing',
      user: searchParams.get('user') ? '✅ Present' : '❌ Missing'
    });

    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (token && userParam) {
      try {
        console.log('✅ OAuth data found in URL');
        
        // Parse user data to check provider
        const userData: OAuthUser = JSON.parse(decodeURIComponent(userParam));
        console.log('👤 User data:', userData);
        
        // Store directly in localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Clear URL parameters to prevent reprocessing
        window.history.replaceState({}, '', '/oauth-success');
        
        console.log('✅ OAuth data stored in localStorage');
        setStatus('success');
        
        // Redirect immediately - AuthContext will pick up from localStorage
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);
        
      } catch (error) {
        console.error('❌ Error storing OAuth data:', error);
        setStatus('error');
      }
    } else {
      console.log('❌ Missing OAuth data in URL');
      setStatus('missing_data');
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    if (status === 'error' || status === 'missing_data') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/login', { replace: true });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, navigate]);

  const getProviderName = () => {
    // Check user from AuthContext first
    const currentUser = user as OAuthUser;
    if (currentUser?.authProvider === 'google') return 'Google';
    if (currentUser?.authProvider === 'github') return 'GitHub';
    
    // Fallback to checking URL params
    try {
      const userParam = searchParams.get('user');
      if (userParam) {
        const userData: OAuthUser = JSON.parse(decodeURIComponent(userParam));
        if (userData.authProvider === 'google') return 'Google';
        if (userData.authProvider === 'github') return 'GitHub';
      }
    } catch (error) {
      console.error('Error parsing user param:', error);
    }
    
    return 'Social';
  };

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Login</h2>
          <p className="text-gray-600 mb-4">Setting up your account...</p>
          <p className="text-sm text-gray-500">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
          <p className="text-gray-600 mb-4">
            Successfully logged in with {getProviderName()}
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
        <p className="text-gray-600 mb-4">
          {status === 'missing_data' 
            ? 'Missing authentication data. Please try logging in again.'
            : 'We encountered an error. Please try again.'
          }
        </p>
        <p className="text-sm text-gray-500">
          Redirecting to login in {countdown} seconds...
        </p>
      </div>
    </div>
  );
};

export default OAuthSuccess;