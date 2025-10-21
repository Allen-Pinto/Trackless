import React, { useState } from 'react';
import { Mail, ArrowLeft, BarChart3, Check } from 'lucide-react';

interface ForgotPasswordProps {
  onBack: () => void;
}

export const ForgotPassword = ({ onBack }: ForgotPasswordProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Mock reset password function
  const mockResetPassword = async (email: string) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ error: null });
      }, 1500);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    
    try {
      // Using mock function
      await mockResetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to sign in</span>
          </button>

          {!success ? (
            <>
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  Reset your password
                </h1>
                <p className="text-gray-600 text-lg">
                  Enter your email and we'll send you a link to reset your password
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
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

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#FDC726] text-gray-900 rounded-xl font-semibold hover:bg-[#e5b520] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Check your email
              </h2>
              
              <p className="text-gray-600 mb-8">
                We've sent a password reset link to <strong>{email}</strong>. 
                Click the link in the email to reset your password.
              </p>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-900">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button 
                    onClick={() => setSuccess(false)}
                    className="font-semibold hover:underline"
                  >
                    try again
                  </button>
                </p>
              </div>

              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to sign in
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-gray-900 to-gray-800 items-center justify-center p-12 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #FDC726 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-[#FDC726] rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-gray-900" />
            </div>
            <span className="text-3xl font-bold text-white">Trackless</span>
          </div>

          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Forgot Your Password?
          </h2>
          
          <p className="text-xl text-gray-300 mb-12">
            No worries! It happens to the best of us. We'll help you get back into your account in no time.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#FDC726] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-gray-900 font-bold text-sm">1</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Enter your email</h3>
                <p className="text-gray-400 text-sm">Provide the email address associated with your account</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#FDC726] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-gray-900 font-bold text-sm">2</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Check your inbox</h3>
                <p className="text-gray-400 text-sm">We'll send you a secure link to reset your password</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#FDC726] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-gray-900 font-bold text-sm">3</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Create new password</h3>
                <p className="text-gray-400 text-sm">Choose a strong password to secure your account</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-12 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@trackless.dev" className="text-[#FDC726] hover:underline">
                support@trackless.dev
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};