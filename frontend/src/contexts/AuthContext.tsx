import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, authApi } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (name: string) => Promise<{ error: Error | null }>;
  updateProfilePicture: (avatarFile: File) => Promise<{ error: Error | null }>;
  removeProfilePicture: () => Promise<{ error: Error | null }>;
  clearAuth: () => void;
  setAuthData: (token: string, userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Helper function to update all auth state
  const updateAuthState = (newToken: string | null, newUser: User | null) => {
    setTokenState(newToken);
    setUser(newUser);
    setIsAuthenticated(!!newToken && !!newUser);
    
    if (newToken && newUser) {
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  };

  // Function to set auth data from OAuth
  const setAuthData = (newToken: string, userData: User) => {
    console.log('🔐 Setting auth data from OAuth:', { newToken, userData });
    updateAuthState(newToken, userData);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 AuthProvider - Initializing authentication...');
      
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');

      console.log('📊 Stored data:', {
        token: storedToken ? '✅ Present' : '❌ Missing',
        user: storedUser ? '✅ Present' : '❌ Missing'
      });

      if (storedToken && storedUser) {
        try {
          // Parse user data immediately for fast UI
          const userData = JSON.parse(storedUser);
          console.log('✅ Setting user from localStorage:', userData);
          updateAuthState(storedToken, userData);
          
          // Verify token with backend in background
          try {
            console.log('🔄 Verifying token with API...');
            const response = await authApi.getProfile();
            
            if (response.success && response.data) {
              console.log('✅ Token verified, updating user data');
              updateAuthState(storedToken, response.data.user);
            } else {
              console.log('⚠️ Token verification failed, using stored user');
              // Keep using stored user data
            }
          } catch (apiError) {
            console.error('❌ API verification error, using stored data:', apiError);
            // Continue with stored data
          }
          
        } catch (error) {
          console.error('❌ Error parsing stored auth data:', error);
          updateAuthState(null, null);
        }
      } else {
        console.log('❌ No stored authentication data found');
        updateAuthState(null, null);
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);

      if (response.success && response.data) {
        const { token: newToken, user: userData } = response.data;
        updateAuthState(newToken, userData);
        console.log('✅ Logged in successfully');
        return { error: null };
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const response = await authApi.signup(email, password, name);

      if (response.success && response.data) {
        const { token: newToken, user: userData } = response.data;
        updateAuthState(newToken, userData);
        console.log('✅ Account created successfully');
        return { error: null };
      } else {
        throw new Error(response.error || 'Signup failed');
      }
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // Only call logout endpoint if it exists
      if ('logout' in authApi && typeof authApi.logout === 'function') {
        await (authApi as any).logout();
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      updateAuthState(null, null);
      console.log('🚪 Signed out');
    }
  };

  const clearAuth = () => {
    updateAuthState(null, null);
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    updateProfile: async (name: string) => {
      try {
        const response = await authApi.updateProfile(name);
        if (response.success && response.data) {
          updateAuthState(token, response.data.user);
          return { error: null };
        }
        throw new Error(response.error || 'Update failed');
      } catch (error: any) {
        return { error };
      }
    },
    updateProfilePicture: async (avatarFile: File) => {
      try {
        const response = await authApi.updateProfilePicture(avatarFile);
        if (response.success && response.data) {
          updateAuthState(token, response.data.user);
          return { error: null };
        }
        throw new Error(response.error || 'Update failed');
      } catch (error: any) {
        return { error };
      }
    },
    removeProfilePicture: async () => {
      try {
        const response = await authApi.removeProfilePicture();
        if (response.success && response.data) {
          updateAuthState(token, response.data.user);
          return { error: null };
        }
        throw new Error(response.error || 'Remove failed');
      } catch (error: any) {
        return { error };
      }
    },
    clearAuth,
    setAuthData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}