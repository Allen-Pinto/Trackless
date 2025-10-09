import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, authApi } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (name: string) => Promise<{ error: Error | null }>;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // Verify token is still valid by getting profile
          const response = await authApi.getProfile();
          if (response.success && response.data) {
            setUser(response.data.user);
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    // Listen for auth expiration events from API interceptor
    const handleAuthExpired = () => {
      console.log('Auth expired event received - clearing user');
      setUser(null);
    };

    checkAuth();
    
    window.addEventListener('auth-expired', handleAuthExpired);
    
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const response = await authApi.signup(email, password, name);
      
      if (response.success && response.data) {
        // Store token and user data
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        return { error: null };
      } else {
        return { error: new Error(response.error || 'Signup failed') };
      }
    } catch (error: any) {
      return { error: new Error(error.response?.data?.error || 'Signup failed') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      
      if (response.success && response.data) {
        // Store token and user data
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        return { error: null };
      } else {
        return { error: new Error(response.error || 'Login failed') };
      }
    } catch (error: any) {
      return { error: new Error(error.response?.data?.error || 'Login failed') };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (name: string) => {
    try {
      const response = await authApi.updateProfile(name);
      
      if (response.success && response.data) {
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        return { error: null };
      } else {
        return { error: new Error(response.error || 'Update failed') };
      }
    } catch (error: any) {
      return { error: new Error(error.response?.data?.error || 'Update failed') };
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};