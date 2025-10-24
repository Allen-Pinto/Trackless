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
  const { setAuthData } = useAuth();
  const [status, setStatus] = useState('processing');
  const [countdown, setCountdown] = useState(3);
  const [providerName, setProviderName] = useState('Social');

  useEffect(() => {
    const processOAuth = async () => {
      console.log('🔄 OAuthSuccess - Starting...');
      
      const token = searchParams.get('token');
      const userParam = searchParams.get('user');

      console.log('📊 URL Params:', {
        token: token ? '✅ Present' : '❌ Missing',
        user: userParam ? '✅ Present' : '❌ Missing',
        fullURL: window.location.href
      });

      if (!token || !userParam) {
        console.log('❌ Missing OAuth data in URL');
        setStatus('missing_data');
        return;
      }

      try {
        console.log('✅ OAuth data found in URL');
        
        // Parse user data
        const userData: OAuthUser = JSON.parse(decodeURIComponent(userParam));
        console.log('👤 User data:', userData);
        
        // Set provider name for display
        if (userData.authProvider === 'google') setProviderName('Google');
        else if (userData.authProvider === 'github') setProviderName('GitHub');
        
        // Use AuthContext's setAuthData method
        console.log('🔐 Setting auth data via AuthContext');
        setAuthData(token, userData);
        
        // ALSO store as 'token' for backward compatibility
        localStorage.setItem('token', token);
        
        console.log('✅ Authentication complete');
        console.log('📊 Storage check:', {
          authToken: localStorage.getItem('authToken') ? '✅' : '❌',
          token: localStorage.getItem('token') ? '✅' : '❌',
          user: localStorage.getItem('user') ? '✅' : '❌'
        });
        
        setStatus('success');
        
        // Short delay for better UX, then redirect
        setTimeout(() => {
          console.log('🚀 Redirecting to dashboard');
          navigate('/dashboard', { replace: true });
        }, 1500);
        
      } catch (error) {
        console.error('❌ Error processing OAuth data:', error);
        setStatus('error');
      }
    };

    processOAuth();
  }, [searchParams, setAuthData, navigate]);

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
            Successfully logged in with {providerName}
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
        <p className="text-sm text-gray-500 mb-4">
          Redirecting to login in {countdown} seconds...
        </p>
        <button
          onClick={() => navigate('/login', { replace: true })}
          className="px-6 py-2 bg-[#FDC726] text-gray-900 rounded-lg font-semibold hover:bg-[#e5b520] transition-colors"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default OAuthSuccess;