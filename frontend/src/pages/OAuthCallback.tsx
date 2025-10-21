import { useEffect } from 'react';

const OAuthCallback = () => {
  useEffect(() => {
    const handleOAuthCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const userParam = urlParams.get('user');

      console.log('🔄 OAuthCallback - Processing...');

      if (token && userParam) {
        try {
          // Store tokens immediately
          localStorage.setItem('authToken', token);
          localStorage.setItem('user', userParam);
          
          console.log('✅ OAuth tokens stored in localStorage');
          
          // Clear URL and redirect to home
          window.history.replaceState({}, '', '/');
          window.location.href = '/';
          
        } catch (error) {
          console.error('❌ Error processing OAuth callback:', error);
          window.location.href = '/';
        }
      } else {
        console.log('❌ No token or user found in URL');
        window.location.href = '/';
      }
    };

    handleOAuthCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#FDC726] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;