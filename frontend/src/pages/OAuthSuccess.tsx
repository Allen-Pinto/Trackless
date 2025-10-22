import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    console.log('🔄 OAuthSuccess - Processing callback...');

    if (token && userParam) {
      try {
        console.log('✅ OAuth tokens found in URL, waiting for AuthContext to process...');
        
        setTimeout(() => {
          const storedToken = localStorage.getItem('authToken');
          const storedUser = localStorage.getItem('user');
          
          if (storedToken && storedUser) {
            console.log('✅ OAuth login successful, redirecting to dashboard');
            navigate('/dashboard');
          } else {
            console.log('❌ OAuth login failed - no data stored');
            setError('Authentication failed');
            setTimeout(() => navigate('/'), 3000);
          }
        }, 1000);
        
      } catch (error) {
        console.error('❌ OAuth success error:', error);
        setError('Failed to process OAuth login');
        setTimeout(() => navigate('/'), 3000);
      }
    } else {
      console.log('❌ No token or user found in URL');
      setError('Invalid OAuth response');
      setTimeout(() => navigate('/'), 3000);
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        {error ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">OAuth Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to home...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
            <p className="text-gray-600 mb-4">Successfully logged in with Google</p>
            <p className="text-sm text-gray-500">Completing authentication...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthSuccess;