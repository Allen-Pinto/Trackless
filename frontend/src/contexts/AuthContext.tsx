import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, authApi } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (name: string) => Promise<{ error: Error | null }>;
  updateProfilePicture: (avatarFile: File) => Promise<{ error: Error | null }>;
  removeProfilePicture: () => Promise<{ error: Error | null }>;
  clearAuth: () => void;
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
  const [loading, setLoading] = useState(true);

  // ✅ Update state + localStorage
  const updateUser = (userData: User | null) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');

      console.log('🔍 Auth Check - Token exists:', !!token);
      console.log('🔍 Auth Check - Stored user exists:', !!storedUser);

      if (token && storedUser) {
        try {
          console.log('🔄 Fetching fresh user data from API...');
          const response = await authApi.getProfile();

          if (response.success && response.data) {
            console.log('User loaded from API:', response.data.user);
            updateUser(response.data.user);
          } else {
            console.log('API response not successful');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
          }
        } catch (error) {
          console.log('API call failed:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        console.log('No token or stored user found');
        setUser(null);
      }

      setLoading(false);
    };

    const handleAuthExpired = () => {
      console.log('Auth expired event received - clearing user');
      updateUser(null);
      localStorage.removeItem('authToken');
    };

    checkAuth();
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  // ✅ FIXED: signIn now uses authApi.login and stores token + user
  const signIn = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password); // corrected from signIn → login

      if (response.success && response.data) {
        const { token, user } = response.data;

        if (token) localStorage.setItem('authToken', token);
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          setUser(user);
        }

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
        const { token, user } = response.data;

        if (token) localStorage.setItem('authToken', token);
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          setUser(user);
        }

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
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    console.log('🚪 Signed out');
  };

  const clearAuth = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile: async (name: string) => {
      try {
        const response = await authApi.updateProfile(name);
        if (response.success && response.data) {
          updateUser(response.data.user);
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
          updateUser(response.data.user);
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
          updateUser(response.data.user);
          return { error: null };
        }
        throw new Error(response.error || 'Remove failed');
      } catch (error: any) {
        return { error };
      }
    },
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
