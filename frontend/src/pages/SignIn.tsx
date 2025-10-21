import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, BarChart3, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SignInProps {
  onNavigateToSignUp?: () => void;
  onNavigateToForgotPassword?: () => void;
  onBackToLanding?: () => void;
  onSignInSuccess?: () => void;
}

const SignIn = ({ onNavigateToSignUp, onNavigateToForgotPassword, onBackToLanding }: SignInProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      const result = await signIn(email, password);
      
      if (result.error) {
        setError(result.error.message || 'Failed to sign in');
      } else {
        console.log('✅ Sign in successful');
        // The AuthContext will automatically update and redirect to dashboard
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/oauth/google`;
  };

  const handleGitHubLogin = () => {
    window.location.href = `${API_URL}/api/oauth/github`;
  };

  return (
    <div className="min-h-screen bg-white font-sans flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Back to Home */}
          <button 
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to home</span>
          </button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Welcome back
            </h1>
            <p className="text-gray-600 text-lg">
              Sign in to access your analytics dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FDC726] transition-colors text-gray-900 placeholder-gray-400"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FDC726] transition-colors text-gray-900 placeholder-gray-400"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-2 border-gray-300 text-[#FDC726] focus:ring-[#FDC726]"
                />
                <span className="text-sm text-gray-700">Remember me</span>
              </label>
              <button 
                type="button"
                onClick={onNavigateToForgotPassword}
                className="text-sm font-semibold text-gray-900 hover:text-[#FDC726] transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#FDC726] text-gray-900 rounded-xl font-semibold hover:bg-[#e5b520] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 py-3 px-4 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors hover:shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-semibold text-gray-700">Google</span>
            </button>

            <button 
              onClick={handleGitHubLogin}
              className="flex items-center justify-center gap-3 py-3 px-4 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors hover:shadow-md"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="text-sm font-semibold text-gray-700">GitHub</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button 
                onClick={onNavigateToSignUp}
                className="font-semibold text-gray-900 hover:text-[#FDC726] transition-colors"
              >
                Sign up for free
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-gray-900 to-gray-800 items-center justify-center p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #FDC726 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        <div className="relative z-10 max-w-lg">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-[#FDC726] rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-gray-900" />
            </div>
            <span className="text-3xl font-bold text-white">Trackless</span>
          </div>

          {/* Hero Content */}
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Privacy-First Analytics That Actually Work
          </h2>
          
          <p className="text-xl text-gray-300 mb-12">
            Track your website visitors without cookies, respect user privacy, and gain meaningful insights into your traffic.
          </p>

          {/* Features List */}
          <div className="space-y-4">
            {[
              'No cookies or tracking pixels',
              'GDPR compliant out of the box',
              'Real-time visitor tracking',
              'Beautiful, intuitive dashboard'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#FDC726] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-200">{feature}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-gray-700">
            <div>
              <div className="text-3xl font-bold text-[#FDC726] mb-1">50K+</div>
              <div className="text-sm text-gray-400">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#FDC726] mb-1">10M+</div>
              <div className="text-sm text-gray-400">Page Views</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#FDC726] mb-1">99.9%</div>
              <div className="text-sm text-gray-400">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;